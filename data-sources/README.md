# Blockchain Node Geographic Data Sources

This directory contains a comprehensive catalog of datasets, APIs, and measurement frameworks that provide node-level geographic information for blockchain networks.

## Purpose

GeoBeat needs to measure **physical decentralization** across blockchain networks. This catalog identifies existing data sources so we can:
- Avoid building redundant infrastructure
- Use established, credible measurements
- Understand data quality, coverage, and licensing
- Design v0 with realistic data availability in mind

---

## Primary Deliverable

**[INVENTORY.md](INVENTORY.md)** - Comprehensive catalog of blockchain node geographic data sources

This inventory documents:
- What data sources exist for our 6 priority networks (Bitcoin, Ethereum, Filecoin, Celo, Polygon, Cosmos)
- Data type (API, dataset, explorer), signals (IPs, geo, ASN), licensing, quality
- Comparative analysis of coverage, overlaps, and tradeoffs
- Recommendations for v0 integration

**Status:** 🚧 In progress (see [Issue #1](https://github.com/DecentralizedGeo/geobeat/issues/1))

---

## Quick Start

### Evaluating a New Data Source?

1. **Start here:** [CHECKLIST.md](CHECKLIST.md) - Step-by-step evaluation process
2. **Document findings:** Use [templates/source_template.json](methodology/templates/source_template.json)
3. **Quick reference:** [methodology/QUICK_REFERENCE.md](methodology/QUICK_REFERENCE.md) for key criteria
4. **Deep dive:** [methodology/EVALUATION_GUIDE.md](methodology/EVALUATION_GUIDE.md) for comprehensive best practices

### Understanding the Methodology?

See **[methodology/](methodology/)** subdirectory for:
- How to evaluate blockchain datasets (best practices)
- How GeoIP databases work (MaxMind, IP2Location)
- API patterns and data formats
- Licensing considerations and red flags

---

## Structure

```
data-sources/
├── README.md                    # You are here
├── INVENTORY.md                 # 🎯 Main deliverable (catalog of sources)
├── CHECKLIST.md                 # Quick evaluation checklist
└── methodology/                 # How we evaluate sources
    ├── README.md                # Methodology overview
    ├── EVALUATION_GUIDE.md      # Comprehensive best practices (60+ pages)
    ├── FRAMEWORK_REFERENCE.md   # GeoIP, APIs, data formats
    ├── QUICK_REFERENCE.md       # Condensed checklist
    └── templates/
        ├── source_template.json      # JSON template for documenting sources
        └── assessment_template.md    # Quality assessment guide
```

---

## Priority Networks (v0 Scope)

GeoBeat v0 focuses on **6 blockchain networks** based on data availability, network size, and team relationships:

1. **Bitcoin** - Largest PoW network, mature tooling (Bitnodes.io)
2. **Ethereum** - Largest PoS network, extensive research (Ethernodes, Miga Labs)
3. **Filecoin** - Decentralized storage, Protocol Labs relationship
4. **Celo** - Mobile-first L1, strong community
5. **Polygon** - Major L2/sidechain, large validator set
6. **Cosmos** - IBC hub, multi-chain ecosystem

---

## Key Insights (From Methodology Research)

### GeoIP Accuracy Expectations
- **Country-level:** 99.8% accurate (MaxMind GeoLite2)
- **City-level:** ~66% accuracy within 50km
- **Key limitation:** Shows datacenter location, not operator location

### Common Data Biases
- **NAT/firewall bias:** All node counts are lower bounds (unreachable nodes invisible)
- **VPN/proxy obfuscation:** Geographic data reflects proxy location, not operator
- **Single vantage point:** Different crawlers see different subsets of the network

### Licensing Red Flags
- ❌ **Avoid CC BY-NC** (non-commercial) - incompatible with commercial academic journals
- ❌ **"No redistribution"** clauses - can't share derived datasets
- ✅ **Safe choices:** CC0, CC-BY, MIT, Apache 2.0

### API Best Practices
- **Bitnodes.io:** 50 req/day free tier, excellent docs, Bitcoin coverage
- **Rate limits:** Test early to avoid integration surprises
- **Pagination:** Prefer cursor-based for large/changing datasets

---

## Contributing

When you find a new data source:

1. Evaluate using [CHECKLIST.md](CHECKLIST.md)
2. Document in [INVENTORY.md](INVENTORY.md) using the standard structure
3. Add quality assessment if needed (methodology/templates/assessment_template.md)
4. Update comparative analysis section
5. Commit with message: `data-sources: add <source-name> for <network>`

---

## Related Documentation

- **Academic research on metrics:** [../research/METRICS.md](../research/METRICS.md) (HHI, Gini, Shannon entropy)
- **Academic papers & resources:** [../research/RESOURCES.md](../research/RESOURCES.md)
- **Project overview:** [../README.md](../README.md)
- **Current task:** [Issue #1](https://github.com/DecentralizedGeo/geobeat/issues/1)
