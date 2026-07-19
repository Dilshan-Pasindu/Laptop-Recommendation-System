import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon, SlidersHorizontal, Heart, GitCompare,
  ChevronLeft, ChevronRight, X, Cpu, HardDrive, Battery,
  Monitor, RotateCcw, Zap, Filter
} from "lucide-react";
import { getLaptops, toggleFavorite, getFavorites } from "../services/api";

/* ── Laptop Card ──────────────────────────────────────────── */
function LaptopCard({ laptop, isFav, onFav, onCompare }) {
  const rating = laptop.Overall_Rating ?? 0;
  const ratingColor =
    rating >= 70 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/8" :
    rating >= 50 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/8" :
                   "text-slate-400 border-slate-500/30 bg-slate-500/8";

  return (
    <Link to={`/laptop/${laptop.id}`} className="block group">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="laptop-card p-5 h-full flex flex-col"
      >
        {/* Brand + Rating */}
        <div className="flex items-start justify-between mb-3">
          <span className="badge-purple text-[10px]">{laptop.Brand}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${ratingColor}`}>
            {Math.round(rating)}/100
          </span>
        </div>

        {/* Name */}
        <h3 className="font-heading text-sm font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-gradient transition-all duration-300 flex-1">
          {laptop.Name}
        </h3>

        {/* Price */}
        <p className="text-xl font-black font-heading text-white mt-2 mb-4">
          ₹{laptop.Price.toLocaleString()}
        </p>

        {/* Specs chips */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {[
            { icon: Cpu,       val: `${laptop.RAM_GB} GB RAM` },
            { icon: HardDrive, val: `${laptop.Storage_GB} GB` },
            { icon: Monitor,   val: `${laptop.Display_Size}"` },
            { icon: Battery,   val: `${laptop.Battery_Hours}h` },
          ].map(({ icon: Icon, val }) => (
            <div key={val} className="flex items-center gap-1.5 bg-white/3 border border-white/5 rounded-lg px-2 py-1.5">
              <Icon className="h-3 w-3 text-slate-500 shrink-0" />
              <span className="text-[11px] text-slate-300 truncate">{val}</span>
            </div>
          ))}
        </div>

        {/* CPU label */}
        <div className="text-[11px] text-slate-500 truncate mb-4">
          <Zap className="inline h-3 w-3 mr-1 text-violet-500" />
          {laptop.Processor_Name}
        </div>

        {/* Action row */}
        <div className="flex gap-1.5 mt-auto" onClick={(e) => e.preventDefault()}>
          <button
            onClick={() => onCompare(laptop.id, laptop.Name)}
            className="btn-ghost text-xs py-1.5 px-2.5 flex-1 border border-white/6 hover:border-cyan-500/30 hover:text-cyan-300"
          >
            <GitCompare className="h-3.5 w-3.5" /> Compare
          </button>
          <button
            onClick={(e) => onFav(laptop.id, e)}
            className={`p-1.5 rounded-xl border transition-all ${
              isFav
                ? "border-pink-500/40 bg-pink-500/10 text-pink-400"
                : "border-white/6 text-slate-500 hover:text-pink-400 hover:border-pink-500/30"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Filter Panel ─────────────────────────────────────────── */
function FilterPanel({ filters, meta, onChange, onClear }) {
  const fields = [
    { name: "brand",           label: "Brand",         opts: (meta.brands || []).map((b) => [b, b]) },
    { name: "purpose",         label: "Purpose",        opts: (meta.purposes || []).map((p) => [p, p]) },
    { name: "processor_brand", label: "Processor",      opts: (meta.processor_brands || []).map((p) => [p, p]) },
    { name: "gpu_brand",       label: "GPU Brand",      opts: [["NVIDIA","NVIDIA"],["Intel","Intel"],["AMD","AMD"],["Apple","Apple"],["ARM","ARM"]] },
    { name: "display_type",    label: "Display Panel",  opts: [["LED","LED"],["LCD","LCD"]] },
    { name: "min_ram",         label: "Min RAM",        opts: [["4","4 GB"],["8","8 GB"],["16","16 GB"],["32","32 GB"]] },
    { name: "min_storage",     label: "Min Storage",    opts: [["128","128 GB"],["256","256 GB"],["512","512 GB"],["1024","1 TB"]] },
  ];

  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="glass rounded-2xl border border-violet-500/12 p-5 space-y-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-violet-400" />
          <span className="font-heading font-bold text-white text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="badge-purple text-[10px] px-1.5 py-0.5">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-[11px] text-slate-500 hover:text-violet-400 transition flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Price range */}
      <div>
        <label className="form-label">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number" name="price_min" placeholder="Min"
            value={filters.price_min} onChange={onChange}
            className="input-field text-xs py-2 px-3"
          />
          <input
            type="number" name="price_max" placeholder="Max"
            value={filters.price_max} onChange={onChange}
            className="input-field text-xs py-2 px-3"
          />
        </div>
      </div>

      {/* Dynamic selects */}
      {fields.map(({ name, label, opts }) => (
        <div key={name}>
          <label className="form-label">{label}</label>
          <select name={name} value={filters[name]} onChange={onChange} className="select-field text-xs py-2">
            <option value="">All</option>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function SearchBrowse() {
  const navigate = useNavigate();
  const [query,   setQuery]   = useState("");
  const [page,    setPage]    = useState(1);
  const [data,    setData]    = useState({ laptops: [], total: 0, pages: 0, meta: {} });
  const [loading, setLoading] = useState(true);
  const [favs,    setFavs]    = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    brand: "", processor_brand: "", gpu_brand: "", display_type: "",
    price_min: "", price_max: "", min_ram: "", min_storage: "", purpose: "",
  });

  const loadLaptops = async () => {
    setLoading(true);
    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const res    = await getLaptops({ page, limit: 12, q: query || undefined, ...active });
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLaptops(); }, [page, filters]);
  useEffect(() => {
    getFavorites().then((r) => setFavs(r.data.map((i) => i.id))).catch(console.error);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadLaptops(); };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ brand:"", processor_brand:"", gpu_brand:"", display_type:"", price_min:"", price_max:"", min_ram:"", min_storage:"", purpose:"" });
    setQuery(""); setPage(1);
  };

  const handleFav = async (id, e) => {
    e.preventDefault();
    try {
      const r = await toggleFavorite(id);
      setFavs((p) => r.data.status === "added" ? [...p, id] : p.filter((x) => x !== id));
    } catch { /* noop */ }
  };

  const handleCompare = (id, name) => {
    localStorage.setItem("compare_id1", id);
    localStorage.setItem("compare_name1", name);
    navigate("/compare");
  };

  const { laptops, total, pages, meta } = data;
  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-4xl font-black text-white md:text-5xl">
            Search & <span className="text-gradient">Browse</span>
          </h1>
          <p className="mt-2 text-slate-400">
            {total ? `${total.toLocaleString()} laptops` : "3,976 laptops"} — filter by specs, brand, or purpose
          </p>
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={`md:hidden btn-secondary text-sm relative ${activeFilterCount > 0 ? "border-violet-500/40" : ""}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Sidebar Filters (Desktop) ── */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterPanel filters={filters} meta={meta} onChange={handleFilterChange} onClear={handleClearFilters} />
        </div>

        {/* ── Mobile Filter Drawer ── */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0520] border-r border-violet-500/15 p-5 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="font-heading font-bold text-white">Filters</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost p-1.5">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterPanel filters={filters} meta={meta} onChange={handleFilterChange} onClear={handleClearFilters} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, brand, processor…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field pl-12 pr-4 py-3.5"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setPage(1); loadLaptops(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-6 py-3">
              Search
            </button>
          </form>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).filter(([, v]) => v !== "").map(([k, v]) => (
                <span key={k} className="badge-purple text-xs flex items-center gap-1.5">
                  {k.replace(/_/g, " ")}: {v}
                  <button onClick={() => { setFilters((p) => ({ ...p, [k]: "" })); setPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Results header */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {loading ? "Searching…" : `Showing ${laptops.length} of ${total?.toLocaleString() || 0} results`}
            </span>
            {pages > 1 && (
              <span className="text-slate-600">Page {page} of {pages}</span>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="laptop-card p-5 space-y-3">
                    <div className="skeleton h-4 w-16 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-8 w-24 rounded mt-4" />
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map((j) => <div key={j} className="skeleton h-8 rounded-lg" />)}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : laptops.length > 0 ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {laptops.map((laptop) => (
                  <LaptopCard
                    key={laptop.id}
                    laptop={laptop}
                    isFav={favs.includes(laptop.id)}
                    onFav={handleFav}
                    onCompare={handleCompare}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-24 text-center glass rounded-3xl border border-white/5">
                <SearchIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold text-white mb-2">No laptops found</h3>
                <p className="text-sm text-slate-500 mb-6">Try adjusting your search query or clearing some filters.</p>
                <button onClick={handleClearFilters} className="btn-secondary text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={page === 1}
                onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="btn-secondary text-sm py-2.5 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return pg <= pages ? (
                    <button
                      key={pg}
                      onClick={() => { setPage(pg); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`h-9 w-9 rounded-xl text-sm font-semibold font-heading transition-all ${
                        pg === page
                          ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {pg}
                    </button>
                  ) : null;
                })}
              </div>

              <button
                disabled={page === pages}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="btn-secondary text-sm py-2.5 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
