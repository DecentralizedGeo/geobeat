# GEOBEAT Proposed Methodology
## Geographic Decentralization Index (GDI)

**Version**: 1.0 Proposal
**Status**: Proposed Framework
**Last Updated**: 2025-11-27

## Executive Summary

The Geographic Decentralization Index (GDI) quantifies how decentralized a blockchain network is across three critical dimensions: **Physical Distribution**, **Jurisdictional Diversity**, and **Infrastructure Heterogeneity**. Each sub-index incorporates geographic considerations to capture different facets of centralization risk.

This document describes the **proposed** rigorous methodology for GDI v1.0, incorporating peer-reviewed spatial statistics and established economic concentration metrics.

## Index Architecture

```
GDI (0-100) = 0.40 × PDI + 0.35 × JDI + 0.25 × IHI

Where:
- PDI: Physical Distribution Index
- JDI: Jurisdictional Diversity Index
- IHI: Infrastructure Heterogeneity Index
```

---

## 1. Physical Distribution Index (PDI)

### Objective

Measure whether nodes are geographically clustered or dispersed across physical space, capturing both global patterns and local concentration.

### Why This Matters

- **Disaster resilience**: Clustered nodes are vulnerable to regional power outages, natural disasters, or network disruptions
- **Latency**: Geographic spread affects network propagation times
- **Regulatory risk**: Physical concentration makes networks vulnerable to coordinated regulatory action
- **Attack surface**: Geographic diversity increases the cost and complexity of physical attacks

### Formula

```python
PDI = 100 × [
    0.4 × (1 - Moran's I_normalized) +  # Anti-clustering (inverted)
    0.3 × ENL_normalized +               # Entropy-based evenness
    0.3 × (1 - Spatial_HHI)              # Anti-concentration
]
```

### Components

#### 1. Moran's I (40% weight) - Global Clustering Detection

**What it measures**: Spatial autocorrelation - whether nearby locations have similar node densities

**Range**: -1 (perfect dispersion) to +1 (perfect clustering)

**Why it's essential**:
- Statistically rigorous with hypothesis testing (p-values)
- Captures clustering at multiple geographic scales simultaneously
- Widely used in spatial epidemiology, ecology, urban planning
- Detects patterns that simple counts miss

**Implementation**: Distance-band spatial weights at 500km threshold

**Inversion rationale**: High clustering = low decentralization, so we use `(1 - Moran's I)`

**Example Interpretation**:
- Moran's I = 0.6 → significant clustering → PDI component = 0.4 (40% of max)
- Moran's I = 0.1 → random distribution → PDI component = 0.9 (90% of max)
- Moran's I = -0.1 → slight dispersion → PDI component = 1.1 (capped at 1.0)

**Academic foundation**: Moran (1948), "The Interpretation of Statistical Maps"

#### 2. Effective Number of Locations (ENL) (30% weight) - Entropy-Based Evenness

**What it measures**: How evenly nodes are distributed across geographic cells (not just how many cells)

**Formula**: `ENL = exp(Shannon_Entropy)`

**Why it's essential**:
- Captures distribution evenness, not just location count
- Sensitive to dominance by single location (e.g., 60% in US East Coast)
- Used in biodiversity (Simpson's diversity) and economics (effective number of competitors)
- Complements HHI by using logarithmic rather than quadratic weighting

**Normalization**: `ENL / num_occupied_cells` (ranges 0-1, representing evenness)

**Example**:
- 1000 nodes in 100 cells, perfectly even (10 each) → ENL ≈ 100 → normalized = 1.0
- 1000 nodes in 100 cells, 900 in one cell → ENL ≈ 1.5 → normalized = 0.015

**Why better than raw cell count**: 100 nodes in 10 cells (50 in one) is less decentralized than 100 in 10 cells (10 each), even though both use 10 cells.

**Academic foundation**: Shannon (1948), "A Mathematical Theory of Communication"; Hill (1973), "Diversity and Evenness"

#### 3. Spatial HHI (30% weight) - Market Concentration Applied to Geography

**What it measures**: Herfindahl-Hirschman Index applied to geographic cells (H3 hexagons)

**Formula**: `HHI = Σ(share_i²)` where `share_i = nodes in cell i / total nodes`

**Why it's essential**:
- Standard antitrust/market concentration metric with 70+ years of regulatory use
- Penalizes large geographic dominance through squaring (10% share = 0.01, 50% share = 0.25)
- DOJ/FTC use HHI>0.25 as "highly concentrated" threshold
- Simple, well-understood, defensible in regulatory contexts

**Inversion rationale**: Low HHI = high competition/dispersion = high decentralization

**Example**:
- 100 nodes equally in 4 cells (25 each) → HHI = 4×(0.25²) = 0.25 (FTC threshold)
- 100 nodes with 70 in one cell → HHI ≈ 0.52 (highly concentrated)
- 100 nodes equally in 100 cells → HHI = 0.01 (highly competitive)

**Why H3 hexagons**: Uniform cell area (lat/lon grids distort near poles), hierarchical resolution, industry standard (Uber, Foursquare, DoorDash)

**Academic foundation**: Herfindahl (1950), "Concentration in the Steel Industry"; US DOJ/FTC (2010), "Horizontal Merger Guidelines"

### Why This Three-Component Approach?

Each metric captures a different aspect of geographic distribution:

| Metric | What it detects | Example case |
|--------|-----------------|--------------|
| **Moran's I** | Global clustering patterns | Nodes concentrated in US + Germany (distant but still clustered) |
| **ENL** | Evenness of distribution | 90% of nodes in one city vs evenly spread |
| **Spatial HHI** | Market-style concentration | One metro area dominating network |

Using all three provides robust measurement resistant to gaming and edge cases.

---

## 2. Jurisdictional Diversity Index (JDI)

### Objective

Measure diversity across legal jurisdictions and organizational governance, capturing both country-level concentration and organizational concentration risks.

### Why This Matters

- **Regulatory risk**: Concentration in single jurisdiction enables coordinated shutdowns
- **Legal risk**: Correlated legal frameworks reduce resilience
- **Censorship resistance**: Geographic jurisdiction ≠ legal jurisdiction (AWS worldwide = US legal jurisdiction)
- **Coordinated action**: Fewer distinct legal entities = easier collusion or coercion

### Formula

```python
JDI = 100 × [
    0.5 × Country_Diversity +
    0.3 × Org_Diversity +
    0.2 × (1 - Country_Org_Correlation)  # Bonus for uncorrelated diversity
]
```

### Components

#### 1. Country Diversity (50% weight) - Legal Jurisdiction Spread

**Formula**: `Effective Number of Countries = exp(Shannon_Entropy(country_shares))`

**Geographic overlay**: Weight countries by geographic distance to detect regional clustering
- 50% EU is less diverse than 25% EU + 25% Asia (even if same number of countries)

**Calculation**:
```python
# Step 1: Calculate country shares
country_shares = nodes_per_country / total_nodes

# Step 2: Shannon entropy
entropy = -Σ(p_i * log(p_i))

# Step 3: Effective number
effective_countries = exp(entropy)

# Step 4: Geographic penalty (if regionally clustered)
geographic_factor = (1 - region_concentration_HHI)

# Final score
country_diversity = effective_countries * geographic_factor
```

**Example**:
- 100 nodes: 40 US, 30 Germany, 30 Netherlands
  - Raw effective countries ≈ 2.8
  - But Germany + Netherlands are both EU → regional HHI high
  - Geographic penalty reduces final score to ~2.4

**Why entropy**: Rewards both number of countries AND evenness of distribution

#### 2. Organization Diversity (30% weight) - Hosting Provider Spread

**Formula**: `Effective Number of Organizations = exp(Shannon_Entropy(org_shares))`

**Why it matters**: AWS outage takes down all AWS nodes globally, regardless of country

**Data source**: `org` and `asname` columns from IP geolocation (WHOIS data)

**Example**:
- 100 nodes: 60 AWS, 25 Google Cloud, 10 Hetzner, 5 home ISPs
- Effective orgs ≈ 2.5 (dominated by AWS)
- JDI component score considers this low diversity

#### 3. Country-Org Decorrelation Bonus (20% weight)

**Why**: Ideally, countries and orgs should be independent (uncorrelated)

**Bad example** (correlated):
- All US nodes on AWS
- All German nodes on Hetzner
- Country determines org → low diversity

**Good example** (decorrelated):
- US has mix of AWS/GCP/home
- Germany has different mix
- Country doesn't predict org → high diversity

**Calculation**: `1 - Cramér's V(country, org)` where Cramér's V ∈ [0,1] measures association strength

This bonus rewards true multidimensional diversity where jurisdictional and organizational diversity are orthogonal.

---

## 3. Infrastructure Heterogeneity Index (IHI)

### Objective

Measure diversity of underlying technical infrastructure, with emphasis on cloud provider monopoly risk and geographic infrastructure concentration.

### Why This Matters

- **Systemic failure risk**: Cloud provider outage cascades globally (AWS us-east-1 outages affect services worldwide)
- **Economic pressure**: Providers can change ToS, pricing, or access policies
- **Regulatory capture**: Governments can compel cloud providers to block/censor
- **Geographic infrastructure**: Cloud regions are unevenly distributed globally (infrastructure colonialism)

### Formula

```python
IHI = 100 × [
    0.4 × (1 - Cloud_Provider_HHI) +
    0.3 × Hosting_Type_Diversity +
    0.3 × Infrastructure_Geography_Score
]
```

### Components

#### 1. Cloud Provider HHI (40% weight) - Economic Concentration

**Formula**: `HHI = Σ(provider_share²)` across AWS, GCP, Azure, Hetzner, OVH, home/other

**Thresholds** (DOJ antitrust guidelines):
- HHI < 0.15: competitive market
- HHI 0.15-0.25: moderate concentration
- HHI > 0.25: high concentration (monopoly concerns)

**Inversion**: Low HHI (competitive) → High IHI (decentralized)

**Example**:
- Network A: 45% AWS, 25% GCP, 15% home, 15% others
  - HHI = 0.45² + 0.25² + 0.15² + 0.15² = 0.32 (concentrated)
  - IHI component = (1 - 0.32) × 100 × 0.4 = 27.2 points

#### 2. Hosting Type Diversity (30% weight) - Bare Metal vs Cloud

**Categories**:
1. **Cloud**: AWS, GCP, Azure, DigitalOcean (virtualized, shared control plane)
2. **Dedicated hosting**: Hetzner bare metal, OVH dedicated servers
3. **Home/ISP**: Residential connections, independent ISPs

**Why it matters**:
- Cloud providers share common attack vectors (APIs, control planes, hypervisors)
- Home nodes increase censorship resistance (harder to identify and target)
- Bare metal reduces dependency on cloud platform policies

**Calculation**: `Shannon_Entropy(hosting_type_shares)` normalized

**Target**: Higher entropy when mix includes 20%+ home nodes (Bitcoin's model)

#### 3. Infrastructure Geography Score (30% weight) - Cloud Region Diversity

**Key insight**: "AWS in 5 countries" ≠ truly independent infrastructure

**Method**: Map infrastructure to actual datacenter locations:
- AWS us-east-1 (Virginia, USA)
- AWS eu-west-1 (Ireland)
- GCP europe-west1 (Belgium)
- Hetzner (Falkenstein, Germany)

**Geographic analysis**: Calculate Moran's I on datacenter locations (not node IPs)

**Calculation**:
```python
# Step 1: Map nodes to known datacenter coordinates (when hosting detected)
# Step 2: Calculate Moran's I on datacenter locations
# Step 3: Penalize if datacenters are geographically clustered

infrastructure_geo_score = 1 - morans_i_of_datacenters
```

**Why this matters**: Even if nodes are globally distributed, underlying infrastructure might be clustered (e.g., all in Europe)

---

## Composite GDI Score

### Weighting Rationale

```python
GDI = 0.40 × PDI + 0.35 × JDI + 0.25 × IHI
```

**Justification**:

1. **PDI (40%)** - Physical geography is fundamental
   - Most direct disaster/latency risk
   - Hardest to change quickly (can't move nodes instantly)
   - Affects all other properties (jurisdiction, infrastructure)

2. **JDI (35%)** - Jurisdictional risk is critical
   - Censorship resistance depends on legal diversity
   - Coordinated regulatory action is realistic threat
   - Historical precedent (China crypto ban, etc.)

3. **IHI (25%)** - Infrastructure important but often correlates with geography
   - Cloud regions follow economic geography
   - Provider diversity often implied by geographic diversity
   - Still essential to measure separately

**Network-specific adjustments** (optional):
- Privacy-focused chains (Monero, Zcash): increase JDI to 40%, reduce PDI to 35%
- Performance-critical chains (Solana): increase PDI to 45%, reduce IHI to 20%

---

## Interpretation Scale

### PDI, JDI, IHI (0-100 each)

- **80-100**: Highly decentralized
- **60-80**: Moderately decentralized
- **40-60**: Weakly decentralized
- **20-40**: Centralized
- **0-20**: Highly centralized

### Composite GDI (0-100)

- **70-100**: Strong geographic decentralization
- **50-70**: Moderate geographic decentralization
- **30-50**: Weak geographic decentralization
- **0-30**: Geographically centralized

---

## Data Requirements

**Required fields** (from IP geolocation + node discovery):

- ✅ `lat, lon` → Physical distribution (PDI)
- ✅ `country` → Jurisdictional diversity (JDI)
- ✅ `org, asname` → Infrastructure heterogeneity (IHI)
- ✅ `hosting` flag → Hosting type classification (IHI)
- ✅ `isp` → Home node detection (IHI)

**Data sources**:
- Node discovery: armiarma crawler, Bitnodes, Ethernodes
- GeoIP: MaxMind GeoLite2, IP2Location
- WHOIS: ASN/organization lookup

---

## Validation & Benchmarking

### Expected Results

- **Bitcoin**: High PDI (home miners distributed), high JDI (no corporate concentration), medium IHI (mining pools)
- **Ethereum**: Medium PDI (US/EU clustered), medium JDI, low IHI (AWS heavy)
- **Centralized testnet**: Low across all dimensions

### Sensitivity Testing

1. **Robustness**: Remove top 10% of nodes → GDI should not change drastically
2. **Additive**: Add 100 nodes in new country → should increase JDI proportionally
3. **Simulation**: Model AWS outage → quantify GDI drop
4. **Cross-validation**: Compare with qualitative assessments of network decentralization

---

## Academic Foundation

### Spatial Statistics

- **Moran, P.A.P.** (1948). "The Interpretation of Statistical Maps". *Journal of the Royal Statistical Society*. Foundations of spatial autocorrelation.
- **Anselin, L.** (1995). "Local Indicators of Spatial Association—LISA". *Geographical Analysis*. Local clustering detection.
- **Getis, A. & Ord, J.K.** (1992). "Analysis of Spatial Association". Spatial pattern analysis.
- **O'Sullivan & Unwin** (2010). *Geographic Information Analysis*. Comprehensive GIS statistics textbook.

### Diversity Indices

- **Shannon, C.E.** (1948). "A Mathematical Theory of Communication". *Bell System Technical Journal*. Entropy and information theory.
- **Hill, M.O.** (1973). "Diversity and Evenness". *Ecology*. Effective number interpretation of entropy.
- **Jost, L.** (2006). "Entropy and diversity". *Oikos*. Modern synthesis of diversity measures.

### Economic Concentration

- **Herfindahl, O.C.** (1950). "Concentration in the Steel Industry". HHI origins.
- **US DOJ/FTC** (2010). "Horizontal Merger Guidelines". HHI thresholds for antitrust analysis.
- **Rhoades, S.A.** (1993). "The Herfindahl-Hirschman Index". *Federal Reserve Bulletin*. Market concentration measurement.

### Blockchain Decentralization

- **Kwon, Y. et al.** (2019). "Decentralization in Bitcoin and Ethereum Networks". *Financial Cryptography*. Prior work on measuring decentralization.
- **Gencer, A.E. et al.** (2018). "Decentralization in Bitcoin and Ethereum Networks". *Cornell Tech*. Geographic distribution analysis.
- **Stifter, N. et al.** (2021). "A Holistic Approach to Measuring Blockchain Decentralization". Survey of methodology.

---

## Future Enhancements

### Version 1.1
- **Time-series tracking**: Monitor GDI trends over time, detect centralization events
- **LISA hotspot mapping**: Visualize specific clustering regions with statistical significance
- **Network size adjustment**: Incorporate absolute node count (1000 nodes vs 10 more resilient)

### Version 2.0
- **Scenario analysis**: "What if AWS bans crypto?" impact modeling
- **Cross-chain comparison**: Standardized benchmarking across all major networks
- **Regulatory overlay**: Map jurisdiction risk scores (Freedom House indices, regulatory hostility)
- **Economic security**: Model attack cost based on node distribution
- **Network simulation**: Agent-based models of node distribution evolution

---

## Conclusion

This proposed methodology provides a **rigorous, defensible, multi-dimensional** approach to measuring geographic decentralization with:

✅ **Statistical rigor**: Peer-reviewed spatial statistics (Moran's I, Shannon entropy)
✅ **Economic grounding**: Established market concentration metrics (HHI)
✅ **Geographic awareness**: All three indices incorporate spatial considerations
✅ **Practical implementation**: Uses readily available IP geolocation data
✅ **Interpretability**: Clear 0-100 scale with component breakdowns
✅ **Academic defensibility**: Citations to foundational papers and regulatory standards

The composite GDI score captures what we intuitively mean by "geographic decentralization" while being mathematically precise enough to defend in academic, regulatory, or grant proposal contexts.

---

**For implementation details and demo version**, see [DEMO_IMPLEMENTATION.md](DEMO_IMPLEMENTATION.md).
