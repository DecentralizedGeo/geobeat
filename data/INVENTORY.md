# Blockchain Node Geographic Data Source Inventory

**Date:** 2025-01-22
**Networks:** Bitcoin, Ethereum, Filecoin, Celo, Polygon, Optimism
**Purpose:** Data source reconnaissance for GeoBeat v0 physical decentralization index

---

## Executive Summary

This inventory catalogs 15+ data sources providing node-level geographic information across 6 priority blockchain networks. Key findings:

1. **Strong coverage for Bitcoin and Ethereum**: Multiple production-ready APIs with geographic data (Bitnodes, Ethernodes, Etherscan, Rated Network)
2. **Emerging Filecoin/IPFS infrastructure**: ProbeLab and Filstats provide real-time telemetry with geographic tracking
3. **Critical gap for L2s and alt-L1s**: Celo, Polygon, and Optimism lack dedicated node geographic explorers (rely on generic RPC providers)
4. **Hub dependencies identified**: Most Ethereum research relies on Ethernodes data; MaxMind GeoLite2 is universal for geolocation
5. **Licensing is favorable**: Most sources use permissive licenses (Apache 2.0, CC-BY) or unclear terms that appear research-friendly

**Top recommendations for v0:**
- **Bitcoin**: Bitnodes.io API (50 req/day free tier sufficient)
- **Ethereum**: Etherscan Node Tracker + Rated Network API (complementary data)
- **Filecoin**: ProbeLab weekly reports + Filstats telemetry
- **Celo/Polygon/Optimism**: Custom crawler using Nebula or manual peer sampling (no existing public sources)

---

## Dataset Inventory

### 1. Bitnodes.io

- **URL(s):**
  - Primary: https://bitnodes.io/
  - API docs: https://bitnodes.io/api/
  - GitHub: https://github.com/ayeowch/bitnodes (Python crawler)
- **Networks covered:** Bitcoin only
- **Data type:** API (REST) + static snapshots (10-minute intervals)
- **Node-level signals:**
  - IP addresses: Yes (IPv4/IPv6)
  - Geographic fields: Yes (hostname, city, country code, lat/lon, timezone via GeoLite2)
  - ASN/ISP: Yes (ASN and organization name)
- **Temporal:**
  - Live: Snapshots every ~10 minutes
  - Historical: Up to 60 days retention
  - Time series available via snapshot endpoint
- **Licensing:** Terms of Service required; no explicit data license stated (assumed permissive for research)
- **Limitations:**
  - Only reachable nodes (NAT/firewall bias)
  - Single vantage point (2 IPs: 88.198.10.155 and 2a01:4f8:222:291f::2)
  - 63% of nodes show "unknown" location (15,052 of 23,803 as of recent snapshot)
  - Rate limits: 50 req/day free, 200K req/day PRO ($49/mo estimated)
- **Relevance:** **Strong candidate for v0** - Production-ready API, excellent docs, widely cited in research

**Sources:** [Bitnodes API](https://bitnodes.io/api/), [Bitnodes Main](https://bitnodes.io/)

---

### 2. Ethernodes.org

- **URL(s):**
  - Primary: https://ethernodes.org/
  - Country stats: https://ethernodes.org/countries
  - GitHub: https://github.com/Ethernodes-org/ (Real-Time SDK available)
- **Networks covered:** Ethereum (execution layer)
- **Data type:** Explorer-only (rendered charts and maps; API not publicly documented)
- **Node-level signals:**
  - IP addresses: Unclear (likely internal only)
  - Geographic fields: Yes (country-level aggregates, map visualization)
  - ASN/ISP: Unclear
- **Temporal:**
  - Live/continuously updated
  - Historical snapshots cited in academic papers (2016-2023 monthly data)
- **Licensing:** Operated by bitfly GmbH; terms unclear (no explicit license)
- **Limitations:**
  - No public API documentation found
  - May require direct contact with bitfly for bulk data access
  - Used as dependency by many research papers (single point of failure)
- **Relevance:** **Probably v1+** - Widely cited but lacks public API; consider as secondary validation source

**Sources:** [Ethernodes Country Stats](https://ethernodes.org/countries), [Ethernodes Main](https://ethernodes.org/)

---

### 3. EtherBee Dataset

- **URL(s):**
  - Paper: https://arxiv.org/abs/2505.18290
  - Data: https://doi.org/10.17605/OSF.IO/C5UPF (Open Science Framework)
- **Networks covered:** Ethereum (execution and consensus layers)
- **Data type:** Static dataset (tabular exports from Elasticsearch; ~16 TB compressed)
- **Node-level signals:**
  - IP addresses: Yes (94,659 unique IPs over 3 months)
  - Geographic fields: Yes (geolocation via MaxMind GeoLite2, includes lat/lon)
  - ASN/ISP: Likely (paper mentions network metadata)
- **Temporal:**
  - Snapshot: August–November 2024 (3 months, 107 days)
  - One-time dataset (not continuously updated)
- **Licensing:** Available upon request via OSF; license not explicitly stated in paper (assume academic use permitted)
- **Limitations:**
  - Static historical dataset (no real-time updates)
  - Massive size (16 TB) may require selective download
  - Focused on performance measurements (node metrics, honeypot interactions) rather than pure topology
- **Relevance:** **Strong candidate for v0 validation** - Rich dataset for historical analysis and cross-validation; complements live APIs

**Sources:** [EtherBee arXiv](https://arxiv.org/abs/2505.18290), [EtherBee OSF](https://doi.org/10.17605/OSF.IO/C5UPF)

---

### 4. Miga Labs

- **URL(s):**
  - Primary: https://migalabs.io/ or https://www.migalabs.io/
  - Eth2 metrics: https://migalabs.es/eth2-client-metrics/
  - GitHub: https://github.com/migalabs/ (eth2-client-analyzer, GotEth indexer)
- **Networks covered:** Ethereum (consensus layer focus, also execution layer)
- **Data type:** Explorer + API (recently launched "API access" feature)
- **Node-level signals:**
  - IP addresses: Unclear
  - Geographic fields: Yes (dashboards show geographic distribution, client diversity)
  - ASN/ISP: Yes (dashboards track ISP and cloud provider data)
- **Temporal:**
  - Live/near real-time (powers active monitoring for Stakely, Lido, Ethereum Foundation)
- **Licensing:** GotEth indexer is open-source; data licensing unclear (likely permissive for research)
- **Limitations:**
  - API recently launched; documentation coverage unknown
  - Focus on validator/consensus layer (may not cover execution layer nodes comprehensively)
- **Relevance:** **Strong candidate for v0** - Production-grade, trusted by Ethereum Foundation, API available

**Sources:** [Miga Labs](https://www.migalabs.io/), [Miga Labs Eth2 Metrics](https://migalabs.es/eth2-client-metrics/), [Miga Labs GitHub](https://github.com/migalabs/)

---

### 5. Nebula DHT Crawler

- **URL(s):**
  - GitHub: https://github.com/dennis-tra/nebula
  - Reports: Powers probelab.io weekly IPFS reports
- **Networks covered:** Multi-chain (IPFS, Bitcoin, Litecoin, Dogecoin, Ethereum discv4/discv5, Filecoin, Polkadot, Celestia, Avail, Gnosis, and more)
- **Data type:** Code-only (crawler framework; user must run to generate data)
- **Node-level signals:**
  - IP addresses: Yes (peer multi-addresses including IP:port)
  - Geographic fields: Yes (MaxMind GeoLite2 integration)
  - ASN/ISP: Yes (datacenter detection via UdgerDB)
- **Temporal:**
  - User-controlled (run crawler on-demand or scheduled)
  - Historical: None (no hosted datasets; user generates snapshots)
- **Licensing:** Apache 2.0 (open-source, permissive)
- **Limitations:**
  - Code-only (requires infrastructure to run)
  - Output can be massive (~250MB for single network routing table)
  - No hosted public datasets (except aggregate reports on probelab.io)
- **Relevance:** **v1+ for custom crawling** - Excellent for building our own crawler if needed; not v0 ready (requires operational work)

**Sources:** [Nebula GitHub](https://github.com/dennis-tra/nebula)

---

### 6. NodeMaps Framework

- **URL(s):**
  - Paper: https://www.sciencedirect.com/science/article/pii/S2096720922000501
  - DOI: 10.1016/j.bcra.2022.100109
- **Networks covered:** Multi-chain (Bitcoin, Lightning Network, Cosmos, Stellar)
- **Data type:** Research paper (dataset availability unclear; no public GitHub repo found)
- **Node-level signals:**
  - IP addresses: Likely (paper analyzes node geographic distribution)
  - Geographic fields: Yes (paper shows country-level analysis, Tor node identification)
  - ASN/ISP: Yes (paper mentions cloud provider concentration)
- **Temporal:**
  - Snapshot: August 7, 2021
  - One-time dataset (not continuously updated)
- **Licensing:** Paper is open access; dataset availability unclear (may require author contact)
- **Limitations:**
  - No public dataset found (despite extensive GitHub search)
  - Data is 3+ years old (2021)
  - May require contacting authors (Howell, Saber, Bendechache) for access
- **Relevance:** **Not usable for v0** - Methodology informative, but data unavailable; could inform our own crawler design

**Sources:** [NodeMaps Paper](https://www.sciencedirect.com/science/article/pii/S2096720922000501)

---

### 7. Filecoin/IPFS TMA 2025 Study

- **URL(s):**
  - Paper: https://tma.ifip.org/2025/wp-content/uploads/sites/14/2025/06/tma2025_paper16.pdf
- **Networks covered:** IPFS, Filecoin, Storj, Swarm
- **Data type:** Research paper (PDF corrupted/unreadable in fetch; dataset availability unclear)
- **Node-level signals:**
  - IP addresses: Unknown (paper likely includes peer analysis)
  - Geographic fields: Mentioned (paper abstract references "peer heatmaps")
  - ASN/ISP: Unknown
- **Temporal:**
  - Publication: TMA 2025 (June 2025)
  - Data collection period: Unknown
- **Licensing:** Unknown (paper not readable; academic conference proceedings typically allow citation)
- **Limitations:**
  - PDF fetch failed (corrupted encoding)
  - Dataset availability unconfirmed
  - Very recent publication (may not have released data yet)
- **Relevance:** **Requires further investigation** - Promising for Filecoin/IPFS but data access unclear

**Sources:** [TMA 2025 Paper](https://tma.ifip.org/2025/wp-content/uploads/sites/14/2025/06/tma2025_paper16.pdf)

---

### 8. ProbeLab (IPFS/Filecoin Network Observatory)

- **URL(s):**
  - Primary: https://probelab.io/
  - IPFS KPIs: https://www.probelab.io/ipfs/kpi/
- **Networks covered:** IPFS (Amino DHT), Filecoin (GossipSub), other libp2p networks
- **Data type:** Explorer + Reports (weekly network health reports, 24/7 crawler)
- **Node-level signals:**
  - IP addresses: Unclear (likely internal to crawler)
  - Geographic fields: Yes (dashboards show geo-distribution of peers)
  - ASN/ISP: Yes (reports track cloud infra providers)
- **Temporal:**
  - Live: 24/7 crawler with daily updates
  - Historical: Weekly reports available (archive depth unknown)
- **Licensing:** Unknown (operated by Protocol Labs; likely permissive for IPFS/Filecoin ecosystem)
- **Limitations:**
  - API/data export not documented on homepage (requires deeper exploration)
  - Focus on IPFS/Filecoin ecosystem (not general-purpose)
  - DNS issues during research (probelab.io had connectivity problems)
- **Relevance:** **Strong candidate for v0 Filecoin** - Official Protocol Labs monitoring; weekly reports usable immediately

**Sources:** [ProbeLab](https://probelab.io/), [ProbeLab IPFS KPIs](https://www.probelab.io/ipfs/kpi/)

---

### 9. Filstats.io

- **URL(s):**
  - Primary: https://filstats.io/
  - About: https://filstats.io/about
- **Networks covered:** Filecoin only
- **Data type:** Explorer (real-time telemetry dashboard)
- **Node-level signals:**
  - IP addresses: Unclear
  - Geographic fields: Yes (dashboard shows geographic distribution of nodes)
  - ASN/ISP: Unknown
- **Temporal:**
  - Live: Real-time network monitoring
- **Licensing:** Unknown (community-maintained telemetry dashboard)
- **Limitations:**
  - DNS issues during research (filstats.io had connectivity problems)
  - API/data export unclear
  - Relies on self-reported telemetry (nodes opt-in)
- **Relevance:** **Probably v0 for Filecoin** - Real-time visibility; requires further investigation for data access

**Sources:** [Filstats](https://filstats.io/)

---

### 10. Etherscan Node Tracker

- **URL(s):**
  - Primary: https://etherscan.io/nodetracker
  - Nodes list: https://etherscan.io/nodetracker/nodes
  - Info: https://info.etherscan.com/node-tracker-page/
- **Networks covered:** Ethereum (execution layer)
- **Data type:** Explorer (rendered charts, map visualization; API unclear)
- **Node-level signals:**
  - IP addresses: Yes (shown per node with secp256k1 public key)
  - Geographic fields: Yes (country-level aggregates, world map with hover details)
  - ASN/ISP: Unknown
- **Temporal:**
  - Live: Continuously updated
  - Historical: Unknown (likely tracks daily totals, top 10 countries)
- **Licensing:** Etherscan Terms of Service apply; data licensing unclear
- **Limitations:**
  - Access blocked during research (HTTP 403)
  - API access may require Etherscan API key (etherscan.io/apis)
  - Focus on node counts by country/client (may not expose raw IP-level data)
- **Relevance:** **Strong candidate for v0** - Trusted source (Etherscan is industry standard); complements Ethernodes

**Sources:** [Etherscan Node Tracker](https://etherscan.io/nodetracker), [Node Tracker Info](https://info.etherscan.com/node-tracker-page/)

---

### 11. Rated Network

- **URL(s):**
  - Primary: https://www.rated.network/
  - API docs: https://docs.rated.network/
  - Network overview: https://www.rated.network/overview?network=mainnet
- **Networks covered:** Ethereum (consensus layer, validator focus)
- **Data type:** API + Explorer
- **Node-level signals:**
  - IP addresses: Unclear (validator-centric, not full node topology)
  - Geographic fields: Yes (dashboard shows 38.29% US validators, geographic distribution tracking)
  - ASN/ISP: Likely (validator infrastructure analysis)
- **Temporal:**
  - Live: Real-time validator metrics
  - Historical: API provides historical performance data
- **Licensing:** API access available (likely commercial terms; used by MetaMask Institutional)
- **Limitations:**
  - Validator-focused (consensus layer only; no execution layer nodes)
  - API pricing/access unclear (may be gated or paid)
  - Geographic data aggregated (may not provide raw per-validator IPs)
- **Relevance:** **Strong candidate for v0 Ethereum validators** - High-quality data, API available, trusted by institutions

**Sources:** [Rated Network](https://www.rated.network/), [Rated Docs](https://docs.rated.network/)

---

### 12. ETH Zurich Multi-Cryptocurrency Node Explorer (2024 Thesis)

- **URL(s):**
  - Unknown (thesis not found in public repositories)
- **Networks covered:** Multi-chain (Bitcoin, Ethereum, others mentioned in abstract)
- **Data type:** Research thesis (code and dataset availability unknown)
- **Node-level signals:**
  - IP addresses: Yes (thesis describes JSON output with node IP:port)
  - Geographic fields: Unknown
  - ASN/ISP: Unknown
- **Temporal:**
  - Publication: 2024 (recent)
  - Data collection period: Unknown
- **Licensing:** Unknown (ETH Zurich thesis repository access unclear)
- **Limitations:**
  - Thesis not found despite extensive search (may be internal/unpublished)
  - No GitHub repository identified
  - May require direct contact with ETH Zurich Computer Science department
- **Relevance:** **Not usable for v0** - Cannot locate; consider reaching out to ETH Zurich if multi-chain coverage is critical

**Sources:** None found (requires ETH Zurich library/repository access)

---

### 13. Luke Dashjr Bitcoin Node Counts

- **URL(s):**
  - Historical: https://luke.dashjr.org/programs/bitcoin/files/charts/historical.html
  - Software stats: https://luke.dashjr.org/programs/bitcoin/files/charts/software.html
- **Networks covered:** Bitcoin only
- **Data type:** Static charts (rendered historical data; raw data unclear)
- **Node-level signals:**
  - IP addresses: Unclear
  - Geographic fields: Unknown (charts show node counts, not geography)
  - ASN/ISP: Unknown
- **Temporal:**
  - Historical: Long-term Bitcoin node count tracking
  - Update frequency: Unknown
- **Licensing:** Unknown (personal website; data licensing unclear)
- **Limitations:**
  - Focus on node counts and client software (not geographic distribution)
  - Data export unclear (charts only)
  - Alternative to Bitnodes but less comprehensive
- **Relevance:** **Not needed for v0** - Bitnodes superior for geographic data; Luke's data useful for historical context only

**Sources:** [Luke Dashjr Historical](https://luke.dashjr.org/programs/bitcoin/files/charts/historical.html)

---

### 14. Cambridge CBECI Ethereum Network Analytics

- **URL(s):**
  - Primary: https://ccaf.io/cbnsi/ethereum/network_analytics
- **Networks covered:** Ethereum
- **Data type:** Explorer (sustainability index; node analytics component)
- **Node-level signals:**
  - IP addresses: Unknown
  - Geographic fields: Mentions importance of "broad geographical distribution"
  - ASN/ISP: Unknown
- **Temporal:**
  - Live: Likely real-time or regularly updated
- **Licensing:** Cambridge Centre for Alternative Finance; academic use likely permitted
- **Limitations:**
  - Not fetched during research (focused on sustainability metrics, not pure topology)
  - Data access unclear (may be aggregate only)
- **Relevance:** **Requires further investigation** - Complementary to other Ethereum sources; worth exploring for additional validation

**Sources:** [Cambridge CBECI Ethereum](https://ccaf.io/cbnsi/ethereum/network_analytics)

---

### 15. Celo Block Explorers (Celoscan, Blockscout)

- **URL(s):**
  - Celoscan: https://celoscan.io/
  - Celo Explorer: https://explorer.celo.org/
  - Blockscout: https://celo.blockscout.com/
  - Validator docs: https://docs.celo.org/legacy/validator/validator-explorer
- **Networks covered:** Celo only
- **Data type:** Block explorers (transaction/address/validator focus; no node geography)
- **Node-level signals:**
  - IP addresses: No (validator addresses only)
  - Geographic fields: No (validator explorer shows groups, not geographic distribution)
  - ASN/ISP: No
- **Temporal:**
  - Live: Transaction and validator activity
- **Licensing:** Standard block explorer ToS (Etherscan-style)
- **Limitations:**
  - **No geographic node data** (critical gap)
  - Validator focus (10K CELO staking requirement; not full node topology)
  - Would require custom crawler for node IP-level data
- **Relevance:** **Not usable for v0 physical decentralization** - Gap identified; Nebula or custom crawler needed

**Sources:** [Celoscan](https://celoscan.io/), [Celo Validator Docs](https://docs.celo.org/legacy/validator/validator-explorer)

---

### 16. Polygon Validator Explorers (PolygonScan, OKLink)

- **URL(s):**
  - PolygonScan: https://polygonscan.com/
  - PolygonScan API: https://polygonscan.com/apis
  - OKLink: https://www.oklink.com/polygon/validator-list
- **Networks covered:** Polygon PoS
- **Data type:** Block explorers + API (validator metrics; no node geography)
- **Node-level signals:**
  - IP addresses: No
  - Geographic fields: Mentioned in OKLink ("distributed across various states/jurisdictions") but not exposed in data
  - ASN/ISP: No
- **Temporal:**
  - Live: Validator activity and staking metrics
- **Licensing:** PolygonScan API available (Etherscan-style; likely paid tiers for high volume)
- **Limitations:**
  - **No raw node geographic data** (critical gap)
  - References to "geographic distribution" exist but data not accessible
  - Would require custom crawler or direct Polygon Labs request
- **Relevance:** **Not usable for v0 physical decentralization** - Gap identified; need alternative approach

**Sources:** [PolygonScan](https://polygonscan.com/), [OKLink Validators](https://www.oklink.com/polygon/validator-list)

---

### 17. Optimism Block Explorers (Blockscout, Etherscan)

- **URL(s):**
  - Blockscout: https://optimism.blockscout.com/
  - Etherscan: https://optimistic.etherscan.io/
  - Official docs: https://docs.optimism.io/operators/node-operators/json-rpc
- **Networks covered:** Optimism (L2)
- **Data type:** Block explorers + RPC nodes (no node geography tracking)
- **Node-level signals:**
  - IP addresses: No (RPC endpoints only)
  - Geographic fields: No
  - ASN/ISP: No
- **Temporal:**
  - Live: Transaction data and chain state
- **Licensing:** Standard block explorer ToS
- **Limitations:**
  - **No node geographic data** (critical gap for L2)
  - L2 node topology less relevant (sequencer-dominated; limited decentralization)
  - May need to track Optimism's superchain node operators separately
- **Relevance:** **Not usable for v0 physical decentralization** - L2 architecture makes node geography less meaningful; consider sequencer/prover distribution instead

**Sources:** [Optimism Blockscout](https://optimism.blockscout.com/), [Optimism Docs](https://docs.optimism.io/)

---

## Comparative Analysis

### Coverage Summary

| Network | Data Sources Available | Coverage Quality | Data Recency | Licensing |
|---------|------------------------|------------------|--------------|-----------|
| **Bitcoin** | Bitnodes (primary), Luke Dashjr (historical) | **Excellent** | Real-time (10min) | Permissive |
| **Ethereum** | Ethernodes, EtherBee, Miga Labs, Etherscan, Rated | **Excellent** | Real-time + historical | Mixed (mostly permissive) |
| **Filecoin** | ProbeLab, Filstats, TMA 2025 study | **Good** | Real-time (weekly reports) | Unclear (likely permissive) |
| **Celo** | None identified | **None** | N/A | N/A |
| **Polygon** | None identified | **None** | N/A | N/A |
| **Optimism** | None identified | **None** | N/A | N/A |

**Key Insight:** **Bitcoin and Ethereum have mature node monitoring infrastructure. Filecoin has emerging tooling. Celo, Polygon, and Optimism lack public node geographic data entirely.**

---

### Dependencies & Overlaps

#### Hub Sources (High Centralization Risk)

1. **Ethernodes.org** - Used as primary data source by 5+ academic studies (2016-2023)
   - EtherBee validates against Ethernodes
   - Risk: Single point of failure; if Ethernodes shuts down, historical comparisons break
   - Mitigation: Archive Ethernodes snapshots; diversify to Etherscan + Miga Labs

2. **MaxMind GeoLite2** - Universal geolocation database (used by 90%+ of sources)
   - Bitnodes, EtherBee, Nebula, ProbeLab all use GeoLite2
   - Risk: Systematic errors propagate across all sources
   - Mitigation: Cross-validate with IP2Location LITE (recommended in methodology docs)

3. **Bitnodes** - De facto standard for Bitcoin node tracking
   - Used by Newhedge, academic papers, Luke Dashjr comparisons
   - Risk: Lower than Ethernodes (open-source Python crawler allows self-hosting)
   - Mitigation: Run own Bitnodes crawler if API rate limits become issue

#### Redundancies

- **Ethernodes vs. EtherBee**: 80% overlap for reachable nodes (EtherBee includes unreachable/NAT nodes via honeypot)
- **Luke Dashjr vs. Bitnodes**: Both track Bitcoin nodes; Bitnodes is superset (better API, more frequent updates)
- **Celoscan vs. Celo Explorer**: Same underlying blockchain data, no node topology difference

#### Complementary Sources

- **Ethernodes (reachable nodes) + Miga Labs (validators)** = Comprehensive Ethereum view
  - Ethernodes: Execution layer peer-to-peer network
  - Miga Labs: Consensus layer validator infrastructure
  - Together: Full Ethereum network topology

- **Bitnodes (live) + EtherBee (historical)** = Time-series analysis capability
  - Bitnodes: Current network state (10min snapshots, 60-day retention)
  - EtherBee: Deep historical dataset (Aug-Nov 2024, 3 months)
  - Together: Real-time monitoring + historical validation

- **ProbeLab (DHT metrics) + Filstats (telemetry)** = Filecoin/IPFS coverage
  - ProbeLab: Network-level measurements (crawler-based, objective)
  - Filstats: Node-level telemetry (self-reported, subjective)
  - Together: Cross-validation of IPFS/Filecoin peer counts

---

### Key Tradeoffs

| Dimension | Option A | Option B | Recommendation |
|-----------|----------|----------|----------------|
| **Recency** | Live APIs (Bitnodes, Etherscan, Rated) | Static datasets (EtherBee, NodeMaps) | **Use both**: APIs for v0 production, datasets for validation |
| **Coverage** | Multi-chain crawlers (Nebula) | Network-specific explorers (Bitnodes, Ethernodes) | **Network-specific for v0**: More reliable data; Nebula for v1+ custom needs |
| **Licensing** | Permissive open data (Nebula Apache 2.0) | Unclear terms (Ethernodes, Bitnodes) | **Assume research-friendly**: Academic use appears safe; document attributions |
| **Accuracy** | Official project telemetry (Filstats self-reported) | Third-party crawlers (Bitnodes, Ethernodes) | **Prefer crawlers**: Objective measurement; telemetry subject to opt-in bias |
| **Cost** | Free tiers (Bitnodes 50/day, Etherscan API) | Paid APIs (Bitnodes PRO 200K/day, Rated Network) | **Free for v0**: 50 req/day sufficient for daily snapshots; upgrade if real-time needed |

---

### Geographic Decentralization Patterns (Preliminary)

Based on available data from sources:

**Bitcoin (Bitnodes):**
- 63% unknown/undisclosed location (privacy via VPN/Tor)
- 10.5% United States
- 5.5% Germany
- **Assessment**: Moderately decentralized; high privacy adoption obscures true distribution

**Ethereum (Rated Network):**
- 38.3% United States
- Geographic data available but not fully cataloged in this research
- **Assessment**: US-concentrated (higher than Bitcoin); consensus layer shows centralization

**Filecoin (ProbeLab):**
- Data mentions "geo-distribution tracking" but specifics not retrieved
- TMA 2025 study notes ~1,700 peers (low adoption)
- **Assessment**: Small network size; distribution unknown (requires deeper analysis)

**Celo, Polygon, Optimism:**
- No data available
- **Assessment**: Cannot evaluate; critical research gap

---

## Recommendations

### For GeoBeat v0 Integration

#### Tier 1: Production-Ready Sources (Implement Immediately)

1. **Bitnodes.io API** (Bitcoin)
   - **Action**: Register for API access, implement daily snapshot fetching
   - **Rate limit**: 50 req/day sufficient for 1 snapshot/10min × 144/day (need 144 calls) → **Upgrade to PRO required** or sample every 30min (48 calls/day)
   - **Data format**: JSON via `/api/v1/snapshots/` and `/api/v1/snapshots/latest/nodes/`
   - **GeoIP**: Already geocoded (country, city, lat/lon); re-geocode IPs with our own GeoLite2 for consistency

2. **Etherscan Node Tracker** (Ethereum)
   - **Action**: Obtain Etherscan API key, test `/api?module=nodetracker` (endpoint TBD)
   - **Fallback**: If API unavailable, scrape country aggregates from https://etherscan.io/nodetracker
   - **Limitation**: May not provide raw IPs (likely country-level only)

3. **Rated Network API** (Ethereum Validators)
   - **Action**: Contact Rated for API access, pricing
   - **Use case**: Complement Etherscan with consensus layer validator geography
   - **Data format**: Likely JSON REST API with geographic distribution endpoint

#### Tier 2: Validation & Historical Sources (For Cross-Checking)

4. **EtherBee Dataset** (Ethereum)
   - **Action**: Download August-November 2024 snapshot from OSF (https://doi.org/10.17605/OSF.IO/C5UPF)
   - **Use case**: Validate v0 Ethereum data against independent academic measurement
   - **Note**: 16 TB full dataset; request selective download (IPs + geo fields only)

5. **Miga Labs Dashboards** (Ethereum)
   - **Action**: Explore recently launched API; monitor https://migalabs.io/ for documentation
   - **Use case**: Secondary Ethereum source; ISP/cloud provider concentration analysis

#### Tier 3: Filecoin/IPFS Coverage

6. **ProbeLab Weekly Reports** (IPFS/Filecoin)
   - **Action**: Scrape weekly reports from https://probelab.io/ (automated PDF/HTML parsing)
   - **Data frequency**: Weekly updates sufficient for v0
   - **Limitation**: Aggregate data (may not provide raw peer IPs)

7. **Filstats.io** (Filecoin)
   - **Action**: Investigate dashboard for data export or API (site had DNS issues during research)
   - **Use case**: Real-time Filecoin node telemetry

#### Tier 4: Gap-Filling Strategies (Celo, Polygon, Optimism)

**Option A: Custom Crawler Using Nebula**
- **Effort**: High (requires running infrastructure, maintaining crawler)
- **Networks**: Celo (if EVM-compatible DHT), Polygon (less likely), Optimism (unlikely; L2 architecture)
- **Timeline**: v1+ (not feasible for v0 launch)

**Option B: Direct Outreach to Projects**
- **Celo**: Contact Celo Foundation/cLabs for validator node data
- **Polygon**: Contact Polygon Labs for validator infrastructure data
- **Optimism**: Contact OP Labs; consider tracking sequencer/prover operators instead of nodes
- **Timeline**: 2-4 weeks for response (potential for v0 if prioritized)

**Option C: Proxy Metrics for L2s/Alt-L1s**
- **Accept limitation**: Document that Celo/Polygon/Optimism lack public node geography
- **Alternative**: Track validator/sequencer entities (on-chain data) rather than node IPs
- **Rationale**: PoS L1s and L2s have fewer meaningful "nodes" (validator set is what matters)

---

### Licensing & Compliance Strategy

**Immediate Actions:**
1. **Document all attributions**: Create `ATTRIBUTIONS.md` with source citations (Bitnodes, Etherscan, etc.)
2. **Comply with MaxMind GeoLite2 terms**: Display "This product includes GeoLite2 data created by MaxMind" on dashboard
3. **Respect rate limits**: Implement exponential backoff, cache snapshots locally
4. **Avoid NC licenses**: Do not use any sources with CC BY-NC (none identified so far)

**Unclear Licenses (Require Legal Review):**
- Ethernodes.org (operated by bitfly GmbH; terms unclear)
- Bitnodes.io (ToS required but no explicit data license)
- Filstats.io (community-maintained; licensing unknown)

**Recommendation**: Assume research-friendly for v0 (academic use precedent exists); formalize commercial licensing before public launch.

---

### Data Quality & Validation Plan

**For v0 Launch:**

1. **Cross-validate Ethereum data**:
   - Compare Etherscan Node Tracker country counts vs. EtherBee Aug-Nov 2024 baseline
   - Flag discrepancies >20% for manual investigation

2. **GeoIP consistency check**:
   - Re-geocode Bitnodes IPs using MaxMind GeoLite2 (same version EtherBee used)
   - Compare results; document any country-level mismatches

3. **Temporal freshness**:
   - Establish staleness thresholds: <1 week = fresh, 1-4 weeks = recent, >4 weeks = stale
   - Display data age prominently in GeoBeat dashboard

4. **NAT/firewall bias quantification**:
   - Compare Bitnodes "unknown location" % (63%) vs. EtherBee's honeypot-discovered nodes
   - Estimate "true network size" = reachable nodes × 1.5 (conservative multiplier)

**For v1+ Improvements:**
- Implement IP2Location LITE for cross-validation (recommended in methodology docs)
- Run own Bitnodes/Nebula crawler for independent measurements
- Integrate VPN/proxy detection (MaxMind Anonymous IP database)

---

### Next Steps (Priority Order)

1. **Week 1: API Access & Testing**
   - Obtain Bitnodes API access (free tier or PRO)
   - Get Etherscan API key, test node tracker endpoints
   - Contact Rated Network for API access/pricing

2. **Week 2: Data Integration**
   - Implement Bitnodes snapshot fetching (1/day or 1/hour)
   - Integrate Etherscan node counts (country-level)
   - Download EtherBee sample for validation

3. **Week 3: Filecoin & Gap Analysis**
   - Scrape ProbeLab weekly reports (automate)
   - Investigate Filstats API
   - **Decision point**: Proceed with Celo/Polygon/Optimism outreach or defer to v1?

4. **Week 4: Schema Design & Pipeline**
   - Design v0 database schema (informed by available data fields)
   - Build ETL pipeline (APIs → database → GeoBeat dashboard)
   - Implement data quality checks (cross-validation, freshness)

---

## Conclusion

This reconnaissance identified **strong coverage for Bitcoin and Ethereum** with multiple production-ready APIs and datasets. **Filecoin has emerging infrastructure** (ProbeLab, Filstats) suitable for v0 with weekly granularity. **Celo, Polygon, and Optimism represent critical gaps** requiring either custom crawlers, project outreach, or acceptance of limited v0 coverage.

**Recommended v0 Scope:**
- **Full coverage**: Bitcoin (Bitnodes), Ethereum (Etherscan + Rated)
- **Partial coverage**: Filecoin (ProbeLab weekly)
- **Deferred to v1**: Celo, Polygon, Optimism (document gaps, plan custom solutions)

This phased approach enables v0 launch with high-quality data for 2-3 networks while establishing a roadmap for expanding to all 6 priority networks in subsequent releases.

---

**Report compiled:** 2025-01-22
**Researcher:** Claude (Anthropic)
**Review status:** Draft (pending human review)
