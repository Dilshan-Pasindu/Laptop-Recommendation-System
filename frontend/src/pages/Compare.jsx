import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare, Search, Sparkles, X, ArrowLeftRight,
  Trophy, ChevronRight, CheckCircle2
} from "lucide-react";
import { compareLaptops, instantSearch, getLaptopDetails } from "../services/api";

/* ── Search Slot ──────────────────────────────────────────── */
function LaptopSlot({ slotNum, laptop, query, setQuery, results, showDropdown, onSelect, onClear, accentColor }) {
  return (
    <div style={{
      background: "var(--bg-elevated)", border: laptop ? `2px solid ${accentColor}` : "1px solid var(--border-medium)",
      borderRadius: "var(--radius-lg)", padding: "1.125rem",
      boxShadow: laptop ? "var(--shadow-md)" : "var(--shadow-xs)",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: accentColor, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>{slotNum}</span>
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Laptop {slotNum}
        </span>
      </div>

      {laptop ? (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ minWidth: 0 }}>
            <span className="badge badge-blue" style={{ fontSize: "0.7rem", marginBottom: "0.4rem", display: "inline-flex" }}>{laptop.Brand}</span>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: "0.25rem" }}>
              {laptop.Name}
            </h4>
            <p style={{ fontSize: "1.125rem", fontWeight: 800, color: accentColor }}>
              RS {laptop.Price?.toLocaleString()}
            </p>
          </div>
          <button onClick={onClear} className="btn-icon" style={{ flexShrink: 0 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Search style={{
              position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)",
              width: 15, height: 15, color: "var(--text-tertiary)", pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder={`Search for laptop ${slotNum}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.375rem", fontSize: "0.875rem" }}
            />
          </div>

          <AnimatePresence>
            {showDropdown && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                  background: "var(--bg-elevated)", border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
                  zIndex: 50, overflow: "hidden",
                }}
              >
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "0.75rem", padding: "0.625rem 0.875rem", textAlign: "left",
                      background: "transparent", border: "none", cursor: "pointer",
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.1s",
                      fontSize: "0.8125rem",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.Name}
                    </span>
                    <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>
                      RS {item.Price?.toLocaleString()}
                    </span>
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

/* ════════════════════════════════════════════════════════════
   COMPARE PAGE
════════════════════════════════════════════════════════════ */
export default function Compare() {
  const [id1, setId1] = useState(() => { const s = localStorage.getItem("compare_id1"); return s ? parseInt(s) : null; });
  const [id2, setId2] = useState(() => { const s = localStorage.getItem("compare_id2"); return s ? parseInt(s) : null; });
  const [laptop1, setLaptop1] = useState(null);
  const [laptop2, setLaptop2] = useState(null);
  const [comparisons, setComparisons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q1, setQ1] = useState(""); const [q2, setQ2] = useState("");
  const [r1, setR1] = useState([]); const [r2, setR2] = useState([]);
  const [d1, setD1] = useState(false); const [d2, setD2] = useState(false);

  useEffect(() => {
    if (id1 !== null) localStorage.setItem("compare_id1", id1); else localStorage.removeItem("compare_id1");
  }, [id1]);
  useEffect(() => {
    if (id2 !== null) localStorage.setItem("compare_id2", id2); else localStorage.removeItem("compare_id2");
  }, [id2]);

  useEffect(() => {
    (async () => {
      if (id1 !== null) {
        try { const res = await getLaptopDetails(id1); setLaptop1(res.data); } catch { /* noop */ }
      } else setLaptop1(null);
      if (id2 !== null) {
        try { const res = await getLaptopDetails(id2); setLaptop2(res.data); } catch { /* noop */ }
      } else setLaptop2(null);
      if (id1 !== null && id2 !== null) {
        setLoading(true);
        try { const res = await compareLaptops(id1, id2); setComparisons(res.data.comparisons); }
        catch { /* noop */ } finally { setLoading(false); }
      } else setComparisons(null);
    })();
  }, [id1, id2]);

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
    if (n === 1) { setId1(null); setLaptop1(null); }
    else { setId2(null); setLaptop2(null); }
    setComparisons(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.25rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-label">
          <GitCompare style={{ width: 12, height: 12 }} />
          Compare Tool
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)" }}>
          Laptop <span className="text-gradient">Comparison</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.3rem" }}>
          Search and select two laptops for a detailed side-by-side spec analysis.
        </p>
      </div>

      {/* Slots */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }} className="compare-slots-grid">
        <LaptopSlot
          slotNum={1} laptop={laptop1} query={q1} setQuery={setQ1}
          results={r1} showDropdown={d1}
          onSelect={(item) => { setId1(item.id); setQ1(""); setD1(false); }}
          onClear={() => clearSlot(1)}
          accentColor="var(--accent)"
        />
        <LaptopSlot
          slotNum={2} laptop={laptop2} query={q2} setQuery={setQ2}
          results={r2} showDropdown={d2}
          onSelect={(item) => { setId2(item.id); setQ2(""); setD2(false); }}
          onClear={() => clearSlot(2)}
          accentColor="#34C759"
        />
      </div>

      {/* VS badge */}
      {laptop1 && laptop2 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #34C759)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "0.7rem", color: "#fff",
            boxShadow: "var(--shadow-md)",
          }}>VS</div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Loading comparison matrix…</span>
        </div>
      ) : comparisons ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Winner banner */}
          <div style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-base)",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <Trophy style={{ width: 18, height: 18, color: "#FF9F0A" }} />
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Overall Winner:{" "}
            </span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--accent)" }}>
              {comparisons.overall_winner_name ||
                (laptop1?.Overall_Rating >= laptop2?.Overall_Rating ? laptop1?.Name : laptop2?.Name)}
            </span>
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
            <div style={{ padding: "0.75rem 1.25rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" }}>Specification</div>
            <div style={{ padding: "0.75rem 1.25rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)", borderLeft: "1px solid var(--border-subtle)" }}>
              #{laptop1?.Name?.split(" ").slice(0,2).join(" ")}
            </div>
            <div style={{ padding: "0.75rem 1.25rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#34C759", borderLeft: "1px solid var(--border-subtle)" }}>
              #{laptop2?.Name?.split(" ").slice(0,2).join(" ")}
            </div>
          </div>

          {/* Rows */}
          {Object.entries(comparisons).map(([key, item]) => {
            if (key === "overall_winner_name" || key === "overall_winner_id") return null;
            const { val1, val2, winner, label } = item || {};
            if (!label) return null;
            return (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div style={{ padding: "0.75rem 1.25rem", fontSize: "0.8125rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {label}
                </div>
                <div style={{
                  padding: "0.75rem 1.25rem", borderLeft: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "0.8125rem",
                  color: winner === 1 ? "var(--accent)" : "var(--text-primary)",
                  fontWeight: winner === 1 ? 700 : 400,
                  background: winner === 1 ? "var(--accent-muted)" : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span>{typeof val1 === "number" ? val1.toLocaleString() : val1}</span>
                    {winner === 1 && <CheckCircle2 style={{ width: 13, height: 13, color: "var(--accent)", flexShrink: 0 }} />}
                  </div>
                </div>
                <div style={{
                  padding: "0.75rem 1.25rem", borderLeft: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "0.8125rem",
                  color: winner === 2 ? "#34C759" : "var(--text-primary)",
                  fontWeight: winner === 2 ? 700 : 400,
                  background: winner === 2 ? "rgba(52,199,89,0.08)" : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span>{typeof val2 === "number" ? val2.toLocaleString() : val2}</span>
                    {winner === 2 && <CheckCircle2 style={{ width: 13, height: 13, color: "#34C759", flexShrink: 0 }} />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ padding: "0.875rem 1.25rem", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Full Specifications</div>
            <div style={{ padding: "0.875rem 1.25rem", borderLeft: "1px solid var(--border-subtle)" }}>
              <Link to={`/laptop/${id1}`} className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem", width: "100%" }}>
                View Details <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <div style={{ padding: "0.875rem 1.25rem", borderLeft: "1px solid var(--border-subtle)" }}>
              <Link to={`/laptop/${id2}`} className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem", width: "100%" }}>
                View Details <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty state */
        <div style={{
          padding: "5rem 2rem", textAlign: "center",
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xs)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 1.25rem",
            background: "var(--bg-base)", border: "1px solid var(--border-medium)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowLeftRight style={{ width: 24, height: 24, color: "var(--text-tertiary)" }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Select Two Laptops
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: 360, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            Use the search inputs above to find and select two models. The AI-scored comparison matrix will appear here.
          </p>
          <Link to="/search" className="btn-secondary" style={{ margin: "0 auto", display: "inline-flex" }}>
            <Search style={{ width: 15, height: 15 }} /> Browse Laptops
          </Link>
        </div>
      )}
    </div>
  );
}
