import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


/* ─────────────────────────────────────────────
   FEATURES DATA
───────────────────────────────────────────── */
const FEATURES = [
  { icon: "ti-search", title: "Semantic Code Search", desc: "Find code by intent, not keywords. Natural language queries across your entire codebase.", color: "#818cf8" },
  { icon: "ti-message-chatbot", title: "Repository Chat", desc: "Ask anything about your repo. Get precise, context-aware answers backed by your actual code.", color: "#22d3ee" },
  { icon: "ti-topology-star-3", title: "AI Architecture Analysis", desc: "Visualize system design, layers, and coupling automatically from source.", color: "#a78bfa" },
  { icon: "ti-function", title: "Function Explanations", desc: "Deep-dive any function with plain-English breakdowns, complexity analysis, and usage examples.", color: "#34d399" },
  { icon: "ti-vector-triangle", title: "Vector Search", desc: "FAISS-powered similarity search across embeddings for lightning-fast semantic retrieval.", color: "#f472b6" },
  { icon: "ti-sitemap", title: "Dependency Mapping", desc: "Auto-generated import graphs reveal hidden coupling and circular dependencies.", color: "#fbbf24" },
  { icon: "ti-git-pull-request", title: "PR Review Assistant", desc: "Context-aware code review that understands what changed and why it matters.", color: "#60a5fa" },
  { icon: "ti-bug", title: "Bug Detection", desc: "Proactive anomaly detection using semantic similarity to known bug patterns.", color: "#f87171" },
  { icon: "ti-world", title: "Multi-Repo Intelligence", desc: "Unified semantic index across multiple repos — search and reason at org scale.", color: "#38bdf8" },
];

/* ─────────────────────────────────────────────
   FEATURE CARD  (angled drift + hover tilt)
───────────────────────────────────────────── */
function FeatureCard({ feat, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const row = Math.floor(index / 3);
  const col = index % 3;
  /* stagger drift: each card gets a unique floating animation offset */
  const driftDuration = 5 + (index % 3) * 1.2;
  const driftDelay = -(index * 0.8);
  const driftAmp = 6 + (index % 2) * 4;

  const handleMouseMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
    setTilt({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        position: "relative",
        borderRadius: 20,
        padding: "28px 24px",
        background: hovered
          ? `linear-gradient(135deg, rgba(${hexToRgb(feat.color)},0.12) 0%, var(--border-primary) 100%)`
          : "var(--card-bg)",
        border: `1px solid ${hovered ? feat.color + "55" : "var(--border-primary)"}`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: hovered
          ? `0 0 40px ${feat.color}30, 0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)`
          : "0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.06)",
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px) scale(1.02)`
          : `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)`,
        transition: hovered
          ? "transform 0.08s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease"
          : "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease",
        cursor: "default",
        animation: `cardDrift${index % 3} ${driftDuration}s ease-in-out ${driftDelay}s infinite`,
        willChange: "transform",
      }}
    >
      {/* Glow pip */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: hovered ? 120 : 60, height: 1,
        background: `linear-gradient(90deg, transparent, ${feat.color}, transparent)`,
        transition: "width 0.4s ease",
        borderRadius: 1,
      }} />

      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: `linear-gradient(135deg, ${feat.color}25, ${feat.color}10)`,
        border: `1px solid ${feat.color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
        boxShadow: hovered ? `0 0 16px ${feat.color}50` : "none",
        transition: "box-shadow 0.3s ease",
      }}>
        <i className={`ti ${feat.icon}`} style={{ fontSize: 22, color: feat.color }} aria-hidden="true" />
      </div>

      <h3 style={{
        fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
        marginBottom: 8, letterSpacing: "-0.3px", lineHeight: 1.3,
        fontFamily: "Inter, sans-serif",
      }}>{feat.title}</h3>

      <p style={{
        fontSize: 13, color: "var(--text-secondary)",
        lineHeight: 1.65, margin: 0, fontFamily: "Inter, sans-serif",
      }}>{feat.desc}</p>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ─────────────────────────────────────────────
   HOW IT WORKS  (interactive pipeline)
───────────────────────────────────────────── */
const PIPELINE = [
  { icon: "ti-brand-github", label: "GitHub Repository", color: "#818cf8", detail: "Connect any public or private GitHub repository. We clone and index it securely — no code ever leaves your infrastructure unless you choose cloud mode.", tech: "Git clone · Webhooks · OAuth" },
  { icon: "ti-scissors", label: "Semantic Chunking", color: "#a78bfa", detail: "Tree-sitter parses your code into an AST. We chunk intelligently by function, class, and module boundaries — preserving semantic units, not arbitrary line counts.", tech: "Tree-sitter · AST parsing" },
  { icon: "ti-brain", label: "Embeddings", color: "#22d3ee", detail: "Sentence Transformers encode each chunk into a high-dimensional vector capturing semantic meaning — not just tokens, but intent and behavior.", tech: "Sentence Transformers · all-MiniLM-L6-v2" },
  { icon: "ti-vector-triangle", label: "Vector Search", color: "#34d399", detail: "FAISS performs approximate nearest-neighbor search across millions of vectors in milliseconds, returning semantically similar code chunks.", tech: "FAISS · IVF index · cosine similarity" },
  { icon: "ti-cpu", label: "AI Retrieval", color: "#f472b6", detail: "Retrieved chunks are assembled into a context window and passed to the LLM alongside your query. RAG ensures responses are grounded in your actual code.", tech: "Ollama · LLaMA 3 · RAG pipeline" },
  { icon: "ti-sparkles", label: "Intelligent Answer", color: "#fbbf24", detail: "The model returns a precise, code-aware answer with file references, line numbers, and explanations. Every answer cites real code from your repository.", tech: "FastAPI · Streaming · Citations" },
];

/* ─────────────────────────────────────────────
   TECH STACK
───────────────────────────────────────────── */
const TECH = [
  { name: "React", icon: "ti-brand-react", color: "#61dafb", sub: "Frontend UI" },
  { name: "FastAPI", icon: "ti-bolt", color: "#009688", sub: "Backend API" },
  { name: "FAISS", icon: "ti-vector-triangle", color: "#818cf8", sub: "Vector Search" },
  { name: "Sentence Transformers", icon: "ti-brain", color: "#f472b6", sub: "Embeddings" },
  { name: "Ollama", icon: "ti-cpu", color: "#22d3ee", sub: "Local LLM" },
  { name: "Tree-sitter", icon: "ti-binary-tree", color: "#34d399", sub: "Code Parsing" },
];

/* ─────────────────────────────────────────────
   ROADMAP
───────────────────────────────────────────── */
const ROADMAP = [
  { phase: "Q1 2025", title: "Core Engine", status: "done", items: ["Semantic search", "FAISS indexing", "Ollama integration", "FastAPI backend"] },
  { phase: "Q2 2025", title: "Repository Chat", status: "done", items: ["Multi-turn conversations", "Context persistence", "File references", "Streaming responses"] },
  { phase: "Q3 2025", title: "Architecture Intel", status: "active", items: ["Dependency graphs", "Coupling analysis", "AST visualization", "PR review assistant"] },
  { phase: "Q4 2025", title: "Multi-Repo & Scale", status: "upcoming", items: ["Multi-repo indexing", "Team workspaces", "SSO & RBAC", "Cloud deployment"] },
  { phase: "Q1 2026", title: "AI Agents", status: "upcoming", items: ["Autonomous refactoring", "Bug auto-patch", "Test generation", "CI/CD integration"] },
];

/* ─────────────────────────────────────────────
   MAIN HOME PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const [activeStep, setActiveStep] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const navigate = useNavigate();

  /* Intersection observer for scroll-in animations */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [e.target.dataset.section]: true }));
        }
      });
    }, { threshold: 0.1 });
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const setRef = (key) => (el) => {
    sectionRefs.current[key] = el;
  };

  return (
    <>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}

      {/* TextHoverEffect: sits above the hero with negative margin so it
          bleeds into the hero's overflow:hidden zone — no visible seam */}

      {/* <section>
        <div
          className="absolute opacity-10 top-50 z-10 w-full h-[400px] flex items-center justify-center overflow-hidden rounded-3xl bg-black"
        >
          <TextHoverEffect text="Synapse" />
        </div>
      </section> */}


      <section className="hero section">

        {/* Ambient orbs */}
        <div
          className="bg-orb hidden md:block"
          style={{
            width: 600,
            height: 600,
            opacity: "var(--orb-opacity, 1)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,0,50,0.35), transparent 45%), radial-gradient(circle at 70% 70%, rgba(255,180,120,0.22), transparent 55%)",
            top: -50,
            left: -220,
            filter: "blur(300px)",
          }}
        />

        <div
          className="bg-orb hidden md:block"
          style={{
            width: 550,
            height: 550,
            opacity: "calc(var(--orb-opacity, 1) * 1)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%), radial-gradient(circle at 60% 40%, rgba(120,255,214,0.18), transparent 60%)",

            top: -150,
            right: -180,
            filter: "blur(200px)",
          }}
        />

        <div
          className="bg-orb"
          style={{
            width: 500,
            height: 500,
            opacity: "calc(var(--orb-opacity, 1) * 1)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(120,180,255,0.28), transparent 65%), radial-gradient(circle at 20% 80%, rgba(180,120,255,0.18), transparent 60%)",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(200px)",
          }}
        />

        {/* Floating UI cards */}
        <div className="hero-cards">
          {[
            { text: "✦ 2.4ms avg retrieval", top: "18%", left: "4%", rot: "-3deg", amp: "-10px", dur: "6s" },
            { text: "fn: getUserById() → auth/user.ts:42", top: "30%", right: "3%", rot: "2deg", amp: "-8px", dur: "7s" },
            { text: "⬡ 128-dim embedding", bottom: "32%", left: "6%", rot: "-2deg", amp: "-12px", dur: "5s" },
            { text: "AST nodes: 14,230", bottom: "28%", right: "5%", rot: "3deg", amp: "-9px", dur: "8s" },
            { text: "similarity: 0.971", top: "60%", left: "2%", rot: "-1deg", amp: "-7px", dur: "9s" },
          ].map((c, i) => (
            <div key={i} className="hero-float-card" style={{
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
              "--rot": c.rot, "--amp": c.amp,
              animationDuration: c.dur, animationDelay: `${-i * 1.3}s`,
              animationTimingFunction: "ease-in-out",
            }}>{c.text}</div>
          ))}
        </div>


        {/* Main content */}
        <div className="hero-content">
          <div className="hero-badge mt-20">
            <div className="hero-badge-dot" />
            semantic · graph · intelligence
          </div>

          <div className="hero-headline">
            The AI that understands<br />
            <span style={{ color: "transparent", background: "linear-gradient(90deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              your entire codebase
            </span>
          </div>

          <p className="hero-sub">
            Search code by meaning, chat with your repository, and get AI-powered insights across your entire codebase — powered by semantic embeddings and local LLMs.
          </p>

          <div className="hero-btns">
            <button className="btn-primary" onClick={() =>{console.log("get started clicked"); navigate('/dashboard');}}>
              <i className="ti ti-rocket" aria-hidden="true" />
              Get Started Free
            </button>
            <button className="btn-secondary">
              <i className="ti ti-player-play" aria-hidden="true" />
              Watch Demo
            </button>
          </div>

          {/* <div className="hero-stats">
                        {[["10ms", "avg search"], ["1M+", "chunks indexed"], ["99.2%", "retrieval accuracy"], ["6", "AI models"]].map(([n, l]) => (
                            <div className="stat-item" key={l}>
                                <div className="stat-num">{n}</div>
                                <div className="stat-label">{l}</div>
                            </div>
                        ))}
                    </div> */}
        </div>
      </section>




      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section
        className={`features section anim-section${visibleSections.features ? " visible" : ""}`}
        ref={setRef("features")} data-section="features"
        style={{ textAlign: "center" }}
      >
        <div className="section-label"><i className="ti ti-sparkles" aria-hidden="true" /> features</div>
        <h2 className="section-title">Everything your dev team needs</h2>
        <p className="section-sub" style={{ margin: "0 auto" }}>
          Nine powerful AI capabilities built on a semantic core — all running locally, all respecting your code's privacy.
        </p>

        <div className="features-grid">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section
        className={`hiw section anim-section${visibleSections.hiw ? " visible" : ""}`}
        ref={setRef("hiw")} data-section="hiw"
        style={{ textAlign: "center", position: "relative" }}
      >
        <div className="bg-orb" style={{ width: 500, height: 500, background: "radial-gradient(circle,var(--glow-color) 0%,transparent 70%)", top: 0, left: "50%", transform: "translateX(-50%)" }} />

        <div className="section-label"><i className="ti ti-git-branch" aria-hidden="true" /> pipeline</div>
        <h2 className="section-title">How it works</h2>
        <p className="section-sub" style={{ margin: "0 auto" }}>
          Click any step to explore the technology powering each stage of the semantic intelligence pipeline.
        </p>

        <div className="pipeline">
          {PIPELINE.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="pipe-step" onClick={() => setActiveStep(activeStep === i ? null : i)}>
                <div
                  className={`pipe-node${activeStep === i ? " active" : ""}`}
                  style={{
                    "--node-color": step.color,
                    borderColor: activeStep === i ? step.color + "80" : "var(--pipe-node-border)",
                    boxShadow: activeStep === i ? `0 0 28px ${step.color}50, inset 0 0 12px ${step.color}15` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i className={`ti ${step.icon}`} style={{ color: activeStep === i ? step.color : "var(--text-secondary)", fontSize: 28, transition: "color 0.3s ease" }} aria-hidden="true" />
                </div>
                <div className={`pipe-label${activeStep === i ? " active" : ""}`}>{step.label}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="pipe-arrow" aria-hidden="true">
                  <i className="ti ti-arrow-right" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {activeStep !== null && (
          <div className="pipe-detail" style={{ borderColor: PIPELINE[activeStep].color + "40" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${PIPELINE[activeStep].color}20`,
                border: `1px solid ${PIPELINE[activeStep].color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 16px ${PIPELINE[activeStep].color}30`,
              }}>
                <i className={`ti ${PIPELINE[activeStep].icon}`} style={{ color: PIPELINE[activeStep].color, fontSize: 22 }} aria-hidden="true" />
              </div>
              <div className="pipe-detail-title">{PIPELINE[activeStep].label}</div>
            </div>
            <p className="pipe-detail-text">{PIPELINE[activeStep].detail}</p>
            <div className="pipe-tech-badge">
              <i className="ti ti-terminal-2" aria-hidden="true" />
              {PIPELINE[activeStep].tech}
            </div>
          </div>
        )}

        {activeStep === null && (
          <p style={{ marginTop: 32, fontSize: 13, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono',monospace" }}>
            ↑ Click any step to expand
          </p>
        )}
      </section>

      {/* ══════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════ */}
      <section
        className={`tech section anim-section${visibleSections.tech ? " visible" : ""}`}
        ref={setRef("tech")} data-section="tech"
        style={{ textAlign: "center", position: "relative" }}
      >
        <div className="section-label"><i className="ti ti-cpu" aria-hidden="true" /> tech stack</div>
        <h2 className="section-title">Built on proven open-source</h2>
        <p className="section-sub" style={{ margin: "0 auto" }}>
          Every component chosen for performance, transparency, and local-first privacy.
        </p>

        <div className="tech-grid">
          {TECH.map((t, i) => (
            <div
              key={t.name}
              className="tech-card"
              style={{
                "--tc": t.color + "60",
                "--tc-glow": t.color + "30",
                "--tc-bg": t.color + "15",
                "--ty": `${-5 - (i % 3) * 2}px`,
                animationDuration: `${4 + i * 0.7}s`,
                animationDelay: `${-i * 0.9}s`,
              }}
            >
              <div className="tech-icon-wrap">
                <i className={`ti ${t.icon}`} style={{ color: t.color }} aria-hidden="true" />
              </div>
              <div>
                <div className="tech-name">{t.name}</div>
                <div className="tech-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          ROADMAP
      ══════════════════════════════════════ */}
      {/* <section
        className={`roadmap section anim-section${visibleSections.roadmap ? " visible" : ""}`}
        ref={setRef("roadmap")} data-section="roadmap"
        style={{ textAlign: "center", position: "relative" }}
      >
        <div className="bg-orb" style={{ width: 500, height: 500, background: "radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 70%)", bottom: 0, right: -100 }} />

        <div className="section-label"><i className="ti ti-map" aria-hidden="true" /> roadmap</div>
        <h2 className="section-title">What's coming next</h2>
        <p className="section-sub" style={{ margin: "0 auto" }}>
          We're building in public. Here's the full trajectory from MVP to AI-native developer platform.
        </p>

        <div className="timeline" style={{ textAlign: "left" }}>
          {ROADMAP.map((item, i) => {
            const statusClass = item.status === "done" ? "tl-done" : item.status === "active" ? "tl-active" : "tl-upcoming";
            const itemClass = item.status === "done" ? "tl-item-done" : item.status === "active" ? "tl-item-active" : "tl-item-upcoming";
            const badgeClass = item.status === "done" ? "badge-done" : item.status === "active" ? "badge-active" : "badge-upcoming";
            const badgeText = item.status === "done" ? "✓ shipped" : item.status === "active" ? "◉ in progress" : "◌ planned";
            const dotInnerColor = item.status === "done" ? "#34d399" : item.status === "active" ? "#818cf8" : "rgba(255,255,255,0.3)";
            return (
              <div key={item.phase} className="timeline-item"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`timeline-dot ${statusClass}`}>
                  <div className="timeline-dot-inner" style={{ background: dotInnerColor }} />
                </div>
                <span className={`tl-status-badge ${badgeClass}`}>{badgeText}</span>
                <div className="tl-phase">{item.phase}</div>
                <div className="tl-title">{item.title}</div>
                <div className="tl-items">
                  {item.items.map(it => (
                    <span key={it} className={`tl-item ${itemClass}`}>{it}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section> */}
    </>
  );
}