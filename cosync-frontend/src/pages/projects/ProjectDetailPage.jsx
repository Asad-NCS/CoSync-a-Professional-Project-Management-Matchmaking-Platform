import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { applyToProject } from "../../store/projectsSlice";
import api from "../../lib/api";
import { PROJECT_STATUS, ROLE_COLORS } from "../../lib/utils";


const SKILL_COLORS = ["#61dafb","#a78bfa","#4ade80","#fb923c","#f472b6","#34d399","#60a5fa","#fbbf24"];



// ── Main Page ─────────────────────────────────────────────────────────────────
const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(s => s.auth)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyMessage, setApplyMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [applyError, setApplyError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`)
        setProject(res.data.data)
        setLoading(false)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('not_found')
        } else {
          setError('Failed to load project.')
        }
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  useEffect(() => {
    if (project) document.title = `${project.title} — CoSync`
    return () => { document.title = 'CoSync' }
  }, [project])

  const handleApply = async () => {
    setApplying(true)
    setApplyError(null)
    const result = await dispatch(applyToProject({ 
      projectId: project._id, 
      message: applyMessage 
    }))
    if (result.meta.requestStatus === 'fulfilled') {
      setApplySuccess(true)
    } else {
      setApplyError('Failed to submit application. Please try again.')
    }
    setApplying(false)
  }

  if (loading) return <div className="flex justify-center p-20"><p className="text-gray-400">Loading...</p></div>
  if (error === 'not_found') return <div className="flex flex-col items-center p-20"><p className="text-gray-400">Project not found.</p><a href="/feed" className="mt-4 text-blue-400 underline">Back to Feed</a></div>
  if (error) return <div className="flex justify-center p-20"><p className="text-red-400">{error}</p></div>
  if (!project) return null

  const members = project.members ?? [];
  const roles = project.roles ?? [];
  const filledCount = members.length;
  const totalCount = roles.reduce((s, r) => s + (r.count ?? 1), 0) || roles.length || 1;
  const fillPct = Math.round((filledCount / totalCount) * 100);
  const openRoles = roles;
  const similar = [];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .nav-btn { background:none; border:none; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .section-card { background:rgba(12,8,32,0.8); border:1px solid rgba(139,92,246,0.1); border-radius:16px; padding:20px; margin-bottom:16px; }
        .section-title { font-size:0.75rem; font-weight:600; color:#4b5563; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:12px; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#05030f", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff" }}>

        {/* Navbar */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
          style={{ background: "rgba(5,3,15,0.92)", borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", animation: "slideDown 0.4s ease both" }}>
          <div className="flex items-center gap-2">
            <button className="nav-btn flex items-center gap-2" onClick={() => navigate("/")}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
              <span className="font-semibold text-white">CoSync</span>
            </button>
            <span style={{ color: "#374151" }}>›</span>
            <button className="nav-btn text-sm" style={{ color: "#4b5563" }} onClick={() => navigate("/feed")}>Projects</button>
            <span style={{ color: "#374151" }}>›</span>
            <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>{project.title}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/feed")} className="nav-btn text-sm px-3 py-1.5 rounded-lg"
              style={{ border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280" }}>
              ← Browse
            </button>
            {isAuthenticated && (
              <button onClick={() => navigate("/dashboard")} className="nav-btn text-sm px-3 py-1.5 rounded-lg"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }}>
                Dashboard
              </button>
            )}
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left — main content ── */}
            <div className="lg:col-span-2 space-y-4" style={{ animation: "fadeUp 0.5s ease both" }}>

              {/* Hero card */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,8,32,0.9)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="h-1" style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa,#c084fc)" }} />
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium"
                      style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                      {project.category}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium"
                      style={{ background: `rgba(0,0,0,0.2)`, color: PROJECT_STATUS[project.status]?.color || "#a78bfa", border: `1px solid ${PROJECT_STATUS[project.status]?.color || "rgba(139,92,246,0.2)"}` }}>
                      ● {PROJECT_STATUS[project.status]?.label ?? project.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md"
                      style={{ background: "rgba(139,92,246,0.06)", color: "#374151", border: "1px solid rgba(139,92,246,0.1)" }}>
                      {project.difficulty}
                    </span>
                    {project.isRemote && (
                      <span className="text-xs px-2.5 py-1 rounded-md"
                        style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                        🌐 Remote
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>{project.title}</h1>
                  {project.tagline && <p className="text-base mb-4" style={{ color: "#a78bfa" }}>{project.tagline}</p>}

                  {/* Owner */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(124,58,237,0.3)", color: "#a78bfa" }}>
                      {(project.owner?.fullName ?? "?")[0]}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{project.owner?.fullName ?? "Unknown"}</span>
                    </div>
                  </div>

                  {/* Stack as tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(project.stack ?? []).map((t, i) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}10`, color: SKILL_COLORS[i % SKILL_COLORS.length], border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}25` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="section-card">
                <p className="section-title">About this project</p>
                <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{project.description}</p>
              </div>

              {/* Problem statement */}
              {project.problem && (
                <div className="section-card">
                  <p className="section-title">Problem we're solving</p>
                  <div className="flex gap-3">
                    <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: "linear-gradient(to bottom,#7c3aed,#a78bfa)", minHeight: 40 }} />
                    <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{project.problem}</p>
                  </div>
                </div>
              )}

              {/* Roles needed */}
              <div className="section-card">
                <p className="section-title">Roles needed</p>
                <div className="space-y-3">
                  {roles.map((r, ri) => {
                    const rc = ROLE_COLORS[ri % ROLE_COLORS.length];
                    return (
                      <div key={r.title ?? ri} className="flex items-start justify-between p-4 rounded-xl"
                        style={{ background: `${rc}08`, border: `1px solid ${rc}25` }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: rc + "15", border: `1px solid ${rc}30` }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: rc }} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{r.title}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {(r.skills ?? []).map(s => (
                                <span key={s} className="text-xs px-2 py-0.5 rounded"
                                  style={{ background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                          style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
                          Open
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech stack */}
              <div className="section-card">
                <p className="section-title">Tech stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((s, i) => (
                    <span key={s} className="text-sm px-3 py-1.5 rounded-xl font-medium"
                      style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}12`, border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}30`, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team members */}
              <div className="section-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-title" style={{ marginBottom: 0 }}>Current team</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
                      <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
                    </div>
                    <span className="text-xs" style={{ color: "#a78bfa" }}>{filledCount}/{totalCount}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={m._id ?? i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.1)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background: "rgba(124,58,237,0.25)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.35)" }}>
                          {(m.fullName ?? m.name ?? "?")[0]}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{m.fullName ?? m.name}</p>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                          Lead
                        </span>
                      )}
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, totalCount - filledCount) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(139,92,246,0.03)", border: "1px dashed rgba(139,92,246,0.15)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.06)", border: "1px dashed rgba(139,92,246,0.15)" }}>
                        <span style={{ color: "#374151", fontSize: 16 }}>+</span>
                      </div>
                      <p className="text-sm" style={{ color: "#374151" }}>Open slot — apply to join</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perks */}
              {project.perks?.length > 0 && (
                <div className="section-card">
                  <p className="section-title">What you'll get</p>
                  <div className="flex flex-wrap gap-2">
                    {project.perks.map(p => (
                      <span key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm"
                        style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#9ca3af" }}>
                        ✦ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar projects */}
              {similar.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Similar projects</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {similar.map(s => (
                      <div key={s.id} onClick={() => navigate(`/projects/${s.id}`)}
                        className="p-4 rounded-2xl transition-all duration-200 cursor-pointer"
                        style={{ background: "rgba(12,8,32,0.8)", border: "1px solid rgba(139,92,246,0.1)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; e.currentTarget.style.background = "rgba(20,12,50,0.9)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.1)"; e.currentTarget.style.background = "rgba(12,8,32,0.8)"; }}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-white text-sm font-semibold">{s.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                            style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>Open</span>
                        </div>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: "#4b5563" }}>
                          {s.description.slice(0, 70)}...
                        </p>
                        <p className="text-xs" style={{ color: "#a78bfa" }}>View project →</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-4" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.15s" }}>

              {/* Apply CTA */}
              <div className="rounded-2xl p-5 sticky top-24"
                style={{ background: "rgba(12,8,32,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                  <div style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 70%)" }} className="absolute inset-0" />
                </div>

                <div className="relative">
                  {/* Applicants */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{project.applicants}</span>
                      <span className="text-xs" style={{ color: "#4b5563" }}>applicants</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.2)", color: PROJECT_STATUS[project.status]?.color || "#4ade80", border: `1px solid ${PROJECT_STATUS[project.status]?.color || "rgba(74,222,128,0.2)"}` }}>
                      ● {PROJECT_STATUS[project.status]?.label ?? project.status}
                    </span>
                  </div>

                  {/* Open roles */}
                  {openRoles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold mb-2" style={{ color: "#4b5563" }}>Open roles</p>
                      <div className="space-y-1.5">
                        {openRoles.map((r, ri) => {
                          const rc = ROLE_COLORS[ri % ROLE_COLORS.length];
                          return (
                            <div key={r.title ?? ri} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                              style={{ background: `${rc}08`, border: `1px solid ${rc}20` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc }} />
                              <span className="text-xs font-medium" style={{ color: rc }}>{r.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Apply button */}
                  {project.requireCoverLetter && (
                    <textarea
                      value={applyMessage}
                      onChange={e => setApplyMessage(e.target.value)}
                      placeholder={project.applicationQuestion || 'Write your cover letter...'}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 mt-4"
                      rows={4}
                    />
                  )}
                  {applySuccess ? (
                    <p className="text-green-400 font-medium text-center py-2">✅ Application submitted!</p>
                  ) : user?._id === project.owner?._id ? (
                    <button disabled className="w-full py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed mb-3"
                      style={{ background: "rgba(139,92,246,0.05)", color: "#374151", border: "1px solid rgba(139,92,246,0.1)" }}>
                      You own this project
                    </button>
                  ) : project.status === 'closed' ? (
                    <button disabled className="w-full py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed mb-3"
                      style={{ background: "rgba(139,92,246,0.05)", color: "#374151", border: "1px solid rgba(139,92,246,0.1)" }}>
                      Not accepting applications
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-3"
                      style={{
                        background: applying ? "rgba(139,92,246,0.1)" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                        color: applying ? "#374151" : "#fff",
                        border: applying ? "1px solid rgba(139,92,246,0.1)" : "none",
                        cursor: applying ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={e => { if (!applying) e.currentTarget.style.boxShadow = "0 10px 30px rgba(124,58,237,0.4)"; }}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                      {applying ? 'Submitting...' : 'Apply Now'}
                    </button>
                  )}
                  {applyError && (
                    <p className="text-red-400 text-sm mt-2 text-center">{applyError}</p>
                  )}

                  <button onClick={() => navigate("/feed")}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: "transparent", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)"; }}>
                    Browse other projects
                  </button>
                </div>
              </div>

              {/* Project details */}
              <div className="section-card">
                <p className="section-title">Project details</p>
                <div className="space-y-3">
                  {[
                    { label: "Duration",   value: project.duration,  icon: "⏱" },
                    { label: "Team size",  value: `${totalCount} members`, icon: "👥" },
                    { label: "Difficulty", value: project.difficulty, icon: "⚡" },
                    { label: "Deadline",   value: project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline",  icon: "📅" },
                    { label: "Remote",     value: project.isRemote ? "Yes" : "No", icon: "🌐" },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 13 }}>{d.icon}</span>
                        <span className="text-xs" style={{ color: "#4b5563" }}>{d.label}</span>
                      </div>
                      <span className="text-xs font-medium text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              {(project.github || project.figma || project.website) && (
                <div className="section-card">
                  <p className="section-title">Project links</p>
                  <div className="space-y-2">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200"
                        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#9ca3af", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)"; }}>
                        <span style={{ fontSize: 14 }}>⌥</span>
                        <span className="text-sm">GitHub Repository</span>
                        <span className="ml-auto" style={{ fontSize: 12 }}>↗</span>
                      </a>
                    )}
                    {project.figma && (
                      <a href={project.figma} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200"
                        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#9ca3af", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)"; }}>
                        <span style={{ fontSize: 14 }}>🎨</span>
                        <span className="text-sm">Figma Design</span>
                        <span className="ml-auto" style={{ fontSize: 12 }}>↗</span>
                      </a>
                    )}
                    {project.website && (
                      <a href={project.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200"
                        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#9ca3af", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)"; }}>
                        <span style={{ fontSize: 14 }}>🌐</span>
                        <span className="text-sm">Live Website</span>
                        <span className="ml-auto" style={{ fontSize: 12 }}>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default ProjectDetailPage;
