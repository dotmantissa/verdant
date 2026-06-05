"use client";

import { useState, useEffect } from "react";
import { WalletGate } from "@/components/WalletGate";
import { useWallet } from "@/hooks/useWallet";
import { submitFootprint } from "@/lib/genlayer";
import { FOOTPRINT_CONTRACT_ADDRESS } from "@/lib/constants";

const COUNTRIES = [
  ["US", "United States"], ["GB", "United Kingdom"], ["DE", "Germany"],
  ["FR", "France"], ["CN", "China"], ["IN", "India"], ["AU", "Australia"],
  ["CA", "Canada"], ["BR", "Brazil"], ["JP", "Japan"], ["SE", "Sweden"],
  ["NO", "Norway"], ["ZA", "South Africa"], ["NG", "Nigeria"], ["KE", "Kenya"],
  ["other", "Other"],
];

const HEATING_TYPES = [
  ["gas", "Natural gas"], ["oil", "Heating oil"], ["electric", "Electric"],
  ["heat_pump", "Heat pump"], ["district", "District heating"], ["wood", "Wood / biomass"],
];

const CAR_TYPES = [
  ["petrol", "Petrol"], ["diesel", "Diesel"], ["ev", "Electric"], ["average", "Unknown"],
];

const DIET_TYPES = [
  ["vegan", "Vegan", "No animal products"],
  ["vegetarian", "Vegetarian", "No meat"],
  ["pescatarian", "Pescatarian", "Fish, no meat"],
  ["low_meat", "Low meat", "Once or twice a week"],
  ["medium_meat", "Medium meat", "Most days"],
  ["high_meat", "High meat", "Most meals"],
];

type Step = "energy" | "transport" | "diet" | "review";
const STEPS: { id: Step; label: string }[] = [
  { id: "energy", label: "Energy" },
  { id: "transport", label: "Transport" },
  { id: "diet", label: "Diet" },
  { id: "review", label: "Review" },
];

export default function CalculatePage() {
  return (
    <WalletGate>
      <Calculator />
    </WalletGate>
  );
}

function Calculator() {
  const { signer } = useWallet();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [country, setCountry] = useState("GB");
  const [year] = useState(new Date().getFullYear());

  const [energy, setEnergy] = useState({
    electricity_kwh: "", heating_type: "gas", heating_kwh: "",
  });
  const [transport, setTransport] = useState({
    car_km: "", car_type: "average", domestic_flight_km: "",
    short_haul_flight_km: "", long_haul_flight_km: "", rail_km: "", bus_km: "",
  });
  const [diet, setDiet] = useState({
    diet_type: "medium_meat", beef_kg_week: "", dairy_litres_week: "", fish_kg_week: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ hash: string; status: string } | null>(null);
  const [txError, setTxError] = useState("");

  const contractReady = !!FOOTPRINT_CONTRACT_ADDRESS;

  function goTo(i: number) {
    setDirection(i > step ? "forward" : "back");
    setStep(i);
    setAnimKey(k => k + 1);
  }

  async function handleSubmit() {
    if (!signer) return;
    setSubmitting(true);
    setTxError("");
    try {
      const tx = await submitFootprint(signer, {
        energyData: JSON.stringify({
          electricity_kwh: parseFloat(energy.electricity_kwh) || 0,
          heating_type: energy.heating_type,
          heating_kwh: parseFloat(energy.heating_kwh) || 0,
        }),
        transportData: JSON.stringify({
          car_km: parseFloat(transport.car_km) || 0,
          car_type: transport.car_type,
          domestic_flight_km: parseFloat(transport.domestic_flight_km) || 0,
          short_haul_flight_km: parseFloat(transport.short_haul_flight_km) || 0,
          long_haul_flight_km: parseFloat(transport.long_haul_flight_km) || 0,
          rail_km: parseFloat(transport.rail_km) || 0,
          bus_km: parseFloat(transport.bus_km) || 0,
        }),
        dietData: JSON.stringify({
          diet_type: diet.diet_type,
          beef_kg_week: diet.beef_kg_week !== "" ? parseFloat(diet.beef_kg_week) : undefined,
          dairy_litres_week: diet.dairy_litres_week !== "" ? parseFloat(diet.dairy_litres_week) : undefined,
          fish_kg_week: diet.fish_kg_week !== "" ? parseFloat(diet.fish_kg_week) : undefined,
        }),
        countryCode: country,
        year,
        label: `${year} annual`,
      });
      setResult({ hash: tx.hash, status: tx.status });
    } catch (e: unknown) {
      setTxError((e as Error).message ?? "Transaction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="page-narrow">
        <div
          className="anim-scale-in"
          style={{
            background: "white",
            border: "1.5px solid rgba(35,31,32,0.07)",
            borderRadius: 16,
            padding: "40px 36px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: result.status === "failed"
                ? "rgba(192,57,43,0.1)"
                : "rgba(83,116,95,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 24,
            }}
          >
            {result.status === "failed" ? "✕" : result.status === "finalized" ? "✓" : "⏳"}
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 10,
              color: "var(--ink)",
            }}
          >
            {result.status === "finalized"
              ? "Recorded on-chain"
              : result.status === "failed"
              ? "Transaction failed"
              : "Awaiting consensus"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.65, marginBottom: 24 }}>
            {result.status === "finalized"
              ? "Your footprint has been calculated and recorded permanently on-chain."
              : result.status === "failed"
              ? "The transaction was rejected. Check your wallet and try again."
              : "GenLayer validators are reaching consensus. This usually takes under a minute."}
          </p>
          <div
            className="mono"
            style={{
              background: "rgba(83,116,95,0.08)",
              border: "1px solid rgba(83,116,95,0.2)",
              borderRadius: 8,
              padding: "12px 16px",
              color: "var(--forest)",
              wordBreak: "break-all",
              textAlign: "left",
              marginBottom: 32,
              fontSize: 11,
            }}
          >
            {result.hash}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a href="/dashboard" className="btn btn-primary">View dashboard →</a>
            <button onClick={() => { setResult(null); setStep(0); setAnimKey(k => k + 1); }} className="btn btn-ghost">
              Calculate again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <h1
        className="anim-fade-up"
        style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--ink)" }}
      >
        Calculate footprint
      </h1>
      <p className="anim-fade-up delay-1" style={{ fontSize: 14, color: "var(--ink-60)", marginBottom: 40 }}>
        Enter your annual data for {year}. All fields are optional — leave blank to use zero.
      </p>

      {/* Step track */}
      <div className="step-track anim-fade-up delay-2">
        {STEPS.map(({ id, label }, i) => (
          <>
            <div
              key={id}
              className={`step-item${i === step ? " active" : i < step ? " done" : ""}`}
              onClick={() => i < step && goTo(i)}
            >
              <div className="step-num">{i < step ? "✓" : i + 1}</div>
              <span style={{ fontSize: 12 }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div key={`connector-${i}`} className={`step-connector${i < step ? " done" : ""}`} />
            )}
          </>
        ))}
      </div>

      {/* Step content with animation */}
      <div
        key={animKey}
        className={direction === "forward" ? "anim-fade-up" : "anim-fade-in"}
        style={{ animationDuration: "0.3s" }}
      >
        {step === 0 && (
          <EnergyStep energy={energy} setEnergy={setEnergy} country={country} setCountry={setCountry} />
        )}
        {step === 1 && (
          <TransportStep transport={transport} setTransport={setTransport} />
        )}
        {step === 2 && (
          <DietStep diet={diet} setDiet={setDiet} />
        )}
        {step === 3 && (
          <ReviewStep
            energy={energy} transport={transport} diet={diet}
            country={country} year={year}
            contractReady={contractReady} submitting={submitting}
            error={txError} onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="btn btn-ghost"
          >
            ← Back
          </button>
          <button onClick={() => goTo(step + 1)} className="btn btn-primary">
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ────────────────────────────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      {hint && <p className="field-hint">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Steps ────────────────────────────────────────────────────────────── */
function EnergyStep({
  energy, setEnergy, country, setCountry,
}: {
  energy: { electricity_kwh: string; heating_type: string; heating_kwh: string };
  setEnergy: (v: typeof energy) => void;
  country: string;
  setCountry: (v: string) => void;
}) {
  return (
    <div>
      <StepHeading icon="⚡" title="Energy" subtitle="Your home electricity and heating usage for the year." />
      <Field label="Country" hint="Determines electricity grid emission intensity.">
        <select className="field-input" value={country} onChange={e => setCountry(e.target.value)}>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </Field>
      <Field label="Annual electricity use (kWh)" hint="Check your bills or smart meter. UK average ~3,100 kWh.">
        <input className="field-input" type="number" min="0" placeholder="3100"
          value={energy.electricity_kwh}
          onChange={e => setEnergy({ ...energy, electricity_kwh: e.target.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Heating fuel">
          <select className="field-input" value={energy.heating_type}
            onChange={e => setEnergy({ ...energy, heating_type: e.target.value })}>
            {HEATING_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Annual heating (kWh)" hint="UK avg ~12,000 kWh.">
          <input className="field-input" type="number" min="0" placeholder="12000"
            value={energy.heating_kwh}
            onChange={e => setEnergy({ ...energy, heating_kwh: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function TransportStep({
  transport, setTransport,
}: {
  transport: {
    car_km: string; car_type: string; domestic_flight_km: string;
    short_haul_flight_km: string; long_haul_flight_km: string;
    rail_km: string; bus_km: string;
  };
  setTransport: (v: typeof transport) => void;
}) {
  return (
    <div>
      <StepHeading icon="✈️" title="Transport" subtitle="Enter distances for the full year. Add both legs of return journeys." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Car distance (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.car_km}
            onChange={e => setTransport({ ...transport, car_km: e.target.value })} />
        </Field>
        <Field label="Car fuel type">
          <select className="field-input" value={transport.car_type}
            onChange={e => setTransport({ ...transport, car_type: e.target.value })}>
            {CAR_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Domestic flights (km)" hint="Under ~3 hours.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.domestic_flight_km}
          onChange={e => setTransport({ ...transport, domestic_flight_km: e.target.value })} />
      </Field>
      <Field label="Short-haul flights (km)" hint="3–6 hours, e.g. London–Barcelona ~2,300 km return.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.short_haul_flight_km}
          onChange={e => setTransport({ ...transport, short_haul_flight_km: e.target.value })} />
      </Field>
      <Field label="Long-haul flights (km)" hint="Over 6 hours, e.g. London–New York ~11,000 km return.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.long_haul_flight_km}
          onChange={e => setTransport({ ...transport, long_haul_flight_km: e.target.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Rail (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.rail_km}
            onChange={e => setTransport({ ...transport, rail_km: e.target.value })} />
        </Field>
        <Field label="Bus (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.bus_km}
            onChange={e => setTransport({ ...transport, bus_km: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function DietStep({
  diet, setDiet,
}: {
  diet: { diet_type: string; beef_kg_week: string; dairy_litres_week: string; fish_kg_week: string };
  setDiet: (v: typeof diet) => void;
}) {
  return (
    <div>
      <StepHeading icon="🥗" title="Diet" subtitle="Select the pattern that best describes your eating habits." />
      <Field label="Diet pattern">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {DIET_TYPES.map(([value, label, sub]) => {
            const active = diet.diet_type === value;
            return (
              <label
                key={value}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: "14px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: active ? "1.5px solid var(--forest)" : "1.5px solid rgba(35,31,32,0.08)",
                  background: active ? "rgba(83,116,95,0.07)" : "white",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="radio"
                  name="diet_type"
                  value={value}
                  checked={active}
                  onChange={() => setDiet({ ...diet, diet_type: value })}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--forest)" : "var(--ink)" }}>
                  {label}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-60)" }}>{sub}</span>
              </label>
            );
          })}
        </div>
      </Field>

      <p
        style={{
          fontSize: 12,
          color: "var(--ink-30)",
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          margin: "24px 0 12px",
        }}
      >
        Optional — override with weekly quantities
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 14px" }}>
        <Field label="Beef (kg/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="0"
            value={diet.beef_kg_week}
            onChange={e => setDiet({ ...diet, beef_kg_week: e.target.value })} />
        </Field>
        <Field label="Dairy (L/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="3.5"
            value={diet.dairy_litres_week}
            onChange={e => setDiet({ ...diet, dairy_litres_week: e.target.value })} />
        </Field>
        <Field label="Fish (kg/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="0"
            value={diet.fish_kg_week}
            onChange={e => setDiet({ ...diet, fish_kg_week: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function ReviewStep({
  energy, transport, diet, country, year,
  contractReady, submitting, error, onSubmit,
}: {
  energy: { electricity_kwh: string; heating_type: string; heating_kwh: string };
  transport: {
    car_km: string; car_type: string; domestic_flight_km: string;
    short_haul_flight_km: string; long_haul_flight_km: string; rail_km: string; bus_km: string;
  };
  diet: { diet_type: string; beef_kg_week: string; dairy_litres_week: string; fish_kg_week: string };
  country: string; year: number;
  contractReady: boolean; submitting: boolean; error: string; onSubmit: () => void;
}) {
  const rows = [
    ["Country", country.toUpperCase()],
    ["Year", String(year)],
    ["Electricity", `${energy.electricity_kwh || 0} kWh`],
    ["Heating", `${energy.heating_kwh || 0} kWh (${energy.heating_type})`],
    ["Car", `${transport.car_km || 0} km (${transport.car_type})`],
    ["Flights", `${transport.domestic_flight_km || 0} + ${transport.short_haul_flight_km || 0} + ${transport.long_haul_flight_km || 0} km`],
    ["Rail", `${transport.rail_km || 0} km`],
    ["Bus", `${transport.bus_km || 0} km`],
    ["Diet", diet.diet_type.replace(/_/g, " ")],
  ];

  return (
    <div>
      <StepHeading icon="📋" title="Review" subtitle="Once submitted, this record is permanent on-chain, tied to your wallet." />

      <div
        style={{
          background: "white",
          border: "1.5px solid rgba(35,31,32,0.07)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        {rows.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(35,31,32,0.05)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(35,31,32,0.015)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--ink-60)" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{value}</span>
          </div>
        ))}
      </div>

      {!contractReady && (
        <div className="banner info" style={{ marginBottom: 20 }}>
          Contract address not set. Deploy and configure{" "}
          <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>NEXT_PUBLIC_FOOTPRINT_ADDRESS</code>.
        </div>
      )}

      {error && (
        <div className="banner error">{error}</div>
      )}

      <button
        onClick={onSubmit}
        disabled={!contractReady || submitting}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 14 }}
      >
        {submitting ? (
          <><span className="spinner" /> Submitting…</>
        ) : (
          "Record on-chain →"
        )}
      </button>
    </div>
  );
}

function StepHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-60)", marginLeft: 34 }}>{subtitle}</p>
    </div>
  );
}
