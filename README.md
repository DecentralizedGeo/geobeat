# GEOBEAT

[![CI](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml/badge.svg)](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Geographic analytics for decentralized networks. Measure network distribution through continuous node monitoring and geospatial analysis.

[Live Dashboard](https://geobeat.xyz) | [Documentation](docs/) | [Architecture](docs/ARCHITECTURE.md)

## What It Does

GEOBEAT monitors blockchain networks to identify geographic centralization risks. The platform collects node location data, calculates distribution metrics, and presents results through interactive visualizations.

## Key Capabilities

- **Geographic Decentralization Index (GDI)** - Quantitative measurement of network distribution using H3 hexagonal hierarchical spatial indexing
- **Continuous monitoring** - Automated data collection from Ethereum, Polygon, and Filecoin networks via libp2p crawlers
- **Time-series analysis** - Track distribution changes over weeks and months
- **Interactive visualizations** - 3D globe rendering, heatmaps, and geospatial funnel charts

## Current Status

Phase 1 complete: Data collection infrastructure deployed and collecting peer data from Ethereum, Polygon, and Filecoin networks.

Phase 2 in progress: Building REST API layer for dashboard integration.

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git with submodules support

### Installation

```bash
# Clone repository with submodules
git clone --recurse-submodules https://github.com/DecentralizedGeo/geobeat.git
cd geobeat

# Install dependencies
npm install

# Frontend setup
cd src/frontend/geobeat-ui
npm install
npm run dev

# Python environment
cd ../../..
python -m venv .venv-analysis
source .venv-analysis/bin/activate
pip install -r requirements.txt
```

### Running Components

```bash
# Frontend dashboard
cd src/frontend/geobeat-ui && npm run dev

# Python GDI calculation
cd src/analysis && python gdi.py

# Update network crawler
git submodule update --remote --merge
```

## Architecture

GEOBEAT uses a three-layer architecture:

```
Frontend (app.geobeat.xyz)
    ↓ REST API
API Layer (api.geobeat.xyz)
    ↓ PostgreSQL
Data Collection (Hetzner)
```

**Data Collection Layer**: Armiarma crawlers run on a dedicated server, discovering peers via DHT protocols and storing IP addresses with timestamps in PostgreSQL.

**Processing Layer**: Python scripts enrich IP data with MaxMind GeoLite2 geolocation, calculate GDI metrics using H3 hexagonal grids, and generate time-series aggregates.

**Application Layer**: REST API serves processed data to the Next.js dashboard. Frontend renders interactive visualizations using Deck.gl and Mapbox GL.

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete system design.

## Repository Structure

```
geobeat/
├── .beads/                 # Issue tracking (bd CLI)
├── data/                   # Network data and analysis outputs
│   ├── raw/               # Node IP addresses (CSV)
│   ├── analysis_outputs/  # GDI calculation results
│   ├── timeseries/        # Historical trends
│   ├── tools/armiarma/   # Network crawler (submodule)
│   └── INVENTORY.md      # Data source catalog
├── docs/                  # Documentation
├── src/
│   ├── analysis/         # Python GDI engine
│   └── frontend/         # Next.js dashboard
└── research/              # Methodology papers
```

## Data Collection

The platform collects node data through:

- **Armiarma**: libp2p crawler for Ethereum, Polygon, and Filecoin networks
- **Bitnodes API**: Bitcoin node data (planned)
- **Etherscan API**: Ethereum statistics (planned)

Node IP addresses are geolocated using MaxMind GeoLite2 (city-level precision) and stored in PostgreSQL for time-series analysis.

## Development

### Task Tracking

This project uses [Beads](https://github.com/steveyegge/beads) for issue management:

```bash
# View available work
bd ready

# Create task
bd create "Add network selector" --type=feature --priority=1

# Start work
bd update <issue-id> --status=in_progress

# Complete
bd close <issue-id>
bd sync
```

### Commit Format

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(dashboard): add network selector dropdown
fix(gdi): correct hexagon area calculation
docs(api): document rate limiting
chore(deps): update Next.js to 16.1
```

Husky git hooks enforce this format automatically.

### Submodule Updates

The armiarma crawler is tracked as a git submodule:

```bash
# Update to latest
git submodule update --remote --merge

# Modify submodule
cd data/tools/armiarma
git checkout ethglobal-ba-2025
# make changes
git push

# Update parent reference
cd ../../..
git add data/tools/armiarma
git commit -m "chore(armiarma): update submodule"
```

## Testing

### Frontend

```bash
cd src/frontend/geobeat-ui
npm test
npm run test:coverage
```

### Python

```bash
cd src/analysis
pytest
pytest --cov=. --cov-report=html
```

See [TESTING.md](TESTING.md) for comprehensive testing guidelines.

## Deployment

### Frontend

The dashboard deploys to Vercel with automatic CI/CD:
- Production: https://geobeat.xyz
- Preview deployments for every pull request

### Data Collection

Armiarma crawlers run on a Hetzner CX42 server:
- Location: Helsinki, Finland
- Specs: 8 vCPU, 16GB RAM, 320GB SSD
- Monthly cost: €29.90

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for deployment procedures.

## Data & Privacy

Network topology data is collected via public DHT and P2P protocols. The platform stores only IP addresses and derived geolocation (city-level). No personal information is collected. Raw peer data uses a 30-day rolling retention window.

See [SECURITY.md](SECURITY.md) for security policies.

## Research

GEOBEAT was developed through academic research on blockchain decentralization:

- [Methodology](docs/PROPOSED_METHODOLOGY.md)
- [Data Source Inventory](data/INVENTORY.md)
- [ETHGlobal Buenos Aires Submission](submission/)

## Roadmap

**Q4 2024**: Research and prototype development

**Q1 2025**: ETHGlobal Buenos Aires demo, infrastructure deployment complete

**Q2 2025**: Public API beta launch, real-time dashboard updates

**Q3 2025**: Premium API tier with historical data access

**Q4 2025**: Multi-network GDI comparisons, additional network support

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, code review process, and testing requirements.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Armiarma network crawler by [Miga Labs](https://github.com/migalabs/armiarma)
- MaxMind GeoLite2 geolocation database
- ETHGlobal Buenos Aires 2025 program
- Beads issue tracking by [Steve Yegge](https://github.com/steveyegge/beads)

## Contact

- Website: https://geobeat.xyz
- Repository: https://github.com/DecentralizedGeo/geobeat
- Issues: Use `bd create` for feature requests or GitHub Issues for bugs
