"use client";

import { useState } from "react";
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
  ["vegan", "Vegan — no animal products"],
  ["vegetarian", "Vegetarian — no meat"],
  ["pescatarian", "Pescatarian — fish, no meat"],
  ["low_meat", "Low meat — once or twice a week"],
  ["medium_meat", "Medium meat — most days"],
  ["high_meat", "High meat — most meals"],
];

type Step = "energy" | "transport" | "diet" | "review";
const STEPS: Step[] = ["energy", "transport", "diet", "review"];

export default function CalculatePage() {
  return (
    <WalletGate>
      <Calculator />
    </WalletGate>
  );
}

function Calculator() {
  const { signer } = useWallet();
  const [step, setStep] = useState<number>(0);
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
      <Page>
        <Label>Transaction submitted</Label>
        <p style={{ fontSize: 12, color: "#555", marginBottom: 24 }}>
          {result.status === "finalized"
            ? "Your footprint has been calculated and recorded on-chain."
            : result.status === "failed"
            ? "The transaction was rejected. Check your wallet and try again."
            : "GenLayer validators are reaching consensus. This usually takes under a minute."}
        </p>
        <pre style={{ fontSize: 11, color: "#3dcc7a", wordBreak: "break-all", whiteSpace: "pre-wrap", marginBottom: 32 }}>
          {result.hash}
        </pre>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/dashboard" className="form-btn-primary">view dashboard</a>
          <button onClick={() => { setResult(null); setStep(0); }} className="form-btn-ghost">
            calculate again
          </button>
        </div>
        <FormStyles />
      </Page>
    );
  }

  return (
    <Page>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 40, borderBottom: "1px solid #1a1a1a" }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "8px 0",
              marginRight: 24,
              color: i === step ? "#e8e8e8" : i < step ? "#3dcc7a" : "#333",
              borderBottom: i === step ? "1px solid #3dcc7a" : "1px solid transparent",
              marginBottom: -1,
              cursor: i < step ? "pointer" : "default",
            }}
            onClick={() => i < step && setStep(i)}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <EnergyStep
          energy={energy} setEnergy={setEnergy}
          country={country} setCountry={setCountry}
        />
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

      {step < 3 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="form-btn-ghost"
            style={{ opacity: step === 0 ? 0.2 : 1 }}
          >
            ← back
          </button>
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            className="form-btn-primary"
          >
            continue →
          </button>
        </div>
      )}

      <FormStyles />
    </Page>
  );
}

// ── Layout wrappers ────────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "52px 24px 80px" }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#3dcc7a", textTransform: "uppercase", marginBottom: 20 }}>
      {children}
    </p>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: hint ? 4 : 8, letterSpacing: "0.05em" }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: "#333", marginBottom: 8, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── Steps ──────────────────────────────────────────────────────────────

function EnergyStep({
  energy, setEnergy, country, setCountry,
}: {
  energy: { electricity_kwh: string; heating_type: string; heating_kwh: string };
  setEnergy: (v: typeof energy) => void;
  country: string;
  setCountry: (v: string) => void;
}) {
  return (
    <>
      <Label>Energy</Label>
      <Field label="country" hint="Determines electricity grid emission intensity.">
        <select className="field-input" value={country} onChange={e => setCountry(e.target.value)}>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </Field>
      <Field label="annual electricity use (kWh)" hint="Check your bills or smart meter. UK average ~3,100 kWh.">
        <input className="field-input" type="number" min="0" placeholder="3100"
          value={energy.electricity_kwh}
          onChange={e => setEnergy({ ...energy, electricity_kwh: e.target.value })} />
      </Field>
      <Field label="heating fuel">
        <select className="field-input" value={energy.heating_type}
          onChange={e => setEnergy({ ...energy, heating_type: e.target.value })}>
          {HEATING_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="annual heating energy (kWh)" hint="For gas, multiply therms by 29.3. UK average ~12,000 kWh.">
        <input className="field-input" type="number" min="0" placeholder="12000"
          value={energy.heating_kwh}
          onChange={e => setEnergy({ ...energy, heating_kwh: e.target.value })} />
      </Field>
    </>
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
    <>
      <Label>Transport</Label>
      <p style={{ fontSize: 12, color: "#444", marginBottom: 28, lineHeight: 1.6 }}>
        Enter distances for the year. Add both legs of return journeys.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="car distance (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.car_km}
            onChange={e => setTransport({ ...transport, car_km: e.target.value })} />
        </Field>
        <Field label="car fuel">
          <select className="field-input" value={transport.car_type}
            onChange={e => setTransport({ ...transport, car_type: e.target.value })}>
            {CAR_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>
      <Field label="domestic flights (km)" hint="Under ~3 hours.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.domestic_flight_km}
          onChange={e => setTransport({ ...transport, domestic_flight_km: e.target.value })} />
      </Field>
      <Field label="short-haul flights (km)" hint="3–6 hours, e.g. London–Barcelona ~2,300 km return.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.short_haul_flight_km}
          onChange={e => setTransport({ ...transport, short_haul_flight_km: e.target.value })} />
      </Field>
      <Field label="long-haul flights (km)" hint="Over 6 hours, e.g. London–New York ~11,000 km return.">
        <input className="field-input" type="number" min="0" placeholder="0"
          value={transport.long_haul_flight_km}
          onChange={e => setTransport({ ...transport, long_haul_flight_km: e.target.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="rail (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.rail_km}
            onChange={e => setTransport({ ...transport, rail_km: e.target.value })} />
        </Field>
        <Field label="bus (km)">
          <input className="field-input" type="number" min="0" placeholder="0"
            value={transport.bus_km}
            onChange={e => setTransport({ ...transport, bus_km: e.target.value })} />
        </Field>
      </div>
    </>
  );
}

function DietStep({
  diet, setDiet,
}: {
  diet: { diet_type: string; beef_kg_week: string; dairy_litres_week: string; fish_kg_week: string };
  setDiet: (v: typeof diet) => void;
}) {
  return (
    <>
      <Label>Diet</Label>
      <Field label="diet pattern">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {DIET_TYPES.map(([value, label]) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: diet.diet_type === value ? "#e8e8e8" : "#555",
                background: diet.diet_type === value ? "#111" : "transparent",
                borderLeft: diet.diet_type === value ? "2px solid #3dcc7a" : "2px solid transparent",
              }}
            >
              <input
                type="radio"
                name="diet_type"
                value={value}
                checked={diet.diet_type === value}
                onChange={() => setDiet({ ...diet, diet_type: value })}
                style={{ accentColor: "#3dcc7a" }}
              />
              {label}
            </label>
          ))}
        </div>
      </Field>
      <p style={{ fontSize: 11, color: "#333", marginBottom: 16, marginTop: 8 }}>
        Optional — override with actual weekly quantities:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <Field label="beef (kg/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="0"
            value={diet.beef_kg_week}
            onChange={e => setDiet({ ...diet, beef_kg_week: e.target.value })} />
        </Field>
        <Field label="dairy (L/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="3.5"
            value={diet.dairy_litres_week}
            onChange={e => setDiet({ ...diet, dairy_litres_week: e.target.value })} />
        </Field>
        <Field label="fish (kg/week)">
          <input className="field-input" type="number" min="0" step="0.1" placeholder="0"
            value={diet.fish_kg_week}
            onChange={e => setDiet({ ...diet, fish_kg_week: e.target.value })} />
        </Field>
      </div>
    </>
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
    ["country", country.toUpperCase()],
    ["year", String(year)],
    ["electricity", `${energy.electricity_kwh || 0} kWh`],
    ["heating", `${energy.heating_kwh || 0} kWh (${energy.heating_type})`],
    ["car", `${transport.car_km || 0} km (${transport.car_type})`],
    ["flights", `${transport.domestic_flight_km || 0} + ${transport.short_haul_flight_km || 0} + ${transport.long_haul_flight_km || 0} km`],
    ["rail", `${transport.rail_km || 0} km`],
    ["bus", `${transport.bus_km || 0} km`],
    ["diet", diet.diet_type.replace("_", " ")],
  ];

  return (
    <>
      <Label>Review</Label>
      <p style={{ fontSize: 12, color: "#444", marginBottom: 28, lineHeight: 1.6 }}>
        Once submitted the record is permanent on-chain, tied to your wallet.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 32 }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #111" }}>
              <td style={{ padding: "8px 0", color: "#444", paddingRight: 32 }}>{label}</td>
              <td style={{ padding: "8px 0", color: "#e8e8e8" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!contractReady && (
        <p style={{ fontSize: 11, color: "#666", marginBottom: 20, padding: "10px 14px", border: "1px solid #1a1a1a" }}>
          Contract address not set. Deploy the contract and configure{" "}
          <code style={{ color: "#888" }}>NEXT_PUBLIC_FOOTPRINT_ADDRESS</code>.
        </p>
      )}

      {error && (
        <p style={{ fontSize: 11, color: "#f87171", marginBottom: 16 }}>{error}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={!contractReady || submitting}
        className="form-btn-primary"
        style={{ opacity: (!contractReady || submitting) ? 0.4 : 1, cursor: (!contractReady || submitting) ? "not-allowed" : "pointer" }}
      >
        {submitting ? "submitting…" : "record on-chain →"}
      </button>
    </>
  );
}

function FormStyles() {
  return (
    <style>{`
      .field-input {
        width: 100%;
        background: #0f0f0f;
        border: 1px solid #1e1e1e;
        color: #e8e8e8;
        font-family: inherit;
        font-size: 13px;
        padding: 9px 12px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        transition: border-color 0.15s;
      }
      .field-input:focus { border-color: #3dcc7a; }
      .form-btn-primary {
        background: none;
        border: 1px solid #3dcc7a;
        color: #3dcc7a;
        font-family: inherit;
        font-size: 12px;
        letter-spacing: 0.08em;
        padding: 9px 18px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: background 0.15s, color 0.15s;
      }
      .form-btn-primary:hover { background: #3dcc7a; color: #0a0a0a; }
      .form-btn-ghost {
        background: none;
        border: 1px solid #1e1e1e;
        color: #444;
        font-family: inherit;
        font-size: 12px;
        letter-spacing: 0.08em;
        padding: 9px 18px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: border-color 0.15s, color 0.15s;
      }
      .form-btn-ghost:hover { border-color: #333; color: #666; }
    `}</style>
  );
}
