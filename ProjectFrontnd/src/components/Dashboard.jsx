import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listPlans, deletePlan } from "../api/plans";

export default function Dashboard({ onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState(null);
  const sessionId = localStorage.getItem("hp_user_id");
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await listPlans(sessionId);
      setPlans(data);
    } catch (err) {
      console.error("Failed to load plans: ", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpen = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      navigate(`/?id=${plan._id}`);
    }
  };

  const copyShareLink = (planId) => {
    const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const shareUrl = `${window.location.origin}${basePath}/plan/${planId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopyStatus(planId);
        setTimeout(() => setCopyStatus(null), 2500);
      })
      .catch(() => alert("Failed to copy link."));
  };

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) return;
    try {
      await deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p._id !== planId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-white text-2xl sm:text-3xl tracking-tight">
              Studio Project Archive
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-400 text-xs font-mono font-bold border border-sky-500/30">
              {plans.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage, review, and share your generated architectural blueprints
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="btn-radiant px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Blueprint
        </button>
      </div>

      {loading ? (
        <div className="studio-card flex flex-col items-center justify-center p-16 h-80 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Retrieving saved blueprint collection...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="studio-card flex flex-col items-center justify-center p-16 h-96 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-display font-bold text-base text-white">No Saved Projects Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Configure and generate a luxury floor plan in the Studio, then click &quot;Save Blueprint&quot; to archive it here!
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="btn-radiant px-5 py-2.5 rounded-xl text-xs font-bold mt-2"
          >
            Launch Studio Generator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="studio-card p-5 flex flex-col justify-between space-y-4 group hover:border-sky-400/50 hover:shadow-2xl transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-sky-500/15 text-sky-400 rounded-md border border-sky-500/30 uppercase tracking-wider">
                    {plan.planJson?.meta?.style || "Architectural"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(plan.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base truncate group-hover:text-sky-400 transition-colors">
                    {plan.title || plan.planJson?.meta?.title || "Home Plan"}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {plan.planJson?.meta?.description || "Architectural floor plan layout."}
                  </p>
                </div>

                {/* Technical CAD Specs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-white/5 p-3 rounded-xl text-center text-xs">
                  <div>
                    <span className="block text-xs text-slate-400 uppercase font-semibold">Plot</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {plan.planJson?.meta?.plotWidth}×{plan.planJson?.meta?.plotLength}&apos;
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 uppercase font-semibold">Floors</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {plan.planJson?.meta?.totalFloors}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 uppercase font-semibold">Rooms</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {plan.planJson?.rooms?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (44px Touch Targets) */}
              <div className="flex items-center gap-2 border-t border-white/10 pt-4">
                <button
                  onClick={() => handleOpen(plan)}
                  className="flex-1 btn-radiant text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Open plan in studio"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span>Open in Studio</span>
                </button>

                <button
                  onClick={() => copyShareLink(plan._id)}
                  title="Copy Public Share Link"
                  aria-label="Copy Public Share Link"
                  className="w-11 h-11 rounded-xl bg-slate-900 border border-white/15 hover:border-sky-400/50 hover:bg-sky-500/10 text-slate-200 hover:text-sky-300 transition-all flex items-center justify-center shrink-0 min-w-[44px]"
                >
                  {copyStatus === plan._id ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(plan._id)}
                  title="Delete Blueprint"
                  aria-label="Delete Blueprint"
                  className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-400 transition-all flex items-center justify-center shrink-0 min-w-[44px]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
