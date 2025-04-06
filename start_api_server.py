#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
五色音乐匹配API服务器启动脚本

此脚本用于启动api_server.py，提供简单的错误处理和状态反馈。
"""

import os
import sys
import subprocess
import time
import webbrowser


def print_banner():
    """打印欢迎横幅"""
    print("\n" + "=" * 60)
    print("        五色音乐匹配API服务器 - 启动器        ")
    print("=" * 60)


def find_api_server():
    """查找API服务器脚本位置"""
    # 检查当前目录
    if os.path.exists("src/api_server.py"):
        return "src/api_server.py"
    
    # 检查src目录
    if os.path.exists("api_server.py"):
        return "api_server.py"
    
    # 查找项目中的任何api_server.py文件
    for root, dirs, files in os.walk("."):
        if "api_server.py" in files:
            return os.path.join(root, "api_server.py")
    
    return None


def check_dependencies():
    """检查必要的依赖项"""
    required_packages = ["flask", "flask-cors", "librosa", "numpy", "scipy", "sklearn"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages


def install_dependencies(packages):
    """安装缺失的依赖项"""
    print(f"\n正在安装缺失的依赖项: {', '.join(packages)}")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + packages)
        return True
    except subprocess.CalledProcessError:
        print("安装依赖项失败。请手动安装以下包:")
        for package in packages:
            print(f"    pip install {package}")
        return False


def start_server(server_path):
    """启动API服务器"""
    print("\n正在启动API服务器...")
    print(f"服务器脚本路径: {server_path}")
    print("\n服务器日志输出:")
    print("-" * 60)
    
    try:
        # 启动服务器进程
        server_process = subprocess.Popen(
            [sys.executable, server_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # 等待服务器启动
        server_started = False
        error_occurred = False
        
        for line in server_process.stdout:
            print(line.strip())
            
            if "Running on" in line:
                server_started = True
                print("\n" + "-" * 60)
                print("服务器已成功启动！")
                print("API服务器运行在: http://localhost:5000")
                print("按 Ctrl+C 停止服务器")
                print("-" * 60 + "\n")
                break
                
            if "Error" in line or "Traceback" in line:
                error_occurred = True
        
        # 如果服务器没有成功启动
        if not server_started and not error_occurred:
            print("\n" + "-" * 60)
            print("服务器似乎已启动，但没有确认消息。")
            print("尝试访问: http://localhost:5000")
            print("按 Ctrl+C 停止服务器")
            print("-" * 60 + "\n")
        
        # 保持脚本运行，直到用户按下Ctrl+C
        try:
            # 继续输出服务器日志
            for line in server_process.stdout:
                print(line.strip())
        except KeyboardInterrupt:
            print("\n停止服务器...")
            server_process.terminate()
            server_process.wait()
            print("服务器已停止。")
    
    except Exception as e:
        print(f"\n启动服务器时出错: {str(e)}")
        return False
    
    return True


def main():
    """主函数"""
    print_banner()
    
    # 查找API服务器脚本
    server_path = find_api_server()
    if not server_path:
        print("错误: 无法找到API服务器脚本 (api_server.py)")
        print("请确保脚本位于当前目录或src目录中。")
        return False
    
    print(f"找到API服务器脚本: {server_path}")
    
    # 检查依赖项
    missing_packages = check_dependencies()
    if missing_packages:
        print(f"缺少必要的依赖项: {', '.join(missing_packages)}")
        user_input = input("是否自动安装缺失的依赖项? (y/n): ").strip().lower()
        
        if user_input == 'y':
            if not install_dependencies(missing_packages):
                return False
        else:
            print("请手动安装依赖项后再运行此脚本。")
            return False
    
    # 启动服务器
    return start_server(server_path)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n程序已被用户中断。")
    except Exception as e:
        print(f"\n发生错误: {str(e)}") 