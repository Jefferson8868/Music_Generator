const wuxingElements = [
    { name: '木', color: '#33691E', textColor: '#57AB5A', alias: '青' },
    { name: '火', color: '#BF360C', textColor: '#E05D44', alias: '赤' },
    { name: '土', color: '#F9A825', textColor: '#F1C40F', alias: '黄' },
    { name: '金', color: '#FFFFFF', textColor: '#9E9E9E', alias: '白' },
    { name: '水', color: '#000000', textColor: '#34495E', alias: '黑' }
];

document.addEventListener('DOMContentLoaded', () => {
    adjustLayoutForGrid();
    const colorGridObserver = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length && Array.from(m.addedNodes).some(n => n.classList?.contains('colors-container')))) {
            setTimeout(reorganizeColorsIntoGrid, 100);
        }
    });
    const colorGrid = document.getElementById('color-grid');
    colorGrid && colorGridObserver.observe(colorGrid, { childList: true });
    addCustomStyles();
});

function adjustLayoutForGrid() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        Object.assign(mainContent.style, {
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gridTemplateAreas: '"color-area sidebar" "wuxing-area sidebar"',
            gap: '20px',
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        });
    }
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        Object.assign(colorGrid.style, {
            gridArea: 'color-area',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '25px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: '65vh'
        });
        colorGrid.addEventListener('wheel', e => e.target.closest('#color-grid') && e.stopPropagation(), { passive: true });
    }
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        Object.assign(sidebar.style, {
            gridArea: 'sidebar',
            position: 'sticky',
            top: '20px',
            alignSelf: 'start',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            padding: '20px',
            minWidth: '250px',
            maxWidth: '300px',
            overflowY: 'visible',
            height: 'auto',
            maxHeight: 'none'
        });
    }
    const wuxingArea = document.querySelector('.wuxing-area');
    if (wuxingArea) {
        Object.assign(wuxingArea.style, {
            gridArea: 'wuxing-area',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            padding: '20px',
            marginTop: '20px'
        });
    }
    const colorDescriptionContainer = document.querySelector('.color-description-container');
    if (colorDescriptionContainer) {
        Object.assign(colorDescriptionContainer.style, {
            display: 'block',
            marginBottom: '15px'
        });
    }
    const relatedMusicContainer = document.getElementById('related-music-container');
    if (relatedMusicContainer) {
        Object.assign(relatedMusicContainer.style, {
            maxHeight: 'none',
            overflowY: 'visible',
            marginTop: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '5px'
        });
    }
}

function createWuxingFilters() {
    if (document.querySelector('.wuxing-filters')) return;
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'wuxing-filters';
    Object.assign(filtersContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
        gap: '10px',
        flexWrap: 'wrap',
        position: 'sticky',
        top: '0',
        zIndex: '10',
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        padding: '10px',
        borderRadius: '5px'
    });
    const allFilter = document.createElement('button');
    allFilter.className = 'wuxing-filter active';
    allFilter.dataset.wuxing = 'all';
    allFilter.textContent = '全部';
    Object.assign(allFilter.style, {
        padding: '8px 15px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: '#fff',
        fontFamily: '"KaiTi", "楷体", serif',
        fontSize: '16px'
    });
    allFilter.addEventListener('click', () => {
        filterColors('all');
        document.querySelectorAll('.wuxing-filter').forEach(f => f.classList.remove('active'));
        allFilter.classList.add('active');
    });
    filtersContainer.appendChild(allFilter);
    wuxingElements.forEach(el => {
        const filter = document.createElement('button');
        filter.className = 'wuxing-filter';
        filter.dataset.wuxing = el.name;
        filter.textContent = `${el.name}(${el.alias})`;
        Object.assign(filter.style, {
            padding: '8px 15px',
            backgroundColor: el.color,
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: el.textColor,
            fontFamily: '"KaiTi", "楷体", serif',
            fontSize: '16px'
        });
        filter.addEventListener('click', () => {
            filterColors(el.name);
            document.querySelectorAll('.wuxing-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
        });
        filtersContainer.appendChild(filter);
    });
    const colorGrid = document.getElementById('color-grid');
    colorGrid && colorGrid.prepend(filtersContainer);
}

function filterColors(wuxingName) {
    document.querySelectorAll('.wuxing-color-group').forEach(group => {
        group.style.display = wuxingName === 'all' || group.dataset.wuxing === wuxingName ? 'block' : 'none';
    });
}

function reorganizeColorsIntoGrid() {
    const containers = document.querySelectorAll('.colors-container');
    if (!containers.length) return setTimeout(reorganizeColorsIntoGrid, 500);
    const gridContainer = document.createElement('div');
    gridContainer.className = 'color-grid-layout';
    Object.assign(gridContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    });
    const wuxingGroups = document.querySelectorAll('.wuxing-group-header');
    wuxingGroups.forEach((groupHeader, index) => {
        const titleElement = groupHeader.querySelector('.wuxing-group-title');
        if (!titleElement) return;
        const [, colorName, wuxingName] = titleElement.textContent.match(/(\S+)色 - (\S+)/) || [];
        if (!wuxingName) return;
        const container = containers[index];
        if (!container) return;
        const colorGroup = document.createElement('div');
        colorGroup.className = 'wuxing-color-group';
        colorGroup.dataset.wuxing = wuxingName;
        Object.assign(colorGroup.style, {
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
        });
        const wuxingElement = wuxingElements.find(el => el.name === wuxingName);
        if (wuxingElement) {
            colorGroup.style.borderLeft = `5px solid ${wuxingElement.color}`;
        }
        const groupTitleElement = document.createElement('div');
        groupTitleElement.className = 'color-group-title';
        groupTitleElement.innerHTML = `<div class="wuxing-group-title">${colorName}色 - ${wuxingName}</div>${
            groupHeader.querySelector('.wuxing-group-subtitle')?.outerHTML || ''
        }`;
        Object.assign(groupTitleElement.style, {
            marginBottom: '15px',
            padding: '8px 0',
            borderBottom: '2px solid rgba(255,255,255,0.2)'
        });
        if (wuxingElement) {
            const wuxingIcon = document.createElement('div');
            wuxingIcon.className = 'wuxing-icon';
            wuxingIcon.textContent = wuxingName;
            Object.assign(wuxingIcon.style, {
                display: 'inline-block',
                backgroundColor: wuxingElement.color,
                color: wuxingElement.textColor,
                width: '30px',
                height: '30px',
                lineHeight: '30px',
                textAlign: 'center',
                borderRadius: '50%',
                marginRight: '10px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            });
            groupTitleElement.querySelector('.wuxing-group-title').prepend(wuxingIcon);
        }
        colorGroup.appendChild(groupTitleElement);
        const colorsGrid = document.createElement('div');
        colorsGrid.className = 'colors-grid';
        Object.assign(colorsGrid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '25px',
            justifyItems: 'center',
            width: '100%'
        });
        const colorOptions = Array.from(container.querySelectorAll('.color-option'));
        const colorNames = Array.from(container.querySelectorAll('.color-name'));
        const colorItems = colorOptions.map((opt, i) => ({ option: opt, name: colorNames[i] }));
        colorItems.sort((a, b) => {
            const aColor = getComputedStyle(a.option).backgroundColor.match(/\d+/g).map(Number);
            const bColor = getComputedStyle(b.option).backgroundColor.match(/\d+/g).map(Number);
            const aBrightness = 0.299 * aColor[0] + 0.587 * aColor[1] + 0.114 * aColor[2];
            const bBrightness = 0.299 * bColor[0] + 0.587 * bColor[1] + 0.114 * bColor[2];
            return bBrightness - aBrightness;
        });
        colorItems.forEach(({ option: colorOption, name: colorName }) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            Object.assign(colorItem.style, {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s ease',
                width: '100%',
                padding: '10px'
            });
            const newColorOption = colorOption.cloneNode(true);
            newColorOption.classList.remove('selected');
            Object.assign(newColorOption.style, {
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
            });
            colorItem.addEventListener('mouseover', () => {
                colorItem.style.transform = 'translateY(-5px)';
                newColorOption.style.boxShadow = '0 5px 15px rgba(0,0,0,0.25)';
            });
            colorItem.addEventListener('mouseout', () => {
                colorItem.style.transform = 'translateY(0)';
                newColorOption.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            });
            newColorOption.addEventListener('click', () => {
                colorOption.click();
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                document.querySelectorAll('.colors-grid .color-option').forEach(opt => opt.classList.remove('selected'));
                newColorOption.classList.add('selected');
            });
            const newColorName = document.createElement('div');
            newColorName.className = 'color-name';
            newColorName.textContent = colorName?.textContent || '';
            Object.assign(newColorName.style, {
                fontSize: '12px',
                textAlign: 'center',
                width: '100%',
                height: '36px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                webkitLineClamp: '2',
                webkitBoxOrient: 'vertical',
                lineHeight: '18px'
            });
            colorItem.append(newColorOption, newColorName);
            colorsGrid.appendChild(colorItem);
        });
        colorGroup.appendChild(colorsGrid);
        gridContainer.appendChild(colorGroup);
    });
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
        const filtersContainer = colorGrid.querySelector('.wuxing-filters');
        colorGrid.innerHTML = '';
        filtersContainer && colorGrid.appendChild(filtersContainer);
        colorGrid.appendChild(gridContainer);
    }
    containers.forEach(c => c.style.display = 'none');
}

function addCustomStyles() {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
.wuxing-filter.active{background-color:rgba(255,255,255,.4)!important;transform:scale(1.05);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.color-item:hover .color-name{font-weight:700}
.color-option.selected{transform:scale(1.05);box-shadow:0 5px 15px rgba(0,0,0,.25)!important;border:2px solid #fff!important}
#color-grid{overscroll-behavior:contain}
#color-grid::-webkit-scrollbar{width:8px}
#color-grid::-webkit-scrollbar-track{background:rgba(255,255,255,.1);border-radius:4px}
#color-grid::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:4px}
#color-grid::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.5)}
.wuxing-color-group{margin-bottom:20px;border-radius:8px;transition:all .3s ease}
.wuxing-color-group:hover{box-shadow:0 5px 15px rgba(0,0,0,.1)}
.color-name{margin-top:8px;font-size:12px!important;line-height:1.5!important;height:36px!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;text-overflow:ellipsis!important}
.wuxing-group-title{font-size:18px;font-weight:700;font-family:"KaiTi","楷体",serif;color:#fff;display:flex;align-items:center}
.color-description-container{display:block!important;margin-bottom:15px}
#related-music-container{margin-top:20px;padding:15px;border-radius:8px;background-color:rgba(255,255,255,.1);overflow:visible;max-height:none}
@media (max-width:992px){.colors-grid{grid-template-columns:repeat(4,1fr)!important}}
@media (max-width:768px){.main-content{grid-template-columns:1fr!important;grid-template-areas:"color-area" "wuxing-area" "sidebar"!important}.colors-grid{grid-template-columns:repeat(3,1fr)!important}.color-item{margin-bottom:5px}.sidebar{position:static!important;max-width:100%!important}}
    `;
    document.head.appendChild(styleTag);
}