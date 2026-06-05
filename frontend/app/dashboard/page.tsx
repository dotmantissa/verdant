"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WalletGate } from "@/components/WalletGate";
import { useWallet } from "@/hooks/useWallet";
import { readFootprintHistory, readEmissionContext } from "@/lib/genlayer";

type FootprintRecord = {
  year: number;
  label: string;
  total_kg_co2e: number;
  breakdown: {
    energy_kg_co2e:    number;
    transport_kg_co2e: number;
    diet_kg_co2e:      number;
    detail?: Record<string, number>;
  };
  data_sources: Record<string, string>;
  recorded_at: string;
};

type EmissionCtx = {
  global_average_t_co2e: number;
  paris_target_t_co2e:   number;
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
  const [ctx,     setCtx]     = useState<EmissionCtx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

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
      .catch((e: unknown) => setError((e as Error).message ?? "Failed to load records."))
      .finally(() => setLoading(false));
  }, [address, provider]);

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-60)" }}>
          <span className="spinner" />
          <span style={{ fontSize: 14 }}>Loading your records</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="banner error">{error}</div>
      </div>
    );
  }

  if (history.length === 0) {
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
              width: 50, height: 50, borderRadius: "50%",
              background: "var(--sage-15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 22px", fontSize: 22,
            }}
          >
            📊
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 10, color: "var(--ink)" }}>
            No records yet
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.65, marginBottom: 28 }}>
            Once you calculate your footprint it will appear here permanently, tied to your wallet.
          </p>
          <Link href="/calculate" className="btn btn-primary" style={{ width: "100%" }}>
            Calculate now
          </Link>
        </div>
      </div>
    );
  }

  const latest  = history[history.length - 1];
  const latestT = latest ? latest.total_kg_co2e / 1000 : null;

  const avgDiff   = latestT && ctx ? latestT - ctx.global_average_t_co2e : null;
  const parisDiff = latestT && ctx ? latestT - ctx.paris_target_t_co2e   : null;

  return (
    <div className="page">
      <div className="anim-fade-up" style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 5 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-60)" }}>
          {history.length} record{history.length !== 1 ? "s" : ""} on-chain for this wallet
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-stats" style={{ marginBottom: 40 }}>
        <div
          className="stat-card anim-fade-up delay-1"
          style={{ borderColor: "var(--sage-30)", background: "var(--sage-15)" }}
        >
          <p className="stat-label">Your latest</p>
          <p className="stat-value" style={{ color: "var(--forest)" }}>
            {latestT !== null ? `${latestT.toFixed(2)} t` : "—"}
          </p>
          <p className="stat-note">{latest.label || latest.year}</p>
        </div>

        <div className="stat-card anim-fade-up delay-2">
          <p className="stat-label">Global average</p>
          <p className="stat-value">{ctx ? `${ctx.global_average_t_co2e} t` : "—"}</p>
          {avgDiff !== null && (
            <p className="stat-note" style={{ color: avgDiff < 0 ? "var(--forest)" : "var(--red)" }}>
              {avgDiff < 0
                ? `${Math.abs(avgDiff).toFixed(1)} t below`
                : `${avgDiff.toFixed(1)} t above`}
            </p>
          )}
        </div>

        <div className="stat-card anim-fade-up delay-3">
          <p className="stat-label">Paris target</p>
          <p className="stat-value">{ctx ? `${ctx.paris_target_t_co2e} t` : "—"}</p>
          {parisDiff !== null && (
            <p className="stat-note" style={{ color: parisDiff > 0 ? "var(--red)" : "var(--forest)" }}>
              {parisDiff > 0 ? `${parisDiff.toFixed(1)} t over` : "On track"}
            </p>
          )}
        </div>

        <div className="stat-card anim-fade-up delay-4">
          <p className="stat-label">Records</p>
          <p className="stat-value">{history.length}</p>
          <p className="stat-note">on-chain</p>
        </div>
      </div>

      {/* Breakdown */}
      {latest && (
        <section className="anim-fade-up delay-2" style={{ marginBottom: 40 }}>
          <p className="section-label">Breakdown — {latest.label || latest.year}</p>
          <div
            style={{
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              borderRadius: 14,
              padding: "22px",
            }}
          >
            <Breakdown record={latest} />
          </div>
        </section>
      )}

      {/* Year chart */}
      {history.length > 1 && (
        <section className="anim-fade-up delay-3" style={{ marginBottom: 40 }}>
          <p className="section-label">Year over year</p>
          <div
            style={{
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              borderRadius: 14,
              padding: "24px 22px",
              overflowX: "auto",
            }}
          >
            <YearChart history={history} />
          </div>
        </section>
      )}

      {/* History table */}
      <section className="anim-fade-up delay-4">
        <p className="section-label">All records ({history.length})</p>
        <div
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
            overflowX: "auto",
          }}
        >
          <table className="data-table">
            <thead>
              <tr>
                {["Year", "Label", "Total", "Energy", "Transport", "Diet"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((rec, i) => (
                <HistoryRow key={i} record={rec} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Breakdown({ record }: { record: FootprintRecord }) {
  const total = record.total_kg_co2e || 1;
  const segs  = [
    { label: "Energy",    val: record.breakdown.energy_kg_co2e,    color: "var(--forest)" },
    { label: "Transport", val: record.breakdown.transport_kg_co2e, color: "var(--sage)"   },
    { label: "Diet",      val: record.breakdown.diet_kg_co2e,      color: "var(--sage-30)"},
  ];

  return (
    <div>
      {/* Stacked bar */}
      <div
        style={{
          display: "flex",
          height: 9,
          borderRadius: 100,
          overflow: "hidden",
          gap: 2,
          marginBottom: 22,
        }}
      >
        {segs.map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              flex: Math.max(val, 0.01),
              background: color,
              animation: "barGrow 0.8s cubic-bezier(0.16,1,0.3,1) both",
            }}
            title={`${label}: ${(val / 1000).toFixed(2)} t`}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        {segs.map(({ label, val, color }) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)", fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
                {(val / 1000).toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-30)" }}>t</span>
              <span style={{ fontSize: 12, color: "var(--ink-30)", background: "var(--surface-2)", padding: "2px 6px", borderRadius: 6 }}>
                {total > 0 ? ((val / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearChart({ history }: { history: FootprintRecord[] }) {
  const max = Math.max(...history.map(r => r.total_kg_co2e), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110, minWidth: history.length * 48 }}>
      {history.map((rec, i) => {
        const barH = Math.max((rec.total_kg_co2e / max) * 82, 4);
        return (
          <div
            key={`${rec.year}-${rec.label}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flex: 1, minWidth: 40 }}
          >
            <span style={{ fontSize: 11, color: "var(--forest)", fontWeight: 600, opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.05 + 0.4}s both` }}>
              {(rec.total_kg_co2e / 1000).toFixed(1)}t
            </span>
            <div
              title={`${rec.label || rec.year}: ${(rec.total_kg_co2e / 1000).toFixed(2)} t CO₂e`}
              style={{
                width: "100%",
                maxWidth: 40,
                height: barH,
                background: "linear-gradient(180deg, var(--sage) 0%, var(--forest) 100%)",
                borderRadius: "6px 6px 3px 3px",
                opacity: 0,
                animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both`,
              }}
            />
            <span style={{ fontSize: 11, color: "var(--ink-30)", fontWeight: 500 }}>{rec.year}</span>
          </div>
        );
      })}
    </div>
  );
}

function HistoryRow({ record }: { record: FootprintRecord }) {
  const [expanded, setExpanded] = useState(false);
  const t = (v: number) => (v / 1000).toFixed(2) + " t";

  return (
    <>
      <tr onClick={() => setExpanded(v => !v)}>
        <td style={{ fontWeight: 600, color: "var(--forest)" }}>{record.year}</td>
        <td style={{ color: "var(--ink-60)" }}>{record.label || "annual"}</td>
        <td style={{ fontWeight: 700 }}>{t(record.total_kg_co2e)}</td>
        <td style={{ color: "var(--ink-60)" }}>{t(record.breakdown.energy_kg_co2e)}</td>
        <td style={{ color: "var(--ink-60)" }}>{t(record.breakdown.transport_kg_co2e)}</td>
        <td style={{ color: "var(--ink-60)" }}>{t(record.breakdown.diet_kg_co2e)}</td>
      </tr>
      {expanded && (
        <tr>
          <td
            colSpan={6}
            style={{ padding: "12px 12px 16px", animation: "fadeIn 0.2s ease both", background: "var(--surface-2)" }}
          >
            <div style={{ fontSize: 12, color: "var(--ink-60)", lineHeight: 1.75 }}>
              <span style={{ fontWeight: 600, color: "var(--ink-30)", marginRight: 8 }}>Sources</span>
              {Object.values(record.data_sources).join(", ")}
              {record.recorded_at && (
                <span style={{ marginLeft: 16, color: "var(--ink-30)" }}>
                  Recorded {new Date(record.recorded_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
