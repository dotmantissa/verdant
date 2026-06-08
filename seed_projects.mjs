/**
 * Seeds all 6 hardcoded offset projects into the VerdantOffsets contract.
 * Run once: node seed_projects.mjs
 */
import { createClient, chains } from "genlayer-js";
import { TransactionStatus, transactionsStatusNumberToName } from "genlayer-js/types";

const RPC_URL   = "https://studio.genlayer.com/api";
const OFFSETS   = "0x353C1b54E58f2Fb4A2f5268AbDFfBaE6A1d0bA2F";
const DEPLOYER  = "0xBC1399c55538eC034d4Da550C03c34Ae0C357f53";
const PRIV_KEY  = "0xd4479070c2a31da31a01e732ca51707132bacdb480aae432a0c8bd0b91eba4b7";
const POLL_MS   = 5000;
const MAX_POLLS = 120;

const PROJECTS = [
  {
    project_id: "VCS-934",
    name: "Kariba REDD+ Forest Protection",
    description: "785,000 hectares of Zimbabwean forest protected from illegal logging and agricultural conversion. One of the largest REDD+ projects in Africa.",
    project_url: "https://registry.verra.org/app/projectDetail/VCS/934",
    registry: "verra",
    country: "Zimbabwe",
    project_type: "forestry",
    price_usd_per_tonne: "12.50",
  },
  {
    project_id: "GS-5409",
    name: "Olkaria Geothermal Expansion",
    description: "Expansion of Kenya's Olkaria geothermal plant, displacing diesel and heavy fuel oil generation with clean geothermal power.",
    project_url: "https://registry.goldstandard.org/projects/details/5409",
    registry: "gold_standard",
    country: "Kenya",
    project_type: "renewable_energy",
    price_usd_per_tonne: "18.00",
  },
  {
    project_id: "VCS-1566",
    name: "Mai Ndombe REDD+",
    description: "1.5 million hectares of tropical forest in the Democratic Republic of Congo, protected under one of the world's most ambitious conservation agreements.",
    project_url: "https://registry.verra.org/app/projectDetail/VCS/1566",
    registry: "verra",
    country: "DR Congo",
    project_type: "forestry",
    price_usd_per_tonne: "14.00",
  },
  {
    project_id: "GS-2185",
    name: "Improved Cookstoves Ethiopia",
    description: "High-efficiency biomass cookstoves distributed to rural households in Ethiopia. Reduces wood fuel use, indoor air pollution, and deforestation pressure.",
    project_url: "https://registry.goldstandard.org/projects/details/2185",
    registry: "gold_standard",
    country: "Ethiopia",
    project_type: "cookstoves",
    price_usd_per_tonne: "8.50",
  },
  {
    project_id: "VCS-2228",
    name: "Blue Carbon Mangrove Restoration",
    description: "Mangrove ecosystem restoration along the Tanzanian coast. Mangroves store carbon at rates far exceeding most terrestrial forests.",
    project_url: "https://registry.verra.org/app/projectDetail/VCS/2228",
    registry: "verra",
    country: "Tanzania",
    project_type: "blue_carbon",
    price_usd_per_tonne: "22.00",
  },
  {
    project_id: "GS-1788",
    name: "Biogas Digesters Rural India",
    description: "Livestock waste biogas digesters installed in Maharashtra and Uttar Pradesh, replacing kerosene and firewood for cooking and heating.",
    project_url: "https://registry.goldstandard.org/projects/details/1788",
    registry: "gold_standard",
    country: "India",
    project_type: "methane_capture",
    price_usd_per_tonne: "9.00",
  },
];

async function rpcRequest(method, params) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function pollStatus(hash) {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_MS));
    const tx = await rpcRequest("eth_getTransactionByHash", [hash]).catch(() => null);
    if (!tx) continue;
    const raw = tx.status;
    let name;
    if (typeof raw === "string") {
      name = raw === "ACTIVATED" ? "PENDING" : raw;
    } else if (typeof raw === "number") {
      name = transactionsStatusNumberToName[String(raw)] ?? null;
    }
    if (!name) continue;
    if (["FINALIZED", "ACCEPTED"].includes(name)) return "finalized";
    if (["CANCELED"].includes(name)) return "failed";
    process.stdout.write(`  [${i+1}/${MAX_POLLS}] status: ${name}\r`);
  }
  return "timeout";
}

async function main() {
  // Build provider that signs via private key directly
  const { ethers } = await import("ethers");
  const wallet = new ethers.Wallet(PRIV_KEY);

  const provider = {
    async request({ method, params = [] }) {
      if (method === "eth_sendTransaction") {
        const tx = params[0];
        const nonce = await rpcRequest("eth_getTransactionCount", [DEPLOYER, "latest"]);
        const chainId = await rpcRequest("eth_chainId", []);
        const signed = await wallet.signTransaction({
          to: tx.to,
          data: tx.data,
          value: tx.value ?? "0x0",
          gas: tx.gas ?? "0x4C4B40",
          gasPrice: tx.gasPrice ?? "0x0",
          nonce,
          chainId: parseInt(chainId, 16),
        });
        return rpcRequest("eth_sendRawTransaction", [signed]);
      }
      if (method === "eth_estimateGas") return "0x4C4B40";
      return rpcRequest(method, params);
    },
  };

  const client = createClient({
    chain: chains.studionet,
    endpoint: RPC_URL,
    account: DEPLOYER,
    provider,
  });

  // Check which projects are already submitted
  console.log("Checking existing project statuses...");
  const toSubmit = [];
  for (const p of PROJECTS) {
    const status = await client.readContract({
      address: OFFSETS,
      functionName: "get_project_status",
      args: [p.project_id],
    }).catch(() => -1);
    console.log(`  ${p.project_id}: status ${status}`);
    if (status === -1) toSubmit.push(p);
    else console.log(`  → already submitted, skipping`);
  }

  if (toSubmit.length === 0) {
    console.log("All projects already submitted.");
    return;
  }

  console.log(`\nSubmitting ${toSubmit.length} projects...\n`);

  for (const p of toSubmit) {
    console.log(`Submitting ${p.project_id}: ${p.name}`);
    try {
      const txHash = await client.writeContract({
        address: OFFSETS,
        functionName: "submit_project",
        args: [
          p.project_id, p.name, p.description, p.project_url,
          p.registry, p.country, p.project_type, p.price_usd_per_tonne,
        ],
        value: BigInt(0),
      });
      console.log(`  tx: ${txHash}`);
      console.log(`  polling...`);
      const result = await pollStatus(txHash);
      console.log(`\n  result: ${result}`);

      if (result === "finalized") {
        const status = await client.readContract({
          address: OFFSETS,
          functionName: "get_project_status",
          args: [p.project_id],
        }).catch(() => "?");
        console.log(`  contract status: ${status} (0=pending,1=verified,2=rejected)\n`);
      }
    } catch (e) {
      console.error(`  FAILED: ${e.message?.slice(0, 200)}\n`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
