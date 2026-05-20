import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../widgets/Logo";

const NAV_LINKS = ["Home", "Features", "Architecture"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return !document.documentElement.classList.contains("light");
  });
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when mobile overlay is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Sync initial theme on mount */
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    if (saved === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleMouseMove = (e) => {
    const rect = navbarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
    navbarRef.current.style.setProperty("--mx", x);
    navbarRef.current.style.setProperty("--my", y);
  };

  return (
    <>
      <div className={`mobile-overlay${mobileOpen ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}>
        <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <i className="ti ti-x" />
        </button>
        {NAV_LINKS.map((label) => (
          <div key={label} className="mobile-nav-item" onClick={() => setMobileOpen(false)}>{label}</div>
        ))}
        <button className="mobile-launch" onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}>Launch App</button>
      </div>

      {/* Navbar */}
      <div className={`nb-wrapper${scrolled ? " scrolled" : ""}`}>
        <nav
          ref={navbarRef}
          className={`navbar${scrolled ? " scrolled" : ""}`}
          onMouseMove={handleMouseMove}
          aria-label="Main navigation"
        >
          <div className="nb-glow" />

          {/* LEFT */}
          <div className="nb-left" onClick={() => navigate('/')}>
            <Logo />
            <div className="brand-text">
              <span className="brand-name">Synapse</span>
              <span className="brand-tag">Code · Intelligence</span>
            </div>
            <div className="pulse-dot" aria-label="AI active" />
          </div>

          {/* CENTER */}
          <div className="nb-center">
            {NAV_LINKS.map((label, i) => (
              <button
                key={label}
                className={`nav-link${activeLink === i ? " active" : ""}`}
                onClick={() => setActiveLink(i)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* RIGHT */}
          <div className="nb-right">
            <button onClick={() => window.open("https://github.com", "_blank", "noopener,noreferrer")} className="icon-btn gh-btn" aria-label="GitHub">
              <i className="ti ti-brand-github" />
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <i className={`ti ti-${isDark ? "moon" : "sun"}`} />
            </button>
            <button className="btn-launch" aria-label="Launch App" onClick={() => navigate('/dashboard')}>
              <i className="ti ti-rocket" style={{ fontSize: 14 }} />
              <span className="launch-label">Launch App</span>
            </button>
            <button className="nb-hamburger icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <i className="ti ti-menu-2" />
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}