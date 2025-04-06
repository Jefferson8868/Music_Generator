#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
五色音乐匹配API服务器

提供RESTful API接口，处理五色序列匹配音乐的请求。
集成wuxing_music_matcher.py中的匹配算法。
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from wuxing_music_matcher import (
    extract_and_store_all_music_features,
    find_matching_music
)
import os
import json
import traceback


app = Flask(__name__)
CORS(app)  # 启用CORS支持


# 获取当前脚本所在目录的绝对路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FEATURES_FILE = os.path.join(BASE_DIR, 'all_music_features.json')
MUSIC_DIR = os.path.join(BASE_DIR, 'music_files')


# 加载音乐特征数据
def load_music_features():
    if not os.path.exists(FEATURES_FILE):
        print("正在提取音乐特征...")
        return extract_and_store_all_music_features(MUSIC_DIR)
    else:
        print("加载已存在的音乐特征...")
        with open(FEATURES_FILE, 'r') as f:
            return json.load(f)


# 全局变量存储音乐特征
music_features = None


@app.before_request
def initialize():
    global music_features
    if music_features is None:
        music_features = load_music_features()


@app.route('/api/match-music', methods=['POST'])
def match_music():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': '无效的请求数据'
            }), 400
            
        color_values = data.get('color_values')
        
        if not color_values:
            return jsonify({
                'error': '缺少五色数值数据'
            }), 400
            
        # 确保color_values是正确的格式：包含五个元素的字典或数组
        if isinstance(color_values, dict):
            # 如果是字典，提取值并按照青赤黄白黑的顺序排列
            values = [
                color_values.get('qing', 0),
                color_values.get('chi', 0),
                color_values.get('huang', 0),
                color_values.get('bai', 0),
                color_values.get('hei', 0)
            ]
        elif isinstance(color_values, list) and len(color_values) >= 5:
            # 如果是数组，取前5个值
            values = color_values[:5]
        else:
            # 记录接收到的数据格式以便调试
            return jsonify({
                'error': f'无效的五色数值格式: {type(color_values)}, 值: {color_values}'
            }), 400
        
        # 确保所有值都是数字
        try:
            values = [float(v) for v in values]
        except (ValueError, TypeError):
            return jsonify({
                'error': f'无效的五色数值: {values}'
            }), 400
        
        print(f"处理五色数值: {values}")
        
        # 使用新的音乐匹配算法
        similar_music_results = find_matching_music(values, MUSIC_DIR)
        
        # 转换结果格式
        similar_music = [{
            'file_name': result[0],
            'similarity': result[1],
            'basic_sim': result[2],
            'tone_sim': result[3],
            'emotion_sim': result[4]
        } for result in similar_music_results]
        
        return jsonify({
            'similar_music': similar_music
        })
        
    except Exception as e:
        # 记录详细的错误信息以便调试
        error_details = traceback.format_exc()
        print(f"错误: {str(e)}\n{error_details}")
        return jsonify({
            'error': str(e),
            'details': error_details
        }), 500


if __name__ == '__main__':
    # 预加载音乐特征
    music_features = load_music_features()
    app.run(host='0.0.0.0', port=5000)