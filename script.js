// 全局变量，存储五行数据
let wuxingData = [];
let currentWuxing = null;
let selectedColor = null;
let musicFiles = [];
let analyzePromises = []; // 存储音频分析Promise

// DOM元素
const generateMusicBtn = document.getElementById('generateMusicBtn');
const musicPlayer = document.getElementById('musicPlayer');
const audioPlayer = document.getElementById('audioPlayer');
const musicTitle = document.getElementById('musicTitle');
const musicDescription = document.getElementById('musicDescription');
const selectedColorDisplay = document.getElementById('selectedColorDisplay');
const selectedColorName = document.getElementById('selectedColorName');
const colorDescription = document.getElementById('colorDescription');
const colorName = document.getElementById('colorName');
const colorAttributes = document.getElementById('colorAttributes');
const generatingStatus = document.getElementById('generatingStatus');
const similarMusicList = document.getElementById('similarMusicList');
const relatedMusicContainer = document.getElementById('relatedMusicContainer');

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
            // 创建五行分组标题
            const wuxingHeader = document.createElement('div');
            wuxingHeader.className = 'wuxing-group-header';
            // 添加数据属性，用于CSS样式
            wuxingHeader.setAttribute('data-wuxing', wuxingGroup.wuxing);
            wuxingHeader.innerHTML = `
                <div class="wuxing-group-title">${wuxingGroup.color}色 - ${wuxingGroup.wuxing}行</div>
                <div class="wuxing-description">五音：${wuxingGroup.yinYue} | 五脏：${wuxingGroup.zangFu} | 方位：${wuxingGroup.direction} | 季节：${wuxingGroup.season}</div>
            `;
            colorGrid.appendChild(wuxingHeader);
            
            // 创建颜色容器
            const colorsContainer = document.createElement('div');
            colorsContainer.className = 'colors-container';
            colorGrid.appendChild(colorsContainer);
            
            // 只选取每个五行的代表色
            const representativeColor = wuxingGroup.colors[0]; // 使用第一个颜色作为代表
            
            // 创建代表色圆圈
            const colorCircle = document.createElement('div');
            colorCircle.className = 'color-circle';
            
            // 设置背景颜色
            const colorValue = representativeColor.Color.startsWith('#') ? 
                representativeColor.Color : '#' + representativeColor.Color.substring(2);
            colorCircle.style.backgroundColor = colorValue;
            
            // 添加点击事件
            colorCircle.addEventListener('click', function() {
                // 清除其他选中状态
                document.querySelectorAll('.color-circle').forEach(circle => {
                    circle.classList.remove('selected');
                });
                
                // 添加选中状态
                this.classList.add('selected');
                
                // 更新当前选中颜色的信息
                document.getElementById('selected-color-name').textContent = `${wuxingGroup.color}色 (${wuxingGroup.wuxing}行)`;
                document.getElementById('color-description').textContent = 
                    `五音：${wuxingGroup.yinYue} | 五脏：${wuxingGroup.zangFu} | 方位：${wuxingGroup.direction} | 季节：${wuxingGroup.season}`;
                
                // 更新页面背景颜色
                document.body.style.backgroundColor = colorValue;
                
                // 解析RGB值
                const rgb = parseRGB(colorValue);
                
                // 计算并更新五行占比
                const wuxingPercentages = calculateWuxingPercentages(rgb.r, rgb.g, rgb.b);
                updateWuxingColorValues(wuxingPercentages);
                
                // 更新五行属性信息
                updateWuxingElements(wuxingGroup.wuxing, wuxingGroup.color, wuxingGroup.description);
                
                // 更新当前五行
                currentWuxing = wuxingGroup;
            });
            
            // 添加到容器
            colorsContainer.appendChild(colorCircle);
            
            // 添加颜色名称
            const colorLabel = document.createElement('div');
            colorLabel.className = 'color-label';
            colorLabel.textContent = wuxingGroup.color;
            colorsContainer.appendChild(colorLabel);
        });
    })
    .catch(error => console.error('加载五行数据时出错:', error));

// 辅助函数：解析RGB值
function parseRGB(color) {
    // 如果是十六进制颜色
    if (color.startsWith('#')) {
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        return { r, g, b };
    }
    
    // 如果已经是rgb格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10)
        };
    }
    
    return { r: 0, g: 0, b: 0 }; // 默认值
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
    
    // 更新环形进度条
    updateCircleProgress('qing-circle', percentages.qing, getComputedStyle(document.documentElement).getPropertyValue('--qing-color'));
    updateCircleProgress('chi-circle', percentages.chi, getComputedStyle(document.documentElement).getPropertyValue('--chi-color'));
    updateCircleProgress('huang-circle', percentages.huang, getComputedStyle(document.documentElement).getPropertyValue('--huang-color'));
    updateCircleProgress('bai-circle', percentages.bai, getComputedStyle(document.documentElement).getPropertyValue('--bai-color'));
    updateCircleProgress('hei-circle', percentages.hei, getComputedStyle(document.documentElement).getPropertyValue('--hei-color'));
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面加载完成，初始化应用...');
    
    // 隐藏相似音乐容器，直到需要时显示
    relatedMusicContainer.style.display = 'none';
    
    // 获取音乐文件列表
    musicFiles = await MusicMatcher.getMusicFiles();
    console.log('获取到音乐文件列表:', musicFiles);
    
    // 预先分析所有音乐文件（这可能需要一些时间）
    startAnalyzingMusicFiles();
    
    // 为每个颜色圆圈添加点击事件
    setupColorCircleEvents();
    
    // 设置生成音乐按钮事件
    setupGenerateMusicButtonEvent();
});

/**
 * 开始分析所有音乐文件
 */
function startAnalyzingMusicFiles() {
    console.log('开始分析所有音乐文件...');
    analyzePromises = musicFiles.map(filename => {
        // 返回一个Promise，但不等待它完成
        return MusicMatcher.analyzeMusicFile(filename)
            .then(() => console.log(`分析完成: ${filename}`))
            .catch(err => console.warn(`分析失败: ${filename}`, err));
    });
    
    // 可以在后台等待所有分析完成
    Promise.allSettled(analyzePromises)
        .then(() => console.log('所有音乐文件分析完成'))
        .catch(err => console.warn('部分音乐文件分析失败', err));
}

/**
 * 设置颜色圆圈的点击事件
 */
function setupColorCircleEvents() {
    const colorCircles = document.querySelectorAll('.color-circle');
    
    colorCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            const color = circle.getAttribute('data-color');
            const name = circle.getAttribute('data-name');
            
            // 更新选中的颜色
            selectedColor = color;
            
            // 更新UI显示
            updateColorSelectionUI(color, name);
            
            // 计算五行颜色值
            const colorValues = calculateWuxingPercentages(parseRGB(color));
            
            // 更新五行颜色值显示
            updateWuxingColorValues(colorValues);
            
            // 启用生成按钮
            generateMusicBtn.disabled = false;
        });
    });
}

/**
 * 解析RGB颜色值
 * @param {string} colorStr - 颜色字符串(#RRGGBB格式)
 * @returns {Object} - 包含r、g、b值的对象
 */
function parseRGB(colorStr) {
    // 移除#号并解析十六进制值
    const hex = colorStr.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * 更新颜色选择UI
 * @param {string} color - 选中的颜色(#RRGGBB格式)
 * @param {string} name - 颜色名称
 */
function updateColorSelectionUI(color, name) {
    // 更新选中颜色的显示
    selectedColorDisplay.style.backgroundColor = color;
    selectedColorName.textContent = name;
    
    // 更新颜色属性描述
    colorName.textContent = name;
    const desc = colorDescriptions[name];
    
    if (desc) {
        colorAttributes.innerHTML = `
            <p><strong>五行属性:</strong> ${desc.attributes}</p>
            <p><strong>性格特点:</strong> ${desc.personality}</p>
            <p><strong>音乐风格:</strong> ${desc.music}</p>
        `;
    } else {
        colorAttributes.textContent = '暂无该颜色的详细属性信息';
    }
}

/**
 * 计算五行颜色百分比
 * @param {Object} rgb - 包含r、g、b值的对象
 * @returns {Object} - 五行颜色百分比
 */
function calculateWuxingPercentages(rgb) {
    console.log('计算五行颜色百分比，输入RGB:', rgb);
    
    // 基于RGB值计算各种颜色的贡献值
    
    // 1. 归一化RGB值到0-1范围
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // 2. 计算HSV值 (色相、饱和度、明度)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // 计算色相 (0-360)
    let h = 0;
    if (diff === 0) {
        h = 0; // 灰色
    } else if (max === r) {
        h = 60 * ((g - b) / diff % 6);
    } else if (max === g) {
        h = 60 * ((b - r) / diff + 2);
    } else {
        h = 60 * ((r - g) / diff + 4);
    }
    
    if (h < 0) h += 360;
    
    // 计算饱和度和明度
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    console.log('HSV值:', { h, s, v });
    
    // 3. 基于色相、饱和度和明度计算五行颜色的贡献
    
    // 青色(青绿色): 120-180
    // 赤色(红色): 0-30 和 330-360
    // 黄色: 30-90
    // 白色: 饱和度低且亮度高
    // 黑色: 明度低
    
    // 初始化颜色贡献
    let qingContribution = 0;  // 青色 (青绿色)
    let chiContribution = 0;   // 赤色 (红色)
    let huangContribution = 0; // 黄色
    let baiContribution = 0;   // 白色
    let heiContribution = 0;   // 黑色
    
    // 基于色相的贡献
    if (h >= 90 && h <= 180) {
        // 青色区域
        const distance = Math.min(h - 90, 180 - h) / 45;
        qingContribution += (1 - distance) * s * v * 100;
    }
    
    if (h <= 30 || h >= 330) {
        // 赤色区域
        const distance = (h <= 30) ? h / 30 : (360 - h) / 30;
        chiContribution += (1 - distance) * s * v * 100;
    }
    
    if (h >= 30 && h <= 90) {
        // 黄色区域
        const distance = Math.min(h - 30, 90 - h) / 30;
        huangContribution += (1 - distance) * s * v * 100;
    }
    
    // 基于饱和度和明度的贡献
    // 白色: 低饱和度，高明度
    if (s < 0.3 && v > 0.7) {
        baiContribution += (1 - s * 3) * v * 100;
    }
    
    // 黑色: 低明度
    if (v < 0.3) {
        heiContribution += (1 - v * 3) * 100;
    }
    
    // 调整边缘情况
    // 如果所有贡献都很低，分配默认值
    const totalContribution = qingContribution + chiContribution + huangContribution + baiContribution + heiContribution;
    
    if (totalContribution < 10) {
        // 如果总贡献太低，可能是灰色调
        const grayLevel = v * 100;
        
        if (grayLevel > 70) {
            baiContribution = 70;
            heiContribution = 30;
        } else if (grayLevel < 30) {
            baiContribution = 30;
            heiContribution = 70;
        } else {
            baiContribution = 50;
            heiContribution = 50;
        }
    }
    
    // 归一化为总和100%
    const newTotal = qingContribution + chiContribution + huangContribution + baiContribution + heiContribution;
    
    const result = {
        qing: Math.round(qingContribution * 100 / newTotal),
        chi: Math.round(chiContribution * 100 / newTotal),
        huang: Math.round(huangContribution * 100 / newTotal),
        bai: Math.round(baiContribution * 100 / newTotal),
        hei: Math.round(heiContribution * 100 / newTotal)
    };
    
    // 确保总和为100%
    let sum = result.qing + result.chi + result.huang + result.bai + result.hei;
    
    // 处理舍入误差，确保总和为100
    if (sum !== 100) {
        // 找出最大值，调整它使总和为100
        let maxKey = "qing";
        let maxVal = result.qing;
        
        for (const key in result) {
            if (result[key] > maxVal) {
                maxVal = result[key];
                maxKey = key;
            }
        }
        
        result[maxKey] += (100 - sum);
    }
    
    console.log('五行颜色百分比计算结果:', result);
    return result;
}

/**
 * 更新五行颜色值显示
 * @param {Object} colorValues - 五行颜色百分比
 */
function updateWuxingColorValues(colorValues) {
    document.getElementById('qingValue').textContent = colorValues.qing;
    document.getElementById('chiValue').textContent = colorValues.chi;
    document.getElementById('huangValue').textContent = colorValues.huang;
    document.getElementById('baiValue').textContent = colorValues.bai;
    document.getElementById('heiValue').textContent = colorValues.hei;
}

/**
 * 设置生成音乐按钮事件
 */
function setupGenerateMusicButtonEvent() {
    generateMusicBtn.addEventListener('click', async () => {
        if (!selectedColor) return;
        
        // 显示生成状态
        generatingStatus.style.display = 'block';
        musicPlayer.style.display = 'none';
        
        try {
            // 计算五行颜色值
            const rgb = parseRGB(selectedColor);
            const colorValues = calculateWuxingPercentages(rgb);
            
            // 转换为音乐匹配器需要的格式
            const wuyinValues = MusicMatcher.calculateWuyinValuesFromColors(colorValues);
            console.log('五音值:', wuyinValues);
            
            // 等待所有音乐分析完成
            await Promise.allSettled(analyzePromises);
            
            // 查找相似音乐
            const similarMusics = findSimilarMusic(wuyinValues);
            
            // 使用第一个（最相似的）音乐
            if (similarMusics.length > 0) {
                const topMusic = similarMusics[0];
                displaySelectedMusic(topMusic.filename, topMusic.similarity);
                
                // 显示相似音乐列表
                displaySimilarMusicList(similarMusics);
            } else {
                alert('未找到匹配的音乐');
                generatingStatus.style.display = 'none';
            }
        } catch (error) {
            console.error('生成音乐时出错:', error);
            alert('生成音乐时出错: ' + error.message);
            generatingStatus.style.display = 'none';
        }
    });
}

/**
 * 查找相似音乐
 * @param {Object} wuyinValues - 五音值
 * @returns {Array} - 相似音乐列表
 */
function findSimilarMusic(wuyinValues) {
    // 计算每个音乐文件与目标五音值的相似度
    const similarityList = [];
    
    for (const filename of musicFiles) {
        const similarity = MusicMatcher.calculateMusicSimilarity(wuyinValues, filename);
        similarityList.push({ filename, similarity });
    }
    
    // 按相似度排序（从高到低）
    similarityList.sort((a, b) => b.similarity - a.similarity);
    
    // 返回前5个最相似的
    return similarityList.slice(0, 5);
}

/**
 * 显示选中的音乐
 * @param {string} filename - 音乐文件名
 * @param {number} similarity - 相似度
 */
function displaySelectedMusic(filename, similarity) {
    const musicUrl = MusicMatcher.getMusicPreviewUrl(filename);
    audioPlayer.src = musicUrl;
    
    // 提取音乐标题（去除扩展名）
    const baseName = filename.split('/').pop();
    const title = baseName.replace(/\.(mp3|wav|ogg)$/, '');
    
    musicTitle.textContent = title;
    
    // 创建描述
    const similarityPercent = Math.round(similarity * 100);
    musicDescription.textContent = `五音相似度: ${similarityPercent}%`;
    
    // 显示播放器，隐藏生成状态
    musicPlayer.style.display = 'block';
    generatingStatus.style.display = 'none';
    
    // 自动播放
    audioPlayer.play().catch(e => console.warn('自动播放失败:', e));
}

/**
 * 显示相似音乐列表
 * @param {Array} similarMusics - 相似音乐列表
 */
function displaySimilarMusicList(similarMusics) {
    // 清空列表
    similarMusicList.innerHTML = '';
    
    // 显示相似音乐容器
    relatedMusicContainer.style.display = 'block';
    
    // 为每个相似音乐创建列表项
    similarMusics.forEach((item, index) => {
        // 只显示5个
        if (index >= 5) return;
        
        const { filename, similarity } = item;
        
        // 获取音频特性
        const audioFeatures = window.musicFileCharacteristics[filename];
        const dominantYin = audioFeatures ? audioFeatures.dominantYin : '宫';
        const yinPinyin = MusicMatcher.getYinPinyin(dominantYin);
        const yinDescription = MusicMatcher.getWuyinCharacteristics(dominantYin);
        
        // 提取音乐标题
        const baseName = filename.split('/').pop();
        const title = baseName.replace(/\.(mp3|wav|ogg)$/, '');
        
        // 创建列表项
        const musicItem = document.createElement('div');
        musicItem.className = 'similar-music-item';
        
        // 计算相似度百分比
        const similarityPercent = Math.round(similarity * 100);
        
        musicItem.innerHTML = `
            <div class="similar-music-title-row">
                <span class="wuyin-badge wuyin-${yinPinyin}">${dominantYin}</span>
                <span class="similar-music-name">${title}</span>
                <span class="similarity-percent">${similarityPercent}%</span>
            </div>
            <div class="similar-music-description">
                <p>${yinDescription.description}</p>
            </div>
            <audio src="${MusicMatcher.getMusicPreviewUrl(filename)}" controls></audio>
        `;
        
        // 添加到列表
        similarMusicList.appendChild(musicItem);
    });
}

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