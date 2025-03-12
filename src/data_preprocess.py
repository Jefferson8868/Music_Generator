from datasets import load_dataset, Dataset
import os
import json
import pandas as pd
from music21 import stream, note, converter, duration, chord
from tqdm import tqdm
import concurrent.futures

# Helper Functions
def create_prompt(style, instrument, note_prefix, lyrics=None):
    prompt = f"Generate a {style} song"
    if instrument:
        prompt += f" for {instrument}"
    if note_prefix:
        prompt += f" starting with {note_prefix}"
    if lyrics:
        prompt += f" with lyrics: {lyrics}"
    return prompt

def stream_to_abc(s):
    """Convert a music21 stream to simple ABC notation with error handling."""
    abc = "X:1\nT:Generated\nM:4/4\nK:C\n"
    for n in s.flatten().notes:
        try:
            if isinstance(n, note.Note):
                pitch = n.nameWithOctave.replace('-', 'b').replace('#', '^')
            elif isinstance(n, chord.Chord):
                pitch = '<' + ' '.join([p.nameWithOctave.replace('-', 'b').replace('#', '^') for p in n.pitches]) + '>'
            else:
                continue  # Skip unhandled types (e.g., rests)
            dur = n.duration.quarterLength
            if dur == 1:
                abc += pitch + " "
            elif dur == 0.5:
                abc += pitch + "/ "
            elif dur == 2:
                abc += pitch + "2 "
            else:
                abc += pitch + str(int(dur)) + " "
        except Exception as e:
            print(f"Error processing note/chord in stream: {e}")
            continue
    return abc.strip()

def process_guzheng_tech99(use_audio_conversion=False):
    ds = load_dataset("ccmusic-database/GZ_IsoTech", "default")
    pairs = []
    print("GZ_IsoTech keys:", ds['train'].features.keys())
    print("Sample entry:", ds['train'][0])
    
    if use_audio_conversion:
        try:
            from basic_pitch.inference import predict
            import numpy as np
            import librosa
            from music21 import converter
            
            def audio_to_midi(audio_array, sr):
                midi_data, _, _ = predict(audio_array, sr)
                temp_midi = 'temp.mid'
                midi_data.write_midi(temp_midi)
                s = converter.parse(temp_midi)
                os.remove(temp_midi)
                return s
            
            for split in ['train', 'test']:
                for item in ds[split]:
                    try:
                        audio = item['audio']['array']
                        sr = item['audio']['sampling_rate']
                        technique = item['label_cn']
                        s = audio_to_midi(audio, sr)
                        abc = stream_to_abc(s)
                        notes = s.flatten().notes[:4]
                        if notes:
                            prefix = ' '.join([n.nameWithOctave if isinstance(n, note.Note) 
                                              else n.pitches[0].nameWithOctave for n in notes])
                        else:
                            prefix = "C4"
                        prompt = create_prompt(
                            style="traditional",
                            instrument="guzheng",
                            note_prefix=prefix,
                            lyrics=f"演奏技巧：{technique}"
                        )
                        pairs.append({"prompt": prompt, "target_abc": abc})
                    except Exception as e:
                        print(f"Error processing audio sample: {e}")
                        continue
            
            print("=== GZ_IsoTech Sample ===")
            for i, pair in enumerate(pairs[:2]):
                print(f"Entry {i+1}:")
                print(f"  Prompt: {pair['prompt']}")
                print(f"  Target ABC: {pair['target_abc'][:100]}...")
                print()
        except ImportError:
            print("Warning: basic-pitch not installed. Please install it with: pip install basic-pitch")
    else:
        print("Warning: Audio conversion is disabled. No symbolic data will be processed.")
    
    return pairs

def process_essen(root_dir):
    pairs = []
    subdirs = ['han', 'natmin', 'shanxi', 'xinhua']
    for subdir in subdirs:
        path = os.path.join(root_dir, 'china', subdir)
        if not os.path.exists(path):
            print(f"Warning: Directory {path} not found. Skipping.")
            continue
        for file in os.listdir(path):
            if file.endswith('.krn'):
                filepath = os.path.join(path, file)
                try:
                    s = converter.parse(filepath)
                    abc = stream_to_abc(s)
                    notes = s.flatten().notes[:4]
                    prefix = ' '.join([n.nameWithOctave if isinstance(n, note.Note) else n.pitches[0].nameWithOctave for n in notes])
                    lyrics = s.lyrics()
                    if lyrics and lyrics[0].text.strip():
                        first_line = lyrics[0].text.split('\n')[0].strip()
                        prompt = create_prompt(style="folk", instrument="voice", note_prefix=prefix, lyrics=first_line)
                    else:
                        prompt = create_prompt(style="folk", instrument="melody", note_prefix=prefix)
                    pairs.append({"prompt": prompt, "target_abc": abc})
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
    print("=== ESSEN Folk Song Sample ===")
    for i, pair in enumerate(pairs[:2]):
        print(f"Entry {i+1}:")
        print(f"  Prompt: {pair['prompt']}")
        print(f"  Target ABC: {pair['target_abc'][:100]}...")
        print()
    return pairs

def process_pop909(root_dir):
    pairs = []
    for folder in os.listdir(root_dir):
        if folder.isdigit():
            midi_path = os.path.join(root_dir, folder, f"{folder}.mid")
            if os.path.exists(midi_path):
                try:
                    s = converter.parse(midi_path)
                    melody = s.parts[0]
                    abc = stream_to_abc(melody)
                    notes = melody.flatten().notes[:4]
                    prefix = ' '.join([n.nameWithOctave if isinstance(n, note.Note) else ' '.join([p.nameWithOctave for p in n.pitches]) for n in notes])
                    prompt = create_prompt(style="pop", instrument="melody", note_prefix=prefix)
                    pairs.append({"prompt": prompt, "target_abc": abc})
                except Exception as e:
                    print(f"Error processing {midi_path}: {e}")
    print("=== POP909 Sample ===")
    for i, pair in enumerate(pairs[:2]):
        print(f"Entry {i+1}:")
        print(f"  Prompt: {pair['prompt']}")
        print(f"  Target ABC: {pair['target_abc'][:100]}...")
        print()
    return pairs

def process_single_lmd_file(midi_path):
    """Process a single MIDI file and return a prompt-ABC pair."""
    try:
        s = converter.parse(midi_path)
        if not s.parts:
            print(f"Error processing {midi_path}: No parts found in MIDI file")
            return None
        
        if len(s.parts) > 0:
            s = s.parts[0]
        
        notes = s.flatten().notes
        if not notes:
            print(f"Error processing {midi_path}: No notes found in MIDI file")
            return None
        
        try:
            abc = stream_to_abc(s)
        except Exception as e:
            print(f"Error generating ABC notation for {midi_path}: {e}")
            return None
        
        prefix_notes = notes[:min(4, len(notes))]
        if not prefix_notes:
            print(f"Error processing {midi_path}: No valid notes for prefix")
            return None
        
        note_names = []
        for n in prefix_notes:
            try:
                if isinstance(n, note.Note):
                    note_names.append(n.nameWithOctave)
                elif isinstance(n, chord.Chord) and len(n.pitches) > 0:
                    note_names.append(n.pitches[0].nameWithOctave)
                else:
                    continue
            except Exception as e:
                print(f"Error extracting note name in {midi_path}: {e}")
                continue
        
        prefix = ' '.join(note_names) if note_names else "C4"
        
        try:
            lyrics = s.lyrics()
            if lyrics and len(lyrics) > 0 and hasattr(lyrics[0], 'text') and lyrics[0].text and lyrics[0].text.strip():
                first_line = lyrics[0].text.split('\n')[0].strip()
                prompt = create_prompt(style="song", instrument="voice", note_prefix=prefix, lyrics=first_line)
            else:
                prompt = create_prompt(style="song", instrument="melody", note_prefix=prefix)
        except Exception as e:
            print(f"Error processing lyrics in {midi_path}: {e}")
            prompt = create_prompt(style="song", instrument="melody", note_prefix=prefix)
        
        return {"prompt": prompt, "target_abc": abc, "midi_path": midi_path}  # Include file path for reference
    except Exception as e:
        print(f"Error processing {midi_path}: {e}")
        return None

def process_lmd(root_dir, output_file="../output/lmd_data.csv", output_format="csv", max_workers=4, max_files=5000, error_threshold=0.3):
    """Process LMD dataset and save to a separate CSV or JSON file."""
    pairs = []
    aligned_dir = os.path.join(root_dir, 'lmd_aligned')
    if not os.path.exists(aligned_dir):
        print(f"Warning: Directory {aligned_dir} not found. Skipping.")
        return
    
    midi_files = []
    for root, _, files in os.walk(aligned_dir):
        for file in files:
            if file.endswith('.mid'):
                midi_files.append(os.path.join(root, file))
    
    if len(midi_files) > max_files:
        print(f"Limiting processing to {max_files} files out of {len(midi_files)} total files")
        midi_files = midi_files[:max_files]
    
    total_files = len(midi_files)
    print(f"Total MIDI files to process in LMD: {total_files}")
    
    batch_size = min(1000, total_files)
    error_count = 0
    processed_count = 0
    
    for batch_start in range(0, total_files, batch_size):
        batch_end = min(batch_start + batch_size, total_files)
        batch_files = midi_files[batch_start:batch_end]
        batch_size_actual = len(batch_files)
        
        print(f"Processing batch {batch_start//batch_size + 1}, files {batch_start+1}-{batch_end} of {total_files}")
        
        batch_errors = 0
        batch_pairs = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_file = {executor.submit(process_single_lmd_file, midi_path): midi_path 
                             for midi_path in batch_files}
            for future in tqdm(concurrent.futures.as_completed(future_to_file), 
                              total=batch_size_actual, 
                              desc=f"Batch {batch_start//batch_size + 1}"):
                try:
                    result = future.result()
                    if result:
                        batch_pairs.append(result)
                    else:
                        batch_errors += 1
                except Exception as e:
                    midi_path = future_to_file[future]
                    print(f"Unexpected error processing {midi_path}: {e}")
                    batch_errors += 1
        
        pairs.extend(batch_pairs)
        error_count += batch_errors
        processed_count += batch_size_actual
        
        current_error_rate = error_count / processed_count if processed_count > 0 else 0
        print(f"Batch complete: {len(batch_pairs)} successful, {batch_errors} errors")
        print(f"Current error rate: {current_error_rate:.2%}")
        
        if current_error_rate > error_threshold:
            print(f"Error rate {current_error_rate:.2%} exceeds threshold {error_threshold:.2%}. Stopping processing.")
            break
    
    print(f"LMD processing complete: {len(pairs)} successful entries, {error_count} errors")
    print(f"Final error rate: {error_count/processed_count:.2%} ({error_count}/{processed_count})")
    
    if pairs:
        print("=== LMD Sample ===")
        for i, pair in enumerate(pairs[:2]):
            print(f"Entry {i+1}:")
            print(f"  Prompt: {pair['prompt']}")
            print(f"  Target ABC: {pair['target_abc'][:100]}...")
            print(f"  MIDI Path: {pair['midi_path']}")
            print()
        
        # Save to file
        if output_format.lower() == "csv":
            df = pd.DataFrame(pairs)
            df.to_csv(output_file, index=False, encoding='utf-8')
            print(f"Saved LMD data to {output_file} as CSV")
        elif output_format.lower() == "json":
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(pairs, f, ensure_ascii=False, indent=2)
            print(f"Saved LMD data to {output_file} as JSON")
        else:
            print(f"Unsupported output format '{output_format}'. Use 'csv' or 'json'.")
    else:
        print("No successful entries were processed from LMD dataset.")

if __name__ == '__main__':
    # Process other datasets and merge them
    guzheng_pairs = process_guzheng_tech99(use_audio_conversion=False)
    essen_pairs = process_essen('../data/')
    pop909_pairs = process_pop909('../data/POP909')
    all_pairs = guzheng_pairs + essen_pairs + pop909_pairs
    dataset = Dataset.from_list(all_pairs)
    dataset.save_to_disk('../output/combined_dataset')
    print("Saved combined dataset (excluding LMD) to ../output/combined_dataset")
    
    # Process LMD separately and save to CSV
    # process_lmd('../data/LMD', output_file="../output/lmd_data.csv", output_format="csv", max_workers=4)