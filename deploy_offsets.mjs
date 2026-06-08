/**
 * Deploys the updated VerdantOffsets contract and verifies all 6 hardcoded projects.
 * Run: node deploy_offsets.mjs
 */
import { readFileSync } from "fs";
import { createClient, chains } from "genlayer-js";
import { transactionsStatusNumberToName } from "genlayer-js/types";

const RPC_URL  = "https://studio.genlayer.com/api";
const DEPLOYER = "0xBC1399c55538eC034d4Da550C03c34Ae0C357f53";
const PRIV_KEY = "0xd4479070c2a31da31a01e732ca51707132bacdb480aae432a0c8bd0b91eba4b7";
const POLL_MS  = 5000;
const MAX_POLLS = 120;

const PROJECT_IDS = ["VCS-934","GS-5409","VCS-1566","GS-2185","VCS-2228","GS-1788"];

async function rpc(method, params = []) {
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
    const tx = await rpc("eth_getTransactionByHash", [hash]).catch(() => null);
    if (!tx) continue;
    const raw = tx.status;
    let name;
    if (typeof raw === "string") name = raw === "ACTIVATED" ? "PENDING" : raw;
    else if (typeof raw === "number") name = transactionsStatusNumberToName[String(raw)] ?? null;
    if (!name) continue;
    process.stdout.write(`  [${i+1}] ${name}   \r`);
    if (["FINALIZED","ACCEPTED"].includes(name)) return "finalized";
    if (["CANCELED"].includes(name)) return "failed";
  }
  return "timeout";
}

async function main() {
  const { ethers } = await import("ethers");
  const wallet = new ethers.Wallet(PRIV_KEY);

  const provider = {
    async request({ method, params = [] }) {
      if (method === "eth_sendTransaction") {
        const tx = params[0];
        const nonce = await rpc("eth_getTransactionCount", [DEPLOYER, "latest"]);
        const chainId = await rpc("eth_chainId", []);
        const signed = await wallet.signTransaction({
          to: tx.to ?? null,
          data: tx.data,
          value: tx.value ?? "0x0",
          gas: tx.gas ?? "0x4C4B40",
          gasPrice: tx.gasPrice ?? "0x0",
          nonce,
          chainId: parseInt(chainId, 16),
        });
        return rpc("eth_sendRawTransaction", [signed]);
      }
      if (method === "eth_estimateGas") return "0x4C4B40";
      return rpc(method, params);
    },
  };

  const client = createClient({
    chain: chains.studionet,
    endpoint: RPC_URL,
    account: DEPLOYER,
    provider,
  });

  // Deploy new contract
  const contractCode = readFileSync(
    new URL("./contracts/verdant_offsets.py", import.meta.url),
    "utf8"
  );

  console.log("Deploying VerdantOffsets...");
  const deployHash = await client.deployContract({ code: contractCode, args: [] });
  console.log(`  tx: ${deployHash}`);
  const deployResult = await pollStatus(deployHash);
  console.log(`\n  status: ${deployResult}`);

  if (deployResult !== "finalized") {
    console.error("Deploy failed. Exiting.");
    process.exit(1);
  }

  // Get the deployed contract address
  const receipt = await rpc("eth_getTransactionReceipt", [deployHash]);
  const newAddress = receipt?.contractAddress;
  if (!newAddress) {
    // Try eth_getTransactionByHash
    const txData = await rpc("eth_getTransactionByHash", [deployHash]);
    console.log("tx data:", JSON.stringify(txData, null, 2).slice(0, 500));
    process.exit(1);
  }
  console.log(`\nNew contract address: ${newAddress}\n`);

  // Now seed all 6 projects via submit_project
  const PROJECTS = [
    { project_id: "VCS-934", name: "Kariba REDD+ Forest Protection", description: "785,000 hectares of Zimbabwean forest protected from illegal logging.", project_url: "https://registry.verra.org/app/projectDetail/VCS/934", registry: "verra", country: "Zimbabwe", project_type: "forestry", price: "12.50" },
    { project_id: "GS-5409", name: "Olkaria Geothermal Expansion", description: "Expansion of Kenya's Olkaria geothermal plant.", project_url: "https://registry.goldstandard.org/projects/details/5409", registry: "gold_standard", country: "Kenya", project_type: "renewable_energy", price: "18.00" },
    { project_id: "VCS-1566", name: "Mai Ndombe REDD+", description: "1.5 million hectares of tropical forest in DRC.", project_url: "https://registry.verra.org/app/projectDetail/VCS/1566", registry: "verra", country: "DR Congo", project_type: "forestry", price: "14.00" },
    { project_id: "GS-2185", name: "Improved Cookstoves Ethiopia", description: "High-efficiency biomass cookstoves in rural Ethiopia.", project_url: "https://registry.goldstandard.org/projects/details/2185", registry: "gold_standard", country: "Ethiopia", project_type: "cookstoves", price: "8.50" },
    { project_id: "VCS-2228", name: "Blue Carbon Mangrove Restoration", description: "Mangrove restoration along the Tanzanian coast.", project_url: "https://registry.verra.org/app/projectDetail/VCS/2228", registry: "verra", country: "Tanzania", project_type: "blue_carbon", price: "22.00" },
    { project_id: "GS-1788", name: "Biogas Digesters Rural India", description: "Livestock waste biogas digesters in Maharashtra and UP.", project_url: "https://registry.goldstandard.org/projects/details/1788", registry: "gold_standard", country: "India", project_type: "methane_capture", price: "9.00" },
  ];

  for (const p of PROJECTS) {
    console.log(`Submitting ${p.project_id}...`);
    const txHash = await client.writeContract({
      address: newAddress,
      functionName: "submit_project",
      args: [p.project_id, p.name, p.description, p.project_url, p.registry, p.country, p.project_type, p.price],
      value: BigInt(0),
    });
    console.log(`  tx: ${txHash}`);
    const result = await pollStatus(txHash);
    console.log(`\n  result: ${result}`);
  }

  // Now admin-force-verify all projects
  console.log("\nForce-verifying all projects...");
  for (const pid of PROJECT_IDS) {
    const status = await client.readContract({ address: newAddress, functionName: "get_project_status", args: [pid] }).catch(() => -1);
    console.log(`  ${pid} current status: ${status}`);
    if (status !== 1) {
      console.log(`  → force-verifying...`);
      const txHash = await client.writeContract({
        address: newAddress,
        functionName: "admin_set_project_status",
        args: [pid, 1],
        value: BigInt(0),
      });
      const result = await pollStatus(txHash);
      console.log(`\n  result: ${result}`);
    } else {
      console.log(`  → already verified`);
    }
  }

  // Final status check
  console.log("\nFinal project statuses:");
  for (const pid of PROJECT_IDS) {
    const s = await client.readContract({ address: newAddress, functionName: "get_project_status", args: [pid] }).catch(() => "?");
    console.log(`  ${pid}: ${s}`);
  }

  console.log(`\n✓ New contract address: ${newAddress}`);
  console.log("Update NEXT_PUBLIC_OFFSETS_ADDRESS in .env.local and Vercel.");
}

main().catch(console.error);
