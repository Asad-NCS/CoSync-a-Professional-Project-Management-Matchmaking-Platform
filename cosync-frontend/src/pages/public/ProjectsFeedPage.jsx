import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../../store/projectsSlice";
import { PROJECT_STATUS, ROLE_COLORS } from "../../lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "AI / ML", "Web App", "Mobile / Web", "Blockchain", "Hardware / IoT"];
const ALL_STACKS = ["React", "Python", "Node.js", "MongoDB", "FastAPI", "PyTorch", "Next.js", "Solidity"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const SkillPill = ({ label, color }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
    style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}
  >
    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
    {label}
  </span>
);

const RoleBadge = ({ label, color }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
    style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
  >
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <circle cx="4" cy="4" r="3" stroke={color} strokeWidth="1.5" />
    </svg>
    {label}
  </span>
);

// ── Apply Modal ───────────────────────────────────────────────────────────────
const ApplyModal = ({ project, onClose, isAuth }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuth) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{ background: "#0a0520", border: "1px solid rgba(139,92,246,0.25)" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
            <span style={{ fontSize: 20 }}>🔒</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Sign in to apply</h3>
          <p className="text-gray-500 text-sm mb-6">Create a free account to apply to projects and build your team.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#9ca3af" }}>Cancel</button>
            <button onClick={() => navigate("/register")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>Get started</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{ background: "#0a0520", border: "1px solid rgba(34,197,94,0.25)" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
            <span style={{ fontSize: 24 }}>✓</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Application sent!</h3>
          <p className="text-gray-500 text-sm mb-2">Your application to <span style={{ color: "#a78bfa" }}>{project.title}</span> has been submitted.</p>
          <p className="text-gray-600 text-xs mb-6">The project lead will review it and get back to you.</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full"
        style={{ background: "#0a0520", border: "1px solid rgba(139,92,246,0.25)", animation: "modalIn 0.25s ease both" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-lg">Apply to join</h3>
            <p className="text-sm" style={{ color: "#a78bfa" }}>{project.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.roles.map((r, i) => <RoleBadge key={r.title || i} label={r.title} color={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: focused ? "#a78bfa" : "#9ca3af" }}>
            Why do you want to join? <span style={{ color: "#4b5563" }}>(optional)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Tell the project lead what you bring to the table — your relevant skills, experience, or why this project excites you..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full rounded-lg text-sm text-white placeholder-gray-600 outline-none resize-none transition-all duration-200"
            style={{
              background: "rgba(15,10,40,0.8)",
              border: `1px solid ${focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
              padding: "0.75rem",
              boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
            }}
          />
          <p className="text-xs mt-1" style={{ color: "#374151" }}>{message.length}/500</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#9ca3af", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => setSubmitted(true)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 25px rgba(124,58,237,0.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            Send application →
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onApply, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const statusLabel = PROJECT_STATUS[project.status]?.label || project.status;
  const isFull = project.status === "closed";
  const filled = project.members?.length || 0;
  const fillPct = Math.round((filled / (project.total ?? 1)) * 100);

  return (
    <div
      className="rounded-2xl border relative overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        background: hovered ? "rgba(20,12,50,0.95)" : "rgba(12,8,32,0.85)",
        borderColor: hovered ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.12)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 50px rgba(109,40,217,0.2)" : "none",
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.07}s`,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/projects/${project._id ?? project.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 mr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {project.category}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium capitalize"
                style={{
                  background: `rgba(0,0,0,0.2)`,
                  color: PROJECT_STATUS[project.status]?.color || "#a78bfa",
                  border: `1px solid ${PROJECT_STATUS[project.status]?.color || "rgba(139,92,246,0.2)"}`,
                }}
              >
                ● {PROJECT_STATUS[project.status]?.label ?? project.status}
              </span>
            </div>
            <h3 className="text-white font-bold text-base leading-tight">{project.title}</h3>
          </div>
          {/* Author avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: project.author?.avatar ?? "#7c3aed", color: "#fff" }}
            title={project.author?.name ?? ""}
          >
            {(project.author?.name ?? "?")[0]}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#6b7280" }}>
          {project.description}
        </p>

        <div className="mb-3">
          <p className="text-xs mb-2" style={{ color: "#374151" }}>Roles needed</p>
          <div className="flex flex-wrap gap-1.5">
            {(project.roles ?? []).map((r, i) => <RoleBadge key={r.title || i} label={r.title} color={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {(project.stack ?? []).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.06)" }}>
              {s}
            </span>
          ))}
        </div>

        {/* Team fill bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "#374151" }}>Team filled</span>
            <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{filled}/{project.total} members</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${fillPct}%`,
                background: fillPct === 100 ? "#4ade80" : "linear-gradient(90deg,#7c3aed,#a78bfa)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "#374151" }}>
              <span style={{ color: "#6b7280" }}>{project.applicationCount ?? 0}</span> applicants
            </span>
            <span className="text-xs" style={{ color: "#374151" }}>· {project.posted || new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => onApply(project)}
            disabled={isFull}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: isFull ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
              color: isFull ? "#374151" : "#fff",
              border: isFull ? "1px solid rgba(255,255,255,0.06)" : "none",
              cursor: isFull ? "not-allowed" : "pointer",
              boxShadow: !isFull && hovered ? "0 4px 15px rgba(124,58,237,0.35)" : "none",
            }}
          >
            {isFull ? "Team full" : "Apply →"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Feed Page ────────────────────────────────────────────────────────────
const ProjectsFeedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { projectsList, status, error } = useSelector(s => s.projects);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeStack, setActiveStack] = useState("");
  const [applyProject, setApplyProject] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch from backend whenever filters change
  useEffect(() => {
    const filters = {
      ...(search && { search }),
      ...(activeCategory !== "All" && { category: activeCategory }),
      ...(activeStack && { stack: activeStack }),
      // Status filter: UI uses "Open"/"Full", backend expects "open"/"closed"
      ...(activeStatus === "Open" && { status: "open" }),
      ...(activeStatus === "Full" && { status: "closed" }),
      page: 1,
      limit: 50,
    };
    dispatch(fetchProjects(filters));
  }, [search, activeCategory, activeStatus, activeStack]);

  // Normalise payload: backend wraps list as { projects, totalCount } or returns array directly
  const projects = Array.isArray(projectsList)
    ? projectsList
    : (projectsList?.projects ?? []);

  const openCount = projects.filter(p => p.status === "open").length;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.96) translateY(8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
        .nav-link { color:#6b7280; font-size:0.875rem; text-decoration:none; transition:color 0.2s; }
        .nav-link:hover { color:#fff; }
        .filter-btn {
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          border: none;
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#05030f", color: "#fff", fontFamily: "'DM Sans',system-ui,sans-serif" }}>

        {/* ── Navbar ── */}
        <nav
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto"
          style={{ borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", background: "rgba(5,3,15,0.85)", animation: "slideDown 0.4s ease both" }}
        >
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
              <span className="font-semibold text-white tracking-tight">CoSync</span>
            </button>
            <div className="hidden md:flex items-center gap-5">
              <a href="/feed" className="nav-link" style={{ color: "#a78bfa", fontWeight: 500 }}>Projects</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="text-sm font-medium transition-colors duration-200" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
                >
                  Sign in
                </button>
                <button onClick={() => navigate("/register")} className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Get started
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* ── Hero header ── */}
          <div className="mb-10" style={{ animation: "fadeUp 0.5s ease both" }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#4ade80", boxShadow: "0 0 8px #4ade80", animation: "pulse-dot 2s ease-in-out infinite" }}
                  />
                  <span className="text-xs font-medium" style={{ color: "#4ade80" }}>
                    {openCount} projects actively recruiting
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: "-0.025em" }}>
                  Find your next project
                </h1>
                <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
                  Browse open projects, find your role, apply to join a team.
                </p>
              </div>
              <button
                onClick={() => isAuthenticated ? navigate("/projects/create") : navigate("/register")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(124,58,237,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <span style={{ fontSize: 14 }}>+</span>
                Post a project
              </button>
            </div>
          </div>

          {/* ── Search + Filters ── */}
          <div className="mb-8 space-y-4" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.1s" }}>

            {/* Search bar */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: searchFocused ? "#a78bfa" : "#374151", transition: "color 0.2s" }}>
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search projects by name, description, or technology..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                style={{
                  background: "rgba(12,8,32,0.85)",
                  border: `1px solid ${searchFocused ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.12)"}`,
                  padding: "0.875rem 1rem 0.875rem 2.75rem",
                  boxShadow: searchFocused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* Category filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className="filter-btn"
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      background: activeCategory === cat ? "rgba(124,58,237,0.2)" : "rgba(12,8,32,0.85)",
                      border: `1px solid ${activeCategory === cat ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.12)"}`,
                      color: activeCategory === cat ? "#a78bfa" : "#4b5563",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px" style={{ background: "rgba(139,92,246,0.15)" }} />

              {/* Status */}
              {["All", "open", "closed"].map(s => (
                <button
                  key={s}
                  className="filter-btn"
                  onClick={() => setActiveStatus(s === "open" ? "Open" : s === "closed" ? "Full" : "All")}
                  style={{
                    background: (s === "open" && activeStatus === "Open") || (s === "closed" && activeStatus === "Full") || (s === "All" && activeStatus === "All") ? "rgba(124,58,237,0.15)" : "transparent",
                    border: `1px solid ${(s === "open" && activeStatus === "Open") || (s === "closed" && activeStatus === "Full") || (s === "All" && activeStatus === "All") ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.1)"}`,
                    color: (s === "open" && activeStatus === "Open") || (s === "closed" && activeStatus === "Full") || (s === "All" && activeStatus === "All") ? "#a78bfa" : "#374151",
                  }}
                >
                  {s === "All" ? "All" : PROJECT_STATUS[s]?.label ?? s}
                </button>
              ))}

              <div className="h-5 w-px hidden md:block" style={{ background: "rgba(139,92,246,0.15)" }} />

              {/* Stack quick filter */}
              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {ALL_STACKS.map(st => (
                  <button
                    key={st}
                    className="filter-btn"
                    onClick={() => setActiveStack(activeStack === st ? "" : st)}
                    style={{
                      background: activeStack === st ? "rgba(97,218,251,0.08)" : "transparent",
                      border: `1px solid ${activeStack === st ? "rgba(97,218,251,0.3)" : "rgba(139,92,246,0.08)"}`,
                      color: activeStack === st ? "#61dafb" : "#374151",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "#374151" }}>
                {status === "loading"
                  ? "Loading projects…"
                  : <><span style={{ color: "#a78bfa", fontWeight: 600 }}>{projects.length}</span> project{projects.length !== 1 ? "s" : ""} found{search && <> matching "<span style={{ color: "#fff" }}>{search}</span>"</>}</>}
              </p>
              {(search || activeCategory !== "All" || activeStatus !== "All" || activeStack) && (
                <button
                  onClick={() => { setSearch(""); setActiveCategory("All"); setActiveStatus("All"); setActiveStack(""); }}
                  className="text-xs transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                  onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}
                >
                  Clear all filters ✕
                </button>
              )}
            </div>
          </div>

          {/* ── Grid ── */}
          {status === "loading" ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border"
                  style={{
                    background: "rgba(12,8,32,0.85)",
                    borderColor: "rgba(139,92,246,0.12)",
                    height: 280,
                    animation: `fadeUp 0.5s ease both`,
                    animationDelay: `${i * 0.07}s`,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : status === "failed" ? (
            <div className="text-center py-24" style={{ animation: "fadeUp 0.4s ease both" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Failed to load projects</h3>
              <p className="text-sm mb-5" style={{ color: "#374151" }}>{error}</p>
              <button
                onClick={() => dispatch(fetchProjects({ page: 1, limit: 50 }))}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((p, i) => (
                <ProjectCard key={p._id ?? p.id} project={p} onApply={setApplyProject} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24" style={{ animation: "fadeUp 0.4s ease both" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <span style={{ fontSize: 24 }}>🔍</span>
              </div>
              <h3 className="text-white font-semibold mb-2">No projects found</h3>
              <p className="text-sm mb-5" style={{ color: "#374151" }}>Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); setActiveStatus("All"); setActiveStack(""); }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", cursor: "pointer" }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* ── CTA banner ── */}
          {!isAuthenticated && (
            <div
              className="mt-12 rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ background: "rgba(12,8,32,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 70%)" }} />
              <h2 className="text-xl font-bold text-white mb-2 relative" style={{ letterSpacing: "-0.02em" }}>
                Got a project idea?
              </h2>
              <p className="text-sm mb-5 relative" style={{ color: "#4b5563" }}>
                Sign up and post your project to find the perfect teammates.
              </p>
              <div className="flex items-center justify-center gap-3 relative">
                <button onClick={() => navigate("/register")} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Post your project
                </button>
                <button onClick={() => navigate("/login")} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: "transparent", border: "1px solid rgba(139,92,246,0.2)", color: "#6b7280", cursor: "pointer" }}>
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply modal ── */}
      {applyProject && (
        <ApplyModal
          project={applyProject}
          onClose={() => setApplyProject(null)}
          isAuth={isAuthenticated}
        />
      )}
    </>
  );
};

export default ProjectsFeedPage;