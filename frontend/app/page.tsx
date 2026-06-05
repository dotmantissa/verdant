"use client";

import Link from "next/link";

const STATS = [
  { val: "4.7 t",      label: "Global average per person per year" },
  { val: "2.3 t",      label: "Paris 2°C budget per person"        },
  { val: "IEA",        label: "Electricity data source"            },
  { val: "DEFRA 2024", label: "Transport emission factors"         },
  { val: "On-chain",   label: "Where your record lives"            },
];

const STEPS = [
  {
    n: "01",
    title: "You enter your numbers",
    body: "Energy bills, flights, diet. No estimates, no prefilled defaults. Your data.",
  },
  {
    n: "02",
    title: "Factors are fetched live",
    body: "Emission factors come from IEA, DEFRA, and Our World in Data at calculation time. Not a static table from 2021.",
  },
  {
    n: "03",
    title: "Validators reach consensus",
    body: "Multiple GenLayer validators each run the calculation independently. All must agree within 5% before anything is written.",
  },
  {
    n: "04",
    title: "Your record is permanent",
    body: "The result goes on-chain, tied to your wallet. Nobody can change it. You can compare it year over year.",
  },
];

const SOURCES = [
  ["IEA / Our World in Data", "Electricity grid intensity by country"],
  ["DEFRA 2024",              "Transport conversion factors"          ],
  ["Poore & Nemecek 2018",    "Food system emissions"                 ],
  ["Verra VCS",               "Offset project registry"               ],
  ["Gold Standard",           "Offset project registry"               ],
];

export default function HomePage() {
  return (
    <div className="page">

      {/* Hero */}
      <section style={{ marginBottom: 72 }}>
        <p
          className="anim-fade-up"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--forest)",
            marginBottom: 18,
          }}
        >
          Personal carbon footprint on-chain
        </p>

        <h1
          className="anim-fade-up delay-1"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.8rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--ink)",
            maxWidth: 660,
            marginBottom: 22,
          }}
        >
          Your footprint, <span style={{ color: "var(--forest)" }}>actually verified.</span>
        </h1>

        <p
          className="anim-fade-up delay-2"
          style={{
            fontSize: 16,
            color: "var(--ink-60)",
            maxWidth: 520,
            lineHeight: 1.75,
            marginBottom: 36,
          }}
        >
          You submit your energy, transport, and diet figures. Verdant cross-checks them
          against live data sources, reaches consensus across multiple validators, then writes
          the result to your wallet address permanently.
        </p>

        <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/calculate" className="btn btn-primary" style={{ fontSize: 14, padding: "12px 22px" }}>
            Calculate your footprint
          </Link>
          <Link href="/offsets" className="btn btn-outline" style={{ fontSize: 14, padding: "12px 22px" }}>
            Browse offset projects
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ marginBottom: 72 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          {STATS.map(({ val, label }, i) => (
            <div
              key={label}
              className={`anim-fade-up delay-${i + 1}`}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: 12,
                padding: "18px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--forest)",
                  marginBottom: 5,
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-30)", lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* How it works + data sources */}
      <section className="grid-2" style={{ marginBottom: 72, alignItems: "start" }}>
        <div>
          <p className="section-label">How it works</p>
          <ol style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
            {STEPS.map(({ n, title, body }, i) => (
              <li
                key={n}
                className={`anim-fade-up delay-${i + 1}`}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "18px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: "var(--sage)",
                    flexShrink: 0,
                    paddingTop: 2,
                    fontWeight: 700,
                  }}
                >
                  {n}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 5 }}>
                    {title}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.65 }}>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="section-label" style={{ marginBottom: 16 }}>Offset verification</p>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-60)",
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Every offset project in the registry is checked against its Verra VCS or Gold
            Standard listing before you can retire against it. The contract fetches live
            monitoring data and runs an assessment. If a project has lapsed or cannot be
            verified, the retirement is rejected outright.
          </p>

          <p className="section-label">Data sources</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {SOURCES.map(([src, scope], i) => (
                <tr
                  key={src}
                  className={`anim-fade-up delay-${i + 1}`}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "11px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--ink)",
                      paddingRight: 20,
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

      {/* Footer */}
      <footer
        style={{
          borderTop: "1.5px solid var(--border)",
          paddingTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--ink-30)" }}>
          Records stored on GenLayer. No account needed.
        </span>
        <a
          href="https://github.com/dotmantissa/verdant"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--ink-30)", textDecoration: "none", transition: "color 0.18s" }}
          onMouseOver={e => (e.currentTarget.style.color = "var(--forest)")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--ink-30)")}
        >
          github.com/dotmantissa/verdant
        </a>
      </footer>
    </div>
  );
}
