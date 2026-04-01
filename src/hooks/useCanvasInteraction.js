import { useState, useCallback, useMemo, useRef } from "react";
import { NODE_W, NODE_H } from "../constants/nodeTypes";

export function useCanvasInteraction(nodes, setNodes, connections, setConnections) {
  const [dragging, setDragging] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [drawingConn, setDrawingConn] = useState(null);
  const [hoveredConn, setHoveredConn] = useState(null);
  const [hoverTargetId, setHoverTargetId] = useState(null); // node highlighted during drag
  const canvasRef = useRef(null);

  const portPositions = useMemo(() => {
    const outMap = {};
    const inMap = {};
    connections.forEach((c) => {
      if (!outMap[c.from]) outMap[c.from] = [];
      outMap[c.from].push(c.to);
      if (!inMap[c.to]) inMap[c.to] = [];
      inMap[c.to].push(c.from);
    });
    return { outMap, inMap };
  }, [connections]);

  const getPortOffset = useCallback((list, targetId, nodeH) => {
    const count = list.length;
    if (count <= 1) return 0;
    const idx = list.indexOf(targetId);
    const spacing = Math.min(18, (nodeH - 24) / (count - 1));
    const totalH = spacing * (count - 1);
    return -totalH / 2 + idx * spacing;
  }, []);

  // Bezier path builder (n8n-style)
  const buildPath = useCallback(
    (fromNode, toNode, outYOff, inYOff) => {
      const x1 = fromNode.x + NODE_W + canvasOffset.x;
      const y1 = fromNode.y + NODE_H / 2 + canvasOffset.y + outYOff;
      const x2 = toNode.x + canvasOffset.x;
      const y2 = toNode.y + NODE_H / 2 + canvasOffset.y + inYOff;
      const dx = x2 - x1;
      const dy = y2 - y1;

      if (dx > 40) {
        const cpx = Math.max(50, Math.abs(dx) * 0.4);
        const cpYNudge = outYOff * 0.6;
        return `M ${x1} ${y1} C ${x1 + cpx} ${y1 + cpYNudge}, ${x2 - cpx} ${y2 - cpYNudge * 0.3}, ${x2} ${y2}`;
      }

      const loopGap = 50;
      const vertDir = dy >= 0 ? 1 : -1;
      const my = y1 + vertDir * (Math.abs(dy) / 2 + 50);
      return [
        `M ${x1} ${y1}`,
        `C ${x1 + loopGap} ${y1}, ${x1 + loopGap} ${my}, ${(x1 + x2) / 2} ${my}`,
        `S ${x2 - loopGap} ${y2}, ${x2} ${y2}`,
      ].join(" ");
    },
    [canvasOffset]
  );

  // ── Find node under cursor ────────────────────────────────────
  const getNodeAtPoint = useCallback(
    (clientX, clientY, excludeId = null) => {
      return nodes.find((n) => {
        if (n.id === excludeId) return false;
        const nx = n.x + canvasOffset.x;
        const ny = n.y + canvasOffset.y;
        // hit area: full node box + 20px padding on left for input port
        return (
          clientX >= nx - 20 &&
          clientX <= nx + NODE_W + 20 &&
          clientY >= ny - 10 &&
          clientY <= ny + NODE_H + 10
        );
      });
    },
    [nodes, canvasOffset]
  );

  // Node drag start
  const handleNodeMouseDown = useCallback(
    (e, nodeId) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      const node = nodes.find((n) => n.id === nodeId);
      setDragging({
        nodeId,
        offsetX: e.clientX - node.x - canvasOffset.x,
        offsetY: e.clientY - node.y - canvasOffset.y,
      });
    },
    [nodes, canvasOffset]
  );

  // Port drag start — initiates a new connection
  const handlePortMouseDown = useCallback(
    (e, nodeId) => {
      e.stopPropagation();
      e.preventDefault();
      const node = nodes.find((n) => n.id === nodeId);
      const sx = node.x + NODE_W + canvasOffset.x;
      const sy = node.y + NODE_H / 2 + canvasOffset.y;
      setDrawingConn({ fromNodeId: nodeId, startX: sx, startY: sy, mouseX: e.clientX, mouseY: e.clientY });
    },
    [nodes, canvasOffset]
  );

  const handleCanvasMouseDown = useCallback(
    (e, onClearSelection) => {
      if (e.target === canvasRef.current || e.target.classList.contains("canvas-bg")) {
        onClearSelection();
        if (e.button === 0) {
          setPanning(true);
          setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
        }
      }
    },
    [canvasOffset]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (dragging) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragging.nodeId
              ? {
                  ...n,
                  x: e.clientX - dragging.offsetX - canvasOffset.x,
                  y: e.clientY - dragging.offsetY - canvasOffset.y,
                }
              : n
          )
        );
      }
      if (panning) {
        setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
      if (drawingConn) {
        setDrawingConn((p) => (p ? { ...p, mouseX: e.clientX, mouseY: e.clientY } : null));
        // highlight target node under cursor
        const target = getNodeAtPoint(e.clientX, e.clientY, drawingConn.fromNodeId);
        setHoverTargetId(target?.id || null);
      }
    },
    [dragging, panning, panStart, canvasOffset, drawingConn, setNodes, getNodeAtPoint]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (drawingConn) {
        const targetNode = getNodeAtPoint(e.clientX, e.clientY, drawingConn.fromNodeId);
        if (
          targetNode &&
          !connections.some((c) => c.from === drawingConn.fromNodeId && c.to === targetNode.id)
        ) {
          setConnections((prev) => [...prev, { from: drawingConn.fromNodeId, to: targetNode.id }]);
        }
        setDrawingConn(null);
        setHoverTargetId(null);
      }
      setDragging(null);
      setPanning(false);
    },
    [drawingConn, getNodeAtPoint, connections, setConnections]
  );

  return {
    canvasRef,
    dragging,
    canvasOffset,
    panning,
    drawingConn,
    hoveredConn,
    hoverTargetId,
    portPositions,
    setHoveredConn,
    getPortOffset,
    buildPath,
    handleNodeMouseDown,
    handlePortMouseDown,
    handleCanvasMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
