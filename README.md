# Verdant

Personal carbon footprint, actually verified.

Every calculator gives a different number depending on who built it and what they want you to believe. Verdant calculates your footprint from data you submit — energy bills, transport records, dietary patterns — cross-referenced against independently published emissions databases. Offset projects are verified by AI against real registry monitoring data before you can purchase them. Your footprint record is stored on-chain, permanent, and comparable year over year.

No sponsors. No greenwashing. Numbers you can trust.


## What it does

You enter your annual energy consumption, how you travel, and what you eat. The contract fetches current emission factors from IEA, DEFRA, and Our World in Data, runs the calculation, and writes the result to the GenLayer blockchain against your wallet address. You get a breakdown by category and the data sources used.

For carbon offsets, each project in the registry is checked against its Verra or Gold Standard public listing before it can be used. The AI reads the monitoring data and flags anything that does not add up.


## Data sources

Electricity carbon intensity by country comes from the IEA via Our World in Data. Greenhouse gas conversion factors for transport come from DEFRA 2024. Food system emissions are drawn from Poore and Nemecek (2018), also via Our World in Data. Offset project status and issuance data come from the Verra VCS public registry and the Gold Standard public registry.


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


## Getting started

You need Python 3.10 or later, Node.js 18 or later, GenLayer Studio for local contract testing and deployment, and a MetaMask-compatible wallet.

Start GenLayer Studio:

```bash
genlayer up
```

Studio starts at `http://127.0.0.1:4000`.

Deploy both contracts and note the addresses from the output:

```bash
genlayer deploy --contract contracts/verdant_footprint.py
genlayer deploy --contract contracts/verdant_offsets.py
```

Set up the frontend:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with the contract addresses:

```
NEXT_PUBLIC_FOOTPRINT_ADDRESS=0x...
NEXT_PUBLIC_OFFSETS_ADDRESS=0x...
```

Then install and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Connect your wallet to GenLayer Studio (chain ID 61999, RPC `http://127.0.0.1:4000/api`). The app will prompt you to switch networks if you are on the wrong one.


## Running the tests

Tests run against a live GenLayer Studio node and skip automatically when Studio is not running.

```bash
genlayer up
pip install -e ".[dev]"
pytest tests/ -v
```

The suite covers footprint calculation returning the correct JSON structure with a breakdown by category, high-meat diet producing higher diet emissions than vegan, EV producing lower transport emissions than petrol, China grid carbon intensity being higher than Sweden, year and label being persisted correctly in on-chain records, invalid year values being clamped to a valid default, record count incrementing on each submission, history accumulating across multiple calls, emission context returning plausible global averages, malformed input not crashing the contract, project submission returning a valid verification result, project status codes being within the expected range, retiring against a non-existent project raising an error, and zero or negative retirement amounts being rejected.


## How the contracts work

Verdant uses GenLayer intelligent contracts, which can make HTTP requests and run LLM prompts as part of transaction execution. Multiple validators independently re-run the contract logic and reach consensus on the result before it is written to chain.

`verdant_footprint.py` takes energy, transport, and diet data as JSON, fetches emission factors from real sources, and uses an LLM to calculate CO2e. The consensus principle requires all validators to agree within 5 percent — if they do not, the transaction fails. The result is stored against the caller's address.

`verdant_offsets.py` fetches a project's page from the Verra or Gold Standard registry API when a project is submitted. An LLM then assesses whether the monitoring data supports the claimed sequestration and whether there are any fraud indicators. Only verified projects can be retired against.


## Wallet connection

The app enforces GenLayer Studio as the connected network. If your wallet is on a different network, it will prompt you to switch automatically. You can add GenLayer Studio manually with network name GenLayer Studio, chain ID 61999, RPC URL `http://127.0.0.1:4000/api`, and currency symbol GEN.

A disconnect button is visible in the header when connected.


## License

MIT
