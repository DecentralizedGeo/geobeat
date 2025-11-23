# GDI v0: Simple Geographic Decentralization Metrics

**Status**: v0 Hackathon Implementation
**Last Updated**: 2025-11-22

## Overview

Three simple, defensible metrics measuring blockchain network geographic decentralization. **Higher is better** for all metrics.

---

## Physical Distribution Index (PDI)

**What it measures**: How spread out nodes are across physical geography

**Formula**: `PDI = 100 × (1 - Spatial HHI)`

**Range**: 0-100 (higher = more dispersed)

**Interpretation**:
- **80-100**: Highly dispersed (good)
- **60-80**: Moderately dispersed
- **0-60**: Concentrated (bad)

**How it works**: Divides Earth into hexagonal grid cells (H3 resolution 5 ≈ metro areas), calculates Herfindahl-Hirschman Index of node distribution. Lower HHI = more spread out.

**Why it's defensible**: HHI is standard antitrust/market concentration metric used by DOJ/FTC.

---

## Jurisdictional Diversity Index (JDI)

**What it measures**: How diverse the legal jurisdictions are

**Formula**: `JDI = 100 × (Effective Countries / Total Countries)`

Where `Effective Countries = exp(Shannon Entropy of country distribution)`

**Range**: 0-100 (higher = more jurisdictional diversity)

**Interpretation**:
- **70-100**: High diversity (many countries, even distribution)
- **40-70**: Moderate diversity
- **0-40**: Low diversity (concentrated in few countries)

**How it works**: Shannon entropy rewards even distribution. 50 nodes each in 10 countries scores higher than 450 in one country + 50 in nine others.

**Why it's defensible**: Shannon entropy is foundational information theory, used everywhere from ecology to economics.

---

## Infrastructure Heterogeneity Index (IHI)

**What it measures**: How diverse the hosting infrastructure is (cloud provider concentration)

**Formula**: `IHI = 100 × (1 - Provider HHI)`

**Range**: 0-100 (higher = less concentrated, more diverse)

**Interpretation**:
- **75-100**: Competitive (no monopoly)
- **50-75**: Moderate concentration
- **0-50**: High concentration (monopoly risk)

**How it works**: Categorizes nodes by hosting provider (AWS, GCP, Azure, Hetzner, Home/Other), calculates HHI. If AWS has 70%, HHI is high → IHI is low.

**Why it's defensible**: Same HHI metric as PDI, standard economic concentration measure.

---

## Composite GDI Score

**Formula**: `GDI = 0.4 × PDI + 0.35 × JDI + 0.25 × IHI`

**Why these weights**:
- Physical geography (40%): Most fundamental - disaster/latency risk
- Jurisdiction (35%): Critical for censorship resistance
- Infrastructure (25%): Important but often correlates with geography

**Overall Interpretation**:
- **80-100**: Highly decentralized
- **60-80**: Moderately decentralized
- **40-60**: Weakly decentralized
- **0-40**: Centralized

---

## Example Calculation (Ethereum)

```
Spatial HHI = 0.032 → PDI = 100 × (1 - 0.032) = 96.8
Effective Countries = 45 of 67 total → JDI = 100 × (45/67) = 67.2
Provider HHI = 0.28 → IHI = 100 × (1 - 0.28) = 72.0

GDI = 0.4(96.8) + 0.35(67.2) + 0.25(72.0) = 80.2
```

**Interpretation**: Ethereum is "highly decentralized" overall, with excellent physical dispersion but moderate jurisdictional/infrastructure concentration.

---

## Data Requirements

All metrics calculable from IP geolocation data:
- `lat, lon` → PDI (Spatial HHI)
- `country` → JDI (entropy)
- `org, asname, hosting` → IHI (provider categorization)

---

## References

- Herfindahl, O.C. (1950). "Concentration in the Steel Industry"
- Shannon, C.E. (1948). "A Mathematical Theory of Communication"
- US DOJ/FTC (2010). "Horizontal Merger Guidelines" - HHI thresholds
- Uber H3 (2018). "Hexagonal Hierarchical Spatial Index"

---

## v0.2 Future Enhancements

- Add Moran's I for clustering detection
- Country-level geographic spread (continent diversity)
- Time-series tracking
- Cross-chain benchmarking
