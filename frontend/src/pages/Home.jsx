import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Cpu, Zap, GitCompare, Compass, ArrowRight, ShieldCheck,
  BarChart3, Database, Sparkles, TrendingUp, Star, ChevronRight,
  Activity, Layers, BrainCircuit
} from "lucide-react";

/* ─── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ to, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick  = () => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(to);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

/* ─── Feature Card ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 group cursor-default"
    >
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6 text-white" strokeWidth={2} />
      </div>
      <h3 className="font-heading text-base font-bold text-white mb-2 group-hover:text-gradient transition-all duration-300">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ─── Formula Card ─────────────────────────────────────────── */
function FormulaCard({ label, formula, desc, color }) {
  const colors = {
    purple: "border-violet-500/20 bg-violet-500/5",
    cyan:   "border-cyan-500/20   bg-cyan-500/5",
    pink:   "border-pink-500/20   bg-pink-500/5",
    green:  "border-emerald-500/20 bg-emerald-500/5",
    gold:   "border-yellow-500/20 bg-yellow-500/5",
    indigo: "border-indigo-500/20 bg-indigo-500/5",
  };
  const textColors = {
    purple: "text-violet-400",
    cyan:   "text-cyan-400",
    pink:   "text-pink-400",
    green:  "text-emerald-400",
    gold:   "text-yellow-400",
    indigo: "text-indigo-400",
  };
  return (
    <div className={`rounded-2xl border ${colors[color]} p-5 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest font-heading ${textColors[color]} mb-2`}>
        {label}
      </div>
      <code className={`block font-mono text-xs ${textColors[color]} bg-black/20 rounded-lg px-3 py-2.5 mb-3 break-all leading-relaxed border border-white/5`}>
        {formula}
      </code>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Orbiting Particle ─────────────────────────────────────── */
function OrbitRing({ radius, speed, color, size }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: size, height: size, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: `orbit-dot ${speed}s linear infinite`,
            transformOrigin: `50% ${radius}px`,
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-600/6 blur-[80px]" />
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: Copy ── */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 badge-purple mb-8 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                <span>AI-Powered · 3,976 Real Laptops · Cosine Similarity</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="font-heading text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]"
              >
                Find Your{" "}
                <span className="text-gradient glow-text-purple">Perfect</span>
                <br />
                Laptop with AI
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2 }}
                className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Not simple IF-statements. A real Scikit-Learn cosine similarity pipeline that
                computes a <span className="text-violet-300 font-semibold">62-dimension feature vector</span> and ranks
                every laptop against your exact requirements.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.3 }}
                className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Link to="/recommend" className="btn-primary text-base group">
                  <Sparkles className="h-5 w-5" />
                  Ask AI Advisor
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link to="/search" className="btn-secondary text-base">
                  <Compass className="h-4.5 w-4.5" />
                  Browse All Laptops
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-white/5"
              >
                {[
                  { value: 3976, suffix: "+", label: "Real Laptops" },
                  { value: 62,   suffix: "D", label: "Feature Space" },
                  { value: 100,  suffix: "%", label: "Real Dataset" },
                ].map(({ value, suffix, label }) => (
                  <div key={label} className="text-center lg:text-left">
                    <div className="text-2xl font-black font-heading text-gradient leading-none">
                      <AnimatedCounter to={value} suffix={suffix} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Visual Orb ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-violet-500/15 animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-6 rounded-full border border-cyan-500/10 animate-[spin_20s_linear_infinite_reverse]" />
                <div className="absolute inset-12 rounded-full border border-violet-500/8 animate-[spin_15s_linear_infinite]" />

                {/* Orbiting dots */}
                {[
                  { r: 155, speed: 8, color: "#8b5cf6", size: 8 },
                  { r: 125, speed: 12, color: "#06b6d4", size: 6 },
                  { r: 95,  speed: 6,  color: "#ec4899", size: 5 },
                ].map(({ r, speed, color, size }, i) => (
                  <div key={i} className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: size, height: size,
                        background: color,
                        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}80`,
                        top: `calc(50% - ${r}px - ${size / 2}px)`,
                        left: `calc(50% - ${size / 2}px)`,
                        transformOrigin: `${size / 2}px ${r + size / 2}px`,
                        animation: `spin ${speed}s linear infinite`,
                      }}
                    />
                  </div>
                ))}

                {/* Central glowing orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-violet-600 to-violet-900 shadow-[0_0_60px_rgba(139,92,246,0.6),0_0_120px_rgba(139,92,246,0.3)] flex items-center justify-center">
                      <BrainCircuit className="h-14 w-14 text-white/90" strokeWidth={1.5} />
                    </div>
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                    <div className="absolute -inset-4 rounded-full border border-violet-500/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
                  </div>
                </div>

                {/* Floating spec chips */}
                {[
                  { label: "RAM", value: "16 GB", pos: "top-4 left-0",    col: "badge-purple", delay: 0.5 },
                  { label: "CPU", value: "i7 12th", pos: "top-1/3 -right-4", col: "badge-cyan",   delay: 0.7 },
                  { label: "GPU", value: "RTX 4060", pos: "bottom-1/4 -left-4", col: "badge-pink", delay: 0.9 },
                  { label: "SSD", value: "512 GB", pos: "bottom-4 right-4",  col: "badge-green",  delay: 1.1 },
                ].map(({ label, value, pos, col, delay: d }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: d, type: "spring", stiffness: 200 }}
                    className={`absolute ${pos} glass px-3 py-1.5 rounded-xl text-xs font-semibold font-heading ${col}`}
                  >
                    <span className="text-[10px] text-slate-500">{label}</span>
                    <div className="text-white">{value}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════════════════ */}
      <section className="py-24 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-purple text-xs mb-4 inline-block">Process</span>
            <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

            {[
              { step: "01", icon: Database, title: "Real Dataset",       desc: "3,976 scraped retail laptops with raw messy fields cleaned and structured.", color: "from-violet-600 to-violet-800" },
              { step: "02", icon: Layers,   title: "Feature Engineering", desc: "CPU/GPU scores, purpose-based ratings, portability and battery computed from specs.", color: "from-cyan-600 to-cyan-800" },
              { step: "03", icon: Activity, title: "Cosine Similarity",  desc: "Your preferences become a 62D vector. We compute cosine distance against every laptop.", color: "from-pink-600 to-pink-800" },
              { step: "04", icon: Sparkles, title: "Smart Ranking",      desc: "A 40/60 blend of vector similarity + weighted spec matching gives the final score.", color: "from-emerald-600 to-emerald-800" },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                  <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold font-heading text-slate-600 tracking-widest mb-1">{step}</span>
                <h3 className="font-heading font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE GRID
         ══════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-cyan text-xs mb-4 inline-block">Capabilities</span>
            <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              System <span className="text-gradient">Features</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base">
              Built on clean mathematical principles — not marketing templates.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Database,   title: "Real Scraped Dataset",     description: "Analyzes 3,976 real laptops. No synthetics, no made-up specs. Every listing directly sourced from retail product sheets.", gradient: "from-violet-600 to-violet-800", delay: 0 },
              { icon: Cpu,        title: "Multi-Stage Cleaning",     description: "Extracts clean floats from messy text, corrects brand mismatches, imputes battery with category-level segment medians.",  gradient: "from-cyan-600 to-cyan-800",   delay: 0.05 },
              { icon: BarChart3,  title: "Feature Engineering",      description: "Computes CPU, GPU, Programming, AI Dev, Gaming, Video Editing, and Portability scores from raw hardware specifications.",   gradient: "from-pink-600 to-pink-800",   delay: 0.1 },
              { icon: Zap,        title: "Cosine Similarity Engine", description: "MinMaxScaler + OneHotEncoder builds a 62-dim feature space. Your preferences become a user vector for exact similarity.",  gradient: "from-amber-600 to-orange-700",delay: 0.15 },
              { icon: GitCompare, title: "Side-by-Side Comparison",  description: "Compare any two laptops on price-performance, benchmark scores, battery, and computed AI scores with winner highlights.",   gradient: "from-emerald-600 to-emerald-800", delay: 0.2 },
              { icon: ShieldCheck,title: "Full Transparency",        description: "Imputed battery values are flagged. Every score is backed by documented heuristic equations visible on the home page.",   gradient: "from-indigo-600 to-indigo-800",  delay: 0.25 },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FORMULA SECTION
         ══════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-green text-xs mb-4 inline-block">Engine Internals</span>
            <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              Feature Engineering <span className="text-gradient">Formulas</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Transparent scoring equations that power every recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormulaCard label="Programming Score" color="purple"
              formula="0.4 × RAM_Score + 0.4 × CPU_Score + 0.2 × Storage_Score"
              desc="Prioritizes compilation-heavy workloads. RAM and CPU tier equally weighted, with storage SSD speed as a tiebreaker." />
            <FormulaCard label="AI Development Score" color="cyan"
              formula="0.45 × GPU_Score + 0.35 × RAM_Score + 0.2 × CPU_Score"
              desc="Heavily penalizes integrated graphics. Integrated GPU caps the score at 35 (Apple M-series exception at 45)." />
            <FormulaCard label="Gaming Score" color="pink"
              formula="0.7 × GPU_Score + 0.3 × CPU_Score"
              desc="GPU-dominant. Dedicated VRAM tier directly maps to frame-rate potential. CPU bottleneck considered at 30% weight." />
            <FormulaCard label="Office / Student Score" color="gold"
              formula="0.4 × Battery_Score + 0.3 × Budget_Score + 0.3 × Portability_Score"
              desc="Values endurance, portability, and affordability. Ideal for everyday productivity and light usage patterns." />
            <FormulaCard label="Portability Score" color="green"
              formula="100 − ((Display_Size − 11.6) / 5.7) × 90"
              desc="Linear proxy for carry weight since weight isn't in raw data. 11.6&quot; = 100 points, 17.3&quot; = ~10 points." />
            <FormulaCard label="Final Match Score" color="indigo"
              formula="0.4 × Cosine_Similarity × 100 + 0.6 × Weighted_Match"
              desc="Blends geometric vector distance with component-level preference weights (budget 30%, purpose 25%, specs 45%)." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
         ══════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass rounded-4xl p-12 overflow-hidden"
          >
            {/* BG glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/8 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

            <div className="relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-900 mb-6 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-heading text-4xl font-black text-white mb-4">
                Ready to find your <span className="text-gradient">perfect laptop?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Tell the AI your budget, purpose, and specs. Get ranked recommendations with transparent match scores in under 2 seconds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/recommend" className="btn-primary text-base px-8 py-4 group">
                  <Sparkles className="h-5 w-5" />
                  Start AI Recommendation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/search" className="btn-secondary text-base px-8 py-4">
                  <Compass className="h-4 w-4" />
                  Browse All 3,976 Laptops
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
