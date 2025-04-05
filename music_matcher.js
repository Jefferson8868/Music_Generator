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
 * 音频分析器类 - 使用Web Audio API分析音频特征
 */
class AudioAnalyzer {
    constructor() {
        // 创建AudioContext（如果浏览器支持）
        this.audioContext = null;
        if (window.AudioContext) {
            this.audioContext = new AudioContext();
        } else if (window.webkitAudioContext) {
            this.audioContext = new webkitAudioContext();
        }
        
        // 用于缓存已分析的文件
        this.analyzedFiles = {};
    }
    
    /**
     * 分析音频文件
     * @param {string} url - 音频文件URL
     * @returns {Promise<Object>} - 音频特征数据
     */
    async analyzeAudio(url) {
        // 如果没有AudioContext，返回null
        if (!this.audioContext) {
            console.warn('Web Audio API不受支持，无法分析音频');
            return null;
        }
        
        // 如果已分析过，直接返回结果
        if (this.analyzedFiles[url]) {
            return this.analyzedFiles[url];
        }
        
        try {
            // 获取音频数据
            console.log(`开始分析音频: ${url}`);
            const audioData = await this.loadAudioData(url);
            if (!audioData) {
                throw new Error('无法加载音频数据');
            }
            
            // 创建音频分析节点
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 2048;
            
            // 解码音频
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);
            
            // 创建音频源
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);
            
            // 分析频率分布
            const frequencyData = this.analyzeFrequencyDistribution(analyser);
            
            // 分析节奏
            const rhythmFeatures = this.analyzeRhythm(audioBuffer);
            
            // 分析音高
            const pitchFeatures = this.analyzePitch(audioBuffer, frequencyData);
            
            // 提取情感特征
            const emotionalFeatures = this.extractEmotionalFeatures(
                frequencyData, 
                rhythmFeatures, 
                pitchFeatures
            );
            
            // 转换为五音特征
            const wuyinFeatures = this.convertToWuyinFeatures(emotionalFeatures);
            
            // 缓存结果
            this.analyzedFiles[url] = wuyinFeatures;
            
            return wuyinFeatures;
        } catch (error) {
            console.error(`分析音频时出错: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 加载音频数据
     * @param {string} url - 音频文件URL
     * @returns {Promise<ArrayBuffer>} - 音频数据
     */
    async loadAudioData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`获取音频文件失败: ${response.status} ${response.statusText}`);
            }
            return await response.arrayBuffer();
        } catch (error) {
            console.error(`加载音频数据出错: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 分析频率分布
     * @param {AnalyserNode} analyser - 音频分析节点
     * @returns {Object} - 频率分布数据
     */
    analyzeFrequencyDistribution(analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        // 计算低、中、高频的能量
        const lowEnd = Math.floor(bufferLength * 0.2);
        const midEnd = Math.floor(bufferLength * 0.6);
        
        let lowFreqEnergy = 0;
        let midFreqEnergy = 0;
        let highFreqEnergy = 0;
        let totalEnergy = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            totalEnergy += value;
            
            if (i < lowEnd) {
                lowFreqEnergy += value;
            } else if (i < midEnd) {
                midFreqEnergy += value;
            } else {
                highFreqEnergy += value;
            }
        }
        
        // 归一化能量值
        const total = lowFreqEnergy + midFreqEnergy + highFreqEnergy;
        return {
            lowFreqRatio: total > 0 ? lowFreqEnergy / total : 0.33,
            midFreqRatio: total > 0 ? midFreqEnergy / total : 0.33,
            highFreqRatio: total > 0 ? highFreqEnergy / total : 0.33,
            energyLevel: totalEnergy / (bufferLength * 255) // 归一化总能量
        };
    }
    
    /**
     * 分析节奏
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     * @returns {Object} - 节奏特征
     */
    analyzeRhythm(audioBuffer) {
        const data = audioBuffer.getChannelData(0); // 使用第一个声道
        const sampleRate = audioBuffer.sampleRate;
        
        // 计算20ms帧的能量
        const frameSize = Math.floor(sampleRate * 0.02); // 20ms
        const numFrames = Math.floor(data.length / frameSize);
        const frameEnergies = [];
        
        for (let i = 0; i < numFrames; i++) {
            let energy = 0;
            const startIdx = i * frameSize;
            
            for (let j = 0; j < frameSize; j++) {
                if (startIdx + j < data.length) {
                    energy += Math.abs(data[startIdx + j]);
                }
            }
            
            frameEnergies.push(energy / frameSize);
        }
        
        // 计算能量变化率
        let changes = 0;
        let threshold = 0.1; // 变化阈值
        let prevEnergy = frameEnergies[0] || 0;
        
        for (let i = 1; i < frameEnergies.length; i++) {
            const energy = frameEnergies[i];
            if (Math.abs(energy - prevEnergy) > threshold) {
                changes++;
            }
            prevEnergy = energy;
        }
        
        // 计算节奏变化频率
        const changeRate = changes / frameEnergies.length;
        
        // 估计节奏的快慢（1-10的范围）
        const tempoEstimate = Math.min(10, Math.max(1, Math.round(changeRate * 20)));
        
        return {
            tempo: tempoEstimate,
            rhythmVariability: changeRate
        };
    }
    
    /**
     * 分析音高
     * @param {AudioBuffer} audioBuffer - 音频缓冲区
     * @param {Object} frequencyData - 频率分布数据
     * @returns {Object} - 音高特征
     */
    analyzePitch(audioBuffer, frequencyData) {
        // 使用频率分布估计音高范围
        // 高频比例高 -> 音高偏高, 低频比例高 -> 音高偏低
        const pitchLevel = (frequencyData.midFreqRatio * 5) + (frequencyData.highFreqRatio * 9);
        
        // 将音高转换到1-10的范围
        const normalizedPitch = Math.min(10, Math.max(1, Math.round(pitchLevel)));
        
        return {
            pitch: normalizedPitch,
            // 利用能量分布估算音色松紧度
            tightness: Math.round((frequencyData.lowFreqRatio * 8) + (frequencyData.midFreqRatio * 5) + (frequencyData.highFreqRatio * 3))
        };
    }
    
    /**
     * 提取情感特征
     * @param {Object} frequencyData - 频率分布数据
     * @param {Object} rhythmFeatures - 节奏特征
     * @param {Object} pitchFeatures - 音高特征
     * @returns {Object} - 情感特征
     */
    extractEmotionalFeatures(frequencyData, rhythmFeatures, pitchFeatures) {
        // 基于音频特征计算各种情感参数
        
        // 快慢指数 (1-10)
        const fastSlow = rhythmFeatures.tempo;
        
        // 高低指数 (1-10)
        const highLow = pitchFeatures.pitch;
        
        // 紧松指数 (1-10)
        const tightLoose = pitchFeatures.tightness;
        
        // 根据特征确定主导五音
        // - 羽(悲伤): 慢、低、松弛
        // - 徵(喜悦): 快、高、中等
        // - 角(柔和): 中等、高、松弛
        // - 宫(稳定): 中等、中等、中等
        // - 商(激烈): 快、中等、紧凑
        
        let yinScores = {
            "宫": 0,
            "商": 0,
            "角": 0,
            "徵": 0,
            "羽": 0
        };
        
        // 宫(稳定)评分
        yinScores["宫"] = 10 - Math.abs(fastSlow - 5) - Math.abs(highLow - 5) - Math.abs(tightLoose - 5);
        
        // 商(激烈)评分
        yinScores["商"] = 10 - Math.abs(fastSlow - 8) - Math.abs(highLow - 5) - Math.abs(tightLoose - 8);
        
        // 角(柔和)评分
        yinScores["角"] = 10 - Math.abs(fastSlow - 4) - Math.abs(highLow - 6) - Math.abs(tightLoose - 3);
        
        // 徵(喜悦)评分
        yinScores["徵"] = 10 - Math.abs(fastSlow - 7) - Math.abs(highLow - 7) - Math.abs(tightLoose - 5);
        
        // 羽(悲伤)评分
        yinScores["羽"] = 10 - Math.abs(fastSlow - 3) - Math.abs(highLow - 3) - Math.abs(tightLoose - 4);
        
        // 确定主导五音
        let dominantYin = "宫"; // 默认
        let maxScore = yinScores["宫"];
        
        for (const yin in yinScores) {
            if (yinScores[yin] > maxScore) {
                maxScore = yinScores[yin];
                dominantYin = yin;
            }
        }
        
        return {
            fastSlow,
            highLow,
            tightLoose,
            dominantYin,
            yinScores
        };
    }
    
    /**
     * 将情感特征转换为五音特征
     * @param {Object} emotionalFeatures - 情感特征
     * @returns {Object} - 五音特征
     */
    convertToWuyinFeatures(emotionalFeatures) {
        // 从情感特征创建五音比例
        const wuyinRatio = {};
        let total = 0;
        
        for (const yin in emotionalFeatures.yinScores) {
            // 确保所有分数为正值
            const score = Math.max(0, emotionalFeatures.yinScores[yin]);
            wuyinRatio[yin] = score;
            total += score;
        }
        
        // 归一化比例，确保总和为1
        if (total > 0) {
            for (const yin in wuyinRatio) {
                wuyinRatio[yin] = wuyinRatio[yin] / total;
            }
        } else {
            // 如果所有分数都为负，使用均等分配
            for (const yin in wuyinRatio) {
                wuyinRatio[yin] = 0.2;
            }
        }
        
        return {
            fastSlow: emotionalFeatures.fastSlow,
            highLow: emotionalFeatures.highLow,
            tightLoose: emotionalFeatures.tightLoose,
            dominantYin: emotionalFeatures.dominantYin,
            wuyinRatio
        };
    }
    
    /**
     * 基于文件名分析音乐特性(当音频分析失败时作为备选方法)
     * @param {string} filename - 音乐文件名
     * @returns {Object} - 音乐特性数据
     */
    analyzeByFilename(filename) {
        // 这个方法会被analyzeMusicFile中的同名函数替换，
        // 保留在这里以防AudioAnalyzer被单独使用
        return null;
    }
}

// 创建全局音频分析器实例
const audioAnalyzer = new AudioAnalyzer();

/**
 * 分析音乐文件特性
 * @param {string} filename - 音乐文件名
 * @returns {Object} - 音乐特性数据
 */
async function analyzeMusicFile(filename) {
    // 如果已经分析过，直接返回结果
    if (musicFileCharacteristics[filename]) {
        return musicFileCharacteristics[filename];
    }
    
    try {
        // 1. 尝试使用Web Audio API进行音频分析
        const fileUrl = getMusicPreviewUrl(filename);
        
        // 判断是否可以进行音频分析
        if (window.AudioContext || window.webkitAudioContext) {
            console.log(`使用音频分析分析文件: ${filename}`);
            
            // 进行音频分析
            const audioFeatures = await audioAnalyzer.analyzeAudio(fileUrl);
            
            // 如果成功获取到音频特性，保存并返回
            if (audioFeatures) {
                musicFileCharacteristics[filename] = audioFeatures;
                return audioFeatures;
            }
        }
    } catch (error) {
        console.warn(`音频分析失败: ${error.message}，使用文件名分析代替`);
    }
    
    // 2. 如果音频分析失败或不可用，使用文件名分析
    console.log(`使用文件名分析文件: ${filename}`);
    return analyzeByFilename(filename);
}

/**
 * 基于文件名分析音乐特性
 * @param {string} filename - 音乐文件名
 * @returns {Object} - 音乐特性数据
 */
function analyzeByFilename(filename) {
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
    
    // 计算五音比例
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
 * @param {number} fastSlow - 快慢指数(1-10)
 * @param {number} highLow - 高低指数(1-10)
 * @param {number} tightLoose - 紧松指数(1-10)
 * @returns {Object} - 五音比例
 */
function calculateWuyinRatio(dominantYin, fastSlow, highLow, tightLoose) {
    // 基础五音比例
    const baseRatio = {
        "宫": 0.2,
        "商": 0.2,
        "角": 0.2,
        "徵": 0.2,
        "羽": 0.2
    };
    
    // 根据主导五音增加其比例
    const dominantBoost = 0.3;
    baseRatio[dominantYin] += dominantBoost;
    
    // 根据主导五音减少其他五音的比例
    const reduction = dominantBoost / 4;
    for (const yin in baseRatio) {
        if (yin !== dominantYin) {
            baseRatio[yin] -= reduction;
        }
    }
    
    // 根据快慢调整徵和羽的比例
    // 快 -> 增加徵，减少羽
    // 慢 -> 增加羽，减少徵
    const tempoAdjustment = (fastSlow - 5) / 50; // -0.08 到 0.08
    if (tempoAdjustment !== 0) {
        baseRatio["徵"] += tempoAdjustment;
        baseRatio["羽"] -= tempoAdjustment;
    }
    
    // 根据高低调整角和商的比例
    // 高 -> 增加角，减少商
    // 低 -> 增加商，减少角
    const pitchAdjustment = (highLow - 5) / 50; // -0.08 到 0.08
    if (pitchAdjustment !== 0) {
        baseRatio["角"] += pitchAdjustment;
        baseRatio["商"] -= pitchAdjustment;
    }
    
    // 根据紧松调整宫和商的比例
    // 紧 -> 增加商，减少宫
    // 松 -> 增加宫，减少商
    const tightnessAdjustment = (tightLoose - 5) / 50; // -0.08 到 0.08
    if (tightnessAdjustment !== 0) {
        baseRatio["宫"] += tightnessAdjustment;
        baseRatio["商"] -= tightnessAdjustment;
    }
    
    // 确保所有比例都在有效范围内(0到1)
    for (const yin in baseRatio) {
        baseRatio[yin] = Math.max(0, Math.min(1, baseRatio[yin]));
    }
    
    // 归一化比例，确保总和为1
    const total = Object.values(baseRatio).reduce((sum, value) => sum + value, 0);
    for (const yin in baseRatio) {
        baseRatio[yin] = baseRatio[yin] / total;
    }
    
    return baseRatio;
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
 * @returns {Promise<Array<string>>} - 音乐文件名数组
 */
async function getMusicFiles() {
    try {
        // 尝试从API获取音乐文件列表
        const response = await fetch('/api/list-music-files');
        
        if (response.ok) {
            const files = await response.json();
            console.log('从API获取到音乐文件列表:', files);
            return files;
        } else {
            console.warn('获取音乐文件列表失败，使用静态列表代替');
            return getStaticMusicFilesList();
        }
    } catch (error) {
        console.error('获取音乐文件列表出错:', error);
        return getStaticMusicFilesList();
    }
}

/**
 * 获取静态音乐文件列表（备用）
 * @returns {Array<string>} - 音乐文件名数组
 */
function getStaticMusicFilesList() {
    return [
        "抒情大气充满力量和喜悦的背景音乐荣耀火焰.mp3",
        "优美抒情的中国风纯音乐.mp3",
        "悲伤伟大欣慰的演讲背景音乐.mp3",
        "欢快活泼积极向上的轻快背景音乐.mp3",
        "温暖明亮的钢琴与弦乐企业宣传背景音乐.mp3",
        "清新明亮的企业宣传片配乐.mp3",
        "震撼大气恢宏的配乐.mp3",
        "激昂澎湃热血沸腾的配乐起航.mp3",
        "钢琴曲温馨感人催泪治愈系.mp3",
        "古筝悠扬古风纯音乐.mp3"
    ].map(file => `src/music_files/${file}`);
}

/**
 * 获取音乐的预览URL
 * @param {string} filename - 音乐文件名
 * @returns {string} - 音乐文件URL
 */
function getMusicPreviewUrl(filename) {
    if (!filename) return '';
    
    // 如果已经是完整URL，直接返回
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    
    // 否则构建相对路径
    return `./src/music_files/${filename}`;
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
    calculateWuyinValuesFromColors,
    getYinPinyin,
    getWuyinCharacteristics,
    calculateMusicSimilarity,
    getMusicFiles,
    analyzeMusicFile,
    getMusicPreviewUrl
};

// 导出音频分析器供外部使用
window.AudioAnalyzer = audioAnalyzer; 