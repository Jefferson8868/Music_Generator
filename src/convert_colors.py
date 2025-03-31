import json
import re
import os

# 定义输入和输出文件路径
colors_txt_path = '../colors.txt'
output_json_path = '../data/ColorData.json'

# 确保路径是相对于脚本位置的
script_dir = os.path.dirname(os.path.abspath(__file__))
colors_txt_path = os.path.join(script_dir, colors_txt_path)
output_json_path = os.path.join(script_dir, output_json_path)

# 创建一个空列表来存储颜色数据
color_data = []

# 正则表达式模式，用于匹配颜色行
pattern = r'^(.+?)#([A-Fa-f0-9]{6})RGB\((\d+),\s*(\d+),\s*(\d+)\)CMYK\((\d+),(\d+),(\d+),(\d+)\)$'

# 读取colors.txt文件
with open(colors_txt_path, 'r', encoding='utf-8') as file:
    for line in file:
        line = line.strip()
        if not line:
            continue
            
        # 使用正则表达式匹配行
        match = re.match(pattern, line)
        if match:
            name = match.group(1)
            hex_code = match.group(2)
            r = int(match.group(3))
            g = int(match.group(4))
            b = int(match.group(5))
            c = int(match.group(6))
            m = int(match.group(7))
            y = int(match.group(8))
            k = int(match.group(9))
            
            # 创建颜色对象，匹配现有的ColorData.json格式
            color_obj = {
                "UniqueId": f"rgb({r}, {g}, {b})",
                "Title": name,
                "Subtitle": f"RGB:{r},{g},{b}",
                "Content": f"CMYK:{c},{m},{y},{k}",
                "Color": f"#FF{hex_code}",
                "Description": f"{name}：传统中国色彩，十六进制值 #{hex_code}，RGB({r},{g},{b})，CMYK({c},{m},{y},{k})。"
            }
            
            color_data.append(color_obj)
        else:
            print(f"无法解析行: {line}")

# 检查是否有错误的行
if 'Error: Invalid color value' in open(colors_txt_path, 'r', encoding='utf-8').read():
    print("警告：colors.txt中存在无效的颜色值")

# 保存为JSON文件
with open(output_json_path, 'w', encoding='utf-8') as json_file:
    json.dump(color_data, json_file, ensure_ascii=False, indent=4)

print(f"成功转换 {len(color_data)} 种颜色到 {output_json_path}")