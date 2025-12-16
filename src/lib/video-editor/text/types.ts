/**
 * Text/Typography Types
 * Type definitions for text overlays, titles, and captions
 */

// ============================================================================
// Position Types
// ============================================================================

/** Horizontal alignment */
export type HorizontalAlign = "left" | "center" | "right";

/** Vertical alignment */
export type VerticalAlign = "top" | "middle" | "bottom";

/** Position preset for quick placement */
export type PositionPreset =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** Custom position with pixel or percentage values */
export interface CustomPosition {
  /** X position - pixels from left, or percentage string like "50%" */
  x: number | string;
  /** Y position - pixels from top, or percentage string like "50%" */
  y: number | string;
  /** Horizontal alignment relative to x position */
  alignX?: HorizontalAlign;
  /** Vertical alignment relative to y position */
  alignY?: VerticalAlign;
}

/** Position can be preset or custom */
export type TextPosition = PositionPreset | CustomPosition;

// ============================================================================
// Font Types
// ============================================================================

/** Font weight options */
export type FontWeight =
  | "thin" // 100
  | "extralight" // 200
  | "light" // 300
  | "regular" // 400
  | "medium" // 500
  | "semibold" // 600
  | "bold" // 700
  | "extrabold" // 800
  | "black"; // 900

/** Built-in font families (must be installed) */
export type FontFamily =
  // Sans-serif (clean, modern)
  | "Montserrat"
  | "Roboto"
  | "Poppins"
  | "Inter"
  | "Open Sans"
  | "Oswald"
  // Display/Impact (bold, attention-grabbing)
  | "Bebas Neue"
  | "Anton"
  | "Impact"
  | "Archivo Black"
  | "Black Ops One"
  // Fun/Creative
  | "Bangers"
  | "Permanent Marker"
  | "Pacifico"
  | "Lobster"
  // System fallbacks
  | "Arial"
  | "Helvetica"
  | "Arial Black"
  | "Verdana";

/** Font configuration */
export interface FontConfig {
  /** Font family name */
  family: FontFamily | string;
  /** Font size in pixels */
  size: number;
  /** Font weight */
  weight?: FontWeight;
  /** Line height multiplier (1.0 = normal) */
  lineHeight?: number;
  /** Letter spacing in pixels */
  letterSpacing?: number;
}

// ============================================================================
// Color Types
// ============================================================================

/** Color can be hex, rgba, or named */
export type Color = string;

/** Gradient direction */
export type GradientDirection =
  | "to-right"
  | "to-left"
  | "to-top"
  | "to-bottom"
  | "to-top-right"
  | "to-top-left"
  | "to-bottom-right"
  | "to-bottom-left";

/** Gradient color definition */
export interface GradientColor {
  type: "gradient";
  direction: GradientDirection;
  colors: Color[];
}

/** Text color - solid or gradient */
export type TextColor = Color | GradientColor;

// ============================================================================
// Effect Types
// ============================================================================

/** Text stroke/outline configuration */
export interface StrokeConfig {
  /** Stroke color */
  color: Color;
  /** Stroke width in pixels */
  width: number;
}

/** Drop shadow configuration */
export interface ShadowConfig {
  /** Shadow color */
  color: Color;
  /** Horizontal offset in pixels */
  offsetX: number;
  /** Vertical offset in pixels */
  offsetY: number;
  /** Blur radius (0 = sharp shadow) */
  blur?: number;
}

/** Background box configuration */
export interface BackgroundConfig {
  /** Background color */
  color: Color;
  /** Padding around text in pixels */
  padding: number | { x: number; y: number };
  /** Border radius in pixels */
  borderRadius?: number;
  /** Border configuration */
  border?: {
    color: Color;
    width: number;
  };
}

/** Text animation type */
export type TextAnimation =
  | "none"
  | "fade-in"
  | "fade-out"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "pop"
  | "bounce"
  | "typewriter"
  | "wave";

/** Animation configuration */
export interface AnimationConfig {
  /** Animation type */
  type: TextAnimation;
  /** Animation duration in seconds */
  duration: number;
  /** Delay before animation starts */
  delay?: number;
  /** Easing function */
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

// ============================================================================
// Text Element Types
// ============================================================================

/** Complete text style configuration */
export interface TextStyle {
  /** Font configuration */
  font: FontConfig;
  /** Text color */
  color: TextColor;
  /** Text stroke/outline */
  stroke?: StrokeConfig;
  /** Drop shadow */
  shadow?: ShadowConfig;
  /** Background box */
  background?: BackgroundConfig;
  /** Text transform */
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
  /** Text opacity (0-1) */
  opacity?: number;
}

/** A single text element to render */
export interface TextElement {
  /** Unique identifier */
  id: string;
  /** Text content (supports \n for line breaks) */
  text: string;
  /** Position on video */
  position: TextPosition;
  /** Text styling */
  style: TextStyle;
  /** When to show (in seconds from video start) */
  startTime?: number;
  /** When to hide (in seconds from video start) */
  endTime?: number;
  /** Entry animation */
  animationIn?: AnimationConfig;
  /** Exit animation */
  animationOut?: AnimationConfig;
  /** Z-index for layering (higher = on top) */
  zIndex?: number;
}

/** Text layer containing multiple elements */
export interface TextLayer {
  /** Layer identifier */
  id: string;
  /** Text elements in this layer */
  elements: TextElement[];
}

// ============================================================================
// Preset Types
// ============================================================================

/** Named style preset */
export interface TextStylePreset {
  /** Preset name */
  name: string;
  /** Preset category */
  category: "title" | "subtitle" | "caption" | "hook" | "cta" | "lower-third";
  /** Style configuration */
  style: TextStyle;
  /** Default position */
  defaultPosition?: TextPosition;
  /** Description */
  description?: string;
  /** Preview image URL */
  previewUrl?: string;
}

// ============================================================================
// Font Metadata
// ============================================================================

/** Font metadata for UI display */
export interface FontMetadata {
  /** Font family name */
  family: FontFamily | string;
  /** Display name for UI */
  displayName: string;
  /** Font category */
  category: "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
  /** Available weights */
  weights: FontWeight[];
  /** Whether font is installed/available */
  isAvailable?: boolean;
  /** Path to font file (if local) */
  fontPath?: string;
  /** Google Fonts URL (if applicable) */
  googleFontsUrl?: string;
  /** Best used for */
  recommendedFor: ("titles" | "subtitles" | "captions" | "hooks")[];
}
