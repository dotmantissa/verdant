"use client";

import { useState } from "react";
import { WalletGate } from "@/components/WalletGate";
import { useWallet } from "@/hooks/useWallet";
import { retireOffsets } from "@/lib/genlayer";
import { OFFSETS_CONTRACT_ADDRESS } from "@/lib/constants";
import { IconTree, IconBolt, IconWind, IconWaves, IconFlame, IconLeaf, IconXMark } from "@/components/Icons";

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
    description: "785,000 hectares of Zimbabwean forest protected from illegal logging and agricultural conversion. One of the largest REDD+ projects in Africa.",
    registry: "verra",
    country: "Zimbabwe",
    project_type: "forestry",
    price_usd_per_tonne: "12.50",
  },
  {
    project_id: "GS-5409",
    name: "Olkaria Geothermal Expansion",
    description: "Expansion of Kenya's Olkaria geothermal plant, displacing diesel and heavy fuel oil generation with clean geothermal power.",
    registry: "gold_standard",
    country: "Kenya",
    project_type: "renewable_energy",
    price_usd_per_tonne: "18.00",
  },
  {
    project_id: "VCS-1566",
    name: "Mai Ndombe REDD+",
    description: "1.5 million hectares of tropical forest in the Democratic Republic of Congo, protected under one of the world's most ambitious conservation agreements.",
    registry: "verra",
    country: "DR Congo",
    project_type: "forestry",
    price_usd_per_tonne: "14.00",
  },
  {
    project_id: "GS-2185",
    name: "Improved Cookstoves Ethiopia",
    description: "High-efficiency biomass cookstoves distributed to rural households in Ethiopia. Reduces wood fuel use, indoor air pollution, and deforestation pressure.",
    registry: "gold_standard",
    country: "Ethiopia",
    project_type: "cookstoves",
    price_usd_per_tonne: "8.50",
  },
  {
    project_id: "VCS-2228",
    name: "Blue Carbon Mangrove Restoration",
    description: "Mangrove ecosystem restoration along the Tanzanian coast. Mangroves store carbon at rates far exceeding most terrestrial forests.",
    registry: "verra",
    country: "Tanzania",
    project_type: "blue_carbon",
    price_usd_per_tonne: "22.00",
  },
  {
    project_id: "GS-1788",
    name: "Biogas Digesters Rural India",
    description: "Livestock waste biogas digesters installed in Maharashtra and Uttar Pradesh, replacing kerosene and firewood for cooking and heating.",
    registry: "gold_standard",
    country: "India",
    project_type: "methane_capture",
    price_usd_per_tonne: "9.00",
  },
];

const TYPE_LABELS: Record<string, string> = {
  forestry:       "Forestry",
  renewable_energy:"Renewable energy",
  methane_capture: "Methane capture",
  blue_carbon:    "Blue carbon",
  cookstoves:     "Cookstoves",
};

function TypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  switch (type) {
    case "forestry":         return <IconTree  size={size} />;
    case "renewable_energy": return <IconBolt  size={size} />;
    case "methane_capture":  return <IconWind  size={size} />;
    case "blue_carbon":      return <IconWaves size={size} />;
    case "cookstoves":       return <IconFlame size={size} />;
    default:                 return <IconLeaf  size={size} />;
  }
}

export default function OffsetsPage() {
  return (
    <WalletGate>
      <Marketplace />
    </WalletGate>
  );
}

function Marketplace() {
  const { address, walletProvider } = useWallet();
  const [filter,   setFilter]  = useState("all");
  const [expanded, setExpanded]= useState<string | null>(null);
  const [modal,    setModal]   = useState<Project | null>(null);
  const [form,     setForm]    = useState({ tonnes: "1.0", name: "", reason: "" });
  const [retiring, setRetiring]= useState(false);
  const [result,   setResult]  = useState<{ hash: string; project: string } | null>(null);
  const [error,    setError]   = useState("");

  const contractReady = !!OFFSETS_CONTRACT_ADDRESS;
  const types    = ["all", ...new Set(PROJECTS.map(p => p.project_type))];
  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter(p => p.project_type === filter);

  async function handleRetire() {
    if (!address || !modal) return;
    setRetiring(true);
    setError("");
    try {
      const tx = await retireOffsets(address, walletProvider, {
        projectId:       modal.project_id,
        tonnesCo2e:      form.tonnes,
        beneficiaryName: form.name,
        reason:          form.reason,
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
      <div className="anim-fade-up" style={{ marginBottom: 44 }}>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 10,
          }}
        >
          Verified offset projects
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-60)", maxWidth: 540, lineHeight: 1.7 }}>
          Every project here is checked against its Verra VCS or Gold Standard listing
          before you can retire against it. If a project is inactive or fails verification,
          the contract blocks the retirement.
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
            Retirement submitted for <strong>{result.project}</strong>.{" "}
            <span className="mono" style={{ opacity: 0.75 }}>{result.hash.slice(0, 16)}…</span>
          </span>
          <button
            onClick={() => setResult(null)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--forest)", padding: 0, lineHeight: 1, flexShrink: 0,
              display: "flex", alignItems: "center",
            }}
          >
            <IconXMark size={16} />
          </button>
        </div>
      )}

      {/* Filter pills */}
      <div className="anim-fade-up delay-1" style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`tag${filter === t ? " active" : ""}`}
          >
            {t !== "all" && <TypeIcon type={t} size={14} />}
            {t === "all" ? "All projects" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid-cards">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--forest)",
                    marginBottom: 5,
                  }}
                >
                  Retire offsets
                </p>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  {modal.name}
                </h3>
                <p className="mono" style={{ color: "var(--ink-30)", fontSize: 12 }}>
                  {modal.project_id} &middot; ${modal.price_usd_per_tonne} per tonne
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--ink-30)", padding: "2px 4px", flexShrink: 0,
                  transition: "color 0.18s", display: "flex", alignItems: "center",
                }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--ink-30)")}
              >
                <IconXMark size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Tonnes CO₂e</label>
                <input type="number" min="0.01" step="0.01"
                  value={form.tonnes}
                  onChange={e => setForm(f => ({ ...f, tonnes: e.target.value }))}
                  className="field-input" />
              </div>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Beneficiary name</label>
                <input type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name or organisation"
                  className="field-input" />
              </div>
              <div className="field-wrap" style={{ marginBottom: 0 }}>
                <label className="field-label">Reason</label>
                <input type="text"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. 2024 annual footprint"
                  className="field-input" />
              </div>
            </div>

            {error && <div className="banner error">{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={handleRetire}
                disabled={retiring || !form.tonnes || !form.name || !form.reason}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {retiring ? <><span className="spinner" />Submitting</> : "Confirm retirement"}
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
  const regColor = isVerra ? "var(--forest)" : "#a16207";
  const regBg    = isVerra ? "var(--sage-15)" : "rgba(161,98,7,0.1)";

  return (
    <div
      className={`anim-fade-up delay-${Math.min(index + 1, 6)}`}
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(35,31,32,0.09)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
      onClick={onToggle}
    >
      <div style={{ padding: "18px 18px 14px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: "var(--forest)" }}><TypeIcon type={project.project_type} size={18} /></span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ink-30)" }}>
              {TYPE_LABELS[project.project_type] ?? project.project_type}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 100,
              background: regBg,
              color: regColor,
              flexShrink: 0,
            }}
          >
            {isVerra ? "Verra VCS" : "Gold Standard"}
          </span>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35, marginBottom: 5 }}>
          {project.name}
        </h3>
        <p style={{ fontSize: 12, color: "var(--ink-30)" }}>
          {project.country} &middot; <span className="mono">{project.project_id}</span>
        </p>

        {isExpanded && (
          <p style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.65, marginTop: 12, animation: "fadeIn 0.2s ease both" }}>
            {project.description}
          </p>
        )}
      </div>

      <div
        style={{
          padding: "13px 18px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
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
          Retire
        </button>
      </div>
    </div>
  );
}
