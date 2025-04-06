/**
 * 音乐匹配算法 - 基于五音、五色和音乐特性
 * 建立五色（青、赤、黄、白、黑）与五音（角、徵、宫、商、羽）的对应关系
 * 通过分析音乐特性和计算五音值比例来匹配音乐
 */

// 五音五色对应关系
const wuxingToWuyin = {
    // 五行与五音的对应关系
    "木": { yin: "角", color: "青" },  // 木对应角音，青色
    "火": { yin: "徵", color: "赤" },  // 火对应徵音，赤色
    "土": { yin: "宫", color: "黄" },  // 土对应宫音，黄色
    "金": { yin: "商", color: "白" },  // 金对应商音，白色
    "水": { yin: "羽", color: "黑" }   // 水对应羽音，黑色
};

// 五音特性和情绪映射
const wuyinCharacteristics = {
    "宫": {
        tone: "do", // 对应C调
        emotions: ["稳重", "平和", "祥和", "中庸", "大气"],
        musicStyles: ["中国传统宫调", "古典", "奏鸣曲", "协奏曲"],
        tempo: "中速", // 中速 (中庸)
        characteristics: {
            // 音乐特性 (1-10分)
            fastSlow: 5,  // 快缓度: 中等
            highLow: 5,   // 音高: 中等
            tightLoose: 5 // 紧松度: 中等
        }
    },
    "商": {
        tone: "re", // 对应D调
        emotions: ["肃杀", "清澈", "清冷", "凛冽", "洁净"],
        musicStyles: ["中国传统商调", "古典", "进行曲", "交响乐"],
        tempo: "中快", // 中快速
        characteristics: {
            fastSlow: 6,  // 快缓度: 中快
            highLow: 6,   // 音高: 中高
            tightLoose: 7 // 紧松度: 较紧
        }
    },
    "角": {
        tone: "mi", // 对应E调
        emotions: ["舒缓", "生长", "清新", "温柔", "优雅"],
        musicStyles: ["中国传统角调", "古典", "室内乐", "轻音乐"],
        tempo: "缓慢", // 缓慢舒展
        characteristics: {
            fastSlow: 3,  // 快缓度: 较慢
            highLow: 7,   // 音高: 较高
            tightLoose: 3 // 紧松度: 松弛
        }
    },
    "徵": {
        tone: "sol", // 对应G调
        emotions: ["热情", "欢快", "激昂", "喜悦", "振奋"],
        musicStyles: ["中国传统徵调", "古典", "进行曲", "舞曲"],
        tempo: "快速", // 快速热烈
        characteristics: {
            fastSlow: 8,  // 快缓度: 快
            highLow: 8,   // 音高: 高
            tightLoose: 8 // 紧松度: 紧张
        }
    },
    "羽": {
        tone: "la", // 对应A调
        emotions: ["深沉", "内敛", "悠远", "神秘", "静谧"],
        musicStyles: ["中国传统羽调", "古典", "叙事曲", "夜曲"],
        tempo: "慢速", // 慢速深沉
        characteristics: {
            fastSlow: 2,  // 快缓度: 慢
            highLow: 3,   // 音高: 低
            tightLoose: 4 // 紧松度: 较松
        }
    }
};

// 音乐文件特性库 - 基于中国音乐文件名分析
const musicFileCharacteristics = {
    // 这个对象用于存储所有音乐文件的特性分析结果
};

/**
 * 分析音乐文件特性
 * @param {string} filename - 音乐文件名
 * @returns {Object} - 音乐特性数据
 */
function analyzeMusicFile(filename) {
    // 如果已经分析过，直接返回结果
    if (musicFileCharacteristics[filename]) {
        return musicFileCharacteristics[filename];
    }
    
    // 分析文件名中的关键词，推断音乐特性
    const keywords = {
        // 情绪关键词
        "悲伤": { dominantYin: "羽", fastSlow: 3, highLow: 4, tightLoose: 5 },
        "哀伤": { dominantYin: "羽", fastSlow: 2, highLow: 3, tightLoose: 4 },
        "伤感": { dominantYin: "羽", fastSlow: 3, highLow: 4, tightLoose: 5 },
        "忧愁": { dominantYin: "羽", fastSlow: 2, highLow: 3, tightLoose: 4 },
        "凄凉": { dominantYin: "羽", fastSlow: 2, highLow: 3, tightLoose: 5 },
        "压抑": { dominantYin: "羽", fastSlow: 3, highLow: 3, tightLoose: 7 },
        
        "欢快": { dominantYin: "徵", fastSlow: 8, highLow: 7, tightLoose: 4 },
        "喜悦": { dominantYin: "徵", fastSlow: 7, highLow: 7, tightLoose: 5 },
        "愉悦": { dominantYin: "徵", fastSlow: 7, highLow: 6, tightLoose: 4 },
        "快乐": { dominantYin: "徵", fastSlow: 8, highLow: 7, tightLoose: 4 },
        "高兴": { dominantYin: "徵", fastSlow: 7, highLow: 7, tightLoose: 5 },
        "搞笑": { dominantYin: "徵", fastSlow: 8, highLow: 7, tightLoose: 3 },
        
        "舒缓": { dominantYin: "角", fastSlow: 3, highLow: 5, tightLoose: 3 },
        "温柔": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 3 },
        "优美": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 3 },
        "清新": { dominantYin: "角", fastSlow: 5, highLow: 7, tightLoose: 3 },
        "轻快": { dominantYin: "角", fastSlow: 6, highLow: 6, tightLoose: 3 },
        "优雅": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 3 },
        
        "平和": { dominantYin: "宫", fastSlow: 5, highLow: 5, tightLoose: 5 },
        "大气": { dominantYin: "宫", fastSlow: 5, highLow: 5, tightLoose: 6 },
        "雄壮": { dominantYin: "宫", fastSlow: 5, highLow: 6, tightLoose: 7 },
        "宏伟": { dominantYin: "宫", fastSlow: 5, highLow: 6, tightLoose: 7 },
        "厚重": { dominantYin: "宫", fastSlow: 4, highLow: 4, tightLoose: 6 },
        "庄严": { dominantYin: "宫", fastSlow: 4, highLow: 5, tightLoose: 7 },
        
        "肃杀": { dominantYin: "商", fastSlow: 6, highLow: 5, tightLoose: 8 },
        "紧张": { dominantYin: "商", fastSlow: 7, highLow: 5, tightLoose: 8 },
        "激烈": { dominantYin: "商", fastSlow: 8, highLow: 6, tightLoose: 9 },
        "战斗": { dominantYin: "商", fastSlow: 8, highLow: 6, tightLoose: 9 },
        "进行": { dominantYin: "商", fastSlow: 6, highLow: 5, tightLoose: 7 },
        "威严": { dominantYin: "商", fastSlow: 5, highLow: 5, tightLoose: 8 },
        
        // 风格关键词
        "古风": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 4 },
        "笛子": { dominantYin: "角", fastSlow: 4, highLow: 7, tightLoose: 3 },
        "钢琴": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 4 },
        "小提琴": { dominantYin: "商", fastSlow: 5, highLow: 7, tightLoose: 5 },
        "民乐": { dominantYin: "宫", fastSlow: 5, highLow: 6, tightLoose: 4 },
        "红色": { dominantYin: "徵", fastSlow: 6, highLow: 6, tightLoose: 6 },
        
        // 场景关键词
        "婚礼": { dominantYin: "角", fastSlow: 4, highLow: 6, tightLoose: 4 },
        "电影": { dominantYin: "羽", fastSlow: 4, highLow: 5, tightLoose: 6 },
        "朗诵": { dominantYin: "宫", fastSlow: 4, highLow: 5, tightLoose: 5 },
        "演讲": { dominantYin: "宫", fastSlow: 5, highLow: 5, tightLoose: 6 },
        "年会": { dominantYin: "徵", fastSlow: 7, highLow: 6, tightLoose: 7 },
        "党政": { dominantYin: "宫", fastSlow: 4, highLow: 5, tightLoose: 6 },
        
        // 动态关键词
        "激昂": { dominantYin: "徵", fastSlow: 7, highLow: 7, tightLoose: 7 },
        "燃": { dominantYin: "徵", fastSlow: 8, highLow: 7, tightLoose: 8 },
        "动感": { dominantYin: "徵", fastSlow: 8, highLow: 6, tightLoose: 6 },
        "轻柔": { dominantYin: "角", fastSlow: 3, highLow: 6, tightLoose: 2 },
        "安静": { dominantYin: "羽", fastSlow: 2, highLow: 4, tightLoose: 3 },
        "震撼": { dominantYin: "商", fastSlow: 6, highLow: 6, tightLoose: 8 }
    };
    
    // 匹配文件名中的关键词
    const fileName = filename.toLowerCase();
    
    // 初始化特性值
    let dominantYinCounts = {
        "宫": 0,
        "商": 0,
        "角": 0,
        "徵": 0,
        "羽": 0
    };
    
    let fastSlow = 0;
    let highLow = 0;
    let tightLoose = 0;
    let matchCount = 0;
    
    // 遍历关键词字典
    for (const keyword in keywords) {
        if (fileName.includes(keyword)) {
            const characteristics = keywords[keyword];
            dominantYinCounts[characteristics.dominantYin]++;
            fastSlow += characteristics.fastSlow;
            highLow += characteristics.highLow;
            tightLoose += characteristics.tightLoose;
            matchCount++;
        }
    }
    
    // 如果没有匹配到关键词，使用默认值
    if (matchCount === 0) {
        // 默认为中性特性
        fastSlow = 5;
        highLow = 5;
        tightLoose = 5;
        
        // 从文件名推断一个主导五音
        if (fileName.includes("伤") || fileName.includes("悲") || fileName.includes("忧")) {
            dominantYinCounts["羽"] = 1;
        } else if (fileName.includes("快") || fileName.includes("喜") || fileName.includes("乐")) {
            dominantYinCounts["徵"] = 1;
        } else if (fileName.includes("缓") || fileName.includes("柔") || fileName.includes("美")) {
            dominantYinCounts["角"] = 1;
        } else if (fileName.includes("壮") || fileName.includes("大") || fileName.includes("庄")) {
            dominantYinCounts["宫"] = 1;
        } else if (fileName.includes("紧") || fileName.includes("急") || fileName.includes("战")) {
            dominantYinCounts["商"] = 1;
        } else {
            // 真的无法推断，随机给一个宫调
            dominantYinCounts["宫"] = 1;
        }
        
        matchCount = 1;
    }
    
    // 计算平均值
    fastSlow = Math.round(fastSlow / matchCount);
    highLow = Math.round(highLow / matchCount);
    tightLoose = Math.round(tightLoose / matchCount);
    
    // 确定主导五音
    let dominantYin = "宫"; // 默认
    let maxCount = 0;
    
    for (const yin in dominantYinCounts) {
        if (dominantYinCounts[yin] > maxCount) {
            maxCount = dominantYinCounts[yin];
            dominantYin = yin;
        }
    }
    
    // 计算五音比例 - 基于主导五音和其他特性
    const wuyinRatio = calculateWuyinRatio(dominantYin, fastSlow, highLow, tightLoose);
    
    // 创建并保存音乐特性
    const musicCharacteristics = {
        fastSlow,
        highLow,
        tightLoose,
        dominantYin,
        wuyinRatio
    };
    
    // 保存到特性库
    musicFileCharacteristics[filename] = musicCharacteristics;
    
    return musicCharacteristics;
}

/**
 * 计算五音比例
 * @param {string} dominantYin - 主导五音
 * @param {number} fastSlow - 快缓度 (1-10)
 * @param {number} highLow - 音高 (1-10)
 * @param {number} tightLoose - 紧松度 (1-10)
 * @returns {Object} - 五音比例
 */
function calculateWuyinRatio(dominantYin, fastSlow, highLow, tightLoose) {
    // 基于主导五音的初始比例
    const ratio = {
        "宫": 0.1, // 基础值
        "商": 0.1,
        "角": 0.1,
        "徵": 0.1,
        "羽": 0.1
    };
    
    // 增加主导五音的比例
    ratio[dominantYin] += 0.5; // 主导音占50%
    
    // 基于特性调整其他五音比例
    // 1. 快缓度影响宫和徵
    if (fastSlow > 7) { // 快
        ratio["徵"] += 0.1;
        ratio["商"] += 0.05;
    } else if (fastSlow < 4) { // 慢
        ratio["羽"] += 0.1;
        ratio["角"] += 0.05;
    } else { // 中等
        ratio["宫"] += 0.1;
    }
    
    // 2. 音高影响角和羽
    if (highLow > 7) { // 高
        ratio["角"] += 0.05;
        ratio["徵"] += 0.05;
    } else if (highLow < 4) { // 低
        ratio["羽"] += 0.1;
    }
    
    // 3. 紧松度影响商和角
    if (tightLoose > 7) { // 紧张
        ratio["商"] += 0.1;
    } else if (tightLoose < 4) { // 松弛
        ratio["角"] += 0.1;
    }
    
    // 归一化比例，确保总和为1
    let total = 0;
    for (const yin in ratio) {
        total += ratio[yin];
    }
    
    for (const yin in ratio) {
        ratio[yin] = ratio[yin] / total;
    }
    
    return ratio;
}

/**
 * 从五色值计算五音值
 * @param {Object} wuxingPercentages - 五色占比 (e.g. { qing: 30, chi: 20, huang: 15, bai: 20, hei: 15 })
 * @returns {Object} - 五音值占比 (e.g. { 角: 0.3, 徵: 0.2, 宫: 0.15, 商: 0.2, 羽: 0.15 })
 */
function calculateWuyinValuesFromColors(wuxingPercentages) {
    // 五色到五音的映射
    const colorToYin = {
        "qing": "角",  // 青色对应角音
        "chi": "徵",   // 赤色对应徵音
        "huang": "宫", // 黄色对应宫音
        "bai": "商",   // 白色对应商音
        "hei": "羽"    // 黑色对应羽音
    };
    
    // 计算五音值
    const wuyinValues = {
        "角": wuxingPercentages.qing / 100,  // 青色对应角音
        "徵": wuxingPercentages.chi / 100,   // 赤色对应徵音
        "宫": wuxingPercentages.huang / 100, // 黄色对应宫音
        "商": wuxingPercentages.bai / 100,   // 白色对应商音
        "羽": wuxingPercentages.hei / 100    // 黑色对应羽音
    };
    
    return wuyinValues;
}

/**
 * 计算音乐与五音值的相似度
 * @param {Object} musicCharacteristics - 音乐特性数据
 * @param {Object} targetWuyinValues - 目标五音值
 * @returns {number} - 相似度分数 (0-100)
 */
function calculateMusicSimilarity(musicCharacteristics, targetWuyinValues) {
    if (!musicCharacteristics || !musicCharacteristics.wuyinRatio) {
        return 0; // 无法计算相似度
    }
    
    // 1. 计算五音比例相似度 (70%权重)
    let yinSimilarityScore = 0;
    let totalYinWeight = 0;
    
    // 遍历五音，计算加权相似度
    Object.keys(targetWuyinValues).forEach(yin => {
        // 获取目标五音值和音乐中的五音比例
        const targetValue = targetWuyinValues[yin];
        const musicValue = musicCharacteristics.wuyinRatio[yin] || 0;
        
        // 计算此五音的相似度（1 - 差值的绝对值）
        const yinSimilarity = 1 - Math.abs(targetValue - musicValue);
        
        // 权重：目标五音值越高，权重越大
        const weight = targetValue * 2 + 0.5; // 确保每个五音都有基础权重
        
        // 累加加权相似度
        yinSimilarityScore += yinSimilarity * weight;
        totalYinWeight += weight;
    });
    
    // 归一化五音相似度分数 (0-1)
    if (totalYinWeight > 0) {
        yinSimilarityScore = yinSimilarityScore / totalYinWeight;
    }
    
    // 2. 计算风格特性相似度 (30%权重)
    // 获取五音特性
    const dominantYin = getDominantYin(targetWuyinValues);
    const targetCharacteristics = wuyinCharacteristics[dominantYin].characteristics;
    
    // 计算特性相似度
    const fastSlowSimilarity = 1 - Math.abs(targetCharacteristics.fastSlow - musicCharacteristics.fastSlow) / 10;
    const highLowSimilarity = 1 - Math.abs(targetCharacteristics.highLow - musicCharacteristics.highLow) / 10;
    const tightLooseSimilarity = 1 - Math.abs(targetCharacteristics.tightLoose - musicCharacteristics.tightLoose) / 10;
    
    // 合并特性相似度 (权重可调整)
    const characteristicsSimilarity = (fastSlowSimilarity * 0.4 + highLowSimilarity * 0.3 + tightLooseSimilarity * 0.3);
    
    // 3. 合并五音相似度和特性相似度
    const finalSimilarity = yinSimilarityScore * 0.7 + characteristicsSimilarity * 0.3;
    
    // 将分数映射到0-100范围并四舍五入到整数
    return Math.min(Math.round(finalSimilarity * 100), 100);
}

/**
 * 获取五音值中占比最高的五音
 * @param {Object} wuyinValues - 五音值
 * @returns {string} - 主导五音
 */
function getDominantYin(wuyinValues) {
    let maxYin = "宫"; // 默认
    let maxValue = 0;
    
    for (const yin in wuyinValues) {
        if (wuyinValues[yin] > maxValue) {
            maxValue = wuyinValues[yin];
            maxYin = yin;
        }
    }
    
    return maxYin;
}

/**
 * 根据五行属性和五色值寻找相似的音乐
 * @param {Object} wuxingElement - 五行元素数据 (e.g. { wuxing: "木", color: "青", ... })
 * @param {Object} wuxingPercentages - 五色占比 (e.g. { qing: 30, chi: 20, huang: 15, bai: 20, hei: 15 })
 * @returns {Promise<Array>} - 返回最相似的5首音乐及其相似度
 */
async function findSimilarMusic(wuxingElement, wuxingPercentages) {
    try {
        // 获取音乐文件列表
        const musicFiles = await getMusicFiles();
        
        // 计算目标五音值
        const targetWuyinValues = calculateWuyinValuesFromColors(wuxingPercentages);
        
        // 计算每个音乐文件的特性和相似度
        const rankedMusic = musicFiles.map(musicFile => {
            // 分析音乐文件特性 (关键步骤，使用真实音乐特性而非随机值)
            const musicCharacteristics = analyzeMusicFile(musicFile);
            
            // 计算相似度
            const similarity = calculateMusicSimilarity(musicCharacteristics, targetWuyinValues);
            
            return {
                filename: musicFile,
                similarity: similarity,
                dominantYin: musicCharacteristics.dominantYin
            };
        });
        
        // 按相似度排序（降序）
        rankedMusic.sort((a, b) => b.similarity - a.similarity);
        
        // 返回相似度最高的5首音乐
        return rankedMusic.slice(0, 5);
    } catch (error) {
        console.error('查找相似音乐时出错:', error);
        return [];
    }
}

/**
 * 获取音乐文件列表
 * @returns {Promise<Array>} - 音乐文件名数组
 */
async function getMusicFiles() {
    try {
        // 这里我们直接返回从您提供的文件夹中读取的音乐文件列表
        return [
            '抒情大气充满力量和喜悦的背景音乐荣耀火焰.mp3',
            '温馨宣传片背景音乐.mp3',
            '浪漫风格轻快舒缓背景音乐.mp3',
            '悲伤伟大欣慰的演讲背景音乐.mp3',
            '悲伤紧张的背景音乐.mp3',
            '红色经典背景音乐(我的祖国).mp3',
            '渐入佳境灵动逐渐升起宣传片背景音乐.mp3',
            '电视台抗震节目悲伤背景音乐.mp3',
            '舒缓安静美好的演讲背景音乐.mp3',
            '紧张震撼奋斗色彩的背景音乐.mp3',
            '大气超燃的年会背景音乐.mp3',
            '董事长及公司高层进场背景音乐.mp3',
            '一段悠扬的笛子旋律优美古风古韵背景音乐.mp3',
            '婚礼音乐-3矜持 小提琴版 婚礼前抒情背景音乐.mp3',
            '感人进取动情的演讲背景音乐.mp3',
            '激昂前进拼搏背景音乐.mp3',
            '感人欣慰动情的演讲背景音乐.mp3',
            '欢快愉悦的活动宣传片背景音乐.mp3',
            '安静舒缓优柔古风钢琴曲影视游戏背景音乐.mp3',
            '朗诵背景音乐(雄浑气魄)3.mp3',
            '史诗魔幻壮观大气的年会背景音乐.mp3',
            '欢快搞怪背景音乐配乐.mp3',
            '现代活泼小清新活动背景音乐.mp3',
            '故事的起点温柔舒缓背景音乐.mp3',
            '浪漫感人婚礼背景音乐.mp3',
            '动感激情高昂的背景音乐.mp3',
            '愉快快节奏高兴的背景音乐.mp3',
            '成长艰难成功感动的背景音乐.mp3',
            '悲伤感人安静纯音乐背景音乐.mp3',
            '久石譲 Summer儿童诗朗诵背景音乐.mp3',
            '纯音乐 搞笑背景音乐.mp3',
            '古风大气激昂背景音乐.mp3',
            '宁静舒心的儿童节目背景音乐.mp3',
            '欢快活泼的儿童节目背景音乐.mp3',
            '气势进取的知名手机品牌宣传片背景音乐.mp3',
            '紧张危险刺激色彩的好莱坞背景音乐.mp3',
            '动感欢快的公司年会背景音乐.mp3',
            '温馨浪漫的背景音乐.mp3',
            '抒情诗文朗诵背景音乐 (13).mp3',
            '故事叙事抒情背景音乐 (2).mp3',
            '悲伤感动催泪好莱坞背景音乐.mp3',
            '安静感人动情的演讲背景音乐.mp3',
            '安静悲伤压抑背景音乐.mp3',
            '平静温柔史诗级的城市宣传片背景音乐.mp3',
            '诗歌语文朗诵背景音乐 (19).mp3',
            '安静恬静经典广告背景音乐.mp3',
            '欢快舒缓轻松愉快背景音乐.mp3',
            '安静感人的儿童背景音乐.mp3',
            '游戏和我们充满童趣的幽默节奏感背景音乐.mp3',
            '悬念紧张好莱坞背景音乐.mp3',
            '现代科技感广告背景音乐.mp3',
            '安静舒缓的党政会议背景音乐.mp3',
            '欢快轻快节奏兴奋背景音乐.mp3',
            '欣慰满足的演讲背景音乐.mp3',
            '进取向上快乐的背景音乐.mp3',
            '诗歌朗诵背景音乐 (10).mp3',
            '抒情诗文朗诵背景音乐 (27).mp3',
            '搞笑滑稽节奏快的综艺节目背景音乐.mp3',
            '炫酷略搞笑综艺节目背景音乐.mp3',
            '浪漫感人婚礼背景音乐建一个家.mp3',
            '轻快旋律优美的背景音乐.mp3',
            '悠然古朴的国家宝藏背景音乐.mp3',
            '展望未来光明的航拍背景音乐.mp3',
            '万宝路进行曲舞台颁奖专业背景音乐.mp3',
            '欢快带节奏的电音作运动舞蹈背景音乐设计.mp3',
            '公司聚会表彰背景音乐红毯.mp3',
            '动感帅气时尚的背景音乐.mp3',
            '紧张激烈战斗色彩的背景音乐.mp3',
            '舒缓震撼唯美大气的航拍背景音乐.mp3',
            '安静舒缓钢弹奏回忆满满背景音乐.mp3',
            '儿童诗朗诵背景音乐视频vlog背景音乐.mp3',
            '胜利的号角革命视频背景音乐.mp3',
            '回忆往昔岁月的感人视频背景音乐.mp3',
            '感动震撼激动的演讲背景音乐.mp3',
            '史诗级背景音乐《victory》，太震撼了！.mp3',
            '紧张进取激情背景音乐.mp3',
            '搞笑轻松喜庆背景音乐.mp3',
            '浪漫温馨美好的婚礼背景音乐.mp3',
            '欢快轻松的广告背景音乐.mp3',
            '低沉凄凉的背景音乐灰色空间.mp3',
            '感动温馨色彩的背景音乐.mp3',
            '抒情会议背景音乐党政回忆过去.mp3',
            '欢乐节奏感舒畅视频背景音乐.mp3',
            '夜店快节奏超燃节奏感背景音乐.mp3',
            '拯救舒缓大气背景音乐感恩节复活节.mp3',
            '破坏分子搞笑滑稽综艺感背景音乐.mp3',
            '悠扬笛子安静唯美古风中秋节赏月背景音乐.mp3',
            '抒情诗文朗诵背景音乐 (34).mp3',
            '正能量积极向上宣传片背景音乐.mp3',
            '超燃运动健身背景音乐无穷.mp3',
            '感人感动震撼唯美的航拍背景音乐.mp3',
            '悲伤伤感忧愁的背景音乐.mp3',
            '节奏感重鼓点汽车广告背景音乐.mp3',
            '浪漫青春美好温馨的背景音乐.mp3',
            '冬至动感轻快的商务背景音乐.mp3',
            '轻松愉悦朗诵纯背景音乐.mp3',
            '极限挑战紧张气氛背景音乐.mp3',
            '史诗级进取昂扬的航拍背景音乐.mp3',
            '感伤唯美爱情背景音乐.mp3',
            '欢快古风背景音乐vlog音乐.mp3'
        ];
    } catch (error) {
        console.error('获取音乐文件列表时出错:', error);
        return [];
    }
}

/**
 * 获取音乐的预览URL
 * @param {string} filename - 音乐文件名
 * @returns {string} - 音乐文件URL
 */
function getMusicPreviewUrl(filename) {
    return `src/music_files/${filename}`;
}

/**
 * 获取五音对应的文本描述
 * @param {string} yinName - 五音名称
 * @returns {string} - 五音描述
 */
function getWuyinDescription(yinName) {
    const yinData = wuyinCharacteristics[yinName];
    if (!yinData) return '';
    
    return `${yinName}音：${yinData.emotions.join('、')}`;
}

/**
 * 显示相似音乐列表
 * @param {Array} similarMusic - 相似音乐列表
 * @param {string} containerSelector - 容器选择器
 */
function displaySimilarMusic(similarMusic, containerSelector = '#related-music-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    let html = `
        <div class="similar-music-title">五音相似音乐推荐</div>
        <div class="similar-music-list">
    `;
    
    similarMusic.forEach(music => {
        // 处理显示文件名（移除.mp3后缀并限制长度）
        let displayName = music.filename.replace(/\.mp3$/, '');
        if (displayName.length > 40) {
            displayName = displayName.substring(0, 37) + '...';
        }
        
        // 格式化相似度为整数百分比 (0-100之间)
        const similarityPercent = Math.min(music.similarity, 100);
        
        // 获取主导五音描述
        const yinDescription = music.dominantYin ? getWuyinDescription(music.dominantYin) : '';
        
        // 创建对应五音的类名
        const yinClass = music.dominantYin ? `wuyin-${getYinPinyin(music.dominantYin)}` : '';
        
        // 根据相似度设置边框颜色
        let borderStyle = '';
        if (music.dominantYin) {
            const wuxingColors = {
                "宫": "var(--huang-color)", // 黄色
                "商": "var(--bai-color)",   // 白色
                "角": "var(--qing-color)",  // 青色
                "徵": "var(--chi-color)",   // 赤色
                "羽": "var(--hei-color)"    // 黑色
            };
            borderStyle = `border-left-color: ${wuxingColors[music.dominantYin] || 'transparent'};`;
        }
        
        html += `
            <div class="similar-music-item" style="${borderStyle}">
                <div class="music-name">${displayName}</div>
                <div class="music-yin">
                    <span class="wuyin-tag ${yinClass}">${music.dominantYin ? `${music.dominantYin}音` : ''}</span>
                    <span class="similarity-score">相似度: ${similarityPercent}%</span>
                </div>
                <div class="yin-description">${yinDescription}</div>
                <audio controls src="${getMusicPreviewUrl(music.filename)}"></audio>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

/**
 * 将五音名称转换为拼音（用于CSS类名）
 * @param {string} yinName - 五音名称
 * @returns {string} - 对应的拼音
 */
function getYinPinyin(yinName) {
    const yinToPinyin = {
        "宫": "gong",
        "商": "shang",
        "角": "jue",
        "徵": "zhi",
        "羽": "yu"
    };
    
    return yinToPinyin[yinName] || '';
}

// 导出函数
window.MusicMatcher = {
    findSimilarMusic,
    displaySimilarMusic,
    calculateWuyinValuesFromColors
}; 