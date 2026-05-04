import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

const TopNav = ({ title, children, showBackToDashboard = false }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
      style={{ background: "rgba(5,3,15,0.92)", borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", animation: "slideDown 0.4s ease both" }}>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Logo className="w-7 h-7" />
          <span className="font-semibold text-white">CoSync</span>
        </button>
        {title && (
          <>
            <span style={{ color: "#374151" }}>›</span>
            <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>{title}</span>
          </>
        )}
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        {showBackToDashboard && (
          <button onClick={() => navigate("/dashboard")}
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ background: "none", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
            ← Dashboard
          </button>
        )}
        {children}
      </div>
    </nav>
  );
};

export default TopNav;
