import { useState, useMemo } from "react";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard    from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import api from "../../lib/api";

const KanbanBoard = ({ workspaceTitle = "AI Chess Bot", columns = [], onColumnsChange, projectId, members = [] }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal]           = useState(null); // { columnId, task? }
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode]             = useState("board"); // board | list

  // Sensors — require 5px movement to start drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Stats calculation from columns
  const stats = useMemo(() => {
    const all = columns.flatMap(c => c.tasks || []);
    const doneCol = columns.find(c => c.id === "done" || c.title?.toLowerCase() === "done");
    return {
      total: all.length,
      done:  doneCol ? (doneCol.tasks?.length || 0) : 0,
      urgent: all.filter(t => t.priority === "urgent").length,
      mine:  all.filter(t => (t.assignee?.id || t.assignee || t.assignee?._id) === 1).length,
    };
  }, [columns]);

  // All tasks for list view
  const allTasks = useMemo(() => columns.flatMap(c => (c.tasks || []).map(t => ({ ...t, status: c.id }))), [columns]);

  // dnd-kit handlers
  const onDragStart = ({ active }) => {
    const taskId = active.id;
    for (const col of columns) {
      const found = col.tasks?.find(t => (t.id || t._id) === taskId);
      if (found) {
        setActiveTask({ ...found, status: col.id });
        break;
      }
    }
  };

  const onDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    onColumnsChange(prev => {
      const updated = [...prev];
      let activeColIdx = -1, activeTaskIdx = -1;
      
      updated.forEach((col, i) => {
        const idx = col.tasks?.findIndex(t => (t.id || t._id) === activeId);
        if (idx !== -1) { activeColIdx = i; activeTaskIdx = idx; }
      });

      let overColIdx = updated.findIndex(col => col.id === overId);
      if (overColIdx === -1) {
        updated.forEach((col, i) => {
          const idx = col.tasks?.findIndex(t => (t.id || t._id) === overId);
          if (idx !== -1) overColIdx = i;
        });
      }

      if (activeColIdx === -1 || overColIdx === -1 || activeColIdx === overColIdx) return prev;

      const activeTasks = [...updated[activeColIdx].tasks];
      const overTasks = [...updated[overColIdx].tasks];
      const [movedTask] = activeTasks.splice(activeTaskIdx, 1);
      
      overTasks.push(movedTask);
      updated[activeColIdx] = { ...updated[activeColIdx], tasks: activeTasks };
      updated[overColIdx] = { ...updated[overColIdx], tasks: overTasks };
      
      return updated;
    });
  };

  const onDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let updatedColumns = [...columns];
    let colIdx = -1, taskIdx = -1;
    
    updatedColumns.forEach((col, i) => {
      const idx = col.tasks?.findIndex(t => (t.id || t._id) === activeId);
      if (idx !== -1) { colIdx = i; taskIdx = idx; }
    });

    if (colIdx !== -1) {
      const overTaskIdx = updatedColumns[colIdx].tasks?.findIndex(t => (t.id || t._id) === overId);
      if (taskIdx !== -1 && overTaskIdx !== -1 && taskIdx !== overTaskIdx) {
        const reordered = arrayMove(updatedColumns[colIdx].tasks, taskIdx, overTaskIdx);
        updatedColumns[colIdx] = { ...updatedColumns[colIdx], tasks: reordered };
        
        onColumnsChange(updatedColumns);

        try {
          await api.put(`/workspaces/${projectId}`, { columns: updatedColumns })
        } catch (err) {
          console.error('Failed to persist workspace order:', err)
        }
      }
    }
  };

  const handleDeleteTask = async (id) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => (t.id || t._id) !== id)
    }));
    onColumnsChange(newColumns);
    try {
      await api.put(`/workspaces/${projectId}`, { columns: newColumns });
    } catch (err) {
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSearch(""); setFilterPriority("all"); setFilterAssignee("all"); setFilterType("all");
  };

  const hasFilters = search || filterPriority !== "all" || filterAssignee !== "all" || filterType !== "all";

  return (
    <>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .board-scroll::-webkit-scrollbar { height:4px; }
        .board-scroll::-webkit-scrollbar-track { background:rgba(139,92,246,0.05); }
        .board-scroll::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.2); border-radius:2px; }
      `}</style>

      <div className="flex flex-col h-full" style={{ background: "transparent" }}>

        {/* ── Board header ── */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>

          {/* Title row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 18 }}>⊞</span>
                <h2 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Kanban Board</h2>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                  {workspaceTitle}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#4b5563" }}>
                Drag tasks between columns to update status
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex p-0.5 rounded-lg" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                {["board", "list"].map(v => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-200"
                    style={{
                      background: viewMode === v ? "rgba(124,58,237,0.2)" : "transparent",
                      border: viewMode === v ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                      color: viewMode === v ? "#a78bfa" : "#4b5563",
                      cursor: "pointer",
                    }}>
                    {v === "board" ? "⊞" : "☰"} {v}
                  </button>
                ))}
              </div>

              {/* Add task */}
              <button onClick={() => setModal({ column: "todo" })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 20px rgba(124,58,237,0.4)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                + New Task
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-4">
            {[
              { label: "Total", value: stats.total, color: "#a78bfa" },
              { label: "Done", value: `${stats.done}/${stats.total}`, color: "#4ade80" },
              { label: "Urgent", value: stats.urgent, color: "#f87171" },
              { label: "My tasks", value: stats.mine, color: "#61dafb" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs" style={{ color: "#374151" }}>{s.label}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="flex-1 flex items-center gap-2 ml-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%`, background: "linear-gradient(90deg,#7c3aed,#4ade80)" }} />
              </div>
              <span className="text-xs font-medium" style={{ color: "#4b5563" }}>
                {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            {[
              { label: "Total", value: stats.total, color: "#a78bfa" },
              { label: "Done", value: `${stats.done}/${stats.total}`, color: "#4ade80" },
              { label: "Urgent", value: stats.urgent, color: "#f87171" },
              { label: "My tasks", value: stats.mine, color: "#61dafb" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs" style={{ color: "#374151" }}>{s.label}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="flex-1 flex items-center gap-2 ml-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%`, background: "linear-gradient(90deg,#7c3aed,#4ade80)" }} />
              </div>
              <span className="text-xs font-medium" style={{ color: "#4b5563" }}>
                {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Board / List view ── */}
        {viewMode === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex-1 overflow-x-auto board-scroll">
              <div className="flex gap-4 p-6 h-full" style={{ minWidth: "max-content" }}>
                {columns.map((col, i) => (
                  <div key={col.id} style={{ animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.08}s` }}>
                    <KanbanColumn
                      id={col.id}
                      title={col.title}
                      tasks={col.tasks}
                      onAddTask={(column) => setModal({ column })}
                      onEditTask={(task) => setModal({ column: col.id, task })}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Drag overlay — the floating card while dragging */}
            <DragOverlay>
              {activeTask && (
                <div style={{ width: 300, transform: "rotate(2deg)" }}>
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} overlay />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          /* ── List view ── */
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="max-w-4xl space-y-2">
              {columns.map(col => (
                <div key={col.id}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-4" style={{ color: "#374151" }}>
                    {col.title} ({col.tasks?.length || 0})
                  </p>
                  {col.tasks?.map((task, i) => (
                    <div key={task.id || task._id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl mb-1.5 transition-all duration-200"
                      style={{ background: "rgba(12,8,32,0.8)", border: "1px solid rgba(139,92,246,0.1)", animation: `slideIn 0.3s ease both`, animationDelay: `${i * 0.04}s` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.background = "rgba(20,12,50,0.9)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.1)"; e.currentTarget.style.background = "rgba(12,8,32,0.8)"; }}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", flexShrink: 0 }}>{task.type}</span>
                        <p className="text-white text-sm font-medium truncate">{task.title}</p>
                        {task.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full hidden md:block" style={{ background: "rgba(139,92,246,0.08)", color: "#4b5563", flexShrink: 0 }}>{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {task.assignee && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: (task.assignee.color || "#a78bfa") + "30", color: task.assignee.color || "#a78bfa" }}>
                            {(task.assignee.name || "U")[0]}
                          </div>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{
                          background: task.priority === "urgent" ? "rgba(248,113,113,0.1)" : task.priority === "high" ? "rgba(251,146,60,0.1)" : "rgba(251,191,36,0.1)",
                          color: task.priority === "urgent" ? "#f87171" : task.priority === "high" ? "#fb923c" : "#fbbf24",
                        }}>{task.priority}</span>
                        {task.dueDate && <span className="text-xs" style={{ color: "#374151" }}>{task.dueDate}</span>}
                        <button onClick={() => setModal({ column: col.id, task })}
                          className="text-xs px-2 py-1 rounded-lg transition-all duration-200"
                          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "#a78bfa", cursor: "pointer" }}>
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ── */}
      {modal && (
        <AddTaskModal
          onClose={() => setModal(null)}
          projectId={projectId}
          columnId={modal.column}
          onWorkspaceUpdate={onColumnsChange}
          defaultColumn={modal.column}
          editTask={modal.task || null}
          columns={columns}
          members={members}
        />
      )}
    </>
  );
};

export default KanbanBoard;