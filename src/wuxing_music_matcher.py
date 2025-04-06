#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
五色音乐匹配器 (增强版)

通过分析传统五色值（青、赤、黄、白、黑）序列，匹配最相似的音乐文件。
结合五行理论与现代音乐特征分析技术，提供更精确的音乐匹配。

功能：
1. 分析输入的五色序列，转换为五音值和情绪特征
2. 提取音乐的声学特征和情绪特征
3. 通过多维相似度计算，找到最匹配的音乐文件
"""

import os
import json
import numpy as np
import librosa
import matplotlib.pyplot as plt
from collections import Counter
from scipy.spatial.distance import cosine
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier

# 五行系统映射关系
# 五行-五色-五音-五情
WUXING_SYSTEM = {
    '木': {'色': '青', '音': '角', '情': ['生长', '希望', '平和', '安宁'], 'midi': 64},  # E4
    '火': {'色': '赤', '音': '徵', '情': ['热情', '兴奋', '喜悦', '激昂'], 'midi': 67},  # G4
    '土': {'色': '黄', '音': '宫', '情': ['稳重', '中正', '祥和', '温暖'], 'midi': 60},  # C4
    '金': {'色': '白', '音': '商', '情': ['肃穆', '清澈', '悲伤', '凄凉'], 'midi': 62},  # D4
    '水': {'色': '黑', '音': '羽', '情': ['神秘', '深沉', '恐惧', '压抑'], 'midi': 69}   # A4
}

# 从五行系统中提取映射关系
COLOR_TO_TONE = {wuxing['色']: wuxing['音'] for element, wuxing in WUXING_SYSTEM.items()}
COLOR_TO_EMOTION = {wuxing['色']: wuxing['情'] for element, wuxing in WUXING_SYSTEM.items()}
TONE_TO_MIDI = {wuxing['音']: wuxing['midi'] for element, wuxing in WUXING_SYSTEM.items()}

# 情绪关键词到音乐特征的映射
EMOTION_KEYWORDS = {
    # 木-青-角
    '生长': ['舒缓', '自然', '轻快', '上升'],
    '希望': ['明亮', '上升', '轻快', '温暖'],
    '平和': ['舒缓', '平静', '优雅', '和谐'],
    '安宁': ['舒缓', '平静', '轻柔', '温馨'],
    
    # 火-赤-徵
    '热情': ['激昂', '热烈', '强劲', '明亮'],
    '兴奋': ['快速', '强劲', '高亢', '活泼'],
    '喜悦': ['欢快', '明亮', '活泼', '轻快'],
    '激昂': ['强劲', '高亢', '震撼', '热烈'],
    
    # 土-黄-宫
    '稳重': ['中庸', '稳定', '厚重', '平衡'],
    '中正': ['平衡', '和谐', '中庸', '稳定'],
    '祥和': ['温暖', '和谐', '舒适', '平静'],
    '温暖': ['舒适', '柔和', '温馨', '和谐'],
    
    # 金-白-商
    '肃穆': ['庄严', '清晰', '肃静', '深沉'],
    '清澈': ['明亮', '清晰', '透明', '高亢'],
    '悲伤': ['低沉', '缓慢', '哀伤', '深沉'],
    '凄凉': ['悲伤', '孤独', '空旷', '低沉'],
    
    # 水-黑-羽
    '神秘': ['深沉', '低沉', '神秘', '空灵'],
    '深沉': ['低沉', '厚重', '深邃', '沉稳'],
    '恐惧': ['紧张', '不安', '黑暗', '低沉'],
    '压抑': ['沉重', '低沉', '紧张', '厚重']
}

# 音乐特征关键词列表
MUSIC_FEATURES = [
    '舒缓', '自然', '轻快', '明亮', '上升', '平静', '优雅', '轻柔',
    '激昂', '热烈', '强劲', '快速', '高亢', '欢快', '活泼', '震撼',
    '中庸', '稳定', '厚重', '平衡', '和谐', '温暖', '舒适', '柔和', '温馨',
    '庄严', '清晰', '肃静', '透明', '低沉', '缓慢', '哀伤', '悲伤',
    '孤独', '空旷', '深沉', '神秘', '深邃', '紧张', '不安', '黑暗', '沉重',
    '空灵', '沉稳'
]

# 关键词字典，用于初始标签（从test.py中保留）
keywords = {
    '怒': ['愤怒', '激怒'],
    '喜': ['轻快', '美妙', '欢快', '激昂', '奋进', '震撼'],
    '思': ['感人', '动情', '抒情'],
    '忧': ['悲伤', '压抑'],
    '恐': ['恐惧', '紧张']
}

# 五色到五情的映射（简化版）
COLOR_TO_EMOTION_SIMPLE = {
    '青': '怒',  # 木-青-思
    '赤': '喜',  # 火-赤-喜
    '黄': '思',  # 土-黄-思（中性，偏向思）
    '白': '忧',  # 金-白-忧
    '黑': '恐'   # 水-黑-恐
}

# 提取音频特征（增强版）
def extract_features(file_path):
    """提取音频文件的声学特征
    
    Args:
        file_path: 音频文件路径
        
    Returns:
        features: 特征向量
    """
    # 加载音频文件
    y, sr = librosa.load(file_path)
    
    # 1. 节奏特征 - 速度估计
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, np.ndarray):
        tempo = tempo.item()
    
    # 2. 音色特征 - 频谱中心
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    
    # 3. 音高特征 - 色度图（12音阶分布）
    chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr), axis=1)
    
    # 4. 音色特征 - MFCC
    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20), axis=1)
    
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
    
    # 8. 频谱平坦度 - 表示频谱的平坦程度
    flatness = librosa.feature.spectral_flatness(y=y)[0]
    flatness_mean = np.mean(flatness)
    
    # 9. 频谱带宽 - 表示频谱的扩散程度
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    bandwidth_mean = np.mean(bandwidth)
    
    # 转换标量为数组
    tempo_array = np.array([tempo])
    spectral_centroid_array = np.array([spectral_centroid])
    energy_array = np.array([energy_mean, energy_std])
    zcr_array = np.array([zcr_mean])
    flatness_array = np.array([flatness_mean])
    bandwidth_array = np.array([bandwidth_mean])
    
    # 构建特征字典（用于高级分析）
    features_dict = {
        'tempo': float(tempo),
        'spectral_centroid': float(spectral_centroid),
        'chroma': chroma.tolist(),
        'mfccs': mfccs.tolist(),
        'energy_mean': float(energy_mean),
        'energy_std': float(energy_std),
        'contrast': contrast_mean.tolist(),
        'zcr': float(zcr_mean),
        'flatness': float(flatness_mean),
        'bandwidth': float(bandwidth_mean)
    }
    
    # 连接所有特征为一个向量（兼容test.py的方法）
    features_vector = np.concatenate([
        tempo_array, 
        spectral_centroid_array, 
        chroma, 
        mfccs, 
        energy_array, 
        zcr_array,
        flatness_array,
        bandwidth_array
    ])
    
    return features_vector, features_dict

# 从文件名提取情绪标签
def get_labels(filename):
    """从文件名提取情绪标签
    
    Args:
        filename: 音乐文件名
        
    Returns:
        labels: 情绪标签向量 [怒, 喜, 思, 忧, 恐]
    """
    labels = [0] * 5  # [怒, 喜, 思, 忧, 恐]
    for i, emotion in enumerate(['怒', '喜', '思', '忧', '恐']):
        for keyword in keywords[emotion]:
            if keyword in filename:
                labels[i] = 1
                break
    return labels

# 分析五色序列
def analyze_color_sequence(color_sequence):
    """分析颜色序列，返回五音分布和情绪特征
    
    Args:
        color_sequence: 颜色序列，如 ['青', '赤', '黄', '白', '黑', ...]
        
    Returns:
        tone_distribution: 五音分布字典
        emotion_profile: 情绪特征向量
        emotion_labels: 简化情绪标签 [怒, 喜, 思, 忧, 恐]
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
    emotion_profile = generate_emotion_vector(emotion_keywords)
    
    # 3. 生成简化情绪标签（兼容test.py的方法）
    emotion_labels = [0] * 5  # [怒, 喜, 思, 忧, 恐]
    for color, count in color_counter.items():
        simple_emotion = COLOR_TO_EMOTION_SIMPLE[color]
        idx = {'怒': 0, '喜': 1, '思': 2, '忧': 3, '恐': 4}[simple_emotion]
        emotion_labels[idx] += count / total_tones
    
    # 归一化
    if sum(emotion_labels) > 0:
        emotion_labels = [e / sum(emotion_labels) for e in emotion_labels]
    
    return tone_distribution, emotion_profile, emotion_labels

# 生成情绪特征向量
def generate_emotion_vector(emotion_keywords):
    """根据情绪关键词生成情绪特征向量
    
    Args:
        emotion_keywords: 情绪关键词列表
        
    Returns:
        emotion_vector: 情绪特征向量
    """
    # 初始化音乐特征向量
    feature_vector = np.zeros(len(MUSIC_FEATURES))
    
    # 统计情绪关键词
    emotion_counter = Counter(emotion_keywords)
    total_emotions = len(emotion_keywords)
    
    # 将情绪关键词映射到音乐特征
    for emotion, count in emotion_counter.items():
        weight = count / total_emotions
        if emotion in EMOTION_KEYWORDS:
            for feature in EMOTION_KEYWORDS[emotion]:
                if feature in MUSIC_FEATURES:
                    feature_idx = MUSIC_FEATURES.index(feature)
                    feature_vector[feature_idx] += weight
    
    # 归一化特征向量
    if np.sum(feature_vector) > 0:
        feature_vector = feature_vector / np.sum(feature_vector)
    
    return feature_vector

# 分析音乐并存储情感信息
def analyze_music_files(music_dir='./music_files'):
    """分析音乐文件并存储情感信息
    
    Args:
        music_dir: 音乐文件目录
        
    Returns:
        prob_vectors: 情绪概率向量字典
        music_features_cache: 音乐特征缓存
    """
    music_files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
    X, y, file_names = [], [], []
    music_features_cache = {}
    
    print(f"正在分析 {len(music_files)} 个音乐文件...")
    
    # 提取特征和标签
    for file in music_files:
        try:
            features_vector, features_dict = extract_features(os.path.join(music_dir, file))
            labels = get_labels(file)
            X.append(features_vector)
            y.append(labels)
            file_names.append(file)
            music_features_cache[file] = features_dict
        except Exception as e:
            print(f"处理文件 {file} 时出错: {e}")
    
    X = np.array(X)
    y = np.array(y)
    
    # 分离有标签数据
    labeled_idx = [i for i, label in enumerate(y) if sum(label) > 0]
    
    if len(labeled_idx) < 5:  # 如果标记数据太少
        print("警告：标记数据太少，使用简单匹配算法")
        # 创建一个简单的概率向量字典
        prob_vectors = {}
        for i, file in enumerate(file_names):
            # 从文件名中提取情绪标签
            labels = get_labels(file)
            # 如果没有标签，给每个情绪一个小的基础概率
            if sum(labels) == 0:
                labels = [0.1] * 5
            # 归一化
            labels = [l / sum(labels) for l in labels]
            prob_vectors[file] = labels
    else:
        print(f"使用机器学习模型分析情绪，基于 {len(labeled_idx)} 个标记样本")
        X_labeled = X[labeled_idx]
        y_labeled = y[labeled_idx]
        
        # 训练模型
        model = MultiOutputClassifier(LogisticRegression(max_iter=1000))
        model.fit(X_labeled, y_labeled)
        
        # 预测所有文件的情绪概率
        probabilities = model.predict_proba(X)
        prob_vectors = {file_names[i]: [p[1] for p in prob] for i, prob in enumerate(probabilities)}
    
    # 存储到JSON
    with open('music_emotions.json', 'w') as f:
        json.dump(prob_vectors, f)
    
    return prob_vectors, music_features_cache

# 添加这个函数以确保获取正确的音乐文件路径
def get_music_files_path(music_dir='./music_files'):
    """获取音乐文件的绝对路径
    
    Args:
        music_dir: 相对于当前模块的音乐文件目录
        
    Returns:
        音乐文件目录的绝对路径
    """
    # 如果传入的是绝对路径，则直接返回
    if os.path.isabs(music_dir):
        return music_dir
        
    # 获取当前模块所在目录的绝对路径
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, os.path.normpath(music_dir).lstrip('./\\'))

# 修改extract_and_store_all_music_features函数的开头部分
def extract_and_store_all_music_features(music_dir='./music_files'):
    """提取并存储所有音乐文件的完整特征信息
    
    Args:
        music_dir: 音乐文件目录
        
    Returns:
        all_music_features: 所有音乐文件的特征信息字典
    """
    # 确保使用正确的音乐文件路径
    music_dir = get_music_files_path(music_dir)
    print(f"提取音乐特征，音乐文件目录: {music_dir}")
    
    # 如果目录不存在，创建目录
    if not os.path.exists(music_dir):
        print(f"创建音乐文件目录: {music_dir}")
        os.makedirs(music_dir)
    
    music_files = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]
    all_music_features = {}
    
    print(f"正在提取并存储 {len(music_files)} 个音乐文件的特征...")
    
    # 首先检查是否存在情感概率向量文件，如果不存在则创建
    if not os.path.exists('music_emotions.json'):
        prob_vectors, _ = analyze_music_files(music_dir)
    else:
        with open('music_emotions.json', 'r') as f:
            prob_vectors = json.load(f)
    
    # 提取每个音乐文件的特征
    for file in music_files:
        try:
            # 提取音频特征
            features_vector, features_dict = extract_features(os.path.join(music_dir, file))
            
            # 获取情感概率向量
            emotion_probs = prob_vectors.get(file, [0.2] * 5)  # 如果没有情感分析，给一个默认值
            
            # 存储所有特征
            all_music_features[file] = {
                'features_vector': features_vector.tolist(),  # numpy数组转为列表以便JSON序列化
                'features_dict': features_dict,
                'emotion_probs': emotion_probs
            }
            
            print(f"已提取 {file} 的特征")
            
        except Exception as e:
            print(f"处理文件 {file} 时出错: {e}")
    
    # 存储到JSON文件
    with open('all_music_features.json', 'w') as f:
        json.dump(all_music_features, f)
    
    print(f"已成功提取并存储 {len(all_music_features)} 个音乐文件的特征")
    return all_music_features

# 计算五音相似度
def calculate_tone_similarity(tone_distribution, music_features):
    """计算五音分布与音乐音高特征的相似度
    
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

# 计算情绪相似度
def calculate_emotion_similarity(emotion_profile, music_features):
    """计算情绪特征与音乐特征的相似度
    
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
    flatness = music_features['flatness']
    
    # 创建音乐情绪特征向量
    music_emotion = np.zeros(len(MUSIC_FEATURES))
    
    # 速度特征
    if tempo < 80:  # 慢
        for keyword in ['舒缓', '缓慢', '平静']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    elif tempo > 120:  # 快
        for keyword in ['快速', '激昂', '活泼']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    else:  # 中等
        for keyword in ['中庸', '平衡']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    
    # 能量特征
    if energy < 0.1:  # 低能量
        for keyword in ['轻柔', '低沉', '悲伤']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    elif energy > 0.3:  # 高能量
        for keyword in ['强劲', '震撼', '热烈']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    
    # 频谱对比度
    if contrast > 0.5:  # 高对比度
        for keyword in ['明亮', '清晰', '透明']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    else:  # 低对比度
        for keyword in ['深沉', '厚重', '沉重']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    
    # 零交叉率
    if zcr > 0.1:  # 高零交叉率
        for keyword in ['紧张', '不安', '高亢']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    else:  # 低零交叉率
        for keyword in ['舒适', '温暖', '和谐']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    
    # 频谱平坦度
    if flatness > 0.3:  # 高平坦度（噪声型）
        for keyword in ['紧张', '不安', '黑暗']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    else:  # 低平坦度（音调型）
        for keyword in ['优雅', '和谐', '清晰']:
            if keyword in MUSIC_FEATURES:
                music_emotion[MUSIC_FEATURES.index(keyword)] += 1.0
    
    # 归一化
    if np.sum(music_emotion) > 0:
        music_emotion = music_emotion / np.sum(music_emotion)
    
    # 计算余弦相似度
    similarity = 1 - cosine(emotion_profile, music_emotion)
    
    return similarity

# 修改find_matching_music函数的开头部分
def find_matching_music(color_values, music_dir='./music_files', top_n=5):
    """根据五色数值匹配音乐
    
    Args:
        color_values: 五色数值 [青, 赤, 黄, 白, 黑]
        music_dir: 音乐文件目录
        top_n: 返回的最相似音乐数量
        
    Returns:
        similar_music: 最相似音乐文件列表及其相似度分数
    """
    # 确保使用正确的音乐文件路径
    music_dir = get_music_files_path(music_dir)
    print(f"查找相似音乐，音乐文件目录: {music_dir}")
    
    # 归一化五色数值
    total = sum(color_values)
    if total == 0:
        color_values = [1, 1, 1, 1, 1]  # 平均分布
        total = 5
    
    normalized_values = [v / total for v in color_values]
    
    # 转换为颜色序列
    color_sequence = []
    colors = ['青', '赤', '黄', '白', '黑']
    for i, value in enumerate(normalized_values):
        # 将比例转换为数量（总共100个）
        count = int(value * 100)
        color_sequence.extend([colors[i]] * count)
    
    # 分析颜色序列
    tone_distribution, emotion_profile, emotion_labels = analyze_color_sequence(color_sequence)
    
    # 检查是否存在完整特征JSON文件，如果不存在则创建
    if not os.path.exists('all_music_features.json'):
        print("未找到预先计算的音乐特征文件，正在创建...")
        all_music_features = extract_and_store_all_music_features(music_dir)
    else:
        # 加载所有音乐特征
        print("正在加载预先计算的音乐特征...")
        with open('all_music_features.json', 'r') as f:
            all_music_features = json.load(f)
    
    # 计算每个音乐文件的相似度
    similarities = []
    
    for music_file, features in all_music_features.items():
        # 1. 基本情感相似度
        emotion_probs = features['emotion_probs']
        basic_sim = sum(w * p for w, p in zip(emotion_labels, emotion_probs))
        
        # 2. 高级相似度计算
        music_features = features['features_dict']
        
        # 计算五音相似度
        tone_sim = calculate_tone_similarity(tone_distribution, music_features)
        
        # 计算情绪特征相似度
        emotion_sim = calculate_emotion_similarity(emotion_profile, music_features)
        
        # 综合相似度（可调整权重）
        combined_sim = 0.4 * basic_sim + 0.3 * tone_sim + 0.3 * emotion_sim
        
        similarities.append((music_file, combined_sim, basic_sim, tone_sim, emotion_sim))
    
    # 按相似度降序排序
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # 返回前N个最相似的音乐
    return similarities[:top_n]

# 可视化颜色分析结果
def visualize_color_analysis(color_values):
    """可视化颜色分析结果
    
    Args:
        color_values: 五色数值 [青, 赤, 黄, 白, 黑]
    """
    # 归一化五色数值
    total = sum(color_values)
    if total == 0:
        color_values = [1, 1, 1, 1, 1]  # 平均分布
        total = 5
    
    normalized_values = [v / total for v in color_values]
    
    # 转换为颜色序列
    color_sequence = []
    colors = ['青', '赤', '黄', '白', '黑']
    for i, value in enumerate(normalized_values):
        # 将比例转换为数量（总共100个）
        count = int(value * 100)
        color_sequence.extend([colors[i]] * count)
    
    # 分析颜色序列
    tone_distribution, emotion_profile, _ = analyze_color_sequence(color_sequence)
    
    # 创建图形
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 6))
    
    # 1. 绘制五色分布
    ax1.bar(colors, normalized_values, color=['green', 'red', 'yellow', 'white', 'black'])
    ax1.set_title('五色分布')
    ax1.set_ylim(0, max(normalized_values) * 1.2)
    
    # 2. 绘制五音分布
    tones = list(tone_distribution.keys())
    values = list(tone_distribution.values())
    ax2.bar(tones, values, color=['yellow', 'white', 'green', 'red', 'black'])
    ax2.set_title('五音分布')
    ax2.set_ylim(0, max(values) * 1.2)
    
    # 3. 绘制情绪特征
    top_emotions = np.argsort(emotion_profile)[-10:]  # 取前10个最强的情绪特征
    top_features = [MUSIC_FEATURES[i] for i in top_emotions]
    top_values = [emotion_profile[i] for i in top_emotions]
    
    ax3.barh(top_features, top_values, color='skyblue')
    ax3.set_title('主要情绪特征')
    ax3.set_xlim(0, max(top_values) * 1.2)
    
    plt.tight_layout()
    plt.show()

# 主函数
def main():
    """主函数"""
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 音乐文件目录
    music_dir = os.path.join(script_dir, 'music_files')
    
    print("\n五色音乐匹配系统 (增强版)")
    print("=======================")
    
    # 选择操作模式
    print("\n请选择操作模式:")
    print("1. 输入五色值匹配音乐")
    print("2. 更新音乐特征库")
    
    mode = input("请选择 (1/2): ").strip()
    
    if mode == '2':
        # 更新音乐特征库
        print("\n正在更新音乐特征库...")
        extract_and_store_all_music_features(music_dir)
        print("音乐特征库更新完成！")
        return
    
    # 选择输入方式
    print("\n请选择输入方式:")
    print("1. 输入五色数值 [青, 赤, 黄, 白, 黑]")
    print("2. 输入五色序列字符串")
    
    choice = input("请选择 (1/2): ").strip()
    
    if choice == '1':
        # 输入五色数值
        print("\n请输入五色数值 [青, 赤, 黄, 白, 黑]，用空格分隔:")
        try:
            color_values = list(map(int, input().strip().split()))
            if len(color_values) != 5:
                print("错误：必须输入5个数值，对应 [青, 赤, 黄, 白, 黑]")
                return
        except ValueError:
            print("错误：请输入有效的数值")
            return
    else:
        # 输入五色序列字符串
        print("\n请输入一串中国传统五色值（青、赤、黄、白、黑）:")
        color_input = input().strip()
        
        # 解析颜色输入
        valid_colors = set(['青', '赤', '黄', '白', '黑'])
        color_sequence = [c for c in color_input if c in valid_colors]
        
        # 验证输入长度
        if len(color_sequence) < 5:
            print(f"警告：输入的有效颜色数量为 {len(color_sequence)}，太少无法进行有效分析。")
            return
        
        # 统计五色数值
        color_counter = Counter(color_sequence)
        color_values = [color_counter.get('青', 0), 
                        color_counter.get('赤', 0), 
                        color_counter.get('黄', 0), 
                        color_counter.get('白', 0), 
                        color_counter.get('黑', 0)]
    
    # 打印五色数值
    print("\n五色数值 [青, 赤, 黄, 白, 黑]:")
    print(color_values)
    
    # 查找相似音乐
    print("\n正在查找最相似的音乐...")
    similar_music = find_matching_music(color_values, music_dir, top_n=5)
    
    # 打印结果
    print("\n最相似的音乐文件:")
    for i, music_info in enumerate(similar_music, 1):
        if len(music_info) >= 5:  # 高级匹配结果
            music_file, combined_sim, basic_sim, tone_sim, emotion_sim = music_info
            print(f"{i}. {music_file}")
            print(f"   综合相似度: {combined_sim:.2%}")
            print(f"   基本情感相似度: {basic_sim:.2%}")
            print(f"   五音相似度: {tone_sim:.2%}")
            print(f"   情绪特征相似度: {emotion_sim:.2%}")
        else:  # 基本匹配结果
            music_file, basic_sim = music_info[:2]
            print(f"{i}. {music_file}")
            print(f"   相似度: {basic_sim:.2%}")
    
    # 可视化分析结果
    visualize_color_analysis(color_values)

# 程序入口
if __name__ == "__main__":
    main()