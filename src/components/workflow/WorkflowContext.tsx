"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type InteractionMode = "select" | "pan";

// Define which handle types can connect to each other
export const COMPATIBLE_HANDLES: Record<string, string[]> = {
  prompt: ["prompt"],
  video: ["video", "media", "result"],
  image: ["image", "media"],
  result: ["result", "media"],
  media: ["media", "video", "image", "result"],
  audio: ["audio"],
};

interface WorkflowContextValue {
  // Interaction mode
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Connection state
  connectingHandleType: string | null;
  setConnectingHandleType: (type: string | null) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

interface WorkflowProviderProps {
  children: ReactNode;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function WorkflowProvider({
  children,
  undo,
  redo,
  canUndo,
  canRedo,
}: WorkflowProviderProps) {
  const [mode, setMode] = useState<InteractionMode>("select");
  const [connectingHandleType, setConnectingHandleType] = useState<
    string | null
  >(null);

  return (
    <WorkflowContext.Provider
      value={{
        mode,
        setMode,
        undo,
        redo,
        canUndo,
        canRedo,
        connectingHandleType,
        setConnectingHandleType,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error(
      "useWorkflowContext must be used within a WorkflowProvider"
    );
  }
  return context;
}
