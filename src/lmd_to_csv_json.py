#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
LMD数据集处理模块

将LMD数据集处理并转换为CSV和JSON格式，便于后续分析和使用
"""

import os
import json
import csv
import pandas as pd
from music21 import stream, note, converter, chord
from tqdm import tqdm
import concurrent.futures
import argparse

# 辅助函数
def create_prompt(style, instrument, note_prefix, lyrics=None):
    prompt = f"Generate a {style} song"
    if instrument:
        prompt += f" for {instrument}"
    if note_prefix:
        prompt += f" starting with {note_prefix}"
    if lyrics:
        prompt += f" with lyrics: {lyrics}"
    return prompt

def stream_to_abc(s):
    """Convert a music21 stream to simple ABC notation with error handling."""
    abc = "X:1\nT:Generated\nM:4/4\nK:C\n"
    for n in s.flatten().notes:
        try:
            if isinstance(n, note.Note):
                pitch = n.nameWithOctave.replace('-', 'b').replace('#', '^')
            elif isinstance(n, chord.Chord):
                pitch = '<' + ' '.join([p.nameWithOctave.replace('-', 'b').replace('#', '^') for p in n.pitches]) + '>'
            else:
                continue  # Skip unhandled types (e.g., rests)
            dur = n.duration.quarterLength
            if dur == 1:
                abc += pitch + " "
            elif dur == 0.5:
                abc += pitch + "/ "
            elif dur == 2:
                abc += pitch + "2 "
            else:
                abc += pitch + str(int(dur)) + " "
        except Exception as e:
            print(f"Error processing note/chord in stream: {e}")
            continue
    return abc.strip()

def process_single_lmd_file(midi_path):
    """Process a single MIDI file and return a prompt-ABC pair."""
    try:
        s = converter.parse(midi_path)
        if not s.parts:  # Check if the MIDI has no parts
            print(f"Error processing {midi_path}: No parts found in MIDI file")
            return None
        
        # Use the first part if available, or the whole stream if no parts
        if len(s.parts) > 0:
            s = s.parts[0]
        
        notes = s.flatten().notes
        if not notes:  # Check if there are no notes
            print(f"Error processing {midi_path}: No notes found in MIDI file")
            return None
        
        # 生成ABC符号
        try:
            abc = stream_to_abc(s)
        except Exception as e:
            print(f"Error generating ABC notation for {midi_path}: {e}")
            return None
        
        # 处理前缀音符
        try:
            prefix_notes = notes[:min(4, len(notes))]
            if not prefix_notes:
                print(f"Error processing {midi_path}: No valid notes for prefix")
                return None
            
            # 安全地获取音符名称
            note_names = []
            for n in prefix_notes:
                try:
                    if isinstance(n, note.Note):
                        note_names.append(n.nameWithOctave)
                    elif isinstance(n, chord.Chord) and len(n.pitches) > 0:
                        note_names.append(n.pitches[0].nameWithOctave)
                    else:
                        # 跳过无法处理的音符类型
                        continue
                except Exception as e:
                    print(f"Error extracting note name in {midi_path}: {e}")
                    continue
            
            if not note_names:
                # 如果无法提取任何音符名称，使用默认值
                prefix = "C4"
            else:
                prefix = ' '.join(note_names)
        except Exception as e:
            print(f"Error processing prefix notes in {midi_path}: {e}")
            prefix = "C4"  # 使用默认值
        
        # 处理歌词
        try:
            lyrics = s.lyrics()
            if lyrics and len(lyrics) > 0 and hasattr(lyrics[0], 'text') and lyrics[0].text and lyrics[0].text.strip():
                first_line = lyrics[0].text.split('\n')[0].strip()
                prompt = create_prompt(style="song", instrument="voice", note_prefix=prefix, lyrics=first_line)
            else:
                prompt = create_prompt(style="song", instrument="melody", note_prefix=prefix)
        except Exception as e:
            print(f"Error processing lyrics in {midi_path}: {e}")
            prompt = create_prompt(style="song", instrument="melody", note_prefix=prefix)
        
        # 提取文件名作为ID
        file_name = os.path.basename(midi_path)
        file_id = os.path.splitext(file_name)[0]
        
        # 提取相对路径作为分类信息
        rel_path = os.path.relpath(os.path.dirname(midi_path), os.path.dirname(os.path.dirname(midi_path)))
        
        return {
            "id": file_id,
            "path": midi_path,
            "category": rel_path,
            "prompt": prompt,
            "target_abc": abc,
            "prefix": prefix,
            "has_lyrics": bool(lyrics and len(lyrics) > 0)
        }
    except Exception as e:
        print(f"Error processing {midi_path}: {e}")
        return None

def process_lmd_to_files(root_dir, output_dir, format='both', max_workers=4, max_files=5000, error_threshold=0.3):
    """Process LMD-Aligned Lyrics dataset and save to CSV/JSON files.
    
    Args:
        root_dir: Root directory containing the LMD dataset
        output_dir: Directory to save output files
        format: Output format ('csv', 'json', or 'both')
        max_workers: Maximum number of concurrent threads
        max_files: Maximum number of files to process (to avoid memory issues)
        error_threshold: Maximum acceptable error rate before aborting (0.0-1.0)
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    aligned_dir = os.path.join(root_dir, 'lmd_aligned')
    if not os.path.exists(aligned_dir):
        print(f"Warning: Directory {aligned_dir} not found. Aborting.")
        return
    
    # 收集所有MIDI文件路径
    midi_files = []
    for root, _, files in os.walk(aligned_dir):
        for file in files:
            if file.endswith('.mid'):
                midi_files.append(os.path.join(root, file))
    
    # 限制处理文件数量，避免内存问题
    if len(midi_files) > max_files:
        print(f"Limiting processing to {max_files} files out of {len(midi_files)} total files")
        midi_files = midi_files[:max_files]
    
    total_files = len(midi_files)
    print(f"Total MIDI files to process in LMD: {total_files}")
    
    # 批处理文件，每批次处理一部分文件
    batch_size = min(1000, total_files)  # 每批最多处理1000个文件
    error_count = 0
    processed_count = 0
    all_results = []
    
    for batch_start in range(0, total_files, batch_size):
        batch_end = min(batch_start + batch_size, total_files)
        batch_files = midi_files[batch_start:batch_end]
        batch_size_actual = len(batch_files)
        
        print(f"Processing batch {batch_start//batch_size + 1}, files {batch_start+1}-{batch_end} of {total_files}")
        
        batch_errors = 0
        batch_results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_file = {executor.submit(process_single_lmd_file, midi_path): midi_path 
                             for midi_path in batch_files}
            
            for future in tqdm(concurrent.futures.as_completed(future_to_file), 
                              total=batch_size_actual, 
                              desc=f"Batch {batch_start//batch_size + 1}"):
                try:
                    result = future.result()
                    if result:
                        batch_results.append(result)
                    else:
                        batch_errors += 1
                except Exception as e:
                    midi_path = future_to_file[future]
                    print(f"Unexpected error processing {midi_path}: {e}")
                    batch_errors += 1
        
        # 更新统计信息
        all_results.extend(batch_results)
        error_count += batch_errors
        processed_count += batch_size_actual
        
        # 计算当前错误率
        current_error_rate = error_count / processed_count if processed_count > 0 else 0
        print(f"Batch complete: {len(batch_results)} successful, {batch_errors} errors")
        print(f"Current error rate: {current_error_rate:.2%}")
        
        # 如果错误率超过阈值，提前终止处理
        if current_error_rate > error_threshold:
            print(f"Error rate {current_error_rate:.2%} exceeds threshold {error_threshold:.2%}. Stopping processing.")
            break
        
        # 每批次处理完成后保存一次中间结果，避免全部处理完才保存（防止中途出错导致所有处理结果丢失）
        batch_output_prefix = f"lmd_batch_{batch_start//batch_size + 1}"
        if format.lower() in ['csv', 'both']:
            batch_csv_path = os.path.join(output_dir, f"{batch_output_prefix}.csv")
            pd.DataFrame(batch_results).to_csv(batch_csv_path, index=False)
            print(f"Batch results saved to CSV: {batch_csv_path}")
            
        if format.lower() in ['json', 'both']:
            batch_json_path = os.path.join(output_dir, f"{batch_output_prefix}.json")
            with open(batch_json_path, 'w', encoding='utf-8') as f:
                json.dump(batch_results, f, ensure_ascii=False, indent=2)
            print(f"Batch results saved to JSON: {batch_json_path}")
    
    print(f"LMD processing complete: {len(all_results)} successful entries, {error_count} errors")
    print(f"Final error rate: {error_count/processed_count:.2%} ({error_count}/{processed_count})")
    
    # 保存最终结果
    if all_results:
        if format.lower() in ['csv', 'both']:
            csv_path = os.path.join(output_dir, "lmd_complete.csv")
            pd.DataFrame(all_results).to_csv(csv_path, index=False)
            print(f"Results saved to CSV: {csv_path}")
            
        if format.lower() in ['json', 'both']:
            json_path = os.path.join(output_dir, "lmd_complete.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(all_results, f, ensure_ascii=False, indent=2)
            print(f"Results saved to JSON: {json_path}")
    else:
        print("No successful entries were processed from LMD dataset.")

def parse_args():
    parser = argparse.ArgumentParser(description='处理LMD数据集并转换为CSV/JSON格式')
    parser.add_argument('--root_dir', type=str, default='../data/LMD', help='LMD数据集根目录')
    parser.add_argument('--output_dir', type=str, default='../output/lmd', help='输出文件目录')
    parser.add_argument('--format', type=str, choices=['csv', 'json', 'both'], default='both', help='输出格式')
    parser.add_argument('--max_workers', type=int, default=4, help='最大并行处理线程数')
    parser.add_argument('--max_files', type=int, default=5000, help='最大处理文件数量')
    parser.add_argument('--error_threshold', type=float, default=0.3, help='错误率阈值，超过此值将停止处理')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    process_lmd_to_files(
        root_dir=args.root_dir,
        output_dir=args.output_dir,
        format=args.format,
        max_workers=args.max_workers,
        max_files=args.max_files,
        error_threshold=args.error_threshold
    )