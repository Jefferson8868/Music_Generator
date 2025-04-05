import pretty_midi
import random
import subprocess
import os

# 1. 定义颜色到音符的映射（MIDI 音高）
color_to_note = {
    '青': 64,  # E4 - 角
    '白': 62,  # D4 - 商
    '赤': 67,  # G4 - 徵
    '黑': 69,  # A4 - 羽
    '黄': 60   # C4 - 宫
}

# 2. 用户提供的颜色比例（示例，可根据需要调整）
proportions = {
    '青': 0.2,
    '白': 0.2,
    '赤': 0.2,
    '黑': 0.2,
    '黄': 0.2
}

# 3. 设置总音符数
total_notes = 100  # 总音符数，可根据需要调整

# 4. 计算每种音符的数量
note_counts = {color_to_note[color]: int(proportions[color] * total_notes) for color in proportions}

# 处理四舍五入导致的总和不足 total_notes 的情况
current_total = sum(note_counts.values())
if current_total < total_notes:
    remainders = {color: proportions[color] * total_notes - note_counts[color_to_note[color]] for color in proportions}
    while current_total < total_notes:
        max_remainder_color = max(remainders, key=remainders.get)
        note_counts[color_to_note[max_remainder_color]] += 1
        remainders[max_remainder_color] -= 1
        current_total += 1

# 5. 生成音符序列
note_sequence = []
for note, count in note_counts.items():
    note_sequence.extend([note] * count)
random.shuffle(note_sequence)  # 随机排列音符

# 6. 创建 MIDI 文件
midi = pretty_midi.PrettyMIDI()
instrument = pretty_midi.Instrument(program=0)  # 初始使用钢琴音色 (program=0)
start_time = 0
duration = 0.5  # 每个音符持续 0.5 秒，可调整
for note in note_sequence:
    midi_note = pretty_midi.Note(
        velocity=100,  # 音量 (0-127)
        pitch=note,    # 音高
        start=start_time,
        end=start_time + duration
    )
    instrument.notes.append(midi_note)
    start_time += duration
midi.instruments.append(instrument)
midi.write('generated_music.mid')

# 7. 渲染音频（使用 FluidSynth 和 SoundFont）
soundfont_path = 'asian_dreamz.sf2'  # 替换为实际 SoundFont 文件路径
output_wav = 'generated_music.wav'

# 使用 FluidSynth 命令行工具渲染 MIDI 文件为 WAV
subprocess.run([
    'fluidsynth',
    '-ni',             # 不交互模式
    soundfont_path,    # SoundFont 文件路径
    'generated_music.mid',  # 输入 MIDI 文件
    '-F',              # 输出文件选项
    output_wav,        # 输出 WAV 文件
    '-r', '44100'      # 采样率 44100 Hz
])

# 8. 输出结果
print(f"MIDI 文件已生成：generated_music.mid")
print(f"音频文件已生成：{output_wav}")