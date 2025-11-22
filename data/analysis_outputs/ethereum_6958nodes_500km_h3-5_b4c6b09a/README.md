# Spatial Analysis: ethereum_6958nodes_500km_h3-5_b4c6b09a

## Run Identification
- **Run Hash**: `b4c6b09a`
- **Created**: 2025-11-22T23:06:23.609024
- **Reproducible**: Yes (deterministic hash prevents duplicates)

## Input Data
- **Network**: Ethereum
- **Nodes Analyzed**: 6,958
- **Source**: data/raw/2025-11-22-ethereum-ips.csv
- **Bounding Box**: {'min_lat': -43.579, 'max_lat': 69.638, 'min_lon': -157.8444, 'max_lon': 176.083}

## Parameters
- **Spatial Weights Threshold**: 500.0 km
- **H3 Resolution**: 5 (metro-level)
- **Permutations**: 999

## Results Summary

### Moran's I: 0.4043 (p=0.0010)
Significant clustering (I=0.404, p<0.01)

### Spatial HHI: 0.0184
Low concentration across 1410 cells (HHI=0.018)

### Effective Number of Locations: 237.5
Uneven distribution (ENL=237.5 of 1410 cells)

### Average Nearest Neighbor: 0.0730 (p=0.0000)
Significant clustering (ANN=0.073, p<0.01)

## Directory Structure
```
ethereum_6958nodes_500km_h3-5_b4c6b09a/
├── input/
│   ├── metadata.json          # Input data statistics
│   └── sample_nodes.geojson   # First 100 nodes sample
├── code/
│   ├── run_config.json        # Analysis parameters
│   ├── data_ingestion.py      # Code snapshot
│   ├── spatial_metrics.py     # Code snapshot
│   ├── visualization.py       # Code snapshot
│   ├── models.py              # Code snapshot
│   ├── demo.py                # Code snapshot
│   └── requirements.txt       # Dependencies
└── output/
    ├── results.json           # Full metric results
    ├── metric_summary.png     # Visualization dashboard
    ├── metadata.json          # Output metadata
    └── README.md              # This file
```

## Reproducibility
To reproduce this analysis:
1. Use the input data from `input/metadata.json`
2. Run the code in `code/` with parameters from `code/run_config.json`
3. Compare outputs with `output/results.json`
