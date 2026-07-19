import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Zap, Sliders, AlertTriangle, Heart, GitCompare,
  ChevronRight, CheckCircle, ArrowRight, Star, Sparkles,
  Code2, Gamepad2, Video, GraduationCap, Briefcase, BrainCircuit,
  Trophy, Battery, HardDrive, Monitor, Info, RotateCcw
} from "lucide-react";
import { recommendLaptops, toggleFavorite, getFavorites } from "../services/api";

/* ── Purpose options ──────────────────────────────────────── */
const PURPOSES = [
  { name: "Programming",    icon: Code2,        color: "from-blue-600 to-indigo-700",    border: "border-blue-500/30",   text: "text-blue-300" },
  { name: "AI Development", icon: BrainCircuit, color: "from-violet-600 to-purple-700",  border: "border-violet-500/30", text: "text-violet-300" },
  { name: "Gaming",         icon: Gamepad2,     color: "from-red-600 to-rose-700",       border: "border-red-500/30",    text: "text-red-300" },
  { name: "Video Editing",  icon: Video,        color: "from-pink-600 to-fuchsia-700",   border: "border-pink-500/30",   text: "text-pink-300" },
  { name: "Student",        icon: GraduationCap,color: "from-emerald-600 to-teal-700",   border: "border-emerald-500/30",text: "text-emerald-300" },
  { name: "Office",         icon: Briefcase,    color: "from-cyan-600 to-sky-700",       border: "border-cyan-500/30",   text: "text-cyan-300" },
];

/* ── Score bar ────────────────────────────────────────────── */
function ScoreBar({ label, value, color = "from-violet-500 to-cyan-500" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-slate-400 font-medium">{label}</span>
        <span className="text-[11px] font-bold text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ── Match ring ───────────────────────────────────────────── */
function MatchRing({ pct, rank }) {
  const colors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
  const rings  = ["shadow-[0_0_20px_rgba(251,191,36,0.4)]", "shadow-[0_0_20px_rgba(148,163,184,0.4)]", "shadow-[0_0_20px_rgba(180,120,50,0.3)]"];
  const gradients = ["from-yellow-500 to-amber-600", "from-slate-400 to-slate-500", "from-amber-700 to-orange-800"];
  const idx = Math.min(rank - 1, 2);
  return (
    <div className={`relative flex flex-col items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br ${gradients[idx]} ${rings[idx]} shrink-0`}>
      <span className="text-[10px] font-bold text-white/70 leading-none">Match</span>
      <span className="text-lg font-black text-white leading-none">{pct}%</span>
      {rank <= 3 && (
        <div className="absolute -top-2 -right-2">
          <Trophy className={`h-5 w-5 ${colors[idx]}`} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Recommend() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    budget: 70000, purpose: "Programming", brand: "Any",
    processor_brand: "Any", min_ram: 16, min_storage: 512,
    gpu_req: "Any", battery_importance: "Medium",
    display_size: "Any", display_type: "Any", performance_priority: 0.7,
  });
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results,     setResults]     = useState(null);
  const [favorites,   setFavorites]   = useState([]);
  const [error,       setError]       = useState(null);

  const steps = [
    "Parsing user preference parameters…",
    "Normalizing specs to unified scale…",
    "Building 62-dimension feature vector…",
    "Computing cosine similarity on 3,976 laptops…",
    "Applying weighted purpose-match scores…",
    "Ranking and generating explanations…",
  ];

  useEffect(() => {
    getFavorites()
      .then((r) => setFavorites(r.data.map((i) => i.id)))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: name === "budget" || name === "min_ram" || name === "min_storage"
        ? parseFloat(value)
        : name === "performance_priority" ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setLoadingStep(0); setError(null);
    const timer = setInterval(() =>
      setLoadingStep((p) => (p < steps.length - 1 ? p + 1 : p)), 650);
    try {
      const res = await recommendLaptops(formData);
      clearInterval(timer);
      setTimeout(() => { setResults(res.data); setLoading(false); window.scrollTo({ top: 0, behavior: "smooth" }); }, 400);
    } catch {
      clearInterval(timer); setLoading(false);
      setError("Recommendation engine error. Please try again.");
    }
  };

  const toggleFav = async (id, e) => {
    e.preventDefault();
    try {
      const r = await toggleFavorite(id);
      setFavorites((p) => r.data.status === "added" ? [...p, id] : p.filter((x) => x !== id));
    } catch { /* noop */ }
  };

  const sendToCompare = (id, name) => {
    localStorage.setItem("compare_id1", id);
    localStorage.setItem("compare_name1", name);
    navigate("/compare");
  };

  const purposeScoreKey = (p) => {
    const map = { "Programming": "Programming_Score", "AI Development": "AI_Development_Score", "Gaming": "Gaming_Score", "Video Editing": "Video_Editing_Score", "Student": "Office_Student_Score", "Office": "Office_Student_Score" };
    return map[p] || "Programming_Score";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-purple text-[11px]">
            <Sparkles className="h-3 w-3" /> AI Engine
          </span>
          {results && (
            <button onClick={() => setResults(null)} className="btn-ghost text-xs gap-1">
              <RotateCcw className="h-3 w-3" /> New search
            </button>
          )}
        </div>
        <h1 className="font-heading text-4xl font-black text-white md:text-5xl">
          AI <span className="text-gradient">Laptop Advisor</span>
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          Set your requirements. The engine builds a 62-dimension vector and runs cosine similarity across all 3,976 real laptops.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Loading Screen ── */}
        {loading && (
          <motion.div key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-4xl p-12 max-w-lg mx-auto text-center border border-violet-500/20"
          >
            {/* Spinner */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="h-20 w-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute h-12 w-12 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
              <Sparkles className="absolute h-6 w-6 text-violet-400 animate-pulse" />
            </div>

            <h3 className="font-heading text-2xl font-bold text-white mb-1">AI Engine Active</h3>
            <p className="text-sm text-slate-500 mb-8">Processing 3,976 laptops…</p>

            {/* Progress */}
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-2.5 text-left">
              {steps.map((msg, i) => (
                <div key={i} className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                  i === loadingStep ? "text-violet-300 font-semibold"
                  : i < loadingStep  ? "text-emerald-400 opacity-70"
                  : "text-slate-600"
                }`}>
                  {i < loadingStep
                    ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    : i === loadingStep
                    ? <div className="h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin shrink-0" />
                    : <div className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                  }
                  {msg}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Results Screen ── */}
        {!loading && results && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Results header */}
            <div className="glass rounded-2xl px-6 py-4 border border-violet-500/15 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Results</span>
                <h2 className="font-heading text-xl font-bold text-white">Top {results.length} Recommendations</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="badge-purple">Budget: ₹{formData.budget.toLocaleString()}</span>
                <span className="badge-cyan">{formData.purpose}</span>
              </div>
            </div>

            {/* Laptop Cards */}
            {results.map((laptop, idx) => (
              <motion.div
                key={laptop.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
                className="glass-card p-6 md:p-8 relative overflow-hidden group"
              >
                {/* Rank glow */}
                {idx === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                )}

                <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                  {/* Left: Info */}
                  <div className="space-y-5">
                    {/* Brand + Title + Price */}
                    <div className="flex items-start gap-4">
                      <MatchRing pct={laptop.Match_Percentage} rank={idx + 1} />
                      <div className="flex-1 min-w-0">
                        <span className="badge-purple text-[10px] mb-1.5 inline-block">{laptop.Brand}</span>
                        <h3 className="font-heading text-lg font-bold text-white leading-tight group-hover:text-gradient transition-all duration-300 line-clamp-2">
                          {laptop.Name}
                        </h3>
                        <p className="text-2xl font-black font-heading text-white mt-1">
                          ₹{laptop.Price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quick specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: Cpu,       label: "CPU",     val: laptop.Processor_Name?.split(" ").slice(0, 4).join(" ") || "—" },
                        { icon: HardDrive, label: "Storage", val: `${laptop.Storage_GB} GB` },
                        { icon: Monitor,   label: "Display", val: `${laptop.Display_Size}"` },
                        { icon: Battery,   label: "Battery", val: `${laptop.Battery_Hours}h` },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-white/3 border border-white/6 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="h-3 w-3 text-slate-500" />
                            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{label}</span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Why Recommended */}
                    {laptop.Why_Recommended?.length > 0 && (
                      <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-3 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Why Recommended
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {laptop.Why_Recommended.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/laptop/${laptop.id}`} className="btn-primary text-sm py-2.5 px-5">
                        View Full Specs <ChevronRight className="h-4 w-4" />
                      </Link>
                      <button onClick={() => sendToCompare(laptop.id, laptop.Name)} className="btn-secondary text-sm py-2.5 px-4">
                        <GitCompare className="h-4 w-4" /> Compare
                      </button>
                      <button
                        onClick={(e) => toggleFav(laptop.id, e)}
                        className={`btn-ghost text-sm py-2.5 px-4 border ${favorites.includes(laptop.id) ? "border-pink-500/40 text-pink-400 bg-pink-500/8" : ""}`}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(laptop.id) ? "fill-current text-pink-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Score Bars */}
                  <div className="lg:w-64 space-y-3 lg:border-l lg:border-white/5 lg:pl-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Performance Scores</h4>
                    <ScoreBar label="Overall Rating"     value={laptop.Overall_Rating}     color="from-violet-500 to-cyan-500" />
                    <ScoreBar label="CPU Score"          value={laptop.CPU_Score}          color="from-blue-500 to-indigo-500" />
                    <ScoreBar label="GPU Score"          value={laptop.GPU_Score}          color="from-pink-500 to-rose-500" />
                    <ScoreBar label={`${formData.purpose} Score`} value={laptop[purposeScoreKey(formData.purpose)] || 0} color="from-emerald-500 to-teal-500" />
                    <ScoreBar label="Portability"        value={laptop.Portability_Score}  color="from-amber-500 to-yellow-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Form Screen ── */}
        {!loading && !results && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error && (
              <div className="flex items-center gap-3 border border-pink-500/30 bg-pink-500/8 text-pink-300 p-4 rounded-2xl mb-6 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ── Purpose grid ── */}
              <div className="glass rounded-3xl p-6 border border-violet-500/12">
                <label className="form-label mb-5 block">
                  <Sliders className="inline h-4 w-4 mr-2 text-violet-400" />
                  Primary Use Case
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {PURPOSES.map(({ name, icon: Icon, color, border, text }) => {
                    const isActive = formData.purpose === name;
                    return (
                      <button
                        type="button" key={name}
                        onClick={() => setFormData((p) => ({ ...p, purpose: name }))}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-250 ${
                          isActive
                            ? `${border} bg-gradient-to-br ${color}/20 shadow-lg`
                            : "border-white/6 bg-white/3 hover:border-white/15 hover:bg-white/5"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center transition-transform duration-250 ${isActive ? "scale-110" : ""}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className={`text-xs font-semibold font-heading text-center leading-tight ${isActive ? text : "text-slate-400"}`}>
                          {name}
                        </span>
                        {isActive && (
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Budget & Priority sliders ── */}
              <div className="glass rounded-3xl p-6 border border-violet-500/12 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Budget */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <label className="form-label">Maximum Budget</label>
                    <span className="font-heading font-black text-xl text-gradient">₹{formData.budget.toLocaleString()}</span>
                  </div>
                  <input type="range" name="budget" min="7990" max="503890" step="5000"
                    value={formData.budget} onChange={handleChange}
                    className="w-full h-2 rounded-full cursor-pointer appearance-none bg-gradient-to-r from-violet-600 to-cyan-500"
                    style={{ accentColor: "#8b5cf6" }}
                  />
                  <div className="flex justify-between text-[11px] text-slate-600 mt-2">
                    <span>₹7,990</span><span>₹5,03,890</span>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <label className="form-label">Performance Priority</label>
                    <span className="font-heading font-black text-xl text-gradient-cyan">{Math.round(formData.performance_priority * 100)}%</span>
                  </div>
                  <input type="range" name="performance_priority" min="0.1" max="1.0" step="0.05"
                    value={formData.performance_priority} onChange={handleChange}
                    className="w-full h-2 rounded-full cursor-pointer"
                    style={{ accentColor: "#06b6d4" }}
                  />
                  <div className="flex justify-between text-[11px] text-slate-600 mt-2">
                    <span>Value Focused</span><span>Max Performance</span>
                  </div>
                </div>
              </div>

              {/* ── Dropdowns Grid ── */}
              <div className="glass rounded-3xl p-6 border border-violet-500/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: "brand",              label: "Brand Preference",     opts: [["Any","Any Brand"],["HP","HP"],["Lenovo","Lenovo"],["Dell","Dell"],["Apple","Apple"],["Acer","Acer"],["ASUS","ASUS"],["MSI","MSI"],["Samsung","Samsung"],["Xiaomi","Xiaomi"],["Realme","Realme"],["Infinix","Infinix"]] },
                  { name: "processor_brand",    label: "Processor",            opts: [["Any","Any CPU"],["Intel","Intel Core"],["Amd","AMD Ryzen"],["Apple","Apple Silicon"],["Mediatek","MediaTek"]] },
                  { name: "min_ram",            label: "Minimum RAM",          opts: [["4","4 GB"],["8","8 GB"],["16","16 GB"],["32","32 GB"],["64","64 GB"]] },
                  { name: "min_storage",        label: "Minimum Storage",      opts: [["64","64 GB"],["128","128 GB"],["256","256 GB"],["512","512 GB"],["1024","1 TB"],["2048","2 TB"]] },
                  { name: "gpu_req",            label: "GPU Requirement",      opts: [["Any","No Preference"],["Dedicated","Dedicated GPU"],["Integrated","Integrated Only"]] },
                  { name: "battery_importance", label: "Battery Priority",     opts: [["Low","Standard (4–5 h)"],["Medium","Balanced (7–8 h)"],["High","Endurance (10+ h)"]] },
                  { name: "display_size",       label: "Screen Size",          opts: [["Any","No Preference"],["Compact","Compact (11–13\")"],["Medium","Medium (14–15\")"],["Large","Large (16–17\")"] ] },
                  { name: "display_type",       label: "Display Panel",        opts: [["Any","Any Panel"],["LED","LED"],["LCD","LCD"]] },
                ].map(({ name, label, opts }) => (
                  <div key={name}>
                    <label className="form-label">{label}</label>
                    <select name={name} value={formData[name]} onChange={handleChange} className="select-field">
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-base px-10 py-4 group">
                  <Sparkles className="h-5 w-5" />
                  Find My Perfect Laptop
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
