"use client";

import { useState } from "react";
import { WalletGate } from "@/components/WalletGate";
import { useWallet } from "@/hooks/useWallet";
import { retireOffsets } from "@/lib/genlayer";
import { OFFSETS_CONTRACT_ADDRESS } from "@/lib/constants";

type Project = {
  project_id: string;
  name: string;
  description: string;
  registry: string;
  country: string;
  project_type: string;
  price_usd_per_tonne: string;
};

const PROJECTS: Project[] = [
  {
    project_id: "VCS-934",
    name: "Kariba REDD+ Forest Protection",
    description: "785,000 ha of Zimbabwe forest protected from illegal logging and agricultural conversion.",
    registry: "verra",
    country: "Zimbabwe",
    project_type: "forestry",
    price_usd_per_tonne: "12.50",
  },
  {
    project_id: "GS-5409",
    name: "Olkaria Geothermal Expansion",
    description: "Kenya's Olkaria geothermal plant expansion, replacing diesel and heavy fuel oil generation.",
    registry: "gold_standard",
    country: "Kenya",
    project_type: "renewable_energy",
    price_usd_per_tonne: "18.00",
  },
  {
    project_id: "VCS-1566",
    name: "Mai Ndombe REDD+",
    description: "1.5 million ha of tropical forest protection in the Democratic Republic of Congo.",
    registry: "verra",
    country: "DR Congo",
    project_type: "forestry",
    price_usd_per_tonne: "14.00",
  },
  {
    project_id: "GS-2185",
    name: "Improved Cookstoves Ethiopia",
    description: "Efficient biomass cookstoves to rural Ethiopian households, reducing wood fuel use.",
    registry: "gold_standard",
    country: "Ethiopia",
    project_type: "cookstoves",
    price_usd_per_tonne: "8.50",
  },
  {
    project_id: "VCS-2228",
    name: "Blue Carbon Mangrove Restoration",
    description: "Mangrove ecosystem restoration along the Tanzanian coast.",
    registry: "verra",
    country: "Tanzania",
    project_type: "blue_carbon",
    price_usd_per_tonne: "22.00",
  },
  {
    project_id: "GS-1788",
    name: "Biogas Digesters Rural India",
    description: "Livestock waste biogas digesters in Maharashtra and Uttar Pradesh.",
    registry: "gold_standard",
    country: "India",
    project_type: "methane_capture",
    price_usd_per_tonne: "9.00",
  },
];

const TYPE_LABELS: Record<string, string> = {
  forestry: "Forestry",
  renewable_energy: "Renewable energy",
  methane_capture: "Methane capture",
  blue_carbon: "Blue carbon",
  cookstoves: "Cookstoves",
};

export default function OffsetsPage() {
  return (
    <WalletGate>
      <Marketplace />
    </WalletGate>
  );
}

function Marketplace() {
  const { signer } = useWallet();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState<Project | null>(null);
  const [form, setForm] = useState({ tonnes: "1.0", name: "", reason: "" });
  const [retiring, setRetiring] = useState(false);
  const [result, setResult] = useState<{ hash: string; project: string } | null>(null);
  const [error, setError] = useState("");

  const contractReady = !!OFFSETS_CONTRACT_ADDRESS;
  const types = ["all", ...new Set(PROJECTS.map(p => p.project_type))];
  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter(p => p.project_type === filter);

  async function handleRetire() {
    if (!signer || !modal) return;
    setRetiring(true);
    setError("");
    try {
      const tx = await retireOffsets(signer, {
        projectId: modal.project_id,
        tonnesCo2e: form.tonnes,
        beneficiaryName: form.name,
        reason: form.reason,
      });
      setResult({ hash: tx.hash, project: modal.name });
      setModal(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Retirement failed.");
    } finally {
      setRetiring(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 80px" }}>
      {/* Header */}
      <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#3dcc7a", textTransform: "uppercase", marginBottom: 20 }}>
        Verified offset projects
      </p>
      <p style={{ fontSize: 12, color: "#444", maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
        Each project is checked against its Verra VCS or Gold Standard public registry before
        retirement is permitted. Inactive or fraudulent projects are rejected automatically.
      </p>

      {!contractReady && (
        <div style={{ fontSize: 11, color: "#666", padding: "10px 14px", border: "1px solid #1a1a1a", marginBottom: 28 }}>
          Offsets contract not configured. Deploy and set{" "}
          <code style={{ color: "#888" }}>NEXT_PUBLIC_OFFSETS_ADDRESS</code> to enable retirements.
        </div>
      )}

      {result && (
        <div style={{ fontSize: 11, color: "#3dcc7a", padding: "10px 14px", border: "1px solid #1a3d26", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Retirement submitted — {result.project} — tx: {result.hash.slice(0, 20)}…</span>
          <button onClick={() => setResult(null)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>dismiss</button>
        </div>
      )}

      {/* Type filter */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              background: "none",
              border: `1px solid ${filter === t ? "#3dcc7a" : "#1e1e1e"}`,
              color: filter === t ? "#3dcc7a" : "#444",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: "0.08em",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            {t === "all" ? "all" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {/* Projects table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
            {["id", "project", "type", "country", "registry", "price / t CO₂e", ""].map(h => (
              <th key={h} style={{ padding: "6px 16px 6px 0", textAlign: "left", fontSize: 10, letterSpacing: "0.08em", color: "#333", fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <ProjectRow
              key={p.project_id}
              project={p}
              contractReady={contractReady}
              onRetire={() => {
                setModal(p);
                setForm({ tonnes: "1.0", name: "", reason: "" });
                setError("");
              }}
            />
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(10,10,10,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", width: "100%", maxWidth: 440, padding: 32 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3dcc7a", textTransform: "uppercase", marginBottom: 12 }}>
              Retire offsets
            </p>
            <p style={{ fontSize: 14, color: "#e8e8e8", marginBottom: 6 }}>{modal.name}</p>
            <p style={{ fontSize: 11, color: "#444", marginBottom: 28 }}>{modal.project_id} · ${modal.price_usd_per_tonne} / t CO₂e</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "#444", marginBottom: 6, letterSpacing: "0.06em" }}>tonnes CO₂e</label>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.tonnes}
                  onChange={e => setForm(f => ({ ...f, tonnes: e.target.value }))}
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e", color: "#e8e8e8", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "#444", marginBottom: 6, letterSpacing: "0.06em" }}>beneficiary name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="your name or organisation"
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e", color: "#e8e8e8", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "#444", marginBottom: 6, letterSpacing: "0.06em" }}>reason</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. 2024 annual footprint offset"
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1e1e1e", color: "#e8e8e8", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none" }}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: 11, color: "#f87171", marginBottom: 16 }}>{error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setModal(null)}
                style={{ flex: 1, background: "none", border: "1px solid #1e1e1e", color: "#444", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.08em", padding: "9px 0", cursor: "pointer" }}
              >
                cancel
              </button>
              <button
                onClick={handleRetire}
                disabled={retiring || !form.tonnes || !form.name || !form.reason}
                style={{
                  flex: 2, background: "none",
                  border: "1px solid #3dcc7a", color: "#3dcc7a",
                  fontFamily: "inherit", fontSize: 11, letterSpacing: "0.08em",
                  padding: "9px 0", cursor: retiring ? "not-allowed" : "pointer",
                  opacity: (retiring || !form.tonnes || !form.name || !form.reason) ? 0.4 : 1,
                }}
              >
                {retiring ? "submitting…" : "confirm retirement →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project, contractReady, onRetire,
}: {
  project: Project;
  contractReady: boolean;
  onRetire: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const regColor = project.registry === "verra" ? "#3dcc7a" : project.registry === "gold_standard" ? "#f59e0b" : "#555";

  return (
    <>
      <tr
        style={{ borderBottom: "1px solid #111", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        <td style={{ padding: "12px 16px 12px 0", color: "#444", fontSize: 11 }}>{project.project_id}</td>
        <td style={{ padding: "12px 16px 12px 0", color: "#e8e8e8" }}>{project.name}</td>
        <td style={{ padding: "12px 16px 12px 0", color: "#555", fontSize: 11 }}>{TYPE_LABELS[project.project_type] ?? project.project_type}</td>
        <td style={{ padding: "12px 16px 12px 0", color: "#555", fontSize: 11 }}>{project.country}</td>
        <td style={{ padding: "12px 16px 12px 0", fontSize: 11 }}>
          <span style={{ color: regColor }}>{project.registry === "gold_standard" ? "Gold Standard" : "Verra VCS"}</span>
        </td>
        <td style={{ padding: "12px 16px 12px 0", color: "#e8e8e8", fontWeight: 500 }}>
          ${project.price_usd_per_tonne}
        </td>
        <td style={{ padding: "12px 0" }}>
          <button
            onClick={e => { e.stopPropagation(); onRetire(); }}
            disabled={!contractReady}
            style={{
              background: "none", border: "1px solid #1e1e1e",
              color: "#555", fontFamily: "inherit", fontSize: 10,
              letterSpacing: "0.06em", padding: "4px 12px", cursor: contractReady ? "pointer" : "not-allowed",
              opacity: contractReady ? 1 : 0.3,
              whiteSpace: "nowrap",
            }}
          >
            retire
          </button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: "1px solid #111" }}>
          <td colSpan={7} style={{ padding: "8px 0 14px", fontSize: 11, color: "#444", lineHeight: 1.65 }}>
            {project.description}
          </td>
        </tr>
      )}
    </>
  );
}
