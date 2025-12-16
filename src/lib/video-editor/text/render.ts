/**
 * Text Rendering
 * Generate FFmpeg drawtext filters for text overlays
 */

import type {
  TextElement,
  TextStyle,
  TextPosition,
  PositionPreset,
  CustomPosition,
  TextLayer,
} from "./types";
import { getFontWithFallback, getFontPath } from "./fonts";

// ============================================================================
// Position Helpers
// ============================================================================

/** Video dimensions for position calculations */
export interface VideoDimensions {
  width: number;
  height: number;
}

/** Padding from edges in pixels */
const EDGE_PADDING = 40;

/**
 * Convert position preset to FFmpeg x/y expressions
 */
function presetToPosition(preset: PositionPreset): { x: string; y: string } {
  const positions: Record<PositionPreset, { x: string; y: string }> = {
    "top-left": {
      x: `${EDGE_PADDING}`,
      y: `${EDGE_PADDING}`,
    },
    "top-center": {
      x: "(w-text_w)/2",
      y: `${EDGE_PADDING}`,
    },
    "top-right": {
      x: `w-text_w-${EDGE_PADDING}`,
      y: `${EDGE_PADDING}`,
    },
    "middle-left": {
      x: `${EDGE_PADDING}`,
      y: "(h-text_h)/2",
    },
    "middle-center": {
      x: "(w-text_w)/2",
      y: "(h-text_h)/2",
    },
    "middle-right": {
      x: `w-text_w-${EDGE_PADDING}`,
      y: "(h-text_h)/2",
    },
    "bottom-left": {
      x: `${EDGE_PADDING}`,
      y: `h-text_h-${EDGE_PADDING}`,
    },
    "bottom-center": {
      x: "(w-text_w)/2",
      y: `h-text_h-${EDGE_PADDING}`,
    },
    "bottom-right": {
      x: `w-text_w-${EDGE_PADDING}`,
      y: `h-text_h-${EDGE_PADDING}`,
    },
  };

  return positions[preset];
}

/**
 * Convert custom position to FFmpeg x/y expressions
 */
function customToPosition(
  custom: CustomPosition,
  dims: VideoDimensions
): { x: string; y: string } {
  let x: string;
  let y: string;

  // Handle X position
  if (typeof custom.x === "string" && custom.x.endsWith("%")) {
    const percent = parseFloat(custom.x) / 100;
    x = `${Math.round(dims.width * percent)}`;
  } else {
    x = String(custom.x);
  }

  // Handle Y position
  if (typeof custom.y === "string" && custom.y.endsWith("%")) {
    const percent = parseFloat(custom.y) / 100;
    y = `${Math.round(dims.height * percent)}`;
  } else {
    y = String(custom.y);
  }

  // Apply alignment adjustments
  if (custom.alignX === "center") {
    x = `${x}-text_w/2`;
  } else if (custom.alignX === "right") {
    x = `${x}-text_w`;
  }

  if (custom.alignY === "middle") {
    y = `${y}-text_h/2`;
  } else if (custom.alignY === "bottom") {
    y = `${y}-text_h`;
  }

  return { x, y };
}

/**
 * Convert TextPosition to FFmpeg x/y expressions
 */
export function positionToFFmpeg(
  position: TextPosition,
  dims: VideoDimensions
): { x: string; y: string } {
  if (typeof position === "string") {
    return presetToPosition(position);
  }
  return customToPosition(position, dims);
}

// ============================================================================
// Color Helpers
// ============================================================================

/**
 * Convert color to FFmpeg format
 * FFmpeg uses 0xRRGGBB or 0xRRGGBBAA format
 */
export function colorToFFmpeg(color: string): string {
  // Handle rgba()
  if (color.startsWith("rgba(")) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const [, r, g, b, a] = match;
      const alpha = Math.round(parseFloat(a) * 255)
        .toString(16)
        .padStart(2, "0");
      const hex =
        parseInt(r).toString(16).padStart(2, "0") +
        parseInt(g).toString(16).padStart(2, "0") +
        parseInt(b).toString(16).padStart(2, "0");
      return `0x${hex}${alpha}`;
    }
  }

  // Handle rgb()
  if (color.startsWith("rgb(")) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match;
      const hex =
        parseInt(r).toString(16).padStart(2, "0") +
        parseInt(g).toString(16).padStart(2, "0") +
        parseInt(b).toString(16).padStart(2, "0");
      return `0x${hex}`;
    }
  }

  // Handle hex
  if (color.startsWith("#")) {
    return "0x" + color.slice(1);
  }

  // Return as-is (named colors work in some cases)
  return color;
}

// ============================================================================
// Text Escaping
// ============================================================================

/**
 * Escape text for FFmpeg drawtext filter
 */
export function escapeTextForFFmpeg(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Backslashes first
    .replace(/'/g, "'\\''") // Single quotes
    .replace(/:/g, "\\:") // Colons
    .replace(/\[/g, "\\[") // Square brackets
    .replace(/\]/g, "\\]")
    .replace(/%/g, "%%"); // Percent signs
}

/**
 * Convert newlines to FFmpeg format
 */
function handleNewlines(text: string): string {
  // FFmpeg drawtext doesn't support \n directly in all cases
  // We need to use multiple drawtext filters for multiline
  return text.replace(/\n/g, "\\n");
}

// ============================================================================
// Filter Generation
// ============================================================================

/**
 * Generate FFmpeg drawtext filter for a text element
 */
export function generateDrawtextFilter(
  element: TextElement,
  dims: VideoDimensions
): string {
  const { text, position, style } = element;

  const parts: string[] = ["drawtext="];

  // Text content
  const escapedText = escapeTextForFFmpeg(handleNewlines(text));
  parts.push(`text='${escapedText}'`);

  // Font
  const fontFamily = getFontWithFallback(style.font.family);
  parts.push(`:font='${fontFamily}'`);
  parts.push(`:fontsize=${style.font.size}`);

  // Font file (if available locally)
  const fontPath = getFontPath(style.font.family, style.font.weight);
  if (fontPath) {
    parts.push(`:fontfile='${fontPath}'`);
  }

  // Text color
  const fontColor = colorToFFmpeg(
    typeof style.color === "string" ? style.color : style.color.colors[0]
  );
  parts.push(`:fontcolor=${fontColor}`);

  // Position
  const pos = positionToFFmpeg(position, dims);
  parts.push(`:x=${pos.x}`);
  parts.push(`:y=${pos.y}`);

  // Stroke/Border
  if (style.stroke) {
    parts.push(`:borderw=${style.stroke.width}`);
    parts.push(`:bordercolor=${colorToFFmpeg(style.stroke.color)}`);
  }

  // Shadow
  if (style.shadow) {
    parts.push(`:shadowcolor=${colorToFFmpeg(style.shadow.color)}`);
    parts.push(`:shadowx=${style.shadow.offsetX}`);
    parts.push(`:shadowy=${style.shadow.offsetY}`);
  }

  // Background box
  if (style.background) {
    parts.push(`:box=1`);
    parts.push(`:boxcolor=${colorToFFmpeg(style.background.color)}`);
    const padding = style.background.padding;
    if (typeof padding === "number") {
      parts.push(`:boxborderw=${padding}`);
    } else {
      // FFmpeg only supports uniform padding, use average
      const avgPadding = Math.round((padding.x + padding.y) / 2);
      parts.push(`:boxborderw=${avgPadding}`);
    }
  }

  // Line spacing
  if (style.font.lineHeight && style.font.lineHeight !== 1) {
    const spacing = Math.round((style.font.lineHeight - 1) * style.font.size);
    parts.push(`:line_spacing=${spacing}`);
  }

  // Timing (enable expression)
  if (element.startTime !== undefined || element.endTime !== undefined) {
    const start = element.startTime ?? 0;
    const end = element.endTime ?? 999999;
    parts.push(`:enable='between(t,${start},${end})'`);
  }

  // Opacity/Alpha
  if (style.opacity !== undefined && style.opacity !== 1) {
    parts.push(`:alpha=${style.opacity}`);
  }

  return parts.join("");
}

/**
 * Generate animation filter chain
 * Note: FFmpeg animations require more complex filter chains
 */
export function generateAnimationFilters(
  element: TextElement,
  dims: VideoDimensions,
  inputLabel: string
): { filters: string[]; outputLabel: string } {
  const filters: string[] = [];
  let currentLabel = inputLabel;
  let filterIndex = 0;

  const nextLabel = () => {
    filterIndex++;
    return `anim_${element.id}_${filterIndex}`;
  };

  // Fade in animation
  if (element.animationIn?.type === "fade-in") {
    const duration = element.animationIn.duration;
    const start = element.startTime ?? 0;
    const outLabel = nextLabel();

    // Use fade filter for the text (requires separate processing)
    // For simplicity, we'll use alpha expression in drawtext
    filters.push(
      `[${currentLabel}]drawtext=text='':enable='between(t,${start},${start + duration})':` +
        `alpha='(t-${start})/${duration}'[${outLabel}]`
    );
    currentLabel = outLabel;
  }

  // Fade out animation
  if (element.animationOut?.type === "fade-out") {
    const duration = element.animationOut.duration;
    const end = element.endTime ?? 999999;
    const fadeStart = end - duration;
    const outLabel = nextLabel();

    filters.push(
      `[${currentLabel}]drawtext=text='':enable='between(t,${fadeStart},${end})':` +
        `alpha='1-(t-${fadeStart})/${duration}'[${outLabel}]`
    );
    currentLabel = outLabel;
  }

  return { filters, outputLabel: currentLabel };
}

/**
 * Generate filter complex for multiple text elements
 */
export function generateTextLayerFilters(
  layer: TextLayer,
  dims: VideoDimensions,
  inputLabel: string = "0:v"
): { filterComplex: string; outputLabel: string } {
  if (layer.elements.length === 0) {
    return { filterComplex: "", outputLabel: inputLabel };
  }

  // Sort by z-index
  const sortedElements = [...layer.elements].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
  );

  // Build filter chain
  const drawTextFilters = sortedElements.map((element) =>
    generateDrawtextFilter(element, dims)
  );

  // Chain all drawtext filters together
  const combinedFilter = drawTextFilters.join(",");
  const outputLabel = `text_${layer.id}`;

  return {
    filterComplex: `[${inputLabel}]${combinedFilter}[${outputLabel}]`,
    outputLabel,
  };
}

/**
 * Generate filters for multiple text layers
 */
export function generateAllTextFilters(
  layers: TextLayer[],
  dims: VideoDimensions,
  inputLabel: string = "0:v"
): { filterComplex: string; outputLabel: string } {
  if (layers.length === 0) {
    return { filterComplex: "", outputLabel: inputLabel };
  }

  let currentLabel = inputLabel;
  const filterParts: string[] = [];

  for (const layer of layers) {
    const { filterComplex, outputLabel } = generateTextLayerFilters(
      layer,
      dims,
      currentLabel
    );

    if (filterComplex) {
      filterParts.push(filterComplex);
      currentLabel = outputLabel;
    }
  }

  return {
    filterComplex: filterParts.join(";\n"),
    outputLabel: currentLabel,
  };
}

// ============================================================================
// Text Element Builders
// ============================================================================

/**
 * Create a simple text element
 */
export function createTextElement(options: {
  id?: string;
  text: string;
  position?: TextPosition;
  style: TextStyle;
  startTime?: number;
  endTime?: number;
  zIndex?: number;
}): TextElement {
  return {
    id: options.id ?? `text-${Date.now()}`,
    text: options.text,
    position: options.position ?? "middle-center",
    style: options.style,
    startTime: options.startTime,
    endTime: options.endTime,
    zIndex: options.zIndex ?? 0,
  };
}

/**
 * Create a text layer
 */
export function createTextLayer(
  id: string,
  elements: TextElement[]
): TextLayer {
  return { id, elements };
}

/**
 * Create a static text overlay (always visible)
 */
export function createStaticText(
  text: string,
  position: TextPosition,
  style: TextStyle
): TextElement {
  return createTextElement({
    text,
    position,
    style,
  });
}

/**
 * Create a timed text overlay
 */
export function createTimedText(
  text: string,
  startTime: number,
  endTime: number,
  position: TextPosition,
  style: TextStyle
): TextElement {
  return createTextElement({
    text,
    position,
    style,
    startTime,
    endTime,
  });
}

// ============================================================================
// Multiline Text Handling
// ============================================================================

/**
 * Split long text into multiple lines
 */
export function wrapText(text: string, maxCharsPerLine: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.join("\n");
}

/**
 * Calculate optimal font size for text to fit width
 */
export function calculateFontSize(
  text: string,
  maxWidth: number,
  baseFontSize: number,
  minFontSize: number = 24
): number {
  // Rough estimate: average char width is ~0.6 of font size
  const charWidthRatio = 0.6;
  const longestLine = text
    .split("\n")
    .reduce((max, line) => Math.max(max, line.length), 0);

  const estimatedWidth = longestLine * baseFontSize * charWidthRatio;

  if (estimatedWidth <= maxWidth) {
    return baseFontSize;
  }

  const scaledSize = Math.floor((maxWidth / estimatedWidth) * baseFontSize);
  return Math.max(minFontSize, scaledSize);
}
