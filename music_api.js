/**
 * 音乐API服务
 * 根据颜色情绪搜索相关音乐
 */

// 音乐API服务对象
window.MusicAPI = window.MusicAPI || {
    // 颜色到情绪的映射缓存
    emotionMapCache: null,
    
    // 加载颜色情绪映射数据
    async loadEmotionMap() {
        if (this.emotionMapCache) return this.emotionMapCache;
        
        try {
            const response = await fetch('data/color_emotion_map.json');
            this.emotionMapCache = await response.json();
            return this.emotionMapCache;
        } catch (error) {
            console.error('加载颜色情绪映射数据失败:', error);
            return { emotions: [] };
        }
    },
    
    // 根据RGB值获取情绪
    async getEmotionFromColor(r, g, b) {
        const emotionMap = await this.loadEmotionMap();
        if (!emotionMap || !emotionMap.emotions || emotionMap.emotions.length === 0) {
            return null;
        }
        
        // 计算HSV值
        const hsv = this.rgbToHsv(r, g, b);
        
        // 确定五行类型
        const wuxingType = this.getWuxingType(r, g, b);
        
        // 匹配情绪
        const matchedEmotions = [];
        
        for (const emotion of emotionMap.emotions) {
            for (const range of emotion.color_ranges) {
                if (range.type === wuxingType) {
                    let match = true;
                    
                    // 检查亮度范围
                    if (range.min_brightness && hsv.v < range.min_brightness) match = false;
                    if (range.max_brightness && hsv.v > range.max_brightness) match = false;
                    
                    // 检查饱和度范围
                    if (range.min_saturation && hsv.s < range.min_saturation) match = false;
                    if (range.max_saturation && hsv.s > range.max_saturation) match = false;
                    
                    if (match) {
                        matchedEmotions.push({
                            name: emotion.name,
                            english: emotion.english,
                            keywords: emotion.keywords,
                            music_styles: emotion.music_styles,
                            score: this.calculateEmotionScore(hsv, range)
                        });
                    }
                }
            }
        }
        
        // 如果没有匹配的情绪，返回默认情绪
        if (matchedEmotions.length === 0) {
            return {
                name: "平静",
                english: "calm",
                keywords: ["宁静", "安详"],
                music_styles: ["轻音乐", "古典"]
            };
        }
        
        // 按匹配分数排序
        matchedEmotions.sort((a, b) => b.score - a.score);
        
        // 返回最匹配的情绪
        return matchedEmotions[0];
    },
    
    // 计算情绪匹配分数
    calculateEmotionScore(hsv, range) {
        let score = 100;
        
        // 根据亮度和饱和度的匹配程度调整分数
        if (range.min_brightness) {
            score -= Math.max(0, range.min_brightness - hsv.v) * 2;
        }
        if (range.max_brightness) {
            score -= Math.max(0, hsv.v - range.max_brightness) * 2;
        }
        if (range.min_saturation) {
            score -= Math.max(0, range.min_saturation - hsv.s) * 2;
        }
        if (range.max_saturation) {
            score -= Math.max(0, hsv.s - range.max_saturation) * 2;
        }
        
        return Math.max(0, score);
    },
    
    // 根据RGB值确定五行类型
    getWuxingType(r, g, b) {
        // 转换为HSV
        const hsv = this.rgbToHsv(r, g, b);
        const h = hsv.h, s = hsv.s, v = hsv.v;
        
        // 基于HSV值分类 - 优化后的分类规则
        // 木-青（青绿色系）
        if ((h >= 90 && h < 180) || (g > r * 1.2 && g > b * 1.2 && h > 60)) {
            return "木";
        }
        // 火-赤（红色系）
        else if (((h >= 0 && h < 20) || (h >= 340 && h <= 360)) && r > Math.max(g, b)) {
            return "火";
        }
        // 土-黄（黄色、棕色系）
        else if ((h >= 20 && h < 50) && (r > g * 0.8 || g > r * 0.8)) {
            return "土";
        }
        // 金-白（白色、浅色系）
        else if ((v >= 70 && s <= 40) || (r > 180 && g > 180 && b > 180) || (r > 150 && g > 150 && b > 150 && Math.max(r,g,b) - Math.min(r,g,b) < 30)) {
            return "金";
        }
        // 水-黑（黑色、深色系）
        else if ((v <= 40) || (r < 80 && g < 80 && b < 80) || (b > r * 1.2 && b > g * 1.2 && h > 180 && h < 300)) {
            return "水";
        }
        // 默认分类
        else {
            // 根据RGB值的比例进行二次判断
            if (g > Math.max(r, b) * 1.1 && h > 60 && h < 180) {
                return "木";
            }
            else if (r > Math.max(g, b) * 1.1 && (h < 20 || h > 340)) {
                return "火";
            }
            else if (h >= 20 && h < 60) {
                return "土";
            }
            else if (r > 180 && g > 180 && b > 180) {
                return "金";
            }
            else {
                return "水";
            }
        }
    },
    
    // RGB转HSV
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        
        let h;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        
        if (max === min) {
            h = 0; // 无色相
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, v: v * 100 };
    },
    
    // 加载API配置
    async loadApiConfig() {
        try {
            const response = await fetch('data/api_config.json');
            return await response.json();
        } catch (error) {
            console.error('加载API配置失败:', error);
            return {
                default_service: 'mock'
            };
        }
    },
    
    // 搜索相关音乐
    async searchRelatedMusic(emotion, limit = 5) {
        try {
            console.log(`搜索与情绪 "${emotion.name}" 相关的音乐...`);
            
            // 加载API配置
            const apiConfig = await this.loadApiConfig();
            const service = apiConfig.default_service;
            
            let musicData;
            
            // 根据配置选择使用哪个API服务
            switch (service) {
                case 'youtube':
                    if (apiConfig.youtube && apiConfig.youtube.enabled && apiConfig.youtube.api_key) {
                        musicData = await this.searchYouTubeMusic(emotion, apiConfig.youtube, limit);
                    } else {
                        console.warn('YouTube API未启用或缺少API密钥，使用模拟数据');
                        musicData = this.getMockMusicData(emotion, limit);
                    }
                    break;
                    
                case 'bilibili':
                    if (apiConfig.bilibili && apiConfig.bilibili.enabled && apiConfig.bilibili.app_key) {
                        musicData = await this.searchBilibiliMusic(emotion, apiConfig.bilibili, limit);
                    } else {
                        console.warn('哔哩哔哩API未启用或缺少API密钥，使用模拟数据');
                        musicData = this.getMockMusicData(emotion, limit);
                    }
                    break;
                    
                case 'mock':
                default:
                    // 使用模拟数据
                    musicData = this.getMockMusicData(emotion, limit);
                    break;
            }
            
            return {
                success: true,
                data: musicData,
                emotion: emotion,
                source: service
            };
        } catch (error) {
            console.error('搜索音乐失败:', error);
            return {
                success: false,
                error: error.message,
                emotion: emotion
            };
        }
    },
    
    // 使用YouTube API搜索音乐
    async searchYouTubeMusic(emotion, config, limit) {
        try {
            // 构建搜索关键词
            const keywords = this.buildSearchKeywords(emotion);
            const maxResults = Math.min(limit, config.max_results || 5);
            
            // 构建API URL
            const url = new URL(config.base_url);
            url.searchParams.append('part', 'snippet');
            url.searchParams.append('maxResults', maxResults.toString());
            url.searchParams.append('q', keywords + ' music');
            url.searchParams.append('type', 'video');
            url.searchParams.append('videoCategoryId', '10'); // 音乐类别ID
            url.searchParams.append('key', config.api_key);
            
            // 发送请求
            const response = await fetch(url.toString());
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`YouTube API错误: ${data.error?.message || '未知错误'}`);
            }
            
            // 转换为统一格式
            return data.items.map(item => ({
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                duration: '未知', // YouTube API需要额外请求获取时长
                style: '未知',
                source: 'youtube',
                video_id: item.id.videoId,
                thumbnail: item.snippet.thumbnails.medium.url,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));
        } catch (error) {
            console.error('YouTube搜索失败:', error);
            // 失败时返回模拟数据
            return this.getMockMusicData(emotion, limit);
        }
    },
    
    // 使用哔哩哔哩API搜索音乐
    async searchBilibiliMusic(emotion, config, limit) {
        try {
            // 构建搜索关键词
            const keywords = this.buildSearchKeywords(emotion);
            const maxResults = Math.min(limit, config.max_results || 5);
            
            // 构建API URL
            const url = new URL(config.base_url);
            url.searchParams.append('search_type', 'video');
            url.searchParams.append('keyword', keywords + ' 音乐');
            url.searchParams.append('order', 'totalrank');
            url.searchParams.append('duration', '0');
            url.searchParams.append('tids', '3'); // 音乐分区
            url.searchParams.append('page', '1');
            url.searchParams.append('ps', maxResults.toString());
            
            // 注意：实际使用时需要添加签名等认证信息
            // 这里简化处理，实际项目中应在服务器端处理API调用
            
            // 发送请求
            const response = await fetch(url.toString());
            const data = await response.json();
            
            if (data.code !== 0) {
                throw new Error(`哔哩哔哩API错误: ${data.message || '未知错误'}`);
            }
            
            // 转换为统一格式
            return data.data.result.map(item => ({
                title: item.title.replace(/<[^>]+>/g, ''), // 移除HTML标签
                artist: item.author,
                duration: this.formatBilibiliDuration(item.duration),
                style: '未知',
                source: 'bilibili',
                video_id: item.bvid,
                thumbnail: item.pic,
                url: `https://www.bilibili.com/video/${item.bvid}`
            }));
        } catch (error) {
            console.error('哔哩哔哩搜索失败:', error);
            // 失败时返回模拟数据
            return this.getMockMusicData(emotion, limit);
        }
    },
    
    // 格式化哔哩哔哩视频时长
    formatBilibiliDuration(duration) {
        if (!duration) return '未知';
        
        // 如果已经是格式化的时间字符串，直接返回
        if (typeof duration === 'string' && duration.includes(':')) {
            return duration;
        }
        
        // 如果是秒数，转换为分:秒格式
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // 构建搜索关键词
    buildSearchKeywords(emotion) {
        let keywords = '';
        
        // 使用情绪名称和关键词
        if (emotion.english) {
            keywords += emotion.english + ' ';
        }
        
        if (emotion.name) {
            keywords += emotion.name + ' ';
        }
        
        // 添加音乐风格关键词
        if (emotion.music_styles && emotion.music_styles.length > 0) {
            keywords += emotion.music_styles.slice(0, 2).join(' ') + ' ';
        }
        
        // 添加情绪关键词
        if (emotion.keywords && emotion.keywords.length > 0) {
            keywords += emotion.keywords.slice(0, 2).join(' ');
        }
        
        return keywords.trim();
    },
    
    // 获取模拟音乐数据
    getMockMusicData(emotion, limit) {
        // 基于情绪关键词的模拟音乐数据
        const mockMusicDatabase = {
            "calm": [
                { title: "平静的湖面", artist: "王菲", duration: "4:25", style: "轻音乐" },
                { title: "夜的钢琴曲", artist: "石进", duration: "5:10", style: "古典" },
                { title: "青花瓷", artist: "周杰伦", duration: "3:59", style: "民谣" },
                { title: "山居秋暝", artist: "许嵩", duration: "4:32", style: "民谣" },
                { title: "雨的印记", artist: "班得瑞", duration: "3:45", style: "轻音乐" },
                { title: "月光", artist: "贝多芬", duration: "5:20", style: "古典" },
                { title: "春江花月夜", artist: "古筝名家", duration: "8:15", style: "民乐" }
            ],
            "passion": [
                { title: "倔强", artist: "五月天", duration: "4:15", style: "摇滚" },
                { title: "红日", artist: "李克勤", duration: "4:05", style: "流行" },
                { title: "光辉岁月", artist: "Beyond", duration: "4:45", style: "摇滚" },
                { title: "龙的传人", artist: "张震岳", duration: "3:50", style: "嘻哈" },
                { title: "怒放的生命", artist: "汪峰", duration: "4:35", style: "摇滚" },
                { title: "我的未来不是梦", artist: "张雨生", duration: "4:22", style: "流行" },
                { title: "向前冲", artist: "汪峰", duration: "5:10", style: "摇滚" }
            ],
            "melancholy": [
                { title: "烟花易冷", artist: "周杰伦", duration: "4:30", style: "民谣" },
                { title: "董小姐", artist: "宋冬野", duration: "5:05", style: "民谣" },
                { title: "后来", artist: "刘若英", duration: "3:55", style: "流行" },
                { title: "蓝莲花", artist: "许巍", duration: "4:40", style: "摇滚" },
                { title: "斑马斑马", artist: "宋冬野", duration: "4:10", style: "民谣" },
                { title: "晴天", artist: "周杰伦", duration: "4:30", style: "流行" },
                { title: "夜空中最亮的星", artist: "逃跑计划", duration: "4:15", style: "摇滚" }
            ],
            "joy": [
                { title: "最炫民族风", artist: "凤凰传奇", duration: "4:10", style: "流行" },
                { title: "小苹果", artist: "筷子兄弟", duration: "3:40", style: "流行" },
                { title: "快乐崇拜", artist: "潘玮柏/张韶涵", duration: "3:30", style: "流行" },
                { title: "阳光总在风雨后", artist: "许美静", duration: "4:20", style: "流行" },
                { title: "真的爱你", artist: "Beyond", duration: "4:25", style: "摇滚" },
                { title: "甜甜的", artist: "周杰伦", duration: "3:35", style: "流行" },
                { title: "恋爱ing", artist: "五月天", duration: "4:05", style: "摇滚" }
            ],
            "mysterious": [
                { title: "七里香", artist: "周杰伦", duration: "4:20", style: "流行" },
                { title: "夜的第七章", artist: "周杰伦", duration: "3:55", style: "流行" },
                { title: "千年之恋", artist: "信乐团", duration: "4:35", style: "摇滚" },
                { title: "月光边境", artist: "窦唯", duration: "5:15", style: "摇滚" },
                { title: "乱世巨星", artist: "黄耀明", duration: "4:45", style: "流行" },
                { title: "迷迭香", artist: "周杰伦", duration: "4:15", style: "流行" },
                { title: "黑暗中的舞者", artist: "陈奕迅", duration: "4:30", style: "流行" }
            ],
            "solemn": [
                { title: "国家", artist: "成龙", duration: "4:45", style: "流行" },
                { title: "英雄赞歌", artist: "中国交响乐团", duration: "5:20", style: "交响乐" },
                { title: "黄河大合唱", artist: "中央乐团", duration: "8:10", style: "合唱" },
                { title: "我的中国心", artist: "张明敏", duration: "4:30", style: "流行" },
                { title: "长城谣", artist: "刘欢", duration: "5:05", style: "民谣" },
                { title: "走进新时代", artist: "解放军军乐团", duration: "4:50", style: "军乐" },
                { title: "东方红", artist: "中央民族乐团", duration: "3:40", style: "民乐" }
            ],
            "natural": [
                { title: "山高水长", artist: "许巍", duration: "5:10", style: "民谣" },
                { title: "乡间小路", artist: "邓丽君", duration: "3:50", style: "民谣" },
                { title: "稻香", artist: "周杰伦", duration: "3:40", style: "流行" },
                { title: "清明雨上", artist: "许嵩", duration: "4:25", style: "民谣" },
                { title: "春天里", artist: "汪峰", duration: "4:55", style: "摇滚" },
                { title: "小河淌水", artist: "龚玥", duration: "4:15", style: "民谣" },
                { title: "森林狂想曲", artist: "班得瑞", duration: "5:30", style: "轻音乐" }
            ],
            "elegant": [
                { title: "梁祝", artist: "吕思清", duration: "7:45", style: "古典" },
                { title: "茉莉花", artist: "宋祖英", duration: "4:20", style: "民谣" },
                { title: "高山流水", artist: "古琴名家", duration: "6:30", style: "古典" },
                { title: "彩云追月", artist: "中央民族乐团", duration: "5:15", style: "民乐" },
                { title: "二泉映月", artist: "阿炳", duration: "8:40", style: "民乐" },
                { title: "平沙落雁", artist: "古筝名家", duration: "5:50", style: "民乐" },
                { title: "渔舟唱晚", artist: "民乐合奏", duration: "4:35", style: "民乐" }
            ]
        };
        
        // 获取情绪对应的英文关键词
        const emotionKey = emotion.english ? emotion.english.toLowerCase() : 'calm';
        
        // 从数据库中获取对应情绪的音乐列表
        let musicList = mockMusicDatabase[emotionKey] || mockMusicDatabase['calm'];
        
        // 如果没有找到对应情绪的音乐，尝试使用情绪关键词匹配
        if (!musicList && emotion.keywords && emotion.keywords.length > 0) {
            // 遍历所有情绪关键词
            for (const keyword of emotion.keywords) {
                // 检查每个关键词是否匹配任何数据库键
                for (const key in mockMusicDatabase) {
                    if (key.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(key)) {
                        musicList = mockMusicDatabase[key];
                        break;
                    }
                }
                if (musicList) break;
            }
        }
        
        // 如果仍然没有找到匹配的音乐，使用默认的平静音乐
        if (!musicList) {
            musicList = mockMusicDatabase['calm'];
        }
        
        // 随机打乱音乐列表顺序
        const shuffled = [...musicList].sort(() => 0.5 - Math.random());
        
        // 返回指定数量的音乐
        return shuffled.slice(0, limit);
    }
}