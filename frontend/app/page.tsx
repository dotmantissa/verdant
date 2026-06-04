import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>

      {/* Headline */}
      <div style={{ marginBottom: 64 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#3dcc7a",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Personal carbon footprint — on-chain
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            color: "#e8e8e8",
            maxWidth: 640,
          }}
        >
          Your footprint,
          <br />
          <span style={{ color: "#3dcc7a" }}>actually verified.</span>
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#666",
            maxWidth: 520,
            lineHeight: 1.7,
            marginTop: 24,
          }}
        >
          Verdant calculates your carbon footprint from energy, transport, and
          diet data you submit — cross-referenced against IEA, DEFRA, and Our
          World in Data in real time. The result is recorded on-chain, against
          your wallet, permanently.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          <Link href="/calculate" className="cta-primary">
            calculate footprint →
          </Link>
          <Link href="/offsets" className="cta-ghost">
            view verified offsets
          </Link>
        </div>
      </div>

      {/* Divider line */}
      <div style={{ borderTop: "1px solid #1a1a1a", marginBottom: 64 }} />

      {/* Data points */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1px",
          background: "#1a1a1a",
          marginBottom: 64,
        }}
      >
        {[
          { val: "4.7 t", label: "global average CO₂e / person / year" },
          { val: "2.3 t", label: "Paris 2°C target per person" },
          { val: "IEA", label: "electricity data source" },
          { val: "DEFRA 2024", label: "transport factors" },
          { val: "on-chain", label: "where your record lives" },
        ].map(({ val, label }) => (
          <div key={label} style={{ background: "#0a0a0a", padding: "24px 20px" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "#e8e8e8",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              {val}
            </div>
            <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* How it works — plain prose, no cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          marginBottom: 64,
        }}
      >
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 20 }}>
            How it works
          </p>
          <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              ["01", "Submit your data", "Energy bills, travel records, dietary patterns. You enter the numbers."],
              ["02", "Real-time verification", "Emission factors are fetched from IEA, DEFRA, and OWID at calculation time. Not a static table."],
              ["03", "Consensus on-chain", "Multiple GenLayer validators independently re-run the calculation. All must agree within 5% before anything is written."],
              ["04", "Permanent record", "The result is stored against your wallet address. Unchangeable. Comparable year over year."],
            ].map(([n, title, body]) => (
              <li key={n} style={{ display: "flex", gap: 20 }}>
                <span style={{ fontSize: 11, color: "#3dcc7a", flexShrink: 0, paddingTop: 2 }}>{n}</span>
                <div>
                  <p style={{ fontSize: 13, color: "#e8e8e8", marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 20 }}>
            Offset verification
          </p>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, marginBottom: 20 }}>
            Each offset project in the registry is checked against its Verra VCS
            or Gold Standard public listing before it can be retired against. The
            contract fetches the live monitoring data and runs an LLM assessment.
            Fraudulent or inactive projects are rejected automatically — you cannot
            retire against a project that does not pass.
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 20 }}>
            Data sources
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <tbody>
              {[
                ["IEA / Our World in Data", "Electricity intensity by country"],
                ["DEFRA 2024", "Transport conversion factors"],
                ["Poore & Nemecek 2018", "Food system emissions"],
                ["Verra VCS", "Offset project status"],
                ["Gold Standard", "Offset project status"],
              ].map(([src, scope]) => (
                <tr key={src} style={{ borderBottom: "1px solid #111" }}>
                  <td style={{ padding: "8px 0", color: "#888", paddingRight: 24 }}>{src}</td>
                  <td style={{ padding: "8px 0", color: "#444" }}>{scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer line */}
      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontSize: 11, color: "#333" }}>
          Footprint records stored on GenLayer. No account required.
        </span>
        <a
          href="https://github.com/dotmantissa/verdant"
          style={{ fontSize: 11, color: "#333", textDecoration: "none" }}
        >
          github.com/dotmantissa/verdant
        </a>
      </div>

      <style>{`
        .cta-primary {
          display: inline-block;
          border: 1px solid #3dcc7a;
          color: #3dcc7a;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 9px 18px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .cta-primary:hover { background: #3dcc7a; color: #0a0a0a; }
        .cta-ghost {
          display: inline-block;
          border: 1px solid #222;
          color: #555;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 9px 18px;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .cta-ghost:hover { border-color: #444; color: #888; }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
