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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
            backgroundColor: "#0F0F11CC",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderColor: "#2A2A2F",
          }}
        >
          <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
            <Logo size={28} showText />
            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: "Calculate", href: "/calculate" },
                { label: "Offsets", href: "/offsets" },
                { label: "Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  className="text-sm text-[#A0A0AB] hover:text-[#EEEEEF] transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>
            <WalletBar />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer
          className="border-t px-6 py-10"
          style={{ borderColor: "#2A2A2F" }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Logo size={22} showText />
            <p
              className="text-xs max-w-xs"
              style={{ color: "#6C6C74", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Footprint records are stored on GenLayer. Emission factors sourced
              from IEA, DEFRA, and Our World in Data.
            </p>
            <div className="flex gap-5">
              {[
                { label: "GitHub", href: "https://github.com/dotmantissa/verdant" },
                { label: "Calculate", href: "/calculate" },
                { label: "Offsets", href: "/offsets" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-xs transition-colors duration-150"
                  style={{ color: "#6C6C74" }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
