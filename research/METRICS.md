# **Core Metrics**

## **1. Herfindahl–Hirschman Index (HHI)**

**What it is:** A concentration index (sum of squared shares).
**What it measures:** *Dominance* by a small number of regions/clouds.
**Strength:** Simple, interpretable.
**Weakness:** Sensitive to small changes; punishes large players but not geographic clustering within them.

---

## **2. Gini Coefficient**

**What it is:** Inequality metric (Lorenz-curve–based).
**What it measures:** *Distribution equality* of nodes across regions/countries/clouds.
**Strength:** Good for comparing networks.
**Weakness:** Doesn’t understand hierarchy (e.g., 10 nodes in 10 cities *in one state* still looks equal).

---

## **3. Shannon Entropy / Shannon Index**

**What it is:** Information-theoretic diversity score.
**What it measures:** *Uncertainty* in predicting where a node is located.
**Strength:** Good for category-rich distributions.
**Weakness:** Harder to explain to non-technical readers.

---

# **Blockchain-Specific / Protocol-Specific Metrics**

## **4. “Liveness Index” / Fault Tolerance Diversity**

**What it is:** Measures how many regions can fail before consensus halts.
**What it measures:** *Geographic resilience to correlated outages*.
**Strength:** Maps directly to BFT assumptions.
**Weakness:** Requires operator/entity-level data, not just node IPs.

---

## **5. Geographic Decentralization Coefficient (GDC)**

**What it is:** A composite or weighted index capturing geographic distribution (clouds, countries, lat/long clustering).
**What it measures:** *Holistic spread* with weights for geography, jurisdiction, infra type.
**Strength:** Flexible, customizable.
**Weakness:** Easy to hide subjective choices inside weights.

---

# **Less Common but Extremely Useful Metrics**

## **6. Effective Number of Regions / ENR**

**What it is:** 1 / Σ(pᵢ²) — the “true number” of equivalent regions.
**What it measures:** *How many meaningful regions exist*, accounting for unevenness.
**Strength:** Simple.
**Weakness:** Needs well-defined region taxonomy.

---

## **7. Spatial Autocorrelation (Moran’s I)**

**What it is:** Measures clustering in geographic space.
**What it measures:** *Spatial clustering* vs *dispersal*.
**Strength:** Real geography, not just category labels.
**Weakness:** Harder to calculate; may overfit noisy inference.

---

## **8. Inverse Distance Weighted Dispersion**

**What it is:** Sum of (1 / distance between nodes) normalized.
**What it measures:** Whether nodes are physically *close* or *spread apart*.
**Strength:** Captures true spatial decentralization.
**Weakness:** Sensitive to inference errors.

---

## **9. Jurisdictional Diversity Score**

**What it is:** Count of independent legal systems weighted by node share.
**What it measures:** *Regulatory risk correlation*.
**Strength:** Directly maps to censorship, seizures, sanctions.
**Weakness:** Requires mapping IP → legal systems (messy).

---

## **10. Cloud/ISP Dependency Index**

**What it is:** Share of nodes controlled by each provider (AWS, GCP, Hetzner, OVH).
**What it measures:** *Infrastructure single points of failure*.
**Strength:** High signal.
**Weakness:** Needs reliable cloud fingerprinting.

---

# **Systemic-Risk & Fragility Metrics**

## **11. “Single-Region Failure Impact” (SRFI)**

**What it is:** % of block production lost if a region goes dark.
**What it measures:** *Blast radius* of outages.
**Strength:** Very intuitive.
**Weakness:** Requires operator-level mapping or validator performance data.

---

## **12. Scenario-Based Resilience Score**

**What it is:** Simulated stress scenarios (e.g., EU blackout, AWS outage).
**What it measures:** *Systemic robustness*.
**Strength:** Narrative + quantification.
**Weakness:** Scenarios require assumptions.

---

## **13. Correlation Index**

**What it is:** Measures how many nodes depend on correlated infrastructure (same ASN, same national grid, same cloud region).
**What it measures:** *Infrastructure homogeneity risk*.
**Strength:** Very relevant for real-world outages.
**Weakness:** Hard to communicate.

---

# **Network-Topology–Inspired Metrics**

## **14. Betweenness Centrality (Geographic)**

Adapt topological metrics to geography.
**What it measures:** *Geographic chokepoints* in routing or node connectivity.

---

## **15. “Shortest Path Diversity” (Geographic Routing Diversity)**

How many countries/ISPs are on the typical routing path?
**Measures:** *Exposure to interception or filtering*.

---

## **16. Regional Majority Penalty**

If one region >33% or >50%, apply escalating penalty.
**Measures:** Practical BFT risk thresholds.

---

# **Socio-Political Dimensions**

## **17. Freedom/Resilience Overlay**

Weight nodes based on:

* Press freedom
* Rule of law
* Internet shutdown history
* State-level DNS manipulation

Useful but possibly contentious.

---

# **18. “Regulatory Correlation Index”**

Share of nodes under jurisdictions with **mutual legal assistance treaties** or harmonized regulations.

Measures: *Correlated seizure/censor risk*.

---

# **19. Temporal Stability / Churn Index**

Are nodes consistently in the same regions or jumping around?
Measures churn-driven fragility.

---

# **20. Diversity Gradient Over Time**

Trend metric to capture whether a network is creeping toward centralization or decentralizing.

---

# **What People Rarely Use but Should**

## **21. “Effective Anti-Collocation” Score**

Do many nodes share the *same building*, rack, or IP prefix?
Measures “fake decentralization.”

---

## **22. “Lat/Long Spread Index”**

Quantifies how physically dispersed the network is (km² coverage).

---

# **23. “Jurisdictional Entropy”**

Shannon entropy but applied to legal systems (not geography).

---

## **24. “Regional Capture Probability”**

Probability that a single government action stalls the network.

---

# **25. “Geographic Sybil Risk Score”**

Identify suspicious clusters of nodes in improbable regions.
