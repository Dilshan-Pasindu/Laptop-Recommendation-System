import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon, SlidersHorizontal, Heart, GitCompare,
  ChevronLeft, ChevronRight, X, Cpu, HardDrive, Battery,
  Monitor, RotateCcw, Filter
} from "lucide-react";
import { getLaptops, toggleFavorite, getFavorites } from "../services/api";

/* ── Laptop Card ────────────────────────────────────────────── */
function LaptopCard({ laptop, isFav, onFav, onCompare }) {
  const rating = laptop.Overall_Rating ?? 0;
  const ratingColor =
    rating >= 70 ? { bg: "rgba(52,199,89,0.1)",  text: "#28A745", border: "rgba(52,199,89,0.2)" } :
    rating >= 50 ? { bg: "rgba(255,149,0,0.1)",  text: "#E05A00", border: "rgba(255,149,0,0.2)" } :
                   { bg: "rgba(0,0,0,0.04)",      text: "var(--text-secondary)", border: "var(--border-subtle)" };

  return (
    <Link to={`/laptop/${laptop.id}`} style={{ display: "block", textDecoration: "none" }}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="laptop-card"
        style={{ padding: "1.125rem", height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Brand + Rating */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>{laptop.Brand}</span>
          <span style={{
            fontSize: "0.7rem", fontWeight: 700,
            background: ratingColor.bg, color: ratingColor.text,
            border: `1px solid ${ratingColor.border}`,
            padding: "0.15rem 0.5rem", borderRadius: 20,
          }}>
            {Math.round(rating)}/100
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.45,
          color: "var(--text-primary)", marginBottom: "0.25rem", flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {laptop.Name}
        </h3>

        {/* Price */}
        <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)", marginBottom: "0.875rem", marginTop: "0.5rem" }}>
          RS {laptop.Price.toLocaleString()}
        </p>

        {/* Spec chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem", marginBottom: "0.875rem" }}>
          {[
            { icon: Cpu,       val: `${laptop.RAM_GB} GB RAM` },
            { icon: HardDrive, val: `${laptop.Storage_GB} GB` },
            { icon: Monitor,   val: `${laptop.Display_Size}"` },
            { icon: Battery,   val: `${laptop.Battery_Hours}h` },
          ].map(({ icon: Icon, val }) => (
            <div key={val} style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
              borderRadius: 8, padding: "0.375rem 0.5rem",
            }}>
              <Icon style={{ width: 11, height: 11, color: "var(--text-tertiary)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          style={{ display: "flex", gap: "0.5rem" }}
          onClick={(e) => e.preventDefault()}
        >
          <button
            onClick={() => onFav(laptop.id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border-medium)",
              background: "var(--bg-base)",
              color: isFav ? "#FF3B30" : "var(--text-tertiary)",
              cursor: "pointer", transition: "all 0.15s",
              flexShrink: 0,
            }}
            aria-label="Favourite"
          >
            <Heart style={{ width: 13, height: 13 }} fill={isFav ? "#FF3B30" : "none"} />
          </button>
          <button
            onClick={() => onCompare(laptop.id)}
            className="btn-secondary"
            style={{ flex: 1, fontSize: "0.75rem", padding: "0 0.5rem", height: 32 }}
          >
            <GitCompare style={{ width: 13, height: 13 }} />
            Compare
          </button>
          <Link
            to={`/laptop/${laptop.id}`}
            className="btn-primary"
            style={{ flex: 1, fontSize: "0.75rem", padding: "0 0.5rem", height: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Filter Panel ──────────────────────────────────────────── */
function FilterPanel({ filters, meta, onChange, onReset }) {
  const select = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Price Range */}
      <div>
        <label className="form-label">Price Range (RS)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <input
            type="number" placeholder="Min" value={filters.price_min || ""}
            onChange={(e) => select("price_min", e.target.value || undefined)}
            className="input-field"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 0.625rem" }}
          />
          <input
            type="number" placeholder="Max" value={filters.price_max || ""}
            onChange={(e) => select("price_max", e.target.value || undefined)}
            className="input-field"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 0.625rem" }}
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="form-label">Brand</label>
        <select value={filters.brand || ""} onChange={(e) => select("brand", e.target.value || undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">All Brands</option>
          {(meta?.brands || []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Processor */}
      <div>
        <label className="form-label">Processor</label>
        <select value={filters.processor_brand || ""} onChange={(e) => select("processor_brand", e.target.value || undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">All</option>
          {(meta?.processor_brands || []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* GPU Brand */}
      <div>
        <label className="form-label">GPU Brand</label>
        <select value={filters.gpu_brand || ""} onChange={(e) => select("gpu_brand", e.target.value || undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">All</option>
          {["NVIDIA", "AMD", "Intel", "Apple"].map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label className="form-label">Purpose</label>
        <select value={filters.purpose || ""} onChange={(e) => select("purpose", e.target.value || undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">Any Purpose</option>
          {["Programming","AI Development","Gaming","Video Editing","Student","Office"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Min RAM */}
      <div>
        <label className="form-label">Min RAM</label>
        <select value={filters.min_ram || ""} onChange={(e) => select("min_ram", e.target.value ? parseInt(e.target.value) : undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">Any</option>
          {[4, 8, 16, 32, 64].map((r) => <option key={r} value={r}>{r} GB</option>)}
        </select>
      </div>

      {/* Min Storage */}
      <div>
        <label className="form-label">Min Storage</label>
        <select value={filters.min_storage || ""} onChange={(e) => select("min_storage", e.target.value ? parseInt(e.target.value) : undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">Any</option>
          {[128, 256, 512, 1024, 2048].map((s) => <option key={s} value={s}>{s >= 1024 ? `${s/1024} TB` : `${s} GB`}</option>)}
        </select>
      </div>

      {/* Display Type */}
      <div>
        <label className="form-label">Display Type</label>
        <select value={filters.display_type || ""} onChange={(e) => select("display_type", e.target.value || undefined)} className="select-field" style={{ fontSize: "0.8125rem" }}>
          <option value="">All</option>
          <option value="LED">LED</option>
          <option value="LCD">LCD</option>
        </select>
      </div>

      {/* Reset */}
      <button onClick={onReset} className="btn-secondary" style={{ marginTop: "0.25rem" }}>
        <RotateCcw style={{ width: 14, height: 14 }} />
        Reset Filters
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SEARCH & BROWSE PAGE
════════════════════════════════════════════════════════════ */
const EMPTY_FILTERS = {};

export default function SearchBrowse() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ laptops: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLaptops({ q: query || undefined, ...filters, page, limit: 12 });
      setData({ laptops: res.data.laptops || [], total: res.data.total || 0, pages: res.data.pages || 0 });
      if (res.data.meta && !meta) setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [query, filters, page]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    getFavorites().then((r) => setFavorites((r.data || []).map((f) => f.id))).catch(() => {});
  }, []);

  const handleFav = async (id) => {
    try {
      const r = await toggleFavorite(id);
      setFavorites(r.data.favorites || []);
    } catch (e) { console.error(e); }
  };

  const handleCompare = (id) => {
    localStorage.setItem("compare_id1", id);
    navigate("/compare");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetch();
  };

  const resetFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };

  const activeFilterCount = Object.keys(filters).filter((k) => filters[k] !== undefined && filters[k] !== "").length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.25rem" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
          Search &amp; <span className="text-gradient">Browse</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          {data.total.toLocaleString()} laptops — filter by specs, brand, or purpose
        </p>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.625rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <SearchIcon style={{
            position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
            width: 16, height: 16, color: "var(--text-tertiary)", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Search by name, brand, processor…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="input-field"
            style={{ paddingLeft: "2.625rem", fontSize: "0.9375rem", height: 44 }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ height: 44, padding: "0 1.25rem", flexShrink: 0 }}>
          Search
        </button>
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className={activeFilterCount > 0 ? "btn-primary" : "btn-secondary"}
          style={{ height: 44, padding: "0 1rem", flexShrink: 0, position: "relative" }}
        >
          <SlidersHorizontal style={{ width: 15, height: 15 }} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -6,
              width: 18, height: 18, borderRadius: "50%",
              background: "#FF3B30", color: "#fff",
              fontSize: "0.65rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* ── Body: Sidebar + Grid ── */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              key="filter-panel"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 280 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ flexShrink: 0, overflow: "hidden" }}
            >
              <div style={{
                width: 280,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)",
                position: "sticky",
                top: "calc(var(--nav-h) + 1rem)",
              }}>
                {/* Panel header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    <Filter style={{ width: 15, height: 15, color: "var(--accent)" }} />
                    Filters
                  </div>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="btn-icon"
                    style={{ width: 26, height: 26 }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <FilterPanel filters={filters} meta={meta} onChange={(f) => { setFilters(f); setPage(1); }} onReset={resetFilters} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Result count */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "1rem", fontSize: "0.8125rem", color: "var(--text-secondary)",
          }}>
            <span>
              <strong style={{ color: "var(--text-primary)" }}>{data.total.toLocaleString()}</strong> results
              {page > 1 && ` · Page ${page} of ${data.pages}`}
            </span>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="btn-ghost" style={{ fontSize: "0.8rem" }}>
                <X style={{ width: 12, height: 12 }} /> Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  height: 260, borderRadius: "var(--radius-lg)",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                }}>
                  <div className="skeleton" style={{ height: "100%", borderRadius: "var(--radius-lg)" }} />
                </div>
              ))}
            </div>
          ) : data.laptops.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "4rem 1rem",
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xs)",
            }}>
              <SearchIcon style={{ width: 40, height: 40, color: "var(--text-tertiary)", margin: "0 auto 1rem" }} />
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>No laptops found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                Try adjusting your search or filters.
              </p>
              <button onClick={resetFilters} className="btn-secondary" style={{ margin: "0 auto" }}>
                <RotateCcw style={{ width: 14, height: 14 }} /> Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              <AnimatePresence mode="popLayout">
                {data.laptops.map((l) => (
                  <LaptopCard
                    key={l.id}
                    laptop={l}
                    isFav={favorites.includes(l.id)}
                    onFav={handleFav}
                    onCompare={handleCompare}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {data.pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
                style={{ padding: "0.5rem 0.875rem", opacity: page === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft style={{ width: 15, height: 15 }} />
                Prev
              </button>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", padding: "0 0.75rem" }}>
                Page <strong style={{ color: "var(--text-primary)" }}>{page}</strong> of {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="btn-secondary"
                style={{ padding: "0.5rem 0.875rem", opacity: page === data.pages ? 0.4 : 1 }}
              >
                Next
                <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
