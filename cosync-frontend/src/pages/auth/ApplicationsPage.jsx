import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyApplications } from "../../store/projectsSlice";
import { APP_STATUS } from '../../lib/utils';
import StatusBadge from "../../components/ui/StatusBadge";

// ── Detail modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ app, onClose }) => {
  const s = APP_STATUS[app.status] || APP_STATUS.pending;
  const project = app.project || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0a0520", border: "1px solid rgba(139,92,246,0.25)", animation: "modalIn 0.25s ease both" }}
        onClick={e => e.stopPropagation()}>

        <div className="p-1 rounded-t-2xl" style={{ background: "rgba(0,0,0,0.2)", borderBottom: `1px solid ${s.color || "rgba(139,92,246,0.1)"}` }}>
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ color: s.color, fontSize: 16 }}>●</span>
            <span className="text-sm font-semibold" style={{ color: s.color }}>
              Application {s.label}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
              <p className="text-sm" style={{ color: "#a78bfa" }}>{app.role || 'Contributor'}</p>
              <p className="text-xs mt-1" style={{ color: "#4b5563" }}>by {project.owner?.fullName || 'Project Owner'} · Applied {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", fontSize: 22 }}>×</button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.stack?.map((s, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>{s}</span>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.1)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#4b5563" }}>Your application message</p>
            <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{app.message || "No cover letter provided."}</p>
          </div>

          {app.status === "rejected" && (
            <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#f87171" }}>Not selected this time</p>
              <p className="text-xs" style={{ color: "#6b7280" }}>Don't be discouraged — keep building and applying. Your profile is still visible to all project leads.</p>
            </div>
          )}

          {app.status === "accepted" && (
            <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#4ade80" }}>🎉 You're on the team!</p>
              <p className="text-xs" style={{ color: "#6b7280" }}>Your workspace has been unlocked. Head to your dashboard to access the team tools.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Application Card ──────────────────────────────────────────────────────────
const AppCard = ({ app, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const s = APP_STATUS[app.status] || APP_STATUS.pending;
  const project = app.project || {};

  return (
    <div
      className="rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer"
      style={{
        background: hovered ? "rgba(20,12,50,0.95)" : "rgba(12,8,32,0.85)",
        borderColor: hovered ? s.color : "rgba(139,92,246,0.12)",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.3)` : "none",
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.07}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(app)}
    >
      <div className="h-0.5" style={{ background: s.color || "rgba(139,92,246,0.1)" }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: `1px solid rgba(139,92,246,0.2)` }}>
              {project.title?.[0] || "?"}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{project.title}</h3>
              <p className="text-xs" style={{ color: "#4b5563" }}>{project.category} · by {project.owner?.fullName || 'Owner'}</p>
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
          <p className="text-xs" style={{ color: "#6b7280" }}>Applied for role</p>
          <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>{app.role || 'Contributor'}</p>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.stack?.slice(0, 3).map((t, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.04)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.06)" }}>{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs" style={{ color: "#374151" }}>
          <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
          <span style={{ color: "#a78bfa" }}>View details →</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ApplicationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appliedProjects, status, error } = useSelector(s => s.projects);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const FILTERS = ["All", "pending", "accepted", "rejected"];
  const filtered = appliedProjects.filter(a => filter === "All" || a.status === filter);

  const counts = {
    pending: appliedProjects.filter(a => a.status === "pending").length,
    accepted: appliedProjects.filter(a => a.status === "accepted").length,
    rejected: appliedProjects.filter(a => a.status === "rejected").length,
  };

  if (status === 'loading') return <div className="flex justify-center p-20"><p className="text-gray-400">Loading applications...</p></div>
  if (error) return <div className="flex justify-center p-20"><p className="text-red-400">{error}</p></div>

  return (
    <>


      <div className="min-h-screen" style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff" }}>

        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
          style={{ background: "rgba(5,3,15,0.92)", borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", animation: "slideDown 0.4s ease both" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Logo className="w-7 h-7" />
              <span className="font-semibold text-white">CoSync</span>
            </button>
            <span style={{ color: "#374151" }}>›</span>
            <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>Applications</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "none", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
              ← Dashboard
            </button>
            <button onClick={() => navigate("/feed")}
              className="text-sm px-4 py-1.5 rounded-lg font-semibold"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
              Browse Projects
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8" style={{ animation: "fadeUp 0.5s ease both" }}>
            <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: "-0.025em" }}>My Applications</h1>
            <p style={{ color: "#4b5563" }}>Track the status of every project you've applied to.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.1s" }}>
            {[
              { label: "pending", value: counts.pending },
              { label: "accepted", value: counts.accepted },
              { label: "rejected", value: counts.rejected },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 text-center"
                style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${APP_STATUS[s.label]?.color || "rgba(139,92,246,0.2)"}` }}>
                <p className="text-3xl font-bold mb-1" style={{ color: APP_STATUS[s.label]?.color || "#a78bfa" }}>{s.value}</p>
                <p className="text-sm capitalize" style={{ color: "#6b7280" }}>{APP_STATUS[s.label]?.label || s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.15s" }}>
            {FILTERS.map(f => (
              <button key={f} className="filter-btn capitalize" onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? "rgba(124,58,237,0.18)" : "rgba(12,8,32,0.85)",
                  border: `1px solid ${filter === f ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.12)"}`,
                  color: filter === f ? "#a78bfa" : "#4b5563",
                }}>
                {APP_STATUS[f]?.label || f} {f !== "All" && `(${counts[f] || 0})`}
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((a, i) => <AppCard key={a._id} app={a} index={i} onClick={setSelected} />)}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                <span style={{ fontSize: 24 }}>📨</span>
              </div>
              <h3 className="text-white font-semibold mb-2">No {filter !== "All" ? filter : ""} applications</h3>
              <p className="text-sm mb-5" style={{ color: "#374151" }}>Browse projects and apply to join a team</p>
              <button onClick={() => navigate("/feed")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
                Browse Projects
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && <DetailModal app={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default ApplicationsPage;