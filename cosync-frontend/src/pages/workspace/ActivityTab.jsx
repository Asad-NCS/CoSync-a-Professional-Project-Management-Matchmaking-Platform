import { useState } from "react";

const ACTIVITY_FEED = [
  { id: 1,  type: "task_moved",   icon: "⊞", color: "#a78bfa", user: "Sara Qureshi",   userColor: "#a78bfa", text: "moved", subject: "Implement minimax algorithm", detail: "To Do → In Progress", time: "2 hours ago",  date: "Today" },
  { id: 2,  type: "task_created", icon: "✦", color: "#4ade80", user: "Azaan Murtaza",  userColor: "#7c3aed", text: "created", subject: "Fix castling bug", detail: "Added to In Progress · Urgent", time: "3 hours ago",  date: "Today" },
  { id: 3,  type: "comment",      icon: "💬", color: "#61dafb", user: "Ali Hassan",     userColor: "#61dafb", text: "commented on", subject: "FastAPI backend setup", detail: '"Move validation endpoint is live!"', time: "5 hours ago",  date: "Today" },
  { id: 4,  type: "task_done",    icon: "✓", color: "#4ade80", user: "Azaan Murtaza",  userColor: "#7c3aed", text: "completed", subject: "Set up React project structure", detail: "Moved to Done", time: "1 day ago",   date: "Yesterday" },
  { id: 5,  type: "task_done",    icon: "✓", color: "#4ade80", user: "Sara Qureshi",   userColor: "#a78bfa", text: "completed", subject: "Design Chess board UI", detail: "Moved to Done", time: "1 day ago",   date: "Yesterday" },
  { id: 6,  type: "member",       icon: "👥", color: "#fb923c", user: "Ali Hassan",     userColor: "#61dafb", text: "joined", subject: "the workspace", detail: "Accepted as React Developer", time: "2 days ago",  date: "Apr 23" },
  { id: 7,  type: "task_created", icon: "✦", color: "#4ade80", user: "Sara Qureshi",   userColor: "#a78bfa", text: "created", subject: "Training data pipeline", detail: "Added to To Do · High priority", time: "2 days ago",  date: "Apr 23" },
  { id: 8,  type: "file",         icon: "📁", color: "#fbbf24", user: "Ali Hassan",     userColor: "#61dafb", text: "added", subject: "API Documentation.pdf", detail: "Uploaded to Resources", time: "3 days ago",  date: "Apr 22" },
  { id: 9,  type: "comment",      icon: "💬", color: "#61dafb", user: "Azaan Murtaza",  userColor: "#7c3aed", text: "replied in", subject: "Design Chess board UI", detail: '"Dark squares need a different shade"', time: "4 days ago",  date: "Apr 21" },
  { id: 10, type: "project",      icon: "🚀", color: "#7c3aed", user: "Azaan Murtaza",  userColor: "#7c3aed", text: "created", subject: "AI Chess Bot workspace", detail: "Project is now active", time: "5 days ago",  date: "Apr 20" },
];

const TYPE_FILTERS = [
  { id: "all",          label: "All" },
  { id: "task_moved",   label: "Moves"    },
  { id: "task_created", label: "Created"  },
  { id: "task_done",    label: "Completed"},
  { id: "comment",      label: "Comments" },
  { id: "member",       label: "Members"  },
  { id: "file",         label: "Files"    },
];

const STATS = [
  { label: "Tasks completed", value: "4",  color: "#4ade80", icon: "✓" },
  { label: "Tasks created",   value: "6",  color: "#a78bfa", icon: "✦" },
  { label: "Comments",        value: "12", color: "#61dafb", icon: "💬" },
  { label: "Days active",     value: "5",  color: "#fb923c", icon: "📅" },
];

const ActivityTab = ({ workspace }) => {
  const [filter, setFilter] = useState("all");

  const grouped = {};
  ACTIVITY_FEED
    .filter(a => filter === "all" || a.type === filter)
    .forEach(a => {
      if (!grouped[a.date]) grouped[a.date] = [];
      grouped[a.date].push(a);
    });

  return (
    <>
      <style>{`
        .activity-scroll::-webkit-scrollbar { width:3px; }
        .activity-scroll::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.2); border-radius:2px; }
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
              <span className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                ● Live
              </span>
            </div>

            {/* Filters */}
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
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-6">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.1)" }} />
                  <span className="text-xs px-3 py-1 rounded-full"
                    style={{ background: "rgba(139,92,246,0.06)", color: "#374151", border: "1px solid rgba(139,92,246,0.1)", whiteSpace: "nowrap" }}>
                    {date}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.1)" }} />
                </div>

                {/* Items */}
                <div className="space-y-0 relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-5 bottom-5 w-px"
                    style={{ background: "rgba(139,92,246,0.08)" }} />

                  {items.map((a, i) => (
                    <div key={a.id}
                      className="flex gap-4 pb-4 relative"
                      style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.05}s` }}>

                      {/* Icon dot */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm z-10"
                        style={{ background: `${a.color}15`, border: `1px solid ${a.color}25`, color: a.color }}>
                        {a.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                            <span className="font-semibold" style={{ color: a.userColor }}>{a.user.split(" ")[0]}</span>
                            {" "}<span style={{ color: "#6b7280" }}>{a.text}</span>
                            {" "}<span className="font-medium text-white">{a.subject}</span>
                          </p>
                          <span className="text-xs flex-shrink-0" style={{ color: "#374151" }}>{a.time}</span>
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

            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">No activity yet</p>
                <p className="text-xs" style={{ color: "#374151" }}>Start working and activity will show here</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar — stats ── */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 p-5"
          style={{ borderLeft: "1px solid rgba(139,92,246,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>
            This week
          </p>
          <div className="space-y-3 mb-6">
            {STATS.map(s => (
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

          {/* Top contributors */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#374151" }}>Top contributors</p>
          <div className="space-y-2">
            {[
              { name: "Sara Qureshi",  color: "#a78bfa", count: 5 },
              { name: "Azaan Murtaza", color: "#7c3aed", count: 3 },
              { name: "Ali Hassan",    color: "#61dafb", count: 2 },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#374151" }}>#{i + 1}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: m.color + "25", color: m.color }}>
                  {m.name[0]}
                </div>
                <p className="text-xs flex-1 truncate" style={{ color: "#6b7280" }}>{m.name.split(" ")[0]}</p>
                <span className="text-xs font-bold" style={{ color: m.color }}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityTab;