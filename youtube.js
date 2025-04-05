const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";  // <-- 请替换成你自己的

/**
 * 根据选定的颜色，从colorData里获取关键词列表，然后随机选择一个关键词去搜索YouTube。
 * 最后在页面上嵌入搜索到的第一个视频。
 * @param {string} selectedColor - 用户选择的颜色名称（如“中国红”）
 */
function searchAndEmbedYouTubeMusic(selectedColor) {
  // 1. 获取对应颜色的关键词数组
  const Keywords = colorData[selectedColor].Keywords;
  if (!Keywords || !Keywords.length) {
    console.error("找不到关键词列表，或关键词列表为空！");
    return;
  }

  // 2. 随机选一个关键词，并加上“音乐”
  const randomIndex = Math.floor(Math.random() * Keywords.length);
  const chosenKeyword = Keywords[randomIndex] + " 音乐";

  // 3. 使用 fetch 调用 YouTube Data API v3
  //    这里用 Search endpoint: 
  //    https://www.googleapis.com/youtube/v3/search
  //    组合请求参数 part、type、q、maxResults、key 等
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
    new URLSearchParams({
      part: "snippet",
      q: chosenKeyword,
      type: "video",
      maxResults: 1,
      key: YOUTUBE_API_KEY,
    });

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        // 4. 获取第一个视频的ID
        const videoId = data.items[0].id.videoId;
        // 将搜索到的视频嵌入到iframe中
        embedYouTubeVideo(videoId);
      } else {
        console.warn("未找到相关视频数据");
      }
    })
    .catch(error => {
      console.error("YouTube搜索接口错误:", error);
    });
}

/**
 * 创建一个iframe，将YouTube视频嵌入到网页指定容器中
 * @param {string} videoId - YouTube视频ID
 */
function embedYouTubeVideo(videoId) {
  // 假设你有一个HTML容器：<div id="youtube-container"></div>
  const container = document.getElementById("youtube-container");
  if (!container) {
    console.error("找不到用于放置YouTube视频的DOM容器");
    return;
  }

  // 清空容器（如果你想在每次新搜索时都替换掉旧的视频）
  container.innerHTML = "";

  // 创建iframe
  const iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "315";
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.title = "YouTube video player";
  iframe.frameBorder = "0";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;

  // 加进DOM
  container.appendChild(iframe);
}

// ------------------ 使用示例 ------------------
// 当用户点击某个颜色时，你可以调用：
// searchAndEmbedYouTubeMusic("中国红");
// 该函数会随机从 ["国庆","喜庆","节日","热情","春节"] 里选一个关键词 + “音乐”，
// 然后用 YouTube API 搜索并把第一个视频嵌到页面上。
