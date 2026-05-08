import { useState, useEffect } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../lib/api";
import { LayoutDashboard, MessageSquare, Users, Folder, Zap, Settings, Trash2, ExternalLink, FileText, Link, Github, Figma } from "lucide-react";
import KanbanBoard   from "../../components/kanban/KanbanBoard";
import DiscussionTab from "./DiscussionTab";
import ActivityTab   from "./ActivityTab";

const ResourcesTab = ({ workspace, projectId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState('');
  const [type, setType] = useState('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [projectId]);

  const fetchResources = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/resources`);
      setResources(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      if (type === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('url', url);
      }

      await api.post(`/projects/${projectId}/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setName(''); setUrl(''); setFile(null);
      fetchResources();
    } catch (err) {
      console.error(err);
      alert('Failed to add resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/projects/${projectId}/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type, url) => {
    if (type === 'file') return <FileText size={18} />;
    if (!url) return <Link size={18} />;
    if (url.includes('github')) return <Github size={18} />;
    if (url.includes('figma')) return <Figma size={18} />;
    return <Link size={18} />;
  };

  const getUrl = (r) => {
    if (r.type === 'file') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      return apiUrl.replace('/api', '') + r.url;
    }
    return r.url.startsWith('http') ? r.url : `https://${r.url}`;
  };

  return (
    <div className="flex-1 p-6 overflow-auto relative">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Resources</h2>
          <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Shared files, links, and documents</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:scale-[1.02] active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#0064dc,#0050b4)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,100,220,0.2)" }}>
          + Add Resource
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading resources...</p>
      ) : resources.length === 0 ? (
        <div className="text-center py-10 max-w-xl" style={{ background: "rgba(12,12,15,0.8)", border: "1px dashed rgba(0,112,243,0.2)", borderRadius: 16 }}>
           <div className="flex justify-center mb-3 text-primary"><Folder size={32} /></div>
           <p className="text-white font-medium mb-1">No resources yet</p>
           <p className="text-xs text-gray-400 mb-4">Upload files or share links with your team.</p>
           <button onClick={() => setShowModal(true)} className="text-xs px-4 py-2 rounded-lg font-medium transition-colors" style={{ background: "rgba(0,112,243,0.1)", color: "#3291FF", cursor: "pointer" }}>Add First Resource</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map(r => (
            <div key={r._id} className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 relative group"
              style={{ background: "rgba(12,12,15,0.8)", border: "1px solid rgba(0,112,243,0.12)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.35)"; e.currentTarget.style.background = "rgba(22,22,26,0.9)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.12)"; e.currentTarget.style.background = "rgba(12,12,15,0.8)"; }}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.12)" }}>
                  {getIcon(r.type, r.url)}
                </div>
                <div className="min-w-0 pr-4">
                  <a href={getUrl(r)} target="_blank" rel="noreferrer" className="text-white text-sm font-medium hover:underline block truncate">{r.name}</a>
                  <p className="text-xs truncate" style={{ color: "#4b5563" }}>Added by {r.addedBy?.fullName || 'User'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleDelete(r._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex items-center justify-center" style={{ border: "none", cursor: "pointer", background: "none" }} title="Delete"><Trash2 size={16} /></button>
                <a href={getUrl(r)} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-white transition-colors flex items-center justify-center" title="Open"><ExternalLink size={16} /></a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl" style={{ background: "rgba(18,18,22,0.95)", border: "1px solid rgba(0,112,243,0.2)" }}>
            <h3 className="text-lg font-bold text-white mb-4">Add Resource</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded-lg text-sm text-white" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,112,243,0.2)", outline: "none" }} placeholder="e.g. System Architecture" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                <div className="flex gap-2 p-1 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,112,243,0.1)" }}>
                  {['link', 'file'].map(t => (
                    <button key={t} type="button" onClick={() => setType(t)} className="flex-1 py-1.5 text-sm rounded-md capitalize transition-colors" style={{ border: "none", cursor: "pointer", background: type === t ? "rgba(0,112,243,0.2)" : "transparent", color: type === t ? "#fff" : "#9ca3af" }}>{t}</button>
                  ))}
                </div>
              </div>
              {type === 'link' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
                  <input required type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2.5 rounded-lg text-sm text-white" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,112,243,0.2)", outline: "none" }} placeholder="https://..." />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">File</label>
                  <input required type="file" onChange={e => setFile(e.target.files[0])} className="w-full p-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-500/20 file:text-violet-400 hover:file:bg-violet-500/30" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,112,243,0.2)", borderRadius: 8 }} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ border: "none", cursor: submitting ? "wait" : "pointer", background: "linear-gradient(135deg,#0064dc,#0050b4)", color: "#fff", opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Adding...' : 'Add Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamTab = ({ workspace }) => (
  <div className="flex-1 p-6 overflow-auto">
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white mb-1">Team Members</h2>
      <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>{workspace.members?.length || 0} members</p>
    </div>
    <div className="space-y-3 max-w-2xl">
      {workspace.members?.map((m, i) => {
        const name = m.fullName || m.name || 'User';
        const avatarColor = '#3291FF';
        return (
          <div key={m._id || m.id || i} className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200"
            style={{ background: "rgba(12,12,15,0.8)", border: "1px solid rgba(0,112,243,0.12)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.3)"; e.currentTarget.style.background = "rgba(22,22,26,0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,112,243,0.12)"; e.currentTarget.style.background = "rgba(12,12,15,0.8)"; }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${avatarColor}25`, color: avatarColor, border: `1px solid ${avatarColor}35` }}>
                  {name[0]}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{name}</p>
                <p className="text-xs" style={{ color: "#4b5563" }}>{m.role || 'Member'}</p>
              </div>
            </div>
            {i === 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(0,112,243,0.12)", color: "#3291FF", border: "1px solid rgba(0,112,243,0.2)" }}>
                Lead
              </span>
            )}
          </div>
        );
      })}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(0,112,243,0.03)", border: "1px dashed rgba(0,112,243,0.2)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.15)" }}>
            <span style={{ color: "#3291FF", fontSize: 18 }}>+</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Invite a member</p>
            <p className="text-xs" style={{ color: "#374151" }}>Accept from applications or share workspace link</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NAV_ITEMS = [
  { id: "kanban",     icon: <LayoutDashboard size={16} />, label: "Kanban Board",  desc: "Tasks & progress"  },
  { id: "discussion", icon: <MessageSquare size={16} />, label: "Discussion",    desc: "Team chat"         },
  { id: "team",       icon: <Users size={16} />, label: "Team",          desc: "Members & roles"   },
  { id: "resources",  icon: <Folder size={16} />, label: "Resources",     desc: "Files & links"     },
  { id: "activity",   icon: <Zap size={16} />, label: "Activity Feed", desc: "Real-time stream"  },
];

const WorkspacePage = () => {
  const { id: projectId } = useParams();
  const { user } = useSelector(s => s.auth);
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("kanban");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/workspaces/${projectId}`)
        const data = res.data.data;
        // Merge project details into a flat workspace object for easier UI access
        const flatWorkspace = {
          ...data,
          title: data.project?.title,
          owner: data.project?.owner,
          status: data.project?.status,
          deadline: data.project?.deadline ? new Date(data.project.deadline).toLocaleDateString() : '—',
          members: data.project?.members || [],
          progress: calculateProgress(data.columns),
          tasksDone: data.columns.find(c => c.title === 'Done')?.tasks?.length || 0,
          tasksTotal: data.columns.reduce((acc, col) => acc + col.tasks.length, 0)
        };
        setWorkspace(flatWorkspace);
        setColumns(data.columns)
        setLoading(false)
      } catch (err) {
        setError('Failed to load workspace.')
        setLoading(false)
      }
    }
    fetchWorkspace()
  }, [projectId])

  const calculateProgress = (cols) => {
    const total = cols.reduce((acc, col) => acc + col.tasks.length, 0);
    const done = cols.find(c => c.title === 'Done')?.tasks?.length || 0;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const handleComplete = async () => {
    if (!window.confirm("Mark this project as completed? This will award reputation to team members and close the project.")) return;
    try {
      const res = await api.put(`/projects/${projectId}/complete`);
      setWorkspace(prev => ({ ...prev, status: 'completed' }));
      alert("Project completed! Congratulations to the team.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete project");
    }
  };

  const isOwner = (workspace?.owner?._id || workspace?.owner) === (user?._id || user?.id);

  const renderContent = () => {
    if (loading) return <div className="p-6 text-gray-400">Loading workspace...</div>;
    
    switch (activeTab) {
      case "kanban":     return <KanbanBoard workspaceTitle={workspace?.title} columns={columns} onColumnsChange={setColumns} projectId={projectId} members={workspace?.members} />;
      case "discussion": return <DiscussionTab workspace={workspace} />;
      case "team":       return <TeamTab workspace={workspace} />;
      case "resources":  return <ResourcesTab workspace={workspace} projectId={projectId} />;
      case "activity":   return <ActivityTab workspace={workspace} />;
      default:           return <KanbanBoard workspaceTitle={workspace?.title} columns={columns} onColumnsChange={setColumns} projectId={projectId} members={workspace?.members} />;
    }
  };

  if (loading) return <div className="flex justify-center p-20"><p className="text-gray-400">Loading workspace...</p></div>
  if (error) return <div className="flex justify-center p-20"><p className="text-red-400">{error}</p></div>

  return (
    <>


      <div className="flex h-screen overflow-hidden"
        style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff" }}>

        {/* Sidebar */}
        <aside className="flex flex-col h-full transition-all duration-300 flex-shrink-0"
          style={{ width: sidebarCollapsed ? 64 : 240, background: "rgba(4,4,6,0.98)", borderRight: "1px solid rgba(0,112,243,0.1)" }}>

          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
            {!sidebarCollapsed ? (
              <>
                <button className="nav-btn flex items-center gap-2" onClick={() => navigate("/dashboard")}>
                  <Logo className="w-6 h-6" />
                  <span className="text-sm font-semibold text-white">CoSync</span>
                </button>
                <button className="nav-btn" onClick={() => setSidebarCollapsed(true)} style={{ color: "#374151", fontSize: 16 }}>‹</button>
              </>
            ) : (
              <button className="nav-btn mx-auto" onClick={() => setSidebarCollapsed(false)} style={{ color: "#374151", fontSize: 16 }}>›</button>
            )}
          </div>

          {!sidebarCollapsed && workspace && (
            <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
              <div className="rounded-xl p-3" style={{ background: "rgba(0,112,243,0.06)", border: "1px solid rgba(0,112,243,0.12)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg,#0064dc,#3291FF)", color: "#fff" }}>
                    {workspace.title[0]}
                  </div>
                  <p className="text-white text-xs font-semibold truncate">{workspace.title}</p>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "#374151" }}>Progress</span>
                  <span className="text-xs font-medium" style={{ color: "#3291FF" }}>{workspace.progress}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(0,112,243,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${workspace.progress}%`, background: "linear-gradient(90deg,#0064dc,#3291FF)" }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: "#374151" }}>{workspace.tasksDone}/{workspace.tasksTotal} tasks</span>
                  <span className="text-xs" style={{ color: "#374151" }}>Due {workspace.deadline}</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative"
                style={{
                  background: activeTab === item.id ? "rgba(0,100,220,0.15)" : "transparent",
                  border: activeTab === item.id ? "1px solid rgba(0,112,243,0.25)" : "1px solid transparent",
                  color: activeTab === item.id ? "#3291FF" : "#4b5563",
                  cursor: "pointer",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                }}
                onMouseEnter={e => { if (activeTab !== item.id) { e.currentTarget.style.background = "rgba(0,112,243,0.08)"; e.currentTarget.style.color = "#9ca3af"; }}}
                onMouseLeave={e => { if (activeTab !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}}>
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                {!sidebarCollapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium leading-tight">{item.label}</p>
                    <p className="text-xs leading-tight" style={{ color: activeTab === item.id ? "#0064dc" : "#374151" }}>{item.desc}</p>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-14 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: "#0a0520", border: "1px solid rgba(0,112,243,0.2)", color: "#fff" }}>
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && workspace && workspace.members && (
            <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(0,112,243,0.08)", paddingTop: 12 }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#374151" }}>Team</p>
              <div className="space-y-2 mb-3">
                {workspace.members.slice(0, 3).map(m => {
                  const memberName = m.fullName || m.name || 'User';
                  return (
                    <div key={m._id || m.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(50,145,255,0.25)", color: "#3291FF" }}>{memberName[0]}</div>
                      <p className="text-xs truncate" style={{ color: "#4b5563" }}>{memberName}</p>
                    </div>
                  );
                })}
              </div>
              <button className="nav-btn text-left w-full text-xs" style={{ color: "#374151" }}
                onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
            style={{ background: "rgba(4,4,6,0.95)", borderBottom: "1px solid rgba(0,112,243,0.08)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="nav-btn text-sm" style={{ color: "#4b5563" }} onClick={() => navigate("/dashboard")}>Dashboard</button>
              <span style={{ color: "#374151" }}>›</span>
              <button className="nav-btn text-sm" style={{ color: "#4b5563" }} onClick={() => navigate("/my-projects")}>My Projects</button>
              <span style={{ color: "#374151" }}>›</span>
              <span className="text-sm font-medium" style={{ color: "#3291FF" }}>{workspace?.title || "Loading..."}</span>
              <span style={{ color: "#374151" }}>›</span>
              <span className="text-sm capitalize" style={{ color: "#6b7280" }}>{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="flex -space-x-2">
                  {workspace?.members?.map(m => (
                    <div key={m._id || m.id} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                      style={{ background: "rgba(50,145,255,0.30)", color: "#3291FF", borderColor: "#05030f" }} title={m.fullName || m.name || 'User'}>
                      {(m.fullName || m.name || "U")[0]}
                    </div>
                  ))}
                </div>
                <span className="text-xs" style={{ color: "#374151" }}>{workspace?.members?.length || 0} members</span>
              </div>
              <div className="w-px h-5" style={{ background: "rgba(0,112,243,0.15)" }} />
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ 
                  background: workspace?.status === 'completed' ? "rgba(74,222,128,0.1)" : "rgba(0,112,243,0.1)", 
                  border: `1px solid ${workspace?.status === 'completed' ? "rgba(74,222,128,0.25)" : "rgba(0,112,243,0.25)"}`, 
                  color: workspace?.status === 'completed' ? "#4ade80" : "#3291FF" 
                }}>
                ● {workspace?.status === 'completed' ? 'Completed' : 'Active'}
              </span>
              
              {isOwner && workspace?.status !== 'completed' && (
                <button 
                  onClick={handleComplete}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#4ade80,#34d399)", color: "#05030f", border: "none", cursor: "pointer" }}>
                  Mark as Completed
                </button>
              )}
              
              <button className="nav-btn px-3 py-1.5 rounded-lg text-sm flex items-center justify-center"
                style={{ border: "1px solid rgba(0,112,243,0.15)", color: "#6b7280" }}><Settings size={18} /></button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspacePage;