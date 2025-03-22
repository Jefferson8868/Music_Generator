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
                
                // 更新CMYK圆形进度条
                updateCMYKCircles(r, g, b);
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
    
    function updateColor(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentR = Math.round(startR + (endR - startR) * easeProgress);
            const currentG = Math.round(startG + (endG - startG) * easeProgress);
            const currentB = Math.round(startB + (endB - startB) * easeProgress);
            
            document.body.style.backgroundColor = `rgb(${currentR}, ${currentG}, ${currentB})`;
            requestAnimationFrame(updateColor);
        } else {
            document.body.style.backgroundColor = `rgb(${endR}, ${endG}, ${endB})`;
        }
    }
    
    requestAnimationFrame(updateColor);
}

// 添加在文件末尾
// 更新CMYK圆形进度条
function updateCMYKCircles(r, g, b) {
    // 计算CMYK值
    let c = 0, m = 0, y = 0, k = 0;
    
    // RGB转CMYK算法
    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;
    
    k = 1 - Math.max(r1, g1, b1);
    if (k === 1) {
        c = m = y = 0;
    } else {
        c = (1 - r1 - k) / (1 - k);
        m = (1 - g1 - k) / (1 - k);
        y = (1 - b1 - k) / (1 - k);
    }
    
    // 转换为百分比
    c = Math.round(c * 100);
    m = Math.round(m * 100);
    y = Math.round(y * 100);
    k = Math.round(k * 100);
    
    // 获取当前值
    const currentC = parseInt(document.getElementById('c-value').textContent) || 0;
    const currentM = parseInt(document.getElementById('m-value').textContent) || 0;
    const currentY = parseInt(document.getElementById('y-value').textContent) || 0;
    const currentK = parseInt(document.getElementById('k-value').textContent) || 0;
    
    // 平滑更新CMYK值显示和圆圈进度
    animateCMYKValue('c-value', 'c-circle', currentC, c, '#00AEEF');
    animateCMYKValue('m-value', 'm-circle', currentM, m, '#EC008C');
    animateCMYKValue('y-value', 'y-circle', currentY, y, '#FFF200');
    animateCMYKValue('k-value', 'k-circle', currentK, k, '#000000');
}

// CMYK值和圆圈平滑过渡动画函数
function animateCMYKValue(valueElementId, circleElementId, startValue, endValue, color) {
    const valueElement = document.getElementById(valueElementId);
    const circleElement = document.getElementById(circleElementId);
    
    if (!valueElement || !circleElement) return;
    
    const duration = 800; // 动画持续时间（毫秒）
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

// 删除原来的updateCircleProgress函数，因为它被新的animateCMYKValue函数替代了
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

// 初始化页面时创建CMYK圆形进度条
document.addEventListener('DOMContentLoaded', function() {
    // 创建CMYK圆形进度条
    createCMYKCircles();
    
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

// 创建CMYK圆形进度条
function createCMYKCircles() {
    const cmykCirclesContainer = document.getElementById('cmyk-circles-container');
    if (!cmykCirclesContainer) return;
    
    // 创建CMYK圆形进度条
    createCircleGroup(cmykCirclesContainer, 'c', 'C', '#00AEEF');
    createCircleGroup(cmykCirclesContainer, 'm', 'M', '#EC008C');
    createCircleGroup(cmykCirclesContainer, 'y', 'Y', '#FFF200');
    createCircleGroup(cmykCirclesContainer, 'k', 'K', '#000000');
}

// 创建单个圆形进度条组
function createCircleGroup(container, id, label, color) {
    const group = document.createElement('div');
    group.className = 'circle-group';
    
    const labelElem = document.createElement('div');
    labelElem.className = 'circle-label';
    labelElem.textContent = label;
    
    const circleContainer = document.createElement('div');
    circleContainer.className = 'circle-container';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '60');
    svg.setAttribute('height', '60');
    
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '30');
    circle1.setAttribute('cy', '30');
    circle1.setAttribute('r', '25');
    circle1.setAttribute('fill', 'none');
    circle1.setAttribute('stroke', '#ddd');
    circle1.setAttribute('stroke-width', '5');
    circle1.setAttribute('opacity', '0.3');
    
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle2.setAttribute('cx', '30');
    circle2.setAttribute('cy', '30');
    circle2.setAttribute('r', '25');
    circle2.setAttribute('fill', 'none');
    circle2.setAttribute('stroke', color);
    circle2.setAttribute('stroke-width', '5');
    circle2.setAttribute('stroke-dasharray', '157 157');
    circle2.setAttribute('stroke-dashoffset', '157');
    circle2.setAttribute('transform', 'rotate(-90 30 30)');
    circle2.id = `${id}-circle`;
    
    const valueElem = document.createElement('div');
    valueElem.className = 'circle-value';
    valueElem.id = `${id}-value`;
    valueElem.textContent = '0';
    
    svg.appendChild(circle1);
    svg.appendChild(circle2);
    circleContainer.appendChild(svg);
    circleContainer.appendChild(valueElem);
    
    group.appendChild(labelElem);
    group.appendChild(circleContainer);
    
    container.appendChild(group);
}