import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-sky-500/15 bg-[#080c14]/90 backdrop-blur-md text-slate-400 text-xs py-10 mt-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                HP
              </div>
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                HomePlanner Pro
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Precision architectural CAD generator powered by multi-model AI. Creates coordinate-aligned floor plan layouts with automated Vastu Shastra compliance audits and localized civil cost sheets.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-200">Architectural Engine</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-sky-400 transition-colors">Physical Coordinate Alignment</span></li>
              <li><span className="text-slate-400 hover:text-sky-400 transition-colors">Vastu Shastra Centroid Analysis</span></li>
              <li><span className="text-slate-400 hover:text-sky-400 transition-colors">Regional Construction Cost Sheets</span></li>
              <li><span className="text-slate-400 hover:text-sky-400 transition-colors">High-DPI PDF Blueprint Export</span></li>
            </ul>
          </div>

          {/* Quick Nav & Links */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-200">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="text-slate-400 hover:text-sky-400 transition-colors">Studio Generator</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-sky-400 transition-colors">Saved Blueprints</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-sky-400 transition-colors">System Architecture</Link></li>
              <li>
                <a href="https://github.com/abhiramv83" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1">
                  GitHub Repository
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} HomePlanner Architect. Built with CAD Precision &amp; Modern GenAI.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/abhiramv83"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://abhiramv83.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Developer Portfolio"
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
