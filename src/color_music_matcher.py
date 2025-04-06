#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
五色音乐匹配器

通过分析传统五色值（青、赤、黄、白、黑）序列，匹配最相似的音乐文件。

功能：
1. 分析输入的五色序列，转换为五音值
2. 分析对应的情绪特征
3. 通过分析五音和情绪特征，找到最相似的音乐文件
"""

import os
import re
import json
import numpy as np
from collections import Counter
import librosa
import matplotlib.pyplot as plt
from scipy.spatial.distance import cosine

# 定义五色到五音的映射关系
COLOR_TO_TONE = {
    '青': '角',  # 木-青-角-E
    '赤': '徵',  # 火-赤-徵-G
    '黄': '宫',  # 土-黄-宫-C
    '白': '商',  # 金-白-商-D
    '黑': '羽'   # 水-黑-羽-A
}

# 定义五音到MIDI音高的映射
TONE_TO_MIDI = {
    '宫': 60,  # C4
    '商': 62,  # D4
    '角': 64,  # E4
    '徵': 67,  # G4
    '羽': 69   # A4
}

# 定义五色到情绪的映射
COLOR_TO_EMOTION = {
    '青': ['生长', '希望', '平和', '安宁'],  # 木-青-生发
    '赤': ['热情', '兴奋', '喜悦', '激昂'],  # 火-赤-上升
    '黄': ['稳重', '中正', '祥和', '温暖'],  # 土-黄-中和
    '白': ['肃穆', '清澈', '悲伤', '凄凉'],  # 金-白-收敛
    '黑': ['神秘', '深沉', '恐惧', '压抑']   # 水-黑-下降
}

# 情绪关键词到音乐特征的映射
EMOTION_KEYWORDS = {
    '生长': ['舒缓', '自然', '轻快'],
    '希望': ['明亮', '上升', '轻快'],
    '平和': ['舒缓', '平静', '优雅'],
    '安宁': ['舒缓', '平静', '轻柔'],
    '热情': ['激昂', '热烈', '强劲'],
    '兴奋': ['快速', '强劲', '高亢'],
    '喜悦': ['欢快', '明亮', '活泼'],
    '激昂': ['强劲', '高亢', '震撼'],
    '稳重': ['中庸', '稳定', '厚重'],
    '中正': ['平衡', '和谐', '中庸'],
    '祥和': ['温暖', '和谐', '舒适'],
    '温暖': ['舒适', '柔和', '温馨'],
    '肃穆': ['庄严', '清晰', '肃静'],
    '清澈': ['明亮', '清晰', '透明'],
    '悲伤': ['低沉', '缓慢', '哀伤'],
    '凄凉': ['悲伤', '孤独', '空旷'],
    '神秘': ['深沉', '低沉', '神秘'],
    '深沉': ['低沉', '厚重', '深邃'],
    '恐惧': ['紧张', '不安', '黑暗'],
    '压抑': ['沉重', '低沉', '紧张']
}

class ColorMusicMatcher:
    # 音乐特征关键词
    MUSIC_FEATURES = [
        '舒缓', '自然', '轻快', '明亮', '上升', '平静', '优雅', '轻柔',
        '激昂', '热烈', '强劲', '快速', '高亢', '欢快', '活泼', '震撼',
        '中庸', '稳定', '厚重', '平衡', '和谐', '温暖', '舒适', '柔和', '温馨',
        '庄严', '清晰', '肃静', '透明', '低沉', '缓慢', '哀伤', '悲伤',
        '孤独', '空旷', '深沉', '神秘', '深邃', '紧张', '不安', '黑暗', '沉重'
    ]
    def __init__(self, music_dir):
        """
        初始化音乐匹配器
        
        Args:
            music_dir: 音乐文件目录路径
        """
        self.music_dir = music_dir
        self.music_files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
        self.music_features_cache = {}
        
    def analyze_color_sequence(self, color_sequence):
        """
        分析颜色序列，返回五音分布和情绪特征
        
        Args:
            color_sequence: 颜色序列，如 ['青', '赤', '黄', '白', '黑', ...]
            
        Returns:
            tone_distribution: 五音分布字典
            emotion_profile: 情绪特征向量
        """
        # 验证输入
        valid_colors = set(COLOR_TO_TONE.keys())
        for color in color_sequence:
            if color not in valid_colors:
                raise ValueError(f"无效的颜色: {color}。有效颜色为: {', '.join(valid_colors)}")
        
        # 1. 分析五音分布
        tone_sequence = [COLOR_TO_TONE[color] for color in color_sequence]
        tone_counter = Counter(tone_sequence)
        total_tones = len(tone_sequence)
        
        tone_distribution = {
            tone: count / total_tones for tone, count in tone_counter.items()
        }
        
        # 确保所有五音都有值，即使是0
        for tone in ['宫', '商', '角', '徵', '羽']:
            if tone not in tone_distribution:
                tone_distribution[tone] = 0.0
        
        # 2. 分析情绪特征
        color_counter = Counter(color_sequence)
        emotion_keywords = []
        
        for color, count in color_counter.items():
            weight = count / total_tones
            for emotion in COLOR_TO_EMOTION[color]:
                # 根据颜色出现比例加权情绪关键词
                emotion_keywords.extend([emotion] * int(weight * 100))
        
        # 生成情绪特征向量
        emotion_profile = self._generate_emotion_vector(emotion_keywords)
        
        return tone_distribution, emotion_profile
    
    def _generate_emotion_vector(self, emotion_keywords):
        """
        根据情绪关键词生成情绪特征向量
        
        Args:
            emotion_keywords: 情绪关键词列表
            
        Returns:
            emotion_vector: 情绪特征向量
        """
        # 初始化音乐特征向量
        feature_vector = np.zeros(len(self.MUSIC_FEATURES))
        
        # 统计情绪关键词
        emotion_counter = Counter(emotion_keywords)
        total_emotions = len(emotion_keywords)
        
        # 将情绪关键词映射到音乐特征
        for emotion, count in emotion_counter.items():
            weight = count / total_emotions
            if emotion in EMOTION_KEYWORDS:
                for feature in EMOTION_KEYWORDS[emotion]:
                    if feature in self.MUSIC_FEATURES:
                        feature_idx = self.MUSIC_FEATURES.index(feature)
                        feature_vector[feature_idx] += weight
        
        # 归一化特征向量
        if np.sum(feature_vector) > 0:
            feature_vector = feature_vector / np.sum(feature_vector)
        
        return feature_vector
    
    def extract_music_features(self, music_file):
        """
        提取音乐文件的特征
        
        Args:
            music_file: 音乐文件路径
            
        Returns:
            music_features: 音乐特征字典
        """
        # 检查缓存
        if music_file in self.music_features_cache:
            return self.music_features_cache[music_file]
        
        file_path = os.path.join(self.music_dir, music_file)
        
        try:
            # 加载音频文件
            y, sr = librosa.load(file_path, sr=None)  # 只分析前60秒
            
            # 提取特征
            # 1. 节奏特征 - 速度估计
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # 2. 音高特征 - 色度图
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            
            # 3. 音色特征 - 梅尔频率倒谱系数
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfcc, axis=1)
            
            # 4. 音调特征 - 调性中心
            key = np.argmax(chroma_mean)
            
            # 5. 能量特征
            rms = librosa.feature.rms(y=y)[0]
            energy_mean = np.mean(rms)
            energy_std = np.std(rms)
            
            # 6. 频谱对比度
            contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
            contrast_mean = np.mean(contrast, axis=1)
            
            # 7. 零交叉率 - 表示音频信号符号变化的频率
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            zcr_mean = np.mean(zcr)
            
            # 构建特征字典
            features = {
                'tempo': float(tempo),
                'chroma': chroma_mean.tolist(),
                'mfcc': mfcc_mean.tolist(),
                'key': int(key),
                'energy_mean': float(energy_mean),
                'energy_std': float(energy_std),
                'contrast': contrast_mean.tolist(),
                'zcr': float(zcr_mean)
            }
            
            # 缓存结果
            self.music_features_cache[music_file] = features
            
            return features
            
        except Exception as e:
            print(f"提取音乐特征时出错: {music_file}, 错误: {e}")
            return None
    
    def analyze_music_filename(self, filename):
        """
        分析音乐文件名中的情绪关键词
        
        Args:
            filename: 音乐文件名
            
        Returns:
            keyword_vector: 关键词特征向量
        """
        # 移除文件扩展名
        name = os.path.splitext(filename)[0]
        
        # 初始化特征向量
        keyword_vector = np.zeros(len(self.MUSIC_FEATURES))
        
        # 检查每个特征关键词是否出现在文件名中
        for i, keyword in enumerate(self.MUSIC_FEATURES):
            if keyword in name:
                keyword_vector[i] = 1.0
        
        # 归一化
        if np.sum(keyword_vector) > 0:
            keyword_vector = keyword_vector / np.sum(keyword_vector)
        
        return keyword_vector
    
    def calculate_tone_similarity(self, tone_distribution, music_features):
        """
        计算五音分布与音乐音高特征的相似度
        
        Args:
            tone_distribution: 五音分布字典
            music_features: 音乐特征字典
            
        Returns:
            similarity: 相似度分数 (0-1)
        """
        # 将五音分布转换为12音阶分布
        chromatic_dist = np.zeros(12)
        
        for tone, ratio in tone_distribution.items():
            if tone in TONE_TO_MIDI:
                midi_note = TONE_TO_MIDI[tone]
                note_idx = midi_note % 12  # 转换为色度索引
                chromatic_dist[note_idx] += ratio
        
        # 归一化
        if np.sum(chromatic_dist) > 0:
            chromatic_dist = chromatic_dist / np.sum(chromatic_dist)
        
        # 获取音乐的色度特征
        music_chroma = np.array(music_features['chroma'])
        
        # 计算余弦相似度
        similarity = 1 - cosine(chromatic_dist, music_chroma)
        
        return similarity
    
    def calculate_emotion_similarity(self, emotion_profile, music_file):
        """
        计算情绪特征与音乐情绪的相似度
        
        Args:
            emotion_profile: 情绪特征向量
            music_file: 音乐文件名
            
        Returns:
            similarity: 相似度分数 (0-1)
        """
        # 分析文件名中的关键词
        filename_features = self.analyze_music_filename(music_file)
        
        # 计算余弦相似度
        similarity = 1 - cosine(emotion_profile, filename_features)
        
        return similarity
    
    def calculate_music_similarity(self, emotion_profile, music_features):
        """
        计算情绪特征与音乐音频特征的相似度
        
        Args:
            emotion_profile: 情绪特征向量
            music_features: 音乐特征字典
            
        Returns:
            similarity: 相似度分数 (0-1)
        """
        # 基于音乐特征推断情绪
        tempo = music_features['tempo']
        energy = music_features['energy_mean']
        contrast = np.mean(music_features['contrast'])
        zcr = music_features['zcr']
        
        # 创建音乐情绪特征向量
        music_emotion = np.zeros(len(self.MUSIC_FEATURES))
        
        # 速度特征
        if tempo < 80:  # 慢
            for keyword in ['舒缓', '缓慢', '平静']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        elif tempo > 120:  # 快
            for keyword in ['快速', '激昂', '活泼']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        else:  # 中等
            for keyword in ['中庸', '平衡']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        
        # 能量特征
        if energy < 0.1:  # 低能量
            for keyword in ['轻柔', '低沉', '悲伤']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        elif energy > 0.3:  # 高能量
            for keyword in ['强劲', '震撼', '热烈']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        
        # 频谱对比度
        if contrast > 0.5:  # 高对比度
            for keyword in ['明亮', '清晰', '透明']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        else:  # 低对比度
            for keyword in ['深沉', '厚重', '沉重']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        
        # 零交叉率
        if zcr > 0.1:  # 高零交叉率
            for keyword in ['紧张', '不安', '高亢']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        else:  # 低零交叉率
            for keyword in ['舒适', '温暖', '和谐']:
                if keyword in self.MUSIC_FEATURES:
                    music_emotion[self.MUSIC_FEATURES.index(keyword)] += 1.0
        
        # 归一化
        if np.sum(music_emotion) > 0:
            music_emotion = music_emotion / np.sum(music_emotion)
        
        # 计算余弦相似度
        similarity = 1 - cosine(emotion_profile, music_emotion)
        
        return similarity
    
    def find_similar_music(self, color_sequence, top_n=5):
        """
        根据颜色序列找到最相似的音乐文件
        
        Args:
            color_sequence: 颜色序列，如 ['青', '赤', '黄', '白', '黑', ...]
            top_n: 返回的最相似音乐数量
            
        Returns:
            similar_music: 最相似音乐文件列表及其相似度分数
        """
        # 分析颜色序列
        tone_distribution, emotion_profile = self.analyze_color_sequence(color_sequence)
        
        # 计算每个音乐文件的相似度
        similarities = []
        
        for music_file in self.music_files:
            # 提取音乐特征
            music_features = self.extract_music_features(music_file)
            if not music_features:
                continue
            
            # 计算五音相似度
            tone_sim = self.calculate_tone_similarity(tone_distribution, music_features)
            
            # 计算文件名情绪相似度
            name_sim = self.calculate_emotion_similarity(emotion_profile, music_file)
            
            # 计算音乐特征情绪相似度
            music_sim = self.calculate_music_similarity(emotion_profile, music_features)
            
            # 综合相似度 (可以调整权重)
            combined_sim = 0.3 * tone_sim + 0.4 * name_sim + 0.3 * music_sim
            
            similarities.append((music_file, combined_sim, tone_sim, name_sim, music_sim))
        
        # 按相似度降序排序
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # 返回前N个最相似的音乐
        return similarities[:top_n]
    
    def visualize_color_analysis(self, color_sequence):
        """
        可视化颜色序列分析结果
        
        Args:
            color_sequence: 颜色序列
        """
        # 分析颜色序列
        tone_distribution, emotion_profile = self.analyze_color_sequence(color_sequence)
        
        # 创建图形
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # 绘制五音分布
        tones = list(tone_distribution.keys())
        values = list(tone_distribution.values())
        ax1.bar(tones, values, color=['green', 'red', 'yellow', 'white', 'black'])
        ax1.set_title('五音分布')
        ax1.set_ylim(0, 1)
        
        # 绘制情绪特征
        top_emotions = np.argsort(emotion_profile)[-10:]  # 取前10个最强的情绪特征
        top_features = [self.MUSIC_FEATURES[i] for i in top_emotions]
        top_values = [emotion_profile[i] for i in top_emotions]
        
        ax2.barh(top_features, top_values, color='skyblue')
        ax2.set_title('主要情绪特征')
        ax2.set_xlim(0, max(top_values) * 1.1)
        
        plt.tight_layout()
        plt.show()

def parse_color_input(input_str):
    """
    解析用户输入的颜色字符串
    
    Args:
        input_str: 用户输入的颜色字符串，如 "青赤黄白黑青青赤..."
        
    Returns:
        color_sequence: 颜色序列列表
    """
    # 验证输入
    valid_colors = set(['青', '赤', '黄', '白', '黑'])
    color_sequence = []
    
    for char in input_str:
        if char in valid_colors:
            color_sequence.append(char)
    
    return color_sequence

def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 音乐文件目录
    music_dir = os.path.join(script_dir, 'music_files')
    
    # 创建匹配器
    matcher = ColorMusicMatcher(music_dir)
    
    # 获取用户输入
    print("请输入一串中国传统五色值（青、赤、黄、白、黑），总数为100个字符：")
    color_input = input().strip()
    
    # 解析颜色输入
    color_sequence = parse_color_input(color_input)
    
    # 验证输入长度
    if len(color_sequence) != 100:
        print(f"警告：输入的有效颜色数量为 {len(color_sequence)}，不是100。")
        if len(color_sequence) < 10:
            print("输入的颜色太少，无法进行有效分析。请重新输入。")
            return
    
    # 分析颜色序列
    print("\n正在分析颜色序列...")
    tone_distribution, emotion_profile = matcher.analyze_color_sequence(color_sequence)
    
    # 打印五音分析结果
    print("\n五音分析结果:")
    for tone, ratio in tone_distribution.items():
        print(f"{tone}: {ratio:.2%}")
    
    # 打印情绪分析结果
    print("\n情绪分析结果:")
    top_emotions = np.argsort(emotion_profile)[-5:]  # 取前5个最强的情绪特征
    for i in reversed(top_emotions):
        if emotion_profile[i] > 0:
            print(f"{matcher.MUSIC_FEATURES[i]}: {emotion_profile[i]:.2%}")
    
    # 查找相似音乐
    print("\n正在查找最相似的音乐...")
    similar_music = matcher.find_similar_music(color_sequence, top_n=5)
    
    # 打印结果
    print("\n最相似的音乐文件:")
    for i, (music_file, combined_sim, tone_sim, name_sim, music_sim) in enumerate(similar_music, 1):
        print(f"{i}. {music_file}")
        print(f"   综合相似度: {combined_sim:.2%}")
        print(f"   五音相似度: {tone_sim:.2%}")
        print(f"   文件名情绪相似度: {name_sim:.2%}")
        print(f"   音乐特征情绪相似度: {music_sim:.2%}")
    
    # 可视化分析结果
    matcher.visualize_color_analysis(color_sequence)

if __name__ == "__main__":
    main()