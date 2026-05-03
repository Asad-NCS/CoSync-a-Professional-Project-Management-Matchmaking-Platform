import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/authSlice";

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

const FloatingCard = ({ title, subtitle, tag, tagColor, delay, style }) => (
  <div
    className="absolute rounded-xl border p-4 backdrop-blur-sm"
    style={{
      background: "rgba(15,10,40,0.75)",
      borderColor: "rgba(139,92,246,0.25)",
      animation: `cardFloat 6s ease-in-out infinite`,
      animationDelay: delay,
      minWidth: 200,
      ...style,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-white text-xs font-semibold">{title}</p>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: `${tagColor}18`,
          color: tagColor,
          border: `1px solid ${tagColor}40`,
        }}
      >
        {tag}
      </span>
    </div>
    <p className="text-gray-500 text-xs">{subtitle}</p>
    <div className="flex gap-1 mt-2">
      {["#7c3aed", "#8b5cf6", "#a78bfa"].map((c, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border"
          style={{ background: c, borderColor: "#05030f" }}
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
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: focused ? "#a78bfa" : "#9ca3af", transition: "color 0.2s" }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
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
            style={{ color: "#4b5563" }}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
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
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(124,58,237,0.4);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #374151;
          font-size: 0.75rem;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(139,92,246,0.15);
        }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{ background: "#05030f", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* ── Left panel — decorative ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
          style={{ borderRight: "1px solid rgba(139,92,246,0.1)" }}
        >
          <GridBackground />

          {/* Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full" style={{ width:500, height:500, top:"-100px", left:"-100px", background:"radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)" }} />
            <div className="absolute rounded-full" style={{ width:400, height:400, bottom:"0", right:"-100px", background:"radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-2" style={{ animation: "fadeIn 0.5s ease both" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
            <span className="text-white font-semibold tracking-tight">CoSync</span>
          </div>

          {/* Floating cards */}
          <div className="relative flex-1">
            <FloatingCard title="AI Chess Bot" subtitle="2 of 3 roles filled" tag="Active" tagColor="#4ade80" delay="0s" style={{ top: "15%", left: "5%" }} />
            <FloatingCard title="Campus Rideshare" subtitle="Looking for React dev" tag="Open" tagColor="#a78bfa" delay="2s" style={{ top: "42%", right: "5%" }} />
            <FloatingCard title="ML Research" subtitle="Team of 4 formed" tag="Full" tagColor="#fb923c" delay="4s" style={{ bottom: "15%", left: "10%" }} />
          </div>

          {/* Quote */}
          <div className="relative" style={{ animation: "fadeIn 0.8s ease both", animationDelay: "0.3s" }}>
            <p className="text-gray-400 text-sm leading-relaxed italic mb-3">
              "Found my entire hackathon team in under an hour. We ended up winning."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }} />
              <div>
                <p className="text-white text-xs font-medium">Bilal Ahmed</p>
                <p className="text-gray-600 text-xs">CS-2022, NUST</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div
            className="w-full max-w-md"
            style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.1s" }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>C</div>
                <span className="text-white font-semibold">CoSync</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm">Sign in to your CoSync account</p>
            </div>

            {/* API error */}
            {apiError && (
              <div
                className="rounded-lg p-3 mb-4 text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
              >
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
                icon="✉"
              />
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                icon="🔒"
              />

              <div className="flex items-center justify-between mb-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-purple-600" />
                  <span className="text-xs text-gray-500">Remember me</span>
                </label>
                <button type="button" className="text-xs" style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "#4b5563" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
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