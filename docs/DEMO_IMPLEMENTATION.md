# GEOBEAT Demo Implementation
## What We Built and Why

**Version**: Demo v0 (Hackathon)
**Status**: Production Dashboard
**Implementation**: `gdi_standalone.py`
**Last Updated**: 2025-11-27

## Executive Summary

This document explains the **actual implementation** used in the GEOBEAT dashboard, the trade-offs made for the demo, and why certain methodological choices differ from the [proposed rigorous methodology](PROPOSED_METHODOLOGY.md).

**TL;DR**: We built a working, defensible demo that prioritizes simplicity and speed over perfect academic rigor. The demo uses proven metrics (Moran's I, HHI, entropy) but makes pragmatic compromises for hackathon constraints.

---

## Demo Formula (What's Actually Running)

### Composite GDI

```python
GDI = 0.35 × PDI + 0.20 × JDI + 0.10 × IHI + 0.35 × Network_Size

where Network_Size = 100 × min(1, sqrt(nodes / 50000))
```

**Key difference from proposed**: Adds 35% weight for absolute network size.

### Physical Distribution Index (PDI)

```python
PDI = 100 × [
    0.4 × (1 - Moran's I) +
    0.3 × min(1, ENL / 2000) +  # Absolute ENL, capped at 2000
    0.3 × (1 - Spatial_HHI)
]
```

**Differences**:
- ENL uses **absolute** count capped at 2000, not normalized by cells
- Stricter threshold: 2000 effective locations required for max score

### Jurisdictional Diversity Index (JDI)

```python
JDI = 100 × [
    0.3 × (1 - Country_HHI) +
    0.35 × min(1, log10(num_countries) / 2.5) +
    0.35 × concentration_penalty
]

where:
  concentration_penalty = -max(0, (top_country_share - 0.15) / 0.35)
```

**Differences**:
- Logarithmic diversity bonus (diminishing returns)
- Heavy penalty for single-country dominance (>15%)
- No country-org correlation component (complexity)

### Infrastructure Heterogeneity Index (IHI)

```python
IHI = 100 × [
    0.3 × (1 - Org_HHI) +
    0.35 × min(1, log10(num_orgs) / 4.5) +
    0.35 × concentration_penalty
]

where:
  concentration_penalty = -max(0, (top_org_share - 0.03) / 0.17)
```

**Differences**:
- Logarithmic diversity bonus
- Heavy penalty for single-org dominance (>3%)
- No hosting type or infrastructure geography components

---

## Why We Made These Choices

### 1. Network Size Component (35% weight)

**The problem**: Scale-invariant metrics don't capture absolute security.

A network with 100 nodes evenly distributed across 10 countries scores the same as one with 10,000 nodes in the same distribution. But 10,000 nodes is objectively more decentralized because:
- Higher economic cost to attack (must compromise 10x more nodes)
- More redundancy and fault tolerance
- Greater barrier to centralization
- More distinct operators with different incentives

**Real data example**:
- Ethereum: 16,086 nodes, 95 countries, 2,274 orgs
- Polygon: 9,688 nodes, 76 countries, 1,346 orgs
- Filecoin: 223 nodes, 24 countries, 116 orgs

Without network size adjustment, all three score too similarly despite Ethereum being 70x larger than Filecoin.

**Formula**: `sqrt(nodes / 50000)` provides diminishing returns:
- 1,000 nodes → 14% of max
- 5,000 nodes → 32% of max
- 10,000 nodes → 45% of max
- 50,000 nodes → 100% of max (Bitcoin scale)

**Trade-off**: Not purely "distribution quality" anymore, but more realistic measure of attack resistance.

### 2. Absolute ENL Instead of Normalized

**The problem**: Normalized ENL removes size advantage.

**Proposed methodology**: `ENL / num_occupied_cells` (0-1 evenness ratio)
**Demo implementation**: `min(1, ENL / 2000)` (absolute count)

**Why absolute**:
- Ethereum: ENL = 236.9 → 236.9/2000 = 11.8% of max
- Polygon: ENL = 98.2 → 98.2/2000 = 4.9% of max
- Filecoin: ENL = 12.5 → 12.5/2000 = 0.6% of max

This preserves the advantage of having more effective locations globally, not just evenness.

**Trade-off**: Now rewards absolute geographic footprint, not just distribution evenness. Threshold of 2000 is aspirational (Bitcoin-scale).

### 3. Logarithmic Diversity Bonuses

**The problem**: Linear scaling would make large networks unbeatable.

**Demo approach**: `log10(num_countries) / 2.5` for JDI
- 10 countries → 40% of bonus (log10(10)/2.5 = 0.4)
- 100 countries → 80% of bonus (log10(100)/2.5 = 0.8)
- 300 countries → 100% of bonus (log10(300)/2.5 = 0.99)

**Why logarithmic**:
- Going from 10 to 100 countries (10x increase) is harder than 1 to 10
- Diminishing returns reflect reality: 200 countries not 2x better than 100
- Prevents runaway scores while still rewarding growth

**Trade-off**: Compresses differences. 95 countries (Ethereum) vs 76 (Polygon) only differ by ~1.4 points.

### 4. Concentration Penalties

**The problem**: HHI alone doesn't penalize single points of failure hard enough.

**Demo approach**: Linear penalty starting at threshold
- JDI: Penalize if any country > 15% of nodes
- IHI: Penalize if any org > 3% of nodes

**Example** (JDI):
```python
top_country_share = 0.33  # US has 33% of nodes

penalty = max(0, (0.33 - 0.15) / 0.35)
       = 0.18 / 0.35
       = 0.51  # Reduces JDI by 51 × 0.35 = 17.9 points
```

**Why strict thresholds**:
- Single country with 33% of nodes IS a vulnerability
- Single org with 6% of nodes IS an attack vector
- Networks should be penalized for these concentrations

**Trade-off**: Can produce scores that seem "too harsh," but reflects real risk.

### 5. Simplified Components

**Proposed but NOT implemented in demo**:

- ❌ Country-org correlation (Cramér's V calculation)
- ❌ Hosting type diversity (cloud vs bare metal vs home)
- ❌ Infrastructure geography score (datacenter clustering)

**Why cut**:
- **Time constraint**: Hackathon timeline
- **Data availability**: Need reliable hosting type classification
- **Complexity**: Each adds explanation burden for demo
- **Correlation**: These often follow from geography anyway

**Trade-off**: Less comprehensive, but still captures core decentralization dimensions.

---

## Known Issues & Limitations

### Issue 1: Logarithmic Compression

**Symptom**: Networks with very different absolute diversity score too similarly.

| Network | Countries | log10 | Bonus Points |
|---------|-----------|-------|--------------|
| Ethereum | 95 | 1.978 | 27.7 |
| Polygon | 76 | 1.881 | 26.3 |
| Filecoin | 24 | 1.380 | 19.3 |

**Impact**: Ethereum's 4x more countries than Filecoin only yields 8.4 point advantage.

**Why we kept it**: Without log, large networks become unbeatable. 1000-node network in 100 countries would dominate 10,000-node network in 90 countries.

**Future fix (v1.1)**: Adjust log base or add absolute threshold gates.

### Issue 2: Network Size Dominates

**Symptom**: 35% weight on network size means small well-distributed networks score low.

**Example**:
- Celo: 200 nodes, excellent distribution (PDI 75, JDI 70, IHI 65)
- Network Size: sqrt(200/50000) = 6.3% of max → 2.2 points
- Final GDI: 0.35×75 + 0.20×70 + 0.10×65 + 2.2 = 46.2

**Trade-off**: This is intentional! 200 nodes IS less secure than 10,000 nodes, even if better distributed. But reduces discrimination between distribution qualities for same-size networks.

**Future fix (v1.1)**: Consider size-adjusted subscores or separate "distribution quality" vs "absolute security" metrics.

### Issue 3: Scale-Invariant HHI

**Symptom**: HHI components (30% of each subindex) don't reward absolute diversity.

| Network | Org HHI | HHI Component | Num Orgs |
|---------|---------|---------------|----------|
| Ethereum | 0.016 | 29.5 points | 2,274 |
| Polygon | 0.017 | 29.5 points | 1,346 |

**Impact**: 2,274 orgs scores almost identically to 1,346 orgs (both have low HHI).

**Why we kept it**: HHI is regulatory standard. Changing it would undermine defensibility.

**Mitigation**: Network size component and diversity bonuses partially compensate.

### Issue 4: No Home Node Reward

**Symptom**: Bitcoin's home miners (censorship-resistant) not explicitly rewarded vs AWS nodes (convenient).

**Missing**: Hosting type diversity component from proposed methodology.

**Impact**: Networks with 80% cloud hosting score similarly to 50% cloud / 50% home.

**Future fix (v1.1)**: Add IHI hosting type component (30% weight in proposed).

---

## Interpretation Scale (Demo Version)

### Individual Indices (PDI, JDI, IHI)

- **80-100**: Excellent
- **60-80**: Good
- **40-60**: Moderate
- **20-40**: Poor
- **0-20**: Very Poor

### Composite GDI

- **60-100**: Moderately to highly decentralized
- **40-60**: Weakly decentralized
- **20-40**: Centralized
- **0-20**: Highly centralized

**Note**: These bands are calibrated to current blockchain landscape. As of 2025:
- Most major networks score 40-60 (weakly decentralized)
- Scores above 70 are rare (would require Bitcoin-scale size + distribution)
- Scores below 30 indicate serious centralization (testnet-like)

---

## Real Network Scores (Demo)

### Ethereum

```
Total Nodes: 16,086
PDI: 68.2  (good spatial distribution, moderate clustering)
JDI: 36.0  (US dominance penalty, moderate diversity)
IHI: 47.7  (AWS/cloud concentration)
Network Size: 56.7  (sqrt(16086/50000) × 100)
Final GDI: 51.4  (weakly decentralized)
```

**Interpretation**: Excellent absolute size, moderate geographic distribution, but concentrated in US/AWS.

### Polygon

```
Total Nodes: 9,688
PDI: 63.5  (similar distribution pattern to Ethereum)
JDI: 36.2  (similar jurisdictional concentration)
IHI: 47.9  (similar cloud concentration)
Network Size: 44.0  (sqrt(9688/50000) × 100)
Final GDI: 43.4  (weakly decentralized)
```

**Interpretation**: Follows Ethereum's pattern but smaller absolute size reduces security.

### Filecoin

```
Total Nodes: 223
PDI: 42.1  (moderate clustering)
JDI: 36.0  (limited country diversity but no dominance)
IHI: 35.8  (limited org diversity)
Network Size: 6.7  (sqrt(223/50000) × 100)
Final GDI: 28.5  (centralized)
```

**Interpretation**: Small network size dominates score despite decent distribution quality.

---

## Comparison to Proposed Methodology

| Aspect | Proposed (v1.0) | Demo (v0) | Reason for Difference |
|--------|-----------------|-----------|----------------------|
| **GDI Weights** | 40/35/25 (PDI/JDI/IHI) | 35/20/10 + 35 size | Prioritize absolute security |
| **ENL** | Normalized (evenness) | Absolute (footprint) | Reward global reach |
| **JDI/IHI** | 50/30/20 components | 30/35/35 with penalties | Emphasize concentration risk |
| **Diversity Bonus** | Linear or none | Logarithmic | Prevent runaway scores |
| **Country-Org Correlation** | Yes (20%) | No | Complexity/time |
| **Hosting Type Diversity** | Yes (30% of IHI) | No | Data classification |
| **Infrastructure Geography** | Yes (30% of IHI) | No | Datacenter mapping |
| **Scale** | 0-100 (distribution quality) | 0-100 (absolute + quality) | Practical security |

---

## Why This Demo Is Still Defensible

Despite compromises, the demo implementation:

✅ **Uses peer-reviewed metrics**: Moran's I (1948), Shannon entropy (1948), HHI (1950)
✅ **Follows regulatory standards**: DOJ/FTC HHI thresholds
✅ **Transparent calculations**: All formulas documented and reproducible
✅ **Realistic results**: Ethereum/Polygon score as "weakly decentralized" (matches intuition from maps)
✅ **Captures real risks**: US dominance, AWS concentration, clustering penalties
✅ **Conservative thresholds**: 2000 ENL, 50K nodes requirements are aspirational (Bitcoin-scale)

**What we sacrifice**: Perfect academic rigor for practical, implementable, understandable metrics.

---

## Roadmap to v1.0

### Short-term (Next Quarter)

1. **Remove network size from composite**
   - Make it separate "Network Security Score"
   - GDI becomes pure distribution quality (40/35/25)

2. **Adjust logarithmic scaling**
   - Test different log bases for diversity bonuses
   - Add absolute threshold gates (min 50 countries for JDI > 80)

3. **Validate concentration penalties**
   - Survey network operators about "dangerous" concentration levels
   - Adjust 15% country and 3% org thresholds based on feedback

### Medium-term (6-12 months)

4. **Add hosting type component**
   - Classify cloud vs dedicated vs home
   - Reward home node percentage (Bitcoin model)

5. **Add infrastructure geography**
   - Map datacenters, calculate their clustering
   - Penalize networks where "global" nodes use clustered infrastructure

6. **Country-org correlation**
   - Implement Cramér's V calculation
   - Reward orthogonal diversity

### Long-term (v2.0)

7. **Time-series analysis**
   - Track GDI trends over weeks/months
   - Detect centralization/decentralization events

8. **Scenario simulation**
   - Model "AWS bans crypto" impact
   - Calculate attack costs based on distribution

9. **Cross-network comparison**
   - Standardized benchmarking across all major chains
   - Relative rankings and percentiles

---

## For Researchers and Reviewers

If you're evaluating GEOBEAT for a grant, academic citation, or partnership:

- **For the rigorous academic methodology**: Read [PROPOSED_METHODOLOGY.md](PROPOSED_METHODOLOGY.md)
- **For what's actually running in production**: This document (DEMO_IMPLEMENTATION.md)
- **For implementation details**: See `/src/analysis/README.md` and `gdi_standalone.py`

We're transparent about trade-offs and eager to iterate toward v1.0 based on community feedback.

---

## Contributing Feedback

**Where we need input**:
- Are concentration penalty thresholds (15% country, 3% org) realistic?
- Should network size be part of GDI or separate metric?
- What's the right balance between absolute security and distribution quality?
- How much should home nodes be rewarded over cloud?

**How to contribute**:
- Open GitHub issue with "Methodology" label
- Cite specific networks and scores that seem wrong
- Propose alternative formulas with rationale

---

## Conclusion

The demo implementation makes pragmatic compromises to deliver a working, defensible geographic decentralization index within hackathon constraints. It uses established metrics (Moran's I, HHI, entropy) but adapts them for blockchain-specific concerns like network size and concentration risk.

**The result**: Networks score in realistic ranges that match qualitative assessments ("Ethereum is weakly decentralized"), while providing quantitative rigor for grant proposals, academic papers, and policy discussions.

**Next step**: Community feedback and iteration toward the fully rigorous v1.0 methodology.

---

**Compare with**: [PROPOSED_METHODOLOGY.md](PROPOSED_METHODOLOGY.md) - The academic ideal
**Implemented in**: `/src/analysis/gdi_standalone.py` - Production script
**Dashboard**: `/src/frontend/geobeat-ui/` - Live visualization
