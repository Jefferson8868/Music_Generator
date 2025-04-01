#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
五行颜色音乐生成API服务器

提供REST API接口，接收前端的音乐生成请求，调用DiffRhythm模型生成音乐
"""

import os
import sys
import json
import time
import threading
import tempfile
import subprocess
from pathlib import Path
from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS

# 导入五行DiffRhythm桥接模块
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from wuxing_diffrhythm_bridge import (
    load_color_from_wuxing_data,
    generate_music_from_color,
    setup_diffrhythm
)

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 启用跨域请求支持

# 配置
WUXING_DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'WuxingColorData.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output', 'music')
DIFFRHYTHM_DIR = None  # 将在应用启动时设置

# 任务队列和结果缓存
tasks = {}


@app.route('/api/generate_music', methods=['POST'])
def generate_music():
    """生成音乐API接口"""
    try:
        # 解析请求数据
        data = request.json
        wuxing_type = data.get('wuxing_type')
        color_name = data.get('color_name')
        
        if not wuxing_type:
            return jsonify({
                'success': False,
                'error': '缺少五行类型参数'
            }), 400
        
        # 生成任务ID
        task_id = f"{wuxing_type}_{color_name}_{int(time.time())}"
        
        # 创建任务
        tasks[task_id] = {
            'status': 'pending',
            'wuxing_type': wuxing_type,
            'color_name': color_name,
            'created_at': time.time(),
            'result': None,
            'error': None
        }
        
        # 启动异步任务
        thread = threading.Thread(
            target=process_music_generation,
            args=(task_id, wuxing_type, color_name)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'task_id': task_id,
            'message': '音乐生成任务已创建'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'请求处理失败: {str(e)}'
        }), 500


@app.route('/api/task_status/<task_id>', methods=['GET'])
def task_status(task_id):
    """获取任务状态API接口"""
    if task_id not in tasks:
        return jsonify({
            'success': False,
            'error': '任务不存在'
        }), 404
    
    task = tasks[task_id]
    
    response = {
        'success': True,
        'task_id': task_id,
        'status': task['status'],
        'wuxing_type': task['wuxing_type'],
        'color_name': task['color_name'],
        'created_at': task['created_at']
    }
    
    if task['status'] == 'completed':
        # 添加结果信息
        response['music_path'] = task['result']
        response['music_url'] = f'/api/download_music/{task_id}'
    elif task['status'] == 'failed':
        # 添加错误信息
        response['error'] = task['error']
    
    return jsonify(response)


@app.route('/api/download_music/<task_id>', methods=['GET'])
def download_music(task_id):
    """下载生成的音乐文件"""
    if task_id not in tasks or tasks[task_id]['status'] != 'completed':
        abort(404)
    
    music_path = tasks[task_id]['result']
    if not os.path.exists(music_path):
        abort(404)
    
    return send_file(
        music_path,
        as_attachment=True,
        download_name=os.path.basename(music_path),
        mimetype='audio/midi'
    )


@app.route('/api/wuxing_data', methods=['GET'])
def get_wuxing_data():
    """获取五行颜色数据"""
    try:
        with open(WUXING_DATA_PATH, 'r', encoding='utf-8') as f:
            wuxing_data = json.load(f)
        return jsonify(wuxing_data)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取五行数据失败: {str(e)}'
        }), 500


def process_music_generation(task_id, wuxing_type, color_name):
    """处理音乐生成任务"""
    try:
        # 更新任务状态
        tasks[task_id]['status'] = 'processing'
        
        # 加载颜色数据
        color_data, error = load_color_from_wuxing_data(
            WUXING_DATA_PATH,
            wuxing_type,
            color_name
        )
        
        if error:
            tasks[task_id]['status'] = 'failed'
            tasks[task_id]['error'] = error
            return
        
        # 生成音乐
        music_path, error = generate_music_from_color(
            color_data,
            OUTPUT_DIR,
            DIFFRHYTHM_DIR
        )
        
        if error:
            tasks[task_id]['status'] = 'failed'
            tasks[task_id]['error'] = error
            return
        
        # 更新任务状态为完成
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['result'] = music_path
    
    except Exception as e:
        # 更新任务状态为失败
        tasks[task_id]['status'] = 'failed'
        tasks[task_id]['error'] = str(e)


def cleanup_old_tasks():
    """清理旧任务"""
    while True:
        current_time = time.time()
        to_delete = []
        
        for task_id, task in tasks.items():
            # 删除超过24小时的任务
            if current_time - task['created_at'] > 86400:  # 24小时 = 86400秒
                to_delete.append(task_id)
        
        for task_id in to_delete:
            del tasks[task_id]
        
        # 每小时检查一次
        time.sleep(3600)


def init_diffrhythm():
    """初始化DiffRhythm环境"""
    global DIFFRHYTHM_DIR
    
    # 检查是否已经克隆了DiffRhythm仓库
    diffrhythm_path = os.path.join(os.path.dirname(__file__), 'models', 'DiffRhythm')
    if os.path.exists(diffrhythm_path) and os.path.isdir(diffrhythm_path):
        print(f"使用现有的DiffRhythm目录: {diffrhythm_path}")
        DIFFRHYTHM_DIR = diffrhythm_path
    else:
        print("设置DiffRhythm环境...")
        try:
            # 创建models目录
            os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)
            
            # 克隆DiffRhythm仓库
            subprocess.run(
                ["git", "clone", "https://github.com/ASLP-lab/DiffRhythm.git", diffrhythm_path],
                check=True
            )
            
            # 安装依赖
            subprocess.run(
                ["pip", "install", "-r", os.path.join(diffrhythm_path, "requirements.txt")],
                check=True
            )
            
            DIFFRHYTHM_DIR = diffrhythm_path
            print(f"DiffRhythm环境设置完成: {DIFFRHYTHM_DIR}")
        except Exception as e:
            print(f"设置DiffRhythm环境失败: {str(e)}")
            # 使用临时目录作为备选
            DIFFRHYTHM_DIR = tempfile.mkdtemp()
            print(f"使用临时目录作为备选: {DIFFRHYTHM_DIR}")


def main():
    """主函数"""
    # 初始化DiffRhythm环境
    init_diffrhythm()
    
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 启动清理任务的线程
    cleanup_thread = threading.Thread(target=cleanup_old_tasks)
    cleanup_thread.daemon = True
    cleanup_thread.start()
    
    # 启动Flask应用
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == "__main__":
    main()