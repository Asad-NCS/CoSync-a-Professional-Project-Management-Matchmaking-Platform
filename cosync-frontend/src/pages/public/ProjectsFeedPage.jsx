import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, fetchMatchedProjects } from "../../store/projectsSlice";
import { PROJECT_STATUS, ROLE_COLORS } from "../../lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "AI / ML", "Web App", "Mobile / Web", "Blockchain", "Hardware / IoT"];
const ALL_STACKS = ["React", "Python", "Node.js", "MongoDB", "FastAPI", "PyTorch", "Next.js", "Solidity"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const RoleBadge = ({ label }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surfaceHover border border-border text-secondary">
    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="rounded-xl p-8 max-w-sm w-full text-center bg-surface border border-border" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-border text-primary text-xl">
            🔒
          </div>
          <h3 className="text-primary font-medium text-lg mb-2">Sign in to apply</h3>
          <p className="text-secondary text-sm mb-6">Create a free account to apply to projects and build your team.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-md text-sm font-medium border border-border hover:bg-surfaceHover text-secondary transition-colors">Cancel</button>
            <button onClick={() => navigate("/register")} className="flex-1 py-2 rounded-md text-sm font-medium bg-primary text-background hover:bg-white/90 transition-transform active:scale-95">Get started</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="rounded-xl p-8 max-w-sm w-full text-center bg-surface border border-border" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-border text-primary text-xl">
            ✓
          </div>
          <h3 className="text-primary font-medium text-lg mb-2">Application sent!</h3>
          <p className="text-secondary text-sm mb-2">Your application to <span className="text-primary">{project.title}</span> has been submitted.</p>
          <p className="text-secondary text-xs mb-6">The project lead will review it and get back to you.</p>
          <button onClick={onClose} className="w-full py-2 rounded-md text-sm font-medium bg-primary text-background hover:bg-white/90 transition-transform active:scale-95">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="rounded-xl p-6 max-w-md w-full bg-surface border border-border animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-primary font-medium text-lg">Apply to join</h3>
            <p className="text-sm text-secondary">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors text-xl leading-none">×</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(project.roles || []).map((r, i) => <RoleBadge key={r.title || i} label={r.title} />)}
        </div>
        <div className="mb-6">
          <label className="block text-xs font-medium mb-2 text-secondary">
            Why do you want to join? <span className="opacity-50">(optional)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Tell the project lead what you bring to the table..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full rounded-md text-sm bg-background border border-border text-primary placeholder-secondary/50 outline-none resize-none transition-colors p-3 focus:border-secondary"
          />
          <p className="text-xs mt-2 text-secondary/50 text-right">{message.length}/500</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-md text-sm font-medium border border-border hover:bg-surfaceHover text-secondary transition-colors">
            Cancel
          </button>
          <button onClick={() => setSubmitted(true)} className="flex-1 py-2 rounded-md text-sm font-medium bg-primary text-background hover:bg-white/90 transition-transform active:scale-95">
            Send application
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onApply }) => {
  const navigate = useNavigate();
  const isFull = project.status === "closed";
  const filled = project.members?.length || 0;
  const fillPct = Math.round((filled / (project.total ?? 1)) * 100);

  const hasMatchScore = project.matchPercentage !== undefined;
  const matchedSkills = project.matchedSkills || [];

  return (
    <div
      className="group rounded-xl border border-border bg-surface hover:bg-surfaceHover transition-colors flex flex-col cursor-pointer animate-fade-up relative overflow-hidden"
      onClick={() => navigate(`/projects/${project._id ?? project.id}`)}
    >
      {/* Optional Match Glow */}
      {hasMatchScore && project.matchPercentage >= 50 && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 mr-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {hasMatchScore && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border border-accent/30 bg-accent/10 text-accent uppercase tracking-wider">
                  {project.matchPercentage}% Match
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded border border-border bg-background text-secondary">
                {project.category}
              </span>
              <span className="text-xs px-2 py-0.5 rounded border border-border bg-background text-secondary flex items-center gap-1.5 capitalize">
                <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`} />
                {project.status}
              </span>
            </div>
            <h3 className="text-primary font-medium text-base leading-tight group-hover:text-accent transition-colors">{project.title}</h3>
          </div>
          {/* Author avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-border text-primary shrink-0" title={project.author?.name ?? ""}>
            {(project.author?.name ?? "?")[0]}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-5 flex-1 text-secondary line-clamp-2">
          {project.description}
        </p>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(project.roles ?? []).map((r, i) => <RoleBadge key={r.title || i} label={r.title} />)}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {(project.stack ?? []).map(s => {
            const isMatched = matchedSkills.some(ms => ms.toLowerCase() === s.toLowerCase());
            return (
              <span 
                key={s} 
                className={`text-[11px] px-1.5 py-0.5 rounded border ${isMatched ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border/50 text-secondary/80'}`}
              >
                {s}
              </span>
            )
          })}
        </div>

        {/* Team fill bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-secondary">Team capacity</span>
            <span className="text-[11px] text-primary">{filled}/{project.total}</span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-primary" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span>{project.applicationCount ?? 0} applicants</span>
            <span>·</span>
            <span>{project.posted || new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApply(project); }}
            disabled={isFull}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isFull ? 'bg-border text-secondary cursor-not-allowed' : 'bg-primary text-background hover:bg-white/90 active:scale-95'}`}
          >
            {isFull ? "Team full" : "Apply"}
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
  const { projectsList, matchedProjects, status, error } = useSelector(s => s.projects);

  const [isMatchMode, setIsMatchMode] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeStack, setActiveStack] = useState("");
  const [applyProject, setApplyProject] = useState(null);

  // Fetch from backend whenever filters or mode changes
  useEffect(() => {
    if (isMatchMode && isAuthenticated) {
      dispatch(fetchMatchedProjects());
    } else {
      const filters = {
        ...(search && { search }),
        ...(activeCategory !== "All" && { category: activeCategory }),
        ...(activeStack && { stack: activeStack }),
        ...(activeStatus === "Open" && { status: "open" }),
        ...(activeStatus === "Full" && { status: "closed" }),
        page: 1,
        limit: 50,
      };
      dispatch(fetchProjects(filters));
    }
  }, [search, activeCategory, activeStatus, activeStack, isMatchMode, isAuthenticated, dispatch]);

  const rawProjects = isMatchMode ? matchedProjects : projectsList;
  const projects = Array.isArray(rawProjects) ? rawProjects : (rawProjects?.projects ?? []);
  
  // If in match mode, maybe we apply local text filters if user types something
  const displayedProjects = isMatchMode 
    ? projects.filter(p => 
        (search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) : true) &&
        (activeCategory !== "All" ? p.category === activeCategory : true) &&
        (activeStatus !== "All" ? (activeStatus === "Open" ? p.status === "open" : p.status === "closed") : true)
      )
    : projects;

  const openCount = displayedProjects.filter(p => p.status === "open").length;

  return (
    <div className="min-h-screen text-primary flex flex-col font-sans">
      
      {/* ── Navbar ── */}
      <nav className="sticky top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <Logo className="w-6 h-6" />
            <span className="font-medium tracking-tight">CoSync</span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="/feed" className="text-sm font-medium text-primary">Projects</a>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="bg-primary text-background px-4 py-1.5 rounded-md hover:bg-white/90 transition-transform active:scale-95">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-secondary hover:text-primary transition-colors">Sign in</button>
              <button onClick={() => navigate("/register")} className="bg-primary text-background px-4 py-1.5 rounded-md hover:bg-white/90 transition-transform active:scale-95">
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        
        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {openCount} projects actively recruiting
            </div>
            <h1 className="text-3xl font-medium tracking-tight mb-2">Project Board</h1>
            <p className="text-secondary">Discover opportunities, apply, and build together.</p>
          </div>
          <button
            onClick={() => isAuthenticated ? navigate("/projects/create") : navigate("/register")}
            className="bg-primary text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-white/90 transition-transform active:scale-95"
          >
            Post a project
          </button>
        </div>

        {/* ── Matchmaking Toggle ── */}
        {isAuthenticated && (
          <div className="mb-6 flex p-1 bg-surface border border-border rounded-lg w-fit animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <button
              onClick={() => setIsMatchMode(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isMatchMode ? 'bg-border text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            >
              All Projects
            </button>
            <button
              onClick={() => setIsMatchMode(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${isMatchMode ? 'bg-border text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            >
              <span className={isMatchMode ? "text-accent" : ""}>✨</span> Recommended for You
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="mb-8 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder={isMatchMode ? "Filter recommended projects..." : "Search by keyword, role, or tech stack..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary">✕</button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${activeCategory === cat ? 'bg-primary text-background border-primary' : 'bg-surface border-border text-secondary hover:text-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-border mx-1 hidden md:block" />
            <div className="flex items-center gap-1.5">
              {["All", "open", "closed"].map(s => {
                const label = s === "All" ? "All" : s === "open" ? "Open" : "Full";
                return (
                  <button
                    key={s}
                    onClick={() => setActiveStatus(label)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${activeStatus === label ? 'bg-primary text-background border-primary' : 'bg-surface border-border text-secondary hover:text-primary'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {status === "loading" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface h-64 animate-pulse" />
            ))}
          </div>
        ) : status === "failed" ? (
          <div className="text-center py-20 border border-border rounded-xl bg-surface">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="font-medium mb-1">Failed to load</h3>
            <p className="text-sm text-secondary mb-4">{error}</p>
            <button onClick={() => isMatchMode ? dispatch(fetchMatchedProjects()) : dispatch(fetchProjects({ page: 1, limit: 50 }))} className="text-sm font-medium px-4 py-2 border border-border rounded-md hover:bg-surfaceHover transition-colors">Retry</button>
          </div>
        ) : displayedProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProjects.map(p => <ProjectCard key={p._id ?? p.id} project={p} onApply={setApplyProject} />)}
          </div>
        ) : (
          <div className="text-center py-20 border border-border rounded-xl bg-surface text-secondary">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-medium text-primary mb-1">
              {isMatchMode && !search && activeCategory === "All" ? "No matches found yet" : "No projects found"}
            </h3>
            <p className="text-sm mb-4">
              {isMatchMode && !search && activeCategory === "All" 
                ? "Try updating your profile skills to get better recommendations!" 
                : "Try adjusting your search or filters."}
            </p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); setActiveStatus("All"); setActiveStack(""); }} className="text-sm font-medium text-primary hover:underline">Clear filters</button>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {applyProject && <ApplyModal project={applyProject} onClose={() => setApplyProject(null)} isAuth={isAuthenticated} />}
    </div>
  );
};

export default ProjectsFeedPage;