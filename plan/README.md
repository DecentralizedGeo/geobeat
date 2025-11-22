
# **0. Repo (15 min)**

* [x] Create GitHub org or repo: `geobeat`
* Add `README`, barebones folder structure:

  ```
  /api
  /ui
  /scripts
  /data
  /methods
  ```
* Write a **1-paragraph README** stating:

  * Goal
  * First milestone (v0 index for 3–5 chains)
  * High-level data approach
  * License

---

# **1. Scope (1.5 hours)**

Here are the things you need to sketch *now* to avoid chaos later:

### **1.1 Elements**

* Index v0 (small, honest, interpretable)
* Dashboard (map + scorecard per chain)
* Docs site (just a README for now)
* Time-series placeholder (empty but structured)
* Call for data contributors

### **1.2 Data sources**

Choose **3** to make v0 possible:

* Public node lists or RPC endpoints
* DNS seeds
* Traceroute probes
* BGP attribution
* Cloud provider fingerprinting (basic, not the full suite)
* Prior Flashbots analysis (structure, not copying)

**Avoid**: any technique requiring days of data collection or deep probing.

### **1.3 Pitch**

Short, delicious:

* Geography is an attack surface.
* Chains don’t know where their infra actually lives.
* This index makes that visible.
* Transparent, challenging, not self-flattering.

### **1.4 Methodology**

Sketch, don’t perfect:

* Choose 3 axes for v0:

  1. Cloud concentration
  2. Jurisdictional spread
  3. Physical distribution (coarse: continent-level)
* Scoring: simple, raw, unweighted
* Error bounds: explicit (“this is probabilistic”)

### **1.5 Governance**

Keep it feather-light:

* Publicly visible repo
* Open issues for critique
* Call for external reviewers
* Invite independent contributors for peer review

### **1.6 What else?**

* Naming patterns
* Visual identity
* Messaging for launch tweet
* Note on **ethics + probing boundaries**

---

# **2. Validation (1 hour)**

You need **5 conversations max**. Laser-focused.

### Candidate targets:

* Ethereum Foundation research
* Polygon infra
* Solana core dev
* Filecoin node operators
* One neutral network analyst (like Flashbots / Relayer / Lido folks)

### Ask:

* What is useful vs irrelevant?
* What blind spots do they see?
* What would make them trust the index?
* What datasets do they already have?
* Would they contribute data?

### Output:

* A short Google Doc: “Learnings from Validation Round 1”

---

# **3. Data Collection (2 hours)**

Very narrow. Good enough is good enough.
Choose **two networks for v0** to keep scope survivable.

### Minimal pipeline:

1. Gather DNS seed lists or node endpoints
2. Run traceroute or ping sweeps
3. Resolve IP → ASN → Provider → Region
4. Tag: Cloud / ISP / Country / Continent
5. Export as a CSV and GeoJSON

### Scope control:

* Don’t try to *prove* location;
* You’re demonstrating **structure + method**, not **truth**.

### Deliverable:

`/data/v0/ethereum.json`, `/data/v0/polygon.json`

---

# **4. UI Design (1 hour)**

### **4.1 Wireframe v1 (30 min)**

Pages:

* Hero: tagline + “coming soon” animation
* Chain overview grid
* Chain detail page:

  * Score breakdown
  * Map
  * Cloud/Jurisdiction stats
  * Methodology notes

### **4.2 Collect reactions (15 min)**

Share in Telegram group.
Ask only: “What feels missing?” Do NOT ask “Do you like it?”

### **4.3 Wireframe v2 (15 min)**

Incorporate 2–3 strongest points. Stop before scope creeps.

### **4.4 Prompt design (optional)**

If using V0 or Claude Vision prompts for sections.

---

# **5. Backend Development (1 hour)**

Target: ultra-basic Node/TS server that serves static JSON.

* `GET /api/v0/:chain` → JSON dump
* `GET /api/chains` → list
* No compute, no auth, no DB
* Static JSON files until v1

---

# **6. UI Development (1.5 hours)**

Use V0 or Next.js template.

Pages:

* `/` → Hero + explanation
* `/chains` → basic grid
* `/chains/[id]` → detail view, with map using MapLibre
* `/about-method` → versioned methodology

### Priority:

* Render the map
* Render the numeric score
* Render the chain name/logo

Everything else is decoration.

---

# **7. Methodology (45 min)**

Write the **v0 Methodology Note**:

* Explicitly state:

  * limited signals
  * coarse inference
  * raw scoring
* Put a “Known Issues / Error Bounds” section
* Add a “Help Us Improve” call to action
* Version it: `/methods/v0.md`

This is essential trust scaffolding.

---

# **8. Presentation / Pitch (30 min)**

Create a concise launch deck (5–7 slides):

* Problem: geography is invisible
* Why it matters: attack surface
* What GDI measures
* v0 results (teaser map)
* Roadmap
* Call to contribute
* Telegram link

Drop it in the group before release to build anticipation.

---

# **TL;DR Schedule (10 hours)**

```
0. Repo                           0:15
1. Scope                          1:30
2. Validation                     1:00
3. Data Collection                2:00
4. UI Design                      1:00
5. Backend Dev                    1:00
6. UI Dev                         1:30
7. Methodology                    0:45
8. Pitch                          0:30
-----------------------------------------
TOTAL                             9:30
```
