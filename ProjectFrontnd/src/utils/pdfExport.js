import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { estimateCost } from "./costEstimate";
import { computeOverallVastuScore } from "./vastu";

/**
 * Generates a clean PDF report of the active floor plan, Vastu review, and cost sheets.
 */
export async function exportPlanToPDF(plan, elementId = "floorplan-svg") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("SVG elements could not be found");
  }

  // Show a status indicator or cursor change
  document.body.style.cursor = "wait";

  try {
    // Capture the SVG rendering as an image
    const canvas = await html2canvas(element, {
      scale: 3, // High-DPI capture
      backgroundColor: "#020617", // Force modern slate background matching the UI
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        // Ensure standard dark theme visibility inside cloned elements
        const clonedSvg = clonedDoc.getElementById(elementId);
        if (clonedSvg) {
          clonedSvg.style.width = "600px";
          clonedSvg.style.height = "auto";
        }
      },
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Create A4 PDF (Portrait: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    // 1. PAGE 1: TITLE & FLOORPLAN SHEET
    // Top Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 35, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("HOMEPLANNER ARCHITECTS", 15, 18);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text("PREMIUM CAD SPECIFICATION SHEET", 15, 26);

    // Document Meta (Right aligned)
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Issued: ${new Date().toLocaleDateString()}`, 195, 15, { align: "right" });
    pdf.text(`Style: ${plan.meta.style}`, 195, 21, { align: "right" });
    pdf.text(`Plot Size: ${plan.meta.plotWidth}ft × ${plan.meta.plotLength}ft`, 195, 27, { align: "right" });

    // Design Details Card
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(15, 45, 180, 25, "F");
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.rect(15, 45, 180, 25, "S");

    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(plan.meta.title || "Luxury Residence Layout", 20, 52);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105); // slate-600
    const descLines = pdf.splitTextToSize(
      plan.meta.description || "Automated architectural blueprint designed for optimal spatial efficiency, natural ventilation, and structural load balance.",
      170
    );
    pdf.text(descLines, 20, 58);

    // Floor Plan Image
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Draw SVG floorplan inside a nice frame
    pdf.setFillColor(2, 6, 23); // slate-950
    pdf.rect(15, 78, imgWidth, 140, "F");
    
    // Fit the image centered inside the box
    const fitHeight = Math.min(imgHeight, 130);
    const fitWidth = (canvas.width * fitHeight) / canvas.height;
    const offsetX = 15 + (imgWidth - fitWidth) / 2;
    const offsetY = 78 + (140 - fitHeight) / 2;
    
    pdf.addImage(imgData, "PNG", offsetX, offsetY, fitWidth, fitHeight);

    // Page Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, 280, 195, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 1 of 2  |  Generated using HomePlanner CAD API", 15, 285);
    pdf.text("This document is a design estimate. Check local municipal codes before starting construction.", 195, 285, { align: "right" });

    // 2. PAGE 2: DETAILS, ESTIMATIONS, AND VASTU REVIEW
    pdf.addPage();

    // Header
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("PROJECT ESTIMATE & VASTU ASSESSMENT SUMMARY", 15, 13);

    // Cost Estimations Column (Left side)
    const cost = estimateCost(plan.rooms, "Bangalore");
    const formatCost = (num) => `INR ${num.toLocaleString()}`;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("1. Construction Budget Estimate", 15, 35);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Computed using standard regional construction multipliers (Bangalore base).", 15, 40);

    // Stats Grid
    pdf.setFillColor(248, 250, 252);
    pdf.rect(15, 45, 85, 35, "F");
    pdf.rect(15, 45, 85, 35, "S");

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Budget Summary", 20, 52);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Gross Built-up Area: ${cost.totalBuiltUpArea} sq ft`, 20, 59);
    pdf.text(`Carpet Area: ${cost.totalCarpetArea} sq ft`, 20, 65);
    
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(16, 185, 129); // emerald-500
    pdf.text(`Estimated Budget: ${formatCost(cost.totalCost)}`, 20, 72);

    // Cost breakdown list
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Room Budget Breakdown", 15, 92);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    let costY = 99;
    
    // Print top rooms cost
    plan.rooms.slice(0, 10).forEach((room) => {
      const roomArea = room.width * room.length;
      const roomCost = roomArea * cost.rate;
      
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${room.name} (Floor ${room.floor})`, 15, costY);
      pdf.text(`${Math.round(roomArea)} sqft`, 65, costY);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${formatCost(roomCost)}`, 100, costY, { align: "right" });
      costY += 6.5;
    });

    // Vastu Assessment Column (Right side)
    const vastuScore = computeOverallVastuScore(plan.rooms, plan.meta.plotWidth, plan.meta.plotLength, plan.meta.northDirection);
    
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("2. Vastu Purusha Assessment", 115, 35);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Compass north offset: ${plan.meta.northDirection}°`, 115, 40);

    // Vastu Score Badge
    pdf.setFillColor(240, 253, 244); // light green
    pdf.rect(115, 45, 80, 35, "F");
    pdf.setDrawColor(187, 247, 208);
    pdf.rect(115, 45, 80, 35, "S");

    pdf.setTextColor(22, 101, 52); // green-800
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Vastu Scorecard", 120, 52);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(`${vastuScore}/100`, 120, 64);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(21, 128, 61);
    pdf.text(vastuScore >= 80 ? "EXCELLENT HARMONY" : vastuScore >= 60 ? "NEUTRAL/GOOD ALIGNMENT" : "REFINEMENT SUGGESTED", 120, 72);

    // Room Vastu status list
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Spatial Vastu Suitability", 115, 92);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    let vastuY = 99;
    
    // Import helper evaluateVastu in memory and calculate manually
    const getZoneName = (bearing) => {
      if (bearing >= 337.5 || bearing < 22.5) return "North (N)";
      if (bearing >= 22.5 && bearing < 67.5) return "Northeast (NE)";
      if (bearing >= 67.5 && bearing < 112.5) return "East (E)";
      if (bearing >= 112.5 && bearing < 157.5) return "Southeast (SE)";
      if (bearing >= 157.5 && bearing < 202.5) return "South (S)";
      if (bearing >= 202.5 && bearing < 247.5) return "Southwest (SW)";
      if (bearing >= 247.5 && bearing < 292.5) return "West (W)";
      return "Northwest (NW)";
    };

    plan.rooms.slice(0, 10).forEach((room) => {
      const rx = room.x + room.width / 2;
      const ry = room.y + room.length / 2;
      const dx = rx - (plan.meta.plotWidth / 2);
      const dy = (plan.meta.plotLength / 2) - ry;
      const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
      const bearing = (90 - angleDeg + 360) % 360;
      const adjustedBearing = (bearing + plan.meta.northDirection + 360) % 360;
      const zoneStr = getZoneName(adjustedBearing);
      
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${room.name}`, 115, vastuY);
      pdf.text(zoneStr, 158, vastuY);
      vastuY += 6.5;
    });

    // Page 2 Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, 280, 195, 280);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Page 2 of 2  |  Generated using HomePlanner CAD API", 15, 285);
    
    // Save report
    const filename = `${plan.meta.title.replace(/\s+/g, "_") || "floorplan"}_cad_sheet.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation failed: ", err);
    alert("Could not export PDF. Please check canvas rendering.");
  } finally {
    document.body.style.cursor = "default";
  }
}
