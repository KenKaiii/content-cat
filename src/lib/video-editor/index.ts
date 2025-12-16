/**
 * Video Editor Module
 * Complete video editing toolkit for short-form content creation
 *
 * @example Basic usage
 * ```typescript
 * import { createPipeline, createTransition, executePipeline } from '@/lib/video-editor';
 *
 * const config = createPipeline()
 *   .addClipsFromPaths(['./video1.mp4', './video2.mp4'])
 *   .setAllTransitions(createTransition('fade', 0.3))
 *   .addBackgroundMusic('./music.mp3', { volume: 0.3 })
 *   .setOutputForPlatform('tiktok', './output.mp4')
 *   .build();
 *
 * const result = await executePipeline(config);
 * ```
 *
 * @example Quick short-form video
 * ```typescript
 * import { createShortFormVideo } from '@/lib/video-editor';
 *
 * const result = await createShortFormVideo({
 *   clips: ['./clip1.mp4', './clip2.mp4'],
 *   outputPath: './output.mp4',
 *   music: { source: './music.mp3', volume: 0.3 },
 *   subtitlesSrt: srtContent,
 *   transitionStyle: 'fade',
 * });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Base types
  VideoFormat,
  AudioFormat,
  AspectRatio,
  Resolution,
  ResolutionDimensions,

  // Clip types
  VideoClip,
  AudioTrack,

  // Subtitle types
  SubtitleEntry,
  SubtitleStyle,
  SubtitleAnimation,
  SubtitleConfig,
  SrtCue,
  WordTimestamp,

  // Transition types
  TransitionType,
  Transition,

  // Cut types
  CutSegment,
  CutConfig,

  // Pipeline types
  PipelineConfig,
  OutputConfig,
  EditResult,
  ProgressInfo,
  ProgressCallback,
} from "./types";

// ============================================================================
// Configuration & Presets
// ============================================================================

export {
  // Resolution
  RESOLUTION_MAP,
  getDimensions,

  // Platform presets
  PLATFORM_PRESETS,
  getOutputConfigForPlatform,

  // Subtitle presets
  SUBTITLE_PRESETS,

  // Transition presets
  TRANSITION_PRESETS,
  AVAILABLE_TRANSITIONS,

  // Quality presets
  QUALITY_PRESETS,

  // Defaults
  DEFAULTS,

  // Validation
  isValidAspectRatio,
  isValidResolution,
  isValidTransitionType,
  getFileExtension,
} from "./config";

export type { Platform, SubtitlePreset, TransitionPreset } from "./config";

// ============================================================================
// Subtitles
// ============================================================================

export {
  // Time parsing
  parseSrtTimestamp,
  secondsToSrtTimestamp,
  parseVttTimestamp,

  // Parsing
  parseSrt,
  parseVtt,
  parseSubtitleFile,

  // Generation
  generateSrt,
  generateVtt,

  // Conversion
  srtCuesToEntries,
  entriesToSrtCues,

  // Word-level
  splitIntoWords,
  groupWordsIntoLines,

  // Config builders
  createSubtitleConfig,
  createSubtitleConfigFromSrt,

  // Utilities
  offsetSubtitles,
  scaleSubtitles,
  mergeSubtitles,

  // FFmpeg filters
  generateDrawtextFilter,
  generateAssStyle,
} from "./subtitles";

// ============================================================================
// Transitions
// ============================================================================

export {
  // Definitions
  TRANSITION_DEFINITIONS,

  // Utilities
  getTransitionDefinition,
  getTransitionsByCategory,
  getTransitionCategories,
  createTransition,
  getRandomTransition,
  getShortFormTransitions,

  // FFmpeg filters
  generateXfadeFilter,
  generateEasingExpr,
  calculateTransitionOverlap,
  generateTransitionChain,

  // Validation
  validateTransitionDuration,
  autoAdjustTransitions,
} from "./transitions";

export type { TransitionDefinition } from "./transitions";

// ============================================================================
// Audio
// ============================================================================

export {
  // Track creation
  createAudioTrack,
  createBackgroundMusic,
  createVoiceover,
  createSoundEffect,

  // Mixing utilities
  calculateRequiredMusicDuration,
  fitAudioToVideo,
  calculateDuckingRanges,

  // FFmpeg filters
  generateVolumeFilter,
  generateAudioFadeFilter,
  generateAudioTrimFilter as generateAudioTrimFilterFromAudio,
  generateAudioDelayFilter,
  generateAudioLoopFilter,
  generateAudioTrackFilter,
  generateAudioMixFilter,
  generateDuckingFilter,

  // Analysis
  estimateTrackDuration,
  detectAudioConflicts,

  // Volume helpers
  dbToLinear,
  linearToDb,
  normalizeVolume,
} from "./audio";

export type { DuckingRange } from "./audio";

// ============================================================================
// Cuts & Clips
// ============================================================================

export {
  // Clip creation
  createVideoClip,
  trimClip,
  splitIntoClips,

  // Cut operations
  createKeepSegments,
  createRemoveSegments,
  cutConfigToClips,

  // Clip manipulation
  extendClip,
  shortenClip,
  shiftClip,
  splitClipAt,

  // Validation
  getClipDuration,
  validateClip,
  validateClips,

  // FFmpeg filters
  generateVideoTrimFilter,
  generateAudioTrimFilter,
  generateClipVolumeFilter,
  generateClipFilter,

  // Batch operations
  batchCreateClips,
  calculateTotalDuration,
  reorderClips,
  removeClipAt,
  insertClipAt,
} from "./cuts";

// ============================================================================
// Concatenation
// ============================================================================

export {
  // Config builders
  buildConcatConfig,
  calculateOutputDuration,

  // FFmpeg filters
  generateScaleFilter,
  generateSimpleConcatFilter,
  generateXfadeFilter as generateConcatXfadeFilter,
  generateAcrossfadeFilter,
  generateConcatFilterComplex,

  // Command generation
  generateConcatCommand,
  generateConcatCommandString,

  // Convenience functions
  simpleConcatConfig,
  uniformTransitionConfig,
  shortFormConcatConfig,
} from "./concatenate";

export type { ConcatConfig, ConcatResult } from "./concatenate";

// ============================================================================
// Pipeline
// ============================================================================

export {
  // Builder
  VideoPipelineBuilder,
  createPipeline,

  // Command generation
  generatePipelineCommand,

  // Execution
  executePipeline,

  // Convenience functions
  createShortFormVideo,
  concatenateVideos,

  // Utilities
  checkFFmpegAvailable,
  getFFmpegVersion,
} from "./pipeline";

// ============================================================================
// Text Overlays
// ============================================================================

export {
  // Types (re-export from text module)
  type HorizontalAlign,
  type VerticalAlign,
  type PositionPreset,
  type CustomPosition,
  type TextPosition,
  type FontWeight,
  type FontFamily,
  type FontConfig,
  type Color,
  type GradientDirection,
  type GradientColor,
  type TextColor,
  type StrokeConfig,
  type ShadowConfig,
  type BackgroundConfig,
  type TextAnimation,
  type AnimationConfig,
  type TextStyle,
  type TextElement,
  type TextLayer,
  type TextStylePreset,
  type FontMetadata,
  type VideoDimensions,

  // Fonts
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

  // Presets
  TITLE_PRESETS,
  HOOK_PRESETS,
  SUBTITLE_PRESETS as TEXT_SUBTITLE_PRESETS,
  LOWER_THIRD_PRESETS,
  CTA_PRESETS,
  ALL_PRESETS as ALL_TEXT_PRESETS,
  getPresetsByCategory,
  getPreset as getTextPreset,
  getPresetNames as getTextPresetNames,
  getPresetCategories,

  // Rendering
  positionToFFmpeg,
  colorToFFmpeg,
  escapeTextForFFmpeg,
  generateDrawtextFilter as generateTextDrawtextFilter,
  generateAnimationFilters,
  generateTextLayerFilters,
  generateAllTextFilters,
  createTextElement,
  createTextLayer,
  createStaticText,
  createTimedText,
  wrapText,
  calculateFontSize,
} from "./text";
