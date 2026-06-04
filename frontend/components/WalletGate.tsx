"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, wrongNetwork, connect } = useWallet();

  if (wrongNetwork) {
    return (
      <Gate>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
          This app runs on GenLayer Studio (chain 61999). Switch your wallet to continue.
        </p>
        <button onClick={connect} className="btn-primary">
          switch network
        </button>
      </Gate>
    );
  }

  if (!isConnected) {
    return (
      <Gate>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
          Connect a wallet to record and view your on-chain footprint data.
        </p>
        <button onClick={connect} className="btn-primary">
          connect wallet
        </button>
      </Gate>
    );
  }

  return <>{children}</>;
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "120px auto",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.15em",
          color: "#3dcc7a",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Wallet required
      </p>
      {children}

      <style>{`
        .btn-primary {
          background: none;
          border: 1px solid #3dcc7a;
          color: #3dcc7a;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.1em;
          padding: 8px 20px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-primary:hover { background: #3dcc7a; color: #0a0a0a; }
      `}</style>
    </div>
  );
}
