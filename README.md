# GEOBEAT

[![CI](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml/badge.svg)](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Geographic analytics platform for decentralized networks** - Visualize and analyze the geographic distribution of blockchain nodes to measure true decentralization.

🌍 [Live Demo](https://geobeat.xyz) | 📖 [Documentation](docs/) | 🏗️ [Architecture](docs/ARCHITECTURE.md)

## Overview

GEOBEAT provides real-time insights into the geographic distribution of decentralized networks, helping identify centralization risks, geographic dependencies, and regional trends.

### Key Features

- 📊 **Geographic Decentralization Index (GDI)** - Quantitative metrics for network distribution
- 🗺️ **Interactive Visualizations** - 3D globe, heatmaps, and geospatial funnel charts
- 🔄 **Continuous Data Collection** - Live monitoring via armiarma network crawlers
- 📈 **Time-Series Analysis** - Track geographic centralization trends over time
- 🌐 **Multi-Network Support** - Ethereum, Polygon, Filecoin, Bitcoin, and more

### Current Status

✅ **Phase 1 Complete** - Data collection infrastructure deployed
🚧 **Phase 2 In Progress** - Building REST API layer
📅 **Phase 3 Planned** - Live dashboard integration

## Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for analysis)
- **Git** with submodules support

### Installation

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/DecentralizedGeo/geobeat.git
cd geobeat

# Install root dependencies (includes Husky git hooks)
npm install

# Frontend setup
cd src/frontend/geobeat-ui
npm install
npm run dev

# Python analysis setup
cd ../../..
python -m venv .venv-analysis
source .venv-analysis/bin/activate  # On Windows: .venv-analysis\Scripts\activate
pip install -r requirements.txt
```

### Quick Commands

```bash
# Run frontend dashboard
cd src/frontend/geobeat-ui && npm run dev

# Run Python analysis
cd src/analysis && python gdi.py

# Update armiarma crawler submodule
git submodule update --remote --merge

# Run tests
npm test  # Frontend
pytest    # Python
```

## Architecture

GEOBEAT is built with a modular architecture:

```
┌─────────────────────────────────────────┐
│       Frontend (app.geobeat.xyz)        │
│         Next.js 16 + TypeScript         │
└───────────────┬─────────────────────────┘
                │ REST API
┌───────────────▼─────────────────────────┐
│        API Layer (api.geobeat.xyz)      │
│         Express + PostgreSQL            │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│      Data Collection Infrastructure     │
│  Armiarma Crawlers + Time-Series DB    │
└─────────────────────────────────────────┘
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Repository Structure

```
geobeat/
├── .beads/                 # Beads issue tracking (bd CLI)
├── data/                   # Network data and analysis outputs
│   ├── raw/               # Raw node IP data (CSV)
│   ├── analysis_outputs/  # GDI calculation results
│   └── timeseries/        # Historical trend data
├── data-sources/          # Data source documentation
│   ├── tools/armiarma/   # Network crawler (git submodule)
│   └── INVENTORY.md      # Comprehensive data source catalog
├── docs/                  # Project documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── DEPLOYMENT_CREDENTIALS.md  # Server access (not in git)
│   └── README.md         # Documentation index
├── research/              # Academic papers and methodology
├── src/                   # Source code
│   ├── analysis/         # Python GDI calculation engine
│   └── frontend/         # Next.js dashboard (geobeat-ui)
└── submission/            # ETHGlobal Buenos Aires 2025 materials
```

## Data Collection

GEOBEAT collects blockchain node data using:

- **Armiarma** - libp2p network crawler (Ethereum, Polygon, Filecoin)
- **Bitnodes API** - Bitcoin node data (planned)
- **Etherscan API** - Ethereum node statistics (planned)

Data is enriched with geolocation (MaxMind GeoLite2) and stored in PostgreSQL for time-series analysis.

## Development Workflow

### Using Beads (bd) for Task Tracking

This project uses [Beads](https://github.com/steveyegge/beads) for issue tracking:

```bash
# Check available work
bd ready

# Create a task
bd create "Implement API endpoint" --type=feature --priority=1

# Start working
bd update <issue-id> --status=in_progress

# Complete and sync
bd close <issue-id>
bd sync
```

See [AGENTS.md](AGENTS.md) for AI agent workflow instructions.

### Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(dashboard): add network selector dropdown
fix(gdi): correct H3 hexagon area calculation
docs(api): update endpoint documentation
chore(deps): upgrade Next.js to 16.1
```

Git hooks via Husky enforce commit message format automatically.

### Working with Submodules

The `armiarma` crawler is tracked as a git submodule:

```bash
# Update to latest version
git submodule update --remote --merge

# Make changes in submodule
cd data-sources/tools/armiarma
git checkout ethglobal-ba-2025
# ... make changes ...
git push

# Update parent repo reference
cd ../../..
git add data-sources/tools/armiarma
git commit -m "chore(armiarma): update submodule"
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code of conduct
- Development setup
- Pull request process
- Testing requirements

## Testing

### Frontend Tests
```bash
cd src/frontend/geobeat-ui
npm test
npm run test:coverage
```

### Python Tests
```bash
cd src/analysis
pytest
pytest --cov=. --cov-report=html
```

See [TESTING.md](TESTING.md) for comprehensive testing guidelines.

## Deployment

### Frontend (Vercel)
The dashboard is deployed to Vercel with automatic CI/CD:
- **Production**: https://geobeat.xyz
- **Preview**: Auto-deployed for every PR

### Data Collection Server (Hetzner)
Armiarma crawlers run on a Hetzner CX42 server:
- **Location**: Helsinki, Finland
- **Specs**: 8 vCPU, 16GB RAM, 320GB SSD
- **Cost**: €29.90/month

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deployment details.

## Data & Privacy

- **Node IP Data**: Collected via public DHT/P2P protocols
- **Geolocation**: MaxMind GeoLite2 database (city-level)
- **Privacy**: No personal data collected, only network topology
- **Data Retention**: 30-day rolling window for raw data

See [SECURITY.md](SECURITY.md) for security policies.

## Research

GEOBEAT was developed as part of academic research on blockchain decentralization:

- [Proposed Methodology](docs/PROPOSED_METHODOLOGY.md)
- [Data Source Inventory](data-sources/INVENTORY.md)
- [ETHGlobal Buenos Aires 2025 Submission](submission/)

## Roadmap

- [x] **Q4 2024**: Initial research and prototype
- [x] **Q1 2025**: ETHGlobal Buenos Aires demo
- [x] **Q1 2025**: Deploy data collection infrastructure
- [ ] **Q2 2025**: Launch public API (beta)
- [ ] **Q2 2025**: Real-time dashboard updates
- [ ] **Q3 2025**: Premium API tier with historical data
- [ ] **Q4 2025**: Multi-network GDI comparisons

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Armiarma** - Network crawler by [Miga Labs](https://github.com/migalabs/armiarma)
- **MaxMind GeoLite2** - Geolocation database
- **ETHGlobal** - Buenos Aires 2025 hackathon support
- **Beads** - Issue tracking by [Steve Yegge](https://github.com/steveyegge/beads)

## Contact

- **Website**: https://geobeat.xyz
- **GitHub**: https://github.com/DecentralizedGeo/geobeat
- **Issues**: Use `bd create` for task tracking or GitHub Issues for bugs

---

**Built with ❤️ for the decentralized web**
