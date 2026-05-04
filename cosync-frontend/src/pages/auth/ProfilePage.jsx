import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../lib/api";
import { updateUser } from "../../store/authSlice";

const SKILL_COLORS = ["#61dafb","#a78bfa","#4ade80","#fb923c","#f472b6","#34d399","#60a5fa","#fbbf24","#e879f9","#38bdf8"];
const ROLES = ["Developer","Designer","Project Manager","ML Engineer","DevOps","Mobile Developer","Other"];
const DEGREES = ["BS Computer Science","BS Software Engineering","BS AI","BS Data Science","MS Computer Science","Other"];
const UNIVERSITIES = ["NUST","FAST-NUCES","LUMS","COMSATS","UET Lahore","IBA Karachi","Other"];

const inputStyle = (focused, error) => ({
  background: "rgba(15,10,40,0.8)",
  border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
  borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none",
  transition: "all 0.2s", width: "100%", fontFamily: "inherit",
  boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
  padding: "0.625rem 0.875rem",
});

const Field = ({ label, children, hint }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold" style={{ color: "#6b7280" }}>{label}</label>
      {hint && <span className="text-xs" style={{ color: "#374151" }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={inputStyle(focused, false)} />
  );
};

const SelectInput = ({ value, onChange, options, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputStyle(focused, false), appearance: "none", cursor: "pointer", color: value ? "#fff" : "#4b5563" }}>
        <option value="" style={{ background: "#0a0520" }}>{placeholder}</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#0a0520", color: "#fff" }}>{o}</option>)}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs" style={{ color: "#4b5563" }}>▾</span>
    </div>
  );
};

const SkillTagInput = ({ skills, setSkills }) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const add = (v) => { const s = v.trim(); if (s && !skills.includes(s) && skills.length < 15) setSkills([...skills, s]); setInput(""); };
  const onKey = (e) => { if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); if (input.trim()) add(input); } else if (e.key === "Backspace" && !input && skills.length) setSkills(skills.slice(0, -1)); };
  return (
    <div style={{ ...inputStyle(focused, false), padding: "0.5rem", minHeight: 44, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}
      onClick={() => document.getElementById("skill-tag-inp")?.focus()}>
      {skills.map((s, i) => (
        <span key={s} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}15`, border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}35`, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
          {s}
          <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input id="skill-tag-inp" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={onKey} onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); if (input.trim()) add(input); }}
        placeholder={skills.length === 0 ? "React, Python, Figma... (press Enter)" : ""}
        style={{ flex: 1, minWidth: 120, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.875rem", fontFamily: "inherit" }} />
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [university, setUniversity] = useState(user?.university ?? '')
  const [degree, setDegree] = useState(user?.degree ?? '')
  const [role, setRole] = useState(user?.role ?? '')
  const [skills, setSkills] = useState(user?.skills ?? [])
  const [bio, setBio] = useState(user?.bio ?? '')
  const [github, setGithub] = useState(user?.github ?? '')
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? '')
  const [portfolio, setPortfolio] = useState(user?.portfolio ?? '')
  const [availability, setAvailability] = useState(user?.availability ?? 'Available')

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    try {
      const res = await api.put('/users/profile', {
        fullName, university, degree, role, skills, bio, github, linkedin
      })
      dispatch(updateUser(res.data.data))
      setSaveSuccess(true)
    } catch (err) {
      setSaveError('Failed to save profile. Please try again.')
    }
    setSaving(false)
  }

  const TABS = ["profile", "skills", "links"];

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
            <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>Profile</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "none", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
              ← Dashboard
            </button>
            <div className="flex flex-col items-end">
              <button onClick={handleSave} disabled={saving}
                className="text-sm px-4 py-1.5 rounded-lg font-semibold transition-all duration-300"
                style={{ background: saveSuccess ? "rgba(74,222,128,0.15)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color: saveSuccess ? "#4ade80" : "#fff", border: saveSuccess ? "1px solid rgba(74,222,128,0.3)" : "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveSuccess && <p className="text-green-400 text-sm mt-2">Profile saved successfully!</p>}
              {saveError && <p className="text-red-400 text-sm mt-2">{saveError}</p>}
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-10">

          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "rgba(12,8,32,0.9)", border: "1px solid rgba(139,92,246,0.15)", animation: "fadeUp 0.5s ease both" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(109,40,217,0.12) 0%, transparent 60%)" }} />
            <div className="relative flex items-start gap-5 flex-wrap">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff" }}>
                  {fullName?.[0]?.toUpperCase() || "?"}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.02em" }}>{fullName}</h1>
                    <p style={{ color: "#a78bfa", fontSize: "0.9rem" }}>{role} {university ? `· ${university}` : ''}</p>
                    <p className="text-sm mt-1" style={{ color: "#4b5563" }}>{degree}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80" }}>
                      ● {availability}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                      🏆 {user?.completedProjects || 0} Completed
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", color: "#fb923c" }}>
                      ⭐ {user?.rating || 5.0} Reputation
                    </span>
                  </div>
                </div>

                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#6b7280", maxWidth: 500 }}>{bio || "No bio added yet."}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skills.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}12`, border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}30`, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "rgba(12,8,32,0.8)", border: "1px solid rgba(139,92,246,0.1)" }}>
                {TABS.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200"
                    style={{
                      background: activeTab === t ? "rgba(124,58,237,0.2)" : "transparent",
                      border: activeTab === t ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                      color: activeTab === t ? "#a78bfa" : "#4b5563",
                      cursor: "pointer",
                    }}>
                    {t}
                  </button>
                ))}
              </div>

              {activeTab === "profile" && (
                <div style={{ animation: "fadeUp 0.35s ease both" }}>
                  <div className="section-card">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Personal Info</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Full Name">
                        <TextInput value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                      </Field>
                      <Field label="Email">
                        <input value={email} readOnly disabled
                          style={{ ...inputStyle(false, false), opacity: 0.5, cursor: "not-allowed" }} />
                      </Field>
                    </div>
                    <Field label="Bio" hint={`${bio.length}/300`}>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300}
                        placeholder="Tell the community about yourself..."
                        style={{ ...inputStyle(false, false), resize: "none" }} />
                    </Field>
                  </div>

                  <div className="section-card">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Academic & Professional</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="University">
                        <SelectInput value={university} onChange={e => setUniversity(e.target.value)} options={UNIVERSITIES} placeholder="Select university" />
                      </Field>
                      <Field label="Degree">
                        <SelectInput value={degree} onChange={e => setDegree(e.target.value)} options={DEGREES} placeholder="Select degree" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Professional Title">
                        <SelectInput value={role} onChange={e => setRole(e.target.value)} options={ROLES} placeholder="Your title" />
                      </Field>
                      <Field label="Availability">
                        <SelectInput value={availability} onChange={e => setAvailability(e.target.value)} options={["Available", "Busy", "Open to ideas"]} placeholder="Select status" />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div style={{ animation: "fadeUp 0.35s ease both" }}>
                  <div className="section-card">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Your Skills</p>
                    <Field label="Add Skills" hint={`${skills.length}/15`}>
                      <SkillTagInput skills={skills} setSkills={setSkills} />
                    </Field>
                    <p className="text-xs mb-4" style={{ color: "#374151" }}>Popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {["React","Node.js","Python","MongoDB","Figma","Docker","AWS","TypeScript"].filter(s => !skills.includes(s)).map((s, i) => (
                        <button key={s} type="button"
                          onClick={() => setSkills(p => [...p, s])}
                          className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150"
                          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#4b5563", cursor: "pointer" }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "links" && (
                <div style={{ animation: "fadeUp 0.35s ease both" }}>
                  <div className="section-card">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Portfolio & Social</p>
                    <Field label="GitHub URL">
                      <TextInput value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" />
                    </Field>
                    <Field label="LinkedIn URL">
                      <TextInput value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </Field>
                    <Field label="Portfolio Website">
                      <TextInput value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yourwebsite.com" />
                    </Field>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="section-card">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Profile Strength</p>
                <div className="mt-3">
                  <div className="flex justify-between mb-1.5 text-xs" style={{ color: "#374151" }}>
                    <span>Completeness</span>
                    <span style={{ color: "#a78bfa" }}>
                      {Math.round(([!!fullName, !!bio, !!university, skills.length >= 3, !!github].filter(Boolean).length / 5) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(([!!fullName, !!bio, !!university, skills.length >= 3, !!github].filter(Boolean).length / 5) * 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
