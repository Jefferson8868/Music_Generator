let wuxingData = [], currentWuxing = null, colorData = {};

// Initialize wuxing preference counters
const wuxingPreference = {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0
};

// Style frequency tracker for ChatGPT recommendations
const styleFrequency = {};

// Load saved data from localStorage
function loadUserData() {
    // Load wuxing preferences
    const savedPreferences = localStorage.getItem('wuxingPreference');
    if (savedPreferences) {
        Object.assign(wuxingPreference, JSON.parse(savedPreferences));
    }
    
    // Load style frequency data
    const savedStyles = localStorage.getItem('styleFrequency');
    if (savedStyles) {
        Object.assign(styleFrequency, JSON.parse(savedStyles));
    }
}

// Save user data to localStorage
function saveUserData() {
    // Save individual data pieces
    localStorage.setItem('wuxingPreference', JSON.stringify(wuxingPreference));
    localStorage.setItem('styleFrequency', JSON.stringify(styleFrequency));
    
    // Also save combined data for history page
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const userData = {
        records: records,
        wuxingPreference: wuxingPreference,
        styleFrequency: styleFrequency
    };
    localStorage.setItem('colorHistoryData', JSON.stringify(userData));
}

// Record color selection to localStorage
function recordColorSelection(colorName, colorHex, wuxingType) {
    const timestamp = new Date().toISOString();
    const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
    
    // Create the new record with the correct structure
    const newRecord = {
        color: colorHex,  // Store the hex color for the dot
        colorName: colorName,  // Store the name separately
        wuxing: wuxingType,
        timestamp: timestamp
    };
    
    // Add to records
    records.push(newRecord);
    
    // Limit records to last 20
    if (records.length > 20) {
        records.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('userRecords', JSON.stringify(records));
    
    // Also save to combined format for the history page
    const userData = {
        records: records,
        wuxingPreference: wuxingPreference,
        styleFrequency: styleFrequency
    };
    localStorage.setItem('colorHistoryData', JSON.stringify(userData));
}

// Load data on script initialization
loadUserData();

fetch('data/WuxingColorData.json')
    .then(res => res.json())
    .then(data => {
        wuxingData = data;
        // Build colorData object for youtube.js
        wuxingData.forEach(group => {
            group.colors.forEach(color => {
                colorData[color.Title] = {
                    Keywords: color.Keywords || [], // Ensure Keywords exist
                    Wuxing: group.wuxing,
                    Emotion: color.Emotion || '未知',
                    Description: color.Description || '无描述'
                };
            });
        });

        const grid = document.getElementById('color-grid');
        grid.innerHTML = '';
        data.forEach(group => {
            const section = document.createElement('div');
            section.className = 'wuxing-section';
            section.innerHTML = `<div class="wuxing-title">${group.color}色 (${group.wuxing})</div>`;
            const gridContainer = document.createElement('div');
            gridContainer.className = 'colors-grid';
            group.colors.forEach(color => {
                const item = document.createElement('div');
                item.className = 'color-item';
                const [r, g, b] = parseColor(color.Color);
                const displayColor = `rgb(${r},${g},${b})`;
                item.innerHTML = `<div class="color-option" style="background-color:${displayColor}" data-original-color="${color.Color}"></div><div class="color-name">${color.Title}</div>`;
                item.querySelector('.color-option').addEventListener('click', function() {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    document.getElementById('selected-color-name').textContent = color.Title;
                    document.getElementById('color-description').textContent = color.Description || '无描述';
                    const originalColor = this.dataset.originalColor;
                    const [r, g, b] = parseColor(originalColor);
                    document.body.style.backgroundColor = `rgba(${r},${g},${b},0.7)`;
                    const percentages = calcWuxing(r, g, b);
                    updateWuxingValues(percentages);
                    updateWuxing(group.wuxing, color.Title, color.Description);
                    currentWuxing = group;
                    currentWuxing.name = color.Title; // Add color name for YouTube search
                    
                    // Record the color selection to localStorage
                    recordColorSelection(color.Title, originalColor, group.wuxing);
                    
                    // Update wuxing preference count
                    wuxingPreference[group.wuxing] = (wuxingPreference[group.wuxing] || 0) + 1;
                    saveUserData();
                });
                gridContainer.appendChild(item);
            });
            section.appendChild(gridContainer);
            grid.appendChild(section);
        });
    })
    .catch(err => console.error('加载五行数据时出错:', err));

const setState = (el, html) => el && (el.innerHTML = html);

function parseColor(color) {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return [r, g, b];
        } else if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return [r, g, b];
        } else if (hex.length === 8) {
            const r = parseInt(hex.substring(2, 4), 16);
            const g = parseInt(hex.substring(4, 6), 16);
            const b = parseInt(hex.substring(6, 8), 16);
            return [r, g, b];
        }
    } else if (color.startsWith('rgb')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        }
    }
    return [0, 0, 0];
}

function getRGB(el) {
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (m) {
        return { r: +m[1], g: +m[2], b: +m[3] };
    } else if (bg.startsWith('#')) {
        const hex = bg.slice(1);
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return { r, g, b };
        } else if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        } else if (hex.length === 8) {
            const r = parseInt(hex.substring(2, 4), 16);
            const g = parseInt(hex.substring(4, 6), 16);
            const b = parseInt(hex.substring(6, 8), 16);
            return { r, g, b };
        }
    }
    return { r: 0, g: 0, b: 0 };
}

function updateWuxing(wuxing, name, desc) {
    const data = wuxingData.find(g => g.wuxing === wuxing);
    if (!data) return;
    document.querySelectorAll('.wuxing-element').forEach(el => el.classList.remove('active'));
    const [cont, attr, det] = ['wuxing-container', 'wuxing-attribute', 'wuxing-details'].map(id => document.getElementById(id));
    if (cont && attr && det) {
        attr.textContent = `此颜色属于${wuxing}行。${name}代表${desc || '无描述'}`;
        det.textContent = `五音：${data.yinYue} | 五脏：${data.zangFu} | 方位：${data.direction} | 季节：${data.season}`;
        const c = getWuxingColor(wuxing);
        cont.style.cssText = `background-color:rgba(${c},0.2);border-left:5px solid rgba(${c},0.8)`;
        attr.className = `wuxing-attribute wuxing-${wuxing.toLowerCase()}`;
    }
}

function getWuxingColor(wuxing) {
    return { 木: '83,136,90', 火: '224,93,68', 土: '241,196,15', 金: '255,255,255', 水: '0,0,0' }[wuxing] || '120,120,120';
}

function calcWuxing(r, g, b) {
    const benchmarks = {
        qing: [0, 174, 239],   // #00AEEF
        chi: [255, 0, 0],      // #FF0000
        huang: [255, 255, 0],  // #FFFF00
        bai: [255, 255, 255],  // #FFFFFF
        hei: [0, 0, 0]         // #000000
    };

    const distances = {};
    for (const color in benchmarks) {
        const [br, bg, bb] = benchmarks[color];
        distances[color] = Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2);
    }

    const similarities = {};
    let totalSimilarity = 0;
    for (const color in distances) {
        similarities[color] = 1 / (1 + distances[color]);
        totalSimilarity += similarities[color];
    }

    const percentages = {};
    for (const color in similarities) {
        percentages[color] = Math.round((similarities[color] / totalSimilarity) * 100);
    }

    const sum = Object.values(percentages).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
        const diff = 100 - sum;
        const maxColor = Object.keys(percentages).reduce((a, b) => percentages[a] > percentages[b] ? a : b);
        percentages[maxColor] += diff;
    }

    return percentages;
}

function updateWuxingValues(p) {
    ['qing', 'chi', 'huang', 'bai', 'hei'].forEach(k => {
        document.getElementById(`${k}-value`).textContent = p[k];
        const ind = document.querySelector(`.indicator-${k}`);
        if (ind) ind.style.opacity = 0.3 + (p[k] / 100) * 0.7;
    });
}

function displaySimilarMusic(musicList, containerSelector = '#related-music-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let html = `
        <div class="similar-music-title">五音相似音乐推荐</div>
        <div class="similar-music-list">
    `;

    musicList.forEach(music => {
        const displayName = music.file_name.replace(/\.mp3$/, '');
        const similarityPercent = Math.round(music.similarity * 100);
        const basicSimPercent = Math.round(music.basic_sim * 100);
        const toneSimPercent = Math.round(music.tone_sim * 100);
        const emotionSimPercent = Math.round(music.emotion_sim * 100);

        html += `
            <div class="similar-music-item">
                <div class="music-name">${displayName}</div>
                <div class="similarity-details">
                    <span class="similarity-score">综合相似度: ${similarityPercent}%</span>
                    <div class="similarity-breakdown">
                        <div>基本情感相似度: ${basicSimPercent}%</div>
                        <div>五音相似度: ${toneSimPercent}%</div>
                        <div>情绪特征相似度: ${emotionSimPercent}%</div>
                    </div>
                </div>
                <audio controls src="src/music_files/${music.file_name}"></audio>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.color-option').forEach(colorOption => {
        colorOption.addEventListener('click', () => {
            selectColor(colorOption);
        });
    });

    document.getElementById('generate-btn').addEventListener('click', async () => {
        const sel = document.querySelector('.color-option.selected');
        if (!sel) return alert('请先选择一个颜色');
        const rgb = getRGB(sel);
        const percentages = calcWuxing(rgb.r, rgb.g, rgb.b);
        updateWuxingValues(percentages);

        const out = document.getElementById('music-output');
        const rel = document.getElementById('related-music-container');
        const youtubeContainer = document.getElementById('youtube-container');
        setState(out, '<div class="generating-music"><div class="music-loading">生成音乐中...</div></div>');
        setState(rel, '<div class="generating-music"><div class="music-loading">搜索五音相似音乐中...</div></div>');

        try {
            if (currentWuxing) {
                const music = WuxingMusic.generateMusic(currentWuxing.wuxing);
                setState(out, `<div class="music-info"><div class="music-title">五行音乐 - ${currentWuxing.wuxing}行</div><div class="music-style">风格: ${music.style}</div><div class="music-style">速度: ${music.tempo} BPM</div><div class="music-controls"><button class="control-btn" id="stop-music">停止</button><button class="control-btn" id="replay-music">重放</button></div></div>`);
                document.getElementById('stop-music').addEventListener('click', () => WuxingMusic.stopMusic());
                document.getElementById('replay-music').addEventListener('click', () => { WuxingMusic.stopMusic(); WuxingMusic.generateMusic(currentWuxing.wuxing); });

                // Update style frequency for recommendations
                styleFrequency[music.style] = (styleFrequency[music.style] || 0) + 1;
                saveUserData();

                // Search YouTube videos
                if (currentWuxing.name) {
                    try {
                        console.log(`为颜色 "${currentWuxing.name}" 搜索相关视频`);
                        searchAndEmbedYouTubeMusic(currentWuxing.name);
                    } catch (ytError) {
                        console.error('YouTube搜索出错:', ytError);
                        setState(youtubeContainer, `<div class="error-message">搜索相关视频时出错: ${ytError.message}</div>`);
                    }
                } else {
                    setState(youtubeContainer, '<div class="error-message">无法搜索视频，颜色名称未定义</div>');
                }
            } else {
                setState(out, '<div class="error-message">无法生成音乐，请先选择一个颜色</div>');
                setState(youtubeContainer, '<div class="error-message">无法搜索视频，请先选择一个颜色</div>');
            }

            setState(rel, '<div class="generating-music"><div class="music-loading">搜索五音相似音乐中...</div></div>');

            const colorValues = [
                parseInt(document.getElementById('qing-value').textContent) || 0,
                parseInt(document.getElementById('chi-value').textContent) || 0,
                parseInt(document.getElementById('huang-value').textContent) || 0,
                parseInt(document.getElementById('bai-value').textContent) || 0,
                parseInt(document.getElementById('hei-value').textContent) || 0
            ];

            console.log('发送五色数值到API:', colorValues);

            try {
                const response = await fetch('http://localhost:5000/api/match-music', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ color_values: colorValues })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API响应错误 (${response.status}): ${errorData.error || '未知错误'}`);
                }

                const data = await response.json();

                if (data && data.similar_music && data.similar_music.length > 0) {
                    displaySimilarMusic(data.similar_music, '#related-music-container');
                } else {
                    setState(rel, '<div class="error-message">未找到相似音乐</div>');
                }
            } catch (apiError) {
                console.error('API调用失败:', apiError);
                setState(rel, `<div class="error-message">搜索相似音乐时出错: ${apiError.message}</div>`);
            }
        } catch (error) {
            console.error('生成音乐或搜索时出错:', error);
            setState(out, `<div class="error-message">生成音乐时出错: ${error.message}</div>`);
            setState(rel, `<div class="error-message">搜索相似音乐时出错: ${error.message}</div>`);
            setState(youtubeContainer, `<div class="error-message">搜索相关视频时出错: ${error.message}</div>`);
        }
    });
});

function selectColor(colorOption) {
    document.querySelectorAll('.color-option').forEach(op => {
        op.classList.remove('selected');
    });

    colorOption.classList.add('selected');

    const colorItem = colorOption.closest('.color-item');
    if (!colorItem) return;

    const colorName = colorItem.querySelector('.color-name').textContent;
    const colorInfo = getColorData(colorName);

    currentWuxing = {
        name: colorName,
        wuxing: colorInfo.wuxing,
        emotion: colorInfo.emotion
    };

    document.getElementById('selected-color-name').textContent = colorName;
    document.getElementById('color-description').textContent = colorInfo.description || '';

    document.getElementById('wuxing-attribute').textContent = 
        `此颜色五行属${colorInfo.wuxing}，对应情绪为"${colorInfo.emotion}"`;

    const wuxingDetailsMap = {
        '木': '五音：角 | 五脏：肝 | 方位：东 | 季节：春',
        '火': '五音：徵 | 五脏：心 | 方位：南 | 季节：夏',
        '土': '五音：宫 | 五脏：脾 | 方位：中 | 季节：四季末端',
        '金': '五音：商 | 五脏：肺 | 方位：西 | 季节：秋',
        '水': '五音：羽 | 五脏：肾 | 方位：北 | 季节：冬'
    };

    document.getElementById('wuxing-details').textContent = wuxingDetailsMap[colorInfo.wuxing] || '';

    updateBackgroundColor(colorInfo.wuxing);
}

function getColorData(colorName) {
    const defaultData = {
        wuxing: '木',
        emotion: '喜悦',
        description: '这是一种美丽的颜色，代表着...'
    };

    return colorData && colorData[colorName] ? {
        wuxing: colorData[colorName].Wuxing || defaultData.wuxing,
        emotion: colorData[colorName].Emotion || defaultData.emotion,
        description: colorData[colorName].Description || defaultData.description
    } : defaultData;
}

function updateBackgroundColor(wuxing) {
    const wuxingColors = {
        '木': '#33691E',
        '火': '#BF360C',
        '土': '#F9A825',
        '金': '#9E9E9E',
        '水': '#0D47A1'
    };

    const color = wuxingColors[wuxing] || '#6D4C41';
    document.body.style.backgroundColor = color;
}