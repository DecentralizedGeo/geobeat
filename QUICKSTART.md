# Quick Start: Running the GDI Analysis Notebook

## Prerequisites

Poetry is already installed and configured in this project.

## Running the Notebook

### Option 1: Using the Poetry environment (Recommended)

```bash
# Install dependencies (first time only)
poetry install

# Launch Jupyter Notebook
poetry run jupyter notebook notebooks/gdi_scoring_analysis.ipynb
```

The notebook will open in your browser automatically.

### Option 2: Using the installed kernel

If you already have Jupyter running globally:

```bash
# Make sure the geobeat kernel is installed
poetry run python -m ipykernel install --user --name=geobeat

# Then launch Jupyter normally
jupyter notebook notebooks/gdi_scoring_analysis.ipynb
```

When the notebook opens, select `Kernel > Change kernel > geobeat` from the menu.

## What the Notebook Does

The `gdi_scoring_analysis.ipynb` notebook:

1. Loads network data for Ethereum, Polygon, and Filecoin
2. Calculates country concentration metrics (top 1, 2, 3, 5, 10 countries %)
3. Calculates organization concentration metrics
4. Compares current GDI scores with actual concentration
5. Identifies critical concentration thresholds
6. Generates visualizations (bar charts, scatter plots)
7. Exports summary to `data/concentration_analysis_summary.json`

## Expected Output

After running all cells, you should see:

- Network statistics summaries
- Concentration analysis tables
- Visualization plots showing:
  - Top countries/organizations by network
  - PDI vs country concentration
  - JDI vs jurisdictional concentration
  - IHI vs infrastructure concentration
- Critical threshold flags
- Proposed threshold calibration recommendations
- Exported JSON file

## Troubleshooting

### Missing dependencies

```bash
poetry install
```

### Kernel not found

```bash
poetry run python -m ipykernel install --user --name=geobeat
```

Then restart Jupyter and select the `geobeat` kernel.

### Can't find data files

Make sure you're running from the project root directory, and that `data/raw/` contains the network CSV files.

## Next Steps

After reviewing the analysis:

1. Review the proposed threshold calibrations
2. Proceed to `geobeat-ejx`: Update composite GDI scoring formula
3. Proceed to `geobeat-apq`: Recalibrate interpretation thresholds
4. Proceed to `geobeat-p5s`: Add boolean concentration flags
