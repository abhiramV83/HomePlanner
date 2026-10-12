import { useState } from "react";
import FloorPlanRenderer from "./FloorPlanRenderer";
import { estimateCost } from "../utils/costEstimate";

export default function VariantCompare({ variants = [], onSelectVariant }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!variants || variants.length === 0) {
    return null;
  }

  const getVariantStats = (plan) => {
    const totalArea = plan.rooms.reduce((acc, r) => acc + r.width * r.length, 0);
    const cost = estimateCost(plan.rooms, "Bangalore").totalCost;
    return {
      area: Math.round(totalArea * 1.18),
      cost: cost,
      roomsCount: plan.rooms.length,
    };
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const optionLabels = ["Option A", "Option B", "Option C"];

  return (
    <div className="studio-card p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
        <div>
          <h2 className="font-display font-extrabold text-white text-lg flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Architectural Variant Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare generated layout alternatives side-by-side and choose your preferred blueprint.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-lg">
          {variants.length} Alternatives Generated
        </span>
      </div>

      {/* Desktop Grid (Side-by-Side 3 Columns) */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {variants.map((variant, index) => {
          const stats = getVariantStats(variant);
          const label = optionLabels[index] || `Option ${index + 1}`;
          return (
            <div
              key={index}
              className="flex flex-col bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-400/50 hover:shadow-2xl transition-all group"
            >
              {/* Header */}
              <div className="p-4 bg-slate-950/70 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-sky-400 block">
                    {label}
                  </span>
                  <h3 className="font-display font-bold text-white text-base truncate max-w-[170px]" title={variant.meta.title}>
                    {variant.meta.title || `Design ${index + 1}`}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectVariant(variant)}
                  className="btn-radiant text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all min-h-[44px] flex items-center justify-center shrink-0"
                  aria-label={`Activate ${label} (${variant.meta.title || 'Design'})`}
                >
                  Activate
                </button>
              </div>

              {/* Mini Preview Canvas */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <FloorPlanRenderer plan={variant} preview={true} />

                {/* Specs Summary */}
                <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Built-Up Area:</span>
                    <span className="text-white font-mono font-bold text-sm">{stats.area} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Est. Budget (BLR):</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(stats.cost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Room Elements:</span>
                    <span className="text-white font-mono font-bold text-sm">{stats.roomsCount} rooms</span>
                  </div>
                  <p className="text-xs text-slate-300 italic pt-1 line-clamp-2 leading-relaxed">
                    {variant.meta.description || "Architecturally balanced floor plan layout."}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Tabbed View */}
      <div className="lg:hidden space-y-4">
        <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-white/10 min-h-[48px]">
          {variants.map((_, index) => (
            <button
              key={index}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                activeTab === index ? "bg-sky-500 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setActiveTab(index)}
              aria-label={`Show ${optionLabels[index] || `Option ${index + 1}`}`}
            >
              {optionLabels[index] || `Option ${index + 1}`}
            </button>
          ))}
        </div>

        {variants[activeTab] && (
          <div className="studio-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-3">
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  {variants[activeTab].meta.title || `Variant ${activeTab + 1}`}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">{variants[activeTab].meta.description}</p>
              </div>
              <button
                onClick={() => onSelectVariant(variants[activeTab])}
                className="btn-radiant text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all min-h-[44px] flex items-center justify-center shrink-0"
                aria-label={`Activate Plan ${variants[activeTab].meta.title || `Option ${activeTab + 1}`}`}
              >
                Activate Plan
              </button>
            </div>

            <FloorPlanRenderer plan={variants[activeTab]} preview={true} />

            <div className="grid grid-cols-3 divide-x divide-white/10 p-3 bg-slate-950/80 rounded-xl text-center text-xs border border-white/10">
              <div>
                <span className="block text-xs text-slate-300 font-medium">Built-Up</span>
                <span className="font-mono font-bold text-white text-sm mt-0.5">{getVariantStats(variants[activeTab]).area} sq ft</span>
              </div>
              <div>
                <span className="block text-xs text-slate-300 font-medium">Budget</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{formatCurrency(getVariantStats(variants[activeTab]).cost)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-300 font-medium">Rooms</span>
                <span className="font-mono font-bold text-white text-sm mt-0.5">{getVariantStats(variants[activeTab]).roomsCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
