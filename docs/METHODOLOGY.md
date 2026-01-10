# Geographic Decentralization Index (GDI): Methodology Proposal

This document proposes a framework for measuring geographic decentralization across decentralized networks. It draws on Flashbots' geographic risk work, academic measurement techniques, Internet topology datasets, and ecosystem telemetry. The goal is to synthesize these approaches into a unified methodology for understanding geographic concentration risks—this v0 is the first step toward that more comprehensive index.

This is a proposal, not a finished standard. It is designed to evolve through community review and iterative refinement.

---

## 0. Why This Matters: Network Resilience

**The goal is network resilience.** Geographic concentration creates fragility. Understanding where that fragility exists is the first step toward addressing it.

Each of the three sub-indices maps to a distinct form of geographic fragility:

- **Physical Distribution (PDI)** → Correlated failures: Regional outages, natural disasters, or network partitions that take out geographically clustered nodes simultaneously
- **Jurisdictional Diversity (JDI)** → Coordinated coercion: Government action compelling validators to censor, comply, or shut down
- **Infrastructure Heterogeneity (IHI)** → Provider dependency: A single cloud provider's policy change or outage affecting a disproportionate share of the network

Decentralization across all three dimensions is necessary (though not sufficient) for resilient networks. A network can be physically distributed but legally concentrated, or jurisdictionally diverse but infrastructure-dependent. The GDI attempts to measure all three.

---

## 1. What This Index Measures

The GDI answers a specific question: **How vulnerable is this network to geographically-correlated failures or coercion?**

This encompasses three distinct threat models:

### Threat 1: Physical/Environmental Correlation
Regional outages, natural disasters, power grid failures, or network partitions that affect geographically clustered nodes simultaneously. If nodes cluster in one city or region, a single event can take out a disproportionate share of the network.

### Threat 2: Infrastructure Dependency
Concentration on specific cloud providers, ISPs, or data centers. A provider policy change (like Hetzner's 2022 ban on blockchain nodes), an outage, or a targeted legal action against a single provider can affect all nodes hosted there.

### Threat 3: Regulatory Coercion
Coordinated government action compelling validators to censor, comply, or shut down. This is arguably the most important threat for censorship resistance—the core value proposition of decentralized networks.

These threats are related but distinct. A network could be physically distributed across many locations but legally concentrated in few jurisdictions, or spread across many countries but hosted primarily on one cloud provider.

---

## 2. Structure: Three Sub-Indices

The index comprises three sub-indices, each scored 0-100 (higher = more decentralized):

### A. Physical Distribution Index (PDI)

**Threat addressed:** Physical/environmental correlation

**What it measures:** How spread out infrastructure is across physical geography—whether nodes cluster in a few physical locations or spread globally.

**Components:**
- Spatial clustering detection (Moran's I statistic)
- Effective number of locations (entropy-based)
- Geographic concentration (spatial HHI across H3 grid cells)

**V0 implementation notes:** Moran's I uses a 500km neighbor threshold; H3 uses resolution 5 (~1220 km² cells); ENL is normalized against a cap of 2000 locations. These are starting points for detecting regional-scale clustering. Sensitivity analysis across different thresholds is needed for future versions.

**Data source:** Latitude/longitude from IP geolocation

**Data quality:** Moderate. IP geolocation is imperfect but provides usable spatial signal for most nodes.

---

### B. Jurisdictional Diversity Index (JDI)

**Threat addressed:** Regulatory coercion

**What it should measure (ideal):** The distribution of legal authority over the humans and entities operating validators. Which governments can subpoena, arrest, or compel the people who actually control the network?

**What v0 actually measures:** The distribution of hardware locations across countries, as a proxy for jurisdictional exposure.

#### The Jurisdictional Risk Stack

True jurisdictional risk involves multiple layers:

1. **Hardware location** — Where data centers physically sit (seizure risk)
2. **Data center operator jurisdiction** — Where hosting companies are incorporated
3. **Validator operator jurisdiction** — Where the entities running validators are registered
4. **Human operator jurisdiction** — Where the actual humans controlling validators reside
5. **Protocol team jurisdiction** — Where core developers can be legally compelled

These layers can diverge significantly. A validator could be:
- Physically located in Singapore
- Hosted on AWS (US-incorporated)
- Operated by a company registered in the Cayman Islands
- Run by a human who lives in Germany

Each layer has different jurisdictional exposure.

#### ⚠️ V0 Limitations — Important Caveat

**We can only measure layer 1 (hardware location) from IP data.** This is a meaningful signal—hardware can be seized, local data center laws apply—but it's an incomplete picture of jurisdictional risk.

The JDI in v0 should be understood as measuring **hardware location diversity**, not true jurisdictional exposure. The name "Jurisdictional Diversity Index" reflects the goal, not the current measurement capability.

**What we cannot measure without additional data:**
- Operator entity incorporation jurisdiction
- Operator human residence
- Regulatory bloc relationships (EU acting as one jurisdiction, Five Eyes cooperation, etc.)
- Rule of law / likelihood of coercion by jurisdiction

**Components (v0):**
- Country-level concentration (HHI)
- Absolute jurisdictional diversity (number of countries)
- Top-country concentration penalty

**Data source:** Country from IP geolocation

**Data quality:** Low-to-moderate as a proxy for true jurisdictional risk. Hardware location is real signal but misses operator jurisdiction.

#### Future JDI Improvements

A more sophisticated JDI would incorporate:
- **Operator jurisdiction data** from liquid staking providers (e.g., Lido operator disclosures), self-reporting, or on-chain identity
- **Regulatory bloc modeling** — treating the EU as partially correlated, accounting for treaty relationships and mutual legal assistance agreements
- **Coercion likelihood weighting** — scaling risk by rule of law indices, press freedom scores, or history of crypto-specific enforcement
- **Multi-layer analysis** — separately scoring hardware jurisdiction, operator jurisdiction, and their correlation

---

### C. Infrastructure Heterogeneity Index (IHI)

**Threat addressed:** Infrastructure dependency

**What it measures:** Diversity of underlying infrastructure providers—whether the network depends heavily on specific cloud providers, hosting companies, or ISPs.

**Components:**
- Organization/provider concentration (HHI)
- Absolute provider diversity (number of distinct orgs)
- Top-provider concentration penalty

**Data source:** Organization/ISP/ASN from IP metadata

**Data quality:** Moderate. IP metadata identifies hosting providers reasonably well, though org names require normalization and some attribution is ambiguous.

---

## 3. Composite Score

The composite GDI is a simple average of the three sub-indices:

```
GDI = (PDI + JDI + IHI) / 3
```

V0 weights all three dimensions equally. Future versions may adjust weights based on threat model or data quality (e.g., weighting JDI lower given its measurement limitations).

**Why no floor cap?** Earlier versions considered capping the composite score when any sub-index fell below critical thresholds. This was removed because:

1. **Sub-index penalties already capture risk** — A network with critical concentration will have a low sub-index score, which mathematically pulls down the average.
2. **Simplicity is defensible** — "GDI = average of three sub-indices" is easy to explain and audit.
3. **Critical flags surface vulnerabilities directly** — Boolean flags (see Section 6) explicitly indicate when thresholds like 33% single-country concentration are crossed.

**Example:** A network with PDI=62.5, JDI=39.1, IHI=63.1 has GDI = 54.9. The low JDI (due to 32% concentration in one country approaching finality risk) already pulls down the average, and the `single_jurisdiction_dominant` flag would trigger if the threshold is crossed.

---

## 3.1 V0 Parameter Choices

The following table summarizes key parameters in the v0 implementation. These are starting points, not empirically calibrated values. Future work should include parameter sweeps and sensitivity analysis to validate or refine these choices.

| Parameter | Value | Rationale | Future Work |
|-----------|-------|-----------|-------------|
| Neighbor distance (Moran's I) | 500km | Regional correlation scale for physical clustering | Sensitivity analysis across distance thresholds |
| H3 resolution | 5 (~1220 km² cells) | Balance between granularity and sparsity | Test resolutions 6-7 for finer patterns |
| ENL normalization cap | 2000 locations | Prevent score compression at high diversity | Empirical calibration against network sizes |
| Sub-index weights | Equal (1:1:1) | Simple, defensible default | Weight by data quality or threat model |
| Concentration thresholds | 33%/50% | BFT consensus theory | Network-specific threshold tuning |

---

## 4. Concentration Thresholds

Sub-index scores incorporate penalties when concentration approaches or exceeds thresholds derived from consensus theory and operational risk.

### Graduated Penalties

To avoid arbitrary scoring cliffs (where 49.5% and 50.5% produce dramatically different scores), penalties **ramp up gradually** as concentration approaches critical thresholds, rather than triggering suddenly when thresholds are crossed.

For example, a network where one country hosts 30% of nodes will already see JDI score degradation, even though the 33% "finality risk" threshold hasn't been crossed yet. This reflects the reality that concentration risk increases continuously, not in discrete jumps.

### Jurisdictional (JDI) Thresholds

| Threshold | Implication | Penalty Behavior |
|-----------|-------------|------------------|
| Top 1 country > 33% | Single jurisdiction could theoretically block finality | Penalty ramps from 25%, caps score at 40 above 33%, further degrades toward 25 as concentration approaches 50% |
| Top 1 country > 50% | Majority control by one jurisdiction | Score capped at 25 |
| Top 2 countries > 50% | Two coordinating governments control majority | Penalty ramps from 40%, caps score at 45 above 50% |

### Infrastructure (IHI) Thresholds

| Threshold | Implication | Penalty Behavior |
|-----------|-------------|------------------|
| Top 1 provider > 25% | Single provider outage affects >25% of network | Penalty ramps from 15%, caps score at 45 above 25% |
| Top 3 providers > 50% | Three providers control majority | Penalty ramps from 35%, caps score at 50 above 50% |

### Why These Numbers?

The 33% and 67% thresholds derive from proof-of-stake consensus mechanics, where 33% of stake can halt finality and 67% is required for finalization. While not all networks use identical consensus rules, these thresholds represent meaningful concentrations of influence in most Byzantine fault-tolerant systems.

**V0 note:** These BFT-derived thresholds are applied as starting points across networks with different consensus models. Future versions may calibrate thresholds per-network based on their specific consensus mechanics. For v0, the BFT thresholds serve as a theory-grounded starting point.

The infrastructure thresholds (25% for single provider, 50% for top 3) reflect operational risk: a single provider controlling a quarter of the network represents a significant single point of failure.

---

## 5. Network Size

Network size (total node count) is **reported but does not affect the GDI score**.

**Rationale:** Decentralization quality should not be conflated with scale. A network with 500 well-distributed nodes is more geographically decentralized than one with 50,000 nodes concentrated in three data centers.

However, size provides important context:
- Very small networks (e.g., <50 nodes) may have scores that are statistically unstable
- Size affects operational robustness independently of geographic distribution

The dashboard displays node count alongside the GDI so users can interpret scores with appropriate context. A GDI of 65 means something different for a 200-node network than for a 20,000-node network.

---

## 6. Critical Flags

In addition to numeric scores, v0 reports boolean flags for critical concentration thresholds.

**Note:** While scoring penalties ramp up gradually (see Section 4), flags use **hard thresholds** to provide clear yes/no signals. A network at 32% single-country concentration will have a degraded JDI score but won't trigger the `single_jurisdiction_dominant` flag until it crosses 33%.

| Flag | Condition | Meaning |
|------|-----------|---------|
| `single_jurisdiction_dominant` | Top 1 country > 33% | One government could theoretically disrupt finality |
| `regulatory_capture_risk` | Top 2 countries > 50% | Two coordinating governments control majority of hardware |
| `infrastructure_spof` | Top 1 provider > 25% | Single provider failure affects >25% of network |

These flags surface critical vulnerabilities even when composite scores might obscure them.

---

## 7. Interpretation Scale

| GDI Score | Interpretation |
|-----------|----------------|
| 70+ | Well decentralized |
| 50-69 | Moderately concentrated |
| 35-49 | Concentrated |
| <35 | Highly concentrated |

These thresholds are calibrated so that **most current networks score in the "concentrated" range**. This is intentional. Geographic concentration is the norm, not the exception, and the index should reflect that reality rather than grade on a curve that makes the status quo look acceptable.

---

## 8. Limitations and Research Roadmap

This section describes what v0 cannot measure and what research is needed to improve future versions. V0 is a starting point, not a destination.

### Measurement Limitations

**All v0 measurements rely on IP-based geolocation inference**, which has known limitations:
- VPNs and proxies can mask true locations
- Anycast addresses may resolve to multiple locations
- IP geolocation databases have variable accuracy by region
- Cloud provider IP pools may not reflect physical infrastructure location

**JDI measures hardware location, not operator jurisdiction.** This is a proxy for regulatory risk, not a direct measurement. See Section 2B for details.

**Country-level aggregation obscures within-country variation.** 100 nodes distributed across Russia's 11 time zones is different from 100 nodes in Singapore, but both count as "one country."

Confidence bounds are **not yet incorporated** into scores. A node geolocated with high confidence is currently weighted the same as one with uncertain attribution.

### Validation Needed

Before this methodology can be considered mature, the following research is needed:

- **Parameter sensitivity analysis:** How do scores change with different distance thresholds, H3 resolutions, or normalization caps?
- **Cross-methodology validation:** How do GDI scores compare to other decentralization metrics (Nakamoto coefficient, Cambridge mining studies, Lido diversity reports)?
- **Confidence bounds:** Can we quantify uncertainty in scores based on geolocation accuracy and measurement completeness?
- **Network-specific calibration:** Should thresholds differ for PoW vs. PoS, or for networks with different BFT assumptions?

### Future Capabilities

**Location proofs:** We are developing infrastructure for multi-factor location proofs combining IP geolocation, network latency triangulation, cryptographic attestations, and hardware-based location claims. These would allow confidence-weighted scoring.

**Operator jurisdiction data:** Integration with liquid staking provider disclosures, self-reported operator data, and on-chain identity systems to measure true jurisdictional exposure.

**Regulatory bloc modeling:** Treating the EU, Five Eyes, and other cooperative jurisdictions as partially correlated for regulatory risk analysis.

**Coercion likelihood weighting:** Incorporating rule of law indices, press freedom scores, or crypto-specific enforcement history into jurisdictional risk assessment.

**Simulation capabilities:** "What if" analysis showing network resilience under various scenarios (regional outage, provider failure, coordinated regulatory action).

---

## 9. Open Questions

The following questions remain open and would benefit from community input:

1. **Geographic taxonomy:** Is country-level the right unit for jurisdictional analysis? How should we model regulatory blocs and treaty relationships?

2. **Operator jurisdiction:** What data sources could provide operator entity or human jurisdiction? How should we weight hardware vs. operator jurisdiction?

3. **Within-country variation:** Should large countries (US, Russia, China) be treated as multiple regions for physical distribution analysis?

4. **Coercion likelihood:** Is it appropriate to weight jurisdictions by rule-of-law or similar indices? What are the risks of such weighting?

5. **Weighting:** Should future versions weight PDI/JDI/IHI differently based on data quality or threat model? What evidence would justify non-equal weights?

---

## 10. Versioning

This methodology is explicitly versioned:

- **v0 (current):** Equal-weighted sub-indices with graduated concentration penalties, critical flags, IP-based inference only, JDI measures hardware location as proxy
- **v1 (planned):** Refined thresholds based on community feedback, potentially confidence-weighted measurements, improved org normalization
- **v2+:** Operator jurisdiction data, regulatory bloc modeling, location proofs, simulation capabilities

Changes to methodology will be documented, and historical scores will remain available under their original methodology version for comparability.

---

## 11. References

### Foundational Research
- Daian, P. et al. (2023). "Decentralized crypto needs you: to be a geographical decentralization maxi." Flashbots Research.
- Gencer, A.E. et al. (2018). "Decentralization in Bitcoin and Ethereum Networks." Cornell Tech.

### Measurement Techniques
- Moran, P.A.P. (1948). "The Interpretation of Statistical Maps."
- Shannon, C.E. (1948). "A Mathematical Theory of Communication."
- Anselin, L. (1995). "Local Indicators of Spatial Association—LISA."

### Data Sources
- MaxMind GeoIP databases
- Uber H3 spatial indexing
- Network-specific crawlers (Ethernodes, Bitnodes, etc.)

### Related Work
- Cambridge Centre for Alternative Finance: Bitcoin mining geographic studies
- Lido: Borderless Ethereum / validator geographic diversity
- Flashbots: Geographic Decentralization Salon @ SBC '25

---

*This methodology is open for community review. Feedback, critique, and contributions welcome via [GitHub](https://github.com/DecentralizedGeo/GEOBEAT) or [Telegram](https://t.me/+PeM33inLfaM2OThk).*