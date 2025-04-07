/**
 * 中国传统色彩音乐生成器
 * 多语言支持脚本
 */

// Initialize language system
document.addEventListener('DOMContentLoaded', function() {
    // Set up language toggle
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        // Check if language preference is stored
        const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
        
        // Set initial UI language
        document.documentElement.setAttribute('lang', currentLang);
        langToggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
        
        // Apply stored translations if not in Chinese
        if (currentLang === 'en') {
            applyTranslations();
        }
        
        // Set up click handler
        langToggle.addEventListener('click', function() {
            const currentLang = document.documentElement.getAttribute('lang');
            const newLang = currentLang === 'zh' ? 'en' : 'zh';
            
            // Toggle language
            document.documentElement.setAttribute('lang', newLang);
            localStorage.setItem('preferredLanguage', newLang);
            
            // Update button text
            langToggle.textContent = newLang === 'zh' ? 'EN' : '中文';
            
            // Apply translations or revert to original content
            if (newLang === 'en') {
                applyTranslations();
            } else {
                revertToOriginal();
            }
        });
    }
});

// Translation mapping
const translations = {
    // Navigation
    "项目介绍": "Project Intro",
    "颜色选择": "Color Selection",
    "我的历史": "My History",
    
    // Main titles
    "中国传统色彩音乐生成器": "Chinese Traditional Color Music Generator",
    "我的色彩音乐历史": "My Color Music History",
    
    // Five Elements colors - COMPACT versions for small circles
    "青": "Blue-G",
    "赤": "Red",
    "黄": "Yellow",
    "白": "White",
    "黑": "Black",
    
    // Five Elements terms - COMPACT versions
    "木": "Wood",
    "火": "Fire",
    "土": "Earth",
    "金": "Metal",
    "水": "Water",
    
    // Intro page section titles
    "传统文化的现代复兴": "Modern Revival of Traditional Culture",
    "我们的解决方案": "Our Solution",
    "主要功能": "Key Features",
    "文化意义": "Cultural Significance",
    "技术亮点": "Technical Highlights",
    "开始您的色彩音乐之旅": "Start Your Color Music Journey",
    
    // History page sections
    "我的创作人格档案": "My Creative Profile",
    "最近选色记录": "Recent Color Selections",
    "五行偏好": "Five Elements Preference",
    "歌曲风格分析": "Music Style Analysis",
    "AI风格推荐": "AI Style Recommendations",
    
    // Traditional color names
    // "粉米": "Pink Rice",
    // "美人祭": "Beauty Festival",
    // "凝脂": "Frozen Cream",
    // "晴山": "Clear Mountain",
    // "翠缥": "Jade Green",
    
    // Our Solution section
    "中国传统色彩音乐生成器是一个从颜色的角度出发，连接传统文化与现代艺术的创新平台。我们将中国传统五行色彩理论与现代音乐生成技术相结合，打造了一个独特的交互体验。": 
    "The Chinese Traditional Color Music Generator is an innovative platform that connects traditional culture with modern art from the perspective of color. We combine China's traditional Five Elements color theory with modern music generation technology to create a unique interactive experience.",
    
    "中国传统色彩音乐生成器是一个从颜色的角度出发，连接传统文化与现代艺术的创新平台。我们将中国传统五行色彩理论与现代音乐生成技术相结合，打造了一个独特的交互体验。用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。":"The Chinese Traditional Color Music Generator is an innovative platform that connects traditional culture with modern art from the perspective of color. We combine the Chinese traditional Five Elements color theory with modern music generation technology to create a unique interactive experience. Users can explore the mysterious connection between the Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music pieces based on the Five Elements attributes of the colors, their emotional characteristics, and the user's personal preferences, allowing users to experience the unique charm of traditional culture through a dual auditory and visual journey.",

    "用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。": 
    "Users can explore the mysterious connection between Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music based on the color's Five Elements properties, emotional characteristics, and user preferences, allowing users to experience the unique charm of traditional culture through both auditory and visual experiences.",
    
    "生成并推荐个性化的音乐作品": "Generate and recommend personalized music works",
    
    // YouTube related
    "搜索视频中...": "Searching videos...",
    "无法加载颜色数据": "Failed to load color data",
    "无法为": "No data found for",
    "找到相关颜色数据": "color data",
    "找到相关关键词": "keywords found",
    "YouTube API密钥未配置": "YouTube API key not configured",
    "API请求格式错误或API密钥无效": "Invalid API request format or API key",
    "API密钥无权限或已被限制": "API key has no permission or is restricted",
    "已超出API配额限制": "API quota limit exceeded",
    "YouTube API请求失败": "YouTube API request failed",
    "未找到相关视频": "No related videos found",
    "搜索视频时出错": "Error searching videos",
    "请确保已配置有效的YouTube API密钥，并已启用YouTube Data API v3": "Please ensure you have configured a valid YouTube API key and enabled YouTube Data API v3",
    "找到": "Found",
    "个相关视频": "related videos",
    "无标题": "Untitled",
    "未知频道": "Unknown Channel",
    "相关视频推荐": "Related Video Recommendations",
    
    // Common elements
    "当前选中色彩": "Currently Selected Color",
    "色彩描述": "Color Description",
    "生成音乐与搜索歌曲": "Generate Music & Find Songs",
    "搜索相似音乐": "Search Similar Music",
    "五行相生": "Five Elements Harmony",
    
    // Common UI elements
    "立即体验": "Try Now",
    "获取AI推荐": "Get AI Recommendations",
    "配置API": "Configure API",
    "配置 OpenAI API": "Configure OpenAI API",
    "我已了解": "I Understand",
    
    // Footer
    "数据来源": "Data Sources",
    "关于项目": "About Project",
    "联系我们": "Contact Us",
    "© 2025 中国传统色彩音乐生成器 | DataHack @ UC San Diego": "© 2025 Chinese Traditional Color Music Generator | DataHack @ UC San Diego",
    
    // Placeholders and states
    "暂无记录": "No records yet",
    "暂无记录，快去选择颜色开始吧！": "No records yet. Start by selecting colors!",
    "暂无风格分析结果，快去选择颜色生成歌曲吧！": "No style analysis yet. Generate music by selecting colors!",
    "此颜色的五行属性将显示在这里": "This color's Five Elements attributes will be displayed here",
    "点击\"获取AI推荐\"按钮，基于您的颜色选择获取个性化音乐推荐。": "Click \"Get AI Recommendations\" button to receive personalized music recommendations based on your color choices.",
    
    // Five Elements attributes
    "五音：角 | 五脏：肝 | 方位：东 | 季节：春": "Tones: Jue | Organs: Liver | Direction: East | Season: Spring",
    "五音：徵 | 五脏：心 | 方位：南 | 季节：夏": "Tones: Zhi | Organs: Heart | Direction: South | Season: Summer",
    "五音：宫 | 五脏：脾 | 方位：中 | 季节：长夏": "Tones: Gong | Organs: Spleen | Direction: Center | Season: Late Summer",
    "五音：商 | 五脏：肺 | 方位：西 | 季节：秋": "Tones: Shang | Organs: Lungs | Direction: West | Season: Autumn",
    "五音：羽 | 五脏：肾 | 方位：北 | 季节：冬": "Tones: Yu | Organs: Kidneys | Direction: North | Season: Winter",
};

// Longer intro page translations
const introTranslations = {
    "近年来，我们见证了越来越多的年轻人对中国传统文化产生浓厚兴趣的现象。从汉服运动到国风音乐，从传统节日的重新流行到古典美学在现代设计中的应用，这种趋势正在不断增强。": 
    "In recent years, we've witnessed growing interest in traditional Chinese culture among young people. From the Hanfu movement to Guofeng music, from the revival of traditional festivals to the application of classical aesthetics in modern design, this trend continues to strengthen.",
    
    "然而，传统文化的许多精髓往往因表达方式的局限而难以被现代年轻人充分理解和感受。特别是中国传统的色彩理论和五行思想，虽然蕴含丰富的美学和哲学价值，却缺乏直观、互动的现代表达形式。":
    "However, many essentials of traditional culture are often difficult for modern youth to fully understand due to limitations in expression methods. In particular, Chinese traditional color theory and Five Elements philosophy, while rich in aesthetic and philosophical value, lack intuitive, interactive modern forms of expression.",
    
    "如何让古老的传统文化以更现代、更互动的方式与当代年轻人产生共鸣？":
    "How can we make ancient traditional culture resonate with contemporary youth in more modern, interactive ways?",
    
    "中国传统色彩音乐生成器是一个从颜色的角度出发，连接传统文化与现代艺术的创新平台。我们将中国传统五行色彩理论与现代音乐生成技术相结合，打造了一个独特的交互体验。":
    "The Chinese Traditional Color Music Generator is an innovative platform that connects traditional culture with modern art from the perspective of color. We combine China's traditional Five Elements color theory with modern music generation technology to create a unique interactive experience.",
    
    "用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。":
    "Users can explore the mysterious connection between Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music based on the color's Five Elements properties, emotional characteristics, and user preferences, allowing users to experience the unique charm of traditional culture through both auditory and visual experiences.",
    
    "探索中国传统色彩体系，了解每种颜色背后的文化内涵和五行属性。":
    "Explore the traditional Chinese color system and understand the cultural connotations and Five Elements properties behind each color.",
    
    "根据选择的颜色生成独特的音乐作品，体验色彩与音乐的奇妙关联。":
    "Generate unique musical works based on selected colors and experience the fascinating connection between color and music.",
    
    "获取个人五行偏好分析，发现自己与传统哲学的独特联系。":
    "Get personal Five Elements preference analysis and discover your unique connection to traditional philosophy.",
    
    "基于个人色彩偏好的AI音乐推荐，发现与您审美相契合的音乐作品。":
    "AI music recommendations based on personal color preferences, helping you discover music works that align with your aesthetic taste.",
    
    "本项目不仅是一个创新的交互体验，更是传统文化与现代技术的桥梁。通过这种有趣、直观的方式，我们希望：":
    "This project is not only an innovative interactive experience but also a bridge between traditional culture and modern technology. Through this fun, intuitive approach, we hope to:",
    
    "帮助年轻人重新认识并欣赏中国传统色彩文化":
    "Help young people rediscover and appreciate traditional Chinese color culture",
    
    "让五行理论等传统哲学思想以现代方式焕发生机":
    "Revitalize traditional philosophical ideas such as Five Elements theory in modern ways",
    
    "为音乐创作者提供新的灵感来源":
    "Provide new sources of inspiration for music creators",
    
    "探索人工智能在文化传承中的创新应用":
    "Explore innovative applications of artificial intelligence in cultural heritage",
    
    "在全球文化多元化的今天，我们相信这种创新的文化表达方式能够让中国传统文化以更具吸引力的形式走向世界。":
    "In today's globally diverse cultural landscape, we believe this innovative form of cultural expression can bring Chinese traditional culture to the world in a more appealing form.",
    
    "本项目结合了多项现代技术，包括：":
    "This project combines several modern technologies, including:",
    
    "基于色彩理论的音乐生成算法":
    "Color theory-based music generation algorithms",
    
    "用户偏好学习与分析系统":
    "User preference learning and analysis systems",
    
    "集成OpenAI API的智能推荐引擎":
    "Intelligent recommendation engine integrated with OpenAI API",
    
    "数据可视化技术展示用户偏好":
    "Data visualization techniques to display user preferences",
    
    "响应式设计确保在各种设备上的良好体验":
    "Responsive design ensuring a good experience across various devices",
    
    "无论您是传统文化爱好者、音乐发烧友，还是对创新交互体验感兴趣的探索者，中国传统色彩音乐生成器都将为您带来全新的感官体验。":
    "Whether you're a traditional culture enthusiast, a music lover, or an explorer interested in innovative interactive experiences, the Chinese Traditional Color Music Generator will bring you a brand new sensory experience."
};

// Merge all translations
Object.assign(translations, introTranslations);

// Additional specialized translations for components and color names
const componentTranslations = {
    // Traditional Chinese colors
    // "赭石": "Red Ochre",
    // "朱砂": "Cinnabar",
    // "火红": "Flame Red",
    // "朱红": "Vermilion",
    // "丹": "Scarlet",
    // "茜色": "Madder Red",
    // "绛紫": "Purple Red",
    // "紫酱": "Wine Purple",
    // "紫檀": "Sandalwood",
    // "绀青": "Navy Blue",
    // "靛青": "Indigo",
    // "青碧": "Teal",
    // "青翠": "Verdant",
    // "松花": "Pine Green",
    // "泥金": "Mud Gold",
    // "缃色": "Orange Yellow",
    // "杏黄": "Apricot Yellow",
    // "姜黄": "Ginger Yellow",
    // "雄黄": "Orpiment",
    // "嫩绿": "Tender Green",
    // "柳绿": "Willow Green",
    // "竹青": "Bamboo Green",
    // "翠绿": "Emerald",
    // "松柏绿": "Pine Green",
    // "铜绿": "Patina",
    // "石青": "Azurite",
    // "胭脂": "Rouge",
    // "洋红": "Magenta",
    // "品红": "Pink",
    // "粉红": "Light Pink",
    // "藕荷": "Lotus Pink",
    // "藕粉": "Lotus Root Pink",
    // "青莲": "Blue Lotus",
    // "酡红": "Tipsy Red",
    // "银红": "Silver Red",
    // "玫瑰红": "Rose Red",
    // "妃色": "Princess Pink",
    // "桃红": "Peach",
    // "海棠红": "Crabapple Red",
    // "鹅黄": "Gosling Yellow",
    // "樱草": "Primrose",
    // "鸭黄": "Duck Yellow",
    // "鲜黄": "Bright Yellow",
    // "明黄": "Bright Yellow",
    // "金黄": "Golden Yellow",
    // "蛋黄": "Egg Yolk",
    // "橘黄": "Orange Yellow",
    // "橙黄": "Orange",
    // "橘红": "Orange Red",
    // "银白": "Silver White",
    // "乳白": "Milk White",
    // "米白": "Rice White",
    // "象牙白": "Ivory",
    // "甘石": "Calamine",
    // "粉米": "Pink Rice",
    // "美人祭": "Beauty Festival",
    // "凝脂": "Frozen Cream",
    // "晴山": "Clear Mountain",
    // "翠缥": "Jade Green",
    // "墨": "Ink Black",
    // "漆黑": "Lacquer Black",
    // "玄青": "Dark Blue",
    // "乌黑": "Crow Black",
    // "玄": "Dark Black",
    
    // API configuration modal
    "配置 OpenAI API 密钥": "Configure OpenAI API Key",
    "要获取 OpenAI API 密钥，请访问": "To get an OpenAI API key, please visit",
    
    // Music descriptions
    "正在生成音乐...": "Generating music...",
    "音乐生成完成": "Music generation complete",
    "播放": "Play",
    "暂停": "Pause",
    "下载": "Download",
    
    // Error messages
    "出错了": "Error",
    "请稍后再试": "Please try again later",
    "加载中": "Loading",
    "未找到结果": "No results found",
    
    // API errors
    "429 错误：请求频率过高，请稍后再试": "429 Error: Too many requests, please try again later",
    "API 密钥错误或未设置": "API key error or not set",
    "请求失败": "Request failed",
    
    // Alert and confirmation messages
    "确定": "Confirm",
    "取消": "Cancel",
    "是": "Yes",
    "否": "No",
    "成功": "Success",
    "操作已完成": "Operation completed",
    
    // History page specific
    "更多记录": "More Records",
    "导出数据": "Export Data",
    "清除历史": "Clear History",
    "确定要清除所有历史记录吗？": "Are you sure you want to clear all history?",
    "没有足够数据进行分析": "Not enough data for analysis",
    
    // Chart axis labels
    "木": "Wood",
    "火": "Fire",
    "土": "Earth",
    "金": "Metal",
    "水": "Water"
};

// Merge component translations into main translations
Object.assign(translations, componentTranslations);

// Additional translations specifically for history.html page
const historyPageTranslations = {
    // History page section titles and content
    "我的色彩音乐历史": "My Color Music History",
    "MY COLOR MUSIC HISTORY": "MY COLOR MUSIC HISTORY",
    "📘 我的创作人格档案": "📘 My Creative Profile",
    "🎨 最近选色记录": "🎨 Recent Color Selections",
    "🪷 五行偏好": "🪷 Five Elements Preference",
    "🎵 歌曲风格分析": "🎵 Music Style Analysis",
    "🤖 AI风格推荐": "🤖 AI Style Recommendations",
    
    // Month names in timestamps
    "1月": "Jan",
    "2月": "Feb",
    "3月": "Mar",
    "4月": "Apr",
    "5月": "May",
    "6月": "Jun",
    "7月": "Jul",
    "8月": "Aug",
    "9月": "Sep",
    "10月": "Oct",
    "11月": "Nov",
    "12月": "Dec",
    
    // Common date/time formats
    "日": "",
    "年": "",
    "月": "",
    
    // API modal content
    "要使用 AI 推荐功能，您需要配置自己的 OpenAI API 密钥。请按照以下步骤操作：": "To use the AI recommendation feature, you need to configure your own OpenAI API key. Please follow these steps:",
    "访问 OpenAI 平台 并创建账户或登录": "Visit the OpenAI platform and create an account or sign in",
    "前往 API 密钥页面 创建新的密钥": "Go to the API keys page and create a new key",
    "复制生成的 API 密钥": "Copy the generated API key",
    "打开 config.js 文件": "Open the config.js file",
    "将复制的密钥粘贴到 OPENAI_API_KEY 的引号中": "Paste the copied key into the OPENAI_API_KEY quotes",
    "示例：": "Example:",
    "注意：您的 API 密钥是敏感信息，不要与他人分享。本应用仅在您的浏览器中使用此密钥，并不会将其发送至除 OpenAI 之外的任何服务器。": "Note: Your API key is sensitive information, do not share it with others. This application only uses this key in your browser and does not send it to any server other than OpenAI.",
    "遇到 \"429 Too Many Requests\" 错误？这表示您已达到 OpenAI 的请求限制。请等待一段时间再尝试，或查看 OpenAI 帮助文档": "Encountering a \"429 Too Many Requests\" error? This indicates you've reached OpenAI's request limit. Please wait a while before trying again, or check the OpenAI Help Documentation",
    
    // Chart data in history page
    "传统": "Traditional",
    "流行": "Pop",
    "民族": "Folk",
    "古典": "Classical",
    "电子": "Electronic",
    "爵士": "Jazz",
    "摇滚": "Rock",
    "说唱": "Rap",
    "乡村": "Country",
    "蓝调": "Blues",
    
    // AI recommendation content
    "根据您的五行偏好分析": "Analysis based on your Five Elements preferences",
    "推荐歌曲": "Recommended Songs",
    "推荐艺术家": "Recommended Artists",
    "推荐原因": "Recommendation Reason",
    "您的音乐品味偏好分析": "Analysis of your music taste preferences",
    "无法获取AI推荐，请检查API配置": "Unable to get AI recommendations, please check API configuration",
    "五行音乐分析": "Five Elements Music Analysis",
    "生成中...": "Generating...",
    
    // Color history list
    "暂无记录": "No records yet",
};

// Merge history page translations with main translations
Object.assign(translations, historyPageTranslations);

// Add these specific translations for the intro page content
const introPageSpecificTranslations = {
    // Full paragraph translations for the quoted text
    "如何让古老的传统文化以更现代、更互动的方式与当代年轻人产生共鸣？": 
    "How can we make ancient traditional culture resonate with contemporary youth in more modern, interactive ways?",
    
    // Fix the partial translation issue in this paragraph
    "用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。": 
    "Users can explore the mysterious connection between Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music based on the color's Five Elements properties, emotional characteristics, and user preferences, allowing users to experience the unique charm of traditional culture through both auditory and visual experiences.",
    "用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。": 
    "Users can explore the mysterious connection between Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music based on the color's Five Elements properties, emotional characteristics, and user preferences, allowing users to experience the unique charm of traditional culture through both auditory and visual experiences.",
    // Also add this mixed version that might appear on the page
    "用户可以通过选择传统色彩，探索五行理论与音乐之间的神秘联系。系统会根据色彩的五行属性、情感特质和用户的个人偏好，生成并推荐个性化的音乐作品，让用户通过听觉和视觉的双重体验，感受传统文化的独特魅力。": 
    "Users can explore the mysterious connection between Five Elements theory and music by selecting traditional colors. The system generates and recommends personalized music based on the color's Five Elements properties, emotional characteristics, and user preferences, allowing users to experience the unique charm of traditional culture through both auditory and visual experiences.",
    
    // Additional translations for Key Features section
    "传统色彩探索": "Traditional Color Exploration",
    "音乐生成": "Music Generation",
    "五行分析": "Five Elements Analysis",
    "AI音乐推荐": "AI Music Recommendations",
    
    // Feature descriptions
    "探索中国传统色彩体系，了解每种颜色背后的文化内涵和五行属性": 
    "Explore the traditional Chinese color system and understand the cultural connotations and Five Elements properties behind each color.",
    
    "根据选择的颜色生成独特的音乐作品，体验色彩与音乐的奇妙关联": 
    "Generate unique musical works based on selected colors and experience the fascinating connection between color and music.",
    
    "获取个人五行偏好分析，发现自己与传统哲学的独特联系": 
    "Get personal Five Elements preference analysis and discover your unique connection to traditional philosophy.",
    
    "基于个人色彩偏好的AI音乐推荐，发现与您审美相契合的音乐作品": 
    "AI music recommendations based on personal color preferences, helping you discover music works that align with your aesthetic taste."
};

// Merge these specific translations
Object.assign(translations, introPageSpecificTranslations);

// Additional translations for generated results in history.html
const historyGeneratedContentTranslations = {
    // Common phrases in generated results
    "分析结果": "Analysis Results",
    "您的五行偏好分析": "Your Five Elements Preference Analysis",
    "根据您的选色历史": "Based on your color selection history",
    "推荐风格": "Recommended Styles",
    "偏好类型": "Preferred Types",
    "音乐风格分布": "Music Style Distribution",
    "主导元素": "Dominant Element",
    "次要元素": "Secondary Element",
    "元素平衡": "Element Balance",
    "您的音乐风格偏好": "Your Music Style Preferences",
    "风格特点": "Style Characteristics",
    "情感特质": "Emotional Characteristics",
    "协调度": "Harmony Level",
    "强烈": "Strong",
    "温和": "Moderate",
    "平衡": "Balanced",
    "不平衡": "Unbalanced",
    "极高": "Very High",
    "较高": "High",
    "中等": "Medium",
    "较低": "Low",
    "根据分析，您的音乐品味": "Based on the analysis, your music taste",
    "倾向于": "tends toward",
    "同时兼具": "while also incorporating",
    "的特质": "characteristics",
    "建议探索": "We suggest exploring",
    "类音乐": "style music",
    "您可能会喜欢": "You might enjoy",
    "等风格": "and similar styles",
    "歌曲推荐": "Song Recommendations",
    "艺术家推荐": "Artist Recommendations",
    "推荐理由": "Recommendation Reason"
};

// Merge history generated content translations
Object.assign(translations, historyGeneratedContentTranslations);

// Function to translate dynamic content (called after content changes)
function translateDynamicContent() {
    // Find newly added content that hasn't been translated
    document.querySelectorAll('*:not([data-translated="true"])').forEach(el => {
        // Skip elements that shouldn't be translated (e.g., scripts, styles)
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'META' || el.tagName === 'LINK') {
            return;
        }
        
        // Check if this element has untranslated text
        const text = el.textContent.trim();
        if (text && translations[text]) {
            el.setAttribute('data-original-text', text);
            el.textContent = translations[text];
            el.setAttribute('data-translated', 'true');
        }
        
        // Check attributes
        ['title', 'placeholder', 'alt'].forEach(attr => {
            if (el.hasAttribute(attr) && translations[el.getAttribute(attr)]) {
                el.setAttribute('data-original-' + attr, el.getAttribute(attr));
                el.setAttribute(attr, translations[el.getAttribute(attr)]);
            }
        });
        
        // For elements with mixed content, try to translate text nodes
        if (el.childNodes.length > 1) {
            el.childNodes.forEach(node => {
                if (node.nodeType === 3) { // Text node
                    const nodeText = node.textContent.trim();
                    if (translations[nodeText]) {
                        node.textContent = translations[nodeText];
                    }
                }
            });
        }
    });
}

// Set up a mutation observer to detect and translate dynamically added content
function setupDynamicTranslation() {
    if (document.documentElement.getAttribute('lang') === 'en') {
        const observer = new MutationObserver(mutations => {
            let needsTranslation = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsTranslation = true;
                }
            });
            
            if (needsTranslation) {
                translateDynamicContent();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Enhanced version of applyTranslations to handle special cases
function applyTranslations() {
    // Apply standard translations
    document.querySelectorAll('*').forEach(el => {
        if (el.childNodes && el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const text = el.textContent.trim();
            if (translations[text]) {
                el.setAttribute('data-original-text', text); // Store original for reverting
                el.textContent = translations[text];
            }
        }
    });
    
    // Special handling for color indicators (making them shorter)
    document.querySelectorAll('.color-indicator').forEach(el => {
        const text = el.textContent.trim();
        if (translations[text]) {
            el.setAttribute('data-original-text', text);
            el.textContent = translations[text];
        }
    });
    
    // Navigation links and headings
    document.querySelectorAll('nav a, button, h1, h2, h3, h4, h5').forEach(el => {
        const text = el.textContent.trim();
        if (translations[text]) {
            el.setAttribute('data-original-text', text); // Store original for reverting
            el.textContent = translations[text];
        }
    });
    
    // Special handling for intro page paragraph translation
    document.querySelectorAll('.intro-content p').forEach(el => {
        const text = el.textContent.trim();
        if (translations[text]) {
            el.setAttribute('data-original-text', text);
            el.textContent = translations[text];
        }
    });
    
    // Special handling for color chart
    document.querySelectorAll('.color-sample').forEach(el => {
        if (el.hasAttribute('data-name') && translations[el.getAttribute('data-name')]) {
            el.setAttribute('data-original-name', el.getAttribute('data-name'));
            el.setAttribute('data-name', translations[el.getAttribute('data-name')]);
        }
        
        if (el.hasAttribute('data-wuxing') && translations[el.getAttribute('data-wuxing')]) {
            el.setAttribute('data-original-wuxing', el.getAttribute('data-wuxing'));
            el.setAttribute('data-wuxing', translations[el.getAttribute('data-wuxing')]);
        }
    });
    
    // Special handling for history page elements
    
    // Handle history chart labels
    setTimeout(() => {
        // Try to translate the five elements radar chart
        const chartCanvas = document.getElementById('wuXingRadarChart');
        if (chartCanvas && window.Chart) {
            try {
                const chartInstance = Chart.getChart(chartCanvas);
                if (chartInstance && chartInstance.data && chartInstance.data.labels) {
                    const originalLabels = [...chartInstance.data.labels];
                    const translatedLabels = originalLabels.map(label => 
                        translations[label] || label
                    );
                    chartInstance.data.labels = translatedLabels;
                    chartInstance.update();
                }
            } catch (e) {
                console.log("Chart not fully initialized yet");
            }
        }
        
        // Translate date formats in history timestamps
        document.querySelectorAll('.timestamp, .color-time').forEach(el => {
            let dateText = el.textContent;
            // Replace Chinese month indicators with English format
            Object.keys(translations).forEach(key => {
                if (key.includes('月') || key.includes('日') || key.includes('年')) {
                    dateText = dateText.replace(key, translations[key]);
                }
            });
            
            // If we have a modified date text, update the element
            if (dateText !== el.textContent) {
                el.setAttribute('data-original-text', el.textContent);
                el.textContent = dateText;
            }
        });
        
        // Ensure color names in history are translated
        document.querySelectorAll('.color-history-list li').forEach(el => {
            // Try to find the color name element
            const colorNameEl = el.querySelector('.color-name');
            if (colorNameEl) {
                const text = colorNameEl.textContent.trim();
                if (translations[text]) {
                    colorNameEl.setAttribute('data-original-text', text);
                    colorNameEl.textContent = translations[text];
                }
            }
        });
        
        // Translate AI recommendation sections if they exist
        document.querySelectorAll('#ai-recommendation .ai-recommendation-content').forEach(el => {
            // Handle specific sections like analysis, suggestions, etc.
            el.querySelectorAll('h4').forEach(heading => {
                const text = heading.textContent.trim();
                if (translations[text]) {
                    heading.setAttribute('data-original-text', text);
                    heading.textContent = translations[text];
                }
            });
        });
        
    }, 800); // Give a bit more time for chart to initialize
    
    // Mark all elements as processed
    document.querySelectorAll('*').forEach(el => {
        el.setAttribute('data-translated', 'true');
    });
    
    // Setup observer for dynamic content
    setupDynamicTranslation();

    // Special handling for intro page feature cards
    document.querySelectorAll('.feature-card').forEach(el => {
        // Translate the feature title
        const titleEl = el.querySelector('.feature-title');
        if (titleEl) {
            const text = titleEl.textContent.trim();
            if (translations[text]) {
                titleEl.setAttribute('data-original-text', text);
                titleEl.textContent = translations[text];
            }
        }
        
        // Translate the feature description (p element inside feature card)
        const descEl = el.querySelector('p');
        if (descEl) {
            const text = descEl.textContent.trim();
            if (translations[text]) {
                descEl.setAttribute('data-original-text', text);
                descEl.textContent = translations[text];
            }
        }
    });
    
    // Additional handling for quote section in intro page
    document.querySelectorAll('.quote-section').forEach(el => {
        const text = el.textContent.trim();
        if (translations[text]) {
            el.setAttribute('data-original-text', text);
            el.textContent = translations[text];
        }
    });
    
    // Enhanced handling for history page generated content
    document.querySelectorAll('#ai-recommendation .ai-recommendation-content, #emotion-insight-container').forEach(container => {
        // Process all text nodes including deeper nested elements
        const processNode = (node) => {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent.trim();
                if (text && translations[text]) {
                    node.textContent = translations[text];
                }
            } else if (node.nodeType === 1) { // Element node
                // Translate the element's text if it's a simple element with just text
                if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
                    const text = node.textContent.trim();
                    if (text && translations[text]) {
                        node.setAttribute('data-original-text', text);
                        node.textContent = translations[text];
                    }
                } else {
                    // Otherwise, process all child nodes
                    node.childNodes.forEach(processNode);
                }
            }
        };
        
        // Process the container and all its children
        processNode(container);
    });
}

// Store original content for reverting
const originalAttributes = new WeakMap();

// Collect original content for reverting
function collectOriginalContent() {
    document.querySelectorAll('*').forEach(el => {
        // Create a data object for this element if not exists
        if (!originalAttributes.has(el)) {
            originalAttributes.set(el, {});
        }
        
        // Store text content
        if (el.childNodes && el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const text = el.textContent.trim();
            if (text) {
                originalAttributes.get(el).textContent = text;
            }
        }
        
        // Store attributes
        if (el.hasAttribute('placeholder')) {
            originalAttributes.get(el).placeholder = el.getAttribute('placeholder');
        }
        if (el.hasAttribute('title')) {
            originalAttributes.get(el).title = el.getAttribute('title');
        }
        if (el.hasAttribute('alt')) {
            originalAttributes.get(el).alt = el.getAttribute('alt');
        }
    });
}

// Revert to original Chinese content
function revertToOriginal() {
    // Just reload the page for a clean reversion to original content
    location.reload();
}

// Collect original content when page loads
document.addEventListener('DOMContentLoaded', collectOriginalContent);

// Extend DOMContentLoaded handler to fully initialize translation system
document.addEventListener('DOMContentLoaded', function() {
    // ... keep existing implementation ...
    
    // Add additional initialization if needed
    // Listen for custom events that might signal content changes
    document.addEventListener('contentChanged', function() {
        if (document.documentElement.getAttribute('lang') === 'en') {
            translateDynamicContent();
        }
    });
    
    // Optional: Add translation capability to window object
    window.translateUI = function(toLang) {
        if (toLang === 'en') {
            document.documentElement.setAttribute('lang', 'en');
            applyTranslations();
        } else {
            document.documentElement.setAttribute('lang', 'zh');
            revertToOriginal();
        }
    };
});