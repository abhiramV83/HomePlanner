import { jsPDF } from "jspdf";
import { estimateCost } from "./costEstimate";
import { computeOverallVastuScore, evaluateVastu } from "./vastu";

/**
 * Direct High-DPI Canvas Blueprint Renderer.
 * Deterministically rasterizes the floorplan into an architectural blueprint canvas.
 * Zero DOM dependencies, zero CSS parsing bugs, zero network calls, 100% reliable.
 */
function renderBlueprintToCanvas(plan) {
  const meta = plan?.meta || {};
  const rooms = Array.isArray(plan?.rooms) ? plan.rooms : [];
  const openings = Array.isArray(plan?.openings) ? plan.openings : [];

  const plotW = meta.plotWidth || 30;
  const plotL = meta.plotLength || 40;
  const northAngle = meta.northDirection || 0;

  // Ultra crisp canvas dimensions for 300 DPI A4 print
  const canvasWidth = 2400;
  const canvasHeight = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Blueprint navy background
  ctx.fillStyle = "#070d18";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Layout boundaries with generous margin for dimensions
  const padX = 180;
  const padY = 160;
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
  ctx.lineWidth = 8;
  ctx.strokeRect(originX - 8, originY - 8, drawW + 16, drawH + 16);

  ctx.fillStyle = "#0b1528";
  ctx.fillRect(originX, originY, drawW, drawH);

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3.5;
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
    ctx.lineWidth = 2.8;
    ctx.strokeRect(rx, ry, rw, rh);

    // Corner accent dots
    ctx.fillStyle = "#38bdf8";
    const dot = 3;
    ctx.fillRect(rx - dot / 2, ry - dot / 2, dot, dot);
    ctx.fillRect(rx + rw - dot / 2, ry - dot / 2, dot, dot);
    ctx.fillRect(rx - dot / 2, ry + rh - dot / 2, dot, dot);
    ctx.fillRect(rx + rw - dot / 2, ry + rh - dot / 2, dot, dot);

    // Room text
    const cx = rx + rw / 2;
    const cy = ry + rh / 2;
    const isSmall = rw < 130 || rh < 90;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Room Name
    ctx.font = isSmall ? "bold 18px 'Segoe UI', sans-serif" : "bold 24px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    const nameY = isSmall ? cy - 10 : cy - 20;
    ctx.fillText(room.name, cx, nameY);

    // Room Dimensions
    if (!isSmall) {
      ctx.font = "600 18px 'Courier New', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${Math.round(room.width)}' × ${Math.round(room.length)}'`, cx, cy + 8);

      // Area tag
      ctx.font = "bold 16px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`${Math.round(room.width * room.length)} sq ft`, cx, cy + 34);
    } else {
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`${Math.round(room.width * room.length)} sqft`, cx, cy + 14);
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
      ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      if (isH) {
        ctx.fillRect(ox, oy - 5, ow, 10);
        ctx.strokeRect(ox, oy - 5, ow, 10);
      } else {
        ctx.fillRect(ox - 5, oy, 10, ow);
        ctx.strokeRect(ox - 5, oy, 10, ow);
      }
    } else {
      // Clear doorway gap
      ctx.strokeStyle = "#0b1528";
      ctx.lineWidth = 6;
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
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
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
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = "#7dd3fc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const dimY = originY + drawH + 42;
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, dimY);
  ctx.lineTo(originX + drawW, dimY);
  ctx.moveTo(originX, dimY - 12);
  ctx.lineTo(originX, dimY + 12);
  ctx.moveTo(originX + drawW, dimY - 12);
  ctx.lineTo(originX + drawW, dimY + 12);
  ctx.stroke();
  ctx.fillText(`${plotW} FT WIDTH`, originX + drawW / 2, dimY + 28);

  // Dimension lines: Left length
  const dimX = originX - 42;
  ctx.beginPath();
  ctx.moveTo(dimX, originY);
  ctx.lineTo(dimX, originY + drawH);
  ctx.moveTo(dimX - 12, originY);
  ctx.lineTo(dimX + 12, originY);
  ctx.moveTo(dimX - 12, originY + drawH);
  ctx.lineTo(dimX + 12, originY + drawH);
  ctx.stroke();

  ctx.save();
  ctx.translate(dimX - 28, originY + drawH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${plotL} FT LENGTH`, 0, 0);
  ctx.restore();

  // Architectural North Compass Rose
  const compassX = canvasWidth - 110;
  const compassY = 100;
  const compassR = 45;

  ctx.save();
  ctx.translate(compassX, compassY);

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(0, 0, compassR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Rotate according to North Direction
  ctx.rotate((northAngle * Math.PI) / 180);

  // North needle (cyan)
  ctx.fillStyle = "#0284c7";
  ctx.beginPath();
  ctx.moveTo(0, -compassR + 8);
  ctx.lineTo(-9, 0);
  ctx.lineTo(9, 0);
  ctx.closePath();
  ctx.fill();

  // South needle (slate)
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(0, compassR - 8);
  ctx.lineTo(-9, 0);
  ctx.lineTo(9, 0);
  ctx.closePath();
  ctx.fill();

  // Center pivot
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  // North label
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 18px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -compassR - 15);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Triggers a direct file download of the PDF.
 * Never modifies page URL, never redirects, never shows in iframe/application.
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
 * Generates and downloads a complete 2-page architectural spec-sheet PDF:
 * - Page 1: CAD Blueprint layout, dimension schedules, project metadata.
 * - Page 2: Civil construction budget estimate and Vastu Purusha audit.
 */
export async function exportPlanToPDF(plan) {
  if (!plan) {
    throw new Error("No floor plan data available to export");
  }

  // Show waiting cursor while compiling
  document.body.style.cursor = "wait";

  try {
    const meta = plan.meta || {};
    const rooms = Array.isArray(plan.rooms) ? plan.rooms : [];

    // 1. Generate high-DPI raster blueprint image
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

    // -------------------------------------------------------------------------
    // PAGE 1: ARCHITECTURAL COVER & CAD BLUEPRINT SPECIFICATION SHEET
    // -------------------------------------------------------------------------
    // Top Studio Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 36, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("HOMEPLANNER PRO CAD", 15, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text("ARCHITECTURAL BLUEPRINT SPECIFICATION SHEET", 15, 26);

    // Document Meta (Right aligned)
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.text(`Issued: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 195, 14, { align: "right" });
    pdf.text(`Style: ${meta.style || "Modern Luxury"}`, 195, 20, { align: "right" });
    pdf.text(`Plot Size: ${meta.plotWidth || 30}ft × ${meta.plotLength || 40}ft (${(meta.plotWidth || 30) * (meta.plotLength || 40)} sq ft)`, 195, 26, { align: "right" });
    pdf.text(`Stories: ${meta.totalFloors || 1} Floor${(meta.totalFloors || 1) > 1 ? "s" : ""}`, 195, 32, { align: "right" });

    // Design Details Card
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(15, 42, 180, 24, "F");
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.rect(15, 42, 180, 24, "S");

    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(meta.title || "Custom Residence CAD Layout", 20, 50);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105); // slate-600
    const desc = meta.description || "Precision algorithmic floor plan optimized for structural integrity, natural ventilation, and spatial utility.";
    const descLines = pdf.splitTextToSize(desc, 170);
    pdf.text(descLines, 20, 56);

    // Floor Plan Blueprint Box
    const frameW = 180;
    const frameH = 138;
    const frameX = 15;
    const frameY = 72;

    pdf.setFillColor(7, 13, 24); // slate-950 blueprint
    pdf.rect(frameX, frameY, frameW, frameH, "F");
    pdf.setDrawColor(56, 189, 248); // sky-400
    pdf.rect(frameX, frameY, frameW, frameH, "S");

    // Embed rendered CAD blueprint image
    pdf.addImage(imgData, "PNG", frameX + 1, frameY + 1, frameW - 2, frameH - 2, undefined, "FAST");

    // Blueprint Legend Bar
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(15, 216, 180, 14, "F");
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(15, 216, 180, 14, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text("CAD LEGEND:", 20, 225);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text("[  ] Standard Room", 50, 225);
    pdf.text("--- Door Swing", 90, 225);
    pdf.text("=== Glass Window", 130, 225);
    pdf.text(`^ North (${meta.northDirection || 0}°)`, 172, 225);

    // Key Spatial Metrics Row (3 cards)
    const totalArea = rooms.reduce((acc, r) => acc + (r.width * r.length), 0);
    const metrics = [
      { label: "Total Rooms", value: `${rooms.length} Spaces` },
      { label: "Net Carpet Area", value: `${Math.round(totalArea)} sq ft` },
      { label: "Gross Built-up", value: `${Math.round(totalArea * 1.18)} sq ft` },
    ];

    const cardW = 56;
    const cardGap = 6;
    metrics.forEach((m, idx) => {
      const cx = 15 + idx * (cardW + cardGap);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(cx, 236, cardW, 20, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(cx, 236, cardW, 20, "S");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(m.label, cx + 5, 243);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(m.value, cx + 5, 251);
    });

    // Page 1 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, 280, 195, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 1 of 2  |  Generated using HomePlanner CAD API", 15, 286);
    pdf.text("Architectural Specification Sheet  |  Imperial Foot Standards", 195, 286, { align: "right" });

    // -------------------------------------------------------------------------
    // PAGE 2: CIVIL ESTIMATE & VASTU PURUSHA ASSESSMENT
    // -------------------------------------------------------------------------
    pdf.addPage();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 22, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("PROJECT ESTIMATE & VASTU ASSESSMENT SCHEDULE", 15, 14);

    // 1. Cost Estimations Column (Left side, x=15 to x=100)
    const cost = estimateCost(rooms, "Bangalore");
    const formatCost = (num) => `INR ${Math.round(num).toLocaleString("en-IN")}`;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text("1. Construction Budget Estimate", 15, 34);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Standard civil construction index (INR 2,000/sqft base).", 15, 39);

    // Summary Card
    pdf.setFillColor(248, 250, 252);
    pdf.rect(15, 44, 85, 34, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(15, 44, 85, 34, "S");

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Budget Summary", 20, 51);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Gross Built-up: ${cost.totalBuiltUpArea} sq ft`, 20, 58);
    pdf.text(`Carpet Area: ${cost.totalCarpetArea} sq ft`, 20, 64);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(16, 185, 129); // emerald-500
    pdf.text(`Est. Budget: ${formatCost(cost.totalCost)}`, 20, 72);

    // Room budget breakdown list
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Room Budget Breakdown", 15, 88);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    let costY = 96;

    rooms.slice(0, 14).forEach((room) => {
      const roomArea = room.width * room.length;
      const roomCost = roomArea * cost.rate;

      pdf.setTextColor(71, 85, 105);
      pdf.text(`${room.name} (F${room.floor ?? 0})`, 15, costY);
      pdf.text(`${Math.round(roomArea)} sqft`, 62, costY);
      pdf.setTextColor(15, 23, 42);
      pdf.text(formatCost(roomCost), 100, costY, { align: "right" });
      costY += 6.5;
    });

    // 2. Vastu Assessment Column (Right side, x=115 to x=195)
    const vastuScore = computeOverallVastuScore(
      rooms,
      meta.plotWidth || 30,
      meta.plotLength || 40,
      meta.northDirection || 0
    );

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text("2. Vastu Purusha Compliance", 115, 34);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Compass North Offset: ${meta.northDirection || 0}°`, 115, 39);

    // Vastu Score Badge
    const isGood = vastuScore >= 80;
    const isMedium = vastuScore >= 60;
    pdf.setFillColor(isGood ? 240 : isMedium ? 254 : 254, isGood ? 253 : isMedium ? 243 : 242, isGood ? 244 : isMedium ? 199 : 242);
    pdf.rect(115, 44, 80, 34, "F");
    pdf.setDrawColor(isGood ? 187 : 253, isGood ? 247 : 230, isGood ? 208 : 138);
    pdf.rect(115, 44, 80, 34, "S");

    pdf.setTextColor(isGood ? 22 : isMedium ? 180 : 153, isGood ? 101 : isMedium ? 83 : 27, isGood ? 52 : isMedium ? 9 : 27);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Vastu Scorecard", 120, 51);

    pdf.setFontSize(18);
    pdf.text(`${vastuScore}/100`, 120, 63);

    pdf.setFontSize(7.5);
    pdf.text(isGood ? "EXCELLENT HARMONY" : isMedium ? "NEUTRAL ALIGNMENT" : "REVISION SUGGESTED", 120, 71);

    // Room Vastu status list
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Spatial Vastu Suitability", 115, 88);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    let vastuY = 96;

    rooms.slice(0, 14).forEach((room) => {
      const vResult = evaluateVastu(
        room,
        meta.plotWidth || 30,
        meta.plotLength || 40,
        meta.northDirection || 0
      );

      pdf.setTextColor(71, 85, 105);
      pdf.text(room.name, 115, vastuY);
      pdf.text(`Zone: ${vResult.zone}`, 155, vastuY);

      if (vResult.rating === "green") {
        pdf.setTextColor(22, 101, 52);
        pdf.text("Compliant", 195, vastuY, { align: "right" });
      } else if (vResult.rating === "amber") {
        pdf.setTextColor(180, 83, 9);
        pdf.text("Acceptable", 195, vastuY, { align: "right" });
      } else {
        pdf.setTextColor(185, 28, 28);
        pdf.text("Review", 195, vastuY, { align: "right" });
      }

      vastuY += 6.5;
    });

    // Page 2 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, 280, 195, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 2 of 2  |  Generated using HomePlanner CAD API", 15, 286);
    pdf.text("Architectural estimate only. Verify local municipal zoning before construction.", 195, 286, { align: "right" });

    // -------------------------------------------------------------------------
    // DIRECT FILE DOWNLOAD (NO URL CONFLICTS, NO IFRAME, NO APP ROUTING)
    // -------------------------------------------------------------------------
    const safeTitle = (meta.title || "HomePlan").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeTitle}_CAD_Blueprint.pdf`;
    const pdfBlob = pdf.output("blob");

    triggerDirectDownload(pdfBlob, filename);
  } finally {
    document.body.style.cursor = "default";
  }
}
