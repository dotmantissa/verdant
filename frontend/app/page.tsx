"use client";

import { useState } from "react";
import Link from "next/link";
import { VerdantMark } from "@/components/Logo";

function GlowWord({
  children,
  color = "#3DCC7A",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color,
        transition: "text-shadow 0.3s ease",
        textShadow: hovered
          ? `0 0 20px ${color}E6, 0 0 50px ${color}99, 0 0 100px ${color}4D`
          : "none",
        cursor: "default",
      }}
    >
      {children}
    </span>
  );
}

const steps = [
  {
    n: "01",
    title: "Submit your data",
    body: "Energy bills, how you get around, what you eat. You control the inputs. No account required, no data leaves your wallet.",
  },
  {
    n: "02",
    title: "Verified against real sources",
    body: "Our contracts fetch emission factors from IEA, DEFRA, and Our World in Data — not a sponsor-influenced average.",
  },
  {
    n: "03",
    title: "Recorded on-chain, permanently",
    body: "Your footprint is stored against your wallet address. Compare year to year. No one can alter the record.",
  },
  {
    n: "04",
    title: "Offset with confidence",
    body: "Offset projects are verified by AI against public registry data before you can purchase. If the monitoring data doesn't support the claim, the project gets flagged.",
  },
];

const problems = [
  "Calculators that give wildly different numbers depending on who funded them.",
  "Offset projects that turn out to be fraudulent with no way to check in advance.",
  "No persistent record to compare against last year.",
  "Platforms that use your concern to sell you something.",
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#0F0F11" }}>
      {/* Hero */}
      <section className="px-6 pt-28 pb-24">
        <div className="max-w-6xl mx-auto">
          <p
            style={{
              fontFamily: "Space Mono, monospace",
              letterSpacing: "0.2em",
              color: "#3DCC7A",
            }}
            className="text-xs uppercase mb-8"
          >
            On-chain carbon tracking
          </p>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
            className="text-5xl md:text-7xl lg:text-8xl text-[#EEEEEF] mb-8 max-w-4xl"
          >
            Your footprint.{" "}
            <span style={{ WebkitTextStroke: "2px #3DCC7A", color: "transparent" }}>
              Actually
            </span>{" "}
            verified.
          </h1>
          <p
            style={{ fontFamily: "Space Grotesk, sans-serif", color: "#A0A0AB" }}
            className="text-lg md:text-xl leading-relaxed max-w-xl mb-10"
          >
            You enter your energy bills, travel records, and diet. We
            cross-reference against real emissions databases, not whatever a
            sponsor wants you to believe. The number goes on-chain, permanent
            and yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/calculate"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-medium text-[#0F0F11] transition-transform duration-150 hover:scale-95 active:scale-90"
              style={{
                backgroundColor: "#3DCC7A",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Calculate your footprint
            </Link>
            <Link
              href="/offsets"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-medium transition-all duration-150 hover:scale-95 active:scale-90 border"
              style={{
                color: "#A0A0AB",
                borderColor: "#2A2A2F",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              View verified offsets
            </Link>
          </div>
        </div>
      </section>

      {/* Numbers row */}
      <section
        className="px-6 py-16 border-t border-b"
        style={{ borderColor: "#2A2A2F" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "4.7t", label: "Global average CO₂e per person" },
            { value: "2.3t", label: "Paris Agreement target per person" },
            { value: "IEA", label: "Electricity data sourced from" },
            { value: "On-chain", label: "Where your record lives" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "Space Mono, monospace",
                  color: "#3DCC7A",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {value}
              </div>
              <p
                className="text-sm mt-1.5"
                style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem section */}
      <section
        className="py-28 px-6 border-b"
        style={{ borderColor: "#2A2A2F" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                letterSpacing: "0.2em",
                color: "#6C6C74",
              }}
              className="text-xs uppercase mb-6"
            >
              The problem
            </p>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
              className="text-4xl md:text-5xl text-[#EEEEEF] mb-6"
            >
              Carbon tracking is{" "}
              <GlowWord color="#EF4444">broken</GlowWord>
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Every calculator you have tried gives a different number. Offset
              projects look legitimate until they are not. Nothing persists.
              Nothing is verifiable.
            </p>
          </div>
          <div className="space-y-4">
            {problems.map((p) => (
              <div
                key={p}
                className="flex gap-4 p-5 rounded-xl border"
                style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
              >
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#EF4444/10", border: "1px solid #EF444440" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2l-6 6" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-28 px-6 border-b"
        style={{ borderColor: "#2A2A2F" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            style={{
              fontFamily: "Space Mono, monospace",
              letterSpacing: "0.2em",
              color: "#6C6C74",
            }}
            className="text-xs uppercase mb-6"
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
            className="text-4xl md:text-5xl text-[#EEEEEF] mb-16 max-w-lg"
          >
            Four steps to a number you can trust
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div
                key={step.n}
                className="p-7 rounded-2xl border"
                style={{ backgroundColor: "#1A1A1E", borderColor: "#2A2A2F" }}
              >
                <div
                  style={{
                    fontFamily: "Space Mono, monospace",
                    color: "#3DCC7A",
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                  }}
                  className="mb-4"
                >
                  {step.n}
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                  className="text-xl text-[#EEEEEF] mb-3"
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data sources transparency */}
      <section
        className="py-28 px-6 border-b"
        style={{ borderColor: "#2A2A2F" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              style={{
                fontFamily: "Space Mono, monospace",
                letterSpacing: "0.2em",
                color: "#6C6C74",
              }}
              className="text-xs uppercase mb-6"
            >
              Data sources
            </p>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
              className="text-4xl md:text-5xl text-[#EEEEEF] mb-6"
            >
              We show our{" "}
              <GlowWord color="#3DCC7A">sources</GlowWord>
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Every footprint calculation returns the emission factors used and
              where they came from. You can read the same papers we do.
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "IEA",
                desc: "Electricity carbon intensity by country",
                color: "#3DCC7A",
              },
              {
                name: "DEFRA 2024",
                desc: "UK greenhouse gas conversion factors for transport",
                color: "#3DCC7A",
              },
              {
                name: "Poore & Nemecek (2018)",
                desc: "Global food system environmental impacts",
                color: "#3DCC7A",
              },
              {
                name: "Verra / Gold Standard",
                desc: "Offset project registry verification",
                color: "#3DCC7A",
              },
            ].map(({ name, desc, color }) => (
              <div
                key={name}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ backgroundColor: "#1A4D3220", borderColor: "#3DCC7A20" }}
              >
                <span
                  className="mt-1 shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#EEEEEF", fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex mb-8">
            <VerdantMark size={56} />
          </div>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
            className="text-5xl md:text-6xl text-[#EEEEEF] mb-6 max-w-2xl mx-auto"
          >
            Start with the{" "}
            <span
              style={{
                WebkitTextStroke: "2px #3DCC7A",
                color: "transparent",
              }}
            >
              numbers
            </span>
          </h2>
          <p
            className="text-lg mb-10 max-w-md mx-auto"
            style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
          >
            No account. No subscription. Connect your wallet, submit your data,
            get a verified number.
          </p>
          <Link
            href="/calculate"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium text-[#0F0F11] transition-transform duration-150 hover:scale-95 active:scale-90 text-lg"
            style={{
              backgroundColor: "#3DCC7A",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Calculate for free
          </Link>
        </div>
      </section>
    </div>
  );
}
