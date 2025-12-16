/**
 * Transitions Module
 * Video transition effects and FFmpeg filter generation
 */

import type { Transition, TransitionType } from "./types";
import { TRANSITION_PRESETS } from "./config";

// ============================================================================
// Transition Definitions
// ============================================================================

/** Transition metadata and behavior */
export interface TransitionDefinition {
  /** Transition type identifier */
  type: TransitionType;
  /** Human-readable name */
  name: string;
  /** Description of the effect */
  description: string;
  /** Default duration in seconds */
  defaultDuration: number;
  /** Minimum duration */
  minDuration: number;
  /** Maximum duration */
  maxDuration: number;
  /** Whether this transition requires xfade filter */
  usesXfade: boolean;
  /** FFmpeg xfade transition name (if applicable) */
  xfadeName?: string;
  /** Category for UI grouping */
  category:
    | "basic"
    | "directional"
    | "zoom"
    | "wipe"
    | "creative"
    | "shortform";
}

/** All available transitions with their definitions */
export const TRANSITION_DEFINITIONS: Record<
  TransitionType,
  TransitionDefinition
> = {
  // Basic
  none: {
    type: "none",
    name: "None",
    description: "Direct cut, no transition effect",
    defaultDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    usesXfade: false,
    category: "basic",
  },
  fade: {
    type: "fade",
    name: "Fade",
    description: "Fade to black between clips",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "fade",
    category: "basic",
  },
  crossfade: {
    type: "crossfade",
    name: "Crossfade",
    description: "Dissolve from one clip to another",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "dissolve",
    category: "basic",
  },

  // Directional
  slideLeft: {
    type: "slideLeft",
    name: "Slide Left",
    description: "New clip slides in from the right",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "slideleft",
    category: "directional",
  },
  slideRight: {
    type: "slideRight",
    name: "Slide Right",
    description: "New clip slides in from the left",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "slideright",
    category: "directional",
  },
  slideUp: {
    type: "slideUp",
    name: "Slide Up",
    description: "New clip slides in from the bottom",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "slideup",
    category: "directional",
  },
  slideDown: {
    type: "slideDown",
    name: "Slide Down",
    description: "New clip slides in from the top",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "slidedown",
    category: "directional",
  },

  // Zoom
  zoomIn: {
    type: "zoomIn",
    name: "Zoom In",
    description: "Zoom into the next clip",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "smoothup",
    category: "zoom",
  },
  zoomOut: {
    type: "zoomOut",
    name: "Zoom Out",
    description: "Zoom out to reveal next clip",
    defaultDuration: 0.4,
    minDuration: 0.1,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "smoothdown",
    category: "zoom",
  },

  // Wipe
  wipeLeft: {
    type: "wipeLeft",
    name: "Wipe Left",
    description: "Wipe transition moving left",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "wipeleft",
    category: "wipe",
  },
  wipeRight: {
    type: "wipeRight",
    name: "Wipe Right",
    description: "Wipe transition moving right",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "wiperight",
    category: "wipe",
  },
  wipeUp: {
    type: "wipeUp",
    name: "Wipe Up",
    description: "Wipe transition moving up",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "wipeup",
    category: "wipe",
  },
  wipeDown: {
    type: "wipeDown",
    name: "Wipe Down",
    description: "Wipe transition moving down",
    defaultDuration: 0.5,
    minDuration: 0.1,
    maxDuration: 2,
    usesXfade: true,
    xfadeName: "wipedown",
    category: "wipe",
  },

  // Creative
  blur: {
    type: "blur",
    name: "Blur",
    description: "Blur out then in",
    defaultDuration: 0.5,
    minDuration: 0.2,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "fadeblack",
    category: "creative",
  },
  pixelize: {
    type: "pixelize",
    name: "Pixelize",
    description: "Pixelation transition effect",
    defaultDuration: 0.4,
    minDuration: 0.2,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "pixelize",
    category: "creative",
  },
  rotate: {
    type: "rotate",
    name: "Rotate",
    description: "Rotate to next clip",
    defaultDuration: 0.5,
    minDuration: 0.2,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "horzopen",
    category: "creative",
  },
  flip: {
    type: "flip",
    name: "Flip",
    description: "Flip transition between clips",
    defaultDuration: 0.4,
    minDuration: 0.2,
    maxDuration: 1.5,
    usesXfade: true,
    xfadeName: "vertopen",
    category: "creative",
  },

  // Short-form popular
  glitch: {
    type: "glitch",
    name: "Glitch",
    description: "Glitchy digital transition (TikTok style)",
    defaultDuration: 0.2,
    minDuration: 0.1,
    maxDuration: 0.5,
    usesXfade: true,
    xfadeName: "diagtl",
    category: "shortform",
  },
  flash: {
    type: "flash",
    name: "Flash",
    description: "Quick white flash between clips",
    defaultDuration: 0.15,
    minDuration: 0.05,
    maxDuration: 0.5,
    usesXfade: true,
    xfadeName: "fadewhite",
    category: "shortform",
  },
  shake: {
    type: "shake",
    name: "Shake",
    description: "Camera shake effect on cut",
    defaultDuration: 0.2,
    minDuration: 0.1,
    maxDuration: 0.5,
    usesXfade: true,
    xfadeName: "diagbr",
    category: "shortform",
  },
};

// ============================================================================
// Transition Utilities
// ============================================================================

/**
 * Get transition definition by type
 */
export function getTransitionDefinition(
  type: TransitionType
): TransitionDefinition {
  return TRANSITION_DEFINITIONS[type];
}

/**
 * Get all transitions in a category
 */
export function getTransitionsByCategory(
  category: TransitionDefinition["category"]
): TransitionDefinition[] {
  return Object.values(TRANSITION_DEFINITIONS).filter(
    (t) => t.category === category
  );
}

/**
 * Get all transition categories
 */
export function getTransitionCategories(): TransitionDefinition["category"][] {
  return ["basic", "directional", "zoom", "wipe", "creative", "shortform"];
}

/**
 * Create a transition with validated duration
 */
export function createTransition(
  type: TransitionType,
  duration?: number,
  easing?: Transition["easing"]
): Transition {
  const def = TRANSITION_DEFINITIONS[type];

  let finalDuration = duration ?? def.defaultDuration;
  finalDuration = Math.max(
    def.minDuration,
    Math.min(def.maxDuration, finalDuration)
  );

  return {
    type,
    duration: finalDuration,
    easing: easing ?? "easeInOut",
  };
}

/**
 * Get a random transition (useful for variety)
 */
export function getRandomTransition(options?: {
  categories?: TransitionDefinition["category"][];
  excludeTypes?: TransitionType[];
  duration?: number;
}): Transition {
  let available = Object.values(TRANSITION_DEFINITIONS).filter(
    (t) => t.type !== "none"
  );

  if (options?.categories?.length) {
    available = available.filter((t) =>
      options.categories!.includes(t.category)
    );
  }

  if (options?.excludeTypes?.length) {
    available = available.filter(
      (t) => !options.excludeTypes!.includes(t.type)
    );
  }

  const random = available[Math.floor(Math.random() * available.length)];
  return createTransition(random.type, options?.duration);
}

/**
 * Get recommended transitions for short-form content
 */
export function getShortFormTransitions(): Transition[] {
  return [
    TRANSITION_PRESETS.quickFade,
    TRANSITION_PRESETS.flash,
    TRANSITION_PRESETS.glitch,
    createTransition("slideUp", 0.3),
    createTransition("zoomIn", 0.3),
  ];
}

// ============================================================================
// FFmpeg Filter Generation
// ============================================================================

/**
 * Generate FFmpeg xfade filter string for a transition
 */
export function generateXfadeFilter(
  transition: Transition,
  offsetSeconds: number,
  inputIndex1: number = 0,
  inputIndex2: number = 1
): string {
  const def = TRANSITION_DEFINITIONS[transition.type];

  if (!def.usesXfade || transition.type === "none") {
    return "";
  }

  const xfadeName = def.xfadeName || "fade";

  return (
    `[${inputIndex1}][${inputIndex2}]xfade=` +
    `transition=${xfadeName}:` +
    `duration=${transition.duration}:` +
    `offset=${offsetSeconds}`
  );
}

/**
 * Generate easing expression for FFmpeg
 */
export function generateEasingExpr(
  easing: Transition["easing"],
  progressVar: string = "P"
): string {
  switch (easing) {
    case "linear":
      return progressVar;
    case "easeIn":
      return `${progressVar}*${progressVar}`;
    case "easeOut":
      return `1-(1-${progressVar})*(1-${progressVar})`;
    case "easeInOut":
      return `if(lt(${progressVar},0.5),2*${progressVar}*${progressVar},1-pow(-2*${progressVar}+2,2)/2)`;
    default:
      return progressVar;
  }
}

/**
 * Calculate total duration reduction from transitions
 * When clips overlap during transitions, total output is shorter
 */
export function calculateTransitionOverlap(transitions: Transition[]): number {
  return transitions.reduce((total, t) => total + t.duration, 0);
}

/**
 * Generate a transition chain for multiple clips
 * Returns the FFmpeg filter complex string segment
 */
export function generateTransitionChain(
  clipDurations: number[],
  transitions: Transition[]
): { filter: string; outputLabel: string } {
  if (clipDurations.length === 0) {
    return { filter: "", outputLabel: "" };
  }

  if (clipDurations.length === 1) {
    return { filter: "[0:v]copy[outv]", outputLabel: "outv" };
  }

  // Ensure we have enough transitions
  while (transitions.length < clipDurations.length - 1) {
    transitions.push(createTransition("none"));
  }

  const filterParts: string[] = [];
  let currentLabel = "0:v";
  let runningOffset = 0;

  for (let i = 0; i < clipDurations.length - 1; i++) {
    const transition = transitions[i];
    const nextInput = `${i + 1}:v`;
    const outputLabel = i === clipDurations.length - 2 ? "outv" : `v${i}`;

    if (transition.type === "none" || transition.duration === 0) {
      // Direct concat without transition
      filterParts.push(
        `[${currentLabel}][${nextInput}]concat=n=2:v=1:a=0[${outputLabel}]`
      );
    } else {
      // Calculate offset (end of current clip minus transition duration)
      const offset = runningOffset + clipDurations[i] - transition.duration;
      const xfade = generateXfadeFilter(transition, offset);
      filterParts.push(
        `[${currentLabel}][${nextInput}]${xfade.split("]")[2]}[${outputLabel}]`
      );
    }

    runningOffset += clipDurations[i] - transition.duration;
    currentLabel = outputLabel;
  }

  return {
    filter: filterParts.join("; "),
    outputLabel: "outv",
  };
}

// ============================================================================
// Transition Validation
// ============================================================================

/**
 * Validate transition duration against clip durations
 */
export function validateTransitionDuration(
  transition: Transition,
  clip1Duration: number,
  clip2Duration: number
): { valid: boolean; maxDuration: number; message?: string } {
  const maxAllowed = Math.min(clip1Duration, clip2Duration) * 0.5;

  if (transition.duration > maxAllowed) {
    return {
      valid: false,
      maxDuration: maxAllowed,
      message: `Transition duration (${transition.duration}s) exceeds maximum allowed (${maxAllowed.toFixed(2)}s) based on clip durations`,
    };
  }

  return { valid: true, maxDuration: maxAllowed };
}

/**
 * Auto-adjust transition durations to fit clip lengths
 */
export function autoAdjustTransitions(
  clipDurations: number[],
  transitions: Transition[]
): Transition[] {
  return transitions.map((transition, i) => {
    const clip1Duration = clipDurations[i] || 0;
    const clip2Duration = clipDurations[i + 1] || 0;

    const validation = validateTransitionDuration(
      transition,
      clip1Duration,
      clip2Duration
    );

    if (!validation.valid) {
      return {
        ...transition,
        duration: Math.max(0.1, validation.maxDuration * 0.8),
      };
    }

    return transition;
  });
}
