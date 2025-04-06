/**
 * 中国传统色彩音乐生成器
 * 配置文件
 */

// 全局配置对象
const CONFIG = {
    // OpenAI API 密钥 (请替换为您自己的密钥)
    OPENAI_API_KEY: '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',
    
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