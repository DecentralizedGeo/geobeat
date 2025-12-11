# Geobeat Framework and Tool Documentation

**Generated:** 2025-12-09
**Purpose:** Comprehensive documentation for all frameworks, libraries, and tools used in the geobeat project

---

## Table of Contents

1. [Beads Workflow System](#1-beads-workflow-system)
2. [Deployment Technologies](#2-deployment-technologies)
3. [Python Frameworks and Libraries](#3-python-frameworks-and-libraries)
4. [Frontend Technologies](#4-frontend-technologies)
5. [Data Processing and Analysis](#5-data-processing-and-analysis)
6. [Infrastructure Best Practices](#6-infrastructure-best-practices)

---

## 1. Beads Workflow System

### Overview
Beads (bd) is a lightweight memory system for coding agents, using a graph-based issue tracker designed for distributed, Git-backed workflow with DAG-based dependencies. Created by Steve Yegge, it's optimized for multi-instance coordination and AI agent workflows.

**Current Version:** 0.29.0 (installed in geobeat project)

### Core Concepts

#### Multi-Instance Coordination
- **Hash-based Issue IDs:** Eliminates collisions when multiple agents or branches create issues concurrently
- **Git-backed Storage:** Uses `.beads/issues.jsonl` as source of truth (committed to git)
- **Local SQLite Cache:** `.beads/*.db` (gitignored) for fast queries
- **Auto-Sync:** Automatically syncs between SQLite and JSONL (5s debounce)

#### Dependency Management

Four types of dependencies chain issues together:
1. **blocks:** Issue A blocks issue B from starting
2. **blocked-by:** Issue B is blocked by issue A (inverse of blocks)
3. **discovered-from:** New work discovered while working on another issue
4. **related:** General relationship between issues

**Key Commands:**
```bash
# View dependency tree
bd dep tree <issue-id>

# Add dependencies
bd create "New task" --deps discovered-from:bd-abc123,blocks:bd-def456

# Find ready work (no blockers)
bd ready --json
```

#### Best Practices for Multi-Instance Workflows

1. **Use Hash IDs for Concurrent Work**
   - Different agents/branches automatically get unique IDs
   - No need to coordinate ID assignment

2. **Track Discovered Work**
   ```bash
   bd create "Fix bug in validation" -p 1 --deps discovered-from:bd-abc123
   ```

3. **Always Commit JSONL with Code**
   - Keep issue state synchronized with code state
   - Commit `.beads/issues.jsonl` together with related code changes

4. **Check Ready Work Before Starting**
   ```bash
   bd ready --sort priority --limit 5 --json
   ```

5. **Use Priority Levels**
   - `0` - Critical (security, data loss, broken builds)
   - `1` - High (major features, important bugs)
   - `2` - Medium (default, nice-to-have)
   - `3` - Low (polish, optimization)
   - `4` - Backlog (future ideas)

#### Essential Commands Reference

```bash
# Create new issue
bd create "Issue title" -t bug|feature|task|epic|chore -p 0-4 --json

# Create subtask
bd create "Subtask" --parent <epic-id> --json

# Update status
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json

# Close issue
bd close bd-42 --reason "Completed" --json

# View issue details
bd show bd-42 --json

# List all issues
bd list --json

# Find blocked issues
bd blocked --json
```

#### Sync Strategies and Conflict Resolution

**Auto-Sync Behavior:**
- Exports to JSONL after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed

**Handling Conflicts:**
```bash
# If git merge conflicts occur in .beads/issues.jsonl
bd merge <base> <current> <other>

# Clean up merge artifacts
bd clean

# Validate database health
bd validate
```

**MCP Server Integration (Recommended):**
```bash
pip install beads-mcp
```

Add to `~/.config/claude/config.json`:
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

### Official Resources
- [GitHub Repository](https://github.com/steveyegge/beads)
- [FAQ Documentation](https://github.com/steveyegge/beads/blob/main/docs/FAQ.md)
- [MCP Integration](https://github.com/steveyegge/beads/tree/HEAD/integrations/beads-mcp)
- [Beads Tutorial by Peter Warnock](https://peterwarnock.com/tools/beads-distributed-task-management-for-agents/)

---

## 2. Deployment Technologies

### Docker Security and Best Practices

#### Image Security (2025 Best Practices)

**1. Use Minimal Base Images**
```dockerfile
# Good: Alpine or distroless
FROM alpine:3.19
FROM gcr.io/distroless/static-debian12

# Avoid: Full OS images
# FROM ubuntu:latest  # Too large, unnecessary attack surface
```

**2. Pin Specific Versions**
```dockerfile
# Good: Explicit version pinning
FROM python:3.11-alpine3.19

# Bad: Latest tag
# FROM python:latest
```

**3. Multi-stage Builds**
```dockerfile
# Build stage
FROM python:3.11-alpine AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Runtime stage
FROM python:3.11-alpine
COPY --from=builder /root/.local /root/.local
COPY . .
CMD ["python", "app.py"]
```

**4. Security Scanning**
```bash
# Scan with Trivy
trivy image geobeat-ui:latest

# In CI/CD pipeline
docker build -t myapp .
trivy image myapp --severity HIGH,CRITICAL --exit-code 1
```

#### Container Runtime Security

**1. Run as Non-Root User**
```dockerfile
# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Switch to non-root user
USER appuser
```

**2. Drop Capabilities**
```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed
    security_opt:
      - no-new-privileges:true
```

**3. Read-Only Filesystems**
```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**4. Resource Limits**
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### Secrets Management

**Never store secrets in images or environment variables!**

```yaml
# docker-compose.yml (production)
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

```bash
# Create secrets
echo "my_db_password" | docker secret create db_password -
```

**For External Secret Stores:**
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

#### Network Security

**Isolate Container Networks**
```yaml
networks:
  frontend:
    internal: false  # Internet-facing
  backend:
    internal: true   # Internal only

services:
  web:
    networks:
      - frontend

  db:
    networks:
      - backend  # Not exposed to internet
```

#### Monitoring and Logging

**Enable Comprehensive Logging**
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Docker Documentation Resources
- [Docker Security Official Docs](https://docs.docker.com/engine/security/)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Docker Security 2025 Guide - Cloud Native Now](https://cloudnativenow.com/topics/cloudnativedevelopment/docker/docker-security-in-2025-best-practices-to-protect-your-containers-from-cyberthreats/)
- [Docker Production Best Practices 2025](https://docs.benchhub.co/docs/tutorials/docker/docker-best-practices-2025)
- [Better Stack Docker Security Guide](https://betterstack.com/community/guides/scaling-docker/docker-security-best-practices/)

---

### Hetzner Cloud API

#### Overview
Hetzner Cloud API is a RESTful API operating over HTTPS with JSON data format. Used in geobeat for provisioning the armiarma crawler server.

**Project Details:**
- Project Name: geobeat-ingest
- Server Type: CPX41 (8 vCPU, 16GB RAM, 240GB NVMe SSD)
- Location: HEL1 or FSN1
- Cost: €23.90/month (~$26/month)
- OS: Ubuntu 24.04 LTS

#### Key API Features

**1. Server Provisioning**
```bash
# Create server with SSH key
curl -X POST \
  -H "Authorization: Bearer $HETZNER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "geobeat-ingest-prod-01",
    "server_type": "cpx41",
    "image": "ubuntu-24.04",
    "location": "hel1",
    "ssh_keys": ["geobeat-armiarma-deploy"],
    "user_data": "#cloud-config\n..."
  }' \
  https://api.hetzner.cloud/v1/servers
```

**2. Server Options**
- SSH key injection (strongly recommended)
- Cloud-Init user data (32KiB limit)
- Network attachment (private networks)
- Firewall rules at creation time

**3. Automation Tools**
- Official CLI: `hcloud` command-line tool
- Go library: `github.com/hetznercloud/hcloud-go`
- Python library: `hcloud-python`

#### Best Practices

1. **Always Use SSH Keys**
   - Pass SSH key IDs in `ssh_keys` array
   - Avoid password-based authentication

2. **Use Cloud-Init for Provisioning**
   ```yaml
   #cloud-config
   users:
     - name: armiarma
       groups: sudo
       shell: /bin/bash
       sudo: ['ALL=(ALL) NOPASSWD:ALL']
       ssh_authorized_keys:
         - ssh-ed25519 AAAA...

   packages:
     - docker.io
     - ufw
     - fail2ban

   runcmd:
     - systemctl enable docker
     - systemctl start docker
     - ufw --force enable
   ```

3. **Attach Firewalls at Creation**
   - More secure than post-creation configuration
   - Server never exposed without firewall

4. **Use Private Networks**
   - Isolate backend services
   - Only expose necessary ports publicly

#### Hetzner Documentation Resources
- [Hetzner Cloud API Overview](https://docs.hetzner.cloud/)
- [API Reference](https://docs.hetzner.cloud/reference/cloud)
- [Developer Hub](https://developers.hetzner.com/cloud/)
- [Cloud Documentation](https://docs.hetzner.com/cloud/)

---

### UFW Firewall Configuration with Docker

#### The Core Problem

**Docker bypasses UFW rules by default!** Published ports can be accessed from outside, even with UFW deny rules in place. This creates a significant security vulnerability.

#### Recommended Solution: ufw-docker Tool

**Installation:**
```bash
# Download the script
sudo wget -O /usr/local/bin/ufw-docker \
  https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker
sudo chmod +x /usr/local/bin/ufw-docker

# Install as command
sudo ufw-docker install
```

**Usage:**
```bash
# Allow public access to container port
ufw-docker allow <container-name> 80

# Allow from specific IP
ufw-docker allow <container-name> 80 192.168.1.100

# Remove rule
ufw-docker delete allow <container-name> 80

# List rules
ufw-docker status
```

#### Alternative: DOCKER-USER Chain Configuration

**For Ubuntu 24.04 with UFW Route Support:**

1. **Edit `/etc/ufw/after.rules`:**
```bash
# BEGIN UFW AND DOCKER
*filter
:DOCKER-USER - [0:0]
:ufw-user-forward - [0:0]

-A DOCKER-USER -j ufw-user-forward
-A DOCKER-USER -j RETURN

COMMIT
# END UFW AND DOCKER
```

2. **Use UFW Route Commands:**
```bash
# Allow public access to container port 80
ufw route allow proto tcp from any to any port 80

# Allow from specific subnet
ufw route allow proto tcp from 10.0.0.0/8 to any port 5432
```

3. **Reload UFW:**
```bash
ufw reload
```

#### Best Practices for Docker + UFW

1. **Default Deny Policy**
   ```bash
   ufw default deny incoming
   ufw default allow outgoing
   ```

2. **Only Allow Necessary Ports**
   ```bash
   # SSH (always needed)
   ufw allow 22/tcp

   # HTTP/HTTPS (if web server)
   ufw allow 80/tcp
   ufw allow 443/tcp

   # Use ufw-docker for container ports
   ufw-docker allow geobeat-web 3000
   ```

3. **Rate Limiting for SSH**
   ```bash
   ufw limit 22/tcp
   ```

4. **Verify Rules**
   ```bash
   # Check UFW status
   ufw status verbose

   # Check iptables (includes Docker rules)
   iptables -L -n -v
   iptables -L DOCKER-USER -n -v
   ```

5. **What NOT to Do**
   - **DO NOT** disable Docker's iptables management (`--iptables=false`)
   - This breaks container networking and is hard to maintain

#### Ubuntu 24.04 Specific Notes

- UFW comes pre-installed but disabled by default
- Current version: 0.36.2 (ships with Ubuntu 24.04 LTS)
- Enhanced nftables support
- Improved container integration

#### UFW + Docker Documentation Resources
- [ufw-docker GitHub Repository](https://github.com/chaifeng/ufw-docker)
- [Best Practice Guide by Pita Pun](https://medium.com/@pitapun/what-is-the-best-practice-of-docker-ufw-under-ubuntu-bcc997ba781d)
- [How to Use UFW Firewall with Docker](https://www.howtogeek.com/devops/how-to-use-docker-with-a-ufw-firewall/)
- [UFW Firewall Ubuntu 2025 Guide](https://toolsana.com/blog/ufw-firewall-ubuntu-complete-configuration-guide/)

---

### SSH Hardening and Security

#### Critical SSH Security Measures (Ubuntu Server 2025)

**1. Disable Password Authentication (Most Important)**
```bash
# Edit /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

**2. Use Strong Key Types**
```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "geobeat-deployment"

# Or RSA with 4096 bits
ssh-keygen -t rsa -b 4096 -C "geobeat-deployment"
```

**3. Configure Strong Cryptographic Algorithms**

Edit `/etc/ssh/sshd_config`:
```bash
# Key Exchange Algorithms
KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256,diffie-hellman-group18-sha512

# Ciphers
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com

# MACs
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Minimum RSA key size
RequiredRSASize 3072
```

**4. Restrict Access by IP**
```bash
# Allow only from specific IPs
AllowUsers deploy@192.168.1.100 admin@10.0.0.0/8

# Or use TCP wrappers
# /etc/hosts.allow
sshd: 192.168.1.100
sshd: 10.0.0.0/255.0.0.0

# /etc/hosts.deny
sshd: ALL
```

**5. Install and Configure fail2ban**
```bash
# Install
apt install fail2ban

# Configure /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

**6. Additional Security Options**

```bash
# /etc/ssh/sshd_config

# Disable X11 Forwarding (if not needed)
X11Forwarding no

# Disable TCP Forwarding (if not needed)
AllowTcpForwarding no

# Disable Agent Forwarding
AllowAgentForwarding no

# Maximum authentication attempts
MaxAuthTries 3

# Connection timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Login grace time
LoginGraceTime 60
```

**7. Enable Auditing**
```bash
# Install auditd
apt install auditd

# Add SSH audit rules
cat >> /etc/audit/rules.d/ssh.rules << EOF
-w /etc/ssh/sshd_config -p wa -k sshd_config
-w /var/log/auth.log -p wa -k auth_log
EOF

# Reload rules
auditctl -R /etc/audit/rules.d/ssh.rules
```

**8. Apply Changes and Test**
```bash
# Validate configuration
sshd -t

# Restart SSH service
systemctl restart sshd

# Test connection from another terminal (keep current session open!)
ssh -v user@server
```

#### SSH Security Checklist

- [ ] Password authentication disabled
- [ ] Root login disabled
- [ ] SSH keys deployed (ED25519 or RSA 4096-bit)
- [ ] Strong cryptographic algorithms configured
- [ ] IP allowlist configured (if applicable)
- [ ] fail2ban installed and configured
- [ ] Firewall rate limiting enabled (UFW)
- [ ] X11Forwarding disabled
- [ ] auditd monitoring SSH config and logs
- [ ] Regular security updates automated

#### SSH Hardening Documentation Resources
- [Ubuntu Server Security Best Practices 2025](https://moss.sh/server-management/best-practices-for-ubuntu-server-security-2025/)
- [SSH Hardening Guides - SSH Audit](https://www.sshaudit.com/hardening_guides.html)
- [OpenSSH Best Security Practices - nixCraft](https://www.cyberciti.biz/tips/linux-unix-bsd-openssh-server-best-practices.html)
- [40 Linux Server Hardening Tips - nixCraft](https://www.cyberciti.biz/tips/linux-security.html)
- [Ubuntu Hardening Guide - Ario's Blog](https://ariosp.com/ubuntu-server-hardening-guide/)

---

## 3. Python Frameworks and Libraries

### Spatial Analysis Stack

#### GeoPandas 0.14+

**Overview:**
GeoPandas extends pandas to handle geospatial data, combining capabilities of pandas and shapely. Core data structure is GeoDataFrame (subclass of pandas.DataFrame with geometry columns).

**Installation:**
```bash
pip install geopandas>=0.14.0
```

**Key Features:**
- Read/write spatial data (GeoJSON, Shapefile, GeoPackage, PostGIS)
- Spatial operations (intersections, unions, buffers)
- Coordinate reference system (CRS) transformations
- Integration with matplotlib for mapping

**Basic Usage:**
```python
import geopandas as gpd
from shapely.geometry import Point

# Create GeoDataFrame
gdf = gpd.GeoDataFrame(
    {'city': ['San Francisco', 'New York', 'Los Angeles'],
     'population': [884363, 8336817, 3979576]},
    geometry=[Point(-122.4194, 37.7749),
              Point(-74.0060, 40.7128),
              Point(-118.2437, 34.0522)],
    crs="EPSG:4326"
)

# Spatial operations
gdf_buffered = gdf.buffer(0.1)  # Buffer by 0.1 degrees
intersections = gdf1.overlay(gdf2, how='intersection')

# Coordinate transformation
gdf_web_mercator = gdf.to_crs("EPSG:3857")

# Save to file
gdf.to_file("output.geojson", driver="GeoJSON")
```

**Geobeat Usage:**
```python
# Load node data
gdf = gpd.read_file("ethereum_nodes.geojson")

# Group by country
country_counts = gdf.groupby('country').size()

# Calculate centroids
gdf['centroid'] = gdf.geometry.centroid
```

**Documentation:**
- [Official GeoPandas 0.14 Docs](https://geopandas.org/en/v0.14.0/)
- [Introduction Tutorial](https://geopandas.org/en/stable/getting_started/introduction.html)
- [DataCamp GeoPandas Tutorial](https://www.datacamp.com/tutorial/geopandas-tutorial-geospatial-analysis)
- [Spatial Analytics Tutorial](https://spatial-analytics.readthedocs.io/en/develop/lessons/L1/intro-to-python-geostack.html)

---

#### PySAL 24.1+ (Spatial Analysis Library)

**Overview:**
Python Spatial Analysis Library (PySAL) provides tools for spatial econometrics, exploratory spatial data analysis, and spatial statistics.

**Installation:**
```bash
pip install pysal>=24.1
pip install esda>=2.5.1    # Exploratory Spatial Data Analysis
pip install libpysal>=4.9.2  # Core spatial analysis
```

**Key Modules:**
- **esda:** Exploratory Spatial Data Analysis (Moran's I, LISA)
- **libpysal:** Spatial weights, I/O, computational geometry
- **spreg:** Spatial regression models
- **spaghetti:** Network analysis

**Spatial Autocorrelation (Moran's I):**
```python
from esda.moran import Moran
import libpysal as lps
import geopandas as gpd

# Load spatial data
gdf = gpd.read_file("nodes.geojson")

# Create spatial weights matrix (Queen contiguity)
w = lps.weights.Queen.from_dataframe(gdf)

# Calculate Global Moran's I
moran = Moran(gdf['node_count'], w)
print(f"Moran's I: {moran.I}")
print(f"p-value: {moran.p_sim}")

# Interpretation:
# I > 0: Positive spatial autocorrelation (clustering)
# I < 0: Negative spatial autocorrelation (dispersion)
# I ≈ 0: Random spatial pattern
```

**Local Spatial Autocorrelation (LISA):**
```python
from esda.moran import Moran_Local

# Local Moran's I
lisa = Moran_Local(gdf['node_count'], w)

# Identify clusters
gdf['lisa_cluster'] = lisa.q
# 1: HH (High-High), 2: LH (Low-High), 3: LL (Low-Low), 4: HL (High-Low)
```

**Geobeat Usage:**
```python
from spatial_metrics import SpatialAnalyzer

# Create analyzer
analyzer = SpatialAnalyzer(gdf)

# Calculate PDI (Political Decentralization Index)
pdi = analyzer.calculate_pdi()  # Uses Moran's I + HHI

# Calculate JDI (Jurisdictional Decentralization Index)
jdi = analyzer.calculate_jdi()  # Uses spatial clustering
```

**Documentation:**
- [PySAL Official Site](https://pysal.org/)
- [ESDA Spatial Autocorrelation Tutorial](https://pysal.org/notebooks/explore/esda/Spatial_Autocorrelation_for_Areal_Unit_Data.html)
- [Global Spatial Autocorrelation](https://geographicdata.science/book/notebooks/06_spatial_autocorrelation.html)
- [Local Spatial Autocorrelation](https://geographicdata.science/book/notebooks/07_local_autocorrelation.html)
- [Moran's I Visualization](https://pysal.org/notebooks/viz/splot/esda_morans_viz.html)

---

#### H3 Hexagonal Indexing 3.7+

**Overview:**
H3 is a discrete global grid system developed by Uber for indexing geographies into a hexagonal grid. Used in geobeat for spatial aggregation at city-level granularity.

**Installation:**
```bash
pip install h3>=3.7.6
```

**Why H3?**
- Uniform cell area (lat/lon grids distort near poles)
- Hierarchical structure (15 resolution levels)
- Seven neighbors (easier distance calculations)
- Industry standard (Uber, Foursquare, DoorDash)

**Resolution Levels:**
| Resolution | Area per Cell | Use Case |
|------------|---------------|----------|
| 0 | 4,357,449 km² | Continental |
| 3 | 12,393 km² | Metropolitan region |
| 5 | 252 km² | City (geobeat uses this) |
| 7 | 5.16 km² | Neighborhood |
| 9 | 0.105 km² | Block |
| 12 | 0.0004 km² | Building |

**Basic Usage:**
```python
import h3

# Convert lat/lon to H3 cell
lat, lng = 37.7749, -122.4194
resolution = 5
h3_cell = h3.latlng_to_cell(lat, lng, resolution)
# Output: '85283473fffffff'

# Get cell boundary (polygon)
boundary = h3.cell_to_boundary(h3_cell)
# Returns list of (lat, lon) tuples

# Get neighboring cells
neighbors = h3.grid_disk(h3_cell, k=1)  # k=1 for immediate neighbors

# Get all cells in polygon
from shapely.geometry import Polygon
poly = Polygon([...])
h3_cells = h3.polygon_to_cells(poly, resolution)
```

**Geobeat Usage:**
```python
# Assign H3 cells to nodes
gdf['h3_cell'] = gdf.apply(
    lambda row: h3.latlng_to_cell(row.geometry.y, row.geometry.x, 5),
    axis=1
)

# Aggregate by H3 cell
h3_counts = gdf.groupby('h3_cell').size()

# Create hexagon polygons for visualization
def h3_to_polygon(h3_cell):
    boundary = h3.cell_to_boundary(h3_cell)
    return Polygon([(lon, lat) for lat, lon in boundary])

h3_gdf = gpd.GeoDataFrame({
    'h3_cell': h3_counts.index,
    'node_count': h3_counts.values,
    'geometry': [h3_to_polygon(cell) for cell in h3_counts.index]
})
```

**Performance Note:**
Python 3.8+ required for current version. Python 3.7 supported in earlier versions.

**Documentation:**
- [H3 Official Site](https://h3geo.org/)
- [H3-py Documentation](https://uber.github.io/h3-py/intro.html)
- [GitHub Repository](https://github.com/uber/h3-py)
- [Uber H3 Tutorial (Medium)](https://towardsdatascience.com/uber-h3-for-data-analysis-with-python-1e54acdcc908)

---

#### Pydantic 2.5+ (Data Validation)

**Overview:**
Pydantic provides data validation using Python type annotations. Guarantees that fields conform to defined types after parsing.

**Installation:**
```bash
pip install pydantic>=2.5.0
```

**Key Features:**
- Runtime type checking
- Automatic data conversion
- JSON schema generation
- Fast performance (Rust core in v2)
- Custom validators

**Basic Model:**
```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class NodeData(BaseModel):
    ip: str
    port: int = Field(ge=1, le=65535)
    country: str = Field(min_length=2, max_length=2)
    city: Optional[str] = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    @field_validator('ip')
    @classmethod
    def validate_ip(cls, v):
        import ipaddress
        try:
            ipaddress.ip_address(v)
        except ValueError:
            raise ValueError('Invalid IP address')
        return v

# Usage
node = NodeData(
    ip="142.93.5.12",
    port=30303,
    country="US",
    latitude=40.7128,
    longitude=-74.0060
)
```

**Validation Methods:**
```python
# From dictionary
data = {'ip': '1.2.3.4', 'port': 8080, ...}
node = NodeData.model_validate(data)

# From JSON string
json_str = '{"ip": "1.2.3.4", "port": 8080, ...}'
node = NodeData.model_validate_json(json_str)

# Export to dictionary
node_dict = node.model_dump()

# Export to JSON
node_json = node.model_dump_json()
```

**Custom Validators:**
```python
from pydantic import field_validator, model_validator

class GDIResult(BaseModel):
    pdi: float = Field(ge=0, le=100)
    jdi: float = Field(ge=0, le=100)
    ihi: float = Field(ge=0, le=100)
    gdi: Optional[float] = None

    @model_validator(mode='after')
    def calculate_gdi(self):
        if self.gdi is None:
            self.gdi = 0.4 * self.pdi + 0.35 * self.jdi + 0.25 * self.ihi
        return self
```

**Geobeat Usage:**
```python
# /src/analysis/models.py
from pydantic import BaseModel, Field
from typing import List

class NetworkNode(BaseModel):
    node_id: str
    ip_address: str
    port: int
    latitude: float
    longitude: float
    country_code: str
    cloud_provider: Optional[str] = None

class GDICalculation(BaseModel):
    network: str
    timestamp: str
    node_count: int
    pdi: float = Field(ge=0, le=100)
    jdi: float = Field(ge=0, le=100)
    ihi: float = Field(ge=0, le=100)
    gdi: float = Field(ge=0, le=100)
    nodes: List[NetworkNode]
```

**Documentation:**
- [Pydantic Official Docs](https://docs.pydantic.dev/latest/)
- [Models Guide](https://docs.pydantic.dev/latest/concepts/models/)
- [Validators Guide](https://docs.pydantic.dev/latest/concepts/validators/)
- [Fields Configuration](https://docs.pydantic.dev/latest/concepts/fields/)
- [Real Python Tutorial](https://realpython.com/python-pydantic/)

---

## 4. Frontend Technologies

### Next.js 16 (React Framework)

**Overview:**
Next.js 16 is a React framework with App Router, Server Components, and React 19 support. Geobeat uses Next.js 16.0.3 for the dashboard UI.

**Key Features in Next.js 16:**
- **App Router:** Default routing with file-system based navigation
- **Server Components:** Default for all components (better performance)
- **React Compiler:** Automatic memoization (stable in v16)
- **Turbopack:** Stable as default bundler
- **Partial Pre-Rendering (PPR):** Cache components for instant navigation

**Project Structure:**
```
src/frontend/geobeat-ui/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (/)
│   ├── api/
│   │   └── networks/
│   │       └── [id]/
│   │           └── nodes/
│   │               └── route.ts  # API route
│   └── networks/
│       └── [id]/
│           └── page.tsx      # Network detail page
├── components/
│   ├── network-map.tsx       # Mapbox visualization
│   ├── triangle-chart.tsx    # GDI ternary plot
│   └── ui/                   # Radix UI components
└── lib/
    └── utils.ts              # Utility functions
```

**Server Components (Default):**
```typescript
// app/networks/[id]/page.tsx
// This is a Server Component by default
export default async function NetworkPage({ params }: { params: { id: string } }) {
  // Fetch data on server
  const networkData = await fetch(`https://api.example.com/networks/${params.id}`);
  const data = await networkData.json();

  return (
    <div>
      <h1>{data.name}</h1>
      <NetworkMap nodes={data.nodes} />
    </div>
  );
}
```

**Client Components (When Needed):**
```typescript
'use client'  // Required for interactivity

import { useState } from 'react'
import { MapboxMap } from 'mapbox-gl'

export function NetworkMap({ nodes }: { nodes: Node[] }) {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div onClick={() => setSelectedNode(node)}>
      {/* Interactive map */}
    </div>
  )
}
```

**API Routes:**
```typescript
// app/api/networks/[id]/nodes/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'geojson'
  const resolution = parseInt(searchParams.get('resolution') || '5')

  // Load data
  const nodes = await loadNetworkNodes(params.id)

  // Format response
  if (format === 'geojson') {
    return NextResponse.json({
      type: 'FeatureCollection',
      features: nodes.map(node => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [node.lon, node.lat] },
        properties: { ...node }
      }))
    })
  }

  return NextResponse.json(nodes)
}
```

**Documentation:**
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [App Router Documentation](https://nextjs.org/docs/app)
- [Server Components Guide](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Official Docs](https://nextjs.org/docs)

---

### Mapbox GL JS 3.16 (Interactive Maps)

**Overview:**
Client-side JavaScript library for rendering interactive maps from vector tiles. Uses WebGL for 60fps performance.

**Installation:**
```bash
npm install mapbox-gl@3.16.0
```

**Basic Setup:**
```typescript
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function NetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2
    })

    return () => map.current?.remove()
  }, [])

  return <div ref={mapContainer} className="h-full w-full" />
}
```

**Adding GeoJSON Data:**
```typescript
// Load external GeoJSON
map.current.on('load', () => {
  map.current.addSource('nodes', {
    type: 'geojson',
    data: '/api/networks/ethereum/nodes?format=geojson'
  })

  // Add circle layer
  map.current.addLayer({
    id: 'nodes-circle',
    type: 'circle',
    source: 'nodes',
    paint: {
      'circle-radius': 6,
      'circle-color': '#00ffff',
      'circle-opacity': 0.8
    }
  })
})
```

**Heatmap Layer:**
```typescript
map.current.addLayer({
  id: 'nodes-heatmap',
  type: 'heatmap',
  source: 'nodes',
  paint: {
    'heatmap-weight': 1,
    'heatmap-intensity': 1,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.8,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0,0,255,0)',
      0.2, 'rgb(0,255,255)',
      0.4, 'rgb(0,255,0)',
      0.6, 'rgb(255,255,0)',
      0.8, 'rgb(255,128,0)',
      1, 'rgb(255,0,0)'
    ]
  }
})
```

**H3 Hexagon Layer:**
```typescript
// GeoJSON with H3 hexagon polygons
map.current.addSource('h3-hexagons', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: h3Cells.map(cell => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [h3.cellToBoundary(cell.id)]
      },
      properties: { count: cell.count }
    }))
  }
})

map.current.addLayer({
  id: 'h3-fill',
  type: 'fill',
  source: 'h3-hexagons',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'count'],
      0, '#ffffff',
      100, '#ff0000'
    ],
    'fill-opacity': 0.6
  }
})
```

**Performance Optimization:**
```typescript
// For large datasets, use clustering
map.current.addSource('nodes', {
  type: 'geojson',
  data: nodesGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
})

// Cluster circles
map.current.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'nodes',
  filter: ['has', 'point_count'],
  paint: {
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20, 100, 30, 750, 40
    ]
  }
})
```

**Documentation:**
- [Mapbox GL JS Guides](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [External GeoJSON Example](https://docs.mapbox.com/mapbox-gl-js/example/external-geojson/)
- [Heatmap Example](https://docs.mapbox.com/mapbox-gl-js/example/heatmap-layer/)
- [All Examples](https://docs.mapbox.com/mapbox-gl-js/example/)

---

### Recharts 2.15 (React Charting)

**Overview:**
Composable charting library built with React and D3. Used in geobeat for GDI analytics visualizations.

**Installation:**
```bash
npm install recharts@2.15.4
```

**Basic Line Chart:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { date: '2024-01', gdi: 62.5 },
  { date: '2024-02', gdi: 64.3 },
  { date: '2024-03', gdi: 63.8 }
]

export function GDITrendChart() {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="gdi" stroke="#00ffff" strokeWidth={2} />
    </LineChart>
  )
}
```

**Bar Chart (Network Comparison):**
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const networkData = [
  { network: 'Ethereum', gdi: 62.5, pdi: 58.3, jdi: 67.2, ihi: 61.8 },
  { network: 'Polygon', gdi: 45.2, pdi: 42.1, jdi: 48.3, ihi: 44.9 },
  { network: 'Filecoin', gdi: 71.3, pdi: 68.9, jdi: 74.1, ihi: 70.2 }
]

export function NetworkComparisonChart() {
  return (
    <BarChart width={600} height={400} data={networkData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="network" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Bar dataKey="gdi" fill="#00ffff" />
      <Bar dataKey="pdi" fill="#ff00ff" />
      <Bar dataKey="jdi" fill="#ffff00" />
      <Bar dataKey="ihi" fill="#00ff00" />
    </BarChart>
  )
}
```

**Custom Ternary Plot (GDI Triangle):**
```typescript
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts'

// Convert PDI, JDI, IHI to ternary coordinates
function ternaryToCartesian(pdi: number, jdi: number, ihi: number) {
  const total = pdi + jdi + ihi
  const a = pdi / total
  const b = jdi / total
  const c = ihi / total

  return {
    x: 0.5 * (2 * b + c),
    y: (Math.sqrt(3) / 2) * c
  }
}

export function GDITriangleChart({ pdi, jdi, ihi }: GDIData) {
  const point = ternaryToCartesian(pdi, jdi, ihi)

  return (
    <ScatterChart width={400} height={400}>
      <XAxis type="number" dataKey="x" domain={[0, 1]} hide />
      <YAxis type="number" dataKey="y" domain={[0, 1]} hide />
      <Scatter data={[point]} fill="#00ffff" />
      {/* Add triangle background */}
    </ScatterChart>
  )
}
```

**Documentation:**
- [Recharts Official Site](https://recharts.github.io/)
- [GitHub Repository](https://github.com/recharts/recharts)
- [PostHog Tutorial](https://posthog.com/tutorials/recharts)
- [Next.js Integration Guide](https://app-generator.dev/docs/technologies/nextjs/integrate-recharts.html)

---

### Radix UI (Accessible Components)

**Overview:**
Low-level UI component library with focus on accessibility, customization, and developer experience. Used in geobeat with shadcn/ui wrapper.

**Installation:**
```bash
# Individual components
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tooltip
```

**Accessibility Features:**
- WAI-ARIA compliant
- Keyboard navigation
- Focus management
- Screen reader support
- High contrast mode support

**Example: Dialog (Modal):**
```typescript
import * as Dialog from '@radix-ui/react-dialog'

export function NetworkDetailsDialog({ network }: { network: Network }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>View Details</button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
          <Dialog.Title>{network.name}</Dialog.Title>
          <Dialog.Description>
            GDI Score: {network.gdi}
          </Dialog.Description>

          {/* Content */}

          <Dialog.Close asChild>
            <button>Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

**Example: Dropdown Menu:**
```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function NetworkSelector({ networks, onSelect }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button>Select Network</button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          {networks.map(network => (
            <DropdownMenu.Item key={network.id} onSelect={() => onSelect(network)}>
              {network.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

**Geobeat Usage (with shadcn/ui):**
```typescript
// Using shadcn/ui components (built on Radix)
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function NetworkCard({ network }: { network: Network }) {
  return (
    <div className="card">
      <h3>{network.name}</h3>

      <Tooltip>
        <TooltipTrigger>
          <span>GDI: {network.gdi}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>PDI: {network.pdi}</p>
          <p>JDI: {network.jdi}</p>
          <p>IHI: {network.ihi}</p>
        </TooltipContent>
      </Tooltip>

      <Button onClick={() => window.location.href = `/networks/${network.id}`}>
        View Details
      </Button>
    </div>
  )
}
```

**Documentation:**
- [Radix Primitives Official Site](https://www.radix-ui.com/primitives)
- [Accessibility Overview](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Components Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Building with Radix Tutorial](https://blog.openreplay.com/radix-building-accessible-react-components/)

---

### Tailwind CSS 4.1 (Utility-First CSS)

**Overview:**
Tailwind CSS 4.1 with OKLCH color space support. Geobeat uses Tailwind CSS 4.1.9 for styling.

**Installation:**
```bash
npm install tailwindcss@4.1.9
```

**Key Features in v4:**
- **OKLCH Color Space:** Entire palette uses OKLCH for more vivid colors
- **CSS-First Configuration:** Configure with CSS instead of JS
- **Faster Build Times:** Oxide engine (Rust-based)
- **Container Queries:** Built-in support
- **New Gradient Utilities:** Better color interpolation

**OKLCH Colors:**
```css
/* Default color palette uses OKLCH */
.bg-blue-500 {
  background-color: oklch(0.685 0.169 237.323);
}

/* Custom OKLCH colors */
@theme {
  --color-brand: oklch(0.7 0.2 200);
  --color-accent: oklch(0.8 0.15 120);
}

/* Gradient interpolation */
.bg-gradient-to-r {
  background: linear-gradient(to right, var(--color-brand), var(--color-accent));
}

/* Use OKLCH interpolation */
.bg-linear-to-r\/oklch {
  background: linear-gradient(to right in oklch, blue, red);
}
```

**Geobeat Usage:**
```typescript
// components/network-card.tsx
export function NetworkCard({ network }: { network: Network }) {
  return (
    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
      <h3 className="text-2xl font-bold text-white">{network.name}</h3>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-white/60">GDI Score</p>
          <p className="text-3xl font-bold text-cyan-400">{network.gdi}</p>
        </div>

        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <span className="text-2xl">{network.emoji}</span>
        </div>
      </div>
    </div>
  )
}
```

**Responsive Design:**
```typescript
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
  md:gap-6
  lg:gap-8
">
  {/* Cards */}
</div>
```

**Dark Mode (built-in):**
```typescript
// Layout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white">
        {children}
      </body>
    </html>
  )
}

// Component with dark mode variants
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

**Documentation:**
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [OKLCH Colors Guide](https://stevekinney.com/courses/tailwind/oklch-colors)
- [Official Documentation](https://tailwindcss.com/docs)
- [v4.1 Cheat Sheet](https://lexingtonthemes.com/blog/posts/tailwind-css-v4-cheasheet/)

---

## 5. Data Processing and Analysis

### Armiarma Crawler (Blockchain Network Discovery)

**Overview:**
Go-based Ethereum/Polygon/Filecoin/Celo network crawler. Located as git submodule in `/data/tools/armiarma/`.

**Supported Networks:**
- Ethereum (execution + consensus layers)
- Polygon
- Filecoin
- Celo

**Architecture:**
```
armiarma/
├── cmd/
│   ├── ethereum/     # Ethereum crawler
│   ├── polygon/      # Polygon crawler
│   ├── filecoin/     # Filecoin crawler
│   └── celo/         # Celo crawler
├── pkg/
│   ├── crawler/      # Core crawling logic
│   ├── database/     # PostgreSQL storage
│   └── metrics/      # Prometheus metrics
├── docker-compose.yaml
└── Dockerfile
```

**Key Technologies:**
- **Go libp2p:** Peer discovery and networking
- **DevP2P:** Ethereum execution layer protocol
- **PostgreSQL:** Node data storage
- **Prometheus:** Metrics collection
- **Grafana:** Visualization

**Deployment:**
- Server: Hetzner CPX41 (8 vCPU, 16GB RAM)
- OS: Ubuntu 24.04 LTS
- IP: 37.27.88.255
- Services: Docker Compose orchestration

**Crawling Process:**
1. Connect to network bootstrap nodes
2. Discover peers via `getaddr` (Bitcoin-style) or ENR records (Ethereum)
3. Extract IP addresses and metadata
4. GeoIP lookup for location data
5. Store in PostgreSQL
6. Export to CSV for analysis

**Output Format (CSV):**
```csv
ip,port,country,city,latitude,longitude,asn,org
142.93.5.12,30303,US,New York,40.7128,-74.0060,14061,DigitalOcean
```

**Documentation:**
- Ethereum Networking: [ethereum.org networking layer docs](https://ethereum.org/en/developers/docs/networking-layer/)
- libp2p: [libp2p.io](https://libp2p.io/)
- Go Ethereum p2p: [pkg.go.dev/github.com/ethereum/go-ethereum/p2p](https://pkg.go.dev/github.com/ethereum/go-ethereum/p2p)

---

### PostgreSQL 15 (Database)

**Overview:**
Production-ready relational database for storing crawler data. Deployed via Docker.

**Docker Deployment Best Practices:**

**1. Version Pinning**
```yaml
services:
  db:
    image: postgres:15-alpine  # Pin to specific version
```

**2. Data Persistence**
```yaml
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    driver: local
```

**3. Resource Limits**
```yaml
services:
  db:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

**4. Health Checks**
```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U armiarma_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**5. Security Configuration**
```yaml
services:
  db:
    environment:
      POSTGRES_DB: armiarmadb
      POSTGRES_USER: armiarma_prod
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    networks:
      - backend  # Internal network only
    # No ports exposed to host

secrets:
  db_password:
    external: true

networks:
  backend:
    internal: true  # No external access
```

**6. Custom Configuration**
```yaml
services:
  db:
    volumes:
      - ./postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

**postgresql.conf (production tuning):**
```ini
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 64MB

# Connections
max_connections = 100

# Write performance
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query planner
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200
```

**7. Backup Strategy**
```bash
# Daily backup script
docker exec postgres pg_dump -U armiarma_prod armiarmadb | gzip > backup_$(date +%Y%m%d).sql.gz

# Retention: 7 days
find /opt/armiarma/backups/ -name "backup_*.sql.gz" -mtime +7 -delete
```

**Geobeat Schema:**
```sql
CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    network VARCHAR(50) NOT NULL,
    ip_address INET NOT NULL,
    port INTEGER NOT NULL,
    country_code CHAR(2),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    asn INTEGER,
    org_name VARCHAR(255),
    cloud_provider VARCHAR(100),
    discovered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(network, ip_address, port)
);

CREATE INDEX idx_nodes_network ON nodes(network);
CREATE INDEX idx_nodes_country ON nodes(country_code);
CREATE INDEX idx_nodes_location ON nodes(latitude, longitude);
```

**Documentation:**
- [PostgreSQL in Docker Best Practices](https://sliplane.io/blog/best-practices-for-postgres-in-docker)
- [Official Postgres Docker Image](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/)
- [Production Configuration Guide](https://pankajconnect.medium.com/best-practices-for-running-postgresql-in-docker-containers-409c21dfb2cc)

---

## 6. Infrastructure Best Practices

### Summary Checklist

#### Beads Workflow
- [ ] Use hash-based IDs for multi-instance work
- [ ] Track discovered work with `discovered-from` dependencies
- [ ] Check `bd ready` before starting new tasks
- [ ] Commit `.beads/issues.jsonl` with code changes
- [ ] Use appropriate priority levels (0-4)

#### Docker Security
- [ ] Use minimal base images (Alpine, distroless)
- [ ] Pin specific image versions
- [ ] Run containers as non-root users
- [ ] Drop all capabilities, add only required ones
- [ ] Use read-only filesystems where possible
- [ ] Set resource limits (CPU, memory)
- [ ] Store secrets in Docker secrets or external vaults
- [ ] Scan images with Trivy in CI/CD
- [ ] Enable comprehensive logging

#### Hetzner Cloud
- [ ] Always use SSH keys (no passwords)
- [ ] Use Cloud-Init for server provisioning
- [ ] Attach firewall at server creation
- [ ] Use private networks for backend services
- [ ] Pin server types and images in IaC

#### UFW + Docker
- [ ] Install ufw-docker tool for proper integration
- [ ] Default deny incoming, allow outgoing
- [ ] Use `ufw-docker allow` for container ports
- [ ] Enable rate limiting for SSH
- [ ] DO NOT disable Docker's iptables management

#### SSH Hardening
- [ ] Disable password authentication
- [ ] Disable root login
- [ ] Use ED25519 or RSA 4096-bit keys
- [ ] Configure strong cryptographic algorithms
- [ ] Install and configure fail2ban
- [ ] Enable UFW rate limiting for SSH
- [ ] Disable X11Forwarding if not needed
- [ ] Enable auditd for monitoring
- [ ] Restrict access by IP (if applicable)

#### PostgreSQL in Docker
- [ ] Pin specific PostgreSQL version
- [ ] Use volumes for data persistence
- [ ] Set resource limits (4GB RAM minimum)
- [ ] Configure health checks with pg_isready
- [ ] Store password in Docker secrets
- [ ] Use internal network only (no port exposure)
- [ ] Tune postgresql.conf for production
- [ ] Implement daily backup strategy
- [ ] Enable query logging for debugging

---

## Quick Reference

### Essential Commands

**Beads:**
```bash
bd ready --json                                    # Find ready work
bd create "Title" -t feature -p 1 --json          # Create issue
bd update bd-abc123 --status in_progress --json   # Claim task
bd close bd-abc123 --reason "Done" --json         # Complete
bd dep tree bd-abc123                              # View dependencies
```

**Docker:**
```bash
docker build -t app:latest .                      # Build image
trivy image app:latest                            # Scan for vulnerabilities
docker-compose up -d                              # Start services
docker exec -it postgres psql -U user db          # Connect to database
```

**UFW:**
```bash
ufw enable                                        # Enable firewall
ufw default deny incoming                         # Default deny
ufw allow 22/tcp                                  # Allow SSH
ufw limit 22/tcp                                  # Rate limit SSH
ufw-docker allow container-name 80                # Allow container port
```

**SSH:**
```bash
ssh-keygen -t ed25519 -C "comment"               # Generate key
ssh-copy-id user@server                           # Copy key to server
ssh -L 3000:localhost:3000 user@server           # SSH tunnel
```

**Hetzner:**
```bash
hcloud server create --name server01 \
  --type cpx41 --image ubuntu-24.04 \
  --ssh-key key-name --location hel1              # Create server
```

### File Locations in Geobeat

```
/Users/x25bd/Code/astral/geobeat/
├── .beads/
│   ├── issues.jsonl                 # Issue tracking (committed)
│   └── *.db                         # SQLite cache (gitignored)
├── src/
│   ├── analysis/
│   │   ├── requirements.txt         # Python dependencies
│   │   ├── gdi_standalone.py        # GDI calculator
│   │   ├── spatial_metrics.py       # PySAL wrapper
│   │   └── models.py                # Pydantic models
│   └── frontend/geobeat-ui/
│       ├── app/                     # Next.js App Router
│       ├── components/              # React components
│       └── package.json             # Node dependencies
├── data/tools/armiarma/             # Crawler (submodule)
├── docs/
│   ├── ARCHITECTURE.md              # System architecture
│   ├── DEPLOYMENT_CREDENTIALS.md    # Server credentials
│   └── FRAMEWORK_DOCUMENTATION.md   # This file
└── README.md                        # Project overview
```

---

**Document Status:** Complete
**Last Updated:** 2025-12-09
**Maintained By:** AI Documentation Researcher
