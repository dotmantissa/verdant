"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  CHAIN_ID,
  CHAIN_ID_HEX,
  NETWORK_NAME,
  NETWORK_CURRENCY,
  RPC_URL,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EthereumProvider = any;

type WalletState = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  isConnected: boolean;
  isInitializing: boolean;
  wrongNetwork: boolean;
  chainId: number | null;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
};

const WalletContext = createContext<WalletState | null>(null);

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const chainChangedRef = useRef<((c: string) => void) | null>(null);
  const accountsChangedRef = useRef<((a: string[]) => void) | null>(null);

  const clearError = useCallback(() => setError(""), []);

  const removeListeners = useCallback(() => {
    const eth = getEthereum();
    if (!eth) return;
    if (chainChangedRef.current) {
      eth.removeListener?.("chainChanged", chainChangedRef.current);
      chainChangedRef.current = null;
    }
    if (accountsChangedRef.current) {
      eth.removeListener?.("accountsChanged", accountsChangedRef.current);
      accountsChangedRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    removeListeners();
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    setWrongNetwork(false);
    setChainId(null);
    setError("");
  }, [removeListeners]);

  const connect = useCallback(async () => {
    clearError();
    const eth = getEthereum();

    if (!eth) {
      setError("No wallet found. Install MetaMask or another compatible wallet to continue.");
      return;
    }

    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) throw new Error("No accounts returned");

      const currentChainHex: string = await eth.request({ method: "eth_chainId" });
      const currentChain = parseInt(currentChainHex, 16);

      if (currentChain !== CHAIN_ID) {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_ID_HEX }],
          });
        } catch (switchErr: unknown) {
          const se = switchErr as { code?: number };
          if (se?.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: CHAIN_ID_HEX,
                  chainName: NETWORK_NAME,
                  nativeCurrency: NETWORK_CURRENCY,
                  rpcUrls: [RPC_URL],
                },
              ],
            });
          } else {
            setWrongNetwork(true);
            return;
          }
        }
      }

      const bp = new BrowserProvider(eth);
      const sg = await bp.getSigner();
      const addr = await sg.getAddress();

      setProvider(bp);
      setSigner(sg);
      setAddress(addr);
      setIsConnected(true);
      setWrongNetwork(false);
      setChainId(CHAIN_ID);

      const handleChainChange = (newChain: string) => {
        if (parseInt(newChain, 16) !== CHAIN_ID) {
          setWrongNetwork(true);
          setIsConnected(false);
        } else {
          setWrongNetwork(false);
          setIsConnected(true);
        }
      };
      chainChangedRef.current = handleChainChange;
      eth.on?.("chainChanged", handleChainChange);

      const handleAccountsChange = (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnect();
        } else {
          setAddress(newAccounts[0]);
        }
      };
      accountsChangedRef.current = handleAccountsChange;
      eth.on?.("accountsChanged", handleAccountsChange);
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e?.code === 4001) {
        setError("Connection rejected.");
      } else {
        setError(e?.message ?? "Failed to connect wallet.");
      }
    }
  }, [clearError, disconnect]);

  // auto-reconnect if wallet was already connected
  useEffect(() => {
    const eth = getEthereum();
    if (!eth) {
      setIsInitializing(false);
      return;
    }
    eth.request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) return connect();
      })
      .catch(() => {})
      .finally(() => setIsInitializing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => removeListeners();
  }, [removeListeners]);

  return (
    <WalletContext.Provider
      value={{
        provider, signer, address, isConnected, isInitializing, wrongNetwork,
        chainId, error, connect, disconnect, clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
