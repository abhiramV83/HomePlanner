import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import "./Home.css";

// Components
import FloorPlanRenderer from "../FloorPlanRenderer";
import ChatPanel from "../ChatPanel";
import CostPanel from "../CostPanel";
import VastuBadge from "../VastuBadge";
import VariantCompare from "../VariantCompare";

// Utilities & APIs
import { generatePlans, refinePlan, savePlan, loadPlan } from "../../api/plans";
import { evaluateVastu, computeOverallVastuScore } from "../../utils/vastu";
import { exportPlanToPDF } from "../../utils/pdfExport";

const stylesList = [
  { name: "Modern luxury", desc: "Sleek lines, open spaces, grand glass walls" },
  { name: "Traditional", desc: "Heritage Indian courtyards, strict Vastu alignment" },
  { name: "Minimal", desc: "Uncluttered geometric flow, maximized utility" },
  { name: "Luxury villa", desc: "Private suites, resort balconies, expansive foyer" },
];
const kitchenTypes = ["Open", "Closed"];

function BalconySvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18M5 21V12h14v9M9 12V3h6v9M3 16h18" />
    </svg>
  );
}

function PoojaSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c0 3-3 6-3 9a3 3 0 0 0 6 0c0-3-3-6-3-9zM6 19a6 6 0 0 0 12 0H6zM10 22h4" />
    </svg>
  );
}

function OfficeSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function GardenSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22v-9M12 13a5 5 0 0 1 5-5 5 5 0 0 1 5 5c0 4-5 9-10 9s-10-5-10-9a5 5 0 0 1 5-5 5 5 0 0 1 5 5z" />
    </svg>
  );
}

function TerraceSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  );
}

function LiftSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <polyline points="8 10 10 7 12 10" />
      <polyline points="12 14 14 17 16 14" />
    </svg>
  );
}

const extrasList = [
  { name: "Balcony", icon: <BalconySvg /> },
  { name: "Pooja room", icon: <PoojaSvg /> },
  { name: "Home office", icon: <OfficeSvg /> },
  { name: "Garden", icon: <GardenSvg /> },
  { name: "Terrace seating", icon: <TerraceSvg /> },
  { name: "Lift space", icon: <LiftSvg /> },
];

const loadingPhases = [
  "Analyzing plot boundaries & setback geometry...",
  "Synthesizing coordinate-aligned room partitions...",
  "Auditing Vastu Purusha orientation bearings...",
  "Assembling multi-floor CAD architectural blueprints...",
];

const showcasePresets = [
  {
    title: "Modern Duplex",
    plot: "30x40",
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: "Modern luxury",
    kitchen: "Open",
    parking: "1 car 2 bikes",
    extras: ["Balcony", "Pooja room"],
    tag: "Most Popular",
  },
  {
    title: "Executive Villa",
    plot: "40x60",
    floors: 3,
    bedrooms: 5,
    bathrooms: 4,
    style: "Luxury villa",
    kitchen: "Open",
    parking: "2 cars",
    extras: ["Balcony", "Pooja room", "Terrace seating", "Home office"],
    tag: "Luxury Spec",
  },
  {
    title: "Minimalist Urban",
    plot: "30x50",
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    style: "Minimal",
    kitchen: "Open",
    parking: "1 car",
    extras: ["Balcony", "Home office"],
    tag: "High Efficiency",
  },
  {
    title: "Heritage Manor",
    plot: "50x80",
    floors: 2,
    bedrooms: 5,
    bathrooms: 5,
    style: "Traditional",
    kitchen: "Closed",
    parking: "2 cars 2 bikes",
    extras: ["Pooja room", "Garden", "Terrace seating"],
    tag: "Vastu Masterpiece",
  },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdParam = searchParams.get("id");

  // User Session Identity
  const userId = localStorage.getItem("hp_user_id") || crypto.randomUUID();
  localStorage.setItem("hp_user_id", userId);

  // Form Inputs
  const [plot, setPlot] = useState("30x40");
  const [Nfloors, setNfloors] = useState(2);
  const [NbedRooms, setNbedRooms] = useState(4);
  const [NbathRooms, setNbathRooms] = useState(3);
  const [style, setStyle] = useState("Modern luxury");
  const [parking, setParking] = useState("1 car 2 bikes");
  const [kitchen, setKitchen] = useState("Open");
  const [extras, setExtras] = useState(["Balcony", "Pooja room"]);
  const [compareVariants, setCompareVariants] = useState(true);

  // Application Workspace State
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % loadingPhases.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const [plan, setPlan] = useState(null); // active FloorPlan object
  const [planId, setPlanId] = useState(null); // Mongo document ID
  const [variants, setVariants] = useState([]); // compared layout variants
  const [chatHistory, setChatHistory] = useState([]); // refinement logs

  const [activeTab, setActiveTab] = useState("chat"); // chat | vastu | cost
  const [hoveredRoomId, setHoveredRoomId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync loaded plan ID param on URL
  const fetchSavedPlan = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await loadPlan(id);
      setPlan(data.planJson);
      setPlanId(data._id);
      setChatHistory(data.chatHistory || []);

      if (data.planJson?.meta) {
        const meta = data.planJson.meta;
        setPlot(`${meta.plotWidth}x${meta.plotLength}`);
        setNfloors(meta.totalFloors || 1);
        setStyle(meta.style || "Modern luxury");
      }
    } catch (err) {
      console.error("Failed to load plan: ", err);
      showToast("Failed to load requested plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (planIdParam && planIdParam !== planId) {
      fetchSavedPlan(planIdParam);
    } else if (!planIdParam && planId) {
      setPlan(null);
      setPlanId(null);
      setChatHistory([]);
      setVariants([]);
    }
  }, [planIdParam, planId, fetchSavedPlan]);

  const toggleExtra = (name) => {
    setExtras((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const handleApplyPreset = (preset) => {
    setPlot(preset.plot);
    setNfloors(preset.floors);
    setNbedRooms(preset.bedrooms);
    setNbathRooms(preset.bathrooms);
    setStyle(preset.style);
    setKitchen(preset.kitchen);
    setParking(preset.parking);
    setExtras(preset.extras);
    showToast(`Loaded ${preset.title} specifications!`);
  };

  const handleSave = async (activePlan = plan, activeHistory = chatHistory) => {
    if (!activePlan) return;
    setSaving(true);
    try {
      const payload = {
        _id: planId || undefined,
        title: activePlan.meta.title || "My Dream Home Plan",
        sessionId: userId,
        planJson: activePlan,
        chatHistory: activeHistory,
      };
      const res = await savePlan(payload);
      setPlanId(res.id);
      setSearchParams({ id: res.id });
      showToast("Blueprint saved to your studio dashboard!");
    } catch (err) {
      console.error("Failed to save plan document: ", err);
      showToast("Error: " + (err.message || "Failed to save plan"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!plot.trim()) {
      alert("Please enter plot size (e.g. 30x40)");
      return;
    }

    try {
      setLoading(true);
      setPlan(null);
      setPlanId(null);
      setVariants([]);
      setChatHistory([]);

      const data = await generatePlans({
        plot,
        floors: Nfloors,
        bedrooms: NbedRooms,
        bathrooms: NbathRooms,
        style,
        kitchen,
        parking,
        extras,
        variants: compareVariants ? 3 : 1,
      });

      if (data.variants && data.variants.length > 1) {
        setVariants(data.variants);
      } else if (data.variants && data.variants.length === 1) {
        const generatedPlan = data.variants[0];
        setPlan(generatedPlan);
        await handleSave(generatedPlan, []);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating plan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariant = async (selectedVariant) => {
    setPlan(selectedVariant);
    setVariants([]);
    setChatHistory([]);
    await handleSave(selectedVariant, []);
  };

  const handleSendMessage = async (message) => {
    if (!plan) return;
    setChatLoading(true);
    const userMsg = { role: "user", content: message };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);

    try {
      const updatedPlan = await refinePlan({
        currentPlan: plan,
        userMessage: message,
        chatHistory: chatHistory,
      });

      const assistantMsg = {
        role: "assistant",
        content: `Refined layout to accommodate: "${message}". Blueprint updated.`,
      };
      const finalHistory = [...updatedHistory, assistantMsg];

      setPlan(updatedPlan);
      setChatHistory(finalHistory);
      await handleSave(updatedPlan, finalHistory);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Notice: ${err.message || "Failed to update layout. Please try again."}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!plan) return;
    setExporting(true);
    try {
      await exportPlanToPDF(plan);
      showToast("Architectural PDF spec-sheet exported!");
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Vastu scoring summary for Vastu tab
  const vastuReport = useMemo(() => {
    if (!plan) return null;
    const score = computeOverallVastuScore(
      plan.rooms,
      plan.meta.plotWidth,
      plan.meta.plotLength,
      plan.meta.northDirection
    );
    const roomEvaluations = plan.rooms.map((room) => ({
      name: room.name,
      floor: room.floor,
      ...evaluateVastu(
        room,
        plan.meta.plotWidth,
        plan.meta.plotLength,
        plan.meta.northDirection
      ),
    }));
    return { score, roomEvaluations };
  }, [plan]);

  return (
    <div className="hp-studio min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border border-sky-500/40 animate-fadeIn flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Loading Screen */}
        {loading && (
          <div className="studio-card p-10 sm:p-14 flex flex-col items-center justify-center min-h-[520px] text-center space-y-8 animate-fadeIn">
            {/* Animated CAD Scanner Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-sky-400 border-r-sky-500 animate-spin" />
              <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-sky-400/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "6s" }} />
              <div className="absolute inset-0 flex items-center justify-center text-sky-400 font-mono font-extrabold text-sm tracking-widest">
                CAD
              </div>
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                Phase {loadingPhase + 1} of 4 · Synthesis in Progress
              </div>

              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Architectural Inference Engine
              </h2>

              <p className="text-slate-200 text-sm font-medium transition-all duration-300 min-h-[44px] leading-relaxed">
                {loadingPhases[loadingPhase]}
              </p>

              {/* 4-Phase Progress Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                {loadingPhases.map((phase, idx) => {
                  const isDone = idx < loadingPhase;
                  const isCurrent = idx === loadingPhase;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : isCurrent
                          ? "bg-sky-500/15 border-sky-500/40 text-sky-300 ring-1 ring-sky-400/30"
                          : "bg-slate-900/40 border-white/5 text-slate-500"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isDone ? "bg-emerald-500 text-slate-950" : isCurrent ? "bg-sky-400 text-slate-950 animate-pulse" : "bg-slate-800 text-slate-400"
                      }`}>
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span className="truncate">{phase.replace("...", "")}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 pt-2 font-mono">
                Generating coordinate-bounded layouts via Groq Qwen &amp; Gemini Fallback
              </p>
            </div>
          </div>
        )}

        {/* 3 Layout Variants Comparison */}
        {!loading && variants.length > 0 && (
          <VariantCompare variants={variants} onSelectVariant={handleSelectVariant} />
        )}

        {/* Active CAD Studio Workspace */}
        {!loading && variants.length === 0 && plan && (
          <div className="space-y-6">
            {/* Studio HUD Control Bar (44px touch targets) */}
            <div className="studio-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchParams({});
                    setPlan(null);
                    setPlanId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/15 transition-all flex items-center gap-2 min-h-[44px]"
                  aria-label="Create New Project"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  <span>New Project</span>
                </button>
                <div>
                  <h2 className="font-display font-extrabold text-white text-base sm:text-lg truncate max-w-[240px] md:max-w-[480px]">
                    {plan.meta.title}
                  </h2>
                  <p className="text-xs text-sky-400 font-bold uppercase tracking-wider mt-0.5">
                    {plan.meta.style} • {plan.meta.plotWidth}&apos;×{plan.meta.plotLength}&apos; Plot • {plan.meta.totalFloors} Floor{plan.meta.totalFloors > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="btn-radiant px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[44px] shadow-md"
                  aria-label="Save Blueprint to Dashboard"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  )}
                  <span>Save Blueprint</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all shadow-md flex items-center gap-2 min-h-[44px]"
                  aria-label="Export Blueprint to PDF"
                >
                  {exporting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  )}
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Floor Plan Renderer (7 Cols) */}
              <div className="lg:col-span-7">
                <FloorPlanRenderer
                  plan={plan}
                  activeRoomId={hoveredRoomId}
                  onRoomHover={setHoveredRoomId}
                />
              </div>

              {/* Intelligence Drawer (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Tab Navigation */}
                <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "chat" ? "tab-pill--active" : "tab-pill--inactive"
                    }`}
                  >
                    AI Refine
                  </button>
                  <button
                    onClick={() => setActiveTab("vastu")}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "vastu" ? "tab-pill--active" : "tab-pill--inactive"
                    }`}
                  >
                    Vastu Audit
                  </button>
                  <button
                    onClick={() => setActiveTab("cost")}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "cost" ? "tab-pill--active" : "tab-pill--inactive"
                    }`}
                  >
                    Cost Sheet
                  </button>
                </div>

                {/* Tab Panels */}
                {activeTab === "chat" && (
                  <ChatPanel
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    loading={chatLoading}
                  />
                )}

                {activeTab === "vastu" && vastuReport && (
                  <div className="studio-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                          Vastu Purusha Compliance
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Centroid bearing relative to North ({plan.meta.northDirection}°)
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        vastuReport.score >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                        vastuReport.score >= 60 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                        "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {vastuReport.score}/100 Score
                      </span>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto space-y-2">
                      {vastuReport.roomEvaluations.map((room, idx) => (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredRoomId(`${room.floor}-${room.name}-${idx}`)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                          className={`flex items-start justify-between py-2.5 px-2 rounded-xl cursor-pointer transition-all ${
                            hoveredRoomId === `${room.floor}-${room.name}-${idx}` ? "bg-sky-500/15 border border-sky-500/30" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="max-w-[70%]">
                            <span className="text-xs font-bold text-slate-200">{room.name}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Zone: {room.zone} • {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor + 1}`}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{room.evaluation}</p>
                          </div>
                          <VastuBadge rating={room.rating} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "cost" && (
                  <CostPanel rooms={plan.rooms} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero & Configurator (Empty Workspace) */}
        {!loading && variants.length === 0 && !plan && (
          <div className="space-y-10">
            {/* Architectural Hero Banner */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                AI CAD Architect &amp; Vastu Studio
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
                Design Luxury Floor Plans with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">AI Precision</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Generate coordinate-aligned 2D CAD architectural blueprints, automated Vastu compliance scores, and localized civil construction budgets in seconds.
              </p>

              {/* Showcase Presets Grid */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Or start from a curated architectural blueprint:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
                  {showcasePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="studio-card p-4 text-left hover:border-sky-400/50 hover:bg-sky-500/10 transition-all group min-h-[96px] flex flex-col justify-between"
                      aria-label={`Load preset ${preset.title}`}
                    >
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider block w-fit mb-1.5">
                        {preset.tag}
                      </span>
                      <div>
                        <p className="font-display font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                          {preset.title}
                        </p>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {preset.plot} ft · {preset.bedrooms} BHK · {preset.style}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Studio Parameter Configurator Panel */}
            <div className="studio-card max-w-3xl mx-auto p-6 sm:p-8">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h2 className="font-display font-extrabold text-xl text-white">
                  Project Architectural Parameters
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify plot boundaries and lifestyle configuration to generate your CAD blueprint
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Plot Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Plot Dimensions (Width × Length in ft)
                    </label>
                    <div className="flex gap-2">
                      {["30x40", "30x50", "40x60", "50x80"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlot(p)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-mono font-bold transition-all min-h-[38px] flex items-center justify-center ${
                            plot === p
                              ? "bg-sky-500 text-white border-sky-400 shadow-md"
                              : "bg-slate-900/70 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white"
                          }`}
                          aria-label={`Select plot size ${p}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={plot}
                    onChange={(e) => setPlot(e.target.value)}
                    placeholder="e.g. 30x40, 40x60, 50x80"
                    className="studio-input font-mono"
                  />
                </div>

                {/* Floors, BHK, Baths Steppers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Floors */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Total Floors</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setNfloors((prev) => Math.max(1, prev - 1))}
                        disabled={Nfloors <= 1}
                        className="stepper-btn"
                      >
                        −
                      </button>
                      <span className="font-display font-extrabold text-base text-white">
                        {Nfloors} Floor{Nfloors > 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNfloors((prev) => Math.min(3, prev + 1))}
                        disabled={Nfloors >= 3}
                        className="stepper-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Bedrooms (BHK)</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setNbedRooms((prev) => Math.max(1, prev - 1))}
                        disabled={NbedRooms <= 1}
                        className="stepper-btn"
                      >
                        −
                      </button>
                      <span className="font-display font-extrabold text-base text-white">
                        {NbedRooms} BHK
                      </span>
                      <button
                        type="button"
                        onClick={() => setNbedRooms((prev) => Math.min(5, prev + 1))}
                        disabled={NbedRooms >= 5}
                        className="stepper-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Bathrooms</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setNbathRooms((prev) => Math.max(1, prev - 1))}
                        disabled={NbathRooms <= 1}
                        className="stepper-btn"
                      >
                        −
                      </button>
                      <span className="font-display font-extrabold text-base text-white">
                        {NbathRooms} Bath{NbathRooms > 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNbathRooms((prev) => Math.min(5, prev + 1))}
                        disabled={NbathRooms >= 5}
                        className="stepper-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Architectural Style Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Architectural Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stylesList.map((st) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => setStyle(st.name)}
                        className={`p-3.5 rounded-xl border text-left transition-all min-h-[86px] flex flex-col justify-between ${
                          style === st.name
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md ring-1 ring-sky-400"
                            : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-slate-500 hover:text-white"
                        }`}
                        aria-pressed={style === st.name}
                      >
                        <p className="font-bold text-sm text-white">{st.name}</p>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{st.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kitchen & Parking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      Kitchen Concept
                    </label>
                    <select
                      value={kitchen}
                      onChange={(e) => setKitchen(e.target.value)}
                      className="studio-select"
                    >
                      {kitchenTypes.map((k) => (
                        <option key={k} value={k}>
                          {k} Kitchen
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      Parking Configuration
                    </label>
                    <input
                      type="text"
                      value={parking}
                      onChange={(e) => setParking(e.target.value)}
                      placeholder="e.g. 1 car 2 bikes"
                      className="studio-input"
                    />
                  </div>
                </div>

                {/* Extras & Lifestyle Preferences */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Lifestyle Features &amp; Vastu Zones
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {extrasList.map((x) => (
                      <button
                        type="button"
                        key={x.name}
                        onClick={() => toggleExtra(x.name)}
                        className={`studio-chip flex items-center gap-1.5 ${
                          extras.includes(x.name) ? "studio-chip--active" : ""
                        }`}
                      >
                        <span>{x.icon}</span>
                        <span>{x.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison Checkbox */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <input
                    type="checkbox"
                    id="compareVariants"
                    checked={compareVariants}
                    onChange={(e) => setCompareVariants(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-sky-600 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="compareVariants" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                    Generate 3 distinctly themed variations (Options A, B, C) for side-by-side architectural review
                  </label>
                </div>

                {/* Radiant Action Button (52px Touch Target) */}
                <button
                  type="submit"
                  className="btn-radiant w-full py-4 rounded-xl text-base font-extrabold flex items-center justify-center gap-2.5 cursor-pointer shadow-xl min-h-[52px]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>Generate Architectural CAD Blueprint</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
