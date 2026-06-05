import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Verdant",
  description: "Track and verify your personal carbon footprint on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>
          <Nav />
          <main>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
