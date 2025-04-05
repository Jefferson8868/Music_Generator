/**
 * 网格式颜色布局脚本
 * 用于动态计算和设置颜色选项在网格中的位置
 * 优化版：平滑动画，分类标签，交互式过滤
 */

// 五行元素数据
const wuxingElements = [
    { name: '木', color: '#33691E', textColor: '#57AB5A', alias: '青' }, // 青色/绿色
    { name: '火', color: '#BF360C', textColor: '#E05D44', alias: '赤' }, // 赤色/红色
    { name: '土', color: '#F9A825', textColor: '#F1C40F', alias: '黄' }, // 黄色
    { name: '金', color: '#9E9E9E', textColor: '#FFFFFF', alias: '白' }, // 白色
    { name: '水', color: '#0D47A1', textColor: '#34495E', alias: '黑' }  // 黑色
];

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 调整页面布局以适应网格展示
    adjustLayoutForGrid();
    
    // 监听颜色网格的变化，当颜色选项被添加时应用网格布局
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
                        // 重新组织颜色为网格布局
                        reorganizeColorsIntoGrid();
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
 * 调整页面布局以适应网格展示
 */
function adjustLayoutForGrid() {
    console.log("调整布局以适应网格展示");
    
    // 调整主内容区域
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'grid';
        // 修改网格模板，确保不重叠
        mainContent.style.gridTemplateColumns = '3fr 2fr';
        mainContent.style.gridTemplateAreas = 
            '"color-area sidebar" ' +
            '"wuxing-area sidebar"';
        mainContent.style.gap = '20px';
        mainContent.style.padding = '20px';
        mainContent.style.maxWidth = '1200px';
        mainContent.style.margin = '0 auto';
    }
    
    // 调整颜色网格容器
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        colorGrid.style.gridArea = 'color-area';
        colorGrid.style.maxWidth = '100%';
        colorGrid.style.display = 'flex';
        colorGrid.style.flexDirection = 'column';
        colorGrid.style.padding = '15px';
        colorGrid.style.borderRadius = '8px';
        colorGrid.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        colorGrid.style.backdropFilter = 'blur(5px)';
        colorGrid.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        
        // 修改滚动行为为垂直滚动
        colorGrid.style.overflowY = 'auto';
        colorGrid.style.overflowX = 'hidden'; // 防止水平滚动
        colorGrid.style.maxHeight = '65vh'; // 设置最大高度，确保可以垂直滚动
        
        // 防止滚动穿透
        colorGrid.addEventListener('wheel', function(e) {
            if (e.target.closest('#color-grid')) {
                e.stopPropagation();
            }
        }, { passive: true });
    }
    
    // 调整侧边栏
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.gridArea = 'sidebar';
        sidebar.style.position = 'sticky';
        sidebar.style.top = '20px';
        sidebar.style.alignSelf = 'start';
        sidebar.style.borderRadius = '8px';
        sidebar.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        sidebar.style.backdropFilter = 'blur(8px)';
        sidebar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        sidebar.style.padding = '20px';
        sidebar.style.minWidth = '250px'; // 确保侧边栏有最小宽度
        sidebar.style.maxWidth = '300px'; // 限制最大宽度
        sidebar.style.overflowY = 'visible'; // 不强制滚动
        sidebar.style.height = 'auto'; // 自动高度
        sidebar.style.maxHeight = 'none'; // 取消最大高度限制
    }
    
    // 调整五行区域
    const wuxingArea = document.querySelector('.wuxing-area');
    if (wuxingArea) {
        wuxingArea.style.gridArea = 'wuxing-area';
        wuxingArea.style.borderRadius = '8px';
        wuxingArea.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        wuxingArea.style.backdropFilter = 'blur(8px)';
        wuxingArea.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        wuxingArea.style.padding = '20px';
        wuxingArea.style.marginTop = '20px';
    }
    
    // 确保颜色描述容器显示
    const colorDescriptionContainer = document.querySelector('.color-description-container');
    if (colorDescriptionContainer) {
        colorDescriptionContainer.style.display = 'block';
        colorDescriptionContainer.style.marginBottom = '15px';
    }
    
    // 调整相似音乐容器 - 移除滚动条
    const relatedMusicContainer = document.getElementById('related-music-container');
    if (relatedMusicContainer) {
        relatedMusicContainer.style.maxHeight = 'none'; // 移除最大高度限制
        relatedMusicContainer.style.overflowY = 'visible'; // 移除滚动
        relatedMusicContainer.style.marginTop = '20px';
        relatedMusicContainer.style.padding = '10px';
        relatedMusicContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        relatedMusicContainer.style.borderRadius = '5px';
    }
    
    // 创建筛选器控件
    createWuxingFilters();
    
    console.log("布局调整完成");
}

/**
 * 创建五行筛选器控件
 */
function createWuxingFilters() {
    // 检查是否已经存在筛选器
    if (document.querySelector('.wuxing-filters')) {
        return;
    }
    
    // 创建筛选器容器
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'wuxing-filters';
    filtersContainer.style.display = 'flex';
    filtersContainer.style.justifyContent = 'center';
    filtersContainer.style.marginBottom = '20px';
    filtersContainer.style.gap = '10px';
    filtersContainer.style.flexWrap = 'wrap';
    filtersContainer.style.position = 'sticky';
    filtersContainer.style.top = '0';
    filtersContainer.style.zIndex = '10';
    filtersContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    filtersContainer.style.backdropFilter = 'blur(8px)';
    filtersContainer.style.padding = '10px';
    filtersContainer.style.borderRadius = '5px';
    
    // 先添加"全部"筛选器
    const allFilter = document.createElement('button');
    allFilter.className = 'wuxing-filter active';
    allFilter.dataset.wuxing = 'all';
    allFilter.textContent = '全部';
    allFilter.style.padding = '8px 15px';
    allFilter.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    allFilter.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    allFilter.style.borderRadius = '20px';
    allFilter.style.cursor = 'pointer';
    allFilter.style.transition = 'all 0.3s ease';
    allFilter.style.color = '#fff';
    allFilter.style.fontFamily = '"KaiTi", "楷体", serif';
    allFilter.style.fontSize = '16px';
    
    // 添加点击事件
    allFilter.addEventListener('click', function() {
        filterColors('all');
        
        // 更新筛选器状态
        document.querySelectorAll('.wuxing-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        allFilter.classList.add('active');
    });
    
    filtersContainer.appendChild(allFilter);
    
    // 为每个五行元素创建一个筛选器
    wuxingElements.forEach(element => {
        const filter = document.createElement('button');
        filter.className = 'wuxing-filter';
        filter.dataset.wuxing = element.name;
        filter.textContent = `${element.name}(${element.alias})`;
        filter.style.padding = '8px 15px';
        filter.style.backgroundColor = element.color;
        filter.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        filter.style.borderRadius = '20px';
        filter.style.cursor = 'pointer';
        filter.style.transition = 'all 0.3s ease';
        filter.style.color = element.textColor;
        filter.style.fontFamily = '"KaiTi", "楷体", serif';
        filter.style.fontSize = '16px';
        
        // 添加点击事件
        filter.addEventListener('click', function() {
            filterColors(element.name);
            
            // 更新筛选器状态
            document.querySelectorAll('.wuxing-filter').forEach(filter => {
                filter.classList.remove('active');
            });
            filter.classList.add('active');
        });
        
        filtersContainer.appendChild(filter);
    });
    
    // 添加到页面
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        // 如果颜色网格已经存在，则将筛选器添加为颜色网格的第一个子元素
        if (colorGrid.firstChild) {
            colorGrid.insertBefore(filtersContainer, colorGrid.firstChild);
        } else {
            colorGrid.appendChild(filtersContainer);
        }
    }
}

/**
 * 按五行元素筛选颜色
 * @param {string} wuxingName - 五行元素名称
 */
function filterColors(wuxingName) {
    const colorGroups = document.querySelectorAll('.wuxing-color-group');
    
    if (wuxingName === 'all') {
        // 显示所有颜色组
        colorGroups.forEach(group => {
            group.style.display = 'block';
        });
    } else {
        // 只显示指定五行的颜色组
        colorGroups.forEach(group => {
            if (group.dataset.wuxing === wuxingName) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });
    }
}

/**
 * 根据颜色亮度排序颜色（从浅到深）
 * @param {Array} colors - 颜色选项数组
 * @returns {Array} - 排序后的颜色数组
 */
function sortColorsByBrightness(colors) {
    return Array.from(colors).sort((a, b) => {
        // 获取颜色的背景色
        const aColor = getComputedStyle(a).backgroundColor;
        const bColor = getComputedStyle(b).backgroundColor;
        
        // 提取RGB值
        const aRgb = aColor.match(/\d+/g).map(Number);
        const bRgb = bColor.match(/\d+/g).map(Number);
        
        // 计算亮度 (用于排序，从浅到深)
        // 使用感知亮度公式: 0.299*R + 0.587*G + 0.114*B
        const aBrightness = 0.299 * aRgb[0] + 0.587 * aRgb[1] + 0.114 * aRgb[2];
        const bBrightness = 0.299 * bRgb[0] + 0.587 * bRgb[1] + 0.114 * bRgb[2];
        
        // 降序排列（从浅到深）
        return bBrightness - aBrightness;
    });
}

/**
 * 重新组织颜色为网格布局
 */
function reorganizeColorsIntoGrid() {
    console.log("重新组织颜色为网格布局");
    
    // 获取所有颜色容器
    const containers = document.querySelectorAll('.colors-container');
    if (containers.length === 0) {
        console.log('没有找到颜色容器，稍后再试...');
        setTimeout(reorganizeColorsIntoGrid, 500);
        return;
    }
    
    // 创建新的网格容器
    const gridContainer = document.createElement('div');
    gridContainer.className = 'color-grid-layout';
    gridContainer.style.display = 'flex';
    gridContainer.style.flexDirection = 'column';
    gridContainer.style.gap = '25px';
    
    // 找到五行组标题
    const wuxingGroups = document.querySelectorAll('.wuxing-group-header');
    
    // 为每个五行元素创建一个颜色组
    wuxingGroups.forEach((groupHeader, index) => {
        // 获取五行名称
        const titleElement = groupHeader.querySelector('.wuxing-group-title');
        const subtitleElement = groupHeader.querySelector('.wuxing-group-subtitle');
        
        if (!titleElement) return;
        
        const titleText = titleElement.textContent;
        const wuxingMatch = titleText.match(/(\S+)色 - (\S+)/);
        
        if (!wuxingMatch) return;
        
        const colorName = wuxingMatch[1]; // 例如："青"
        const wuxingName = wuxingMatch[2]; // 例如："木"
        
        // 找到相应的颜色容器
        const container = containers[index];
        if (!container) return;
        
        // 创建五行颜色组
        const colorGroup = document.createElement('div');
        colorGroup.className = 'wuxing-color-group';
        colorGroup.dataset.wuxing = wuxingName;
        colorGroup.style.padding = '15px';
        colorGroup.style.borderRadius = '8px';
        colorGroup.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        colorGroup.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        colorGroup.style.transition = 'all 0.3s ease';
        colorGroup.style.marginBottom = '20px'; // 增加组间距
        
        // 找到对应的五行元素数据
        const wuxingElement = wuxingElements.find(el => el.name === wuxingName);
        if (wuxingElement) {
            // 设置边框颜色，突出五行分类
            colorGroup.style.borderLeft = `5px solid ${wuxingElement.color}`;
        }
        
        // 添加五行标题
        const groupTitleElement = document.createElement('div');
        groupTitleElement.className = 'color-group-title';
        groupTitleElement.innerHTML = `
            <div class="wuxing-group-title">${colorName}色 - ${wuxingName}</div>
            ${subtitleElement ? `<div class="wuxing-group-subtitle">${subtitleElement.textContent}</div>` : ''}
        `;
        groupTitleElement.style.marginBottom = '15px';
        groupTitleElement.style.padding = '8px 0';
        groupTitleElement.style.borderBottom = '2px solid rgba(255, 255, 255, 0.2)';
        
        // 添加五行图标
        if (wuxingElement) {
            const wuxingIcon = document.createElement('div');
            wuxingIcon.className = 'wuxing-icon';
            wuxingIcon.textContent = wuxingName;
            wuxingIcon.style.display = 'inline-block';
            wuxingIcon.style.backgroundColor = wuxingElement.color;
            wuxingIcon.style.color = wuxingElement.textColor;
            wuxingIcon.style.width = '30px';
            wuxingIcon.style.height = '30px';
            wuxingIcon.style.lineHeight = '30px';
            wuxingIcon.style.textAlign = 'center';
            wuxingIcon.style.borderRadius = '50%';
            wuxingIcon.style.marginRight = '10px';
            wuxingIcon.style.fontWeight = 'bold';
            wuxingIcon.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            
            // 将图标添加到标题前面
            groupTitleElement.querySelector('.wuxing-group-title').prepend(wuxingIcon);
        }
        
        colorGroup.appendChild(groupTitleElement);
        
        // 创建颜色网格 - 改为垂直布局的网格
        const colorsGrid = document.createElement('div');
        colorsGrid.className = 'colors-grid';
        colorsGrid.style.display = 'grid';
        colorsGrid.style.gridTemplateColumns = 'repeat(5, 1fr)'; // 固定每行5个颜色
        colorsGrid.style.gap = '15px';
        colorsGrid.style.justifyItems = 'center'; // 水平居中
        
        // 获取颜色选项
        const colorOptions = container.querySelectorAll('.color-option');
        const colorNames = container.querySelectorAll('.color-name');
        
        // 将颜色选项和名称打包到一个数组中，以便于排序
        let colorItems = [];
        colorOptions.forEach((colorOption, i) => {
            colorItems.push({
                option: colorOption,
                name: colorNames[i]
            });
        });
        
        // 根据颜色亮度排序 (从浅到深)
        colorItems.sort((a, b) => {
            const aColor = getComputedStyle(a.option).backgroundColor;
            const bColor = getComputedStyle(b.option).backgroundColor;
            
            const aRgb = aColor.match(/\d+/g).map(Number);
            const bRgb = bColor.match(/\d+/g).map(Number);
            
            // 计算亮度
            const aBrightness = 0.299 * aRgb[0] + 0.587 * aRgb[1] + 0.114 * aRgb[2];
            const bBrightness = 0.299 * bRgb[0] + 0.587 * bRgb[1] + 0.114 * bRgb[2];
            
            // 降序排列（从浅到深）
            return bBrightness - aBrightness;
        });
        
        // 添加排序后的颜色项
        colorItems.forEach(({ option: colorOption, name: colorName }) => {
            // 创建颜色项容器
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.display = 'flex';
            colorItem.style.flexDirection = 'column';
            colorItem.style.alignItems = 'center';
            colorItem.style.gap = '8px';
            colorItem.style.transition = 'transform 0.2s ease';
            colorItem.style.width = '100%'; // 确保宽度一致
            
            // 克隆颜色选项和名称
            const newColorOption = colorOption.cloneNode(true);
            newColorOption.classList.remove('selected');  // 移除已选中状态
            newColorOption.style.width = '50px'; // 保持颜色圆圈大小适中
            newColorOption.style.height = '50px';
            newColorOption.style.borderRadius = '50%'; // 圆形
            newColorOption.style.cursor = 'pointer';
            newColorOption.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            newColorOption.style.transition = 'all 0.3s ease';
            
            // 添加悬停效果
            colorItem.addEventListener('mouseover', function() {
                colorItem.style.transform = 'translateY(-5px)';
                newColorOption.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.25)';
            });
            
            colorItem.addEventListener('mouseout', function() {
                colorItem.style.transform = 'translateY(0)';
                newColorOption.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            });
            
            // 复制原始颜色选项的点击事件
            newColorOption.addEventListener('click', function() {
                // 模拟点击原始选项，触发原有事件
                colorOption.click();
                
                // 更新所有颜色选项的选中状态
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // 更新克隆的选项状态
                document.querySelectorAll('.colors-grid .color-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                newColorOption.classList.add('selected');
            });
            
            // 创建颜色名称元素，确保不重叠
            const newColorName = document.createElement('div');
            newColorName.className = 'color-name';
            newColorName.textContent = colorName ? colorName.textContent : '';
            newColorName.style.fontSize = '12px';
            newColorName.style.textAlign = 'center';
            newColorName.style.width = '100%';
            newColorName.style.height = '36px'; // 固定高度，确保一致
            newColorName.style.overflow = 'hidden';
            newColorName.style.textOverflow = 'ellipsis';
            newColorName.style.display = '-webkit-box';
            newColorName.style.webkitLineClamp = '2'; // 最多显示两行
            newColorName.style.webkitBoxOrient = 'vertical';
            newColorName.style.lineHeight = '18px';
            
            colorItem.appendChild(newColorOption);
            colorItem.appendChild(newColorName);
            colorsGrid.appendChild(colorItem);
        });
        
        colorGroup.appendChild(colorsGrid);
        gridContainer.appendChild(colorGroup);
    });
    
    // 替换原来的颜色网格内容
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        // 保留筛选器
        const filtersContainer = colorGrid.querySelector('.wuxing-filters');
        
        colorGrid.innerHTML = '';
        
        if (filtersContainer) {
            colorGrid.appendChild(filtersContainer);
        } else {
            // 如果筛选器不存在，创建它
            createWuxingFilters();
        }
        
        colorGrid.appendChild(gridContainer);
    }
    
    // 隐藏原始颜色容器
    containers.forEach(container => {
        container.style.display = 'none';
    });
    
    console.log("颜色网格布局完成");
}

// 添加滚动到顶部的动画函数
function smoothScrollToTop(element) {
    element.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加CSS样式
function addCustomStyles() {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .wuxing-filter.active {
            background-color: rgba(255, 255, 255, 0.4) !important;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .color-item:hover .color-name {
            font-weight: bold;
        }
        
        .color-option.selected {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25) !important;
            border: 2px solid white !important;
        }
        
        /* 防止外部滚动时影响内部滚动区域 */
        #color-grid {
            overscroll-behavior: contain;
        }
        
        /* 自定义滚动条样式 */
        #color-grid::-webkit-scrollbar {
            width: 8px;
        }
        
        #color-grid::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        
        #color-grid::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }
        
        #color-grid::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        /* 确保颜色组在小屏幕上也能正确显示 */
        .wuxing-color-group {
            margin-bottom: 20px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .wuxing-color-group:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* 确保颜色名称不重叠 */
        .color-name {
            margin-top: 8px;
            font-size: 12px !important;
            line-height: 1.5 !important;
            height: 36px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        
        /* 五行分组标题样式 */
        .wuxing-group-title {
            font-size: 18px;
            font-weight: bold;
            font-family: "KaiTi", "楷体", serif;
            color: white;
            display: flex;
            align-items: center;
        }
        
        /* 确保色彩描述容器显示 */
        .color-description-container {
            display: block !important;
            margin-bottom: 15px;
        }
        
        /* 相似音乐容器样式 - 无滚动条 */
        #related-music-container {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.1);
            overflow: visible;
            max-height: none;
        }
        
        /* 响应式调整 */
        @media (max-width: 992px) {
            .colors-grid {
                grid-template-columns: repeat(4, 1fr) !important;
            }
        }
        
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr !important;
                grid-template-areas: 
                    "color-area"
                    "wuxing-area"
                    "sidebar" !important;
            }
            
            .colors-grid {
                grid-template-columns: repeat(3, 1fr) !important;
            }
            
            .color-item {
                margin-bottom: 5px;
            }
            
            .sidebar {
                position: static !important;
                max-width: 100% !important;
            }
        }
    `;
    document.head.appendChild(styleTag);
}

// 页面加载完成后初始化自定义样式
document.addEventListener('DOMContentLoaded', function() {
    addCustomStyles();
}); 