# Data Source Evaluation Checklist

Use this checklist when evaluating each blockchain node data source for Geobeat.

---

## Quick Evaluation Checklist

### Basic Information
- [ ] Unique ID assigned (kebab-case)
- [ ] Full name documented
- [ ] Primary URL recorded
- [ ] Networks covered listed
- [ ] Data type classified (API/dataset/code/explorer)

### Data Signals
- [ ] IP addresses available? (yes/no/partial)
- [ ] Geographic fields available? (document which: country/city/lat-lon)
- [ ] ASN/ISP data available? (yes/no)
- [ ] Cloud provider attribution? (yes/no)
- [ ] Additional metadata? (client version, uptime, etc.)

### Temporal Characteristics
- [ ] Type identified (snapshot/timeseries/streaming)
- [ ] Last update date recorded
- [ ] Update frequency documented
- [ ] Staleness assessed (current/acceptable/stale/very-stale)

### Data Provenance
- [ ] Collection method documented
- [ ] GeoIP provider identified
- [ ] GeoIP version/date noted
- [ ] Vantage points documented
- [ ] Dependencies identified (derived from other sources?)

### Licensing
- [ ] License type identified
- [ ] License URL recorded
- [ ] Commercial use allowed? (yes/no/unknown)
- [ ] Attribution required? (yes/no/unknown)
- [ ] Redistribution allowed? (yes/no/unknown)
- [ ] API rate limits documented (if applicable)
- [ ] Red flags identified and noted

### Quality Assessment
- [ ] Methodology documented or evaluated
- [ ] Coverage estimate noted
- [ ] Known biases documented
- [ ] Limitations listed
- [ ] Validation approach noted

### Priority and Status
- [ ] Priority assigned (high/medium/low)
- [ ] Status updated (identified/evaluating/evaluated/integrated/rejected)
- [ ] v0 candidate? (yes/no)
- [ ] Assessment date recorded
- [ ] Assessor name noted

---

## Deep Evaluation Checklist (High-Priority Sources Only)

### Access Testing
- [ ] Tested API/download access
- [ ] Authentication successful (if required)
- [ ] Sample data retrieved
- [ ] Sample data saved to `assessments/[source-id]/sample_data.json`
- [ ] Response time acceptable (<100ms for APIs ideal)

### Quality Assessment
- [ ] Full assessment completed using `assessment_template.md`
- [ ] Methodology understood and documented
- [ ] Coverage estimate validated or challenged
- [ ] Accuracy claims verified where possible
- [ ] Biases explicitly documented

### License Review
- [ ] Full license text read
- [ ] Terms of service read (for APIs)
- [ ] Commercial use compatibility confirmed
- [ ] Attribution requirements understood
- [ ] Redistribution rights clear
- [ ] Rate limits acceptable
- [ ] No deal-breaker clauses found

### Integration Assessment
- [ ] Integration complexity estimated (low/medium/high)
- [ ] Dependencies identified
- [ ] Proof-of-concept code written
- [ ] Performance acceptable
- [ ] Error handling tested
- [ ] Integration notes documented

### Validation
- [ ] Cross-checked with other sources
- [ ] Node count compared to reference sources (±20% acceptable)
- [ ] Geographic distribution spot-checked
- [ ] Sample IPs manually validated
- [ ] Outliers investigated
- [ ] Validation results documented

---

## Comparative Analysis Checklist

### Coverage Analysis
- [ ] Coverage matrix created (sources × networks)
- [ ] Signal availability matrix created (sources × signals)
- [ ] Gaps identified for priority networks
- [ ] Complementary sources identified
- [ ] Redundant sources identified

### Relationship Mapping
- [ ] Dependencies documented (which sources derive from others)
- [ ] Hubs identified (sources many others rely on)
- [ ] Overlaps documented
- [ ] Unique capabilities noted

### Trade-off Analysis
- [ ] Quality vs accessibility trade-offs documented
- [ ] Freshness vs depth trade-offs noted
- [ ] Licensing compatibility assessed across sources
- [ ] Integration effort compared
- [ ] Recommendations for specific use cases

---

## Red Flag Checklist

### Data Quality Red Flags
- [ ] **CRITICAL**: No methodology documentation
- [ ] **CRITICAL**: No GeoIP provider documented
- [ ] **CRITICAL**: Claims exact street addresses from IPs
- [ ] **WARNING**: Data > 6 months old without updates
- [ ] **WARNING**: City-level data without accuracy radius
- [ ] **WARNING**: No acknowledgment of NAT/firewall limitations
- [ ] **WARNING**: Single vantage point not mentioned
- [ ] **WARNING**: No validation methodology
- [ ] **INFO**: IPv6 coverage unknown or very low
- [ ] **INFO**: Client diversity bias possible

### Licensing Red Flags
- [ ] **CRITICAL**: No license (all rights reserved)
- [ ] **CRITICAL**: Non-commercial only (if planning to commercialize)
- [ ] **CRITICAL**: No redistribution allowed
- [ ] **CRITICAL**: "No automated access" clause
- [ ] **CRITICAL**: Must delete data after X days
- [ ] **WARNING**: CC-BY-SA (share-alike complications)
- [ ] **WARNING**: GPL/AGPL (copyleft considerations)
- [ ] **WARNING**: Unknown license (need to contact author)
- [ ] **WARNING**: Very restrictive rate limits
- [ ] **WARNING**: Broad indemnification clauses
- [ ] **INFO**: Attribution required (standard, manageable)

### Reliability Red Flags
- [ ] **CRITICAL**: Project abandoned (>2 years no updates)
- [ ] **CRITICAL**: Links to dead websites
- [ ] **WARNING**: No maintainer contact info
- [ ] **WARNING**: No issue tracker or support
- [ ] **WARNING**: Documentation refers to deprecated protocols
- [ ] **INFO**: Last update >6 months (may just be stable)

---

## Geographic Data Quality Checklist

### GeoIP Attribution
- [ ] GeoIP provider documented (MaxMind, IP2Location, etc.)
- [ ] Database version/date recorded
- [ ] Database age assessed (<3 months ideal)
- [ ] Accuracy claims realistic for granularity
- [ ] Accuracy radius provided (for city-level)
- [ ] VPN/proxy detection mentioned or available

### Expected Accuracy (for MaxMind GeoIP2)
- [ ] Country-level: Expect 99.8% accuracy (very reliable)
- [ ] State/Region: Expect ~80% for U.S. (lower elsewhere)
- [ ] City: Expect 66% within 50km (limited reliability)
- [ ] Lat/Lon: Expect wide radius (few km to 1000km)
- [ ] Never expect street-level precision (impossible)

### Known GeoIP Limitations Documented
- [ ] VPNs/proxies obscure locations
- [ ] Mobile networks use IPs across large areas
- [ ] Rural areas often misattributed to cities
- [ ] Cloud/data center location may not equal operator location
- [ ] Dynamic IPs change frequently
- [ ] IPv6 may have different coverage than IPv4

### Blockchain-Specific Considerations
- [ ] NAT/firewall bias acknowledged (lower bound on node count)
- [ ] Reachability testing method documented
- [ ] Single vs multi-vantage point noted
- [ ] Discovery protocol documented (getaddr, DHT, etc.)
- [ ] Client diversity bias assessed
- [ ] Temporal sampling strategy clear (hourly/daily/etc.)

---

## Decision Checklist

### v0 Integration Decision
- [ ] Covers priority networks for v0
- [ ] Data quality acceptable
- [ ] License compatible with Geobeat goals
- [ ] Integration effort reasonable
- [ ] No critical red flags
- [ ] Decision documented with rationale

### If Integrating
- [ ] API key obtained (if needed)
- [ ] Sample dataset downloaded
- [ ] Ingestion code implemented
- [ ] Update schedule planned
- [ ] Attribution requirements documented
- [ ] Added to `/LICENSES.md` (when created)
- [ ] Integration notes updated

### If Not Integrating
- [ ] Reason for rejection documented
- [ ] Consider for v1+? (yes/no)
- [ ] Alternative sources identified
- [ ] Lessons learned noted

---

## Documentation Checklist

### Source Entry in Inventory
- [ ] Added to `data/inventory/sources.json`
- [ ] All required fields completed
- [ ] Unknown fields marked as "unknown" not guessed
- [ ] Priority and status current
- [ ] Assessment date included

### Assessment Directory (High-Priority)
- [ ] Directory created: `data/assessments/[source-id]/`
- [ ] `quality_report.md` completed
- [ ] `sample_data.json` included
- [ ] `integration_notes.md` created (if integrating)

### Comparison Documentation
- [ ] Added to coverage matrix
- [ ] Added to signal availability matrix
- [ ] Dependencies noted in dependency graph
- [ ] Trade-offs documented

### License Compliance
- [ ] License details in source entry
- [ ] Attribution requirements clear
- [ ] Added to centralized `/LICENSES.md`
- [ ] Compliance strategy documented

---

## Validation Checklist

### Cross-Source Validation
- [ ] Node count compared to reference (±20% acceptable)
- [ ] Top countries compared to other sources
- [ ] Geographic distribution sanity-checked
- [ ] ASN data compared to authoritative sources (CAIDA, RIPE)
- [ ] Outliers investigated and explained

### Self-Consistency Checks
- [ ] Timestamps logical and consistent
- [ ] No impossible locations
- [ ] No duplicate IPs with conflicting metadata
- [ ] Node counts stable over time (or churn explained)
- [ ] Geographic distribution plausible

### Sample Testing
- [ ] 10+ IPs manually geolocated
- [ ] ASN lookup for sample IPs
- [ ] Cloud provider detection tested
- [ ] VPN/proxy flags checked (if available)
- [ ] Anomalies investigated

---

## Timeline Tracking

### Phase 1: Initial Reconnaissance
- [ ] Source identified (date: ________)
- [ ] Basic information documented
- [ ] Priority assigned
- [ ] Added to inventory

### Phase 2: Deep Evaluation (High-Priority Only)
- [ ] Access tested (date: ________)
- [ ] Sample data retrieved
- [ ] Quality assessment completed
- [ ] License reviewed
- [ ] Integration tested

### Phase 3: Comparative Analysis
- [ ] Added to coverage matrix
- [ ] Relationships mapped
- [ ] Trade-offs documented

### Phase 4: Selection and Integration
- [ ] Final decision made (date: ________)
- [ ] Integration complete (if selected)
- [ ] Validation complete
- [ ] Documentation finalized

---

## Quick Status Codes

Use these status codes in the inventory:

- **identified**: Just discovered, basic info only
- **evaluating**: Deep evaluation in progress
- **evaluated**: Assessment complete, decision pending
- **integrated**: Successfully integrated into Geobeat
- **rejected**: Evaluated and not suitable

---

## Priority Guidelines

### High Priority
- Covers priority networks (ETHGlobal sponsors)
- High data quality
- Permissive licensing
- Regular updates (< 3 months)
- Good documentation

### Medium Priority
- Covers some priority networks
- Acceptable quality with limitations
- License compatible but may have restrictions
- Updates less frequent (3-6 months)
- Moderate documentation

### Low Priority
- No priority network coverage, but informative
- Reference only, not for direct use
- Interesting methodology
- Historical context

---

## Notes Section

Use this space for additional observations, questions, or follow-up items:

**Source**: ___________________________

**Notes**:
-
-
-

**Questions**:
-
-

**Follow-up**:
- [ ]
- [ ]
- [ ]

**Last Updated**: ___________
**Updated By**: ___________
