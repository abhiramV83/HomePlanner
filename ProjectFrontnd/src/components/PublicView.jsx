import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { loadPublicPlan } from "../api/plans";
import FloorPlanRenderer from "./FloorPlanRenderer";
import CostPanel from "./CostPanel";
import VastuBadge from "./VastuBadge";
import { evaluateVastu, computeOverallVastuScore } from "../utils/vastu";
import { exportPlanToPDF } from "../utils/pdfExport";

export default function PublicView() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await loadPublicPlan(id);
      setPlan(data.planJson ? data : { planJson: data });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load public plan layout");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[500px]">
        <div className="w-10 h-10 border-3 border-slate-700 border-t-sky-400 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-medium">Loading shared architectural blueprint...</p>
      </div>
    );
  }

  if (error || !plan || !plan.planJson) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[500px] text-center space-y-4">
        <div className="text-red-400 font-display text-4xl font-black">404</div>
        <h2 className="text-white text-lg font-bold">Blueprint Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">{error || "This layout link is expired or invalid."}</p>
        <Link to="/" className="btn-radiant px-4 py-2 rounded-xl text-xs font-bold mt-2">
          Open Studio
        </Link>
      </div>
    );
  }

  const planData = plan.planJson;
  const vastuScore = computeOverallVastuScore(planData.rooms, planData.meta.plotWidth, planData.meta.plotLength, planData.meta.northDirection);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Shared Blueprint Banner */}
      <div className="studio-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-sky-500/15 text-sky-400 font-bold px-2.5 py-0.5 rounded-lg border border-sky-500/30 uppercase tracking-widest">
            Shared Architectural Blueprint
          </span>
          <h1 className="font-display font-extrabold text-white text-xl sm:text-2xl tracking-tight mt-1.5">
            {planData.meta.title}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">{planData.meta.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block font-bold uppercase">Style</span>
            <span className="font-bold text-slate-200">{planData.meta.style}</span>
          </div>
          <div className="text-right border-l border-white/10 pl-4">
            <span className="text-[9px] text-slate-500 block font-bold uppercase">Plot Dimensions</span>
            <span className="font-mono font-bold text-white">{planData.meta.plotWidth}ft × {planData.meta.plotLength}ft</span>
          </div>
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await exportPlanToPDF(planData);
              } catch (err) {
                alert("Failed to export PDF: " + err.message);
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="btn-radiant px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg ml-2 shrink-0 cursor-pointer"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Floorplan Layout (Large Column) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between">
          <FloorPlanRenderer plan={planData} />
        </div>

        {/* Evaluation and Estimates (Side Column) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vastu scorecard card */}
          <div className="studio-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
                Vastu Purusha Compliance
              </h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                vastuScore >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                vastuScore >= 60 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                "bg-red-500/15 text-red-400 border-red-500/30"
              }`}>
                {vastuScore}/100 Score
              </span>
            </div>

            <div className="space-y-2.5 divide-y divide-white/5 max-h-[300px] overflow-y-auto">
              {planData.rooms.map((room, idx) => {
                const res = evaluateVastu(room, planData.meta.plotWidth, planData.meta.plotLength, planData.meta.northDirection);
                return (
                  <div key={idx} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{room.name}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Zone: {res.zone} (Ideal: {res.ideal})</span>
                    </div>
                    <VastuBadge rating={res.rating} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Estimates card */}
          <CostPanel rooms={planData.rooms} />
        </div>
      </div>
    </div>
  );
}
