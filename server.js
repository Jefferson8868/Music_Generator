const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8001;

// 启用CORS
app.use(cors());

// 提供静态文件
app.use(express.static(path.join(__dirname, '.')));

// API端点：列出音乐文件
app.get('/api/list-music-files', (req, res) => {
    try {
        const musicDir = path.join(__dirname, 'src/music_files');
        
        fs.readdir(musicDir, (err, files) => {
            if (err) {
                console.error('读取音乐文件目录出错:', err);
                return res.status(500).json({ error: '无法读取音乐文件目录' });
            }
            
            // 过滤出MP3文件
            const musicFiles = files.filter(file => 
                file.toLowerCase().endsWith('.mp3') || 
                file.toLowerCase().endsWith('.wav') ||
                file.toLowerCase().endsWith('.ogg')
            ).map(file => `src/music_files/${file}`);
            
            res.json(musicFiles);
        });
    } catch (error) {
        console.error('处理音乐文件列表请求出错:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`音乐生成器应用可在 http://localhost:${PORT}/index.html 访问`);
}); 