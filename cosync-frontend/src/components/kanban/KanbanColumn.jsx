import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import TaskCard from "./TaskCard";

const COLUMN_CONFIG = {
  "col-1": { color: "#61dafb", bg: "rgba(97,218,251,0.06)",  border: "rgba(97,218,251,0.15)",  glow: "rgba(97,218,251,0.08)",  icon: "○", dot: "#61dafb" },
  "col-2": { color: "#3291FF", bg: "rgba(50,145,255,0.06)",  border: "rgba(50,145,255,0.15)",  glow: "rgba(50,145,255,0.08)",  icon: "◑", dot: "#3291FF" },
  "col-3": { color: "#4ade80", bg: "rgba(74,222,128,0.06)",  border: "rgba(74,222,128,0.15)",  glow: "rgba(74,222,128,0.08)",  icon: "●", dot: "#4ade80" },
  // legacy string ids
  todo:       { color: "#61dafb", bg: "rgba(97,218,251,0.06)",  border: "rgba(97,218,251,0.15)",  glow: "rgba(97,218,251,0.08)",  icon: "○" },
  inprogress: { color: "#3291FF", bg: "rgba(50,145,255,0.06)",  border: "rgba(50,145,255,0.15)",  glow: "rgba(50,145,255,0.08)",  icon: "◑" },
  review:     { color: "#fbbf24", bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.15)",  glow: "rgba(251,191,36,0.08)",  icon: "◕" },
  done:       { color: "#4ade80", bg: "rgba(74,222,128,0.06)",  border: "rgba(74,222,128,0.15)",  glow: "rgba(74,222,128,0.08)",  icon: "●" },
};

// Derive a config from the column title when id doesn't match
const configFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("done") || t.includes("complet")) return COLUMN_CONFIG.done;
  if (t.includes("progress") || t.includes("doing")) return COLUMN_CONFIG.inprogress;
  if (t.includes("review"))  return COLUMN_CONFIG.review;
  return COLUMN_CONFIG.todo;
};

// Stable task id — backend stores as _id, locally created use id
const getTaskId = (t) => t.id || t._id?.toString();

const KanbanColumn = ({ id, title, tasks = [], onAddTask, onEditTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [hovered, setHovered] = useState(false);

  const config = COLUMN_CONFIG[id] || configFromTitle(title);
  const label  = title || id;

  // dnd-kit requires the items array to match exactly what useSortable uses as id
  const taskIds = tasks.map(getTaskId).filter(Boolean);

  return (
    <div
      className="flex flex-col rounded-2xl transition-all duration-300 flex-shrink-0"
      style={{
        width: 300,
        background: isOver ? config.glow : "rgba(10,6,28,0.7)",
        border: `1px solid ${isOver ? config.border : "rgba(0,112,243,0.1)"}`,
        boxShadow: isOver ? `0 0 30px ${config.glow}` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
              style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
              {config.icon}
            </div>
            <p className="text-white font-bold text-sm">{label}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
              {tasks.length}
            </span>
            <button onClick={() => onAddTask(id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-base transition-all duration-200"
              style={{ background: hovered ? config.bg : "transparent", border: `1px solid ${hovered ? config.border : "transparent"}`, color: hovered ? config.color : "#374151", cursor: "pointer", lineHeight: 1 }}
              title="Add task">
              +
            </button>
          </div>
        </div>
      </div>

      {/* Task list — drop zone */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2.5 overflow-y-auto"
        style={{ minHeight: 200, maxHeight: "calc(100vh - 280px)", scrollbarWidth: "none" }}>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={getTaskId(task)}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl py-10 transition-all duration-200"
            style={{ border: `1px dashed ${isOver ? config.border : "rgba(0,112,243,0.1)"}`, background: isOver ? config.glow : "transparent" }}>
            <div className="text-3xl mb-2 opacity-30">{config.icon}</div>
            <p className="text-xs font-medium" style={{ color: isOver ? config.color : "#374151" }}>
              {isOver ? "Drop here" : "No tasks yet"}
            </p>
            <button onClick={() => onAddTask(id)}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: "rgba(0,112,243,0.06)", border: "1px solid rgba(0,112,243,0.15)", color: "#4b5563", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.color = config.color; e.currentTarget.style.borderColor = config.border; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "rgba(0,112,243,0.15)"; }}>
              + Add first task
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex-shrink-0">
        <button onClick={() => onAddTask(id)}
          className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200"
          style={{ background: "transparent", border: "1px dashed rgba(0,112,243,0.15)", color: "#374151", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = config.bg; e.currentTarget.style.borderColor = config.border; e.currentTarget.style.color = config.color; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(0,112,243,0.15)"; e.currentTarget.style.color = "#374151"; }}>
          <span style={{ fontSize: 14 }}>+</span> Add task
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;
