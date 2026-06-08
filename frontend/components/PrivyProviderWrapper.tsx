"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/components/WalletProvider";
import { CHAIN_ID, RPC_URL, NETWORK_NAME, NETWORK_CURRENCY } from "@/lib/constants";

const genLayerStudionet = {
  id: CHAIN_ID,
  name: NETWORK_NAME,
  network: "genlayer-studio",
  nativeCurrency: NETWORK_CURRENCY,
  rpcUrls: {
    default: { http: [RPC_URL] },
    public:  { http: [RPC_URL] },
  },
  testnet: true,
} as const;

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: genLayerStudionet,
        supportedChains: [genLayerStudionet],
        loginMethods: ["email", "wallet", "google", "twitter"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        appearance: {
          theme: "light",
          accentColor: "#53745f",
          walletChainType: "ethereum-only",
        },
      }}
    >
      <WalletProvider>{children}</WalletProvider>
    </PrivyProvider>
  );
}
