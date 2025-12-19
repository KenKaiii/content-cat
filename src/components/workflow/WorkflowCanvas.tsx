"use client";

import { useCallback, useMemo, memo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ImageInputNode,
  PromptNode,
  ModelNode,
  OutputNode,
  PreviewNode,
  VideoNode,
  Kling26Node,
  Kling25TurboNode,
  Wan26Node,
  NanoBananaProNode,
  VideoEditorNode,
} from "./nodes";
import { GradientEdge } from "./edges";
import WorkflowBottomToolbar, {
  type SavedWorkflow,
} from "./WorkflowBottomToolbar";
import NodeActionMenu from "./NodeActionMenu";
import { useWorkflowContext, COMPATIBLE_HANDLES } from "./WorkflowContext";
import type { WorkflowNode, WorkflowEdge } from "./types";
import type { NodeChange, EdgeChange, Connection } from "@xyflow/react";

// Register custom node types - defined outside component to prevent recreation
const nodeTypes: NodeTypes = {
  imageInput: ImageInputNode,
  prompt: PromptNode,
  model: ModelNode,
  output: OutputNode,
  preview: PreviewNode,
  video: VideoNode,
  kling26: Kling26Node,
  kling25Turbo: Kling25TurboNode,
  wan26: Wan26Node,
  nanoBananaPro: NanoBananaProNode,
  videoEditor: VideoEditorNode,
};

// Register custom edge types - defined outside component to prevent recreation
const edgeTypes: EdgeTypes = {
  gradient: GradientEdge,
};

// Default edge options - memoized outside component
const defaultEdgeOptions = {
  type: "gradient" as const,
  style: { strokeWidth: 3 },
};

// Connection line style - memoized outside component
const connectionLineStyle = { stroke: "#6EDDB3", strokeWidth: 3 };

// Pro options - memoized outside component
const proOptions = { hideAttribution: true };

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: WorkflowNode) => void;
  onPaneClick?: () => void;
  onDeleteNode?: (nodeId: string) => void;
  onRunNode?: (nodeId: string) => void;
  currentWorkflowId?: string | null;
  onLoadWorkflow?: (workflow: SavedWorkflow) => void;
  onNewWorkflow?: () => void;
}

function WorkflowCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDeleteNode,
  onRunNode,
  currentWorkflowId,
  onLoadWorkflow,
  onNewWorkflow,
}: WorkflowCanvasProps) {
  const { mode, setConnectingHandleType } = useWorkflowContext();

  // Validate connections based on handle types
  const isValidConnection = useCallback(
    (connection: Connection | WorkflowEdge) => {
      const sourceHandle = connection.sourceHandle || "";
      const targetHandle = connection.targetHandle || "";
      const compatibleTargets = COMPATIBLE_HANDLES[sourceHandle] || [
        sourceHandle,
      ];
      return compatibleTargets.includes(targetHandle);
    },
    []
  );

  // Track when connection starts/ends
  const onConnectStart = useCallback(
    (_: unknown, params: { handleId: string | null }) => {
      setConnectingHandleType(params.handleId || null);
    },
    [setConnectingHandleType]
  );

  const onConnectEnd = useCallback(() => {
    setConnectingHandleType(null);
  }, [setConnectingHandleType]);

  // Memoize pan/selection settings
  const panOnDrag = useMemo(
    () => (mode === "pan" ? [0, 1, 2] : [1, 2]),
    [mode]
  );
  const selectionOnDrag = mode === "select";

  // Memoize fitView options
  const fitViewOptions = useMemo(
    () => ({
      padding: 0.2,
      maxZoom: 1,
      minZoom: 0.1,
    }),
    []
  );

  return (
    <div className="h-full w-full">
      <style jsx global>{`
        /* Cursor styles */
        .react-flow__pane {
          cursor: ${mode === "pan" ? "grab" : "default"} !important;
        }
        .react-flow__pane:active {
          cursor: ${mode === "pan" ? "grabbing" : "default"} !important;
        }
        /* Clean node appearance */
        .react-flow__node {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        /* GPU acceleration for smooth dragging */
        .react-flow__node.dragging {
          will-change: transform;
        }
        .react-flow__nodes {
          will-change: transform;
        }
        /* Smooth transitions */
        .react-flow__edge path {
          transition: stroke 0.15s ease;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        panOnDrag={panOnDrag}
        selectionOnDrag={selectionOnDrag}
        selectionMode={SelectionMode.Partial}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        proOptions={proOptions}
        // Performance optimizations
        onlyRenderVisibleElements
        elevateNodesOnSelect
        nodeDragThreshold={2}
        minZoom={0.1}
        maxZoom={2}
        // Smoother dragging
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#2a2a2e"
        />
        <WorkflowBottomToolbar
          currentWorkflowId={currentWorkflowId}
          onLoadWorkflow={onLoadWorkflow}
          onNewWorkflow={onNewWorkflow}
        />
        <NodeActionMenu onRun={onRunNode} onDelete={onDeleteNode} />
      </ReactFlow>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const WorkflowCanvas = memo(WorkflowCanvasInner);
export default WorkflowCanvas;
