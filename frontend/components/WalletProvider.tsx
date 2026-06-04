"use client";

// This is a thin context wrapper so wallet state can be shared across the app
// without prop-drilling. The hook itself is stateful per component, so this
// provider exists purely for future upgrade to a shared context if needed.
// For now, each component that needs wallet calls useWallet() directly.

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
