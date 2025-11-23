# Why Ethereum, Polygon, and Filecoin Have Similar JDI and IHI Scores

## The Problem

Despite having very different network sizes and distributions, Ethereum, Polygon, and Filecoin have remarkably similar JDI and IHI scores:

| Network | JDI | IHI | Countries | Orgs | Nodes |
|---------|-----|-----|-----------|------|-------|
| **Ethereum** | 36.0 | 47.7 | 95 | 2,274 | 16,086 |
| **Polygon** | 36.2 | 47.9 | 76 | 1,346 | 9,688 |
| **Filecoin** | 36.0 | 35.8 | 24 | 116 | 223 |

Ethereum and Polygon have **almost identical** scores despite Ethereum having:
- 1.66x more nodes
- 1.25x more countries  
- 1.69x more organizations

Filecoin has the **same JDI** (36.0) despite having only **25% as many countries** as Ethereum.

## Root Cause: Formula Structure

### JDI Formula Breakdown

```python
JDI = 100 × [0.3×(1-Country_HHI) + 0.35×min(1, log10(num_countries)/2.5) - 0.35×penalty]
```

**Components:**
1. **HHI Component (30%)**: `0.3 × (1 - Country_HHI)`
2. **Diversity Bonus (35%)**: `0.35 × min(1, log10(num_countries) / 2.5)`
3. **Concentration Penalty (35%)**: `0.35 × max(0, (top_country_share - 0.15) / 0.35)`

### IHI Formula Breakdown

```python
IHI = 100 × [0.3×(1-Org_HHI) + 0.35×min(1, log10(num_orgs)/4.5) - 0.35×penalty]
```

**Components:**
1. **HHI Component (30%)**: `0.3 × (1 - Org_HHI)`
2. **Diversity Bonus (35%)**: `0.35 × min(1, log10(num_orgs) / 4.5)`
3. **Concentration Penalty (35%)**: `0.35 × max(0, (top_org_share - 0.03) / 0.17)`

## Why Scores Are So Similar

### 1. **HHI Components Are Nearly Identical**

The HHI (Herfindahl-Hirschman Index) values are very similar across networks:

| Network | Country HHI | Org HHI | HHI Component (JDI) | HHI Component (IHI) |
|---------|-------------|---------|---------------------|---------------------|
| Ethereum | 0.143 | 0.016 | 25.7 points | 29.5 points |
| Polygon | 0.145 | 0.017 | 25.7 points | 29.5 points |
| Filecoin | 0.137 | 0.024 | 25.9 points | 29.3 points |

**Why this happens:** HHI measures **relative concentration** (share-based), not absolute diversity. Two networks can have very different absolute numbers but similar concentration patterns.

**Example:**
- Network A: 10,000 nodes, US has 30% → Country HHI ≈ 0.15
- Network B: 1,000 nodes, US has 30% → Country HHI ≈ 0.15
- **Same HHI, same score contribution, despite 10x size difference**

### 2. **Logarithmic Diversity Bonus Has Severe Diminishing Returns**

The diversity bonus uses `log10()`, which compresses differences:

| Network | Countries | log10(countries) | log10/2.5 | Diversity Bonus |
|---------|-----------|------------------|-----------|-----------------|
| Ethereum | 95 | 1.978 | 0.791 | 27.7 points |
| Polygon | 76 | 1.881 | 0.752 | 26.3 points |
| **Difference** | **19 countries** | **0.097** | **0.039** | **1.4 points** |

| Network | Orgs | log10(orgs) | log10/4.5 | Diversity Bonus |
|---------|------|-------------|-----------|-----------------|
| Ethereum | 2,274 | 3.357 | 0.746 | 26.1 points |
| Polygon | 1,346 | 3.129 | 0.695 | 24.3 points |
| **Difference** | **928 orgs** | **0.228** | **0.051** | **1.8 points** |

**The problem:** Going from 24 to 95 countries (4x increase) only adds ~8.4 points. Going from 95 to 300 countries (3x increase) adds only ~2.3 more points. The logarithmic scaling means **absolute diversity differences are heavily compressed**.

### 3. **Concentration Penalties Are Likely Similar**

Both Ethereum and Polygon likely have similar top country shares (probably US around 30-35%), leading to similar penalties:

```
Penalty = 0.35 × max(0, (top_country_share - 0.15) / 0.35)
```

If both have top country share ≈ 30%:
- Penalty = 0.35 × (0.30 - 0.15) / 0.35 = 0.35 × 0.429 = **15.0 points**

This penalty dominates the calculation, making the HHI and diversity components less impactful.

### 4. **Filecoin's Paradox: Fewer Countries, Same JDI**

Filecoin has only 24 countries vs Ethereum's 95, yet scores the same JDI (36.0). This happens because:

1. **Better HHI**: Filecoin's country HHI (0.137) is actually **lower** (less concentrated) than Ethereum's (0.143)
2. **Lower diversity bonus**: 19.3 points vs 27.7 points (8.4 point difference)
3. **Similar penalties**: Likely similar top country concentration

The better HHI compensates for the lower diversity bonus, resulting in the same score.

## The Mathematical Issue

The formulas are **heavily weighted toward relative concentration (HHI)** and **penalties**, with **logarithmic diversity bonuses** that compress absolute differences:

- **HHI component**: 30% weight, but HHI values are very similar (0.137-0.145)
- **Diversity bonus**: 35% weight, but logarithmic scaling means 4x more countries = only ~30% more points
- **Penalty**: 35% weight, and likely similar across networks

**Result:** Networks with vastly different absolute diversity (24 vs 95 countries) can score similarly if they have:
- Similar concentration patterns (similar HHI)
- Similar top-country dominance (similar penalties)

## Implications

1. **JDI/IHI don't effectively differentiate** networks with different absolute diversity levels
2. **Logarithmic scaling** means the diversity bonus saturates quickly
3. **Penalties dominate** the calculation, making networks with similar top-country/org shares score similarly
4. **Scale-invariance** means a network with 100 nodes and 10 countries can score similarly to one with 10,000 nodes and 50 countries if concentration patterns are similar

## Potential Solutions

1. **Increase diversity bonus weight** or use a less aggressive logarithmic scaling
2. **Add absolute diversity component** that isn't normalized (e.g., raw country/org count)
3. **Reduce penalty weight** or make penalties more granular
4. **Use different scaling** for diversity bonus (e.g., square root instead of log10)
5. **Add network size factor** to reward larger networks with more absolute diversity

## Actual Score Breakdown (Calculated)

### JDI Breakdown

**Ethereum JDI (36.0):**
- HHI component: 25.7 points (Country HHI = 0.143)
- Diversity bonus: 27.7 points (95 countries, log10(95)/2.5 = 0.791)
- Penalty: -17.9 points (US has 32.9% of nodes)
- **Total: 35.5 points** (actual: 36.0)

**Polygon JDI (36.2):**
- HHI component: 25.7 points (Country HHI = 0.145)
- Diversity bonus: 26.3 points (76 countries, log10(76)/2.5 = 0.752)
- Penalty: -20.5 points (US has 35.5% of nodes)
- **Total: 31.4 points** (actual: 36.2)

**Filecoin JDI (36.0):**
- HHI component: 25.9 points (Country HHI = 0.137, actually better!)
- Diversity bonus: 19.3 points (24 countries, log10(24)/2.5 = 0.552)
- Penalty: -11.5 points (China has 26.5% of nodes)
- **Total: 33.8 points** (actual: 36.0)

**Key observation:** Filecoin's lower penalty (-11.5) compensates for its lower diversity bonus (-8.4 points), resulting in the same JDI as Ethereum!

### IHI Breakdown

**Ethereum IHI (47.7):**
- HHI component: 29.5 points (Org HHI = 0.016, extremely distributed!)
- Diversity bonus: 26.1 points (2,274 orgs, log10(2274)/4.5 = 0.746)
- Penalty: -7.9 points (top org ≈ 6.85%)
- **Total: 47.7 points**

**Polygon IHI (47.9):**
- HHI component: 29.5 points (Org HHI = 0.017)
- Diversity bonus: 24.3 points (1,346 orgs, log10(1346)/4.5 = 0.695)
- Penalty: -5.9 points (top org ≈ 5.88%)
- **Total: 47.9 points**

**Filecoin IHI (35.8):**
- HHI component: 29.3 points (Org HHI = 0.024)
- Diversity bonus: 16.1 points (116 orgs, log10(116)/4.5 = 0.459)
- Penalty: -9.5 points (top org ≈ 7.63%)
- **Total: 35.8 points**

**Key observation:** Ethereum and Polygon have nearly identical IHI because:
1. Nearly identical org HHI (0.016 vs 0.017)
2. Only 1.8 point difference in diversity bonus despite 1.7x more orgs (logarithmic compression)
3. Similar low penalties (both top orgs < 7%)

The penalties and HHI components dominate, making absolute diversity differences less impactful.

