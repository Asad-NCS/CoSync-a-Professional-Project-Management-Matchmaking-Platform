import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/authSlice";

// ── Reusable input ────────────────────────────────────────────────────────────
const InputField = ({ label, type = "text", placeholder, value, onChange, error, icon, hint }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: focused ? "#a78bfa" : "#9ca3af", transition: "color 0.2s" }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: focused ? "#a78bfa" : "#4b5563", transition: "color 0.2s" }}
          >
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPass ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
          style={{
            background: "rgba(15,10,40,0.8)",
            border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
            padding: `0.625rem ${isPassword ? "2.5rem" : "0.875rem"} 0.625rem ${icon ? "2.25rem" : "0.875rem"}`,
            boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
      {hint && !error && <p className="text-xs mt-1" style={{ color: "#4b5563" }}>{hint}</p>}
    </div>
  );
};

// ── Select field ─────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, error, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium mb-1.5" style={{ color: focused ? "#a78bfa" : "#9ca3af", transition: "color 0.2s" }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: focused ? "#a78bfa" : "#4b5563", transition: "color 0.2s" }}>
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg text-sm outline-none transition-all duration-200 appearance-none"
          style={{
            background: "rgba(15,10,40,0.8)",
            border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
            padding: `0.625rem 2rem 0.625rem ${icon ? "2.25rem" : "0.875rem"}`,
            color: value ? "#fff" : "#4b5563",
            boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
          }}
        >
          <option value="" style={{ background: "#0a0520" }}>Select...</option>
          {options.map((o) => (
            <option key={o} value={o} style={{ background: "#0a0520", color: "#fff" }}>{o}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "#4b5563" }}>▾</span>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
};

// ── Textarea field ────────────────────────────────────────────────────────────
const TextareaField = ({ label, placeholder, value, onChange, error, maxLen }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium" style={{ color: focused ? "#a78bfa" : "#9ca3af", transition: "color 0.2s" }}>{label}</label>
        {maxLen && <span className="text-xs" style={{ color: value.length > maxLen * 0.9 ? "#f87171" : "#4b5563" }}>{value.length}/{maxLen}</span>}
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        maxLength={maxLen}
        className="w-full rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 resize-none"
        style={{
          background: "rgba(15,10,40,0.8)",
          border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
          padding: "0.625rem 0.875rem",
          boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
        }}
      />
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
};

// ── Skill tag input ───────────────────────────────────────────────────────────
const SKILL_COLORS = ["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#34d399", "#60a5fa", "#fbbf24"];
const SkillTagInput = ({ skills, setSkills, error }) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const addSkill = (raw) => {
    const s = raw.trim();
    if (s && !skills.includes(s) && skills.length < 10) {
      setSkills([...skills, s]);
    }
    setInput("");
  };

  const onKey = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === "Backspace" && !input && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  const remove = (s) => setSkills(skills.filter((x) => x !== s));

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium mb-1.5" style={{ color: focused ? "#a78bfa" : "#9ca3af", transition: "color 0.2s" }}>
        Skills <span style={{ color: "#4b5563" }}>(press Enter or comma to add)</span>
      </label>
      <div
        className="rounded-lg min-h-10 flex flex-wrap gap-1.5 p-2 transition-all duration-200"
        style={{
          background: "rgba(15,10,40,0.8)",
          border: `1px solid ${error ? "#ef4444" : focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
          boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
          cursor: "text",
        }}
        onClick={() => document.getElementById("skill-input").focus()}
      >
        {skills.map((s, i) => (
          <span
            key={s}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: `${SKILL_COLORS[i % SKILL_COLORS.length]}18`,
              border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}40`,
              color: SKILL_COLORS[i % SKILL_COLORS.length],
            }}
          >
            {s}
            <button
              type="button"
              onClick={() => remove(s)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="skill-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) addSkill(input); }}
          placeholder={skills.length === 0 ? "React, Python, Figma..." : ""}
          className="flex-1 min-w-20 bg-transparent outline-none text-sm text-white placeholder-gray-600"
          style={{ minWidth: 120 }}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
      {!error && <p className="text-xs mt-1" style={{ color: "#4b5563" }}>Up to 10 skills · {skills.length}/10 added</p>}
    </div>
  );
};

// ── Password strength ─────────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;

  return (
    <div className="mb-4 -mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : "rgba(139,92,246,0.1)" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
};

// ── Step indicator ────────────────────────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="transition-all duration-300 rounded-full"
        style={{
          width: i === current ? 20 : 6,
          height: 6,
          background: i <= current ? "#7c3aed" : "rgba(139,92,246,0.15)",
        }}
      />
    ))}
    <span className="text-xs ml-1" style={{ color: "#4b5563" }}>Step {current + 1} of {total}</span>
  </div>
);

// ── Main Register Page ────────────────────────────────────────────────────────
const ROLES = ["Developer", "Designer", "Project Manager", "ML Engineer", "DevOps", "Other"];
const DEGREES = ["BS Computer Science", "BS Software Engineering", "BS Electrical Engineering", "BS AI", "BS Data Science", "MS Computer Science", "Other"];
const UNIVERSITIES = ["NUST", "FAST-NUCES", "LUMS", "COMSATS", "UET Lahore", "IBA Karachi", "Other"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const loading = status === "loading";

  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    university: "", degree: "", role: "",
    skills: [], bio: "", github: "", linkedin: "",
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  // ── Validate per step ──
  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.fullName.trim()) errs.fullName = "Full name is required";
      else if (form.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters";

      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";

      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "Minimum 8 characters";

      if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
      else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }
    if (s === 1) {
      if (!form.university) errs.university = "Please select your university";
      if (!form.degree) errs.degree = "Please select your degree";
      if (!form.role) errs.role = "Please select your primary role";
      if (form.skills.length === 0) errs.skills = "Add at least one skill";
      if (form.bio && form.bio.length < 20) errs.bio = "Bio should be at least 20 characters";
    }
    if (s === 2) {
      if (form.github && !/^https?:\/\/(www\.)?github\.com\/.+/.test(form.github))
        errs.github = "Enter a valid GitHub URL (e.g. https://github.com/username)";
      if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(form.linkedin))
        errs.linkedin = "Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(step + 1);
  };

  const prev = () => { setErrors({}); setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting registration form:", form);
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError("");
    try {
      const resultAction = await dispatch(registerUser(form));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate("/dashboard", { replace: true });
      } else {
        setApiError(resultAction.payload || "Registration failed. Please try again.");
      }
    } catch {
      setApiError("Registration failed. Please try again.");
    }
  };

  const STEPS = ["Account", "Profile", "Links"];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes floatA {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(20px,15px); }
        }
        @keyframes floatB {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-15px,20px); }
        }
        .btn-submit {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(124,58,237,0.4);
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-back {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          border: 1px solid rgba(139,92,246,0.2);
          color: #9ca3af;
        }
        .btn-back:hover { border-color: rgba(139,92,246,0.4); color: #fff; }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{ background: "#05030f", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* ── Left decorative panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 relative overflow-hidden p-12"
          style={{ borderRight: "1px solid rgba(139,92,246,0.1)" }}
        >
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(139,92,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.06) 1px,transparent 1px)`, backgroundSize: "50px 50px" }} />

          {/* Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full" style={{ width: 450, height: 450, top: "-80px", left: "-80px", background: "radial-gradient(circle,rgba(109,40,217,0.18) 0%,transparent 70%)", animation: "floatA 14s ease-in-out infinite" }} />
            <div className="absolute rounded-full" style={{ width: 350, height: 350, bottom: "0", right: "-60px", background: "radial-gradient(circle,rgba(139,92,246,0.13) 0%,transparent 70%)", animation: "floatB 18s ease-in-out infinite" }} />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
            <span className="text-white font-semibold tracking-tight">CoSync</span>
          </div>

          {/* Progress visualization */}
          <div className="relative flex-1 flex flex-col justify-center">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Setting up your profile</p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-3 transition-all duration-300"
                  style={{ opacity: i <= step ? 1 : 0.3 }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                    style={{
                      background: i < step ? "#7c3aed" : i === step ? "rgba(124,58,237,0.2)" : "rgba(139,92,246,0.08)",
                      border: `1px solid ${i <= step ? "#7c3aed" : "rgba(139,92,246,0.15)"}`,
                      color: i <= step ? "#fff" : "#4b5563",
                    }}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: i === step ? "#fff" : i < step ? "#a78bfa" : "#4b5563" }}>{s}</p>
                    <p className="text-xs" style={{ color: "#4b5563" }}>
                      {["Email & password", "Skills & university", "Portfolio links"][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom note */}
          <div className="relative">
            <div className="rounded-xl border p-4" style={{ background: "rgba(15,10,40,0.6)", borderColor: "rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your profile is how project leads find you. A complete profile with skills and a bio gets <span style={{ color: "#a78bfa" }}>3× more match opportunities</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div
            className="w-full max-w-lg py-8"
            style={{ animation: "fadeUp 0.6s ease both" }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
              <span className="text-white font-semibold">CoSync</span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                Create your account
              </h1>
              <p className="text-gray-500 text-sm">Join CoSync and start building teams</p>
            </div>

            <StepDots current={step} total={3} />

            {apiError && (
              <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                {apiError}
              </div>
            )}

            {!apiError && error && (
              <p className="text-sm mt-2 mb-4" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); next(); }} noValidate>

              {/* ── Step 0: Account ── */}
              {step === 0 && (
                <div style={{ animation: "slideRight 0.35s ease both" }}>
                  <InputField label="Full name" placeholder="Muhammad Asad Kashif" value={form.fullName} onChange={set("fullName")} error={errors.fullName} icon="👤" />
                  <InputField label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} icon="✉" />
                  <InputField label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} error={errors.password} icon="🔒" hint="Use uppercase, numbers, and symbols for a stronger password" />
                  <PasswordStrength password={form.password} />
                  <InputField label="Confirm password" type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} icon="🔒" />
                </div>
              )}

              {/* ── Step 1: Academic + Skills ── */}
              {step === 1 && (
                <div style={{ animation: "slideRight 0.35s ease both" }}>
                  <SelectField label="University / institution" value={form.university} onChange={set("university")} options={UNIVERSITIES} error={errors.university} icon="🏛" />
                  <SelectField label="Degree programme" value={form.degree} onChange={set("degree")} options={DEGREES} error={errors.degree} icon="🎓" />
                  <SelectField label="Primary role" value={form.role} onChange={set("role")} options={ROLES} error={errors.role} icon="💼" />
                  <SkillTagInput
                    skills={form.skills}
                    setSkills={(s) => { setForm({ ...form, skills: s }); if (errors.skills) setErrors({ ...errors, skills: "" }); }}
                    error={errors.skills}
                  />
                  <TextareaField
                    label="Bio (optional)"
                    placeholder="Tell teams a bit about yourself — your interests, what you're building, what excites you..."
                    value={form.bio}
                    onChange={set("bio")}
                    error={errors.bio}
                    maxLen={300}
                  />
                </div>
              )}

              {/* ── Step 2: Links ── */}
              {step === 2 && (
                <div style={{ animation: "slideRight 0.35s ease both" }}>
                  <div className="rounded-xl border p-4 mb-6" style={{ background: "rgba(139,92,246,0.05)", borderColor: "rgba(139,92,246,0.15)" }}>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Portfolio links are optional but highly recommended — they increase your chances of getting accepted into teams significantly.
                    </p>
                  </div>
                  <InputField
                    label="GitHub profile"
                    placeholder="https://github.com/username"
                    value={form.github}
                    onChange={set("github")}
                    error={errors.github}
                    icon="⌥"
                    hint="Link your GitHub so project leads can see your work"
                  />
                  <InputField
                    label="LinkedIn profile"
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={set("linkedin")}
                    error={errors.linkedin}
                    icon="🔗"
                  />

                  {/* Preview card */}
                  {(form.fullName || form.role || form.skills.length > 0) && (
                    <div className="rounded-xl border p-4 mt-2" style={{ background: "rgba(15,10,40,0.7)", borderColor: "rgba(139,92,246,0.2)" }}>
                      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#4b5563" }}>Profile preview</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff" }}>
                          {form.fullName ? form.fullName[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{form.fullName || "Your name"}</p>
                          <p className="text-xs" style={{ color: "#a78bfa" }}>{form.role || "Your role"} · {form.university || "University"}</p>
                        </div>
                      </div>
                      {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {form.skills.slice(0, 5).map((s, i) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6"][i % 5]}18`, color: ["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6"][i % 5], border: `1px solid ${["#61dafb", "#a78bfa", "#4ade80", "#fb923c", "#f472b6"][i % 5]}40` }}>
                              {s}
                            </span>
                          ))}
                          {form.skills.length > 5 && <span className="text-xs" style={{ color: "#4b5563" }}>+{form.skills.length - 5}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div className={`mt-6 flex gap-3 ${step > 0 ? "flex-row" : "flex-col"}`}>
                {step > 0 && (
                  <button type="button" className="btn-back" onClick={prev}>
                    ← Back
                  </button>
                )}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Creating account...
                    </span>
                  ) : step === 2 ? "Create account" : "Continue →"}
                </button>
              </div>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "#4b5563" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
