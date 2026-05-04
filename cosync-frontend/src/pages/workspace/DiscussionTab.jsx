import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../../lib/api";

const EMOJI_OPTIONS = ["👍", "🔥", "🎉", "👀", "💡", "✓", "⚡", "🚀"];

const Avatar = ({ member, size = 8, showOnline = false }) => {
  const name = member?.name || member?.fullName || "User";
  const avatarBg = member?.avatar || "#a78bfa";
  
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold`}
        style={{ background: avatarBg + "25", color: avatarBg, border: `1.5px solid ${avatarBg}40`, width: size * 4, height: size * 4, fontSize: size < 8 ? 10 : 12 }}
      >
        {name[0].toUpperCase()}
      </div>
      {showOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: member?.online ? "#4ade80" : "#374151", borderColor: "#05030f" }} />
      )}
    </div>
  );
};

const MessageItem = ({ msg, me, membersMap }) => {
  const author = msg.sender || {};
  const isMe = author._id === me._id;
  const authorData = membersMap[author._id] || { ...author, color: "#a78bfa" };

  // Parse time
  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 group ${isMe ? "flex-row-reverse" : ""}`}>
      <Avatar member={authorData} size={8} />

      <div className={`flex-1 max-w-lg ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {/* Author + time */}
        <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-semibold" style={{ color: authorData.color || "#a78bfa" }}>
            {authorData.name || authorData.fullName || "User"}
          </span>
          <span className="text-xs" style={{ color: "#374151" }}>{timeStr}</span>
        </div>

        {/* Bubble */}
        <div className="relative">
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: isMe ? "rgba(124,58,237,0.2)" : "rgba(15,10,40,0.85)",
              border: `1px solid ${isMe ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.12)"}`,
              color: "#e5e7eb",
              borderTopRightRadius: isMe ? 4 : 16,
              borderTopLeftRadius: isMe ? 16 : 4,
            }}>
            {msg.content}
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscussionTab = ({ workspace }) => {
  const { user } = useSelector(s => s.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const projectId = workspace?._id || workspace?.id;

  // Build members map for quick access
  const membersMap = {};
  if (workspace?.members) {
    workspace.members.forEach(m => {
      membersMap[m._id || m.id] = m;
    });
  }
  if (workspace?.owner) {
    membersMap[workspace.owner._id || workspace.owner.id] = workspace.owner;
  }

  // Socket setup and data fetching
  useEffect(() => {
    if (!projectId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${projectId}`);
        setMessages(res.data.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Init socket
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true
    });
    
    setSocket(newSocket);

    newSocket.emit('join_project', projectId);

    newSocket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.emit('leave_project', projectId);
      newSocket.disconnect();
    };
  }, [projectId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !projectId) return;

    setInput(""); // Clear immediately for UX
    
    try {
      await api.post(`/messages/${projectId}`, { content: text });
      // The message will be appended via socket event 'new_message'
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const activeMembers = workspace?.members || [];

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .chat-scroll::-webkit-scrollbar { width:3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.2); border-radius:2px; }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Messages area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Team Discussion</h2>
                <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>
                  {messages.length} messages · {activeMembers.length} members
                </p>
              </div>
              <div className="flex -space-x-2">
                {activeMembers.slice(0, 5).map(m => (
                  <div key={m._id || m.id} title={m.name || m.fullName}>
                    <Avatar member={m} size={7} showOnline={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 chat-scroll">
            {loading ? (
              <p className="text-center text-secondary text-sm">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-secondary text-sm">No messages yet. Start the conversation!</p>
            ) : (
              messages.map(msg => (
                <div key={msg._id} style={{ animation: "slideUp 0.3s ease both" }}>
                  <MessageItem msg={msg} me={user} membersMap={membersMap} />
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-6 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
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
                    background: "rgba(15,10,40,0.85)",
                    border: `1px solid ${inputFocused ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.15)"}`,
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    boxShadow: inputFocused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
                    fontFamily: "inherit",
                  }}
                />
                <button onClick={send}
                  disabled={!input.trim()}
                  className="absolute right-3 bottom-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(139,92,246,0.08)",
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

        {/* ── Right sidebar — online members ── */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 p-4"
          style={{ borderLeft: "1px solid rgba(139,92,246,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#374151" }}>Members</p>
          <div className="space-y-3">
            {activeMembers.map(m => (
              <div key={m._id || m.id} className="flex items-center gap-2.5">
                <Avatar member={m} size={7} showOnline={true} />
                <div>
                  <p className="text-xs font-medium text-white">{(m.name || m.fullName || "User").split(" ")[0]}</p>
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