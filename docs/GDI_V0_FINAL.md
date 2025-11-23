# GDI v0: Geographic Decentralization Index

**Status**: v0 Final (Hackathon)
**Last Updated**: 2025-11-22

## Overview

Three metrics measuring blockchain network geographic decentralization. **All scores 0-100, higher = more decentralized.**

---

## Physical Distribution Index (PDI)

**What it measures**: How spread out and unclustered nodes are across physical geography

**Formula**:
```
PDI = 100 × [0.4×(1-Moran's I) + 0.3×ENL_norm + 0.3×(1-Spatial_HHI)]
```

**Components**:
- **Moran's I** (40%): Detects spatial clustering (inverted: high clustering = low score)
- **ENL** (30%): Effective Number of Locations via entropy (higher = more even spread)
- **Spatial HHI** (30%): Geographic concentration in grid cells (inverted: high concentration = low score)

**Range**: 0-100 (higher = more dispersed, less clustered)

**Interpretation**:
- **80-100**: Highly dispersed
- **60-80**: Moderately dispersed
- **0-60**: Concentrated

**Why it's defensible**: Composite of three established spatial statistics (Moran 1948, Shannon 1948, Herfindahl 1950).

---

## Jurisdictional Diversity Index (JDI)

**What it measures**: How concentrated nodes are across legal jurisdictions (countries)

**Formula**:
```
JDI = 100 × (1 - Country_HHI)

where Country_HHI = Σ(country_share²)
```

**Range**: 0-100 (higher = less concentrated, more diverse)

**Interpretation**:
- **75-100**: Low concentration (competitive)
- **50-75**: Moderate concentration
- **25-50**: High concentration
- **0-25**: Very high concentration (monopoly risk)

**Example**:
- 100 nodes evenly in 4 countries (25 each) → HHI = 0.25 → JDI = 75
- 100 nodes with 70 in US, 30 elsewhere → HHI = 0.58 → JDI = 42

**Why it's defensible**: Standard HHI used by DOJ/FTC for antitrust analysis.

---

## Infrastructure Heterogeneity Index (IHI)

**What it measures**: How concentrated nodes are across organizations/hosting providers

**Formula**:
```
IHI = 100 × (1 - Org_HHI)

where Org_HHI = Σ(org_share²)
```

**Range**: 0-100 (higher = less concentrated, more diverse)

**Interpretation**:
- **75-100**: Low concentration (competitive)
- **50-75**: Moderate concentration
- **25-50**: High concentration
- **0-25**: Very high concentration (monopoly risk)

**Example**:
- 60% AWS, 25% GCP, 15% others → HHI = 0.46 → IHI = 54

**Why it's defensible**: Same HHI metric, applied to organizational diversity instead of geography.

---

## Composite GDI Score

**Formula**:
```
GDI = 0.40×PDI + 0.35×JDI + 0.25×IHI
```

**Weights Rationale**:
- **PDI (40%)**: Physical geography is fundamental - most direct disaster/latency risk
- **JDI (35%)**: Jurisdictional concentration enables coordinated regulatory action
- **IHI (25%)**: Organizational concentration is critical but often correlates with jurisdiction

**Overall Scale**:
- **80-100**: Highly decentralized
- **60-80**: Moderately decentralized
- **40-60**: Weakly decentralized
- **0-40**: Centralized

---

## Data Requirements

From IP geolocation CSV:
- `lat, lon` → PDI (spatial metrics)
- `country` → JDI (country HHI)
- `org` → IHI (organization HHI)

---

## References

**Spatial Statistics**:
- Moran, P.A.P. (1948). "The Interpretation of Statistical Maps"
- Shannon, C.E. (1948). "A Mathematical Theory of Communication"
- Anselin, L. (1995). "Local Indicators of Spatial Association - LISA"

**Market Concentration**:
- Herfindahl, O.C. (1950). "Concentration in the Steel Industry"
- US DOJ/FTC (2010). "Horizontal Merger Guidelines" - HHI thresholds

**Spatial Data**:
- Uber H3 (2018). "Hexagonal Hierarchical Spatial Index"

---

## Implementation Notes

All three indices now follow consistent logic:
- **Lower concentration = Higher score**
- **All use HHI-family metrics** (proven antitrust standard)
- **PDI adds spatial autocorrelation** for clustering detection
- **0-100 normalization** for interpretability
