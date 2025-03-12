#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
模型微调模块

使用LoRA技术微调ChatMusician模型，使其能够根据乐器、音调、歌词等条件生成音乐曲谱
"""

import os
import json
import argparse
import torch
from pathlib import Path
from tqdm import tqdm
from datasets import Dataset, load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training


def load_data(data_dir):
    """
    加载预处理后的数据
    
    Args:
        data_dir (str): 数据目录路径
        
    Returns:
        Dataset: Hugging Face数据集对象
    """
    data_files = list(Path(data_dir).glob('*.json'))
    all_data = []
    
    for file_path in tqdm(data_files, desc='加载数据文件'):
        with open(file_path, 'r', encoding='utf-8') as f:
            file_data = json.load(f)
            all_data.extend(file_data)
    
    # 转换为Dataset格式
    dataset = Dataset.from_dict({
        'prompt': [item['prompt'] for item in all_data],
        'target': [item['target'] for item in all_data],
        'full_text': [item['prompt'] + item['target'] for item in all_data]
    })
    
    return dataset


def tokenize_function(examples, tokenizer, max_length=512):
    """
    对文本进行分词处理
    
    Args:
        examples: 数据样本
        tokenizer: 分词器
        max_length: 最大序列长度
        
    Returns:
        dict: 分词后的结果
    """
    return tokenizer(
        examples['full_text'],
        truncation=True,
        max_length=max_length,
        padding='max_length'
    )


def main():
    parser = argparse.ArgumentParser(description='微调ChatMusician模型')
    parser.add_argument('--data_dir', type=str, default='../data/processed', help='预处理数据目录')
    parser.add_argument('--output_dir', type=str, default='../models/checkpoints', help='模型保存目录')
    parser.add_argument('--final_model_dir', type=str, default='../models/final', help='最终模型保存目录')
    parser.add_argument('--model_name', type=str, default='m-a-p/ChatMusician', help='预训练模型名称')
    parser.add_argument('--batch_size', type=int, default=4, help='训练批次大小')
    parser.add_argument('--epochs', type=int, default=3, help='训练轮数')
    parser.add_argument('--learning_rate', type=float, default=2e-5, help='学习率')
    parser.add_argument('--lora_r', type=int, default=8, help='LoRA秩')
    parser.add_argument('--lora_alpha', type=int, default=16, help='LoRA alpha参数')
    parser.add_argument('--max_length', type=int, default=512, help='最大序列长度')
    args = parser.parse_args()
    
    # 确保输出目录存在
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(args.final_model_dir, exist_ok=True)
    
    # 加载分词器和模型
    print(f"加载预训练模型: {args.model_name}")
    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    model = AutoModelForCausalLM.from_pretrained(
        args.model_name,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    # 配置LoRA
    print("配置LoRA适配器")
    lora_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    # 准备模型进行LoRA微调
    model = prepare_model_for_kbit_training(model)
    model = get_peft_model(model, lora_config)
    
    # 加载数据集
    print(f"加载数据集: {args.data_dir}")
    dataset = load_data(args.data_dir)
    
    # 划分训练集和验证集
    dataset = dataset.train_test_split(test_size=0.1)
    train_dataset = dataset['train']
    eval_dataset = dataset['test']
    
    # 对数据集进行分词处理
    print("对数据集进行分词处理")
    tokenized_train = train_dataset.map(
        lambda examples: tokenize_function(examples, tokenizer, args.max_length),
        batched=True,
        remove_columns=train_dataset.column_names
    )
    tokenized_eval = eval_dataset.map(
        lambda examples: tokenize_function(examples, tokenizer, args.max_length),
        batched=True,
        remove_columns=eval_dataset.column_names
    )
    
    # 数据整理器
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    
    # 训练参数
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        num_train_epochs=args.epochs,
        learning_rate=args.learning_rate,
        fp16=True,
        logging_steps=100,
        load_best_model_at_end=True,
        save_total_limit=3,
        report_to="none"
    )
    
    # 初始化Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        data_collator=data_collator,
    )
    
    # 开始训练
    print("开始训练...")
    trainer.train()
    
    # 保存最终模型
    print(f"保存最终模型到: {args.final_model_dir}")
    model.save_pretrained(args.final_model_dir)
    tokenizer.save_pretrained(args.final_model_dir)
    
    print("训练完成！")


if __name__ == '__main__':
    main()