# Methodology: How to Evaluate Blockchain Data Sources

This directory contains reference materials and best practices for evaluating blockchain node geographic data sources.

## What's Here (Scaffolding)

> **⚠️ These are reference guides, NOT research findings.**
>
> For actual data source evaluations, see [../INVENTORY.md](../INVENTORY.md)

### Comprehensive Guides

1. **[EVALUATION_GUIDE.md](EVALUATION_GUIDE.md)** (60+ pages)
   - Dataset inventory structure (required/recommended fields)
   - How to evaluate node explorer APIs
   - Geographic decentralization measurement standards
   - GeoIP accuracy expectations and limitations
   - Common pitfalls (biases, temporal issues, licensing)
   - Tools and frameworks for data cataloging
   - Comparative analysis best practices
   - 9 well-documented example projects

2. **[FRAMEWORK_REFERENCE.md](FRAMEWORK_REFERENCE.md)**
   - GeoIP databases (MaxMind GeoLite2, IP2Location)
   - Blockchain node explorer APIs (Bitnodes, Ethernodes patterns)
   - P2P network crawling frameworks (Nebula, Armiarma)
   - REST/GraphQL API patterns
   - Data licensing considerations
   - Common data formats (JSON, Parquet, CSV)
   - Detection capabilities & biases (VPN, datacenter IPs)

3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
   - Essential vs. recommended inventory fields
   - Red flags and quality indicators
   - GeoIP accuracy table
   - Licensing quick reference
   - Key decentralization metrics and formulas
   - 4-phase evaluation workflow

4. **[SUMMARY.md](SUMMARY.md)**
   - Executive overview of methodology research
   - Top 10 takeaways
   - Recommended workflow for GeoBeat
   - All research sources cited

### Templates

Located in [templates/](templates/):

- **[source_template.json](templates/source_template.json)**
  - Complete JSON template with all fields
  - Inline documentation and examples
  - Type options for each field
  - Ready to copy and fill

- **[assessment_template.md](templates/assessment_template.md)**
  - 12-section quality assessment guide
  - Checklists for each dimension
  - Examples and guidance
  - For deep evaluation of high-priority sources

---

## Quick Start Workflow

### New to evaluating blockchain data sources?

1. **Start with:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5-minute read)
2. **Use checklist:** [../CHECKLIST.md](../CHECKLIST.md) for step-by-step evaluation
3. **Document findings:** Copy [templates/source_template.json](templates/source_template.json)
4. **Deep dive if needed:** [EVALUATION_GUIDE.md](EVALUATION_GUIDE.md) for comprehensive guidance

### Already familiar with data evaluation?

Go straight to [../CHECKLIST.md](../CHECKLIST.md) and [templates/source_template.json](templates/source_template.json).

---

## Key Insights Summary

### GeoIP Databases
- **MaxMind GeoLite2** (recommended): 99.8% country accuracy, 66% city accuracy, CC BY-SA 4.0
- **IP2Location LITE** (cross-validation): Comparable accuracy, open-source
- **Best practice:** Multi-source validation (no single database is perfect)

### Blockchain Node APIs
- **Bitnodes.io** (Bitcoin): 50 req/day free, excellent docs, provides IP/geo/ASN
- **Ethernodes.org** (Ethereum): Used in 5+ academic studies, API may require contact
- **Nebula** (Multi-network): DHT crawler for IPFS, Ethereum, Celestia, Bitcoin

### Universal Truths
1. NAT/firewall bias is inevitable (all counts are lower bounds)
2. Country-level GeoIP is reliable; city-level is approximate
3. VPNs/proxies completely obscure true locations
4. Data freshness matters (>3 months = stale for fast-moving networks)
5. Cross-validation is essential (no single source is perfect)

### Licensing Red Flags
- ❌ No license (all rights reserved)
- ❌ CC BY-NC (non-commercial only)
- ❌ No redistribution allowed
- ✅ Safe: MIT, BSD, Apache 2.0, CC0, CC-BY

---

## How This Was Created

**Date Created:** 2025-11-22

This methodology was compiled from:
- Academic research on blockchain decentralization (2022-2025 papers)
- Metadata standards (Data Provenance Initiative, Social Science Data Editors)
- GeoIP documentation (MaxMind, IP2Location benchmarks)
- Data catalog platforms (OpenMetadata, DataHub, AWS Public Blockchain Data)
- Blockchain measurement studies (NodeMaps, EtherBee, Multi-Cryptocurrency Node Explorer)

All sources cited in [SUMMARY.md](SUMMARY.md).

---

## Using This Methodology

These guides were created to support [Issue #1](https://github.com/DecentralizedGeo/geobeat/issues/1) - evaluating 8+ seed data sources for 6 priority blockchain networks.

**They provide:**
- ✅ Structure for documenting findings (templates)
- ✅ Quality criteria for assessment (what makes a good source?)
- ✅ Red flags to watch for (licensing, bias, staleness)
- ✅ Technical background (how GeoIP works, API patterns)

**They do NOT provide:**
- ❌ Actual evaluations of specific sources (that's the research work)
- ❌ Recommendations of which sources to use (that comes from inventory)
- ❌ GeoBeat v0 design decisions (that's a separate phase)

---

## Questions?

- See [../README.md](../README.md) for data-sources directory overview
- See [../../research/README.md](../../research/README.md) for academic research on decentralization metrics
- See [Issue #1](https://github.com/DecentralizedGeo/geobeat/issues/1) for current data source reconnaissance task
