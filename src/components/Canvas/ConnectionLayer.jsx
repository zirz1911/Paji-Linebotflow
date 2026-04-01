import { NODE_TYPES, NODE_W, NODE_H } from "../../constants/nodeTypes";

export default function ConnectionLayer({
  connections,
  nodes,
  portPositions,
  getPortOffset,
  buildPath,
  hoveredConn,
  setHoveredConn,
  deleteConnection,
  drawingConn,
}) {
  return (
    <>
      {connections.map((conn, i) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return null;

        const outs = portPositions.outMap[conn.from] || [];
        const ins = portPositions.inMap[conn.to] || [];
        const outYOff = getPortOffset(outs, conn.to, NODE_H);
        const inYOff = getPortOffset(ins, conn.from, NODE_H);
        const path = buildPath(fromNode, toNode, outYOff, inYOff);

        const lineColor = NODE_TYPES[fromNode.type]?.color || "#6366f1";
        const isHovered = hoveredConn === i;

        const mx = (fromNode.x + NODE_W + toNode.x) / 2;
        const my = (fromNode.y + toNode.y) / 2 + NODE_H / 2 + (outYOff + inYOff) / 2;

        return (
          <g key={`c-${i}`}>
            {/* Hit area */}
            <path
              d={path}
              stroke="transparent"
              strokeWidth="22"
              fill="none"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredConn(i)}
              onMouseLeave={() => setHoveredConn(null)}
              onClick={(e) => { e.stopPropagation(); deleteConnection(conn.from, conn.to); }}
            />
            {/* Glow */}
            <path
              d={path}
              stroke={lineColor}
              strokeWidth={isHovered ? 7 : 4}
              fill="none"
              opacity={isHovered ? 0.2 : 0.08}
              strokeLinecap="round"
            />
            {/* Main line */}
            <path
              d={path}
              stroke={lineColor}
              strokeWidth={isHovered ? 2.5 : 1.8}
              fill="none"
              opacity={isHovered ? 1 : 0.7}
              strokeLinecap="round"
            />
            {/* Animated dot */}
            <circle r="3.5" fill={lineColor} opacity="0.85">
              <animateMotion dur="2.2s" repeatCount="indefinite" path={path} />
            </circle>
            {isHovered && (
              <>
                <circle r="5" fill={lineColor} opacity="0.35">
                  <animateMotion dur="2.2s" repeatCount="indefinite" path={path} />
                </circle>
                <g
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); deleteConnection(conn.from, conn.to); }}
                >
                  <circle cx={mx} cy={my} r="12" fill="#ef4444" stroke="var(--bg)" strokeWidth="2" />
                  <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="bold">✕</text>
                </g>
              </>
            )}
          </g>
        );
      })}

      {/* Drawing connection preview */}
      {drawingConn && (() => {
        const { startX, startY, mouseX, mouseY } = drawingConn;
        const dx = mouseX - startX;
        const cpx = Math.max(40, Math.abs(dx) * 0.4);
        const path = `M ${startX} ${startY} C ${startX + cpx} ${startY}, ${mouseX - cpx} ${mouseY}, ${mouseX} ${mouseY}`;
        return (
          <g>
            <path d={path} stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="8 5" strokeLinecap="round" />
            <circle cx={mouseX} cy={mouseY} r="6" fill="#6366f1" opacity="0.5" />
          </g>
        );
      })()}
    </>
  );
}
