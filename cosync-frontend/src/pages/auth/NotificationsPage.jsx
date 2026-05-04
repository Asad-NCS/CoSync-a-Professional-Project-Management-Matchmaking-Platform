import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const TYPE_FILTERS = ["All", "Applications", "Accepted", "Messages", "System"];
const TYPE_MAP = { 
  application_received: "Applications", 
  application_accepted: "Accepted", 
  application_rejected: "Accepted",
  new_message: "Messages", 
  project_published: "System", 
  team_formed: "System", 
  deadline_reminder: "System" 
};

const ICON_MAP = {
  application_received: "👤",
  application_accepted: "🎉",
  application_rejected: "❌",
  new_message: "💬",
  project_published: "🚀",
  team_formed: "👥",
  deadline_reminder: "📅"
};

const COLOR_MAP = {
  application_received: "#61dafb",
  application_accepted: "#4ade80",
  application_rejected: "#f87171",
  new_message: "#a78bfa",
  project_published: "#fb923c",
  team_formed: "#34d399",
  deadline_reminder: "#fbbf24"
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotes(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setLoading(false);
    }
  };

  const unread = notes.filter(n => !n.read).length;
  const filtered = notes.filter(n => filter === "All" || TYPE_MAP[n.type] === filter);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotes(notes.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotes(notes.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff" }}>

        {/* Navbar */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
          style={{ background: "rgba(5,3,15,0.92)", borderBottom: "1px solid rgba(139,92,246,0.08)", backdropFilter: "blur(20px)", animation: "slideDown 0.4s ease both" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Logo className="w-7 h-7" />
              <span className="font-semibold text-white">CoSync</span>
            </button>
            <span style={{ color: "#374151" }}>›</span>
            <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>Notifications</span>
            {unread > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "#7c3aed", color: "#fff" }}>{unread}</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "none", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
              ← Dashboard
            </button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-8" style={{ animation: "fadeUp 0.5s ease both" }}>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: "-0.025em" }}>Notifications</h1>
              <p style={{ color: "#4b5563" }}>
                {unread > 0 ? <><span style={{ color: "#a78bfa", fontWeight: 600 }}>{unread} unread</span> notifications</> : "You're all caught up!"}
              </p>
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="text-sm px-4 py-2 rounded-xl transition-all duration-200"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.08)"}>
                Mark all read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-6" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.1s" }}>
            {TYPE_FILTERS.map(f => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? "rgba(124,58,237,0.18)" : "rgba(12,8,32,0.85)",
                  border: `1px solid ${filter === f ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.12)"}`,
                  color: filter === f ? "#a78bfa" : "#4b5563",
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="space-y-2" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0.15s" }}>
            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-400">Loading notifications...</p>
              </div>
            ) : filtered.map((n, i) => (
              <div
                key={n._id}
                className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 group"
                style={{
                  background: n.read ? "rgba(12,8,32,0.6)" : "rgba(20,12,50,0.9)",
                  border: `1px solid ${n.read ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.2)"}`,
                  animation: `fadeUp 0.4s ease both`,
                  animationDelay: `${i * 0.05}s`,
                  cursor: "pointer",
                }}
                onClick={() => markRead(n._id)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: `${COLOR_MAP[n.type] || "#a78bfa"}15`, border: `1px solid ${COLOR_MAP[n.type] || "#a78bfa"}25` }}>
                  {ICON_MAP[n.type] || "🔔"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: n.read ? "#9ca3af" : "#fff" }}>{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7c3aed" }} />}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNote(n._id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#374151" }}>
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: n.read ? "#374151" : "#6b7280" }}>{n.description}</p>
                  <p className="text-xs mt-1.5" style={{ color: "#374151" }}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <span style={{ fontSize: 24 }}>🔔</span>
                </div>
                <p className="text-white font-semibold mb-2">No notifications</p>
                <p className="text-sm" style={{ color: "#374151" }}>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;