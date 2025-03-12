#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
音乐生成模块

根据用户输入的乐器、音调、歌词等条件，使用微调后的ChatMusician模型生成音乐曲谱，
并将生成的符号化音乐表示转换为MIDI文件
"""

import os
import argparse
import torch
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import music21
from midiutil import MIDIFile
import re


def parse_args():
    """
    解析命令行参数
    """
    parser = argparse.ArgumentParser(description='基于ChatMusician生成音乐')
    parser.add_argument('--model_dir', type=str, default='../models/final', help='微调后的模型目录')
    parser.add_argument('--base_model', type=str, default='m-a-p/ChatMusician', help='基础模型名称')
    parser.add_argument('--prompt', type=str, required=True, help='生成提示，例如："乐器：钢琴, 音调：C大调, 歌词：夏天的风"')
    parser.add_argument('--output', type=str, default='../output/generated_music.mid', help='输出MIDI文件路径')
    parser.add_argument('--max_length', type=int, default=512, help='生成的最大长度')
    parser.add_argument('--temperature', type=float, default=0.7, help='生成温度')
    parser.add_argument('--top_p', type=float, default=0.9, help='Top-p采样参数')
    parser.add_argument('--save_txt', action='store_true', help='是否保存文本格式的曲谱')
    
    return parser.parse_args()


def format_prompt(prompt_text):
    """
    格式化用户输入的提示
    
    Args:
        prompt_text (str): 用户输入的提示文本
        
    Returns:
        str: 格式化后的提示
    """
    # 提取乐器、音调、歌词信息
    instruments = re.search(r'乐器[:：]\s*([^,，]+)', prompt_text)
    key = re.search(r'音调[:：]\s*([^,，]+)', prompt_text)
    lyrics = re.search(r'歌词[:：]\s*([^,，]+)', prompt_text)
    
    formatted_prompt = "根据以下条件生成曲谱：\n"
    
    if instruments:
        formatted_prompt += f"乐器：{instruments.group(1).strip()}\n"
    if key:
        formatted_prompt += f"音调：{key.group(1).strip()}\n"
    if lyrics:
        formatted_prompt += f"歌词：{lyrics.group(1).strip()}\n"
    
    formatted_prompt += "曲谱："
    
    return formatted_prompt


def load_model(base_model_name, model_dir):
    """
    加载微调后的模型
    
    Args:
        base_model_name (str): 基础模型名称
        model_dir (str): 微调后的模型目录
        
    Returns:
        tuple: (模型, 分词器)
    """
    print(f"加载基础模型: {base_model_name}")
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    
    print(f"加载微调模型: {model_dir}")
    if os.path.exists(model_dir):
        # 加载基础模型
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        # 加载LoRA权重
        model = PeftModel.from_pretrained(base_model, model_dir)
    else:
        print(f"警告: 微调模型目录 {model_dir} 不存在，使用基础模型")
        model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
    
    return model, tokenizer


def generate_music(model, tokenizer, prompt, max_length=512, temperature=0.7, top_p=0.9):
    """
    生成音乐曲谱
    
    Args:
        model: 模型
        tokenizer: 分词器
        prompt (str): 输入提示
        max_length (int): 生成的最大长度
        temperature (float): 生成温度
        top_p (float): Top-p采样参数
        
    Returns:
        str: 生成的曲谱文本
    """
    print("生成音乐曲谱...")
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # 生成曲谱
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_length,
            do_sample=True,
            temperature=temperature,
            top_p=top_p,
        )
    
    # 解码生成的文本
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # 提取生成的曲谱部分（去除提示部分）
    score_text = generated_text[len(prompt):].strip()
    
    return score_text


def convert_to_midi(score_text, output_file):
    """
    将生成的曲谱文本转换为MIDI文件
    
    Args:
        score_text (str): 生成的曲谱文本
        output_file (str): 输出MIDI文件路径
    """
    print(f"转换曲谱为MIDI: {output_file}")
    
    try:
        # 尝试使用music21解析生成的曲谱
        # 这里假设生成的是简单的音符序列，如 "C4 E4 G4 C5"
        notes = re.findall(r'([A-G][#b]?\d+)', score_text)
        
        if not notes:
            print("警告: 无法从生成的文本中提取音符")
            return False
        
        # 创建MIDI文件
        midi = MIDIFile(1)  # 单轨道
        track = 0
        time = 0
        midi.addTrackName(track, time, "Generated Music")
        midi.addTempo(track, time, 120)  # 120 BPM
        
        # 添加音符
        for i, note_str in enumerate(notes):
            try:
                # 解析音符和八度
                note_name = ''.join(c for c in note_str if c.isalpha() or c in '#b')
                octave = int(''.join(c for c in note_str if c.isdigit()))
                
                # 转换为MIDI音符编号 (C4 = 60)
                base_notes = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
                note_value = base_notes[note_name[0]]
                
                if len(note_name) > 1:
                    if note_name[1] == '#':
                        note_value += 1
                    elif note_name[1] == 'b':
                        note_value -= 1
                
                midi_note = note_value + (octave + 1) * 12
                
                # 添加到MIDI文件
                midi.addNote(track, 0, midi_note, time + i * 0.5, 0.5, 100)  # 每个音符持续0.5拍，音量100
                
            except Exception as e:
                print(f"警告: 无法解析音符 {note_str}: {e}")
                continue
        
        # 确保输出目录存在
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        # 写入MIDI文件
        with open(output_file, "wb") as f:
            midi.writeFile(f)
        
        print(f"MIDI文件已保存: {output_file}")
        return True
        
    except Exception as e:
        print(f"错误: 转换MIDI失败: {e}")
        return False


def main():
    args = parse_args()
    
    # 格式化提示
    formatted_prompt = format_prompt(args.prompt)
    print(f"格式化后的提示:\n{formatted_prompt}")
    
    # 加载模型
    model, tokenizer = load_model(args.base_model, args.model_dir)
    
    # 生成曲谱
    generated_score = generate_music(
        model, 
        tokenizer, 
        formatted_prompt,
        max_length=args.max_length,
        temperature=args.temperature,
        top_p=args.top_p
    )
    
    print("\n生成的曲谱:")
    print(generated_score)
    
    # 保存文本格式的曲谱
    if args.save_txt:
        txt_output = os.path.splitext(args.output)[0] + ".txt"
        os.makedirs(os.path.dirname(os.path.abspath(txt_output)), exist_ok=True)
        with open(txt_output, "w", encoding="utf-8") as f:
            f.write(generated_score)
        print(f"曲谱文本已保存: {txt_output}")
    
    # 转换为MIDI
    convert_to_midi(generated_score, args.output)


if __name__ == "__main__":
    main()