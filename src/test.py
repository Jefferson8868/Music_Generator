import os
import json
import librosa
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier

# 关键词字典，用于初始标签
keywords = {
    '怒': ['愤怒', '激怒'],
    '喜': ['轻快', '美妙', '欢快', '激昂', '奋进', '震撼'],
    '思': ['感人', '动情', '抒情'],
    '忧': ['悲伤', '压抑'],
    '恐': ['恐惧', '紧张']
}

# 提取音频特征
def extract_features(file_path):
    # Load the audio file
    y, sr = librosa.load(file_path)
    
    # Extract features
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)  # tempo might be a scalar or array
    # Ensure tempo is a scalar
    if isinstance(tempo, np.ndarray):
        tempo = tempo.item()  # Extract scalar value if tempo is an array
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))  # scalar
    chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr), axis=1)  # 1D array
    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20), axis=1)  # 1D array
    
    # Convert scalars to 1D arrays
    tempo_array = np.array([tempo])  # Shape: (1,)
    spectral_centroid_array = np.array([spectral_centroid])  # Shape: (1,)
    
    # Verify shapes (optional, for debugging)
    print(f"Shapes: tempo_array={tempo_array.shape}, spectral_centroid_array={spectral_centroid_array.shape}, chroma={chroma.shape}, mfccs={mfccs.shape}")
    
    # Concatenate all 1D arrays
    return np.concatenate([tempo_array, spectral_centroid_array, chroma, mfccs])


# 从文件名提取情绪标签
def get_labels(filename):
    labels = [0] * 5  # [怒, 喜, 思, 忧, 恐]
    for i, emotion in enumerate(['怒', '喜', '思', '忧', '恐']):
        for keyword in keywords[emotion]:
            if keyword in filename:
                labels[i] = 1
                break
    return labels

# 分析音乐并存储情感信息
def analyze_music_files():
    music_files = [f for f in os.listdir('./music_files') if f.endswith('.mp3')]
    X, y, file_names = [], [], []
    
    # 提取特征和标签
    for file in music_files:
        features = extract_features(os.path.join('./music_files', file))
        labels = get_labels(file)
        X.append(features)
        y.append(labels)
        file_names.append(file)
    
    X = np.array(X)
    y = np.array(y)
    
    # 分离有标签数据
    labeled_idx = [i for i, label in enumerate(y) if sum(label) > 0]
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

# 根据五色数值匹配音乐
def find_matching_music(color_values):
    weights = [v / 100.0 for v in color_values]  # 归一化权重 [青, 赤, 黄, 白, 黑]
    with open('music_emotions.json', 'r') as f:
        prob_vectors = json.load(f)
    
    scores = []
    for file, probs in prob_vectors.items():
        score = sum(w * p for w, p in zip(weights, probs))
        scores.append((file, score))
    
    best_file = max(scores, key=lambda x: x[1])[0]
    return best_file

# 使用示例
if __name__ == "__main__":
    # 首次运行：分析音乐并存储情感信息
    analyze_music_files()
    
    # 用户输入五色数值
    color_values = [20, 30, 10, 25, 15]  # [青, 赤, 黄, 白, 黑]
    best_match = find_matching_music(color_values)
    print(f"最匹配的音乐文件是: {best_match}")