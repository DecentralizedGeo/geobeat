# Geographic Decentralization Index (GDI) v0 Methodology

**Status**: v0 Hackathon Implementation
**Networks**: Ethereum, Polygon, Filecoin
**Last Updated**: 2025-11-22

## Executive Summary

The Geographic Decentralization Index (GDI) quantifies how decentralized a blockchain network is across three critical dimensions: **Physical Distribution**, **Jurisdictional Diversity**, and **Infrastructure Heterogeneity**. Each sub-index incorporates geographic considerations to capture different facets of centralization risk.

## Index Architecture

```
GDI (0-100) = weighted_average(PDI, JDI, IHI)

Where:
- PDI: Physical Distribution Index
- JDI: Jurisdictional Diversity Index
- IHI: Infrastructure Heterogeneity Index
```

---

## 1. Physical Distribution Index (PDI)

### Objective
Measure whether nodes are geographically clustered or dispersed across physical space.

### Why This Matters
- **Disaster resilience**: Clustered nodes are vulnerable to regional power outages, natural disasters, or network disruptions
- **Latency**: Geographic spread affects network propagation times
- **Regulatory risk**: Physical concentration makes networks vulnerable to coordinated regulatory action

### Proposed Formula

```python
PDI = normalize_0_100(
    0.4 * (1 - Moran's I_normalized) +  # Anti-clustering (inverse)
    0.3 * ENL_normalized +               # Entropy-based dispersion
    0.3 * (1 - Spatial_HHI)              # Anti-concentration
)
```

### Component Justification

#### 1. **Moran's I** (40% weight) - Global Clustering Detection
- **What it measures**: Spatial autocorrelation - whether nearby locations have similar node densities
- **Range**: -1 (perfect dispersion) to +1 (perfect clustering)
- **Why it's good**:
  - Statistically rigorous (hypothesis testing with p-values)
  - Captures clustering at multiple geographic scales
  - Widely used in spatial epidemiology, ecology, urban planning
- **Inversion rationale**: We want HIGH PDI for LOW clustering, so we use `(1 - Moran's I)`
- **Implementation**: Distance-band spatial weights at 500km threshold

**Example Interpretation**:
- Moran's I = 0.6 → nodes significantly clustered → PDI component = 0.4
- Moran's I = 0.1 → nodes randomly distributed → PDI component = 0.9

#### 2. **Effective Number of Locations (ENL)** (30% weight) - Entropy-Based Evenness
- **What it measures**: How evenly nodes are distributed across geographic cells
- **Formula**: `ENL = exp(Shannon_Entropy)`
- **Why it's good**:
  - Captures distribution evenness, not just count of locations
  - Sensitive to dominance by single location (e.g., 60% in US East Coast)
  - Used in biodiversity (Simpson's diversity) and economics (effective number of competitors)
- **Normalization**: `ENL / num_occupied_cells` (ranges 0-1)

**Example**:
- 100 nodes in 10 cells, perfectly even (10 each) → ENL ≈ 10 → normalized = 1.0
- 100 nodes in 10 cells, 90 in one cell → ENL ≈ 1.5 → normalized = 0.15

#### 3. **Spatial HHI** (30% weight) - Market Concentration
- **What it measures**: Herfindahl-Hirschman Index applied to geographic cells
- **Formula**: `HHI = Σ(share_i²)` where share_i = nodes in cell i / total nodes
- **Why it's good**:
  - Standard antitrust/market concentration metric
  - Penalizes large geographic dominance (squaring)
  - DOJ/FTC use HHI>0.25 as "highly concentrated" threshold
- **Inversion rationale**: We want LOW HHI for HIGH decentralization

**Example**:
- 100 nodes equally in 4 cells (25 each) → HHI = 4×(0.25²) = 0.25
- 100 nodes with 70 in one cell → HHI = 0.70² + ... ≈ 0.52 (bad!)

### Validation: Why Not LISA Alone?

LISA (Local Indicators of Spatial Association) is excellent for **identifying specific hotspot clusters** but less suited as a single index:
- Produces per-location statistics, not a global score
- Requires aggregation logic (what % of nodes are in hotspots?)
- Redundant with Moran's I (LISA is local decomposition of Moran's I)

**Our approach**: Use LISA for visualization/interpretation (show cluster maps) but keep Moran's I for the composite score.

---

## 2. Jurisdictional Diversity Index (JDI)

### Objective
Measure diversity across legal jurisdictions, capturing both **country-level** and **organizational** governance risks.

### Why This Matters
- **Regulatory risk**: Concentration in single jurisdiction enables coordinated shutdowns
- **Legal risk**: Correlated legal frameworks reduce resilience
- **Organizational risk**: Same hosting provider means shared Terms of Service, KYC policies
- **Censorship resistance**: Geographic jurisdiction ≠ legal jurisdiction (e.g., AWS regions worldwide still subject to US law)

### Proposed Formula

```python
JDI = normalize_0_100(
    0.5 * Country_Diversity +
    0.3 * Org_Diversity +
    0.2 * (1 - Country_Org_Correlation)  # Bonus for uncorrelated diversity
)
```

### Component Justification

#### 1. **Country Diversity** (50% weight) - Legal Jurisdiction Spread
- **Formula**: Effective Number of Countries = `exp(Shannon_Entropy(country_shares))`
- **Why geographic overlay**: Weight countries by geographic distance to detect regional clustering
  - Example: 50% EU is less diverse than 25% EU + 25% Asia (even if same # countries)
- **Calculation**:
```python
# Step 1: Calculate country shares
country_shares = nodes_per_country / total_nodes

# Step 2: Shannon entropy
entropy = -Σ(p_i * log(p_i))

# Step 3: Effective number
effective_countries = exp(entropy)

# Step 4: Geographic penalty (if regionally clustered)
geographic_factor = (1 - region_concentration_HHI)

# Final
country_diversity = effective_countries * geographic_factor
```

**Example**:
- 100 nodes: 40 US, 30 Germany, 30 Netherlands
  - Raw effective countries ≈ 2.8
  - But Germany + Netherlands are both EU → regional HHI high
  - Geographic penalty reduces final score

#### 2. **Organization Diversity** (30% weight) - Hosting Provider Spread
- **Formula**: Effective Number of Organizations = `exp(Shannon_Entropy(org_shares))`
- **Why it matters**: AWS outage takes down all AWS nodes globally, regardless of country
- **Data source**: `org` and `asname` columns from IP geolocation
- **Normalization**: Compare to theoretical maximum (num unique orgs)

**Example**:
- 100 nodes: 60 AWS, 25 Google Cloud, 10 Hetzner, 5 home ISPs
- Effective orgs ≈ 2.5 (dominated by AWS)
- JDI component = 2.5 / 4 = 0.625

#### 3. **Country-Org Decorrelation Bonus** (20% weight)
- **Why**: Ideally, countries and orgs should be independent
- **Bad example**: All US nodes on AWS, all German nodes on Hetzner (correlated!)
- **Good example**: US has mix of AWS/GCP/home, Germany has different mix
- **Calculation**: `1 - cramér_V(country, org)` where Cramér's V measures association strength

This bonus rewards true multidimensional diversity.

---

## 3. Infrastructure Heterogeneity Index (IHI)

### Objective
Measure diversity of underlying technical infrastructure, with emphasis on cloud provider monopoly risk and geographic infrastructure concentration.

### Why This Matters
- **Systemic failure risk**: Cloud provider outage cascades globally
- **Economic pressure**: Providers can change ToS, pricing, or access policies
- **Regulatory capture**: Governments can compel cloud providers to block/censor
- **Geographic infrastructure**: Cloud regions are unevenly distributed globally

### Proposed Formula

```python
IHI = normalize_0_100(
    0.4 * (1 - Cloud_Provider_HHI) +
    0.3 * Hosting_Type_Diversity +
    0.3 * Infrastructure_Geography_Score
)
```

### Component Justification

#### 1. **Cloud Provider HHI** (40% weight) - Economic Concentration
- **Formula**: `HHI = Σ(provider_share²)` across AWS, GCP, Azure, Hetzner, OVH, home/other
- **Thresholds** (DOJ guidelines):
  - HHI < 0.15: competitive
  - HHI 0.15-0.25: moderate concentration
  - HHI > 0.25: high concentration
- **Why invert**: We want LOW HHI (competitive) → HIGH IHI

**Example**:
- Ethereum: 45% AWS, 25% GCP, 15% home, 15% others
  - HHI = 0.45² + 0.25² + 0.15² + 0.15² = 0.32 (concentrated)
  - IHI component = (1 - 0.32) = 0.68

#### 2. **Hosting Type Diversity** (30% weight) - Bare Metal vs Cloud
- **Categories**:
  - Cloud (AWS, GCP, Azure, DigitalOcean)
  - Dedicated hosting (Hetzner, OVH bare metal)
  - Home/ISP (residential connections)
- **Why it matters**:
  - Cloud providers share common attack vectors (APIs, control planes)
  - Home nodes increase censorship resistance
  - Bare metal reduces dependency on cloud platforms
- **Calculation**: `Shannon_Entropy(hosting_type_shares)`

**Target**: Higher entropy when mix includes 20%+ home nodes

#### 3. **Infrastructure Geography Score** (30% weight) - Cloud Region Diversity
- **Insight**: "AWS in 5 countries" ≠ truly independent infrastructure
- **Method**: Map infrastructure to actual datacenter locations
  - AWS us-east-1 (Virginia)
  - AWS eu-west-1 (Ireland)
  - GCP europe-west1 (Belgium)
  - Hetzner (Germany)
- **Geographic penalty**: If datacenters are geographically clustered (e.g., all EU), reduce score
- **Calculation**:
```python
# Step 1: Map nodes to known datacenter coords (when hosting=true)
# Step 2: Calculate Moran's I on datacenter locations (not node IPs)
# Step 3: Penalize if datacenters clustered

infrastructure_geo_score = 1 - morans_i_of_datacenters
```

This captures that even if nodes are globally distributed, underlying infrastructure might not be.

---

## Composite GDI Score

### Weighting Rationale

```python
GDI = 0.40 * PDI + 0.35 * JDI + 0.25 * IHI
```

**Justification**:
1. **PDI (40%)**: Physical geography is fundamental - most direct disaster/latency risk
2. **JDI (35%)**: Jurisdictional risk is critical for censorship resistance
3. **IHI (25%)**: Infrastructure is important but often correlates with geography

**Alternative for different network priorities**:
- Privacy-focused chains: increase JDI to 40%
- Performance-critical chains: increase PDI to 50%

---

## Aggregate Statistics (Dashboard Header)

### Proposed Overview Stats

```python
dashboard_stats = {
    "total_nodes": len(nodes),
    "countries": num_unique_countries,
    "continents_distribution": {
        "North America": pct,
        "Europe": pct,
        "Asia": pct,
        "South America": pct,
        "Africa": pct,
        "Oceania": pct
    },
    "top_3_countries": [(country, count, pct)],
    "cloud_share": pct_in_cloud,
    "home_node_share": pct_residential,
    "effective_jurisdictions": effective_num_countries,
    "provider_concentration": cloud_provider_hhi
}
```

### Visualization Priority
1. **Globe/Map**: Node distribution heatmap
2. **Bar Chart**: Nodes per continent (with % labels)
3. **Pie Chart**: Cloud vs Dedicated vs Home
4. **Table**: Top 5 countries with counts

---

## Implementation Notes

### Data Requirements (Already Available!)
From `2025-11-22-ethereum-ips.csv`:
- ✅ `lat, lon` → Physical distribution (PDI)
- ✅ `country, region_name` → Jurisdictional (JDI)
- ✅ `org, asname, isp` → Infrastructure (IHI)
- ✅ `hosting` flag → Hosting type classification

### Calculation Steps

1. **Load & clean data**:
   ```python
   df = pd.read_csv('ethereum-ips.csv')
   df = df.dropna(subset=['lat', 'lon'])
   ```

2. **Calculate PDI**:
   ```python
   analyzer = SpatialAnalyzer(gdf)
   morans = analyzer.morans_i()
   hhi = analyzer.spatial_hhi(resolution=5)
   enl = analyzer.effective_num_locations()

   pdi = 0.4 * (1 - norm(morans.value)) + \
         0.3 * norm(enl.value) + \
         0.3 * (1 - hhi.value)
   ```

3. **Calculate JDI**:
   ```python
   country_entropy = shannon_entropy(country_shares)
   org_entropy = shannon_entropy(org_shares)
   correlation = cramers_v(df['country'], df['org'])

   jdi = 0.5 * norm(exp(country_entropy)) + \
         0.3 * norm(exp(org_entropy)) + \
         0.2 * (1 - correlation)
   ```

4. **Calculate IHI**:
   ```python
   cloud_hhi = herfindahl(provider_shares)
   hosting_entropy = shannon_entropy(hosting_type_shares)
   infra_geo = 1 - morans_i_of_datacenters

   ihi = 0.4 * (1 - cloud_hhi) + \
         0.3 * norm(hosting_entropy) + \
         0.3 * infra_geo
   ```

5. **Compute GDI**:
   ```python
   gdi = 0.40 * pdi + 0.35 * jdi + 0.25 * ihi
   ```

---

## Validation & Benchmarking

### Expected Results
- **Bitcoin**: High PDI (home miners), high JDI (no corporate concentration), medium IHI (mining pools)
- **Ethereum**: Medium PDI (clustered in US/EU), medium JDI, low IHI (AWS heavy)
- **Centralized testnet**: Low across all dimensions

### Sensitivity Testing
- Remove top 10% of nodes → GDI should not change drastically (robustness)
- Add 100 nodes in new country → should increase JDI
- Simulate AWS outage → quantify GDI drop

---

## References & Academic Grounding

### Spatial Statistics
- Anselin, L. (1995). "Local Indicators of Spatial Association" - LISA methodology
- Getis, A. & Ord, J.K. (1992). "Analysis of Spatial Association" - Spatial autocorrelation
- O'Sullivan & Unwin (2010). *Geographic Information Analysis* - Comprehensive GIS stats

### Diversity Indices
- Shannon, C.E. (1948). "A Mathematical Theory of Communication" - Entropy
- Hill, M. (1973). "Diversity and Evenness" - Effective number interpretation
- Jost, L. (2006). "Entropy and diversity" - Modern synthesis

### Economic Concentration
- US DOJ/FTC Horizontal Merger Guidelines (2010) - HHI thresholds
- Rhoades, S.A. (1993). "Herfindahl-Hirschman Index" - Market concentration

### Blockchain Decentralization
- Kwon et al. (2019). "Decentralization in Bitcoin and Ethereum Networks" - Prior work
- Gencer et al. (2018). "Decentralization in Bitcoin and Ethereum" - Cornell study
- Stifter et al. (2021). "Measuring Decentralization" - Methodology survey

---

## Future Enhancements (Post-Hackathon)

1. **Time-series tracking**: Monitor GDI trends over time
2. **LISA hotspot mapping**: Visualize specific clustering regions
3. **Scenario analysis**: "What if AWS bans crypto?" impact modeling
4. **Cross-chain comparison**: Standardized benchmarking
5. **Regulatory overlay**: Map jurisdiction risk scores (Freedom House indices)
6. **Network simulation**: Agent-based models of node distribution evolution

---

## Conclusion

This v0 methodology provides a **defensible, multi-dimensional** approach to measuring geographic decentralization with:

✅ **Statistical rigor**: Established spatial statistics (Moran's I, entropy)
✅ **Economic grounding**: Market concentration metrics (HHI)
✅ **Geographic awareness**: All three indices incorporate spatial considerations
✅ **Practical implementation**: Uses available data fields
✅ **Interpretability**: Clear 0-100 scale with component breakdowns

The composite GDI score captures what we intuitively mean by "geographic decentralization" while being mathematically precise enough to defend in academic or regulatory contexts.
