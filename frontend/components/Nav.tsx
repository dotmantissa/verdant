"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

function truncate(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function Nav() {
  const pathname = usePathname();
  const { address, isConnected, wrongNetwork, error, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("verdant-dark");
    if (saved === "1") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("verdant-dark", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("verdant-dark", "0");
    }
  }

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { href: "/calculate", label: "Calculate" },
    { href: "/offsets",   label: "Offsets"   },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <header className="nav-header">
        <div className="nav-inner">
          {/* Wordmark */}
          <Link href="/" className="nav-wordmark">Verdant</Link>

          {/* Desktop nav links */}
          <nav className="nav-links-desktop">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={`nav-link${pathname === href ? " active" : ""}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="nav-right">
            {/* Dark mode toggle */}
            <button onClick={toggleDark} className="nav-icon-btn" aria-label="Toggle dark mode">
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Wallet — desktop */}
            <div className="nav-wallet-desktop">
              {wrongNetwork && <span className="nav-badge error">Wrong network</span>}
              {isConnected && address ? (
                <>
                  <span className="nav-address mono">{truncate(address)}</span>
                  <button onClick={disconnect} className="btn btn-ghost" style={{ padding: "6px 13px", fontSize: 12 }}>
                    Disconnect
                  </button>
                </>
              ) : (
                <button onClick={connect} className="btn btn-primary" style={{ padding: "7px 15px", fontSize: 13 }}>
                  Connect wallet
                </button>
              )}
              {error && !wrongNetwork && (
                <span className="nav-badge error">{error}</span>
              )}
            </div>

            {/* Hamburger */}
            <button
              className="nav-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span className={`ham-line${menuOpen ? " open" : ""}`} />
              <span className={`ham-line${menuOpen ? " open" : ""}`} />
              <span className={`ham-line${menuOpen ? " open" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="nav-mobile-menu anim-fade-in">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={`nav-mobile-link${pathname === href ? " active" : ""}`}>
                {label}
              </Link>
            ))}
            <div className="nav-mobile-wallet">
              {wrongNetwork && <span className="nav-badge error" style={{ marginBottom: 8 }}>Wrong network</span>}
              {isConnected && address ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span className="nav-address mono" style={{ fontSize: 13 }}>{truncate(address)}</span>
                  <button onClick={disconnect} className="btn btn-ghost" style={{ width: "100%" }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={connect} className="btn btn-primary" style={{ width: "100%" }}>
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(var(--cream-rgb, 254,248,245), 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1.5px solid var(--border);
        }
        html.dark .nav-header {
          background: rgba(28,25,23,0.88);
        }
        .nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 18px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .nav-inner { padding: 0 28px; }
        }

        .nav-wordmark {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--forest);
          text-decoration: none;
          flex-shrink: 0;
          transition: color 0.18s;
        }
        .nav-wordmark:hover { color: var(--sage); }

        .nav-links-desktop {
          display: none;
          gap: 2px;
          flex: 1;
        }
        @media (min-width: 640px) {
          .nav-links-desktop { display: flex; }
        }

        .nav-link {
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink-60);
          padding: 5px 11px;
          border-radius: 8px;
          transition: color 0.18s, background 0.18s;
        }
        .nav-link:hover  { color: var(--ink); background: var(--ink-06); }
        .nav-link.active { color: var(--forest); background: var(--sage-15); font-weight: 600; }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .nav-wallet-desktop {
          display: none;
          align-items: center;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .nav-wallet-desktop { display: flex; }
        }

        .nav-address {
          font-size: 12px;
          color: var(--forest);
          background: var(--sage-15);
          padding: 5px 10px;
          border-radius: 8px;
        }
        .nav-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 9px;
          border-radius: 100px;
        }
        .nav-badge.error { background: var(--red-bg); color: var(--red); }

        .nav-icon-btn {
          background: none;
          border: 1.5px solid var(--border-strong);
          border-radius: 8px;
          padding: 5px 8px;
          font-size: 15px;
          cursor: pointer;
          line-height: 1;
          transition: background 0.18s, border-color 0.18s;
          display: flex;
          align-items: center;
        }
        .nav-icon-btn:hover { background: var(--ink-06); }

        /* Hamburger */
        .nav-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          background: none;
          border: 1.5px solid var(--border-strong);
          border-radius: 8px;
          padding: 7px 9px;
          cursor: pointer;
          width: 38px;
          height: 36px;
        }
        @media (min-width: 640px) { .nav-hamburger { display: none; } }

        .ham-line {
          display: block;
          width: 16px;
          height: 1.5px;
          background: var(--ink);
          border-radius: 2px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .ham-line.open:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
        .ham-line.open:nth-child(2) { opacity: 0; }
        .ham-line.open:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

        /* Mobile menu */
        .nav-mobile-menu {
          border-top: 1.5px solid var(--border);
          padding: 16px 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--cream);
        }
        @media (min-width: 640px) { .nav-mobile-menu { display: none; } }

        .nav-mobile-link {
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink-60);
          padding: 11px 12px;
          border-radius: 9px;
          transition: color 0.18s, background 0.18s;
          display: block;
        }
        .nav-mobile-link:hover  { color: var(--ink); background: var(--ink-06); }
        .nav-mobile-link.active { color: var(--forest); background: var(--sage-15); font-weight: 600; }

        .nav-mobile-wallet {
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
}
