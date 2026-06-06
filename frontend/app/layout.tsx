import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Verdant",
  description: "Track and verify your personal carbon footprint on-chain.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M16 3C10 3 5 8 5 14c0 4.5 2.5 8.4 6.2 10.4L12 28h8l.8-3.6C24.5 22.4 27 18.5 27 14c0-6-5-11-11-11z' fill='%2353745f'/><path d='M16 8c-3.3 0-6 2.7-6 6 0 2.5 1.5 4.7 3.7 5.7L14 22h4l.3-2.3C20.5 18.7 22 16.5 22 14c0-3.3-2.7-6-6-6z' fill='%23729877' opacity='.55'/><line x1='16' y1='10' x2='16' y2='26' stroke='%23fef8f5' stroke-width='1.4' stroke-linecap='round'/><circle cx='16' cy='12' r='1.1' fill='%23fef8f5'/><circle cx='16' cy='16' r='1.1' fill='%23fef8f5'/><circle cx='16' cy='20' r='1.1' fill='%23fef8f5'/></svg>",
  },
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
