import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../widgets/Logo";

const S = {
  page: { display: "flex", height: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "'Inter',sans-serif", overflow: "hidden" },
  sidebar: { width: 330, borderRight: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", flexShrink: 0 },
  sidebarHeader: { padding: "20px 16px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: 10 },
  logoBox: { width: 34, height: 34, borderRadius: 10, background: "var(--logo-bg-gradient)", border: "1px solid var(--logo-ring-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  brandName: { fontSize: 14, fontWeight: 700, letterSpacing: -0.3, background: "var(--brand-name-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  brandTag: { fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(99,102,241,0.8)", letterSpacing: 0.5 },
  sidebarBody: { flex: 1, overflowY: "auto", padding: 12 },
  sectionLabel: { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 8px 6px" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" },
  topbar: { height: 58, borderBottom: "1px solid var(--border-primary)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", flexShrink: 0 },
  workspace: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  chatMessages: { flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 },
  chatInput: { padding: "16px 20px", borderTop: "1px solid var(--border-primary)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(10px)" },
  rightPanel: { width: 296, borderLeft: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", flexShrink: 0, overflowY: "auto" },
  rightPanelHeader: { padding: "16px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  card: { background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))", border: "1px solid var(--border-primary)", borderRadius: 16, padding: 16 },
};

const MOCK_REPOS = [
  { id: "facebook-react", name: "facebook/react" },
  { id: "vercel-next.js", name: "vercel/next.js" },
  { id: "tailwindlabs-tailwindcss", name: "tailwindlabs/tailwindcss" },
];

const MOCK_CHUNKS = [
  { filePath: "src/components/Navbar.jsx", score: 0.942, type: "Component", code: `export default function Navbar() {\n  const [scrolled, setScrolled] = useState(false);\n  useEffect(() => {\n    const onScroll = () => setScrolled(window.scrollY > 20);\n    window.addEventListener("scroll", onScroll);\n    return () => window.removeEventListener("scroll", onScroll);\n  }, []);\n  return <nav className="navbar">...</nav>;\n}` },
  { filePath: "src/App.jsx", score: 0.887, type: "Routing", code: `function App() {\n  return (\n    <>\n      <Navbar />\n      <Routes>\n        <Route path="/" element={<HomePage />} />\n        <Route path="/dashboard" element={<DashboardPage />} />\n        <Route path="/chat/:repoId" element={<ChatPage />} />\n      </Routes>\n    </>\n  );\n}` },
];

function IconBtn({ icon, active, onClick, title }) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 10,
      border: `1px solid ${active ? "rgba(99,102,241,0.35)" : "var(--border-primary)"}`,
      background: active ? "rgba(99,102,241,0.12)" : "var(--icon-btn-bg)",
      color: active ? "#818cf8" : "var(--text-secondary)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      transition: "all 0.2s ease",
    }}>
      <i className={`ti ti-${icon}`} />
    </button>
  );
}

function RepoBtn({ repo, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 10,
      background: active ? "rgba(99,102,241,0.1)" : "transparent",
      border: `1px solid ${active ? "rgba(99,102,241,0.25)" : "transparent"}`,
      color: active ? "var(--text-primary)" : "var(--text-secondary)",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13,
      transition: "all 0.2s ease", fontFamily: "'Inter',sans-serif",
    }}>
      <i className="ti ti-brand-github" style={{ fontSize: 16, flexShrink: 0, color: active ? "#818cf8" : undefined }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{repo.name}</span>
    </button>
  );
}

function ModeToggle({ mode, setMode }) {
  return (
    <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: 3 }}>
      {[["chat", "message", "Chat"], ["search", "search", "Search"]].map(([val, icon, label]) => (
        <button key={val} onClick={() => setMode(val)} style={{
          padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600,
          background: mode === val ? "var(--btn-primary-bg)" : "transparent",
          border: mode === val ? "1px solid var(--btn-primary-border)" : "1px solid transparent",
          color: mode === val ? "var(--btn-primary-color)" : "var(--text-secondary)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.25s ease", fontFamily: "'Inter',sans-serif",
        }}>
          <i className={`ti ti-${icon}`} style={{ fontSize: 13 }} />
          {label}
        </button>
      ))}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-primary)", margin: "12px 0", background: "rgba(0,0,0,0.5)" }}>
      <div style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-primary)", padding: "6px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--text-secondary)" }}>{lang || "code"}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ background: "none", border: "none", color: copied ? "#34d399" : "var(--text-secondary)", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif" }}>
          <i className={`ti ti-${copied ? "check" : "copy"}`} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "14px 16px", overflowX: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#a5b4fc", lineHeight: 1.6 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ msg, accordionOpen, setAccordionOpen }) {
  const isUser = msg.sender === "user";
  const parts = msg.text ? msg.text.split(/(```[\s\S]*?```)/g) : [];

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "80%", borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
        padding: "14px 18px",
        background: isUser ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(6,182,212,0.15))" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isUser ? "rgba(99,102,241,0.3)" : "var(--border-primary)"}`,
        boxShadow: isUser ? "0 4px 20px rgba(99,102,241,0.15)" : "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-primary)" }}>
          {parts.map((part, i) => {
            if (part.startsWith("```")) {
              const lines = part.replace(/^```/, "").replace(/```$/, "").split("\n");
              const lang = lines[0];
              const code = lines.slice(1).join("\n");
              return <CodeBlock key={i} code={code} lang={lang} />;
            }
            return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
          })}
        </div>

        {!isUser && msg.sources?.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-primary)" }}>
            <button onClick={() => setAccordionOpen(!accordionOpen)} style={{
              background: "none", border: "none", cursor: "pointer", width: "100%",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              color: "#818cf8", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif",
            }}>
              <span><i className="ti ti-file-text" style={{ marginRight: 6 }} />Retrieved {msg.sources.length} context chunks</span>
              <i className={`ti ti-chevron-${accordionOpen ? "up" : "down"}`} />
            </button>
            {accordionOpen && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {msg.sources.map((src, j) => (
                  <div key={j} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#a5b4fc" }}>{src.filePath}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>{(src.score * 100).toFixed(1)}%</span>
                    </div>
                    <pre style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono',monospace", overflowX: "auto", maxHeight: 80 }}>{src.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResults({ results, expanded, setExpanded }) {
  if (!results.length) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", gap: 12 }}>
      <i className="ti ti-code-circle" style={{ fontSize: 48 }} />
      <p style={{ fontSize: 14 }}>Type a concept above to semantically search the codebase</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {results.map((r, idx) => (
        <div key={idx} style={{ ...S.card, transition: "border-color 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: expanded === idx ? 14 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-file-code" style={{ fontSize: 16, color: "#818cf8" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{r.filePath}</div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{r.type}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>{(r.score * 100).toFixed(1)}% match</span>
              <button onClick={() => setExpanded(expanded === idx ? null : idx)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 18 }}>
                <i className={`ti ti-chevron-${expanded === idx ? "up" : "down"}`} />
              </button>
            </div>
          </div>
          {expanded === idx && <CodeBlock code={r.code} lang="javascript" />}
        </div>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("chat");
  const [rightOpen, setRightOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ sender: "ai", text: `Hello! I've indexed \`${repoId}\`. Ask me anything about the repo's structure, dependencies, or specific functions.`, sources: [] }]);
  const [typing, setTyping] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [expandedResult, setExpandedResult] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!window.visualViewport) return;
    const handleViewportChange = () => {
      const diff = window.innerHeight - window.visualViewport.height;
      document.documentElement.style.setProperty('--keyboard-height', `${diff > 0 ? diff : 0}px`);
      if (window.scrollY > 0) window.scrollTo(0, 0);
      if (endRef.current && endRef.current.parentElement) {
        endRef.current.parentElement.scrollTop = endRef.current.parentElement.scrollHeight;
      }
    };
    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    handleViewportChange();
    return () => {
      window.visualViewport.removeEventListener("resize", handleViewportChange);
      window.visualViewport.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (endRef.current && endRef.current.parentElement) {
      endRef.current.parentElement.scrollTo({ top: endRef.current.parentElement.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typing]);

  const sendChat = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setQuery("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: `Based on the indexed codebase, here's what I found:\n\nThe scroll behavior is managed via a \`useEffect\` hook:\n\`\`\`javascript\nuseEffect(() => {\n  const onScroll = () => setScrolled(window.scrollY > 20);\n  window.addEventListener("scroll", onScroll);\n  return () => window.removeEventListener("scroll", onScroll);\n}, []);\n\`\`\`\n\nThis pattern is clean and idiomatic React.`,
        sources: MOCK_CHUNKS,
      }]);
    }, 1600);
  };

  const runSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchResults(MOCK_CHUNKS);
    setQuery("");
  };

  const repoDisplay = repoId ? repoId.replace(/-([^-]+)$/, "/$1") : "Repository";

  return (
    <div className="chat-layout" style={S.page}>
      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar" style={{ display: "none", padding: "12px 12x`x`px", borderBottom: "1px solid var(--border-primary)", alignItems: "center", justifyContent: "space-between" ,gap: 16, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", zIndex: 40 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer", display: "flex" }}>
            <i className="ti ti-menu-2" />
          </button>
          <Logo />
          <div style={{ fontSize: 14, fontWeight: 700, background: "var(--brand-name-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Synapse</div>
        </div>

        <ModeToggle mode={mode} setMode={(m) => { setMode(m); setQuery(""); }} />
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 45 }}
        />
      )}

      {/* ── RIGHT OVERLAY ── */}
      {rightOpen && (
        <div
          className="mobile-overlay right-overlay"
          onClick={() => setRightOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 45, display: "none" }}
        />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside className={`chat-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={S.sidebar}>
        <div className="chat-sidebar-header" style={{ ...S.sidebarHeader, cursor: "pointer" }} onClick={() => navigate("/")}>
          <Logo />
          <div>
            <div style={S.brandName}>Synapse</div>
            {/* <div style={S.brandTag}>Code · Intelligence</div> */}
          </div>
          <button
            className="mobile-close-btn"
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer", display: "none" }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="chat-sidebar-content" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="chat-sidebar-newbtn" style={{ padding: "12px 12px 6px" }}>
            <button onClick={() => navigate("/dashboard")} style={{
              width: "100%", padding: "9px 0", borderRadius: 10, background: "var(--btn-secondary-bg)",
              border: "1px solid var(--border-primary)", color: "var(--text-secondary)", fontSize: 12,
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s ease", fontFamily: "'Inter',sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--btn-secondary-hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--btn-secondary-bg)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <i className="ti ti-plus" style={{ fontSize: 13 }} /> Index New Repo
            </button>
          </div>

          <div className="chat-sidebar-body" style={S.sidebarBody}>
            <div style={S.sectionLabel}>Indexed Repositories</div>
            {MOCK_REPOS.map(repo => (
              <RepoBtn key={repo.id} repo={repo} active={repoId === repo.id} onClick={() => navigate(`/chat/${repo.id}`)} />
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <main style={S.main}>
        {/* Topbar */}
        <header className="chat-topbar" style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <i className="ti ti-binary" style={{ fontSize: 20, color: "#818cf8" }} />
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>{repoDisplay}</span>
            {/* <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 10px", borderRadius: 20, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", fontSize: 10, color: "#34d399", fontFamily: "'JetBrains Mono',monospace" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
              Index active
            </span> */}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="hidden md:block">
              <ModeToggle mode={mode} setMode={(m) => { setMode(m); setQuery(""); }} />
            </div>
            <div className="context-panel-toggle">
              <IconBtn icon="layout-sidebar-right" active={rightOpen} onClick={() => setRightOpen(!rightOpen)} title="Context panel" />
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div style={S.workspace}>
          {mode === "chat" ? (
            <>
              <div className="chat-messages" style={S.chatMessages}>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} accordionOpen={accordionOpen} setAccordionOpen={setAccordionOpen} />
                ))}
                {typing && (
                  <div style={{ display: "flex" }}>
                    <div style={{
                      position: "relative", overflow: "hidden",
                      padding: "18px 22px",
                      borderRadius: "20px 20px 20px 4px",
                      background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.04) 100%)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      boxShadow: "0 4px 24px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                      display: "flex", flexDirection: "column", gap: 12, minWidth: 180,
                    }}>
                      {/* Glowing top edge */}
                      <div style={{
                        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                        width: "60%", height: 1,
                        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(6,182,212,0.6), transparent)",
                        borderRadius: 1,
                      }} />

                      {/* Label row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%", background: "#818cf8",
                          boxShadow: "0 0 8px #818cf8",
                          animation: "pulse 1.5s ease-in-out infinite",
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11, color: "rgba(165,180,252,0.8)", letterSpacing: 0.5,
                        }}>AI is thinking…</span>
                      </div>

                      {/* Waveform bar dots */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 28 }}>
                        {[
                          { delay: "0s", peakH: 26, color: "#818cf8" },
                          { delay: "0.1s", peakH: 18, color: "#a78bfa" },
                          { delay: "0.2s", peakH: 22, color: "#22d3ee" },
                          { delay: "0.3s", peakH: 14, color: "#67e8f9" },
                          { delay: "0.4s", peakH: 20, color: "#818cf8" },
                          { delay: "0.5s", peakH: 10, color: "#a78bfa" },
                          { delay: "0.6s", peakH: 24, color: "#22d3ee" },
                        ].map((bar, i) => (
                          <div key={i} style={{
                            width: 4, borderRadius: 3,
                            background: `linear-gradient(to top, ${bar.color}40, ${bar.color})`,
                            boxShadow: `0 0 6px ${bar.color}60`,
                            animation: `wave ${0.9 + (i % 3) * 0.15}s ease-in-out ${bar.delay} infinite`,
                            "--peak": `${bar.peakH}px`,
                            height: 6,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div className="chat-input-wrap" style={{ ...S.chatInput, marginBottom: "var(--keyboard-height, 0px)" }}>
                <form onSubmit={sendChat} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Ask about any function, file, or concept in this repo..."
                    style={{
                      flex: 1, padding: "13px 52px 13px 18px", borderRadius: 16,
                      border: "1px solid var(--border-primary)", background: "rgba(255,255,255,0.04)",
                      color: "var(--text-primary)", fontSize: 14, outline: "none",
                      fontFamily: "'Inter',sans-serif", transition: "border-color 0.3s ease",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
                  />
                  <button type="submit" onPointerDown={(e) => e.preventDefault()} style={{
                    position: "absolute", right: 6, width: 38, height: 38, borderRadius: 12,
                    background: "linear-gradient(135deg,#818cf8,#22d3ee)",
                    border: "none", color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    transition: "opacity 0.2s ease",
                  }}>
                    <i className="ti ti-arrow-up" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16, paddingBottom: "calc(24px + var(--keyboard-height, 0px))" }}>
              <form onSubmit={runSearch} style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <i className="ti ti-search" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontSize: 16, pointerEvents: "none" }} />
                  <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by intent: 'how does routing work?', 'authentication logic'..."
                    style={{
                      width: "100%", padding: "13px 16px 13px 44px", borderRadius: 14,
                      border: "1px solid var(--border-primary)", background: "rgba(255,255,255,0.04)",
                      color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "'Inter',sans-serif",
                      boxSizing: "border-box", transition: "border-color 0.3s",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
                  />
                </div>
                <button type="submit" style={{
                  padding: "0 22px", borderRadius: 14, background: "var(--btn-primary-bg)",
                  border: "1px solid var(--btn-primary-border)", color: "var(--btn-primary-color)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "'Inter',sans-serif", boxShadow: "var(--btn-primary-shadow)",
                }}>
                  Search Code
                </button>
              </form>
              <SearchResults results={searchResults} expanded={expandedResult} setExpanded={setExpandedResult} />
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT PANEL ── */}
      <aside className={`chat-right-panel ${rightOpen ? 'open' : ''}`} style={{ ...S.rightPanel, display: "flex", flexDirection: "column" }}>
        <div style={S.rightPanelHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1 }}>Context Explorer</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>FAISS</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setRightOpen(false)}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer", display: "none" }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Index metrics */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 14 }}>Index Metrics</div>
            {[["Total AST Nodes", "14,230", "var(--text-primary)"], ["Indexed Chunks", "1,248", "var(--text-primary)"], ["Model", "all-MiniLM-L6-v2", "#818cf8"], ["Dimensions", "384", "#22d3ee"]].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-primary)" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{k}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Similarity spectrum */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 14 }}>Similarity Spectrum</div>
            {[["Navbar.jsx", "94.2%", "#34d399", 94.2], ["App.jsx", "88.7%", "#22d3ee", 88.7], ["main.jsx", "62.1%", "#818cf8", 62.1]].map(([file, pct, color, width]) => (
              <div key={file} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-secondary)" }}>{file}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color }}>{pct}</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: color, width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes wave  { 0%,100%{height:4px; opacity:0.5} 50%{height:var(--peak,20px); opacity:1} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:4px; }

        @media (min-width: 769px) {
          .chat-right-panel:not(.open) { display: none !important; }
        }
        @media (max-width: 768px) {
          .chat-layout { flex-direction:column !important; height:100vh !important; }
          .mobile-topbar { display: flex !important; }
          .chat-sidebar { 
            position: fixed !important; 
            top: 0; bottom: 0; left: 0; 
            z-index: 50;
            width: 330px !important;
            transform: translateX(-100%) !important;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background: rgba(10,10,15,0.98) !important;
          }
          .chat-sidebar.open { transform: translateX(0) !important; }
          
          .chat-right-panel {
            position: fixed !important;
            top: 0; bottom: 0; right: 0;
            z-index: 50;
            width: 300px !important;
            transform: translateX(100%) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background: rgba(10,10,15,0.98) !important;
          }
          .chat-right-panel.open { transform: translateX(0) !important; }
          .right-overlay { display: block !important; }

          .mobile-close-btn { display:block !important; }
          .chat-sidebar-header { border-bottom:1px solid var(--border-primary) !important; padding:13px 20px !important; }
          
          .chat-topbar { padding:10px 16px !important; height:50px !important; flex-direction:row !important; align-items:center !important; justify-content:space-between !important; gap:10px !important; }
          .chat-messages { padding:16px 12px !important; }
          .chat-input-wrap { padding:10px 12px !important; }
        }
      `}</style>
    </div>
  );
}
