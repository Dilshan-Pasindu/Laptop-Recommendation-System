import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, GitCompare, Search, Home as HomeIcon, Menu, X, Sparkles, ChevronRight } from "lucide-react";

import Home from "./pages/Home";
import Recommend from "./pages/Recommend";
import LaptopDetails from "./pages/LaptopDetails";
import Compare from "./pages/Compare";
import SearchBrowse from "./pages/Search";

const navItems = [
  { name: "Home",         path: "/",          icon: HomeIcon },
  { name: "AI Advisor",   path: "/recommend", icon: Sparkles },
  { name: "Compare",      path: "/compare",   icon: GitCompare },
  { name: "Browse",       path: "/search",    icon: Search },
];

function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-[rgba(139,92,246,0.15)] bg-[rgba(3,0,20,0.85)] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-b border-transparent bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)]">
              <Cpu className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#030014] animate-pulse" />
            </div>
            <span className="hidden sm:block font-heading text-lg font-bold tracking-tight text-white">
              DP <span className="text-gradient">Laptop</span> Advisor
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon    = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold font-heading transition-all duration-200 ${
                    isActive
                      ? "text-violet-300 bg-violet-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-violet-500/12 border border-violet-500/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── CTA + Hamburger ── */}
          <div className="flex items-center gap-3">
            <Link
              to="/recommend"
              className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get AI Pick
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-violet-500/10 bg-[#030014]/95 backdrop-blur-2xl"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold font-heading transition-all ${
                      isActive
                        ? "bg-violet-500/12 text-violet-300 border border-violet-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link to="/recommend" className="btn-primary w-full justify-center text-sm py-3">
                  <Sparkles className="h-4 w-4" />
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

function Footer() {
  return (
    <footer className="relative mt-auto border-t border-violet-500/10 bg-[#030014]">
      <div className="absolute inset-0 opacity-30"
        style={{backgroundImage:"linear-gradient(to right, transparent, rgba(139,92,246,0.05), rgba(6,182,212,0.03), transparent)"}}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-heading font-bold text-white text-sm">DP Laptop Advisor</div>
              <div className="text-xs text-slate-500">AI-Powered · 3,976 Real Laptops</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 text-center">
            {[
              { value: "3,976", label: "Laptops" },
              { value: "62D",   label: "Features" },
              { value: "100%",  label: "Real Data" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-base font-bold font-heading text-gradient">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="text-xs text-slate-600">
            © {new Date().getFullYear()} DP Laptop Advisor · Scikit-Learn Cosine Similarity
          </div>
        </div>
      </div>
    </footer>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="flex-grow"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-app bg-grid">
        <Navigation />
        <main className="flex flex-grow flex-col">
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
  );
}
