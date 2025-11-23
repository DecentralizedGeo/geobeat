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
PDI = 100 × [0.4×(1-Moran's I) + 0.3×min(1, ENL/2000) + 0.3×(1-Spatial_HHI)]
```

**Components**:
- **Moran's I** (40%): Detects spatial clustering (inverted: high clustering = low score)
- **ENL** (30%): Effective Number of Locations via entropy (absolute count, capped at 2000)
- **Spatial HHI** (30%): Geographic concentration in grid cells (inverted: high concentration = low score)

**Range**: 0-100 (higher = more dispersed, less clustered)

**Interpretation**:
- **80-100**: Highly dispersed
- **60-80**: Moderately dispersed
- **40-60**: Concentrated
- **0-40**: Highly concentrated

**Why it's defensible**: Composite of three established spatial statistics (Moran 1948, Shannon 1948, Herfindahl 1950). Uses absolute ENL with strict threshold (2000) to reward truly global networks.

---

## Jurisdictional Diversity Index (JDI)

**What it measures**: How concentrated nodes are across legal jurisdictions (countries)

**Formula**:
```
JDI = 100 × [0.3×(1-Country_HHI) + 0.35×min(1, log10(num_countries)/2.5) - 0.35×penalty]

where:
  Country_HHI = Σ(country_share²)
  penalty = max(0, (top_country_share - 0.15) / 0.35)  [Linear from 15% to 50%]
```

**Components**:
- **HHI Component** (30%): Measures evenness of distribution across countries
- **Diversity Bonus** (35%): Rewards absolute number of countries (maxes at 300+ countries)
- **Concentration Penalty** (35%): Penalizes if any single country has >15% of nodes

**Range**: 0-100 (higher = less concentrated, more diverse)

**Interpretation**:
- **50-100**: Moderate to low concentration
- **25-50**: High concentration
- **0-25**: Very high concentration (regulatory risk)

**Why it's defensible**: Standard HHI used by DOJ/FTC for antitrust analysis, with strict thresholds that penalize single-country dominance (33% in one country is a real vulnerability).

---

## Infrastructure Heterogeneity Index (IHI)

**What it measures**: How concentrated nodes are across organizations/hosting providers

**Formula**:
```
IHI = 100 × [0.3×(1-Org_HHI) + 0.35×min(1, log10(num_orgs)/4.5) - 0.35×penalty]

where:
  Org_HHI = Σ(org_share²)
  penalty = max(0, (top_org_share - 0.03) / 0.17)  [Linear from 3% to 20%]
```

**Components**:
- **HHI Component** (30%): Measures evenness of distribution across organizations
- **Diversity Bonus** (35%): Rewards absolute number of organizations (maxes at 30000+ orgs)
- **Concentration Penalty** (35%): Penalizes if any single org has >3% of nodes

**Range**: 0-100 (higher = less concentrated, more diverse)

**Interpretation**:
- **50-100**: Moderate to low concentration
- **25-50**: High concentration
- **0-25**: Very high concentration (infrastructure risk)

**Why it's defensible**: Same HHI metric used in antitrust analysis, with strict thresholds that penalize provider dominance (6% in a single provider is a real attack vector).

---

## Composite GDI Score

**Formula**:
```
GDI = 0.35×PDI + 0.20×JDI + 0.10×IHI + 0.35×Network_Size

where Network_Size = 100 × min(1, sqrt(nodes / 50000))
```

**Weights Rationale**:
- **PDI (35%)**: Physical distribution shows most differentiation between networks
- **Network Size (35%)**: Absolute node count matters for attack resistance and redundancy
- **JDI (20%)**: Jurisdictional concentration enables coordinated regulatory action
- **IHI (10%)**: Organizational diversity matters but often correlates with jurisdiction

**Network Size Justification**: A network with 10,000 nodes is fundamentally more decentralized than one with 100 nodes even if they have identical distribution patterns, because:
- Higher economic cost to attack (more nodes to compromise)
- More redundancy and fault tolerance
- Greater barrier to centralization

**Overall Scale**:
- **60-100**: Moderately to highly decentralized
- **40-60**: Weakly decentralized
- **20-40**: Centralized
- **0-20**: Highly centralized

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

**Key Design Decisions**:

1. **Strict Thresholds**: ENL capped at 2000 locations, diversity bonuses max out at 300 countries / 30000 orgs. This reflects that true decentralization is rare and difficult to achieve.

2. **Concentration Penalties**: Heavy penalties (35% weight) for single-entity dominance. Having 33% of nodes in one country or 6% in one provider is a real vulnerability that should significantly lower scores.

3. **Network Size Component**: 35% weight on absolute node count. This addresses the fundamental issue that scale-invariant metrics (like HHI) don't capture attack surface. More nodes = higher cost to compromise the network.

4. **Balanced Components**:
   - 30% HHI (proven antitrust metric)
   - 35% Diversity bonus (rewards absolute counts)
   - 35% Concentration penalty (punishes single points of failure)

5. **Logarithmic Scaling**: All diversity bonuses use log scaling to prevent runaway scores while rewarding order-of-magnitude increases in diversity.

**Result**: Both Ethereum (51.4) and Polygon (43.4) score in "Weakly decentralized" range, which honestly reflects their concentration in US/Germany/Hetzner visible on geographic maps.
