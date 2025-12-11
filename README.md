# GEOBEAT

[![CI](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml/badge.svg)](https://github.com/DecentralizedGeo/geobeat/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

GEOBEAT measures geographic distribution across blockchain networks using node location data and spatial analysis.

## Vision

Blockchain networks claim to be decentralized, but geographic distribution matters for censorship resistance, regulatory risk, and infrastructure resilience. GEOBEAT quantifies this distribution through the Geographic Decentralization Index (GDI), a synthesis framework that integrates physical distribution, jurisdictional diversity, and infrastructure heterogeneity into a minimal, comprehensible structure.

The platform monitors Ethereum, Polygon, and Filecoin networks, tracking how node geography evolves over time.

## Quick Links

- [Live Dashboard](https://geobeat.xyz) - Interactive visualizations of current network distribution
- [Introducing GEOBEAT](https://www.geobeat.xyz/blog/introducing-geobeat) - Blog post outlining our motivation and vision
- [Methodology](docs/METHODOLOGY.md) - GDI calculation details and research approach

## Current Implementation

**Data Collection**: Armiarma crawler collected a snapshot of blockchain nodes through DHT and P2P protocols during ETHGlobal Buenos Aires (November 22, 2025). Continuous crawler deployment to Hetzner VPS is in progress.

**Analysis**: Python scripts enrich IP data with MaxMind GeoLite2 geolocation, calculate GDI metrics, and generate time-series trends.

**Dashboard**: Next.js application renders interactive heatmaps and geospatial charts using Deck.gl and Mapbox GL.

**Status**: Demo deployed at geobeat.xyz. Hetzner VPS provisioned for continuous crawler deployment.

## Repository Guide

```
geobeat/
├── .beads/                 # Issue tracking (bd CLI)
├── data/                   # Network data and analysis
│   ├── raw/               # Node IP addresses (CSV)
│   ├── analysis_outputs/  # GDI calculation results
│   ├── timeseries/        # Historical trends
│   ├── tools/armiarma/   # Network crawler (submodule)
│   └── methodology/      # Data source evaluation framework
├── docs/                  # Documentation
│   └── METHODOLOGY.md    # GDI research approach
├── src/
│   ├── analysis/         # Python GDI calculation engine
│   │   ├── gdi_standalone.py  # Production GDI calculator
│   │   ├── data_ingestion.py  # IP address processing
│   │   ├── models.py          # Data models
│   │   └── requirements.txt   # Python dependencies
│   ├── backend/          # Deployment configuration (planned)
│   └── frontend/         # Next.js dashboard
│       └── geobeat-ui/
└── assets/               # Brand assets, screenshots
```

## Running the Dashboard

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
```

The dashboard runs at http://localhost:3000

### Running GDI Calculations

```bash
# Set up Python environment
python -m venv .venv-analysis
source .venv-analysis/bin/activate
pip install -r src/analysis/requirements.txt

# Run GDI calculation (requires node IP data in data/raw/)
cd src/analysis
python gdi_standalone.py
```

Results appear in `data/analysis_outputs/` as JSON files consumed by the dashboard.

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

Armiarma crawlers will run on a Hetzner CX42 server:
- Location: Helsinki, Finland
- Specs: 8 vCPU, 16GB RAM, 320GB SSD
- Monthly cost: €29.90

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for deployment procedures.

## Data & Privacy

Network topology data is collected via public DHT and P2P protocols. The platform stores only IP addresses and derived geolocation (city-level). No personal information is collected. Raw peer data uses a 30-day rolling retention window.

See [SECURITY.md](SECURITY.md) for security policies.

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
