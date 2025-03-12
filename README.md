# 基于ChatMusician的音乐生成器

## 项目概述

这个项目基于ChatMusician大模型进行微调，目标是输入**乐器、音调、歌词**等条件，生成对应的音乐曲谱或符号化音乐表示。

## 技术选型

- **核心模型**: [ChatMusician](https://huggingface.co/m-a-p/ChatMusician)（基于LLaMA的符号音乐生成模型，支持多模态输入）
- **框架**: Hugging Face Transformers + PyTorch
- **数据集要求**: 结构化数据（包含`乐器`、`音调`、`歌词`、`曲谱`的配对数据）
- **训练工具**: Hugging Face Trainer, LoRA/P-Tuning微调
- **音频生成**: Music21, MIDIUtil

## 项目目录结构

```
music-generator/
├── data/
│   ├── midi/                  # MIDI格式的音乐数据
│   ├── processed/            # 预处理后的文本训练数据（JSON/CSV）
├── models/
│   ├── checkpoints/         # 训练过程中的检查点
│   └── final/               # 最终微调后的模型权重
├── src/
│   ├── data_preprocess.py    # 数据预处理（结构化→文本）
│   ├── train.py              # 模型微调脚本
│   ├── generate.py           # 条件音乐生成
│   └── utils.py              # 工具函数（MIDI转换等）
├── output/                   # 生成的曲谱/MIDI文件
└── requirements.txt          # 项目依赖
```

## 数据集准备

### 数据集示例（CSV/JSON）

```json
{
  "instruments": "钢琴, 小提琴",
  "key": "C大调",
  "lyrics": "夏天的风，轻轻吹过",
  "score": "C4 E4 G4 | C5 B4 G4 | ..."
}
```

### 推荐开源数据集

1. [POP909](https://github.com/music-x-lab/POP909-Dataset)（包含钢琴曲谱和和弦）
2. [LMD-Aligned Lyrics](https://colinraffel.com/projects/lmd/)（歌词与MIDI对齐数据）
3. 自定义数据集：需将音乐信息按上述格式整理。

## 环境配置

```bash
pip install -r requirements.txt
```

## 使用流程

1. **准备数据集**
   - 将原始数据（CSV/JSON）放入 `data/raw/`
   - 运行预处理脚本：
     ```bash
     python src/data_preprocess.py
     ```

2. **微调模型**
   ```bash
   python src/train.py
   ```

3. **生成音乐**
   ```bash
   python src/generate.py --prompt "乐器：吉他, 音调：G大调, 歌词：远方的你" --output output/demo.mid
   ```

## 注意事项

1. **数据对齐**: 确保歌词与曲谱在时间轴上的对齐（可通过正则匹配或手动标注）。
2. **模型限制**: ChatMusician主要生成符号音乐（如ABC Notation），若需生成音频需额外转换。