# Quick Reference: Blockchain Data Source Best Practices

> **⚠️ METHODOLOGY REFERENCE**
> This is a **quick reference guide** for methodology, NOT actual research findings.
> For actual data source evaluations, see `../INVENTORY.md` (to be created).

**Date Created:** 2025-11-22
**Purpose:** Condensed checklist for evaluating blockchain datasets

---

This is a condensed reference for the most critical best practices. See `DATA_SOURCE_BEST_PRACTICES.md` for comprehensive details.

---

## Recommended Dataset Inventory Fields

### Essential (Required)
- **id**: Unique identifier (kebab-case)
- **name**: Human-readable name
- **url**: Primary access point
- **networks**: List of blockchain networks covered
- **type**: API (REST/GraphQL/WebSocket), static dataset, code-only, or explorer-only
- **signals**: What's available?
  - IP addresses? (yes/no)
  - Geographic fields? (country, city, lat/lon)
  - ASN/ISP data? (yes/no)
- **license**: License type and restrictions
- **last_updated**: Most recent data timestamp
- **limitations**: Known biases and gaps

### Recommended (High Value)
- **data_provenance**: Collection method, GeoIP provider, vantage points
- **temporal**: Snapshot vs time-series, update frequency
- **priority**: High/medium/low for your project
- **derived_from**: Dependencies on other sources

### Nice to Have
- Multiple URLs (API, docs, GitHub, paper)
- Quality metrics (coverage %, accuracy estimates)
- Integration complexity estimate
- Sample data examples

---

## Geographic Data Quality Red Flags

### Critical Issues (Avoid or Use with Extreme Caution)
- ❌ No GeoIP provider documented
- ❌ Claims exact street addresses from IP geolocation
- ❌ Data older than 6 months without updates
- ❌ No acknowledgment of NAT/firewall limitations
- ❌ Single vantage point with no mention of bias
- ❌ No methodology documentation

### Yellow Flags (Document and Assess)
- ⚠️ City-level data without accuracy radius
- ⚠️ GeoIP database > 3 months old
- ⚠️ No VPN/proxy detection
- ⚠️ Only counts reachable nodes (standard limitation, must document)
- ⚠️ Single-client bias (e.g., only Geth nodes)

### Quality Indicators (Good Signs)
- ✅ GeoIP provider and version documented
- ✅ Accuracy radius or confidence scores provided
- ✅ Multiple vantage points for crawling
- ✅ NAT/firewall bias acknowledged
- ✅ Cross-validation with other sources
- ✅ Methodology published in peer-reviewed venue

---

## GeoIP Accuracy Expectations (MaxMind GeoIP2)

| Granularity | Accuracy | Use Cases | Avoid For |
|-------------|----------|-----------|-----------|
| **Country** | 99.8% | Geographic distribution analysis | (reliable at this level) |
| **State/Region** | ~80% (U.S.) | Regional comparisons | Precise jurisdictional analysis |
| **City** | 66% within 50km | General city-level heatmaps | Specific city attribution |
| **Lat/Lon** | Varies (few km to 1000km radius) | Visual approximations with accuracy circles | Precise pinpointing |

**Key Limitation**: GeoIP is NEVER precise enough for street addresses or households.

**Specific Challenges**:
- **VPNs/Proxies**: Completely obscure real location
- **Mobile Networks**: IPs used across large areas
- **Rural Areas**: Often misattributed to nearest city
- **Cloud/Data Centers**: Shows server location, not operator location (may be what you want!)

---

## Licensing Quick Reference

### Safe for Most Uses
- ✅ **MIT, BSD, Apache 2.0**: Commercial use, modification, redistribution allowed
- ✅ **CC0**: Public domain, no restrictions
- ✅ **CC-BY**: Attribution required, otherwise permissive

### Use with Caution
- ⚠️ **CC-BY-SA**: Share-alike requirement (derivatives must use same license)
- ⚠️ **GPL/LGPL**: Copyleft (may "infect" your project)
- ⚠️ **AGPL**: Copyleft triggered by network use (very restrictive)

### Restricted (May Not Fit Your Needs)
- ❌ **CC-BY-NC**: Non-commercial only
- ❌ **CC-BY-ND**: No derivatives (can't modify)
- ❌ **No license**: All rights reserved (no permission to use)

### API Terms of Service Red Flags
- ❌ "No automated access" (kills API usage)
- ❌ "Data must be deleted after X days"
- ❌ "May not compete with us"
- ❌ Rate limits extremely low
- ❌ "We can change terms anytime; continued use = acceptance"

---

## Key Metrics for Geographic Decentralization

Based on academic research consensus:

### 1. Country-Level Distribution
- **Metric**: % of nodes per country
- **Benchmark**: "Top N countries host X% of nodes"
- **Example**: "Top 9 countries host 80% of Bitcoin nodes"
- **Visualization**: Choropleth map, bar chart

### 2. Autonomous System Concentration (HHI)
- **Formula**: HHI = Σ(market_share_i)²
- **Range**: 0 (perfectly distributed) to 10,000 (monopoly)
- **Thresholds**:
  - HHI < 0.01: Unconcentrated (Bitcoin ≈ 0.001)
  - 0.01 ≤ HHI < 0.15: Moderate
  - HHI ≥ 0.15: Highly concentrated
- **Also report**: Top-K ASN concentration

### 3. Cloud Provider Concentration
- **Metric**: % nodes on AWS, GCP, Azure, etc.
- **Concern**: Single-provider failure domain
- **Track**: Trend over time

### 4. Regional/Continental Distribution
- **Diversity Metrics**: Shannon entropy, Simpson's index
- **Granularity**: Continent or UN geographic regions

---

## Common Pitfalls to Avoid

### Coverage Biases
1. **Single Vantage Point**: Crawling from one location misses distant peers
2. **Reachability Bias**: NAT/firewall nodes excluded (counts are lower bounds)
3. **Client Diversity**: Some crawlers only work with specific clients
4. **Discovery Protocol**: DHT-only vs DNS seeds yield different results

### Temporal Issues
1. **Data Staleness**: > 3 months old often unreliable
2. **Snapshot vs Time Series**: Single snapshots miss churn and diurnal patterns
3. **Historical GeoIP Misapplication**: Must use GeoIP database from same time period

### Quality Red Flags
1. **No Methodology**: Can't assess quality without knowing collection method
2. **Unrealistic Precision**: Claims that sound too good to be true
3. **No Limitations Acknowledged**: Every dataset has biases; honest sources document them
4. **Orphaned Projects**: Last update > 2 years ago likely stale

---

## Recommended Tools for Geobeat

### For Small/Medium Projects (Recommended for Geobeat v0)
- **Catalog Format**: JSON or YAML files in Git
- **Schema Validation**: JSON Schema
- **Documentation**: Markdown with tables
- **Version Control**: Git for tracking changes
- **Visualization**: Simple scripts (Python/JS) to generate comparison matrices

### For Large/Enterprise Projects
- **OpenMetadata**: Full-featured data catalog with lineage
- **DataHub**: LinkedIn's metadata platform
- **Apache Atlas**: Hadoop ecosystem integration

### GeoIP Services
- **Free**: MaxMind GeoLite2 (CC-BY-SA, good accuracy)
- **Commercial**: MaxMind GeoIP2, IPinfo, IP2Location (higher accuracy)
- **VPN Detection**: MaxMind, IP2Proxy, IPHub

### Network Data
- **ASN/BGP**: CAIDA (authoritative), RIPE RIS, RouteViews
- **Internet Measurement**: RIPE Atlas (gold standard)
- **Scanning**: Censys, Shodan

---

## Comparative Analysis Framework

### Questions to Answer
1. **Coverage**: Which networks have good data? Which have gaps?
2. **Overlap**: Which sources measure the same things?
3. **Dependencies**: Which sources depend on others?
4. **Hubs**: Are there critical sources many others rely on?
5. **Trade-offs**: Quality vs accessibility, freshness vs depth, etc.

### Create These Matrices

**Coverage Matrix**: Sources (rows) × Networks (columns)
```
               Bitcoin  Ethereum  Filecoin  Polygon
Source A          ✓        ✓         ✗         ✗
Source B          ✓        ✗         ✓         ✓
Source C          ✗        ✓         ✓         ✗
```

**Signal Availability**: Sources (rows) × Signals (columns)
```
Source      IPs  Country  City  ASN  Cloud
Source A     ✓     ✓      ✓     ✓     ✗
Source B     ✓     ✓      ✗     ✗     ✗
```

**License Compatibility**: Quick view of usage rights
```
                Commercial  Derivative  Redistribution
Source A (MIT)       ✓          ✓            ✓
Source B (CC-NC)     ✗          ✓            ✗
```

### Identify Patterns
- **Redundant**: Multiple sources for same data (use best quality/license)
- **Complementary**: Different networks or signals (combine for coverage)
- **Hierarchical**: Different granularities (use coarse for overview, fine for detail)
- **Dependent**: Some derive from others (watch for cascading issues)

---

## Example Well-Structured Projects

### 1. Data Provenance Initiative
- **Repo**: https://github.com/Data-Provenance-Initiative/Data-Provenance-Collection
- **Strengths**: Template JSON, standardized vocabularies, multi-source IDs
- **Apply**: Use template approach, separate identifier/characteristics/provenance

### 2. Social Science Data Editors
- **URL**: https://social-science-data-editors.github.io/template_README/
- **Strengths**: Replication-focused, clear sections, endorsed by major journals
- **Apply**: Data availability statements, computational requirements docs

### 3. AWS Public Blockchain Data
- **Repo**: https://github.com/awslabs/open-data-registry
- **Strengths**: YAML format, standardized schema, managed datasets
- **Apply**: Tag datasets, document update frequency, include direct URIs

### 4. "Multiple Sides of 36 Coins" (2025)
- **Paper**: https://arxiv.org/html/2511.15388v1
- **Strengths**: Transparent methodology, multi-network, limitations acknowledged
- **Apply**: Document crawler specs, provide exact metric formulas, cross-validate

---

## Recommended Workflow for Geobeat

### Phase 1: Initial Reconnaissance (Current)
1. Identify sources via web search, papers, GitHub
2. Fill basic inventory fields (name, URL, networks, type, license)
3. Prioritize: High (v0 candidates), Medium (v1+), Low (reference only)
4. Document in `sources.json` with known fields, mark unknowns

### Phase 2: Deep Evaluation (High-Priority Only)
1. Test access (can we actually get the data?)
2. Fetch sample data (example responses/files)
3. Quality assessment (methodology, coverage, accuracy)
4. License review (read full ToS, identify restrictions)
5. Integration test (proof-of-concept ingestion code)

### Phase 3: Comparative Analysis
1. Coverage matrix (which networks well-covered?)
2. Overlap analysis (redundant vs complementary)
3. Dependency mapping (hubs and relationships)
4. Trade-off documentation (major decision points)

### Phase 4: Selection and Integration
1. Final selection for v0 (document rationale)
2. License compliance (attribution, restrictions)
3. Build data pipelines
4. Cross-validation (sanity checks, compare sources)
5. Update inventory with integration notes

---

## Critical Questions for Each Data Source

### Data Quality
- ✓ What's actually being measured? (full network or subset?)
- ✓ How is geography determined? (GeoIP provider? version?)
- ✓ How current is the data? (last update? frequency?)
- ✓ What's missing? (NAT nodes? IPv6? regions?)
- ✓ Can we validate it? (cross-reference other sources?)

### Licensing
- ✓ Is there an explicit license?
- ✓ Can we use it commercially?
- ✓ Can we redistribute or publish derived data?
- ✓ Are there attribution requirements?
- ✓ What are the API rate limits?

### Integration
- ✓ Can we access the data programmatically?
- ✓ Is the format usable (JSON, CSV, Parquet)?
- ✓ Is there documentation for the schema?
- ✓ How much effort to integrate?
- ✓ Are there dependencies on other sources?

---

## Documentation Requirements

### For Each Data Source
Create `data/assessments/[source-id]/` with:

1. **quality_report.md**:
   - Methodology assessment
   - Coverage and accuracy estimates
   - Known limitations and biases
   - Cross-validation results

2. **sample_data.json**:
   - Example API response or dataset snippet
   - Schema documentation
   - Field descriptions

3. **integration_notes.md**:
   - How to access (API keys, endpoints)
   - Code examples
   - Gotchas and workarounds
   - Performance considerations

### For the Project
- **sources.json**: Machine-readable catalog
- **comparison_matrix.md**: Cross-source analysis
- **LICENSES.md**: All licenses and attribution
- **README.md**: How to use the inventory

---

## Key Takeaways

1. **Always document GeoIP provider and version** - accuracy depends on this
2. **Country-level data is reliable; city-level is approximate** - use appropriate granularity
3. **No license = no permission** - get explicit license or avoid
4. **NAT/firewall bias is universal** - acknowledge counts are lower bounds
5. **Cross-validate with multiple sources** - no single source is perfect
6. **Document limitations prominently** - transparency builds credibility
7. **Prefer time-series over snapshots** - captures network dynamics
8. **Check data freshness** - blockchain networks evolve rapidly
9. **Test before committing** - verify access and data quality
10. **Track dependencies** - know which sources rely on others

---

## Quick Links

- **Full Best Practices**: `/research/DATA_SOURCE_BEST_PRACTICES.md`
- **Resource Library**: `/research/RESOURCES.md`
- **Data Inventory Template**: `/data/templates/source_template.json` (to be created)
- **Assessment Template**: `/data/templates/assessment_template.md` (to be created)

---

## References Summary

**Academic Standards**:
- Multiple Sides of 36 Coins (2025): Multi-network P2P measurement methodology
- NodeMaps (2022): Framework for blockchain node decentralization
- PLOS ONE Bitcoin Study (2023): Statistical analysis of backbone nodes

**Metadata Standards**:
- Data Provenance Initiative: JSON-based provenance cards
- Social Science Data Editors: README template for replication
- Dublin Core: 15-element metadata standard
- W3C PROV-DM: Provenance data model

**GeoIP Services**:
- MaxMind GeoIP2: Industry standard, accuracy benchmarks documented
- IP2Location, IPinfo: Alternative providers
- VPN Detection: IP2Proxy, IPHub, MaxMind services

**Tools**:
- OpenMetadata, DataHub, Apache Atlas: Full-featured catalogs
- RIPE Atlas: Gold standard for internet measurement
- CAIDA: Authoritative AS/BGP data

**Blockchain Data Examples**:
- AWS Public Blockchain: Multi-chain Parquet datasets
- EllipticPlusPlus: Bitcoin graph dataset with documentation
- Blockchain ETL: Public datasets in BigQuery
