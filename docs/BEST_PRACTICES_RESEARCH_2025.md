# Best Practices Research 2025 - Geobeat Project

**Research Date:** December 9, 2025
**Project Context:** Network crawler deployment, spatial analysis, and web dashboard

This document compiles authoritative best practices for all technologies and deployment approaches used in the Geobeat project, sourced from official documentation, industry leaders, and production-proven implementations.

---

## Table of Contents

1. [Docker Deployment & Security](#1-docker-deployment--security)
2. [Server Hardening & Security](#2-server-hardening--security)
3. [Secrets Management](#3-secrets-management)
4. [Firewall Configuration (UFW)](#4-firewall-configuration-ufw)
5. [PostgreSQL in Docker](#5-postgresql-in-docker)
6. [Systemd Service Management](#6-systemd-service-management)
7. [Monitoring: Prometheus & Grafana](#7-monitoring-prometheus--grafana)
8. [Python Web Crawler Best Practices](#8-python-web-crawler-best-practices)
9. [Python Project Structure](#9-python-project-structure)
10. [Python Logging & Error Handling](#10-python-logging--error-handling)
11. [GeoPandas & PySAL Production Usage](#11-geopandas--pysal-production-usage)
12. [Git & .gitignore Best Practices](#12-git--gitignore-best-practices)
13. [GitHub Actions CI/CD](#13-github-actions-cicd)
14. [Next.js Production Deployment](#14-nextjs-production-deployment)
15. [Multi-Instance Development](#15-multi-instance-development)

---

## 1. Docker Deployment & Security

### Must-Have Practices

#### Image Security
- **Use minimal base images** - Alpine or slim variants reduce attack surface by 60-80%
- **Pin specific versions** - Use `node:16.20.0` instead of `node:latest`
- **Regular rebuilds** - Rebuild images weekly to include security patches
- **Image signing** - Digitally sign images to verify integrity

#### Container Runtime Security
- **Drop all capabilities** - Start with `--cap-drop all`, add only required ones
- **Never use --privileged** - This grants ALL kernel capabilities
- **Non-root users** - Run containers as non-root (UID 1000+)
- **Read-only filesystems** - Use `--read-only` where possible
- **User Namespaces** - Map container root to non-root host user

#### Vulnerability Management
- **Use Trivy** - Open-source vulnerability scanner for images
- **CIS Docker Benchmark** - Follow official audit procedures
- **SBOM (Software Bill of Materials)** - Document all components

#### Network & Daemon Security
- **Never expose Docker socket** - Provides root access to host
- **Network segmentation** - Containers on isolated networks
- **Update frequently** - Keep Docker Engine and host kernel current

### Implementation Example

```dockerfile
# ✅ Good: Minimal, pinned, non-root
FROM python:3.11-slim-bookworm
RUN useradd -m -u 1000 appuser
USER appuser
WORKDIR /app
COPY --chown=appuser:appuser . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "app.py"]
```

```yaml
# docker-compose.yml security enhancements
services:
  app:
    image: myapp:1.2.3  # ✅ Pinned version
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only what's needed
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    user: "1000:1000"
```

### Sources
- [Official Docker Security Documentation](https://docs.docker.com/engine/security/)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Docker Security 2025: Hardening Containers](https://www.onlinehashcrack.com/guides/best-practices/docker-security-2025-hardening-containers.php)
- [Spacelift: 21 Docker Security Best Practices](https://spacelift.io/blog/docker-security)
- [Better Stack: Docker Security Best Practices](https://betterstack.com/community/guides/scaling-docker/docker-security-best-practices/)

---

## 2. Server Hardening & Security

### Ubuntu 24.04 LTS Security Foundation

#### SSH Hardening (Critical Priority)
SSH is the #1 attack vector - servers receive hundreds of brute-force attempts within 24 hours of deployment.

**Required `/etc/ssh/sshd_config` changes:**
```bash
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers deployer  # Whitelist specific users
MaxAuthTries 3
MaxSessions 2
Protocol 2
Port 2222  # Consider non-standard port (optional)
```

**Restart SSH after changes:**
```bash
sudo systemctl restart sshd
```

#### Fail2ban Configuration
Intrusion prevention system that auto-bans malicious IPs.

**Install and configure:**
```bash
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

**Key parameters in `/etc/fail2ban/jail.local`:**
```ini
[sshd]
enabled = true
port = ssh
maxretry = 3      # Failed attempts before ban
findtime = 600    # Time window (10 minutes)
bantime = 3600    # Ban duration (1 hour)
```

**Rate limiting with UFW:**
```bash
ufw limit ssh  # Max 6 connections per 30 seconds
```

#### Automatic Security Updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

#### Security Stack Checklist
- ✅ UFW firewall (default deny, explicit allow)
- ✅ SSH hardened (key-only, non-root, rate-limited)
- ✅ Fail2ban (SSH + custom services)
- ✅ Unattended upgrades (security patches)
- ✅ Regular kernel updates
- ✅ Minimal installed packages (attack surface reduction)

### Sources
- [Official Ubuntu Server Firewall Documentation](https://documentation.ubuntu.com/server/how-to/security/firewalls/)
- [Ubuntu 24.04 Security Hardening Guide 2025](https://toolsana.com/blog/secure-ubuntu-24-04-installation-guide/)
- [Frank's Blog: Ubuntu Server Hardening](https://frankschmidt-bruecken.com/en/blog/ubuntu-server-hardening/)
- [Fail2ban Ubuntu 24.04 Complete Guide 2025](https://toolsana.com/blog/fail2ban-ubuntu-22-04-24-04-complete-guide/)
- [TecMint: Install Fail2ban for SSH Security](https://www.tecmint.com/install-fail2ban-ubuntu-24-04/)

---

## 3. Secrets Management

### The Hierarchy of Security (Worst to Best)

1. ❌ **Hardcoded in code** - Never acceptable
2. ❌ **Environment variables in containers** - Easily leaked between containers
3. ⚠️ **`.env` files** - OK for development, NOT for production
4. ✅ **Docker Secrets** - Good for Docker Swarm/Compose
5. ✅ **External managers** - HashiCorp Vault, AWS Secrets Manager (best)

### Docker Compose Secrets (Production-Grade)

**Why Docker Secrets?**
- Mounted to `/run/secrets/<name>` (memory, not disk)
- Never in environment variables (prevents leaks)
- Encrypted at rest and in transit (Swarm mode)

**Implementation:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt  # Development
    # external: true  # Production (use docker secret create)
```

**Production deployment:**
```bash
# Create secret (stored encrypted in Swarm)
echo "strong_password_here" | docker secret create db_password -

# Update docker-compose.yml to use external secret
secrets:
  db_password:
    external: true
```

### External Secret Managers (Enterprise)

**Recommended for production at scale:**
- **HashiCorp Vault** - Dynamic secrets, rotation, audit logs
- **AWS Secrets Manager** - Automatic rotation, IAM integration
- **Azure Key Vault** - Enterprise SSO, HSM-backed
- **GCP Secret Manager** - Native GCP integration

**Integration pattern:**
```python
# Python example with HashiCorp Vault
import hvac

client = hvac.Client(url='https://vault:8200', token=os.environ['VAULT_TOKEN'])
secret = client.secrets.kv.v2.read_secret_version(path='db/password')
db_password = secret['data']['data']['password']
```

### Development vs Production Strategy

- **Development:** `.env` files (add to `.gitignore`)
- **Staging:** Docker Secrets with file-based sources
- **Production:** Docker Secrets + external manager (Vault/cloud)

### Security Checklist
- ✅ Never commit secrets to git
- ✅ Use `.gitignore` for `.env`, `secrets/`, `*.key`
- ✅ Rotate secrets regularly (30-90 days)
- ✅ Use different secrets per environment
- ✅ Audit secret access (who, when, what)
- ✅ Encrypt secrets at rest

### Sources
- [Official Docker Compose Secrets Documentation](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Docker Secrets Management Guide](https://docs.docker.com/engine/swarm/secrets/)
- [Phase Blog: Docker Compose Secrets Guide](https://phase.dev/blog/docker-compose-secrets/)
- [Spacelift: Docker Secrets Complete Guide](https://spacelift.io/blog/docker-secrets)
- [GitGuardian: 4 Ways to Securely Store Secrets in Docker](https://blog.gitguardian.com/how-to-handle-secrets-in-docker/)

---

## 4. Firewall Configuration (UFW)

### Principle of Least Privilege

Default deny everything, explicitly allow only what's needed.

### Essential Configuration

**Initial setup:**
```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH MUST be allowed before enabling firewall
sudo ufw limit ssh  # Rate-limited SSH (6 conn/30s)
# OR for custom port:
sudo ufw limit 2222/tcp

# Enable firewall
sudo ufw enable
```

**Application-specific rules:**
```bash
# Allow specific services
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp from 10.0.0.0/8  # PostgreSQL (internal only)

# Allow from specific IPs only
sudo ufw allow from 203.0.113.0/24 to any port 22

# Application profiles (if available)
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
```

**Advanced: Deny outgoing by default (high-security)**
```bash
sudo ufw default deny outgoing
sudo ufw allow out 53     # DNS
sudo ufw allow out 80     # HTTP
sudo ufw allow out 443    # HTTPS
sudo ufw allow out 123    # NTP
```

### Rate Limiting Protection

**Built-in rate limiting:**
- Tracks connection attempts per source IP
- Blocks IPs making too many connections
- Default: 6 connections in 30 seconds triggers block

**Enable for any service:**
```bash
sudo ufw limit <port>/<protocol>
```

### Verification & Monitoring

```bash
# Check status
sudo ufw status verbose

# Check numbered rules (for deletion)
sudo ufw status numbered

# Delete rule by number
sudo ufw delete 5

# View logs
sudo tail -f /var/log/ufw.log
```

### Docker Integration Caveat

Docker bypasses UFW by manipulating iptables directly. For Docker services:

```bash
# Add to /etc/docker/daemon.json
{
  "iptables": false
}
```

Then manually manage iptables for Docker networks.

### Sources
- [Official Ubuntu Firewall Documentation](https://documentation.ubuntu.com/server/how-to/security/firewalls/)
- [DigitalOcean: How to Set Up UFW on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu)
- [Hostinger: Configure Ubuntu Firewall with UFW 2025](https://www.hostinger.com/tutorials/how-to-configure-firewall-on-ubuntu-using-ufw)
- [DigitalOcean: UFW Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)
- [Cherry Servers: Configure Ubuntu Firewall with UFW](https://www.cherryservers.com/blog/how-to-configure-ubuntu-firewall-with-ufw)

---

## 5. PostgreSQL in Docker

### Production-Ready Configuration

#### Version Pinning (Critical)
```yaml
services:
  db:
    image: postgres:16.1-alpine  # ✅ Specific version
    # NOT: postgres:latest ❌
```

#### Data Persistence
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    driver: local
```

#### Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

#### Health Checks
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s
  timeout: 3s
  retries: 3
  start_period: 30s
```

#### Configuration Tuning

**Custom `postgresql.conf`:**
```bash
# Mount custom config
volumes:
  - ./postgresql.conf:/etc/postgresql/postgresql.conf
command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

**Key settings for production:**
```ini
# Memory
shared_buffers = 1GB          # 25% of system RAM
effective_cache_size = 3GB    # 75% of system RAM
work_mem = 16MB
maintenance_work_mem = 256MB

# Connections
max_connections = 100

# WAL
wal_level = replica
max_wal_size = 2GB

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'  # Development only
log_min_duration_statement = 1000  # Log queries > 1s
```

### Backup Best Practices

#### Automated Backups with pg_dump

**Backup script (`/backup/postgres-backup.sh`):**
```bash
#!/bin/bash
set -e

CONTAINER_NAME="postgres_db"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup
docker exec -t $CONTAINER_NAME pg_dumpall -c -U postgres | gzip > \
  "$BACKUP_DIR/backup_$DATE.sql.gz"

# Compression reduces size by 70-90%

# Delete backups older than retention period
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Cron job (daily at 2 AM):**
```bash
0 2 * * * /backup/postgres-backup.sh >> /var/log/postgres-backup.log 2>&1
```

#### WAL Archiving (Point-in-Time Recovery)
```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /wal_archive/%f'
```

#### Testing Backups (Critical)
```bash
# ALWAYS test restore on non-production database
gunzip -c backup_20251209.sql.gz | docker exec -i postgres_test psql -U postgres
```

### Monitoring

**Essential metrics to track:**
- Connection count: `SELECT count(*) FROM pg_stat_activity;`
- Database size: `SELECT pg_size_pretty(pg_database_size('dbname'));`
- Slow queries: `pg_stat_statements` extension
- Cache hit ratio: `pg_statio_user_tables`

**Prometheus exporter:**
```yaml
services:
  postgres_exporter:
    image: prometheuscommunity/postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://user:password@db:5432/dbname?sslmode=disable"
```

### Sources
- [Sliplane: Best Practices for Postgres in Docker](https://sliplane.io/blog/best-practices-for-postgres-in-docker)
- [Earthly: Using Docker with Postgres](https://earthly.dev/blog/postgres-docker/)
- [Medium: PostgreSQL in Docker Best Practices](https://pankajconnect.medium.com/best-practices-for-running-postgresql-in-docker-containers-409c21dfb2cc)
- [SimpleBackups: Docker Postgres Backup/Restore Guide](https://simplebackups.com/blog/docker-postgres-backup-restore-guide-with-examples)
- [ServersInc: Automated PostgreSQL Backups in Docker](https://serversinc.io/blog/automated-postgresql-backups-in-docker-complete-guide-with-pg-dump/)

---

## 6. Systemd Service Management

### Running Docker Compose as a Systemd Service

Systemd provides automatic startup, restart policies, logging, and consistent management interface.

### Service File Template

**Create `/etc/systemd/system/geobeat-crawler.service`:**

```ini
[Unit]
Description=Geobeat Network Crawler Service
Requires=docker.service
After=docker.service
PartOf=docker.service  # Stop/restart propagation

[Service]
Type=simple
User=armiarma
Group=docker
WorkingDirectory=/home/armiarma/geobeat/data-sources/tools/armiarma
ExecStartPre=/usr/bin/docker compose pull --quiet
ExecStart=/usr/bin/docker compose up --no-build
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=10s
TimeoutStartSec=300
TimeoutStopSec=60

# Security
NoNewPrivileges=true
PrivateTmp=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=geobeat-crawler

[Install]
WantedBy=multi-user.target
```

### Key Configuration Points

**1. Absolute Paths Required**
- Use `/usr/bin/docker` not `docker`
- WorkingDirectory must be absolute

**2. Logging Strategy**
- `StandardOutput=journal` → logs to systemd journal
- Alternative: log to Docker (remove `-d` flag) but uses 2x disk space

**3. Dependencies**
- `Requires=` - hard dependency (won't start without)
- `After=` - start order (after Docker is ready)
- `PartOf=` - stop/restart propagation

**4. Restart Policies**
- `Restart=always` - restart on any exit
- `Restart=on-failure` - only on error codes
- `RestartSec=10s` - wait 10s between restarts

### Managing the Service

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable geobeat-crawler.service
sudo systemctl start geobeat-crawler.service

# Check status
sudo systemctl status geobeat-crawler.service

# View logs (all)
sudo journalctl -u geobeat-crawler.service

# View logs (follow, last 100 lines)
sudo journalctl -u geobeat-crawler.service -f -n 100

# Restart service
sudo systemctl restart geobeat-crawler.service
```

### Journald Configuration

**Edit `/etc/systemd/journald.conf`:**
```ini
[Journal]
Storage=persistent
Compress=yes
SystemMaxUse=1G      # Max disk usage
MaxRetentionSec=7776000  # 90 days
ForwardToSyslog=no
```

**Apply changes:**
```bash
sudo systemctl restart systemd-journald
```

### Production Checklist
- ✅ Use absolute paths for all binaries
- ✅ Set proper User/Group (non-root)
- ✅ Configure Restart=always with RestartSec
- ✅ Set reasonable TimeoutStartSec for slow builds
- ✅ Enable persistent journald logging
- ✅ Rotate logs (SystemMaxUse limit)
- ✅ Test service restart behavior
- ✅ Verify boot auto-start

### Sources
- [Docker Compose as Systemd Unit - GitHub Gist](https://gist.github.com/mosquito/b23e1c1e5723a7fd9e6568e5cf91180f)
- [Bootvar: Docker Compose as Systemd Service](https://bootvar.com/systemd-service-for-docker-compose/)
- [DoHost: Managing Docker with Systemd](https://dohost.us/index.php/2025/07/29/managing-docker-applications-with-systemd-running-containers-as-services/)
- [Medium: Optimizing Docker with Systemd](https://medium.com/@123rpv/optimizing-docker-with-systemd-a-comprehensive-approach-6a2b90c5d900)
- [TechOverflow: Create Systemd Service for Docker Compose](https://techoverflow.net/2020/10/24/create-a-systemd-service-for-your-docker-compose-project-in-10-seconds/)

---

## 7. Monitoring: Prometheus & Grafana

### Architecture Overview

```
Docker Containers → cAdvisor/Node Exporter → Prometheus → Grafana → Alerts
```

### Docker Compose Setup

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.48.0
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    ports:
      - "127.0.0.1:9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:10.2.0
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_admin
    secrets:
      - grafana_admin
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - monitoring
    depends_on:
      - prometheus

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.2
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "127.0.0.1:8080:8080"
    networks:
      - monitoring

  node_exporter:
    image: prom/node-exporter:v1.7.0
    command:
      - '--path.rootfs=/host'
    volumes:
      - '/:/host:ro,rslave'
    ports:
      - "127.0.0.1:9100:9100"
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:

secrets:
  grafana_admin:
    file: ./secrets/grafana_admin.txt
```

### Prometheus Configuration

**`prometheus/prometheus.yml`:**
```yaml
global:
  scrape_interval: 15s  # Default scrape interval
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node_exporter:9100']

  - job_name: 'crawler-metrics'
    static_configs:
      - targets: ['eth_crawler:9080', 'filecoin_crawler:9082']
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):.*'
        target_label: instance
```

### Key Metrics to Monitor

**Container Metrics (cAdvisor):**
- CPU usage: `container_cpu_usage_seconds_total`
- Memory: `container_memory_usage_bytes`
- Network I/O: `container_network_receive_bytes_total`
- Disk I/O: `container_fs_reads_bytes_total`

**System Metrics (Node Exporter):**
- CPU: `node_cpu_seconds_total`
- Memory: `node_memory_MemAvailable_bytes`
- Disk: `node_filesystem_avail_bytes`
- Network: `node_network_receive_bytes_total`

**Application Metrics (Custom):**
- Request rate
- Error rate
- Latency percentiles (p50, p95, p99)
- Database connections

### Grafana Dashboards

**Official pre-built dashboards:**
- Docker monitoring: Dashboard ID `1860`
- Node Exporter: Dashboard ID `1860`
- PostgreSQL: Dashboard ID `9628`

**Import via UI:**
```
Grafana → Dashboards → Import → Enter ID
```

### Alerting Configuration

**Create `prometheus/alerts.yml`:**
```yaml
groups:
  - name: containers
    interval: 30s
    rules:
      - alert: ContainerDown
        expr: up{job="cadvisor"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Container {{ $labels.instance }} is down"

      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} using >90% memory"

      - alert: HighCPU
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} high CPU usage"
```

### Resource Requirements

**Minimum:** 2 CPU cores, 4GB RAM
**Recommended:** 4 CPU cores, 8GB RAM (for production with long retention)

### Best Practices

- ✅ Use dedicated network for monitoring stack
- ✅ Store secrets with Docker Secrets
- ✅ Configure retention policies (90 days typical)
- ✅ Enable persistent volumes for data
- ✅ Expose ports only to localhost (use reverse proxy)
- ✅ Set up alerting via Alertmanager
- ✅ Use Grafana provisioning for dashboards (IaC)
- ✅ Monitor the monitors (meta-monitoring)

### Sources
- [SigNoz: Docker Monitoring with Prometheus and Grafana](https://signoz.io/guides/how-to-monitor-docker-containers-with-prometheus-and-grafana/)
- [Uptrace: Prometheus Docker Setup 2025](https://uptrace.dev/tools/prometheus-for-docker)
- [Official Grafana Docker Monitoring Dashboard](https://grafana.com/grafana/dashboards/15798-docker-monitoring/)
- [Last9: Docker Monitoring with Prometheus Guide](https://last9.io/blog/docker-monitoring-with-prometheus-a-step-by-step-guide/)
- [Grafana Labs: Monitoring Linux Host with Docker Compose](https://grafana.com/docs/grafana-cloud/send-data/metrics/metrics-prometheus/prometheus-config-examples/docker-compose-linux/)

---

## 8. Python Web Crawler Best Practices

### Ethical Crawling Principles

**Legal Compliance:**
- ✅ Respect `robots.txt` (legally required in some jurisdictions)
- ✅ Honor website Terms of Service
- ✅ Collect only publicly available data
- ❌ Never circumvent authentication
- ❌ Never scrape personal data without consent

### Rate Limiting (Critical)

**Recommended Crawl Rates:**
- **Small websites:** 1 request every 10-15 seconds
- **Medium websites:** 1 request every 5 seconds
- **Large websites (with permission):** 1-2 requests per second
- **Default safe rate:** 1 request per second

**Implementation:**

```python
import time
import random
from ratelimit import limits, sleep_and_retry

# Fixed delay
@sleep_and_retry
@limits(calls=1, period=1)  # 1 request per second
def fetch_url(url):
    return requests.get(url)

# Random delay (more natural)
def fetch_with_random_delay(url, min_delay=1, max_delay=3):
    response = requests.get(url)
    time.sleep(random.uniform(min_delay, max_delay))
    return response

# Adaptive rate limiting (best for production)
class AdaptiveRateLimiter:
    def __init__(self, initial_delay=1.0):
        self.delay = initial_delay

    def adjust(self, response_time):
        if response_time > 2.0:  # Slow response
            self.delay *= 1.5  # Increase delay
        elif response_time < 0.5:  # Fast response
            self.delay *= 0.9  # Decrease delay (but never too fast)
        self.delay = max(0.5, min(10.0, self.delay))

    def wait(self):
        time.sleep(self.delay)
```

### Robots.txt Compliance

```python
import urllib.robotparser

def can_fetch(url, user_agent='MyBot/1.0'):
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{url}/robots.txt")
    rp.read()
    return rp.can_fetch(user_agent, url)

# Usage
if can_fetch('https://example.com/page', 'MyBot/1.0'):
    fetch_url('https://example.com/page')
else:
    print("Blocked by robots.txt")
```

### User-Agent Identification

Always identify your crawler with contact information:

```python
headers = {
    'User-Agent': 'GeobeatCrawler/1.0 (+https://geobeat.xyz/bot; contact@geobeat.xyz)'
}

response = requests.get(url, headers=headers)
```

### HTTP Status Code Handling

```python
def fetch_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url)

        if response.status_code == 200:
            return response
        elif response.status_code == 429:  # Too Many Requests
            retry_after = int(response.headers.get('Retry-After', 60))
            print(f"Rate limited. Waiting {retry_after}s...")
            time.sleep(retry_after)
        elif response.status_code == 403:  # Forbidden
            print(f"Access forbidden for {url}")
            return None
        elif response.status_code >= 500:  # Server error
            print(f"Server error. Retry {attempt + 1}/{max_retries}")
            time.sleep(2 ** attempt)  # Exponential backoff
        else:
            print(f"HTTP {response.status_code}: {url}")
            return None

    return None
```

### Crawl Politeness Checklist

- ✅ Respect robots.txt
- ✅ Identify your bot (User-Agent with contact)
- ✅ Rate limit (1 req/sec default)
- ✅ Handle 429 status codes (pause crawling)
- ✅ Use exponential backoff for retries
- ✅ Honor Crawl-delay directive
- ✅ Avoid peak traffic hours
- ✅ Implement crawl budget limits
- ✅ Cache responses to avoid re-fetching
- ✅ Monitor server response times

### Network Crawler Specific (Geobeat Context)

For P2P network crawling (Ethereum, Filecoin, etc.):

```python
# Connection pool limits
MAX_CONNECTIONS_PER_HOST = 5
MAX_TOTAL_CONNECTIONS = 100

# Request timeouts
CONNECT_TIMEOUT = 10  # seconds
READ_TIMEOUT = 30     # seconds

# Retry configuration
MAX_RETRIES = 3
BACKOFF_FACTOR = 0.5  # 0.5s, 1s, 2s

# Session configuration
session = requests.Session()
adapter = HTTPAdapter(
    max_retries=Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=[429, 500, 502, 503, 504]
    )
)
session.mount('http://', adapter)
session.mount('https://', adapter)
```

### Sources
- [AWS: Best Practices for Ethical Web Crawlers](https://docs.aws.amazon.com/prescriptive-guidance/latest/web-crawling-system-esg-data/best-practices.html)
- [Scrape.do: Building Python Web Crawler 2025](https://scrape.do/blog/web-crawler-python/)
- [RoboRabbit: Ethical Web Scraping Best Practices 2025](https://www.roborabbit.com/blog/is-web-scraping-legal-5-best-practices-for-ethical-web-scraping-in-2024/)
- [ScrapingAPI: Ethical Web Scraping Guide](https://scrapingapi.ai/blog/ethical-web-scraping)
- [ScrapeHero: Overcome Rate Limiting in Web Scraping](https://www.scrapehero.com/rate-limiting-in-web-scraping/)

---

## 9. Python Project Structure

### Recommended: Src Layout (2025 Standard)

The `src/` layout is now the recommended approach, especially for projects using pytest and modern packaging tools.

### Directory Structure

```
geobeat/
├── src/
│   ├── analysis/               # Analysis package
│   │   ├── __init__.py
│   │   ├── gdi.py
│   │   ├── spatial_metrics.py
│   │   ├── models.py
│   │   └── data_ingestion.py
│   └── crawler/                # Crawler package (if separate)
│       ├── __init__.py
│       └── network_crawler.py
├── tests/
│   ├── __init__.py
│   ├── test_gdi.py
│   └── test_spatial_metrics.py
├── docs/                       # Documentation
│   ├── README.md
│   └── API.md
├── data/                       # Data files
│   ├── raw/
│   ├── processed/
│   └── scripts/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── pyproject.toml              # Modern Python packaging
├── requirements.txt            # Production dependencies
├── requirements-dev.txt        # Development dependencies
└── README.md
```

### Why Src Layout?

**Advantages:**
- ✅ Prevents accidental import of in-development code
- ✅ Forces proper installation before testing
- ✅ Clearer separation of package vs. project files
- ✅ Recommended by pytest, Nox, and modern packaging tools
- ✅ Prevents PYTHONPATH pollution

**Comparison:**

```python
# ❌ Flat layout - can import without installing
# Project root is on PYTHONPATH automatically
from analysis import gdi  # Works even if not installed

# ✅ Src layout - must install first
# Forces: pip install -e .
from geobeat.analysis import gdi  # Only works if properly installed
```

### Modern Packaging (pyproject.toml)

**`pyproject.toml` (PEP 517/518 compliant):**

```toml
[build-system]
requires = ["setuptools>=65.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "geobeat"
version = "0.1.0"
description = "Geographic decentralization analysis for blockchain networks"
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
classifiers = [
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "License :: OSI Approved :: MIT License",
]
dependencies = [
    "geopandas>=0.14.0",
    "pysal>=24.1",
    "h3>=3.7.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0",
]

[tool.setuptools.packages.find]
where = ["src"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
strict = true
```

### Virtual Environment Management

```bash
# Create virtual environment
python3.11 -m venv .venv

# Activate
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install in editable mode
pip install -e .              # Production dependencies
pip install -e ".[dev]"       # With dev dependencies

# Alternative: separate requirements files
pip install -r requirements.txt      # Production
pip install -r requirements-dev.txt  # Development
```

### Best Practices Summary

- ✅ Use `src/` layout for new projects
- ✅ Use `pyproject.toml` (modern standard)
- ✅ Separate requirements: `requirements.txt` vs `requirements-dev.txt`
- ✅ Use virtual environments (always)
- ✅ Install in editable mode: `pip install -e .`
- ✅ Include tests outside `src/`
- ✅ Use `__init__.py` for package initialization
- ✅ Document code structure in README.md

### Sources
- [Hitchhiker's Guide to Python: Structuring Your Project](https://docs.python-guide.org/writing/structure/)
- [Official Python Packaging Guide: Src vs Flat Layout](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/)
- [Dagster: How to Structure Python Projects](https://dagster.io/blog/python-project-best-practices)
- [GitHub: python-blueprint (Best Practices Example)](https://github.com/johnthagen/python-blueprint)
- [CloudDevs: Python Project Structure Best Practices](https://clouddevs.com/python/project-structure-practices/)

---

## 10. Python Logging & Error Handling

### Production Logging Configuration

**Hierarchical approach:** Configure once at application entry point.

**`logging_config.py`:**

```python
import logging
import logging.config
import sys
from pathlib import Path

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(funcName)s %(lineno)d %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'detailed',
            'stream': sys.stdout
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'json',  # JSON for production
            'filename': 'logs/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'encoding': 'utf-8'
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'json',
            'filename': 'logs/error.log',
            'maxBytes': 10485760,
            'backupCount': 5,
            'encoding': 'utf-8'
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['console', 'file', 'error_file']
    },
    'loggers': {
        'geobeat': {
            'level': 'DEBUG',
            'handlers': ['console', 'file'],
            'propagate': False
        },
        'external_lib': {
            'level': 'WARNING',  # Less verbose for third-party
            'propagate': True
        }
    }
}

def setup_logging(env='production'):
    """Setup logging configuration"""
    # Create log directory
    Path('logs').mkdir(exist_ok=True)

    # Adjust for environment
    if env == 'development':
        LOGGING_CONFIG['root']['level'] = 'DEBUG'
        LOGGING_CONFIG['handlers']['console']['level'] = 'DEBUG'
    elif env == 'production':
        LOGGING_CONFIG['root']['level'] = 'INFO'
        LOGGING_CONFIG['handlers']['console']['level'] = 'WARNING'

    logging.config.dictConfig(LOGGING_CONFIG)
```

### Usage in Application

```python
import logging
from logging_config import setup_logging

# Setup once at entry point
setup_logging(env='production')

# In modules, use module-level logger
logger = logging.getLogger(__name__)

def calculate_gdi(data):
    logger.info("Starting GDI calculation", extra={'record_count': len(data)})

    try:
        result = complex_calculation(data)
        logger.info("GDI calculation complete", extra={'result': result})
        return result
    except ValueError as e:
        logger.error("Invalid data for GDI calculation", exc_info=True)
        raise
    except Exception as e:
        logger.critical("Unexpected error in GDI calculation", exc_info=True)
        raise
```

### Exception Handling Best Practices

**Use `exc_info=True` for full traceback:**

```python
try:
    risky_operation()
except Exception as e:
    logger.error("Operation failed", exc_info=True)
    # Full exception info is logged but app doesn't crash
```

**Structured logging with context:**

```python
logger.info("Processing network data", extra={
    'network': 'ethereum',
    'node_count': 1000,
    'timestamp': datetime.utcnow().isoformat()
})
```

### Log Levels in Production

| Level    | When to Use                        | Production Threshold |
|----------|------------------------------------|----------------------|
| DEBUG    | Detailed diagnostic information    | Development only     |
| INFO     | General informational messages     | ✅ Production        |
| WARNING  | Unexpected but handled issues      | ✅ Production        |
| ERROR    | Errors requiring attention         | ✅ Production        |
| CRITICAL | System failure imminent            | ✅ Production        |

### JSON Logging for Production

**Why JSON?**
- Machine-readable for ELK Stack, CloudWatch, Datadog
- Easy parsing and filtering
- Structured fields for analytics

**Install:**
```bash
pip install python-json-logger
```

**Example output:**
```json
{
  "asctime": "2025-12-09 10:15:23",
  "name": "geobeat.analysis.gdi",
  "levelname": "INFO",
  "funcName": "calculate_gdi",
  "lineno": 42,
  "message": "Starting GDI calculation",
  "network": "ethereum",
  "node_count": 1000
}
```

### Centralized Log Management

**For production at scale:**

```python
# Send logs to centralized service
import logging
from logtail import LogtailHandler

handler = LogtailHandler(source_token='your_token')
logger.addHandler(handler)
```

**Popular services:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- CloudWatch (AWS)
- Better Stack (Logtail)

### Performance Optimization

**Lazy evaluation for expensive logging:**

```python
# ❌ Bad: String formatting always executed
logger.debug("Data: " + expensive_function())

# ✅ Good: Only evaluated if DEBUG enabled
logger.debug("Data: %s", expensive_function())
```

**Conditional logging:**

```python
if logger.isEnabledFor(logging.DEBUG):
    logger.debug("Complex data: %s", compute_expensive_debug_info())
```

### Production Checklist

- ✅ Configure logging once at application entry
- ✅ Use JSON formatting for production
- ✅ Set INFO or WARNING level for production
- ✅ Use RotatingFileHandler to prevent disk fill
- ✅ Include `exc_info=True` for exception logging
- ✅ Add structured context with `extra={}`
- ✅ Send logs to centralized service
- ✅ Monitor ERROR and CRITICAL logs
- ✅ Set up alerts for critical issues
- ✅ Never log sensitive data (passwords, tokens)

### Sources
- [Middleware: Python Logging Best Practices](https://middleware.io/blog/python-logging-best-practices/)
- [Official Python Logging Documentation](https://docs.python.org/3/howto/logging.html)
- [SigNoz: Python Logging Best Practices](https://signoz.io/guides/python-logging-best-practices/)
- [Carmatec: Python Logging Guide 2025](https://www.carmatec.com/blog/python-logging-best-practices-complete-guide/)
- [Better Stack: Python Logging Best Practices](https://betterstack.com/community/guides/logging/python/python-logging-best-practices/)

---

## 11. GeoPandas & PySAL Production Usage

### Integration Architecture

**The Modern Geospatial Stack:**
```
Data I/O → GeoPandas → Spatial Analysis → Visualization
(Fiona)    (Processing)   (PySAL)         (Matplotlib/Mapbox)
```

### Why GeoPandas + PySAL?

**GeoPandas (Data Handling):**
- Extends Pandas with spatial data types
- Handles GeoJSON, Shapefile, GeoPackage I/O
- Coordinate transformations (CRS)
- Spatial joins, overlays, buffers

**PySAL (Statistical Analysis):**
- Peer-reviewed spatial statistics algorithms
- Moran's I (spatial autocorrelation)
- Local indicators of spatial association (LISA)
- Spatial regression models
- Active academic/industry use

### Production Workflow

```python
import geopandas as gpd
from libpysal.weights import Queen
from esda.moran import Moran_Local

# 1. Load data with GeoPandas
gdf = gpd.read_file("ethereum_nodes.geojson")

# 2. Spatial indexing for performance
gdf.sindex  # Creates R-tree spatial index

# 3. Build spatial weights matrix (PySAL)
w = Queen.from_dataframe(gdf)

# 4. Calculate spatial autocorrelation
moran_loc = Moran_Local(gdf['node_count'], w)

# 5. Add results back to GeoDataFrame
gdf['moran_i'] = moran_loc.Is
gdf['p_value'] = moran_loc.p_sim
gdf['cluster'] = moran_loc.q  # HH, LL, HL, LH

# 6. Filter significant clusters
hotspots = gdf[gdf['p_value'] < 0.05]
```

### Performance Optimization

#### 1. Streaming Large Files

```python
import fiona

# ❌ Bad: Load entire file into memory
gdf = gpd.read_file("huge_file.geojson")

# ✅ Good: Stream features
with fiona.open("huge_file.geojson") as src:
    for feature in src:
        # Process one feature at a time
        process_feature(feature)
```

#### 2. Spatial Indexing (Critical)

```python
# Automatically creates R-tree index
gdf.sindex

# Fast point-in-polygon queries
point = Point(-122.4194, 37.7749)
possible_matches = gdf.sindex.query(point.bounds)
precise_matches = gdf.iloc[list(possible_matches)][
    gdf.iloc[list(possible_matches)].contains(point)
]
```

#### 3. Coordinate Reference Systems (CRS)

```python
# ❌ Bad: Different CRS causes errors
gdf1.crs  # EPSG:4326 (WGS84)
gdf2.crs  # EPSG:3857 (Web Mercator)
gdf1.overlay(gdf2)  # ERROR or incorrect results

# ✅ Good: Reproject to same CRS
gdf2_reprojected = gdf2.to_crs(gdf1.crs)
result = gdf1.overlay(gdf2_reprojected)
```

#### 4. Vectorized Operations

```python
# ❌ Bad: Iterating over rows
for idx, row in gdf.iterrows():
    gdf.at[idx, 'area'] = row.geometry.area

# ✅ Good: Vectorized operation
gdf['area'] = gdf.geometry.area
```

### PySAL Modules for Geobeat

**Relevant modules:**
- **libpysal** - Spatial weights, I/O utilities
- **esda** - Exploratory spatial data analysis (Moran's I, Getis-Ord Gi*)
- **inequality** - Gini coefficient, concentration measures
- **mapclassify** - Choropleth classification schemes

**Example: Spatial HHI with PySAL:**

```python
from libpysal.weights import DistanceBand
from esda import Moran

# Create distance-based weights (500km threshold)
w = DistanceBand.from_dataframe(
    gdf,
    threshold=500000,  # meters
    binary=False,      # inverse distance weighting
    alpha=-1
)

# Global Moran's I
moran = Moran(gdf['node_count'], w)
print(f"Moran's I: {moran.I:.3f}")
print(f"p-value: {moran.p_sim:.3f}")

# Interpretation:
# I > 0: Spatial clustering (similar values near each other)
# I < 0: Spatial dispersion (dissimilar values near each other)
# I ≈ 0: Random spatial pattern
```

### Common Pitfalls & Solutions

**1. Mixed Geometry Types**
```python
# Filter to single geometry type
gdf_points = gdf[gdf.geometry.type == 'Point']
gdf_polygons = gdf[gdf.geometry.type == 'Polygon']
```

**2. Invalid Geometries**
```python
# Fix invalid geometries
gdf['geometry'] = gdf.geometry.buffer(0)

# Or use shapely
from shapely.validation import make_valid
gdf['geometry'] = gdf.geometry.apply(make_valid)
```

**3. Missing CRS**
```python
# Set CRS if missing
gdf.set_crs(epsg=4326, inplace=True)
```

### Production Checklist

- ✅ Use Fiona for streaming large files
- ✅ Enable spatial indexing (`.sindex`)
- ✅ Reproject to consistent CRS
- ✅ Use vectorized operations (not `.iterrows()`)
- ✅ Validate geometries before analysis
- ✅ Filter to single geometry types
- ✅ Use appropriate spatial weights (Queen, Rook, DistanceBand)
- ✅ Interpret p-values correctly (0.05 threshold)
- ✅ Cache expensive calculations
- ✅ Profile code to identify bottlenecks

### Sources
- [Official PySAL Repository](https://github.com/pysal/pysal)
- [PySAL Documentation](http://pysal.org/pysal/)
- [GeoPandas Choropleth Classification with PySAL](https://geopandas.org/en/stable/gallery/choropleths.html)
- [Geographic Data Science with PySAL](http://darribas.org/gds_scipy16/)
- [Geoapify: Python Geospatial Data Analysis Libraries](https://www.geoapify.com/python-geospatial-data-analysis/)

---

## 12. Git & .gitignore Best Practices

### Python .gitignore Essentials

**Comprehensive template:**

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/
.venv
.venv-*/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Jupyter Notebook
.ipynb_checkpoints
*.ipynb_checkpoints/

# Environment variables (CRITICAL)
.env
.env.local
.env.production
.env.*.local

# Security-sensitive files
*.key
*.pem
*.crt
secrets/
credentials.json

# Testing
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/
.tox/

# Data files (for data science projects)
*.db
*.sqlite
*.sqlite3
*.csv  # If large datasets
*.parquet
data/raw/*  # Keep structure, ignore content
data/processed/*

# Logs
*.log
logs/
*.log.*

# Node.js (for Next.js frontend)
node_modules/
.next/
*.tsbuildinfo
pnpm-lock.yaml
package-lock.json  # If using pnpm

# Build artifacts
*.whl
dist-*/

# Documentation builds
docs/_build/
site/

# OS
Thumbs.db
.DS_Store
```

### Data Science Projects: Special Considerations

**Keep structure, ignore content:**

```gitignore
# Keep data directories but ignore contents
data/raw/*
!data/raw/.gitkeep
data/processed/*
!data/processed/.gitkeep

# Exception: Keep small sample datasets
!data/raw/sample_*.csv
```

**Create `.gitkeep` files:**
```bash
touch data/raw/.gitkeep
touch data/processed/.gitkeep
```

### Security-Critical Patterns

**Always ignore:**
```gitignore
# Secrets
.env
.env.*
*.key
*.pem
secrets/
credentials.json
config/production.yml  # If contains secrets

# Cloud provider credentials
.aws/
.gcloud/
.azure/
```

### Team Collaboration Best Practices

**Document ignored patterns:**
```gitignore
# Temporary analysis notebooks (keep exploratory work local)
notebooks/scratch_*

# Personal IDE settings (each dev has their own)
.vscode/settings.json

# Large model files (use DVC or Git LFS instead)
models/*.h5
models/*.pkl
```

**Communicate changes:**
- Add comments explaining why patterns are ignored
- Update team when adding new patterns
- Keep `.gitignore` itself in version control

### Tools for Generating .gitignore

**gitignore.io:**
```bash
# Generate for Python + Node + macOS + Linux
curl -L https://www.toptal.com/developers/gitignore/api/python,node,macos,linux > .gitignore
```

**GitHub Templates:**
- Official Python: https://github.com/github/gitignore/blob/main/Python.gitignore
- Data Science: Community templates on GitHub

### Git Worktree Strategy (Multi-Instance Development)

**Why worktrees for AI agents?**
- Multiple working directories from same repository
- No merge conflicts during parallel development
- Each agent has isolated workspace

**Usage:**
```bash
# Main working directory
git clone https://github.com/user/geobeat.git
cd geobeat

# Create worktree for feature branch
git worktree add ../geobeat-feature-a feature-a
git worktree add ../geobeat-feature-b feature-b

# Directory structure:
# geobeat/          (main branch)
# geobeat-feature-a/ (feature-a branch)
# geobeat-feature-b/ (feature-b branch)

# List worktrees
git worktree list

# Remove worktree when done
git worktree remove ../geobeat-feature-a
```

### Conventional Commits (Geobeat Standard)

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance (dependencies, build)

**Examples:**
```
feat(crawler): add rate limiting for Ethereum nodes
fix(gdi): correct Moran's I calculation for sparse data
docs(readme): update deployment instructions
refactor(spatial): extract H3 indexing to separate module
test(gdi): add unit tests for PDI calculation
chore(deps): update geopandas to 0.14.1
```

### Pre-commit Hooks (Quality Gates)

**Install Husky (already in project):**
```bash
npm install
# Automatically sets up .husky/
```

**Common hooks:**
- Lint Python code (ruff)
- Run tests
- Check commit message format
- Prevent commits to main branch

### Checklist

- ✅ Use comprehensive `.gitignore` template
- ✅ Never commit secrets (`.env`, `*.key`)
- ✅ Ignore virtual environments
- ✅ Keep data directory structure (ignore contents)
- ✅ Document why patterns are ignored
- ✅ Use worktrees for parallel development
- ✅ Follow conventional commits
- ✅ Set up pre-commit hooks
- ✅ Review `.gitignore` during code review

### Sources
- [Python for Data Science: Git Best Practices](https://www.python4data.science/en/latest/productive/git/best-practices.html)
- [gitignore.io: Generate .gitignore Files](https://www.toptal.com/developers/gitignore)
- [GitHub Official Python .gitignore](https://github.com/github/gitignore/blob/main/Python.gitignore)
- [Python Central: Python .gitignore Management](https://www.pythoncentral.io/python-gitignore-clean-repository-management/)
- [Equinor Data Science Template](https://github.com/equinor/data-science-template/blob/master/.gitignore)

---

## 13. GitHub Actions CI/CD

### Essential Workflow Structure

**Location:** `.github/workflows/ci.yml`

**Basic Python CI/CD template:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12']

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive  # For armiarma submodule

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Cache pip dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements*.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with ruff
        run: |
          ruff check src/

      - name: Type check with mypy
        run: |
          mypy src/

      - name: Run tests
        run: |
          pytest tests/ -v --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          file: ./coverage.xml

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'

  docker:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./data-sources/tools/armiarma
          push: true
          tags: username/armiarma:latest,username/armiarma:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Best Practices

#### 1. Matrix Builds (Multi-Environment Testing)

```yaml
strategy:
  matrix:
    python-version: ['3.11', '3.12']
    os: [ubuntu-latest, macos-latest]
  fail-fast: false  # Continue even if one combo fails
```

#### 2. Dependency Caching (Faster Builds)

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
```

**Speed improvement:** 2-3x faster for subsequent runs

#### 3. Secrets Management

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

**Add secrets:** Settings → Secrets and variables → Actions → New repository secret

#### 4. Conditional Workflows

```yaml
# Only deploy on main branch
if: github.ref == 'refs/heads/main' && github.event_name == 'push'

# Only run on specific file changes
on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'requirements*.txt'
```

#### 5. Security Scanning

```yaml
- name: Run Bandit security scan
  run: |
    pip install bandit
    bandit -r src/ -f json -o bandit-report.json

- name: Dependency vulnerability check
  run: |
    pip install safety
    safety check --json
```

### Complete CI/CD Pipeline

**For Geobeat project:**

1. **Lint & Format** - Ruff, Black
2. **Type Check** - mypy
3. **Unit Tests** - pytest with coverage
4. **Security Scan** - Bandit, Safety, Trivy
5. **Build Docker Images** - Multi-stage builds
6. **Deploy** - Push to Docker Hub, trigger deployment

### Advanced: Monorepo with Multiple Workflows

**Separate workflows for components:**
- `.github/workflows/backend.yml` - Python/crawler
- `.github/workflows/frontend.yml` - Next.js
- `.github/workflows/analysis.yml` - Spatial analysis scripts

**Use path filters:**
```yaml
on:
  push:
    paths:
      - 'src/analysis/**'
      - 'tests/analysis/**'
```

### Performance Optimization

**1. Parallelization:**
```yaml
jobs:
  lint:
    # Runs in parallel
  test:
    # Runs in parallel
  security:
    # Runs in parallel
  deploy:
    needs: [lint, test, security]  # Sequential
```

**2. Artifact caching:**
```yaml
- name: Cache build artifacts
  uses: actions/cache@v3
  with:
    path: dist/
    key: build-${{ github.sha }}
```

**3. Docker layer caching:**
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Checklist

- ✅ Test on multiple Python versions (matrix builds)
- ✅ Cache dependencies (pip, npm)
- ✅ Use secrets for sensitive data
- ✅ Run security scans (Trivy, Bandit, Safety)
- ✅ Generate coverage reports
- ✅ Only deploy from main branch
- ✅ Use conditional workflows (path filters)
- ✅ Parallelize independent jobs
- ✅ Pin action versions (@v4, not @latest)
- ✅ Set up status badges in README

### Sources
- [Official Python Packaging Guide: GitHub Actions](https://packaging.python.org/guides/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/)
- [Real Python: CI/CD with GitHub Actions](https://realpython.com/github-actions-python/)
- [GitHub Actions Tutorial 2025](https://everhour.com/blog/github-actions-tutorial/)
- [DevOps Tooling: GitHub Actions CI/CD Guide 2025](https://thedevopstooling.com/github-actions-ci-cd-guide/)
- [Atmosly: Python CI/CD Pipeline Complete Guide 2025](https://atmosly.com/blog/python-ci-cd-pipeline-mastery-a-complete-guide-for-2025)

---

## 14. Next.js Production Deployment

### Vercel Deployment (Official Platform)

**Why Vercel for Next.js?**
- Created by Next.js developers
- Zero-config deployment
- Automatic optimizations
- Global Edge Network
- Built-in CI/CD
- Free tier for hobby projects

### Deployment Process

**1. Connect GitHub repository:**
```bash
# Push to GitHub
git push origin main

# Import on Vercel:
# https://vercel.com/new
# Select repository → Deploy
```

**2. Automatic configuration:**
- Framework Detection: Next.js (automatic)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install` or detected package manager

**3. Environment variables:**
```
Settings → Environment Variables → Add
```

**Production variables:**
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.geobeat.xyz
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

**Important:** Only prefix with `NEXT_PUBLIC_` if exposed to browser.

### Next.js 16 Production Optimizations

#### 1. Server Components (Default)

```tsx
// ✅ Server Component (default) - No JS sent to client
export default async function NetworkPage() {
  const data = await fetchNetworkData()  // Server-side
  return <NetworkMap data={data} />
}

// Client Component (when needed)
'use client'
export function InteractiveMap() {
  const [zoom, setZoom] = useState(10)
  // ...
}
```

**Benefits:**
- Smaller bundle size (no React on server components)
- Direct database access
- Better SEO

#### 2. Automatic Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Spinner />,
  ssr: false  // Client-side only
})
```

#### 3. Image Optimization

```tsx
import Image from 'next/image'

// ✅ Automatic optimization, WebP conversion, lazy loading
<Image
  src="/network-map.png"
  alt="Network Map"
  width={800}
  height={600}
  priority  // Load immediately (above fold)
/>
```

### Security Best Practices

#### 1. Content Security Policy

**`next.config.js`:**
```js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://api.mapbox.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

#### 2. Environment Variable Safety

```js
// ❌ Never expose secrets to client
const API_KEY = process.env.SECRET_API_KEY  // Only on server

// ✅ Public variables (prefixed)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN  // Client-safe
```

**Verify in build:**
```bash
# Check .env.local is in .gitignore
grep "\.env" .gitignore
```

### SEO & Metadata

**Using Metadata API (Next.js 16):**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geobeat - Geographic Decentralization Analysis',
  description: 'Analyze blockchain network distribution and concentration',
  openGraph: {
    images: ['/og-image.png'],
  },
}
```

**Generate sitemap:**
```bash
# Install package
npm install next-sitemap

# Create next-sitemap.config.js
module.exports = {
  siteUrl: 'https://geobeat.xyz',
  generateRobotsTxt: true,
}

# Add to package.json
"scripts": {
  "postbuild": "next-sitemap"
}
```

### Performance Monitoring

**Built-in Web Vitals:**

```tsx
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === 'web-vital') {
    console.log(metric)
    // Send to analytics
  }
}
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics

# app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Database Configuration (Vercel)

**Connection pooling required:**

```js
// Use Prisma with connection pooling
// .env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  // For migrations

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")       // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct for migrations
}
```

### Checklist

- ✅ Use Server Components by default
- ✅ Add NEXT_PUBLIC_ prefix for client-exposed vars
- ✅ Configure Content Security Policy
- ✅ Optimize images with next/image
- ✅ Generate sitemap and robots.txt
- ✅ Use TypeScript for type safety
- ✅ Enable Vercel Analytics
- ✅ Use connection pooler for database
- ✅ Test production build locally (`npm run build`)
- ✅ Monitor Web Vitals

### Sources
- [Official Next.js Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Vercel: Next.js Deployment Documentation](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Perficient: Deploying Scalable Next.js on Vercel](https://blogs.perficient.com/2025/06/02/deploying-a-scalable-next-js-app-on-vercel-a-step-by-step-guide/)
- [ReactSquad: Next.js 15 Production Setup 2025](https://www.reactsquad.io/blog/how-to-set-up-next-js-15-for-production)
- [Vercel Knowledge Base: Next.js with Prisma and Postgres](https://vercel.com/kb/guide/nextjs-prisma-postgres)

---

## 15. Multi-Instance Development

### The Challenge

Multiple developers or AI agents working simultaneously on the same codebase leads to:
- Merge conflicts
- Wasted time resolving conflicts
- Fear of pushing changes
- Coordination overhead

### Solution: Git Worktrees

**Git worktrees allow multiple working directories from the same repository.**

### How Git Worktrees Work

**Traditional workflow (problematic):**
```
one-directory/ (can only be on one branch at a time)
```

**Worktree workflow (ideal):**
```
geobeat/              (main branch)
geobeat-frontend/     (frontend-redesign branch)
geobeat-crawler/      (crawler-optimization branch)
geobeat-docs/         (documentation-update branch)
```

**Each directory:**
- Has its own branch checked out
- Shares the same `.git` directory (efficient)
- Can be worked on independently
- No merge conflicts during development

### Setting Up Worktrees

**Initial setup:**
```bash
# Clone repository (main working directory)
git clone https://github.com/user/geobeat.git
cd geobeat

# Create worktrees for different features
git worktree add ../geobeat-frontend frontend-redesign
git worktree add ../geobeat-crawler crawler-optimization
git worktree add ../geobeat-docs documentation-update

# If branch doesn't exist yet
git worktree add -b new-feature ../geobeat-new-feature
```

**Directory structure:**
```
projects/
├── geobeat/              (main branch)
├── geobeat-frontend/     (frontend-redesign branch)
├── geobeat-crawler/      (crawler-optimization branch)
└── geobeat-docs/         (documentation-update branch)
```

### Managing Worktrees

**List all worktrees:**
```bash
git worktree list
# /path/to/geobeat              abc1234 [main]
# /path/to/geobeat-frontend     def5678 [frontend-redesign]
# /path/to/geobeat-crawler      ghi9012 [crawler-optimization]
```

**Remove worktree:**
```bash
# Option 1: Remove directory first, then prune
rm -rf ../geobeat-frontend
git worktree prune

# Option 2: Use remove command
git worktree remove ../geobeat-frontend
```

**Move worktree:**
```bash
git worktree move ../geobeat-frontend ~/projects/geobeat-frontend-new
```

### AI Agent Coordination Strategy

**Approach: Specialized Worktrees**

1. **Agent A (Frontend)** → `geobeat-frontend/`
   - Works on Next.js components
   - Branch: `feature/dashboard-ui`

2. **Agent B (Backend)** → `geobeat-crawler/`
   - Works on crawler optimization
   - Branch: `feature/rate-limiting`

3. **Agent C (Tests)** → `geobeat-tests/`
   - Adds test coverage
   - Branch: `feature/test-coverage`

4. **Human Developer** → `geobeat/`
   - Reviews PRs
   - Integrates features
   - Manages releases

**No conflicts during development!** Each agent works in isolation.

### Workflow Example

**Agent workflow:**
```bash
# Agent A starts work
cd geobeat-frontend
git pull origin main  # Sync with latest
git checkout -b feature/dashboard-ui

# Make changes...
git add .
git commit -m "feat(ui): redesign dashboard layout"
git push origin feature/dashboard-ui

# Create PR on GitHub
gh pr create --title "Dashboard UI Redesign" --body "..."

# Agent continues on next task
cd ../geobeat-frontend
git checkout -b feature/dark-mode
```

**Integration workflow:**
```bash
# Human developer reviews and merges PRs
cd geobeat
git pull origin main  # All features now integrated

# All agents sync their worktrees
cd geobeat-frontend && git pull origin main
cd geobeat-crawler && git pull origin main
cd geobeat-tests && git pull origin main
```

### Task Ownership (Using Beads)

**Geobeat already uses `bd` (beads) for task tracking.**

**Agent workflow with beads:**
```bash
# Check for available work
bd ready --json

# Claim a task
bd update geobeat-n0b.2 --status in_progress --assignee "agent-a"

# Work in dedicated worktree
cd geobeat-security
# ... make changes ...

# Complete task
bd close geobeat-n0b.2 --reason "Implemented UFW configuration"
git add .beads/issues.jsonl  # Sync task state
git commit -m "feat(security): configure UFW firewall\n\nCloses geobeat-n0b.2"
```

**Prevents:**
- Multiple agents working on same task
- Lost work due to duplicated effort
- Confusion about task status

### Communication & Shared Context

**Model Context Protocol (MCP) - Already in use**

Geobeat appears to use MCP for agent coordination. Best practices:

1. **Shared context files:**
   - `ARCHITECTURE.md` - System design
   - `AGENTS.md` - Agent instructions
   - `.beads/issues.jsonl` - Task state

2. **Agent updates context:**
   ```bash
   # After significant changes
   echo "Frontend uses Tailwind 4.1 with OKLCH" >> ARCHITECTURE.md
   git add ARCHITECTURE.md
   git commit -m "docs: update frontend tech stack"
   ```

3. **Regular sync points:**
   - Daily: Pull main branch updates
   - After PR merge: Update all worktrees
   - Before starting new task: Check beads for blockers

### Safety & Permission Management

**Risk levels:**
- 🟢 **Safe Mode** - Asks before destructive actions
- 🟡 **Limited Mode** - Auto-approve non-destructive
- 🔴 **YOLO Mode** - Full autonomy (dangerous)

**Recommendation for multi-agent:**
- Use Safe Mode for production branches
- Use Limited Mode for feature branches
- Never use YOLO Mode without supervision

**Git safety:**
```bash
# Prevent accidental push to main
git config branch.main.pushRemote no_push

# Use PR-based workflow
git push origin feature-branch
gh pr create  # Review required
```

### Checklist

- ✅ Use git worktrees for parallel development
- ✅ One worktree per feature/agent
- ✅ Use beads for task ownership
- ✅ Sync worktrees regularly (`git pull origin main`)
- ✅ Use PR-based workflow (no direct commits to main)
- ✅ Update shared context files (ARCHITECTURE.md)
- ✅ Set appropriate permission levels
- ✅ Communicate significant changes to team
- ✅ Clean up old worktrees when done
- ✅ Use conventional commits for clarity

### Sources
- [EQengineered: Power and Peril of Multiple AI Coding Agents](https://www.eqengineered.com/insights/multiple-coding-agents)
- [AI Native Dev: Parallelizing AI Coding Agents](https://ainativedev.io/news/how-to-parallelize-ai-coding-agents)
- [GitHub: Agent-MCP Framework](https://github.com/rinadelph/Agent-MCP)
- [Codeo: Collaborative Coding with AI Agents](https://www.gocodeo.com/post/collaborative-coding-with-ai-managing-multiple-agents-generating-code)
- [Galileo: Multi-Agent Coordination Strategies](https://galileo.ai/blog/multi-agent-coordination-strategies)

---

## Appendix: Quick Reference

### Command Cheatsheet

**Docker:**
```bash
docker compose up -d                    # Start services
docker compose down                     # Stop services
docker compose logs -f service_name     # View logs
docker exec -it container_name bash     # Shell into container
docker system prune -a                  # Clean up (WARNING: removes all)
```

**UFW:**
```bash
sudo ufw status                         # Check firewall status
sudo ufw allow 80/tcp                   # Allow HTTP
sudo ufw limit ssh                      # Rate-limit SSH
sudo ufw delete 5                       # Delete rule #5
```

**Systemd:**
```bash
sudo systemctl status service_name      # Check service
sudo journalctl -u service_name -f      # Follow logs
sudo systemctl restart service_name     # Restart service
```

**Git Worktrees:**
```bash
git worktree add ../path branch-name    # Create worktree
git worktree list                       # List worktrees
git worktree remove ../path             # Remove worktree
```

**Beads:**
```bash
bd ready                                # Show ready work
bd create "Task" -p 1                   # Create task
bd update task-id --status in_progress  # Claim task
bd close task-id                        # Complete task
```

### Technology Decision Matrix

| Need | Technology | Why |
|------|-----------|-----|
| Spatial analysis | GeoPandas + PySAL | Industry standard, peer-reviewed |
| Web framework | Next.js 16 | Server Components, Vercel native |
| Maps | Mapbox GL | WebGL performance, vector tiles |
| Monitoring | Prometheus + Grafana | Open-source, Docker-native |
| Database | PostgreSQL | Mature, GIS extensions (PostGIS) |
| Secrets | Docker Secrets | Encrypted, memory-only |
| Firewall | UFW | Simple, Ubuntu default |
| CI/CD | GitHub Actions | Native integration, free for OSS |
| Task tracking | Beads (bd) | Git-friendly, dependency-aware |

---

## Document Maintenance

**Last Updated:** December 9, 2025
**Next Review:** March 2026 (quarterly)
**Maintainer:** Geobeat Team

**Changelog:**
- 2025-12-09: Initial compilation of best practices across all technologies

**Contributing:**
When adding new technologies or updating practices, please:
1. Include authoritative sources (official docs, industry leaders)
2. Provide code examples
3. Explain *why*, not just *what*
4. Update the table of contents
5. Add to quick reference if applicable
