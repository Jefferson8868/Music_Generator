#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
转换ColorData.json中的所有颜色数据到WuxingColorData.json格式
将颜色按照五行（木-青、火-赤、土-黄、金-白、水-黑）分类
"""

import json
import os
import colorsys

# 文件路径
COLOR_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'ColorData.json')
WUXING_COLOR_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'WuxingColorData.json')

# 定义五行颜色范围（基于HSV色彩空间）
def rgb_to_hsv(r, g, b):
    """将RGB值转换为HSV值"""
    r, g, b = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return h*360, s*100, v*100

def get_color_brightness(color_item):
    """获取颜色的亮度值（HSV中的V值）和饱和度(S值)的综合评分
    对于同一五行类别，我们希望颜色按照视觉上的深浅排序
    浅色：高亮度(V)、低饱和度(S)
    深色：低亮度(V)、高饱和度(S)
    """
    rgb_str = color_item["UniqueId"]
    rgb_values = rgb_str.strip('rgb()').split(',')
    r, g, b = map(int, [x.strip() for x in rgb_values])
    h, s, v = rgb_to_hsv(r, g, b)
    
    # 计算综合评分，亮度占主导地位，饱和度作为辅助因素
    # 高亮度、低饱和度的颜色得分高（更浅）
    return v - (s * 0.3)

def classify_color(rgb_str):
    """根据RGB值将颜色分类到五行，优化后的分类算法"""
    # 从RGB字符串中提取RGB值
    rgb_values = rgb_str.strip('rgb()').split(',')
    r, g, b = map(int, [x.strip() for x in rgb_values])
    
    # 转换为HSV
    h, s, v = rgb_to_hsv(r, g, b)
    
    # 基于HSV值分类 - 优化后的分类规则
    # 木-青（青绿色系）
    if (h >= 90 and h < 180) or (g > r * 1.2 and g > b * 1.2 and h > 60):
        return "木"
    # 火-赤（红色系）
    elif ((h >= 0 and h < 20) or (h >= 340 and h <= 360)) and r > max(g, b):
        return "火"
    # 土-黄（黄色、棕色系）- 缩小范围
    elif (h >= 20 and h < 50) and (r > g * 0.8 or g > r * 0.8):
        return "土"
    # 金-白（白色、浅色系）- 扩大范围
    elif (v >= 70 and s <= 40) or (r > 180 and g > 180 and b > 180) or (r > 150 and g > 150 and b > 150 and max(r,g,b) - min(r,g,b) < 30):
        return "金"
    # 水-黑（黑色、深色系）
    elif (v <= 40) or (r < 80 and g < 80 and b < 80) or (b > r * 1.2 and b > g * 1.2 and h > 180 and h < 300):
        return "水"
    # 默认分类
    else:
        # 根据RGB值的比例进行二次判断
        if g > max(r, b) * 1.1 and h > 60 and h < 180:
            return "木"
        elif r > max(g, b) * 1.1 and (h < 20 or h > 340):
            return "火"
        elif h >= 20 and h < 60:
            return "土"
        elif r > 180 and g > 180 and b > 180:
            return "金"
        else:
            return "水"

def update_description(color_item, wuxing_type):
    """更新颜色描述，将'传统中国色彩'改为对应的五行色系"""
    wuxing_color_map = {
        "木": "青色系",
        "火": "赤色系",
        "土": "黄色系",
        "金": "白色系",
        "水": "黑色系"
    }
    
    description = color_item["Description"]
    if "传统中国色彩" in description:
        description = description.replace("传统中国色彩", f"传统中国{wuxing_color_map[wuxing_type]}")
        color_item["Description"] = description
    
    return color_item

def main():
    # 读取原始颜色数据
    with open(COLOR_DATA_PATH, 'r', encoding='utf-8') as f:
        color_data = json.load(f)
    
    # 读取现有的五行颜色数据
    with open(WUXING_COLOR_DATA_PATH, 'r', encoding='utf-8') as f:
        wuxing_data = json.load(f)
    
    # 创建五行分类字典
    wuxing_dict = {item["wuxing"]: item for item in wuxing_data}
    
    # 清空现有的颜色列表，但保留五行属性信息
    for wuxing_type in wuxing_dict:
        wuxing_dict[wuxing_type]["colors"] = []
    
    # 分类所有颜色
    for color_item in color_data:
        wuxing_type = classify_color(color_item["UniqueId"])
        # 更新描述
        updated_color = update_description(color_item.copy(), wuxing_type)
        # 添加到对应的五行分类
        wuxing_dict[wuxing_type]["colors"].append(updated_color)
    
    # 对每个五行类别中的颜色按明度排序（从浅到深）
    for wuxing_type in wuxing_dict:
        wuxing_dict[wuxing_type]["colors"].sort(key=get_color_brightness, reverse=True)
    
    # 转换回列表格式
    updated_wuxing_data = list(wuxing_dict.values())
    
    # 保存更新后的五行颜色数据
    with open(WUXING_COLOR_DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(updated_wuxing_data, f, ensure_ascii=False, indent=2)
    
    print(f"转换完成！共处理了 {len(color_data)} 个颜色，分类到 {len(updated_wuxing_data)} 个五行类别。")
    for wuxing_type in wuxing_dict:
        print(f"{wuxing_type}: {len(wuxing_dict[wuxing_type]['colors'])} 个颜色")

if __name__ == "__main__":
    main()