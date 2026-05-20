import { useId } from "react";

const Logo = () => {
    const id = useId();
    return (
        <div className="logo-wrap">
            <div className="logo-bg" />
            <div className="logo-ring" />
            <svg className="logo-svg" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="3" fill={`url(#lg1-${id})`} opacity="0.9" />
                <circle cx="4.5" cy="5.5" r="2" fill={`url(#lg2-${id})`} opacity="0.75" />
                <circle cx="17.5" cy="5.5" r="2" fill={`url(#lg2-${id})`} opacity="0.75" />
                <circle cx="4.5" cy="16.5" r="2" fill={`url(#lg3-${id})`} opacity="0.65" />
                <circle cx="17.5" cy="16.5" r="2" fill={`url(#lg3-${id})`} opacity="0.65" />
                <line x1="11" y1="11" x2="4.5" y2="5.5" stroke={`url(#lg4-${id})`} strokeWidth="1" opacity="0.5" />
                <line x1="11" y1="11" x2="17.5" y2="5.5" stroke={`url(#lg4-${id})`} strokeWidth="1" opacity="0.5" />
                <line x1="11" y1="11" x2="4.5" y2="16.5" stroke={`url(#lg4-${id})`} strokeWidth="1" opacity="0.5" />
                <line x1="11" y1="11" x2="17.5" y2="16.5" stroke={`url(#lg4-${id})`} strokeWidth="1" opacity="0.5" />
                <defs>
                    <linearGradient id={`lg1-${id}`} x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818cf8" /><stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id={`lg2-${id}`} x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a5b4fc" /><stop offset="1" stopColor="#67e8f9" />
                    </linearGradient>
                    <linearGradient id={`lg3-${id}`} x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#38bdf8" />
                    </linearGradient>
                    <linearGradient id={`lg4-${id}`} x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818cf8" /><stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export default Logo
