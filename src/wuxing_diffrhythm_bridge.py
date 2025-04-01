#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
五行颜色与DiffRhythm音乐生成桥接模块

将五行颜色数据转换为DiffRhythm模型的输入参数，生成对应情绪和传统五音结合的音乐
基于DiffRhythm模型 (https://github.com/ASLP-lab/DiffRhythm)
"""

import os
import sys
import json
import argparse
import subprocess
import numpy as np
import torch
from pathlib import Path
import colorsys
import tempfile
import shutil

# 定义五行与音乐参数的映射关系
WUXING_MUSIC_PARAMS = {
    "木": {
        "emotion": "peaceful",  # 平和、生长
        "scale": "pentatonic",  # 五声音阶
        "note": "E",  # 角音
        "tempo": 90,  # 中速
        "instruments": ["guzheng", "dizi"],  # 古筝、笛子
        "style": "flowing",  # 流畅
        "prompt_template": "一段平和舒缓的{instrument}曲，使用五声音阶，表现春天生机勃勃的感觉"
    },
    "火": {
        "emotion": "passionate",  # 热情
        "scale": "pentatonic",  # 五声音阶
        "note": "G",  # 徵音
        "tempo": 120,  # 快速
        "instruments": ["pipa", "suona"],  # 琵琶、唢呐
        "style": "energetic",  # 有活力
        "prompt_template": "一段热情奔放的{instrument}曲，节奏明快，表现夏日火热的氛围"
    },
    "土": {
        "emotion": "stable",  # 稳定
        "scale": "pentatonic",  # 五声音阶
        "note": "C",  # 宫音
        "tempo": 80,  # 中速
        "instruments": ["guqin", "xiao"],  # 古琴、箫
        "style": "grounded",  # 厚重
        "prompt_template": "一段稳重大气的{instrument}曲，使用宫调五声音阶，表现大地的厚重感"
    },
    "金": {
        "emotion": "clear",  # 清澈
        "scale": "pentatonic",  # 五声音阶
        "note": "D",  # 商音
        "tempo": 70,  # 中慢速
        "instruments": ["yangqin", "erhu"],  # 扬琴、二胡
        "style": "crisp",  # 清脆
        "prompt_template": "一段清澈高雅的{instrument}曲，音色明亮，表现秋天肃杀的感觉"
    },
    "水": {
        "emotion": "deep",  # 深沉
        "scale": "pentatonic",  # 五声音阶
        "note": "A",  # 羽音
        "tempo": 60,  # 慢速
        "instruments": ["xun", "bawu"],  # 埙、巴乌
        "style": "flowing",  # 流动
        "prompt_template": "一段深沉内敛的{instrument}曲，节奏缓慢，表现冬天静谧的感觉"
    }
}

# 颜色亮度和饱和度阈值
BRIGHTNESS_THRESHOLDS = {
    "very_bright": 85,
    "bright": 70,
    "medium": 50,
    "dark": 30,
    "very_dark": 15
}

SATURATION_THRESHOLDS = {
    "very_saturated": 85,
    "saturated": 70,
    "medium": 50,
    "desaturated": 30,
    "very_desaturated": 15
}


def rgb_to_hsv(r, g, b):
    """将RGB值转换为HSV值"""
    r, g, b = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return h*360, s*100, v*100


def get_color_attributes(rgb_str):
    """从RGB字符串中提取颜色属性"""
    # 从RGB字符串中提取RGB值
    rgb_values = rgb_str.strip('rgb()').split(',')
    r, g, b = map(int, [x.strip() for x in rgb_values])
    
    # 转换为HSV
    h, s, v = rgb_to_hsv(r, g, b)
    
    # 确定亮度和饱和度级别
    brightness_level = "medium"
    for level, threshold in sorted(BRIGHTNESS_THRESHOLDS.items(), key=lambda x: x[1], reverse=True):
        if v >= threshold:
            brightness_level = level
            break
    
    saturation_level = "medium"
    for level, threshold in sorted(SATURATION_THRESHOLDS.items(), key=lambda x: x[1], reverse=True):
        if s >= threshold:
            saturation_level = level
            break
    
    return {
        "hue": h,
        "saturation": s,
        "value": v,
        "brightness_level": brightness_level,
        "saturation_level": saturation_level,
        "rgb": (r, g, b)
    }


def adjust_music_params(base_params, color_attributes):
    """根据颜色属性调整音乐参数"""
    adjusted_params = base_params.copy()
    
    # 根据亮度调整音乐的音高和力度
    if color_attributes["brightness_level"] in ["very_bright", "bright"]:
        adjusted_params["octave_shift"] = 1  # 提高八度
        adjusted_params["dynamics"] = "forte"  # 强音
        adjusted_params["tempo"] = min(adjusted_params["tempo"] + 10, 130)  # 略微加快
    elif color_attributes["brightness_level"] in ["dark", "very_dark"]:
        adjusted_params["octave_shift"] = -1  # 降低八度
        adjusted_params["dynamics"] = "piano"  # 弱音
        adjusted_params["tempo"] = max(adjusted_params["tempo"] - 10, 50)  # 略微减慢
    else:
        adjusted_params["octave_shift"] = 0
        adjusted_params["dynamics"] = "mezzo"  # 中等力度
    
    # 根据饱和度调整音乐的复杂度和表现力
    if color_attributes["saturation_level"] in ["very_saturated", "saturated"]:
        adjusted_params["complexity"] = "high"  # 高复杂度
        adjusted_params["expression"] = "vibrato"  # 颤音表现
    elif color_attributes["saturation_level"] in ["desaturated", "very_desaturated"]:
        adjusted_params["complexity"] = "low"  # 低复杂度
        adjusted_params["expression"] = "plain"  # 朴素表现
    else:
        adjusted_params["complexity"] = "medium"  # 中等复杂度
        adjusted_params["expression"] = "normal"  # 正常表现
    
    return adjusted_params


def generate_prompt(wuxing_type, color_name, color_attributes, adjusted_params):
    """生成用于DiffRhythm模型的提示词"""
    base_template = WUXING_MUSIC_PARAMS[wuxing_type]["prompt_template"]
    
    # 随机选择一种乐器
    instrument = np.random.choice(WUXING_MUSIC_PARAMS[wuxing_type]["instruments"])
    
    # 根据颜色属性调整提示词
    prompt = base_template.format(instrument=instrument)
    
    # 添加颜色名称
    prompt += f"，灵感来自中国传统色彩