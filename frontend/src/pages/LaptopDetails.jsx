import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, HardDrive, ShieldAlert, GitCompare, Heart,
  Battery, Monitor, Sparkles, ChevronLeft,
  MemoryStick, AlertTriangle, CheckCircle2, Star
} from "lucide-react";
import { getLaptopDetails, toggleFavorite, getFavorites } from "../services/api";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from "recharts";

/* ── Score Bar ──────────────────────────────────────────────── */
function ScoreBar({ label, value, accent, delay = 0 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay * 1000 + 100); return () => clearTimeout(t); }, [delay]);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>{Math.round(value)}/100</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: mounted ? `${value}%` : "0%", background: accent, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

/* ── Spec Row ───────────────────────────────────────────────── */
function SpecRow({ icon: Icon, color, label, main, sub }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0.875rem",
      padding: "0.875rem", borderRadius: "var(--radius-md)",
      background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
      transition: "all 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "var(--bg-base)"; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      }}>
        <Icon style={{ width: 18, height: 18, color: "#fff" }} strokeWidth={1.75} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{main}</div>
        {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LAPTOP DETAILS PAGE
════════════════════════════════════════════════════════════ */
export default function LaptopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laptop, setLaptop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const [detRes, favRes] = await Promise.all([getLaptopDetails(id), getFavorites()]);
        setLaptop(detRes.data);
        setIsFavorited(favRes.data.some((i) => i.id === parseInt(id)));
      } catch { setError("Could not load laptop details."); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleFav = async () => {
    try {
      const r = await toggleFavorite(laptop.id);
      setIsFavorited(r.data.status === "added");
    } catch { /* noop */ }
  };

  const sendToCompare = () => {
    localStorage.setItem("compare_id1", laptop.id);
    navigate("/compare");
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem" }}>
      <div className="spinner" />
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Loading specifications…</p>
    </div>
  );

  if (error || !laptop) return (
    <div style={{ maxWidth: 500, margin: "5rem auto", padding: "0 1.25rem", textAlign: "center" }}>
      <ShieldAlert style={{ width: 40, height: 40, color: "#FF3B30", margin: "0 auto 1rem" }} />
      <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Details Not Found</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{error || "This laptop is not in our database."}</p>
      <Link to="/search" className="btn-primary">Return to Browse</Link>
    </div>
  );

  const chartData = [
    { name: "Programming",  score: laptop.Programming_Score },
    { name: "AI Dev",       score: laptop.AI_Development_Score },
    { name: "Gaming",       score: laptop.Gaming_Score },
    { name: "Video Edit",   score: laptop.Video_Editing_Score },
    { name: "Office",       score: laptop.Office_Student_Score },
    { name: "Portability",  score: laptop.Portability_Score },
  ];

  const overallRating = laptop.Overall_Rating ?? 0;
  const ratingColor = overallRating >= 70 ? "#34C759" : overallRating >= 50 ? "#FF9F0A" : "var(--text-tertiary)";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.25rem" }}>

      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: "1.25rem" }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back
      </button>

      {/* ── Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", padding: "1.5rem 2rem",
          boxShadow: "var(--shadow-md)", marginBottom: "1.5rem",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--accent), #34C759)" }} />

        {/* Battery estimation notice */}
        {laptop.Battery_Imputed && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "0.625rem",
            background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.2)",
            borderRadius: "var(--radius-md)", padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
          }}>
            <AlertTriangle style={{ width: 15, height: 15, color: "#FF9F0A", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: "0.8125rem", color: "#E05A00", lineHeight: 1.5 }}>
              <strong>Estimation notice:</strong> Battery life ({laptop.Battery_Hours?.toFixed(1)}h) has been imputed from price-segment medians due to missing data in the original scraped record.
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1.25rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.625rem" }}>
              <span className="badge badge-blue">{laptop.Brand}</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                fontSize: "0.75rem", fontWeight: 700,
                background: `${ratingColor}18`, color: ratingColor,
                border: `1px solid ${ratingColor}30`,
                padding: "0.2rem 0.625rem", borderRadius: 20,
              }}>
                <Star style={{ width: 11, height: 11 }} fill="currentColor" />
                {overallRating.toFixed(1)}/100
              </span>
              {laptop.CPU_Tier && <span className="badge badge-gray">{laptop.CPU_Tier}</span>}
            </div>
            <h1 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: 1.2 }}>
              {laptop.Name}
            </h1>
            <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent)", lineHeight: 1 }}>
              RS {laptop.Price?.toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button onClick={sendToCompare} className="btn-secondary" style={{ fontSize: "0.8125rem" }}>
              <GitCompare style={{ width: 14, height: 14 }} /> Compare
            </button>
            <button
              onClick={handleFav}
              className="btn-secondary"
              style={{
                fontSize: "0.8125rem",
                color: isFavorited ? "#FF3B30" : undefined,
                borderColor: isFavorited ? "rgba(255,59,48,0.3)" : undefined,
              }}
            >
              <Heart style={{ width: 14, height: 14 }} fill={isFavorited ? "#FF3B30" : "none"} />
              {isFavorited ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Body Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }} className="details-grid">

        {/* Left: Specs + Highlights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Hardware */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)", padding: "1.5rem", boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Cpu style={{ width: 16, height: 16, color: "var(--accent)" }} /> Hardware Specifications
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
              <SpecRow icon={Cpu} color="#0071E3" label="Processor"
                main={laptop.Processor_Name}
                sub={`${laptop.Processor_Brand} · ${laptop.CPU_Tier} · ${laptop.Ghz} GHz`} />
              <SpecRow icon={Sparkles} color="#AF52DE" label="Graphics"
                main={laptop.GPU}
                sub={`${laptop.GPU_Brand} · ${laptop.GPU_VRAM_GB > 0 ? `${laptop.GPU_VRAM_GB} GB Dedicated` : "Integrated"}`} />
              <SpecRow icon={MemoryStick} color="#FF3B30" label="Memory"
                main={`${laptop.RAM_GB} GB`} sub={laptop.RAM_TYPE} />
              <SpecRow icon={HardDrive} color="#FF9F0A" label="Storage"
                main={`${laptop.Storage_GB} GB Total`}
                sub={`SSD: ${laptop.SSD_GB} GB · HDD: ${laptop.HDD_GB} GB`} />
              <SpecRow icon={Monitor} color="#34C759" label="Display"
                main={`${laptop.Display_Size?.toFixed(1)}" ${laptop.Display_type}`}
                sub="Widescreen · 16:9 Aspect" />
              <SpecRow icon={Battery} color="#5856D6" label="Battery"
                main={`${laptop.Battery_Hours?.toFixed(1)} Hours`}
                sub={`Adapter: ${laptop.Adapter_W > 0 ? `${laptop.Adapter_W} W` : "Standard"}`} />
            </div>
          </motion.div>

          {/* Highlights */}
          {laptop.Highlights?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)", padding: "1.5rem", boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: "#34C759" }} /> Product Highlights
              </h2>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none", padding: 0, margin: 0 }}>
                {laptop.Highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>›</span>
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right: Performance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Radar + Score bars */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)", padding: "1.5rem", boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: "0.25rem" }}>
              Performance Radar
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center", marginBottom: "1rem" }}>
              AI-computed benchmark scores / 100
            </p>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="var(--border-medium)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--text-tertiary)", fontSize: 8 }} stroke="var(--border-subtle)" />
                  <Radar name="Scores" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "1.25rem" }}>
              <ScoreBar label="Programming"   value={laptop.Programming_Score}    accent="#0071E3"  delay={0.3} />
              <ScoreBar label="AI Dev"        value={laptop.AI_Development_Score} accent="#AF52DE" delay={0.35} />
              <ScoreBar label="Gaming"        value={laptop.Gaming_Score}         accent="#FF3B30"  delay={0.4} />
              <ScoreBar label="Video Editing" value={laptop.Video_Editing_Score}  accent="#FF9F0A"  delay={0.45} />
              <ScoreBar label="Office/Study"  value={laptop.Office_Student_Score} accent="#34C759"  delay={0.5} />
              <ScoreBar label="Portability"   value={laptop.Portability_Score}    accent="#5856D6"  delay={0.55} />
            </div>

            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "1rem", textAlign: "center", lineHeight: 1.5 }}>
              Portability is a screen-size proxy. Battery is imputed from price medians when raw data is invalid.
            </p>
          </motion.div>

          {/* Compare CTA */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)", padding: "1.5rem", boxShadow: "var(--shadow-sm)",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, margin: "0 auto 0.875rem",
              background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GitCompare style={{ width: 20, height: 20, color: "var(--accent)" }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "0.375rem" }}>
              Compare this laptop
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.55 }}>
              Add it to the compare tool and pick another for a side-by-side spec analysis.
            </p>
            <button onClick={sendToCompare} className="btn-primary" style={{ width: "100%", fontSize: "0.875rem" }}>
              <GitCompare style={{ width: 15, height: 15 }} /> Open Compare Tool
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
