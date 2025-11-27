# Framework & Tool Documentation for Blockchain Node Geographic Data Reconnaissance

> **⚠️ METHODOLOGY REFERENCE**
> This is a **reference guide** documenting how GeoIP databases, APIs, and tools work.
> It contains **technical documentation**, NOT actual evaluations of specific data sources.
> For actual data source evaluations, see `../INVENTORY.md` (to be created).

**Date Created:** 2025-11-22
**Purpose:** Technical reference for GeoIP databases, blockchain APIs, and data formats

---

This document provides comprehensive documentation on the frameworks, tools, and data sources relevant to blockchain node geographic data reconnaissance for the Geobeat project.

---

## Table of Contents

1. [GeoIP Databases](#1-geoip-databases)
2. [Blockchain Node Explorer APIs](#2-blockchain-node-explorer-apis)
3. [P2P Network Crawling Frameworks](#3-p2p-network-crawling-frameworks)
4. [REST/GraphQL API Patterns](#4-restgraphql-api-patterns)
5. [Data Licensing Considerations](#5-data-licensing-considerations)
6. [Common Data Formats](#6-common-data-formats)
7. [Detection Capabilities & Biases](#7-detection-capabilities--biases)

---

## 1. GeoIP Databases

### 1.1 MaxMind GeoLite2

**Official Documentation:** [https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/)

**Database Documentation:** [https://dev.maxmind.com/geoip/docs/databases/](https://dev.maxmind.com/geoip/docs/databases/)

#### Capabilities

- **Database Types:**
  - City Database: Country, subdivisions (regions), city, postal code for IPv4/IPv6
  - Country Database: Country-level geolocation for IPv4/IPv6
  - ASN Database: Autonomous System Number and organization name
  - Anonymous IP Database: Detects VPN, proxy, datacenter IPs, Tor exit nodes

- **API Libraries:**
  - Java: [https://maxmind.github.io/GeoIP2-java/](https://maxmind.github.io/GeoIP2-java/)
  - Python: [https://geoip2.readthedocs.io/](https://geoip2.readthedocs.io/)
  - PHP: [https://maxmind.github.io/GeoIP2-php/](https://maxmind.github.io/GeoIP2-php/)
  - Node.js: [https://maxmind.github.io/GeoIP2-node/](https://maxmind.github.io/GeoIP2-node/)
  - .NET: [https://github.com/maxmind/GeoIP2-dotnet](https://github.com/maxmind/GeoIP2-dotnet)

- **Lookup Methods:** City, country, ASN, ISP, anonymous IP detection

#### Limitations

- **Accuracy:** IP geolocation is inherently imprecise. Locations are often near population centers, not exact addresses
- **Precision Warning:** Should NOT be used to identify specific addresses or households
- **GeoLite2 vs GeoIP2:** GeoLite2 offers a subset of features; premium GeoIP2 has higher accuracy
- **Feature Limitations:** Insights service not available in GeoLite2

#### Licensing & Terms of Use

**End User License Agreement:** [https://www.maxmind.com/en/geolite2/eula](https://www.maxmind.com/en/geolite2/eula)

**License Type:** Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)

**Key Terms:**
- **Attribution Required:** Must credit MaxMind when sharing data with others
- **Internal Use Allowed:** Can use for internal business purposes
- **External Display Allowed:** Can display data to users outside your organization with attribution
- **No Individual Identification:** Cannot use data to identify specific households, individuals, or street addresses
- **Selling/Redistribution:** Requires Commercial Redistribution License (annual fee)

**Commercial Redistribution License:** [https://www.maxmind.com/en/geolite-commercial-redistribution-license](https://www.maxmind.com/en/geolite-commercial-redistribution-license)
- Pricing: [https://www.maxmind.com/en/geolite2-commercial-redistribution](https://www.maxmind.com/en/geolite2-commercial-redistribution)

**Academic Research:**
- Free under EULA for academic research with attribution
- Can publish results in academic papers (including commercial journals)
- Must attribute MaxMind in publications

**Download & Updates:** [https://support.maxmind.com/hc/en-us/articles/4408216129947-Download-and-Update-Databases](https://support.maxmind.com/hc/en-us/articles/4408216129947-Download-and-Update-Databases)

#### Accuracy Studies

According to academic research:
- Router geolocation accuracy: 77.5%-78.6% at city level
- City-level accuracy has room for improvement
- Anonymous IP detection: Very accurate for hosting/datacenter and Tor; moderately accurate for VPN/proxy

---

### 1.2 IP2Location

**Official Site:** [https://www.ip2location.com](https://www.ip2location.com)

**Database Overview:** [https://www.ip2location.com/database/ip2location/](https://www.ip2location.com/database/ip2location/)

#### Capabilities

- **Detection Capabilities:**
  - Country, region, city, coordinates, zip code, time zone
  - ISP, domain name, connection type, area code
  - MCC, MNC, mobile brand name
  - Elevation, usage type, address type, IAB category
  - Anonymous proxy, VPN, TOR detection
  - Search engine bots, residential proxies, datacenter IPs

- **API Libraries:** Available for D, and multiple other languages via GitHub

#### Accuracy & Limitations

**Accuracy Comparison (Academic Research):**
- Pairwise comparison with other databases shows 2.5 billion locations within 50km agreement
- Overall average distance discrepancy: 296 km when compared to IPGeolocation.io
- Router geolocation accuracy: 77.5%-78.6% (comparable to MaxMind-Lite)
- High coverage but low city-level accuracy
- Accuracy degrades 1%-5% per month when using outdated database
- Threshold: <50 miles distance variance for "accurate"

**Coverage:** >85% of IPv4 space covered by major GeoIP databases

**Consistency:** Numerous inconsistencies when comparing databases pairwise

#### Licensing & Terms of Use

**LITE Database:** [https://lite.ip2location.com/ip2location-lite](https://lite.ip2location.com/ip2location-lite)

**License Type:** Open-Source License

**Pricing:**
- **LITE Version:** FREE for personal and commercial use
- **Commercial Version:** Starting at $49/year

**Terms of Use:** [https://lite.ip2location.com/data-license](https://lite.ip2location.com/data-license)

**Key Terms:**
- **Attribution Required:** Must display: "[Your site/product name] uses the IP2Location LITE database for IP geolocation"
- **Redistribution Prohibited:** Cannot redistribute or resell
- **Endorsement Restrictions:** Cannot use "IP2Location.com" to endorse products without permission
- **Commercial Alternative:** $49+ databases do not require attribution

**Academic Use:**
- Free LITE version suitable for academic research
- Attribution required in publications
- No commercial restriction for academic research use

---

### 1.3 GeoIP Database Comparison

**Comparison Resource:** [https://ipinfo.io/blog/ip-geolocation-providers](https://ipinfo.io/blog/ip-geolocation-providers)

**Academic Accuracy Study:** [https://www.researchgate.net/publication/372091523_Accuracy_and_Coverage_Analysis_of_IP_Geolocation_Databases](https://www.researchgate.net/publication/372091523_Accuracy_and_Coverage_Analysis_of_IP_Geolocation_Databases)

#### Key Findings

- **Coverage:** Most databases cover >85% of IPv4 space
- **Accuracy:** Far from satisfactory with numerous pairwise inconsistencies
- **Best Agreement:** IP2Location-IPGeolocation.io showed most agreement
- **Update Frequency Critical:** 1-5% accuracy degradation per month without updates
- **Router Geolocation:** NetAcuity performs better (89.4%) vs MaxMind/IP2Location (77.5%-78.6%)

---

## 2. Blockchain Node Explorer APIs

### 2.1 Bitnodes.io (Bitcoin)

**API Documentation:** [https://bitnodes.io/api/](https://bitnodes.io/api/)

**Main Site:** [https://bitnodes.io/](https://bitnodes.io/)

#### API Overview

**Purpose:** Estimates Bitcoin P2P network size by finding all reachable nodes

**Authentication:** Public API - no authentication required for basic use

#### Rate Limits

- **Unauthenticated:** 50 requests/day per IP address
- **Authenticated (PRO plan):** 200,000 requests/day with API key

#### Key Endpoints

**Snapshots Endpoint:**
```
GET https://bitnodes.io/api/v1/snapshots/<TIMESTAMP>/
```

Parameters:
- `TIMESTAMP`: Specific timestamp or "latest" for most recent snapshot
- `field=coordinates`: Returns unique latitude/longitude pairs
- `field=user_agents`: Returns unique user agent strings

**Geographic Data:**
- Live Map: [https://bitnodes.io/nodes/live-map/](https://bitnodes.io/nodes/live-map/)
- By Country: [https://bitnodes.io/nodes/all/countries/1d/](https://bitnodes.io/nodes/all/countries/1d/)
- By City: [https://bitnodes.io/nodes/all/cities/30d/](https://bitnodes.io/nodes/all/cities/30d/)
- By ASN: [https://bitnodes.io/nodes/all/asns/1d/](https://bitnodes.io/nodes/all/asns/1d/)
- By Service: [https://bitnodes.io/nodes/all/services/1d/](https://bitnodes.io/nodes/all/services/1d/)

#### Data Schema (Typical Response)

Full node data includes:
- IP address and port
- City, country code
- Latitude, longitude
- Timezone
- ASN (Autonomous System Number)
- ISP details
- User agent string
- Protocol version
- Services offered

#### Provisioning Crawler

**Documentation:** [https://github.com/ayeowch/bitnodes/wiki/Provisioning-Bitcoin-Network-Crawler](https://github.com/ayeowch/bitnodes/wiki/Provisioning-Bitcoin-Network-Crawler)

#### Limitations

- Only tracks **reachable** nodes (not nodes behind firewalls/NAT)
- Single vantage point measurement
- No pagination available for snapshot endpoint (raw export)
- Rate limiting for public API

---

### 2.2 Ethernodes.org (Ethereum)

**Main Site:** [https://ethernodes.org/](https://ethernodes.org/)

**Operator:** bitfly explorer gmbh

#### Available Data Views

- Clients: [https://ethernodes.org/](https://ethernodes.org/)
- Countries: [https://ethernodes.org/countries](https://ethernodes.org/countries)
- All Nodes: [https://ethernodes.org/nodes](https://ethernodes.org/nodes)

#### Research Usage

**Academic Dataset:**
- Researchers have collected monthly snapshots from 2016-2023
- Data includes: total nodes, countries, operating systems, client versions, network types
- Used extensively in academic research on Ethereum decentralization

**Geographic Distribution Insights:**
- U.S.: 46.4% of distributed Ethereum nodes
- Germany: 13.4% of nodes
- Combined: Nearly 60% of nodes worldwide
- Approximately 8,200 Ethereum super nodes (as of recent data)

#### API Status

**Note:** Specific API documentation for Ethernodes.org was not publicly available in search results. API access may require direct contact with the operators.

**Related Tools:**
- Etherscan Node Tracker: [https://etherscan.io/nodetracker](https://etherscan.io/nodetracker)
- Cambridge Blockchain Network Sustainability Index: [https://ccaf.io/cbnsi/ethereum/network_analytics](https://ccaf.io/cbnsi/ethereum/network_analytics)

#### Limitations

- API documentation not publicly indexed
- May require authentication or special access
- Possible rate limiting
- Focus on reachable nodes only

---

### 2.3 Generic Ethereum Node RPC Access

**Ethereum Nodes Documentation:** [https://ethereum.org/developers/docs/nodes-and-clients/](https://ethereum.org/developers/docs/nodes-and-clients/)

**Backend API Libraries:** [https://ethereum.org/developers/docs/apis/backend](https://ethereum.org/developers/docs/apis/backend)

#### JSON-RPC API

All Ethereum clients implement the JSON-RPC specification for programmatic blockchain interaction.

**Node Service Providers:**
- QuickNode: [https://www.quicknode.com/chains/eth](https://www.quicknode.com/chains/eth)
  - Docs: [https://www.quicknode.com/docs/ethereum](https://www.quicknode.com/docs/ethereum)
- GetBlock.io: [https://getblock.io/nodes/eth/](https://getblock.io/nodes/eth/)
- Ankr: [https://www.ankr.com/rpc/eth/](https://www.ankr.com/rpc/eth/)
- Google Cloud Blockchain Node Engine: [https://cloud.google.com/blockchain-node-engine/docs/using-nodes-ethereum](https://cloud.google.com/blockchain-node-engine/docs/using-nodes-ethereum)

**Note:** Standard RPC endpoints do not expose peer geographic information; they're for transaction/block data access.

---

## 3. P2P Network Crawling Frameworks

### 3.1 Nebula (Multi-Network DHT Crawler)

**GitHub Repository:** [https://github.com/dennis-tra/nebula](https://github.com/dennis-tra/nebula)

**Project Description:** Network agnostic DHT crawler, monitor, and measurement tool

**Research Paper:** [https://ethresear.ch/t/nebula-a-novel-discv5-dht-crawler/17488](https://ethresear.ch/t/nebula-a-novel-discv5-dht-crawler/17488)

**ProbeLab Tool Page:** [https://probelab.io/tools/nebula/](https://probelab.io/tools/nebula/)

#### Supported Networks

- IPFS (Kad-DHT)
- Ethereum (discv4, discv5)
- Celestia
- Bitcoin-related networks
- Generic Kademlia-based DHTs

#### Implementation Details

- **Language:** Go
- **Dependencies:** Uses go-ethereum packages for peer communication (primarily discover package)
- **Protocol Support:** discv4, discv5, libp2p Kademlia implementations

#### Output Formats

**1. JSON Documents** (default)
- Stored in `./results/` subdirectory after crawl completion
- Disabled by default: Full routing table information (`*_neighbors.json`)
- Reason: Large file size (~250MB for Amino DHT as of April 2023)

**2. Database Storage**
- PostgreSQL support
- Clickhouse support

#### Data Schema

**Neighbors JSON Structure:**
```json
{
  "PeerID": "unique_peer_identifier",
  "NeighborIDs": ["neighbor_id_1", "neighbor_id_2", ...]
}
```

**Visit Information:**
- Latency measurements:
  - Dial duration
  - Connect duration
  - Crawl duration
- Multi-addresses (current set)
- Agent version
- Supported protocols

**Convert to Adjacency List:**
```bash
jq -r '.NeighborIDs[] as $neighbor | [.PeerID, $neighbor] | @csv' < *_neighbors.json
```

#### CLI Options

- `--json-out`: Enable JSON document output
- Additional flags for database storage and neighbor tracking

#### Crawling Methodology

Uses carefully crafted FIND_NODE messages to fetch entire remote peer table contents.

#### Limitations

- Large data size for full routing tables
- Single vantage point perspective
- Snapshot-based (not continuous unless specifically configured)
- Kademlia-DHT focus (other P2P topologies not supported)

#### Related Tools

**Nebula Crawler Reports:** [https://github.com/dennis-tra/nebula-crawler-reports](https://github.com/dennis-tra/nebula-crawler-reports)
- Contains weekly reports for IPFS and other networks
- Example: [2023 Calendar Week 0 IPFS Report](https://github.com/dennis-tra/nebula-crawler-reports/blob/main/2023/calendar-week-0/ipfs/README.md)

---

### 3.2 Armiarma (Ethereum Consensus Layer Crawler)

**GitHub Repository:** [https://github.com/migalabs/armiarma](https://github.com/migalabs/armiarma)

**Description:** Libp2p open-network crawler with current focus on Ethereum's Consensus Layer (CL) network

#### Purpose

- P2P network analysis of Ethereum 2.0 mainnet
- Built specifically for Ethereum Beacon Chain node discovery

#### Technology

- **Protocol:** libp2p
- **Target:** Ethereum Consensus Layer (post-merge)

#### Limitations

- Focused specifically on Ethereum CL
- Research tool (not production-grade API)

#### GeoBeat Integration

**Status:** Integrated as git submodule
**Location:** `data-sources/tools/armiarma/`
**Branch:** `ethglobal-ba-2025` (DecentralizedGeo fork)

**Data Flow:**
```
armiarma crawler → PostgreSQL → JSON export → GeoIP (MaxMind GeoLite2) →
src/analysis/data_ingestion.py → GDI metrics calculation → frontend visualization
```

**Setup:**
```bash
# Submodule is initialized during clone
git submodule update --init --recursive

# Update to latest
git supdate

# Run armiarma (via Docker)
cd data-sources/tools/armiarma
docker-compose up --env-file .env
```

**Output Location:** `data/raw/ethereum-cl/`

**Purpose in GeoBeat:** Provides real-time Ethereum Consensus Layer node IP addresses for geographic decentralization analysis.

---

### 3.3 libp2p Framework

**Official Site:** [https://libp2p.io/](https://libp2p.io/)

**Developer Documentation:** [https://docs.source.network/defradb/concepts/libp2p/](https://docs.source.network/defradb/concepts/libp2p/)

#### Overview

- Modular peer-to-peer networking framework
- Used by: Ethereum 2.0, IPFS, Filecoin, Optimism, and other distributed systems
- Capable of peer discovery without centralized registries

#### Discovery Mechanisms

**Ethereum Discovery v5:**
- Based on Kademlia DHT
- Used for Ethereum 2.0 consensus layer

**IPFS Kad-DHT:**
- Kademlia-based distributed hash table
- Default peer discovery for IPFS

**Research on Discovery:** [https://ar5iv.labs.arxiv.org/html/2012.14728](https://ar5iv.labs.arxiv.org/html/2012.14728) - "Discovering the Ethereum2 P2P Network"

**Ethereum Discovery Overview:** [https://github.com/ethereum/devp2p/wiki/Discovery-Overview](https://github.com/ethereum/devp2p/wiki/Discovery-Overview)

#### Typical Outputs

- Peer IDs
- Multi-addresses (network addresses)
- Supported protocols
- Connection latencies

---

### 3.4 Multi-Chain Crawler Research

**Academic Paper:** [https://arxiv.org/html/2511.15388v1](https://arxiv.org/html/2511.15388v1) - "Multiple Sides of 36 Coins: Measuring Peer-to-Peer Infrastructure Across Cryptocurrencies"

**PDF Version:** [https://dspace.networks.imdea.org/bitstream/handle/20.500.12761/1982/_Sigmetrics_25_CAMERA_READY__Multi_network_crawler-_FINALpdf.pdf](https://dspace.networks.imdea.org/bitstream/handle/20.500.12761/1982/_Sigmetrics_25_CAMERA_READY__Multi_network_crawler-_FINALpdf.pdf)

#### Key Findings

- Generic Kademlia-DHT crawler built on Golang implementations
- Supports: discv4, discv5, libp2p
- Measured 36 different cryptocurrency networks
- Provides comparative P2P infrastructure analysis

#### Methodology

- FIND_NODE message crafting
- Peer table extraction
- Multi-network compatibility layer

---

## 4. REST/GraphQL API Patterns

### 4.1 The Graph Protocol

**Official Docs:** [https://thegraph.com/docs/en/querying/graphql-api/](https://thegraph.com/docs/en/querying/graphql-api/)

**Overview Tutorial:** [https://ethereum.org/developers/tutorials/the-graph-fixing-web3-data-querying/](https://ethereum.org/developers/tutorials/the-graph-fixing-web3-data-querying/)

#### Purpose

Decentralized protocol for indexing and querying blockchain data using GraphQL. Provides consumable API endpoints (subgraphs) for blockchain applications.

#### Key Components

**1. Manifest (subgraph.yaml):**
- Entry point defining smart contracts and events to track

**2. Schema (schema.graphql):**
- Defines GraphQL schema for indexed data
- Entity definitions with fields and relationships

**3. Mappings (mapping.ts):**
- Written in AssemblyScript
- Transform event data and save to Graph Node

#### Schema Example

```graphql
type Transfer @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  value: BigInt!
}
```

#### Query Patterns

**Basic Entity Query:**
```graphql
query {
  token(id: "0x123...") {
    id
    name
    symbol
    decimals
  }
}
```

**Pagination:**
- Use `first` parameter: `first: 100` (first 100 entities)
- Use `skip` parameter: `skip: 100` (skip first 100)
- Default sort: ID in ascending alphanumeric order

**Filtering:**
- Entity and entities fields on root Query type
- Filter by entity attributes

#### Supported Blockchains

Ethereum, Polygon, Arbitrum, Optimism, Avalanche, BNB Chain, Celo, and more

#### Resources

- Building GraphQL APIs: [https://dev.to/edge-and-node/building-graphql-apis-on-ethereum-4poa](https://dev.to/edge-and-node/building-graphql-apis-on-ethereum-4poa)
- Creating Graph Node: [https://medium.com/intech-conseil-expertise/create-your-graph-node-to-query-complex-data-from-blockchain-via-graphql-6f08fbd494c5](https://medium.com/intech-conseil-expertise/create-your-graph-node-to-query-complex-data-from-blockchain-via-graphql-6f08fbd494c5)
- Querying Best Practices: [https://codex.thegraph.com/repositories-and-documentation/official-documentation/developer/querying-best-practices](https://codex.thegraph.com/repositories-and-documentation/official-documentation/developer/querying-best-practices)

**Note:** The Graph is primarily for blockchain transaction/event data, not node topology/geography.

---

### 4.2 Bitquery (Blockchain GraphQL APIs)

**Main Site:** [https://bitquery.io/labs/graphql](https://bitquery.io/labs/graphql)

**Purpose:** GraphQL APIs for querying blockchain data across multiple chains

**Use Case:** Transaction data, smart contract events, token transfers (not node geography)

---

### 4.3 REST API Design Patterns for Blockchain Node Data

#### Pagination Strategies

**1. Limit/Offset Pagination**

Standard approach popularized by SQL databases:
```
GET /nodes?limit=20&offset=100
```

**Pros:**
- Simple to implement
- Familiar to developers
- Easy to jump to specific pages

**Cons:**
- Performance degrades with large offsets
- Inconsistent results if data changes between requests

**2. Keyset (Cursor) Pagination**

Uses filter values from last page:
```
GET /nodes?limit=20&after_id=abc123
```

**Pros:**
- Consistent performance
- Works well with time-series data
- No duplicate/missing items during pagination

**Cons:**
- Cannot jump to arbitrary pages
- Requires natural high-cardinality key

**3. Seek Paging**

Extension of keyset with explicit cursor:
```
GET /nodes?limit=20&cursor=xyz789
```

**Pros:**
- Decouples paging from filtering/sorting
- Most flexible for complex queries

**Best Practice for Blockchain Node Data:**
- Use cursor-based pagination for continuous crawl data
- Use limit/offset for small, static datasets
- Always support configurable page sizes

#### Filtering Standards

**RFC-8040 Recommendation:**
- Use `filter` query parameter
- Return only matching subset

**Examples:**
```
GET /nodes?filter=country:US
GET /nodes?filter=client_version:geth&filter=network:mainnet
```

#### Sorting

**Common Patterns:**
```
GET /nodes?sort=timestamp:desc
GET /nodes?sort=country,city
```

#### Response Format Conventions

**Standard Fields:**
```json
{
  "data": [...],
  "pagination": {
    "total": 10000,
    "limit": 100,
    "offset": 0,
    "next_cursor": "xyz789"
  },
  "filters_applied": {
    "country": "US",
    "network": "mainnet"
  }
}
```

#### Resources

- [REST API Design: Filtering, Sorting, and Pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)
- [REST API Response Pagination, Sorting and Filtering](https://restfulapi.net/api-pagination-sorting-filtering/)
- [Node.js API CRUD with Pagination, Filtering, Grouping](https://medium.com/swlh/node-js-api-add-crud-operations-with-pagination-filtering-grouping-and-sorting-capabilities-55375ad0b774)
- [Best practices for REST API design](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)

---

## 5. Data Licensing Considerations

### 5.1 Research Data Licensing Best Practices

**OpenAIRE Guidelines:**
- How to License Research Data: [https://www.openaire.eu/research-data-how-to-license/](https://www.openaire.eu/research-data-how-to-license/)
- Research Data Licensing FAQ: [https://www.openaire.eu/how-do-i-license-my-research-data](https://www.openaire.eu/how-do-i-license-my-research-data)

#### Recommended Licenses

**For Works (Documentation, Code):**
- **CC BY 4.0** (Creative Commons Attribution)
  - Best choice for research data qualifying as a work
  - Allows commercial use with attribution
  - Open Access compliant

- **CC BY-SA 4.0** (Attribution-ShareAlike)
  - Also Open Access compliant
  - Derivative works must use same license

**For Databases/Datasets:**
- **CC0** (Public Domain Dedication)
  - Best option for databases
  - Waives all rights
  - Maximum reusability

#### Non-Commercial Licenses - AVOID

**Problems with NC (Non-Commercial) licenses:**
- May prohibit use in research intended for publication
- Academic journals are commercial businesses
- Creates ambiguity for "commercial use"
- **Not Open Access compliant**

**Quote from OpenAIRE:**
> "Non-commercial licenses can create significant problems for academic research because they may prohibit using datasets in research intended for publication, since most academic journals are commercial businesses."

---

### 5.2 Blockchain Dataset Licensing Considerations

**WEF Blockchain Toolkit:** [https://widgets.weforum.org/blockchain-toolkit/legal-and-regulatory-compliance/](https://widgets.weforum.org/blockchain-toolkit/legal-and-regulatory-compliance/)

#### IP and Usage Rights

**Key Considerations:**
- Vendors may want to capitalize on commercial benefits from blockchain
- Commercialization of underlying datasets through IP licensing
- Usage rights should clearly outline:
  - Internal purposes
  - Commercial applications
  - Research use

**Blockchain Variations:**
- Open source vs proprietary underlying software
- Permissionless vs permissioned networks
- Permission requirements for account creation and transactions

#### Academic Research Implications

**Commercial Use Restrictions:**
- Can block publication in journals (commercial entities)
- Can prevent dataset inclusion in commercial research databases
- Can prohibit use by commercial research institutions

**Best Practice for Geobeat:**
- Prefer CC0 or CC BY for datasets
- Clearly document licensing for all data sources
- Track license compatibility across merged datasets
- Consider dual-licensing for flexibility

---

### 5.3 License Compatibility Matrix

| Source License | Can Mix With CC0 | Can Mix With CC BY | Can Mix With CC BY-SA | Commercial Use OK | Academic Use OK |
|----------------|------------------|--------------------|-----------------------|-------------------|-----------------|
| CC0 | Yes | Yes | Yes | Yes | Yes |
| CC BY | No (prefer) | Yes | Yes | Yes | Yes |
| CC BY-SA | No | Yes | Yes | Yes | Yes |
| CC BY-NC | No | No | No | **NO** | Yes* |
| Proprietary | Depends | Depends | Depends | Depends | Depends |

*May prohibit publication in commercial journals

---

## 6. Common Data Formats

### 6.1 Overview

**Comparison Resource:** [https://gist.github.com/kzzzr/837645284f8dfe879193997fa9632a65](https://gist.github.com/kzzzr/837645284f8dfe879193997fa9632a65) - File formats comparison: CSV, JSON, Parquet, ORC

**Performance Characteristics:**
- **CSV:** Fastest to write, easiest for humans to read
- **JSON:** Easiest for humans to understand, moderate write/read speed
- **Parquet:** Slow to write, fastest to read (especially columnar access)

---

### 6.2 Cryo - Blockchain Data Extraction Tool

**GitHub Repository:** [https://github.com/paradigmxyz/cryo](https://github.com/paradigmxyz/cryo)

**Description:** The easiest way to extract blockchain data to Parquet, CSV, JSON, or Python DataFrames

#### Features

- Extract blockchain data in multiple formats
- Always prints schemas before collecting data
- Optimized for analytical workflows
- Paradigm-backed tool

#### Typical Use Cases

- Historical blockchain data analysis
- Time-series extraction
- Block/transaction/event data dumps

**Note:** Designed for transaction/block data, not node topology.

---

### 6.3 Bitcoin Blockchain Dataset Builder

**GitHub Repository:** [https://github.com/jesusgraterol/bitcoin-blockchain-dataset-builder](https://github.com/jesusgraterol/bitcoin-blockchain-dataset-builder)

#### Description

Extracts Bitcoin block information through Mempool.space's public API and stores in CSV format for data science and machine learning projects.

#### Output Format

- **Format:** CSV
- **Fields:** Block information (height, timestamp, hash, etc.)
- **Source:** Mempool.space API

---

### 6.4 ORBITAAL - Bitcoin Entity Transaction Dataset

**Academic Paper:** [https://www.nature.com/articles/s41597-025-04595-8](https://www.nature.com/articles/s41597-025-04595-8) - "A Temporal Graph Dataset of Bitcoin Entity-Entity Transactions"

#### Dataset Formats

- **Primary Format:** Parquet
- **Secondary Format:** CSV
- **Loading:** Compatible with Pandas, PySpark

#### Why Parquet?

- Efficient tabular data storage
- Similar to CSV but better performance
- Optimized for WORM (Write Once Read Many) paradigm
- Fast column-wise access
- Excellent for time-series analytics

**Performance Note:**
> "Parquet should generally be the fastest to read, especially when you're only accessing a subset of the total columns."

---

### 6.5 Format Recommendations for Node Data

#### CSV Format

**When to Use:**
- Small datasets (<100MB)
- Human inspection required
- Simple key-value data
- Compatibility with spreadsheet tools

**Schema Example for Node Data:**
```csv
ip_address,port,country,city,lat,lon,asn,isp,timestamp,client_version
192.0.2.1,30303,US,New York,40.7128,-74.0060,AS15169,Google LLC,2025-01-15T10:30:00Z,geth-1.10.0
```

#### JSON Format

**When to Use:**
- Nested/hierarchical data
- API responses
- Complex object structures
- Human readability important

**Schema Example for Node Data:**
```json
{
  "node_id": "abc123",
  "network": "ethereum",
  "endpoint": {
    "ip": "192.0.2.1",
    "port": 30303
  },
  "location": {
    "country": "US",
    "city": "New York",
    "coordinates": {
      "lat": 40.7128,
      "lon": -74.0060
    }
  },
  "infrastructure": {
    "asn": "AS15169",
    "isp": "Google LLC",
    "datacenter": true
  },
  "metadata": {
    "client_version": "geth-1.10.0",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### Parquet Format

**When to Use:**
- Large datasets (>100MB)
- Analytical queries
- Column-wise access patterns
- Long-term archival
- Integration with Spark/Pandas

**Best Practices:**
- Partition by date or network
- Use appropriate compression (snappy, gzip)
- Include metadata in schema

**Loading Examples:**
```python
# Pandas
import pandas as pd
df = pd.read_parquet('nodes.parquet')

# PySpark
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()
df = spark.read.parquet('nodes.parquet')
```

---

## 7. Detection Capabilities & Biases

### 7.1 Anonymous IP Detection (VPN/Proxy/Datacenter)

**MaxMind Anonymous IP Database:** [https://www.maxmind.com/en/geoip-anonymous-ip-database](https://www.maxmind.com/en/geoip-anonymous-ip-database)

**Developer Docs:** [https://dev.maxmind.com/geoip/docs/databases/anonymous-ip/](https://dev.maxmind.com/geoip/docs/databases/anonymous-ip/)

#### Detection Types

**MaxMind GeoIP2 Anonymous IP:**
- Anonymous proxy servers
- VPN providers
- Datacenter proxies
- Residential proxies
- Tor exit nodes
- Other web proxies

**IP2Location Proxy Detection:**
- Anonymous proxy
- VPN
- TOR
- Search engine bots
- Residential proxies
- Datacenter IPs

#### Detection Methods

**Data Sources:**
- Open-source IP block lists
- Custom VPN exit node enumeration
- WHOIS records from 5 Regional Internet Registries (RIRs)
- Traffic pattern analysis

**IP Quality Score:** [https://www.ipqualityscore.com/proxy-detection-database](https://www.ipqualityscore.com/proxy-detection-database)

**GetIPIntel:** [https://getipintel.net/](https://getipintel.net/)

#### Accuracy by Type

**Very Accurate:**
- Hosting/datacenter detection
- Tor exit node detection

**Moderately Accurate:**
- Proxy detection (known proxies only)
- VPN detection (registered providers only)

**Limited Accuracy:**
- Residential proxies
- Unknown/new VPN providers
- Custom/private proxies

---

### 7.2 Bias Against Blockchain Nodes

#### Datacenter Infrastructure Flagging

**Problem:**
- Web hosting services used for private proxies
- VPN services use hosting providers
- Legitimate blockchain nodes on datacenter infrastructure flagged as "anonymous"

**Quote from Research:**
> "Many VPN services use hosting providers instead of registering their own IP ranges, meaning traffic from hosting providers likely indicates VPN use even if not explicitly identified."

#### Implications for Node Geolocation

**False Positives:**
- Professional node operators using cloud infrastructure
- Exchange-operated nodes
- Institutional validators
- Development/test nodes

**Geographic Bias:**
- Datacenter concentration in specific regions
- Cloud provider distribution patterns
- May overrepresent certain countries with major cloud regions

**Routing vs Physical Location:**
- IP geolocation shows routing location, not physical hardware
- Anycast addresses complicate geolocation
- CDN/edge networks create distributed appearances

---

### 7.3 GeoIP Database Limitations for Blockchain Research

#### General Accuracy Issues

**Router Geolocation Study:** [https://blog.apnic.net/2017/11/03/trust-geolocation-databases-geolocate-routers/](https://blog.apnic.net/2017/11/03/trust-geolocation-databases-geolocate-routers/)

**Key Findings:**
- Country-level: Generally reliable (>90% for major databases)
- City-level: 77-89% accuracy depending on database
- Pairwise inconsistencies common
- Distance discrepancies average 296km

#### Specific Challenges for Blockchain Nodes

**1. Datacenter Concentration**
- IPs geolocated to datacenter city, not operator location
- AWS us-east-1 shows as Virginia, regardless of operator country

**2. VPN/Proxy Use**
- Node operators using VPNs for privacy
- Detected location is VPN exit, not actual location

**3. Mobile/Dynamic IPs**
- Residential node operators with dynamic IPs
- Location accuracy depends on IP allocation patterns

**4. Geographic Spoofing**
- Intentional location obfuscation
- Tor nodes
- Privacy-focused operators

**5. Update Lag**
- IP allocations change
- Database accuracy degrades 1-5% per month
- Critical to use recent databases

---

### 7.4 Best Practices for Mitigating Biases

#### Multi-Source Validation

- Cross-reference multiple GeoIP databases
- Flag discrepancies for manual review
- Use consensus when databases agree

#### Datacenter Detection

- Use Anonymous IP databases to flag datacenter IPs
- Separate analysis for datacenter vs residential nodes
- ASN-based cloud provider detection

#### Confidence Scoring

- Assign confidence levels based on:
  - Database agreement
  - IP type (datacenter/residential)
  - Historical stability
  - ASN reputation

#### Temporal Validation

- Track location changes over time
- Flag suspicious rapid relocations
- Use historical data for validation

#### Complementary Signals

- Network latency measurements
- BGP routing paths
- AS-level topology
- Timezone consistency checks

---

## Summary & Recommendations

### For Geobeat v0 Development

**Primary GeoIP Database:**
- **MaxMind GeoLite2** (free, CC BY-SA 4.0, widely used in research)
- Supplement with **IP2Location LITE** for cross-validation

**Node Data Sources:**
- **Bitnodes.io API** for Bitcoin (free with rate limits)
- **Ethernodes.org** for Ethereum (investigate API access)
- Explore per-network sources from sponsor list

**Crawling Tools:**
- **Nebula** for generic DHT crawling (IPFS, Ethereum, etc.)
- **Armiarma** for Ethereum CL specific analysis

**Data Formats:**
- Use **JSON** for API responses and small datasets
- Use **Parquet** for large analytical datasets and archival
- Provide **CSV** exports for accessibility

**Licensing Strategy:**
- Release datasets as **CC0** (public domain) or **CC BY 4.0**
- Document all upstream licenses clearly
- Ensure commercial use compatibility

**Bias Mitigation:**
- Flag datacenter IPs using Anonymous IP databases
- Cross-validate with multiple GeoIP sources
- Implement confidence scoring
- Document limitations transparently

---

## Sources

- [MaxMind GeoLite2 Documentation](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/)
- [MaxMind Database Documentation](https://dev.maxmind.com/geoip/docs/databases/)
- [GeoLite2 EULA](https://www.maxmind.com/en/geolite2/eula)
- [IP Geolocation Data Accuracy - IP2Location](https://www.ip2location.com/data-accuracy)
- [5 Geolocation Database Providers Comparison](https://ipinfo.io/blog/ip-geolocation-providers)
- [Accuracy and Coverage Analysis of IP Geolocation Databases](https://www.researchgate.net/publication/372091523_Accuracy_and_Coverage_Analysis_of_IP_Geolocation_Databases)
- [Trust Geolocation Databases? - APNIC Blog](https://blog.apnic.net/2017/11/03/trust-geolocation-databases-geolocate-routers/)
- [IP2Location Licensing](https://www.ip2location.com/licensing)
- [IP2Location LITE Database](https://lite.ip2location.com/ip2location-lite)
- [Bitnodes API Documentation](https://bitnodes.io/api/)
- [Ethernodes.org](https://ethernodes.org/)
- [Ethereum Nodes Documentation](https://ethereum.org/developers/docs/nodes-and-clients/)
- [Nebula DHT Crawler - GitHub](https://github.com/dennis-tra/nebula)
- [Armiarma Ethereum CL Crawler - GitHub](https://github.com/migalabs/armiarma)
- [libp2p Official Site](https://libp2p.io/)
- [Multiple Sides of 36 Coins Paper](https://arxiv.org/html/2511.15388v1)
- [Discovering the Ethereum2 P2P Network](https://ar5iv.labs.arxiv.org/html/2012.14728)
- [Ethereum Discovery Overview](https://github.com/ethereum/devp2p/wiki/Discovery-Overview)
- [The Graph Protocol Documentation](https://thegraph.com/docs/en/querying/graphql-api/)
- [Building GraphQL APIs on Ethereum](https://dev.to/edge-and-node/building-graphql-apis-on-ethereum-4poa)
- [REST API Design: Filtering, Sorting, and Pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)
- [REST API Response Pagination](https://restfulapi.net/api-pagination-sorting-filtering/)
- [Best practices for REST API design](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [OpenAIRE: How to License Research Data](https://www.openaire.eu/research-data-how-to-license/)
- [Cryo Blockchain Data Tool - GitHub](https://github.com/paradigmxyz/cryo)
- [Bitcoin Blockchain Dataset Builder - GitHub](https://github.com/jesusgraterol/bitcoin-blockchain-dataset-builder)
- [ORBITAAL Bitcoin Dataset](https://www.nature.com/articles/s41597-025-04595-8)
- [File Formats Comparison](https://gist.github.com/kzzzr/837645284f8dfe879193997fa9632a65)
- [MaxMind Anonymous IP Database](https://www.maxmind.com/en/geoip-anonymous-ip-database)
- [IP Quality Score Proxy Detection](https://www.ipqualityscore.com/proxy-detection-database)
- [Etherscan Node Tracker](https://etherscan.io/nodetracker)
- [Cambridge Blockchain Network Sustainability Index](https://ccaf.io/cbnsi/ethereum/network_analytics)
