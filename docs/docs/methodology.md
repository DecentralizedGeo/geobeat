---
sidebar_position: 2
---

# Geographic Decentralization Index (GDI): A Proposal for a Synthesis Framework

This document proposes a simple, coherent structure for measuring geographic decentralization across decentralized networks. It draws on a large and fragmented research landscape—academic measurements, Flashbots research, open Internet topology datasets, validator telemetry, cloud attribution methods, and jurisdictional analyses—and distills them into three interpretable dimensions. This is a proposal, not a completed framework, and it is intended to evolve through community review and iterative refinement.

The aim is to establish a foundation that is rigorous enough for researchers, operationally meaningful for protocol and infrastructure teams, and understandable for a broader technical audience. We should note, this is aspirational — some of these metrics may be difficult to measure.

---

## 1. Motivation

Existing work on geographic decentralization is extensive but fragmented. There are:

* Empirical measurement techniques (traceroutes, BGP data, ASN mapping, cloud fingerprinting)
* Ecosystem-specific snapshots (Ethereum, Solana, Cosmos, Filecoin, Bitcoin mining maps, etc)
* Exploratory frameworks (Flashbots’ geographic risk discussions)
* Academic taxonomies (decentralization, network topology, correlated failures)
* Industry decentralization reports with selective metrics

These contributions are individually valuable, but they do not form a single, unified evaluative framework. Most attempts to characterize geographic decentralization end up as either:
(a) long lists of metrics without hierarchy, or
(b) highly technical studies without a structured index.

This proposal aims to provide a simple, transparent architecture that “rolls up” the most important dimensions without collapsing the nuance or pretending to solve all open problems.

---

## 2. Design Constraints and Principles

This index faces several unavoidable constraints:

1. **Geolocation inference is probabilistic**: IP-based inference, ASN mapping, cloud detection, and latency triangulation all carry uncertainty. The index must incorporate explicit confidence bounds.

2. **Jurisdiction is not a perfect proxy for legal independence**: Some nation-states share treaties or tightly aligned legal regimes. Any jurisdictional metric must include correlation adjustments.

3. **Infrastructure attribution is incomplete**: Datacenter-level metadata is not always determinable; cloud providers may use ephemeral IP pools. The index must distinguish between high-confidence and low-confidence signals.

4. **Different networks expose different amounts of metadata**: A universal index must accommodate networks with heterogeneous visibility.

To handle these constraints, the index is structured around transparency, minimalism, and versionability. Every choice—metrics, weightings, normalization—needs to be documented and open to critique.

---

## 3. A Three-Pillar Structure

The proposal organizes the problem into three top-level sub-indices that reflect the real-world failure domains relevant to geographic decentralization:

### **A. Physical Distribution Index (PDI)**

Measures the spread of infrastructure across physical space.
Includes entropy across regions, effective number of regions, clustering analysis, and distance-weighted dispersion.

### **B. Jurisdictional Diversity Index (JDI)**

Measures the independence of legal authorities governing infrastructure.
Includes jurisdictional entropy, effective number of jurisdictions, and adjustments for legally aligned blocs.

### **C. Infrastructure Heterogeneity Index (IHI)**

Measures dependency on underlying providers.
Includes cloud concentration (HHI/ENR), ASN/ISP diversity, and detection of colocation patterns.

These three dimensions align with the most important categories of prior work while avoiding overfitting to any one technique. Each encompasses multiple underlying signals, but the top-level structure remains stable and interpretable.

---

## 4. Relationship to Existing Work

The GDI is a synthesis of the landscape, not a replacement for existing research. It integrates:

* Flashbots’ multi-dimensional geographic risk analyses
* Academic measurement methodologies (IP inference, AS modeling, spatial statistics)
* CCAF’s jurisdictional mining models
* Ecosystem telemetry (Solana, Filecoin, Ethereum)
* Internet topology datasets (CAIDA, RIPE)
* Industry decentralization assessments (CoinMetrics, Lido working groups)

However, it also does something new: it introduces a minimal, coherent framework that organizes these contributions into three structural pillars. Prior work provides techniques and observations; GDI provides the architecture for using them systematically.

This is inherently a proposal. It is not presented as the final, definitive model. It is the simplest version that captures what the community has treated—implicitly—as the key dimensions of geographic decentralization.

---

# 5. Open Questions and Areas of Uncertainty

The most important open question is structural:
**Does this index design capture the right dimensions of geographic decentralization, or is there a more accurate or more defensible way to conceptualize the problem?**

This includes examining whether the proposed three-pillar structure (physical, jurisdictional, infrastructural) is the most appropriate abstraction, whether any dimensions are missing, and whether different decompositions might better align with empirical risk or real-world failure modes.

Beyond that foundational concern, several additional uncertainties remain:

1. **Normalization across heterogeneous networks:**
   How should networks of very different size, architecture, and visibility be compared?
   Should normalization occur relative to theoretical maximums, empirical distributions, or some other benchmark?

2. **Geographic taxonomy:**
    What is the appropriate unit of geographic analysis (continents, regions, countries, metros)? Should other domains be considered—such as energy-grid regions, telecom infrastructure zones, or data-sovereignty blocs—if they better reflect real correlated failure modes?

3. **Modeling jurisdictional correlation:**
   What constitutes a legally independent jurisdiction?
   How should treaty blocs, regulatory alliances, and shared enforcement regimes be incorporated?

4. **Accuracy of location inference:**
   How should uncertainty from IP geolocation, cloud fingerprinting, VPN masking, and ASN ambiguity be reflected in the index?
   Should low-confidence signals be downweighted or excluded?

5. **Infrastructure attribution uncertainty:**
   Datacenter-level data is often incomplete.
   How should shared cloud infrastructure, colocation, and overlapping ASNs be treated?

6. **Operator-level information:**
   When operator metadata is available (e.g., Filecoin SPs, Lido operators), should it feed into the index directly, or remain diagnostic?
   How should the index behave for networks without this data?

7. **Composite weighting:**
   Should PDI, JDI, and IHI be equally weighted, or should empirical evidence (e.g., historical failures) justify differential weighting in later versions?

8. **Temporal stability and versioning:**
   What constitutes meaningful change in the index over time, and how should updates be versioned so that the methodology remains transparent and auditable?

These questions reflect uncertainties that cannot be resolved unilaterally.

They require community critique, data contributions, and methodological challenge. The index design is therefore explicitly provisional and open to revision as the research community engages with the framework.

---

## 6. Collaborative Methodology and Next Steps

The GDI is intentionally open. The methodology, data sources, and scoring choices should be transparent and subject to public review. The intention is to:

* publish the full methodology in the open,
* incorporate community feedback,
* iterate on versions (v0, v1, v2),
* encourage independent replication,
* and ultimately converge on a shared standard for geographic decentralization assessment.

The initial version will be deliberately conservative, prioritizing interpretability and methodological honesty over false precision.

For now, we'll coordinate the discussion about methodology, data sources etc here on Github (github.com/DecentralizedGeo/geobeat), and in our [telegram group](https://t.me/+PeM33inLfaM2OThk).

---

## 7. Summary

The Geographic Decentralization Index is proposed as a synthesis framework that integrates the strongest elements of the existing research landscape into a minimal, comprehensible structure focused on three essential dimensions: physical distribution, jurisdictional diversity, and infrastructure heterogeneity. It is constrained by the realities of geolocation uncertainty and heterogeneous network visibility, and it is intentionally open to community shaping.

This is not the final structure, but a starting point for a collaborative, transparent, and evolving methodology.
