import { useState, useEffect } from "react";
import api from "../../lib/api";

const TYPE_FILTERS = [
  { id: "all",      label: "All"       },
  { id: "task",     label: "Tasks"     },
  { id: "member",   label: "Members"   },
  { id: "message",  label: "Messages"  },
  { id: "system",   label: "System"    },
];

const getActivityType = (type) => {
  if (["application_received", "application_accepted", "application_rejected", "team_formed"].includes(type)) return "member";
  if (type === "new_message") return "message";
  if (["project_published", "deadline_reminder"].includes(type)) return "system";
  return "task";
};

const getIcon = (type) => {
  const map = {
    application_received: "👤", application_accepted: "🎉",
    application_rejected: "❌", new_message: "💬",
    project_published: "🚀",   team_formed: "👥",
    deadline_reminder: "📅",
  };
  return map[type] || "⚡";
};

const getColor = (type) => {
  const map = {
    application_received: "#61dafb", application_accepted: "#4ade80",
    application_rejected: "#f87171", new_message: "#a78bfa",
    project_published: "#fb923c",   team_formed: "#34d399",
    deadline_reminder: "#fbbf24",
  };
  return map[type] || "#a78bfa";
};

const formatTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDate = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ActivityTab = ({ workspace }) => {
  const [filter, setFilter]   = useState("all");
  const [activity, setActivity] = useState([]);
  const [stats, setStats]     = useState({ tasks: 0, notifications: 0, unread: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // workspace._id is the workspace doc id; project id lives at workspace.project._id
  const projectId = workspace?.project?._id || workspace?.project;

  useEffect(() => { fetchActivity(); }, [projectId]);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      let items = [];
      let memberCount = workspace?.members?.length || 0;

      if (projectId) {
        // Use dedicated activity endpoint (returns deduped notifications + task data)
        const res = await api.get(`/workspaces/${projectId}/activity`);
        const { notifications = [], tasks = [], memberCount: mc = 0 } = res.data.data;
        memberCount = mc;

        // Map notifications into unified activity items
        const notifItems = notifications.map(n => ({
          id: n._id,
          type: getActivityType(n.type),
          icon: getIcon(n.type),
          color: getColor(n.type),
          user: n.relatedUser?.fullName || "System",
          userColor: "#a78bfa",
          text: n.description || n.title,
          subject: n.relatedProject?.title || "",
          detail: "",
          time: formatTime(n.createdAt),
          date: formatDate(n.createdAt),
          createdAt: n.createdAt,
          read: n.read,
        }));

        // Map task items
        const taskItems = tasks.map(t => ({
          id: t._id,
          type: "task",
          icon: t.isDone ? "✓" : "✦",
          color: t.isDone ? "#4ade80" : "#a78bfa",
          user: t.assignee?.fullName || "Team",
          userColor: "#a78bfa",
          text: "",
          subject: t.taskTitle,
          detail: `In ${t.columnTitle}${t.priority ? " · " + t.priority : ""}`,
          time: "Active",
          date: "Current",
          createdAt: t.createdAt || new Date().toISOString(),
        }));

        items = [...notifItems, ...taskItems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setStats({
          tasks: tasks.length,
          notifications: notifications.length,
          unread: notifications.filter(n => !n.read).length,
          members: memberCount,
        });
      } else {
        // Fallback: just use the notifications endpoint
        const res = await api.get("/notifications");
        const data = res.data?.data || [];
        items = data.map(n => ({
          id: n._id,
          type: getActivityType(n.type),
          icon: getIcon(n.type),
          color: getColor(n.type),
          user: n.relatedUser?.fullName || "System",
          userColor: "#a78bfa",
          text: n.description || n.title,
          subject: "",
          detail: "",
          time: formatTime(n.createdAt),
          date: formatDate(n.createdAt),
          createdAt: n.createdAt,
          read: n.read,
        }));
        setStats({ tasks: 0, notifications: data.length, unread: data.filter(n => !n.read).length, members: memberCount });
      }

      setActivity(items);
    } catch (err) {
      console.error("Activity fetch error:", err);
      setError("Could not load activity");
    } finally {
      setLoading(false);
    }
  };

  const filtered = activity.filter(a => filter === "all" || a.type === filter);

  const grouped = {};
  filtered.forEach(a => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

  const statCards = [
    { label: "Tasks",         value: stats.tasks,         color: "#4ade80", icon: "✦" },
    { label: "Notifications", value: stats.notifications, color: "#a78bfa", icon: "🔔" },
    { label: "Unread",        value: stats.unread,        color: "#fb923c", icon: "⚡" },
    { label: "Team members",  value: stats.members,       color: "#61dafb", icon: "👥" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .activity-scroll::-webkit-scrollbar { width:3px; }
        .activity-scroll::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.2); border-radius:2px; }
        .filter-btn { padding:5px 12px; border-radius:8px; font-size:0.75rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; font-family:inherit; white-space:nowrap; }
      `}</style>

      <div className="flex-1 flex overflow-hidden">

        {/* ── Main feed ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Activity Feed</h2>
                <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>Everything happening in this workspace</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                  ● Live
                </span>
                <button onClick={fetchActivity}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#a78bfa", cursor: "pointer" }}>
                  ↻ Refresh
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button key={f.id} className="filter-btn" onClick={() => setFilter(f.id)}
                  style={{
                    background: filter === f.id ? "rgba(124,58,237,0.18)" : "rgba(12,8,32,0.85)",
                    border: `1px solid ${filter === f.id ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.12)"}`,
                    color: filter === f.id ? "#a78bfa" : "#4b5563",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-4 activity-scroll">

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full mx-auto mb-3"
                    style={{ border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#7c3aed", animation: "spin 1s linear infinite" }} />
                  <p className="text-sm" style={{ color: "#4b5563" }}>Loading activity...</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">Could not load activity</p>
                <button onClick={fetchActivity}
                  className="px-4 py-2 rounded-xl text-xs font-semibold mt-2"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && Object.keys(grouped).length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">No activity yet</p>
                <p className="text-xs" style={{ color: "#374151" }}>Start working and activity will appear here</p>
              </div>
            )}

            {!loading && !error && Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.1)" }} />
                  <span className="text-xs px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "rgba(139,92,246,0.06)", color: "#374151", border: "1px solid rgba(139,92,246,0.1)" }}>
                    {date}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.1)" }} />
                </div>

                <div className="space-y-0 relative">
                  <div className="absolute left-4 top-5 bottom-5 w-px"
                    style={{ background: "rgba(139,92,246,0.08)" }} />

                  {items.map((a, i) => (
                    <div key={a.id} className="flex gap-4 pb-4 relative"
                      style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${i * 0.05}s` }}>

                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm z-10"
                        style={{ background: `${a.color}15`, border: `1px solid ${a.color}25`, color: a.color }}>
                        {a.icon}
                      </div>

                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                            {a.subject ? (
                              <>
                                <span className="font-semibold" style={{ color: a.userColor }}>{a.user}</span>
                                {" "}<span className="font-medium text-white">{a.subject}</span>
                              </>
                            ) : (
                              <span>{a.text}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {a.read === false && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#7c3aed" }} />
                            )}
                            <span className="text-xs" style={{ color: "#374151" }}>{a.time}</span>
                          </div>
                        </div>
                        {a.detail && (
                          <p className="text-xs mt-1 px-2 py-1 rounded-lg inline-block"
                            style={{ background: "rgba(139,92,246,0.06)", color: "#4b5563", border: "1px solid rgba(139,92,246,0.08)" }}>
                            {a.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 p-5"
          style={{ borderLeft: "1px solid rgba(139,92,246,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>
            Workspace stats
          </p>
          <div className="space-y-3 mb-6">
            {statCards.map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <p className="text-xs" style={{ color: "#4b5563" }}>{s.label}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {workspace?.members?.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#374151" }}>Team</p>
              <div className="space-y-2 mb-4">
                {workspace.members.slice(0, 5).map((m, i) => (
                  <div key={m._id || i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                      {(m.fullName || m.name || "U")[0].toUpperCase()}
                    </div>
                    <p className="text-xs truncate" style={{ color: "#6b7280" }}>
                      {m.fullName || m.name || "Member"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={fetchActivity}
            className="mt-auto w-full py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#4b5563", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)"; }}>
            ↻ Refresh feed
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivityTab;
