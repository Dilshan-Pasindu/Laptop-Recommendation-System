import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, HardDrive, ShieldAlert, GitCompare, Heart,
  Battery, Monitor, Sparkles, ChevronLeft, Zap,
  MemoryStick, AlertTriangle, CheckCircle, Star
} from "lucide-react";
import { getLaptopDetails, toggleFavorite, getFavorites } from "../services/api";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from "recharts";

/* ── Score bar with animation ────────────────────────────── */
function ScoreBar({ label, value, color, delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className="text-xs font-bold text-white">{Math.round(value)}/100</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

/* ── Spec row ────────────────────────────────────────────── */
function SpecRow({ icon: Icon, color, label, main, sub }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-violet-500/20 hover:bg-violet-500/4 transition-all duration-200">
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-bold text-white">{main}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function LaptopDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [laptop,      setLaptop]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const [detRes, favRes] = await Promise.all([getLaptopDetails(id), getFavorites()]);
        setLaptop(detRes.data);
        setIsFavorited(favRes.data.some((i) => i.id === parseInt(id)));
      } catch {
        setError("Could not load laptop details.");
      } finally { setLoading(false); }
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
    localStorage.setItem("compare_name1", laptop.Name);
    navigate("/compare");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="spinner mb-4" />
        <p className="text-slate-400 text-sm">Loading specifications…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !laptop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShieldAlert className="h-14 w-14 text-pink-500 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-white mb-2">Details Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || "This laptop does not exist in our database."}</p>
        <Link to="/search" className="btn-primary text-sm">Return to Browse</Link>
      </div>
    );
  }

  const chartData = [
    { name: "Programming",  score: laptop.Programming_Score },
    { name: "AI Dev",       score: laptop.AI_Development_Score },
    { name: "Gaming",       score: laptop.Gaming_Score },
    { name: "Video Edit",   score: laptop.Video_Editing_Score },
    { name: "Office",       score: laptop.Office_Student_Score },
    { name: "Portability",  score: laptop.Portability_Score },
  ];

  const overallColor =
    laptop.Overall_Rating >= 70 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" :
    laptop.Overall_Rating >= 50 ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" :
                                   "bg-slate-500/15 text-slate-300 border-slate-500/25";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm gap-1.5">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {/* ── Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-8 border border-violet-500/15 relative overflow-hidden"
      >
        {/* BG glow */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        {laptop.Battery_Imputed && (
          <div className="flex items-start gap-3 border border-yellow-500/25 bg-yellow-500/6 text-yellow-400 px-4 py-3 rounded-2xl text-xs mb-6">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span><strong>Estimation notice:</strong> Battery life ({laptop.Battery_Hours.toFixed(1)}h) has been imputed from price-segment medians due to scraped data errors in the original record.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          {/* Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-purple">{laptop.Brand}</span>
              <span className={`badge border ${overallColor}`}>
                <Star className="h-3 w-3 fill-current" /> {laptop.Overall_Rating?.toFixed(1)}/100
              </span>
              {laptop.CPU_Tier && (
                <span className="badge-cyan">{laptop.CPU_Tier}</span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white leading-tight">
              {laptop.Name}
            </h1>
            <p className="text-3xl font-black font-heading text-gradient">
              ₹{laptop.Price.toLocaleString()}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={sendToCompare} className="btn-secondary text-sm">
              <GitCompare className="h-4 w-4" /> Set to Compare
            </button>
            <button
              onClick={handleFav}
              className={`btn-secondary text-sm ${isFavorited ? "border-pink-500/40 text-pink-400 bg-pink-500/8" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Favorited" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hardware specs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 border border-violet-500/12"
          >
            <h2 className="font-heading text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-violet-400" /> Hardware Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SpecRow
                icon={Cpu} color="bg-gradient-to-br from-violet-600 to-violet-800"
                label="Processor (CPU)" main={laptop.Processor_Name}
                sub={`${laptop.Processor_Brand} · ${laptop.CPU_Tier} · ${laptop.Ghz} GHz`}
              />
              <SpecRow
                icon={Sparkles} color="bg-gradient-to-br from-cyan-600 to-cyan-800"
                label="Graphics (GPU)" main={laptop.GPU}
                sub={`${laptop.GPU_Brand} · ${laptop.GPU_VRAM_GB > 0 ? `${laptop.GPU_VRAM_GB} GB Dedicated` : "Integrated"}`}
              />
              <SpecRow
                icon={MemoryStick} color="bg-gradient-to-br from-pink-600 to-pink-800"
                label="Memory (RAM)" main={`${laptop.RAM_GB} GB`}
                sub={laptop.RAM_TYPE}
              />
              <SpecRow
                icon={HardDrive} color="bg-gradient-to-br from-amber-600 to-orange-700"
                label="Storage" main={`${laptop.Storage_GB} GB Total`}
                sub={`SSD: ${laptop.SSD_GB} GB · HDD: ${laptop.HDD_GB} GB`}
              />
              <SpecRow
                icon={Monitor} color="bg-gradient-to-br from-emerald-600 to-emerald-800"
                label="Display" main={`${laptop.Display_Size?.toFixed(1)}" ${laptop.Display_type}`}
                sub="Widescreen · 16:9 Aspect Ratio"
              />
              <SpecRow
                icon={Battery} color="bg-gradient-to-br from-teal-600 to-teal-800"
                label="Battery & Power" main={`${laptop.Battery_Hours?.toFixed(1)} Hours`}
                sub={`Adapter: ${laptop.Adapter_W > 0 ? `${laptop.Adapter_W} W` : "Standard"}`}
              />
            </div>
          </motion.div>

          {/* Highlights */}
          {laptop.Highlights?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 border border-violet-500/12"
            >
              <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" /> Product Highlights
              </h2>
              <ul className="space-y-2.5">
                {laptop.Highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-violet-400 mt-0.5 shrink-0 text-base leading-none">›</span>
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right: Performance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-6 border border-violet-500/12"
          >
            <h2 className="font-heading text-lg font-bold text-white mb-1 text-center">
              Performance Radar
            </h2>
            <p className="text-xs text-slate-500 text-center mb-5">AI-computed benchmark scores / 100</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="rgba(139,92,246,0.12)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Outfit" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#374151", fontSize: 8 }} stroke="rgba(255,255,255,0.04)" />
                  <Radar name="Scores" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score bars */}
            <div className="mt-6 space-y-3">
              <ScoreBar label="Programming"   value={laptop.Programming_Score}    color="bg-gradient-to-r from-blue-500 to-indigo-500"   delay={0.3} />
              <ScoreBar label="AI Dev"        value={laptop.AI_Development_Score} color="bg-gradient-to-r from-violet-500 to-purple-500"  delay={0.35} />
              <ScoreBar label="Gaming"        value={laptop.Gaming_Score}         color="bg-gradient-to-r from-red-500 to-rose-500"       delay={0.4} />
              <ScoreBar label="Video Editing" value={laptop.Video_Editing_Score}  color="bg-gradient-to-r from-pink-500 to-fuchsia-500"   delay={0.45} />
              <ScoreBar label="Office/Study"  value={laptop.Office_Student_Score} color="bg-gradient-to-r from-emerald-500 to-teal-500"   delay={0.5} />
              <ScoreBar label="Portability"   value={laptop.Portability_Score}    color="bg-gradient-to-r from-amber-500 to-yellow-500"   delay={0.55} />
            </div>

            <p className="text-[10px] text-slate-600 mt-6 text-center leading-relaxed border-t border-white/5 pt-4">
              Portability is a screen-size proxy. Battery is imputed from price medians when raw data is invalid.
            </p>
          </motion.div>

          {/* Quick compare CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-3xl p-5 border border-cyan-500/15 text-center"
          >
            <GitCompare className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-white mb-1.5">Compare this laptop</h3>
            <p className="text-xs text-slate-500 mb-4">Add it to the compare tool and pick another to see side-by-side specs.</p>
            <button onClick={sendToCompare} className="btn-primary text-sm w-full justify-center">
              <GitCompare className="h-4 w-4" /> Open Compare Tool
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
