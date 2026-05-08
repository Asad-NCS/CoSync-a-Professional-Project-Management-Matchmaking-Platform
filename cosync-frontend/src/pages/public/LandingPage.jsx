import { useState, useEffect, useRef } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";

// ── Reveal on Scroll ──────────────────────────────────────────────────────────
const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ── Marquee ───────────────────────────────────────────────────────────────────
const MarqueeText = ({ text, speed = 30 }) => (
  <div className="overflow-hidden whitespace-nowrap border-y border-cyan-500/10 py-4 select-none bg-black">
    <div
      className="inline-flex gap-12 animate-marquee"
      style={{ animationDuration: `${speed}s` }}
    >
      {Array(10)
        .fill(text)
        .map((t, i) => (
          <span
            key={i}
            className="text-sm uppercase tracking-[0.3em] font-medium text-cyan-400/30"
          >
            {t} <span className="mx-4 text-cyan-500/20">◆</span>
          </span>
        ))}
    </div>
  </div>
);

// ── Feature Card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ number, title, desc }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className="group relative border border-cyan-500/10 bg-black p-8 md:p-10 transition-all duration-500 hover:border-cyan-400/40 hover:bg-cyan-500/[0.02] cursor-default overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.08), transparent 50%)`,
        }}
      />

      <div className="relative z-10">
        <span className="text-xs font-mono text-cyan-400/60 tracking-[0.25em] uppercase mb-6 block">
          ({number})
        </span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-white group-hover:text-cyan-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-white/50 text-sm md:text-base leading-relaxed">
          {desc}
        </p>
        <div className="mt-8 flex items-center gap-2 text-cyan-400/0 group-hover:text-cyan-400 transition-all duration-500">
          <div className="w-6 h-[1px] bg-current" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ── Step ──────────────────────────────────────────────────────────────────────
const Step = ({ number, title, desc, delay }) => (
  <RevealOnScroll delay={delay}>
    <div className="group flex gap-6 md:gap-12 items-start py-10 border-b border-cyan-500/10 cursor-default transition-colors hover:border-cyan-400/30">
      <span className="text-5xl md:text-7xl font-black text-cyan-500/10 group-hover:text-cyan-400/40 transition-colors duration-700 leading-none select-none shrink-0">
        {number}
      </span>
      <div className="pt-2 md:pt-3">
        <h3 className="text-xl md:text-3xl font-bold tracking-tight mb-3 text-white group-hover:text-cyan-300 group-hover:translate-x-2 transition-all duration-500">
          {title}
        </h3>
        <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-lg group-hover:text-white/60 transition-colors duration-500">
          {desc}
        </p>
      </div>
    </div>
  </RevealOnScroll>
);

// ── Stat Counter ──────────────────────────────────────────────────────────────
const StatCounter = ({ value, label }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const num = parseInt(value);
          const suffix = value.replace(/[0-9]/g, "");
          let current = 0;
          const step = Math.max(1, Math.ceil(num / 40));
          const interval = setInterval(() => {
            current += step;
            if (current >= num) {
              current = num;
              clearInterval(interval);
            }
            setDisplay(current + suffix);
          }, 30);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center group cursor-default py-8 md:py-4">
      <p className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-white group-hover:text-cyan-300 transition-colors duration-500">
        {display}
      </p>
      <p className="text-cyan-400/50 text-xs uppercase tracking-[0.25em] font-medium">
        {label}
      </p>
    </div>
  );
};

// ── Mock Kanban ───────────────────────────────────────────────────────────────
const MockKanban = () => (
  <div className="w-full max-w-5xl relative">
    <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 blur-2xl opacity-50 pointer-events-none" />

    <div className="relative border border-cyan-500/20 bg-black/60 backdrop-blur-sm overflow-hidden rounded-sm">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/10 bg-black">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/20" />
        </div>
        <span className="text-[10px] font-mono text-cyan-400/40 tracking-[0.3em] uppercase">
          cosync / workspace
        </span>
        <div className="w-16" />
      </div>

      {/* Board */}
      <div className="p-6 md:p-8 grid grid-cols-3 gap-4 md:gap-6 min-h-[320px]">
        {[
          { title: "Backlog", count: 3, opacities: [0.7, 0.5, 0.3] },
          { title: "In Progress", count: 1, active: true },
          { title: "Done", count: 2, opacities: [0.4, 0.25] },
        ].map((col, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/50">
                {col.title}
              </span>
              <span className="text-[10px] text-cyan-400/30 font-mono">
                {col.count}
              </span>
            </div>

            {col.active ? (
              <div className="border border-cyan-400/40 bg-cyan-500/[0.04] p-4 animate-[cardPulse_3s_ease-in-out_infinite]">
                <div className="h-2 w-full bg-cyan-400/20 rounded-sm mb-2" />
                <div className="h-2 w-2/3 bg-white/10 rounded-sm mb-4" />
                <div className="flex justify-between items-center">
                  <div className="px-2 py-1 border border-cyan-400/30 text-[9px] text-cyan-300 font-mono uppercase tracking-wider">
                    Active
                  </div>
                  <div className="flex -space-x-1">
                    <div className="h-4 w-4 rounded-full bg-cyan-400/40 border border-black" />
                    <div className="h-4 w-4 rounded-full bg-cyan-400/20 border border-black" />
                  </div>
                </div>
              </div>
            ) : (
              col.opacities.map((opacity, i) => (
                <div
                  key={i}
                  className="border border-cyan-500/10 p-4 transition-all duration-300 hover:border-cyan-500/30"
                  style={{ opacity }}
                >
                  <div className="h-2 w-3/4 bg-white/10 rounded-sm mb-2" />
                  <div className="h-2 w-1/2 bg-white/5 rounded-sm" />
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-2.5 w-10 bg-cyan-500/10 rounded-sm" />
                    <div className="h-4 w-4 rounded-full bg-white/5" />
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN LANDING PAGE ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        @keyframes cardPulse {
          0%, 100% {
            border-color: rgba(34,211,238,0.3);
            box-shadow: 0 0 0 rgba(34,211,238,0);
          }
          50% {
            border-color: rgba(34,211,238,0.7);
            box-shadow: 0 0 25px rgba(34,211,238,0.15);
          }
        }
        @keyframes gridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden">
        {/* ─────────────────── NAVBAR ─────────────────── */}
        <nav
          className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-500 ${
            scrolled
              ? "bg-black/80 backdrop-blur-xl border-b border-cyan-500/10"
              : "bg-transparent"
          }`}
        >
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-7 h-7 rounded-sm bg-cyan-400 flex items-center justify-center text-black font-black text-sm transition-transform group-hover:rotate-45 duration-500">
              C
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              CoSync
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-cyan-300 transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#how"
              className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-cyan-300 transition-colors duration-300"
            >
              Process
            </a>
            <a
              href="/feed"
              className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-cyan-300 transition-colors duration-300"
              onClick={(e) => {
                e.preventDefault();
                navigate("/feed");
              }}
            >
              Projects
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="hidden md:block text-xs uppercase tracking-[0.2em] text-white/50 hover:text-cyan-300 transition-colors"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button
              className="hidden md:flex group relative bg-cyan-400 text-black px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] overflow-hidden transition-transform active:scale-95"
              onClick={() => navigate("/register")}
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-cyan-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-6 h-[2px] bg-cyan-400 transition-all duration-500 ${
                  menuOpen ? "rotate-45 translate-y-[5px]" : ""
                }`}
              />
              <span
                className={`block w-6 h-[2px] bg-cyan-400 transition-all duration-500 ${
                  menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* ─────────────── MOBILE MENU OVERLAY ─────────────── */}
        <div
          className={`md:hidden fixed inset-0 z-40 bg-black flex flex-col items-center justify-center transition-all duration-500 ${
            menuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "Process", href: "#how" },
              { label: "Projects", href: "/feed" },
              { label: "Sign in", href: "/login" },
              { label: "Register", href: "/register" },
            ].map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-3xl font-black uppercase tracking-tight text-white hover:text-cyan-400 transition-all duration-500 ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${i * 80 + 200}ms` : "0ms",
                }}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (item.href.startsWith("/")) {
                    e.preventDefault();
                    navigate(item.href);
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* ─────────────────── HERO ─────────────────── */}
        <main className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-32 pb-20">
          {/* Grid bg */}
          <div
            className="absolute inset-0 opacity-[0.4] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(34,211,238,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(34,211,238,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              animation: "gridDrift 25s linear infinite",
            }}
          />

          {/* Cyan glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

          {/* Badge */}
          <RevealOnScroll className="mb-10 relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-cyan-400/30 bg-cyan-400/[0.03] text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300 hover:border-cyan-400/60 transition-all duration-500 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Beta — Live at NUST SEECS
            </div>
          </RevealOnScroll>

          {/* Headline */}
          <div className="text-center max-w-5xl relative z-10">
            <RevealOnScroll delay={150}>
              <h1 className="text-[clamp(2.5rem,9vw,7rem)] font-black leading-[0.95] tracking-tighter uppercase text-white">
                Build Teams.
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <h1 className="text-[clamp(2.5rem,9vw,7rem)] font-black leading-[0.95] tracking-tighter uppercase">
                <span className="text-cyan-400">Ship</span>{" "}
                <span className="text-white/30">Faster.</span>
              </h1>
            </RevealOnScroll>
          </div>

          {/* Subtitle */}
          <RevealOnScroll delay={500} className="mt-10 max-w-xl text-center relative z-10">
            <p className="text-white/50 text-base md:text-lg leading-relaxed">
              The professional matchmaking and management platform for student
              developers, designers, and project leads.{" "}
              <span className="text-cyan-300/80">No more siloed talent.</span>
            </p>
          </RevealOnScroll>

          {/* CTAs */}
          <RevealOnScroll delay={700} className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
            <button
              className="group relative bg-cyan-400 text-black px-8 py-4 font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-all active:scale-95 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              onClick={() => navigate("/register")}
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Building
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button
              className="group border border-cyan-400/30 text-cyan-100 px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:border-cyan-400 hover:bg-cyan-400/5 transition-all duration-300"
              onClick={() => navigate("/feed")}
            >
              Browse Projects
            </button>
          </RevealOnScroll>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-cyan-400/40">
              Scroll
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-cyan-400/50 to-transparent" />
          </div>
        </main>

        {/* ─────────────────── MARQUEE 1 ─────────────────── */}
        <MarqueeText text="Collaborate ◆ Build ◆ Ship ◆ CoSync ◆ Teams ◆ Projects" />

        {/* ─────────────────── MOCK KANBAN ─────────────────── */}
        <section className="py-24 md:py-32 px-6 md:px-12 flex justify-center bg-black">
          <RevealOnScroll>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/60 mb-4 block">
                (Workspace)
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
                Built for <span className="text-cyan-400">teams</span>
              </h2>
            </div>
            <MockKanban />
          </RevealOnScroll>
        </section>

        {/* ─────────────────── STATS ─────────────────── */}
        <section className="border-y border-cyan-500/10 py-16 px-6 md:px-12 bg-black">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-cyan-500/10">
            <StatCounter value="120+" label="Active Students" />
            <StatCounter value="40+" label="Projects Posted" />
            <StatCounter value="15+" label="Teams Formed" />
          </div>
        </section>

        {/* ─────────────────── FEATURES ─────────────────── */}
        <section id="features" className="py-24 md:py-40 px-6 md:px-12 bg-black">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/60 mb-4 block">
                    (Capabilities)
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.95]">
                    Everything
                    <br />
                    <span className="text-cyan-400">you need.</span>
                  </h2>
                </div>
                <p className="text-white/50 text-sm md:text-base max-w-sm leading-relaxed md:text-right">
                  From discovering the right talent to managing Kanban boards —
                  CoSync handles the entire lifecycle.
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-[1px] bg-cyan-500/10">
              <RevealOnScroll delay={0}>
                <FeatureCard
                  number="01"
                  title="Skill Matchmaking"
                  desc="Specify your required tech stack and roles. Our engine surfaces developers and designers that perfectly fit your needs."
                />
              </RevealOnScroll>
              <RevealOnScroll delay={150}>
                <FeatureCard
                  number="02"
                  title="Integrated Workspace"
                  desc="Drag-and-drop Kanban boards connected directly to your project. Keep your team aligned without external tools."
                />
              </RevealOnScroll>
              <RevealOnScroll delay={300}>
                <FeatureCard
                  number="03"
                  title="Team Discussions"
                  desc="Persistent project messaging. Discuss features, share updates, and collaborate in context with your team."
                />
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ─────────────────── MARQUEE 2 ─────────────────── */}
        <MarqueeText text="Strategy ◆ Design ◆ Development ◆ Deploy ◆ Iterate" speed={25} />

        {/* ─────────────────── HOW IT WORKS ─────────────────── */}
        <section id="how" className="py-24 md:py-40 px-6 md:px-12 bg-black">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/60 mb-4 block">
                (Process)
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-16 md:mb-20 text-white leading-[0.95]">
                How it
                <br />
                <span className="text-cyan-400">works.</span>
              </h2>
            </RevealOnScroll>

            <div className="border-t border-cyan-500/10">
              <Step
                number="01"
                title="Post your project"
                desc="Define your requirements, timeline, and open roles in a clean, structured format. Set the bar high."
                delay={0}
              />
              <Step
                number="02"
                title="Find your team"
                desc="Browse applicants or let our matchmaking algorithm suggest the perfect collaborators based on skills and experience."
                delay={150}
              />
              <Step
                number="03"
                title="Ship it"
                desc="Manage tasks in your private workspace. Track progress, communicate, and build your reputation on campus."
                delay={300}
              />
            </div>
          </div>
        </section>

        {/* ─────────────────── CTA ─────────────────── */}
        <section className="relative py-32 md:py-40 px-6 md:px-12 border-t border-cyan-500/10 overflow-hidden bg-black">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[18vw] font-black uppercase text-cyan-500/[0.03] tracking-tighter leading-none whitespace-nowrap">
              CoSync
            </span>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <RevealOnScroll>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 text-white leading-[0.95]">
                Ready to
                <br />
                <span className="text-cyan-400">build?</span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <p className="text-white/50 text-base md:text-lg max-w-md mx-auto mb-10">
                Join the growing community of student builders at NUST.
                Your next great project starts here.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <button
                className="group relative bg-cyan-400 text-black px-10 py-5 font-bold text-xs uppercase tracking-[0.25em] overflow-hidden transition-all active:scale-95 hover:shadow-[0_0_60px_rgba(34,211,238,0.5)]"
                onClick={() => navigate("/register")}
              >
                <span className="relative z-10 flex items-center gap-4">
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-2 transition-transform duration-500">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </RevealOnScroll>
          </div>
        </section>

        {/* ─────────────────── FOOTER ─────────────────── */}
        <footer className="border-t border-cyan-500/10 px-6 md:px-12 py-12 bg-black">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="w-5 h-5 rounded-sm bg-cyan-400 flex items-center justify-center text-black font-black text-[10px] transition-transform group-hover:rotate-45 duration-500">
                  C
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-cyan-300 transition-colors">
                  CoSync
                </span>
              </div>
              <span className="text-[10px] text-cyan-400/30 font-mono uppercase tracking-widest">
                CS-236 — NUST SEECS
              </span>
            </div>

            <div className="flex items-center gap-6 md:gap-8 text-[10px] uppercase tracking-[0.2em]">
              <a href="/feed" onClick={(e) => { e.preventDefault(); navigate("/feed"); }} className="text-white/40 hover:text-cyan-300 transition-colors duration-300">
                Projects
              </a>
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-white/40 hover:text-cyan-300 transition-colors duration-300">
                Sign in
              </a>
              <a href="/register" onClick={(e) => { e.preventDefault(); navigate("/register"); }} className="text-white/40 hover:text-cyan-300 transition-colors duration-300">
                Register
              </a>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-cyan-500/5 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
              © 2025 CoSync. All rights reserved.
            </span>
            <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
              Islamabad, Pakistan
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;