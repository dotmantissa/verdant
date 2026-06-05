"use client";

import Link from "next/link";

const STATS = [
  { val: "4.7 t", label: "Global average CO₂e / person / year" },
  { val: "2.3 t", label: "Paris 2°C target per person" },
  { val: "IEA", label: "Electricity intensity data source" },
  { val: "DEFRA 2024", label: "Transport emission factors" },
  { val: "On-chain", label: "Where your record lives" },
];

const STEPS = [
  {
    n: "01",
    title: "Submit your data",
    body: "Energy bills, travel records, dietary patterns. You enter the numbers — no estimates, no defaults.",
  },
  {
    n: "02",
    title: "Real-time verification",
    body: "Emission factors are fetched live from IEA, DEFRA, and Our World in Data at calculation time.",
  },
  {
    n: "03",
    title: "Consensus on-chain",
    body: "Multiple GenLayer validators independently re-run the calculation. All must agree within 5% before anything is written.",
  },
  {
    n: "04",
    title: "Permanent record",
    body: "The result is stored against your wallet address. Unchangeable. Comparable year over year.",
  },
];

const SOURCES = [
  ["IEA / Our World in Data", "Electricity intensity by country"],
  ["DEFRA 2024", "Transport conversion factors"],
  ["Poore & Nemecek 2018", "Food system emissions"],
  ["Verra VCS", "Offset project status"],
  ["Gold Standard", "Offset project status"],
];

export default function HomePage() {
  return (
    <div className="page">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <p
          className="anim-fade-up"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--forest)",
            marginBottom: 20,
          }}
        >
          Personal carbon footprint — on-chain
        </p>

        <h1
          className="anim-fade-up delay-1"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--ink)",
            maxWidth: 680,
            marginBottom: 24,
          }}
        >
          Your footprint,{" "}
          <span
            style={{
              color: "var(--forest)",
              position: "relative",
              display: "inline-block",
            }}
          >
            actually verified.
          </span>
        </h1>

        <p
          className="anim-fade-up delay-2"
          style={{
            fontSize: 16,
            color: "var(--ink-60)",
            maxWidth: 560,
            lineHeight: 1.75,
            marginBottom: 40,
          }}
        >
          Verdant calculates your carbon footprint from energy, transport, and diet
          data — cross-referenced against IEA, DEFRA, and Our World in Data in real
          time. The result is recorded on-chain, against your wallet, permanently.
        </p>

        <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/calculate" className="btn btn-primary" style={{ fontSize: 14, padding: "12px 24px" }}>
            Calculate footprint →
          </Link>
          <Link href="/offsets" className="btn btn-outline" style={{ fontSize: 14, padding: "12px 24px" }}>
            View verified offsets
          </Link>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 12,
          }}
        >
          {STATS.map(({ val, label }, i) => (
            <div
              key={label}
              className={`anim-fade-up delay-${i + 1}`}
              style={{
                background: "white",
                border: "1.5px solid rgba(35,31,32,0.06)",
                borderRadius: 12,
                padding: "20px 18px",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--forest)",
                  marginBottom: 6,
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-30)", lineHeight: 1.45 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── How it works + Offset verification ───────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          marginBottom: 80,
          alignItems: "start",
        }}
      >
        <div>
          <p className="section-label">How it works</p>
          <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map(({ n, title, body }, i) => (
              <li
                key={n}
                className={`anim-fade-up delay-${i + 1}`}
                style={{
                  display: "flex",
                  gap: 18,
                  padding: "18px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid rgba(35,31,32,0.06)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--sage)",
                    flexShrink: 0,
                    paddingTop: 3,
                    letterSpacing: "0.05em",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {n}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.65 }}>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="section-label" style={{ marginBottom: 20 }}>Offset verification</p>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-60)",
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Each offset project is checked against its Verra VCS or Gold Standard
            public listing before it can be retired against. The contract fetches
            live monitoring data and runs an LLM assessment. Fraudulent or inactive
            projects are rejected automatically.
          </p>

          <p className="section-label">Data sources</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {SOURCES.map(([src, scope], i) => (
                <tr
                  key={src}
                  className={`anim-fade-up delay-${i + 1}`}
                  style={{ borderBottom: "1px solid rgba(35,31,32,0.06)" }}
                >
                  <td
                    style={{
                      padding: "11px 0",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink)",
                      paddingRight: 24,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {src}
                  </td>
                  <td style={{ padding: "11px 0", fontSize: 13, color: "var(--ink-60)" }}>{scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1.5px solid rgba(35,31,32,0.06)",
          paddingTop: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--ink-30)" }}>
          Footprint records stored on GenLayer. No account required.
        </span>
        <a
          href="https://github.com/dotmantissa/verdant"
          style={{ fontSize: 12, color: "var(--ink-30)", textDecoration: "none", transition: "color 0.2s" }}
          onMouseOver={e => (e.currentTarget.style.color = "var(--forest)")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--ink-30)")}
        >
          github.com/dotmantissa/verdant
        </a>
      </footer>

      <style>{`
        @media (max-width: 680px) {
          section[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
