import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './utils/api';
import LoadingScreen from './components/LoadingScreen';
import Particles from './components/Particles';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import KPICards from './components/KPICards';
import Filters from './components/Filters';
import SalesTrendChart from './components/SalesTrendChart';
import RegionChart from './components/RegionChart';
import CategoryChart from './components/CategoryChart';
import SegmentBubbleChart from './components/SegmentBubbleChart';
import ChurnHeatmap from './components/ChurnHeatmap';
import ForecastChart from './components/ForecastChart';

function SectionHeader({ label, title }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-electric/40 mb-1.5">{label}</p>
      <h2 className="text-[22px] font-bold text-white/90 tracking-tight">{title}</h2>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterValues, setFilterValues] = useState({ region: '', category: '', start: '', end: '' });
  const [lastRefreshed, setLastRefreshed] = useState('');

  const sectionRefs = {
    overview: useRef(null),
    sales: useRef(null),
    regions: useRef(null),
    categories: useRef(null),
    customers: useRef(null),
    churn: useRef(null),
    forecast: useRef(null),
  };

  const [kpis, setKpis] = useState(null);
  const [filters, setFilters] = useState(null);
  const [regionTrends, setRegionTrends] = useState([]);
  const [categoryTrends, setCategoryTrends] = useState([]);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [segmentSummary, setSegmentSummary] = useState([]);
  const [churnData, setChurnData] = useState([]);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [kpiData, filterData, regionTrendData, categoryTrendData, regionData, categoryData, segmentData, churnDist, forecastData] =
          await Promise.all([
            api.getKPIs(), api.getFilters(),
            api.getSalesTrends({ by: 'region' }), api.getSalesTrends({ by: 'category' }),
            api.getRegions(), api.getCategories(),
            api.getSegmentSummary(), api.getChurnDistribution(), api.getForecast(),
          ]);
        setKpis(kpiData); setFilters(filterData);
        setRegionTrends(regionTrendData); setCategoryTrends(categoryTrendData);
        setRegions(regionData); setCategories(categoryData);
        setSegmentSummary(segmentData); setChurnData(churnDist); setForecast(forecastData);
        setLastRefreshed(new Date().toLocaleString());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      const params = {};
      if (filterValues.region) params.region = filterValues.region;
      if (filterValues.category) params.category = filterValues.category;
      if (filterValues.start) params.start = filterValues.start;
      if (filterValues.end) params.end = filterValues.end;
      try {
        const [regionData, categoryData] = await Promise.all([
          api.getSalesTrends({ ...params, by: 'region' }),
          api.getSalesTrends({ ...params, by: 'category' }),
        ]);
        setRegionTrends(regionData); setCategoryTrends(categoryData);
      } catch (err) { console.error('Failed to fetch filtered data:', err); }
    }
    fetchFiltered();
  }, [filterValues]);

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    const ref = sectionRefs[sectionId];
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => { for (const entry of entries) { if (entry.isIntersecting) setActiveSection(entry.target.dataset.section); } },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) { ref.current.dataset.section = key; observer.observe(ref.current); }
    });
    return () => observer.disconnect();
  }, [loading]);

  const handleLoadComplete = useCallback(() => setLoading(false), []);
  if (loading) return <LoadingScreen onComplete={handleLoadComplete} />;

  const sidebarWidth = sidebarCollapsed ? 68 : 240;

  return (
    <div className="min-h-screen" style={{ background: '#060a13', '--sidebar-w': `${sidebarWidth}px` }}>
      {/* Ambient layers */}
      <div className="gradient-mesh">
        <div className="gradient-orb gradient-orb--blue" />
        <div className="gradient-orb gradient-orb--emerald" />
        <div className="gradient-orb gradient-orb--purple" />
      </div>
      <div className="noise-overlay" />
      <Particles count={18} />

      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <main className="main-content relative z-10">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-8 pt-20 lg:pt-10">

          {/* ── Overview ──────────────────────────────────────────────── */}
          <section ref={sectionRefs.overview} className="scroll-mt-24">
            <HeroSection kpis={kpis} lastRefreshed={lastRefreshed} />
            <div className="mb-14">
              <KPICards kpis={kpis} />
            </div>
          </section>

          {/* ── Filters ───────────────────────────────────────────────── */}
          <section className="mb-10">
            <Filters filters={filters} values={filterValues} onChange={setFilterValues} />
          </section>

          {/* ── Sales Trends ──────────────────────────────────────────── */}
          <section ref={sectionRefs.sales} className="scroll-mt-24 mb-14">
            <SectionHeader label="Revenue Analytics" title="Sales Trends" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <SalesTrendChart data={regionTrends} groupBy="region" />
              <SalesTrendChart data={categoryTrends} groupBy="category" />
            </div>
          </section>

          <div className="section-divider" />

          {/* ── Regional ──────────────────────────────────────────────── */}
          <section ref={sectionRefs.regions} className="scroll-mt-24 mb-14">
            <SectionHeader label="Geographic Distribution" title="Regional Analysis" />
            <RegionChart data={regions} />
          </section>

          <div className="section-divider" />

          {/* ── Categories ────────────────────────────────────────────── */}
          <section ref={sectionRefs.categories} className="scroll-mt-24 mb-14">
            <SectionHeader label="Product Intelligence" title="Category Performance" />
            <CategoryChart data={categories} />
          </section>

          <div className="section-divider" />

          {/* ── Customers ─────────────────────────────────────────────── */}
          <section ref={sectionRefs.customers} className="scroll-mt-24 mb-14">
            <SectionHeader label="Customer Intelligence" title="Segmentation Analysis" />
            <SegmentBubbleChart data={segmentSummary} />
          </section>

          <div className="section-divider" />

          {/* ── Churn ─────────────────────────────────────────────────── */}
          <section ref={sectionRefs.churn} className="scroll-mt-24 mb-14">
            <SectionHeader label="Risk Assessment" title="Churn Risk Analysis" />
            <ChurnHeatmap data={churnData} />
          </section>

          <div className="section-divider" />

          {/* ── Forecast ──────────────────────────────────────────────── */}
          <section ref={sectionRefs.forecast} className="scroll-mt-24 mb-14">
            <SectionHeader label="Predictive Models" title="Revenue Forecasting" />
            <ForecastChart data={forecast} />
          </section>

          {/* Footer */}
          <footer className="text-center py-12 border-t border-white/[0.03]">
            <p className="text-[11px] text-white/10 font-medium">
              Sales Performance & Customer Intelligence Hub
            </p>
            <p className="text-[10px] text-white/6 mt-1.5">
              9,994 transactions / 793 customers / 2014–2017 / Python, R, Node.js, React
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
