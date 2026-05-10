import { useState, useMemo, useCallback } from "react";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard    from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import api from "../../lib/api";
import { LayoutDashboard, List } from "lucide-react";

// Helper — get the stable id from a task (backend uses _id, frontend-created use id)
const getTaskId = (t) => t.id || t._id?.toString();

const KanbanBoard = ({ workspaceTitle = "Workspace", columns = [], onColumnsChange, projectId, members = [] }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal]           = useState(null);
  const [viewMode, setViewMode]     = useState("board");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const stats = useMemo(() => {
    const all = columns.flatMap(c => c.tasks || []);
    const doneCol = columns.find(c => c.title?.toLowerCase() === "done");
    return {
      total:  all.length,
      done:   doneCol?.tasks?.length || 0,
      urgent: all.filter(t => t.priority === "urgent").length,
    };
  }, [columns]);

  const persist = useCallback(async (cols) => {
    try {
      await api.put(`/workspaces/${projectId}`, { columns: cols });
    } catch (err) {
      console.error("Failed to save workspace:", err);
    }
  }, [projectId]);

  const onDragStart = ({ active }) => {
    for (const col of columns) {
      const found = col.tasks?.find(t => getTaskId(t) === active.id);
      if (found) { setActiveTask({ ...found, _colId: col.id }); break; }
    }
  };

  const onDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId   = over.id;
    if (activeId === overId) return;

    onColumnsChange(prev => {
      // Deep clone to avoid mutation
      const cols = prev.map(c => ({ ...c, tasks: [...(c.tasks || [])] }));

      // Find source
      let srcIdx = -1, srcTaskIdx = -1;
      cols.forEach((col, i) => {
        const idx = col.tasks.findIndex(t => getTaskId(t) === activeId);
        if (idx !== -1) { srcIdx = i; srcTaskIdx = idx; }
      });
      if (srcIdx === -1) return prev;

      // Find destination — either a column id or a task id inside a column
      let dstIdx = cols.findIndex(c => c.id === overId);
      if (dstIdx === -1) {
        cols.forEach((col, i) => {
          if (col.tasks.some(t => getTaskId(t) === overId)) dstIdx = i;
        });
      }
      if (dstIdx === -1) return prev;

      const [movedTask] = cols[srcIdx].tasks.splice(srcTaskIdx, 1);
      const overTaskIdx = cols[dstIdx].tasks.findIndex(t => getTaskId(t) === overId);
      // Insert at over-task position, or at end if dropping on column
      cols[dstIdx].tasks.splice(overTaskIdx >= 0 ? overTaskIdx : cols[dstIdx].tasks.length, 0, movedTask);

      return cols;
    });
  };

  const onDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    // onDragOver already updated state — just persist current columns
    onColumnsChange(prev => {
      persist(prev); // fire-and-forget
      return prev;
    });
  };

  const handleDeleteTask = async (id) => {
    const newCols = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => getTaskId(t) !== id)
    }));
    onColumnsChange(newCols);
    try { await api.put(`/workspaces/${projectId}`, { columns: newCols }); }
    catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .board-scroll::-webkit-scrollbar { height:4px; }
        .board-scroll::-webkit-scrollbar-track { background:rgba(0,112,243,0.05); }
        .board-scroll::-webkit-scrollbar-thumb { background:rgba(0,112,243,0.2); border-radius:2px; }
      `}</style>

      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard size={20} style={{ color: "#3291FF" }} />
                <h2 className="text-xl font-bold text-white">Kanban Board</h2>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,112,243,0.12)", color: "#3291FF", border: "1px solid rgba(0,112,243,0.2)" }}>
                  {workspaceTitle}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#4b5563" }}>Drag tasks between columns to update status</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 rounded-lg" style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.12)" }}>
                {["board", "list"].map(v => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium capitalize flex items-center gap-1.5"
                    style={{ background: viewMode === v ? "rgba(0,100,220,0.2)" : "transparent", border: viewMode === v ? "1px solid rgba(0,112,243,0.3)" : "1px solid transparent", color: viewMode === v ? "#3291FF" : "#4b5563", cursor: "pointer" }}>
                    {v === "board" ? <LayoutDashboard size={14} /> : <List size={14} />} {v}
                  </button>
                ))}
              </div>
              <button onClick={() => setModal({ columnId: columns[0]?.id })}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#0064dc,#0050b4)", color: "#fff", border: "none", cursor: "pointer" }}>
                + New Task
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {[
              { label: "Total",  value: stats.total,  color: "#3291FF" },
              { label: "Done",   value: `${stats.done}/${stats.total}`, color: "#4ade80" },
              { label: "Urgent", value: stats.urgent, color: "#f87171" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs" style={{ color: "#374151" }}>{s.label}</span>
              </div>
            ))}
            <div className="flex-1 flex items-center gap-2 ml-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,112,243,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%`, background: "linear-gradient(90deg,#0064dc,#4ade80)" }} />
              </div>
              <span className="text-xs" style={{ color: "#4b5563" }}>
                {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Board / List */}
        {viewMode === "board" ? (
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <div className="flex-1 overflow-x-auto board-scroll">
              <div className="flex gap-4 p-6 h-full" style={{ minWidth: "max-content" }}>
                {columns.map((col, i) => (
                  <div key={col.id} style={{ animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.08}s` }}>
                    <KanbanColumn
                      id={col.id}
                      title={col.title}
                      tasks={col.tasks || []}
                      onAddTask={(colId) => setModal({ columnId: colId })}
                      onEditTask={(task) => setModal({ columnId: col.id, task })}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeTask && (
                <div style={{ width: 300, transform: "rotate(2deg)" }}>
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} overlay />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="max-w-4xl space-y-2">
              {columns.map(col => (
                <div key={col.id}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-4" style={{ color: "#374151" }}>
                    {col.title} ({col.tasks?.length || 0})
                  </p>
                  {col.tasks?.map((task, i) => (
                    <div key={getTaskId(task)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl mb-1.5 transition-all duration-200"
                      style={{ background: "rgba(12,12,15,0.8)", border: "1px solid rgba(0,112,243,0.1)", animation: `slideIn 0.3s ease both`, animationDelay: `${i * 0.04}s` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.3)"; e.currentTarget.style.background = "rgba(22,22,26,0.9)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.1)"; e.currentTarget.style.background = "rgba(12,12,15,0.8)"; }}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(0,112,243,0.1)", color: "#3291FF", flexShrink: 0 }}>{task.type || "task"}</span>
                        <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {task.assignee && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: "rgba(50,145,255,0.2)", color: "#3291FF" }}>
                            {(task.assignee.fullName || task.assignee.name || "U")[0]}
                          </div>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{
                          background: task.priority === "urgent" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                          color: task.priority === "urgent" ? "#f87171" : "#fbbf24",
                        }}>{task.priority || "medium"}</span>
                        <button onClick={() => setModal({ columnId: col.id, task })}
                          style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.15)", color: "#3291FF", cursor: "pointer", borderRadius: 8, padding: "2px 10px", fontSize: 12 }}>
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

      {modal && (
        <AddTaskModal
          onClose={() => setModal(null)}
          projectId={projectId}
          columnId={modal.columnId}
          onWorkspaceUpdate={onColumnsChange}
          defaultColumn={modal.columnId}
          editTask={modal.task || null}
          columns={columns}
          members={members}
        />
      )}
    </>
  );
};

export default KanbanBoard;
