import { useState } from "react";
import { estimateCost, CITY_RATES } from "../utils/costEstimate";

export default function CostPanel({ rooms = [] }) {
  const [cityKey, setCityKey] = useState("Bangalore");
  const costData = estimateCost(rooms, cityKey);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const floorLabel = (f) => {
    if (f === 0) return "Ground Floor";
    if (f === 1) return "First Floor";
    if (f === 2) return "Second Floor";
    return `Floor ${f + 1}`;
  };

  return (
    <div className="studio-card flex flex-col h-full overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Civil Construction Cost Estimator
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">Regional construction rates based on carpet &amp; built-up area</p>
        </div>
        <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1 rounded-md border border-emerald-500/30 uppercase tracking-wider">
          Live Estimate
        </span>
      </div>

      {/* Inputs & Total Display */}
      <div className="p-4 bg-slate-900/50 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs text-slate-200 font-bold mb-2">
            Construction Location &amp; Material Index
          </label>
          <select
            value={cityKey}
            onChange={(e) => setCityKey(e.target.value)}
            className="studio-select min-h-[44px]"
            aria-label="Select Construction Location"
          >
            {Object.entries(CITY_RATES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name} (₹{val.rate}/sq ft)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:text-right">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Estimated Project Budget</p>
          <p className="font-display text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5 font-mono">
            {formatCurrency(costData.totalCost)}
          </p>
          <p className="text-xs text-slate-300 mt-0.5">
            Includes 18% load-bearing walls, circulation passages &amp; structural columns
          </p>
        </div>
      </div>

      {/* Visual Budget Allocation Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-white/10 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">Budget Allocation Breakdown</span>
          <span className="font-mono text-slate-300">₹{costData.rate}/sq ft Base</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div className="bg-sky-500 h-full" style={{ width: "50%" }} title="Civil & RCC Structure: 50%" />
          <div className="bg-emerald-500 h-full" style={{ width: "25%" }} title="Finishes & Flooring: 25%" />
          <div className="bg-amber-500 h-full" style={{ width: "15%" }} title="MEP, Electrical & Plumbing: 15%" />
          <div className="bg-purple-500 h-full" style={{ width: "10%" }} title="Contingency & Permits: 10%" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Structure (50%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Finishes (25%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> MEP (15%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Permits (10%)</span>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-white/10 bg-slate-950/60 border-b border-white/10 p-3.5 text-center">
        <div>
          <p className="text-xs text-slate-300 font-medium">Built-Up Area</p>
          <p className="text-sm font-mono font-bold text-white mt-0.5">{costData.totalBuiltUpArea} sq ft</p>
        </div>
        <div>
          <p className="text-xs text-slate-300 font-medium">Carpet Area</p>
          <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">{costData.totalCarpetArea} sq ft</p>
        </div>
        <div>
          <p className="text-xs text-slate-300 font-medium">Base Rate</p>
          <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">₹{costData.rate}/sq ft</p>
        </div>
      </div>

      {/* Detailed Room Breakdown Table */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[280px] bg-[#070d18]/50">
        <table className="w-full text-xs text-slate-200 text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs text-slate-300 uppercase font-bold tracking-wider">
              <th className="py-2.5">Room / Component</th>
              <th className="py-2.5 text-right">Carpet Area</th>
              <th className="py-2.5 text-right">Est. Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {costData.breakdown.map((room, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5">
                  <span className="font-bold text-white text-xs">{room.name}</span>
                  <span className="text-xs text-slate-300 block font-medium">
                    {floorLabel(room.floor)}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-300 font-medium">{room.area} sq ft</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">{formatCurrency(room.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
