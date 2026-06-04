"use client";

import { useState } from "react";
import { WalletGate } from "@/components/WalletBar";
import { useWallet } from "@/hooks/useWallet";
import { retireOffsets } from "@/lib/genlayer";
import { OFFSETS_CONTRACT_ADDRESS } from "@/lib/constants";

type ProjectDraft = {
  project_id: string;
  name: string;
  description: string;
  project_url: string;
  registry: string;
  country: string;
  project_type: string;
  price_usd_per_tonne: string;
};

const SEED_PROJECTS: ProjectDraft[] = [
  {
    project_id: "VCS-934",
    name: "Kariba REDD+ Forest Protection",
    description:
      "Protecting 785,000 hectares of Zimbabwe forest from illegal logging and agricultural conversion. Certified under Verra VCS.",
    project_url: "https://registry.verra.org/app/projectDetail/VCS/934",
    registry: "verra",
    country: "Zimbabwe",
    project_type: "forestry",
    price_usd_per_tonne: "12.50",
  },
  {
    project_id: "GS-5409",
    name: "Olkaria Geothermal Expansion",
    description:
      "Expanding Kenya's Olkaria geothermal plant, reducing dependence on diesel and heavy fuel oil generation in the East African power grid.",
    project_url: "https://registry.goldstandard.org",
    registry: "gold_standard",
    country: "Kenya",
    project_type: "renewable_energy",
    price_usd_per_tonne: "18.00",
  },
  {
    project_id: "VCS-1566",
    name: "Mai Ndombe REDD+",
    description:
      "Protecting 1.5 million hectares of humid tropical forest in the Democratic Republic of Congo.",
    project_url: "https://registry.verra.org",
    registry: "verra",
    country: "DR Congo",
    project_type: "forestry",
    price_usd_per_tonne: "14.00",
  },
  {
    project_id: "GS-2185",
    name: "Improved Cookstoves Ethiopia",
    description:
      "Distributing efficient biomass cookstoves to households in rural Ethiopia, cutting wood fuel use and indoor air pollution.",
    project_url: "https://registry.goldstandard.org",
    registry: "gold_standard",
    country: "Ethiopia",
    project_type: "cookstoves",
    price_usd_per_tonne: "8.50",
  },
  {
    project_id: "VCS-2228",
    name: "Blue Carbon Mangrove Restoration",
    description:
      "Restoring degraded mangrove ecosystems along the Tanzanian coast. Mangroves store roughly 10x more carbon per hectare than tropical forests.",
    project_url: "https://registry.verra.org",
    registry: "verra",
    country: "Tanzania",
    project_type: "blue_carbon",
    price_usd_per_tonne: "22.00",
  },
  {
    project_id: "GS-1788",
    name: "Biogas Digesters Rural India",
    description:
      "Agricultural biogas digesters in Maharashtra and Uttar Pradesh, converting livestock waste to cooking fuel and replacing wood.",
    project_url: "https://registry.goldstandard.org",
    registry: "gold_standard",
    country: "India",
    project_type: "methane_capture",
    price_usd_per_tonne: "9.00",
  },
];

const TYPE_LABELS: Record<string, string> = {
  forestry: "Forest protection",
  renewable_energy: "Renewable energy",
  methane_capture: "Methane capture",
  energy_efficiency: "Energy efficiency",
  blue_carbon: "Blue carbon",
  cookstoves: "Clean cookstoves",
  other: "Other",
};

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra VCS",
  gold_standard: "Gold Standard",
};

const REGISTRY_COLOR: Record<string, string> = {
  verra: "#3DCC7A",
  gold_standard: "#F59E0B",
};

export default function OffsetsPage() {
  return (
    <WalletGate>
      <OffsetMarketplace />
    </WalletGate>
  );
}

function OffsetMarketplace() {
  const { signer } = useWallet();
  const [retiring, setRetiring] = useState<string | null>(null);
  const [retireResult, setRetireResult] = useState<{ pid: string; hash: string; status: string } | null>(null);
  const [retireForm, setRetireForm] = useState<{ pid: string; tonnes: string; name: string; reason: string } | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const contractReady = !!OFFSETS_CONTRACT_ADDRESS;

  async function handleRetire() {
    if (!signer || !retireForm) return;
    setRetiring(retireForm.pid);
    setError("");
    try {
      const result = await retireOffsets(signer, {
        projectId: retireForm.pid,
        tonnesCo2e: retireForm.tonnes,
        beneficiaryName: retireForm.name,
        reason: retireForm.reason,
      });
      setRetireResult({ pid: retireForm.pid, hash: result.hash, status: result.status });
      setRetireForm(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Retirement failed.");
    } finally {
      setRetiring(null);
    }
  }

  const projectTypes = ["all", ...new Set(SEED_PROJECTS.map((p) => p.project_type))];
  const filtered = filter === "all" ? SEED_PROJECTS : SEED_PROJECTS.filter((p) => p.project_type === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-[0.2em] mb-3"
        style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
      >
        Verified projects
      </p>
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
        <div>
          <h1
            className="text-4xl mb-4"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", color: "#EEEEEF" }}
          >
            Offset marketplace
          </h1>
          <p className="text-sm max-w-lg leading-relaxed" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
            Each project is checked against its public registry before you can
            retire against it. Fraudulent or inactive projects are blocked automatically.
          </p>
        </div>
        {!contractReady && (
          <div
            className="px-4 py-3 rounded-xl border text-xs max-w-sm"
            style={{ backgroundColor: "#F59E0B08", borderColor: "#F59E0B25", color: "#F59E0B", fontFamily: "Space Grotesk, sans-serif" }}
          >
            Contract not configured. Deploy and set{" "}
            <code className="font-mono">NEXT_PUBLIC_OFFSETS_ADDRESS</code> to enable retirements.
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {projectTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 hover:scale-95"
            style={{
              backgroundColor: filter === t ? "#3DCC7A" : "#1A1A1E",
              color: filter === t ? "#0F0F11" : "#A0A0AB",
              border: `1px solid ${filter === t ? "#3DCC7A" : "#2A2A2F"}`,
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {t === "all" ? "All" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {retireResult && (
        <div
          className="flex items-center justify-between p-4 rounded-xl border mb-8 text-sm"
          style={{ backgroundColor: "#0D2B1A", borderColor: "#3DCC7A25" }}
        >
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke="#3DCC7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: "#3DCC7A", fontFamily: "Space Grotesk, sans-serif" }}>
              Retirement submitted
            </span>
            <span style={{ color: "#6C6C74", fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>
              {retireResult.hash.slice(0, 18)}…
            </span>
          </div>
          <button onClick={() => setRetireResult(null)} className="text-xs" style={{ color: "#6C6C74" }}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm mb-6" style={{ color: "#EF4444", fontFamily: "Space Grotesk, sans-serif" }}>{error}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <ProjectCard
            key={project.project_id}
            project={project}
            isRetiring={retiring === project.project_id}
            onRetire={() =>
              setRetireForm({ pid: project.project_id, tonnes: "1.0", name: "", reason: "Personal carbon footprint offset" })
            }
            contractReady={contractReady}
          />
        ))}
      </div>

      {retireForm && (
        <RetireModal
          project={SEED_PROJECTS.find((p) => p.project_id === retireForm.pid)!}
          form={retireForm}
          onChange={(f) => setRetireForm(f)}
          onClose={() => setRetireForm(null)}
          onConfirm={handleRetire}
          loading={!!retiring}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  isRetiring,
  onRetire,
  contractReady,
}: {
  project: ProjectDraft;
  isRetiring: boolean;
  onRetire: () => void;
  contractReady: boolean;
}) {
  const regColor = REGISTRY_COLOR[project.registry] ?? "#A0A0AB";
  const regLabel = REGISTRY_LABEL[project.registry] ?? project.registry;

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col"
      style={{ backgroundColor: "#111115", borderColor: "#2A2A2F" }}
    >
      {/* Top meta */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: `${regColor}12`,
            color: regColor,
            border: `1px solid ${regColor}25`,
            fontFamily: "Space Mono, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
          }}
        >
          {regLabel}
        </span>
        <span className="text-xs" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
          {project.country}
        </span>
      </div>

      {/* Type label */}
      <p className="text-xs mb-2" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
        {TYPE_LABELS[project.project_type] ?? project.project_type}
      </p>

      <h3
        className="text-lg mb-3 leading-snug"
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "-0.02em", color: "#EEEEEF" }}
      >
        {project.name}
      </h3>

      <p className="text-xs leading-relaxed flex-1 mb-5" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#2A2A2F" }}>
        <div>
          <p
            style={{ fontFamily: "Space Mono, monospace", color: "#EEEEEF", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            ${project.price_usd_per_tonne}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
            per tonne CO₂e
          </p>
        </div>
        <button
          onClick={onRetire}
          disabled={isRetiring || !contractReady}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-95 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#3DCC7A",
            color: "#0F0F11",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          {isRetiring ? "Processing..." : "Retire"}
        </button>
      </div>
    </div>
  );
}

type RetireFormState = { pid: string; tonnes: string; name: string; reason: string };

function RetireModal({
  project,
  form,
  onChange,
  onClose,
  onConfirm,
  loading,
}: {
  project: ProjectDraft;
  form: RetireFormState;
  onChange: (f: RetireFormState) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const inputStyle = {
    backgroundColor: "#0F0F11",
    color: "#EEEEEF",
    borderColor: "#2A2A2F",
    fontFamily: "Space Grotesk, sans-serif",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "#0F0F11CC", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-7"
        style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs mb-1" style={{ color: "#6C6C74", fontFamily: "Space Mono, monospace", letterSpacing: "0.15em" }}>
              RETIRING OFFSETS
            </p>
            <h3
              className="text-xl leading-snug max-w-[280px]"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#EEEEEF" }}
            >
              {project.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 shrink-0 transition-colors"
            style={{ color: "#6C6C74" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#EEEEEF")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#6C6C74")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
              Tonnes CO₂e to retire
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.tonnes}
              onChange={(e) => onChange({ ...form, tonnes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={{ ...inputStyle, fontFamily: "Space Mono, monospace" }}
            />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
              Beneficiary name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="Your name or organisation"
              className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
              Reason
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => onChange({ ...form, reason: e.target.value })}
              placeholder="e.g. 2024 personal footprint"
              className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm border transition-all duration-150 hover:scale-95"
            style={{ color: "#A0A0AB", borderColor: "#2A2A2F", fontFamily: "Space Grotesk, sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !form.tonnes || !form.name || !form.reason}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#3DCC7A", color: "#0F0F11", fontFamily: "Space Grotesk, sans-serif" }}
          >
            {loading ? "Submitting..." : "Confirm retirement"}
          </button>
        </div>
      </div>
    </div>
  );
}
