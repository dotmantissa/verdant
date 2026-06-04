// GenLayer Studio network
export const CHAIN_ID = 61999;
export const CHAIN_ID_HEX = "0xF22F";
export const RPC_URL = "http://127.0.0.1:4000/api";
export const NETWORK_NAME = "GenLayer Studio";
export const NETWORK_CURRENCY = { name: "GEN", symbol: "GEN", decimals: 18 };

// Contract addresses — populated after deployment
export const FOOTPRINT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_FOOTPRINT_ADDRESS ?? "";
export const OFFSETS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_OFFSETS_ADDRESS ?? "";

// Transaction polling
export const TX_POLL_INTERVAL = 3000;
export const TX_POLL_RETRIES = 200;

// ABIs
export const FOOTPRINT_ABI = [
  {
    name: "calculate_footprint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "energy_data", type: "string" },
      { name: "transport_data", type: "string" },
      { name: "diet_data", type: "string" },
      { name: "country_code", type: "string" },
      { name: "year", type: "int256" },
      { name: "label", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "get_latest_footprint",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "int256" }],
  },
  {
    name: "get_footprint_history",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "get_record_count",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "int256" }],
  },
  {
    name: "get_emission_context",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
];

export const OFFSETS_ABI = [
  {
    name: "submit_project",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "project_id", type: "string" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "project_url", type: "string" },
      { name: "registry", type: "string" },
      { name: "country", type: "string" },
      { name: "project_type", type: "string" },
      { name: "price_usd_per_tonne", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "retire_offsets",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "project_id", type: "string" },
      { name: "tonnes_co2e", type: "string" },
      { name: "beneficiary_name", type: "string" },
      { name: "retirement_reason", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "get_project",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "project_id", type: "string" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "get_project_status",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "project_id", type: "string" }],
    outputs: [{ name: "", type: "int256" }],
  },
  {
    name: "get_retirements",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "get_total_retired",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "int256" }],
  },
  {
    name: "get_project_total_retired",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "project_id", type: "string" }],
    outputs: [{ name: "", type: "int256" }],
  },
];
