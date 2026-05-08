import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { SKILL_COLORS } from "../../lib/utils";

const PRIORITY_CONFIG = {
  urgent: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", label: "Urgent" },
  high:   { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)",  label: "High"   },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  label: "Medium" },
  low:    { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)",  label: "Low"    },
};

const TYPE_CONFIG = {
  feature: { color: "#3291FF", bg: "rgba(50,145,255,0.1)", label: "Feature" },
  bug:     { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Bug"     },
  task:    { color: "#61dafb", bg: "rgba(97,218,251,0.1)",  label: "Task"    },
  design:  { color: "#f472b6", bg: "rgba(244,114,182,0.1)", label: "Design"  },
  docs:    { color: "#34d399", bg: "rgba(52,211,153,0.1)",  label: "Docs"    },
};


const TaskCard = ({ task, onEdit, onDelete, overlay = false }) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id });

  const [hovered, setHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const type     = TYPE_CONFIG[task.type]         || TYPE_CONFIG.task;

  const completedChecks = task.checklist?.filter(c => c.done).length || 0;
  const totalChecks     = task.checklist?.length || 0;
  const checkPct        = totalChecks ? Math.round((completedChecks / totalChecks) * 100) : 0;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowActions(false); }}
    >
      <div
        className="rounded-2xl transition-all duration-200"
        style={{
          background: overlay ? "rgba(32,32,36,0.98)" : hovered ? "rgba(22,14,48,0.98)" : "rgba(18,18,22,0.9)",
          border: `1px solid ${isDragging ? "rgba(0,112,243,0.6)" : hovered ? "rgba(0,112,243,0.35)" : "rgba(0,112,243,0.12)"}`,
          boxShadow: overlay ? "0 25px 50px rgba(0,0,0,0.5)" : hovered ? "0 8px 25px rgba(0,80,180,0.2)" : "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* Priority strip */}
        <div className="h-0.5 rounded-t-2xl" style={{ background: priority.color }} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap flex-1 mr-2">
              {/* Type badge */}
              <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: type.bg, color: type.color }}>
                {type.label}
              </span>
              {/* Priority badge */}
              <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: priority.bg, border: `1px solid ${priority.border}`, color: priority.color }}>
                {priority.label}
              </span>
            </div>

            {/* Action menu */}
            <div className="relative flex-shrink-0">
              <button
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: showActions ? "rgba(0,112,243,0.2)" : "transparent",
                  border: "none", cursor: "pointer", color: "#4b5563",
                  opacity: hovered ? 1 : 0,
                }}
                onClick={e => { e.stopPropagation(); setShowActions(p => !p); }}
                {...attributes}
              >
                ···
              </button>
              {showActions && (
                <div className="absolute right-0 top-7 rounded-xl overflow-hidden z-50 w-36"
                  style={{ background: "#0a0520", border: "1px solid rgba(0,112,243,0.25)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
                  <button className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,112,243,0.1)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; }}
                    onClick={e => { e.stopPropagation(); setShowActions(false); onEdit(task); }}>
                    ✏ Edit task
                  </button>
                  <button className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "block" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                    onClick={e => { e.stopPropagation(); setShowActions(false); onDelete(task.id); }}>
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title — drag handle */}
          <div {...listeners} {...attributes} style={{ cursor: isDragging ? "grabbing" : "grab" }}>
            <h4 className="text-white font-semibold text-sm leading-snug mb-1"
              style={{ textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.6 : 1 }}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#4b5563" }}>
                {task.description.length > 80 ? task.description.slice(0, 80) + "..." : task.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map((tag, i) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${SKILL_COLORS[i % SKILL_COLORS.length]}12`, color: SKILL_COLORS[i % SKILL_COLORS.length], border: `1px solid ${SKILL_COLORS[i % SKILL_COLORS.length]}25` }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Checklist progress */}
          {totalChecks > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "#374151" }}>Checklist</span>
                <span className="text-xs font-medium" style={{ color: checkPct === 100 ? "#4ade80" : "#3291FF" }}>
                  {completedChecks}/{totalChecks}
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(0,112,243,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${checkPct}%`, background: checkPct === 100 ? "#4ade80" : "linear-gradient(90deg,#0064dc,#3291FF)" }} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(0,112,243,0.07)" }}>
            <div className="flex items-center gap-2">
              {/* Assignee */}
              {task.assignee && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: task.assignee.color + "30", color: task.assignee.color, border: `1px solid ${task.assignee.color}40` }}
                  title={task.assignee.name}>
                  {task.assignee.name[0]}
                </div>
              )}

              {/* Due date */}
              {task.dueDate && (
                <span className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: isOverdue ? "rgba(248,113,113,0.1)" : "rgba(0,112,243,0.06)",
                    color: isOverdue ? "#f87171" : "#4b5563",
                    border: `1px solid ${isOverdue ? "rgba(248,113,113,0.2)" : "rgba(0,112,243,0.1)"}`,
                  }}>
                  {isOverdue ? "⚠ " : "📅 "}{task.dueDate}
                </span>
              )}
            </div>

            {/* Comments count */}
            {task.comments > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "#374151" }}>
                <span style={{ fontSize: 10 }}>💬</span> {task.comments}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;