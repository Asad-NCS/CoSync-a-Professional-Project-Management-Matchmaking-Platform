import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import TaskCard from "./TaskCard";

const COLUMN_CONFIG = {
  todo: {
    label: "To Do",
    color: "#61dafb",
    bg: "rgba(97,218,251,0.06)",
    border: "rgba(97,218,251,0.15)",
    glow: "rgba(97,218,251,0.08)",
    icon: "○",
    dot: "#61dafb",
  },
  inprogress: {
    label: "In Progress",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.15)",
    glow: "rgba(167,139,250,0.08)",
    icon: "◑",
    dot: "#a78bfa",
  },
  review: {
    label: "In Review",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.15)",
    glow: "rgba(251,191,36,0.08)",
    icon: "◕",
    dot: "#fbbf24",
  },
  done: {
    label: "Done",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.15)",
    glow: "rgba(74,222,128,0.08)",
    icon: "●",
    dot: "#4ade80",
  },
};

const KanbanColumn = ({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [hovered, setHovered] = useState(false);
  const config = COLUMN_CONFIG[id] || COLUMN_CONFIG.todo;
  const label = title || config.label;

  return (
    <div
      className="flex flex-col rounded-2xl transition-all duration-300 flex-shrink-0"
      style={{
        width: 300,
        background: isOver ? config.glow : "rgba(10,6,28,0.7)",
        border: `1px solid ${isOver ? config.border : "rgba(139,92,246,0.1)"}`,
        boxShadow: isOver ? `0 0 30px ${config.glow}` : "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            {/* Status dot */}
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
              style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
              {config.icon}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Count badge */}
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
              {tasks.length}
            </span>
            {/* Add button */}
            <button
              onClick={() => onAddTask(id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-base transition-all duration-200"
              style={{
                background: hovered ? config.bg : "transparent",
                border: `1px solid ${hovered ? config.border : "transparent"}`,
                color: hovered ? config.color : "#374151",
                cursor: "pointer",
                lineHeight: 1,
              }}
              title="Add task"
            >
              +
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {id === "done" && tasks.length > 0 && (
          <div className="mt-2">
            <div className="h-1 rounded-full" style={{ background: "rgba(74,222,128,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: "100%", background: "linear-gradient(90deg,#4ade80,#22c55e)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Drop zone + task list */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-2.5 overflow-y-auto"
        style={{
          minHeight: 200,
          maxHeight: "calc(100vh - 280px)",
          scrollbarWidth: "none",
        }}
      >
        <SortableContext items={tasks.map(t => t.id || t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-xl py-10 transition-all duration-200"
            style={{
              border: `1px dashed ${isOver ? config.border : "rgba(139,92,246,0.1)"}`,
              background: isOver ? config.glow : "transparent",
            }}
          >
            <div className="text-3xl mb-2 opacity-30">{config.icon}</div>
            <p className="text-xs font-medium" style={{ color: isOver ? config.color : "#374151" }}>
              {isOver ? "Drop here" : "No tasks yet"}
            </p>
            <button
              onClick={() => onAddTask(id)}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
                color: "#4b5563",
                cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = config.color; e.currentTarget.style.borderColor = config.border; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)"; }}
            >
              + Add first task
            </button>
          </div>
        )}
      </div>

      {/* Column footer — add task button */}
      <div className="px-3 pb-3 flex-shrink-0">
        <button
          onClick={() => onAddTask(id)}
          className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: "transparent",
            border: `1px dashed rgba(139,92,246,0.15)`,
            color: "#374151",
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = config.bg;
            e.currentTarget.style.borderColor = config.border;
            e.currentTarget.style.color = config.color;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
            e.currentTarget.style.color = "#374151";
          }}
        >
          <span style={{ fontSize: 14 }}>+</span> Add task
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;