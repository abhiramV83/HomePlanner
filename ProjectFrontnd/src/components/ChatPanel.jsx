import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Enlarge the master bedroom",
  "Move kitchen to Southeast (Vastu)",
  "Add a balcony on First Floor",
  "Make living room open concept",
  "Add attached bathroom to bedroom 2"
];

export default function ChatPanel({ chatHistory = [], onSendMessage, loading }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (text) => {
    if (loading) return;
    onSendMessage(text);
  };

  return (
    <div className="studio-card flex flex-col h-full overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Architectural AI Assistant
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Refine room positions, dimensions, or features naturally</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px] min-h-[260px] bg-[#070d18]/60">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400 shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="text-sm font-bold text-white">Conversational CAD Co-Pilot</p>
            <p className="text-xs text-slate-300 mt-1 max-w-[260px] leading-relaxed">
              Instruct the AI to resize rooms, rearrange living zones, or optimize Vastu Shastra alignments.
            </p>

            {/* Quick Suggestions (Comfortable Touch Targets) */}
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-[340px]">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs font-semibold bg-white/5 hover:bg-sky-500/15 text-slate-200 hover:text-sky-300 border border-white/10 hover:border-sky-500/40 px-3 py-2 rounded-xl transition-all text-left flex items-center gap-1.5 min-h-[36px]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0 mt-0.5">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "bg-sky-600 text-white rounded-br-none font-medium"
                    : "bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none font-medium"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0 mt-0.5">
              AI
            </div>
            <div className="bg-slate-900/90 text-slate-200 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-md flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-slate-300 font-medium">Re-calculating CAD geometry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form (44px touch targets) */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-slate-950/70 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="e.g. Enlarge kitchen to 12x14 ft and move to southeast..."
          className="flex-1 bg-slate-900/90 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 min-h-[44px] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-radiant px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[76px] min-h-[44px]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Refine"
          )}
        </button>
      </form>
    </div>
  );
}
