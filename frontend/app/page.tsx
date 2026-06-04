"use client";

import { useState } from "react";
import Link from "next/link";

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
          ? `0 0 30px ${color}CC, 0 0 60px ${color}66`
          : "none",
        cursor: "default",
      }}
    >
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#0F0F11" }}>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="px-6 pt-32 pb-20 max-w-6xl mx-auto">
        <p
          className="text-xs uppercase mb-10 tracking-[0.25em]"
          style={{ fontFamily: "Space Mono, monospace", color: "#3DCC7A" }}
        >
          On-chain carbon tracking
        </p>

        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1
              className="text-[clamp(3rem,8vw,7rem)] leading-[0.95] mb-8"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", color: "#EEEEEF" }}
            >
              Your carbon
              <br />
              footprint.{" "}
              <span style={{ WebkitTextStroke: "2px #3DCC7A", color: "transparent" }}>
                Verified.
              </span>
            </h1>
            <p
              className="text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}
            >
              You enter your energy bills, travel records, and diet. Verdant
              cross-references against IEA, DEFRA, and Our World in Data —
              not whatever a sponsor wants you to believe. The number goes
              on-chain, permanent and yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/calculate"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-[#0F0F11] transition-transform duration-150 hover:scale-95 active:scale-90"
                style={{ backgroundColor: "#3DCC7A", fontFamily: "Space Grotesk, sans-serif" }}
              >
                Calculate your footprint
              </Link>
              <Link
                href="/offsets"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-medium transition-all duration-150 hover:scale-95 active:scale-90 border"
                style={{ color: "#A0A0AB", borderColor: "#2A2A2F", fontFamily: "Space Grotesk, sans-serif" }}
              >
                View verified offsets
              </Link>
            </div>
          </div>

          {/* Ghost CO₂ number */}
          <div
            className="hidden lg:block select-none pointer-events-none"
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9rem",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              WebkitTextStroke: "1px #2A2A2F",
              color: "transparent",
            }}
          >
            CO₂
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────── */}
      <div
        className="border-t border-b"
        style={{ borderColor: "#2A2A2F" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 divide-x"
          style={{ borderColor: "#2A2A2F" }}>
          {[
            { value: "4.7t", label: "Global average CO₂e per person" },
            { value: "2.3t", label: "Paris 2°C target per person" },
            { value: "5+", label: "Independent data sources used" },
            { value: "100%", label: "On-chain, permanent, your wallet" },
          ].map(({ value, label }, i) => (
            <div key={i} className="px-8 first:pl-0 last:pr-0">
              <div
                className="mb-1"
                style={{
                  fontFamily: "Space Mono, monospace",
                  color: "#3DCC7A",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                {value}
              </div>
              <p className="text-xs leading-snug" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PROBLEM ──────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-b" style={{ borderColor: "#2A2A2F" }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs uppercase mb-6 tracking-[0.2em]"
            style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
          >
            The problem
          </p>
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2
                className="text-5xl md:text-6xl mb-6"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#EEEEEF" }}
              >
                Carbon tracking
                <br />
                is{" "}
                <GlowWord color="#EF4444">broken</GlowWord>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
                Every calculator gives a different number. Offset projects
                look credible until they are not. Nothing persists year to
                year. Nothing is independently verifiable.
              </p>
            </div>

            <div className="space-y-px">
              {[
                ["Calculators funded by airlines give lower aviation figures.", "#EF4444"],
                ["Offset projects with no way to check the underlying monitoring data.", "#EF4444"],
                ["No persistent record — last year's number is just a screenshot.", "#EF4444"],
                ["Platforms that convert your concern into a marketing funnel.", "#EF4444"],
              ].map(([text, accent], i) => (
                <div
                  key={i}
                  className="flex gap-5 px-5 py-4 first:rounded-t-xl last:rounded-b-xl"
                  style={{ backgroundColor: "#1A1A1E", borderLeft: `2px solid ${accent}30` }}
                >
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3l-8 8" stroke={accent as string} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm leading-relaxed" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-28 px-6 border-b" style={{ borderColor: "#2A2A2F" }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs uppercase mb-6 tracking-[0.2em]"
            style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
          >
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl mb-20 max-w-md"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#EEEEEF" }}
          >
            Four steps to a number you can trust
          </h2>

          <div className="grid md:grid-cols-2 gap-px" style={{ backgroundColor: "#2A2A2F" }}>
            {[
              {
                n: "01",
                title: "Submit your data",
                body: "Energy bills, how you get around, what you eat. You control the inputs. No account, no data stored off-chain.",
              },
              {
                n: "02",
                title: "Verified against real sources",
                body: "Contracts fetch emission factors from IEA, DEFRA, and Our World in Data in real time — not a static average locked in at launch.",
              },
              {
                n: "03",
                title: "Recorded on-chain, permanently",
                body: "Your footprint is stored against your wallet address. Compare year to year. No one can alter or delete the record.",
              },
              {
                n: "04",
                title: "Offset with confidence",
                body: "Projects are verified by AI against public registry data before you can retire against them. Inactive or fraudulent projects are blocked.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="p-10 flex flex-col gap-6"
                style={{ backgroundColor: "#0F0F11" }}
              >
                <span
                  className="text-xs tracking-[0.25em]"
                  style={{ fontFamily: "Space Mono, monospace", color: "#3DCC7A" }}
                >
                  {step.n}
                </span>
                <div>
                  <h3
                    className="text-2xl mb-3"
                    style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: "-0.02em", color: "#EEEEEF" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DATA SOURCES ─────────────────────────────────────────── */}
      <section className="py-28 px-6 border-b" style={{ borderColor: "#2A2A2F" }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs uppercase mb-6 tracking-[0.2em]"
            style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
          >
            Transparency
          </p>
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            <div>
              <h2
                className="text-4xl md:text-5xl mb-6"
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#EEEEEF" }}
              >
                We show our{" "}
                <GlowWord color="#3DCC7A">sources</GlowWord>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
                Every footprint calculation returns the emission factors used
                and where they came from. You can read the same papers we do.
                Nothing is hidden behind a proprietary model.
              </p>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "#2A2A2F" }}
            >
              {[
                { source: "IEA / Our World in Data", scope: "Electricity intensity by country", freq: "Annual" },
                { source: "DEFRA 2024", scope: "UK greenhouse gas conversion factors", freq: "Annual" },
                { source: "Poore & Nemecek 2018", scope: "Global food system emissions", freq: "Peer-reviewed" },
                { source: "Verra VCS", scope: "Offset project verification", freq: "Live" },
                { source: "Gold Standard", scope: "Offset project verification", freq: "Live" },
              ].map(({ source, scope, freq }, i) => (
                <div
                  key={source}
                  className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 text-sm items-center"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#1A1A1E" : "#111115",
                  }}
                >
                  <div>
                    <p style={{ color: "#EEEEEF", fontFamily: "Space Grotesk, sans-serif" }}>{source}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6C6C74" }}>{scope}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: "#3DCC7A15", color: "#3DCC7A", fontFamily: "Space Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.1em" }}
                  >
                    {freq}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl">
            <p
              className="text-xs uppercase mb-6 tracking-[0.2em]"
              style={{ fontFamily: "Space Mono, monospace", color: "#6C6C74" }}
            >
              Get started
            </p>
            <h2
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#EEEEEF" }}
            >
              Start with the{" "}
              <span style={{ WebkitTextStroke: "2px #3DCC7A", color: "transparent" }}>
                numbers
              </span>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: "#A0A0AB", fontFamily: "Space Grotesk, sans-serif" }}>
              No account. No subscription. Connect your wallet, submit your
              data, get a verified number stored permanently on-chain.
            </p>
            <Link
              href="/calculate"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-[#0F0F11] transition-transform duration-150 hover:scale-95 active:scale-90 text-base"
              style={{ backgroundColor: "#3DCC7A", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Calculate for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#0F0F11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
