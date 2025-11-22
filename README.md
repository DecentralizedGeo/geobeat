# GeoBeat

A geographic decentralization index and dashboard for analyzing the distribution and concentration of blockchain networks, communities, and digital ecosystems.

## Overview

GeoBeat provides insights into the geographic distribution of decentralized networks, helping identify centralization risks, geographic dependencies, and regional trends.

## Project Status

🚧 **In Development** - This project is currently in the research and design phase.

## Repository Structure

```
geobeat/
├── research/          # Research notes, papers, and analysis
├── design/           # Design documents, specifications, and architecture
├── docs/             # Project documentation
├── data/             # Data collection and processing
│   ├── raw/         # Raw data sources
│   ├── processed/   # Cleaned and processed datasets
│   └── scripts/     # Data processing scripts
├── src/             # Source code
│   ├── backend/     # Backend services (data processing, APIs)
│   └── frontend/    # Frontend application (dashboard)
└── tests/           # Test suites
```

## Development Workflow

### Research Phase
1. Document findings in `research/`
2. Track data sources and methodologies
3. Record insights and considerations

### Design Phase
1. Create specifications in `design/`
2. Document architecture decisions
3. Design data models and APIs

### Development Phase
1. Implement features following specifications
2. Write tests alongside code
3. Document code and APIs

## Setup

### Prerequisites
- Git
- Node.js (for Husky git hooks)

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd geobeat

# Install dependencies (includes Husky setup)
npm install

# For Python development
pip install -r requirements.txt
```

## Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `research`: Research findings and analysis
- `design`: Design documents and specifications

**Examples:**
```
feat(dashboard): add geographic heatmap visualization
fix(data): correct coordinate parsing for EU nodes
docs(readme): update setup instructions
research: analyze validator distribution patterns
design(api): specify data ingestion endpoints
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on contributing to this project.

## License

TBD

## Contact

TBD
