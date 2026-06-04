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
        <div className="h-2 w-48 rounded-full bg-[#2A2A2F] animate-pulse mb-4" />
        <div className="h-8 w-64 rounded-xl bg-[#2A2A2F] animate-pulse mb-12" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#1A1A1E] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[#EF4444] text-sm">{error}</p>
      </div>
    );
  }

  const latest = history[history.length - 1];
  const latestTonnes = latest ? latest.total_kg_co2e / 1000 : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <p
        style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.2em", color: "#6C6C74" }}
        className="text-xs uppercase mb-3"
      >
        Your record
      </p>
      <h1
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
        className="text-4xl text-[#EEEEEF] mb-10"
      >
        Carbon dashboard
      </h1>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <StatCard
              label="Latest annual footprint"
              value={
                latestTonnes !== null
                  ? `${latestTonnes.toFixed(2)}t CO₂e`
                  : "—"
              }
              sub={latest?.label ?? ""}
              highlight={!!latestTonnes}
            />
            <StatCard
              label="Global average"
              value={ctx ? `${ctx.global_average_t_co2e}t CO₂e` : "—"}
              sub="Per person, 2022"
              comparison={
                latestTonnes && ctx
                  ? latestTonnes < ctx.global_average_t_co2e
                    ? `${(((ctx.global_average_t_co2e - latestTonnes) / ctx.global_average_t_co2e) * 100).toFixed(0)}% below average`
                    : `${(((latestTonnes - ctx.global_average_t_co2e) / ctx.global_average_t_co2e) * 100).toFixed(0)}% above average`
                  : undefined
              }
            />
            <StatCard
              label="Paris Agreement target"
              value={ctx ? `${ctx.paris_target_t_co2e}t CO₂e` : "—"}
              sub="2°C pathway per person"
              comparison={
                latestTonnes && ctx
                  ? latestTonnes > ctx.paris_target_t_co2e
                    ? `${(latestTonnes - ctx.paris_target_t_co2e).toFixed(1)}t to go`
                    : "On target"
                  : undefined
              }
            />
          </div>

          {/* Latest breakdown */}
          {latest && (
            <div className="mb-12">
              <SectionLabel>Latest breakdown</SectionLabel>
              <BreakdownBar record={latest} />
            </div>
          )}

          {/* Year-over-year history */}
          {history.length > 1 && (
            <div className="mb-12">
              <SectionLabel>Year over year</SectionLabel>
              <YearChart history={history} />
            </div>
          )}

          {/* All records */}
          <div>
            <SectionLabel>All records ({history.length})</SectionLabel>
            <div className="space-y-3">
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

// ------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border"
        style={{ borderColor: "#3DCC7A30", backgroundColor: "#3DCC7A10" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="8" stroke="#3DCC7A" strokeWidth="2" />
          <path d="M14 10v4l3 3" stroke="#3DCC7A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        className="text-2xl text-[#EEEEEF] mb-3"
      >
        No records yet
      </h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "#A0A0AB" }}>
        Calculate your footprint once and it will appear here, permanently, linked to your wallet.
      </p>
      <Link
        href="/calculate"
        className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-[#0F0F11] transition-transform duration-150 hover:scale-95"
        style={{ backgroundColor: "#3DCC7A" }}
      >
        Calculate now
      </Link>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.15em", color: "#6C6C74" }}
      className="text-xs uppercase mb-4"
    >
      {children}
    </p>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  comparison,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  comparison?: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        backgroundColor: highlight ? "#1A4D3220" : "#1A1A1E",
        borderColor: highlight ? "#3DCC7A30" : "#2A2A2F",
      }}
    >
      <p className="text-xs mb-2" style={{ color: "#6C6C74" }}>{label}</p>
      <p
        style={{
          fontFamily: "Space Mono, monospace",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: highlight ? "#3DCC7A" : "#EEEEEF",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "#6C6C74" }}>{sub}</p>
      {comparison && (
        <p className="text-xs mt-2" style={{ color: "#8ED4A8" }}>{comparison}</p>
      )}
    </div>
  );
}

function BreakdownBar({ record }: { record: FootprintRecord }) {
  const total = record.total_kg_co2e;
  const segments = [
    { label: "Energy", value: record.breakdown.energy_kg_co2e, color: "#3DCC7A" },
    { label: "Transport", value: record.breakdown.transport_kg_co2e, color: "#8ED4A8" },
    { label: "Diet", value: record.breakdown.diet_kg_co2e, color: "#1A4D32" },
  ];

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
    >
      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-4">
        {segments.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              width: `${total > 0 ? (value / total) * 100 : 0}%`,
              backgroundColor: color,
            }}
            title={`${label}: ${(value / 1000).toFixed(2)}t`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-5">
        {segments.map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs" style={{ color: "#6C6C74" }}>{label}</span>
            <span
              style={{ fontFamily: "Space Mono, monospace", color: "#EEEEEF", fontSize: "0.7rem" }}
            >
              {(value / 1000).toFixed(2)}t
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearChart({ history }: { history: FootprintRecord[] }) {
  const max = Math.max(...history.map((r) => r.total_kg_co2e));

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
    >
      <div className="flex items-end gap-3 h-24">
        {history.map((rec) => (
          <div key={`${rec.year}-${rec.label}`} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${max > 0 ? (rec.total_kg_co2e / max) * 80 : 4}px`,
                backgroundColor: "#3DCC7A",
                minHeight: "4px",
              }}
              title={`${rec.label}: ${(rec.total_kg_co2e / 1000).toFixed(2)}t CO₂e`}
            />
            <span
              style={{ fontFamily: "Space Mono, monospace", fontSize: "0.6rem", color: "#6C6C74" }}
            >
              {rec.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: FootprintRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#222228] transition-colors duration-150"
      >
        <div className="flex items-center gap-4">
          <span
            style={{ fontFamily: "Space Mono, monospace", color: "#3DCC7A", fontSize: "0.75rem" }}
          >
            {record.year}
          </span>
          <span className="text-sm" style={{ color: "#EEEEEF" }}>
            {record.label || "Annual record"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span
            style={{
              fontFamily: "Space Mono, monospace",
              color: "#EEEEEF",
              fontSize: "0.8rem",
            }}
          >
            {(record.total_kg_co2e / 1000).toFixed(2)}t CO₂e
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <path d="M4 6l4 4 4-4" stroke="#6C6C74" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div
          className="px-5 pb-5 pt-0 text-xs space-y-1.5"
          style={{ borderTop: "1px solid #2A2A2F" }}
        >
          <div className="flex justify-between pt-4">
            <span style={{ color: "#6C6C74" }}>Energy</span>
            <span style={{ color: "#EEEEEF", fontFamily: "Space Mono, monospace" }}>
              {(record.breakdown.energy_kg_co2e / 1000).toFixed(3)}t
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6C6C74" }}>Transport</span>
            <span style={{ color: "#EEEEEF", fontFamily: "Space Mono, monospace" }}>
              {(record.breakdown.transport_kg_co2e / 1000).toFixed(3)}t
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6C6C74" }}>Diet</span>
            <span style={{ color: "#EEEEEF", fontFamily: "Space Mono, monospace" }}>
              {(record.breakdown.diet_kg_co2e / 1000).toFixed(3)}t
            </span>
          </div>
          <div className="flex justify-between pt-1" style={{ borderTop: "1px solid #2A2A2F" }}>
            <span style={{ color: "#6C6C74" }}>Sources</span>
            <span style={{ color: "#3DCC7A", fontFamily: "Space Mono, monospace" }}>
              {Object.values(record.data_sources).join(", ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
