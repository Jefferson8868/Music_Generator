/**
 * 五行音乐生成器
 * 基于中国传统五行理论和五音音阶
 */

// 创建音频上下文
let audioContext;
let oscillators = [];
let gainNodes = [];

// 五音音阶频率（以赫兹为单位）
const wuxingScales = {
    // 角音阶（木）- 五声音阶，以E为主音
    "木": {
        notes: [329.63, 392.00, 440.00, 523.25, 587.33], // E, G, A, C, D
        baseNote: 329.63, // E
        tempo: 120, // 中速
        style: "清新舒缓"
    },
    // 徵音阶（火）- 五声音阶，以G为主音
    "火": {
        notes: [392.00, 440.00, 523.25, 587.33, 698.46], // G, A, C, D, F
        baseNote: 392.00, // G
        tempo: 140, // 快速
        style: "热情奔放"
    },
    // 宫音阶（土）- 五声音阶，以C为主音
    "土": {
        notes: [261.63, 293.66, 329.63, 392.00, 440.00], // C, D, E, G, A
        baseNote: 261.63, // C
        tempo: 100, // 中速
        style: "稳重大气"
    },
    // 商音阶（金）- 五声音阶，以D为主音
    "金": {
        notes: [293.66, 329.63, 392.00, 440.00, 523.25], // D, E, G, A, C
        baseNote: 293.66, // D
        tempo: 90, // 中慢速
        style: "清澈高雅"
    },
    // 羽音阶（水）- 五声音阶，以A为主音
    "水": {
        notes: [440.00, 523.25, 587.33, 659.25, 783.99], // A, C, D, E, G
        baseNote: 440.00, // A
        tempo: 80, // 慢速
        style: "深沉内敛"
    }
};

// 初始化音频上下文
function initAudio() {
    // 防止重复创建
    if (audioContext) return;
    
    // 创建音频上下文
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 显示音频已初始化的消息
    console.log("音频系统已初始化");
}

// 停止所有正在播放的音符
function stopAllNotes() {
    // 停止所有振荡器
    oscillators.forEach(osc => {
        try {
            osc.stop();
            osc.disconnect();
        } catch (e) {
            // 忽略已停止的振荡器错误
        }
    });
    
    // 清空振荡器和增益节点数组
    oscillators = [];
    gainNodes = [];
}

// 播放单个音符
function playNote(frequency, duration, startTime, volume = 0.3, type = "sine") {
    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 设置振荡器参数
    oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.value = frequency;
    
    // 设置音量
    gainNode.gain.value = 0;
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 添加到数组中以便后续停止
    oscillators.push(oscillator);
    gainNodes.push(gainNode);
    
    // 开始播放
    oscillator.start(startTime);
    
    // 设置音量淡入淡出
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    // 设置结束时间
    oscillator.stop(startTime + duration);
    
    // 在音符结束后从数组中移除
    oscillator.onended = function() {
        const index = oscillators.indexOf(oscillator);
        if (index !== -1) {
            oscillators.splice(index, 1);
            gainNodes.splice(index, 1);
        }
    };
}

// 生成五行音乐旋律
function generateWuxingMelody(wuxing, duration = 20) {
    // 初始化音频
    initAudio();
    
    // 停止之前的音乐
    stopAllNotes();
    
    // 获取五行对应的音阶
    const scale = wuxingScales[wuxing];
    if (!scale) {
        console.error("未找到对应的五行音阶:", wuxing);
        return;
    }
    
    // 计算节拍时长（秒）
    const beatDuration = 60 / scale.tempo;
    
    // 当前时间
    let currentTime = audioContext.currentTime;
    
    // 根据五行特性生成不同风格的旋律
    switch(wuxing) {
        case "木":
            // 木（角）- 清新舒缓的旋律，模拟春天生长的感觉
            generateWoodMelody(scale, currentTime, beatDuration, duration);
            break;
        case "火":
            // 火（徵）- 热情奔放的旋律，模拟夏天活力的感觉
            generateFireMelody(scale, currentTime, beatDuration, duration);
            break;
        case "土":
            // 土（宫）- 稳重大气的旋律，模拟四季交替的感觉
            generateEarthMelody(scale, currentTime, beatDuration, duration);
            break;
        case "金":
            // 金（商）- 清澈高雅的旋律，模拟秋天肃杀的感觉
            generateMetalMelody(scale, currentTime, beatDuration, duration);
            break;
        case "水":
            // 水（羽）- 深沉内敛的旋律，模拟冬天静谧的感觉
            generateWaterMelody(scale, currentTime, beatDuration, duration);
            break;
        default:
            // 默认生成简单旋律
            generateDefaultMelody(scale, currentTime, beatDuration, duration);
    }
    
    // 返回音乐风格描述
    return {
        wuxing: wuxing,
        style: scale.style,
        tempo: scale.tempo,
        duration: duration
    };
}

// 木（角）- 清新舒缓的旋律
function generateWoodMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成主旋律
    while (time < endTime) {
        // 随机选择音符
        const noteIndex = Math.floor(Math.random() * notes.length);
        const note = notes[noteIndex];
        
        // 木属性的音乐：流畅、上升、有生命力
        const noteDuration = beatDuration * [0.5, 1, 1.5][Math.floor(Math.random() * 3)];
        
        // 播放主音符
        playNote(note, noteDuration, time, 0.3, "sine");
        
        // 有时添加和声
        if (Math.random() > 0.7) {
            const harmonyNote = notes[(noteIndex + 2) % notes.length];
            playNote(harmonyNote, noteDuration, time, 0.15, "sine");
        }
        
        // 前进到下一个时间点
        time += noteDuration;
    }
}

// 火（徵）- 热情奔放的旋律
function generateFireMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成主旋律
    while (time < endTime) {
        // 随机选择音符，但偏好高音
        const noteIndex = Math.min(Math.floor(Math.random() * notes.length * 1.5), notes.length - 1);
        const note = notes[noteIndex];
        
        // 火属性的音乐：快速、跳跃、热情
        const noteDuration = beatDuration * [0.25, 0.5, 0.75][Math.floor(Math.random() * 3)];
        
        // 播放主音符
        playNote(note, noteDuration, time, 0.3, "sawtooth");
        
        // 添加和声或打击乐效果
        if (Math.random() > 0.5) {
            const harmonyNote = notes[(noteIndex + 2) % notes.length];
            playNote(harmonyNote, noteDuration, time, 0.2, "triangle");
        }
        
        // 前进到下一个时间点
        time += noteDuration;
    }
}

// 土（宫）- 稳重大气的旋律
function generateEarthMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成主旋律
    while (time < endTime) {
        // 随机选择音符，但偏好中音
        const noteIndex = Math.floor(notes.length / 2 + (Math.random() - 0.5) * notes.length);
        const note = notes[Math.max(0, Math.min(noteIndex, notes.length - 1))];
        
        // 土属性的音乐：稳定、重复、厚实
        const noteDuration = beatDuration * [1, 1.5, 2][Math.floor(Math.random() * 3)];
        
        // 播放主音符
        playNote(note, noteDuration, time, 0.3, "sine");
        
        // 添加低音衬托
        if (Math.random() > 0.6) {
            const bassNote = notes[0] / 2; // 低八度
            playNote(bassNote, noteDuration, time, 0.2, "sine");
        }
        
        // 前进到下一个时间点
        time += noteDuration;
    }
}

// 金（商）- 清澈高雅的旋律
function generateMetalMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成主旋律
    while (time < endTime) {
        // 随机选择音符
        const noteIndex = Math.floor(Math.random() * notes.length);
        const note = notes[noteIndex];
        
        // 金属性的音乐：清脆、明亮、有韵律
        const noteDuration = beatDuration * [0.5, 1, 1.5][Math.floor(Math.random() * 3)];
        
        // 播放主音符
        playNote(note, noteDuration, time, 0.25, "triangle");
        
        // 添加和声
        if (Math.random() > 0.5) {
            const harmonyNote = notes[(noteIndex + 4) % notes.length];
            playNote(harmonyNote, noteDuration, time, 0.15, "sine");
        }
        
        // 前进到下一个时间点
        time += noteDuration;
    }
}

// 水（羽）- 深沉内敛的旋律
function generateWaterMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成主旋律
    while (time < endTime) {
        // 随机选择音符，但偏好低音
        const noteIndex = Math.floor(Math.random() * notes.length * 0.7);
        const note = notes[noteIndex];
        
        // 水属性的音乐：流动、深沉、连绵
        const noteDuration = beatDuration * [1, 1.5, 2, 2.5][Math.floor(Math.random() * 4)];
        
        // 播放主音符
        playNote(note, noteDuration, time, 0.3, "sine");
        
        // 添加和声，模拟水流
        if (Math.random() > 0.3) {
            const harmonyNote = notes[(noteIndex + 2) % notes.length];
            // 延迟一点播放和声，创造回声效果
            playNote(harmonyNote, noteDuration * 0.8, time + beatDuration * 0.1, 0.15, "sine");
        }
        
        // 前进到下一个时间点
        time += noteDuration * 0.8; // 重叠音符，创造流水感
    }
}

// 默认旋律生成
function generateDefaultMelody(scale, startTime, beatDuration, totalDuration) {
    const notes = scale.notes;
    let time = startTime;
    const endTime = startTime + totalDuration;
    
    // 生成简单旋律
    while (time < endTime) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const noteDuration = beatDuration * [0.5, 1, 1.5][Math.floor(Math.random() * 3)];
        
        playNote(note, noteDuration, time, 0.3, "sine");
        
        time += noteDuration;
    }
}

// 导出函数
window.WuxingMusic = {
    generateMusic: generateWuxingMelody,
    stopMusic: stopAllNotes
};