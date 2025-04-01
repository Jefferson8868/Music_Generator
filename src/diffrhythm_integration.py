#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
DiffRhythm模型集成模块

将DiffRhythm模型与五行颜色系统集成，实现根据颜色生成对应情绪和传统五音结合的音乐
参考: https://github.com/ASLP-lab/DiffRhythm
"""

import os
import sys
import json
import argparse
import subprocess
import tempfile
import shutil
from pathlib import Path

# 定义五行与音乐参数的映射关系
WUXING_MUSIC_MAPPING = {
    "木": {
        "emotion": "peaceful",  # 平和、生长
        "scale": "pentatonic",  # 五声音阶
        "note": "E",  # 角音
        "tempo": 90,  # 中速
        "instruments": ["guzheng", "dizi"],  # 古筝、笛子
        "prompt_template": "一段平和舒缓的{instrument}曲，使用五声音阶，表现春天生机勃勃的感觉"
    },
    "火": {
        "emotion": "passionate",  # 热情
        "scale": "pentatonic",  # 五声音阶
        "note": "G",  # 徵音
        "tempo": 120,  # 快速
        "instruments": ["pipa", "suona"],  # 琵琶、唢呐
        "prompt_template": "一段热情奔放的{instrument}曲，节奏明快，表现夏日火热的氛围"
    },
    "土": {
        "emotion": "stable",  # 稳定
        "scale": "pentatonic",  # 五声音阶
        "note": "C",  # 宫音
        "tempo": 80,  # 中速
        "instruments": ["guqin", "xiao"],  # 古琴、箫
        "prompt_template": "一段稳重大气的{instrument}曲，使用宫调五声音阶，表现大地的厚重感"
    },
    "金": {
        "emotion": "clear",  # 清澈
        "scale": "pentatonic",  # 五声音阶
        "note": "D",  # 商音
        "tempo": 70,  # 中慢速
        "instruments": ["yangqin", "erhu"],  # 扬琴、二胡
        "prompt_template": "一段清澈高雅的{instrument}曲，音色明亮，表现秋天肃杀的感觉"
    },
    "水": {
        "emotion": "deep",  # 深沉
        "scale": "pentatonic",  # 五声音阶
        "note": "A",  # 羽音
        "tempo": 60,  # 慢速
        "instruments": ["xun", "bawu"],  # 埙、巴乌
        "prompt_template": "一段深沉内敛的{instrument}曲，节奏缓慢，表现冬天静谧的感觉"
    }
}


class DiffRhythmIntegration:
    """DiffRhythm模型集成类"""
    
    def __init__(self, diffrhythm_path=None, output_dir=None):
        """初始化"""
        self.diffrhythm_path = diffrhythm_path
        self.output_dir = output_dir or os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output', 'music')
        
        # 确保输出目录存在
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 如果未指定DiffRhythm路径，则尝试下载
        if not self.diffrhythm_path:
            self.setup_diffrhythm()
    
    def setup_diffrhythm(self):
        """设置DiffRhythm环境"""
        print("正在设置DiffRhythm环境...")
        
        # 创建临时目录或使用固定目录
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        diffrhythm_dir = os.path.join(models_dir, 'DiffRhythm')
        
        # 检查是否已经克隆了仓库
        if os.path.exists(diffrhythm_dir) and os.path.isdir(diffrhythm_dir):
            print(f"使用现有的DiffRhythm目录: {diffrhythm_dir}")
            self.diffrhythm_path = diffrhythm_dir
            return
        
        try:
            # 克隆DiffRhythm仓库
            print("克隆DiffRhythm仓库...")
            subprocess.run(
                ["git", "clone", "https://github.com/ASLP-lab/DiffRhythm.git", diffrhythm_dir],
                check=True
            )
            
            # 安装依赖
            print("安装DiffRhythm依赖...")
            subprocess.run(
                ["pip", "install", "-r", os.path.join(diffrhythm_dir, "requirements.txt")],
                check=True
            )
            
            self.diffrhythm_path = diffrhythm_dir
            print(f"DiffRhythm环境设置完成: {self.diffrhythm_path}")
        except Exception as e:
            print(f"设置DiffRhythm环境失败: {str(e)}")
            # 使用临时目录作为备选
            self.diffrhythm_path = tempfile.mkdtemp()
            print(f"使用临时目录作为备选: {self.diffrhythm_path}")
    
    def generate_prompt(self, wuxing_type, color_name, color_attributes=None):
        """生成用于DiffRhythm模型的提示词"""
        if wuxing_type not in WUXING_MUSIC_MAPPING:
            raise ValueError(f"未知的五行类型: {wuxing_type}")
        
        # 获取五行音乐参数
        music_params = WUXING_MUSIC_MAPPING[wuxing_type]
        
        # 随机选择一种乐器
        import random
        instrument = random.choice(music_params["instruments"])
        
        # 生成基础提示词
        prompt = music_params["prompt_template"].format(instrument=instrument)
        
        # 添加颜色名称
        prompt += f"，灵感来自中国传统色彩