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

// Seed data — real registered projects for demonstration
// When the contract is deployed, this is stored on-chain
const SEED_PROJECTS: ProjectDraft[] = [
  {
    project_id: "VCS-934",
    name: "Kariba REDD+ Forest Protection",
    description:
      "Protecting 785,000 hectares of Zimbabwe forest from illegal logging and agricultural conversion. Certified under Verra VCS.",
    project_url: "https://registry.verra.org/app/projectDetail/VCS/934",
    registry: "verra",
    country: "ZW",
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
    country: "KE",
    project_type: "renewable_energy",
    price_usd_per_tonne: "18.00",
  },
  {
    project_id: "VCS-1566",
    name: "Mai Ndombe REDD+",
    description:
      "Protecting 1.5 million hectares of humid tropical forest in the Democratic Republic of Congo, the second-largest tropical forest in the world.",
    project_url: "https://registry.verra.org",
    registry: "verra",
    country: "CD",
    project_type: "forestry",
    price_usd_per_tonne: "14.00",
  },
  {
    project_id: "GS-2185",
    name: "Improved Cookstoves Ethiopia",
    description:
      "Distributing efficient biomass cookstoves to households in rural Ethiopia, cutting wood fuel consumption and reducing indoor air pollution.",
    project_url: "https://registry.goldstandard.org",
    registry: "gold_standard",
    country: "ET",
    project_type: "cookstoves",
    price_usd_per_tonne: "8.50",
  },
  {
    project_id: "VCS-2228",
    name: "Blue Carbon Mangrove Restoration",
    description:
      "Restoring degraded mangrove ecosystems along the Tanzanian coast. Mangroves store 10x more carbon per hectare than tropical forests.",
    project_url: "https://registry.verra.org",
    registry: "verra",
    country: "TZ",
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
    country: "IN",
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
  const [retireResult, setRetireResult] = useState<{
    pid: string;
    hash: string;
    status: string;
  } | null>(null);
  const [retireForm, setRetireForm] = useState<{
    pid: string;
    tonnes: string;
    name: string;
    reason: string;
  } | null>(null);
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
  const filtered =
    filter === "all"
      ? SEED_PROJECTS
      : SEED_PROJECTS.filter((p) => p.project_type === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <p
        style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.2em", color: "#6C6C74" }}
        className="text-xs uppercase mb-3"
      >
        Verified projects
      </p>
      <h1
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
        className="text-4xl text-[#EEEEEF] mb-4"
      >
        Offset marketplace
      </h1>
      <p className="text-sm mb-8 max-w-lg" style={{ color: "#A0A0AB" }}>
        Each project here is checked against its public registry before you can
        retire against it. Fraudulent or inactive projects are blocked
        automatically.
      </p>

      {/* Filter */}
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
            {t === "all" ? "All projects" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {!contractReady && (
        <div
          className="p-4 rounded-xl border mb-8 text-sm"
          style={{ backgroundColor: "#F59E0B10", borderColor: "#F59E0B30", color: "#F59E0B" }}
        >
          Offset contract not configured. Set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_OFFSETS_ADDRESS</code> after deploying the contract. Projects are shown for preview.
        </div>
      )}

      {retireResult && (
        <div
          className="p-4 rounded-xl border mb-8 text-sm"
          style={{ backgroundColor: "#1A4D3220", borderColor: "#3DCC7A30", color: "#3DCC7A" }}
        >
          Retirement submitted. Transaction: {retireResult.hash.slice(0, 20)}...{" "}
          <span style={{ color: "#6C6C74" }}>({retireResult.status})</span>
          <button
            className="ml-4 text-xs underline"
            style={{ color: "#6C6C74" }}
            onClick={() => setRetireResult(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {error && <p className="text-[#EF4444] text-sm mb-6">{error}</p>}

      {/* Project grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project) => (
          <ProjectCard
            key={project.project_id}
            project={project}
            isRetiring={retiring === project.project_id}
            onRetire={() =>
              setRetireForm({
                pid: project.project_id,
                tonnes: "1.0",
                name: "",
                reason: "Personal carbon footprint offset",
              })
            }
            contractReady={contractReady}
          />
        ))}
      </div>

      {/* Retire modal */}
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

// ------------------------------------------------------------------

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
  const registryColors: Record<string, string> = {
    verra: "#3DCC7A",
    gold_standard: "#F59E0B",
    other: "#A0A0AB",
  };
  const color = registryColors[project.registry] ?? "#A0A0AB";

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col justify-between"
      style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
    >
      <div>
        {/* Type + registry */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${color}15`,
              color,
              border: `1px solid ${color}30`,
              fontFamily: "Space Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
            }}
          >
            {TYPE_LABELS[project.project_type] ?? project.project_type}
          </span>
          <span className="text-xs" style={{ color: "#6C6C74" }}>
            {project.country}
          </span>
        </div>

        <h3
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "-0.01em" }}
          className="text-base text-[#EEEEEF] mb-2 leading-snug"
        >
          {project.name}
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "#A0A0AB" }}>
          {project.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs" style={{ color: "#6C6C74" }}>
            {project.registry === "verra" ? "Verra VCS" : project.registry === "gold_standard" ? "Gold Standard" : project.registry} verified
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span
          style={{
            fontFamily: "Space Mono, monospace",
            color: "#3DCC7A",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          ${project.price_usd_per_tonne} / tonne
        </span>
        <button
          onClick={onRetire}
          disabled={isRetiring || !contractReady}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-95 active:scale-90 disabled:opacity-40"
          style={{
            backgroundColor: "#3DCC7A",
            color: "#0F0F11",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          {isRetiring ? "Processing..." : "Retire offsets"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------

type RetireFormState = {
  pid: string;
  tonnes: string;
  name: string;
  reason: string;
};

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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "#0F0F11CC", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
              className="text-lg text-[#EEEEEF] mb-1"
            >
              Retire offsets
            </h3>
            <p className="text-xs" style={{ color: "#6C6C74" }}>
              {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6C6C74] hover:text-[#EEEEEF] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#6C6C74" }}>
              Tonnes CO₂e to retire
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.tonnes}
              onChange={(e) => onChange({ ...form, tonnes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={{
                backgroundColor: "#222228",
                color: "#EEEEEF",
                borderColor: "#2A2A2F",
                fontFamily: "Space Mono, monospace",
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#6C6C74" }}>
              Beneficiary name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="Your name or organisation"
              className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={{
                backgroundColor: "#222228",
                color: "#EEEEEF",
                borderColor: "#2A2A2F",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#6C6C74" }}>
              Reason
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => onChange({ ...form, reason: e.target.value })}
              placeholder="e.g. 2024 personal footprint"
              className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors"
              style={{
                backgroundColor: "#222228",
                color: "#EEEEEF",
                borderColor: "#2A2A2F",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm border transition-all duration-150 hover:scale-95"
            style={{
              color: "#A0A0AB",
              borderColor: "#2A2A2F",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !form.tonnes || !form.name}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: "#3DCC7A",
              color: "#0F0F11",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {loading ? "Submitting..." : "Confirm retirement"}
          </button>
        </div>
      </div>
    </div>
  );
}
