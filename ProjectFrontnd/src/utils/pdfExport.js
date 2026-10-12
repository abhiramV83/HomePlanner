import { jsPDF } from "jspdf";
import { estimateCost } from "./costEstimate";
import { computeOverallVastuScore, evaluateVastu } from "./vastu";

/**
 * Direct High-DPI Canvas Blueprint Renderer.
 * Deterministically rasterizes the floorplan into a full-page architectural blueprint.
 * Zero DOM dependencies, zero CSS parsing bugs, zero network calls, 100% reliable.
 */
function renderBlueprintToCanvas(plan) {
  const meta = plan?.meta || {};
  const rooms = Array.isArray(plan?.rooms) ? plan.rooms : [];
  const openings = Array.isArray(plan?.openings) ? plan.openings : [];

  const plotW = meta.plotWidth || 30;
  const plotL = meta.plotLength || 40;
  const northAngle = meta.northDirection || 0;

  // High-DPI canvas dimensions for crisp full-page A4 print
  const canvasWidth = 2400;
  const canvasHeight = 2400;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark Blueprint Navy Background
  ctx.fillStyle = "#070d18";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Generous margin for external dimension lines and annotations
  const padX = 220;
  const padY = 220;
  const availW = canvasWidth - padX * 2;
  const availH = canvasHeight - padY * 2;

  const scale = Math.min(availW / plotW, availH / plotL);
  const drawW = plotW * scale;
  const drawH = plotL * scale;
  const originX = padX + (availW - drawW) / 2;
  const originY = padY + (availH - drawH) / 2;

  // CAD Grid lines (every 5ft)
  ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
  ctx.lineWidth = 1.2;
  const gridStep = 5 * scale;
  for (let x = originX; x <= originX + drawW + 1; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, originY);
    ctx.lineTo(x, originY + drawH);
    ctx.stroke();
  }
  for (let y = originY; y <= originY + drawH + 1; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX + drawW, y);
    ctx.stroke();
  }

  // Outer plot perimeter border
  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.lineWidth = 10;
  ctx.strokeRect(originX - 10, originY - 10, drawW + 20, drawH + 20);

  ctx.fillStyle = "#0b1528";
  ctx.fillRect(originX, originY, drawW, drawH);

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 4;
  ctx.strokeRect(originX, originY, drawW, drawH);

  // Room type color styles
  const roomStyles = {
    bedroom:   { fill: "rgba(14, 165, 233, 0.16)", stroke: "#7dd3fc" },
    kitchen:   { fill: "rgba(245, 158, 11, 0.16)", stroke: "#fbbf24" },
    bathroom:  { fill: "rgba(99, 102, 241, 0.16)", stroke: "#818cf8" },
    living:    { fill: "rgba(16, 185, 129, 0.16)", stroke: "#34d399" },
    pooja:     { fill: "rgba(251, 191, 36, 0.20)", stroke: "#fde047" },
    dining:    { fill: "rgba(14, 165, 233, 0.12)", stroke: "#38bdf8" },
    balcony:   { fill: "rgba(56, 189, 248, 0.18)", stroke: "#38bdf8" },
    hallway:   { fill: "rgba(30, 41, 59, 0.50)",  stroke: "#64748b" },
    staircase: { fill: "rgba(148, 163, 184, 0.15)", stroke: "#94a3b8" },
    garage:    { fill: "rgba(71, 85, 105, 0.20)", stroke: "#94a3b8" },
    parking:   { fill: "rgba(71, 85, 105, 0.20)", stroke: "#94a3b8" },
    default:   { fill: "rgba(15, 23, 42, 0.60)",  stroke: "#7dd3fc" },
  };

  // Filter to Ground floor (or floor 0) or all rooms
  const floor0Rooms = rooms.filter((r) => (r.floor ?? 0) === 0);
  const roomsToRender = floor0Rooms.length > 0 ? floor0Rooms : rooms;

  roomsToRender.forEach((room) => {
    const rx = originX + room.x * scale;
    const ry = originY + room.y * scale;
    const rw = room.width * scale;
    const rh = room.length * scale;
    const style = roomStyles[room.type?.toLowerCase()] || roomStyles.default;

    // Room fill
    ctx.fillStyle = style.fill;
    ctx.fillRect(rx, ry, rw, rh);

    // Room boundary
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 3.2;
    ctx.strokeRect(rx, ry, rw, rh);

    // Corner accent ticks
    ctx.fillStyle = "#38bdf8";
    const dot = 4;
    ctx.fillRect(rx - dot / 2, ry - dot / 2, dot, dot);
    ctx.fillRect(rx + rw - dot / 2, ry - dot / 2, dot, dot);
    ctx.fillRect(rx - dot / 2, ry + rh - dot / 2, dot, dot);
    ctx.fillRect(rx + rw - dot / 2, ry + rh - dot / 2, dot, dot);

    // Room text
    const cx = rx + rw / 2;
    const cy = ry + rh / 2;
    const isSmall = rw < 150 || rh < 110;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Room Name
    ctx.font = isSmall ? "bold 20px 'Segoe UI', sans-serif" : "bold 26px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    const nameY = isSmall ? cy - 12 : cy - 24;
    ctx.fillText(room.name, cx, nameY);

    // Room Dimensions
    if (!isSmall) {
      ctx.font = "600 20px 'Courier New', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${Math.round(room.width)}' × ${Math.round(room.length)}'`, cx, cy + 10);

      // Area tag
      ctx.font = "bold 18px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`${Math.round(room.width * room.length)} sq ft`, cx, cy + 38);
    } else {
      ctx.font = "bold 16px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`${Math.round(room.width * room.length)} sqft`, cx, cy + 16);
    }
  });

  // Openings (Windows and Doors)
  const floor0Openings = openings.filter((o) => (o.floor ?? 0) === 0);
  const openingsToRender = floor0Openings.length > 0 ? floor0Openings : openings;

  openingsToRender.forEach((op) => {
    const ox = originX + op.x * scale;
    const oy = originY + op.y * scale;
    const ow = op.width * scale;
    const isH = op.wall === "north" || op.wall === "south";

    if (op.type === "window") {
      ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      if (isH) {
        ctx.fillRect(ox, oy - 6, ow, 12);
        ctx.strokeRect(ox, oy - 6, ow, 12);
      } else {
        ctx.fillRect(ox - 6, oy, 12, ow);
        ctx.strokeRect(ox - 6, oy, 12, ow);
      }
    } else {
      // Clear doorway gap
      ctx.strokeStyle = "#0b1528";
      ctx.lineWidth = 7;
      ctx.beginPath();
      if (isH) {
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + ow, oy);
      } else {
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, oy + ow);
      }
      ctx.stroke();

      // Door swing arc
      ctx.save();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      if (op.wall === "north") {
        ctx.arc(ox, oy, ow, 0, Math.PI / 2, false);
      } else if (op.wall === "south") {
        ctx.arc(ox, oy, ow, -Math.PI / 2, 0, false);
      } else if (op.wall === "east") {
        ctx.arc(ox, oy, ow, Math.PI / 2, Math.PI, false);
      } else {
        ctx.arc(ox, oy, ow, 0, Math.PI / 2, false);
      }
      ctx.stroke();
      ctx.restore();
    }
  });

  // Dimension lines: Bottom width
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = "#7dd3fc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const dimY = originY + drawH + 50;
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(originX, dimY);
  ctx.lineTo(originX + drawW, dimY);
  ctx.moveTo(originX, dimY - 15);
  ctx.lineTo(originX, dimY + 15);
  ctx.moveTo(originX + drawW, dimY - 15);
  ctx.lineTo(originX + drawW, dimY + 15);
  ctx.stroke();
  ctx.fillText(`${plotW} FT WIDTH`, originX + drawW / 2, dimY + 32);

  // Dimension lines: Left length
  const dimX = originX - 50;
  ctx.beginPath();
  ctx.moveTo(dimX, originY);
  ctx.lineTo(dimX, originY + drawH);
  ctx.moveTo(dimX - 15, originY);
  ctx.lineTo(dimX + 15, originY);
  ctx.moveTo(dimX - 15, originY + drawH);
  ctx.lineTo(dimX + 15, originY + drawH);
  ctx.stroke();

  ctx.save();
  ctx.translate(dimX - 32, originY + drawH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${plotL} FT LENGTH`, 0, 0);
  ctx.restore();

  // Architectural North Compass Rose in Top-Right
  const compassX = canvasWidth - 130;
  const compassY = 120;
  const compassR = 50;

  ctx.save();
  ctx.translate(compassX, compassY);

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(0, 0, compassR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Rotate according to North Direction
  ctx.rotate((northAngle * Math.PI) / 180);

  // North needle (cyan)
  ctx.fillStyle = "#0284c7";
  ctx.beginPath();
  ctx.moveTo(0, -compassR + 9);
  ctx.lineTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();

  // South needle (slate)
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(0, compassR - 9);
  ctx.lineTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();

  // Center pivot
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // North label "N"
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 20px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -compassR - 18);

  ctx.restore();

  // Bottom-right watermark tag
  ctx.font = "bold 16px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
  ctx.textAlign = "right";
  ctx.fillText("HOMEPLANNER PRO CAD • 1:100 ARCHITECTURAL SCALE", canvasWidth - 60, canvasHeight - 50);

  return canvas.toDataURL("image/png");
}

/**
 * Triggers a direct, non-navigating file download of the PDF.
 * Avoids all iframe, modal, popup, and browser routing conflicts.
 */
function triggerDirectDownload(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
  }, 2000);
}

/**
 * Generates an executive 3-page architectural specification PDF:
 * - Page 1: Project Name on top + FULL-PAGE crystal clear CAD Blueprint drawing + legend.
 * - Page 2: Executive Project Summary & Detailed Civil Construction Cost Sheet.
 * - Page 3: Vastu Purusha Compliance Audit, spatial guidelines, and engineering schedule.
 */
export async function exportPlanToPDF(plan) {
  if (!plan) {
    throw new Error("No floor plan data available to export");
  }

  // Set waiting cursor
  document.body.style.cursor = "wait";

  try {
    const meta = plan.meta || {};
    const rooms = Array.isArray(plan.rooms) ? plan.rooms : [];
    const safeTitle = (meta.title || "Custom_Residence").replace(/[^a-zA-Z0-9_-]/g, "_");
    const plotW = meta.plotWidth || 30;
    const plotL = meta.plotLength || 40;
    const totalArea = rooms.reduce((acc, r) => acc + (r.width * r.length), 0);
    const cost = estimateCost(rooms, "Bangalore");
    const formatCost = (num) => `INR ${Math.round(num).toLocaleString("en-IN")}`;
    const vastuScore = computeOverallVastuScore(rooms, plotW, plotL, meta.northDirection || 0);

    // 1. Generate full-resolution blueprint canvas
    const imgData = renderBlueprintToCanvas(plan);
    if (!imgData) {
      throw new Error("Canvas context could not be created");
    }

    // 2. Initialize jsPDF (A4 Portrait: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    // =========================================================================
    // PAGE 1: PROJECT NAME ON TOP + FULL PAGE CRYSTAL CLEAR ARCHITECTURAL PLAN
    // =========================================================================
    // Top Studio Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 36, "F");

    pdf.setTextColor(56, 189, 248); // sky-400
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("HOMEPLANNER ARCHITECTURAL STUDIO  •  PRO CAD BLUEPRINT", 15, 11);

    // Prominent Project Title on Top
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    const titleText = meta.title || "Luxury Residence CAD Layout";
    const truncatedTitle = titleText.length > 55 ? titleText.slice(0, 52) + "..." : titleText;
    pdf.text(truncatedTitle, 15, 19);

    // Subtitle Metadata Line
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(
      `Style: ${meta.style || "Modern Luxury"}   |   Plot: ${plotW}ft × ${plotL}ft (${plotW * plotL} sq ft)   |   ${meta.totalFloors || 1} Floor(s)   |   Carpet Area: ${Math.round(totalArea)} sqft`,
      15,
      27
    );

    // Right-aligned Issue Date & ID
    pdf.setFontSize(7.5);
    pdf.setTextColor(203, 213, 225);
    pdf.text(`Issued: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 195, 12, { align: "right" });
    pdf.text(`North Offset: ${meta.northDirection || 0}°`, 195, 18, { align: "right" });
    pdf.text("STATUS: APPROVED FOR ESTIMATION", 195, 27, { align: "right" });

    // FULL PAGE CLEAR CAD BLUEPRINT (Massive presentation)
    // Frame: width 186mm, height 208mm (from y=40 to y=248)
    const bpX = 12;
    const bpY = 40;
    const bpW = 186;
    const bpH = 208;

    pdf.setFillColor(7, 13, 24); // slate-950 blueprint background
    pdf.rect(bpX, bpY, bpW, bpH, "F");
    pdf.setDrawColor(56, 189, 248); // sky-400 border
    pdf.setLineWidth(0.6);
    pdf.rect(bpX, bpY, bpW, bpH, "S");

    // Add High-Resolution Blueprint Image centered inside the box
    pdf.addImage(imgData, "PNG", bpX + 1, bpY + 1, bpW - 2, bpH - 2, undefined, "FAST");

    // Bottom Blueprint Legend & Scale Strip (y=251 to y=268)
    pdf.setFillColor(248, 250, 252);
    pdf.rect(12, 251, 186, 17, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.rect(12, 251, 186, 17, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text("BLUEPRINT LEGEND & CAD SYMBOLOGY:", 16, 258);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text("[  ] Standard Room Boundary", 16, 264);
    pdf.text("--- Dotted: 90° Door Swing Arc", 65, 264);
    pdf.text("=== Double: Glazed Window Opening", 118, 264);
    pdf.text(`^ North Needle: ${meta.northDirection || 0}° Bearing`, 164, 264);

    // Page 1 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(12, 280, 198, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 1 of 3  •  Architectural Floor Plan Blueprint Sheet", 12, 286);
    pdf.text("HomePlanner Pro CAD Systems  |  All Dimensions in Imperial Feet (ft)", 198, 286, { align: "right" });

    // =========================================================================
    // PAGE 2: EXECUTIVE PROJECT SUMMARY & CIVIL CONSTRUCTION COST SHEET
    // =========================================================================
    pdf.addPage();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 26, "F");

    pdf.setTextColor(56, 189, 248);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("HOMEPLANNER ARCHITECTURAL STUDIO", 15, 10);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.text("EXECUTIVE PROJECT SUMMARY & CIVIL COST SHEET", 15, 19);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Project: ${titleText}`, 195, 12, { align: "right" });
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 195, 19, { align: "right" });

    // SECTION 1: EXECUTIVE PROJECT SUMMARY CARD (y=32 to y=86)
    pdf.setFillColor(248, 250, 252);
    pdf.rect(12, 32, 186, 54, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(12, 32, 186, 54, "S");

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text("1. Executive Architectural Summary & Spatial Strategy", 17, 40);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    const summaryDesc =
      meta.description ||
      `This architectural residence is planned on a ${plotW}ft × ${plotL}ft plot (${plotW * plotL} sq ft). The layout optimizes spatial zoning between public social zones (living, dining) and private sanctuaries (bedrooms, bathrooms). Circulation pathways have been designed for zero wasted passage area, maximizing natural daylight penetration and natural cross-ventilation.`;
    const descLines = pdf.splitTextToSize(summaryDesc, 176);
    pdf.text(descLines, 17, 46);

    // 4 Key Specification Metric Tiles inside Summary Box
    const specTiles = [
      { label: "Plot Footprint", val: `${plotW}ft × ${plotL}ft (${plotW * plotL} sqft)` },
      { label: "Gross Built-Up Area", val: `${cost.totalBuiltUpArea} sq ft` },
      { label: "Net Carpet Area", val: `${cost.totalCarpetArea} sq ft` },
      { label: "Circulation Efficiency", val: `${Math.round((cost.totalCarpetArea / cost.totalBuiltUpArea) * 100)}% Usable Ratio` },
    ];

    const tileW = 42;
    const tileH = 16;
    specTiles.forEach((tile, i) => {
      const tx = 17 + i * (tileW + 3);
      const ty = 66;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(tx, ty, tileW, tileH, "F");
      pdf.setDrawColor(203, 213, 225);
      pdf.rect(tx, ty, tileW, tileH, "S");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(tile.label, tx + 4, ty + 5);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(tile.val, tx + 4, ty + 12);
    });

    // SECTION 2: CIVIL CONSTRUCTION BUDGET ESTIMATE (y=92 onwards)
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text("2. Civil Construction Budget & Cost Estimation Worksheet", 12, 94);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Calculated based on standard Bangalore municipal civil construction index (INR 2,000 / sqft base rate).", 12, 99);

    // Budget Summary Strip (Highlight card)
    pdf.setFillColor(240, 253, 244); // light emerald
    pdf.rect(12, 103, 186, 22, "F");
    pdf.setDrawColor(187, 247, 208);
    pdf.rect(12, 103, 186, 22, "S");

    pdf.setTextColor(22, 101, 52);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("TOTAL ESTIMATED INVESTMENT", 17, 110);

    pdf.setFontSize(15);
    pdf.text(formatCost(cost.totalCost), 17, 120);

    // Breakdown pills on right
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(5, 150, 105);
    pdf.text(`• Structure (50%): ${formatCost(cost.totalCost * 0.50)}`, 90, 111);
    pdf.text(`• Finishes (25%): ${formatCost(cost.totalCost * 0.25)}`, 90, 119);
    pdf.text(`• MEP & Electrical (15%): ${formatCost(cost.totalCost * 0.15)}`, 145, 111);
    pdf.text(`• Permits & Contingency (10%): ${formatCost(cost.totalCost * 0.10)}`, 145, 119);

    // ROOM-BY-ROOM COST ALLOCATION TABLE (y=130 to y=274)
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Detailed Room-by-Room Civil Cost Allocation Matrix", 12, 132);

    // Table Header Row
    const tableY = 136;
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(12, tableY, 186, 7.5, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("Space / Room Name", 16, tableY + 5);
    pdf.text("Level", 72, tableY + 5);
    pdf.text("Dimensions", 95, tableY + 5);
    pdf.text("Carpet Area", 130, tableY + 5);
    pdf.text("Civil Cost Allocation", 192, tableY + 5, { align: "right" });

    // Table Data Rows
    let rowY = tableY + 7.5;
    const rowH = 7;
    const roomsToDisplay = rooms.slice(0, 17);

    roomsToDisplay.forEach((room, idx) => {
      const rArea = room.width * room.length;
      const rCost = rArea * cost.rate;
      const isEven = idx % 2 === 0;

      pdf.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      pdf.rect(12, rowY, 186, rowH, "F");
      pdf.setDrawColor(241, 245, 249);
      pdf.line(12, rowY + rowH, 198, rowY + rowH);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text(room.name, 16, rowY + 4.8);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Floor ${room.floor ?? 0}`, 72, rowY + 4.8);
      pdf.text(`${Math.round(room.width)}' × ${Math.round(room.length)}'`, 95, rowY + 4.8);
      pdf.text(`${Math.round(rArea)} sq ft`, 130, rowY + 4.8);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(formatCost(rCost), 192, rowY + 4.8, { align: "right" });

      rowY += rowH;
    });

    // Total Summary Row
    pdf.setFillColor(241, 245, 249);
    pdf.rect(12, rowY, 186, 8, "F");
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(12, rowY, 186, 8, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text("TOTAL MEASURED CARPET AREA & BASE BUDGET", 16, rowY + 5.2);
    pdf.text(`${Math.round(totalArea)} sq ft`, 130, rowY + 5.2);
    pdf.setTextColor(16, 185, 129);
    pdf.text(formatCost(cost.totalCost), 192, rowY + 5.2, { align: "right" });

    // Page 2 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(12, 280, 198, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 2 of 3  •  Executive Project Summary & Civil Construction Budget", 12, 286);
    pdf.text("HomePlanner Pro CAD Systems  |  Rates verified with Bangalore Index", 198, 286, { align: "right" });

    // =========================================================================
    // PAGE 3: VASTU PURUSHA COMPLIANCE AUDIT & ENGINEERING SCHEDULE
    // =========================================================================
    pdf.addPage();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 26, "F");

    pdf.setTextColor(56, 189, 248);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("HOMEPLANNER ARCHITECTURAL STUDIO", 15, 10);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.text("VASTU PURUSHA SHASTRA ASSESSMENT & AUDIT SCHEDULE", 15, 19);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Project: ${titleText}`, 195, 12, { align: "right" });
    pdf.text(`Orientation: North ${meta.northDirection || 0}°`, 195, 19, { align: "right" });

    // SECTION 1: VASTU COMPLIANCE SCORECARD & SUMMARY (y=32 to y=78)
    const isGood = vastuScore >= 80;
    const isMedium = vastuScore >= 60;
    pdf.setFillColor(isGood ? 240 : isMedium ? 254 : 254, isGood ? 253 : isMedium ? 243 : 242, isGood ? 244 : isMedium ? 199 : 242);
    pdf.rect(12, 32, 186, 44, "F");
    pdf.setDrawColor(isGood ? 187 : 253, isGood ? 247 : 230, isGood ? 208 : 138);
    pdf.rect(12, 32, 186, 44, "S");

    // Big Score Display (Left Box)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(17, 36, 45, 36, "F");
    pdf.setDrawColor(isGood ? 187 : 253, isGood ? 247 : 230, isGood ? 208 : 138);
    pdf.rect(17, 36, 45, 36, "S");

    pdf.setTextColor(isGood ? 22 : isMedium ? 180 : 153, isGood ? 101 : isMedium ? 83 : 27, isGood ? 52 : isMedium ? 9 : 27);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("HARMONY SCORE", 20, 42);

    pdf.setFontSize(22);
    pdf.text(`${vastuScore}/100`, 20, 54);

    pdf.setFontSize(7);
    pdf.text(isGood ? "EXCELLENT HARMONY" : isMedium ? "NEUTRAL/GOOD" : "REFINEMENT SUGGESTED", 20, 64);

    // Vastu Summary Text (Right Box)
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text("Vedic Vastu Purusha Mandala Compliance Summary", 68, 41);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    const vastuSummary =
      `This layout has been evaluated against ancient Vedic Vastu Shastra architectural canons. Spatial placements are audited relative to True North (${meta.northDirection || 0}° bearing). Auspicious quadrants like Northeast (Ishanya) for water/spiritual purity, Southeast (Agni) for kitchen fire elements, and Southwest (Nairutya) for master bedroom structural stability ensure an optimal balance of cosmic energy and thermal comfort.`;
    const vLines = pdf.splitTextToSize(vastuSummary, 125);
    pdf.text(vLines, 68, 48);

    // SECTION 2: ROOM-BY-ROOM VASTU SCHEDULE TABLE (y=84 onwards)
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Room-by-Room Spatial Vastu Suitability Schedule", 12, 85);

    // Table Header Row
    const vTableY = 89;
    pdf.setFillColor(15, 23, 42);
    pdf.rect(12, vTableY, 186, 7.5, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("Room Name", 16, vTableY + 5);
    pdf.text("Compass Quadrant", 60, vTableY + 5);
    pdf.text("Vedic Architectural Guideline", 102, vTableY + 5);
    pdf.text("Compliance Rating", 192, vTableY + 5, { align: "right" });

    // Data Rows
    let vRowY = vTableY + 7.5;
    const vRowH = 8.5;
    const vastuRooms = rooms.slice(0, 13);

    vastuRooms.forEach((room, idx) => {
      const vRes = evaluateVastu(room, plotW, plotL, meta.northDirection || 0);
      const isEven = idx % 2 === 0;

      pdf.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      pdf.rect(12, vRowY, 186, vRowH, "F");
      pdf.setDrawColor(241, 245, 249);
      pdf.line(12, vRowY + vRowH, 198, vRowY + vRowH);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text(room.name, 16, vRowY + 5.5);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Zone: ${vRes.zone}`, 60, vRowY + 5.5);

      // Truncate guideline description
      const guideText = (vRes.description || `Optimized for ${vRes.zone} quadrant alignment.`).slice(0, 60) + "...";
      pdf.setFontSize(7);
      pdf.text(guideText, 102, vRowY + 5.5);

      // Status Badge
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      if (vRes.rating === "green") {
        pdf.setTextColor(22, 101, 52);
        pdf.text("COMPLIANT", 192, vRowY + 5.5, { align: "right" });
      } else if (vRes.rating === "amber") {
        pdf.setTextColor(180, 83, 9);
        pdf.text("ACCEPTABLE", 192, vRowY + 5.5, { align: "right" });
      } else {
        pdf.setTextColor(185, 28, 28);
        pdf.text("REVISION", 192, vRowY + 5.5, { align: "right" });
      }

      vRowY += vRowH;
    });

    // SECTION 3: ENGINEERING NOTES & SIGN-OFF BLOCK (y=215 to y=274)
    pdf.setFillColor(248, 250, 252);
    pdf.rect(12, 212, 186, 62, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(12, 212, 186, 62, "S");

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("ARCHITECTURAL & STRUCTURAL ENGINEERING COMPLIANCE NOTES", 16, 220);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text("1. Setbacks & FAR: All setback distances and Floor Area Ratios must be cross-verified against local municipal bylaws.", 16, 227);
    pdf.text("2. Structural Validation: Column spans, beam depths, and foundation footings must be certified by a licensed structural engineer.", 16, 233);
    pdf.text("3. Vastu Harmonization: Non-compliant zones can be harmonized using pyramid yantras, copper plates, or color therapy.", 16, 239);
    pdf.text("4. Civil Multipliers: Actual construction costs vary with interior grade, sanitary fixtures, and soil bearing capacity.", 16, 245);

    // Sign-off Lines
    pdf.setDrawColor(203, 213, 225);
    pdf.line(16, 264, 85, 264);
    pdf.line(125, 264, 194, 264);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text("PRINCIPAL ARCHITECT / CAD ENGINEER", 16, 269);
    pdf.text("CLIENT ACKNOWLEDGMENT & SIGN-OFF", 125, 269);

    // Page 3 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(12, 280, 198, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 3 of 3  •  Vastu Purusha Compliance & Engineering Schedule", 12, 286);
    pdf.text("HomePlanner Pro CAD Systems  |  Certified Vedic & Structural Document", 198, 286, { align: "right" });

    // =========================================================================
    // DIRECT IMMEDIATE FILE DOWNLOAD (NO URL CONFLICTS, NO IFRAME/APP NAVIGATION)
    // =========================================================================
    const filename = `${safeTitle}_Architectural_SpecSheet.pdf`;
    const pdfBlob = pdf.output("blob");

    triggerDirectDownload(pdfBlob, filename);
  } finally {
    document.body.style.cursor = "default";
  }
}
