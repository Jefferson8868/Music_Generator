/**
 * 中国传统色彩音乐生成器
 * 历史页面功能 JS
 */

// Initialize chart.js radar chart
let wuxingRadarChart = null;

// Constants
const MAX_HISTORY_DISPLAY = 10;
const MAX_STYLES_DISPLAY = 5;

// Load user data from localStorage
function loadUserData() {
    // Check if we have data in the new format
    const combinedData = localStorage.getItem('colorHistoryData');
    if (combinedData) {
        return JSON.parse(combinedData);
    }
    
    // If not, try to load from the original separate keys
    return {
        records: JSON.parse(localStorage.getItem('userRecords') || '[]'),
        wuxingPreference: JSON.parse(localStorage.getItem('wuxingPreference') || '{"木":0,"火":0,"土":0,"金":0,"水":0}'),
        styleFrequency: JSON.parse(localStorage.getItem('styleFrequency') || '{}')
    };
}

// Save user data to localStorage
function saveUserData(data) {
    // Save to combined format
    localStorage.setItem('colorHistoryData', JSON.stringify(data));
    
    // Also save to individual keys for backward compatibility
    localStorage.setItem('userRecords', JSON.stringify(data.records));
    localStorage.setItem('wuxingPreference', JSON.stringify(data.wuxingPreference));
    localStorage.setItem('styleFrequency', JSON.stringify(data.styleFrequency));
}

// Add a test color record (for testing)
function addTestColorRecord() {
    const userData = loadUserData();
    
    // Create a sample color record
    const newRecord = {
        color: '#c04851',        // Hex color code for the dot
        colorName: '赤',          // Display name
        wuxing: '火',            // Wuxing type
        timestamp: new Date().toISOString()
    };
    
    // Add to records
    userData.records.push(newRecord);
    
    // Update wuxing preference
    userData.wuxingPreference['火'] = (userData.wuxingPreference['火'] || 0) + 1;
    
    // Update style frequency
    const styleType = '深沉内敛';
    userData.styleFrequency[styleType] = (userData.styleFrequency[styleType] || 0) + 1;
    
    // Save data
    saveUserData(userData);
    
    // Refresh displays
    updateColorHistoryDisplay();
    updateWuxingRadarChart();
    updateStyleInsightDisplay();
    
    console.log('Test color record added successfully');
    
    // Show feedback to user
    const testMessage = document.createElement('div');
    testMessage.className = 'test-message';
    testMessage.textContent = '✓ 测试数据已添加';
    testMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(76, 175, 80, 0.9); color: white; padding: 10px 15px; border-radius: 4px; z-index: 1000; animation: fadeOut 2s forwards 1s;';
    
    // Add animation style
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; visibility: hidden; }
        }
    `;
    document.head.appendChild(styleElement);
    document.body.appendChild(testMessage);
    
    // Remove the message after animation completes
    setTimeout(() => {
        testMessage.remove();
    }, 3000);
}

// Format date string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update color history display
function updateColorHistoryDisplay() {
    const colorHistoryElement = document.getElementById('color-history');
    if (!colorHistoryElement) return;
    
    const userData = loadUserData();
    const records = userData.records || [];
    
    if (records.length === 0) {
        colorHistoryElement.innerHTML = '<li class="empty">暂无记录，快去选择颜色开始吧！</li>';
        return;
    }
    
    // Get the most recent 5 records
    const recentRecords = records.slice(-5).reverse();
    let html = '';
    
    // Add each color record to the list
    recentRecords.forEach(record => {
        // Format date
        const date = new Date(record.timestamp);
        const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        // Determine which property to use for the color name and dot color
        const colorName = record.colorName || '未命名颜色';
        const dotColor = record.color || '#cccccc';
        
        html += `
            <li>
                <span class="color-dot" style="background-color: ${dotColor}"></span>
                <span class="color-name">${colorName}</span>
                <span class="color-time">${formattedDate}</span>
            </li>
        `;
    });
    
    colorHistoryElement.innerHTML = html;
}

// Get relative time string (e.g., "3天前")
function getRelativeTimeString(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return `${diffDay}天前`;
    } else if (diffHour > 0) {
        return `${diffHour}小时前`;
    } else if (diffMin > 0) {
        return `${diffMin}分钟前`;
    } else {
        return '刚刚';
    }
}

// Initialize all charts and visual elements
function initCharts() {
    updateWuxingRadarChart();
    updateStyleInsightDisplay();
}

// Update the Wuxing radar chart with user preference data
function updateWuxingRadarChart() {
    const userData = loadUserData();
    if (!userData || !userData.wuxingPreference) {
        document.getElementById('wuXingRadarChart').style.display = 'none';
        document.getElementById('wuXingRadarPlaceholder').style.display = 'block';
        return;
    }
    
    const wuxingValues = [
        userData.wuxingPreference['木'] || 0,
        userData.wuxingPreference['火'] || 0,
        userData.wuxingPreference['土'] || 0,
        userData.wuxingPreference['金'] || 0,
        userData.wuxingPreference['水'] || 0
    ];
    
    const maxValue = Math.max(...wuxingValues);
    if (maxValue === 0) {
        document.getElementById('wuXingRadarChart').style.display = 'none';
        document.getElementById('wuXingRadarPlaceholder').style.display = 'block';
        return;
    }
    
    document.getElementById('wuXingRadarChart').style.display = 'block';
    document.getElementById('wuXingRadarPlaceholder').style.display = 'none';
    
    const ctx = document.getElementById('wuXingRadarChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.wuxingChart) {
        window.wuxingChart.destroy();
    }
    
    window.wuxingChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['木', '火', '土', '金', '水'],
            datasets: [{
                label: '五行偏好',
                data: wuxingValues,
                backgroundColor: 'rgba(181, 111, 74, 0.2)',
                borderColor: 'rgba(181, 111, 74, 0.7)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(181, 111, 74, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(181, 111, 74, 1)'
            }]
        },
        options: {
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: Math.ceil(maxValue * 1.2),
                    stepSize: Math.ceil(maxValue / 5)
                }
            },
            elements: {
                line: {
                    tension: 0.1
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Update the style insight display based on user data
function updateStyleInsightDisplay() {
    const container = document.getElementById('emotion-insight-container');
    if (!container) return;
    
    const userData = loadUserData();
    if (!userData || !userData.styleFrequency || Object.keys(userData.styleFrequency).length === 0) {
        container.innerHTML = '<p class="empty">暂无风格分析结果，快去选择颜色生成歌曲吧！</p>';
        return;
    }
    
    // Sort styles by frequency
    const sortedStyles = Object.entries(userData.styleFrequency)
        .sort((a, b) => b[1] - a[1]);
    
    if (sortedStyles.length === 0) {
        container.innerHTML = '<p class="empty">暂无风格分析结果，快去选择颜色生成歌曲吧！</p>';
        return;
    }
    
    // Create style tags HTML
    let styleTagsHTML = '<div class="style-tags-container">';
    sortedStyles.forEach(([style, count]) => {
        const fontSize = 12 + (count / sortedStyles[0][1] * 6);
        const opacity = 0.4 + (count / sortedStyles[0][1] * 0.6);
        
        styleTagsHTML += `
            <span class="style-tag" style="font-size: ${fontSize}px; opacity: ${opacity};">
                ${style} <small class="style-count">${count}</small>
            </span>
        `;
    });
    styleTagsHTML += '</div>';
    
    // Add insight text about top styles
    const topStyles = sortedStyles.slice(0, 3).map(s => s[0]);
    const insightText = `
        <p class="style-insight">
            您偏爱的音乐风格：<strong>${topStyles.join('、')}</strong>
        </p>
    `;
    
    container.innerHTML = insightText + styleTagsHTML;
}

// Get ChatGPT recommendation based on user's style preferences
async function getAIRecommendation() {
    const recommendationSection = document.getElementById('ai-recommendation');
    if (!recommendationSection) return;

    recommendationSection.innerHTML = '<div class="loader"></div>';

    try {
        // Check if API key is set
        if (!CONFIG || !CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
            showApiConfigurationNeeded(recommendationSection);
            return;
        }

        // Load user data
        const userData = loadUserData();
        if (!userData || !userData.wuxingPreference || !userData.styleFrequency) {
            recommendationSection.innerHTML = '<div class="ai-recommendation-content ai-recommendation-warning">尚未收集足够的数据生成推荐。请尝试选择更多颜色。</div>';
            return;
        }

        // Prepare user preferences for the prompt
        const dominantWuxing = getDominantWuxing(userData.wuxingPreference);
        const sortedStyles = sortStylesByFrequency(userData.styleFrequency);
        const recentColors = getRecentColors(5);
        
        if (!dominantWuxing || !sortedStyles || sortedStyles.length === 0) {
            recommendationSection.innerHTML = '<div class="ai-recommendation-content ai-recommendation-warning">尚未收集足够的数据生成推荐。请尝试选择更多颜色。</div>';
            return;
        }

        recommendationSection.innerHTML = '<div class="ai-recommendation-content">正在生成AI推荐，请稍候...</div>';

        const response = await callOpenAiApi(dominantWuxing, sortedStyles, recentColors);
        displayAiResponse(response, recommendationSection);
    } catch (error) {
        handleApiError(error, recommendationSection);
    }
}

function showApiConfigurationNeeded(container) {
    container.innerHTML = `
        <div class="ai-recommendation-content ai-recommendation-warning">
            <p>需要设置OpenAI API密钥才能使用AI推荐功能。</p>
            <p>请点击"配置API"按钮并按照说明操作。</p>
        </div>
    `;
}

async function callOpenAiApi(dominantWuxing, sortedStyles, recentColors) {
    const prompt = constructPrompt(dominantWuxing, sortedStyles, recentColors);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: '你是一位中国传统音乐和现代音乐的专家，擅长基于五行和颜色偏好进行音乐推荐。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: CONFIG.API_CONFIG.temperature,
            max_tokens: CONFIG.API_CONFIG.max_tokens
        })
    });

    if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function constructPrompt(dominantWuxing, sortedStyles, recentColors) {
    const colorInfo = recentColors.map(record => 
        `${record.colorName}（${record.color}）属于${record.wuxing}`
    ).join('，');

    return `
请根据用户的五行和音乐风格偏好，推荐适合的音乐和艺术家。

用户的五行偏好：主要为${dominantWuxing}。
用户的音乐风格偏好：${sortedStyles.slice(0, 3).join('、')}。
用户最近选择的颜色：${colorInfo}。

请提供以下内容（用中文回答）：
1. 分析：基于用户五行偏好的简短分析（3-4句话）
2. 歌曲推荐：5首最适合用户的歌曲（包括歌名和艺术家）
3. 艺术家推荐：3位最适合用户的艺术家
4. 解释：为什么这些推荐适合用户（2-3句话）

回答需要组织成以下格式：
{
  "analysis": "你的分析...",
  "songRecommendations": [
    {"title": "歌曲1", "artist": "艺术家1"},
    {"title": "歌曲2", "artist": "艺术家2"},
    ...
  ],
  "artistRecommendations": ["艺术家1", "艺术家2", "艺术家3"],
  "explanation": "你的解释..."
}
`;
}

function handleApiError(error, container) {
    console.error('API Error:', error);
    
    if (error.status === 429) {
        container.innerHTML = `
            <div class="ai-recommendation-content ai-recommendation-error">
                <p>OpenAI API 请求过于频繁（429 Too Many Requests）。</p>
                <p>请稍后再试或查看 <a href="https://help.openai.com/en/articles/6891831-rate-limit-error-guide" target="_blank">OpenAI 帮助文档</a>。</p>
                <p>正在使用模拟推荐作为替代...</p>
            </div>
        `;
        
        // Use simulated response as fallback
        setTimeout(() => {
            const userData = loadUserData();
            if (userData && userData.wuxingPreference) {
                const dominantWuxing = getDominantWuxing(userData.wuxingPreference);
                const sortedStyles = sortStylesByFrequency(userData.styleFrequency || {});
                const simulatedResponse = getSimulatedResponse(dominantWuxing, sortedStyles);
                displayAiResponse(simulatedResponse, container);
            }
        }, 1500);
    } else {
        container.innerHTML = `
            <div class="ai-recommendation-content ai-recommendation-error">
                <p>获取AI推荐时出错：${error.message || '未知错误'}</p>
                <p>正在使用模拟推荐作为替代...</p>
            </div>
        `;
        
        // Use simulated response as fallback for other errors too
        setTimeout(() => {
            const userData = loadUserData();
            if (userData && userData.wuxingPreference) {
                const dominantWuxing = getDominantWuxing(userData.wuxingPreference);
                const sortedStyles = sortStylesByFrequency(userData.styleFrequency || {});
                const simulatedResponse = getSimulatedResponse(dominantWuxing, sortedStyles);
                displayAiResponse(simulatedResponse, container);
            }
        }, 1500);
    }
}

function displayAiResponse(responseText, container) {
    try {
        // Try to parse as JSON first
        let responseData;
        try {
            // Check if response is already a string representation of JSON
            responseData = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
        } catch (e) {
            // If parsing fails, try to extract JSON from the text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                responseData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("无法解析响应");
            }
        }

        const { analysis, songRecommendations, artistRecommendations, explanation } = responseData;

        let html = '<div class="ai-recommendation-content">';
        
        // Analysis
        html += `<div class="ai-recommendation-analysis">
            <h4>五行音乐分析</h4>
            <p>${analysis}</p>
        </div>`;
        
        // Songs
        html += '<div class="ai-recommendation-suggestions">';
        html += '<h4>推荐歌曲</h4><ul>';
        songRecommendations.forEach(song => {
            html += `<li><strong>${song.title}</strong> - ${song.artist}</li>`;
        });
        html += '</ul>';
        
        // Artists
        html += '<h4>推荐艺术家</h4><ul>';
        artistRecommendations.forEach(artist => {
            html += `<li>${artist}</li>`;
        });
        html += '</ul></div>';
        
        // Explanation
        html += `<div class="ai-recommendation-explanation">
            <h4>推荐理由</h4>
            <p>${explanation}</p>
        </div>`;
        
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        container.innerHTML = `
            <div class="ai-recommendation-content ai-recommendation-error">
                <p>解析AI响应时出错。使用备选推荐：</p>
            </div>
        `;
        
        // Fall back to simulated response
        setTimeout(() => {
            const userData = loadUserData();
            if (userData && userData.wuxingPreference) {
                const dominantWuxing = getDominantWuxing(userData.wuxingPreference);
                const sortedStyles = sortStylesByFrequency(userData.styleFrequency || {});
                const simulatedResponse = getSimulatedResponse(dominantWuxing, sortedStyles);
                displayAiResponse(simulatedResponse, container);
            }
        }, 1000);
    }
}

// Utility functions for recommendations
function getDominantWuxing(wuxingPreference) {
    return Object.entries(wuxingPreference)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function sortStylesByFrequency(styleFrequency) {
    return Object.entries(styleFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
}

function getRecentColors(count) {
    const userData = loadUserData();
    return (userData.records || []).slice(-count);
}

// Fallback function to get simulated AI responses if API call fails
function getSimulatedResponse(dominantWuxing, sortedStyles) {
    const recommendations = {
        '木': {
            analysis: '您偏好五行属木的颜色，与生长、发展和活力相关。这表明您喜欢具有生命力和自然感的音乐，追求富有创意和表现力的艺术形式。木属性的特质反映了您对富有层次感、有机发展的音乐的偏好。',
            songRecommendations: [
                {title: '青花瓷', artist: '周杰伦'},
                {title: '山阴路的夏天', artist: '李志'},
                {title: '夜空中最亮的星', artist: '逃跑计划'},
                {title: '斑马斑马', artist: '宋冬野'},
                {title: '理想三旬', artist: '陈鸿宇'}
            ],
            artistRecommendations: ['林海', '宗次郎', '陈鸿宇'],
            explanation: '这些艺术家和作品富有诗意和表现力，音乐充满自然流动感和生命力，能够满足您对富有创造性、有机发展的音乐的偏好。'
        },
        '火': {
            analysis: '您偏好五行属火的颜色，与热情、活力和变化相关。这表明您喜欢富有激情和能量的音乐，追求直接、强烈的情感表达。火属性的特质反映了您对节奏鲜明、情感强烈的音乐的偏好。',
            songRecommendations: [
                {title: '倔强', artist: '五月天'},
                {title: '光辉岁月', artist: 'Beyond'},
                {title: '夜的第七章', artist: '周杰伦'},
                {title: '春娇与志明', artist: 'Eason陈奕迅'},
                {title: '起风了', artist: '买辣椒也用券'}
            ],
            artistRecommendations: ['Beyond', '五月天', '周杰伦'],
            explanation: '这些艺术家和作品充满热情和能量，节奏强劲，情感表达直接而有力，能够满足您对激情四溢、充满动力的音乐的偏好。'
        },
        '土': {
            analysis: '您偏好五行属土的颜色，与稳定、厚重和传统相关。这表明您喜欢传统、稳定且有文化底蕴的音乐，追求有根基、有厚度的艺术形式。土属性的特质反映了您对民族特色鲜明、传统韵味浓厚的音乐的偏好。',
            songRecommendations: [
                {title: '悟空', artist: '戴荃'},
                {title: '万疆', artist: '李玉刚'},
                {title: '茉莉花', artist: '宋祖英'},
                {title: '敕勒歌', artist: '腾格尔'},
                {title: '但愿人长久', artist: '王菲'}
            ],
            artistRecommendations: ['宋祖英', '李玉刚', '腾格尔'],
            explanation: '这些艺术家和作品带有浓厚的传统文化色彩，音乐根基扎实，风格稳重，能够满足您对具有文化底蕴、传统韵味的音乐的偏好。'
        },
        '金': {
            analysis: '您偏好五行属金的颜色，与清晰、果断和精致相关。这表明您喜欢优雅、精致且结构清晰的音乐，追求精工细作、有条理的艺术形式。金属性的特质反映了您对清亮、优美、有质感的音乐的偏好。',
            songRecommendations: [
                {title: '梦中的婚礼', artist: '理查德·克莱德曼'},
                {title: '月光奏鸣曲', artist: '郎朗'},
                {title: '星空', artist: '久石让'},
                {title: '一千年以后', artist: '林俊杰'},
                {title: '琵琶语', artist: '林海'}
            ],
            artistRecommendations: ['郎朗', '久石让', '林俊杰'],
            explanation: '这些艺术家和作品精致优雅，结构严谨，音质清亮，能够满足您对精工细作、优美动听的音乐的偏好。'
        },
        '水': {
            analysis: '您偏好五行属水的颜色，与流动、深沉和变化相关。这表明您喜欢流畅、深邃且富有层次的音乐，追求意境深远、情感丰富的艺术形式。水属性的特质反映了您对流动、多变、有深度的音乐的偏好。',
            songRecommendations: [
                {title: '雨天', artist: '孙燕姿'},
                {title: '雨的印记', artist: '邓丽君'},
                {title: '渔舟唱晚', artist: '喜多郎'},
                {title: '蓝莲花', artist: '许巍'},
                {title: '南山南', artist: '马頔'}
            ],
            artistRecommendations: ['喜多郎', '许巍', '孙燕姿'],
            explanation: '这些艺术家和作品意境深远，情感流动，富有层次感，能够满足您对深邃、变化多端、富有意境的音乐的偏好。'
        }
    };
    
    return recommendations[dominantWuxing] || recommendations['木'];
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('History Page initializing...');
    
    // Initialize history display
    updateColorHistoryDisplay();
    initCharts();
    
    // Add event listeners
    const recommendBtn = document.getElementById('get-recommendation-btn');
    if (recommendBtn) {
        recommendBtn.addEventListener('click', function() {
            getAIRecommendation();
        });
    }
    
    // Setup double-click debug feature
    const header = document.querySelector('.app-header');
    if (header) {
        header.addEventListener('dblclick', addTestColorRecord);
    }
    
    // API Configuration Modal
    const configApiBtn = document.getElementById('configure-api-btn');
    const apiConfigModal = document.getElementById('api-config-modal');
    const modalClose = document.getElementById('modal-close');
    const modalUnderstand = document.getElementById('modal-understand');
    
    if (configApiBtn) {
        configApiBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (apiConfigModal) {
                apiConfigModal.classList.add('show');
            }
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            apiConfigModal.classList.remove('show');
        });
    }
    
    if (modalUnderstand) {
        modalUnderstand.addEventListener('click', function() {
            apiConfigModal.classList.remove('show');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === apiConfigModal) {
            apiConfigModal.classList.remove('show');
        }
    });
    
    console.log('History Page initialization complete.');
}); 