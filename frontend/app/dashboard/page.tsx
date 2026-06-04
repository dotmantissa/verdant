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
    energy_kg_co2e: number;
    transport_kg_co2e: number;
    diet_kg_co2e: number;
    detail?: Record<string, number>;
  };
  data_sources: Record<string, string>;
  recorded_at: string;
};

type EmissionCtx = {
  global_average_t_co2e: number;
  paris_target_t_co2e: number;
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
    Promise.all([readFootprintHistory(address, provider), readEmissionContext(provider)])
      .then(([hist, emCtx]) => {
        setHistory(hist as FootprintRecord[]);
        setCtx(emCtx as EmissionCtx);
      })
      .catch((e: unknown) => setError((e as Error).message ?? "Failed to load."))
      .finally(() => setLoading(false));
  }, [address, provider]);

  if (loading) return <Shell><p style={{ fontSize: 12, color: "#333" }}>loading…</p></Shell>;
  if (error) return <Shell><p style={{ fontSize: 12, color: "#f87171" }}>{error}</p></Shell>;

  const latest = history[history.length - 1];
  const latestT = latest ? latest.total_kg_co2e / 1000 : null;

  if (history.length === 0) {
    return (
      <Shell>
        <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#3dcc7a", textTransform: "uppercase", marginBottom: 20 }}>
          No records
        </p>
        <p style={{ fontSize: 12, color: "#444", marginBottom: 28, lineHeight: 1.6 }}>
          No footprint data for this wallet yet. Calculate once and it will appear here, permanently.
        </p>
        <Link href="/calculate" className="dash-btn">calculate now →</Link>
        <style>{`.dash-btn { display:inline-block; border:1px solid #3dcc7a; color:#3dcc7a; font-family:inherit; font-size:12px; letter-spacing:0.08em; padding:8px 18px; text-decoration:none; } .dash-btn:hover { background:#3dcc7a; color:#0a0a0a; }`}</style>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Top-line numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1px", background: "#111", marginBottom: 48 }}>
        <StatCell
          label="your latest footprint"
          value={latestT !== null ? `${latestT.toFixed(2)} t` : "—"}
          accent
        />
        <StatCell
          label="global average"
          value={ctx ? `${ctx.global_average_t_co2e} t` : "—"}
          note={latestT && ctx
            ? latestT < ctx.global_average_t_co2e
              ? `${(((ctx.global_average_t_co2e - latestT) / ctx.global_average_t_co2e) * 100).toFixed(0)}% below average`
              : `${(((latestT - ctx.global_average_t_co2e) / ctx.global_average_t_co2e) * 100).toFixed(0)}% above average`
            : undefined}
        />
        <StatCell
          label="paris 2°C target"
          value={ctx ? `${ctx.paris_target_t_co2e} t` : "—"}
          note={latestT && ctx
            ? latestT > ctx.paris_target_t_co2e
              ? `${(latestT - ctx.paris_target_t_co2e).toFixed(1)} t above target`
              : "on target"
            : undefined}
        />
        <StatCell label="records on-chain" value={String(history.length)} />
      </div>

      {/* Latest breakdown */}
      {latest && (
        <section style={{ marginBottom: 48 }}>
          <SectionLabel>breakdown — {latest.label || latest.year}</SectionLabel>
          <Breakdown record={latest} />
        </section>
      )}

      {/* Year chart */}
      {history.length > 1 && (
        <section style={{ marginBottom: 48 }}>
          <SectionLabel>year over year</SectionLabel>
          <YearChart history={history} />
        </section>
      )}

      {/* History table */}
      <section>
        <SectionLabel>all records ({history.length})</SectionLabel>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {["year", "label", "total CO₂e", "energy", "transport", "diet"].map(h => (
                <th key={h} style={{ padding: "6px 12px 6px 0", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", color: "#333", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((rec, i) => (
              <HistoryRow key={i} record={rec} />
            ))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 80px" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#3dcc7a", textTransform: "uppercase", marginBottom: 32 }}>
        Dashboard
      </p>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#333", textTransform: "uppercase", marginBottom: 12 }}>
      {children}
    </p>
  );
}

function StatCell({ label, value, accent, note }: { label: string; value: string; accent?: boolean; note?: string }) {
  return (
    <div style={{ background: "#0a0a0a", padding: "20px 20px" }}>
      <p style={{ fontSize: 10, color: "#333", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, color: accent ? "#3dcc7a" : "#e8e8e8", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: note ? 8 : 0 }}>
        {value}
      </p>
      {note && <p style={{ fontSize: 10, color: "#3dcc7a", opacity: 0.6 }}>{note}</p>}
    </div>
  );
}

function Breakdown({ record }: { record: FootprintRecord }) {
  const total = record.total_kg_co2e || 1;
  const segs = [
    { label: "energy", val: record.breakdown.energy_kg_co2e, color: "#3dcc7a" },
    { label: "transport", val: record.breakdown.transport_kg_co2e, color: "#2a9d5c" },
    { label: "diet", val: record.breakdown.diet_kg_co2e, color: "#1a5c38" },
  ];

  return (
    <div>
      {/* Bar */}
      <div style={{ display: "flex", height: 6, marginBottom: 16, gap: 1 }}>
        {segs.map(({ label, val, color }) => (
          <div
            key={label}
            style={{ flex: Math.max(val, 0.01), background: color, transition: "flex 0.3s" }}
            title={`${label}: ${(val / 1000).toFixed(2)} t`}
          />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 28 }}>
        {segs.map(({ label, val, color }) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#444" }}>{label}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#e8e8e8", letterSpacing: "-0.02em" }}>
              {(val / 1000).toFixed(2)} t
            </span>
            <span style={{ fontSize: 10, color: "#333", marginLeft: 6 }}>
              ({total > 0 ? ((val / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearChart({ history }: { history: FootprintRecord[] }) {
  const max = Math.max(...history.map(r => r.total_kg_co2e), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {history.map(rec => {
        const h = Math.max((rec.total_kg_co2e / max) * 72, 2);
        return (
          <div key={`${rec.year}-${rec.label}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{ width: 32, height: h, background: "#1a3d26" }}
              title={`${rec.label || rec.year}: ${(rec.total_kg_co2e / 1000).toFixed(2)} t CO₂e`}
            />
            <span style={{ fontSize: 9, color: "#333" }}>{rec.year}</span>
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
      <tr
        style={{ borderBottom: "1px solid #111", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        <td style={{ padding: "10px 12px 10px 0", color: "#3dcc7a" }}>{record.year}</td>
        <td style={{ padding: "10px 12px 10px 0", color: "#555" }}>{record.label || "annual"}</td>
        <td style={{ padding: "10px 12px 10px 0", color: "#e8e8e8", fontWeight: 500 }}>{t(record.total_kg_co2e)}</td>
        <td style={{ padding: "10px 12px 10px 0", color: "#444" }}>{t(record.breakdown.energy_kg_co2e)}</td>
        <td style={{ padding: "10px 12px 10px 0", color: "#444" }}>{t(record.breakdown.transport_kg_co2e)}</td>
        <td style={{ padding: "10px 12px 10px 0", color: "#444" }}>{t(record.breakdown.diet_kg_co2e)}</td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: "1px solid #111" }}>
          <td colSpan={6} style={{ padding: "10px 0 16px" }}>
            <div style={{ fontSize: 11, color: "#444", lineHeight: 1.8 }}>
              <span style={{ color: "#333" }}>sources: </span>
              {Object.values(record.data_sources).join(", ")}
              {record.recorded_at && (
                <span style={{ marginLeft: 20, color: "#333" }}>
                  recorded: {new Date(record.recorded_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
