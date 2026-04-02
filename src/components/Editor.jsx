import { useState, useEffect, useRef } from "react";
import Canvas from "./Canvas/Canvas";
import Toolbar from "./Toolbar";
import AddMenu from "./AddMenu";
import PropertiesPanel from "./Panels/PropertiesPanel";
import KnowledgePanel from "./Panels/KnowledgePanel";
import ExportModal from "./ExportModal";
import WebhookPanel from "./WebhookPanel";
import SettingsPanel from "./SettingsPanel";
import { useFlowState } from "../hooks/useFlowState";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import { useKnowledge } from "../hooks/useKnowledge";
import { useFlows } from "../hooks/useFlows";
import { useSettings } from "../hooks/useSettings";
import { useRouter } from "../hooks/useRouter";

const SERVER_URL = "http://localhost:3001";

export default function Editor({ flowId }) {
  const flows = useFlows();
  const { navigate } = useRouter();
  const { apiKey } = useSettings();

  // โหลด flow จาก localStorage
  const savedFlow = flows.getFlow(flowId);

  const {
    nodes, setNodes,
    connections, setConnections,
    selectedNode, showAddMenu,
    setSelectedNode, setShowAddMenu,
    addNode, deleteNode, deleteConnection,
    updateNodeData, resetFlow, openAddMenu, exportConfig,
  } = useFlowState({ nodes: savedFlow?.nodes, connections: savedFlow?.connections });

  const knowledge = useKnowledge(savedFlow?.knowledgeFiles?.length ? savedFlow.knowledgeFiles : null);

  const [flowName, setFlowName] = useState(savedFlow?.name || "Flow ใหม่");
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);

  const {
    canvasRef, panning, drawingConn, canvasOffset,
    portPositions, hoveredConn, hoverTargetId,
    setHoveredConn, getPortOffset, buildPath,
    handleNodeMouseDown, handlePortMouseDown,
    handleCanvasMouseDown, handleMouseMove, handleMouseUp,
  } = useCanvasInteraction(nodes, setNodes, connections, setConnections);

  // ── Auto-save (debounced) ────────────────────────────────────
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      flows.saveFlow(flowId, { nodes, connections, knowledgeFiles: knowledge.knowledgeFiles, name: flowName });
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [nodes, connections, knowledge.knowledgeFiles, flowName]);

  // ── Push API key to server on mount ─────────────────────────
  useEffect(() => {
    if (apiKey) {
      fetch(`${SERVER_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      }).catch(() => {});
    }
  }, [apiKey]);

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
    <div style={{ width: "100%", height: "100vh", display: "flex", fontFamily: "'JetBrains Mono','SF Mono',monospace", background: "var(--bg)", color: "var(--text)", overflow: "hidden" }}>
      <Canvas
        canvasRef={canvasRef}
        nodes={nodes} connections={connections}
        selectedNode={selectedNode} canvasOffset={canvasOffset}
        panning={panning} drawingConn={drawingConn}
        portPositions={portPositions} hoveredConn={hoveredConn} hoverTargetId={hoverTargetId}
        showAddMenu={showAddMenu}
        setHoveredConn={setHoveredConn} setSelectedNode={setSelectedNode} setShowAddMenu={setShowAddMenu}
        deleteConnection={deleteConnection} openAddMenu={openAddMenu}
        getPortOffset={getPortOffset} buildPath={buildPath}
        handleNodeMouseDown={handleNodeMouseDown} handlePortMouseDown={handlePortMouseDown}
        handleCanvasMouseDown={handleCanvasMouseDown}
        handleMouseMove={handleMouseMove} handleMouseUp={handleMouseUp}
      >
        <Toolbar
          flowName={flowName}
          onRename={setFlowName}
          nodeCount={nodes.length}
          connectionCount={connections.length}
          showKnowledge={showKnowledge}
          knowledgeCount={knowledge.knowledgeFiles.length}
          onToggleKnowledge={() => setShowKnowledge(!showKnowledge)}
          onExport={() => setShowExport(true)}
          onReset={resetFlow}
          onDeploy={handleDeploy}
          deployStatus={deployStatus}
          onBack={() => navigate("/")}
          onSettings={() => setShowSettings(!showSettings)}
        />

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
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

        <AddMenu showAddMenu={showAddMenu} canvasOffset={canvasOffset} addNode={addNode} />

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
        knowledgeFiles={knowledge.knowledgeFiles}
      />

      {showExport && <ExportModal config={exportJson} onClose={() => setShowExport(false)} />}
    </div>
  );
}
