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
    { href: "/calculate", label: "calculate" },
    { href: "/offsets", label: "offsets" },
    { href: "/dashboard", label: "dashboard" },
  ];

  return (
    <header style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.12em",
            color: "#3dcc7a",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Verdant
        </Link>

        {/* Links */}
        <nav style={{ display: "flex", gap: 28, flex: 1 }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 12,
                letterSpacing: "0.06em",
                textDecoration: "none",
                color: pathname === href ? "#e8e8e8" : "#555",
                borderBottom: pathname === href ? "1px solid #3dcc7a" : "1px solid transparent",
                paddingBottom: 1,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {wrongNetwork && (
            <span style={{ fontSize: 11, color: "#f87171", letterSpacing: "0.05em" }}>
              wrong network
            </span>
          )}
          {isConnected && address ? (
            <>
              <span style={{ fontSize: 11, color: "#3dcc7a", letterSpacing: "0.05em" }}>
                {truncate(address)}
              </span>
              <button onClick={disconnect} className="btn-ghost">
                disconnect
              </button>
            </>
          ) : (
            <button onClick={connect} className="btn-accent">
              connect wallet
            </button>
          )}
          {error && (
            <span style={{ fontSize: 10, color: "#f87171", maxWidth: 180 }}>{error}</span>
          )}
        </div>
      </div>

      <style>{`
        .btn-ghost {
          background: none;
          border: 1px solid #2a2a2a;
          color: #555;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover { border-color: #444; color: #888; }
        .btn-accent {
          background: none;
          border: 1px solid #3dcc7a;
          color: #3dcc7a;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          padding: 4px 12px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-accent:hover { background: #3dcc7a; color: #0a0a0a; }
      `}</style>
    </header>
  );
}
