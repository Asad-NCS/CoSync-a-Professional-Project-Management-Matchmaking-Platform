import { useState, useEffect } from "react";
import api from "../../lib/api";

const PRIORITIES = ["urgent", "high", "medium", "low"];
const TYPES = ["feature", "bug", "task", "design", "docs"];

const PRIORITY_CONFIG = {
  urgent: { color: "#f87171", label: "🔴 Urgent" },
  high:   { color: "#fb923c", label: "🟠 High"   },
  medium: { color: "#fbbf24", label: "🟡 Medium"  },
  low:    { color: "#4ade80", label: "🟢 Low"     },
};

const TYPE_CONFIG = {
  feature: { color: "#a78bfa", label: "✦ Feature" },
  bug:     { color: "#f87171", label: "⚡ Bug"     },
  task:    { color: "#61dafb", label: "◈ Task"     },
  design:  { color: "#f472b6", label: "◉ Design"   },
  docs:    { color: "#34d399", label: "◎ Docs"     },
};



const inputStyle = (focused) => ({
  background: "rgba(15,10,40,0.8)",
  border: `1px solid ${focused ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.15)"}`,
  borderRadius: 10, color: "#fff", fontSize: "0.875rem",
  outline: "none", width: "100%", fontFamily: "inherit",
  padding: "0.625rem 0.875rem", transition: "all 0.2s",
  boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
});

const FocusInput = ({ placeholder, value, onChange, type = "text" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={inputStyle(focused)} />
  );
};

const FocusTextarea = ({ placeholder, value, onChange, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), resize: "none" }} />
  );
};

const AddTaskModal = ({ onClose, onSave, defaultColumn, editTask, columns = [], members = [], projectId, columnId, onWorkspaceUpdate }) => {
  const isEdit = !!editTask;

  const [form, setForm] = useState({
    title: "", description: "", type: "task", priority: "medium",
    column: defaultColumn || "todo", assigneeId: "",
    dueDate: "", tags: [], comments: 0,
    checklist: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [checkInput, setCheckInput] = useState("");
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("basic");
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        type: editTask.type || "task",
        priority: editTask.priority || "medium",
        column: editTask.status || defaultColumn || "todo",
        assigneeId: editTask.assignee?.id?.toString() || "",
        dueDate: editTask.dueDate || "",
        tags: editTask.tags || [],
        comments: editTask.comments || 0,
        checklist: editTask.checklist || [],
      });
    }
  }, [editTask, defaultColumn]);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };

  const addCheckItem = () => {
    const t = checkInput.trim();
    if (t) setForm(p => ({ ...p, checklist: [...p.checklist, { text: t, done: false }] }));
    setCheckInput("");
  };

  const toggleCheck = (i) => setForm(p => ({
    ...p,
    checklist: p.checklist.map((c, idx) => idx === i ? { ...c, done: !c.done } : c),
  }));

  const removeCheck = (i) => setForm(p => ({
    ...p,
    checklist: p.checklist.filter((_, idx) => idx !== i),
  }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length < 3) e.title = "Title too short";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true)
    setSaveError(null)
    try {
      const res = await api.post(`/workspaces/${projectId}/tasks`, {
        columnId,
        title: form.title,
        description: form.description,
        assignee: form.assigneeId || null,
        priority: form.priority
      })
      onWorkspaceUpdate(res.data.data.columns)
      onClose()
    } catch (err) {
      setSaveError('Failed to save task. Please try again.')
    }
    setSaving(false)
  };

  const SECTIONS = [
    { id: "basic",     label: "Basic",     icon: "◈" },
    { id: "details",   label: "Details",   icon: "◎" },
    { id: "checklist", label: "Checklist", icon: "✓" },
  ];

  const completedChecks = form.checklist.filter(c => c.done).length;

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
        onClick={onClose}>
        <div className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: "#0a0520", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", animation: "modalIn 0.25s ease both" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <span style={{ color: "#a78bfa", fontSize: 14 }}>{isEdit ? "✏" : "+"}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{isEdit ? "Edit Task" : "New Task"}</h3>
                  <p className="text-xs" style={{ color: "#4b5563" }}>
                    {isEdit ? "Update task details" : "Add to your Kanban board"}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: activeSection === s.id ? "rgba(124,58,237,0.2)" : "transparent",
                    border: activeSection === s.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    color: activeSection === s.id ? "#a78bfa" : "#4b5563",
                    cursor: "pointer",
                  }}>
                  {s.icon} {s.label}
                  {s.id === "checklist" && form.checklist.length > 0 && (
                    <span className="ml-1 text-xs" style={{ color: "#374151" }}>
                      ({completedChecks}/{form.checklist.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: "55vh" }}>

            {/* ── Basic section ── */}
            {activeSection === "basic" && (
              <div style={{ animation: "fadeUp 0.3s ease both" }}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                    Task Title <span style={{ color: "#7c3aed" }}>*</span>
                  </label>
                  <FocusInput placeholder="What needs to be done?" value={form.title} onChange={set("title")} />
                  {errors.title && <p className="text-xs mt-1" style={{ color: "#f87171" }}>⚠ {errors.title}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Description</label>
                  <FocusTextarea
                    placeholder="Add more context about this task — what needs to happen, why it matters, any specific requirements..."
                    value={form.description} onChange={set("description")} rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Type</label>
                    <div className="flex flex-col gap-1">
                      {TYPES.map(t => (
                        <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left"
                          style={{
                            background: form.type === t ? `${TYPE_CONFIG[t].color}15` : "rgba(139,92,246,0.04)",
                            border: `1px solid ${form.type === t ? TYPE_CONFIG[t].color + "40" : "rgba(139,92,246,0.08)"}`,
                            color: form.type === t ? TYPE_CONFIG[t].color : "#4b5563",
                            cursor: "pointer",
                          }}>
                          {TYPE_CONFIG[t].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Priority</label>
                    <div className="flex flex-col gap-1">
                      {PRIORITIES.map(p => (
                        <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left"
                          style={{
                            background: form.priority === p ? `${PRIORITY_CONFIG[p].color}12` : "rgba(139,92,246,0.04)",
                            border: `1px solid ${form.priority === p ? PRIORITY_CONFIG[p].color + "35" : "rgba(139,92,246,0.08)"}`,
                            color: form.priority === p ? PRIORITY_CONFIG[p].color : "#4b5563",
                            cursor: "pointer",
                          }}>
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Details section ── */}
            {activeSection === "details" && (
              <div style={{ animation: "fadeUp 0.3s ease both" }}>
                {/* Column */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Column</label>
                  <div className="grid grid-cols-2 gap-2">
                    {columns.map(col => (
                      <button key={col.id} type="button" onClick={() => setForm(p => ({ ...p, column: col.id }))}
                        className="py-2 px-1 rounded-lg text-xs font-medium capitalize transition-all duration-150 truncate"
                        style={{
                          background: form.column === col.id ? "rgba(124,58,237,0.18)" : "rgba(139,92,246,0.04)",
                          border: `1px solid ${form.column === col.id ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0.1)"}`,
                          color: form.column === col.id ? "#a78bfa" : "#4b5563",
                          cursor: "pointer",
                        }}>
                        {col.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Assignee</label>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => setForm(p => ({ ...p, assigneeId: "" }))}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150"
                      style={{
                        background: !form.assigneeId ? "rgba(124,58,237,0.15)" : "rgba(139,92,246,0.04)",
                        border: `1px solid ${!form.assigneeId ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.1)"}`,
                        color: !form.assigneeId ? "#a78bfa" : "#4b5563",
                        cursor: "pointer",
                      }}>
                      Unassigned
                    </button>
                    {members.map(m => (
                      <button key={m.id || m._id} type="button"
                        onClick={() => setForm(p => ({ ...p, assigneeId: (m.id || m._id).toString() }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150"
                        style={{
                          background: form.assigneeId === (m.id || m._id).toString() ? `${(m.color || "#a78bfa")}15` : "rgba(139,92,246,0.04)",
                          border: `1px solid ${form.assigneeId === (m.id || m._id).toString() ? (m.color || "#a78bfa") + "40" : "rgba(139,92,246,0.1)"}`,
                          color: form.assigneeId === (m.id || m._id).toString() ? (m.color || "#a78bfa") : "#4b5563",
                          cursor: "pointer",
                        }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: (m.color || "#a78bfa") + "30", color: m.color || "#a78bfa" }}>
                          {(m.name || m.fullName || "U")[0]}
                        </div>
                        {(m.name || m.fullName || "User").split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due date */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={set("dueDate")}
                    style={{ ...inputStyle(false), colorScheme: "dark" }} />
                </div>

                {/* Tags */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Add a tag..." value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      style={{ ...inputStyle(false), flex: 1 }} />
                    <button type="button" onClick={addTag}
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer" }}>
                      Add
                    </button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map((tag, i) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                          {tag}
                          <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Checklist section ── */}
            {activeSection === "checklist" && (
              <div style={{ animation: "fadeUp 0.3s ease both" }}>
                <div className="mb-4">
                  {form.checklist.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold" style={{ color: "#6b7280" }}>Progress</span>
                        <span className="text-xs font-medium" style={{ color: completedChecks === form.checklist.length && form.checklist.length > 0 ? "#4ade80" : "#a78bfa" }}>
                          {completedChecks}/{form.checklist.length} done
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${form.checklist.length ? (completedChecks / form.checklist.length) * 100 : 0}%`, background: "linear-gradient(90deg,#7c3aed,#4ade80)" }} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-hide">
                    {form.checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl group"
                        style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)" }}>
                        <button type="button" onClick={() => toggleCheck(i)}
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            background: item.done ? "#7c3aed" : "transparent",
                            border: `1.5px solid ${item.done ? "#7c3aed" : "rgba(139,92,246,0.3)"}`,
                            cursor: "pointer",
                            color: "#fff",
                            fontSize: 10,
                          }}>
                          {item.done ? "✓" : ""}
                        </button>
                        <p className="text-sm flex-1" style={{ color: item.done ? "#374151" : "#9ca3af", textDecoration: item.done ? "line-through" : "none" }}>
                          {item.text}
                        </p>
                        <button type="button" onClick={() => removeCheck(i)}
                          className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#374151" }}>×</button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input placeholder="Add checklist item..." value={checkInput}
                      onChange={e => setCheckInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCheckItem(); } }}
                      style={{ ...inputStyle(false), flex: 1, fontSize: "0.8rem" }} />
                    <button type="button" onClick={addCheckItem}
                      className="px-3 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer" }}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-3 flex gap-3" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", color: "#6b7280", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
              onMouseEnter={e => !saving && (e.currentTarget.style.boxShadow = "0 8px 25px rgba(124,58,237,0.4)")}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              {saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
          {saveError && (
            <p className="text-red-400 text-sm mt-2 px-6 pb-4">{saveError}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AddTaskModal;