"use client";

import React, { useCallback, useState, useRef } from "react";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
} from "@/components/workflow/types";

// Initial nodes for demonstration
const initialNodes: WorkflowNode[] = [
  {
    id: "1",
    type: "kling26",
    position: { x: 100, y: 100 },
    data: { label: "Kling 2.6 Pro" },
  },
];

const initialEdges: WorkflowEdge[] = [];

interface HistoryState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const MAX_HISTORY_SIZE = 50;

interface UseWorkflowOptions {
  onNodeSelect?: (nodeId: string | null) => void;
}

interface UseWorkflowReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (nodeId: string) => void;
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
  clearSelection: () => void;
  resetWorkflow: () => void;
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useWorkflow(options?: UseWorkflowOptions): UseWorkflowReturn {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // History management
  const historyRef = useRef<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedoRef = useRef(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveToHistory = useCallback(
    (newNodes: WorkflowNode[], newEdges: WorkflowEdge[]) => {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      // Remove any future states if we're not at the end
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(
          0,
          historyIndexRef.current + 1
        );
      }

      // Add new state
      historyRef.current.push({ nodes: newNodes, edges: newEdges });

      // Limit history size
      if (historyRef.current.length > MAX_HISTORY_SIZE) {
        historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
      }

      historyIndexRef.current = historyRef.current.length - 1;
      updateHistoryState();
    },
    [updateHistoryState]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      setNodes(state.nodes);
      setEdges(state.edges);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      setNodes(state.nodes);
      setEdges(state.edges);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  // Debounce timer for position changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSaveToHistory = useCallback(
    (newNodes: WorkflowNode[], newEdges: WorkflowEdge[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToHistory(newNodes, newEdges);
      }, 300);
    },
    [saveToHistory]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);

        // Check if this is a significant change (not just selection)
        const hasSignificantChange = changes.some(
          (change) =>
            change.type === "position" ||
            change.type === "remove" ||
            change.type === "add"
        );

        if (hasSignificantChange) {
          // For position changes, debounce; for add/remove, save immediately
          const hasPositionChange = changes.some(
            (change) => change.type === "position"
          );
          if (hasPositionChange) {
            debouncedSaveToHistory(newNodes, edges);
          } else {
            saveToHistory(newNodes, edges);
          }
        }

        return newNodes;
      });
    },
    [edges, saveToHistory, debouncedSaveToHistory]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowEdge>[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);

        const hasSignificantChange = changes.some(
          (change) => change.type === "remove" || change.type === "add"
        );

        if (hasSignificantChange) {
          saveToHistory(nodes, newEdges);
        }

        return newEdges;
      });
    },
    [nodes, saveToHistory]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...connection, type: "gradient" }, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, saveToHistory]
  );

  const onNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      options?.onNodeSelect?.(nodeId);
    },
    [options]
  );

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    options?.onNodeSelect?.(null);
  }, [options]);

  const addNode = useCallback(
    (type: NodeType, position?: { x: number; y: number }) => {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type,
        position: position || { x: 250, y: 250 },
        data: getDefaultNodeData(type),
      };
      setNodes((nds) => {
        const newNodes = [...nds, newNode];
        saveToHistory(newNodes, edges);
        return newNodes;
      });
    },
    [edges, saveToHistory]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const newNodes = nds.filter((node) => node.id !== nodeId);
        setEdges((eds) => {
          const newEdges = eds.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          );
          saveToHistory(newNodes, newEdges);
          return newEdges;
        });
        return newNodes;
      });
      setSelectedNodeId((current) => (current === nodeId ? null : current));
    },
    [saveToHistory]
  );

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode["data"]>) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        );
        saveToHistory(newNodes, edges);
        return newNodes;
      });
    },
    [edges, saveToHistory]
  );

  const resetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    historyRef.current = [{ nodes: initialNodes, edges: initialEdges }];
    historyIndexRef.current = 0;
    updateHistoryState();
  }, [updateHistoryState]);

  return {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    addNode,
    deleteNode,
    updateNodeData,
    clearSelection,
    resetWorkflow,
    setNodes,
    setEdges,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

// Helper to get default data for each node type
function getDefaultNodeData(type: NodeType): WorkflowNode["data"] {
  switch (type) {
    case "imageInput":
      return { label: "Image Input" };
    case "prompt":
      return { label: "Prompt", prompt: "" };
    case "model":
      return { label: "Model", modelId: "", modelName: "" };
    case "output":
      return { label: "Output" };
    case "preview":
      return { label: "Preview" };
    case "video":
      return { label: "Video" };
    case "kling26":
      return {
        label: "Kling 2.6 Pro",
        mode: "text-to-video",
        duration: "5",
        aspectRatio: "16:9",
        audioEnabled: true,
        cfgScale: 0.5,
      };
    case "kling25Turbo":
      return {
        label: "Kling 2.5 Turbo",
        mode: "text-to-video",
        duration: "5",
        aspectRatio: "16:9",
        cfgScale: 0.5,
      };
    case "wan26":
      return {
        label: "Wan 2.6",
        mode: "text-to-video",
        duration: "5",
        aspectRatio: "16:9",
        resolution: "720p",
        enhanceEnabled: false,
      };
    case "nanoBananaPro":
      return {
        label: "Nano Banana Pro",
        prompt: "",
        mode: "text-to-image",
        aspectRatio: "1:1",
        resolution: "1K",
        outputFormat: "png",
        numImages: 1,
        enableWebSearch: false,
        enableSafetyChecker: true,
      };
    case "videoEditor":
      return {
        label: "Video Editor",
        operation: "trim",
        transition: { type: "fade", duration: 0.3, easing: "easeInOut" },
        audio: { enabled: true, volume: 1, ducking: false },
        subtitleStyle: "tiktok",
        outputQuality: "high",
        outputAspectRatio: "9:16",
        outputResolution: "1080p",
      };
    default:
      return { label: "Node" };
  }
}
