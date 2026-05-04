import { useState } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/authSlice";

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage: "linear-gradient(to right, black, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black, transparent)"
      }}
    />
  </div>
);

// ── Reusable input ────────────────────────────────────────────────────────────
const InputField = ({ label, type = "text", placeholder, value, onChange, error, icon, hint }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className={`block text-xs font-medium mb-1.5 transition-colors ${focused ? 'text-accent' : 'text-secondary'}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${focused ? 'text-accent' : 'text-secondary/70'}`}>
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
          className={`w-full rounded-lg text-sm bg-surface border text-primary placeholder-secondary/50 outline-none transition-all duration-200 ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 ${error ? 'border-red-500' : focused ? 'border-accent shadow-[0_0_0_3px_rgba(0,112,243,0.1)]' : 'border-border'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary transition-colors"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs mt-1 text-secondary">{hint}</p>}
    </div>
  );
};

// ── Select field ─────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, error, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      <label className={`block text-xs font-medium mb-1.5 transition-colors ${focused ? 'text-accent' : 'text-secondary'}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors ${focused ? 'text-accent' : 'text-secondary/70'}`}>
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg text-sm bg-surface border text-primary outline-none transition-all duration-200 appearance-none ${icon ? 'pl-10' : 'pl-3.5'} py-2.5 ${error ? 'border-red-500' : focused ? 'border-accent shadow-[0_0_0_3px_rgba(0,112,243,0.1)]' : 'border-border'} ${!value && 'text-secondary/70'}`}
        >
          <option value="" className="bg-background text-secondary">Select...</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-background text-primary">{o}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-secondary">▾</span>
      </div>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
};

// ── Textarea field ────────────────────────────────────────────────────────────
const TextareaField = ({ label, placeholder, value, onChange, error, maxLen }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className={`text-xs font-medium transition-colors ${focused ? 'text-accent' : 'text-secondary'}`}>{label}</label>
        {maxLen && <span className={`text-xs ${value.length > maxLen * 0.9 ? 'text-red-500' : 'text-secondary'}`}>{value.length}/{maxLen}</span>}
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        maxLength={maxLen}
        className={`w-full rounded-lg text-sm bg-surface border text-primary placeholder-secondary/50 outline-none transition-all duration-200 resize-none p-3.5 ${error ? 'border-red-500' : focused ? 'border-accent shadow-[0_0_0_3px_rgba(0,112,243,0.1)]' : 'border-border'}`}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
};

// ── Skill tag input ───────────────────────────────────────────────────────────
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
      <label className={`block text-xs font-medium mb-1.5 transition-colors ${focused ? 'text-accent' : 'text-secondary'}`}>
        Skills <span className="text-secondary/70 font-normal">(press Enter or comma to add)</span>
      </label>
      <div
        className={`rounded-lg min-h-[42px] flex flex-wrap gap-1.5 p-2 transition-all duration-200 bg-surface border cursor-text ${error ? 'border-red-500' : focused ? 'border-accent shadow-[0_0_0_3px_rgba(0,112,243,0.1)]' : 'border-border'}`}
        onClick={() => document.getElementById("skill-input").focus()}
      >
        {skills.map((s, i) => (
          <span
            key={s}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20"
          >
            {s}
            <button
              type="button"
              onClick={() => remove(s)}
              className="ml-0.5 hover:text-white transition-colors"
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
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-primary placeholder-secondary/50"
        />
      </div>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      {!error && <p className="text-xs mt-1 text-secondary">Up to 10 skills · {skills.length}/10 added</p>}
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
  const bgClasses = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];
  const textClasses = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-green-500"];

  if (!password) return null;

  return (
    <div className="mb-4 -mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? bgClasses[score] : 'bg-border'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${textClasses[score]}`}>{labels[score]}</p>
    </div>
  );
};

// ── Step indicator ────────────────────────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`transition-all duration-300 rounded-full h-1.5 ${i === current ? 'w-5 bg-accent' : i < current ? 'w-1.5 bg-accent/60' : 'w-1.5 bg-border'}`}
      />
    ))}
    <span className="text-xs ml-2 text-secondary font-medium">Step {current + 1} of {total}</span>
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
        errs.github = "Enter a valid GitHub URL";
      if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(form.linkedin))
        errs.linkedin = "Enter a valid LinkedIn URL";
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
        .btn-submit {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }
      `}</style>

      <div className="min-h-screen flex font-sans text-primary selection:bg-accent selection:text-white">
        
        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 relative overflow-hidden p-12">
          <GridBackground />
          {/* Subtle gradient mesh background to bridge the theme */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-accent/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          <div className="relative flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <Logo className="w-8 h-8" />
            <span className="text-primary font-medium tracking-tight text-lg">CoSync</span>
          </div>

          <div className="relative flex-1 flex flex-col justify-center">
            <p className="text-secondary text-xs uppercase tracking-wider font-medium mb-8">Setting up your profile</p>
            <div className="space-y-6 border-l border-border/50 ml-3 pl-6 relative">
              {STEPS.map((s, i) => (
                <div key={s} className={`relative transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                  {/* Indicator Dot */}
                  <div 
                    className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 bg-background transition-colors duration-300 ${i < step ? 'border-accent bg-accent' : i === step ? 'border-accent shadow-[0_0_8px_rgba(0,112,243,0.5)]' : 'border-border'}`}
                    style={{ top: '6px' }}
                  />
                  <h3 className={`text-sm font-medium ${i === step ? 'text-primary' : i < step ? 'text-primary/80' : 'text-secondary'}`}>{s}</h3>
                  <p className="text-xs text-secondary mt-1">
                    {["Email & password", "Skills & university", "Portfolio links"][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative glass-panel rounded-xl p-5 border-border/60">
            <p className="text-xs text-secondary leading-relaxed">
              Your profile is how project leads find you. A complete profile with skills and a bio gets <span className="text-accent font-medium">3× more match opportunities</span>.
            </p>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto relative z-10">
          <div className="w-full max-w-sm py-8" style={{ animation: "fadeUp 0.5s ease both" }}>
            
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-10 cursor-pointer" onClick={() => navigate("/")}>
              <Logo className="w-6 h-6" />
              <span className="text-primary font-medium tracking-tight">CoSync</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-medium text-primary tracking-tight mb-2">Create your account</h1>
              <p className="text-secondary text-sm">Join CoSync and start building teams.</p>
            </div>

            <StepDots current={step} total={3} />

            {apiError && (
              <div className="rounded-md p-3 mb-5 text-sm bg-red-500/10 border border-red-500/20 text-red-500">
                {apiError}
              </div>
            )}
            {!apiError && error && (
              <div className="rounded-md p-3 mb-5 text-sm bg-red-500/10 border border-red-500/20 text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); next(); }} noValidate>
              
              {/* ── Step 0: Account ── */}
              {step === 0 && (
                <div style={{ animation: "slideRight 0.3s ease both" }}>
                  <InputField label="Full name" placeholder="Jane Doe" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                  <InputField label="Email address" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} error={errors.email} />
                  <InputField label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} error={errors.password} />
                  <PasswordStrength password={form.password} />
                  <InputField label="Confirm password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
                </div>
              )}

              {/* ── Step 1: Academic + Skills ── */}
              {step === 1 && (
                <div style={{ animation: "slideRight 0.3s ease both" }}>
                  <SelectField label="University" value={form.university} onChange={set("university")} options={UNIVERSITIES} error={errors.university} />
                  <SelectField label="Degree" value={form.degree} onChange={set("degree")} options={DEGREES} error={errors.degree} />
                  <SelectField label="Primary Role" value={form.role} onChange={set("role")} options={ROLES} error={errors.role} />
                  <SkillTagInput skills={form.skills} setSkills={(s) => { setForm({ ...form, skills: s }); if (errors.skills) setErrors({ ...errors, skills: "" }); }} error={errors.skills} />
                  <TextareaField label="Bio (optional)" placeholder="What are you building?" value={form.bio} onChange={set("bio")} error={errors.bio} maxLen={300} />
                </div>
              )}

              {/* ── Step 2: Links ── */}
              {step === 2 && (
                <div style={{ animation: "slideRight 0.3s ease both" }}>
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 mb-6">
                    <p className="text-xs text-secondary leading-relaxed">
                      Portfolio links are optional but highly recommended. They let project leads verify your skills.
                    </p>
                  </div>
                  <InputField label="GitHub profile" placeholder="https://github.com/jane" value={form.github} onChange={set("github")} error={errors.github} />
                  <InputField label="LinkedIn profile" placeholder="https://linkedin.com/in/jane" value={form.linkedin} onChange={set("linkedin")} error={errors.linkedin} />

                  {/* Profile Preview Card */}
                  {(form.fullName || form.role || form.skills.length > 0) && (
                    <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                      <p className="text-[10px] uppercase tracking-wider text-secondary mb-3 font-medium">Profile Preview</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-border text-primary shrink-0">
                          {form.fullName ? form.fullName[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-primary text-sm font-medium">{form.fullName || "Your name"}</p>
                          <p className="text-xs text-secondary">{form.role || "Role"} · {form.university || "University"}</p>
                        </div>
                      </div>
                      {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {form.skills.slice(0, 4).map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background text-secondary">
                              {s}
                            </span>
                          ))}
                          {form.skills.length > 4 && <span className="text-[10px] text-secondary">+{form.skills.length - 4}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div className={`mt-8 flex gap-3 ${step > 0 ? "flex-row" : "flex-col"}`}>
                {step > 0 && (
                  <button type="button" className="w-full px-4 py-2 rounded-md text-sm font-medium border border-border bg-surface hover:bg-surfaceHover text-primary transition-colors" onClick={prev}>
                    Back
                  </button>
                )}
                <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium bg-primary text-background hover:bg-white/90 active:scale-95 transition-all btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" strokeLinecap="round" /></svg>
                      Creating...
                    </span>
                  ) : step === 2 ? "Complete Setup" : "Continue"}
                </button>
              </div>
            </form>

            <p className="text-center text-sm mt-8 text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-accent font-medium transition-colors">
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
