"use client";

import { useWallet } from "@/hooks/useWallet";
import { NETWORK_NAME } from "@/lib/constants";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletBar() {
  const { address, isConnected, wrongNetwork, error, connect, disconnect } =
    useWallet();

  if (wrongNetwork) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-[#EF4444]">
          Wrong network
        </span>
        <button
          onClick={connect}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:scale-95 active:scale-90 transition-transform duration-150"
        >
          Switch to {NETWORK_NAME}
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A4D32]/40 border border-[#3DCC7A]/20">
          <span
            className="w-2 h-2 rounded-full bg-[#3DCC7A] animate-pulse"
            aria-hidden="true"
          />
          <span
            style={{ fontFamily: "Space Mono, monospace" }}
            className="text-xs text-[#3DCC7A]"
          >
            {truncate(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#6C6C74] border border-[#2A2A2F] hover:border-[#3DCC7A]/30 hover:text-[#A0A0AB] hover:scale-95 active:scale-90 transition-all duration-150"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-[#3DCC7A] text-[#0F0F11] hover:scale-95 active:scale-90 transition-transform duration-150"
      >
        Connect wallet
      </button>
      {error && (
        <span className="text-xs text-[#EF4444] max-w-[220px] text-right">
          {error}
        </span>
      )}
    </div>
  );
}

// Full page wallet gate — renders children only when connected on correct network
export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, wrongNetwork, error, connect } = useWallet();

  if (wrongNetwork) {
    return (
      <Gate
        title="Switch to GenLayer Studio"
        body="This app only works on GenLayer Studio. Switch your wallet to the correct network to continue."
        action={connect}
        actionLabel={`Switch to ${NETWORK_NAME}`}
        accent="#EF4444"
      />
    );
  }

  if (!isConnected) {
    return (
      <Gate
        title="Connect your wallet"
        body="You need a wallet connected to GenLayer Studio to calculate and record your footprint."
        action={connect}
        actionLabel="Connect wallet"
        error={error}
      />
    );
  }

  return <>{children}</>;
}

type GateProps = {
  title: string;
  body: string;
  action: () => void;
  actionLabel: string;
  error?: string;
  accent?: string;
};

function Gate({ title, body, action, actionLabel, error, accent = "#3DCC7A" }: GateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border"
          style={{
            borderColor: `${accent}30`,
            backgroundColor: `${accent}10`,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="6" stroke={accent} strokeWidth="2" />
            <path d="M14 8v6l3 3" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
          className="text-xl text-[#EEEEEF] mb-3"
        >
          {title}
        </h3>
        <p className="text-[#A0A0AB] text-sm leading-relaxed mb-6">{body}</p>
        <button
          onClick={action}
          style={{ backgroundColor: accent }}
          className="w-full px-6 py-3 font-medium rounded-xl text-[#0F0F11] hover:scale-95 active:scale-90 transition-transform duration-150"
        >
          {actionLabel}
        </button>
        {error && <p className="mt-3 text-xs text-[#EF4444]">{error}</p>}
      </div>
    </div>
  );
}
