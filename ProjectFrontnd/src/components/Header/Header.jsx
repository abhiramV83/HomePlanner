import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function BlueprintLogoIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M9 21V12h6v9"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="3" y1="14" x2="21" y2="14" stroke="#7dd3fc" strokeWidth="1" strokeDasharray="1.5 1.5" />
      </svg>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-sky-500/15 shadow-2xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4" aria-label="Main Navigation">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="HomePlanner Studio Home">
          <BlueprintLogoIcon />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white tracking-tight group-hover:text-sky-400 transition-colors">
                HomePlanner
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                PRO CAD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              AI Architectural Studio
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Studio</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>About</span>
          </NavLink>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Developer Portfolio Link */}
          <a
            href="https://abhiramv83.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 transition-all"
            aria-label="Developer Portfolio (opens in new tab)"
          >
            <span>Developer</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}