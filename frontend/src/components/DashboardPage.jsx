import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../widgets/Logo";
import { uploadRepository, fetchRepositories } from "../api/repo.api.js";


const INDEXING_STEPS = [
  { label: "Cloning repository...", icon: "ti-git-fork", color: "#818cf8" },
  { label: "Parsing AST & Chunking code...", icon: "ti-scissors", color: "#a78bfa" },
  { label: "Generating embeddings...", icon: "ti-brain", color: "#22d3ee" },
  { label: "Building FAISS vector index...", icon: "ti-vector-triangle", color: "#34d399" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | indexing | success
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  const [newRepoId, setNewRepoId] = useState(null);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const data = await fetchRepositories();
        setRepos(data.map(repo => ({
          id: repo.repo_id,
          name: repo.repo_name,
          files: repo.total_files,
          chunks: repo.total_chunks,
        })));
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
      }
    };
    loadRepos();
  }, []);

  const handleIndexRepo = async (e) => {
    e.preventDefault();

    if (!repoUrl.trim()) return;

    try {
      setStatus("indexing");
      setCurrentStep(0);
      setApiData(null);

      const res = await uploadRepository(repoUrl);
      setApiData(res);

    } catch (error) {
      console.error(error);
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (status !== "indexing") return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < INDEXING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "indexing" && apiData && currentStep === INDEXING_STEPS.length - 1) {
      const repo_id = apiData.repository.repo_id;
      const repo_name = apiData.repository.repo_name;
      const total_files = apiData.indexing.total_files;
      const total_chunks = apiData.indexing.total_chunks;

      setNewRepoId(repo_id);

      setRepos(prev => {
        if (prev.some(repo => repo.id === repo_id)) return prev;
        return [
          {
            id: repo_id,
            name: repo_name,
            files: total_files,
            chunks: total_chunks,
          },
          ...prev,
        ];
      });

      const timer = setTimeout(() => {
        setStatus("success");
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [status, apiData, currentStep]);

  const progressPct = status === "indexing"
    ? Math.max(8, ((currentStep + 1) / INDEXING_STEPS.length) * 100)
    : status === "success" ? 100 : 0;

  const repoSlug = repoUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\//g, "-")
    .toLowerCase() || "my-repo";

  return (
    <div className="dashboard-layout" style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar" style={{ display: "none", padding: "16px 20px", borderBottom: "1px solid var(--border-primary)", alignItems: "center", gap: 16, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", zIndex: 40 }}>
        <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer", display: "flex" }}>
          <i className="ti ti-menu-2" />

        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>


          {/* Logo */}
          <Logo />

          <div className="flex-col">
            <div style={{ fontSize: 14, fontWeight: 700, background: "var(--brand-name-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Synapse</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, color: "rgba(99,102,241,0.8)", letterSpacing: 0.5,
            }}>Dashboard</div>
          </div>
        </div>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 45 }}
        />
      )}

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
        width: 330,
        borderRight: "1px solid var(--border-primary)",
        display: "flex",
        flexDirection: "column",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        flexShrink: 0,
      }}>
        {/* Brand header */}
        <div style={{
          padding: "15px 20px",
          borderBottom: "1px solid var(--border-primary)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }} onClick={() => navigate("/")}>
          <Logo />
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700, letterSpacing: -0.3,
              background: "var(--brand-name-gradient)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Synapse</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, color: "rgba(99,102,241,0.8)", letterSpacing: 0.5,
            }}>Dashboard</div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer", display: "none" }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="dashboard-sidebar-content" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* New repo button */}
          {/* <div style={{ padding: "16px 16px 0" }}>
            <button
              onClick={() => { setStatus("idle"); setRepoUrl(""); }}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 12,
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.25s ease",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--btn-secondary-hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--btn-secondary-bg)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <i className="ti ti-plus" style={{ fontSize: 14 }} />
              Index New Repository
            </button>
          </div> */}

          {/* Repos list */}
          <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)",
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 4,
            }}>
              Indexed Repositories
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => navigate(`/chat/${repo.id}`)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 12,
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.2s ease",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <i className="ti ti-brand-github" style={{ fontSize: 18, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{repo.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                      {repo.files} files • {repo.chunks} chunks
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="dashboard-main" style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow orbs */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.12), transparent 60%)",
          top: "10%", left: "-10%", filter: "blur(100px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle at 70% 60%, rgba(6,182,212,0.08), transparent 60%)",
          bottom: "5%", right: "-5%", filter: "blur(100px)", pointerEvents: "none",
        }} />

        {/* Card container */}
        <div className="dashboard-card" style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 620,
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
          border: "1px solid var(--border-primary)",
          borderRadius: 24, padding: "48px 40px",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>

          {/* ── IDLE STATE ── */}
          {status === "idle" && (
            <>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px",
                boxShadow: "0 0 30px rgba(99,102,241,0.15)",
              }}>
                <i className="ti ti-git-fork" style={{ fontSize: 28, color: "#818cf8" }} />
              </div>

              <h1 className="hero-headline" style={{
                fontSize: 30, fontWeight: 800, textAlign: "center",
                letterSpacing: -1, lineHeight: 1.15, marginBottom: 10,
                background: "var(--hero-headline-gradient)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Index a new repository</h1>

              <p style={{
                textAlign: "center", color: "var(--text-secondary)",
                fontSize: 14, lineHeight: 1.6, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px",
              }}>
                Paste a public GitHub URL to clone, chunk, and embed the codebase for semantic search.
              </p>

              <form onSubmit={handleIndexRepo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <i className="ti ti-link" style={{
                    position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-tertiary)", fontSize: 16, pointerEvents: "none",
                  }} />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    style={{
                      width: "100%", padding: "14px 16px 14px 44px",
                      borderRadius: 14, border: "1px solid var(--border-primary)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--text-primary)", fontSize: 14,
                      outline: "none", transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      fontFamily: "'Inter', sans-serif",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(99,102,241,0.5)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "var(--border-primary)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button type="submit" style={{
                  width: "100%", padding: "14px 0", borderRadius: 14,
                  background: "var(--btn-primary-bg)",
                  border: "1px solid var(--btn-primary-border)",
                  color: "var(--btn-primary-color)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "var(--btn-primary-shadow)",
                  transition: "all 0.25s ease",
                  fontFamily: "'Inter', sans-serif",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--btn-primary-shadow-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--btn-primary-shadow)"; e.currentTarget.style.transform = "none"; }}
                >
                  <i className="ti ti-bolt" style={{ fontSize: 16 }} />
                  Start Indexing
                </button>
              </form>
            </>
          )}

          {/* ── INDEXING STATE ── */}
          {status === "indexing" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0" }}>
              {/* Spinner */}
              <div style={{ position: "relative", width: 80, height: 80, marginBottom: 32 }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "2px solid transparent", borderTopColor: "#818cf8",
                  animation: "spin 1s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 6, borderRadius: "50%",
                  border: "2px solid transparent", borderRightColor: "#22d3ee",
                  animation: "spin 1.5s linear infinite reverse",
                }} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="ti ti-cpu" style={{ fontSize: 26, color: "#818cf8", animation: "pulse 2s ease-in-out infinite" }} />
                </div>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: -0.5, textAlign: "center" }}>
                Processing Repository
              </h2>

              {/* Steps */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                {INDEXING_STEPS.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDone ? "rgba(52,211,153,0.1)" : isActive ? `${step.color}15` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isDone ? "rgba(52,211,153,0.3)" : isActive ? step.color + "40" : "var(--border-primary)"}`,
                        boxShadow: isActive ? `0 0 16px ${step.color}25` : "none",
                        transition: "all 0.4s ease",
                      }}>
                        {isDone ? (
                          <i className="ti ti-check" style={{ fontSize: 14, color: "#34d399" }} />
                        ) : isActive ? (
                          <i className={`ti ${step.icon}`} style={{ fontSize: 14, color: step.color, animation: "pulse 1.5s ease-in-out infinite" }} />
                        ) : (
                          <i className={`ti ${step.icon}`} style={{ fontSize: 14, color: "var(--text-tertiary)" }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        color: isDone ? "var(--text-secondary)" : isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                        transition: "all 0.3s ease",
                      }}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div style={{
                width: "100%", height: 4, borderRadius: 4, marginTop: 28,
                background: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: "linear-gradient(90deg, #818cf8, #22d3ee)",
                  width: `${progressPct}%`,
                  transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              </div>
            </div>
          )}

          {/* ── SUCCESS STATE ── */}
          {status === "success" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
                boxShadow: "0 0 40px rgba(52,211,153,0.15)",
              }}>
                <i className="ti ti-check" style={{ fontSize: 32, color: "#34d399" }} />
              </div>

              <h2 style={{
                fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5,
                background: "var(--hero-headline-gradient)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Ready to explore</h2>

              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 28, textAlign: "center" }}>
                Successfully indexed <strong style={{ WebkitTextFillColor: "var(--text-primary)", color: "var(--text-primary)" }}>{repoUrl.split("/").slice(-2).join("/")}</strong>
              </p>

              <button onClick={() => navigate(`/chat/${newRepoId}`)} style={{
                padding: "14px 40px", borderRadius: 14,
                background: "var(--btn-launch-bg)",
                border: "1px solid var(--btn-launch-border)",
                color: "var(--btn-launch-color)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "var(--btn-launch-shadow)",
                transition: "all 0.25s ease",
                fontFamily: "'Inter', sans-serif",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(99,102,241,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--btn-launch-shadow)"; }}
              >
                Open Repository
                <i className="ti ti-arrow-right" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Keyframe injection */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 768px) {
          .dashboard-layout { flex-direction: column !important; }
          .mobile-topbar { display: flex !important; }
          .dashboard-sidebar { 
            position: fixed !important; 
            top: 0; bottom: 0; left: 0; 
            z-index: 50;
            transform: translateX(-100%) !important;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background: rgba(10,10,15,0.98) !important;
          }
          .dashboard-sidebar.open { transform: translateX(0) !important; }
          .mobile-close-btn { display: block !important; }
          .dashboard-main { padding: 24px 16px !important; }
          .dashboard-card { padding: 32px 20px !important; border-radius: 16px !important; }
          .hero-headline { font-size: 24px !important; }
        }
      `}</style>
    </div>
  );
}
