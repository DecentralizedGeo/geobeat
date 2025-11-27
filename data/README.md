# GEOBEAT Data Directory

Essential data for GEOBEAT geographic decentralization analysis.

## Structure

- **raw/** - Original node location data from sources
  - `2025-11-22-ethereum-ips.csv` - Ethereum execution layer nodes
  - `2025-11-22-filecoin-ips.csv` - Filecoin storage nodes
  - `2025-11-22-polygon-ips.csv` - Polygon nodes
  - `2025-11-23-celo-ips.csv` - Celo nodes
  - `ethereum-cl/` - Ethereum consensus layer data

- **analysis_outputs/** - Example GDI calculation results
  - `ethereum_6958nodes_500km_h3-5_b4c6b09a/` - Example analysis run

- **timeseries/** - Historical trend data
  - `ethereum_timeseries.csv` - Time-series GDI scores
  - `ethereum_trends.png` - Visualization

- **RESEARCH.md** - Data source research notes

## Data Sources

See `/data-sources/` directory for comprehensive source inventory and methodology.

## Quick Stats

- **Networks:** Ethereum, Filecoin, Polygon, Celo
- **Total Nodes:** ~10,000+ across networks
- **Data Freshness:** November 2025
- **GeoIP Provider:** MaxMind GeoLite2

## Guidelines

- Never commit large binary files (use Git LFS if needed)
- Document data sources and licenses
- Include data dictionaries for datasets
- Track data lineage and transformations

## Privacy

- IP addresses analyzed are publicly available on blockchain networks
- All data sources documented in `/data-sources/INVENTORY.md`
- Follow applicable data protection regulations
