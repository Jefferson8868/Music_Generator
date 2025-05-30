/**
 * 中国传统色彩音乐生成器
 * 配置模板文件
 * 
 * 使用方法：
 * 1. 复制此文件并重命名为 config.js
 * 2. 在新文件中填入您的 OpenAI API 密钥
 */

// 全局配置对象
const CONFIG = {
    // OpenAI API 密钥 (请替换为您自己的密钥)
    OPENAI_API_KEY: 'your-openai-api-key-here',
    
    // OpenAI 模型配置
    OPENAI_MODEL: 'gpt-3.5-turbo',
    
    // API 请求配置
    API_CONFIG: {
        temperature: 0.7,
        max_tokens: 1000
    }
};

// 防止直接修改配置对象
Object.freeze(CONFIG); 