# GEOBEAT Analysis Notebooks

This directory contains Jupyter notebooks for analyzing geographic decentralization metrics and methodology development.

## Notebooks

### `gdi_scoring_analysis.ipynb`
**Purpose**: Statistical analysis of current network concentration patterns to validate GDI scoring methodology improvements.

**What it does**:
- Loads network data for Ethereum, Polygon, and Filecoin
- Calculates country and organization concentration metrics
- Compares current GDI scores with underlying concentration
- Identifies critical concentration thresholds
- Proposes calibrated interpretation ranges
- Exports summary data for methodology updates

**When to use**:
- Before modifying GDI scoring formulas
- To validate that score changes reflect actual risk
- To generate evidence for methodology documentation
- To explore network concentration patterns interactively

**Output**:
- Visualizations of concentration patterns
- Summary statistics tables
- Critical concentration flags
- `data/concentration_analysis_summary.json` export

## Setup

Install required dependencies:

```bash
pip install pandas numpy matplotlib seaborn geopandas shapely
```

## Running Notebooks

From the project root:

```bash
jupyter notebook notebooks/gdi_scoring_analysis.ipynb
```

Or use VS Code with the Jupyter extension for an integrated experience.

## Related Documentation

- `docs/PROPOSED_METHODOLOGY.md` - Theoretical framework
- `data/methodology/` - Methodology documentation
- `src/analysis/gdi.py` - GDI calculation implementation
