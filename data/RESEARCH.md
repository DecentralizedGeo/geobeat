You are a senior data engineer doing **data source reconnaissance** for a "physical decentralization" index for blockchain networks.

Your job in this session is **only**:

1. Find and catalog datasets / APIs / measurement frameworks that expose node- or peer-level information with IP addresses (or at least IP-derived geography) for blockchain / Web3 networks.
2. Assess their structure, recency, licensing/terms, and obvious limitations.
3. Analyze how these sources relate or overlap with each other.

You are **not** designing metrics, schemas, or data pipelines yet. Just reconnaissance and a written report.

---

## Project context

We're building **Geobeat**, a geographic decentralization index + dashboard for blockchain networks.

For **v0** we care only about:

- **Physical decentralization**: "How geographically dispersed are the network's nodes?"
- Primary raw signal: **IP addresses of nodes or peers in the network's P2P layer**, plus any associated GeoIP-based fields if already provided.
- Stretch but optional: ASN / ISP information, if already present.

Out of scope for this task:

- Designing the index or any formulas.
- Legal/jurisdiction diversity, operator diversity, cloud concentration, etc. (These will be v1+.)
- Building crawlers from scratch (you can note them as possibilities, but don't treat speculative crawlers as existing datasets).

We want to stand on **already-published, credible** measurements and datasets wherever possible.

---

## Priority networks (UPDATED SCOPE)

**Focus on these 6 networks only:**

1. **Bitcoin** - Largest PoW network, mature tooling (Bitnodes.io)
2. **Ethereum** - Largest PoS network, extensive research (Ethernodes, Miga Labs)
3. **Filecoin** - Decentralized storage, Protocol Labs relationship
4. **Celo** - Mobile-first L1, strong community
5. **Polygon** - Major L2/sidechain, large validator set
6. **Cosmos** - IBC hub, multi-chain ecosystem

This is a **reduction from 84 networks** to make the task manageable and focused on networks with:
- Good data availability
- Significant network size
- Team relationships

---

## Seed data sources (starting points)

Start from these known, credible sources and then expand by searching for related data / code / APIs:

1. **EtherBee – Ethereum node dataset**
   - Example link: https://arxiv.org/pdf/2505.18290
   - Global dataset of Ethereum node performance and P2P sessions, including peer IPs and geolocation (via GeoLite2). Look for any public data release (e.g. Zenodo, institutional or project page).

2. **EtherNodes / Ethernodes.org**
   - Example link: https://www.ethernodes.org/
   - Long-standing Ethereum node explorer with geographic distribution data and an "Ether Nodes API" that's cited in recent geospatial PoS research.
   - Investigate what the API actually exposes (node counts by country/region vs. raw IP, etc.).

3. **NodeMaps framework (Howell et al.)**
   - Example article: "Measuring node decentralisation in blockchain peer to peer networks" (ScienceDirect / university repository).
   - They measure node decentralization for several P2P blockchain platforms.
   - Look for: source code, datasets, or supplementary material covering IP / geography for multiple chains.

4. **Multi-Cryptocurrency Node Explorer (ETH Zurich thesis)**
   - Example link (PDF): "Building a Multi-Cryptocurrency Node Explorer" (2024 student thesis from ETH Zurich).
   - Describes a crawler that produces JSON with node IP:port for multiple currencies.
   - Investigate whether the code and/or crawled datasets are public and reusable.

5. **Miga Labs – Ethereum network dashboards**
   - Miga Labs maintains Ethereum "client analyzer" and network dashboards with ISP and geographical data for Ethereum nodes / validators.
   - Find their main site/repos and see if they publish raw data, APIs, or only aggregate metrics.

6. **Filecoin / decentralized storage peer geo studies**
   - Example: "Comparing Modern Decentralized Storage Platforms" (TMA 2025) which shows IPFS and Filecoin peer GeoIP heatmaps.
   - Investigate:
     - Whether they released supporting datasets for IPFS/Filecoin peers and their geolocation.
     - Any related tooling from Protocol Labs (IPFS, Filecoin network telemetry, etc.) that exposes peer IPs or geo stats.

7. **Rootstock node discovery measurements**
   - Example: methods paper on Rootstock node discovery that reports finding 200+ nodes and unique IP addresses.
   - Check if the authors released raw IP-level data or code that can be rerun to reproduce the dataset.

8. **Other Ethereum / multi-chain decentralization measurement efforts**
   - E.g., Gencer et al. "Decentralization in Bitcoin and Ethereum Networks", Lido research posts on geographical distribution, Ethereum research threads on "Estimating validator decentralization using p2p data".
   - For each, look for:
     - Whether any underlying data or code is public.
     - Whether they rely on third-party services (like Ethernodes, Miga Labs) that might themselves expose APIs.

Treat this list as **seed leads only**. You should search the web for:

- Additional node explorer APIs for other networks (Polygon, Celo, Cosmos).
- Project-run telemetry dashboards or status pages that might expose node/peer distributions.
- Research papers or theses that have released node-level datasets for any of the 6 priority networks.

---

## What to produce

Your main deliverable is a **written report** (markdown is ideal) that has two sections:

### 1. Dataset inventory (structured)

For each dataset / API / project you identify:

- **Name**
- **URL(s)**
- **Networks covered** (which of our 6 priority networks?)
- **Data type**
  - Static dataset (CSV/JSON/parquet, etc.)
  - API (REST/GraphQL/etc.)
  - Code-only (crawler framework, no bundled data)
  - Explorer-only (no raw data exposed; just rendered charts)
- **Node-level signals available**
  - Does it expose **IP addresses** per node/peer? (yes/no/unclear)
  - Does it expose **geographic fields** directly? (country, city, lat/lon, region/bin, etc.)
  - Does it expose **ASN / ISP / provider**? (yes/no/unclear)
- **Temporal characteristics**
  - Snapshot vs time series vs live / continuously updated
  - Time range covered (if known)
  - How recent is the last data point or last crawl?
- **Licensing / terms**
  - Stated license (e.g. CC-BY, MIT, proprietary, "non-commercial", absent/unclear)
  - Any terms of service that might restrict automated use or redistribution
- **Obvious biases / limitations**
  - E.g. single vantage point, only reachable nodes, only a subset of clients, reliance on self-reporting, etc.
- **Relevance to our v0 goal**
  - "Strong candidate for v0 physical decentralization" / "Probably v1+ only" / "Not usable, but method is informative."

Make sure to explicitly mark where key details are **unknown** rather than guessing.

### 2. Comparative analysis (how the sources relate)

After you inventory the sources, write a short analysis that answers:

- Which networks (among our 6 priorities) have **good** existing coverage of node IP / geography, and which ones appear to have **little or no public data**?
- Where are there **overlaps** or common dependencies between datasets?
  - Example: multiple studies using Ethernodes data under the hood.
- Are there any **clear "hubs"** (APIs or frameworks) that many others depend on, which could become primary sources for us?
- Are there dataset families that are:
  - Complementary (e.g. one has great Ethereum data, another has multi-chain but shallower),
  - Or clearly redundant (one is just a repackaged extract of another)?
- Any notable **tradeoffs** we should keep in mind:
  - E.g. one source is very recent but small; another is large but old; one has IPs but restrictive licensing; another only has aggregate geography but is easy to use.

Keep this at the level of **data sources** and their relationships. Do not propose metric formulas or schemas in this analysis.

---

## How to work

1. Start by exploring the seed sources above, confirming what they actually expose.
2. Then, for each priority network, explicitly search for:
   - "<network name> node explorer geolocation"
   - "<network name> peer dataset IP addresses"
   - "<network name> decentralization study IP geolocation"
3. As you find something relevant, add it to the inventory and fill in as many of the fields as you can.
4. When you're done, output:
   - A markdown report with the **dataset inventory** and the **comparative analysis**.
   - If you want, include tables for clarity, but don't drift into schema design.

Stay focused on **finding, reading, and evaluating data sources**. Do not design the Geobeat index or any data model in this step.

---

## Methodology & Templates Available

**You have extensive scaffolding to help you:**

### Quick Start
1. **Checklist:** `/Users/x25bd/Code/astral/geobeat/data-sources/CHECKLIST.md` - Step-by-step evaluation process
2. **Template:** `/Users/x25bd/Code/astral/geobeat/data-sources/methodology/templates/source_template.json` - Document each source
3. **Quick ref:** `/Users/x25bd/Code/astral/geobeat/data-sources/methodology/QUICK_REFERENCE.md` - Key criteria

### Deep References
- **Evaluation guide:** `/Users/x25bd/Code/astral/geobeat/data-sources/methodology/EVALUATION_GUIDE.md` (60+ pages on best practices)
- **Framework docs:** `/Users/x25bd/Code/astral/geobeat/data-sources/methodology/FRAMEWORK_REFERENCE.md` (GeoIP databases, APIs)

### Key Insights to Remember
- **GeoIP accuracy:** Country 99.8%, City ~66% (MaxMind GeoLite2)
- **Avoid licenses:** CC BY-NC (incompatible with commercial journals)
- **Safe licenses:** CC0, CC-BY, MIT, Apache 2.0
- **NAT bias:** All node counts are lower bounds
- **Recency matters:** >3 months = stale for fast-moving networks

---

## Output Location

**Create:** `/Users/x25bd/Code/astral/geobeat/data-sources/INVENTORY.md`

**Structure:**
```markdown
# Blockchain Node Geographic Data Source Inventory

**Date:** YYYY-MM-DD
**Networks:** Bitcoin, Ethereum, Filecoin, Celo, Polygon, Cosmos
**Purpose:** Data source reconnaissance for GeoBeat v0 physical decentralization index

---

## Executive Summary

[3-5 key findings - what networks have good data, which have gaps, top recommendations]

---

## Dataset Inventory

### [Source Name 1]

- **URL(s):** [primary], [API docs], [GitHub], [data repo]
- **Networks covered:** Bitcoin, Ethereum
- **Data type:** API (REST) + static snapshots
- **Node-level signals:**
  - IP addresses: Yes (IPv4/IPv6)
  - Geographic fields: Yes (country, city, lat/lon via GeoLite2)
  - ASN/ISP: Yes
- **Temporal:** Time series (monthly 2020-2024) + live
- **Licensing:** CC BY 4.0
- **Limitations:** NAT bias, single vantage point, GeoIP city ~66% accurate
- **Relevance:** Strong candidate for v0

---

[Repeat for each source...]

---

## Comparative Analysis

### Coverage Summary

[Table showing which of 6 networks have data vs. gaps]

### Dependencies & Overlaps

[Which sources rely on same underlying data? E.g., multiple studies use Ethernodes]

### Key Tradeoffs

[Recency vs. coverage, licensing vs. features, etc.]

### Recommendations

[Top 3-5 sources for v0, gap-filling needs]
```

---

## Success Criteria

Your work is complete when:

- ✅ All 8 seed sources have been evaluated
- ✅ All 6 priority networks have entry (even if "no public data found")
- ✅ At least 3 sources marked "strong candidate for v0"
- ✅ Comparative analysis clearly shows coverage gaps and recommendations
- ✅ All licensing clearly documented (no "unknown" for licenses)
- ✅ Report follows structure above and is ready to share externally

---

## Questions to Answer First (If Unclear)

- **Cosmos:** Cosmos Hub only, or also Osmosis/other chains?
- **Commercial sources:** Evaluate paid APIs or only free/open?
- **Timeline:** 2-3 weeks realistic for this scope?
