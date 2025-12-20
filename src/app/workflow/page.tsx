"use client";

import { Suspense, useCallback, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { WorkflowCanvas } from "@/components/workflow";
import WorkflowToolbar from "@/components/workflow/WorkflowToolbar";
import WorkflowPropertiesPanel from "@/components/workflow/WorkflowPropertiesPanel";
import { WorkflowProvider } from "@/components/workflow/WorkflowContext";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import {
  getWorkflow,
  createWorkflow,
  updateWorkflow,
} from "@/lib/api/workflows";
import type { WorkflowNode } from "@/components/workflow/types";
import type { SavedWorkflow } from "@/components/workflow/WorkflowBottomToolbar";

// Node types that have configuration panels
const CONFIGURABLE_NODE_TYPES = new Set([
  "nanoBananaPro",
  "kling26",
  "kling25Turbo",
  "wan26",
  "videoEditor",
]);

function WorkflowPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const hasLoadedFromUrl = useRef(false);
  const workflowNameInputRef = useRef<HTMLInputElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    addNode,
    deleteNode,
    clearSelection,
    updateNodeData,
    undo,
    redo,
    canUndo,
    canRedo,
    setNodes,
    setEdges,
    copySelectedNodes,
    pasteNodes,
    selectAllNodes,
  } = useWorkflow();

  // Get the selected node object
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  // Workflow execution
  const {
    executeNode,
    executeAll,
    canExecuteNode,
    isExecuting,
    executingNodeId,
    executingNodeIds,
  } = useWorkflowExecution();

  // Get execution state for the selected node
  const executionState = selectedNodeId
    ? canExecuteNode(selectedNodeId)
    : { canExecute: false, reason: "No node selected" };

  // Check if the selected node is currently executing
  const isSelectedNodeExecuting = selectedNodeId === executingNodeId;

  // Load workflow from URL on mount
  useEffect(() => {
    if (hasLoadedFromUrl.current) return;
    hasLoadedFromUrl.current = true;

    const urlWorkflowId = searchParams.get("id");
    if (urlWorkflowId) {
      getWorkflow(urlWorkflowId)
        .then((result) => {
          if (result.success) {
            setWorkflowId(result.data.id);
            setWorkflowName(result.data.name);
            setNodes(result.data.nodes);
            setEdges(result.data.edges);
            isInitialMount.current = true;
          } else if (result.error.code !== "NOT_FOUND") {
            toast.error("Failed to load workflow");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [searchParams, setNodes, setEdges]);

  // Update URL when workflow ID changes
  useEffect(() => {
    if (workflowId) {
      const newUrl = `/workflow?id=${workflowId}`;
      if (window.location.pathname + window.location.search !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [workflowId, router]);

  // Keyboard shortcuts for copy/paste
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey && event.key === "c") {
        event.preventDefault();
        copySelectedNodes();
      } else if (modifierKey && event.key === "v") {
        event.preventDefault();
        pasteNodes();
      } else if (modifierKey && event.key === "a") {
        event.preventDefault();
        selectAllNodes();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelectedNodes, pasteNodes, selectAllNodes]);

  // Auto-save workflow with debounce
  const saveWorkflow = useCallback(async (showFeedback = false) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (workflowId) {
        const result = await updateWorkflow(workflowId, {
          name: workflowName,
          nodes,
          edges,
        });
        if (!result.success) {
          toast.error("Failed to save workflow");
        } else if (showFeedback) {
          toast.success("Workflow saved");
          setShowSaveAnimation(true);
          setTimeout(() => setShowSaveAnimation(false), 600);
        }
      } else {
        const result = await createWorkflow({
          name: workflowName,
          nodes,
          edges,
        });
        if (result.success) {
          setWorkflowId(result.data.id);
          if (showFeedback) {
            toast.success("Workflow created");
            setShowSaveAnimation(true);
            setTimeout(() => setShowSaveAnimation(false), 600);
          }
        } else {
          toast.error("Failed to create workflow");
        }
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, workflowName, nodes, edges, isSaving]);

  // Handle workflow name save on Enter key
  const handleWorkflowNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Cancel any pending auto-save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        // Blur the input
        workflowNameInputRef.current?.blur();
        // Save with feedback
        setHasUnsavedChanges(false);
        saveWorkflow(true);
      }
    },
    [saveWorkflow]
  );

  // Track changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, [nodes, edges, workflowName]);

  // Debounced auto-save when there are unsaved changes
  // Only auto-save if: existing workflow OR new workflow with actual nodes
  useEffect(() => {
    if (!hasUnsavedChanges || isLoading) return;

    // Don't auto-save empty new workflows
    if (!workflowId && nodes.length === 0) {
      setHasUnsavedChanges(false);
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveWorkflow();
      setHasUnsavedChanges(false);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, saveWorkflow, isLoading, workflowId, nodes.length]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type as Parameters<typeof addNode>[0], position);
    },
    [addNode, screenToFlowPosition]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      deleteNode(nodeId);
    },
    [deleteNode]
  );

  const handleRunNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        toast.info(`Running ${node.data.label || node.type}...`);
        const result = await executeNode(nodeId);
        if (result.success) {
          toast.success(`${node.data.label || node.type} completed`);
        } else {
          toast.error(result.error || "Execution failed");
        }
      }
    },
    [nodes, executeNode]
  );

  // Handle execution from properties panel
  const handleExecuteSelectedNode = useCallback(async () => {
    if (!selectedNodeId) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (node) {
      toast.info(`Running ${node.data.label || node.type}...`);
      const result = await executeNode(selectedNodeId);
      if (result.success) {
        toast.success(`${node.data.label || node.type} completed`);
      } else {
        toast.error(result.error || "Execution failed");
      }
    }
  }, [selectedNodeId, nodes, executeNode]);

  const handleLoadWorkflow = useCallback(
    async (workflow: SavedWorkflow) => {
      const result = await getWorkflow(workflow.id);
      if (result.success) {
        setWorkflowId(result.data.id);
        setWorkflowName(result.data.name);
        setNodes(result.data.nodes);
        setEdges(result.data.edges);
        setHasUnsavedChanges(false);
        isInitialMount.current = true;
        toast.success(`Loaded "${result.data.name}"`);
      } else {
        toast.error("Failed to load workflow");
      }
    },
    [setNodes, setEdges]
  );

  const handleNewWorkflow = useCallback(() => {
    setWorkflowId(null);
    setWorkflowName("Untitled Workflow");
    setNodes([]);
    setEdges([]);
    setHasUnsavedChanges(false);
    isInitialMount.current = true; // Reset to prevent immediate save
    clearSelection();
    router.replace("/workflow", { scroll: false });
  }, [setNodes, setEdges, clearSelection, router]);

  // Handle Run All execution
  const handleRunAll = useCallback(async () => {
    toast.info("Running all nodes...");
    const result = await executeAll();
    if (result.success) {
      toast.success(
        `Completed ${result.completed} node${result.completed !== 1 ? "s" : ""}`
      );
    } else if (result.failed > 0) {
      toast.error(
        `${result.failed} node${result.failed !== 1 ? "s" : ""} failed`
      );
    }
  }, [executeAll]);

  return (
    <WorkflowProvider
      undo={undo}
      redo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
    >
      <div className="flex h-screen overflow-hidden bg-[#111114]">
        {/* Left Toolbar */}
        <WorkflowToolbar />

        {/* Main Canvas Area */}
        <div className="flex flex-1 overflow-hidden">
          <div
            className="relative flex-1"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Workflow Name Input */}
            <div className="absolute top-4 left-4 z-10">
              <input
                ref={workflowNameInputRef}
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onKeyDown={handleWorkflowNameKeyDown}
                className={`w-48 rounded-lg border bg-zinc-900/90 px-3 py-2 text-sm text-white placeholder-gray-500 backdrop-blur-xl transition-all duration-300 outline-none focus:border-white/20 ${
                  showSaveAnimation
                    ? "border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "border-white/10"
                }`}
                placeholder="Workflow name..."
              />
            </div>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onDeleteNode={handleDeleteNode}
              onRunNode={handleRunNode}
              onRunAll={handleRunAll}
              isExecutingAll={isExecuting}
              executingCount={executingNodeIds.length}
              currentWorkflowId={workflowId}
              onLoadWorkflow={handleLoadWorkflow}
              onNewWorkflow={handleNewWorkflow}
            />

            {/* Empty State */}
            {!isLoading && nodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <h2 className="font-heading text-center text-2xl font-bold text-white uppercase">
                    Nothing Here Yet
                  </h2>
                  <p className="text-center text-sm text-gray-400">
                    Press <kbd className="rounded bg-zinc-700 px-1.5 py-0.5 font-mono text-xs text-zinc-300">TAB</kbd> to open the nodes panel
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel - only show for configurable nodes */}
          {selectedNode &&
            CONFIGURABLE_NODE_TYPES.has(selectedNode.type || "") && (
              <WorkflowPropertiesPanel
                selectedNode={selectedNode}
                onUpdateNode={updateNodeData}
                onExecute={handleExecuteSelectedNode}
                isExecuting={isSelectedNodeExecuting}
                executionState={executionState}
              />
            )}
        </div>
      </div>
    </WorkflowProvider>
  );
}

function WorkflowPageWithProvider() {
  return (
    <ReactFlowProvider>
      <WorkflowPageContent />
    </ReactFlowProvider>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#111114]">
          <div className="text-gray-400">Loading workflow...</div>
        </div>
      }
    >
      <WorkflowPageWithProvider />
    </Suspense>
  );
}
