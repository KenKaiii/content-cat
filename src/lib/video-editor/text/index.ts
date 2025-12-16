/**
 * Text/Typography Module
 * Complete text overlay system for video editing
 *
 * @example Create a simple title
 * ```typescript
 * import { createStaticText, getPreset, generateDrawtextFilter } from './text';
 *
 * const style = getPreset('title-impact')?.style;
 * const element = createStaticText('MY TITLE', 'middle-center', style);
 * const filter = generateDrawtextFilter(element, { width: 1080, height: 1920 });
 * ```
 *
 * @example Create timed captions
 * ```typescript
 * import { createTimedText, SUBTITLE_PRESETS } from './text';
 *
 * const caption = createTimedText(
 *   'Hello World!',
 *   0,    // start at 0 seconds
 *   3,    // end at 3 seconds
 *   'bottom-center',
 *   SUBTITLE_PRESETS['subtitle-tiktok'].style
 * );
 * ```
 */

// Types
export type {
  // Position
  HorizontalAlign,
  VerticalAlign,
  PositionPreset,
  CustomPosition,
  TextPosition,

  // Font
  FontWeight,
  FontFamily,
  FontConfig,

  // Color
  Color,
  GradientDirection,
  GradientColor,
  TextColor,

  // Effects
  StrokeConfig,
  ShadowConfig,
  BackgroundConfig,
  TextAnimation,
  AnimationConfig,

  // Elements
  TextStyle,
  TextElement,
  TextLayer,

  // Presets
  TextStylePreset,
  FontMetadata,
} from "./types";

// Fonts
export {
  FONTS,
  FONT_WEIGHT_VALUES,
  getFontWeightValue,
  isFontAvailable,
  getAvailableFonts,
  getFontsByCategory,
  getFontsForUse,
  getFontWithFallback,
  FONTS_DIR,
  getFontPath,
  getGoogleFontsCssUrl,
  getMissingFonts,
} from "./fonts";

// Presets
export {
  TITLE_PRESETS,
  HOOK_PRESETS,
  SUBTITLE_PRESETS,
  LOWER_THIRD_PRESETS,
  CTA_PRESETS,
  ALL_PRESETS,
  getPresetsByCategory,
  getPreset,
  getPresetNames,
  getPresetCategories,
} from "./presets";

// Rendering
export {
  positionToFFmpeg,
  colorToFFmpeg,
  escapeTextForFFmpeg,
  generateDrawtextFilter,
  generateAnimationFilters,
  generateTextLayerFilters,
  generateAllTextFilters,
  createTextElement,
  createTextLayer,
  createStaticText,
  createTimedText,
  wrapText,
  calculateFontSize,
} from "./render";

export type { VideoDimensions } from "./render";
