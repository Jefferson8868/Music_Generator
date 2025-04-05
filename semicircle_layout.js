/**
 * 空心半圆形颜色布局脚本
 * 用于动态计算和设置颜色选项在空心半圆中的位置
 * 优化版：动态加载颜色，旋转控制，AI标志居中，分割线带文字
 */

// 全局变量，用于跟踪当前旋转角度和可见颜色
let currentRotation = 0;
let visibleColors = [];
let allColorsByWuxing = {};
let colorAngleMap = {};
let wuxingElements = [
    { name: '金', color: '#9E9E9E', textColor: '#FFFFFF' }, // 白色
    { name: '木', color: '#33691E', textColor: '#57AB5A' }, // 青色/绿色
    { name: '水', color: '#0D47A1', textColor: '#34495E' }, // 黑色
    { name: '火', color: '#BF360C', textColor: '#E05D44' }, // 赤色/红色
    { name: '土', color: '#F9A825', textColor: '#F1C40F' }  // 黄色
];

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 移除背景中的白色太阳图案和多余的AI音乐标题
    removeWhiteSun();
    
    // 调整页面布局以适应大型半圆
    adjustLayoutForLargeSemicircle();
    
    // 收集所有五行颜色选项
    collectAllColors();
    
    // 监听颜色网格的变化，当颜色选项被添加时应用半圆形布局
    const colorGridObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 检查是否添加了颜色容器
                let containersAdded = false;
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('colors-container')) {
                        containersAdded = true;
                    }
                });
                
                if (containersAdded) {
                    // 延迟一点执行，确保所有颜色选项都已添加到容器中
                    setTimeout(() => {
                        // 收集所有颜色并创建单个半圆
                        collectAllColors();
                    }, 100);
                }
            }
        });
    });

    // 开始观察颜色网格的变化
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        colorGridObserver.observe(colorGrid, { childList: true });
    }
});

/**
 * 调整页面布局以适应大型半圆
 */
function adjustLayoutForLargeSemicircle() {
    console.log("调整布局以适应大型半圆");
    
    // 调整颜色半圆容器的大小
    const colorSemicircle = document.querySelector('.color-semicircle');
    if (colorSemicircle) {
        colorSemicircle.style.width = '100%';
        colorSemicircle.style.maxWidth = '100%'; // 使用最大可用宽度
        colorSemicircle.style.height = '500px'; // 增加高度
        colorSemicircle.style.margin = '0 auto 100px auto'; // 调整底部间距以容纳控制器
        colorSemicircle.style.position = 'relative';
        colorSemicircle.style.overflow = 'visible'; // 允许控制器超出边界
    }
    
    // 移除之前的AI音乐层
    const existingAiLayer = document.querySelector('.ai-music-layer');
    if (existingAiLayer) {
        existingAiLayer.remove();
    }
    
    // 添加AI音乐独立层 - 确保真正居中
    const aiMusicLayer = document.createElement('div');
    aiMusicLayer.className = 'ai-music-layer';
    aiMusicLayer.style.position = 'absolute';
    aiMusicLayer.style.left = '50%';
    aiMusicLayer.style.top = '50%';
    aiMusicLayer.style.transform = 'translate(-50%, -50%)';
    aiMusicLayer.style.zIndex = '10';
    aiMusicLayer.style.background = 'rgba(255, 255, 255, 0.6)';
    aiMusicLayer.style.backdropFilter = 'blur(5px)';
    aiMusicLayer.style.border = 'none';
    aiMusicLayer.style.borderRadius = '50%';
    aiMusicLayer.style.width = '130px';
    aiMusicLayer.style.height = '130px';
    aiMusicLayer.style.display = 'flex';
    aiMusicLayer.style.flexDirection = 'column';
    aiMusicLayer.style.alignItems = 'center';
    aiMusicLayer.style.justifyContent = 'center';
    aiMusicLayer.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
    
    aiMusicLayer.innerHTML = `
        <div class="center-ai" style="font-size: 42px; font-weight: bold; color: #333; text-shadow: 1px 1px 3px rgba(255,255,255,0.7);">AI</div>
        <div class="center-music" style="font-size: 32px; font-family: 'KaiTi', '楷体', serif; color: #333; text-shadow: 1px 1px 3px rgba(255,255,255,0.7); margin-top: 5px;">音乐</div>
        <div class="center-decoration" style="width: 80px; height: 2px; background: linear-gradient(to right, transparent, rgba(0,0,0,0.5), transparent); margin-top: 10px;"></div>
    `;
    
    if (colorSemicircle) {
        colorSemicircle.appendChild(aiMusicLayer);
    }
    
    // 移除中央音乐生成区域，避免重复
    const musicCenter = document.querySelector('.music-center');
    if (musicCenter) {
        musicCenter.style.display = 'none';
    }
    
    // 调整主内容区域
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.padding = '0';
        mainContent.style.maxWidth = '100%';
    }
    
    console.log("布局调整完成");
}

/**
 * 移除背景中的白色太阳图案
 */
function removeWhiteSun() {
    // 查找并修改ink-wash-overlay中的白色太阳
    const inkWashOverlay = document.querySelector('.ink-wash-overlay');
    if (inkWashOverlay) {
        // 修改背景图像的不透明度，保留一点效果但不重复
        inkWashOverlay.style.opacity = '0.05';
        // 确保只显示一次
        inkWashOverlay.style.backgroundRepeat = 'no-repeat';
        inkWashOverlay.style.backgroundPosition = 'center top';
    }
    
    // 移除多余的AI音乐标题
    const aiTitles = document.querySelectorAll('.logo-container');
    if (aiTitles.length > 1) {
        // 保留第一个，移除其他的
        for (let i = 1; i < aiTitles.length; i++) {
            aiTitles[i].style.display = 'none';
        }
    }
}

/**
 * 收集所有五行颜色并创建三个半圆圈
 */
function collectAllColors() {
    // 获取所有颜色容器
    const containers = document.querySelectorAll('.colors-container');
    if (containers.length === 0) {
        // 如果没有找到颜色容器，尝试从script.js中获取颜色数据
        console.log('没有找到颜色容器，尝试从script.js中获取颜色数据');
        // 延迟执行，等待script.js加载完成
        setTimeout(() => {
            if (document.querySelectorAll('.colors-container').length > 0) {
                collectAllColors();
            } else {
                // 如果仍然找不到，再次尝试
                console.log('仍然找不到颜色容器，再次尝试...');
                setTimeout(collectAllColors, 1000);
            }
        }, 500);
        return;
    }
    
    // 隐藏所有原始颜色容器和颜色网格
    containers.forEach(container => {
        container.style.display = 'none';
    });
    
    // 隐藏颜色网格
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        colorGrid.style.display = 'none';
    }
    
    // 隐藏五行相生相克区域
    const wuxingArea = document.querySelector('.wuxing-area');
    if (wuxingArea) {
        wuxingArea.style.display = 'none';
    }
    
    // 获取颜色半圆容器（这是转盘应该放置的位置）
    const colorSemicircle = document.querySelector('.color-semicircle');
    if (!colorSemicircle) {
        console.error('找不到颜色半圆容器(.color-semicircle)');
        return;
    }
    
    // 确保没有重复的半圆容器
    let existingContainer = colorSemicircle.querySelector('.semicircle-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 创建半圆容器
    const semicircleContainer = document.createElement('div');
    semicircleContainer.className = 'semicircle-container';
    semicircleContainer.style.position = 'relative';
    semicircleContainer.style.width = '100%';
    semicircleContainer.style.height = '500px';
    semicircleContainer.style.margin = '0 auto';
    semicircleContainer.style.overflow = 'visible';
        colorSemicircle.appendChild(semicircleContainer);
    
    // 创建半圆固定背景层 - 不会旋转
    const staticBackgroundLayer = document.createElement('div');
    staticBackgroundLayer.className = 'static-background-layer';
    staticBackgroundLayer.style.position = 'absolute';
    staticBackgroundLayer.style.top = '0';
    staticBackgroundLayer.style.left = '0';
    staticBackgroundLayer.style.width = '100%';
    staticBackgroundLayer.style.height = '100%';
    staticBackgroundLayer.style.borderRadius = '50% 50% 0 0';
    staticBackgroundLayer.style.overflow = 'hidden';
    staticBackgroundLayer.style.zIndex = '1';
    semicircleContainer.appendChild(staticBackgroundLayer);
    
    // 创建颜色旋转层 - 这一层会旋转，包含所有颜色
    const colorRotateLayer = document.createElement('div');
    colorRotateLayer.className = 'color-rotate-layer';
    colorRotateLayer.style.position = 'absolute';
    colorRotateLayer.style.top = '0';
    colorRotateLayer.style.left = '0';
    colorRotateLayer.style.width = '100%';
    colorRotateLayer.style.height = '100%';
    colorRotateLayer.style.borderRadius = '50% 50% 0 0';
    colorRotateLayer.style.zIndex = '2';
    colorRotateLayer.style.transformOrigin = 'center bottom';
    semicircleContainer.appendChild(colorRotateLayer);
    
    // 收集所有颜色选项并按五行分组
    allColorsByWuxing = {};
    wuxingElements.forEach(element => {
        allColorsByWuxing[element.name] = [];
    });
    
    // 将所有颜色分配到对应的五行组
    containers.forEach(container => {
        const options = container.querySelectorAll('.color-option');
        options.forEach(option => {
            const wuxing = option.dataset.wuxing;
            if (wuxing && allColorsByWuxing[wuxing]) {
                allColorsByWuxing[wuxing].push(option);
            }
        });
    });
    
    // 添加五行分隔区域
    addWuxingDividers(staticBackgroundLayer);
    
    // 初始化颜色布局
    initializeColorLayout(colorRotateLayer);
    
    // 添加旋转控制
    addRotationControl(semicircleContainer, colorRotateLayer);
}

/**
 * 添加五行分隔区域
 * @param {HTMLElement} container - 静态背景层容器
 */
function addWuxingDividers(container) {
    console.log('添加五行分隔区域');
    // 获取容器尺寸
    const parentRect = container.parentElement.getBoundingClientRect();
    const centerX = parentRect.width / 2;
    const height = parentRect.height;
    
    // 添加半圆背景 - 增强视觉效果
    const semicircleBackground = document.createElement('div');
    semicircleBackground.className = 'semicircle-background';
    semicircleBackground.style.position = 'absolute';
    semicircleBackground.style.width = '100%';
    semicircleBackground.style.height = '100%';
    semicircleBackground.style.borderRadius = '50% 50% 0 0';
    semicircleBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    semicircleBackground.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.2)';
    container.appendChild(semicircleBackground);
    
    // 计算半圆的半径
    const radius = Math.min(parentRect.width, parentRect.height * 2) / 2;
    
    // 添加三个同心圆轮廓，表示三个半圆圈
    const innerRadius = radius * 0.5;  // 内圈
    const middleRadius = radius * 0.7; // 中圈
    const outerRadius = radius * 0.9;  // 外圈
    
    // 创建三个同心圆轮廓 - 增强视觉效果
    [innerRadius, middleRadius, outerRadius].forEach((r, i) => {
        const circle = document.createElement('div');
        circle.className = `color-circle-outline circle-${i}`;
        circle.style.position = 'absolute';
        circle.style.top = `${height}px`;
        circle.style.left = `${centerX}px`;
        circle.style.width = `${r * 2}px`;
        circle.style.height = `${r * 2}px`;
        circle.style.borderRadius = '50%';
        circle.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
        circle.style.transform = 'translate(-50%, -100%)';
        circle.style.zIndex = '1';
        container.appendChild(circle);
    });
    
    // 添加五行分隔区域标签（金木水火土）
    wuxingElements.forEach((element, index) => {
        // 计算该五行元素在半圆上的位置
        const totalElements = wuxingElements.length;
        // 平均分布在半圆上（0到π）
        const angle = (Math.PI / (totalElements - 1)) * index;
        
        // 计算标签位置（位于外圈之外）
        const labelRadius = outerRadius * 1.05; // 略大于外圈
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = height - labelRadius * Math.sin(angle);
        
        // 创建五行标签容器
        const wuxingLabel = document.createElement('div');
        wuxingLabel.className = 'wuxing-label';
        wuxingLabel.style.position = 'absolute';
        wuxingLabel.style.top = `${labelY}px`;
        wuxingLabel.style.left = `${labelX}px`;
        wuxingLabel.style.transform = 'translate(-50%, -50%)';
        wuxingLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        wuxingLabel.style.color = element.color;
        wuxingLabel.style.padding = '5px 10px';
        wuxingLabel.style.borderRadius = '15px';
        wuxingLabel.style.fontSize = '18px';
        wuxingLabel.style.fontWeight = 'bold';
        wuxingLabel.style.fontFamily = '"KaiTi", "楷体", serif';
        wuxingLabel.style.boxShadow = `0 0 10px ${element.color}`;
        wuxingLabel.style.zIndex = '5';
        wuxingLabel.style.transition = 'all 0.3s ease';
        wuxingLabel.textContent = element.name;
        container.appendChild(wuxingLabel);
        
        // 添加鼠标悬停效果
        wuxingLabel.addEventListener('mouseenter', function() {
            wuxingLabel.style.transform = 'translate(-50%, -50%) scale(1.1)';
            wuxingLabel.style.boxShadow = `0 0 15px ${element.color}`;
        });
        
        wuxingLabel.addEventListener('mouseleave', function() {
            wuxingLabel.style.transform = 'translate(-50%, -50%)';
            wuxingLabel.style.boxShadow = `0 0 10px ${element.color}`;
        });
    });
    
    console.log('五行分隔区域添加完成');
}

/**
 * 初始化颜色布局
 * @param {HTMLElement} container - 旋转层容器
 */
function initializeColorLayout(container) {
    console.log('初始化颜色布局');
    // 获取容器尺寸
    const parentRect = container.parentElement.getBoundingClientRect();
    const centerX = parentRect.width / 2;
    const height = parentRect.height;
    
    // 计算半圆的半径
    const radius = Math.min(parentRect.width, parentRect.height * 2) / 2;
    console.log(`半圆半径: ${radius}px`);
    
    // 清空颜色角度映射
    colorAngleMap = {};
    
    // 计算每个五行区域的颜色数量和角度范围
    const wuxingAngles = {};
    let totalColors = 0;
    
    wuxingElements.forEach((element, index) => {
        const colors = allColorsByWuxing[element.name] || [];
        totalColors += colors.length;
        
        // 计算该五行区域的中心角度
        const totalElements = wuxingElements.length;
        const sectionAngle = Math.PI / totalElements;
        const startAngle = (Math.PI / totalElements) * index;
        const endAngle = startAngle + sectionAngle;
        
        wuxingAngles[element.name] = {
            start: startAngle,
            end: endAngle,
            colors: colors,
            count: colors.length
        };
        
        console.log(`五行 ${element.name} 颜色数量: ${colors.length}, 角度范围: ${startAngle.toFixed(2)} - ${endAngle.toFixed(2)}`);
    });
    
    // 定义五个半径值，用于五个半圆圈的颜色分布
    const radius1 = radius * 0.3;  // 最内圈
    const radius2 = radius * 0.45; // 第二圈
    const radius3 = radius * 0.6;  // 第三圈
    const radius4 = radius * 0.75; // 第四圈
    const radius5 = radius * 0.9;  // 最外圈
    
    console.log(`五个半圆圈半径: 最内圈=${radius1.toFixed(0)}px, 第二圈=${radius2.toFixed(0)}px, 第三圈=${radius3.toFixed(0)}px, 第四圈=${radius4.toFixed(0)}px, 最外圈=${radius5.toFixed(0)}px`);
    
    // 为每个半圆圈分配固定数量的颜色点
    const maxColorsPerCircle = 25; // 每个圈最多25个颜色点，减少数量避免重叠
    const totalCircles = 5; // 增加到5个半圆圈，更好地分散颜色
    
    // 按五行顺序（金木水火土）由浅到深排列颜色
    let sortedColors = [];
    
    // 遍历五行元素，收集并排序所有颜色
    wuxingElements.forEach(element => {
        const colors = allColorsByWuxing[element.name] || [];
        
        // 对每个五行内的颜色按亮度排序（从浅到深）
        const sortedWuxingColors = [...colors].sort((a, b) => {
            // 从颜色值中提取RGB
            const getColorBrightness = (colorOption) => {
                const colorValue = colorOption.style.backgroundColor || colorOption.dataset.color || '#FFFFFF';
                const rgb = colorValue.match(/\d+/g);
                if (rgb && rgb.length >= 3) {
                    // 计算亮度 (简化公式: 0.299*R + 0.587*G + 0.114*B)
                    return 0.299 * parseInt(rgb[0]) + 0.587 * parseInt(rgb[1]) + 0.114 * parseInt(rgb[2]);
                }
                return 255; // 默认为白色（最亮）
            };
            
            return getColorBrightness(b) - getColorBrightness(a); // 从浅到深排序
        });
        
        sortedColors = sortedColors.concat(sortedWuxingColors);
    });
    
    // 计算每个圈的颜色数量，确保总数不超过maxColorsPerCircle * totalCircles
    const totalColorsToShow = Math.min(sortedColors.length, maxColorsPerCircle * totalCircles);
    const colorsPerCircle = Math.ceil(totalColorsToShow / totalCircles);
    
    console.log(`每个半圆圈将显示约 ${colorsPerCircle} 个颜色点，总共 ${totalColorsToShow} 个颜色点`);
    
    // 为每个颜色分配位置（三个半圆圈）
    sortedColors.slice(0, totalColorsToShow).forEach((colorOption, index) => {
        // 确定颜色所在的圈（内、中、外）
        const circleIndex = Math.floor(index / colorsPerCircle);
        if (circleIndex >= totalCircles) return; // 超出圈数限制
        
        // 计算该圈内的颜色索引
        const indexInCircle = index % colorsPerCircle;
        
        // 计算该圈内的颜色总数
        const colorsInThisCircle = (circleIndex < totalCircles - 1) ? 
            colorsPerCircle : 
            (totalColorsToShow - colorsPerCircle * (totalCircles - 1));
        
        // 计算该圈内的角度步长（均匀分布在180度内）
        const circleAngleStep = Math.PI / (colorsInThisCircle - 1 || 1);
        
        // 计算颜色的角度位置（0到π，形成半圆）
        const angle = indexInCircle * circleAngleStep;
        
        // 根据圈选择半径
        let radius;
        switch(circleIndex) {
            case 0: radius = radius1; break;  // 最内圈
            case 1: radius = radius2; break;  // 第二圈
            case 2: radius = radius3; break;  // 第三圈
            case 3: radius = radius4; break;  // 第四圈
            case 4: radius = radius5; break;  // 最外圈
            default: radius = radius3;        // 默认第三圈
        }
        
        // 获取五行属性
        const wuxing = colorOption.dataset.wuxing || '木';
        
        // 存储颜色角度信息
        const colorId = colorOption.dataset.id || `color-${wuxing}-${index}`;
        colorAngleMap[colorId] = {
            angle: angle,
            wuxing: wuxing,
            element: colorOption,
            radius: radius,
            circle: circleIndex, // 记录圈号
            visible: true // 初始状态为可见
        };
    });
    
    console.log(`总共映射了 ${Object.keys(colorAngleMap).length} 个颜色位置`);
    
    // 显示所有颜色
    updateVisibleColors(container, 0); // 初始角度为0
    
    // 添加一个小延迟，确保颜色正确显示（解决可能的渲染问题）
    setTimeout(() => {
        console.log('重新更新颜色显示，确保正确渲染');
        updateVisibleColors(container, 0);
    }, 500);
}

/**
 * 更新可见颜色
 * @param {HTMLElement} container - 旋转层容器
 * @param {number} rotation - 当前旋转角度（弧度）
 */
function updateVisibleColors(container, rotation) {
    console.log(`更新可见颜色，旋转角度: ${rotation} 弧度`);
    
    // 清空容器
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // 清空可见颜色数组
    visibleColors = [];
    
    // 获取容器尺寸
    const parentRect = container.parentElement.getBoundingClientRect();
    const centerX = parentRect.width / 2;
    const height = parentRect.height;
    
    // 隐藏原有的颜色网格
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        colorGrid.style.display = 'none';
    }
    
    // 获取所有颜色数据
    const allColors = Object.entries(colorAngleMap);
    
    // 如果旋转角度改变，更新颜色（保持位置不变，只更新颜色）
    if (rotation !== 0) {
        // 计算旋转偏移量（颜色索引偏移）
        const rotationOffset = Math.floor(Math.abs(rotation) / (Math.PI * 2) * allColors.length) % allColors.length;
        
        // 根据旋转方向确定偏移方向
        const direction = rotation > 0 ? 1 : -1;
        
        // 重新排列颜色数据（颜色旋转，位置不变）
        const rotatedColors = {};
        allColors.forEach(([colorId, colorData], index) => {
            // 计算新的颜色索引（循环移位）
            const newIndex = (index + direction * rotationOffset) % allColors.length;
            if (newIndex < 0) newIndex += allColors.length;
            
            // 获取新位置的颜色数据
            const [newColorId, newColorData] = allColors[newIndex];
            
            // 保持位置不变，更新颜色数据
            rotatedColors[colorId] = {
                ...colorData,
                element: newColorData.element,
                wuxing: newColorData.wuxing
            };
        });
        
        // 更新颜色映射
        colorAngleMap = rotatedColors;
    }
    
    // 显示所有颜色（三个半圆圈）
    allColors.forEach(([colorId, colorData]) => {
        // 计算颜色位置（固定在半圆上）
        const x = centerX + colorData.radius * Math.cos(colorData.angle);
        const y = height - colorData.radius * Math.sin(colorData.angle);
        
        // 克隆颜色选项
        const colorOption = colorData.element.cloneNode(true);
        container.appendChild(colorOption);
        
        // 设置位置和样式 - 增强视觉效果
        colorOption.style.position = 'absolute';
        colorOption.style.left = `${x}px`;
        colorOption.style.top = `${y}px`;
        colorOption.style.transform = 'translate(-50%, -50%)';
        colorOption.style.borderRadius = '50%';
        colorOption.style.border = `3px solid ${wuxingElements.find(e => e.name === colorData.wuxing).textColor}`; // 加粗边框
        colorOption.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'; // 增强阴影
        colorOption.style.zIndex = '3';
        colorOption.style.cursor = 'pointer';
        colorOption.style.transition = 'all 0.3s ease';
        
        // 根据圈设置不同的大小，使外圈颜色略大，内圈颜色略小
        switch(colorData.circle) {
            case 0: // 最内圈
                colorOption.style.width = '18px';
                colorOption.style.height = '18px';
                break;
            case 1: // 第二圈
                colorOption.style.width = '20px';
                colorOption.style.height = '20px';
                break;
            case 2: // 第三圈
                colorOption.style.width = '22px';
                colorOption.style.height = '22px';
                break;
            case 3: // 第四圈
                colorOption.style.width = '24px';
                colorOption.style.height = '24px';
                break;
            case 4: // 最外圈
                colorOption.style.width = '26px';
                colorOption.style.height = '26px';
                break;
            default:
                colorOption.style.width = '22px';
                colorOption.style.height = '22px';
        }
        
        // 添加自定义属性
        colorOption.dataset.colorId = colorId;
        colorOption.dataset.circle = colorData.circle;
        colorOption.dataset.wuxing = colorData.wuxing;
        
        // 添加点击事件
        colorOption.addEventListener('click', function() {
            // 触发原始颜色选项的点击事件
            colorData.element.click();
            
            // 更新UI状态
            document.querySelectorAll('.color-option.selected').forEach(el => {
                el.classList.remove('selected');
            });
            colorOption.classList.add('selected');
            
            // 添加点击反馈
            colorOption.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                colorOption.style.transform = 'translate(-50%, -50%)';
            }, 200);
        });
        
        // 创建颜色名称标签 - 改进显示方式
        const colorName = document.createElement('div');
        colorName.className = 'color-name';
        if (colorData.element.nextElementSibling && colorData.element.nextElementSibling.classList.contains('color-name')) {
            colorName.textContent = colorData.element.nextElementSibling.textContent;
        } else {
            colorName.textContent = '未命名';
        }
        
        colorName.style.position = 'absolute';
        colorName.style.left = `${x}px`;
        colorName.style.top = `${y + 30}px`;
        colorName.style.transform = 'translate(-50%, 0)';
        colorName.style.fontSize = '14px'; // 增大字体
        colorName.style.fontWeight = 'bold'; // 加粗字体
        colorName.style.color = wuxingElements.find(e => e.name === colorData.wuxing).textColor;
        colorName.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)'; // 增强文字阴影
        colorName.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // 增强背景不透明度
        colorName.style.padding = '3px 8px'; // 增大内边距
        colorName.style.borderRadius = '4px';
        colorName.style.zIndex = '4';
        colorName.style.opacity = '0';
        colorName.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        colorName.style.pointerEvents = 'none';
        colorName.style.whiteSpace = 'nowrap';
        container.appendChild(colorName);
        
        // 鼠标悬停时显示颜色名称，添加动画效果
        colorOption.addEventListener('mouseenter', function() {
            colorName.style.opacity = '1';
            colorName.style.transform = 'translate(-50%, -5px)'; // 上移动画
            colorOption.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.7)'; // 高亮效果
            colorOption.style.transform = 'translate(-50%, -50%) scale(1.1)'; // 放大效果
        });
        
        colorOption.addEventListener('mouseleave', function() {
            colorName.style.opacity = '0';
            colorName.style.transform = 'translate(-50%, 0)';
            colorOption.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            colorOption.style.transform = 'translate(-50%, -50%)';
        });
        
        // 添加到可见颜色数组
        visibleColors.push({
            id: colorId,
            element: colorOption,
            nameElement: colorName,
            row: colorData.row,
            wuxing: colorData.wuxing
        });
        
        // 更新颜色数据
        colorAngleMap[colorId].visible = true;
    });
    
    // 更新所有不可见颜色的状态
    for (const colorId in colorAngleMap) {
        if (!visibleColors.some(vc => vc.id === colorId)) {
            colorAngleMap[colorId].visible = false;
        }
    }
    
    // 更新分割线可见性 - 移到这里确保先有颜色数据再更新分割线
    updateDividerVisibility(rotation);
    
    // 输出当前显示的颜色数量和五行分布
    console.log(`当前显示颜色数量: ${visibleColors.length}`);
    const wuxingCounts = {};
    visibleColors.forEach(vc => {
        wuxingCounts[vc.wuxing] = (wuxingCounts[vc.wuxing] || 0) + 1;
    });
    console.log('五行分布:', wuxingCounts);
}

/**
 * 更新分割线可见性 - 在新布局中不再需要此功能，保留函数但简化实现
 * @param {number} rotation - 当前旋转角度（弧度）
 */
function updateDividerVisibility(rotation) {
    // 在新的布局中，五行标签是固定的，不需要根据旋转角度更新可见性
    // 此函数保留是为了兼容性，避免其他地方调用时出错
    console.log(`旋转角度更新: ${rotation} 弧度`);
    
    // 更新五行标签的样式
    const wuxingLabels = document.querySelectorAll('.wuxing-label');
    wuxingLabels.forEach((label, index) => {
        // 确保标签始终可见
        label.style.visibility = 'visible';
        label.style.opacity = '1';
    });
}

/**
 * 添加旋转控制
 * @param {HTMLElement} container - 半圆容器
 * @param {HTMLElement} rotateLayer - 旋转层
 */
function addRotationControl(container, rotateLayer) {
    // 创建旋转控制容器
    const rotationControlContainer = document.createElement('div');
    rotationControlContainer.className = 'rotation-control-container';
    rotationControlContainer.style.position = 'absolute';
    rotationControlContainer.style.bottom = '-80px';
    rotationControlContainer.style.left = '50%';
    rotationControlContainer.style.transform = 'translateX(-50%)';
    rotationControlContainer.style.display = 'flex';
    rotationControlContainer.style.alignItems = 'center';
    rotationControlContainer.style.justifyContent = 'center';
    rotationControlContainer.style.width = '100%';
    rotationControlContainer.style.maxWidth = '500px';
    rotationControlContainer.style.height = '70px';
    rotationControlContainer.style.zIndex = '100';
    rotationControlContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    rotationControlContainer.style.borderRadius = '35px';
    rotationControlContainer.style.padding = '10px';
    rotationControlContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    // 创建旋转按钮
    const rotateBtn = document.createElement('div');
    rotateBtn.className = 'rotate-btn';
    rotateBtn.textContent = '旋转色彩';
    rotateBtn.style.height = '40px';
    rotateBtn.style.minWidth = '120px';
    rotateBtn.style.borderRadius = '20px';
    rotateBtn.style.display = 'flex';
    rotateBtn.style.alignItems = 'center';
    rotateBtn.style.justifyContent = 'center';
    rotateBtn.style.fontSize = '16px';
    rotateBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    rotateBtn.style.color = 'rgba(0, 0, 0, 0.8)';
    rotateBtn.style.cursor = 'pointer';
    rotateBtn.style.transition = 'all 0.3s ease';
    rotateBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    rotateBtn.style.fontFamily = '"KaiTi", "楷体", serif';
    rotateBtn.style.padding = '0 20px';
    
    // 添加旋转图标
    const rotateIcon = document.createElement('span');
    rotateIcon.innerHTML = ' ⟳';
    rotateIcon.style.marginLeft = '5px';
    rotateIcon.style.fontSize = '18px';
    rotateBtn.appendChild(rotateIcon);
    
    // 添加到容器
    rotationControlContainer.appendChild(rotateBtn);
    container.appendChild(rotationControlContainer);
    
    // 添加旋转按钮点击事件
    rotateBtn.addEventListener('click', function() {
        // 旋转一定角度（相当于移动一组颜色）
        const rotationStep = Math.PI / 5; // 约36度
        currentRotation += rotationStep;
        
        // 视觉反馈
        rotateBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        rotateBtn.style.transform = 'scale(0.95)';
        rotateIcon.style.transform = 'rotate(180deg)';
        rotateIcon.style.transition = 'transform 0.5s ease';
        
        // 更新颜色显示（保持位置不变，只更新颜色）
        updateVisibleColors(rotateLayer, currentRotation);
        
        // 恢复按钮样式
        setTimeout(() => {
            rotateBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            rotateBtn.style.transform = 'scale(1)';
            rotateIcon.style.transform = 'rotate(0deg)';
        }, 300);
    });
    
    // 添加鼠标悬停效果
    rotateBtn.addEventListener('mouseenter', function() {
        rotateBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        rotateBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });
    
    rotateBtn.addEventListener('mouseleave', function() {
        rotateBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        rotateBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    });
    
    // 初始化时执行一次更新，确保颜色正确显示
    updateVisibleColors(rotateLayer, currentRotation);
    
    // 添加窗口大小改变时重新计算布局的事件
    window.addEventListener('resize', function() {
        initializeColorLayout(rotateLayer);
    });
}