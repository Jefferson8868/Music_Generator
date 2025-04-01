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
            // 创建五行分组标题
            const wuxingHeader = document.createElement('div');
            wuxingHeader.className = 'wuxing-group-header';
            wuxingHeader.innerHTML = `
                <div class="wuxing-group-title">${wuxingGroup.color}色 - ${wuxingGroup.wuxing}</div>
                <div class="wuxing-group-subtitle">${wuxingGroup.direction}方 | ${wuxingGroup.season} | ${wuxingGroup.yinYue}音</div>
            `;
            colorGrid.appendChild(wuxingHeader);
            
            // 创建颜色容器
            const colorsContainer = document.createElement('div');
            colorsContainer.className = 'colors-container';
            
            // 确保所有颜色都能完整显示
            // 如果颜色太多，可以分成多行显示
            const maxColorsPerRow = 8; // 增加每行显示的颜色数量
            const totalColors = wuxingGroup.colors.length;
            const rows = Math.ceil(totalColors / maxColorsPerRow);
            
            console.log(`加载 ${wuxingGroup.wuxing}(${wuxingGroup.color}) 的颜色：${totalColors}种`);
            
            // 添加颜色总数显示
            const colorCountInfo = document.createElement('div');
            colorCountInfo.className = 'color-count-info';
            colorCountInfo.textContent = `共${totalColors}种颜色`;
            wuxingHeader.appendChild(colorCountInfo);
            
            // 遍历该五行元素下的所有颜色
            wuxingGroup.colors.forEach((color, index) => {
                const colorColumn = document.createElement('div');
                colorColumn.className = 'color-column';
                
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                colorOption.dataset.wuxing = wuxingGroup.wuxing; // 添加五行属性
                
                // 从UniqueId中提取RGB值
                let rgbValues = color.UniqueId.match(/\d+/g);
                const r = parseInt(rgbValues[0]);
                const g = parseInt(rgbValues[1]);
                const b = parseInt(rgbValues[2]);
                
                colorOption.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                
                // 如果背景色太深，文字颜色设为白色
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                colorOption.style.color = brightness < 128 ? 'white' : 'black';
                
                const colorName = document.createElement('div');
                colorName.className = 'color-name';
                colorName.textContent = color.Title; // 使用Title字段作为颜色名称
                
                // 点击事件处理
                colorOption.addEventListener('click', () => {
                    // 移除其他选项的选中状态
                    document.querySelectorAll('.color-option.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // 添加选中状态
                    colorOption.classList.add('selected');
                    
                    // 获取当前背景颜色
                    const currentBgColor = getComputedStyle(document.body).backgroundColor;
                    const rgbMatch = currentBgColor.match(/\d+/g);
                    const currentR = parseInt(rgbMatch[0]);
                    const currentG = parseInt(rgbMatch[1]);
                    const currentB = parseInt(rgbMatch[2]);
                    
                    // 平滑过渡背景颜色
                    animateBackgroundColor(currentR, currentG, currentB, r, g, b);
                    
                    // 计算并更新五行颜色占比
                    const wuxingPercentages = calculateWuxingPercentages(r, g, b);
                    
                    // 平滑更新五行颜色占比值显示
                    animateRGBValue('qing-value', parseInt(document.getElementById('qing-value').textContent || 0), wuxingPercentages.qing);
                    animateRGBValue('bai-value', parseInt(document.getElementById('bai-value').textContent || 0), wuxingPercentages.bai);
                    animateRGBValue('chi-value', parseInt(document.getElementById('chi-value').textContent || 0), wuxingPercentages.chi);
                    animateRGBValue('hei-value', parseInt(document.getElementById('hei-value').textContent || 0), wuxingPercentages.hei);
                    animateRGBValue('huang-value', parseInt(document.getElementById('huang-value').textContent || 0), wuxingPercentages.huang);
                    
                    // 更新五行元素关联
                    updateWuxingElements(wuxingGroup.wuxing, wuxingGroup.color, wuxingGroup.description);
                    
                    // 保存当前选中的五行
                    currentWuxing = wuxingGroup.wuxing;
                    
                    // 更新当前选中的颜色名称
                    document.getElementById('selected-color-name').textContent = color.Title;
                    
                    // 更新颜色描述
                    const descriptionElement = document.getElementById('color-description');
                    if (descriptionElement) {
                        descriptionElement.textContent = color.Description || '暂无描述';
                    }
                    
                    // 更新五行信息显示
                    updateWuxingInfo(wuxingGroup);
                });
                
                colorColumn.appendChild(colorOption);
                colorColumn.appendChild(colorName);
                colorsContainer.appendChild(colorColumn);
            });
            
            colorGrid.appendChild(colorsContainer);
        });
        
        // 默认选中第一个颜色组的第一个颜色
        if (data.length > 0 && data[0].colors.length > 0) {
            const firstColorOption = document.querySelector('.color-option');
            if (firstColorOption) {
                firstColorOption.click();
            }
        }
    })
    .catch(error => {
        console.error('加载五行颜色数据失败:', error);
        document.getElementById('color-grid').innerHTML = '<p>加载五行颜色数据失败，请检查数据文件路径。</p>';
    });

// 更新五行信息显示
function updateWuxingInfo(wuxingGroup) {
    const wuxingTitle = document.querySelector('.wuxing-title');
    const wuxingDescription = document.querySelector('.wuxing-description');
    
    if (wuxingTitle) {
        wuxingTitle.textContent = `五行相生 - ${wuxingGroup.wuxing}(${wuxingGroup.color})`;
        wuxingTitle.style.color = getWuxingColor(wuxingGroup.wuxing);
    }
    
    if (wuxingDescription) {
        wuxingDescription.innerHTML = `
            ${wuxingGroup.description}<br>
            五音：${wuxingGroup.yinYue} | 五脏：${wuxingGroup.zangFu} | 方位：${wuxingGroup.direction} | 季节：${wuxingGroup.season}
        `;
        wuxingDescription.style.color = getWuxingColor(wuxingGroup.wuxing);
    }
}
    
// 生成音乐按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generate-btn').addEventListener('click', function() {
        const selectedColor = document.querySelector('.color-option.selected');
        
        if (selectedColor && currentWuxing) {
            // 获取选中的颜色和五行属性
            const bgColor = selectedColor.style.backgroundColor;
            const wuxingElement = currentWuxing;
            
            // 显示生成中的状态
            document.getElementById('music-output').innerHTML = `
                <div class="generating-music">
                    <div class="music-loading">正在根据 ${wuxingElement} 五行元素生成音乐...</div>
                </div>
            `;
            
            // 使用五行音乐生成器生成音乐
            try {
                // 查找当前五行的完整数据
                const wuxingData = findWuxingData(wuxingElement);
                if (!wuxingData) {
                    throw new Error('未找到对应的五行数据');
                }
                
                // 生成音乐（使用wuxing_music.js中的函数）
                const musicInfo = window.WuxingMusic.generateMusic(wuxingElement, 30); // 生成30秒的音乐
                
                // 更新音乐输出区域
                setTimeout(() => {
                    document.getElementById('music-output').innerHTML = `
                        <div class="music-info">
                            <div class="music-title">五行音乐 - ${wuxingElement}(${wuxingData.color})</div>
                            <div class="music-style">风格: ${musicInfo.style} | 速度: ${musicInfo.tempo}拍/分钟</div>
                            <div class="music-scale">音阶: ${wuxingData.musicScale.join(' ')}</div>
                            <div class="music-controls">
                                <button id="stop-music-btn" class="control-btn">停止</button>
                                <button id="replay-music-btn" class="control-btn">重播</button>
                            </div>
                        </div>
                    `;
                    
                    // 添加停止和重播按钮的事件监听
                    document.getElementById('stop-music-btn').addEventListener('click', function() {
                        window.WuxingMusic.stopMusic();
                    });
                    
                    document.getElementById('replay-music-btn').addEventListener('click', function() {
                        window.WuxingMusic.stopMusic();
                        window.WuxingMusic.generateMusic(wuxingElement, 30);
                    });
                }, 1000);
                
            } catch (error) {
                console.error('生成音乐时出错:', error);
                document.getElementById('music-output').innerHTML = `生成音乐时出错: ${error.message}`;
            }
        } else {
            document.getElementById('music-output').innerHTML = '请先选择一个颜色！';
        }
    });
});

// 查找五行数据
function findWuxingData(wuxingName) {
    return wuxingData.find(item => item.wuxing === wuxingName);
}

// RGB值平滑过渡动画函数
function animateRGBValue(elementId, startValue, endValue) {
    const element = document.getElementById(elementId);
    const duration = 800; // 动画持续时间（毫秒）
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
            element.textContent = currentValue;
            requestAnimationFrame(updateValue);
        } else {
            element.textContent = endValue;
        }
    }
    
    requestAnimationFrame(updateValue);
}

// 背景颜色平滑过渡动画函数
function animateBackgroundColor(startR, startG, startB, endR, endG, endB) {
    const duration = 800; // 动画持续时间（毫秒）
    const startTime = performance.now();
    
    // 获取需要更新颜色的元素
    const colorGrid = document.querySelector('.color-grid');
    const sidebar = document.querySelector('.sidebar');
    const patternOverlay = document.querySelector('.pattern-overlay');
    const chinesePatternOverlay = document.querySelector('.chinese-pattern-overlay');
    
    function updateColor(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentR = Math.round(startR + (endR - startR) * easeProgress);
            const currentG = Math.round(startG + (endG - startG) * easeProgress);
            const currentB = Math.round(startB + (endB - startB) * easeProgress);
            
            // 更新背景颜色 - 直接使用选择的RGB值
            document.body.style.backgroundColor = `rgb(${currentR}, ${currentG}, ${currentB})`;
            document.documentElement.style.setProperty('--selected-color', `rgb(${currentR}, ${currentG}, ${currentB})`);
            
            // 更新图案覆盖层，降低透明度以显示真实颜色
            if (patternOverlay) {
                patternOverlay.style.opacity = '0.3';
                patternOverlay.style.mixBlendMode = 'overlay';
            }
            
            // 更新中国风图案覆盖层
            if (chinesePatternOverlay) {
                chinesePatternOverlay.style.opacity = '0.15';
                chinesePatternOverlay.style.mixBlendMode = 'soft-light';
            }
            
            requestAnimationFrame(updateColor);
        } else {
            // 设置最终颜色
            document.body.style.backgroundColor = `rgb(${endR}, ${endG}, ${endB})`;
            document.documentElement.style.setProperty('--selected-color', `rgb(${endR}, ${endG}, ${endB})`);
            
            // 更新图案覆盖层，保持与动画中相同的设置
            if (patternOverlay) {
                patternOverlay.style.opacity = '0.3';
                patternOverlay.style.mixBlendMode = 'overlay';
            }
            
            // 更新中国风图案覆盖层
            if (chinesePatternOverlay) {
                chinesePatternOverlay.style.opacity = '0.15';
                chinesePatternOverlay.style.mixBlendMode = 'soft-light';
            }
        }
    }
    
    requestAnimationFrame(updateColor);
}

// 添加在文件末尾
// 更新五行元素关联
function updateWuxingElements(wuxingElement, colorName, description) {
    // 根据五行元素获取对应的颜色
    const elementColor = getWuxingColor(wuxingElement);
    
    // 高亮对应的五行元素
    highlightWuxingElement(wuxingElement, elementColor, description);
}

// 获取五行元素对应的颜色
function getWuxingColor(wuxingElement) {
    // 五行元素对应的颜色
    const wuxingColors = {
        '木': '#33691E', // 青色
        '火': '#BF360C', // 赤色
        '土': '#B6A014', // 黄色
        '金': '#BDBDBD', // 白色
        '水': '#0D47A1'  // 黑色
    };
    
    return wuxingColors[wuxingElement] || '#333333';
}

// 更新五行属性文本框函数
function highlightWuxingElement(element, color, description) {
    // 更新五行属性
    const attributeElement = document.getElementById('wuxing-attribute');
    if (attributeElement) {
        attributeElement.textContent = `此颜色属于${element}行，${description}`;
        attributeElement.style.color = color;
    }
    
    // 查找五行数据
    const wuxingGroupData = findWuxingData(element);
    
    // 更新五行详细信息
    const detailsElement = document.getElementById('wuxing-details');
    if (detailsElement && wuxingGroupData) {
        detailsElement.innerHTML = `五音：${wuxingGroupData.yinYue} | 五脏：${wuxingGroupData.zangFu} | 方位：${wuxingGroupData.direction} | 季节：${wuxingGroupData.season}`;
        detailsElement.style.color = color;
    }
    
    // 更新五行标题
    const titleElement = document.querySelector('.wuxing-title');
    if (titleElement) {
        titleElement.textContent = `五行属性 - ${element}(${wuxingGroupData ? wuxingGroupData.color : ''})`;
        titleElement.style.color = color;
    }
}

// 圆形进度条动画函数
function animateCircleValue(circleElement, valueElement, startValue, endValue, color, duration = 800) {
    const startTime = performance.now();
    const radius = circleElement.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    // 设置初始样式
    circleElement.style.strokeDasharray = `${circumference} ${circumference}`;
    circleElement.style.stroke = color;
    
    function updateAnimation(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // 更新数值
            const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
            valueElement.textContent = currentValue;
            
            // 更新圆圈进度
            const offset = circumference - (currentValue / 100) * circumference;
            circleElement.style.strokeDashoffset = offset;
            
            requestAnimationFrame(updateAnimation);
        } else {
            // 动画结束，设置最终值
            valueElement.textContent = endValue;
            const offset = circumference - (endValue / 100) * circumference;
            circleElement.style.strokeDashoffset = offset;
        }
    }
    
    requestAnimationFrame(updateAnimation);
}

// 更新圆形进度条
// 更新圆形进度条
function updateCircleProgress(elementId, percent, color) {
    const circle = document.getElementById(elementId);
    if (!circle) return;
    
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    // 计算进度条长度
    const offset = circumference - (percent / 100) * circumference;
    
    // 设置进度条样式
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = color;
}

// 计算五行颜色占比函数
function calculateWuxingPercentages(r, g, b) {
    // 基于RGB值计算五行颜色的占比
    // 青色(木)：绿色成分高
    // 赤色(火)：红色成分高
    // 黄色(土)：红绿混合
    // 白色(金)：RGB都高
    // 黑色(水)：RGB都低
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sum = r + g + b;
    
    // 归一化到0-100范围
    const normalize = (value) => Math.round(value * 100);
    
    // 计算各个五行颜色的占比
    let qing = normalize(g / 255); // 青色(木)主要由绿色决定
    let chi = normalize(r / 255); // 赤色(火)主要由红色决定
    let huang = normalize((r + g) / (2 * 255)); // 黄色(土)由红绿混合决定
    let bai = normalize((r + g + b) / (3 * 255)); // 白色(金)由RGB平均值决定
    let hei = normalize(1 - (r + g + b) / (3 * 255)); // 黑色(水)由RGB平均值的反向决定
    
    // 确保总和为100
    const total = qing + chi + huang + bai + hei;
    const factor = 100 / total;
    
    return {
        qing: Math.round(qing * factor),
        chi: Math.round(chi * factor),
        huang: Math.round(huang * factor),
        bai: Math.round(bai * factor),
        hei: Math.round(hei * factor)
    };
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 显示加载指示器
    const colorGrid = document.getElementById('color-grid');
    colorGrid.innerHTML = '<div class="loading-indicator">正在加载颜色数据...</div>';
    
    // 设置默认五行颜色占比值
    const defaultR = 192, defaultG = 72, defaultB = 81;
    const defaultPercentages = calculateWuxingPercentages(defaultR, defaultG, defaultB);
    
    document.getElementById('qing-value').textContent = defaultPercentages.qing;
    document.getElementById('bai-value').textContent = defaultPercentages.bai;
    document.getElementById('chi-value').textContent = defaultPercentages.chi;
    document.getElementById('hei-value').textContent = defaultPercentages.hei;
    document.getElementById('huang-value').textContent = defaultPercentages.huang;
    
    // 设置默认颜色名称和描述
    document.getElementById('selected-color-name').textContent = '中国红';
    
    // 设置默认颜色描述
    const descriptionElement = document.getElementById('color-description');
    if (descriptionElement) {
        descriptionElement.textContent = '大红：正红色，三原色中的红，传统的中国红，又称绛色。';
    }
    
    // 设置默认五行元素
    updateWuxingElements('火', '赤', '赤色代表热情、活力与温暖，对应南方与夏季。');
    
    // 生成音乐按钮点击事件
    document.getElementById('generate-btn').addEventListener('click', function() {
        const selectedColor = document.querySelector('.color-option.selected');
        
        if (selectedColor) {
            // 获取选中的颜色
            const bgColor = selectedColor.style.backgroundColor;
            document.getElementById('music-output').innerHTML = `正在根据颜色 ${bgColor} 生成音乐...`;
            
            // 这里可以添加实际的音乐生成逻辑
            setTimeout(() => {
                document.getElementById('music-output').innerHTML = `音乐生成完成！<br><audio controls><source src="#" type="audio/mpeg">您的浏览器不支持音频元素。</audio>`;
            }, 2000);
        } else {
            document.getElementById('music-output').innerHTML = '请先选择一个颜色！';
        }
    });
    
    // 使用fetch API的缓存功能加载JSON
    fetch('data/ColorData.json', { cache: 'force-cache' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            // 清除加载指示器
            colorGrid.innerHTML = '';
            
            // 遍历颜色数据并创建颜色选项
            data.forEach(color => {
                const colorColumn = document.createElement('div');
                colorColumn.className = 'color-column';
                
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                
                // 从UniqueId中提取RGB值
                let rgbValues = color.UniqueId.match(/\d+/g);
                const r = parseInt(rgbValues[0]);
                const g = parseInt(rgbValues[1]);
                const b = parseInt(rgbValues[2]);
                
                colorOption.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                
                // 如果背景色太深，文字颜色设为白色
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                colorOption.style.color = brightness < 128 ? 'white' : 'black';
                
                const colorName = document.createElement('div');
                colorName.className = 'color-name';
                colorName.textContent = color.Title; // 使用Title字段作为颜色名称
                
                // 点击事件处理
                colorOption.addEventListener('click', () => {
                    // 移除其他选项的选中状态
                    document.querySelectorAll('.color-option.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // 添加选中状态
                    colorOption.classList.add('selected');
                    
                    // 获取当前背景颜色
                    const currentBgColor = getComputedStyle(document.body).backgroundColor;
                    const rgbMatch = currentBgColor.match(/\d+/g);
                    const currentR = parseInt(rgbMatch[0]);
                    const currentG = parseInt(rgbMatch[1]);
                    const currentB = parseInt(rgbMatch[2]);
                    
                    // 平滑过渡背景颜色
                    animateBackgroundColor(currentR, currentG, currentB, r, g, b);
                    
                    // 计算并更新五行颜色占比
                    const wuxingPercentages = calculateWuxingPercentages(r, g, b);
                    
                    // 平滑更新五行颜色占比值显示
                    animateRGBValue('qing-value', parseInt(document.getElementById('qing-value').textContent || 0), wuxingPercentages.qing);
                    animateRGBValue('bai-value', parseInt(document.getElementById('bai-value').textContent || 0), wuxingPercentages.bai);
                    animateRGBValue('chi-value', parseInt(document.getElementById('chi-value').textContent || 0), wuxingPercentages.chi);
                    animateRGBValue('hei-value', parseInt(document.getElementById('hei-value').textContent || 0), wuxingPercentages.hei);
                    animateRGBValue('huang-value', parseInt(document.getElementById('huang-value').textContent || 0), wuxingPercentages.huang);
                    
                    // 更新CMYK圆形进度条
                    updateCMYKCircles(r, g, b);
                    
                    // 更新当前选中的颜色名称
                    document.getElementById('selected-color-name').textContent = color.Title;
                    
                    // 更新颜色描述
                    const descriptionElement = document.getElementById('color-description');
                    if (descriptionElement) {
                        descriptionElement.textContent = color.Description || '暂无描述';
                    }
                });
                
                colorColumn.appendChild(colorOption);
                colorColumn.appendChild(colorName);
                colorGrid.appendChild(colorColumn);
            });
            
            // 默认选中第一个颜色
            if (data.length > 0) {
                const firstColorOption = document.querySelector('.color-option');
                if (firstColorOption) {
                    firstColorOption.click();
                }
            }
        })
        .catch(error => {
            console.error('加载颜色数据失败:', error);
            colorGrid.innerHTML = '<p>加载颜色数据失败，请检查数据文件路径。</p>';
        });
});

// 五行元素相关函数已在上方定义

// 将RGB值转换为CMYK值
function rgbToCmyk(r, g, b) {
    // 将RGB值标准化到0-1范围
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    // 计算黑色通道值(K)
    let k = 1 - Math.max(normalizedR, normalizedG, normalizedB);
    
    // 避免除以零的情况
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    // 计算其他通道值
    const c = Math.round(((1 - normalizedR - k) / (1 - k)) * 100);
    const m = Math.round(((1 - normalizedG - k) / (1 - k)) * 100);
    const y = Math.round(((1 - normalizedB - k) / (1 - k)) * 100);
    const kPercent = Math.round(k * 100);
    
    return { c, m, y, k: kPercent };
}

// 更新CMYK圆形进度条
function updateCMYKCircles(r, g, b) {
    // 将RGB值转换为CMYK值
    const cmyk = rgbToCmyk(r, g, b);
    
    // 检查是否存在CMYK圆形进度条元素
    const cyanCircle = document.getElementById('cyan-circle');
    const magentaCircle = document.getElementById('magenta-circle');
    const yellowCircle = document.getElementById('yellow-circle');
    const blackCircle = document.getElementById('black-circle');
    
    // 如果元素存在，则更新进度条
    if (cyanCircle) {
        updateCircleProgress('cyan-circle', cmyk.c, '#00AEEF'); // 青色
    }
    
    if (magentaCircle) {
        updateCircleProgress('magenta-circle', cmyk.m, '#EC008C'); // 品红色
    }
    
    if (yellowCircle) {
        updateCircleProgress('yellow-circle', cmyk.y, '#FFF200'); // 黄色
    }
    
    if (blackCircle) {
        updateCircleProgress('black-circle', cmyk.k, '#000000'); // 黑色
    }
    
    // 更新CMYK值显示（如果存在相应元素）
    const cyanValue = document.getElementById('cyan-value');
    const magentaValue = document.getElementById('magenta-value');
    const yellowValue = document.getElementById('yellow-value');
    const blackValue = document.getElementById('black-value');
    
    if (cyanValue) cyanValue.textContent = cmyk.c + '%';
    if (magentaValue) magentaValue.textContent = cmyk.m + '%';
    if (yellowValue) yellowValue.textContent = cmyk.y + '%';
    if (blackValue) blackValue.textContent = cmyk.k + '%';
}