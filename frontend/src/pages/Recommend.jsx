import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ChevronRight, Cpu, HardDrive,
  Battery, Monitor, Code2, Gamepad2, VideoIcon, Briefcase,
  GraduationCap, BrainCircuit, BarChart3, Star, Trophy,
  CheckCircle2
} from "lucide-react";
import { recommendLaptops } from "../services/api";

/* ── Purpose data ─────────────────────────────────────────── */
const PURPOSES = [
  { key: "Programming",      label: "Programming",       icon: Code2,        color: "#0071E3" },
  { key: "AI Development",   label: "AI Development",    icon: BrainCircuit, color: "#AF52DE" },
  { key: "Gaming",           label: "Gaming",            icon: Gamepad2,     color: "#FF3B30" },
  { key: "Video Editing",    label: "Video Editing",     icon: VideoIcon,    color: "#FF9F0A" },
  { key: "Student",          label: "Student",           icon: GraduationCap,color: "#34C759" },
  { key: "Office",           label: "Office / Work",     icon: Briefcase,    color: "#5856D6" },
];

const BRANDS      = ["Any","ASUS","Dell","HP","Lenovo","MSI","Apple","Acer","Samsung","LG","Gigabyte","Razer"];
const PROC_BRANDS = ["Any","Intel","Amd","Apple","Qualcomm"];
const GPU_REQS    = ["Any","Dedicated","Integrated"];
const BATT_IMPS   = ["Low","Medium","High"];
const DISP_SIZES  = ["Any","Compact","Medium","Large"];
const DISP_TYPES  = ["Any","LED","LCD"];

/* ── Slider with value tooltip ──────────────────────────────── */
function SliderField({ label, value, min, max, step = 1, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        <span style={{
          fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent)",
          background: "var(--accent-muted)", border: "1px solid var(--border-accent)",
          padding: "0.1rem 0.6rem", borderRadius: 20,
        }}>
          {format ? format(value) : value}
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider"
          style={{
            background: `linear-gradient(to right, var(--accent) ${pct}%, var(--border-medium) ${pct}%)`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: 4 }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

/* ── Score Bar ──────────────────────────────────────────────── */
function ScoreBar({ label, value, color }) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{value.toFixed(1)}</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: mounted ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Result Card ─────────────────────────────────────────────── */
function ResultCard({ laptop, rank }) {
  const isTop = rank === 1;
  const scores = [
    { label: "Programming",   value: laptop.Programming_Score,   color: "#0071E3" },
    { label: "AI Dev",        value: laptop.AI_Development_Score,color: "#AF52DE" },
    { label: "Gaming",        value: laptop.Gaming_Score,        color: "#FF3B30" },
    { label: "Video Editing", value: laptop.Video_Editing_Score, color: "#FF9F0A" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.35 }}
      style={{
        background: "var(--bg-elevated)",
        border: isTop ? "2px solid var(--accent)" : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: isTop ? "var(--shadow-lg)" : "var(--shadow-sm)",
        position: "relative",
      }}
    >
      {/* Top accent bar for #1 */}
      {isTop && (
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, var(--accent), #34C759)",
        }} />
      )}

      <div style={{ padding: "1.25rem" }}>
        {/* Rank + Match */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isTop ? (
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent), #34C759)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Trophy style={{ width: 14, height: 14, color: "#fff" }} />
              </div>
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "var(--bg-base)", border: "1px solid var(--border-medium)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)",
              }}>
                #{rank}
              </div>
            )}
            <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>{laptop.Brand}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            background: "var(--accent-muted)", border: "1px solid var(--border-accent)",
            padding: "0.2rem 0.65rem", borderRadius: 20,
            fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)",
          }}>
            <Star style={{ width: 11, height: 11 }} fill="currentColor" />
            {laptop.Match_Percentage?.toFixed(1)}% match
          </div>
        </div>

        {/* Name */}
        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", lineHeight: 1.4 }}>
          {laptop.Name}
        </h3>
        <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--accent)", marginBottom: "1rem" }}>
          RS {laptop.Price?.toLocaleString()}
        </p>

        {/* Spec chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem", marginBottom: "1rem" }}>
          {[
            { icon: Cpu,       val: `${laptop.RAM_GB} GB ${laptop.RAM_TYPE || ""}` },
            { icon: HardDrive, val: `${laptop.Storage_GB} GB Storage` },
            { icon: Monitor,   val: `${laptop.Display_Size}" ${laptop.Display_type || ""}` },
            { icon: Battery,   val: `${laptop.Battery_Hours?.toFixed(1)}h Battery` },
          ].map(({ icon: Icon, val }) => (
            <div key={val} style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
              borderRadius: 8, padding: "0.375rem 0.625rem",
            }}>
              <Icon style={{ width: 11, height: 11, color: "var(--text-tertiary)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Score bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {scores.map((s) => <ScoreBar key={s.label} {...s} />)}
        </div>

        {/* Why recommended */}
        {laptop.Why_Recommended?.[0] && (
          <div style={{
            background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, padding: "0.625rem 0.75rem",
            display: "flex", alignItems: "flex-start", gap: "0.5rem",
            marginBottom: "1rem",
          }}>
            <CheckCircle2 style={{ width: 14, height: 14, color: "#34C759", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: "0.78125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {laptop.Why_Recommended[0]}
            </span>
          </div>
        )}

        <Link
          to={`/laptop/${laptop.id}`}
          className="btn-primary"
          style={{ width: "100%", fontSize: "0.875rem", padding: "0.625rem" }}
        >
          View Full Details
          <ChevronRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   RECOMMEND PAGE
════════════════════════════════════════════════════════════ */
const DEFAULTS = {
  budget: 275000, purpose: "Programming",
  brand: "Any", processor_brand: "Any", min_ram: 8,
  min_storage: 256, gpu_req: "Any", battery_importance: "Medium",
  display_size: "Any", display_type: "Any", performance_priority: 0.5,
};

export default function Recommend() {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await recommendLaptops(prefs);
      setResults(res.data || []);
      setSubmitted(true);
      setTimeout(() => document.getElementById("results-anchor")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.25rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-label">
          <Sparkles style={{ width: 12, height: 12 }} />
          AI-Powered
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)" }}>
          AI Laptop <span className="text-gradient">Advisor</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.4rem" }}>
          Tell the AI your requirements. Get science-backed recommendations in seconds.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="recommend-grid">

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}>
            {/* Section: Purpose */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                What's your primary use case?
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.625rem" }}>
                {PURPOSES.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("purpose", key)}
                    className={`purpose-chip${prefs.purpose === key ? " selected" : ""}`}
                    style={prefs.purpose === key ? { borderColor: color, color, background: `${color}12` } : {}}
                  >
                    <Icon style={{ width: 16, height: 16, flexShrink: 0, color: prefs.purpose === key ? color : "var(--text-tertiary)" }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Budget & Performance */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
                Budget & Performance
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
                <SliderField label="Budget" value={prefs.budget} min={30000} max={1800000} step={10000}
                  format={(v) => `RS ${(v/1000).toFixed(0)}K`} onChange={(v) => set("budget", v)} />
                <SliderField label="Performance Priority" value={prefs.performance_priority} min={0} max={1} step={0.05}
                  format={(v) => v <= 0.3 ? "Value" : v <= 0.6 ? "Balanced" : "Performance"}
                  onChange={(v) => set("performance_priority", v)} />
              </div>
            </div>

            {/* Section: Specs */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
                Hardware Requirements
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                {/* Brand */}
                <div>
                  <label className="form-label">Brand Preference</label>
                  <select value={prefs.brand} onChange={(e) => set("brand", e.target.value)} className="select-field">
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {/* Processor */}
                <div>
                  <label className="form-label">Processor Brand</label>
                  <select value={prefs.processor_brand} onChange={(e) => set("processor_brand", e.target.value)} className="select-field">
                    {PROC_BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {/* GPU */}
                <div>
                  <label className="form-label">GPU Requirement</label>
                  <select value={prefs.gpu_req} onChange={(e) => set("gpu_req", e.target.value)} className="select-field">
                    {GPU_REQS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                {/* RAM */}
                <div>
                  <label className="form-label">Min RAM</label>
                  <select value={prefs.min_ram} onChange={(e) => set("min_ram", parseInt(e.target.value))} className="select-field">
                    {[4,8,16,32,64].map((r) => <option key={r} value={r}>{r} GB</option>)}
                  </select>
                </div>
                {/* Storage */}
                <div>
                  <label className="form-label">Min Storage</label>
                  <select value={prefs.min_storage} onChange={(e) => set("min_storage", parseInt(e.target.value))} className="select-field">
                    {[128,256,512,1024,2048].map((s) => <option key={s} value={s}>{s >= 1024 ? `${s/1024} TB` : `${s} GB`}</option>)}
                  </select>
                </div>
                {/* Battery */}
                <div>
                  <label className="form-label">Battery Importance</label>
                  <select value={prefs.battery_importance} onChange={(e) => set("battery_importance", e.target.value)} className="select-field">
                    {BATT_IMPS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {/* Display size */}
                <div>
                  <label className="form-label">Display Size</label>
                  <select value={prefs.display_size} onChange={(e) => set("display_size", e.target.value)} className="select-field">
                    {DISP_SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {/* Display type */}
                <div>
                  <label className="form-label">Display Type</label>
                  <select value={prefs.display_type} onChange={(e) => set("display_type", e.target.value)} className="select-field">
                    {DISP_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                Cosine similarity across 3,976 laptops · &lt;2 seconds
              </p>
              <button type="submit" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 2rem" }} disabled={loading}>
                {loading ? (
                  <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing…</>
                ) : (
                  <><Sparkles style={{ width: 16, height: 16 }} /> Find My Perfect Laptop <ArrowRight style={{ width: 14, height: 14 }} /></>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── Results ── */}
        <div id="results-anchor">
          <AnimatePresence>
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
              >
                <div className="spinner" />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Analyzing laptops…</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Computing cosine similarity across 3,976 models</div>
                </div>
              </motion.div>
            )}
            {!loading && submitted && results.length > 0 && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    Top {results.length} Recommendations
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    Ranked by AI match score for your preferences
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                  {results.map((l, i) => <ResultCard key={l.id} laptop={l} rank={i + 1} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
