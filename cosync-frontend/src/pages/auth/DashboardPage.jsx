import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import api from "../../lib/api";
import { PROJECT_STATUS, APP_STATUS, ROLE_COLORS } from "../../lib/utils";

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard", active: true },
  { icon: "🔍", label: "Browse Projects", path: "/feed", active: false },
  { icon: "📁", label: "My Projects", path: "/my-projects", active: false },
  { icon: "📨", label: "Applications", path: "/applications", active: false },
  { icon: "👤", label: "Profile", path: "/profile", active: false },
  { icon: "🔔", label: "Notifications", path: "/notifications", badge: 3, active: false },
];

const StatusBadge = ({ status }) => {
  const s = PROJECT_STATUS[status] || APP_STATUS[status] || PROJECT_STATUS.open;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${s.color || "rgba(139,92,246,0.2)"}`, color: s.color || "#a78bfa" }}>
      ● {s.label || status}
    </span>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const displayName = user?.fullName || user?.name || "User";

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? 64 : 240,
        background: "rgba(8,5,25,0.98)",
        borderRight: "1px solid rgba(139,92,246,0.1)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
            <span className="font-semibold text-white tracking-tight">CoSync</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm mx-auto"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: 16 }}>‹</button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="mx-auto mt-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#374151" }}>›</button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
            style={{
              background: item.active ? "rgba(124,58,237,0.15)" : "transparent",
              border: item.active ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
              color: item.active ? "#a78bfa" : "#4b5563",
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.color = "#9ca3af"; } }}
            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; } }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: "#7c3aed", color: "#fff", fontSize: 10 }}>{item.badge}</span>
            )}
            {/* Tooltip on collapse */}
            {collapsed && (
              <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-2 pb-4" style={{ borderTop: "1px solid rgba(139,92,246,0.08)", paddingTop: 12 }}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff" }}>
              {displayName[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-xs truncate" style={{ color: "#4b5563" }}>{user?.email || ""}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", justifyContent: collapsed ? "center" : "flex-start" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "none"; }}
        >
          <span style={{ fontSize: 15 }}>⎋</span>
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ stat, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: hovered ? "rgba(20,12,50,0.9)" : "rgba(12,8,32,0.8)",
        border: `1px solid ${hovered ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.1)"}`,
        transform: hovered ? "translateY(-2px)" : "none",
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: stat.bg }}>
          {stat.icon}
        </div>
        <span className="text-xs" style={{ color: "#374151" }}>↑ this week</span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.02em" }}>{stat.value}</p>
      <p className="text-xs" style={{ color: "#4b5563" }}>{stat.label}</p>
    </div>
  );
};

// ── My Project Card ───────────────────────────────────────────────────────────
const MyProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 cursor-pointer"
      style={{
        background: hovered ? "rgba(20,12,50,0.95)" : "rgba(12,8,32,0.8)",
        border: `1px solid ${hovered ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.1)"}`,
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(109,40,217,0.15)" : "none",
      }}
      onClick={() => navigate(`/projects/${project._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top line on hover */}
      <div className="h-px mb-4 rounded-full transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)", opacity: hovered ? 1 : 0 }} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-sm mb-1">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.roles?.map((r, i) => {
          const title = r.title;
          const color = ROLE_COLORS[i % ROLE_COLORS.length];
          return (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: `${color}12`, border: `1px solid ${color}30`, color: color }}>
              <span className="w-1 h-1 rounded-full" style={{ background: color }} />{title}
            </span>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs" style={{ color: "#374151" }}>Project progress</span>
          <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{project.progress ?? 0}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${project.progress ?? 0}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
        </div>
      </div>

      {/* Stack */}
      <div className="flex flex-wrap gap-1 mb-4">
        {project.stack?.map((s, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.04)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.06)" }}>{s}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#4b5563" }}>
            <span style={{ color: "#6b7280" }}>{project.applicationCount ?? 0}</span> applicants
          </span>
          <span className="text-xs" style={{ color: "#374151" }}>· {project.members?.length ?? 0} members</span>
        </div>
        <span className="text-xs" style={{ color: "#374151" }}>Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}</span>
      </div>
    </div>
  );
};

// ── Applied Project Row ───────────────────────────────────────────────────────
const AppliedRow = ({ project, index }) => {
  const pData = project.project || project;
  const title = pData.title || "Project";
  const color = pData.color || "#a78bfa";
  return (
    <div
      className="flex items-center justify-between py-3.5 transition-all duration-200"
      style={{
        borderBottom: "1px solid rgba(139,92,246,0.06)",
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30`, color: color }}>
          {title[0]}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-xs" style={{ color: "#4b5563" }}>
            {project.role || 'Contributor'} · by {pData.owner?.fullName || 'Member'}
          </p>
        </div>
      </div>
      <StatusBadge status={project.status} />
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, desc, action, onAction }) => (
  <div className="text-center py-10">
    <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
      style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <p className="text-white text-sm font-medium mb-1">{title}</p>
    <p className="text-xs mb-4" style={{ color: "#374151" }}>{desc}</p>
    {action && (
      <button onClick={onAction} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
        {action}
      </button>
    )}
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/users/dashboard')
        setDashboard(res.data.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load dashboard.')
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const displayName = user?.fullName || user?.name || "Builder";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <div className="flex justify-center p-20"><p className="text-gray-400">Loading dashboard...</p></div>
  if (error) return <div className="flex justify-center p-20"><p className="text-red-400">{error}</p></div>
  if (!dashboard) return null

  const STATS = [
    { label: "Projects Posted", value: dashboard.stats.projectsPosted || 0, icon: "📁", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
    { label: "Applications Sent", value: dashboard.stats.applicationsSubmitted || 0, icon: "📨", color: "#61dafb", bg: "rgba(97,218,251,0.12)" },
    { label: "Match Score", value: "87%", icon: "⚡", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 currentColor; }
          50% { opacity:0.7; }
        }
        @keyframes shimmer {
          0% { background-position:-200% 0; }
          100% { background-position:200% 0; }
        }
        .topbar-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px; font-size: 0.8rem;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
          border: none;
        }
        .section-card {
          border-radius: 20px;
          background: rgba(12,8,32,0.8);
          border: 1px solid rgba(139,92,246,0.1);
          padding: 20px;
        }
        .section-title {
          font-size: 0.875rem; font-weight: 600;
          color: #fff; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
      `}</style>

      <div className="flex min-h-screen" style={{ background: "#05030f", fontFamily: "'DM Sans',system-ui,sans-serif" }}>

        {/* ── Sidebar ── */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={handleLogout} />

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Top bar ── */}
          <header
            className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
            style={{
              background: "rgba(5,3,15,0.9)",
              borderBottom: "1px solid rgba(139,92,246,0.08)",
              backdropFilter: "blur(20px)",
              animation: "slideDown 0.4s ease both",
            }}
          >
            <div>
              <p className="text-xs mb-0.5" style={{ color: "#4b5563" }}>{greeting},</p>
              <h2 className="text-white font-bold text-base" style={{ letterSpacing: "-0.01em" }}>
                {displayName} 👋
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="topbar-btn relative"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280" }}
              >
                <span style={{ fontSize: 14 }}>🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "#7c3aed", color: "#fff", fontSize: 9 }}>3</span>
              </button>

              <button
                onClick={() => navigate("/feed")}
                className="topbar-btn"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#9ca3af" }}
              >
                <span style={{ fontSize: 12 }}>🔍</span>
                Browse
              </button>

              <button
                onClick={() => navigate("/projects/create")}
                className="topbar-btn"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }}
              >
                <span style={{ fontSize: 12 }}>+</span>
                New Project
              </button>
            </div>
          </header>

          {/* ── Page body ── */}
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">

            {/* ── Welcome banner ── */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "rgba(12,8,32,0.9)",
                border: "1px solid rgba(139,92,246,0.15)",
                animation: "fadeUp 0.5s ease both",
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(109,40,217,0.15) 0%, transparent 60%)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                  <span className="text-xs font-medium" style={{ color: "#4ade80" }}>Profile active · 87% match score</span>
                </div>
                <h2 className="text-white font-bold text-xl mb-1" style={{ letterSpacing: "-0.02em" }}>
                  Ready to build something great?
                </h2>
                <p className="text-sm mb-4" style={{ color: "#4b5563" }}>
                  You have <span style={{ color: "#a78bfa" }}>{dashboard.stats.applicationsSubmitted || 0} applications</span> submitted and <span style={{ color: "#4ade80" }}>{dashboard.stats.activeTeams || 0} active teams</span>.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate("/projects/create")}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    + Post a new project
                  </button>
                  <button
                    onClick={() => navigate("/feed")}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#9ca3af", cursor: "pointer" }}
                  >
                    Browse projects →
                  </button>
                </div>
              </div>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
            </div>

            {/* ── Two column layout ── */}
            <div className="grid lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <div className="section-card" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.2s" }}>
                  <div className="section-title">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14 }}>📁</span>
                      My Projects
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                        {dashboard.recentProjects.length}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/my-projects")}
                      className="text-xs transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}
                    >
                      View all →
                    </button>
                  </div>

                  {dashboard.recentProjects.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.recentProjects.map(p => <MyProjectCard key={p._id} project={p} />)}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📁"
                      title="No projects yet"
                      desc="Post your first project and start finding teammates"
                      action="+ Post a project"
                      onAction={() => navigate("/projects/create")}
                    />
                  )}
                </div>

                <div className="section-card" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.3s" }}>
                  <div className="section-title">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14 }}>📨</span>
                      Applied Projects
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                        {dashboard.recentApplications.length}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/applications")}
                      className="text-xs transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}
                    >
                      View all →
                    </button>
                  </div>

                  {dashboard.recentApplications.length > 0 ? (
                    <div>
                      {dashboard.recentApplications.map((p, i) => <AppliedRow key={p._id} project={p} index={i} />)}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📨"
                      title="No applications yet"
                      desc="Browse open projects and apply to join a team"
                      action="Browse projects"
                      onAction={() => navigate("/feed")}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="section-card" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.25s" }}>
                  <div className="section-title">
                    <span>Quick actions</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: "➕", label: "Post a project", desc: "Find your team", action: () => navigate("/projects/create"), color: "#7c3aed" },
                      { icon: "🔍", label: "Browse projects", desc: "Find work to join", action: () => navigate("/feed"), color: "#61dafb" },
                      { icon: "👤", label: "Edit profile", desc: "Update your skills", action: () => navigate("/profile"), color: "#4ade80" },
                      { icon: "🔔", label: "Notifications", desc: "3 unread alerts", action: () => { }, color: "#fb923c" },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left"
                        style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)", cursor: "pointer" }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}15` }}>
                          <span style={{ fontSize: 14 }}>{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{item.label}</p>
                          <p className="text-xs" style={{ color: "#374151" }}>{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {dashboard.recentApplications.length > 0 && (
                  <div className="section-card" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.35s" }}>
                    <div className="section-title">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14 }}>⚡</span>
                        Recent Activity
                      </div>
                    </div>
                    <div className="space-y-4">
                      {dashboard.recentApplications.map((a, i) => (
                        <div key={i} className="flex gap-3" style={{ animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.07}s` }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                            style={{ background: "rgba(97,218,251,0.12)", border: "1px solid rgba(97,218,251,0.25)" }}>
                            📨
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white leading-relaxed">Applied to {a.project?.title || 'Project'}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#374151" }}>{new Date(a.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="section-card text-center"
                  style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.4s" }}
                >
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42 * 0.87} ${2 * Math.PI * 42}`}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">87%</span>
                    </div>
                  </div>
                  <p className="text-white text-sm font-semibold mb-1">Match Score</p>
                  <p className="text-xs mb-3" style={{ color: "#374151" }}>
                    Based on your skills and activity
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-xs px-3 py-1.5 rounded-lg w-full transition-all duration-200"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", cursor: "pointer" }}
                  >
                    Improve your profile →
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
