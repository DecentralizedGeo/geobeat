# Best Practices for Blockchain Data Source Reconnaissance and Cataloging

> **⚠️ METHODOLOGY REFERENCE**
> This is a **reference guide** created to support data source reconnaissance (Issue #1).
> It contains **methodology and best practices**, NOT actual research findings.
> For actual data source evaluations, see `../INVENTORY.md` (to be created).

**Date Created:** 2025-11-22
**Purpose:** Guide for evaluating blockchain datasets with node geographic information

---

This document compiles industry best practices for evaluating, documenting, and cataloging blockchain node explorer APIs and datasets, with a focus on geographic decentralization analysis.

---

## Table of Contents

1. [Dataset Inventory Structure](#dataset-inventory-structure)
2. [Evaluating Node Explorer APIs](#evaluating-node-explorer-apis)
3. [Geographic Decentralization Measurement Standards](#geographic-decentralization-measurement-standards)
4. [GeoIP Data Usage and Limitations](#geoip-data-usage-and-limitations)
5. [Common Pitfalls in Blockchain Data Evaluation](#common-pitfalls-in-blockchain-data-evaluation)
6. [Licensing and Terms of Service Red Flags](#licensing-and-terms-of-service-red-flags)
7. [Tools and Frameworks for Data Cataloging](#tools-and-frameworks-for-data-cataloging)
8. [Comparative Analysis Best Practices](#comparative-analysis-best-practices)
9. [Examples from Well-Structured Projects](#examples-from-well-structured-projects)

---

## 1. Dataset Inventory Structure

### 1.1 Core Metadata Fields (Required)

Based on research data management best practices and the Data Provenance Initiative, every dataset entry should include:

#### **Identifier Information**
- **Name**: Unique, descriptive dataset name
- **URL(s)**: Primary access point(s) - GitHub, API endpoint, data repository, etc.
- **DOI/Persistent Identifier**: If available (e.g., Zenodo DOI, ArXiv ID)
- **Version**: Dataset version or snapshot date
- **Networks Covered**: Specific blockchain networks (e.g., Ethereum, Bitcoin, Filecoin)

#### **Data Characteristics**
- **Data Type**:
  - Static dataset (CSV/JSON/Parquet/HDF5)
  - REST API
  - GraphQL API
  - WebSocket/streaming
  - Code-only (crawler framework)
  - Explorer-only (visualization, no raw data)
- **Format Details**: File formats, schema references, compression type
- **Size Metrics**: Record count, file size, time span covered
- **Update Frequency**: Real-time, hourly, daily, weekly, static snapshot

#### **Node-Level Signals Available**
- **IP Addresses**: Yes/No/Partial (e.g., hashed, truncated)
- **Geographic Fields**:
  - Country codes (ISO 3166-1)
  - Region/State
  - City
  - Latitude/Longitude
  - Accuracy radius (if provided)
- **Network Infrastructure**:
  - ASN (Autonomous System Number)
  - ISP/Hosting provider
  - Cloud provider attribution
  - IPv4 vs IPv6 distribution
- **Node Metadata**:
  - Client version
  - Protocol version
  - Peer count
  - Uptime/availability metrics

#### **Temporal Characteristics**
- **Type**: Snapshot, time series, continuous/streaming
- **Time Range**: Start and end dates of data collection
- **Last Updated**: Most recent data point or crawl timestamp
- **Temporal Resolution**: Granularity of time-series data
- **Staleness Assessment**: How current is the data for analysis purposes?

#### **Data Provenance**
- **Collection Method**:
  - Active crawling (P2P discovery messages)
  - Passive monitoring
  - Internet-wide scanning
  - Self-reporting/telemetry
  - Aggregated from third-party APIs
- **Vantage Points**: Number and location of measurement infrastructure
- **Data Source Attribution**: If dataset derives from or depends on other sources
- **Creator/Maintainer**: Organization or individual responsible
- **Publication/Release Date**: When dataset was made public

#### **Licensing and Access**
- **License**: Specific license type (MIT, CC-BY-4.0, CC0, GPL, proprietary, etc.)
- **License Restrictions**:
  - Commercial use allowed?
  - Attribution required?
  - Share-alike required?
  - Non-commercial only?
- **Terms of Service**: API rate limits, acceptable use policies
- **Access Requirements**: Registration, API keys, institutional access
- **Redistribution Rights**: Can derived datasets be shared?

#### **Quality and Limitations**
- **Known Biases**:
  - Single vantage point
  - Only reachable/public nodes
  - NAT/firewall-hidden nodes excluded
  - Client diversity bias
  - Geographic coverage gaps
- **Accuracy Estimates**: If provided by source
- **Validation Methods**: How data quality is assessed
- **Missing Data**: Known gaps or incomplete coverage

#### **Relevance Assessment**
- **Use Case Fit**: How well this matches project needs
- **Priority Level**: High/Medium/Low for current phase
- **Integration Complexity**: Estimated effort to incorporate
- **Dependencies**: Required tools, libraries, or other datasets

### 1.2 Recommended Metadata Standards

#### For General Research Projects
- **Dublin Core**: 15 core elements for resource description (creator, title, date, coverage, etc.)
- **DataCite Metadata Schema**: For dataset citation and discovery
- **DCAT (Data Catalog Vocabulary)**: W3C standard for dataset catalogs

#### For Geospatial Data
- **ISO 19115**: Geographic information metadata standard
- **FGDC-CSDGM**: Federal Geographic Data Committee metadata standard

#### For Provenance Tracking
- **PROV-DM (W3C Provenance Data Model)**: Standard for provenance representation
- **Data Provenance Initiative format**: JSON-based provenance cards with structured attribution

### 1.3 Documentation Format Recommendations

Use structured formats that support:
- **Machine readability**: JSON, YAML, or CSV for programmatic access
- **Human readability**: Markdown documentation with clear tables
- **Version control**: Git-trackable plain text formats
- **FAIR principles**: Findable, Accessible, Interoperable, Reusable

**Example Structure:**
```
data/
├── inventory/
│   ├── sources.json          # Machine-readable catalog
│   ├── sources.csv           # Spreadsheet-compatible view
│   └── README.md             # Human-readable documentation
├── schemas/
│   ├── source_schema.json    # JSON Schema for validation
│   └── field_definitions.md  # Field documentation
└── assessments/
    ├── quality_reports/      # Per-source quality assessments
    └── comparison_matrix.md  # Cross-source comparisons
```

---

## 2. Evaluating Node Explorer APIs

### 2.1 Technical Evaluation Criteria

#### **Performance Metrics**
- **Response Time**: Should deliver query responses in under 100ms for basic queries
- **Rate Limits**: Document requests per second/minute/day
- **Pagination**: Support for large result sets
- **Timeout Handling**: Graceful degradation under load
- **Caching Strategy**: Whether data is cached and cache freshness

#### **API Design Quality**
- **Documentation**:
  - Comprehensive API reference with examples
  - Authentication flow clearly explained
  - Error response codes documented
  - Changelog for versioning
- **RESTful Design**: Proper HTTP verbs, status codes, resource naming
- **Consistency**: Predictable patterns across endpoints
- **Versioning**: API version strategy (URL path, header, etc.)

#### **Data Quality**
- **Completeness**: What percentage of network nodes are captured?
- **Accuracy**: How accurate is geographic/network data?
- **Freshness**: Data update frequency and staleness indicators
- **Consistency**: Data validation and quality checks in place

#### **Reliability**
- **Uptime**: Historical availability (check status page if available)
- **SLA**: Service level agreements or guarantees
- **Error Handling**: Retry logic, exponential backoff support
- **Maintenance Windows**: Scheduled downtime communication

### 2.2 Blockchain-Specific Considerations

#### **Node Coverage Methodology**
- **Discovery Protocol**: How does the API discover nodes?
  - Bitcoin: `getaddr` messages
  - Ethereum: DevP2P discovery, DHT crawling
  - Libp2p-based: Kademlia DHT `FIND_NODE`
- **Reachability Testing**: How are nodes verified as active?
  - TCP handshakes
  - Protocol-specific ping/pong
  - Recent block propagation
- **Measurement Frequency**: How often is the network crawled?

#### **Geographic Attribution**
- **GeoIP Provider**: Which service (MaxMind, IP2Location, IPinfo, etc.)?
- **Database Version**: How current is the GeoIP database?
- **Accuracy Claims**: Does the API provide accuracy radius or confidence scores?
- **VPN/Proxy Detection**: Are proxied nodes flagged or excluded?

#### **Network Layer Details**
- **IPv4 vs IPv6**: Separate coverage statistics
- **ASN Mapping**: Source for autonomous system data (CAIDA, RIPE, etc.)
- **Cloud Detection**: Methodology for identifying cloud providers
- **NAT Transparency**: How are NAT-ed nodes handled?

### 2.3 API Evaluation Checklist

- [ ] API documentation exists and is comprehensive
- [ ] Example code/requests provided
- [ ] Authentication method clearly documented
- [ ] Rate limits explicitly stated
- [ ] Response schemas documented (OpenAPI/Swagger ideal)
- [ ] Error codes and messages documented
- [ ] Versioning strategy in place
- [ ] Historical data accessible (not just current state)
- [ ] Bulk export options available
- [ ] WebSocket/streaming for real-time updates (if applicable)
- [ ] Geographic data includes source attribution
- [ ] Metadata about data freshness included in responses
- [ ] Support channels or issue tracker available
- [ ] Terms of service reviewed for research use
- [ ] Commercial use restrictions understood

---

## 3. Geographic Decentralization Measurement Standards

### 3.1 Key Metrics from Academic Literature

Based on recent research (particularly "Multiple Sides of 36 Coins: Measuring Peer-to-Peer Infrastructure", 2025):

#### **Country-Level Distribution**
- **Metric**: Percentage of nodes per country
- **Concentration Indicator**: Top N countries hosting X% of nodes
  - Example: "Top 9 countries host 80% of Bitcoin nodes"
  - "United States and Germany account for over 50% of nodes"
- **Visualization**: Choropleth maps, bar charts of top countries
- **Standard**: Report at minimum top 10 countries with percentages

#### **Autonomous System (AS) Concentration**
- **Metric**: Herfindahl-Hirschman Index (HHI) across ASNs
  - Formula: HHI = Σ(market_share_i)²
  - Range: 0 (perfect distribution) to 10,000 (monopoly)
  - Bitcoin benchmark: HHI ≈ 0.001 (highly distributed)
  - Centralized networks: HHI > 0.15
- **Interpretation**:
  - HHI < 0.01: Unconcentrated
  - 0.01 ≤ HHI < 0.15: Moderate concentration
  - HHI ≥ 0.15: High concentration
- **Additional Metrics**:
  - Top-K ASN concentration (e.g., top 10 ASNs host X% of nodes)
  - Gini coefficient for ASN distribution

#### **Cloud Provider Concentration**
- **Metric**: Percentage of nodes on major cloud providers (AWS, GCP, Azure, etc.)
- **Risk Assessment**: Single-provider failure domain analysis
- **Benchmark**: Track trends over time; compare across networks

#### **Regional/Continental Distribution**
- **Metric**: Nodes by continent or UN geographic regions
- **Diversity Scores**: Shannon entropy, Simpson's diversity index
- **Geopolitical Analysis**: Jurisdiction diversity (out of scope for v0, but document)

### 3.2 Measurement Methodology Standards

#### **Active Crawling Best Practices**
From "Multiple Sides of 36 Coins" research:

1. **Infrastructure Setup**:
   - Use geographically distributed crawlers (minimize single-vantage bias)
   - Example: 15 active crawlers on cloud infrastructure
   - Document crawler locations

2. **Crawl Scheduling**:
   - DHT-based networks: Hourly crawls
   - Bitcoin-like networks: Daily crawls
   - Ethereum: Every 4-6 hours for adequate coverage
   - Stagger crawls to avoid network disruption

3. **Connectivity Verification**:
   - Node is "active" if responds within 24-hour window
   - Use protocol-specific liveness checks
   - TCP ping + protocol handshake
   - Document timeout thresholds

4. **Peer Discovery**:
   - Query peers using network-specific discovery messages
   - Bitcoin: `getaddr`
   - DHT networks: `FIND_NODE`
   - Ethereum: DevP2P `FindNode`
   - Recursively crawl peer tables

5. **Internet-Wide Scanning** (complementary):
   - Full IPv4 address space scans with protocol-specific payloads
   - Validate against ground-truth crawler data
   - Use for networks where active crawling is difficult

#### **Geographic Mapping Standards**
1. **GeoIP Resolution**:
   - Use recent GeoIP databases (< 3 months old)
   - Document provider and version
   - Provide accuracy radius when available
   - Handle missing/unknown locations explicitly

2. **ASN Mapping**:
   - Use authoritative sources: CAIDA, RIPE RIS, RouteViews
   - Update regularly (monthly minimum)
   - Cross-reference multiple BGP data sources

3. **Cloud Detection**:
   - Use traffic fingerprinting or WHOIS data
   - Maintain updated cloud IP range databases
   - Cross-check with ASN ownership

### 3.3 Data Quality Indicators to Report

For transparency and reproducibility:

- **Coverage Estimate**: % of actual network captured
  - "Lower bound" acknowledgment (NAT/firewall nodes excluded)
  - Comparison to other measurement sources
- **Temporal Stability**: Node churn characteristics
  - % of nodes appearing in consecutive crawls
  - Median node uptime
- **IPv4 vs IPv6**: Separate statistics
- **Unreachable Nodes**: Count and methodology for handling
- **Self-Reported vs Discovered**: If applicable

---

## 4. GeoIP Data Usage and Limitations

### 4.1 Accuracy Expectations (MaxMind GeoIP2 benchmarks)

#### **Country-Level**
- **Accuracy**: 99.8% (very reliable)
- **Use case**: Broad geographic distribution analysis
- **Limitations**: Minimal at this granularity

#### **State/Region-Level**
- **Accuracy**: ~80% for U.S. IP addresses
- **Variability**: Lower in other countries
- **Limitations**: Rural areas, mobile networks

#### **City-Level**
- **Accuracy**: 66% within 50km radius
- **Accuracy Radius**: Ranges from few km to 1000km
- **Limitations**:
  - Cannot identify specific households or street addresses
  - Rural areas often misattributed to nearest city hub
  - ISPs route through centralized infrastructure

#### **Precision Statement** (from MaxMind):
> "GeoIP2 geolocation data is never precise enough to identify or locate a specific household, individual, or street address."

### 4.2 Known Limitations and Biases

#### **Technology-Specific Challenges**

1. **Mobile Networks**:
   - IP addresses may be used across large distances
   - Centralized routing hubs misrepresent origin
   - Frequent IP address changes

2. **VPNs and Proxies**:
   - Obscure real node locations
   - Privacy networks (Tor, I2P) especially problematic
   - May need VPN detection services

3. **Corporate/Business VPNs**:
   - Nodes appear at headquarters, not actual location
   - Common for institutional validators/nodes

4. **Cloud and Hosting Services**:
   - Data center location ≠ operator location
   - But may be what matters for infrastructure resilience

5. **Dynamic IP Addresses**:
   - Consumer ISPs reassign frequently
   - Geolocation may not update in sync

#### **Geographic Biases**

1. **Urban vs Rural**:
   - Rural: Lower accuracy, centralized routing attribution
   - Urban: Higher measurement density, better accuracy
   - Data scarcity in less-developed regions

2. **Regional Variations**:
   - North America/Europe: Better coverage and accuracy
   - Africa/South America: Sparser data, less frequent updates
   - Asia-Pacific: Variable by country

3. **ISP Transparency**:
   - Some ISPs provide better routing data
   - Others are opaque about network topology

### 4.3 Best Practices for GeoIP Usage

#### **Documentation Requirements**
- **Always Document**:
  - GeoIP provider (MaxMind, IP2Location, IPinfo, etc.)
  - Database version and date
  - Accuracy expectations per granularity level
  - Known limitations for your dataset

#### **Accuracy Representation**
- Include accuracy radius when provided by API
- Use confidence intervals where appropriate
- Aggregate to appropriate granularity for reliability:
  - Country-level: High confidence
  - City-level: Low confidence, use with caveats
  - Lat/lon coordinates: Display with accuracy circles, not precise pins

#### **VPN/Proxy Handling**
- Use VPN detection services (MaxMind, IPHub, IP2Proxy)
- Flag or filter VPN/proxy nodes
- Document how these are treated in analysis
- Consider whether VPN location or "true" location matters for your use case

#### **Validation and Cross-Checking**
- Cross-reference with self-reported locations (if available)
- Compare multiple GeoIP providers for contested cases
- Use ASN/hosting data to validate cloud attributions
- Sanity-check outliers (e.g., single node in unusual location)

#### **Temporal Considerations**
- Update GeoIP databases regularly (monthly minimum)
- Note that IP-to-location mappings change
- Historical analysis requires historical GeoIP data

#### **Blockchain-Specific Considerations**
From academic research on blockchain node geolocation:

1. **Cloud vs Home Nodes**:
   - Many blockchain nodes run in data centers
   - Data center location may actually be accurate and relevant
   - But operator location is obscured

2. **Validator Concentration**:
   - Staking-as-a-service centralizes node locations
   - GeoIP accurately shows *infrastructure* centralization
   - But may not reflect *operator* decentralization (v1+ concern)

3. **P2P Network Characteristics**:
   - NAT/firewall makes nodes unreachable to GeoIP
   - Only outbound-connecting nodes may be geolocated
   - This is a "lower bound" on network size

### 4.4 Red Flags in GeoIP Data Quality

- **No accuracy radius provided**: Treat with extreme skepticism at city level
- **Outdated database (> 6 months old)**: Accuracy degrades significantly
- **Single-source attribution**: Always prefer multi-source validation
- **Impossible precision claims**: Exact street addresses are not possible
- **Missing VPN detection**: Likely contains significant location errors
- **No provider documentation**: Can't assess methodology or quality

---

## 5. Common Pitfalls in Blockchain Data Source Evaluation

### 5.1 Bias and Coverage Issues

#### **Single Vantage Point Bias**
- **Problem**: Crawling from one location may miss geographically distant peers
- **Impact**: Underestimates global distribution
- **Detection**: Check if source documents crawler locations
- **Mitigation**: Prefer multi-vantage crawlers or aggregate multiple sources

#### **Reachability Bias**
- **Problem**: Only publicly reachable nodes are measured
  - Nodes behind NATs, firewalls, or corporate networks excluded
  - IPv6-only nodes may be missed by IPv4-only crawlers
- **Impact**: Systematically underestimates total network size
- **Documentation**: Always note this is a "lower bound" estimate
- **Mitigation**: Look for passive monitoring or telemetry data as complement

#### **Client Diversity Bias**
- **Problem**: Some crawlers only work with specific client implementations
- **Impact**: Minority clients may be underrepresented
- **Detection**: Check if data source reports client version distribution
- **Mitigation**: Cross-reference with client telemetry data

#### **Discovery Protocol Bias**
- **Problem**: Different P2P discovery mechanisms yield different node sets
- **Examples**:
  - DHT-only crawlers miss nodes not in routing table
  - DNS seed-based discovery misses non-DNS peers
  - Bootnodes may be over-represented
- **Mitigation**: Use multiple discovery methods or sources

#### **Temporal Sampling Bias**
- **Problem**: Node churn means snapshot timing matters
  - Diurnal patterns (different nodes online at different times)
  - Event-driven changes (forks, upgrades, outages)
- **Impact**: Single snapshots may misrepresent steady-state distribution
- **Mitigation**: Use time-series data or multiple snapshots across different times

### 5.2 Temporal Issues

#### **Data Staleness**
- **Problem**: Analysis based on outdated data misrepresents current state
- **Critical Threshold**: Data older than 3 months often unreliable for fast-moving networks
- **Assessment**:
  - Document "last updated" timestamp prominently
  - Note network evolution rate (e.g., Ethereum post-Merge very dynamic)
  - Compare to known current metrics if available

#### **Historical Bias**
- **Problem**: Using current GeoIP data for historical IP addresses
- **Impact**: Incorrect geographic attribution for past events
- **Solution**: Use historical GeoIP databases matched to data timestamp

#### **Snapshot vs Time Series**
- **Snapshot**: Single point in time
  - Good for: Current state assessment
  - Bad for: Understanding trends, node churn, stability
- **Time Series**: Multiple measurements over time
  - Good for: Trend analysis, churn characterization
  - Bad for: Initial quick assessment (more complex)
- **Recommendation**: Time series strongly preferred for research; snapshots okay for prototyping

#### **Measurement Frequency Mismatch**
- **Problem**: Crawl frequency doesn't match network dynamics
  - Daily crawls may miss rapidly churning nodes
  - Hourly crawls may overload small networks
- **Assessment**: Check if crawl frequency matches network churn rate

### 5.3 Licensing and Legal Pitfalls

#### **Ambiguous or Missing Licenses**
- **Problem**: No license = no permission to use/redistribute
- **Risk**: Legal exposure, can't build upon it
- **Red Flag**: "Free to use" without actual license text
- **Solution**: Contact creators for explicit license, or avoid

#### **Non-Commercial Restrictions**
- **Problem**: Many datasets restrict commercial use
- **Examples**: CC-BY-NC, academic-use-only clauses
- **Impact**: Can't use in commercial products or services
- **Assessment**:
  - Is your project commercial?
  - Do you plan to commercialize later?
  - Can you separate commercial and non-commercial data sources?

#### **API Terms of Service Violations**
Common violations to watch for:
- **Rate Limiting**: Exceeding requests/sec without permission
- **Scraping Prohibitions**: Some ToS explicitly ban automated access
- **Data Redistribution**: Can you share derived datasets?
- **Attribution Requirements**: Must credit in specific way
- **Reverse Engineering**: Some ToS prohibit analyzing API behavior

#### **Database Rights** (Europe)
- **Sui Generis Database Rights**: EU law protects databases separately from copyright
- **Impact**: Even factual data may be protected
- **Assessment**: Check if dataset creator is EU-based or asserts database rights

#### **GeoIP Licensing**
- **MaxMind GeoLite2**: CC-BY-SA 4.0 (free, but attribution + share-alike required)
- **MaxMind GeoIP2**: Commercial license required
- **IP2Location**: Various tiers; free version has restrictions
- **IPinfo**: Commercial licensing required for high-volume
- **Warning**: Using API that wraps commercial GeoIP may violate those licenses

### 5.4 Data Quality Red Flags

#### **No Methodology Documentation**
- **Problem**: Can't assess quality without knowing collection method
- **Red Flags**:
  - "We monitor the network" with no details
  - No mention of crawler implementation
  - No disclosure of GeoIP provider
  - No update frequency stated

#### **Unrealistic Precision**
- **Examples**:
  - Exact lat/lon without accuracy radius
  - Street-level addresses from IP geolocation
  - 100% coverage claims
- **Reality Check**: If it sounds too good to be true, it is

#### **Inconsistent or Impossible Data**
- **Examples**:
  - Node counts fluctuate wildly without explanation
  - Geographic distribution doesn't match known network characteristics
  - Timestamps in the future or impossibly old
  - Duplicate IP addresses with different metadata

#### **No Validation or Quality Metrics**
- **Problem**: No acknowledgment of limitations or error rates
- **Healthy Signs**:
  - Accuracy estimates provided
  - Known limitations documented
  - Comparison to other data sources
  - Outlier handling described

#### **Orphaned or Abandoned Projects**
- **Red Flags**:
  - Last commit > 2 years ago
  - No response to issues/PRs
  - Documentation refers to deprecated networks/protocols
  - Links to dead websites
- **Risk**: Data may be stale; tool may not work with current network versions

---

## 6. Licensing and Terms of Service Red Flags

### 6.1 License Types and Implications

#### **Permissive Open Source** (✅ Generally Safe)
- **MIT, BSD, Apache 2.0**:
  - Can use commercially
  - Can modify and redistribute
  - Minimal restrictions (usually just attribution)
  - **Best for**: Building products, research, commercial use

#### **Creative Commons** (⚠️ Check Variant)
- **CC0** (Public Domain): ✅ No restrictions
- **CC-BY**: ✅ Attribution required but otherwise permissive
- **CC-BY-SA**: ⚠️ Share-alike (derivatives must use same license)
- **CC-BY-NC**: ❌ Non-commercial only
- **CC-BY-NC-SA**: ❌ Non-commercial + share-alike
- **CC-BY-ND**: ❌ No derivatives (can't modify)

#### **Copyleft** (⚠️ Viral Licensing)
- **GPL (any version)**:
  - Requires derivative works to also be GPL
  - May "infect" your entire project
  - Can be problematic for commercial/proprietary software
- **AGPL**:
  - Like GPL but triggered by network use (not just distribution)
  - Very restrictive for web services
- **Assessment**: Use in isolated components, not core infrastructure

#### **Proprietary/Custom Licenses** (⚠️ Read Carefully)
- **Examples**: Blockchain.com API ToS, 0x API License
- **Common Restrictions**:
  - Rate limits
  - No redistribution
  - No commercial use without separate agreement
  - Termination clauses
  - Data retention limits
  - Geographic restrictions
- **Action**: Read full ToS; consult legal if commercializing

#### **No License / All Rights Reserved** (❌ Avoid)
- **Legal Reality**: No license = no permission to use
- **Common Misconception**: "It's on GitHub so it's open source" — FALSE
- **Action**: Request explicit license from author or don't use

### 6.2 API Terms of Service Checklist

Review for these clauses:

- [ ] **Rate Limits**: Requests per second/minute/day
- [ ] **Commercial Use**: Allowed or prohibited?
- [ ] **Attribution Requirements**: How and where to credit
- [ ] **Redistribution**: Can you share raw or derived data?
- [ ] **Modification**: Can you transform/aggregate the data?
- [ ] **Termination**: Under what conditions can access be revoked?
- [ ] **Warranty Disclaimer**: No guarantees about data quality (standard)
- [ ] **Indemnification**: Do you agree to hold provider harmless?
- [ ] **Data Retention**: Must you delete data after X days?
- [ ] **Prohibited Uses**: Anything specifically banned (scraping, competitors, etc.)?
- [ ] **Changes to Terms**: Can they change ToS without notice?
- [ ] **Governing Law**: Which jurisdiction applies?

### 6.3 Research-Specific Considerations

#### **Academic vs Commercial Use**
- Many sources allow academic/research use but prohibit commercial
- **Question**: Is your project purely academic?
  - If sponsored by commercial entity: may not qualify
  - If results will inform commercial decisions: gray area
  - If you plan to monetize later: get commercial license now

#### **Open Science and Reproducibility**
- **Problem**: Non-permissive licenses hinder reproducibility
- **Best Practice**: Prefer CC-BY, CC0, or open source licensed data
- **Fallback**: Document where others can obtain the data

#### **Data Citation and Attribution**
Even with permissive licenses:
- **Always** cite data sources
- Include dataset DOI if available
- Note version/snapshot date
- Acknowledge funding sources if disclosed

### 6.4 Red Flags and Warning Signs

#### **Ambiguous Language**
- ❌ "Free for personal use" — what counts as personal?
- ❌ "Contact us for commercial licensing" — price not disclosed
- ❌ "Use at your own risk" without any explicit grant of rights

#### **Restrictive Clauses**
- ❌ "May not be used to compete with us"
- ❌ "No automated access" (kills API use)
- ❌ "We reserve the right to terminate access at any time for any reason"
- ❌ "You grant us perpetual license to any feedback"

#### **Data Retention and Deletion**
- ❌ "Data must be deleted after 30 days"
- ❌ "Must re-fetch data for each use"
- Impact: Can't build historical datasets

#### **Broad Indemnification**
- ❌ "You indemnify us against any claims arising from your use"
- Risk: Unlimited liability for data quality issues

#### **Unilateral Modification**
- ❌ "We can change these terms at any time; continued use constitutes acceptance"
- Risk: Terms can become unacceptable after you've invested

### 6.5 Mitigation Strategies

#### **For Restrictive Licenses**
1. **Contact the provider**:
   - Explain your use case
   - Request exception or separate agreement
   - Often successful for academic research

2. **Use as reference only**:
   - Inform your methodology
   - Don't incorporate data directly
   - Cite as prior work

3. **Find alternative sources**:
   - Multiple sources often exist
   - Prefer more permissive options

4. **Isolate in separate component**:
   - Keep restrictively-licensed data in separate module
   - Don't let copyleft "infect" your project

#### **Documentation Best Practices**
Create a `LICENSES.md` file documenting:
- Each data source used
- Its license type and version
- Link to full license text
- Attribution requirements
- Any special terms or restrictions
- Your compliance measures

---

## 7. Tools and Frameworks for Data Cataloging

### 7.1 Open Source Data Catalog Platforms

#### **OpenMetadata** (Recommended for Full-Featured Catalog)
- **Description**: Complete data context with discovery, observability, governance
- **Founded by**: Collate; creators of Apache Hadoop, Apache Atlas, Uber Databook
- **Features**:
  - Metadata ingestion from 100+ sources
  - Data lineage tracking
  - Data quality monitoring
  - Role-based access control
  - REST API and Python SDK
- **Use Case**: If you need full-featured data governance platform
- **URL**: https://open-metadata.org/

#### **DataHub** (Recommended for Lineage and Discovery)
- **Description**: Metadata platform from LinkedIn
- **Features**:
  - Federated metadata search
  - Data lineage visualization
  - GraphQL API
  - Integration with dbt, Airflow, Spark, etc.
- **Use Case**: Strong lineage tracking, broad integrations
- **URL**: https://datahub.com/

#### **Apache Atlas** (Enterprise-Grade Governance)
- **Description**: Open-source data catalog and governance
- **Features**:
  - Metadata collection and classification
  - Data lineage
  - RESTful APIs
  - Integration with Hadoop ecosystem
- **Use Case**: If already in Hadoop/big data ecosystem
- **URL**: https://atlas.apache.org/

#### **Amundsen** (User-Friendly Discovery)
- **Description**: Data discovery from Lyft
- **Features**:
  - User-friendly search and discovery
  - Table/column-level metadata
  - Simple deployment
- **Use Case**: Emphasis on ease of use and search
- **URL**: https://www.amundsen.io/

#### **Magda** (Federated Catalogs)
- **Description**: Federated data catalog for big and small data
- **Features**:
  - Harvests metadata from multiple sources
  - CKAN, DCAT compatibility
  - Customizable search
- **Use Case**: Aggregating multiple existing catalogs
- **URL**: https://magda.io/

### 7.2 Lightweight Alternatives for Small Projects

#### **CKAN** (Open Data Portals)
- **Description**: Leading open data portal platform
- **Features**: Dataset publishing, search, visualization
- **Use Case**: Public-facing data portals
- **URL**: https://ckan.org/

#### **Marquez** (Data Lineage Focus)
- **Description**: Metadata service from WeWork
- **Features**: Data lineage, run-level metadata
- **Use Case**: Track data pipelines and dependencies
- **URL**: https://marquezproject.ai/

#### **Simple JSON/YAML Catalogs**
For smaller projects like Geobeat v0:
- **Format**: Structured JSON or YAML files in Git repository
- **Advantages**:
  - Version controlled
  - Easy to edit
  - No infrastructure overhead
  - Scriptable (Python/JavaScript can parse)
- **Schema Validation**: JSON Schema or YAML schema
- **Example Structure**:
```json
{
  "sources": [
    {
      "id": "ethernodes-api",
      "name": "Ethernodes.org API",
      "url": "https://www.ethernodes.org/api",
      "networks": ["ethereum"],
      "type": "api",
      "signals": {
        "ip_addresses": true,
        "geographic_fields": ["country", "city"],
        "asn": false
      },
      "license": "unknown",
      "last_updated": "2025-01-15",
      "notes": "Popular explorer; unclear API ToS"
    }
  ]
}
```

### 7.3 Metadata Management Tools

#### **Great Expectations** (Data Quality)
- **Purpose**: Data validation and profiling
- **Use Case**: Validate datasets against expected schemas
- **URL**: https://greatexpectations.io/

#### **DVC (Data Version Control)**
- **Purpose**: Version control for datasets
- **Use Case**: Track dataset evolution, reproduce experiments
- **URL**: https://dvc.org/

#### **Intake** (Data Loading)
- **Purpose**: Lightweight package for describing and loading datasets
- **Use Case**: Catalog datasets with YAML descriptions
- **URL**: https://intake.readthedocs.io/

### 7.4 GeoIP and Network Analysis Tools

#### **GeoIP Databases**
- **MaxMind GeoLite2**: Free, CC-BY-SA licensed
- **MaxMind GeoIP2**: Commercial, higher accuracy
- **IP2Location**: Freemium model
- **IPinfo**: Commercial with free tier
- **DB-IP**: Free and commercial tiers

#### **ASN and BGP Data**
- **CAIDA AS Relationships**: Authoritative AS topology
- **RIPE RIS**: Routing Information Service
- **RouteViews**: University of Oregon BGP data
- **BGPKIT**: BGP data analysis tools

#### **Network Measurement Infrastructure**
- **RIPE Atlas**: Global active measurement network (gold standard)
- **Censys**: Internet-wide scanning and device discovery
- **Shodan**: Search engine for Internet-connected devices

### 7.5 Blockchain-Specific Tools

#### **Node Explorers and Crawlers**
- **Bitnodes**: Bitcoin node crawler (source code available)
- **Ethernodes**: Ethereum node explorer
- **NodeMaps**: Research framework for multi-chain node analysis
- **Polkadot Telemetry**: Substrate-based chain monitoring

#### **Data Platforms**
- **The Graph**: Decentralized indexing protocol
- **Dune Analytics**: Blockchain data queries and dashboards
- **Blockchain ETL**: Public datasets in BigQuery

---

## 8. Comparative Analysis Best Practices

### 8.1 Structuring Comparative Analysis

#### **Framework Questions to Answer**

1. **Coverage Matrix**:
   - Which networks have good existing coverage?
   - Which networks lack public data?
   - Are there gaps in specific signals (IP, geography, ASN)?

2. **Data Source Relationships**:
   - Which sources overlap (measure same network)?
   - Which sources are complementary (different networks or signals)?
   - Which sources have dependencies (one derives from another)?

3. **Quality vs Accessibility Trade-offs**:
   - Most accurate but restrictive licensing
   - Most accessible but lower quality
   - Balanced options

4. **Temporal Coverage**:
   - Historical depth vs recency
   - Update frequency comparison
   - Staleness assessment

#### **Recommended Comparison Dimensions**

Create matrices comparing sources across:
- **Networks Covered**: Which sources cover which blockchains?
- **Signal Availability**: IP, geography, ASN columns
- **Licensing**: Open, restricted, commercial, unknown
- **Data Type**: API, static dataset, code-only
- **Freshness**: Last updated date comparison
- **Quality Indicators**: Methodology documentation quality
- **Integration Effort**: Easy, medium, hard

### 8.2 Visualization Approaches

#### **Coverage Heatmap**
```
               Source1  Source2  Source3  Source4
Bitcoin           ✓        ✓        ✗        ✓
Ethereum          ✓        ✓        ✓        ✗
Filecoin          ✗        ✓        ✓        ✓
Polygon           ✗        ✗        ✓        ✓
```

#### **Signal Availability Matrix**
```
Source      IPs  Country  City  Lat/Lon  ASN  Cloud
Source1     ✓    ✓        ✓     ✗        ✓    ✗
Source2     ✓    ✓        ✗     ✗        ✗    ✗
Source3     ✗    ✓        ✓     ✓        ✓    ✓
```

#### **Dependency Graph**
```
Source A (Primary Crawler)
  ↓
  ├─→ Source B (Aggregates A's data)
  └─→ Source C (Uses A's GeoIP provider)
```

#### **License Compatibility Chart**
```
                Commercial  Derivative  Redistribution
Source1 (MIT)       ✓           ✓            ✓
Source2 (CC-BY)     ✓           ✓            ✓
Source3 (CC-NC)     ✗           ✓            ✗
Source4 (Unknown)   ?           ?            ?
```

### 8.3 Identifying Data Source "Hubs"

**Hub Characteristics**:
- Multiple other sources depend on it
- Authoritative or long-standing
- Well-documented methodology
- Regular updates
- Open/permissive licensing

**Example Hubs**:
- **Ethernodes.org** for Ethereum node data (many studies cite it)
- **Bitnodes** for Bitcoin (well-established, open source crawler)
- **MaxMind GeoLite2** for GeoIP (ubiquitous in research)
- **CAIDA** for ASN data (authoritative)

**Analysis**:
- If a hub fails or changes licensing, many downstream sources affected
- Prioritize establishing relationships or mirrors for critical hubs
- Document hub dependencies explicitly

### 8.4 Redundancy and Complementarity

#### **Redundant Sources** (measure same thing)
- **Use Case**: Validation, cross-checking
- **Strategy**: Use highest-quality or most permissive license
- **Example**: Multiple Bitcoin node crawlers

#### **Complementary Sources** (provide different perspectives)
- **Use Case**: Comprehensive coverage
- **Strategy**: Combine to fill gaps
- **Examples**:
  - Source A: Great Ethereum data, no Filecoin
  - Source B: Great Filecoin data, no Ethereum
  - Combined: Both networks covered

#### **Hierarchical Sources** (different granularities)
- **Use Case**: Drill-down analysis
- **Strategy**: Use coarse for overview, fine for detail
- **Example**:
  - Source A: Aggregated country-level stats (fast, easy)
  - Source B: Full IP-level data (detailed, requires processing)

### 8.5 Tradeoff Documentation Template

For each major tradeoff discovered:

```markdown
### Tradeoff: [Name]

**Option A**: [Description]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]

**Option B**: [Description]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]

**Recommendation**: [Which to choose and when]

**Examples**:
- [Real sources that exemplify each option]
```

**Example**:
```markdown
### Tradeoff: Freshness vs Historical Depth

**Option A**: Real-time API (Ethernodes)
- **Pros**: Always current data, reflects live network
- **Cons**: Limited historical data, can't analyze trends

**Option B**: Static dataset (Research paper snapshot)
- **Pros**: Rich historical context, reproducible
- **Cons**: Stale, doesn't reflect current network

**Recommendation**: Use real-time API for dashboards, historical datasets for research analysis
```

---

## 9. Examples from Well-Structured Projects

### 9.1 Data Provenance Initiative

**Repository**: https://github.com/Data-Provenance-Initiative/Data-Provenance-Collection

**Strengths**:
- **Structured JSON format** for machine readability
- **Comprehensive metadata** across identifier, characteristics, provenance dimensions
- **Template file** (`data_summaries/_template.json`) for consistency
- **Standardized vocabularies** (domain groups, license classes) in constants files
- **Multi-source aggregation** (GitHub, Hugging Face, ArXiv, Semantic Scholar)

**Key Fields**:
```json
{
  "Unique Dataset Identifier": "collection-name",
  "Dataset Name": "...",
  "Paper Title": "...",
  "Languages": ["en", "code"],
  "Task Categories": ["..."],
  "Text Sources": "...",
  "Collection": "...",
  "Collection Time": "...",
  "License": "...",
  "License Notes": "...",
  "Creator Organization": "...",
  "Hugging Face URL": "...",
  "GitHub URL": "...",
  "ArXiv URL": "...",
  "Download Count": 123456
}
```

**Applicable Lessons for Geobeat**:
- Use template JSON for consistency
- Separate identifier, characteristics, and provenance sections
- Maintain vocabulary/constant files (e.g., `license_types.json`, `network_types.json`)
- Include both machine-readable (JSON) and human-readable (README) docs

### 9.2 Social Science Data Editors Template

**URL**: https://social-science-data-editors.github.io/template_README/template-README.html

**Strengths**:
- **Endorsed by major journals** (AEA, APSR, etc.)
- **Clear section structure** with mandatory vs optional components
- **Replication-focused**: Designed for reproducibility
- **Data availability statements**: Explicit provenance and access documentation
- **Computational requirements**: Environment specification

**Key Sections**:
1. **Data Availability and Provenance Statements**:
   - Origin and source of each dataset
   - Access instructions and restrictions
   - Format and data dictionary references

2. **Dataset List**:
   - File name, format, source citation
   - Availability status (included, available online, restricted)

3. **Computational Requirements**:
   - Software versions, dependencies
   - Hardware and storage needs
   - Random seed documentation

4. **Instructions to Replicators**:
   - Linear sequence of commands
   - Expected runtime
   - Output mapping to manuscript figures/tables

**Applicable Lessons for Geobeat**:
- Separate "data availability" from "data description"
- Document computational environment for reproducibility
- Provide linear replication instructions
- Map outputs to specific analysis results
- Use setup scripts for environment configuration

### 9.3 AWS Public Blockchain Data

**Repository**: https://github.com/awslabs/open-data-registry

**Example File**: `datasets/aws-public-blockchain.yaml`

**Strengths**:
- **YAML format**: Human-readable, Git-friendly
- **Standardized schema**: Consistent across all AWS Open Data datasets
- **Rich metadata**: License, documentation, update frequency, contact info
- **Resource links**: Direct S3 bucket references, examples, tools
- **Managed dataset**: Clear maintainer and update policy

**Key Fields**:
```yaml
Name: AWS Public Blockchain Data
Description: |
  Blockchain data optimized for analytics by being transformed
  into compressed Parquet files, partitioned by date
Documentation: https://...
Contact: ...
ManagedBy: "[AWS]"
UpdateFrequency: Daily
Tags:
  - blockchain
  - ethereum
  - bitcoin
License: "Data is available for anyone to use under Creative Commons License"
Resources:
  - Description: Bitcoin blockchain data in Parquet
    ARN: arn:aws:s3:::aws-public-blockchain/v1.0/btc
    Region: us-east-1
    Type: S3 Bucket
```

**Applicable Lessons for Geobeat**:
- YAML is excellent for dataset catalogs
- Tag datasets for discoverability
- Include ARN/URI for direct programmatic access
- Document update frequency and management responsibility
- Link to examples and tools for using the data

### 9.4 EllipticPlusPlus Dataset (Blockchain Research)

**Repository**: https://github.com/git-disl/EllipticPlusPlus

**Strengths**:
- **Tutorial notebooks**: Helps users explore dataset
- **Dataset statistics**: Clearly documented
- **Graph visualization**: Demonstrates data structure
- **Model training examples**: Shows practical use
- **Academic publication**: Peer-reviewed methodology

**Key Documentation**:
- **README**: Overview, dataset description, download links
- **Notebooks**:
  - `01_dataset_statistics.ipynb`
  - `02_graph_visualization.ipynb`
  - `03_model_training.ipynb`
- **Paper reference**: Links to methodology publication
- **Citation**: How to cite if used

**Applicable Lessons for Geobeat**:
- Provide Jupyter notebooks for exploration
- Include visualization examples
- Link to methodology publication for credibility
- Offer analysis examples, not just raw data
- Make citation easy

### 9.5 "Multiple Sides of 36 Coins" Research (2025)

**Paper**: https://arxiv.org/html/2511.15388v1

**Strengths**:
- **Transparent methodology**: Detailed crawler implementation
- **Multi-network analysis**: 36 cryptocurrencies measured
- **Reproducible infrastructure**: Documented AWS deployment
- **Clear metrics**: HHI, geographic concentration, churn
- **Limitations acknowledged**: NAT bias, vantage point constraints

**Methodology Documentation**:
- **Crawler Specifications**:
  - 15 active crawlers on AWS Virginia
  - Staggered crawl schedule (midnight UTC for Bitcoin, etc.)
  - Protocol-specific discovery messages documented

- **Geographic Analysis**:
  - GeoIP provider: Documented
  - Country-level and AS-level metrics
  - HHI calculation formula provided

- **Validation**:
  - Cross-referenced with node explorers
  - Ground-truth comparison for Bitcoin
  - IPv4 scanning validation

**Applicable Lessons for Geobeat**:
- Document crawler infrastructure in detail
- Explain scheduling and stagger logic
- Provide exact formulas for metrics
- Acknowledge biases and limitations explicitly
- Cross-validate with multiple sources
- Make comparison to prior work

### 9.6 OpenMetadata Sample Catalog

**URL**: https://open-metadata.org/

**Strengths**:
- **Automated ingestion**: Connectors for 100+ sources
- **Lineage visualization**: Graphical dependency tracking
- **Data quality rules**: Built-in validation framework
- **API-first design**: Everything accessible programmatically
- **Role-based access**: Governance built-in

**Sample Metadata Structure**:
```json
{
  "name": "ethereum_nodes_daily",
  "fullyQualifiedName": "geobeat.ethereum.nodes.daily",
  "displayName": "Ethereum Nodes Daily Snapshots",
  "description": "Daily snapshots of Ethereum node IP addresses...",
  "tags": ["ethereum", "p2p", "geographic"],
  "owner": {
    "name": "data-team",
    "type": "team"
  },
  "columns": [
    {
      "name": "ip_address",
      "dataType": "VARCHAR",
      "description": "IPv4 or IPv6 address of node"
    },
    {
      "name": "country_code",
      "dataType": "CHAR(2)",
      "description": "ISO 3166-1 alpha-2 country code from GeoIP"
    }
  ],
  "databaseSchema": {
    "name": "ethereum",
    "service": "geobeat"
  }
}
```

**Applicable Lessons for Geobeat**:
- Even if not using OpenMetadata, adopt its schema principles
- Tag datasets for filtering and discovery
- Document column-level metadata
- Track data lineage (which datasets derive from others)
- Include data quality rules in catalog

---

## 10. Recommendations for Geobeat Project

### 10.1 Dataset Inventory Structure

Based on all research, here's the recommended structure for Geobeat:

#### **File Organization**
```
/data/
├── inventory/
│   ├── sources.json              # Machine-readable catalog
│   ├── sources.yaml              # Human-readable alternative
│   ├── schema.json               # JSON Schema for validation
│   └── README.md                 # Overview and guide
├── assessments/
│   ├── [source-id]/
│   │   ├── quality_report.md     # Detailed quality assessment
│   │   ├── sample_data.json      # Example API response
│   │   └── test_results.md       # Integration test results
│   └── comparison_matrix.md      # Cross-source comparison
└── templates/
    ├── source_template.json      # Blank template for new sources
    └── assessment_template.md    # Quality assessment guide
```

#### **Source Entry Schema (JSON)**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "url", "networks", "type", "signals", "license"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier (kebab-case)"
    },
    "name": {
      "type": "string",
      "description": "Human-readable name"
    },
    "url": {
      "type": "string",
      "format": "uri",
      "description": "Primary access URL"
    },
    "urls": {
      "type": "object",
      "properties": {
        "api": {"type": "string", "format": "uri"},
        "docs": {"type": "string", "format": "uri"},
        "github": {"type": "string", "format": "uri"},
        "paper": {"type": "string", "format": "uri"}
      }
    },
    "networks": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Blockchain networks covered"
    },
    "type": {
      "type": "string",
      "enum": ["api-rest", "api-graphql", "api-websocket", "dataset-static", "dataset-timeseries", "code-only", "explorer-only"]
    },
    "signals": {
      "type": "object",
      "properties": {
        "ip_addresses": {"type": "boolean"},
        "geographic_fields": {
          "type": "array",
          "items": {"type": "string"}
        },
        "asn": {"type": "boolean"},
        "cloud_provider": {"type": "boolean"},
        "client_version": {"type": "boolean"},
        "uptime": {"type": "boolean"}
      }
    },
    "temporal": {
      "type": "object",
      "properties": {
        "type": {"type": "string", "enum": ["snapshot", "timeseries", "streaming"]},
        "time_range": {
          "type": "object",
          "properties": {
            "start": {"type": "string", "format": "date"},
            "end": {"type": "string", "format": "date"}
          }
        },
        "last_updated": {"type": "string", "format": "date"},
        "update_frequency": {"type": "string"}
      }
    },
    "license": {
      "type": "object",
      "properties": {
        "type": {"type": "string"},
        "url": {"type": "string", "format": "uri"},
        "commercial_use": {"type": "boolean"},
        "attribution_required": {"type": "boolean"},
        "redistribution_allowed": {"type": "boolean"},
        "restrictions": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "data_provenance": {
      "type": "object",
      "properties": {
        "collection_method": {"type": "string"},
        "vantage_points": {"type": "number"},
        "geoip_provider": {"type": "string"},
        "geoip_version": {"type": "string"},
        "derived_from": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "limitations": {
      "type": "array",
      "items": {"type": "string"}
    },
    "priority": {
      "type": "string",
      "enum": ["high", "medium", "low"]
    },
    "notes": {"type": "string"}
  }
}
```

### 10.2 Key Considerations for Node/Peer Geographic Data

#### **Data Quality Checklist**
- [ ] **GeoIP Database**: Documented provider and version
- [ ] **Accuracy Radius**: Included or estimated
- [ ] **Update Frequency**: Data freshness acceptable for use case
- [ ] **Coverage Estimate**: % of network captured acknowledged
- [ ] **NAT Bias**: Recognized that count is lower bound
- [ ] **VPN Detection**: Proxied nodes flagged or noted as limitation
- [ ] **IPv4 vs IPv6**: Separate statistics if available
- [ ] **Cloud Attribution**: Methodology for identifying cloud providers
- [ ] **ASN Data**: Source documented (CAIDA, RIPE, etc.)
- [ ] **Temporal Stability**: Node churn characteristics documented

#### **Critical Questions to Ask**
1. **What's actually being measured?**
   - Publicly reachable nodes only? Full network?
   - Specific client implementations? All clients?

2. **How is geography determined?**
   - GeoIP provider and version?
   - Data center location vs operator location?
   - Accuracy claims realistic?

3. **How current is the data?**
   - Last crawl/update timestamp?
   - Update frequency adequate?
   - Historical depth available?

4. **What's missing?**
   - NAT-ed nodes?
   - IPv6-only nodes?
   - Specific geographic regions?

5. **Can we validate it?**
   - Cross-reference with other sources?
   - Known ground truth for comparison?
   - Self-consistency checks possible?

### 10.3 Licensing Red Flags for Geobeat

#### **Immediate Disqualifiers**
- ❌ No license (all rights reserved)
- ❌ Non-commercial only (if commercializing later)
- ❌ No redistribution (can't share derived analysis)
- ❌ Scraping prohibited in ToS
- ❌ Data must be deleted after X days

#### **Yellow Flags (Proceed with Caution)**
- ⚠️ CC-BY-SA (share-alike may complicate licensing)
- ⚠️ GPL/AGPL (copyleft considerations)
- ⚠️ Unknown license (must contact author)
- ⚠️ Commercial licensing unclear
- ⚠️ Rate limits very restrictive
- ⚠️ Terms of service can change without notice

#### **Green Flags (Good to Use)**
- ✅ MIT, BSD, Apache 2.0
- ✅ CC0 or CC-BY
- ✅ Explicit research/academic use permission
- ✅ Documented rate limits that are reasonable
- ✅ Clear attribution requirements
- ✅ Redistribution allowed

### 10.4 Recommended Workflow

#### **Phase 1: Initial Reconnaissance** (Current)
1. **Identify sources**: Web search, paper citations, GitHub
2. **Quick assessment**: Fill basic inventory fields
3. **Prioritize**: High/medium/low based on v0 needs
4. **Document**: Add to `sources.json` with known fields

#### **Phase 2: Deep Evaluation** (High-Priority Sources)
1. **Access testing**: Can we actually get the data?
2. **Sample data**: Fetch example responses/files
3. **Quality assessment**: Complete detailed evaluation
4. **License review**: Read full ToS, identify restrictions
5. **Integration test**: Proof-of-concept code to ingest data

#### **Phase 3: Comparative Analysis**
1. **Coverage matrix**: Which networks well-covered?
2. **Overlap analysis**: Redundant vs complementary sources
3. **Dependencies**: Identify hubs and relationships
4. **Trade-offs**: Document major decision points

#### **Phase 4: Selection and Integration**
1. **Final selection**: Choose sources for v0
2. **License compliance**: Document attribution, restrictions
3. **Integration**: Build data pipelines
4. **Validation**: Cross-check sources, sanity checks
5. **Documentation**: Update inventory with integration notes

---

## References

### Academic Papers
- "Multiple Sides of 36 Coins: Measuring Peer-to-Peer Infrastructure Across Cryptocurrencies" (2025)
- "Measuring node decentralisation in blockchain peer to peer networks" (ScienceDirect, 2022)
- "Nodes in the Bitcoin Network: Comparative Measurement Study and Survey" (2019)
- "Statistical and clustering analysis of attributes of Bitcoin backbone nodes" (PLOS ONE, 2023)

### Standards and Guidelines
- Data Provenance Initiative: https://github.com/Data-Provenance-Initiative/Data-Provenance-Collection
- Social Science Data Editors Template: https://social-science-data-editors.github.io/template_README/
- Research Data Alliance Metadata Standards Directory: https://rd-alliance.github.io/metadata-directory/standards/
- W3C PROV-DM: https://www.w3.org/TR/prov-dm/

### Tools and Platforms
- OpenMetadata: https://open-metadata.org/
- DataHub: https://datahub.com/
- Apache Atlas: https://atlas.apache.org/
- Amundsen: https://www.amundsen.io/
- Magda: https://magda.io/

### GeoIP and Network Data
- MaxMind GeoIP2 Accuracy: https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy
- IPinfo: https://ipinfo.io/
- CAIDA: https://www.caida.org/
- RIPE Atlas: https://atlas.ripe.net/

### Blockchain Data Resources
- AWS Public Blockchain Data: https://github.com/awslabs/open-data-registry
- EllipticPlusPlus Dataset: https://github.com/git-disl/EllipticPlusPlus
- Blockchain ETL Public Datasets: https://github.com/blockchain-etl/public-datasets

---

## Appendix: Quick Reference Checklists

### Dataset Evaluation Checklist
- [ ] Name and identifier assigned
- [ ] Primary URL documented
- [ ] Networks covered listed
- [ ] Data type classified
- [ ] Node signals inventoried (IP, geo, ASN)
- [ ] Temporal characteristics documented
- [ ] Collection methodology understood
- [ ] License identified and restrictions noted
- [ ] Known limitations documented
- [ ] GeoIP provider identified (if applicable)
- [ ] Update frequency confirmed
- [ ] Last update date recorded
- [ ] Sample data obtained
- [ ] Quality assessment completed
- [ ] Priority level assigned
- [ ] Integration complexity estimated

### License Review Checklist
- [ ] License type identified (MIT, CC-BY, GPL, etc.)
- [ ] Commercial use allowed?
- [ ] Attribution requirements understood
- [ ] Redistribution allowed?
- [ ] Derivative works allowed?
- [ ] Share-alike requirements?
- [ ] Terms of service reviewed
- [ ] Rate limits documented
- [ ] Data retention requirements?
- [ ] Termination clauses reviewed
- [ ] Governing law noted
- [ ] Contact for questions identified

### API Evaluation Checklist
- [ ] Documentation comprehensive?
- [ ] Authentication method clear?
- [ ] Rate limits stated?
- [ ] Response time acceptable (<100ms ideal)?
- [ ] Pagination supported?
- [ ] Error handling documented?
- [ ] API versioning strategy?
- [ ] Historical data accessible?
- [ ] Bulk export available?
- [ ] Example requests provided?
- [ ] Response schema documented?
- [ ] Uptime/SLA information?
- [ ] Support channel exists?

### Geographic Data Quality Checklist
- [ ] GeoIP provider documented
- [ ] Database version/date known
- [ ] Accuracy claims realistic
- [ ] Accuracy radius provided
- [ ] VPN/proxy detection mentioned
- [ ] Cloud provider attribution method
- [ ] ASN data source documented
- [ ] IPv4 vs IPv6 separate stats
- [ ] NAT bias acknowledged
- [ ] Coverage estimate provided
- [ ] Validation method described
- [ ] Known gaps documented
