fetch('data/ColorData.json')
    .then(response => response.json())
    .then(data => {
        const colorGrid = document.getElementById('color-grid');
        
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
                
                // 平滑更新RGB值显示
                animateRGBValue('r-value', parseInt(document.getElementById('r-value').textContent), r);
                animateRGBValue('g-value', parseInt(document.getElementById('g-value').textContent), g);
                animateRGBValue('b-value', parseInt(document.getElementById('b-value').textContent), b);
                
                // 更新五行元素关联
                updateWuxingElements(r, g, b);
                
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
    })
    .catch(error => {
        console.error('加载颜色数据失败:', error);
        document.getElementById('color-grid').innerHTML = '<p>加载颜色数据失败，请检查数据文件路径。</p>';
    });
    
// 生成音乐按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
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
});

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
function updateWuxingElements(r, g, b) {
    // 计算颜色的五行属性
    // 根据RGB值判断颜色属于哪个五行元素
    // 金(白)、木(青/绿)、水(黑/蓝)、火(红)、土(黄/棕)
    
    // 简化的颜色分类算法
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let wuxingElement = '';
    let elementColor = '';
    let description = '';
    
    // 判断是否为白色系 (金)
    if (brightness > 200 && delta < 30) {
        wuxingElement = '金';
        elementColor = '#BDBDBD';
        description = '金代表白色系，象征着纯洁、高贵与坚韧，对应西方与秋季。';
    }
    // 判断是否为绿色系 (木)
    else if (g > r && g > b) {
        wuxingElement = '木';
        elementColor = '#33691E';
        description = '木代表绿色系，象征着生长、希望与活力，对应东方与春季。';
    }
    // 判断是否为蓝黑色系 (水)
    else if (b > r && b > g) {
        wuxingElement = '水';
        elementColor = '#0D47A1';
        description = '水代表蓝黑色系，象征着智慧、深邃与包容，对应北方与冬季。';
    }
    // 判断是否为红色系 (火)
    else if (r > g && r > b && r > 150) {
        wuxingElement = '火';
        elementColor = '#BF360C';
        description = '火代表红色系，象征着热情、活力与温暖，对应南方与夏季。';
    }
    // 判断是否为黄棕色系 (土)
    else {
        wuxingElement = '土';
        elementColor = '#5D4037';
        description = '土代表黄棕色系，象征着稳重、包容与厚实，对应中央与四季交替时期。';
    }
    
    // 高亮对应的五行元素
    highlightWuxingElement(wuxingElement, elementColor, description);
}

// 高亮五行元素函数
function highlightWuxingElement(element, color, description) {
    // 获取五行图像
    const wuxingImage = document.querySelector('.wuxing-image');
    if (!wuxingImage) return;
    
    // 添加高亮效果
    wuxingImage.classList.add('wuxing-highlight');
    
    // 更新五行描述
    const descriptionElement = document.querySelector('.wuxing-description');
    if (descriptionElement) {
        descriptionElement.textContent = description;
        descriptionElement.style.color = color;
    }
    
    // 更新五行标题
    const titleElement = document.querySelector('.wuxing-title');
    if (titleElement) {
        titleElement.textContent = `五行相生 - ${element}`;  
        titleElement.style.color = color;
    }
    
    // 添加动画效果
    setTimeout(() => {
        wuxingImage.classList.remove('wuxing-highlight');
    }, 1000);
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

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 显示加载指示器
    const colorGrid = document.getElementById('color-grid');
    colorGrid.innerHTML = '<div class="loading-indicator">正在加载颜色数据...</div>';
    
    // 设置默认RGB值
    document.getElementById('r-value').textContent = '192';
    document.getElementById('g-value').textContent = '72';
    document.getElementById('b-value').textContent = '81';
    
    // 设置默认颜色名称和描述
    document.getElementById('selected-color-name').textContent = '中国红';
    
    // 设置默认颜色描述
    const descriptionElement = document.getElementById('color-description');
    if (descriptionElement) {
        descriptionElement.textContent = '大红：正红色，三原色中的红，传统的中国红，又称绛色。';
    }
    
    // 设置默认五行元素
    const defaultR = 192, defaultG = 72, defaultB = 81;
    updateWuxingElements(defaultR, defaultG, defaultB);
    
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
                    
                    // 平滑更新RGB值显示
                    animateRGBValue('r-value', parseInt(document.getElementById('r-value').textContent), r);
                    animateRGBValue('g-value', parseInt(document.getElementById('g-value').textContent), g);
                    animateRGBValue('b-value', parseInt(document.getElementById('b-value').textContent), b);
                    
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