import {
  BarChart3, Users, TrendingUp, Target, Activity,
  Map, ChevronLeft, ChevronRight, Menu, X, LayoutDashboard, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Trends', icon: TrendingUp },
  { id: 'regions', label: 'Regional Analysis', icon: Map },
  { id: 'categories', label: 'Category Performance', icon: BarChart3 },
  { id: 'customers', label: 'Customer Segments', icon: Users },
  { id: 'churn', label: 'Churn Risk', icon: Target },
  { id: 'forecast', label: 'Forecasting', icon: Activity },
];

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-5 left-5 z-50 w-10 h-10 rounded-xl flex items-center justify-center click-scale"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
        aria-label="Open navigation"
      >
        <Menu size={18} className="text-white/50" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 animate-fade-in"
          style={{ background: 'rgba(6,10,19,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className={`
          sidebar fixed top-0 left-0 h-full z-50
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-white/[0.03]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(16,185,129,0.15) 100%)',
              border: '1px solid rgba(59,130,246,0.15)',
            }}
          >
            <BarChart3 size={15} className="text-electric-light" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/90 whitespace-nowrap tracking-tight">Sales Intelligence</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
          {/* Desktop collapse toggle — inside header */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {/* Nav label */}
        {!collapsed && (
          <div className="px-5 pt-6 pb-2">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/15">Navigation</p>
          </div>
        )}

        {/* Navigation */}
        <nav className={`px-3 flex flex-col gap-0.5 ${collapsed ? 'mt-6' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center !px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" style={{ strokeWidth: 1.5 }} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Live indicator */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-4 border-t border-white/[0.03]">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald pulse-dot shrink-0" />
            {!collapsed && (
              <span className="text-[11px] text-white/20 font-medium">System Active</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export { navItems };
