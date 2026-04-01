import { useState, useCallback } from "react";
import { NODE_TYPES } from "../constants/nodeTypes";

const INITIAL_NODES = [{ id: "node-1", type: "trigger", x: 80, y: 220, data: {} }];

export function useFlowState() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(null);

  const addNode = useCallback((type, x, y, fromNodeId) => {
    const newId = `node-${Date.now()}`;
    setNodes((prev) => [...prev, { id: newId, type, x, y, data: {} }]);
    if (fromNodeId) {
      setConnections((prev) => [...prev, { from: fromNodeId, to: newId }]);
    }
    setShowAddMenu(null);
    setSelectedNode(newId);
  }, []);

  const deleteNode = useCallback((nodeId) => {
    if (nodeId === "node-1") return;
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  }, []);

  const deleteConnection = useCallback((from, to) => {
    setConnections((prev) => prev.filter((c) => !(c.from === from && c.to === to)));
  }, []);

  const updateNodeData = useCallback((nodeId, key, value) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n))
    );
  }, []);

  const resetFlow = useCallback(() => {
    setNodes(INITIAL_NODES);
    setConnections([]);
    setSelectedNode(null);
  }, []);

  const openAddMenu = useCallback((nodeId, nodes) => {
    const node = nodes.find((n) => n.id === nodeId);
    const typeDef = NODE_TYPES[node.type];
    setShowAddMenu({
      fromNodeId: nodeId,
      x: node.x + 280,
      y: node.y,
      suggestions: typeDef.suggestNext || [],
    });
  }, []);

  const exportConfig = useCallback((nodes, connections, knowledgeFiles) => {
    return JSON.stringify(
      {
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
        connections,
        knowledge: knowledgeFiles.map((f) => f.name),
      },
      null,
      2
    );
  }, []);

  return {
    nodes,
    setNodes,
    connections,
    setConnections,
    selectedNode,
    showAddMenu,
    setSelectedNode,
    setShowAddMenu,
    addNode,
    deleteNode,
    deleteConnection,
    updateNodeData,
    resetFlow,
    openAddMenu,
    exportConfig,
  };
}
