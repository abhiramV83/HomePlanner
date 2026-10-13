import { useState } from "react";

// Professional room type metadata
const ROOM_META_LIGHT = {
  bedroom:   { abbr: "BR",  hatch: true,  color: "#f8fafc" },
  kitchen:   { abbr: "KT",  hatch: false, color: "#fffbeb" },
  bathroom:  { abbr: "BTH", hatch: true,  color: "#f1f5f9" },
  living:    { abbr: "LR",  hatch: false, color: "#f0fdf4" },
  pooja:     { abbr: "PR",  hatch: true,  color: "#fef3c7" },
  dining:    { abbr: "DR",  hatch: false, color: "#fafaf9" },
  balcony:   { abbr: "BLC", hatch: false, color: "#f0f9ff" },
  hallway:   { abbr: "HW",  hatch: false, color: "#f8fafc" },
  staircase: { abbr: "ST",  hatch: true,  color: "#f1f5f9" },
  garage:    { abbr: "GR",  hatch: true,  color: "#f1f5f9" },
  office:    { abbr: "OF",  hatch: false, color: "#f8fafc" },
  garden:    { abbr: "GDN", hatch: false, color: "#ecfdf5" },
  default:   { abbr: "RM",  hatch: false, color: "#ffffff" },
};

const ROOM_META_BLUEPRINT = {
  bedroom:   { abbr: "BR",  hatch: true,  color: "rgba(14, 165, 233, 0.12)" },
  kitchen:   { abbr: "KT",  hatch: false, color: "rgba(245, 158, 11, 0.12)" },
  bathroom:  { abbr: "BTH", hatch: true,  color: "rgba(99, 102, 241, 0.12)" },
  living:    { abbr: "LR",  hatch: false, color: "rgba(16, 185, 129, 0.12)" },
  pooja:     { abbr: "PR",  hatch: true,  color: "rgba(251, 191, 36, 0.15)" },
  dining:    { abbr: "DR",  hatch: false, color: "rgba(14, 165, 233, 0.08)" },
  balcony:   { abbr: "BLC", hatch: false, color: "rgba(56, 189, 248, 0.15)" },
  hallway:   { abbr: "HW",  hatch: false, color: "rgba(15, 23, 42, 0.4)" },
  staircase: { abbr: "ST",  hatch: true,  color: "rgba(148, 163, 184, 0.15)" },
  garage:    { abbr: "GR",  hatch: true,  color: "rgba(71, 85, 105, 0.15)" },
  office:    { abbr: "OF",  hatch: false, color: "rgba(14, 165, 233, 0.1)" },
  garden:    { abbr: "GDN", hatch: false, color: "rgba(16, 185, 129, 0.18)" },
  default:   { abbr: "RM",  hatch: false, color: "rgba(15, 23, 42, 0.5)" },
};

function Opening({ op, index, isBlueprint }) {
  const { x, y, width: opW, wall, type } = op;
  const wallStroke = isBlueprint ? "#7dd3fc" : "#0f172a";
  const glassFill = isBlueprint ? "#38bdf8" : "#bae6fd";

  if (type === "window") {
    const isHorizontal = wall === "north" || wall === "south";
    return (
      <g key={`op-${index}`} className="pointer-events-none">
        {isHorizontal ? (
          <>
            <line x1={x} y1={y - 0.2} x2={x + opW} y2={y - 0.2} stroke={wallStroke} strokeWidth="0.16" />
            <line x1={x} y1={y + 0.2} x2={x + opW} y2={y + 0.2} stroke={wallStroke} strokeWidth="0.16" />
            <rect x={x} y={y - 0.15} width={opW} height={0.3} fill={glassFill} opacity="0.5" />
          </>
        ) : (
          <>
            <line x1={x - 0.2} y1={y} x2={x - 0.2} y2={y + opW} stroke={wallStroke} strokeWidth="0.16" />
            <line x1={x + 0.2} y1={y} x2={x + 0.2} y2={y + opW} stroke={wallStroke} strokeWidth="0.16" />
            <rect x={x - 0.15} y={y} width={0.3} height={opW} fill={glassFill} opacity="0.5" />
          </>
        )}
      </g>
    );
  }

  // Door swing
  let doorLine = null;
  let arcPath = "";
  if (wall === "north") {
    doorLine = <line x1={x} y1={y} x2={x} y2={y + opW} stroke={wallStroke} strokeWidth="0.25" />;
    arcPath = `M ${x} ${y + opW} A ${opW} ${opW} 0 0 0 ${x + opW} ${y}`;
  } else if (wall === "south") {
    doorLine = <line x1={x} y1={y} x2={x} y2={y - opW} stroke={wallStroke} strokeWidth="0.25" />;
    arcPath = `M ${x} ${y - opW} A ${opW} ${opW} 0 0 1 ${x + opW} ${y}`;
  } else if (wall === "east") {
    doorLine = <line x1={x} y1={y} x2={x - opW} y2={y} stroke={wallStroke} strokeWidth="0.25" />;
    arcPath = `M ${x - opW} ${y} A ${opW} ${opW} 0 0 0 ${x} ${y + opW}`;
  } else {
    doorLine = <line x1={x} y1={y} x2={x + opW} y2={y} stroke={wallStroke} strokeWidth="0.25" />;
    arcPath = `M ${x + opW} ${y} A ${opW} ${opW} 0 0 1 ${x} ${y + opW}`;
  }

  const isH = wall === "north" || wall === "south";
  return (
    <g key={`op-${index}`} className="pointer-events-none">
      <line
        x1={x} y1={y}
        x2={isH ? x + opW : x}
        y2={isH ? y : y + opW}
        stroke={isBlueprint ? "#0b1528" : "#ffffff"} strokeWidth="0.7"
      />
      {doorLine}
      <path d={arcPath} fill="none" stroke={isBlueprint ? "#38bdf8" : "#64748b"} strokeWidth="0.14" strokeDasharray="0.3 0.2" />
    </g>
  );
}

export default function FloorPlanRenderer({ plan, activeRoomId, onRoomHover, preview = false }) {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [isBlueprint, setIsBlueprint] = useState(true);

  if (!plan || !plan.rooms || !plan.meta) {
    return (
      <div className="studio-card flex flex-col items-center justify-center h-96 text-slate-400 p-8 text-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" className="mb-2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        <p className="text-sm font-semibold text-slate-300">No floor plan data to render</p>
      </div>
    );
  }

  const { meta, rooms, openings = [] } = plan;
  const plotW = meta.plotWidth || 30;
  const plotL = meta.plotLength || 40;
  const pad = 4;
  const northAngle = meta.northDirection || 0;

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);
  const activeFloor = uniqueFloors.includes(selectedFloor) ? selectedFloor : (uniqueFloors[0] ?? 0);

  const floorRooms = rooms.filter((r) => r.floor === activeFloor);
  const floorOpenings = openings.filter((o) => o.floor === activeFloor);

  const roomMetaDict = isBlueprint ? ROOM_META_BLUEPRINT : ROOM_META_LIGHT;
  const getRoomMeta = (t = "") => roomMetaDict[t.toLowerCase()] ?? roomMetaDict.default;

  // Grid lines
  const gridLines = [];
  const gridStroke = isBlueprint ? "rgba(56, 189, 248, 0.12)" : "#e2e8f0";
  for (let i = 0; i <= plotW; i += 5) {
    gridLines.push(
      <line key={`gx-${i}`} x1={i} y1={0} x2={i} y2={plotL} stroke={gridStroke} strokeWidth="0.08" strokeDasharray="0.5 0.5" />
    );
  }
  for (let j = 0; j <= plotL; j += 5) {
    gridLines.push(
      <line key={`gy-${j}`} x1={0} y1={j} x2={plotW} y2={j} stroke={gridStroke} strokeWidth="0.08" strokeDasharray="0.5 0.5" />
    );
  }

  const floorLabel = (f) =>
    f === 0 ? "Ground Floor" : f === 1 ? "First Floor" : f === 2 ? "Second Floor" : `Floor ${f + 1}`;

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.8, +(prev + delta).toFixed(2))));
  };

  // Preview Mode: Lightweight render for comparison cards
  if (preview) {
    return (
      <div className="relative w-full overflow-hidden bg-[#070d18] blueprint-grid flex items-center justify-center p-3 rounded-xl border border-white/10">
        <svg
          viewBox={`${-pad} ${-pad} ${plotW + pad * 2} ${plotL + pad * 2}`}
          className="w-full h-auto max-h-[220px]"
          role="img"
          aria-label={`${meta.title || "Floor Plan"} Blueprint Preview`}
        >
          <rect
            x={0} y={0} width={plotW} height={plotL}
            fill="#0b1528"
            stroke="#38bdf8"
            strokeWidth="0.6"
          />
          {gridLines}
          {floorRooms.map((room, idx) => {
            const cx = room.x + room.width / 2;
            const cy = room.y + room.length / 2;
            const meta2 = getRoomMeta(room.type);
            return (
              <g key={`prev-${idx}`}>
                <rect
                  x={room.x} y={room.y}
                  width={room.width} height={room.length}
                  fill={meta2.color}
                  stroke="#7dd3fc"
                  strokeWidth="0.25"
                />
                <text
                  x={cx} y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="0.85"
                  fontWeight="700"
                  fill="#ffffff"
                  fontFamily="system-ui"
                >
                  {room.name}
                </text>
              </g>
            );
          })}
          {floorOpenings.map((op, idx) => (
            <Opening key={`prev-op-${idx}`} op={op} index={idx} isBlueprint={true} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="studio-card flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80 gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            {meta.title || "CAD Floor Plan Layout"}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            {meta.style} · {plotW}&apos; × {plotL}&apos; Plot · {meta.totalFloors} Floor{meta.totalFloors > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Blueprint Mode Toggle (44px target) */}
          <button
            onClick={() => setIsBlueprint(!isBlueprint)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/15 transition-all flex items-center gap-2"
            title="Toggle CAD Blueprint / Architectural Parchment Mode"
            aria-label="Toggle CAD Blueprint / Architectural Parchment Mode"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isBlueprint ? "bg-sky-400" : "bg-amber-400"}`} />
            <span>{isBlueprint ? "Blueprint Dark" : "Parchment Light"}</span>
          </button>

          {/* Zoom controls (44px target) */}
          <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-white/15 min-h-[44px]">
            <button
              onClick={() => handleZoom(-0.15)}
              aria-label="Zoom Out"
              title="Zoom Out"
              className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white text-base font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              −
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              aria-label="Reset Zoom"
              title="Reset Zoom"
              className="px-3 h-10 flex items-center justify-center text-slate-200 hover:text-white text-xs font-mono font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => handleZoom(0.15)}
              aria-label="Zoom In"
              title="Zoom In"
              className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white text-base font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              +
            </button>
          </div>

          {/* Floor tabs (44px target) */}
          {uniqueFloors.length > 1 && (
            <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/15 min-h-[44px] items-center">
              {uniqueFloors.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFloor === f
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                  aria-label={`Select ${floorLabel(f)}`}
                >
                  {floorLabel(f)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className={`relative flex-1 flex items-center justify-center p-6 overflow-auto min-h-[460px] transition-colors duration-300 ${
          isBlueprint ? "bg-[#070d18] blueprint-grid" : "bg-[#f8fafc]"
        }`}
      >
        {/* Floating Room Hover Inspector */}
        {hoveredRoom && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-sky-500/40 pointer-events-none transition-all animate-fadeIn">
            <p className="font-display font-bold text-sky-400 text-sm">{hoveredRoom.name}</p>
            <p className="text-slate-200 font-mono mt-0.5 font-semibold">
              {Math.round(hoveredRoom.width)}&apos; × {Math.round(hoveredRoom.length)}&apos; ({Math.round(hoveredRoom.width * hoveredRoom.length)} sq ft)
            </p>
            <p className="text-xs text-slate-300 mt-1 capitalize font-medium">
              Type: {hoveredRoom.type} · Floor: {floorLabel(hoveredRoom.floor)}
            </p>
          </div>
        )}

        <div style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease" }}>
          <svg
            id="floorplan-svg"
            viewBox={`${-pad} ${-pad} ${plotW + pad * 2} ${plotL + pad * 2}`}
            className="w-full max-w-[540px] h-auto drop-shadow-2xl"
            role="img"
            aria-label={`${meta.title || "Floor Plan"} SVG Layout`}
          >
            {/* North Compass with dynamic angle rotation */}
            <g
              transform={`translate(${plotW + pad * 0.7}, ${-pad * 0.5}) rotate(${northAngle})`}
              className="cursor-pointer"
            >
              <circle
                cx={0} cy={0} r={1.8}
                fill={isBlueprint ? "#0f172a" : "#ffffff"}
                stroke={isBlueprint ? "#38bdf8" : "#94a3b8"}
                strokeWidth="0.15"
              />
              <polygon points="0,-1.8 -0.45,-0.2 0.45,-0.2" fill="#0284c7" />
              <polygon points="0,1.8 -0.4,0.2 0.4,0.2" fill={isBlueprint ? "#334155" : "#94a3b8"} />
              <line x1={-1.8} y1={0} x2={1.8} y2={0} stroke={isBlueprint ? "#38bdf8" : "#cbd5e1"} strokeWidth="0.1" />
              <text
                x={0} y={-2.1} textAnchor="middle" fontSize="0.95" fontWeight="800"
                fill="#38bdf8" fontFamily="system-ui"
              >
                N
              </text>
            </g>

            {/* Plot boundary */}
            <rect
              x={0} y={0} width={plotW} height={plotL}
              fill={isBlueprint ? "#0b1528" : "#ffffff"}
              stroke={isBlueprint ? "#38bdf8" : "#0f172a"}
              strokeWidth="0.6"
            />
            <rect
              x={0.2} y={0.2} width={plotW - 0.4} height={plotL - 0.4}
              fill="none"
              stroke={isBlueprint ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"}
              strokeWidth="0.1"
            />

            {/* Grid lines */}
            {gridLines}

            {/* Rooms */}
            {floorRooms.map((room, idx) => {
              const id = `${room.floor}-${room.name}-${idx}`;
              const isActive = activeRoomId === id;
              const meta2 = getRoomMeta(room.type);
              const cx = room.x + room.width / 2;
              const cy = room.y + room.length / 2;
              const smallRoom = room.width < 7 || room.length < 5;

              const roomStroke = isActive
                ? "#38bdf8"
                : isBlueprint ? "#7dd3fc" : "#1e293b";
              const roomFill = isActive
                ? isBlueprint ? "rgba(14, 165, 233, 0.35)" : "#e0f2fe"
                : meta2.color;

              return (
                <g
                  key={id}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => {
                    setHoveredRoom(room);
                    if (onRoomHover) onRoomHover(id);
                  }}
                  onMouseLeave={() => {
                    setHoveredRoom(null);
                    if (onRoomHover) onRoomHover(null);
                  }}
                >
                  {/* Room fill */}
                  <rect
                    x={room.x} y={room.y}
                    width={room.width} height={room.length}
                    fill={roomFill}
                    stroke={roomStroke}
                    strokeWidth={isActive ? 0.4 : 0.26}
                    rx="0.1"
                  />

                  {/* Light hatch pattern */}
                  {meta2.hatch && !isActive && (
                    <rect
                      x={room.x} y={room.y}
                      width={room.width} height={room.length}
                      fill={isBlueprint ? "url(#cad-hatch-blue)" : "url(#cad-hatch-light)"}
                      opacity={isBlueprint ? 0.4 : 0.35}
                    />
                  )}

                  {/* Room name label */}
                  <text
                    x={cx} y={smallRoom ? cy - 0.15 : cy - 0.7}
                    textAnchor="middle"
                    fontSize={smallRoom ? "0.64" : "0.82"}
                    fontWeight="700"
                    fill={isActive ? "#38bdf8" : isBlueprint ? "#ffffff" : "#0f172a"}
                    fontFamily="system-ui"
                    style={{ userSelect: "none" }}
                  >
                    {room.name}
                  </text>

                  {/* Room Dimensions */}
                  {!smallRoom && (
                    <text
                      x={cx} y={cy + 0.15}
                      textAnchor="middle"
                      fontSize="0.58"
                      fontWeight="500"
                      fill={isBlueprint ? "#94a3b8" : "#475569"}
                      fontFamily="system-ui"
                      style={{ userSelect: "none" }}
                    >
                      {Math.round(room.width)}&apos; × {Math.round(room.length)}&apos;
                    </text>
                  )}

                  {/* Calculated Area */}
                  {!smallRoom && (
                    <text
                      x={cx} y={cy + 0.92}
                      textAnchor="middle"
                      fontSize="0.52"
                      fontWeight="600"
                      fill={isBlueprint ? "#38bdf8" : "#64748b"}
                      fontFamily="system-ui"
                      style={{ userSelect: "none" }}
                    >
                      {Math.round(room.width * room.length)} sq ft
                    </text>
                  )}
                </g>
              );
            })}

            {/* Openings (Doors & Windows) */}
            {floorOpenings.map((op, idx) => (
              <Opening key={idx} op={op} index={idx} isBlueprint={isBlueprint} />
            ))}

            {/* Perimeter Dimensions */}
            {/* Bottom width */}
            <line x1={0} y1={plotL + 1.2} x2={plotW} y2={plotL + 1.2} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <line x1={0} y1={plotL + 0.8} x2={0} y2={plotL + 1.6} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <line x1={plotW} y1={plotL + 0.8} x2={plotW} y2={plotL + 1.6} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <text
              x={plotW / 2} y={plotL + 2.3} textAnchor="middle"
              fontSize="0.95" fontWeight="700"
              fill={isBlueprint ? "#7dd3fc" : "#475569"} fontFamily="system-ui"
            >
              {plotW} ft
            </text>

            {/* Left length */}
            <line x1={-1.2} y1={0} x2={-1.2} y2={plotL} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <line x1={-1.6} y1={0} x2={-0.8} y2={0} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <line x1={-1.6} y1={plotL} x2={-0.8} y2={plotL} stroke={isBlueprint ? "#7dd3fc" : "#475569"} strokeWidth="0.12" />
            <text
              x={-2.4} y={plotL / 2} textAnchor="middle"
              fontSize="0.95" fontWeight="700"
              fill={isBlueprint ? "#7dd3fc" : "#475569"} fontFamily="system-ui"
              transform={`rotate(-90, -2.4, ${plotL / 2})`}
            >
              {plotL} ft
            </text>

            {/* Hatch patterns */}
            <defs>
              <pattern id="cad-hatch-light" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={2} stroke="#94a3b8" strokeWidth="0.35" />
              </pattern>
              <pattern id="cad-hatch-blue" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={2} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.35" />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>

      {/* Legend Strip */}
      <div className="p-3.5 px-5 border-t border-white/10 bg-slate-900/90 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-sky-400 uppercase font-bold tracking-wider">Legend:</span>
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className={`w-3.5 h-3.5 border rounded-xs inline-block ${isBlueprint ? "border-sky-400 bg-sky-950/40" : "border-slate-800 bg-white"}`} />
            Standard Room
          </span>
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span
              className={`w-3.5 h-3.5 border rounded-xs inline-block ${isBlueprint ? "border-sky-400" : "border-slate-800"}`}
              style={{
                background: isBlueprint
                  ? "repeating-linear-gradient(45deg, rgba(56,189,248,0.3) 0px, rgba(56,189,248,0.3) 1px, transparent 1px, transparent 3px)"
                  : "repeating-linear-gradient(45deg, #cbd5e1 0px, #cbd5e1 1px, #fff 1px, #fff 3px)"
              }}
            />
            Hatched (BR / BTH / Pooja)
          </span>
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-3.5 h-1.5 border border-sky-400 bg-sky-300 inline-block rounded-xs" />
            Window
          </span>
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className={`w-3.5 h-3.5 border-l border-b inline-block rounded-bl-full ${isBlueprint ? "border-sky-400" : "border-slate-800"}`} />
            Door Swing
          </span>
        </div>

        <span className="text-xs text-slate-300 font-mono font-semibold ml-auto">
          {floorRooms.length} rooms on {floorLabel(activeFloor)}
        </span>
      </div>
    </div>
  );
}
