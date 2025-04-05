// 全局变量，存储五行数据
let wuxingData = [];
let currentWuxing = null;

// 加载五行颜色数据
fetch('data/WuxingColorData.json')
    .then(response => response.json())
    .then(data => {
        // 保存五行数据到全局变量
        wuxingData = data;
        
        const colorGrid = document.getElementById('color-grid');
        colorGrid.innerHTML = ''; // 清空现有内容
        
        // 为每个五行元素创建一个分组
        data.forEach(wuxingGroup => {
            // 创建五行分组容器
            const wuxingContainer = document.createElement('div');
            wuxingContainer.className = 'wuxing-container';
            wuxingContainer.dataset.wuxing = wuxingGroup.wuxing;
            
            // 创建五行分组标题
            const wuxingHeader = document.createElement('div');
            wuxingHeader.className = 'wuxing-header';
            wuxingHeader.innerHTML = `
                <div class="wuxing-title">${wuxingGroup.color}色 (${wuxingGroup.wuxing})</div>
            `;
            wuxingContainer.appendChild(wuxingHeader);
            
            // 创建颜色列表容器 - 竖向滚动
            const colorsList = document.createElement('div');
            colorsList.className = 'colors-list';
            wuxingContainer.appendChild(colorsList);
            
            // 对颜色按亮度排序（从浅到深）
            const sortedColors = [...wuxingGroup.colors].sort((a, b) => {
                // 提取RGB值
                const getColorBrightness = (colorHex) => {
                    const colorValue = colorHex.startsWith('#') ? colorHex : '#' + colorHex.substring(2);
                    const r = parseInt(colorValue.substring(1, 3), 16);
                    const g = parseInt(colorValue.substring(3, 5), 16);
                    const b = parseInt(colorValue.substring(5, 7), 16);
                    // 计算亮度 (感知亮度公式: 0.299*R + 0.587*G + 0.114*B)
                    return 0.299 * r + 0.587 * g + 0.114 * b;
                };
                
                const aBrightness = getColorBrightness(a.Color);
                const bBrightness = getColorBrightness(b.Color);
                
                // 降序排列（从浅到深）
                return bBrightness - aBrightness;
            });
            
            // 添加颜色选项
            sortedColors.forEach(color => {
                // 创建颜色选项元素
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                
                // 设置背景颜色 - 确保正确显示颜色
                const colorValue = color.Color.startsWith('#') ? color.Color : '#' + color.Color.substring(2);
                colorOption.style.backgroundColor = colorValue;
                
                // 创建颜色名称元素
                const colorName = document.createElement('div');
                colorName.className = 'color-name';
                colorName.textContent = color.Title;
                
                // 创建颜色项容器
                const colorItem = document.createElement('div');
                colorItem.className = 'color-item';
                colorItem.appendChild(colorOption);
                colorItem.appendChild(colorName);
                
                // 设置点击事件
                colorOption.addEventListener('click', function() {
                    // 移除其他颜色的选择状态
                    document.querySelectorAll('.color-option').forEach(option => {
                        option.classList.remove('selected');
                    });
                    
                    // 添加选择状态
                    this.classList.add('selected');
                    
                    // 更新选中的颜色信息
                    document.getElementById('selected-color-name').textContent = color.Title;
                    
                    // 更新色彩描述
                    document.getElementById('color-description').textContent = color.Description || "无描述";
                    
                    // 更新页面背景颜色 - 增加透明度使颜色更明显
                    document.body.style.backgroundColor = `rgba(${getRGBString(colorValue)}, 0.3)`;
                    
                    // 计算并更新五行占比
                    const rgb = getRGBFromColorOption(this);
                    const wuxingPercentages = calculateWuxingPercentages(rgb.r, rgb.g, rgb.b);
                    updateWuxingColorValues(wuxingPercentages);
                    
                    // 更新五行属性信息
                    updateWuxingElements(wuxingGroup.wuxing, color.Title, color.Description);
                    
                    // 更新当前五行
                    currentWuxing = wuxingGroup;
                });
                
                // 添加到容器
                colorsList.appendChild(colorItem);
            });
            
            // 添加五行容器到网格
            colorGrid.appendChild(wuxingContainer);
        });
    })
    .catch(error => console.error('加载五行数据时出错:', error));

// 辅助函数：将颜色值转换为RGB字符串
function getRGBString(color) {
    // 如果是十六进制颜色
    if (color.startsWith('#')) {
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }
    
    // 如果已经是rgb格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
    }
    
    return '255, 255, 255'; // 默认白色
}

// 更新五行信息
function updateWuxingInfo(wuxingGroup) {
    const wuxingAttribute = document.getElementById('wuxing-attribute');
    const wuxingDetails = document.getElementById('wuxing-details');
    
    if (wuxingAttribute && wuxingDetails && wuxingGroup) {
        // 设置五行属性文本
        wuxingAttribute.textContent = `此颜色属于${wuxingGroup.wuxing}行。${wuxingGroup.color}色代表${wuxingGroup.description}`;
        
        // 设置五行详细信息
        wuxingDetails.textContent = `五音：${wuxingGroup.yinYue} | 五脏：${wuxingGroup.zangFu} | 方位：${wuxingGroup.direction} | 季节：${wuxingGroup.season}`;
        
        // 添加相应的类名
        wuxingAttribute.className = `wuxing-attribute wuxing-${wuxingGroup.wuxing.toLowerCase()}`;
    }
}

// 根据颜色获取情感信息并搜索相关音乐
async function getColorEmotionAndSearchMusic(r, g, b) {
    try {
        // 计算五行颜色占比
        const wuxingPercentages = calculateWuxingPercentages(r, g, b);
        
        // 显示颜色值
        updateWuxingColorValues(wuxingPercentages);
        
        // 如果有当前五行，根据五行和颜色值搜索相关音乐
        if (currentWuxing) {
            return await searchRelatedMusic(currentWuxing, wuxingPercentages);
        }
        
        return null;
    } catch (error) {
        console.error('获取颜色情感和相关音乐时出错:', error);
        return null;
    }
}

// 搜索相关音乐
async function searchRelatedMusic(wuxingElement, wuxingPercentages) {
    try {
        // 使用音乐匹配器找到相似音乐
        const similarMusic = await MusicMatcher.findSimilarMusic(wuxingElement, wuxingPercentages);
        
        // 如果找到相似音乐，显示它们
        if (similarMusic && similarMusic.length > 0) {
            // 显示相似音乐
            MusicMatcher.displaySimilarMusic(similarMusic, '#related-music-container');
            return similarMusic;
        }
        
        return null;
    } catch (error) {
        console.error('搜索相关音乐时出错:', error);
        return null;
    }
}

// 更新情绪显示
function updateEmotionDisplay(emotion) {
    const emotionContainer = createEmotionContainer();
    
    if (!emotion) {
        emotionContainer.innerHTML = '<div class="emotion-title">无法获取情绪信息</div>';
        return;
    }
    
    emotionContainer.innerHTML = `
        <div class="emotion-title">色彩情绪分析</div>
        <div class="emotion-name">${emotion.primary}</div>
        <div class="emotion-keywords">${emotion.keywords.join(' · ')}</div>
        <div class="emotion-music-styles">推荐音乐风格: ${emotion.musicStyles.join(', ')}</div>
    `;
}

// 创建情绪容器
function createEmotionContainer() {
    let emotionContainer = document.querySelector('.emotion-container');
    
    if (!emotionContainer) {
        emotionContainer = document.createElement('div');
        emotionContainer.className = 'emotion-container';
        
        // 找到放置情绪容器的位置
        const sidebarOrOutput = document.querySelector('.sidebar') || document.getElementById('music-output');
        if (sidebarOrOutput) {
            sidebarOrOutput.appendChild(emotionContainer);
        }
    }
    
    return emotionContainer;
}

/**
 * 计算五行颜色百分比
 * 根据RGB值计算青(木)、赤(火)、黄(土)、白(金)、黑(水)五种颜色的百分比
 * @param {number} r - 红色通道值 (0-255)
 * @param {number} g - 绿色通道值 (0-255)
 * @param {number} b - 蓝色通道值 (0-255)
 * @returns {Object} 包含五行颜色百分比的对象
 */
function calculateWuxingPercentages(r, g, b) {
    // 将RGB值归一化到0-1范围
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    // 获取HSV值
    const hsv = rgbToHsv(normalizedR, normalizedG, normalizedB);
    const h = hsv.h; // 色相 (0-360)
    const s = hsv.s; // 饱和度 (0-1)
    const v = hsv.v; // 明度 (0-1)
    
    console.log(`计算颜色占比 - RGB: (${r}, ${g}, ${b}), HSV: (${h}, ${s.toFixed(2)}, ${v.toFixed(2)})`);
    
    // 初始化颜色贡献度
    let qingContribution = 0; // 青(木)
    let chiContribution = 0;  // 赤(火)
    let huangContribution = 0; // 黄(土)
    let baiContribution = 0;  // 白(金)
    let heiContribution = 0;  // 黑(水)
    
    // 基于色相的贡献度计算
    // 青色(木) - 主要在绿色区域 (90-150度)
    if (h >= 90 && h <= 150) {
        qingContribution += (1 - Math.min(Math.abs(h - 120) / 30, 1)) * s * v * 3;
    }
    
    // 赤色(火) - 主要在红色区域 (0-30度 或 330-360度)
    if ((h >= 0 && h <= 30) || (h >= 330 && h <= 360)) {
        const hAdjusted = h > 180 ? 360 - h : h;
        chiContribution += (1 - Math.min(Math.abs(hAdjusted - 0) / 30, 1)) * s * v * 3;
    }
    
    // 黄色(土) - 主要在黄色区域 (30-90度)
    if (h >= 30 && h <= 90) {
        huangContribution += (1 - Math.min(Math.abs(h - 60) / 30, 1)) * s * v * 3;
    }
    
    // 白色(金) - 高明度低饱和度
    baiContribution += (1 - s) * v * 2;
    
    // 黑色(水) - 低明度
    heiContribution += (1 - v) * 2;
    
    // 加入混合贡献
    // 青赤混合区 (紫色区域 270-330)
    if (h > 270 && h < 330) {
        const mixFactor = 1 - Math.min(Math.abs(h - 300) / 30, 1);
        qingContribution += mixFactor * s * v * 0.6;
        chiContribution += mixFactor * s * v * 0.6;
    }
    
    // 青黄混合区 (青黄色区域 75-105)
    if (h > 75 && h < 105) {
        const mixFactor = 1 - Math.min(Math.abs(h - 90) / 15, 1);
        qingContribution += mixFactor * s * v * 0.4;
        huangContribution += mixFactor * s * v * 0.4;
    }
    
    // 黄赤混合区 (橙色区域 15-45)
    if (h > 15 && h < 45) {
        const mixFactor = 1 - Math.min(Math.abs(h - 30) / 15, 1);
        huangContribution += mixFactor * s * v * 0.4;
        chiContribution += mixFactor * s * v * 0.4;
    }
    
    // 根据饱和度和明度调整
    // 低饱和度颜色倾向于白
    if (s < 0.3) {
        baiContribution += (0.3 - s) * 2.5;
    }
    
    // 低明度颜色倾向于黑
    if (v < 0.3) {
        heiContribution += (0.3 - v) * 2.5;
    }
    
    // 调整贡献度，使总和为1
    const totalContribution = qingContribution + chiContribution + huangContribution + baiContribution + heiContribution;
    
    // 防止除以零
    if (totalContribution <= 0) {
        console.warn('颜色贡献度总和为零，使用默认值');
        return { qing: 20, chi: 20, huang: 20, bai: 20, hei: 20 };
    }
    
    // 归一化各个贡献度
    qingContribution = qingContribution / totalContribution;
    chiContribution = chiContribution / totalContribution;
    huangContribution = huangContribution / totalContribution;
    baiContribution = baiContribution / totalContribution;
    heiContribution = heiContribution / totalContribution;
    
    // 转换为百分比
    const qingPercent = Math.round(qingContribution * 100);
    const chiPercent = Math.round(chiContribution * 100);
    const huangPercent = Math.round(huangContribution * 100);
    const baiPercent = Math.round(baiContribution * 100);
    const heiPercent = Math.round(heiContribution * 100);
    
    // 调整百分比，确保总和为100
    let total = qingPercent + chiPercent + huangPercent + baiPercent + heiPercent;
    let adjustment = 100 - total;
    
    // 创建结果对象
    let result = { 
        qing: qingPercent, 
        chi: chiPercent, 
        huang: huangPercent, 
        bai: baiPercent, 
        hei: heiPercent 
    };
    
    // 如果需要调整，将差值添加到最大的贡献度
    if (adjustment !== 0) {
        // 找出最大值
        const max = Math.max(qingPercent, chiPercent, huangPercent, baiPercent, heiPercent);
        
        if (max === qingPercent) result.qing += adjustment;
        else if (max === chiPercent) result.chi += adjustment;
        else if (max === huangPercent) result.huang += adjustment;
        else if (max === baiPercent) result.bai += adjustment;
        else result.hei += adjustment;
    }
    
    console.log(`颜色占比结果: 青=${result.qing}%, 赤=${result.chi}%, 黄=${result.huang}%, 白=${result.bai}%, 黑=${result.hei}%`);
    
    return result;
}

// 更新五行颜色值的显示
function updateWuxingColorValues(percentages) {
    document.getElementById('qing-value').textContent = percentages.qing;
    document.getElementById('chi-value').textContent = percentages.chi;
    document.getElementById('huang-value').textContent = percentages.huang;
    document.getElementById('bai-value').textContent = percentages.bai;
    document.getElementById('hei-value').textContent = percentages.hei;
    
    // 更新颜色指示器的背景色透明度，使其反映百分比
    const qingIndicator = document.querySelector('.indicator-qing');
    const chiIndicator = document.querySelector('.indicator-chi');
    const huangIndicator = document.querySelector('.indicator-huang');
    const baiIndicator = document.querySelector('.indicator-bai');
    const heiIndicator = document.querySelector('.indicator-hei');
    
    if (qingIndicator) qingIndicator.style.opacity = 0.3 + (percentages.qing / 100) * 0.7;
    if (chiIndicator) chiIndicator.style.opacity = 0.3 + (percentages.chi / 100) * 0.7;
    if (huangIndicator) huangIndicator.style.opacity = 0.3 + (percentages.huang / 100) * 0.7;
    if (baiIndicator) baiIndicator.style.opacity = 0.3 + (percentages.bai / 100) * 0.7;
    if (heiIndicator) heiIndicator.style.opacity = 0.3 + (percentages.hei / 100) * 0.7;
}

// RGB转HSV
function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h, s, v;
    
    // 计算色相
    if (delta === 0) {
        h = 0; // 无色相
    } else if (max === r) {
        h = ((g - b) / delta) % 6;
    } else if (max === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    // 计算饱和度
    s = max === 0 ? 0 : delta / max;
    
    // 计算明度
    v = max;
    
    return { h, s, v };
}

// 从颜色选项元素获取RGB值
function getRGBFromColorOption(colorOption) {
    const style = getComputedStyle(colorOption);
    const backgroundColor = style.backgroundColor;
    
    // 解析背景颜色
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10)
        };
    }
    
    // 如果使用的是十六进制颜色
    if (backgroundColor.startsWith('#')) {
        const hex = backgroundColor.substring(1);
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
    
    // 默认值
    return { r: 0, g: 0, b: 0 };
}

// 查找五行数据
function findWuxingData(wuxingName) {
    return wuxingData.find(group => group.wuxing === wuxingName);
}

// 更新五行元素信息
function updateWuxingElements(wuxingElement, colorName, description) {
    // 获取五行数据
    const wuxingData = findWuxingData(wuxingElement);
    if (!wuxingData) return;
    
    // 清除旧的高亮
    document.querySelectorAll('.wuxing-element').forEach(element => {
        element.classList.remove('active');
    });
    
    // 更新五行属性区域
    const wuxingContainer = document.getElementById('wuxing-container');
    const wuxingAttribute = document.getElementById('wuxing-attribute');
    const wuxingDetails = document.getElementById('wuxing-details');
    
    if (wuxingContainer && wuxingAttribute && wuxingDetails) {
        // 设置五行属性文本
        wuxingAttribute.textContent = `此颜色属于${wuxingElement}行。${colorName}代表${description || '无描述'}`;
        
        // 设置五行详细信息
        wuxingDetails.textContent = `五音：${wuxingData.yinYue} | 五脏：${wuxingData.zangFu} | 方位：${wuxingData.direction} | 季节：${wuxingData.season}`;
        
        // 设置背景颜色
        wuxingContainer.style.backgroundColor = `rgba(${getWuxingColor(wuxingElement)}, 0.2)`;
        
        // 设置相应的类名和边框颜色
        wuxingAttribute.className = `wuxing-attribute wuxing-${wuxingElement.toLowerCase()}`;
        wuxingContainer.style.borderLeft = `5px solid rgba(${getWuxingColor(wuxingElement)}, 0.8)`;
    }
}

// 获取五行对应的颜色RGB值
function getWuxingColor(wuxingElement) {
    switch (wuxingElement) {
        case '木': return '83, 136, 90'; // 青色
        case '火': return '224, 93, 68'; // 赤色
        case '土': return '241, 196, 15'; // 黄色
        case '金': return '255, 255, 255'; // 白色
        case '水': return '52, 73, 94'; // 黑色
        default: return '120, 120, 120';
    }
}

// 生成按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async function() {
            // 获取选中的颜色
            const selectedColor = document.querySelector('.color-option.selected');
            if (!selectedColor) {
                alert('请先选择一个颜色');
                return;
            }
            
            // 获取RGB值
            const rgb = getRGBFromColorOption(selectedColor);
            
            // 获取音乐输出区域
            const musicOutput = document.getElementById('music-output');
            if (!musicOutput) return;
            
            // 显示加载状态
            musicOutput.innerHTML = `
                <div class="generating-music">
                    <div class="music-loading">生成音乐中...</div>
                </div>
            `;
            
            // 清空相关音乐容器
            const relatedMusicContainer = document.getElementById('related-music-container');
            if (relatedMusicContainer) {
                relatedMusicContainer.innerHTML = `
                    <div class="generating-music">
                        <div class="music-loading">搜索五音相似音乐中...</div>
                    </div>
                `;
            }
            
            try {
                // 生成音乐
                if (currentWuxing) {
                    const musicResult = WuxingMusic.generateMusic(currentWuxing.wuxing);
                    
                    // 更新音乐输出
                    const musicInfo = `
                        <div class="music-info">
                            <div class="music-title">五行音乐 - ${currentWuxing.wuxing}行</div>
                            <div class="music-style">风格: ${musicResult.style}</div>
                            <div class="music-style">速度: ${musicResult.tempo} BPM</div>
                            <div class="music-controls">
                                <button class="control-btn" id="stop-music">停止</button>
                                <button class="control-btn" id="replay-music">重放</button>
                            </div>
                        </div>
                    `;
                    
                    musicOutput.innerHTML = musicInfo;
                    
                    // 添加控制按钮事件监听
                    document.getElementById('stop-music').addEventListener('click', function() {
                        WuxingMusic.stopMusic();
                    });
                    
                    document.getElementById('replay-music').addEventListener('click', function() {
                        WuxingMusic.stopMusic();
                        WuxingMusic.generateMusic(currentWuxing.wuxing);
                    });
                    
                    // 计算五行颜色百分比
                    const wuxingPercentages = calculateWuxingPercentages(rgb.r, rgb.g, rgb.b);
                    
                    // 更新显示
                    updateWuxingColorValues(wuxingPercentages);
                    
                    // 搜索相关音乐
                    await searchRelatedMusic(currentWuxing, wuxingPercentages);
                } else {
                    musicOutput.innerHTML = `<div class="error-message">无法生成音乐，请先选择一个颜色</div>`;
                }
            } catch (error) {
                console.error('生成音乐时出错:', error);
                musicOutput.innerHTML = `<div class="error-message">生成音乐时出错: ${error.message}</div>`;
                
                if (relatedMusicContainer) {
                    relatedMusicContainer.innerHTML = '';
                }
            }
        });
    }
});

// 更新环形进度条
function updateCircleProgress(elementId, percent, color) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
    element.style.strokeDasharray = `${circumference} ${circumference}`;
    element.style.strokeDashoffset = offset;
    element.style.stroke = color;
}

// RGB转CMYK
function rgbToCmyk(r, g, b) {
    // 将RGB值归一化到0-1范围
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    // 计算K值
    const k = 1 - Math.max(normalizedR, normalizedG, normalizedB);
    
    // 防止除以零
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    // 计算C、M、Y值
    const c = (1 - normalizedR - k) / (1 - k);
    const m = (1 - normalizedG - k) / (1 - k);
    const y = (1 - normalizedB - k) / (1 - k);
    
    // 转换为百分比
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// 更新CMYK圆环
function updateCMYKCircles(r, g, b) {
    const cmyk = rgbToCmyk(r, g, b);
    
    // 更新CMYK百分比显示
    document.getElementById('cyan-percent').textContent = `${cmyk.c}%`;
    document.getElementById('magenta-percent').textContent = `${cmyk.m}%`;
    document.getElementById('yellow-percent').textContent = `${cmyk.y}%`;
    document.getElementById('key-percent').textContent = `${cmyk.k}%`;
    
    // 更新环形进度条
    updateCircleProgress('cyan-circle', cmyk.c, '#00AEEF');
    updateCircleProgress('magenta-circle', cmyk.m, '#EC008C');
    updateCircleProgress('yellow-circle', cmyk.y, '#FFF200');
    updateCircleProgress('key-circle', cmyk.k, '#000000');
}