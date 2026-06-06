# Verdant

There are hundreds of carbon footprint calculators on the internet. Most of them are funded by energy companies, offset brokers, or people with something to sell. They use static emission tables from years ago, pre-fill generous defaults so the numbers look manageable, and nudge you toward whatever product they happen to be advertising. The result you get is not your footprint. It is their footprint estimate, optimised for your comfort.

Verdant does not do that.

You submit your actual numbers: what you spent on electricity, how far you flew, what you eat. The calculation uses live emission factors pulled at the moment you submit, from sources that do not belong to anyone with a financial interest in the outcome. The result is written to the blockchain against your wallet address, permanently, and nobody can change it afterwards. Not even us.

That is the whole principle. Numbers you can verify. Records you can trust.

---

## How it works

Verdant runs on GenLayer, a blockchain where intelligent contracts can make real HTTP requests and call AI models as part of transaction execution. This is what makes the approach possible.

When you submit a footprint calculation, the contract reaches out to Our World in Data and DEFRA to fetch current electricity carbon intensity and transport conversion factors. It passes your numbers and those factors to an AI model that performs the calculation and returns a structured result. The key part is that multiple independent validators each run this entire process separately. If their results do not agree within five percent, the transaction is rejected and nothing is written. Consensus is the condition for a record to exist.

Your footprint record accumulates year over year, tied to your wallet. The history is readable by anyone but writable only by you, and only by submitting through the contract itself.

For offset projects, the same principle applies in reverse. Before you can retire credits against a project, the contract fetches the project's public listing from the Verra VCS registry or the Gold Standard registry and asks an AI to assess whether the monitoring data supports what the project claims. A project that has lapsed, been flagged, or cannot be verified is blocked outright. The retirement itself is permanent once confirmed.


## Data sources

| Category | Source |
|---|---|
| Electricity carbon intensity | IEA via Our World in Data |
| Transport conversion factors | DEFRA Greenhouse Gas Conversion Factors 2024 |
| Dietary footprint estimates | Poore & Nemecek 2018, via Our World in Data |
| Offset project status | Verra VCS public registry |
| Offset project status | Gold Standard public registry |

These sources are independent, publicly available, and not owned by anyone in this project.


## Using the app

The live app is at [verdant-footprint.vercel.app](https://verdant-footprint.vercel.app). You will need a MetaMask compatible wallet and the GenLayer Studio network added to it.

Network details for MetaMask:

```
Network name:  GenLayer Studio
Chain ID:      61999
RPC URL:       https://studio.genlayer.com/api
Currency:      GEN
```

The app will prompt you to switch to this network when you connect. Once connected, you can calculate your footprint, view your on-chain history on the dashboard, and browse offset projects.


## Running it locally

You need Python 3.10 or later, Node.js 18 or later, and the GenLayer CLI.

Start a local GenLayer node:

```bash
genlayer up
```

Deploy the contracts:

```bash
genlayer deploy --contract contracts/verdant_footprint.py
genlayer deploy --contract contracts/verdant_offsets.py
```

Note the contract addresses printed in the output. Then set up the frontend:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_FOOTPRINT_ADDRESS=0x...
NEXT_PUBLIC_OFFSETS_ADDRESS=0x...
```

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and connect your wallet to the local node (chain ID 61999, RPC `http://127.0.0.1:4000/api`).


## Running the tests

The test suite requires a running GenLayer Studio node and skips automatically when one is not available.

```bash
genlayer up
pip install -e ".[dev]"
pytest tests/ -v
```

The footprint tests cover calculation structure and category breakdown, dietary pattern differences producing meaningfully different results, EV versus petrol transport emissions, country grid intensity differences, year and label persistence, invalid input handling, record count and history accumulation, and emission context values falling within plausible ranges.

The offset tests cover project submission and verification flow, status codes for active and inactive projects, rejection of retirements against unverified projects, and rejection of zero or negative amounts.


## Project structure

```
verdant/
├── contracts/
│   ├── verdant_footprint.py     Footprint calculation and on-chain storage
│   └── verdant_offsets.py       Offset registry with live AI verification
├── tests/
│   ├── conftest.py
│   ├── test_footprint.py        22 tests
│   └── test_offsets.py          21 tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx             Landing page
│   │   ├── calculate/           Multi-step footprint calculator
│   │   ├── dashboard/           Personal history and breakdown
│   │   └── offsets/             Verified offset marketplace
│   ├── components/
│   ├── hooks/
│   └── lib/
└── README.md
```


## License

MIT
