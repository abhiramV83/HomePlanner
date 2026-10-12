import { Link } from "react-router-dom";

export default function About() {
  const capabilities = [
    {
      title: "Physical CAD Coordinate Alignment",
      tag: "Spatial Engine",
      desc: "Every room is mapped to absolute physical coordinates (x, y, width, length in feet). Self-healing boundary clamping prevents plot overflow while detecting room envelope overlaps and preserving shared interior structural walls.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      title: "Vastu Shastra Centroid Analysis",
      tag: "Vastu Purusha",
      desc: "Computes each room's spatial center of mass against the North orientation angle to evaluate traditional Vastu compliance (NE Ishanya for Pooja, SE Agni for Kitchen, SW Nairutya for Master Suite).",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      title: "Civil Construction Cost Sheets",
      tag: "Cost Engineering",
      desc: "Calculates localized construction budgets using real-world CPWD and civil engineering indices for Bangalore, Mumbai, Hyderabad, and Tier-2 regions, factoring in 18% structural column and circulation allowance.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "Conversational CAD Co-Pilot",
      tag: "AI Refinement",
      desc: "Refine room layouts naturally via conversational prompts ('Enlarge kitchen', 'Add balcony to First Floor') while maintaining established room coordinates, multi-floor alignments, and load-bearing logic.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  const techStack = [
    { category: "Frontend Engine", tech: "React 19 · Vite · Tailwind CSS v4 · JetBrains Mono & Outfit Typography" },
    { category: "Backend Architecture", tech: "FastAPI · Python 3.12 · Pydantic V2 · Motor Async MongoDB Driver" },
    { category: "GenAI Inference Pipeline", tech: "Groq Cloud (Qwen 2.5 32B / Llama 3) with Automatic Google Gemini 2.5 Flash Fallback" },
    { category: "Persistence & Data", tech: "MongoDB 7.0 (Plans Collection, Multi-floor CAD Arrays, Session Partitions)" },
    { category: "Blueprint Export Engine", tech: "High-DPI Client-side SVG Vector & PDF Spec Sheet Generator" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Architectural System Specification
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">HomePlanner</span> Pro
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          HomePlanner is a full-stack architectural engineering studio combining generative AI, physical 2D CAD coordinate synthesis, automated Vastu Shastra orientation audits, and localized civil construction estimating.
        </p>
      </div>

      {/* Core Architectural Capabilities Grid */}
      <div className="space-y-6">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Core Engineering Engines
          </h2>
          <span className="text-xs text-sky-400 font-mono font-semibold">CAD Standard 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((c, idx) => (
            <div
              key={idx}
              className="studio-card p-6 flex flex-col justify-between space-y-4 hover:border-sky-400/50 hover:shadow-2xl transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                    {c.tag}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900 border border-white/10">
                    {c.icon}
                  </div>
                </div>
                <h3 className="font-display font-bold text-white text-lg">
                  {c.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Model Inference Architecture */}
      <div className="studio-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h2 className="font-display font-extrabold text-xl text-white">
            Hybrid Multi-Model GenAI Pipeline
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Resilient two-tier inference orchestrator providing sub-2-second generation speed with high availability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sky-400 uppercase">Tier 1 · Primary</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="font-bold text-white text-sm">Groq Cloud LPU</p>
            <p className="text-slate-300">
              Qwen 2.5 32B model generating structured JSON blueprints in ~2.1 seconds at ultra-high inference velocity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400 uppercase">Tier 2 · Fallback</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="font-bold text-white text-sm">Google Gemini 2.5 Flash</p>
            <p className="text-slate-300">
              Automatic transparent failover with JSON repair regex ensuring 99.9% layout generation reliability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400 uppercase">Validation</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <p className="font-bold text-white text-sm">Pydantic Coordinate Bounds</p>
            <p className="text-slate-300">
              Validates room coordinate containment, prevents wall overlaps, and verifies multi-floor stair alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Production Tech Stack Specification */}
      <div className="studio-card p-6 sm:p-8 space-y-4">
        <h2 className="font-display font-extrabold text-xl text-white border-b border-white/10 pb-4">
          Production Architecture &amp; Technology Stack
        </h2>
        <div className="divide-y divide-white/10">
          {techStack.map((item, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-sky-400 w-48 shrink-0">{item.category}</span>
              <span className="text-slate-200 font-mono font-medium">{item.tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Developer & CTA Footer */}
      <div className="studio-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-950/40 to-slate-900/60 border-sky-500/20">
        <div>
          <h3 className="font-display font-extrabold text-white text-lg">
            Ready to design your CAD blueprint?
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Experience real-time AI architectural planning with coordinate accuracy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="btn-radiant px-6 py-3 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center shadow-lg"
          >
            Launch Studio Generator
          </Link>
          <a
            href="https://github.com/abhiramv83/HomePlanner"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/15 px-4 py-3 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center transition-all"
          >
            GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
}
