"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { WorkflowCanvas } from "@/components/workflow";
import WorkflowToolbar from "@/components/workflow/WorkflowToolbar";
import WorkflowPropertiesPanel from "@/components/workflow/WorkflowPropertiesPanel";
import { WorkflowProvider } from "@/components/workflow/WorkflowContext";
import { useWorkflow } from "@/hooks/useWorkflow";
import type { WorkflowNode, WorkflowEdge } from "@/components/workflow/types";
import type { SavedWorkflow } from "@/components/workflow/WorkflowBottomToolbar";

function WorkflowPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const hasLoadedFromUrl = useRef(false);
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
  } = useWorkflow();

  // Get the selected node object
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  // Load workflow from URL on mount
  useEffect(() => {
    if (hasLoadedFromUrl.current) return;
    hasLoadedFromUrl.current = true;

    const urlWorkflowId = searchParams.get("id");
    if (urlWorkflowId) {
      // Load the workflow from the URL
      fetch(`/api/workflows/${urlWorkflowId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Not found");
        })
        .then((data) => {
          setWorkflowId(data.id);
          setWorkflowName(data.name);
          setNodes(data.nodes as WorkflowNode[]);
          setEdges(data.edges as WorkflowEdge[]);
          isInitialMount.current = true;
        })
        .catch(() => {
          // Workflow not found, start fresh
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

  // Get CSRF token from cookie
  const getCsrfToken = useCallback(() => {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : "";
  }, []);

  // Auto-save workflow with debounce
  const saveWorkflow = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const csrfToken = getCsrfToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    };

    try {
      if (workflowId) {
        // Update existing workflow
        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ name: workflowName, nodes, edges }),
        });
      } else {
        // Create new workflow
        const response = await fetch("/api/workflows", {
          method: "POST",
          headers,
          body: JSON.stringify({ name: workflowName, nodes, edges }),
        });
        const data = await response.json();
        if (data.id) {
          setWorkflowId(data.id);
        }
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, workflowName, nodes, edges, isSaving, getCsrfToken]);

  // Track changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, [nodes, edges, workflowName]);

  // Debounced auto-save when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || isLoading) return;

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
  }, [hasUnsavedChanges, saveWorkflow, isLoading]);

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
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        toast.info(`Running ${node.data.label || node.type}...`);
        // TODO: Implement actual node execution
      }
    },
    [nodes]
  );

  const handleLoadWorkflow = useCallback(
    async (workflow: SavedWorkflow) => {
      try {
        const response = await fetch(`/api/workflows/${workflow.id}`);
        if (!response.ok) {
          toast.error("Failed to load workflow");
          return;
        }
        const data = await response.json();

        // Set the workflow data
        setWorkflowId(data.id);
        setWorkflowName(data.name);
        setNodes(data.nodes as WorkflowNode[]);
        setEdges(data.edges as WorkflowEdge[]);
        setHasUnsavedChanges(false);
        isInitialMount.current = true; // Reset to prevent immediate save

        toast.success(`Loaded "${data.name}"`);
      } catch (error) {
        console.error("Failed to load workflow:", error);
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
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-48 rounded-lg border border-white/10 bg-zinc-900/90 px-3 py-2 text-sm text-white placeholder-gray-500 backdrop-blur-xl transition-colors outline-none focus:border-white/20"
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
              currentWorkflowId={workflowId}
              onLoadWorkflow={handleLoadWorkflow}
              onNewWorkflow={handleNewWorkflow}
            />
          </div>

          {/* Properties Panel - only show when a node is selected */}
          {selectedNodeId && (
            <WorkflowPropertiesPanel
              selectedNode={selectedNode}
              onUpdateNode={updateNodeData}
            />
          )}
        </div>
      </div>
    </WorkflowProvider>
  );
}

export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowPageContent />
    </ReactFlowProvider>
  );
}
