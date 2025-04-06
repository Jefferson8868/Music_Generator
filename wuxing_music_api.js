// 五色音乐匹配API处理模块

// 五行系统映射关系
const WUXING_SYSTEM = {
    '木': { '色': '青', '音': '角', '情': ['生长', '希望', '平和', '安宁'] },
    '火': { '色': '赤', '音': '徵', '情': ['热情', '兴奋', '喜悦', '激昂'] },
    '土': { '色': '黄', '音': '宫', '情': ['稳重', '中正', '祥和', '温暖'] },
    '金': { '色': '白', '音': '商', '情': ['肃穆', '清澈', '悲伤', '凄凉'] },
    '水': { '色': '黑', '音': '羽', '情': ['神秘', '深沉', '恐惧', '压抑'] }
};

// 五色到五情的简化映射
const COLOR_TO_EMOTION = {
    '青': '怒',
    '赤': '喜',
    '黄': '思',
    '白': '忧',
    '黑': '恐'
};

/**
 * 将颜色值数组转换为五色序列
 * @param {Array} colorValues - 五色数值 [青, 赤, 黄, 白, 黑]
 * @returns {Array} 五色序列
 */
function convertToColorSequence(colorValues) {
    const colors = ['青', '赤', '黄', '白', '黑'];
    const sequence = [];
    
    // 将比例转换为数量（总共100个）
    const total = colorValues.reduce((a, b) => a + b, 0);
    colorValues.forEach((value, index) => {
        const count = Math.round((value / total) * 100);
        sequence.push(...Array(count).fill(colors[index]));
    });
    
    return sequence;
}

/**
 * 发送五色数值到Python后端进行音乐匹配
 * @param {Array} colorValues - 五色数值数组 [青, 赤, 黄, 白, 黑]
 * @returns {Promise} 匹配结果的Promise
 */
async function findMatchingMusic(colorValues) {
    try {
        const response = await fetch('/api/match-music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ color_values: colorValues })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error finding matching music:', error);
        throw error;
    }
}

/**
 * 更新UI显示匹配结果
 * @param {Object} matchResult - 匹配结果
 */
function updateMatchResult(matchResult) {
    // 更新五音分布
    const toneDistribution = matchResult.tone_distribution;
    updateToneDistribution(toneDistribution);
    
    // 更新情绪特征
    const emotionProfile = matchResult.emotion_profile;
    updateEmotionProfile(emotionProfile);
    
    // 更新相似音乐列表
    const similarMusic = matchResult.similar_music;
    updateSimilarMusicList(similarMusic);
}

/**
 * 更新五音分布显示
 * @param {Object} distribution - 五音分布数据
 */
function updateToneDistribution(distribution) {
    const toneNames = {
        '宫': 'gong',
        '商': 'shang',
        '角': 'jue',
        '徵': 'zhi',
        '羽': 'yu'
    };
    
    Object.entries(distribution).forEach(([tone, value]) => {
        const percentage = (value * 100).toFixed(2);
        const element = document.querySelector(`.wuyin-${toneNames[tone]}`);
        if (element) {
            element.style.width = `${percentage}%`;
            element.textContent = `${tone}: ${percentage}%`;
        }
    });
}

/**
 * 更新情绪特征显示
 * @param {Object} profile - 情绪特征数据
 */
function updateEmotionProfile(profile) {
    const emotionContainer = document.querySelector('.emotion-container');
    if (emotionContainer) {
        const emotionList = Object.entries(profile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([emotion, value]) => {
                const percentage = (value * 100).toFixed(2);
                return `<div class="emotion-item">
                    <span class="emotion-name">${emotion}</span>
                    <span class="emotion-value">${percentage}%</span>
                </div>`;
            })
            .join('');
        
        emotionContainer.innerHTML = `
            <div class="emotion-title">情绪特征分析</div>
            <div class="emotion-list">${emotionList}</div>
        `;
    }
}

/**
 * 更新相似音乐列表显示
 * @param {Array} musicList - 相似音乐列表
 */
function updateSimilarMusicList(musicList) {
    const container = document.querySelector('#similar-music-container');
    if (container) {
        const musicItems = musicList.map(music => {
            const similarity = (music.similarity * 100).toFixed(2);
            return `
                <div class="similar-music-item">
                    <div class="music-name">${music.file_name}</div>
                    <div class="similarity-score">相似度: ${similarity}%</div>
                    <div class="similarity-details">
                        <div>五音相似度: ${(music.tone_similarity * 100).toFixed(2)}%</div>
                        <div>情绪相似度: ${(music.emotion_similarity * 100).toFixed(2)}%</div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="similar-music-title">匹配音乐</div>
            <div class="similar-music-list">${musicItems}</div>
        `;
    }
}

// 导出API函数
export {
    convertToColorSequence,
    findMatchingMusic,
    updateMatchResult
};