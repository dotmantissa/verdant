"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, wrongNetwork, connect } = useWallet();

  if (wrongNetwork) {
    return (
      <GateShell
        icon="⛓"
        title="Switch your network"
        body="Verdant runs on GenLayer Studio (chain 61999). Open your wallet and switch over, then you're good to go."
        action="Switch network"
        onAction={connect}
      />
    );
  }

  if (!isConnected) {
    return (
      <GateShell
        icon="🔐"
        title="Connect your wallet"
        body="Your footprint records live on-chain, tied to your wallet address. Connect to record or view your data."
        action="Connect wallet"
        onAction={connect}
      />
    );
  }

  return <>{children}</>;
}

function GateShell({
  icon, title, body, action, onAction,
}: {
  icon: string;
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
        minHeight: "calc(100vh - 58px)",
        padding: "40px 18px",
      }}
    >
      <div
        className="anim-scale-in"
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: 20,
          padding: "44px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(35,31,32,0.07)",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "var(--sage-15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontSize: 19,
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
            marginBottom: 30,
          }}
        >
          {body}
        </p>
        <button onClick={onAction} className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
          {action}
        </button>
      </div>
    </div>
  );
}
