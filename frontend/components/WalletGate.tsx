"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, wrongNetwork, connect } = useWallet();

  if (wrongNetwork) {
    return (
      <GateShell
        title="Wrong network"
        body="Verdant runs on GenLayer Studio (chain 61999). Switch your wallet network to continue."
        action="Switch network"
        onAction={connect}
      />
    );
  }

  if (!isConnected) {
    return (
      <GateShell
        title="Connect your wallet"
        body="Connect a wallet to record and view your on-chain carbon footprint data."
        action="Connect wallet"
        onAction={connect}
      />
    );
  }

  return <>{children}</>;
}

function GateShell({
  title, body, action, onAction,
}: {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 60px)",
        padding: "40px 28px",
      }}
    >
      <div
        className="anim-scale-in"
        style={{
          background: "white",
          border: "1.5px solid rgba(35,31,32,0.07)",
          borderRadius: 20,
          padding: "48px 44px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(35,31,32,0.07)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(83,116,95,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 22,
          }}
        >
          🔐
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 10,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-60)",
            lineHeight: 1.65,
            marginBottom: 32,
          }}
        >
          {body}
        </p>
        <button onClick={onAction} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          {action}
        </button>
      </div>
    </div>
  );
}
