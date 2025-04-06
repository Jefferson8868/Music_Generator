const YOUTUBE_API_KEY = "AIzaSyD_wzomckbm9ZHFGBVnvfa_R-32sF2skyM";  

/**
 * 中国传统色彩音乐生成器 - YouTube API 集成
 * 根据选定的颜色，搜索并展示相关视频
 */

/**
 * 根据选定的颜色，从colorData里获取关键词列表，然后随机选择一个关键词去搜索YouTube。
 * 最后在页面上嵌入搜索到的相关视频。
 * @param {string} selectedColor - 用户选择的颜色名称（如"中国红"）
 */
function searchAndEmbedYouTubeMusic(selectedColor) {
  console.log(`正在为颜色 "${selectedColor}" 搜索相关视频...`);
  
  // 显示加载状态
  const container = document.getElementById("youtube-container");
  if (!container) {
    console.error("未找到YouTube容器元素");
    return;
  }
  
  container.innerHTML = `<div class="generating-music"><div class="music-loading">搜索视频中...</div></div>`;
  
  // 检查全局colorData是否存在
  if (typeof colorData === 'undefined') {
    console.error("找不到colorData对象，请确保在调用此函数前已加载颜色数据");
    container.innerHTML = `<div class="error-message">无法加载颜色数据</div>`;
    return;
  }
  
  // 获取颜色关键词数据
  if (!colorData[selectedColor]) {
    console.error(`找不到颜色 "${selectedColor}" 数据`);
    container.innerHTML = `<div class="error-message">无法为 "${selectedColor}" 找到相关颜色数据</div>`;
    return;
  }
  
  // 检查关键词列表
  if (!colorData[selectedColor].Keywords || !colorData[selectedColor].Keywords.length) {
    console.error(`找不到颜色 "${selectedColor}" 的关键词列表，或关键词列表为空`);
    container.innerHTML = `<div class="error-message">无法为 "${selectedColor}" 找到相关关键词</div>`;
    return;
  }

  // 从可用关键词中随机选择一个
  const Keywords = colorData[selectedColor].Keywords;
  const emotion = colorData[selectedColor].Emotion || "";
  const randomIndex = Math.floor(Math.random() * Keywords.length);
  const keyword = Keywords[randomIndex];
  
  // 构建搜索查询
  // 使用较简短的查询以减少错误概率
  const searchQuery = `${selectedColor} ${keyword} 音乐`;
  console.log(`选择的搜索关键词: "${searchQuery}"`);

  // 检查API密钥
  if (YOUTUBE_API_KEY === "YOUR_API_KEY_HERE") {
    console.error("YouTube API密钥未设置，请在youtube.js中设置有效的API密钥");
    container.innerHTML = `<div class="error-message">YouTube API密钥未配置</div>`;
    return;
  }
  
  // 使用fetch API调用YouTube Data API v3
  // 确保正确编码查询参数
  const encodedQuery = encodeURIComponent(searchQuery);
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("API请求格式错误或API密钥无效");
        } else if (response.status === 403) {
          throw new Error("API密钥无权限或已被限制");
        } else if (response.status === 429) {
          throw new Error("已超出API配额限制");
        } else {
          throw new Error(`YouTube API请求失败: ${response.status} ${response.statusText}`);
        }
      }
      return response.json();
    })
    .then(data => {
      console.log("YouTube API 返回数据:", data);
      if (data.items && data.items.length > 0) {
        // 获取视频的ID并展示结果
        embedYouTubeVideos(data.items);
      } else {
        console.warn("未找到相关视频数据");
        container.innerHTML = `<div class="error-message">未找到与 "${selectedColor}" 相关的视频</div>`;
      }
    })
    .catch(error => {
      console.error("YouTube搜索接口错误:", error);
      container.innerHTML = `<div class="error-message">搜索视频时出错: ${error.message}</div>
                             <div class="api-help">请确保已配置有效的YouTube API密钥，并已启用YouTube Data API v3</div>`;
    });
}

/**
 * 创建多个iframe，将YouTube视频嵌入到网页指定容器中
 * @param {Array} videoItems - YouTube视频项数组
 */
function embedYouTubeVideos(videoItems) {
  const container = document.getElementById("youtube-container");
  if (!container) {
    console.error("找不到用于放置YouTube视频的DOM容器");
    return;
  }

  // 清空容器
  container.innerHTML = "";
  
  // 添加标题
  const titleElement = document.createElement("div");
  titleElement.className = "found-videos-title";
  titleElement.textContent = `找到 ${videoItems.length} 个相关视频`;
  container.appendChild(titleElement);
  
  // 创建视频容器
  const videosContainer = document.createElement("div");
  videosContainer.className = "videos-container";
  
  // 为每个视频创建iframe
  videoItems.forEach((item, index) => {
    if (!item.id || !item.id.videoId) {
      console.warn("跳过无效的视频项:", item);
      return;
    }
    
    const videoId = item.id.videoId;
    const videoTitle = item.snippet ? (item.snippet.title || "无标题") : "无标题";
    const channelTitle = item.snippet ? (item.snippet.channelTitle || "未知频道") : "未知频道";
    
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper";
    
    // 创建iframe
    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "180";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = videoTitle;
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    
    // 添加视频标题和频道信息
    const infoDiv = document.createElement("div");
    infoDiv.className = "video-info";
    
    const titleDiv = document.createElement("div");
    titleDiv.className = "video-title";
    titleDiv.textContent = truncateText(videoTitle, 40);
    titleDiv.title = videoTitle; // 鼠标悬停时显示完整标题
    
    const channelDiv = document.createElement("div");
    channelDiv.className = "video-channel";
    channelDiv.textContent = channelTitle;
    
    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(channelDiv);
    
    // 组装视频包装器
    videoWrapper.appendChild(iframe);
    videoWrapper.appendChild(infoDiv);
    
    // 添加到容器
    videosContainer.appendChild(videoWrapper);
  });
  
  if (videosContainer.children.length === 0) {
    container.innerHTML = `<div class="error-message">未能加载任何视频</div>`;
    return;
  }
  
  container.appendChild(videosContainer);
}

/**
 * 截断文本以避免太长
 * @param {string} text - 要截断的文本
 * @param {number} maxLength - 最大长度
 * @return {string} 截断后的文本
 */
function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// 添加必要的样式
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .found-videos-title {
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
      text-align: center;
    }
    
    .videos-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .video-wrapper {
      border-radius: 8px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .video-wrapper:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .video-info {
      padding: 8px 10px;
    }
    
    .video-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    
    .video-channel {
      font-size: 12px;
      color: #666;
    }
    
    .error-message {
      color: #d32f2f;
      text-align: center;
      padding: 15px;
      background: rgba(255, 235, 238, 0.3);
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .api-help {
      font-size: 12px;
      color: #666;
      text-align: center;
      padding: 5px;
    }
  `;
  document.head.appendChild(style);
});

// ------------------ 使用示例 ------------------
// 当用户点击某个颜色时，你可以调用：
// searchAndEmbedYouTubeMusic("中国红");
// 该函数会随机从 ["国庆","喜庆","节日","热情","春节"] 里选一个关键词 + "音乐"，
// 然后用 YouTube API 搜索并把第一个视频嵌到页面上。
