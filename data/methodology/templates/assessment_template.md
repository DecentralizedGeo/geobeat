# Data Source Quality Assessment: [Source Name]

**Source ID**: `source-identifier`
**Assessment Date**: YYYY-MM-DD
**Assessed By**: Name
**Status**: Identified | Evaluating | Evaluated | Integrated | Rejected

---

## Executive Summary

**Quick Assessment**: 1-2 sentence summary of this source's value and fitness for Geobeat v0.

**Recommendation**:
- [ ] High priority for v0 integration
- [ ] Medium priority (v1+ candidate)
- [ ] Low priority (reference only)
- [ ] Reject (unsuitable)

**Key Strengths**:
- Strength 1
- Strength 2

**Key Limitations**:
- Limitation 1
- Limitation 2

---

## 1. Source Overview

### Basic Information
- **Name**: Full source name
- **URL**: https://...
- **Type**: API / Static Dataset / Code-only / Explorer-only
- **Networks Covered**: List blockchain networks
- **Last Updated**: Date of most recent data
- **Maintained**: Active | Dormant | Abandoned

### Documentation Quality
- [ ] Comprehensive documentation exists
- [ ] Methodology clearly explained
- [ ] API reference available (if applicable)
- [ ] Examples provided
- [ ] Limitations acknowledged

**Notes**:

---

## 2. Data Coverage and Completeness

### Network Coverage
| Network | Coverage | Node Count | Confidence |
|---------|----------|------------|------------|
| Ethereum | ✓ | ~8,000 | High |
| Bitcoin | ✗ | - | - |

### Signal Availability
| Signal | Available | Format/Details |
|--------|-----------|----------------|
| IP Addresses | ✓ / ✗ / Partial | IPv4, IPv6, hashed, etc. |
| Country | ✓ / ✗ | ISO 3166-1 alpha-2 |
| City | ✓ / ✗ | City name or coordinates |
| Latitude/Longitude | ✓ / ✗ | Decimal degrees |
| Accuracy Radius | ✓ / ✗ | Kilometers |
| ASN | ✓ / ✗ | Autonomous System Number |
| ISP/Hosting Provider | ✓ / ✗ | Provider name or code |
| Cloud Provider | ✓ / ✗ | AWS, GCP, Azure, etc. |
| Client Version | ✓ / ✗ | Software version string |
| Uptime/Availability | ✓ / ✗ | Percentage or hours |

### Coverage Estimate
- **Estimated % of Network Captured**: X%
- **Basis for Estimate**: How was this determined?
- **Missing Segments**: NAT/firewall nodes, specific regions, client types, etc.

---

## 3. Methodology Assessment

### Data Collection Method
- [ ] Active crawling (P2P discovery)
- [ ] Passive monitoring
- [ ] Internet-wide scanning
- [ ] Self-reporting / telemetry
- [ ] Aggregated from third-party sources
- [ ] Unknown / undocumented

**Details**: Describe the collection methodology in detail.

### Measurement Infrastructure
- **Number of Vantage Points**:
- **Vantage Point Locations**: Geographic distribution of measurement infrastructure
- **Crawl/Update Frequency**: Hourly, daily, weekly, etc.
- **Connectivity Verification**: How is node liveness tested?

### Geographic Attribution
- **GeoIP Provider**: MaxMind, IP2Location, IPinfo, unknown, etc.
- **Database Version**: Date or version number
- **Database Age**: How current is the GeoIP data?
- **VPN/Proxy Detection**: Yes / No / Unknown
- **Accuracy Claims**: Any stated accuracy levels?

### Network Infrastructure Attribution
- **ASN Data Source**: CAIDA, RIPE, RouteViews, etc.
- **Cloud Detection Method**: IP ranges, WHOIS, fingerprinting, etc.
- **ISP Identification**: How are ISPs determined?

---

## 4. Data Quality Analysis

### Accuracy Assessment
| Aspect | Assessment | Evidence |
|--------|------------|----------|
| Country-level geography | High / Medium / Low / Unknown | Cross-validated with X |
| City-level geography | High / Medium / Low / Unknown | Sample checks show... |
| ASN attribution | High / Medium / Low / Unknown | Compared to CAIDA |
| Node count vs ground truth | High / Medium / Low / Unknown | Within X% of Y |

### Known Biases
- [ ] Single vantage point bias
- [ ] Reachability bias (NAT/firewall)
- [ ] Client diversity bias
- [ ] Discovery protocol bias
- [ ] Temporal sampling bias
- [ ] Geographic coverage gaps

**Details**:

### Data Consistency
- [ ] Timestamps logical and consistent
- [ ] No duplicate IPs with conflicting metadata
- [ ] Geographic data plausible (no impossible locations)
- [ ] Node counts stable over time (or churn explained)

**Issues Found**:

### Outliers and Anomalies
**Examples**:
- Single node in [unusual location] - investigated, appears legitimate / likely error
- Sudden spike in [country] on [date] - correlated with [event]

---

## 5. Temporal Characteristics

### Data Type
- [ ] Single snapshot
- [ ] Multiple snapshots (irregular)
- [ ] Time series (regular intervals)
- [ ] Real-time / streaming

### Temporal Coverage
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD or "ongoing"
- **Total Duration**: X months/years
- **Number of Snapshots**: (if applicable)

### Update Frequency
- **Stated Frequency**: Hourly / Daily / Weekly / Unknown
- **Actual Frequency**: (verify by checking data)
- **Last Update**: YYYY-MM-DD
- **Staleness Assessment**: Current / Acceptable / Stale / Very Stale

### Temporal Resolution
- **Granularity**: Milliseconds / Seconds / Minutes / Hours / Days
- **Suitable For**: Real-time monitoring / Daily analysis / Trend analysis

---

## 6. Licensing and Access

### License
- **Type**: MIT, Apache 2.0, CC-BY, CC-BY-NC, GPL, Proprietary, Unknown
- **License URL**: https://...
- **License Text Reviewed**: ✓ / ✗

### Usage Rights
| Permission | Allowed? | Notes |
|------------|----------|-------|
| Commercial use | ✓ / ✗ / ? | |
| Modification | ✓ / ✗ / ? | |
| Distribution | ✓ / ✗ / ? | |
| Attribution required | ✓ / ✗ / ? | How to attribute |
| Share-alike | ✓ / ✗ / ? | Derivatives must use same license |

### Access Details
- **Registration Required**: Yes / No
- **API Key Required**: Yes / No
- **Approval Process**: Instant / X hours / X days
- **Cost**: Free / Freemium / Paid ($ amount)

### Terms of Service (API)
- **Rate Limits**: X requests per second/minute/day
- **Prohibited Uses**: List any restrictions
- **Data Retention**: Must data be deleted after X days?
- **Termination Clauses**: Under what conditions?
- **Changes to Terms**: Can provider change terms unilaterally?

### Red Flags
- [ ] No license (all rights reserved)
- [ ] Non-commercial only (CC-BY-NC or similar)
- [ ] No redistribution allowed
- [ ] Scraping prohibited
- [ ] Restrictive rate limits
- [ ] Must delete data after short period
- [ ] Ambiguous or contradictory terms

**Notes**:

---

## 7. Integration Assessment

### Access Testing
- **Date Tested**: YYYY-MM-DD
- **Access Method**: API call / Download / GitHub clone
- **Authentication**: Successful / Failed / Not tested
- **Sample Data Retrieved**: ✓ / ✗

### Technical Evaluation
- **Response Time**: Average X ms (if API)
- **Response Format**: JSON / CSV / Parquet / Other
- **Schema Documented**: ✓ / ✗
- **Pagination**: Supported / Not needed / Not supported
- **Bulk Export**: Available / Not available

### Integration Complexity
- [ ] **Low**: Simple API call or direct download, standard format
- [ ] **Medium**: Requires authentication, data transformation, or dependencies
- [ ] **High**: Complex setup, reverse engineering needed, or poor documentation

**Effort Estimate**: X hours/days for full integration

### Dependencies
**Required Tools/Libraries**:
- Dependency 1
- Dependency 2

**Derived From** (other sources this depends on):
- Source A (for GeoIP)
- Source B (for node discovery)

---

## 8. Cross-Validation

### Comparison with Other Sources
| Metric | This Source | Reference Source | Variance |
|--------|-------------|------------------|----------|
| Node count | X | Y (Source Z) | ±N% |
| Top country | [Country] at X% | [Country] at Y% | ±N% |

### Validation Results
- [ ] Node count within ±20% of reference
- [ ] Geographic distribution similar to other sources
- [ ] ASN data consistent with CAIDA/RIPE
- [ ] Spot-checked IPs have plausible geolocations

**Issues Found**:

---

## 9. Strengths and Weaknesses

### Strengths
1.
2.
3.

### Weaknesses
1.
2.
3.

### Comparison to Alternatives
**Better Than**: [Other sources] because...

**Worse Than**: [Other sources] because...

**Unique Capabilities**: What does this source provide that others don't?

---

## 10. Decision and Recommendations

### v0 Suitability
- [ ] **Yes - High Priority**: Meets all v0 requirements, integrate first
- [ ] **Yes - Medium Priority**: Meets requirements, integrate if time allows
- [ ] **No - v1+ Candidate**: Good source, but not critical for v0
- [ ] **No - Reference Only**: Informs methodology, but not used directly
- [ ] **Reject**: Unsuitable (poor quality, licensing issues, etc.)

### Rationale
Explain the decision based on:
- Coverage of priority networks
- Data quality and accuracy
- Licensing compatibility
- Integration effort
- Availability of alternatives

### Action Items
If integrating:
- [ ] Obtain API key / access
- [ ] Download sample dataset
- [ ] Implement ingestion code
- [ ] Set up update schedule
- [ ] Document attribution requirements
- [ ] Add to license compliance documentation

If not integrating:
- [ ] Document why rejected
- [ ] Note if should revisit for v1+
- [ ] Identify alternative sources

### Integration Notes
**Key Considerations**:
-
-

**Potential Issues**:
-
-

**Mitigation Strategies**:
-
-

---

## 11. Sample Data

### Example Response/Record
```json
{
  "example": "paste actual sample data here"
}
```

### Schema Documentation
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| field1 | string | ... | "example" |
| field2 | integer | ... | 12345 |

### Data Quality Observations
**From Sample**:
-
-

---

## 12. References and Links

### Official Resources
- Main website:
- Documentation:
- API reference:
- GitHub:
- Paper/Publication:

### Related Research
- Paper 1 that uses this source
- Paper 2 that compares this source

### Contact Information
- Maintainer:
- Support channel:
- Issue tracker:

---

## Appendix: Detailed Notes

### Testing Log
**[Date]**: Tested API access - successful, average response time 120ms
**[Date]**: Downloaded sample dataset - 5,000 records, all fields populated
**[Date]**: Cross-checked with ethernodes.org - within 10% on node count

### Questions / Uncertainties
- Question 1 that remains unanswered
- Question 2 to follow up on

### Follow-Up Actions
- [ ] Contact maintainer about X
- [ ] Re-evaluate in 3 months when new version releases
- [ ] Check if academic use qualifies for free tier
