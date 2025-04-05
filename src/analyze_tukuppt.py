import requests
from bs4 import BeautifulSoup
import re
import json

# 设置请求头，模拟浏览器访问
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def analyze_tukuppt_structure():
    url = 'https://www.tukuppt.com/peiyueso/zhongguofengbeijingyinle.html'
    print(f"正在分析网页: {url}")
    
    try:
        # 发送请求获取网页内容
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # 如果请求不成功则抛出异常
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 打印页面标题
        print(f"页面标题: {soup.title.text}")
        
        # 查找可能的音乐列表容器
        containers = [
            '.audio-list', '.music-list', '.mp3-list', '.sound-list',
            '.audio-items', '.music-items', '.mp3-items', '.sound-items',
            '.audio-container', '.music-container', '.mp3-container', '.sound-container'
        ]
        
        for selector in containers:
            elements = soup.select(selector)
            print(f"选择器 {selector}: 找到 {len(elements)} 个元素")
            
        # 查找可能的音乐项元素
        items = [
            '.audio-item', '.music-item', '.mp3-item', '.sound-item',
            '.audio-box', '.music-box', '.mp3-box', '.sound-box',
            'li.audio', 'li.music', 'li.mp3', 'li.sound',
            '.audio-li', '.music-li', '.mp3-li', '.sound-li'
        ]
        
        for selector in items:
            elements = soup.select(selector)
            print(f"选择器 {selector}: 找到 {len(elements)} 个元素")
            if elements:
                print(f"第一个 {selector} 元素:")
                print(elements[0])
                print("\n")
        
        # 查找可能的播放和下载按钮
        buttons = [
            '.play-btn', '.download-btn', '.play-button', '.download-button',
            '.play', '.download', '.audio-play', '.audio-download',
            '.music-play', '.music-download', '.mp3-play', '.mp3-download'
        ]
        
        for selector in buttons:
            elements = soup.select(selector)
            print(f"选择器 {selector}: 找到 {len(elements)} 个元素")
            if elements:
                print(f"第一个 {selector} 元素:")
                print(elements[0])
                print("\n")
        
        # 查找所有音频元素
        audio_elements = soup.find_all('audio')
        print(f"找到 {len(audio_elements)} 个 audio 元素")
        if audio_elements:
            print("第一个 audio 元素:")
            print(audio_elements[0])
            print("\n")
            
            # 提取音频源URL
            for i, audio in enumerate(audio_elements[:5]):  # 只显示前5个
                src = audio.get('src')
                data_src = audio.get('data-src')
                source_tags = audio.find_all('source')
                
                print(f"音频 {i+1}:")
                print(f"  src: {src}")
                print(f"  data-src: {data_src}")
                
                if source_tags:
                    for j, source in enumerate(source_tags):
                        print(f"  source {j+1}: {source.get('src')}")
                print("\n")
        
        # 查找所有可能包含音频URL的脚本标签
        scripts = soup.find_all('script')
        print(f"找到 {len(scripts)} 个 script 元素")
        
        # 查找可能包含音频数据的JSON对象
        for i, script in enumerate(scripts):
            if script.string and ('audio' in script.string.lower() or 'mp3' in script.string.lower() or 'music' in script.string.lower()):
                print(f"脚本 {i+1} 可能包含音频数据:")
                # 尝试提取JSON数据
                json_matches = re.findall(r'\{[^\{\}]*"(audio|mp3|music|url|src)"[^\{\}]*\}', script.string)
                if json_matches:
                    print(f"  找到 {len(json_matches)} 个可能的JSON对象")
                    for j, match in enumerate(json_matches[:3]):  # 只显示前3个
                        print(f"  匹配 {j+1}: {match}")
                print("\n")
        
        # 查找所有链接，筛选可能的音频下载链接
        links = soup.find_all('a', href=True)
        mp3_links = [link for link in links if link['href'].lower().endswith('.mp3')]
        print(f"找到 {len(mp3_links)} 个直接指向MP3的链接")
        for i, link in enumerate(mp3_links[:5]):  # 只显示前5个
            print(f"MP3链接 {i+1}: {link['href']}")
        
        # 查找可能的分页元素
        pagination = soup.select('.pagination, .page, .pages, .pager')
        print(f"找到 {len(pagination)} 个可能的分页元素")
        if pagination:
            print("分页元素:")
            print(pagination[0])
        
    except Exception as e:
        print(f"分析网页时出错: {e}")

if __name__ == "__main__":
    analyze_tukuppt_structure()