/**
 * 五行颜色音乐生成器 - DiffRhythm集成版
 * 基于中国传统五行理论、五音音阶和DiffRhythm模型
 */

// 全局变量
const WuxingDiffRhythm = {
    // 当前选中的颜色和五行信息
    currentColor: null,
    currentWuxing: null,
    
    // 音乐生成状态
    isGenerating: false,
    currentMusicPath: null,
    
    // 音频播放器
    audioPlayer: null,
    
    // 初始化函数
    init: function() {
        console.log("初始化五行DiffRhythm音乐生成器...");
        
        // 创建音频播放器
        this.createAudioPlayer();
        
        // 绑定生成按钮事件
        this.bindGenerateButton();
        
        // 监听颜色选择事件
        this.listenColorSelection();
    },
    
    // 创建音频播放器
    createAudioPlayer: function() {
        // 检查是否已存在
        if (document.getElementById('wuxing-audio-player')) {
            this.audioPlayer = document.getElementById('wuxing-audio-player');
            return;
        }
        
        // 创建音频播放器元素
        this.audioPlayer = document.createElement('audio');
        this.audioPlayer.id = 'wuxing-audio-player';
        this.audioPlayer.controls = true;
        this.audioPlayer.style.width = '100%';
        this.audioPlayer.style.marginTop = '10px';
        this.audioPlayer.style.display = 'none';
        
        // 添加到DOM
        const musicOutput = document.getElementById('music-output');
        if (musicOutput) {
            musicOutput.appendChild(this.audioPlayer);
        } else {
            document.body.appendChild(this.audioPlayer);
        }
    },
    
    // 绑定生成按钮事件
    bindGenerateButton: function() {
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn) {
            console.error("未找到生成按钮");
            return;
        }
        
        // 移除现有的事件监听器
        const newGenerateBtn = generateBtn.cloneNode(true);
        generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);
        
        // 添加新的事件监听器
        newGenerateBtn.addEventListener('click', () => {
            this.generateMusicFromColor();
        });
    },
    
    // 监听颜色选择事件
    listenColorSelection: function() {
        document.addEventListener('click', (event) => {
            // 检查是否点击了颜色选项
            if (event.target.classList.contains('color-option') || 
                event.target.parentElement.classList.contains('color-option')) {
                
                const colorOption = event.target.classList.contains('color-option') ? 
                    event.target : event.target.parentElement;
                
                // 保存当前选中的颜色和五行信息
                this.currentWuxing = colorOption.dataset.wuxing;
                this.currentColor = {
                    title: document.getElementById('selected-color-name').textContent,
                    rgb: colorOption.style.backgroundColor,
                    wuxing: this.currentWuxing
                };
                
                console.log(`选中颜色: ${this.currentColor.title} (${this.currentWuxing})`);
            }
        });
    },
    
    // 根据选中的颜色生成音乐
    generateMusicFromColor: function() {
        // 检查是否选中了颜色
        if (!this.currentColor || !this.currentWuxing) {
            this.showMessage("请先选择一个颜色！");
            return;
        }
        
        // 检查是否正在生成
        if (this.isGenerating) {
            this.showMessage("正在生成音乐，请稍候...");
            return;
        }
        
        // 更新状态
        this.isGenerating = true;
        this.showGeneratingUI();
        
        // 准备请求参数
        const params = {
            wuxing_type: this.currentWuxing,
            color_name: this.currentColor.title
        };
        
        // 发送请求到后端API
        fetch('/api/generate_music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 更新状态
            this.isGenerating = false;
            
            if (data.success) {
                // 保存音乐路径
                this.currentMusicPath = data.music_path;
                
                // 显示成功UI
                this.showSuccessUI(data);
                
                // 播放音乐
                this.playMusic(data.music_url);
            } else {
                // 显示错误
                this.showErrorUI(data.error || "生成音乐失败");
            }
        })
        .catch(error => {
            // 更新状态
            this.isGenerating = false;
            
            // 显示错误
            this.showErrorUI(`生成音乐时出错: ${error.message}`);
            console.error("生成音乐时出错:", error);
        });
    },
    
    // 显示生成中的UI
    showGeneratingUI: function() {
        const musicOutput = document.getElementById('music-output');
        if (!musicOutput) return;
        
        musicOutput.innerHTML = `
            <div class="generating-music">
                <div class="music-loading">正在根据 ${this.currentWuxing} 五行元素生成音乐...</div>
                <div class="loading-spinner"></div>
                <div class="loading-text">使用DiffRhythm模型生成中，这可能需要一些时间</div>
            </div>
        `;
        
        // 隐藏音频播放器
        if (this.audioPlayer) {
            this.audioPlayer.style.display = 'none';
        }
    },
    
    // 显示成功的UI
    showSuccessUI: function(data) {
        const musicOutput = document.getElementById('music-output');
        if (!musicOutput) return;
        
        // 查找当前五行的完整数据
        const wuxingData = this.findWuxingData(this.currentWuxing);
        
        musicOutput.innerHTML = `
            <div class="music-info">
                <div class="music-title">五行音乐 - ${this.currentWuxing}(${wuxingData ? wuxingData.color : ''})</div>
                <div class="music-color">颜色: ${this.currentColor.title}</div>
                <div class="music-model">模型: DiffRhythm</div>
                <div class="music-controls">
                    <button id="stop-music-btn" class="control-btn">停止</button>
                    <button id="replay-music-btn" class="control-btn">重播</button>
                    <button id="download-music-btn" class="control-btn">下载</button>
                </div>
            </div>
        `;
        
        // 显示音频播放器
        if (this.audioPlayer) {
            this.audioPlayer.style.display = 'block';
            musicOutput.appendChild(this.audioPlayer);
        }
        
        // 添加按钮事件
        document.getElementById('stop-music-btn').addEventListener('click', () => {
            if (this.audioPlayer) {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
            }
        });
        
        document.getElementById('replay-music-btn').addEventListener('click', () => {
            if (this.audioPlayer) {
                this.audioPlayer.currentTime = 0;
                this.audioPlayer.play();
            }
        });
        
        document.getElementById('download-music-btn').addEventListener('click', () => {
            if (data.music_url) {
                window.open(data.music_url, '_blank');
            }
        });
    },
    
    // 显示错误的UI
    showErrorUI: function(errorMessage) {
        const musicOutput = document.getElementById('music-output');
        if (!musicOutput) return;
        
        musicOutput.innerHTML = `
            <div class="music-error">
                <div class="error-icon">❌</div>
                <div class="error-message">${errorMessage}</div>
                <button id="retry-btn" class="control-btn">重试</button>
            </div>
        `;
        
        // 隐藏音频播放器
        if (this.audioPlayer) {
            this.audioPlayer.style.display = 'none';
        }
        
        // 添加重试按钮事件
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.generateMusicFromColor();
        });
    },
    
    // 显示消息
    showMessage: function(message) {
        const musicOutput = document.getElementById('music-output');
        if (!musicOutput) return;
        
        musicOutput.innerHTML = `<div class="music-message">${message}</div>`;
    },
    
    // 播放音乐
    playMusic: function(musicUrl) {
        if (!this.audioPlayer) return;
        
        // 设置音频源
        this.audioPlayer.src = musicUrl;
        
        // 播放
        this.audioPlayer.play().catch(error => {
            console.error("播放音乐时出错:", error);
        });
    },
    
    // 查找五行数据
    findWuxingData: function(wuxingName) {
        // 如果全局变量中有五行数据，则使用它
        if (window.wuxingData) {
            return window.wuxingData.find(item => item.wuxing === wuxingName);
        }
        return null;
    }
};

// 当文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    WuxingDiffRhythm.init();
});