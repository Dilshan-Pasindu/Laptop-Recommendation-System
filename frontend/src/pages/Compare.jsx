import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare, Search, Sparkles, Check, X,
  ArrowLeftRight, Trophy, ChevronRight, Zap
} from "lucide-react";
import { compareLaptops, instantSearch } from "../services/api";

/* ── Search Slot ──────────────────────────────────────────── */
function LaptopSlot({ slotNum, laptop, query, setQuery, results, showDropdown, onSelect, onClear, accentClass, borderClass }) {
  return (
    <div className={`glass rounded-2xl border ${laptop ? borderClass : "border-violet-500/12"} p-5 relative`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-6 w-6 rounded-lg ${accentClass} flex items-center justify-center`}>
          <span className="text-white text-xs font-black">{slotNum}</span>
        </div>
        <span className="text-xs font-bold font-heading text-slate-400 uppercase tracking-wider">
          Laptop {slotNum}
        </span>
      </div>

      {laptop ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="badge-purple text-[10px] mb-1.5 inline-block">{laptop.Brand}</span>
            <h4 className="font-heading text-sm font-bold text-white leading-tight line-clamp-2">{laptop.Name}</h4>
            <p className={`text-lg font-black font-heading mt-1 ${slotNum === 1 ? "text-gradient" : "text-gradient-cyan"}`}>
              ₹{laptop.Price?.toLocaleString()}
            </p>
          </div>
          <button onClick={onClear} className="btn-ghost p-1.5 shrink-0 hover:text-red-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search for laptop ${slotNum}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          <AnimatePresence>
            {showDropdown && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0a0520] border border-violet-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
              >
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-violet-500/8 transition text-xs border-b border-white/4 last:border-0"
                  >
                    <span className="text-slate-300 font-semibold truncate">{item.Name}</span>
                    <span className="text-violet-400 font-bold shrink-0">₹{item.Price?.toLocaleString()}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Compare() {
  const [id1, setId1] = useState(() => { const s = localStorage.getItem("compare_id1"); return s ? parseInt(s) : null; });
  const [id2, setId2] = useState(() => { const s = localStorage.getItem("compare_id2"); return s ? parseInt(s) : null; });
  const [laptop1,    setLaptop1]    = useState(null);
  const [laptop2,    setLaptop2]    = useState(null);
  const [comparisons, setComparisons] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [q1, setQ1] = useState(""); const [q2, setQ2] = useState("");
  const [r1, setR1] = useState([]); const [r2, setR2] = useState([]);
  const [d1, setD1] = useState(false); const [d2, setD2] = useState(false);

  useEffect(() => {
    if (id1 !== null) localStorage.setItem("compare_id1", id1);
    else localStorage.removeItem("compare_id1");
  }, [id1]);
  useEffect(() => {
    if (id2 !== null) localStorage.setItem("compare_id2", id2);
    else localStorage.removeItem("compare_id2");
  }, [id2]);

  useEffect(() => {
    (async () => {
      if (id1 !== null && id2 !== null) {
        setLoading(true);
        try {
          const res = await compareLaptops(id1, id2);
          setLaptop1(res.data.laptop1); setLaptop2(res.data.laptop2);
          setComparisons(res.data.comparisons);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      } else {
        setComparisons(null);
        if (id1 === null) setLaptop1(null);
        if (id2 === null) setLaptop2(null);
      }
    })();
  }, [id1, id2]);

  // Debounced search
  useEffect(() => {
    if (q1.trim().length < 2) { setR1([]); setD1(false); return; }
    const t = setTimeout(async () => {
      try { const res = await instantSearch(q1); setR1(res.data); setD1(true); } catch { /* noop */ }
    }, 280);
    return () => clearTimeout(t);
  }, [q1]);

  useEffect(() => {
    if (q2.trim().length < 2) { setR2([]); setD2(false); return; }
    const t = setTimeout(async () => {
      try { const res = await instantSearch(q2); setR2(res.data); setD2(true); } catch { /* noop */ }
    }, 280);
    return () => clearTimeout(t);
  }, [q2]);

  const clearSlot = (n) => {
    if (n === 1) { setId1(null); setLaptop1(null); } else { setId2(null); setLaptop2(null); }
    setComparisons(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-cyan text-[11px]"><GitCompare className="h-3 w-3" /> Compare Tool</span>
        </div>
        <h1 className="font-heading text-4xl font-black text-white md:text-5xl">
          Laptop <span className="text-gradient">Comparison</span>
        </h1>
        <p className="mt-2 text-slate-400">Search and pick two laptops for a detailed side-by-side spec analysis.</p>
      </div>

      {/* Selection slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LaptopSlot
          slotNum={1} laptop={laptop1} query={q1} setQuery={setQ1}
          results={r1} showDropdown={d1}
          onSelect={(item) => { setId1(item.id); setQ1(""); setD1(false); }}
          onClear={() => clearSlot(1)}
          accentClass="bg-gradient-to-br from-violet-600 to-violet-800"
          borderClass="border-violet-500/25"
        />
        <LaptopSlot
          slotNum={2} laptop={laptop2} query={q2} setQuery={setQ2}
          results={r2} showDropdown={d2}
          onSelect={(item) => { setId2(item.id); setQ2(""); setD2(false); }}
          onClear={() => clearSlot(2)}
          accentClass="bg-gradient-to-br from-cyan-600 to-cyan-800"
          borderClass="border-cyan-500/25"
        />
      </div>

      {/* VS badge when both selected */}
      {laptop1 && laptop2 && (
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] font-heading font-black text-sm text-white">
            VS
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="spinner mb-4" />
          <span className="text-sm text-slate-400">Loading comparison matrix…</span>
        </div>
      ) : comparisons ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-violet-500/15 overflow-hidden"
        >
          {/* Winner banner */}
          <div className="relative flex items-center justify-center gap-3 px-6 py-5 border-b border-white/6 bg-gradient-to-r from-violet-500/8 via-transparent to-cyan-500/8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5" />
            <Trophy className="h-5 w-5 text-yellow-400 relative z-10" />
            <span className="text-sm font-semibold text-white relative z-10">
              Overall Winner:&nbsp;
              <span className="text-gradient font-black text-base">{comparisons.overall_winner_name}</span>
            </span>
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse relative z-10" />
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/6 bg-white/2">
            <div className="px-6 py-3.5 text-xs font-bold font-heading uppercase tracking-widest text-slate-500">Specification</div>
            <div className="px-5 py-3.5 text-xs font-bold font-heading uppercase tracking-widest text-violet-400 border-l border-white/5 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-[10px] text-white font-black">1</span>
              <span className="truncate">{laptop1.Name?.split("(")[0].trim()}</span>
            </div>
            <div className="px-5 py-3.5 text-xs font-bold font-heading uppercase tracking-widest text-cyan-400 border-l border-white/5 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center text-[10px] text-white font-black">2</span>
              <span className="truncate">{laptop2.Name?.split("(")[0].trim()}</span>
            </div>
          </div>

          {/* Rows */}
          <div className="comparison-table divide-y divide-white/4">
            {Object.entries(comparisons.comparisons).map(([key, item]) => {
              const { val1, val2, winner, label } = item;
              return (
                <div key={key} className="grid grid-cols-[1fr_1fr_1fr] hover:bg-white/2 transition-colors">
                  <div className="px-6 py-3.5 text-xs font-semibold text-slate-400">{label}</div>
                  <div className={`px-5 py-3.5 border-l border-white/5 ${winner === 1 ? "winner-cell-1" : "text-slate-300 text-xs"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs">{typeof val1 === "number" ? val1.toLocaleString() : val1}</span>
                      {winner === 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/25 shrink-0">
                          ✓ Better
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`px-5 py-3.5 border-l border-white/5 ${winner === 2 ? "winner-cell-2" : "text-slate-300 text-xs"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs">{typeof val2 === "number" ? val2.toLocaleString() : val2}</span>
                      {winner === 2 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shrink-0">
                          ✓ Better
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-t border-white/6 bg-white/2">
            <div className="px-6 py-4 text-xs text-slate-600">Full Specifications</div>
            <div className="px-5 py-4 border-l border-white/5">
              <Link to={`/laptop/${id1}`} className="btn-secondary text-xs py-2 px-3 w-full justify-center">
                View Details <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="px-5 py-4 border-l border-white/5">
              <Link to={`/laptop/${id2}`} className="btn-secondary text-xs py-2 px-3 w-full justify-center">
                View Details <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty state */
        <div className="py-24 text-center glass rounded-3xl border border-white/5 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center mb-5">
            <ArrowLeftRight className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white mb-2">Select Two Laptops</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
            Use the search inputs above to find and select two models. The AI-scored comparison matrix will appear here.
          </p>
          <Link to="/search" className="btn-secondary text-sm">
            <Search className="h-4 w-4" /> Browse Laptops
          </Link>
        </div>
      )}
    </div>
  );
}
