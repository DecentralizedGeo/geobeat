# GEOBEAT Platform Architecture

**Version:** 1.0
**Last Updated:** 2025-12-09
**Domain:** geobeat.xyz

---

## System Overview

GEOBEAT is a geospatial analytics platform for decentralized networks, providing continuous monitoring and analysis of blockchain node geography to calculate Geographic Decentralization Index (GDI) metrics.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GEOBEAT PLATFORM                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              DATA COLLECTION LAYER (Ingestion)                │  │
│  │                  Server: geobeat-ingest                        │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  Armiarma   │  │   Bitnodes  │  │   Nebula    │          │  │
│  │  │  (libp2p)   │  │  API Client │  │  Crawler    │  [Future]│  │
│  │  │             │  │             │  │             │          │  │
│  │  │ - Ethereum  │  │ - Bitcoin   │  │ - Multi-    │          │  │
│  │  │ - Polygon   │  │             │  │   chain     │          │  │
│  │  │ - Filecoin  │  │             │  │             │          │  │
│  │  │ - Celo      │  │             │  │             │          │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │  │
│  │         │                 │                 │                  │  │
│  │         └─────────────────┴─────────────────┘                  │  │
│  │                           │                                     │  │
│  └───────────────────────────┼─────────────────────────────────────┘  │
│                              │                                         │
│  ┌───────────────────────────▼─────────────────────────────────────┐  │
│  │            DATA STORAGE LAYER (Time-Series DB)                  │  │
│  │                  Server: geobeat-ingest                          │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │  │
│  │  │  PostgreSQL  │  │  TimescaleDB │  │   Backups    │         │  │
│  │  │  (Raw Data)  │  │  [Future]    │  │  (S3/B2)     │         │  │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘         │  │
│  │         │                                                        │  │
│  └─────────┼────────────────────────────────────────────────────────┘  │
│            │                                                            │
│  ┌─────────▼────────────────────────────────────────────────────────┐  │
│  │        DATA PROCESSING LAYER (ETL/Analytics)                     │  │
│  │                  Server: geobeat-ingest                           │  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │ GDI Engine  │  │ Aggregation │  │ Geolocation │            │  │
│  │  │ (GeoIndex   │  │ (Daily/     │  │ Enrichment  │            │  │
│  │  │  Calc)      │  │  Weekly)    │  │ (MaxMind)   │            │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │  │
│  │         └─────────────────┴─────────────────┘                    │  │
│  │                           │                                       │  │
│  └───────────────────────────┼───────────────────────────────────────┘  │
│                              │                                           │
│  ┌───────────────────────────▼───────────────────────────────────────┐  │
│  │           APPLICATION LAYER (APIs & Services)                     │  │
│  │                  api.geobeat.xyz                                   │  │
│  │                  Server: geobeat-ingest                            │  │
│  │                                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │  REST API    │  │  GraphQL API │  │  WebSocket   │           │  │
│  │  │  (Public)    │  │  [Future]    │  │  [Future]    │           │  │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘           │  │
│  │         │                                                          │  │
│  └─────────┼──────────────────────────────────────────────────────────┘  │
│            │ HTTPS API Calls                                             │
│  ┌─────────▼──────────────────────────────────────────────────────────┐  │
│  │          PRESENTATION LAYER (Frontend)                             │  │
│  │                  app.geobeat.xyz                                    │  │
│  │                  Hosting: Vercel CDN                                │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │   GEOBEAT    │  │  Admin Panel │  │  Reporting   │            │  │
│  │  │  Dashboard   │  │  [Future]    │  │  [Future]    │            │  │
│  │  │  (Next.js)   │  │              │  │              │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │          MONITORING LAYER (Observability)                           │  │
│  │                  Server: geobeat-ingest                              │  │
│  │                                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │  Prometheus  │  │   Grafana    │  │    Alerts    │             │  │
│  │  │  (Metrics)   │  │  (Dashboards)│  │  (PagerDuty) │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Domain Architecture

### DNS Configuration (geobeat.xyz)

```
geobeat.xyz DNS Records:

┌─────────────────────────────────────────────────────────────┐
│  Subdomain              Type    Target                       │
├─────────────────────────────────────────────────────────────┤
│  @                      A       Vercel IP / CNAME            │
│  (root domain)                  → Redirects to app           │
│                                                               │
│  app.geobeat.xyz        CNAME   cname.vercel-dns.com         │
│  (primary frontend)              → Vercel CDN                 │
│                                                               │
│  api.geobeat.xyz        A       <HETZNER_IP>                 │
│  (REST API)                      → Hetzner CPX41             │
│                                                               │
│  grafana.geobeat.xyz    A       <HETZNER_IP>                 │
│  (monitoring)                    → SSH tunnel only (future)  │
│                                                               │
│  www.geobeat.xyz        CNAME   app.geobeat.xyz              │
│  (www redirect)                  → Canonical to app          │
└─────────────────────────────────────────────────────────────┘

SSL/TLS:
- app.geobeat.xyz: Managed by Vercel (auto-renewal)
- api.geobeat.xyz: Let's Encrypt via Certbot (auto-renewal)
```

---

## Infrastructure Components

### Server: geobeat-ingest (Hetzner CPX41)

**Hostname:** `geobeat-ingest-prod-01`
**Location:** Helsinki (HEL1) or Falkenstein (FSN1)
**Specs:** 8 vCPU, 16GB RAM, 240GB NVMe SSD
**OS:** Ubuntu 24.04 LTS
**Cost:** €23.90/month (~$26/month)

**Responsibilities:**
- Data collection (armiarma crawlers)
- Data storage (PostgreSQL time-series)
- Data processing (GDI calculations, aggregations)
- API endpoints (REST API for frontend)
- Monitoring (Prometheus, Grafana)

**Ports:**
```
External (UFW firewall):
  22/tcp   - SSH (key-based only)
  443/tcp  - HTTPS API (api.geobeat.xyz)
  9020/tcp - Ethereum P2P
  30303/tcp,udp - Polygon P2P/discovery
  30304/tcp - Celo P2P
  1347/tcp - Filecoin P2P

Internal (localhost only):
  5432     - PostgreSQL
  9080-9083 - Crawler metrics (Prometheus)
  9090     - Prometheus
  3000     - Grafana
```

---

### Frontend: app.geobeat.xyz (Vercel)

**Platform:** Vercel (Next.js)
**Repository:** github.com/DecentralizedGeo/geobeat
**Branch:** `main` (auto-deploy)
**Region:** Global CDN (edge locations worldwide)
**Cost:** $0 (free tier) → $20/month (Pro if needed)

**Features:**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG) where possible
- API Routes (serverless functions)
- Edge caching for performance
- Auto-preview deployments for PRs

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.geobeat.xyz
NEXT_PUBLIC_WS_URL=wss://api.geobeat.xyz/ws (future)
```

---

## Data Flow

### Collection Pipeline

```
Blockchain Networks
    │
    │ (Peer discovery via libp2p/DHT)
    ▼
Armiarma Crawlers (Docker)
    │
    │ (Insert peer data)
    ▼
PostgreSQL (Raw data)
    │
    │ (ETL every 5 minutes)
    ▼
Aggregation Service
    │
    │ (Calculate GDI, country stats)
    ▼
PostgreSQL (Aggregated tables)
    │
    │ (HTTP requests)
    ▼
REST API (api.geobeat.xyz)
    │
    │ (HTTPS/JSON)
    ▼
GEOBEAT Frontend (app.geobeat.xyz)
    │
    ▼
End Users
```

---

## API Architecture

### Endpoints (api.geobeat.xyz)

**Public API (Free Tier):**
```
GET /v1/networks
  → List available networks (Ethereum, Polygon, etc.)

GET /v1/networks/:network/stats
  → Daily aggregated stats (peer count, country distribution)

GET /v1/networks/:network/gdi
  → Current GDI score and components

GET /v1/networks/:network/history?range=7d
  → Historical trend data (weekly granularity)
```

**Premium API ($X/month):**
```
GET /v1/networks/:network/peers
  → Real-time peer list with IP-level geolocation

GET /v1/networks/:network/peers?country=US
  → Filter peers by country

POST /v1/webhooks
  → Subscribe to network events

GET /v1/networks/:network/history?range=custom&start=...&end=...
  → Custom time-range queries
```

**Authentication:**
- Free tier: No auth (rate limited by IP)
- Premium tier: API key header (`X-API-Key: ...`)
- Enterprise: OAuth2 + custom rate limits

**Rate Limits:**
- Free: 100 requests/day
- Premium: 10,000 requests/day
- Enterprise: Unlimited

---

## Deployment Phases

### Phase 1: Data Collection (Current) ✅
**Timeline:** Week 1
**Goal:** Start continuous data collection

**Tasks:**
- [x] Provision Hetzner CPX41 server
- [ ] Deploy armiarma crawlers
- [ ] Configure PostgreSQL
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Verify peer discovery working

**Deliverable:** Armiarma collecting peer data 24/7

---

### Phase 2: API Layer
**Timeline:** Weeks 2-4
**Goal:** Expose data via REST API

**Tasks:**
- [ ] Build REST API (Express/FastAPI)
- [ ] Implement authentication (API keys)
- [ ] Set up rate limiting
- [ ] Configure SSL (Let's Encrypt)
- [ ] Point api.geobeat.xyz to server
- [ ] Document API endpoints

**Deliverable:** Public API at api.geobeat.xyz

---

### Phase 3: Frontend Integration
**Timeline:** Month 2
**Goal:** Connect live data to dashboard

**Tasks:**
- [ ] Update GEOBEAT frontend to call api.geobeat.xyz
- [ ] Remove demo banner (now live data!)
- [ ] Deploy to Vercel (app.geobeat.xyz)
- [ ] Add "Live" badge to dashboard
- [ ] Implement real-time updates

**Deliverable:** Live dashboard at app.geobeat.xyz

---

### Phase 4: Premium Features
**Timeline:** Month 3-6
**Goal:** Monetization and scaling

**Tasks:**
- [ ] Implement premium API tier
- [ ] Add user accounts and billing
- [ ] WebSocket support for real-time feeds
- [ ] Historical data export
- [ ] Enterprise features (white-label, custom reports)

**Deliverable:** Revenue-generating platform

---

## Monitoring & Observability

### Metrics to Track

**Data Collection Health:**
- Peer discovery rate (peers/minute)
- Crawler uptime (% per network)
- Database write latency (ms)
- Storage growth rate (GB/day)

**API Performance:**
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Rate limit hits (by IP/API key)
- Cache hit ratio (%)

**Infrastructure:**
- CPU usage (%)
- Memory usage (GB)
- Disk I/O (IOPS)
- Network bandwidth (Mbps)

### Alerting Thresholds

**Critical (PagerDuty):**
- Crawler down >5 minutes
- Database disk >90% full
- API error rate >5%

**Warning (Email):**
- Crawler down >1 minute
- Database disk >80% full
- API latency p95 >1 second

---

## Security

### Server Hardening
- ✅ SSH key-based auth only (password disabled)
- ✅ UFW firewall (deny all except required ports)
- ✅ fail2ban (SSH brute-force protection)
- ✅ Unattended security updates
- [ ] Let's Encrypt SSL for api.geobeat.xyz
- [ ] API rate limiting

### Data Protection
- Database credentials in `.env.secrets` (not in git)
- Daily backups to Backblaze B2
- PostgreSQL access restricted to localhost
- Grafana behind SSH tunnel

### API Security
- HTTPS only (no HTTP)
- API key authentication for premium tier
- Rate limiting per IP/key
- CORS whitelist (app.geobeat.xyz only)

---

## Scaling Considerations

### Current Capacity (CPX41)
- **Peers:** ~100K active peers across 4 networks
- **Requests:** ~1K API requests/day
- **Storage:** ~50GB/month (with weekly cleanup)

### When to Scale

**Add more collection servers:**
- If peer count >200K (split networks across servers)
- If single-server crawler can't keep up

**Upgrade to managed PostgreSQL:**
- If database >500GB
- If query performance degrades
- If need read replicas for API

**Add API load balancer:**
- If API traffic >10K requests/hour
- If need multi-region deployment

---

## Cost Breakdown

### Current (Phase 1)
- Hetzner CPX41: €23.90/month
- Domain (geobeat.xyz): ~$12/year
- **Total:** ~$27/month

### Phase 2 (With API)
- Hetzner CPX41: €23.90/month
- Vercel (free tier): $0
- Let's Encrypt SSL: $0
- **Total:** ~$27/month

### Phase 3 (With Frontend)
- Hetzner CPX41: €23.90/month
- Vercel (free tier): $0
- **Total:** ~$27/month

### Phase 4 (With Premium Features)
- Hetzner CPX41: €23.90/month
- Vercel Pro: $20/month (if needed)
- Backblaze B2: $0.30/month (50GB backups)
- PagerDuty: $25/month (monitoring)
- **Total:** ~$72/month

**Revenue Target:** $500/month (break-even at 10 premium subscribers @ $50/month)

---

## References

- Armiarma Documentation: `data/tools/armiarma/doc/`
- Deployment Plan: GitHub Issue #8
- Frontend Repository: `src/frontend/geobeat-ui/`
- Credentials: `docs/DEPLOYMENT_CREDENTIALS.md` (not in git)

---

**Document Status:** Living document (update as architecture evolves)
**Next Review:** After Phase 1 completion
