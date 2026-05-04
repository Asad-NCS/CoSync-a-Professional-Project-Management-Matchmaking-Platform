import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";

// ── Feature card with mouse-following glow ───────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className="group relative rounded-xl border border-border bg-surface p-6 transition-colors hover:border-secondary/50 overflow-hidden opacity-0 animate-fade-up"
      style={{ animationDelay: delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      <div className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-4 bg-border text-primary shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {icon}
      </div>
      <h3 className="relative z-10 text-primary font-medium mb-2 text-sm">{title}</h3>
      <p className="relative z-10 text-secondary text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

// ── Animated Grid Background ──────────────────────────────────────────────────
const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white,transparent)]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        animation: 'gridMove 20s linear infinite'
      }}
    />
  </div>
);

// ── Animated Mock Kanban Board ────────────────────────────────────────────────
const MockKanban = () => {
  return (
    <div className="mt-20 w-full max-w-4xl relative animate-fade-up perspective-1000" style={{ animationDelay: '0.4s' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-20 pointer-events-none rounded-2xl"></div>

      {/* Main Panel */}
      <div className="glass-panel p-2 flex flex-col overflow-hidden relative shadow-2xl shadow-black border-border/60 transform-gpu transition-transform duration-700 hover:rotate-x-2 hover:-translate-y-2">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/50">
          <div className="w-3 h-3 rounded-full bg-border"></div>
          <div className="w-3 h-3 rounded-full bg-border"></div>
          <div className="w-3 h-3 rounded-full bg-border"></div>
        </div>

        <div className="p-8 grid grid-cols-3 gap-6 opacity-80 h-[320px]">
          {/* Column 1 */}
          <div className="col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-24 bg-border/80 rounded"></div>
              <div className="h-4 w-6 rounded-full bg-border/50"></div>
            </div>
            {/* Task Card 1 */}
            <div className="h-24 bg-surface rounded-lg border border-border/80 p-3 flex flex-col justify-between shadow-sm">
              <div className="h-3 w-3/4 bg-border rounded"></div>
              <div className="flex justify-between items-center mt-auto">
                <div className="h-4 w-12 bg-accent/20 rounded"></div>
                <div className="h-5 w-5 rounded-full bg-border"></div>
              </div>
            </div>
            {/* Task Card 2 */}
            <div className="h-20 bg-surface rounded-lg border border-border/80 p-3 shadow-sm">
              <div className="h-3 w-1/2 bg-border rounded"></div>
            </div>
          </div>

          {/* Column 2 - Animated */}
          <div className="col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-28 bg-border/80 rounded"></div>
              <div className="h-4 w-6 rounded-full bg-border/50"></div>
            </div>
            {/* Animated dropping card */}
            <div className="h-28 bg-surface rounded-lg border border-accent/40 p-3 shadow-[0_0_15px_rgba(0,112,243,0.15)] flex flex-col justify-between relative animate-[floatDown_4s_ease-in-out_infinite]">
              <div>
                <div className="h-3 w-full bg-primary/20 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-border rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-accent/30 rounded"></div>
                <div className="flex -space-x-1">
                  <div className="h-5 w-5 rounded-full bg-border"></div>
                  <div className="h-5 w-5 rounded-full bg-secondary"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-16 bg-border/80 rounded"></div>
              <div className="h-4 w-6 rounded-full bg-border/50"></div>
            </div>
            {/* Task Card 3 */}
            <div className="h-32 bg-surface rounded-lg border border-border/80 p-3 flex flex-col justify-between shadow-sm opacity-60">
              <div>
                <div className="h-3 w-full bg-border rounded mb-2"></div>
                <div className="h-3 w-5/6 bg-border rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-border rounded"></div>
              </div>
              <div className="flex justify-end mt-auto">
                <div className="h-5 w-5 rounded-full bg-border"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Stat ──────────────────────────────────────────────────────────────────────
const Stat = ({ value, label }) => (
  <div className="text-center group">
    <p className="text-3xl font-medium mb-1 text-primary group-hover:text-accent transition-colors duration-500">{value}</p>
    <p className="text-secondary text-sm">{label}</p>
  </div>
);

// ── Main Landing Page ─────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(-40px); }
          100% { transform: translateY(0); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0px); box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
          50% { transform: translateY(-12px); box-shadow: 0 20px 25px rgba(0,112,243,0.15); border-color: rgba(0,112,243,0.6); }
        }
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-2 { transform: rotateX(2deg); }
      `}</style>

      <div className="min-h-screen text-primary selection:bg-primary selection:text-background flex flex-col font-sans relative overflow-hidden">
        <GridBackground />

        {/* ── Navbar ── */}
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/60 backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Logo className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="font-medium tracking-tight">CoSync</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="/feed" className="text-secondary hover:text-primary transition-colors">Projects</a>
            <a href="#features" className="text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#how" className="text-secondary hover:text-primary transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <button className="text-secondary hover:text-primary transition-colors" onClick={() => navigate("/login")}>
              Sign in
            </button>
            <button
              className="relative overflow-hidden group bg-primary text-background px-4 py-1.5 rounded-md hover:bg-white/90 transition-transform active:scale-95"
              onClick={() => navigate("/register")}
            >
              <span className="relative z-10">Get started</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <main className="relative z-10 flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-surface/50 backdrop-blur text-secondary mb-8 animate-fade-in hover:border-secondary/50 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(0,112,243,0.8)] animate-pulse-slow"></span>
            CoSync Beta is now live at NUST SEECS
          </div>

          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Build teams.<br />
            <span className="text-secondary inline-block hover:text-primary transition-colors duration-500 cursor-default">Ship projects faster.</span>
          </h1>

          <p className="text-secondary text-lg md:text-xl max-w-2xl mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            The professional matchmaking and management platform for student developers, designers, and project leads. No more siloed talent.
          </p>

          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button
              className="bg-primary text-background px-6 py-3 rounded-lg font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              onClick={() => navigate("/register")}
            >
              Start building
            </button>
            <button
              className="bg-surface/50 backdrop-blur border border-border text-primary px-6 py-3 rounded-lg font-medium hover:bg-surfaceHover active:scale-95 transition-all"
              onClick={() => navigate("/feed")}
            >
              Browse projects
            </button>
          </div>

          <MockKanban />
        </main>

        {/* ── Stats ── */}
        <section className="relative z-10 border-y border-border bg-surface/80 backdrop-blur-sm py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            <Stat value="120+" label="Active Students" />
            <Stat value="40+" label="Projects Posted" />
            <Stat value="15+" label="Teams Formed" />
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="relative z-10 py-32 px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">Everything you need</h2>
            <p className="text-secondary max-w-xl mx-auto">From discovering the right talent to managing your Kanban boards, CoSync handles the entire project lifecycle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>}
              title="Skill Matchmaking"
              desc="Specify your required tech stack and roles. Our engine surfaces developers and designers that perfectly fit your needs."
              delay="0s"
            />
            <FeatureCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>}
              title="Integrated Workspace"
              desc="Drag-and-drop Kanban boards connected directly to your project. Keep your team aligned without external tools."
              delay="0.1s"
            />
            <FeatureCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>}
              title="Team Discussions"
              desc="Persistent project messaging. Discuss features, share updates, and collaborate in context."
              delay="0.2s"
            />
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="relative z-10 py-24 px-6 max-w-4xl mx-auto w-full border-t border-border">
          <div className="mb-16">
            <h2 className="text-3xl font-medium tracking-tight mb-4">How it works</h2>
          </div>

          <div className="space-y-12">
            {[
              { step: "01", title: "Post your project", desc: "Define your requirements, timeline, and open roles in a clean, structured format." },
              { step: "02", title: "Find matches", desc: "Browse applicants or let our matchmaking algorithm suggest the perfect collaborators." },
              { step: "03", title: "Ship it", desc: "Manage tasks in your private workspace and build your reputation on campus." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start group">
                <div className="text-sm font-medium text-secondary pt-1 transition-colors group-hover:text-primary">{step}</div>
                <div>
                  <h3 className="text-xl font-medium mb-2 transition-colors group-hover:text-accent">{title}</h3>
                  <p className="text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative z-10 py-32 px-6 border-t border-border bg-surface text-center">
          <h2 className="text-3xl font-medium tracking-tight mb-6">Ready to build?</h2>
          <div className="flex items-center justify-center gap-4">
            <button
              className="relative overflow-hidden group bg-primary text-background px-6 py-3 rounded-lg font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              onClick={() => navigate("/register")}
            >
              <span className="relative z-10">Create account</span>
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 py-8 px-6 border-t border-border bg-background text-center flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-4 h-4 bg-secondary rounded-sm flex items-center justify-center text-background font-bold text-[8px] transition-colors group-hover:bg-primary">
              C
            </div>
            <span className="transition-colors group-hover:text-primary">CoSync — CS-236 Web Technologies</span>
          </div>
          <div className="flex gap-6">
            <a href="/feed" className="hover:text-primary transition-colors">Projects</a>
            <a href="/login" className="hover:text-primary transition-colors">Sign in</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;