import { useState, useEffect } from "react";
import { LayoutDashboard, Plus, MessageSquare, CheckCircle, Users, Folder, Rocket, Calendar, Zap, RefreshCw } from "lucide-react";
import api from "../../lib/api";

const TYPE_FILTERS = [
  { id: "all",      label: "All"       },
  { id: "task",     label: "Tasks"     },
  { id: "member",   label: "Members"   },
  { id: "message",  label: "Messages"  },
  { id: "file",     label: "Files"     },
  { id: "system",   label: "System"    },
];

// Map backend notification type → activity type + icon + color
const mapNotification = (n) => {
  const type = n.type || "";
  if (type === "application_accepted" || type === "team_formed")
    return { actType: "member", icon: <Users size={14} />, color: "#4ade80" };
  if (type === "application_received")
    return { actType: "member", icon: <Users size={14} />, color: "#fb923c" };
  if (type === "new_message")
    return { actType: "message", icon: <MessageSquare size={14} />, color: "#61dafb" };
  if (type === "project_published")
    return { actType: "system", icon: <Rocket size={14} />, color: "#3291FF" };
  if (type === "deadline_reminder")
    return { actType: "system", icon: <Calendar size={14} />, color: "#fbbf24" };
  return { actType: "task", icon: <Zap size={14} />, color: "#a78bfa" };
};

// Map workspace task columns → activity items
const mapTaskActivity = (workspace) => {
  if (!workspace?.columns) return [];
  const items = [];
  workspace.columns.forEach(col => {
    const isDone = col.title?.toLowerCase().includes("done");
    col.tasks?.forEach(task => {
      items.push({
        id: `task-${task.id || task._id}`,
        actType: "task",
        icon: isDone ? <CheckCircle size={14} /> : <LayoutDashboard size={14} />,
        color: isDone ? "#4ade80" : "#3291FF",
        userColor: "#3291FF",
        user: task.assignee?.fullName || task.assignee?.name || "Team",
        text: isDone ? "completed" : "has task in",
        subject: task.title,
        detail: col.title,
        time: "Active",
        date: "Current",
        createdAt: new Date().toISOString(),
        read: true,
      });
    });
  });
  return items;
};

const formatTime = (d) => {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDate = (d) => {
  if (!d) return "Recent";
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ActivityTab = ({ workspace }) => {
  const [filter, setFilter]           = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => { fetchActivity(); }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/notifications");
      const data = res.data?.data || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Activity fetch error:", err);
      setError("Could not load activity");
    } finally {
      setLoading(false);
    }
  };

  // Combine notifications + task activity
  const taskItems = mapTaskActivity(workspace);

  const allItems = [
    ...notifications.map(n => {
      const { actType, icon, color } = mapNotification(n);
      return {
        id: n._id,
        actType,
        icon,
        color,
        userColor: "#3291FF",
        user: n.sender?.fullName || n.sender?.name || "System",
        text: n.title || n.message || "",
        subject: n.projectTitle || "",
        detail: n.description || "",
        time: formatTime(n.createdAt),
        date: formatDate(n.createdAt),
        createdAt: n.createdAt,
        read: n.read,
      };
    }),
    ...taskItems,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = allItems.filter(a => filter === "all" || a.actType === filter);

  const grouped = {};
  filtered.forEach(a => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

  const stats = [
    { label: "Tasks done",    value: taskItems.filter(t => t.text === "completed").length, color: "#4ade80", icon: <CheckCircle size={14} /> },
    { label: "Notifications", value: notifications.length,                                  color: "#3291FF", icon: <Plus size={14} /> },
    { label: "Unread",        value: notifications.filter(n => !n.read).length,             color: "#fb923c", icon: <MessageSquare size={14} /> },
    { label: "Days active",   value: workspace ? Math.ceil((Date.now() - new Date(workspace.createdAt || Date.now())) / 86400000) || 1 : 0, color: "#fb923c", icon: <Calendar size={14} /> },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .activity-scroll::-webkit-scrollbar { width:3px; }
        .activity-scroll::-webkit-scrollbar-thumb { background:rgba(0,112,243,0.2); border-radius:2px; }
        .filter-btn { padding:5px 12px; border-radius:8px; font-size:0.75rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; font-family:inherit; white-space:nowrap; }
      `}</style>

      <div className="flex-1 flex overflow-hidden">

        {/* Main feed */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
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
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.15)", color: "#3291FF", cursor: "pointer" }}>
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button key={f.id} className="filter-btn" onClick={() => setFilter(f.id)}
                  style={{
                    background: filter === f.id ? "rgba(0,100,220,0.18)" : "rgba(12,12,15,0.85)",
                    border: `1px solid ${filter === f.id ? "rgba(0,112,243,0.5)" : "rgba(0,112,243,0.12)"}`,
                    color: filter === f.id ? "#3291FF" : "#4b5563",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 activity-scroll">

            {loading && (
              <div className="text-center py-16">
                <div className="w-6 h-6 rounded-full mx-auto mb-2"
                  style={{ border: "2px solid rgba(0,112,243,0.2)", borderTopColor: "#3291FF", animation: "spin 1s linear infinite" }} />
                <p className="text-xs" style={{ color: "#4b5563" }}>Loading activity...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">Could not load activity</p>
                <button onClick={fetchActivity}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "linear-gradient(135deg,#0064dc,#0050b4)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && Object.keys(grouped).length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-primary"
                  style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.12)" }}>
                  <Zap size={20} />
                </div>
                <p className="text-white text-sm font-medium mb-1">No activity yet</p>
                <p className="text-xs" style={{ color: "#374151" }}>Start working and activity will show here</p>
              </div>
            )}

            {!loading && !error && Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(0,112,243,0.1)" }} />
                  <span className="text-xs px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "rgba(0,112,243,0.06)", color: "#374151", border: "1px solid rgba(0,112,243,0.1)" }}>
                    {date}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(0,112,243,0.1)" }} />
                </div>

                <div className="space-y-0 relative">
                  <div className="absolute left-4 top-5 bottom-5 w-px"
                    style={{ background: "rgba(0,112,243,0.08)" }} />

                  {items.map((a, i) => (
                    <div key={a.id} className="flex gap-4 pb-4 relative"
                      style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.05}s` }}>

                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm z-10"
                        style={{ background: `${a.color}15`, border: `1px solid ${a.color}25`, color: a.color }}>
                        {a.icon}
                      </div>

                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                            {a.subject ? (
                              <>
                                <span className="font-semibold" style={{ color: a.userColor }}>
                                  {a.user.split(" ")[0]}
                                </span>
                                {" "}<span style={{ color: "#6b7280" }}>{a.text}</span>
                                {" "}<span className="font-medium text-white">{a.subject}</span>
                              </>
                            ) : (
                              <span>{a.text}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {a.read === false && (
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3291FF" }} />
                            )}
                            <span className="text-xs" style={{ color: "#374151" }}>{a.time}</span>
                          </div>
                        </div>
                        {a.detail && (
                          <p className="text-xs mt-1 px-2 py-1 rounded-lg inline-block"
                            style={{ background: "rgba(0,112,243,0.06)", color: "#4b5563", border: "1px solid rgba(0,112,243,0.08)" }}>
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

        {/* Right sidebar */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 p-5"
          style={{ borderLeft: "1px solid rgba(0,112,243,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>
            Workspace stats
          </p>
          <div className="space-y-3 mb-6">
            {stats.map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(0,112,243,0.04)", border: "1px solid rgba(0,112,243,0.08)" }}>
                <div className="flex items-center gap-2" style={{ color: s.color }}>
                  {s.icon}
                  <p className="text-xs" style={{ color: "#4b5563" }}>{s.label}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Team members from workspace */}
          {(workspace?.project?.members || workspace?.members)?.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#374151" }}>
                Top contributors
              </p>
              <div className="space-y-2">
                {(workspace?.project?.members || workspace?.members || []).slice(0, 3).map((m, i) => (
                  <div key={m._id || m.id || i} className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#374151" }}>#{i + 1}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(50,145,255,0.2)", color: "#3291FF" }}>
                      {(m.fullName || m.name || "U")[0].toUpperCase()}
                    </div>
                    <p className="text-xs flex-1 truncate" style={{ color: "#6b7280" }}>
                      {(m.fullName || m.name || "Member").split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={fetchActivity}
            className="mt-4 w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{ background: "rgba(0,112,243,0.06)", border: "1px solid rgba(0,112,243,0.12)", color: "#4b5563", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#3291FF"; e.currentTarget.style.borderColor = "rgba(0,112,243,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "rgba(0,112,243,0.12)"; }}>
            <RefreshCw size={11} /> Refresh feed
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivityTab;