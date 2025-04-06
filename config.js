/**
 * 中国传统色彩音乐生成器
 * 配置文件
 */

const CONFIG = {
    // OpenAI API 密钥 - 请替换为您的真实API密钥
    OPENAI_API_KEY: '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',
    
    // OpenAI 模型配置
    OPENAI_MODEL: 'gpt-3.5-turbo',
    
    // API 请求配置
    API_CONFIG: {
        temperature: 0.7,
        max_tokens: 1000
    }
};

// 防止直接修改配置
Object.freeze(CONFIG); 