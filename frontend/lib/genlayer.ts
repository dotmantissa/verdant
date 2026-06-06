import { createClient, chains } from "genlayer-js";
import type { GenLayerClient, Hash } from "genlayer-js/types";
import { TransactionStatus, transactionsStatusNumberToName } from "genlayer-js/types";
import {
  FOOTPRINT_CONTRACT_ADDRESS,
  OFFSETS_CONTRACT_ADDRESS,
  RPC_URL,
  TX_POLL_INTERVAL,
  TX_POLL_RETRIES,
} from "@/lib/constants";

export type TxReceipt = {
  status: "pending" | "finalized" | "failed";
  hash: string;
  result?: unknown;
};

let readClient: GenLayerClient<never>;

function getReadClient(): GenLayerClient<never> {
  if (!readClient) {
    readClient = createClient({
      chain: chains.studionet,
      endpoint: RPC_URL,
    }) as unknown as GenLayerClient<never>;
  }
  return readClient;
}

// Routes only eth_sendTransaction through MetaMask (for signing); everything else
// goes directly to the GenLayer RPC so waitForTransactionReceipt polling doesn't
// hit MetaMask's rate limiter.
function buildSelectiveProvider() {
  return {
    async request({ method, params = [] }: { method: string; params?: unknown[] }) {
      if (method === "eth_sendTransaction") {
        const eth = typeof window !== "undefined"
          ? (window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
          : undefined;
        if (!eth) throw new Error("No wallet found");
        return eth.request({ method, params });
      }

      // eth_estimateGas runs a full AI simulation on GenLayer intelligent contracts,
      // taking 30-60s before MetaMask even opens. Return a fixed gas ceiling instead.
      if (method === "eth_estimateGas") {
        return "0x4C4B40"; // 5 000 000 — enough for any intelligent contract call
      }

      // eth_getTransactionReceipt returns RPC errors (not null) while GenLayer
      // consensus is in progress. Translating those errors to null keeps viem's
      // waitForTransactionReceipt polling instead of giving up with "too many errors".
      if (method === "eth_getTransactionReceipt") {
        try {
          const res = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
          });
          const data = await res.json() as { result?: unknown; error?: unknown };
          if (data.error) return null;
          return data.result;
        } catch {
          return null;
        }
      }

      const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
      });
      const data = await res.json() as { result?: unknown; error?: { message?: string } };
      if (data.error) throw data.error;
      return data.result;
    },
  };
}

function createWriteClient(walletAddress: string): GenLayerClient<never> {
  return createClient({
    chain: chains.studionet,
    endpoint: RPC_URL,
    account: walletAddress as `0x${string}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: buildSelectiveProvider() as any,
  }) as unknown as GenLayerClient<never>;
}

// Fetch transaction status directly from GenLayer RPC, bypassing viem/MetaMask
// routing so the raw GenLayer-specific status field is preserved.
async function fetchRawTxStatus(hash: string): Promise<TransactionStatus | null> {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [hash],
      }),
    });
    const data = await res.json() as { result?: Record<string, unknown> | null };
    const tx = data.result;
    if (!tx) return null;
    const raw = tx.status;
    if (typeof raw === "string") {
      const normalized = raw === "ACTIVATED" ? "PENDING" : raw;
      return normalized as unknown as TransactionStatus;
    }
    if (typeof raw === "number") {
      const name = transactionsStatusNumberToName[String(raw) as keyof typeof transactionsStatusNumberToName];
      return name ? (name as unknown as TransactionStatus) : null;
    }
    return null;
  } catch {
    return null;
  }
}

const SUCCESS_STATUSES = new Set<TransactionStatus>([TransactionStatus.FINALIZED, TransactionStatus.ACCEPTED]);
const FAILED_STATUSES  = new Set<TransactionStatus>([TransactionStatus.CANCELED]);

async function pollGenLayerTx(hash: Hash): Promise<TxReceipt> {
  for (let i = 0; i < TX_POLL_RETRIES; i++) {
    await new Promise((r) => setTimeout(r, TX_POLL_INTERVAL));
    try {
      const statusName = await fetchRawTxStatus(hash as string);
      if (statusName && SUCCESS_STATUSES.has(statusName)) return { status: "finalized", hash };
      if (statusName && FAILED_STATUSES.has(statusName))  return { status: "failed",    hash };
    } catch {
      // keep polling
    }
  }
  return { status: "pending", hash };
}

/* ── Reads ─────────────────────────────────────────────────────────── */

export async function readFootprintHistory(address: string) {
  if (!FOOTPRINT_CONTRACT_ADDRESS) return [];
  const client = getReadClient();
  const raw = await client.readContract({
    address: FOOTPRINT_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_footprint_history",
    args: [address.toLowerCase()],
  });
  if (typeof raw === "string") return JSON.parse(raw) as Record<string, unknown>[];
  return [];
}

export async function readEmissionContext() {
  if (!FOOTPRINT_CONTRACT_ADDRESS) return {};
  const client = getReadClient();
  try {
    const raw = await client.readContract({
      address: FOOTPRINT_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_emission_context",
    });
    if (typeof raw === "string") return JSON.parse(raw) as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

export async function readOffsetProject(projectId: string) {
  if (!OFFSETS_CONTRACT_ADDRESS) return null;
  const client = getReadClient();
  try {
    const raw = await client.readContract({
      address: OFFSETS_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_project",
      args: [projectId],
    });
    if (typeof raw === "string") return JSON.parse(raw) as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

export async function readAllOffsetProjects(projectIds: string[]) {
  if (!OFFSETS_CONTRACT_ADDRESS) return [];
  const results = await Promise.all(
    projectIds.map(async (id) => {
      const p = await readOffsetProject(id);
      return p;
    })
  );
  return results.filter(Boolean);
}

/* ── Writes ────────────────────────────────────────────────────────── */

export async function submitFootprint(
  walletAddress: string,
  params: {
    energyData: string;
    transportData: string;
    dietData: string;
    countryCode: string;
    year: number;
    label: string;
  }
): Promise<TxReceipt> {
  const client = createWriteClient(walletAddress);
  const txId = await client.writeContract({
    address: FOOTPRINT_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "calculate_footprint",
    args: [
      params.energyData,
      params.transportData,
      params.dietData,
      params.countryCode,
      params.year,
      params.label,
    ],
    value: BigInt(0),
  });
  return pollGenLayerTx(txId as Hash);
}

export async function retireOffsets(
  walletAddress: string,
  params: {
    projectId: string;
    tonnesCo2e: string;
    beneficiaryName: string;
    reason: string;
  }
): Promise<TxReceipt> {
  const client = createWriteClient(walletAddress);
  const txId = await client.writeContract({
    address: OFFSETS_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "retire_offsets",
    args: [
      params.projectId,
      params.tonnesCo2e,
      params.beneficiaryName,
      params.reason,
    ],
    value: BigInt(0),
  });
  return pollGenLayerTx(txId as Hash);
}
