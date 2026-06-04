import { JsonRpcSigner, Contract, BrowserProvider } from "ethers";
import {
  FOOTPRINT_CONTRACT_ADDRESS,
  OFFSETS_CONTRACT_ADDRESS,
  FOOTPRINT_ABI,
  OFFSETS_ABI,
  RPC_URL,
  TX_POLL_INTERVAL,
  TX_POLL_RETRIES,
} from "@/lib/constants";

export type TxReceipt = {
  status: "pending" | "finalized" | "failed";
  hash: string;
  result?: unknown;
};

async function pollReceipt(hash: string): Promise<TxReceipt> {
  for (let i = 0; i < TX_POLL_RETRIES; i++) {
    await new Promise((r) => setTimeout(r, TX_POLL_INTERVAL));
    try {
      const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [hash],
          id: 1,
        }),
      });
      const json = await res.json();
      const receipt = json?.result;
      if (receipt && receipt.status === "0x1") {
        return { status: "finalized", hash, result: receipt };
      }
      if (receipt && receipt.status === "0x0") {
        return { status: "failed", hash };
      }
    } catch {
      // keep polling
    }
  }
  return { status: "pending", hash };
}

export function getFootprintContract(signer: JsonRpcSigner) {
  return new Contract(FOOTPRINT_CONTRACT_ADDRESS, FOOTPRINT_ABI, signer);
}

export function getOffsetsContract(signer: JsonRpcSigner) {
  return new Contract(OFFSETS_CONTRACT_ADDRESS, OFFSETS_ABI, signer);
}

export async function readFootprintHistory(
  address: string,
  provider: BrowserProvider
) {
  const contract = new Contract(
    FOOTPRINT_CONTRACT_ADDRESS,
    FOOTPRINT_ABI,
    provider
  );
  const raw = await contract.get_footprint_history(address);
  try {
    return JSON.parse(raw as string) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export async function readEmissionContext(provider: BrowserProvider) {
  const contract = new Contract(
    FOOTPRINT_CONTRACT_ADDRESS,
    FOOTPRINT_ABI,
    provider
  );
  const raw = await contract.get_emission_context();
  try {
    return JSON.parse(raw as string) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function readAllOffsetProjects(
  projectIds: string[],
  provider: BrowserProvider
) {
  const contract = new Contract(
    OFFSETS_CONTRACT_ADDRESS,
    OFFSETS_ABI,
    provider
  );
  const results = await Promise.all(
    projectIds.map(async (id) => {
      const raw = await contract.get_project(id);
      if (!raw) return null;
      try {
        return JSON.parse(raw as string) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function submitFootprint(
  signer: JsonRpcSigner,
  params: {
    energyData: string;
    transportData: string;
    dietData: string;
    countryCode: string;
    year: number;
    label: string;
  }
): Promise<TxReceipt> {
  const contract = getFootprintContract(signer);
  const tx = await contract.calculate_footprint(
    params.energyData,
    params.transportData,
    params.dietData,
    params.countryCode,
    params.year,
    params.label
  );
  return pollReceipt(tx.hash);
}

export async function retireOffsets(
  signer: JsonRpcSigner,
  params: {
    projectId: string;
    tonnesCo2e: string;
    beneficiaryName: string;
    reason: string;
  }
): Promise<TxReceipt> {
  const contract = getOffsetsContract(signer);
  const tx = await contract.retire_offsets(
    params.projectId,
    params.tonnesCo2e,
    params.beneficiaryName,
    params.reason
  );
  return pollReceipt(tx.hash);
}
