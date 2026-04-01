import { useState } from "react";
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar";
import AddMenu from "./components/AddMenu";
import PropertiesPanel from "./components/Panels/PropertiesPanel";
import KnowledgePanel from "./components/Panels/KnowledgePanel";
import ExportModal from "./components/ExportModal";
import WebhookPanel from "./components/WebhookPanel";
import { useFlowState } from "./hooks/useFlowState";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { useKnowledge } from "./hooks/useKnowledge";

const SERVER_URL = "http://localhost:3001";

export default function App() {
  const {
    nodes, setNodes,
    connections, setConnections,
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
  } = useFlowState();

  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null); // null | "ok" | "error"

  const knowledge = useKnowledge();

  const {
    canvasRef,
    panning,
    drawingConn,
    canvasOffset,
    portPositions,
    hoveredConn,
    hoverTargetId,
    setHoveredConn,
    getPortOffset,
    buildPath,
    handleNodeMouseDown,
    handlePortMouseDown,
    handleCanvasMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvasInteraction(nodes, setNodes, connections, setConnections);

  const selNode = nodes.find((n) => n.id === selectedNode);
  const exportJson = exportConfig(nodes, connections, knowledge.knowledgeFiles);

  const handleDeploy = async () => {
    setDeployStatus(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: exportJson,
      });
      setDeployStatus(res.ok ? "ok" : "error");
      setTimeout(() => setDeployStatus(null), 3000);
    } catch {
      setDeployStatus("error");
      setTimeout(() => setDeployStatus(null), 3000);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        fontFamily: "'JetBrains Mono','SF Mono',monospace",
        background: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden",
      }}
    >
      <Canvas
        canvasRef={canvasRef}
        nodes={nodes}
        connections={connections}
        selectedNode={selectedNode}
        canvasOffset={canvasOffset}
        panning={panning}
        drawingConn={drawingConn}
        portPositions={portPositions}
        hoveredConn={hoveredConn}
        hoverTargetId={hoverTargetId}
        showAddMenu={showAddMenu}
        setHoveredConn={setHoveredConn}
        setSelectedNode={setSelectedNode}
        setShowAddMenu={setShowAddMenu}
        deleteConnection={deleteConnection}
        openAddMenu={openAddMenu}
        getPortOffset={getPortOffset}
        buildPath={buildPath}
        handleNodeMouseDown={handleNodeMouseDown}
        handlePortMouseDown={handlePortMouseDown}
        handleCanvasMouseDown={handleCanvasMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      >
        <Toolbar
          nodeCount={nodes.length}
          connectionCount={connections.length}
          showKnowledge={showKnowledge}
          knowledgeCount={knowledge.knowledgeFiles.length}
          onToggleKnowledge={() => setShowKnowledge(!showKnowledge)}
          onExport={() => setShowExport(true)}
          onReset={resetFlow}
          onDeploy={handleDeploy}
          deployStatus={deployStatus}
        />

        {/* Webhook URL button (top-right) */}
        <button
          onClick={() => setShowWebhook(!showWebhook)}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 50,
            background: showWebhook ? "var(--accent)" : "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 10,
            color: showWebhook ? "white" : "var(--text-dim)",
            padding: "7px 14px", fontSize: 12, cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          🔗 Webhook URL
        </button>

        {showWebhook && <WebhookPanel onClose={() => setShowWebhook(false)} />}

        <AddMenu
          showAddMenu={showAddMenu}
          canvasOffset={canvasOffset}
          addNode={addNode}
        />

        {showKnowledge && (
          <KnowledgePanel
            knowledgeFiles={knowledge.knowledgeFiles}
            editingFile={knowledge.editingFile}
            setEditingFile={knowledge.setEditingFile}
            addFile={knowledge.addFile}
            deleteFile={knowledge.deleteFile}
            updateFileContent={knowledge.updateFileContent}
          />
        )}

        <div className="hint-bar">
          <span>🖱️ ลาก Node ย้าย</span>
          <span>⚡ ลากจาก <span className="hint-key">●</span> โยงเส้น</span>
          <span>🔴 คลิกเส้นเพื่อลบ</span>
          <span>👆 กด <span className="hint-key">+</span> เพิ่ม Node</span>
        </div>
      </Canvas>

      <PropertiesPanel
        node={selNode}
        addNode={addNode}
        deleteNode={deleteNode}
        updateNodeData={updateNodeData}
      />

      {showExport && (
        <ExportModal config={exportJson} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
