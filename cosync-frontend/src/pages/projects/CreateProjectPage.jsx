import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createProject, fetchProjects } from "../../store/projectsSlice";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["AI / ML", "Web App", "Mobile App", "Blockchain", "Hardware / IoT", "Game Dev", "Data Science", "Cybersecurity", "Open Source", "Research", "Other"];
const DURATIONS = ["< 1 week", "1–2 weeks", "1 month", "2–3 months", "3–6 months", "6+ months", "Ongoing"];
const TEAM_SIZES = ["2 members", "3 members", "4 members", "5 members", "6+ members"];
const DIFFICULTY = ["Beginner friendly", "Intermediate", "Advanced", "Expert"];
const ROLE_OPTIONS = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "ML Engineer", "Data Scientist", "DevOps Engineer", "Mobile Developer", "Blockchain Developer", "Project Manager", "Technical Writer", "QA Engineer"];
const STACK_SUGGESTIONS = ["React", "Next.js", "Vue", "Angular", "Node.js", "Express", "FastAPI", "Django", "Flask", "Python", "JavaScript", "TypeScript", "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase", "Redux", "TailwindCSS", "GraphQL", "REST API", "Docker", "AWS", "PyTorch", "TensorFlow", "Solidity", "React Native", "Flutter", "Figma"];
const PERKS = ["Certificate of completion", "Portfolio project", "Open source contribution", "Startup opportunity", "Research publication", "Hackathon submission", "Revenue sharing", "Mentorship provided"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const SKILL_COLORS = ["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#34d399", "#60a5fa", "#fbbf24", "#e879f9", "#38bdf8"];

const inputBase = (focused, error) => ({
  background: "rgba(15,10,40,0.8)",
  border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
  borderRadius: 10,
  color: "#fff",
  fontSize: "0.875rem",
  outline: "none",
  transition: "all 0.2s",
  boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
  width: "100%",
  fontFamily: "inherit",
});

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { icon: "💡", label: "Basics" },
  { icon: "👥", label: "Team" },
  { icon: "🛠", label: "Stack" },
  { icon: "✨", label: "Details" },
];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((s, i) => (
      <div key={s.label} className="flex items-center">
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all duration-300"
            style={{
              background: i < current ? "#7c3aed" : i === current ? "rgba(124,58,237,0.2)" : "rgba(139,92,246,0.06)",
              border: `1px solid ${i <= current ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.1)"}`,
              transform: i === current ? "scale(1.08)" : "scale(1)",
              boxShadow: i === current ? "0 0 20px rgba(124,58,237,0.3)" : "none",
            }}
          >
            {i < current ? "✓" : s.icon}
          </div>
          <p className="text-xs mt-1 font-medium" style={{ color: i === current ? "#a78bfa" : i < current ? "#7c3aed" : "#374151" }}>
            {s.label}
          </p>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className="w-16 h-px mx-2 mb-5 transition-all duration-500"
            style={{ background: i < current ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "rgba(139,92,246,0.1)" }}
          />
        )}
      </div>
    ))}
  </div>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, hint, error, required, children }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold" style={{ color: "#9ca3af" }}>
        {label} {required && <span style={{ color: "#7c3aed" }}>*</span>}
      </label>
      {hint && <span className="text-xs" style={{ color: "#374151" }}>{hint}</span>}
    </div>
    {children}
    {error && <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>⚠ {error}</p>}
  </div>
);

// ── Text input ────────────────────────────────────────────────────────────────
const TextInput = ({ placeholder, value, onChange, error, icon, maxLen }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focused ? "#a78bfa" : "#374151", transition: "color 0.2s", fontSize: 14 }}>{icon}</span>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLen}
        style={{ ...inputBase(focused, error), padding: `0.625rem ${maxLen ? "3rem" : "0.875rem"} 0.625rem ${icon ? "2.25rem" : "0.875rem"}` }}
      />
      {maxLen && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: value.length > maxLen * 0.85 ? "#f87171" : "#374151" }}>
          {value.length}/{maxLen}
        </span>
      )}
    </div>
  );
};

// ── Textarea ──────────────────────────────────────────────────────────────────
const TextArea = ({ placeholder, value, onChange, error, rows = 4, maxLen }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        maxLength={maxLen}
        style={{ ...inputBase(focused, error), padding: "0.75rem 0.875rem", resize: "none" }}
      />
      {maxLen && (
        <span className="absolute right-3 bottom-3 text-xs pointer-events-none" style={{ color: value.length > maxLen * 0.85 ? "#f87171" : "#374151" }}>
          {value.length}/{maxLen}
        </span>
      )}
    </div>
  );
};

// ── Select ────────────────────────────────────────────────────────────────────
const Select = ({ options, value, onChange, placeholder, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused, error), padding: "0.625rem 2rem 0.625rem 0.875rem", appearance: "none", cursor: "pointer", color: value ? "#fff" : "#4b5563" }}
      >
        <option value="" style={{ background: "#0a0520" }}>{placeholder || "Select..."}</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#0a0520", color: "#fff" }}>{o}</option>)}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs" style={{ color: "#4b5563" }}>▾</span>
    </div>
  );
};

// ── Tag input (stack / skills) ────────────────────────────────────────────────
const TagInput = ({ tags, setTags, suggestions, placeholder, maxTags = 15, colorful = false }) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSugg, setShowSugg] = useState(false);

  const filtered = suggestions?.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)).slice(0, 6) || [];

  const add = (val) => {
    const v = val.trim();
    if (v && !tags.includes(v) && tags.length < maxTags) setTags([...tags, v]);
    setInput("");
    setShowSugg(false);
  };

  const onKey = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); if (input.trim()) add(input); }
    else if (e.key === "Backspace" && !input && tags.length) setTags(tags.slice(0, -1));
  };

  return (
    <div className="relative">
      <div
        style={{ ...inputBase(focused, false), padding: "0.5rem", minHeight: 44, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", cursor: "text" }}
        onClick={() => document.getElementById("tag-inp-" + placeholder)?.focus()}
      >
        {tags.map((t, i) => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={colorful
              ? { background: `${SKILL_COLORS[i % SKILL_COLORS.length]}15`, border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}35`, color: SKILL_COLORS[i % SKILL_COLORS.length] }
              : { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }
            }>
            {t}
            <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1, fontSize: 12 }}>×</button>
          </span>
        ))}
        <input
          id={"tag-inp-" + placeholder}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSugg(true); }}
          onKeyDown={onKey}
          onFocus={() => { setFocused(true); setShowSugg(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setShowSugg(false), 150); if (input.trim()) add(input); }}
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{ flex: 1, minWidth: 100, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.875rem", fontFamily: "inherit" }}
        />
      </div>
      {showSugg && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
          style={{ background: "#0a0520", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>
          {filtered.map(s => (
            <button key={s} type="button" onMouseDown={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "block" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; }}>
              + {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs mt-1" style={{ color: "#374151" }}>Press Enter or comma to add · {tags.length}/{maxTags}</p>
    </div>
  );
};

// ── Role builder ──────────────────────────────────────────────────────────────
const RoleBuilder = ({ roles, setRoles }) => {
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [count, setCount] = useState(1);
  const [titleFocused, setTitleFocused] = useState(false);

  const addRole = () => {
    if (!title) return;
    setRoles([...roles, { id: Date.now(), title, skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [], count }]);
    setTitle(""); setSkills(""); setCount(1);
  };

  const ROLE_COLORS = ["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#34d399"];

  return (
    <div>
      {/* Existing roles */}
      {roles.length > 0 && (
        <div className="space-y-2 mb-4">
          {roles.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: `${ROLE_COLORS[i % ROLE_COLORS.length]}15`, color: ROLE_COLORS[i % ROLE_COLORS.length] }}>
                  {r.count}×
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{r.title}</p>
                  {r.skills.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {r.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs" style={{ color: "#4b5563" }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => setRoles(roles.filter(x => x.id !== r.id))}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add role form */}
      <div className="rounded-xl p-4" style={{ background: "rgba(139,92,246,0.04)", border: "1px dashed rgba(139,92,246,0.2)" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#6b7280" }}>Add a role</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <select value={title} onChange={e => setTitle(e.target.value)}
              style={{ ...inputBase(titleFocused, false), padding: "0.5rem 0.75rem", appearance: "none", cursor: "pointer", color: title ? "#fff" : "#4b5563", fontSize: "0.8rem" }}
              onFocus={() => setTitleFocused(true)} onBlur={() => setTitleFocused(false)}>
              <option value="" style={{ background: "#0a0520" }}>Select role...</option>
              {ROLE_OPTIONS.map(r => <option key={r} value={r} style={{ background: "#0a0520", color: "#fff" }}>{r}</option>)}
            </select>
          </div>
          <select value={count} onChange={e => setCount(Number(e.target.value))}
            style={{ ...inputBase(false, false), padding: "0.5rem 0.75rem", appearance: "none", cursor: "pointer", color: "#fff", fontSize: "0.8rem" }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n} style={{ background: "#0a0520" }}>{n} needed</option>)}
          </select>
        </div>
        <input
          type="text"
          placeholder="Required skills for this role (comma separated)..."
          value={skills}
          onChange={e => setSkills(e.target.value)}
          style={{ ...inputBase(false, false), padding: "0.5rem 0.75rem", marginBottom: 12, fontSize: "0.8rem" }}
        />
        <button type="button" onClick={addRole} disabled={!title}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: title ? "rgba(124,58,237,0.15)" : "rgba(139,92,246,0.04)",
            border: `1px solid ${title ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.1)"}`,
            color: title ? "#a78bfa" : "#374151",
            cursor: title ? "pointer" : "not-allowed",
          }}>
          + Add role to project
        </button>
      </div>
    </div>
  );
};

// ── Toggle chip ───────────────────────────────────────────────────────────────
const ToggleChip = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
    style={{
      background: selected ? "rgba(124,58,237,0.18)" : "rgba(139,92,246,0.04)",
      border: `1px solid ${selected ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.1)"}`,
      color: selected ? "#a78bfa" : "#4b5563",
      cursor: "pointer",
    }}
  >
    {selected ? "✓ " : ""}{label}
  </button>
);

// ── Preview card ──────────────────────────────────────────────────────────────
const PreviewCard = ({ form }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,8,32,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
    <div className="h-1" style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa,#c084fc)" }} />
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {form.category && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                {form.category}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
              ● Open
            </span>
          </div>
          <h3 className="text-white font-bold text-base">{form.title || "Your project title"}</h3>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff" }}>
          Y
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "#4b5563" }}>
        {form.description || "Your project description will appear here..."}
      </p>
      {form.roles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.roles.map((r, i) => (
            <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}12`, border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}30`, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
              {r.title}
            </span>
          ))}
        </div>
      )}
      {form.stack.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {form.stack.slice(0, 5).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.06)" }}>{s}</span>
          ))}
          {form.stack.length > 5 && <span className="text-xs" style={{ color: "#374151" }}>+{form.stack.length - 5} more</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <span className="text-xs" style={{ color: "#374151" }}>Just posted · 0 applicants</span>
        <span className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }}>Apply →</span>
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CreateProjectPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector(state => state.projects);
  const loading = status === "loading";
  
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState({
    title: "", tagline: "", category: "", description: "", problem: "",
    roles: [], teamSize: "", duration: "", difficulty: "",
    stack: [], stack_details: "",
    deadline: "", perks: [], applicationQuestion: "",
    github: "", figma: "", website: "",
    isRemote: true, isPublic: true, requireCoverLetter: false,
  });

  const set = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors(p => ({ ...p, [field]: "" })); };
  const toggle = (field, val) => setForm(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val] }));
  const setBool = (field) => setForm(p => ({ ...p, [field]: !p[field] }));

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.title.trim()) e.title = "Title is required";
      else if (form.title.length < 5) e.title = "Title must be at least 5 characters";
      if (!form.category) e.category = "Please select a category";
      if (!form.description.trim()) e.description = "Description is required";
      else if (form.description.length < 50) e.description = "Description should be at least 50 characters";
    }
    if (s === 1) {
      if (form.roles.length === 0) e.roles = "Add at least one role";
      if (!form.teamSize) e.teamSize = "Select a team size";
      if (!form.duration) e.duration = "Select a project duration";
    }
    if (s === 2) {
      if (form.stack.length === 0) e.stack = "Add at least one technology";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => { setErrors({}); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    try {
      const resultAction = await dispatch(createProject(form));
      if (createProject.fulfilled.match(resultAction)) {
        dispatch(fetchProjects());
        navigate("/feed");
      } else {
        setErrors({ form: resultAction.payload || "Failed to create project" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .nav-btn { background:none; border:none; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .section-card { background:rgba(12,8,32,0.8); border:1px solid rgba(139,92,246,0.1); border-radius:16px; padding:24px; margin-bottom:20px; }
        .section-title { font-size:0.8rem; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(139,92,246,0.06); }
        .toggle-row:last-child { border-bottom:none; padding-bottom:0; }
        .toggle-switch { width:38px; height:22px; border-radius:11px; position:relative; cursor:pointer; transition:background 0.2s; border:none; }
        .toggle-knob { width:16px; height:16px; border-radius:50%; background:white; position:absolute; top:3px; transition:left 0.2s; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#05030f", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff" }}>

        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
          style={{ background: "rgba(5,3,15,0.92)", borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", animation: "slideDown 0.4s ease both" }}>
          <div className="flex items-center gap-3">
            <button className="nav-btn flex items-center gap-2" onClick={() => navigate("/dashboard")}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
              <span className="font-semibold text-white">CoSync</span>
            </button>
            <span style={{ color: "#374151" }}>›</span>
            <span className="text-sm" style={{ color: "#6b7280" }}>New Project</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="nav-btn text-sm px-3 py-1.5 rounded-lg"
              style={{ color: "#6b7280", border: "1px solid rgba(139,92,246,0.12)" }}
              onClick={() => navigate("/dashboard")}
            >
              Discard
            </button>
            <button
              onClick={() => setShowPreview(p => !p)}
              className="nav-btn text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
            >
              {showPreview ? "Hide" : "Show"} preview
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ── Page header ── */}
          <div className="mb-8 text-center" style={{ animation: "fadeUp 0.5s ease both" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
              ✦ Creating a new project
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: "-0.025em" }}>
              What are you building?
            </h1>
            <p className="text-sm" style={{ color: "#4b5563" }}>
              Fill in the details — the more specific you are, the better teammates you attract.
            </p>
          </div>

          {/* ── Step bar ── */}
          <div style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.1s" }}>
            <StepBar current={step} />
          </div>

          {/* ── Two column layout ── */}
          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Form (left 3/5) ── */}
            <div className="lg:col-span-3" style={{ animation: "slideRight 0.4s ease both", animationDelay: "0.15s" }}>

              {/* ════════ STEP 0: Basics ════════ */}
              {step === 0 && (
                <>
                  <div className="section-card">
                    <p className="section-title">💡 Project Identity</p>
                    <Field label="Project Title" required error={errors.title}>
                      <TextInput placeholder="e.g. AI Chess Bot, Campus Rideshare App..." value={form.title} onChange={set("title")} error={errors.title} icon="✦" maxLen={60} />
                    </Field>
                    <Field label="One-line Tagline" hint="optional">
                      <TextInput placeholder="A catchy one-liner — what makes this project unique?" value={form.tagline} onChange={set("tagline")} maxLen={100} />
                    </Field>
                    <Field label="Category" required error={errors.category}>
                      <Select options={CATEGORIES} value={form.category} onChange={set("category")} placeholder="What type of project is this?" error={errors.category} />
                    </Field>
                  </div>

                  <div className="section-card">
                    <p className="section-title">📝 Project Description</p>
                    <Field label="What are you building?" required error={errors.description} hint={`${form.description.length}/1000`}>
                      <TextArea
                        placeholder="Describe your project in detail. What will it do? Who is it for? What makes it exciting? The more you write, the better matches you'll attract..."
                        value={form.description} onChange={set("description")} error={errors.description} rows={5} maxLen={1000}
                      />
                    </Field>
                    <Field label="Problem Statement" hint="optional">
                      <TextArea
                        placeholder="What problem does this solve? Why does it need to exist?"
                        value={form.problem} onChange={set("problem")} rows={3} maxLen={500}
                      />
                    </Field>
                  </div>
                </>
              )}

              {/* ════════ STEP 1: Team ════════ */}
              {step === 1 && (
                <>
                  <div className="section-card">
                    <p className="section-title">👥 Roles Needed</p>
                    {errors.roles && <p className="text-xs mb-3" style={{ color: "#f87171" }}>⚠ {errors.roles}</p>}
                    <RoleBuilder roles={form.roles} setRoles={r => setForm(p => ({ ...p, roles: r }))} />
                  </div>

                  <div className="section-card">
                    <p className="section-title">📐 Team Structure</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Team Size" required error={errors.teamSize}>
                        <Select options={TEAM_SIZES} value={form.teamSize} onChange={set("teamSize")} placeholder="Total members" error={errors.teamSize} />
                      </Field>
                      <Field label="Difficulty Level">
                        <Select options={DIFFICULTY} value={form.difficulty} onChange={set("difficulty")} placeholder="Skill level needed" />
                      </Field>
                    </div>
                    <Field label="Project Duration" required error={errors.duration}>
                      <div className="flex flex-wrap gap-2">
                        {DURATIONS.map(d => (
                          <ToggleChip key={d} label={d} selected={form.duration === d} onToggle={() => setForm(p => ({ ...p, duration: d }))} />
                        ))}
                      </div>
                    </Field>
                  </div>

                  <div className="section-card">
                    <p className="section-title">⚙ Team Settings</p>
                    <div className="toggle-row">
                      <div>
                        <p className="text-sm text-white font-medium">Remote friendly</p>
                        <p className="text-xs" style={{ color: "#374151" }}>Team members can work from anywhere</p>
                      </div>
                      <button type="button" className="toggle-switch" onClick={() => setBool("isRemote")}
                        style={{ background: form.isRemote ? "#7c3aed" : "rgba(139,92,246,0.15)" }}>
                        <div className="toggle-knob" style={{ left: form.isRemote ? 19 : 3 }} />
                      </button>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <p className="text-sm text-white font-medium">Public listing</p>
                        <p className="text-xs" style={{ color: "#374151" }}>Visible to all students on the feed</p>
                      </div>
                      <button type="button" className="toggle-switch" onClick={() => setBool("isPublic")}
                        style={{ background: form.isPublic ? "#7c3aed" : "rgba(139,92,246,0.15)" }}>
                        <div className="toggle-knob" style={{ left: form.isPublic ? 19 : 3 }} />
                      </button>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <p className="text-sm text-white font-medium">Require cover letter</p>
                        <p className="text-xs" style={{ color: "#374151" }}>Applicants must write why they want to join</p>
                      </div>
                      <button type="button" className="toggle-switch" onClick={() => setBool("requireCoverLetter")}
                        style={{ background: form.requireCoverLetter ? "#7c3aed" : "rgba(139,92,246,0.15)" }}>
                        <div className="toggle-knob" style={{ left: form.requireCoverLetter ? 19 : 3 }} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ════════ STEP 2: Stack ════════ */}
              {step === 2 && (
                <>
                  <div className="section-card">
                    <p className="section-title">🛠 Tech Stack</p>
                    <Field label="Technologies & Tools" required error={errors.stack} hint="Click suggestions or type your own">
                      <TagInput tags={form.stack} setTags={s => { setForm(p => ({ ...p, stack: s })); if (errors.stack) setErrors(p => ({ ...p, stack: "" })); }}
                        suggestions={STACK_SUGGESTIONS} placeholder="React, Python, MongoDB..." colorful maxTags={20} />
                    </Field>

                    {/* Quick add suggestions */}
                    <div className="mt-3">
                      <p className="text-xs mb-2" style={{ color: "#374151" }}>Quick add</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STACK_SUGGESTIONS.filter(s => !form.stack.includes(s)).slice(0, 12).map((s, i) => (
                          <button key={s} type="button"
                            onClick={() => setForm(p => ({ ...p, stack: [...p.stack, s] }))}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150"
                            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#4b5563", cursor: "pointer" }}
                            onMouseEnter={e => { e.currentTarget.style.color = SKILL_COLORS[i % SKILL_COLORS.length]; e.currentTarget.style.borderColor = `${SKILL_COLORS[i % SKILL_COLORS.length]}40`; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)"; }}>
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field label="Technical Details" hint="optional" >
                      <TextArea placeholder="Any specific architecture decisions, API choices, or technical constraints the team should know about..." value={form.stack_details} onChange={set("stack_details")} rows={3} />
                    </Field>
                  </div>

                  <div className="section-card">
                    <p className="section-title">🔗 Project Links</p>
                    <Field label="GitHub Repository" hint="optional">
                      <TextInput placeholder="https://github.com/username/repo" value={form.github} onChange={set("github")} icon="⌥" />
                    </Field>
                    <Field label="Figma / Design File" hint="optional">
                      <TextInput placeholder="https://figma.com/file/..." value={form.figma} onChange={set("figma")} icon="🎨" />
                    </Field>
                    <Field label="Website / Demo" hint="optional">
                      <TextInput placeholder="https://yourproject.com" value={form.website} onChange={set("website")} icon="🌐" />
                    </Field>
                  </div>
                </>
              )}

              {/* ════════ STEP 3: Details ════════ */}
              {step === 3 && (
                <>
                  <div className="section-card">
                    <p className="section-title">📅 Timeline</p>
                    <Field label="Application Deadline" hint="When will you stop accepting applications?">
                      <input type="date" value={form.deadline} onChange={set("deadline")}
                        style={{ ...inputBase(false, false), padding: "0.625rem 0.875rem", colorScheme: "dark" }} />
                    </Field>
                  </div>

                  <div className="section-card">
                    <p className="section-title">🎁 What Collaborators Get</p>
                    <p className="text-xs mb-3" style={{ color: "#4b5563" }}>Select all that apply to your project</p>
                    <div className="flex flex-wrap gap-2">
                      {PERKS.map(p => (
                        <ToggleChip key={p} label={p} selected={form.perks.includes(p)} onToggle={() => toggle("perks", p)} />
                      ))}
                    </div>
                  </div>

                  <div className="section-card">
                    <p className="section-title">❓ Custom Application Question</p>
                    <Field label="Ask applicants a custom question" hint="optional">
                      <TextInput
                        placeholder="e.g. 'What's your experience with ML models?' or 'Show us something you've built'"
                        value={form.applicationQuestion}
                        onChange={set("applicationQuestion")}
                        maxLen={200}
                      />
                    </Field>
                  </div>

                  {/* Final review summary */}
                  <div className="rounded-2xl p-5" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <p className="text-sm font-semibold text-white mb-3">📋 Project Summary</p>
                    <div className="space-y-2 text-xs" style={{ color: "#6b7280" }}>
                      <div className="flex justify-between"><span>Title</span><span className="text-white">{form.title || "—"}</span></div>
                      <div className="flex justify-between"><span>Category</span><span className="text-white">{form.category || "—"}</span></div>
                      <div className="flex justify-between"><span>Roles</span><span className="text-white">{form.roles.length} role{form.roles.length !== 1 ? "s" : ""}</span></div>
                      <div className="flex justify-between"><span>Team size</span><span className="text-white">{form.teamSize || "—"}</span></div>
                      <div className="flex justify-between"><span>Duration</span><span className="text-white">{form.duration || "—"}</span></div>
                      <div className="flex justify-between"><span>Stack</span><span className="text-white">{form.stack.length} technologies</span></div>
                      <div className="flex justify-between"><span>Visibility</span><span className="text-white">{form.isPublic ? "Public" : "Private"}</span></div>
                      <div className="flex justify-between"><span>Remote</span><span className="text-white">{form.isRemote ? "Yes" : "No"}</span></div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Navigation ── */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button type="button" onClick={prev}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
                    ← Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={next}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 30px rgba(124,58,237,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    Continue →
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 10px 30px rgba(124,58,237,0.4)")}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Publishing project...
                      </span>
                    ) : "🚀 Publish Project"}
                  </button>
                )}
              </div>
            </div>

            {/* ── Live Preview (right 2/5) ── */}
            {showPreview && (
              <div className="lg:col-span-2">
                <div className="sticky top-24" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.2s" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#374151" }}>
                    Live preview
                  </p>
                  <PreviewCard form={form} />
                  <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#6b7280" }}>Tips for better matches</p>
                    <div className="space-y-1.5">
                      {[
                        { done: form.title.length >= 10, tip: "Write a clear, specific title" },
                        { done: form.description.length >= 100, tip: "Add a detailed description (100+ chars)" },
                        { done: form.roles.length > 0, tip: "Specify at least one role" },
                        { done: form.stack.length >= 3, tip: "List 3+ technologies" },
                        { done: !!form.tagline, tip: "Add a catchy tagline" },
                        { done: form.perks.length > 0, tip: "Tell applicants what they get" },
                      ].map(({ done, tip }) => (
                        <div key={tip} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                            style={{ background: done ? "rgba(74,222,128,0.15)" : "rgba(139,92,246,0.08)", color: done ? "#4ade80" : "#374151", border: `1px solid ${done ? "rgba(74,222,128,0.3)" : "rgba(139,92,246,0.1)"}` }}>
                            {done ? "✓" : "·"}
                          </div>
                          <p className="text-xs" style={{ color: done ? "#4b5563" : "#374151", textDecoration: done ? "line-through" : "none" }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectPage;