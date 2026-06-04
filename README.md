# Verdant

Personal carbon footprint, actually verified.

Every calculator gives a different number depending on who built it and what they want you to believe. Verdant calculates your footprint from data you submit — energy bills, transport records, dietary patterns — cross-referenced against independently published emissions databases. Offset projects are verified by AI against real registry monitoring data before you can purchase them. Your footprint record is stored on-chain, permanent, and comparable year over year.

No sponsors. No greenwashing. Numbers you can trust.

---

## What it does

You enter your annual energy consumption, how you travel, and what you eat. The contract fetches current emission factors from IEA, DEFRA, and Our World in Data, runs the calculation, and writes the result to the GenLayer blockchain against your wallet address. You get a breakdown by category and the data sources used.

For carbon offsets, each project in the registry is checked against its Verra or Gold Standard public listing before it can be used. The AI reads the monitoring data and flags anything that does not add up.

---

## Data sources

- **IEA** — electricity carbon intensity by country (gCO₂/kWh)
- **DEFRA 2024** — greenhouse gas conversion factors for transport (UK)
- **Poore & Nemecek (2018)** — global food system emissions, via Our World in Data
- **Verra VCS public registry** — offset project status and issuance data
- **Gold Standard public registry** — offset project verification

---

## Project structure

```
verdant/
├── contracts/
│   ├── verdant_footprint.py     # Footprint calculation and on-chain storage
│   └── verdant_offsets.py       # Offset project registry with AI verification
├── tests/
│   ├── conftest.py
│   ├── test_footprint.py        # 22 tests for the footprint contract
│   └── test_offsets.py          # 21 tests for the offsets contract
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── calculate/           # Multi-step footprint calculator
│   │   ├── dashboard/           # Personal footprint history and breakdown
│   │   └── offsets/             # Verified offset marketplace
│   ├── components/
│   ├── hooks/
│   └── lib/
├── pyproject.toml
└── README.md
```

---

## Getting started

### Requirements

- Python 3.10+
- Node.js 18+
- GenLayer Studio (for local contract testing and deployment)
- A MetaMask-compatible wallet

### Run GenLayer Studio

```bash
genlayer up
```

Studio starts at `http://127.0.0.1:4000`.

### Deploy the contracts

```bash
genlayer deploy --contract contracts/verdant_footprint.py
genlayer deploy --contract contracts/verdant_offsets.py
```

Note both contract addresses from the output.

### Set up the frontend

```bash
cd frontend
cp .env.example .env.local
# edit .env.local with the contract addresses from above
```

```
NEXT_PUBLIC_FOOTPRINT_ADDRESS=0x...
NEXT_PUBLIC_OFFSETS_ADDRESS=0x...
```

Then:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Connect your wallet to GenLayer Studio (chain ID 61999, RPC `http://127.0.0.1:4000/api`). The app will prompt you to switch networks if you are on the wrong one.

---

## Running the tests

Tests run against a live GenLayer Studio node. They skip automatically when Studio is not running.

```bash
# from the project root
genlayer up
pip install -e ".[dev]"
pytest tests/ -v
```

The test suite covers:

- Footprint calculation returns correct JSON structure with breakdown by category
- High-meat diet has higher diet emissions than vegan
- EV has lower transport emissions than petrol car
- China grid carbon intensity is higher than Sweden
- Year and label are persisted correctly in on-chain records
- Invalid year values are clamped to a valid default
- Record count increments on each submission
- History accumulates across multiple calls
- Emission context returns plausible global averages
- Malformed input does not crash the contract
- Project submission returns a valid verification result
- Project status codes are within expected range
- Retiring against a non-existent project raises an error
- Zero or negative retirement amounts are rejected

---

## How the contracts work

Verdant uses GenLayer intelligent contracts, which can make HTTP requests and run LLM prompts as part of transaction execution. Multiple validators independently re-run the contract logic and reach consensus on the result before it is written to chain.

**verdant_footprint.py**

Takes energy, transport, and diet data as JSON, fetches emission factors from real sources, and uses an LLM to calculate CO₂e. The consensus principle requires all validators to agree within 5% — if they do not, the transaction fails. The result is stored against the caller's address.

**verdant_offsets.py**

When a project is submitted, the contract fetches its page from the Verra or Gold Standard registry API. An LLM then assesses whether the monitoring data supports the claimed sequestration and whether there are any fraud indicators. Only verified projects (status 1) can be retired against.

---

## Wallet connection

The app enforces GenLayer Studio as the connected network. If your wallet is on a different network, it will prompt you to switch automatically. You can add GenLayer Studio manually:

- Network name: GenLayer Studio
- Chain ID: 61999
- RPC URL: `http://127.0.0.1:4000/api`
- Currency symbol: GEN

A disconnect button is visible in the header when connected.

---

## License

MIT
