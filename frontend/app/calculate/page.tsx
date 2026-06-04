"use client";

import { useState } from "react";
import { WalletGate } from "@/components/WalletBar";
import { useWallet } from "@/hooks/useWallet";
import { submitFootprint } from "@/lib/genlayer";
import { FOOTPRINT_CONTRACT_ADDRESS } from "@/lib/constants";

type EnergyData = {
  electricity_kwh: string;
  heating_type: string;
  heating_kwh: string;
};

type TransportData = {
  car_km: string;
  car_type: string;
  domestic_flight_km: string;
  short_haul_flight_km: string;
  long_haul_flight_km: string;
  rail_km: string;
  bus_km: string;
};

type DietData = {
  diet_type: string;
  beef_kg_week: string;
  dairy_litres_week: string;
  fish_kg_week: string;
};

type ResultState = {
  hash: string;
  status: "pending" | "finalized" | "failed";
  result?: unknown;
};

const COUNTRIES = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["CN", "China"],
  ["IN", "India"],
  ["AU", "Australia"],
  ["CA", "Canada"],
  ["BR", "Brazil"],
  ["JP", "Japan"],
  ["SE", "Sweden"],
  ["NO", "Norway"],
  ["ZA", "South Africa"],
  ["NG", "Nigeria"],
  ["KE", "Kenya"],
  ["other", "Other country"],
];

const STEPS = ["Energy", "Transport", "Diet", "Submit"];

export default function CalculatePage() {
  return (
    <WalletGate>
      <CalculatorForm />
    </WalletGate>
  );
}

function CalculatorForm() {
  const { signer } = useWallet();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("GB");
  const [year] = useState(new Date().getFullYear());

  const [energy, setEnergy] = useState<EnergyData>({
    electricity_kwh: "",
    heating_type: "gas",
    heating_kwh: "",
  });

  const [transport, setTransport] = useState<TransportData>({
    car_km: "",
    car_type: "average",
    domestic_flight_km: "",
    short_haul_flight_km: "",
    long_haul_flight_km: "",
    rail_km: "",
    bus_km: "",
  });

  const [diet, setDiet] = useState<DietData>({
    diet_type: "medium_meat",
    beef_kg_week: "",
    dairy_litres_week: "",
    fish_kg_week: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState("");

  const contractReady = !!FOOTPRINT_CONTRACT_ADDRESS;

  async function handleSubmit() {
    if (!signer) return;
    setSubmitting(true);
    setError("");
    try {
      const energyPayload = {
        electricity_kwh: parseFloat(energy.electricity_kwh) || 0,
        heating_type: energy.heating_type,
        heating_kwh: parseFloat(energy.heating_kwh) || 0,
      };
      const transportPayload = {
        car_km: parseFloat(transport.car_km) || 0,
        car_type: transport.car_type,
        domestic_flight_km: parseFloat(transport.domestic_flight_km) || 0,
        short_haul_flight_km: parseFloat(transport.short_haul_flight_km) || 0,
        long_haul_flight_km: parseFloat(transport.long_haul_flight_km) || 0,
        rail_km: parseFloat(transport.rail_km) || 0,
        bus_km: parseFloat(transport.bus_km) || 0,
      };
      const dietPayload = {
        diet_type: diet.diet_type,
        beef_kg_week: parseFloat(diet.beef_kg_week) || undefined,
        dairy_litres_week: parseFloat(diet.dairy_litres_week) || undefined,
        fish_kg_week: parseFloat(diet.fish_kg_week) || undefined,
      };

      const tx = await submitFootprint(signer, {
        energyData: JSON.stringify(energyPayload),
        transportData: JSON.stringify(transportPayload),
        dietData: JSON.stringify(dietPayload),
        countryCode: country,
        year,
        label: `${year} annual`,
      });
      setResult(tx);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Transaction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <SubmissionResult result={result} onReset={() => { setResult(null); setStep(0); }} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Header */}
      <p
        style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.2em", color: "#6C6C74" }}
        className="text-xs uppercase mb-3"
      >
        Step {step + 1} of {STEPS.length}
      </p>
      <h1
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
        className="text-4xl text-[#EEEEEF] mb-2"
      >
        {STEPS[step]}
      </h1>

      {/* Progress bar */}
      <div
        className="h-0.5 w-full rounded-full mb-10 mt-6"
        style={{ backgroundColor: "#2A2A2F" }}
      >
        <div
          className="h-0.5 rounded-full transition-all duration-500"
          style={{
            backgroundColor: "#3DCC7A",
            width: `${((step + 1) / STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* Step content */}
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
          energy={energy}
          transport={transport}
          diet={diet}
          country={country}
          year={year}
          contractReady={contractReady}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 hover:scale-95 active:scale-90 disabled:opacity-30"
            style={{
              color: "#A0A0AB",
              borderColor: "#2A2A2F",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-transform duration-150 hover:scale-95 active:scale-90"
            style={{
              backgroundColor: "#3DCC7A",
              color: "#0F0F11",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "#EEEEEF", fontFamily: "Space Grotesk, sans-serif" }}
      >
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-2" style={{ color: "#6C6C74" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm border outline-none focus:border-[#3DCC7A] transition-colors duration-150";
const inputStyle = {
  backgroundColor: "#1A1A1E",
  color: "#EEEEEF",
  borderColor: "#2A2A2F",
  fontFamily: "Space Grotesk, sans-serif",
};

// ------------------------------------------------------------------

function EnergyStep({
  energy,
  setEnergy,
  country,
  setCountry,
}: {
  energy: EnergyData;
  setEnergy: (v: EnergyData) => void;
  country: string;
  setCountry: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm mb-8" style={{ color: "#A0A0AB" }}>
        Your home energy use — where the biggest lever usually is.
      </p>
      <Field label="Country" hint="Electricity emission intensity varies significantly by country.">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </Field>
      <Field label="Annual electricity use (kWh)" hint="Check your energy bills or smart meter. UK average is about 3,100 kWh.">
        <input
          type="number"
          min="0"
          value={energy.electricity_kwh}
          onChange={(e) => setEnergy({ ...energy, electricity_kwh: e.target.value })}
          placeholder="3100"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
      <Field label="Heating fuel type">
        <select
          value={energy.heating_type}
          onChange={(e) => setEnergy({ ...energy, heating_type: e.target.value })}
          className={inputClass}
          style={inputStyle}
        >
          {[
            ["gas", "Natural gas"],
            ["oil", "Heating oil"],
            ["electric", "Electric heating"],
            ["heat_pump", "Heat pump"],
            ["district", "District heating"],
            ["wood", "Wood / biomass"],
          ].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Annual heating energy (kWh)" hint="Equivalent kWh for your heating. For gas, multiply your therms by 29.3. UK average is around 12,000 kWh.">
        <input
          type="number"
          min="0"
          value={energy.heating_kwh}
          onChange={(e) => setEnergy({ ...energy, heating_kwh: e.target.value })}
          placeholder="12000"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
    </div>
  );
}

// ------------------------------------------------------------------

function TransportStep({
  transport,
  setTransport,
}: {
  transport: TransportData;
  setTransport: (v: TransportData) => void;
}) {
  return (
    <div>
      <p className="text-sm mb-8" style={{ color: "#A0A0AB" }}>
        Distance is more honest than number of trips. Check your car odometer
        or a travel app for the year if you have it.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Car km this year">
          <input
            type="number"
            min="0"
            value={transport.car_km}
            onChange={(e) => setTransport({ ...transport, car_km: e.target.value })}
            placeholder="12000"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Car fuel type">
          <select
            value={transport.car_type}
            onChange={(e) => setTransport({ ...transport, car_type: e.target.value })}
            className={inputClass}
            style={inputStyle}
          >
            {[
              ["petrol", "Petrol"],
              ["diesel", "Diesel"],
              ["ev", "Electric"],
              ["average", "Average (unknown)"],
            ].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Domestic flight distance (km)" hint="Flights under 3 hours. Add both legs of round trips.">
        <input
          type="number"
          min="0"
          value={transport.domestic_flight_km}
          onChange={(e) => setTransport({ ...transport, domestic_flight_km: e.target.value })}
          placeholder="0"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
      <Field label="Short-haul flight distance (km)" hint="Flights 3–6 hours, e.g. London–Barcelona.">
        <input
          type="number"
          min="0"
          value={transport.short_haul_flight_km}
          onChange={(e) => setTransport({ ...transport, short_haul_flight_km: e.target.value })}
          placeholder="0"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
      <Field label="Long-haul flight distance (km)" hint="Flights over 6 hours, e.g. London–New York is roughly 5,500 km each way.">
        <input
          type="number"
          min="0"
          value={transport.long_haul_flight_km}
          onChange={(e) => setTransport({ ...transport, long_haul_flight_km: e.target.value })}
          placeholder="0"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rail km">
          <input
            type="number"
            min="0"
            value={transport.rail_km}
            onChange={(e) => setTransport({ ...transport, rail_km: e.target.value })}
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Bus km">
          <input
            type="number"
            min="0"
            value={transport.bus_km}
            onChange={(e) => setTransport({ ...transport, bus_km: e.target.value })}
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------

const dietOptions = [
  ["vegan", "Vegan", "No animal products at all"],
  ["vegetarian", "Vegetarian", "No meat, some dairy and eggs"],
  ["pescatarian", "Pescatarian", "No meat, but fish"],
  ["low_meat", "Low meat", "Meat once or twice a week"],
  ["medium_meat", "Medium meat", "Meat most days"],
  ["high_meat", "High meat", "Meat at most meals"],
];

function DietStep({
  diet,
  setDiet,
}: {
  diet: DietData;
  setDiet: (v: DietData) => void;
}) {
  return (
    <div>
      <p className="text-sm mb-8" style={{ color: "#A0A0AB" }}>
        Diet is typically 20–30% of a personal footprint. Choose the pattern
        that best fits. You can override with specific quantities below.
      </p>
      <Field label="Diet pattern">
        <div className="grid grid-cols-1 gap-2">
          {dietOptions.map(([value, label, desc]) => (
            <button
              key={value}
              onClick={() => setDiet({ ...diet, diet_type: value })}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 hover:scale-95"
              style={{
                backgroundColor: diet.diet_type === value ? "#1A4D3230" : "#1A1A1E",
                borderColor: diet.diet_type === value ? "#3DCC7A50" : "#2A2A2F",
              }}
            >
              <span
                className="mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center"
                style={{
                  borderColor: diet.diet_type === value ? "#3DCC7A" : "#2A2A2F",
                }}
              >
                {diet.diet_type === value && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3DCC7A" }} />
                )}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#EEEEEF" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6C6C74" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Field>
      <p className="text-xs mb-4" style={{ color: "#6C6C74" }}>
        Optional: override with your actual weekly quantities.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Beef (kg/week)">
          <input
            type="number"
            min="0"
            step="0.1"
            value={diet.beef_kg_week}
            onChange={(e) => setDiet({ ...diet, beef_kg_week: e.target.value })}
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Dairy (litres/week)">
          <input
            type="number"
            min="0"
            step="0.1"
            value={diet.dairy_litres_week}
            onChange={(e) => setDiet({ ...diet, dairy_litres_week: e.target.value })}
            placeholder="3.5"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Fish (kg/week)">
          <input
            type="number"
            min="0"
            step="0.1"
            value={diet.fish_kg_week}
            onChange={(e) => setDiet({ ...diet, fish_kg_week: e.target.value })}
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------

function ReviewStep({
  energy,
  transport,
  diet,
  country,
  year,
  contractReady,
  submitting,
  error,
  onSubmit,
}: {
  energy: EnergyData;
  transport: TransportData;
  diet: DietData;
  country: string;
  year: number;
  contractReady: boolean;
  submitting: boolean;
  error: string;
  onSubmit: () => void;
}) {
  const rows = [
    ["Country", country.toUpperCase()],
    ["Year", year.toString()],
    ["Electricity", `${energy.electricity_kwh || 0} kWh`],
    ["Heating", `${energy.heating_kwh || 0} kWh (${energy.heating_type})`],
    ["Car", `${transport.car_km || 0} km (${transport.car_type})`],
    ["Flights", `D:${transport.domestic_flight_km || 0} S:${transport.short_haul_flight_km || 0} L:${transport.long_haul_flight_km || 0} km`],
    ["Rail + bus", `${transport.rail_km || 0} + ${transport.bus_km || 0} km`],
    ["Diet", diet.diet_type.replace("_", " ")],
  ];

  return (
    <div>
      <p className="text-sm mb-8" style={{ color: "#A0A0AB" }}>
        Review what you have entered. Once submitted, the footprint record is
        permanent and tied to your wallet.
      </p>
      <div
        className="rounded-xl border overflow-hidden mb-8"
        style={{ borderColor: "#2A2A2F" }}
      >
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className="flex justify-between px-5 py-3 text-sm"
            style={{
              backgroundColor: i % 2 === 0 ? "#1A1A1E" : "#222228",
            }}
          >
            <span style={{ color: "#6C6C74" }}>{label}</span>
            <span
              style={{
                color: "#EEEEEF",
                fontFamily: "Space Mono, monospace",
                fontSize: "0.75rem",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {!contractReady && (
        <div
          className="p-4 rounded-xl border mb-6 text-sm"
          style={{ backgroundColor: "#F59E0B10", borderColor: "#F59E0B30", color: "#F59E0B" }}
        >
          Contract address not configured. Deploy the contract and set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_FOOTPRINT_ADDRESS</code> to submit on-chain.
        </div>
      )}

      {error && (
        <p className="text-sm text-[#EF4444] mb-4">{error}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={!contractReady || submitting}
        className="w-full py-4 rounded-xl font-medium text-[#0F0F11] transition-all duration-150 hover:scale-95 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "#3DCC7A",
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        {submitting ? "Submitting to chain..." : "Record my footprint on-chain"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------

function SubmissionResult({
  result,
  onReset,
}: {
  result: ResultState;
  onReset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border"
        style={{
          borderColor:
            result.status === "finalized"
              ? "#3DCC7A30"
              : result.status === "failed"
              ? "#EF444430"
              : "#F59E0B30",
          backgroundColor:
            result.status === "finalized"
              ? "#1A4D3220"
              : result.status === "failed"
              ? "#EF444410"
              : "#F59E0B10",
        }}
      >
        {result.status === "finalized" ? (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l6 6 10-12" stroke="#3DCC7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : result.status === "failed" ? (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M8 8l12 12M20 8L8 20" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="animate-spin">
            <circle cx="14" cy="14" r="10" stroke="#F59E0B" strokeWidth="2" strokeDasharray="40 20" />
          </svg>
        )}
      </div>

      <h2
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
        className="text-3xl text-[#EEEEEF] mb-3"
      >
        {result.status === "finalized"
          ? "Footprint recorded"
          : result.status === "failed"
          ? "Transaction failed"
          : "Waiting for consensus"}
      </h2>
      <p className="text-sm mb-6" style={{ color: "#A0A0AB" }}>
        {result.status === "finalized"
          ? "Your carbon footprint has been calculated and recorded on-chain. View it in your dashboard."
          : result.status === "failed"
          ? "The transaction did not go through. Check your wallet and try again."
          : "GenLayer validators are reaching consensus on your footprint calculation. This usually takes under a minute."}
      </p>

      <div
        className="p-3 rounded-lg mb-8 text-left"
        style={{ backgroundColor: "#1A1A1E" }}
      >
        <p className="text-xs" style={{ color: "#6C6C74" }}>Transaction</p>
        <p
          className="text-xs mt-1 break-all"
          style={{ color: "#3DCC7A", fontFamily: "Space Mono, monospace" }}
        >
          {result.hash}
        </p>
      </div>

      <div className="flex gap-3">
        <a
          href="/dashboard"
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-transform duration-150 hover:scale-95 active:scale-90"
          style={{
            backgroundColor: "#3DCC7A",
            color: "#0F0F11",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          View dashboard
        </a>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-150 hover:scale-95 active:scale-90"
          style={{
            color: "#A0A0AB",
            borderColor: "#2A2A2F",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Calculate again
        </button>
      </div>
    </div>
  );
}
