风水是什么？
风水是源自中国的一种古老哲学与实践体系，主要关注人与自然环境之间的和谐关系。它通过观察、分析和调节住宅、建筑、墓地等环境的布局、朝向、地理形势（例如山、水、地势），来影响人们的运势、健康、家庭和事业等方面。风水强调"天人合一"，认为自然环境中的气场、能量流动会对人的生活有重要影响。通过合适的布局与设计，风水旨在使人们能够与大自然的能量相协调，从而得到更好的运势与福祉。

五行是什么？
五行是中国传统哲学中的一个重要概念，指金、木、水、火、土五种基本要素。古人认为，宇宙中的万事万物都由这五种要素以及它们之间的相互作用所构成。五行之间存在"生克"关系：

"相生"：木生火、火生土、土生金、金生水、水生木

"相克"：木克土、土克水、水克火、火克金、金克木

通过对五行相生相克规律的理解，可以解释自然现象及人际关系中许多变化和发展过程。在风水、医学、中餐烹饪、周易预测等多领域，五行理论都有重要应用价值。

English Explanation:

What is Feng Shui?
Feng Shui is an ancient Chinese philosophy and practice that focuses on the harmonious relationship between humans and their natural environment. It involves observing, analyzing, and adjusting the layout and orientation of living spaces, buildings, and burial grounds based on geographical and environmental features (such as mountains, water sources, and terrain). The primary goal is to enhance the flow of energy or "qi" in a way that benefits health, luck, family, and career. Feng Shui emphasizes the unity of humanity and nature, believing that the flow of natural energy can significantly influence people's lives. By applying proper layout and design principles, Feng Shui aims to harmonize human activities with the energy of the surrounding environment to promote well-being and prosperity.

What are the Five Elements?
The Five Elements (Wu Xing) are key concepts in traditional Chinese philosophy, referring to Metal, Wood, Water, Fire, and Earth. According to ancient thought, all things in the universe arise from these five elements and the interactions among them. They follow a cyclical process of "creation" (sheng) and "control" (ke):

Creation (sheng): Wood creates Fire, Fire creates Earth, Earth creates Metal, Metal creates Water, Water creates Wood

Control (ke): Wood controls Earth, Earth controls Water, Water controls Fire, Fire controls Metal, Metal controls Wood

By understanding these creative and controlling relationships among the Five Elements, one can explain a wide range of natural and social phenomena. The Five Elements theory is widely applied in many fields, such as Feng Shui, traditional Chinese medicine, culinary practices, and fortune-telling methods like the I Ching (Book of Changes).

# 中国传统色彩音乐生成器

基于中国传统五行理论的色彩音乐生成和匹配系统。该项目将传统色彩映射到五行（木、火、土、金、水）和五音（角、徵、宫、商、羽），通过分析色彩组合生成音乐并匹配相似歌曲。

## 项目结构

```
├── index.html                  # 主页面
├── style.css                   # 样式表
├── script.js                   # 主JavaScript逻辑
├── grid_layout.js              # 色彩网格布局逻辑
├── start_api_server.py         # API服务器启动脚本
└── src/                        # 后端代码目录
    ├── api_server.py           # API服务器
    ├── wuxing_music_matcher.py # 五行音乐匹配算法
    ├── music_files/            # 音乐文件目录
    └── README.md               # 五行音乐匹配算法说明
```

## 功能特点

- 展示中国传统色彩，按五行分类
- 分析色彩的五行属性和所属音律
- 实时生成基于五行理论的音乐
- 基于五行相似度匹配相关音乐
- 可视化展示五行颜色分布和情绪特征
- AI风格推荐功能（需要OpenAI API密钥）

## 运行步骤

### 1. 配置 OpenAI API（AI风格推荐功能）

要使用AI风格推荐功能，需要配置OpenAI API密钥：

1. 复制 `config_template.js` 文件并重命名为 `config.js`
2. 在 [OpenAI平台](https://platform.openai.com/api-keys) 获取您的API密钥
3. 将API密钥填入 `config.js` 文件中的 `OPENAI_API_KEY` 字段

**重要安全提示：** 
- 请勿将包含实际API密钥的 `config.js` 文件提交到版本控制系统中
- 该文件已添加到 `.gitignore` 以防止意外提交
- 如遇到API请求限制（429错误），系统会自动使用本地推荐功能作为备选

### 2. 启动后端API服务器

首先，需要启动后端API服务器，用于处理音乐匹配请求。你可以使用提供的启动脚本：

```bash
python start_api_server.py
```

或直接启动API服务器：

```bash
python src/api_server.py
```

服务器将在 http://localhost:5000 运行。

### 3. 启动前端界面

你可以使用任何Web服务器托管前端文件。例如，使用Python的简易HTTP服务器：

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

然后在浏览器中访问 http://localhost:8000。

## 使用方法

1. 在颜色网格中选择一个颜色
2. 系统会显示该颜色的五行属性和相关信息
3. 点击"生成音乐与搜索歌曲"按钮
4. 系统将生成基于五行的音乐，并在右侧显示相似度最高的音乐推荐

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Python, Flask
- 音频分析：librosa, NumPy
- 机器学习：scikit-learn

## 配置音乐文件

系统需要一些音乐文件来进行匹配。将MP3格式的音乐文件放入 `src/music_files` 目录，系统会自动分析这些文件的音频特征并用于匹配。

## 相关理论

本项目基于中国传统的以下理论：

- **五行理论**：木、火、土、金、水五种元素及其相互关系
- **五色理论**：青、赤、黄、白、黑五种颜色对应五行
- **五音理论**：角、徵、宫、商、羽五种音阶对应五行
- **情绪映射**：不同五行元素对应不同的情绪特征

## 开发者

- Jefferson Chen (jeco68@ucsd.edu)

## 许可证

MIT License