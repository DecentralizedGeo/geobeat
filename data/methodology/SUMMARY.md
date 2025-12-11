# Research Summary: Blockchain Data Source Best Practices

> **⚠️ METHODOLOGY REFERENCE**
> This summarizes the **methodology research** (how to evaluate datasets), NOT actual findings.
> For actual data source evaluations, see `../INVENTORY.md` (to be created).

**Date**: 2025-11-22
**Research Focus**: Best practices for data source reconnaissance and cataloging in blockchain/Web3 contexts, with emphasis on geographic decentralization analysis

---

## What Was Researched

This research compiled industry best practices, academic standards, and real-world examples for:

1. Evaluating blockchain node explorer APIs and datasets
2. Documenting data source inventories with appropriate metadata standards
3. Measuring geographic decentralization in P2P networks
4. Using GeoIP data responsibly with full understanding of limitations
5. Avoiding common pitfalls in blockchain data source evaluation
6. Selecting tools and frameworks for data cataloging
7. Structuring comparative analysis of multiple data sources

---

## Key Deliverables Created

### 1. Comprehensive Best Practices Guide
**Location**: `/Users/x25bd/Code/astral/geobeat/research/DATA_SOURCE_BEST_PRACTICES.md`

60+ page comprehensive guide covering:
- Complete dataset inventory structure with required/recommended fields
- API evaluation criteria and blockchain-specific considerations
- Geographic decentralization measurement standards from academic research
- GeoIP accuracy expectations and limitations (MaxMind benchmarks)
- Common pitfalls (biases, temporal issues, licensing traps)
- Red flags for licensing and data quality
- Tools and frameworks (OpenMetadata, DataHub, etc.)
- Comparative analysis best practices
- 9 well-documented examples from leading projects

### 2. Quick Reference Guide
**Location**: `/Users/x25bd/Code/astral/geobeat/research/QUICK_REFERENCE.md`

Condensed reference with:
- Essential vs recommended inventory fields
- Geographic data quality red flags
- GeoIP accuracy table (country: 99.8%, city: 66% within 50km)
- Licensing quick reference (safe, cautious, restricted)
- Key decentralization metrics (HHI formula, thresholds)
- Common pitfalls checklist
- Recommended tools for different project scales
- Comparative analysis framework
- 4-phase evaluation workflow

### 3. Practical Templates
**Location**: `/Users/x25bd/Code/astral/geobeat/data/templates/`

Ready-to-use templates:
- **source_template.json**: Complete JSON template with all fields, inline documentation, and type options
- **assessment_template.md**: 12-section quality assessment template with checklists and examples

### 4. Updated Project Documentation
**Location**: `/Users/x25bd/Code/astral/geobeat/data/README.md`

Enhanced data directory README with:
- Inventory and assessment directory structure
- Quick start guide for adding sources
- 4-phase evaluation process overview
- Quality standards and guidelines
- Links to comprehensive documentation

---

## Key Findings and Recommendations

### Recommended Dataset Inventory Structure

**Essential Fields** (Required):
- **id**: Unique identifier (kebab-case)
- **name**: Human-readable name
- **url**: Primary access point
- **networks**: List of blockchain networks covered
- **type**: API (REST/GraphQL/WebSocket), static dataset, code-only, explorer-only
- **signals**: IP addresses, geographic fields, ASN/ISP data availability
- **license**: License type and restrictions
- **last_updated**: Most recent data timestamp
- **limitations**: Known biases and gaps

**High-Value Fields** (Recommended):
- **data_provenance**: Collection method, GeoIP provider, vantage points
- **temporal**: Snapshot vs time-series, update frequency
- **quality_metrics**: Coverage estimates, accuracy assessments
- **priority**: High/medium/low for your project

**Format Recommendation**: JSON or YAML files in Git for version control, with JSON Schema validation

### Node/Peer Geographic Data: Key Considerations

**Critical Questions**:
1. What's actually being measured? (full network or reachable nodes only?)
2. How is geography determined? (GeoIP provider and version?)
3. How current is the data? (last update, frequency?)
4. What's missing? (NAT nodes, IPv6, specific regions?)
5. Can we validate it? (cross-reference with other sources?)

**Universal Biases to Document**:
- **Reachability bias**: NAT/firewall nodes excluded (counts are lower bounds)
- **Single vantage point**: May miss geographically distant peers
- **Client diversity**: Some crawlers only work with specific implementations
- **Temporal sampling**: Snapshots miss churn and diurnal patterns

**GeoIP Accuracy Expectations** (MaxMind GeoIP2):
- **Country**: 99.8% (very reliable)
- **State/Region**: ~80% for U.S. (variable elsewhere)
- **City**: 66% within 50km radius (accuracy degrades significantly)
- **Street-level**: IMPOSSIBLE - GeoIP never precise enough for households

**Specific Challenges**:
- VPNs/Proxies obscure real locations completely
- Mobile networks: IPs used across large areas
- Rural areas: Often misattributed to nearest city
- Cloud/data centers: Shows server location, not operator (may be what you want!)

### Licensing Red Flags

**Immediate Disqualifiers**:
- No license (all rights reserved)
- Non-commercial only (if commercializing)
- No redistribution allowed
- Scraping prohibited in ToS
- Data must be deleted after X days

**Proceed with Caution**:
- CC-BY-SA (share-alike may complicate licensing)
- GPL/AGPL (copyleft considerations)
- Unknown license (contact author)
- Very restrictive rate limits
- Terms can change without notice

**Safe for Most Uses**:
- MIT, BSD, Apache 2.0
- CC0 or CC-BY
- Explicit research/academic use permission

### Industry Standards for Geographic Decentralization

Based on academic consensus from recent peer-reviewed research:

**1. Country-Level Distribution**
- Metric: % of nodes per country
- Benchmark: "Top N countries host X% of nodes"
- Example from Bitcoin: "Top 9 countries host 80% of nodes"

**2. Autonomous System Concentration (HHI)**
- Formula: HHI = Σ(market_share_i)²
- Thresholds:
  - HHI < 0.01: Unconcentrated (Bitcoin ≈ 0.001)
  - 0.01 ≤ HHI < 0.15: Moderate concentration
  - HHI ≥ 0.15: Highly concentrated

**3. Cloud Provider Concentration**
- % nodes on major cloud providers (AWS, GCP, Azure)
- Single-provider failure domain analysis
- Track trends over time

**4. Regional/Continental Distribution**
- Shannon entropy, Simpson's diversity index
- UN geographic regions or continents

**Measurement Methodology Standards** (from "Multiple Sides of 36 Coins", 2025):
- Use geographically distributed crawlers (minimize bias)
- Stagger crawl schedules (DHT: hourly, Bitcoin-like: daily, Ethereum: 4-6 hours)
- Active crawling + connectivity verification (24-hour window)
- Internet-wide scanning as complement (IPv4 address space)
- Cross-validate with multiple sources

### Common Pitfalls to Avoid

**Coverage Biases**:
- Single vantage point (underestimates global distribution)
- Reachability bias (NAT/firewall nodes missing - document as "lower bound")
- Client diversity bias (some crawlers work only with specific clients)
- Discovery protocol bias (DHT vs DNS seeds yield different node sets)

**Temporal Issues**:
- Data staleness (>3 months often unreliable for fast-moving networks)
- Using current GeoIP for historical IPs (incorrect attributions)
- Single snapshot missing churn/diurnal patterns

**Quality Red Flags**:
- No methodology documentation
- Unrealistic precision claims (exact addresses from IPs)
- No limitations acknowledged
- Orphaned projects (last update >2 years ago)
- No GeoIP provider documented

**Licensing Pitfalls**:
- Ambiguous or missing licenses (no license = no permission)
- Non-commercial restrictions when planning commercialization
- API ToS violations (rate limits, scraping bans, redistribution restrictions)
- Database rights in EU (sui generis protection)
- GeoIP licensing (MaxMind GeoLite2 is CC-BY-SA, commercial versions require license)

### Recommended Tools and Frameworks

**For Geobeat v0** (Small/Medium Project):
- **Catalog Format**: JSON or YAML files in Git
- **Schema Validation**: JSON Schema
- **Documentation**: Markdown with tables
- **Version Control**: Git for tracking changes
- **GeoIP**: MaxMind GeoLite2 (free, CC-BY-SA, 99.8% country accuracy)

**If Scaling to Enterprise**:
- **OpenMetadata**: Full-featured with lineage, observability, governance
- **DataHub**: LinkedIn's platform, strong lineage tracking
- **Apache Atlas**: Hadoop ecosystem integration

**Network Data Sources**:
- **ASN/BGP**: CAIDA (authoritative), RIPE RIS, RouteViews
- **Internet Measurement**: RIPE Atlas (gold standard)
- **Scanning**: Censys, Shodan

### Comparative Analysis Best Practices

**Key Questions to Answer**:
1. Which networks have good existing coverage? Which have gaps?
2. Where are there overlaps or dependencies between sources?
3. Are there clear "hubs" that many others rely on?
4. What are the major trade-offs? (quality vs accessibility, freshness vs depth)

**Create These Matrices**:
- **Coverage Matrix**: Sources (rows) × Networks (columns)
- **Signal Availability**: Sources (rows) × Signals (columns) - IPs, country, city, ASN, cloud
- **License Compatibility**: Quick view of usage rights
- **Dependency Graph**: Which sources derive from others

**Identify Patterns**:
- **Redundant**: Multiple sources for same data (use best quality/license)
- **Complementary**: Different networks or signals (combine for coverage)
- **Hierarchical**: Different granularities (coarse for overview, fine for detail)
- **Dependent**: Some derive from others (watch for cascading issues)

### Well-Structured Project Examples

**1. Data Provenance Initiative**
- Repo: https://github.com/Data-Provenance-Initiative/Data-Provenance-Collection
- Template JSON with standardized vocabularies
- Separate identifier/characteristics/provenance sections
- Apply: Use template approach for consistency

**2. Social Science Data Editors**
- URL: https://social-science-data-editors.github.io/template_README/
- Replication-focused, endorsed by major journals
- Data availability and provenance statements
- Apply: Clear sections, computational requirements docs

**3. AWS Public Blockchain Data**
- Repo: https://github.com/awslabs/open-data-registry
- YAML format, standardized schema
- Apply: Tag datasets, document update frequency, direct URIs

**4. "Multiple Sides of 36 Coins" (2025 Academic Paper)**
- Paper: https://arxiv.org/html/2511.15388v1
- Transparent methodology, 36 cryptocurrencies measured
- Apply: Document crawler specs, exact formulas, cross-validate, acknowledge limitations

**5. EllipticPlusPlus Dataset**
- Repo: https://github.com/git-disl/EllipticPlusPlus
- Jupyter notebooks for exploration
- Apply: Provide examples, not just raw data

---

## Recommended Workflow for Geobeat

### Phase 1: Initial Reconnaissance (Current)
1. Identify sources via web search, papers, GitHub
2. Fill basic inventory fields (use `source_template.json`)
3. Prioritize: High (v0 candidates), Medium (v1+), Low (reference)
4. Document in inventory, mark unknowns explicitly

### Phase 2: Deep Evaluation (High-Priority Only)
1. Test access (can we get the data?)
2. Fetch sample data
3. Complete quality assessment (`assessment_template.md`)
4. Read full license/ToS, identify restrictions
5. Proof-of-concept integration code

### Phase 3: Comparative Analysis
1. Coverage matrix (which networks well-covered?)
2. Overlap analysis (redundant vs complementary)
3. Dependency mapping (identify hubs)
4. Trade-off documentation

### Phase 4: Selection and Integration
1. Final selection for v0 (document rationale)
2. License compliance (attribution, restrictions)
3. Build pipelines
4. Cross-validation
5. Update inventory with integration notes

---

## Key Takeaways (Top 10)

1. **Always document GeoIP provider and version** - accuracy depends on this
2. **Country-level data is reliable; city-level is approximate** - use appropriate granularity
3. **No license = no permission** - get explicit license or avoid
4. **NAT/firewall bias is universal** - acknowledge counts are lower bounds
5. **Cross-validate with multiple sources** - no single source is perfect
6. **Document limitations prominently** - transparency builds credibility
7. **Prefer time-series over snapshots** - captures network dynamics
8. **Check data freshness** - blockchain networks evolve rapidly (>3 months = stale)
9. **Test before committing** - verify access and data quality
10. **Track dependencies** - know which sources rely on others

---

## Sources and References

### Academic Papers
- [Multiple Sides of 36 Coins: Measuring P2P Infrastructure](https://arxiv.org/html/2511.15388v1) (2025)
- [Measuring node decentralisation in blockchain peer to peer networks](https://www.sciencedirect.com/science/article/pii/S2096720922000501) (2022)
- [Statistical and clustering analysis of Bitcoin backbone nodes](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0292841) (PLOS ONE, 2023)
- [Nodes in the Bitcoin Network: Comparative Measurement Study](https://www.researchgate.net/publication/332770016_Nodes_in_the_Bitcoin_Network_Comparative_Measurement_Study_and_Survey) (2019)

### Standards and Templates
- [Data Provenance Initiative](https://github.com/Data-Provenance-Initiative/Data-Provenance-Collection)
- [Social Science Data Editors Template README](https://social-science-data-editors.github.io/template_README/template-README.html)
- [Research Data Alliance Metadata Standards Directory](https://rd-alliance.github.io/metadata-directory/standards/)
- W3C PROV-DM Provenance Data Model

### Data Catalog Tools
- [OpenMetadata](https://open-metadata.org/)
- [DataHub](https://datahub.com/)
- [Apache Atlas](https://atlas.apache.org/)
- [Amundsen](https://www.amundsen.io/)
- [Magda](https://magda.io/)

### GeoIP and Network Data
- [MaxMind GeoIP2 Accuracy Documentation](https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy)
- [IPinfo](https://ipinfo.io/)
- [CAIDA AS Relationships](https://www.caida.org/)
- [RIPE Atlas](https://atlas.ripe.net/)

### Blockchain Data Examples
- [AWS Public Blockchain Data](https://github.com/awslabs/open-data-registry)
- [EllipticPlusPlus Dataset](https://github.com/git-disl/EllipticPlusPlus)
- [Blockchain ETL Public Datasets](https://github.com/blockchain-etl/public-datasets)

---

## Next Steps for Geobeat

### Immediate (Phase 1: Reconnaissance)
1. Use `source_template.json` to document seed sources from `/data/RESEARCH.md`
2. Search for data sources for priority networks (ETHGlobal sponsors)
3. Fill inventory with basic information, mark unknowns
4. Prioritize sources as high/medium/low for v0

### Short-term (Phase 2: Deep Evaluation)
1. Select top 3-5 high-priority sources
2. Complete full quality assessments
3. Test API access and retrieve sample data
4. Review licenses in detail
5. Build proof-of-concept integrations

### Medium-term (Phase 3: Comparative Analysis)
1. Create coverage matrix for priority networks
2. Identify overlaps and dependencies
3. Document trade-offs
4. Write comparative analysis section

### Long-term (Phase 4: Selection and Integration)
1. Final source selection for v0
2. License compliance documentation (`/LICENSES.md`)
3. Production data pipelines
4. Cross-validation and quality checks
5. Public documentation of methodology

---

## File Locations

All research and templates are in the Geobeat repository:

### Research Documentation
- `/Users/x25bd/Code/astral/geobeat/research/DATA_SOURCE_BEST_PRACTICES.md` - Comprehensive guide (60+ pages)
- `/Users/x25bd/Code/astral/geobeat/research/QUICK_REFERENCE.md` - Quick reference
- `/Users/x25bd/Code/astral/geobeat/research/RESOURCES.md` - Bibliography (existing)
- `/Users/x25bd/Code/astral/geobeat/research/SUMMARY.md` - This file

### Templates and Structure
- `/Users/x25bd/Code/astral/geobeat/data/templates/source_template.json` - Source inventory template
- `/Users/x25bd/Code/astral/geobeat/data/templates/assessment_template.md` - Quality assessment template
- `/Users/x25bd/Code/astral/geobeat/data/README.md` - Updated data directory guide
- `/Users/x25bd/Code/astral/geobeat/data/inventory/` - For source catalog
- `/Users/x25bd/Code/astral/geobeat/data/assessments/` - For quality reports

---

## Research Methodology

This research was conducted by:
1. **Web search** for current best practices (2024-2025)
2. **Academic literature review** of P2P network measurement
3. **Standards analysis** (metadata standards, provenance frameworks)
4. **Tool evaluation** (open source data catalog platforms)
5. **Example project analysis** (well-documented datasets and research)
6. **GeoIP accuracy research** (MaxMind, IP2Location documentation)
7. **Licensing analysis** (Creative Commons, open source, API ToS)

All sources are cited with URLs throughout the documentation for validation and deeper exploration.

---

**Research Completed**: 2025-01-22
**Research Scope**: Comprehensive best practices for blockchain data source reconnaissance and cataloging
**Status**: Ready for immediate application to Geobeat project
