# GEOBEAT Repository Cleanup Plan

**Goal:** Transform repo into clean, demo-ready state for CTO/grant funder presentation

**Strategy:**
- Archive old work on `vibe/ideating` branch (DONE)
- Clean up `main` branch to be professional and minimal
- Focus: Demo, essential data, proposal documentation

---

## Phase 1: Data Directory Surgery (HIGH PRIORITY)

### 1.1 Remove Empty Zombie Directories

**Problem:** data/README.md describes elaborate structure that doesn't exist. Empty dirs confuse reviewers.

```bash
# Remove empty directories
rmdir data/assessments
rmdir data/inventory
rmdir data/scripts
rmdir data/templates
rmdir data/processed

# Or if they have .DS_Store files:
rm -rf data/assessments data/inventory data/scripts data/templates data/processed
```

**Rationale:** These are aspirational directories for a full data pipeline we haven't built yet. Remove until needed.

### 1.2 Fix "v0_final" Naming

**Problem:** Screams "I don't know what version this is"

```bash
# Rename files
git mv src/analysis/gdi_v0_final.py src/analysis/gdi.py
git mv data/gdi_v0_final.json data/gdi_results.json  # Or delete if duplicate

# Update all references
grep -r "gdi_v0_final" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vibe
# Update found references
```

**Note:** This might be duplicate of `data/gdi_results.json` - check and delete if so.

### 1.3 Remove Code from Data Outputs

**Problem:** `data/analysis_outputs/.../code/` contains full source code copies. Anti-pattern.

```bash
# Remove the code directory from analysis outputs
rm -rf data/analysis_outputs/ethereum_6958nodes_500km_h3-5_b4c6b09a/code/

# Update analysis_outputs README to not mention code copies
```

**Rationale:** Analysis outputs should contain RESULTS only (JSON, CSV, PNG), not implementation. We have version control for code.

### 1.4 Simplify data/README.md

**Problem:** Describes elaborate structure that doesn't exist. Sets false expectations.

**Replace with:**
```markdown
# GEOBEAT Data Directory

Essential data for GEOBEAT geographic decentralization analysis.

## Structure

- **raw/** - Original node location data from sources
  - `2025-11-22-ethereum-ips.csv` - Ethereum execution layer nodes
  - `2025-11-22-filecoin-ips.csv` - Filecoin storage nodes
  - `2025-11-22-polygon-ips.csv` - Polygon nodes
  - `2025-11-23-celo-ips.csv` - Celo nodes
  - `ethereum-cl/` - Ethereum consensus layer data

- **analysis_outputs/** - Example GDI calculation results
  - `ethereum_6958nodes_500km_h3-5_b4c6b09a/` - Example analysis run

- **timeseries/** - Historical trend data
  - `ethereum_timeseries.csv` - Time-series GDI scores
  - `ethereum_trends.png` - Visualization

- **RESEARCH.md** - Data source research notes

## Data Sources

See `/data-sources/` directory for comprehensive source inventory and methodology.

## Quick Stats

- **Networks:** Ethereum, Filecoin, Polygon, Celo
- **Total Nodes:** ~10,000+ across networks
- **Data Freshness:** November 2025
- **GeoIP Provider:** MaxMind GeoLite2
```

### 1.5 Clarify CHECKLIST Status

**Problem:** `data-sources/CHECKLIST.md` looks like incomplete work. It's actually a process template.

**Options:**
1. **Rename:** `CHECKLIST.md` → `EVALUATION_TEMPLATE.md` or `SOURCE_EVALUATION_PROCESS.md`
2. **Move:** to `data-sources/methodology/templates/`
3. **Add note at top:** "This is a TEMPLATE for evaluating data sources, not a task list"

**Recommendation:** Move to methodology and rename:
```bash
git mv data-sources/CHECKLIST.md data-sources/methodology/templates/source_evaluation_checklist.md
```

Update references in INVENTORY.md and other docs.

---

## Phase 2: Branding Consistency (MEDIUM PRIORITY)

### 2.1 Fix "GeoBeat" → "GEOBEAT" Everywhere

**Problem:** Inconsistent branding. User wants GEOBEAT (all caps).

```bash
# Find all instances
git grep -i "geobeat" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vibe > geobeat_instances.txt

# Files to update:
# - README.md (every instance)
# - All docs/ files
# - Frontend package.json "name" field
# - Frontend components (page titles, meta tags)
# - data-sources/INVENTORY.md header
# - CONTRIBUTING.md
```

**Exception:** Keep lowercase in:
- URLs: `geobeat.io`, `github.com/.../geobeat`
- File paths: `geobeat-ui/`
- Code identifiers: `const geobeat = ...`

**Style Guide:**
- **Project Name:** GEOBEAT (all caps)
- **Possessive:** GEOBEAT's
- **With domain:** GEOBEAT.xyz
- **Descriptions:** "GEOBEAT is a geographic..."

### 2.2 Update Frontend Directory Name

**Problem:** `src/frontend/v0-geobeat-ui` has "v0" prefix

```bash
git mv src/frontend/v0-geobeat-ui src/frontend/geobeat-ui

# Update all references:
# - README.md paths
# - Any relative imports
# - Documentation
```

---

## Phase 3: Documentation Cleanup (MEDIUM PRIORITY)

### 3.1 Fix data-sources Documentation

**Current structure is good but could be clearer:**

```
data-sources/
├── README.md                    # Keep - entry point
├── INVENTORY.md                 # Keep - excellent source catalog
├── methodology/                 # Keep - good documentation
│   ├── EVALUATION_GUIDE.md
│   ├── FRAMEWORK_REFERENCE.md
│   ├── QUICK_REFERENCE.md
│   ├── README.md
│   ├── SUMMARY.md
│   └── templates/
│       └── source_evaluation_checklist.md  # MOVED from root CHECKLIST.md
└── tools/
    └── armiarma/                # Git submodule - keep
```

**Update data-sources/README.md** to mention the template moved:
```markdown
## Documentation

- **INVENTORY.md** - Comprehensive catalog of 15+ data sources
- **methodology/** - Detailed evaluation framework
  - See `methodology/templates/source_evaluation_checklist.md` for source assessment process
```

### 3.2 Consolidate or Remove Redundant Docs

**Check for overlap:**
```bash
# Find duplicate information
grep -l "data source" docs/*.md research/*.md data-sources/*.md
```

**Recommendation:** Create single source of truth hierarchy:
1. `/data-sources/INVENTORY.md` - THE data source catalog
2. `/data-sources/methodology/` - HOW to evaluate sources
3. `/docs/` - User-facing documentation
4. `/research/` - Research papers and academic content

---

## Phase 4: Code Cleanup (MEDIUM PRIORITY)

### 4.1 Consolidate GDI Implementations

**Current mess:**
- `src/analysis/gdi_v0_final.py` (299 lines)
- `src/analysis/gdi_standalone.py` (500 lines)
- `src/analysis/simple_metrics.py` (266 lines)

**Decision needed:** Which ONE to keep?

**Recommendation:**
```bash
# Keep the cleanest implementation
git mv src/analysis/gdi_v0_final.py src/analysis/gdi.py

# Document why standalone exists (if keeping)
cat > src/analysis/README.md << 'EOF'
# GEOBEAT Spatial Analysis

## Core Modules

- **gdi.py** - Geographic Decentralization Index calculation
- **gdi_standalone.py** - Self-contained version with no PySAL dependencies (for lightweight deployments)
- **spatial_metrics.py** - Spatial analysis utilities (Moran's I, spatial HHI)
- **models.py** - Pydantic data models
- **data_ingestion.py** - Data loading and validation

## Why Multiple GDI Implementations?

- `gdi.py` - Production version, uses PySAL library
- `gdi_standalone.py` - Educational version with manual Moran's I implementation for understanding the algorithm

Choose `gdi.py` for actual analysis.
EOF

# Or if standalone is truly redundant:
git rm src/analysis/gdi_standalone.py
git rm src/analysis/simple_metrics.py
```

### 4.2 Fix Console.log Statements

**Frontend code quality:**
```bash
# Find all console statements
grep -rn "console\." src/frontend/geobeat-ui/components/ src/frontend/geobeat-ui/lib/

# Replace with proper error handling or remove
```

---

## Phase 5: Essential Documentation (HIGH PRIORITY)

### 5.1 Add Missing Root Files

**Create SECURITY.md:**
```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in GEOBEAT, please email security@geobeat.xyz

Please do not file public issues for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | ✅                 |

## Data Privacy

GEOBEAT analyzes publicly available blockchain node data (IP addresses). All data sources are documented in `/data-sources/INVENTORY.md`.
```

**Create LICENSE (if missing):**
```bash
# Choose appropriate license (MIT recommended for grants)
curl -o LICENSE https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt
# Edit: Copyright (c) 2025 GEOBEAT Team
```

**Create ARCHITECTURE.md:**
```markdown
# GEOBEAT Architecture

## System Overview

GEOBEAT calculates a Geographic Decentralization Index (GDI) for blockchain networks using spatial analysis techniques.

## Components

1. **Data Collection** (`/data-sources/tools/armiarma`)
   - Crawls blockchain networks for node locations
   - Collects IP addresses and metadata

2. **Spatial Analysis** (`/src/analysis`)
   - GDI calculation (PDI, JDI, IHI components)
   - H3 hexagonal spatial indexing
   - Moran's I spatial autocorrelation

3. **Dashboard** (`/src/frontend/geobeat-ui`)
   - Next.js 16 + React 19 web application
   - Interactive Mapbox visualization
   - Real-time GDI scores

## Data Flow

```
Node IPs → GeoIP Lookup → H3 Indexing → GDI Calculation → Visualization
```

## Key Technologies

- **Spatial:** GeoPandas, PySAL, H3
- **Frontend:** Next.js, React, Mapbox GL, Recharts
- **Styling:** Tailwind CSS 4

See `/docs` for detailed documentation.
```

### 5.2 Enhance README.md

**Update with:**
- GEOBEAT branding (all caps)
- Badges (once CI is set up)
- Clear 3-sentence "what is this"
- 2-minute quick start
- Demo section with screenshot

---

## Phase 6: Demo Preparation (HIGH PRIORITY)

### 6.1 Create DEMO.md

```markdown
# GEOBEAT Demo Guide

## Quick Start (< 2 minutes)

\`\`\`bash
git clone https://github.com/DecentralizedGeo/geobeat.git
cd geobeat

# Install and run
npm install
cd src/frontend/geobeat-ui
cp .env.example .env.local
# Add your NEXT_PUBLIC_MAPBOX_TOKEN

npm run dev
\`\`\`

Open http://localhost:3000

## Demo Flow (5 minutes)

### 1. Overview (1 min)
Show the landing page with global network heatmap.

**Key Points:**
- GEOBEAT measures geographic decentralization
- Analyzes 10,000+ nodes across 4+ blockchain networks
- Real-time GDI scores (0-1 scale)

### 2. Network Deep Dive (2 min)
Click "Ethereum" to see detailed analysis.

**Show:**
- Geographic distribution map
- GDI breakdown: PDI (political), JDI (jurisdictional), IHI (infrastructure)
- Country concentration metrics

**Explain:**
"We use Uber's H3 to create 500km hexagons for spatial analysis. Moran's I measures clustering."

### 3. Methodology (1 min)
Navigate to "Methodology" page.

**Highlight:**
- Research-backed approach
- Published methodology in `/docs`
- Data transparency (all sources documented)

### 4. API Demo (1 min)
\`\`\`bash
# Coming soon - API endpoints
curl https://api.geobeat.xyz/networks/ethereum/gdi
\`\`\`
```

### 6.2 Create Screenshots

```bash
# Take screenshots and add to assets/demo/
mkdir -p assets/demo

# Screenshots needed:
# - assets/demo/dashboard.png (landing page)
# - assets/demo/network-analysis.png (Ethereum detail view)
# - assets/demo/gdi-breakdown.png (score components)
# - assets/demo/methodology.png (docs page)
```

Add to README:
```markdown
## Screenshots

![Dashboard](assets/demo/dashboard.png)
*Global network analysis dashboard*

![Network Analysis](assets/demo/network-analysis.png)
*Detailed geographic breakdown for Ethereum*
```

---

## Quick Wins (Do These First - < 30 min total)

```bash
# 1. Remove empty directories (1 min)
rm -rf data/{assessments,inventory,scripts,templates,processed}

# 2. Fix v0_final naming (2 min)
git mv src/analysis/gdi_v0_final.py src/analysis/gdi.py
# Check if gdi_v0_final.json is duplicate of gdi_results.json
# If yes: git rm data/gdi_v0_final.json

# 3. Remove code from analysis outputs (1 min)
rm -rf data/analysis_outputs/*/code/

# 4. Rename CHECKLIST (1 min)
git mv data-sources/CHECKLIST.md data-sources/methodology/templates/source_evaluation_checklist.md

# 5. Remove .DS_Store files (1 min)
find . -name .DS_Store -type f -delete

# 6. Rename frontend directory (2 min)
git mv src/frontend/v0-geobeat-ui src/frontend/geobeat-ui

# 7. Add SECURITY.md (3 min)
# Create file with template above

# 8. Add LICENSE (2 min)
# Download and customize MIT license

# 9. Update README.md header (5 min)
# Change "GeoBeat" to "GEOBEAT" throughout

# 10. Simplify data/README.md (5 min)
# Replace with minimal version above
```

**Estimated time:** 23 minutes
**Impact:** Immediately professional-looking repo

---

## Acceptance Criteria for Clean Repo

### Structure
- [ ] No empty directories
- [ ] No "v0_final" or "temp" in file names
- [ ] No source code in data/ outputs
- [ ] Frontend directory has clean name (no v0 prefix)

### Branding
- [ ] GEOBEAT (all caps) in all visible places
- [ ] Consistent styling throughout docs
- [ ] Professional naming conventions

### Documentation
- [ ] README.md is clear and concise
- [ ] SECURITY.md exists
- [ ] LICENSE exists
- [ ] ARCHITECTURE.md gives quick overview
- [ ] data/README.md accurately reflects structure
- [ ] CHECKLIST is clearly marked as template

### Demo-Ready
- [ ] DEMO.md with step-by-step guide
- [ ] Screenshots in assets/demo/
- [ ] 2-minute setup time
- [ ] Impressive first impression

### Code Quality
- [ ] One canonical GDI implementation (or documented rationale for multiple)
- [ ] No console.log in production code
- [ ] No TypeScript errors suppressed
- [ ] Clean git status after build

---

## What to KEEP on vibe/ideating

Everything that's currently on main has been preserved on `vibe/ideating`. That branch is your archive of all the exploration work.

**Don't delete these from vibe/ideating:**
- All the experimental files
- Multiple GDI implementations (they show your thinking)
- Empty directories (they show your planned structure)
- CHECKLIST.md (it's a good template)
- v0_final files (they mark evolution)

**The main branch** should be the "if I show this to someone important" version.

---

## Timeline

| Phase | Work | Time |
|-------|------|------|
| **Quick Wins** | Empty dirs, rename files, remove cruft | 30 min |
| **Phase 1** | Data directory surgery | 1-2 hours |
| **Phase 2** | Branding consistency | 1 hour |
| **Phase 3** | Documentation cleanup | 2 hours |
| **Phase 4** | Code consolidation | 2-3 hours |
| **Phase 5** | Essential docs (LICENSE, SECURITY, ARCH) | 1-2 hours |
| **Phase 6** | Demo prep | 1-2 hours |
| **Total** | **8-12 hours** (1-2 days) |

**With team:** Can parallelize to ~6-8 hours with 2 people.

---

## Next Steps

1. **Review this plan** - Does it align with your vision?
2. **Execute Quick Wins** - Get immediate improvement
3. **Phase 1 surgery** - Clean data directory
4. **Create PR** - `cleanup/demo-ready` → `main`
5. **Show someone** - Get fresh eyes feedback
6. **Iterate** - Polish based on feedback

**Remember:** vibe/ideating preserves all your work. Main branch is the "presentable" version.
