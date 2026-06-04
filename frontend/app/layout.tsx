import type { Metadata } from "next";
import "./globals.css";
import { Logo } from "@/components/Logo";
import { WalletBar } from "@/components/WalletBar";

export const metadata: Metadata = {
  title: "Verdant — Your footprint, actually verified",
  description:
    "Calculate your carbon footprint from verified data. Offset projects checked against real monitoring records. Everything on-chain.",
  openGraph: {
    title: "Verdant",
    description: "Personal carbon footprint, actually verified",
    siteName: "Verdant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ backgroundColor: "#0F0F11", color: "#EEEEEF" }}
      >
        <header
          className="sticky top-0 z-50 px-6 border-b"
          style={{
            backgroundColor: "#0F0F11E6",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderColor: "#2A2A2F",
          }}
        >
          <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "Calculate", href: "/calculate" },
                { label: "Offsets", href: "/offsets" },
                { label: "Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm transition-colors duration-150 text-[#6C6C74] hover:text-[#EEEEEF]"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {label}
                </a>
              ))}
            </nav>
            <WalletBar />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t px-6 py-12" style={{ borderColor: "#2A2A2F" }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
            <div>
              <Logo />
              <p className="text-xs mt-4 leading-relaxed max-w-[200px]" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                Personal carbon footprint, actually verified.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Space Mono, monospace", color: "#3C3C42" }}>
                App
              </p>
              <div className="space-y-3">
                {[
                  { label: "Calculate", href: "/calculate" },
                  { label: "Offsets", href: "/offsets" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map(({ label, href }) => (
                  <a key={label} href={href} className="block text-sm" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Space Mono, monospace", color: "#3C3C42" }}>
                Sources
              </p>
              <div className="space-y-3">
                {[
                  "IEA / Our World in Data",
                  "DEFRA 2024",
                  "Verra VCS",
                  "Gold Standard",
                ].map((s) => (
                  <p key={s} className="text-sm" style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}>
                    {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 flex flex-col md:flex-row justify-between gap-4 border-t" style={{ borderColor: "#1A1A1E" }}>
            <p className="text-xs" style={{ color: "#3C3C42", fontFamily: "Space Grotesk, sans-serif" }}>
              Footprint records stored on GenLayer.
            </p>
            <a
              href="https://github.com/dotmantissa/verdant"
              className="text-xs"
              style={{ color: "#3C3C42", fontFamily: "Space Grotesk, sans-serif" }}
            >
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
