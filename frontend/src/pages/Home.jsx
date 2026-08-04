import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, Zap, GitCompare, Compass, ArrowRight, ShieldCheck,
  BarChart3, Database, Sparkles, TrendingUp, Activity, Layers, BrainCircuit
} from "lucide-react";

/* ── Animated Counter ─────────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1.8 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(ease * to));
      if (t < 1) requestAnimationFrame(tick); else setCount(to);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

/* ── Feature Card ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="feature-card"
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        <Icon style={{ width: 22, height: 22, color: "#fff" }} strokeWidth={2} />
      </div>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {description}
      </p>
    </motion.div>
  );
}

/* ── Formula Card ─────────────────────────────────────────── */
function FormulaCard({ label, formula, desc, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="formula-card"
    >
      <div style={{
        display: "inline-block",
        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.06em", color: accent,
        background: `${accent}18`, border: `1px solid ${accent}35`,
        padding: "0.15rem 0.6rem", borderRadius: 20, marginBottom: "0.75rem",
      }}>
        {label}
      </div>
      <div className="code-block" style={{ color: accent, marginBottom: "0.75rem" }}>
        {formula}
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {desc}
      </p>
    </motion.div>
  );
}

/* ── Step Card ────────────────────────────────────────────── */
function StepCard({ step, icon: Icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "0.875rem", boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
        position: "relative", zIndex: 1,
      }}>
        <Icon style={{ width: 26, height: 26, color: "#fff" }} strokeWidth={1.75} />
      </div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
        STEP {step}
      </div>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 180 }}>
        {desc}
      </p>
    </motion.div>
  );
}

/* ── HERO Visual — macOS-style product card floating ──────── */
function HeroVisual() {
  const specs = [
    { label: "Processor", value: "Apple M3 Pro", icon: Cpu, color: "#0071E3" },
    { label: "Memory",    value: "16 GB Unified", icon: Layers, color: "#34C759" },
    { label: "GPU Score", value: "94 / 100", icon: BarChart3, color: "#FF9F0A" },
    { label: "AI Match",  value: "97.4%",        icon: Sparkles, color: "#AF52DE" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
      style={{ position: "relative", width: "100%", maxWidth: 440 }}
    >
      {/* Main mockup card */}
      <div style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 24,
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
      }}>
        {/* MacOS traffic lights */}
        <div style={{
          padding: "0.875rem 1.125rem 0",
          display: "flex", gap: 6, alignItems: "center",
        }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <div style={{
            flex: 1, marginLeft: "0.5rem", height: 22,
            background: "var(--bg-base)", borderRadius: 6,
            display: "flex", alignItems: "center", padding: "0 0.5rem",
          }}>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
              dp-laptop-advisor.app — AI Match Results
            </span>
          </div>
        </div>

        <div style={{ padding: "1rem 1.125rem 1.25rem" }}>
          {/* Match banner */}
          <div style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #34C759 100%)",
            borderRadius: 12, padding: "0.875rem 1rem", marginBottom: "0.875rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>
                AI MATCH SCORE
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>97.4%</div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BrainCircuit style={{ width: 22, height: 22, color: "#fff" }} strokeWidth={1.75} />
            </div>
          </div>

          {/* Laptop name */}
          <div style={{ marginBottom: "0.875rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 2 }}>
              MacBook Pro 14" (M3 Pro)
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Apple · ₹1,99,900
            </div>
          </div>

          {/* Spec grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {specs.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "0.625rem 0.75rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: 14, height: 14, color }} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge — left */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", left: -28, top: "30%",
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          borderRadius: 12, padding: "0.5rem 0.75rem",
          boxShadow: "var(--shadow-md)",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C759" }} />
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
          3,976 laptops analyzed
        </span>
      </motion.div>

      {/* Floating badge — right */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{
          position: "absolute", right: -28, top: "60%",
          background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
          borderRadius: 12, padding: "0.5rem 0.75rem",
          boxShadow: "var(--shadow-md)",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}
      >
        <Sparkles style={{ width: 14, height: 14, color: "var(--accent)" }} />
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
          62D feature space
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="hero-mesh" style={{ overflow: "hidden" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ minHeight: "88vh", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", alignItems: "center" }}
            className="hero-grid">

            {/* Left copy */}
            <div style={{ maxWidth: 560 }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="section-label"
                style={{ marginBottom: "1.5rem" }}
              >
                <Sparkles style={{ width: 12, height: 12 }} />
                AI-Powered · 3,976 Real Laptops · Cosine Similarity
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.75rem)",
                  fontWeight: 800, letterSpacing: "-0.03em",
                  lineHeight: 1.05, marginBottom: "1.25rem",
                  color: "var(--text-primary)",
                }}
              >
                Find Your{" "}
                <span className="text-gradient">Perfect</span>
                <br />Laptop with AI
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "2rem" }}
              >
                Not simple IF-statements. A real Scikit-Learn cosine similarity pipeline computing a{" "}
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>62-dimension feature vector</strong>{" "}
                to rank every laptop against your exact requirements.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2.5rem" }}
              >
                <Link to="/recommend" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}>
                  <Sparkles style={{ width: 16, height: 16 }} />
                  Ask AI Advisor
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
                <Link to="/search" className="btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}>
                  <Compass style={{ width: 15, height: 15 }} />
                  Browse All Laptops
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem",
                  paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)",
                }}
              >
                {[
                  { to: 3976, suffix: "+", label: "Real Laptops" },
                  { to: 62, suffix: "D", label: "Feature Space" },
                  { to: 100, suffix: "%", label: "Real Dataset" },
                ].map(({ to, suffix, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
                      <Counter to={to} suffix={suffix} />
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Process</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
              How It <span className="text-gradient">Works</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
              Four clean steps from raw data to your perfect match.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", position: "relative" }}>
            {/* Connector */}
            <div style={{
              position: "absolute", top: 28, left: "12.5%", right: "12.5%",
              height: 1, background: "linear-gradient(90deg, transparent, var(--border-medium), transparent)",
              display: "none",
            }} className="step-connector" />

            {[
              { step: "01", icon: Database,  title: "Real Dataset",        desc: "3,976 scraped retail laptops, cleaned and structured from raw messy fields.", color: "#0071E3" },
              { step: "02", icon: Layers,    title: "Feature Engineering", desc: "CPU/GPU scores, purpose ratings, portability & battery computed from specs.", color: "#34C759" },
              { step: "03", icon: Activity,  title: "Cosine Similarity",   desc: "Your preferences become a 62D vector compared against every laptop's vector.", color: "#FF9F0A" },
              { step: "04", icon: Sparkles,  title: "Smart Ranking",       desc: "40% vector similarity + 60% weighted spec matching gives the final score.", color: "#AF52DE" },
            ].map((s, i) => <StepCard key={s.step} {...s} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Capabilities</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)" }}>
              System <span className="text-gradient">Features</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 480, margin: "0.75rem auto 0" }}>
              Built on clean mathematical principles — not marketing templates.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { icon: Database,    title: "Real Scraped Dataset",      description: "Analyzes 3,976 real laptops. No synthetics, no made-up specs. Every listing sourced directly from retail product sheets.", color: "#0071E3", delay: 0 },
              { icon: Cpu,         title: "Multi-Stage Cleaning",       description: "Extracts clean floats from messy text, corrects brand mismatches, imputes battery with category-level segment medians.", color: "#34C759", delay: 0.05 },
              { icon: BarChart3,   title: "Feature Engineering",        description: "Computes CPU, GPU, Programming, AI Dev, Gaming, Video Editing, and Portability scores from raw hardware specifications.", color: "#FF9F0A", delay: 0.1 },
              { icon: Zap,         title: "Cosine Similarity Engine",   description: "MinMaxScaler + OneHotEncoder builds a 62-dim feature space. Your preferences become a user vector for exact similarity.", color: "#AF52DE", delay: 0.15 },
              { icon: GitCompare,  title: "Side-by-Side Comparison",    description: "Compare any two laptops on price-performance, benchmark scores, battery, and computed AI scores with winner highlights.", color: "#FF3B30", delay: 0.2 },
              { icon: ShieldCheck, title: "Full Transparency",           description: "Imputed battery values are flagged. Every score is backed by documented heuristic equations visible on the home page.", color: "#5856D6", delay: 0.25 },
            ].map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── FORMULAS ─────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Engine Internals</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)" }}>
              Feature Engineering <span className="text-gradient">Formulas</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 480, margin: "0.75rem auto 0" }}>
              Transparent scoring equations that power every recommendation.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <FormulaCard label="Programming Score" accent="#0071E3"
              formula="0.4 × RAM_Score + 0.4 × CPU_Score + 0.2 × Storage_Score"
              desc="Prioritizes compilation-heavy workloads. RAM and CPU tier equally weighted, with storage SSD speed as tiebreaker." />
            <FormulaCard label="AI Development Score" accent="#34C759"
              formula="0.45 × GPU_Score + 0.35 × RAM_Score + 0.2 × CPU_Score"
              desc="Heavily penalizes integrated graphics. Integrated GPU caps score at 35 (Apple M-series exception at 45)." />
            <FormulaCard label="Gaming Score" accent="#FF3B30"
              formula="0.7 × GPU_Score + 0.3 × CPU_Score"
              desc="GPU-dominant. Dedicated VRAM tier directly maps to frame-rate potential. CPU bottleneck at 30% weight." />
            <FormulaCard label="Office / Student Score" accent="#FF9F0A"
              formula="0.4 × Battery_Score + 0.3 × Budget_Score + 0.3 × Portability"
              desc="Values endurance, portability, and affordability. Ideal for everyday productivity and light usage patterns." />
            <FormulaCard label="Portability Score" accent="#AF52DE"
              formula={'100 − ((Display_Size − 11.6) / 5.7) × 90'}
              desc={'Linear proxy for carry weight. 11.6" = 100 pts, 17.3" ≈ 10 pts.'} />
            <FormulaCard label="Final Match Score" accent="#5856D6"
              formula="0.4 × Cosine_Similarity × 100 + 0.6 × Weighted_Match"
              desc="Blends geometric vector distance with component-level preference weights (budget 30%, purpose 25%, specs 45%)." />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 28,
              padding: "3rem 2.5rem",
              boxShadow: "var(--shadow-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, var(--accent), #34C759)",
            }} />

            <div style={{
              width: 60, height: 60, borderRadius: 18, margin: "0 auto 1.25rem",
              background: "linear-gradient(135deg, var(--accent) 0%, #34C759 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,113,227,0.3)",
            }}>
              <TrendingUp style={{ width: 28, height: 28, color: "#fff" }} />
            </div>

            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.875rem" }}>
              Ready to find your <span className="text-gradient">perfect laptop?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.6 }}>
              Tell the AI your budget, purpose, and specs. Get ranked recommendations with transparent match scores in under 2 seconds.
            </p>
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/recommend" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.75rem" }}>
                <Sparkles style={{ width: 16, height: 16 }} />
                Start AI Recommendation
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <Link to="/search" className="btn-secondary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.75rem" }}>
                <Compass style={{ width: 15, height: 15 }} />
                Browse 3,976 Laptops
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
