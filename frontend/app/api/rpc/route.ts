import { NextRequest, NextResponse } from "next/server";

const GENLAYER_RPC = "https://studio.genlayer.com/api";

// GenLayer Studio doesn't implement all standard Ethereum JSON-RPC methods.
// MetaMask calls these before and during transaction submission; returning
// sensible stubs prevents MetaMask from treating the RPC as broken.
const STUBS: Record<string, unknown> = {
  net_listening: true,
  net_peerCount: "0x0",
  eth_accounts: [],
  eth_newBlockFilter: "0x1",
  eth_newPendingTransactionFilter: "0x2",
  eth_getFilterChanges: [],
  eth_uninstallFilter: true,
};

interface RpcRequest {
  jsonrpc?: string;
  id?: unknown;
  method: string;
  params?: unknown[];
}

async function handleSingle(req: RpcRequest): Promise<unknown> {
  const { jsonrpc = "2.0", id, method, params = [] } = req;

  if (method in STUBS) {
    return { jsonrpc, id, result: STUBS[method] };
  }

  try {
    const res = await fetch(GENLAYER_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://studio.genlayer.com",
      },
      body: JSON.stringify({ jsonrpc, id, method, params }),
    });
    return await res.json();
  } catch {
    return { jsonrpc, id, error: { code: -32603, message: "Internal error proxying to GenLayer RPC" } };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as RpcRequest | RpcRequest[];

  if (Array.isArray(body)) {
    const results = await Promise.all(body.map(handleSingle));
    return NextResponse.json(results);
  }

  return NextResponse.json(await handleSingle(body));
}
