import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../../lib/api";

const Avatar = ({ member, size = 8, showOnline = false }) => {
  const name = member?.name || member?.fullName || "User";
  const avatarBg = member?.avatar || "#3291FF";
  return (
    <div className="relative flex-shrink-0">
      <div style={{
        background: avatarBg + "25", color: avatarBg,
        border: `1.5px solid ${avatarBg}40`,
        width: size * 4, height: size * 4,
        borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: size < 8 ? 10 : 12, fontWeight: 700, flexShrink: 0,
      }}>
        {name[0].toUpperCase()}
      </div>
      {showOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: member?.online ? "#4ade80" : "#374151", borderColor: "#05030f" }} />
      )}
    </div>
  );
};

const MessageItem = ({ msg, meId, membersMap }) => {
  const senderId = msg.sender?._id?.toString() || msg.sender?.id?.toString() || msg.sender?.toString();
  const isMe = senderId === meId?.toString();
  const authorData = membersMap[senderId] || msg.sender || {};
  const authorColor = authorData.avatar || authorData.color || "#3291FF";
  const authorName = authorData.fullName || authorData.name || "User";
  const timeStr = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-3 group ${isMe ? "flex-row-reverse" : ""}`}>
      <Avatar member={{ ...authorData, avatar: authorColor }} size={8} />
      <div className={`flex-1 max-w-lg flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-semibold" style={{ color: authorColor }}>{authorName}</span>
          <span className="text-xs" style={{ color: "#374151" }}>{timeStr}</span>
        </div>
        <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isMe ? "rgba(0,100,220,0.2)" : "rgba(18,18,22,0.85)",
            border: `1px solid ${isMe ? "rgba(0,112,243,0.35)" : "rgba(0,112,243,0.12)"}`,
            color: "#e5e7eb",
            borderTopRightRadius: isMe ? 4 : 16,
            borderTopLeftRadius: isMe ? 16 : 4,
          }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
};

const DiscussionTab = ({ workspace }) => {
  const { user } = useSelector(s => s.auth);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const socketRef                       = useRef(null);
  const bottomRef                       = useRef(null);

  // ── Get correct projectId ─────────────────────────────────────────────────
  // workspace.project._id  (when workspace is populated from API)
  // workspace.project      (when it's just the id string)
  // workspace._id          (fallback)
  const projectId =
    workspace?.project?._id ||
    (typeof workspace?.project === "string" ? workspace.project : null) ||
    workspace?._id ||
    workspace?.id;

  // ── Build membersMap for quick lookup ────────────────────────────────────
  const membersMap = {};
  const allMembers = [
    ...(workspace?.project?.members || workspace?.members || []),
  ];
  const owner = workspace?.project?.owner || workspace?.owner;
  if (owner) allMembers.push(owner);
  allMembers.forEach(m => {
    const id = m?._id?.toString() || m?.id?.toString();
    if (id) membersMap[id] = m;
  });
  if (user) {
    const myId = (user._id || user.id)?.toString();
    if (myId) membersMap[myId] = user;
  }

  // ── Fetch + socket setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    api.get(`/messages/${projectId}`)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch messages error:", err);
        setError("Could not load messages. Make sure you are a team member.");
      })
      .finally(() => setLoading(false));

    const socketUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    const sock = io(socketUrl, { withCredentials: true });
    socketRef.current = sock;

    sock.emit("join_project", projectId);

    sock.on("new_message", (msg) => {
      const incomingSenderId =
        msg.sender?._id?.toString() ||
        msg.sender?.id?.toString() ||
        msg.sender?.toString();
      const myId = (user?._id || user?.id)?.toString();
      // Only add messages from OTHER users (my messages are added optimistically)
      if (incomingSenderId !== myId) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      sock.emit("leave_project", projectId);
      sock.disconnect();
    };
  }, [projectId]);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || !projectId) return;
    setInput("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      content: text,
      sender: user,
      createdAt: new Date().toISOString(),
      project: projectId,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await api.post(`/messages/${projectId}`, { content: text });
      const saved = res.data?.data;
      // Replace temp with real
      setMessages(prev => prev.map(m => m._id === tempId ? saved : m));
    } catch (err) {
      console.error("Send message error:", err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setInput(text);
    }
  };

  const activeMembers = workspace?.project?.members || workspace?.members || [];

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .chat-scroll::-webkit-scrollbar { width:3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background:rgba(0,112,243,0.2); border-radius:2px; }
      `}</style>

      <div className="flex flex-1 overflow-hidden">

        {/* Messages area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,112,243,0.08)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Team Discussion</h2>
                <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>
                  {messages.length} messages · {activeMembers.length} members
                </p>
              </div>
              <div className="flex -space-x-2">
                {activeMembers.slice(0, 5).map((m, i) => (
                  <div key={m._id || m.id || i} title={m.fullName || m.name}>
                    <Avatar member={m} size={7} showOnline />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 chat-scroll">
            {loading && (
              <div className="text-center py-10">
                <div className="w-6 h-6 rounded-full mx-auto mb-2"
                  style={{ border: "2px solid rgba(0,112,243,0.2)", borderTopColor: "#3291FF", animation: "spin 1s linear infinite" }} />
                <p className="text-xs" style={{ color: "#4b5563" }}>Loading messages...</p>
              </div>
            )}
            {!loading && error && (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">Could not load messages</p>
                <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
              </div>
            )}
            {!loading && !error && messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(0,112,243,0.08)", border: "1px solid rgba(0,112,243,0.12)" }}>
                  <span style={{ fontSize: 20 }}>💬</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">No messages yet</p>
                <p className="text-xs" style={{ color: "#374151" }}>Start the conversation!</p>
              </div>
            )}
            {!loading && !error && messages.map(msg => (
              <div key={msg._id} style={{ animation: "slideUp 0.3s ease both" }}>
                <MessageItem
                  msg={msg}
                  meId={(user?._id || user?.id)?.toString()}
                  membersMap={membersMap}
                />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,112,243,0.08)" }}>
            <div className="flex items-end gap-3">
              <Avatar member={user} size={8} />
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Send a message... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="w-full rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none transition-all duration-200"
                  style={{
                    background: "rgba(18,18,22,0.85)",
                    border: `1px solid ${inputFocused ? "rgba(0,112,243,0.5)" : "rgba(0,112,243,0.15)"}`,
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    boxShadow: inputFocused ? "0 0 0 3px rgba(0,112,243,0.1)" : "none",
                    fontFamily: "inherit",
                  }}
                />
                <button onClick={send} disabled={!input.trim()}
                  className="absolute right-3 bottom-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg,#0064dc,#0050b4)" : "rgba(0,112,243,0.08)",
                    border: "none", cursor: input.trim() ? "pointer" : "default",
                    color: input.trim() ? "#fff" : "#374151", fontSize: 13,
                  }}>
                  ↑
                </button>
              </div>
            </div>
            <p className="text-xs mt-2 ml-11" style={{ color: "#374151" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 p-4"
          style={{ borderLeft: "1px solid rgba(0,112,243,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Members</p>
          <div className="space-y-3">
            {activeMembers.map((m, i) => (
              <div key={m._id || m.id || i} className="flex items-center gap-2.5">
                <Avatar member={m} size={7} showOnline />
                <div>
                  <p className="text-xs font-medium text-white">
                    {(m.fullName || m.name || "User").split(" ")[0]}
                  </p>
                  <p className="text-xs" style={{ color: m.online ? "#4ade80" : "#374151" }}>
                    {m.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscussionTab;