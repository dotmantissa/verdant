"use client";

import { useEffect, useState } from "react";
import { WalletGate } from "@/components/WalletBar";
import { useWallet } from "@/hooks/useWallet";
import { readFootprintHistory, readEmissionContext } from "@/lib/genlayer";
import Link from "next/link";

type FootprintRecord = {
  year: number;
  label: string;
  total_kg_co2e: number;
  breakdown: {
    energy_kg_co2e: number;
    transport_kg_co2e: number;
    diet_kg_co2e: number;
    detail: Record<string, number>;
  };
  data_sources: Record<string, string>;
  recorded_at: string;
};

type EmissionCtx = {
  global_average_t_co2e: number;
  paris_target_t_co2e: number;
  country_averages: Record<string, number>;
};

export default function DashboardPage() {
  return (
    <WalletGate>
      <Dashboard />
    </WalletGate>
  );
}

function Dashboard() {
  const { address, provider } = useWallet();
  const [history, setHistory] = useState<FootprintRecord[]>([]);
  const [ctx, setCtx] = useState<EmissionCtx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address || !provider) return;
    setLoading(true);
    Promise.all([
      readFootprintHistory(address, provider),
      readEmissionContext(provider),
    ])
      .then(([hist, emCtx]) => {
        setHistory(hist as FootprintRecord[]);
        setCtx(emCtx as EmissionCtx);
      })
      .catch((e: unknown) => setError((e as Error).message ?? "Failed to load data."))
      .finally(() => setLoading(false));
  }, [address, provider]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="h-1.5 w-32 rounded-full mb-4 animate-pulse" style={{ backgroundColor: "#2A2A2F" }} />
        <div className="h-10 w-56 rounded-xl mb-16 animate-pulse" style={{ backgroundColor: "#2A2A2F" }} />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ backgroundColor: "#1A1A1E" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
      </div>
    );
  }

  const latest = history[history.length - 1];
  const latestTonnes = latest ? latest.total_kg_co2e / 1000 : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p
        className="text-xs uppercase mb-3 tracking-[0.2em]"
        style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
      >
        Your record
      </p>
      <h1
        className="text-4xl mb-12"
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", color: "#EEEEEF" }}
      >
        Carbon dashboard
      </h1>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-14">
            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: "#0D2B1A", borderColor: "#3DCC7A25" }}
            >
              <p className="text-xs mb-3" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                Your latest annual footprint
              </p>
              <p
                className="mb-1"
                style={{ fontFamily: "Space Mono, monospace", fontSize: "2.25rem", fontWeight: 700, color: "#3DCC7A", letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {latestTonnes !== null ? `${latestTonnes.toFixed(2)}t` : "—"}
              </p>
              <p className="text-xs" style={{ color: "#3DCC7A80", fontFamily: "Space Grotesk, sans-serif" }}>
                CO₂e · {latest?.label ?? ""}
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
            >
              <p className="text-xs mb-3" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                Global average
              </p>
              <p
                className="mb-1"
                style={{ fontFamily: "Space Mono, monospace", fontSize: "2.25rem", fontWeight: 700, color: "#EEEEEF", letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {ctx ? `${ctx.global_average_t_co2e}t` : "—"}
              </p>
              <p className="text-xs" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                {latestTonnes && ctx
                  ? latestTonnes < ctx.global_average_t_co2e
                    ? `You are ${(((ctx.global_average_t_co2e - latestTonnes) / ctx.global_average_t_co2e) * 100).toFixed(0)}% below average`
                    : `You are ${(((latestTonnes - ctx.global_average_t_co2e) / ctx.global_average_t_co2e) * 100).toFixed(0)}% above average`
                  : "Per person, 2022"}
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
            >
              <p className="text-xs mb-3" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                Paris target
              </p>
              <p
                className="mb-1"
                style={{ fontFamily: "Space Mono, monospace", fontSize: "2.25rem", fontWeight: 700, color: "#EEEEEF", letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {ctx ? `${ctx.paris_target_t_co2e}t` : "—"}
              </p>
              <p className="text-xs" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                {latestTonnes && ctx
                  ? latestTonnes > ctx.paris_target_t_co2e
                    ? `${(latestTonnes - ctx.paris_target_t_co2e).toFixed(1)}t above the 2°C pathway`
                    : "You are on the Paris pathway"
                  : "2°C pathway per person"}
              </p>
            </div>
          </div>

          {/* Latest breakdown */}
          {latest && (
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}>
                Latest breakdown
              </p>
              <BreakdownBar record={latest} />
            </div>
          )}

          {/* Year chart */}
          {history.length > 1 && (
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}>
                Year over year
              </p>
              <YearChart history={history} />
            </div>
          )}

          {/* Records list */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}>
              All records ({history.length})
            </p>
            <div className="space-y-2">
              {[...history].reverse().map((rec, i) => (
                <RecordRow key={i} record={rec} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 max-w-sm">
      <p
        className="text-5xl mb-6 leading-none"
        style={{ fontFamily: "Space Mono, monospace", color: "#2A2A2F", letterSpacing: "-0.04em" }}
      >
        0.00t
      </p>
      <h3
        className="text-2xl mb-3"
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#EEEEEF" }}
      >
        No records yet
      </h3>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
        Calculate your footprint once and it will appear here, permanently, linked to your wallet.
      </p>
      <Link
        href="/calculate"
        className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-[#0F0F11] transition-transform duration-150 hover:scale-95"
        style={{ backgroundColor: "#3DCC7A", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Calculate now
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="#0F0F11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

function BreakdownBar({ record }: { record: FootprintRecord }) {
  const total = record.total_kg_co2e;
  const segments = [
    { label: "Energy", value: record.breakdown.energy_kg_co2e, color: "#3DCC7A" },
    { label: "Transport", value: record.breakdown.transport_kg_co2e, color: "#8ED4A8" },
    { label: "Diet", value: record.breakdown.diet_kg_co2e, color: "#2A5C3A" },
  ];

  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}>
      <div className="flex rounded-full overflow-hidden h-2 mb-6">
        {segments.map(({ label, value, color }) => (
          <div
            key={label}
            title={`${label}: ${(value / 1000).toFixed(2)}t`}
            style={{ width: `${total > 0 ? (value / total) * 100 : 0}%`, backgroundColor: color }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {segments.map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>{label}</span>
            </div>
            <p style={{ fontFamily: "Space Mono, monospace", color: "#EEEEEF", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
              {(value / 1000).toFixed(2)}t
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
              {total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearChart({ history }: { history: FootprintRecord[] }) {
  const max = Math.max(...history.map((r) => r.total_kg_co2e));

  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}>
      <div className="flex items-end gap-4 h-28">
        {history.map((rec) => {
          const pct = max > 0 ? (rec.total_kg_co2e / max) * 100 : 0;
          return (
            <div key={`${rec.year}-${rec.label}`} className="flex flex-col items-center gap-2 flex-1">
              <span
                className="text-xs opacity-0 group-hover:opacity-100"
                style={{ fontFamily: "Space Mono, monospace", color: "#3DCC7A", fontSize: "0.6rem" }}
              >
                {(rec.total_kg_co2e / 1000).toFixed(1)}t
              </span>
              <div className="w-full relative group">
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{ height: `${Math.max(pct * 0.85, 4)}px`, backgroundColor: "#3DCC7A30", minHeight: "4px" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-full rounded-t"
                  style={{ height: `${Math.max(pct * 0.85, 4)}px`, backgroundColor: "#3DCC7A", opacity: 0.8, minHeight: "4px" }}
                  title={`${rec.year}: ${(rec.total_kg_co2e / 1000).toFixed(2)}t CO₂e`}
                />
              </div>
              <span style={{ fontFamily: "Space Mono, monospace", fontSize: "0.65rem", color: "#6C6C74" }}>
                {rec.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: FootprintRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#111115", borderColor: "#2A2A2F" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-150"
        style={{ backgroundColor: expanded ? "#1A1A1E" : "transparent" }}
        onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#1A1A1E")}
        onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = expanded ? "#1A1A1E" : "transparent")}
      >
        <div className="flex items-center gap-5">
          <span style={{ fontFamily: "Space Mono, monospace", color: "#3DCC7A", fontSize: "0.75rem" }}>
            {record.year}
          </span>
          <span className="text-sm" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
            {record.label || "Annual record"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span style={{ fontFamily: "Space Mono, monospace", color: "#EEEEEF", fontSize: "0.8rem", letterSpacing: "-0.02em" }}>
            {(record.total_kg_co2e / 1000).toFixed(2)}t CO₂e
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M3 5l4 4 4-4" stroke="#6C6C74" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pt-4 pb-5 space-y-2 text-xs" style={{ borderTop: "1px solid #2A2A2F" }}>
          {[
            ["Energy", (record.breakdown.energy_kg_co2e / 1000).toFixed(3) + "t"],
            ["Transport", (record.breakdown.transport_kg_co2e / 1000).toFixed(3) + "t"],
            ["Diet", (record.breakdown.diet_kg_co2e / 1000).toFixed(3) + "t"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>{label}</span>
              <span style={{ color: "#EEEEEF", fontFamily: "Space Mono, monospace" }}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #2A2A2F" }}>
            <span style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>Sources</span>
            <span style={{ color: "#3DCC7A", fontFamily: "Space Mono, monospace", fontSize: "0.65rem" }}>
              {Object.values(record.data_sources).join(", ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
