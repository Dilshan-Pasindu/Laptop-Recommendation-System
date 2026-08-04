import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, GitCompare, Search, Home as HomeIcon, Menu, X,
  Sparkles, ChevronRight, Sun, Moon
} from "lucide-react";

import Home from "./pages/Home";
import Recommend from "./pages/Recommend";
import LaptopDetails from "./pages/LaptopDetails";
import Compare from "./pages/Compare";
import SearchBrowse from "./pages/Search";

/* ── Theme Context ──────────────────────────────────────────── */
export const ThemeContext = createContext({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

const navItems = [
  { name: "Home",       path: "/",         icon: HomeIcon },
  { name: "AI Advisor", path: "/recommend", icon: Sparkles },
  { name: "Compare",   path: "/compare",   icon: GitCompare },
  { name: "Browse",    path: "/search",    icon: Search },
];

/* ── Theme Toggle Button ─────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ── Navigation ─────────────────────────────────────────────── */
function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 250ms ease",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
      className="nav-bar"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", height: "var(--nav-h)", gap: "1.5rem" }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent) 0%, #34C759 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,113,227,0.3)",
              flexShrink: 0,
            }}>
              <Cpu style={{ width: 16, height: 16, color: "#fff" }} strokeWidth={2.5} />
            </div>
            <span style={{
              fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.02em",
              color: "var(--text-primary)", display: "none",
            }} className="sm-show">
              DP Laptop Advisor
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }} className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link${isActive ? " active" : ""}`}
                >
                  <Icon style={{ width: 14, height: 14 }} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--accent-muted)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA + Theme Toggle + Mobile hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
            <ThemeToggle />
            <Link to="/recommend" className="btn-primary" style={{ fontSize: "0.8125rem", padding: "0.45rem 1rem" }} id="cta-btn">
              <Sparkles style={{ width: 13, height: 13 }} />
              Get AI Pick
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="btn-icon mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-frosted)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ padding: "0.75rem 1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-link${isActive ? " active" : ""}`}
                    style={{ padding: "0.625rem 0.875rem", borderRadius: "var(--radius-sm)" }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {item.name}
                    {isActive && <ChevronRight style={{ width: 14, height: 14, marginLeft: "auto" }} />}
                  </Link>
                );
              })}
              <div style={{ paddingTop: "0.5rem" }}>
                <Link to="/recommend" className="btn-primary" style={{ width: "100%", fontSize: "0.9375rem", padding: "0.75rem" }}>
                  <Sparkles style={{ width: 16, height: 16 }} />
                  Get AI Recommendations
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer-surface">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent) 0%, #34C759 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,113,227,0.25)",
            }}>
              <Cpu style={{ width: 14, height: 14, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>DP Laptop Advisor</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>AI-Powered · 3,976 Real Laptops</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "2rem", textAlign: "center" }}>
            {[["3,976+", "Laptops"], ["62D", "Features"], ["100%", "Real Data"]].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--accent)" }}>{val}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            © {new Date().getFullYear()} DP Laptop Advisor · Scikit-Learn Cosine Similarity
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page Wrapper ───────────────────────────────────────────── */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ flexGrow: 1 }}
    >
      {children}
    </motion.div>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  const [theme, setTheme] = useState("light");

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <Router>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
          <Navigation />
          <main style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/"           element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/recommend"  element={<PageWrapper><Recommend /></PageWrapper>} />
                <Route path="/laptop/:id" element={<PageWrapper><LaptopDetails /></PageWrapper>} />
                <Route path="/compare"    element={<PageWrapper><Compare /></PageWrapper>} />
                <Route path="/search"     element={<PageWrapper><SearchBrowse /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}
