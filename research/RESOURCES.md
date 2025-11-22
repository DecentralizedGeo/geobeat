# Geographic Decentralization Research: Core Sources and Reference Materials

This document compiles credible, high-quality research used to inform the study and measurement of geographic decentralization in decentralized networks. Priority is given to peer-reviewed academic work, research from credible technical organizations (Flashbots, Ethereum Foundation, CAIDA, RIPE, IC3), and datasets or codebases that are openly available.

---

## 1. Peer-Reviewed Academic Research

### Foundational empirical measurements

* **Gencer et al. (2018), "Decentralization in Bitcoin and Ethereum"**
  Annual Computer Security Applications Conference (ACSAC).
  Landmark measurement of network distribution, latency, and miner/node centralization.

* **Park et al. (2021), "Understanding the Centralization of Ethereum"**
  Internet Measurement Conference (IMC).
  Examines geographic, ISP, and network-level clustering.

* **Tran et al. (2022), "A Measurement Study of Ethereum’s Nodes"**
  Passive and Active Measurement Conference (PAM).
  Combines active probing with IP/ASN attribution.

### Broader decentralization frameworks

* **Bano et al., "SoK: Consensus in the Age of Blockchains"**
  Systematization of decentralization properties across consensus designs.

* **Miller et al., "The Decentralization Game"**
  Formalizes decentralization metrics, including concentration and collusion models.

### Internet topology and geolocation accuracy

* **Poese et al., "IP Geolocation Databases: Unreliable?"**
  Empirical evaluation of commercial geolocation database accuracy.

* **CAIDA/UCSD papers on AS-level topology and correlated outages**
  Multiple publications; foundational for ISP and ASN inference methods.

* **Research on BGP path diversity and geographic routing analysis**
  IMC and PAM publications, various authors.

---

## 2. Flashbots Research

Flashbots provides some of the most relevant and transparent work on geographic decentralization and correlated infrastructure risk.

### Core materials

* **“Geographic Decentralisation Research Directions”**
  Flashbots Collective Forum.
  High-level framing of research directions, methods, and threat models.

* **“Geographic Decentralization Salon (SBC ’25)”**
  Flashbots Collective Forum.
  Multi-author discussion including active measurement strategies, correlated failure risks, and jurisdictional clustering.

### Related Flashbots analyses

* MEV-Boost relay infrastructure studies
* Blockspace supply chain research
* Failure-domain modeling and regional outage simulations

All materials use open methodology and invite peer review.

---

## 3. Ethereum Foundation and Ethereum Ecosystem Sources

### Measurement-related resources

* Ethereum Foundation Research Forum discussions on validator distribution and staking topology
* EthPandaOps and client teams’ public validator maps (Nimbus, Lighthouse, Prysm)
* Ethernodes historical snapshots (open dataset)
* Independent validator mapping datasets (community-maintained scrapes)

These sources provide operator-level and region-level insights but vary in completeness.

---

## 4. Ecosystem-Specific Decentralization Data

### Solana

* Solana Foundation Validator Health Reports
* Solana Compass node distribution data
* Independent traceroute-based measurements published in community monitoring tools

### Cosmos and IBC networks

* Mintscan / BigDipper validator metadata
* Interchain Foundation and Informal Systems research notes on validator decentralization

### Filecoin

* Starboard SP Explorer datasets
* Filecoin Node Index (FNI)
* Region and provider metadata from open storage-provider registries
  Filecoin provides unusually transparent operator-level data.

---

## 5. Open Datasets and Internet Measurement Tools

### Active measurement platforms

* **RIPE Atlas**
  Global vantage-point network for traceroutes, latency triangulation, and DNS/BGP measurements.

* **CAIDA Ark / Skitter**
  Historic and current internet topology datasets.

### Routing and ASN resources

* **RouteViews**
* **RIPE RIS**
* **BGPKIT**
  All provide openly available BGP dumps and AS-relationship datasets.

### Geolocation and infrastructure attribution

* **MaxMind GeoLite2 (free, coarse)**
* **IP2Location LITE**
* **Censys and Shodan metadata** for cloud and service fingerprinting
* **CloudHunter / Cloud-IP signatures** (community repos)

These form the basis of region, ISP, and cloud-provider inference.

---

## 6. Standards and Frameworks Relevant to Methodology

* **NIST Cybersecurity Framework** (relevant for failure-domain modeling)
* **Internet Society: Internet Resilience and IXP dependency reports**
* **Open Geospatial Consortium (OGC): Provenance and trust frameworks**
* **Energy-grid N-1/N-2 contingency modeling** (analogous to correlated regional failures)
* **Academic literature on supply-chain concentration metrics** (HHI, entropy, effective number of actors)

These frameworks can support the justification of geographic liveness and resilience metrics.

---

## 7. Credible Industry Analyses with Transparent Methods

* CoinMetrics State of Networks (infrastructure distribution sections)
* Chainlink Transparency / Decentralization reports
* Lido community working-group notes on validator diversity
* Messari protocol reports (when based on primary data, not self-reported claims)

These are not peer-reviewed but often contain valuable raw data and methodological reasoning.

---

# Summary of Highest-Value Sources

1. **Flashbots geographic decentralization research threads**
2. **Gencer et al. (2018)** and **Park et al. (2021)**
3. **Tran et al. (2022)**
4. **CAIDA**, **RIPE Atlas**, **RouteViews**, **RIPE RIS** datasets
5. **Solana Foundation**, **Filecoin/SP** data sources
6. **Ethereum node/validator mapping datasets**
7. **Standards frameworks** for correlated failure modeling (NIST, ISOC, OGC)

These sources together provide the empirical, methodological, and theoretical basis for designing a geographically grounded decentralization index.
