"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

function truncate(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function Nav() {
  const pathname = usePathname();
  const { address, isConnected, wrongNetwork, error, connect, disconnect } = useWallet();

  const links = [
    { href: "/calculate", label: "Calculate" },
    { href: "/offsets", label: "Offsets" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(254,248,245,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1.5px solid rgba(35,31,32,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 28px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          {/* Wordmark */}
          <Link href="/" className="nav-wordmark">
            Verdant
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {wrongNetwork && (
              <span className="nav-badge error">Wrong network</span>
            )}
            {isConnected && address ? (
              <>
                <span className="nav-address mono">{truncate(address)}</span>
                <button onClick={disconnect} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={connect} className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}>
                Connect wallet
              </button>
            )}
            {error && !wrongNetwork && (
              <span className="nav-badge error" style={{ maxWidth: 160 }}>{error}</span>
            )}
          </div>
        </div>
      </header>

      <style>{`
        .nav-wordmark {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--forest);
          text-decoration: none;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }
        .nav-wordmark:hover { color: var(--sage); }

        .nav-link {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-decoration: none;
          color: var(--ink-60);
          padding: 5px 12px;
          border-radius: 7px;
          position: relative;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .nav-link:hover {
          color: var(--ink);
          background: var(--ink-06);
        }
        .nav-link.active {
          color: var(--forest);
          background: rgba(83,116,95,0.1);
          font-weight: 600;
        }

        .nav-address {
          font-size: 12px;
          color: var(--forest);
          background: rgba(83,116,95,0.1);
          padding: 5px 10px;
          border-radius: 7px;
        }

        .nav-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 9px;
          border-radius: 100px;
        }
        .nav-badge.error {
          background: rgba(192,57,43,0.08);
          color: var(--red);
        }
      `}</style>
    </>
  );
}
