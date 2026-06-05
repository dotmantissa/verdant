import { createClient, chains } from "genlayer-js";
import type { GenLayerClient, GenLayerTransaction, Hash } from "genlayer-js/types";
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

function createWriteClient(walletAddress: string): GenLayerClient<never> {
  return createClient({
    chain: chains.studionet,
    endpoint: RPC_URL,
    account: walletAddress as `0x${string}`,
  }) as unknown as GenLayerClient<never>;
}

function isSuccess(tx: GenLayerTransaction): boolean {
  return tx.statusName === "FINALIZED" || tx.statusName === "ACCEPTED";
}

function isFailed(tx: GenLayerTransaction): boolean {
  return tx.statusName === "CANCELED" || tx.resultName === "FAILURE";
}

async function pollGenLayerTx(hash: Hash): Promise<TxReceipt> {
  const client = getReadClient();
  for (let i = 0; i < TX_POLL_RETRIES; i++) {
    await new Promise((r) => setTimeout(r, TX_POLL_INTERVAL));
    try {
      const tx = await client.getTransaction({ hash: hash as Hash });
      if (isSuccess(tx)) return { status: "finalized", hash, result: tx };
      if (isFailed(tx)) return { status: "failed", hash };
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
  try {
    const raw = await client.readContract({
      address: FOOTPRINT_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_footprint_history",
      args: [address],
    });
    if (typeof raw === "string") return JSON.parse(raw) as Record<string, unknown>[];
    return [];
  } catch {
    return [];
  }
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
