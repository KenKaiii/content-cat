"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import PresetSelector from "@/components/PresetSelector";
import {
  VIDEO_MODELS,
  getDefaultState,
  getModelConfig,
  calculateCredits,
  type VideoModelId,
  type VideoGenerationState,
  type VideoAspectRatio,
  type VideoDuration,
  type VideoResolution,
} from "@/lib/kie";
import { Dropdown, SimpleDropdown, GridDropdown } from "@/components/Dropdown";

// Import video editor presets (client-safe, no Node.js dependencies)
import { TRANSITION_DEFINITIONS } from "@/lib/video-editor/transitions";
import {
  TITLE_PRESETS,
  HOOK_PRESETS,
  SUBTITLE_PRESETS as TEXT_SUBTITLE_PRESETS,
} from "@/lib/video-editor/text/presets";

// Edit Video State Types
interface EditVideoState {
  // Transitions
  transitionType: string;
  transitionDuration: number;
  // Text Overlay
  textEnabled: boolean;
  textPreset: string;
  textContent: string;
  textPosition: string;
  // Subtitles
  subtitlesEnabled: boolean;
  subtitleStyle: string;
  // Audio
  audioEnabled: boolean;
  audioVolume: number;
  audioDucking: boolean;
}

// Model Icons
const KlingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.7522 2.86984L16.818 2.93745L16.8199 2.93552C18.087 4.25441 17.7236 6.90443 15.8863 9.90864L19.5 13.6567L19.3447 13.9703C18.7372 15.1986 17.9147 16.2992 16.9193 17.216C15.608 18.43 14.0251 19.2853 12.3143 19.7044L12.2522 19.7198L12.1634 19.7417L12.0994 19.7565L11.9584 19.7887L11.8416 19.8126L11.754 19.8299C11.6609 19.8493 11.5634 19.8673 11.4683 19.884L11.3888 19.8963L11.3286 19.904C11.2429 19.916 11.1576 19.9272 11.0727 19.9375C9.64831 20.1036 8.20616 19.9376 6.8516 19.4517C5.49703 18.9658 4.2643 18.1723 3.24348 17.1291L3.18385 17.0692C1.91429 15.7503 2.27391 13.0983 4.11366 10.0922L0.5 6.34416L0.65528 6.03054C1.26118 4.80131 2.0846 3.70115 3.08261 2.78741C4.10242 1.8473 5.28649 1.11848 6.57081 0.640344C6.86894 0.528933 7.18075 0.431691 7.48696 0.34926C7.73931 0.279139 7.9944 0.220054 8.25155 0.172163C8.33851 0.154131 8.43665 0.135456 8.53168 0.118712C10.0139 -0.12084 11.5297 0.00325476 12.9574 0.481036C14.385 0.958817 15.6847 1.77698 16.7522 2.86984ZM15.5304 3.03083H15.5267L15.5304 3.03276C14.3025 2.63864 12.354 3.27555 10.2944 4.68267C11.8615 4.22994 13.377 4.46435 14.3565 5.48057C15.2845 6.44462 15.5385 7.90777 15.187 9.44497C15.1704 9.52697 15.1497 9.61005 15.1248 9.69419C16.8062 7.05706 17.3441 4.58993 16.2795 3.48807C16.262 3.4682 16.2433 3.44949 16.2236 3.43204L16.2155 3.42431L16.2037 3.41336L16.1683 3.38503C16.153 3.37215 16.1371 3.3597 16.1205 3.34768L16.0944 3.32836C15.9242 3.19657 15.7334 3.09594 15.5304 3.03083Z"
    />
  </svg>
);

const WanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <g clipPath="url(#clip0_wan)">
      <path d="M19.9361 12.1411L17.6243 8.09523L17.3525 7.61735L18.5771 5.47657C18.6187 5.4023 18.6411 5.32158 18.6411 5.23763C18.6411 5.15367 18.6187 5.07295 18.5771 4.99868L17.215 2.61896C17.1735 2.5447 17.1127 2.48658 17.0424 2.4446C16.972 2.40262 16.8921 2.38002 16.8058 2.38002H11.6323L10.4077 0.236011C10.3245 0.0874804 10.1679 -0.00292969 9.9984 -0.00292969H7.27738C7.19425 -0.00292969 7.11111 0.0196728 7.04077 0.0616489C6.97042 0.103625 6.90967 0.161746 6.86811 0.236011L4.55316 4.28509L4.28138 4.75974H1.83213C1.749 4.75974 1.66587 4.78235 1.59552 4.82432C1.52518 4.8663 1.46443 4.92442 1.42286 4.99868L0.0639488 7.38164C0.0223821 7.4559 0 7.53663 0 7.62058C0 7.70453 0.0223821 7.78525 0.0639488 7.85952L2.65068 12.3833L1.42606 14.5273C1.38449 14.6015 1.36211 14.6823 1.36211 14.7662C1.36211 14.8502 1.38449 14.9309 1.42606 15.0051L2.78817 17.3849C2.82974 17.4591 2.89049 17.5173 2.96083 17.5592C3.03118 17.6012 3.11111 17.6238 3.19744 17.6238H8.36771L9.59233 19.7678C9.67546 19.9163 9.83214 20.0068 10.0016 20.0068H12.7226C12.8058 20.0068 12.8889 19.9842 12.9592 19.9422C13.0296 19.9002 13.0903 19.8421 13.1319 19.7678L15.7186 15.2441H18.1679C18.251 15.2441 18.3341 15.2215 18.4045 15.1795C18.4748 15.1375 18.5356 15.0794 18.5771 15.0051L19.9393 12.6254C19.9808 12.5512 20.0032 12.4704 20.0032 12.3865C20.0032 12.3025 19.9808 12.2218 19.9393 12.1475L19.9361 12.1411Z" />
    </g>
    <defs>
      <clipPath id="clip0_wan">
        <rect width="20" height="20" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
);

const MODEL_ICONS: Record<VideoModelId, React.ReactNode> = {
  "kling-2.6": <KlingIcon />,
  "wan-2.5": <WanIcon />,
};

const FolderIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.75 4.75V18.25C2.75 18.8023 3.19772 19.25 3.75 19.25H20.25C20.8023 19.25 21.25 18.8023 21.25 18.25V7.75C21.25 7.19772 20.8023 6.75 20.25 6.75H12.5352C12.2008 6.75 11.8886 6.5829 11.7031 6.3047L10.2969 4.1953C10.1114 3.9171 9.79917 3.75 9.46482 3.75H3.75C3.19772 3.75 2.75 4.19772 2.75 4.75Z" />
  </svg>
);

const BookIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7.75C12 6.09315 13.3431 4.75 15 4.75H21.25C21.8023 4.75 22.25 5.19772 22.25 5.75V18.25C22.25 18.8023 21.8023 19.25 21.25 19.25H15.277C14.5966 19.25 13.9296 19.4142 13.3508 19.7719C12.772 20.1296 12.3043 20.6414 12 21.25M12 7.75C12 6.09315 10.6569 4.75 9 4.75H2.75C2.19772 4.75 1.75 5.19772 1.75 5.75V18.25C1.75 18.8023 2.19772 19.25 2.75 19.25H8.723C9.40341 19.25 10.0704 19.4142 10.6492 19.7719C11.228 20.1296 11.6957 20.6414 12 21.25M12 7.75V21.25" />
  </svg>
);

const ImageUploadIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="currentColor"
    className="text-gray-400"
  >
    <path d="M17.8118 3.07706C20.1925 3.07292 22.1837 4.93729 22.3097 7.34164L22.8854 18.3266L22.8916 18.558C22.8958 20.9388 21.0314 22.9299 18.627 23.0559L7.64211 23.6316C5.23776 23.7576 3.17547 21.9723 2.93073 19.6041L2.91277 19.3733L2.33707 8.38836C2.207 5.90649 4.11352 3.78909 6.5954 3.65902L17.5803 3.08332L17.8118 3.07706ZM18.5004 15.5268C17.4744 14.6033 15.8939 14.6861 14.9701 15.7118L8.79516 22.5698L18.5747 22.0573C20.4379 21.9596 21.883 20.4219 21.8904 18.5792L18.5004 15.5268ZM6.64773 4.65765C4.71738 4.75881 3.23454 6.40568 3.3357 8.33603L3.9114 19.321L3.92568 19.5001C4.10902 21.2758 5.60576 22.6291 7.38852 22.6367L14.227 15.0428C15.5204 13.6066 17.733 13.4906 19.1695 14.7838L21.8236 17.1735L21.311 7.39398C21.213 5.52382 19.6642 4.07404 17.8124 4.07743L17.6327 4.08195L6.64773 4.65765ZM9.85296 8.49516C11.2318 8.4229 12.4081 9.48207 12.4804 10.8609C12.5526 12.2397 11.4935 13.416 10.1146 13.4883C8.73582 13.5606 7.55949 12.5014 7.48723 11.1226C7.41497 9.74375 8.47414 8.56742 9.85296 8.49516ZM9.9053 9.49379C9.07801 9.53715 8.4425 10.2429 8.48586 11.0702C8.52922 11.8975 9.23502 12.533 10.0623 12.4897C10.8896 12.4463 11.5251 11.7405 11.4817 10.9132C11.4384 10.0859 10.7326 9.45043 9.9053 9.49379Z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11.8525 4.21651L11.7221 3.2387C11.6906 3.00226 11.4889 2.82568 11.2504 2.82568C11.0118 2.82568 10.8102 3.00226 10.7786 3.23869L10.6483 4.21651C10.2658 7.0847 8.00939 9.34115 5.14119 9.72358L4.16338 9.85396C3.92694 9.88549 3.75037 10.0872 3.75037 10.3257C3.75037 10.5642 3.92694 10.7659 4.16338 10.7974L5.14119 10.9278C8.00938 11.3102 10.2658 13.5667 10.6483 16.4349L10.7786 17.4127C10.8102 17.6491 11.0118 17.8257 11.2504 17.8257C11.4889 17.8257 11.6906 17.6491 11.7221 17.4127L11.8525 16.4349C12.2349 13.5667 14.4913 11.3102 17.3595 10.9278L18.3374 10.7974C18.5738 10.7659 18.7504 10.5642 18.7504 10.3257C18.7504 10.0872 18.5738 9.88549 18.3374 9.85396L17.3595 9.72358C14.4913 9.34115 12.2349 7.0847 11.8525 4.21651Z" />
    <path d="M4.6519 14.7568L4.82063 14.2084C4.84491 14.1295 4.91781 14.0757 5.00037 14.0757C5.08292 14.0757 5.15582 14.1295 5.1801 14.2084L5.34883 14.7568C5.56525 15.4602 6.11587 16.0108 6.81925 16.2272L7.36762 16.3959C7.44652 16.4202 7.50037 16.4931 7.50037 16.5757C7.50037 16.6582 7.44652 16.7311 7.36762 16.7554L6.81926 16.9241C6.11587 17.1406 5.56525 17.6912 5.34883 18.3946L5.1801 18.9429C5.15582 19.0218 5.08292 19.0757 5.00037 19.0757C4.91781 19.0757 4.84491 19.0218 4.82063 18.9429L4.65191 18.3946C4.43548 17.6912 3.88486 17.1406 3.18147 16.9241L2.63311 16.7554C2.55421 16.7311 2.50037 16.6582 2.50037 16.5757C2.50037 16.4931 2.55421 16.4202 2.63311 16.3959L3.18148 16.2272C3.88486 16.0108 4.43548 15.4602 4.6519 14.7568Z" />
  </svg>
);

const EnhanceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.6497 0.375C6.92585 0.375 7.1497 0.598858 7.1497 0.875V1.45833C7.1497 1.48967 7.14682 1.52033 7.14131 1.55006C7.17104 1.54455 7.2017 1.54167 7.23304 1.54167H7.81637C8.09251 1.54167 8.31637 1.76552 8.31637 2.04167C8.31637 2.31781 8.09251 2.54167 7.81637 2.54167H7.23304C7.2017 2.54167 7.17104 2.53878 7.14131 2.53327C7.14682 2.56301 7.1497 2.59367 7.1497 2.625V3.20833C7.1497 3.48448 6.92585 3.70833 6.6497 3.70833C6.37356 3.70833 6.1497 3.48448 6.1497 3.20833V2.625C6.1497 2.59367 6.15259 2.56301 6.1581 2.53327C6.12836 2.53878 6.0977 2.54167 6.06637 2.54167H5.48304C5.20689 2.54167 4.98304 2.31781 4.98304 2.04167C4.98304 1.76552 5.20689 1.54167 5.48304 1.54167H6.06637C6.0977 1.54167 6.12836 1.54455 6.1581 1.55006C6.15259 1.52033 6.1497 1.48967 6.1497 1.45833V0.875C6.1497 0.598858 6.37356 0.375 6.6497 0.375ZM6.55797 1.94994C6.56349 1.97967 6.56637 2.01033 6.56637 2.04167C6.56637 2.073 6.56349 2.10366 6.55797 2.1334C6.58771 2.12788 6.61837 2.125 6.6497 2.125C6.68104 2.125 6.7117 2.12788 6.74143 2.1334C6.73592 2.10366 6.73304 2.073 6.73304 2.04167C6.73304 2.01033 6.73592 1.97967 6.74143 1.94994C6.7117 1.95545 6.68104 1.95833 6.6497 1.95833C6.61837 1.95833 6.58771 1.95545 6.55797 1.94994ZM2.625 1.54167C2.90114 1.54167 3.125 1.76552 3.125 2.04167V2.91667C3.125 3.19281 2.90114 3.41667 2.625 3.41667C2.34886 3.41667 2.125 3.19281 2.125 2.91667V2.04167C2.125 1.76552 2.34886 1.54167 2.625 1.54167ZM8.5294 3.09641C9.18027 2.44554 10.2355 2.44554 10.8864 3.09641C11.5373 3.74729 11.5373 4.80256 10.8864 5.45344L9.23651 7.10335L4.28676 12.0531C3.63588 12.704 2.58061 12.704 1.92974 12.0531C1.27886 11.4022 1.27886 10.347 1.92974 9.69608L6.87948 4.74633L8.5294 3.09641ZM10.1793 3.80352C9.91896 3.54317 9.49685 3.54317 9.23651 3.80352L7.94014 5.09988L8.88295 6.04269L10.1793 4.74633C10.4397 4.48598 10.4397 4.06387 10.1793 3.80352ZM8.17585 6.7498L7.23304 5.80699L2.63684 10.4032C2.37649 10.6635 2.37649 11.0856 2.63684 11.346C2.89719 11.6063 3.3193 11.6063 3.57965 11.346L8.17585 6.7498ZM0.375 3.79167C0.375 3.51552 0.598858 3.29167 0.875 3.29167H1.75C2.02614 3.29167 2.25 3.51552 2.25 3.79167C2.25 4.06781 2.02614 4.29167 1.75 4.29167H0.875C0.598858 4.29167 0.375 4.06781 0.375 3.79167ZM3 3.79167C3 3.51552 3.22386 3.29167 3.5 3.29167H4.375C4.65114 3.29167 4.875 3.51552 4.875 3.79167C4.875 4.06781 4.65114 4.29167 4.375 4.29167H3.5C3.22386 4.29167 3 4.06781 3 3.79167ZM2.625 4.16667C2.90114 4.16667 3.125 4.39052 3.125 4.66667V5.54167C3.125 5.81781 2.90114 6.04167 2.625 6.04167C2.34886 6.04167 2.125 5.81781 2.125 5.54167V4.66667C2.125 4.39052 2.34886 4.16667 2.625 4.16667ZM11.375 7.95833C11.6511 7.95833 11.875 8.18219 11.875 8.45833V9.04167C11.875 9.073 11.8721 9.10366 11.8666 9.1334C11.8963 9.12788 11.927 9.125 11.9583 9.125H12.5417C12.8178 9.125 13.0417 9.34886 13.0417 9.625C13.0417 9.90114 12.8178 10.125 12.5417 10.125H11.9583C11.927 10.125 11.8963 10.1221 11.8666 10.1166C11.8721 10.1463 11.875 10.177 11.875 10.2083V10.7917C11.875 11.0678 11.6511 11.2917 11.375 11.2917C11.0989 11.2917 10.875 11.0678 10.875 10.7917V10.2083C10.875 10.177 10.8779 10.1463 10.8834 10.1166C10.8537 10.1221 10.823 10.125 10.7917 10.125H10.2083C9.93219 10.125 9.70833 9.90114 9.70833 9.625C9.70833 9.34886 9.93219 9.125 10.2083 9.125H10.7917C10.823 9.125 10.8537 9.12788 10.8834 9.1334C10.8779 9.10366 10.875 9.073 10.875 9.04167V8.45833C10.875 8.18219 11.0989 7.95833 11.375 7.95833ZM11.2833 9.53327C11.2888 9.56301 11.2917 9.59367 11.2917 9.625C11.2917 9.65633 11.2888 9.68699 11.2833 9.71673C11.313 9.71122 11.3437 9.70833 11.375 9.70833C11.4063 9.70833 11.437 9.71122 11.4667 9.71673C11.4612 9.68699 11.4583 9.65633 11.4583 9.625C11.4583 9.59367 11.4612 9.56301 11.4667 9.53327C11.437 9.53878 11.4063 9.54167 11.375 9.54167C11.3437 9.54167 11.313 9.53878 11.2833 9.53327Z"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="-rotate-90"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.81344 7.97848C4.0087 7.78322 4.32528 7.78322 4.52055 7.97848L10.0003 13.4583L15.4801 7.97848C15.6754 7.78322 15.9919 7.78322 16.1872 7.97848C16.3825 8.17374 16.3825 8.49032 16.1872 8.68558L10.3539 14.5189L10.0003 14.8725L9.64677 14.5189L3.81344 8.68558C3.61818 8.49032 3.61818 8.17374 3.81344 7.97848Z"
    />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8.00004 14.6663C4.31804 14.6663 1.33337 11.6817 1.33337 7.99967C1.33337 4.31767 4.31804 1.33301 8.00004 1.33301C11.682 1.33301 14.6667 4.31767 14.6667 7.99967C14.6667 11.6817 11.682 14.6663 8.00004 14.6663ZM8.00004 13.333C9.41453 13.333 10.7711 12.7711 11.7713 11.7709C12.7715 10.7707 13.3334 9.41416 13.3334 7.99967C13.3334 6.58519 12.7715 5.22863 11.7713 4.22844C10.7711 3.22824 9.41453 2.66634 8.00004 2.66634C6.58555 2.66634 5.229 3.22824 4.2288 4.22844C3.22861 5.22863 2.66671 6.58519 2.66671 7.99967C2.66671 9.41416 3.22861 10.7707 4.2288 11.7709C5.229 12.7711 6.58555 13.333 8.00004 13.333ZM7.33337 4.66634H8.66671V5.99967H7.33337V4.66634ZM7.33337 7.33301H8.66671V11.333H7.33337V7.33301Z" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.5479 2.14282C14.1661 1.5247 15.1679 1.5247 15.7861 2.14282L18.3584 4.71411C18.9761 5.33243 18.9764 6.33519 18.3584 6.95337L7.31641 17.9954C7.01974 18.2919 6.61689 18.459 6.19727 18.4592H2.79199C2.37808 18.4592 2.04248 18.123 2.04199 17.7092V14.304C2.042 13.8842 2.20904 13.4817 2.50586 13.1848L11.0117 4.67798L13.5479 2.14282ZM3.56641 14.2454C3.55098 14.2609 3.542 14.2819 3.54199 14.304V16.9592H6.19727C6.2189 16.959 6.24037 16.9502 6.25586 16.9348L14.2314 8.95923L11.542 6.26978L3.56641 14.2454ZM14.7256 3.20337C14.6931 3.17104 14.6409 3.17104 14.6084 3.20337L12.6025 5.20825L15.292 7.89771L17.2979 5.89282C17.33 5.86043 17.3298 5.8072 17.2979 5.77466L14.7256 3.20337Z" />
  </svg>
);

const ImagePlaceholderIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// Default edit video state
const getDefaultEditState = (): EditVideoState => ({
  transitionType: "fade",
  transitionDuration: 0.5,
  textEnabled: false,
  textPreset: "title-impact",
  textContent: "",
  textPosition: "middle-center",
  subtitlesEnabled: false,
  subtitleStyle: "subtitle-tiktok",
  audioEnabled: false,
  audioVolume: 0.3,
  audioDucking: true,
});

// Position options for text
const TEXT_POSITIONS = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "middle-left", label: "Middle Left" },
  { id: "middle-center", label: "Middle Center" },
  { id: "middle-right", label: "Middle Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
];

export default function VideoPage() {
  const [activeTab, setActiveTab] = useState<"create" | "edit">("create");
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("General");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dropdown trigger refs - Create mode
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const durationTriggerRef = useRef<HTMLButtonElement>(null);
  const aspectTriggerRef = useRef<HTMLButtonElement>(null);
  const resolutionTriggerRef = useRef<HTMLButtonElement>(null);

  // Dropdown trigger refs - Edit mode
  const transitionTriggerRef = useRef<HTMLButtonElement>(null);
  const textPresetTriggerRef = useRef<HTMLButtonElement>(null);
  const textPositionTriggerRef = useRef<HTMLButtonElement>(null);
  const subtitleStyleTriggerRef = useRef<HTMLButtonElement>(null);

  // Video generation state (Create mode)
  const [videoState, setVideoState] = useState<VideoGenerationState>(
    getDefaultState("kling-2.6")
  );

  // Edit video state
  const [editState, setEditState] = useState<EditVideoState>(
    getDefaultEditState()
  );

  // Dropdown visibility states - Create mode
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showResolutionDropdown, setShowResolutionDropdown] = useState(false);

  // Dropdown visibility states - Edit mode
  const [showTransitionDropdown, setShowTransitionDropdown] = useState(false);
  const [showTextPresetDropdown, setShowTextPresetDropdown] = useState(false);
  const [showTextPositionDropdown, setShowTextPositionDropdown] =
    useState(false);
  const [showSubtitleStyleDropdown, setShowSubtitleStyleDropdown] =
    useState(false);

  // Get current model config
  const modelConfig = getModelConfig(videoState.model);
  const credits = calculateCredits(videoState);

  // Update handlers
  const updateVideoState = (updates: Partial<VideoGenerationState>) => {
    setVideoState((prev) => ({ ...prev, ...updates }));
  };

  const handleModelChange = (modelId: VideoModelId) => {
    setVideoState({
      ...getDefaultState(modelId),
      prompt: videoState.prompt,
      imageUrl: videoState.imageUrl,
      mode: videoState.mode,
    });
    setShowModelDropdown(false);
  };

  const handleDurationChange = (duration: VideoDuration) => {
    updateVideoState({ duration });
    setShowDurationDropdown(false);
  };

  const handleAspectChange = (aspectRatio: VideoAspectRatio) => {
    updateVideoState({ aspectRatio });
    setShowAspectDropdown(false);
  };

  const handleResolutionChange = (resolution: VideoResolution) => {
    updateVideoState({ resolution });
    setShowResolutionDropdown(false);
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  // Edit state update handler
  const updateEditState = (updates: Partial<EditVideoState>) => {
    setEditState((prev) => ({ ...prev, ...updates }));
  };

  // Get all text presets for dropdown
  const getAllTextPresets = () => {
    return [
      ...Object.entries(TITLE_PRESETS).map(([id, preset]) => ({
        id,
        label: preset.name,
        category: "Titles",
      })),
      ...Object.entries(HOOK_PRESETS).map(([id, preset]) => ({
        id,
        label: preset.name,
        category: "Hooks",
      })),
      ...Object.entries(TEXT_SUBTITLE_PRESETS).map(([id, preset]) => ({
        id,
        label: preset.name,
        category: "Subtitles",
      })),
    ];
  };

  // Get transition options
  const getTransitionOptions = () => {
    return Object.entries(TRANSITION_DEFINITIONS).map(([name, def]) => ({
      id: name,
      label: def.name,
      description: def.description,
    }));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="mb-4 ml-4 flex w-80 flex-col rounded-2xl bg-zinc-900/50">
          {/* Tabs */}
          <nav className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
            <button
              onClick={() => setActiveTab("create")}
              className={`-mb-3 border-b-2 pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "create"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Create Video
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`-mb-3 border-b-2 pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "edit"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Edit Video
            </button>
          </nav>

          {/* Scrollable Content */}
          <div className="hide-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {activeTab === "create" ? (
              <>
                {/* Preset Card */}
                <figure
                  className="group relative aspect-[2.3] w-full cursor-pointer overflow-hidden rounded-xl select-none"
                  onClick={() => setShowPresetSelector(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-amber-900" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%)",
                    }}
                  />
                  <figcaption className="absolute bottom-0 left-0 z-10 w-full pr-1.5 pb-3 pl-3">
                    <p className="font-heading w-full truncate text-lg font-bold text-cyan-400 uppercase">
                      {selectedPreset}
                    </p>
                    <p className="text-xs text-white/80">{modelConfig.name}</p>
                  </figcaption>
                  <button
                    className="absolute top-1.5 right-1.5 z-20 flex h-6 items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2 text-xs text-white backdrop-blur-sm transition-colors hover:bg-cyan-400 hover:text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPresetSelector(true);
                    }}
                  >
                    <EditIcon />
                    Change
                  </button>
                </figure>

                {/* Upload Image Section */}
                <div
                  className="relative w-full rounded-2xl border border-dashed border-zinc-700 select-none"
                  style={{ height: "120px" }}
                >
                  <div className="pointer-events-none absolute top-2 right-2 rounded-3xl bg-white/5 px-2 py-1.5 text-xs text-gray-500 ring ring-gray-500/5 backdrop-blur-sm ring-inset">
                    Optional
                  </div>
                  <label className="flex size-full cursor-pointer flex-col items-center justify-center">
                    <input
                      accept="image/jpeg, image/jpg, image/png, image/webp"
                      className="sr-only"
                      type="file"
                    />
                    <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-800 p-1.5 shadow-[0_-1.872px_0_0_rgba(20,1,8,0.30)_inset,0_3.744px_3.744px_0_rgba(0,0,0,0.25)]">
                      <ImageUploadIcon />
                    </div>
                    <div className="mt-2 text-center text-xs text-white/60">
                      <p className="mb-0.5">
                        Upload image or{" "}
                        <span className="px-1 font-semibold text-white">
                          generate it
                        </span>
                      </p>
                      <p className="text-white/50">
                        PNG, JPG or Paste from clipboard
                      </p>
                    </div>
                  </label>
                </div>

                {/* Prompt Section */}
                <fieldset className="rounded-xl bg-zinc-800/50">
                  <label className="relative block p-3 pb-1">
                    <span className="mb-1 text-sm font-medium text-gray-500">
                      Prompt
                      <span className="ml-2 text-xs text-gray-600">
                        {videoState.prompt.length}/{modelConfig.maxPromptLength}
                      </span>
                    </span>
                    <textarea
                      ref={textareaRef}
                      value={videoState.prompt}
                      onChange={(e) =>
                        updateVideoState({ prompt: e.target.value })
                      }
                      onInput={handleTextareaInput}
                      className="hide-scrollbar w-full resize-none overflow-y-auto border-none bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                      placeholder="Describe the scene you imagine, with details."
                      style={{ height: "60px", maxHeight: "120px" }}
                      maxLength={modelConfig.maxPromptLength}
                    />
                  </label>
                  <div className="flex flex-wrap gap-1 p-3 pt-0">
                    {modelConfig.supportsPromptEnhancement && (
                      <label
                        className={`flex h-6 w-fit cursor-pointer items-center justify-center gap-1 rounded-md border border-transparent px-2 py-1 whitespace-nowrap transition-colors select-none ${
                          videoState.enhanceEnabled
                            ? "text-white"
                            : "text-white/80 hover:text-white"
                        }`}
                        onClick={() =>
                          updateVideoState({
                            enhanceEnabled: !videoState.enhanceEnabled,
                          })
                        }
                      >
                        <EnhanceIcon />
                        <span className="text-xs font-medium">
                          Enhance {videoState.enhanceEnabled ? "on" : "off"}
                        </span>
                      </label>
                    )}
                  </div>
                </fieldset>

                {/* Audio Toggle - Only show if model supports audio */}
                {modelConfig.supportsAudio && (
                  <fieldset>
                    <div className="rounded-xl bg-zinc-800/50 p-3">
                      <div className="flex flex-row items-center justify-between gap-1.5">
                        <div className="flex shrink-0 items-center gap-1 text-sm text-white">
                          <span className="font-medium">Audio</span>
                          <button className="text-gray-500">
                            <InfoIcon />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            updateVideoState({
                              audioEnabled: !videoState.audioEnabled,
                            })
                          }
                          className={`relative inline-flex h-6 w-9 shrink-0 cursor-pointer items-center rounded-full transition ${
                            videoState.audioEnabled
                              ? "bg-cyan-400"
                              : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none absolute top-1/2 left-0.5 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                              videoState.audioEnabled
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Model Selection */}
                <fieldset className="relative">
                  <button
                    ref={modelTriggerRef}
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
                  >
                    <div className="grid">
                      <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                        Model
                      </span>
                      <div className="text-sm font-medium text-white">
                        {modelConfig.name}
                      </div>
                    </div>
                    <ChevronDownIcon />
                  </button>
                  <Dropdown
                    isOpen={showModelDropdown}
                    onClose={() => setShowModelDropdown(false)}
                    value={videoState.model}
                    onChange={(id) => handleModelChange(id as VideoModelId)}
                    triggerRef={modelTriggerRef}
                    options={Object.values(VIDEO_MODELS).map((model) => ({
                      id: model.id,
                      label: model.shortName,
                      description: model.description,
                      icon: MODEL_ICONS[model.id],
                    }))}
                  />
                </fieldset>

                {/* Duration & Aspect Ratio */}
                <fieldset>
                  <div className="flex w-full items-center gap-2">
                    {/* Duration Dropdown */}
                    <div className="relative flex-1">
                      <button
                        ref={durationTriggerRef}
                        onClick={() =>
                          setShowDurationDropdown(!showDurationDropdown)
                        }
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
                      >
                        <div className="grid">
                          <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                            Duration
                          </span>
                          <div className="text-sm font-medium text-white">
                            {videoState.duration}s
                          </div>
                        </div>
                        <ChevronDownIcon />
                      </button>
                      <SimpleDropdown
                        isOpen={showDurationDropdown}
                        onClose={() => setShowDurationDropdown(false)}
                        value={videoState.duration}
                        onChange={(id) =>
                          handleDurationChange(id as VideoDuration)
                        }
                        triggerRef={durationTriggerRef}
                        options={modelConfig.durations.map((d) => ({
                          id: d,
                          label: `${d} seconds`,
                        }))}
                      />
                    </div>

                    {/* Aspect Ratio Dropdown */}
                    <div className="relative flex-1">
                      <button
                        ref={aspectTriggerRef}
                        onClick={() =>
                          setShowAspectDropdown(!showAspectDropdown)
                        }
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
                      >
                        <div className="grid">
                          <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                            Aspect Ratio
                          </span>
                          <div className="text-sm font-medium text-white">
                            {videoState.aspectRatio}
                          </div>
                        </div>
                        <ChevronDownIcon />
                      </button>
                      <SimpleDropdown
                        isOpen={showAspectDropdown}
                        onClose={() => setShowAspectDropdown(false)}
                        value={videoState.aspectRatio}
                        onChange={(id) =>
                          handleAspectChange(id as VideoAspectRatio)
                        }
                        triggerRef={aspectTriggerRef}
                        options={modelConfig.aspectRatios.map((ar) => ({
                          id: ar,
                          label: ar,
                        }))}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Resolution - Only show if model supports multiple resolutions */}
                {modelConfig.resolutions &&
                  modelConfig.resolutions.length > 0 && (
                    <fieldset className="relative">
                      <button
                        ref={resolutionTriggerRef}
                        onClick={() =>
                          setShowResolutionDropdown(!showResolutionDropdown)
                        }
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
                      >
                        <div className="grid">
                          <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                            Resolution
                          </span>
                          <div className="text-sm font-medium text-white">
                            {videoState.resolution ||
                              modelConfig.resolutions[0]}
                          </div>
                        </div>
                        <ChevronDownIcon />
                      </button>
                      <SimpleDropdown
                        isOpen={showResolutionDropdown}
                        onClose={() => setShowResolutionDropdown(false)}
                        value={
                          videoState.resolution || modelConfig.resolutions[0]
                        }
                        onChange={(id) =>
                          handleResolutionChange(id as VideoResolution)
                        }
                        triggerRef={resolutionTriggerRef}
                        options={modelConfig.resolutions.map((res) => ({
                          id: res,
                          label: res,
                        }))}
                      />
                    </fieldset>
                  )}
              </>
            ) : (
              /* ============================================ */
              /* Edit Video Configuration */
              /* ============================================ */
              <>
                {/* Section: Transitions */}
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Transitions
                  </h3>

                  {/* Transition Type */}
                  <div className="relative mb-2">
                    <button
                      ref={transitionTriggerRef}
                      onClick={() =>
                        setShowTransitionDropdown(!showTransitionDropdown)
                      }
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-zinc-700/50 px-3 py-2 text-left transition hover:bg-zinc-600/50"
                    >
                      <div className="grid">
                        <span className="text-xs text-gray-500">Type</span>
                        <div className="text-sm font-medium text-white capitalize">
                          {editState.transitionType}
                        </div>
                      </div>
                      <ChevronDownIcon />
                    </button>
                    <GridDropdown
                      isOpen={showTransitionDropdown}
                      onClose={() => setShowTransitionDropdown(false)}
                      value={editState.transitionType}
                      onChange={(id) => {
                        updateEditState({ transitionType: id });
                        setShowTransitionDropdown(false);
                      }}
                      triggerRef={transitionTriggerRef}
                      options={getTransitionOptions()}
                    />
                  </div>

                  {/* Transition Duration */}
                  <div className="flex items-center justify-between rounded-lg bg-zinc-700/50 px-3 py-2">
                    <span className="text-xs text-gray-500">Duration</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={editState.transitionDuration}
                        onChange={(e) =>
                          updateEditState({
                            transitionDuration: parseFloat(e.target.value),
                          })
                        }
                        className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-cyan-400"
                      />
                      <span className="w-10 text-right text-sm text-white">
                        {editState.transitionDuration}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Text Overlay */}
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Text Overlay
                    </h3>
                    <button
                      onClick={() =>
                        updateEditState({ textEnabled: !editState.textEnabled })
                      }
                      className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition ${
                        editState.textEnabled ? "bg-cyan-400" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                          editState.textEnabled
                            ? "translate-x-3.5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {editState.textEnabled && (
                    <div className="space-y-2">
                      {/* Text Content */}
                      <textarea
                        value={editState.textContent}
                        onChange={(e) =>
                          updateEditState({ textContent: e.target.value })
                        }
                        className="hide-scrollbar w-full resize-none rounded-lg bg-zinc-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                        placeholder="Enter your text..."
                        rows={2}
                      />

                      {/* Text Preset */}
                      <div className="relative">
                        <button
                          ref={textPresetTriggerRef}
                          onClick={() =>
                            setShowTextPresetDropdown(!showTextPresetDropdown)
                          }
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-zinc-700/50 px-3 py-2 text-left transition hover:bg-zinc-600/50"
                        >
                          <div className="grid">
                            <span className="text-xs text-gray-500">Style</span>
                            <div className="text-sm font-medium text-white">
                              {getAllTextPresets().find(
                                (p) => p.id === editState.textPreset
                              )?.label || editState.textPreset}
                            </div>
                          </div>
                          <ChevronDownIcon />
                        </button>
                        <SimpleDropdown
                          isOpen={showTextPresetDropdown}
                          onClose={() => setShowTextPresetDropdown(false)}
                          value={editState.textPreset}
                          onChange={(id) => {
                            updateEditState({ textPreset: id });
                            setShowTextPresetDropdown(false);
                          }}
                          triggerRef={textPresetTriggerRef}
                          options={getAllTextPresets()}
                        />
                      </div>

                      {/* Text Position */}
                      <div className="relative">
                        <button
                          ref={textPositionTriggerRef}
                          onClick={() =>
                            setShowTextPositionDropdown(
                              !showTextPositionDropdown
                            )
                          }
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-zinc-700/50 px-3 py-2 text-left transition hover:bg-zinc-600/50"
                        >
                          <div className="grid">
                            <span className="text-xs text-gray-500">
                              Position
                            </span>
                            <div className="text-sm font-medium text-white">
                              {TEXT_POSITIONS.find(
                                (p) => p.id === editState.textPosition
                              )?.label || editState.textPosition}
                            </div>
                          </div>
                          <ChevronDownIcon />
                        </button>
                        <SimpleDropdown
                          isOpen={showTextPositionDropdown}
                          onClose={() => setShowTextPositionDropdown(false)}
                          value={editState.textPosition}
                          onChange={(id) => {
                            updateEditState({ textPosition: id });
                            setShowTextPositionDropdown(false);
                          }}
                          triggerRef={textPositionTriggerRef}
                          options={TEXT_POSITIONS}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Subtitles */}
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Subtitles
                    </h3>
                    <button
                      onClick={() =>
                        updateEditState({
                          subtitlesEnabled: !editState.subtitlesEnabled,
                        })
                      }
                      className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition ${
                        editState.subtitlesEnabled
                          ? "bg-cyan-400"
                          : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                          editState.subtitlesEnabled
                            ? "translate-x-3.5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {editState.subtitlesEnabled && (
                    <div className="space-y-2">
                      {/* Upload SRT */}
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-700/30 px-3 py-3 text-sm text-gray-400 transition hover:border-cyan-400 hover:text-white">
                        <input
                          type="file"
                          accept=".srt,.vtt"
                          className="sr-only"
                        />
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Upload SRT/VTT
                      </label>

                      {/* Subtitle Style */}
                      <div className="relative">
                        <button
                          ref={subtitleStyleTriggerRef}
                          onClick={() =>
                            setShowSubtitleStyleDropdown(
                              !showSubtitleStyleDropdown
                            )
                          }
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-zinc-700/50 px-3 py-2 text-left transition hover:bg-zinc-600/50"
                        >
                          <div className="grid">
                            <span className="text-xs text-gray-500">Style</span>
                            <div className="text-sm font-medium text-white">
                              {TEXT_SUBTITLE_PRESETS[editState.subtitleStyle]
                                ?.name || editState.subtitleStyle}
                            </div>
                          </div>
                          <ChevronDownIcon />
                        </button>
                        <SimpleDropdown
                          isOpen={showSubtitleStyleDropdown}
                          onClose={() => setShowSubtitleStyleDropdown(false)}
                          value={editState.subtitleStyle}
                          onChange={(id) => {
                            updateEditState({ subtitleStyle: id });
                            setShowSubtitleStyleDropdown(false);
                          }}
                          triggerRef={subtitleStyleTriggerRef}
                          options={Object.entries(TEXT_SUBTITLE_PRESETS).map(
                            ([id, preset]) => ({
                              id,
                              label: preset.name,
                            })
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Audio/Music */}
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Background Music
                    </h3>
                    <button
                      onClick={() =>
                        updateEditState({
                          audioEnabled: !editState.audioEnabled,
                        })
                      }
                      className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition ${
                        editState.audioEnabled ? "bg-cyan-400" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                          editState.audioEnabled
                            ? "translate-x-3.5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {editState.audioEnabled && (
                    <div className="space-y-2">
                      {/* Upload Audio */}
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-700/30 px-3 py-3 text-sm text-gray-400 transition hover:border-cyan-400 hover:text-white">
                        <input
                          type="file"
                          accept="audio/*"
                          className="sr-only"
                        />
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                        Upload Audio
                      </label>

                      {/* Volume */}
                      <div className="flex items-center justify-between rounded-lg bg-zinc-700/50 px-3 py-2">
                        <span className="text-xs text-gray-500">Volume</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editState.audioVolume}
                            onChange={(e) =>
                              updateEditState({
                                audioVolume: parseFloat(e.target.value),
                              })
                            }
                            className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-cyan-400"
                          />
                          <span className="w-10 text-right text-sm text-white">
                            {Math.round(editState.audioVolume * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Ducking */}
                      <div className="flex items-center justify-between rounded-lg bg-zinc-700/50 px-3 py-2">
                        <div>
                          <span className="text-xs text-gray-500">
                            Auto Ducking
                          </span>
                          <p className="text-[10px] text-gray-600">
                            Lower music during speech
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateEditState({
                              audioDucking: !editState.audioDucking,
                            })
                          }
                          className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition ${
                            editState.audioDucking
                              ? "bg-cyan-400"
                              : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                              editState.audioDucking
                                ? "translate-x-3.5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Generate/Export Button - Fixed at bottom */}
          <div className="px-4 pt-3 pb-4">
            {activeTab === "create" ? (
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 text-sm font-semibold text-black shadow-[inset_0px_-3px_rgba(0,0,0,0.25)] transition hover:bg-cyan-300">
                Generate
                <div className="flex items-center gap-0.5">
                  <SparkleIcon />
                  {credits}
                </div>
              </button>
            ) : (
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 text-sm font-semibold text-black shadow-[inset_0px_-3px_rgba(0,0,0,0.25)] transition hover:bg-cyan-300">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Export Video
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-4">
          {showPresetSelector ? (
            /* Preset Selector View */
            <PresetSelector
              isOpen={showPresetSelector}
              onClose={() => setShowPresetSelector(false)}
              onSelectPreset={(preset) => setSelectedPreset(preset)}
            />
          ) : (
            <>
              {/* Top Tabs */}
              <div className="z-10 w-fit">
                <nav className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
                  <button className="relative flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors">
                    <FolderIcon />
                    History
                    <span className="absolute inset-0 rounded-lg bg-white/10" />
                  </button>
                  <button className="relative flex min-w-[120px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white">
                    <BookIcon />
                    How it works
                  </button>
                </nav>
              </div>

              {/* Hero Section */}
              <section className="flex w-full flex-col self-start rounded-[1.25rem] border border-zinc-800 bg-zinc-900 px-8 py-24">
                <header className="mb-8">
                  <h1 className="font-heading mb-2 text-4xl font-bold text-white uppercase">
                    Make Videos in One Click
                  </h1>
                  <p className="text-sm text-gray-400">
                    250+ presets for camera control, framing, and high-quality
                    VFX - or use the general preset for manual control.
                  </p>
                </header>

                {/* 3 Step Cards Grid */}
                <div className="grid grid-cols-3 gap-10">
                  {/* Card 1 - Add Image */}
                  <article>
                    <figure
                      className="relative mb-4 w-full overflow-hidden rounded-2xl"
                      style={{ aspectRatio: "1.31646 / 1" }}
                    >
                      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-800/30">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="text-gray-600">
                            <ImagePlaceholderIcon />
                          </div>
                          <p className="font-medium text-white">UPLOAD IMAGE</p>
                          <p className="text-xs text-gray-500">
                            Paste from Clipboard
                          </p>
                        </div>
                        {/* Decorative overlay image */}
                        <div className="absolute bottom-0 left-0 h-1/2 w-2/3 overflow-hidden rounded-tr-xl">
                          <div className="h-full w-full bg-gradient-to-t from-purple-900/50 to-transparent" />
                        </div>
                      </div>
                    </figure>
                    <h2 className="font-heading mb-2 text-sm font-bold text-white uppercase">
                      Add Image
                    </h2>
                    <p className="text-sm text-gray-400">
                      Upload or generate an image to start your animation
                    </p>
                  </article>

                  {/* Card 2 - Choose Preset */}
                  <article>
                    <figure
                      className="relative mb-4 w-full overflow-hidden rounded-2xl bg-zinc-800/30"
                      style={{ aspectRatio: "1.31646 / 1" }}
                    >
                      <div className="flex h-full items-center justify-center gap-2 p-4">
                        {/* Small cards */}
                        <div className="h-32 w-20 rounded-lg bg-zinc-700" />
                        <div className="h-40 w-28 rounded-lg border-2 border-cyan-400 bg-zinc-700" />
                        <div className="flex flex-col gap-2">
                          <div className="h-16 w-20 rounded-lg bg-zinc-700" />
                          <div className="h-16 w-20 rounded-lg bg-zinc-700">
                            <div className="flex h-full flex-col items-center justify-center">
                              <p className="text-[8px] text-gray-400">
                                MINIMALISM
                              </p>
                              <p className="text-[8px] text-gray-400">
                                CORPORATE
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </figure>
                    <h2 className="font-heading mb-2 text-sm font-bold text-white uppercase">
                      Choose Preset
                    </h2>
                    <p className="text-sm text-gray-400">
                      Pick a preset to control your image movement
                    </p>
                  </article>

                  {/* Card 3 - Get Video */}
                  <article>
                    <figure
                      className="relative mb-4 w-full overflow-hidden rounded-2xl border-2 border-white"
                      style={{ aspectRatio: "1.31646 / 1" }}
                    >
                      <div className="h-full w-full bg-gradient-to-br from-teal-900/50 via-transparent to-amber-900/30" />
                    </figure>
                    <h2 className="font-heading mb-2 text-sm font-bold text-white uppercase">
                      Get Video
                    </h2>
                    <p className="text-sm text-gray-400">
                      Click generate to create your final animated video!
                    </p>
                  </article>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
