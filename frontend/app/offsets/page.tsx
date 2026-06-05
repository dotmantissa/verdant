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

const TYPE_ICONS: Record<string, string> = {
  forestry: "🌳",
  renewable_energy: "⚡",
  methane_capture: "💨",
  blue_carbon: "🌊",
  cookstoves: "🔥",
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
  const [expanded, setExpanded] = useState<string | null>(null);
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
    <div className="page">
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 10,
          }}
        >
          Verified offsets
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-60)", maxWidth: 560, lineHeight: 1.7 }}>
          Each project is checked against its Verra VCS or Gold Standard public registry.
          Inactive or fraudulent projects are rejected automatically.
        </p>
      </div>

      {!contractReady && (
        <div className="banner info">
          Offsets contract not configured. Deploy and set{" "}
          <code className="mono">NEXT_PUBLIC_OFFSETS_ADDRESS</code> to enable retirements.
        </div>
      )}

      {result && (
        <div className="banner success" style={{ justifyContent: "space-between" }}>
          <span>
            Retirement submitted — <strong>{result.project}</strong>
            <span className="mono" style={{ marginLeft: 8, opacity: 0.7 }}>{result.hash.slice(0, 18)}…</span>
          </span>
          <button
            onClick={() => setResult(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--forest)", fontFamily: "inherit", fontSize: 13, padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter pills */}
      <div className="anim-fade-up delay-1" style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`tag${filter === t ? " active" : ""}`}
          >
            {t !== "all" && TYPE_ICONS[t] && <span>{TYPE_ICONS[t]}</span>}
            {t === "all" ? "All" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {/* Project cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((p, i) => (
          <ProjectCard
            key={p.project_id}
            project={p}
            index={i}
            isExpanded={expanded === p.project_id}
            contractReady={contractReady}
            onToggle={() => setExpanded(expanded === p.project_id ? null : p.project_id)}
            onRetire={() => {
              setModal(p);
              setForm({ tonnes: "1.0", name: "", reason: "" });
              setError("");
            }}
          />
        ))}
      </div>

      {/* Retire modal */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--forest)",
                    marginBottom: 6,
                  }}
                >
                  Retire offsets
                </p>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  {modal.name}
                </h3>
                <p className="mono" style={{ color: "var(--ink-30)" }}>
                  {modal.project_id} · ${modal.price_usd_per_tonne} / t CO₂e
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--ink-30)", fontSize: 20, lineHeight: 1,
                  padding: "2px 6px", borderRadius: 6,
                  transition: "color 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--ink-30)")}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Tonnes CO₂e</label>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.tonnes}
                  onChange={e => setForm(f => ({ ...f, tonnes: e.target.value }))}
                  className="field-input"
                />
              </div>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Beneficiary name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name or organisation"
                  className="field-input"
                />
              </div>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Reason</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. 2024 annual footprint offset"
                  className="field-input"
                />
              </div>
            </div>

            {error && <div className="banner error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
              <button
                onClick={handleRetire}
                disabled={retiring || !form.tonnes || !form.name || !form.reason}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center" }}
              >
                {retiring ? <><span className="spinner" /> Submitting…</> : "Confirm retirement →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project, index, isExpanded, contractReady, onToggle, onRetire,
}: {
  project: Project;
  index: number;
  isExpanded: boolean;
  contractReady: boolean;
  onToggle: () => void;
  onRetire: () => void;
}) {
  const isVerra = project.registry === "verra";
  const registryColor = isVerra ? "var(--forest)" : "#b7791f";
  const registryBg = isVerra ? "rgba(83,116,95,0.1)" : "rgba(183,121,31,0.1)";

  return (
    <div
      className={`anim-fade-up delay-${Math.min(index + 1, 6)}`}
      style={{
        background: "white",
        border: "1.5px solid rgba(35,31,32,0.07)",
        borderRadius: 14,
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        cursor: "pointer",
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(35,31,32,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
      onClick={onToggle}
    >
      {/* Card top */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{TYPE_ICONS[project.project_type] ?? "🌿"}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--ink-30)",
              }}
            >
              {TYPE_LABELS[project.project_type] ?? project.project_type}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 100,
              background: registryBg,
              color: registryColor,
              flexShrink: 0,
            }}
          >
            {isVerra ? "Verra VCS" : "Gold Standard"}
          </span>
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.3,
            marginBottom: 6,
          }}
        >
          {project.name}
        </h3>

        <p style={{ fontSize: 12, color: "var(--ink-30)" }}>
          {project.country} · <span className="mono">{project.project_id}</span>
        </p>
      </div>

      {/* Expanded description */}
      {isExpanded && (
        <div
          style={{
            padding: "0 20px 16px",
            animation: "fadeIn 0.2s ease both",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.65 }}>
            {project.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(35,31,32,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            ${project.price_usd_per_tonne}
          </span>
          <span style={{ fontSize: 12, color: "var(--ink-30)", marginLeft: 4 }}>/ t CO₂e</span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onRetire(); }}
          disabled={!contractReady}
          className="btn btn-outline"
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          Retire →
        </button>
      </div>
    </div>
  );
}
