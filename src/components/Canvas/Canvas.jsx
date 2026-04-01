import { useEffect } from "react";
import ConnectionLayer from "./ConnectionLayer";
import NodeCard from "./NodeCard";

export default function Canvas({
  canvasRef,
  nodes,
  connections,
  selectedNode,
  canvasOffset,
  panning,
  drawingConn,
  portPositions,
  hoveredConn,
  hoverTargetId,
  showAddMenu,
  setHoveredConn,
  setSelectedNode,
  setShowAddMenu,
  deleteConnection,
  openAddMenu,
  getPortOffset,
  buildPath,
  handleNodeMouseDown,
  handlePortMouseDown,
  handleCanvasMouseDown,
  handleMouseMove,
  handleMouseUp,
  children,
}) {
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const onClearSelection = () => {
    setSelectedNode(null);
    setShowAddMenu(null);
  };

  return (
    <div
      ref={canvasRef}
      className="canvas-bg"
      onMouseDown={(e) => handleCanvasMouseDown(e, onClearSelection)}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        cursor: panning ? "grabbing" : drawingConn ? "crosshair" : "default",
      }}
    >
      {/* Grid + Connections SVG */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
      >
        <defs>
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            x={canvasOffset.x % 24}
            y={canvasOffset.y % 24}
          >
            <circle cx="1" cy="1" r="0.8" fill="var(--border)" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g style={{ pointerEvents: "auto" }}>
          <ConnectionLayer
            connections={connections}
            nodes={nodes}
            portPositions={portPositions}
            getPortOffset={getPortOffset}
            buildPath={buildPath}
            hoveredConn={hoveredConn}
            setHoveredConn={setHoveredConn}
            deleteConnection={deleteConnection}
            drawingConn={drawingConn}
          />
        </g>
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          nodes={nodes}
          isSelected={selectedNode === node.id}
          isDropTarget={hoverTargetId === node.id}
          canvasOffset={canvasOffset}
          portPositions={portPositions}
          handleNodeMouseDown={handleNodeMouseDown}
          handlePortMouseDown={handlePortMouseDown}
          onSelect={(id) => { setSelectedNode(id); setShowAddMenu(null); }}
          openAddMenu={(nodeId) => openAddMenu(nodeId, nodes)}
        />
      ))}

      {/* Additional overlays (toolbar, menus, panels, hints) */}
      {children}
    </div>
  );
}
