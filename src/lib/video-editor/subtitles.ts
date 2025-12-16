/**
 * Subtitles Module
 * SRT/VTT parsing, generation, and subtitle burning utilities
 */

import type {
  SubtitleEntry,
  SubtitleStyle,
  SubtitleConfig,
  SrtCue,
  WordTimestamp,
} from "./types";
import { SUBTITLE_PRESETS, DEFAULTS } from "./config";

// ============================================================================
// Time Parsing Utilities
// ============================================================================

/**
 * Parse SRT timestamp to seconds
 * Format: HH:MM:SS,mmm or HH:MM:SS.mmm
 */
export function parseSrtTimestamp(timestamp: string): number {
  const normalized = timestamp.replace(",", ".");
  const parts = normalized.split(":");

  if (parts.length !== 3) {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(".");
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Convert seconds to SRT timestamp format
 * Output: HH:MM:SS,mmm
 */
export function secondsToSrtTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.round((totalSeconds % 1) * 1000);

  return (
    `${hours.toString().padStart(2, "0")}:` +
    `${minutes.toString().padStart(2, "0")}:` +
    `${seconds.toString().padStart(2, "0")},` +
    `${milliseconds.toString().padStart(3, "0")}`
  );
}

/**
 * Parse VTT timestamp to seconds
 * Format: MM:SS.mmm or HH:MM:SS.mmm
 */
export function parseVttTimestamp(timestamp: string): number {
  const parts = timestamp.split(":");

  if (parts.length === 2) {
    // MM:SS.mmm format
    const minutes = parseInt(parts[0], 10);
    const secondsParts = parts[1].split(".");
    const seconds = parseInt(secondsParts[0], 10);
    const milliseconds = parseInt(secondsParts[1] || "0", 10);
    return minutes * 60 + seconds + milliseconds / 1000;
  }

  // HH:MM:SS.mmm format
  return parseSrtTimestamp(timestamp.replace(",", "."));
}

// ============================================================================
// SRT Parser
// ============================================================================

/**
 * Parse SRT file content into cues
 */
export function parseSrt(content: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const lines = content.trim().split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    // Skip empty lines
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    // Parse index
    const index = parseInt(lines[i].trim(), 10);
    if (isNaN(index)) {
      i++;
      continue;
    }
    i++;

    // Parse timestamp line
    if (i >= lines.length) break;
    const timestampLine = lines[i].trim();
    const timestampMatch = timestampLine.match(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/
    );

    if (!timestampMatch) {
      i++;
      continue;
    }

    const startTime = parseSrtTimestamp(timestampMatch[1]);
    const endTime = parseSrtTimestamp(timestampMatch[2]);
    i++;

    // Parse text lines until empty line or end
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      textLines.push(lines[i].trim());
      i++;
    }

    cues.push({
      index,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return cues;
}

/**
 * Generate SRT content from cues
 */
export function generateSrt(cues: SrtCue[]): string {
  return cues
    .map((cue, index) => {
      const start = secondsToSrtTimestamp(cue.startTime);
      const end = secondsToSrtTimestamp(cue.endTime);
      return `${index + 1}\n${start} --> ${end}\n${cue.text}`;
    })
    .join("\n\n");
}

// ============================================================================
// VTT Parser
// ============================================================================

/**
 * Parse WebVTT file content into cues
 */
export function parseVtt(content: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const lines = content.trim().split(/\r?\n/);

  // Skip header
  let i = 0;
  while (i < lines.length && !lines[i].includes("-->")) {
    i++;
  }

  let index = 1;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Find timestamp line
    const timestampMatch = line.match(
      /(\d{2}:)?(\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:)?(\d{2}:\d{2}\.\d{3})/
    );

    if (timestampMatch) {
      const startStr = (timestampMatch[1] || "00:") + timestampMatch[2];
      const endStr = (timestampMatch[3] || "00:") + timestampMatch[4];

      const startTime = parseVttTimestamp(startStr);
      const endTime = parseVttTimestamp(endStr);
      i++;

      // Parse text lines
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() && !lines[i].includes("-->")) {
        // Remove VTT styling tags
        const cleanLine = lines[i]
          .trim()
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ");
        if (cleanLine) {
          textLines.push(cleanLine);
        }
        i++;
      }

      if (textLines.length > 0) {
        cues.push({
          index: index++,
          startTime,
          endTime,
          text: textLines.join("\n"),
        });
      }
    } else {
      i++;
    }
  }

  return cues;
}

/**
 * Generate WebVTT content from cues
 */
export function generateVtt(cues: SrtCue[]): string {
  const header = "WEBVTT\n\n";
  const cueStrings = cues.map((cue) => {
    const start = secondsToSrtTimestamp(cue.startTime).replace(",", ".");
    const end = secondsToSrtTimestamp(cue.endTime).replace(",", ".");
    return `${start} --> ${end}\n${cue.text}`;
  });

  return header + cueStrings.join("\n\n");
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert SRT cues to SubtitleEntry array
 */
export function srtCuesToEntries(cues: SrtCue[]): SubtitleEntry[] {
  return cues.map((cue) => ({
    id: `cue-${cue.index}`,
    startTime: cue.startTime,
    endTime: cue.endTime,
    text: cue.text,
  }));
}

/**
 * Convert SubtitleEntry array to SRT cues
 */
export function entriesToSrtCues(entries: SubtitleEntry[]): SrtCue[] {
  return entries.map((entry, index) => ({
    index: index + 1,
    startTime: entry.startTime,
    endTime: entry.endTime,
    text: entry.text,
  }));
}

/**
 * Parse subtitle file (auto-detect format)
 */
export function parseSubtitleFile(content: string): SubtitleEntry[] {
  const trimmed = content.trim();

  // Detect format
  if (trimmed.startsWith("WEBVTT")) {
    return srtCuesToEntries(parseVtt(content));
  }

  // Assume SRT
  return srtCuesToEntries(parseSrt(content));
}

// ============================================================================
// Word-Level Processing
// ============================================================================

/**
 * Split subtitle entries into word-level timestamps
 * Note: This is an approximation when precise timestamps aren't available
 */
export function splitIntoWords(entries: SubtitleEntry[]): WordTimestamp[] {
  const words: WordTimestamp[] = [];

  for (const entry of entries) {
    const entryWords = entry.text
      .split(/\s+/)
      .filter((w) => w.trim().length > 0);
    const wordCount = entryWords.length;

    if (wordCount === 0) continue;

    const duration = entry.endTime - entry.startTime;
    const wordDuration = duration / wordCount;

    entryWords.forEach((word, index) => {
      words.push({
        word,
        startTime: entry.startTime + index * wordDuration,
        endTime: entry.startTime + (index + 1) * wordDuration,
      });
    });
  }

  return words;
}

/**
 * Group words back into caption lines with max characters
 */
export function groupWordsIntoLines(
  words: WordTimestamp[],
  maxCharsPerLine: number = 40
): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  let currentLine: WordTimestamp[] = [];
  let currentLength = 0;
  let entryIndex = 1;

  for (const word of words) {
    const wordLength = word.word.length + (currentLine.length > 0 ? 1 : 0);

    if (
      currentLength + wordLength > maxCharsPerLine &&
      currentLine.length > 0
    ) {
      // Finish current line
      entries.push({
        id: `entry-${entryIndex++}`,
        startTime: currentLine[0].startTime,
        endTime: currentLine[currentLine.length - 1].endTime,
        text: currentLine.map((w) => w.word).join(" "),
      });
      currentLine = [];
      currentLength = 0;
    }

    currentLine.push(word);
    currentLength += wordLength;
  }

  // Don't forget the last line
  if (currentLine.length > 0) {
    entries.push({
      id: `entry-${entryIndex}`,
      startTime: currentLine[0].startTime,
      endTime: currentLine[currentLine.length - 1].endTime,
      text: currentLine.map((w) => w.word).join(" "),
    });
  }

  return entries;
}

// ============================================================================
// Subtitle Config Builder
// ============================================================================

/**
 * Create a subtitle configuration
 */
export function createSubtitleConfig(options: {
  entries: SubtitleEntry[];
  preset?: keyof typeof SUBTITLE_PRESETS;
  style?: Partial<SubtitleStyle>;
  wordByWord?: boolean;
}): SubtitleConfig {
  const baseStyle = options.preset
    ? SUBTITLE_PRESETS[options.preset]
    : DEFAULTS.subtitleStyle;

  return {
    entries: options.entries,
    style: {
      ...baseStyle,
      ...options.style,
    },
    wordByWord: options.wordByWord ?? false,
  };
}

/**
 * Create subtitle config from SRT file content
 */
export function createSubtitleConfigFromSrt(
  srtContent: string,
  options?: {
    preset?: keyof typeof SUBTITLE_PRESETS;
    style?: Partial<SubtitleStyle>;
    wordByWord?: boolean;
  }
): SubtitleConfig {
  const entries = parseSubtitleFile(srtContent);
  return createSubtitleConfig({
    entries,
    ...options,
  });
}

// ============================================================================
// Offset Utilities
// ============================================================================

/**
 * Shift all subtitle timestamps by an offset
 */
export function offsetSubtitles(
  entries: SubtitleEntry[],
  offsetSeconds: number
): SubtitleEntry[] {
  return entries.map((entry) => ({
    ...entry,
    startTime: Math.max(0, entry.startTime + offsetSeconds),
    endTime: Math.max(0, entry.endTime + offsetSeconds),
  }));
}

/**
 * Scale subtitle timestamps (useful when video speed changes)
 */
export function scaleSubtitles(
  entries: SubtitleEntry[],
  scaleFactor: number
): SubtitleEntry[] {
  return entries.map((entry) => ({
    ...entry,
    startTime: entry.startTime * scaleFactor,
    endTime: entry.endTime * scaleFactor,
  }));
}

/**
 * Merge consecutive subtitles with small gaps
 */
export function mergeSubtitles(
  entries: SubtitleEntry[],
  maxGapSeconds: number = 0.1
): SubtitleEntry[] {
  if (entries.length === 0) return [];

  const merged: SubtitleEntry[] = [];
  let current = { ...entries[0] };

  for (let i = 1; i < entries.length; i++) {
    const next = entries[i];
    const gap = next.startTime - current.endTime;

    if (gap <= maxGapSeconds) {
      // Merge
      current.endTime = next.endTime;
      current.text += " " + next.text;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

// ============================================================================
// FFmpeg Filter Generation (for burning subtitles)
// ============================================================================

/**
 * Generate FFmpeg drawtext filter for a subtitle style
 * This is used internally by the pipeline
 */
export function generateDrawtextFilter(
  style: SubtitleStyle,
  text: string,
  videoWidth: number,
  videoHeight: number
): string {
  const fontSize = style.fontSize || 48;
  const fontColor = style.fontColor?.replace("#", "0x") || "0xFFFFFF";
  const posY = Math.round(videoHeight * (style.positionY || 0.85));

  let filter = "drawtext=";
  filter += `text='${text.replace(/'/g, "'\\''")}':`;
  filter += `fontsize=${fontSize}:`;
  filter += `fontcolor=${fontColor}:`;
  filter += `x=(w-text_w)/2:`;
  filter += `y=${posY}:`;

  if (style.fontFamily) {
    filter += `font='${style.fontFamily}':`;
  }

  if (style.strokeColor && style.strokeWidth) {
    const borderColor = style.strokeColor.replace("#", "0x");
    filter += `borderw=${style.strokeWidth}:bordercolor=${borderColor}:`;
  }

  // Remove trailing colon
  filter = filter.replace(/:$/, "");

  return filter;
}

/**
 * Generate ASS subtitle style string
 * ASS format allows for more advanced styling
 */
export function generateAssStyle(
  styleName: string,
  style: SubtitleStyle
): string {
  const fontName = style.fontFamily || "Arial";
  const fontSize = style.fontSize || 48;
  const primaryColor = assColor(style.fontColor || "#FFFFFF");
  const outlineColor = assColor(style.strokeColor || "#000000");
  const outlineWidth = style.strokeWidth || 2;
  const bold =
    style.fontWeight === "bold" || style.fontWeight === "bolder" ? -1 : 0;
  const alignment = style.positionY && style.positionY < 0.5 ? 8 : 2; // Top or bottom center

  return (
    `Style: ${styleName},${fontName},${fontSize},` +
    `${primaryColor},&H000000FF,${outlineColor},&H80000000,` +
    `${bold},0,0,0,100,100,0,0,1,${outlineWidth},0,${alignment},10,10,10,1`
  );
}

/**
 * Convert hex color to ASS format (&HAABBGGRR)
 */
function assColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    const r = clean.substring(0, 2);
    const g = clean.substring(2, 4);
    const b = clean.substring(4, 6);
    return `&H00${b}${g}${r}`;
  }
  return "&H00FFFFFF";
}
