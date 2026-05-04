import { useState } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/authSlice";

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
        maskImage: "linear-gradient(to bottom, black, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black, transparent)"
      }}
    />
  </div>
);

const FloatingCard = ({ title, subtitle, tag, tagColor, delay, style }) => (
  <div
    className="absolute rounded-xl border border-border bg-surface/50 backdrop-blur-md p-4 shadow-xl"
    style={{
      animation: `cardFloat 8s ease-in-out infinite`,
      animationDelay: delay,
      minWidth: 220,
      ...style,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-primary text-xs font-medium tracking-tight">{title}</p>
      <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${tagColor}`}>
        {tag}
      </span>
    </div>
    <p className="text-secondary text-xs">{subtitle}</p>
    <div className="flex -space-x-1 mt-3">
      {["#0070F3", "#3291FF", "#888888"].map((c, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border-2 border-surface"
          style={{ background: c }}
        />
      ))}
    </div>
  </div>
);

const InputField = ({ label, type = "text", placeholder, value, onChange, error, icon }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className={`block text-xs font-medium mb-1.5 transition-colors ${focused ? 'text-accent' : 'text-secondary'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && showPass ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg text-sm bg-surface border text-primary placeholder-secondary/50 outline-none transition-all duration-200 px-3.5 py-2.5 ${error ? 'border-red-500' : focused ? 'border-accent shadow-[0_0_0_3px_rgba(0,112,243,0.1)]' : 'border-border'}`}
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
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const loading = status === "loading";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    
    try {
      const resultAction = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate("/dashboard");
      } else {
        setApiError(resultAction.payload || "Invalid email or password. Please try again.");
      }
    } catch {
      setApiError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        @keyframes cardFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      <div className="min-h-screen flex font-sans text-primary selection:bg-accent selection:text-white">
        
        {/* ── Left panel — decorative ── */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12">
          <GridBackground />

          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent rounded-full blur-[140px]" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-[140px]" />
          </div>

          <div className="relative flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <Logo className="w-8 h-8" />
            <span className="text-primary font-medium tracking-tight text-lg">CoSync</span>
          </div>

          <div className="relative flex-1">
            <FloatingCard 
              title="Next.js Platform" 
              subtitle="2 of 3 roles filled" 
              tag="Active" 
              tagColor="bg-green-500/10 text-green-500 border-green-500/20" 
              delay="0s" 
              style={{ top: "25%", left: "10%" }} 
            />
            <FloatingCard 
              title="Campus Rideshare" 
              subtitle="Looking for React dev" 
              tag="Open" 
              tagColor="bg-accent/10 text-accent border-accent/20" 
              delay="2s" 
              style={{ top: "50%", right: "10%" }} 
            />
          </div>

          <div className="relative glass-panel rounded-xl p-5 border-border/60 max-w-sm">
            <p className="text-secondary text-sm leading-relaxed italic mb-3">
              "Found my entire hackathon team in under an hour. We ended up winning first place."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium text-primary">BA</div>
              <div>
                <p className="text-primary text-xs font-medium">Bilal Ahmed</p>
                <p className="text-secondary text-[10px]">CS-2022, NUST</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-sm" style={{ animation: "fadeUp 0.5s ease both" }}>
            
            <div className="lg:hidden flex items-center gap-2 mb-10 cursor-pointer" onClick={() => navigate("/")}>
              <Logo className="w-6 h-6" />
              <span className="text-primary font-medium tracking-tight">CoSync</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-medium text-primary tracking-tight mb-2">Welcome back</h1>
              <p className="text-secondary text-sm">Sign in to your CoSync account</p>
            </div>

            {apiError && (
              <div className="rounded-md p-3 mb-5 text-sm bg-red-500/10 border border-red-500/20 text-red-500">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <InputField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
              />

              <div className="flex items-center justify-between mb-8 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-border bg-surface accent-accent cursor-pointer" />
                  <span className="text-xs text-secondary group-hover:text-primary transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-xs text-secondary hover:text-primary transition-colors">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-md text-sm font-medium bg-primary text-background hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" strokeLinecap="round" /></svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm mt-8 text-secondary">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:text-accent font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;