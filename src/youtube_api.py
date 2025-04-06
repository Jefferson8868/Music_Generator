import requests
import json
import time
from typing import Optional, Dict, List, Any

# 从现有的JavaScript文件中获取的API密钥
YOUTUBE_API_KEY = "AIzaSyC-tWZ6rUtewgEaXWF4nQ0yJhbWHcjvpmU"

def validate_api_key() -> bool:
    """验证YouTube API密钥是否有效"""
    try:
        base_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': 'test',
            'maxResults': 1,
            'key': YOUTUBE_API_KEY
        }
        response = requests.get(base_url, params=params)
        return response.status_code == 200
    except:
        return False

def make_request_with_retry(url: str, params: Dict[str, Any], max_retries: int = 3, retry_delay: int = 1) -> Optional[Dict]:
    """发送HTTP请求并实现重试机制
    
    Args:
        url: API端点URL
        params: 请求参数
        max_retries: 最大重试次数
        retry_delay: 重试间隔（秒）
    
    Returns:
        响应数据字典或None（如果请求失败）
    """
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if response.status_code == 403:
                print(f"API密钥无效或权限不足: {e}")
                return None
            elif response.status_code == 429:
                print(f"已超出API配额限制: {e}")
                return None
            elif attempt < max_retries - 1:
                wait_time = retry_delay * (attempt + 1)
                print(f"请求失败，{wait_time}秒后重试: {e}")
                time.sleep(wait_time)
                continue
            else:
                print(f"达到最大重试次数，请求失败: {e}")
                return None
        except (KeyError, json.JSONDecodeError) as e:
            print(f"数据解析错误: {e}")
            return None

def search_youtube_videos(query: str, max_results: int = 3) -> Optional[List[Dict]]:
    """
    搜索YouTube视频
    
    Args:
        query: 搜索关键词
        max_results: 返回结果数量，默认为3
    
    Returns:
        包含视频信息的字典列表，如果请求失败则返回None
    """
    # 首先验证API密钥
    if not validate_api_key():
        print("YouTube API密钥无效，请检查配置")
        return None
        
    # 构建API请求URL和参数
    base_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': max_results,
        'key': YOUTUBE_API_KEY
    }
    
    # 发送请求并处理响应
    data = make_request_with_retry(base_url, params)
    if not data:
        return None
        
    # 提取视频信息
    try:
        videos = []
        for item in data.get('items', []):
            video_info = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail': item['snippet']['thumbnails']['default']['url'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': item['snippet']['publishedAt']
            }
            videos.append(video_info)
        return videos
    except (KeyError, TypeError) as e:
        print(f"视频数据解析错误: {e}")
        return None

def get_video_details(video_id: str) -> Optional[Dict]:
    """
    获取视频详细信息
    
    Args:
        video_id: YouTube视频ID
    
    Returns:
        视频详细信息字典，如果请求失败则返回None
    """
    # 首先验证API密钥
    if not validate_api_key():
        print("YouTube API密钥无效，请检查配置")
        return None
        
    # 构建API请求URL和参数
    base_url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        'part': 'snippet,statistics',
        'id': video_id,
        'key': YOUTUBE_API_KEY
    }
    
    # 发送请求并处理响应
    data = make_request_with_retry(base_url, params)
    if not data or not data.get('items'):
        return None
        
    # 提取视频信息
    try:
        video = data['items'][0]
        return {
            'title': video['snippet']['title'],
            'description': video['snippet']['description'],
            'view_count': video['statistics'].get('viewCount', 0),
            'like_count': video['statistics'].get('likeCount', 0),
            'comment_count': video['statistics'].get('commentCount', 0)
        }
    except (KeyError, TypeError) as e:
        print(f"视频详情数据解析错误: {e}")
        return None

def test_youtube_api():
    """
    测试YouTube API功能
    """
    print("=== 测试YouTube API功能 ===")
    
    # 测试视频搜索
    print("\n1. 测试视频搜索:")
    search_query = "中国传统音乐"
    videos = search_youtube_videos(search_query, max_results=2)
    
    if videos:
        print(f"找到 {len(videos)} 个与 '{search_query}' 相关的视频:")
        for video in videos:
            print(f"\n标题: {video['title']}")
            print(f"频道: {video['channel_title']}")
            print(f"视频ID: {video['video_id']}")
            
            # 测试获取视频详情
            print("\n2. 测试获取视频详情:")
            details = get_video_details(video['video_id'])
            if details:
                print(f"观看次数: {details['view_count']}")
                print(f"点赞数: {details['like_count']}")
                print(f"评论数: {details['comment_count']}")
            else:
                print("无法获取视频详情")
    else:
        print(f"搜索 '{search_query}' 未找到结果")

if __name__ == "__main__":
    test_youtube_api()