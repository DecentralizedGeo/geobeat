# Spatial Analysis Module

Geographic Decentralization Index (GDI) - Physical Distribution Index (PDI) implementation.

## Overview

This module implements spatial statistics for analyzing the geographic distribution of blockchain nodes. It provides quantitative metrics to measure decentralization across physical space.

## Metrics Implemented

### 1. Moran's I - Spatial Autocorrelation
- **Purpose**: Detect clustering or dispersion patterns
- **Range**: -1 (perfect dispersion) to +1 (perfect clustering)
- **Interpretation**:
  - I > 0: Nodes cluster together
  - I ≈ 0: Random distribution
  - I < 0: Nodes dispersed (rare in practice)
- **Statistical significance**: p-value from permutation test

### 2. Spatial HHI - Geographic Concentration
- **Purpose**: Measure concentration across grid cells
- **Range**: 1/n (perfectly distributed) to 1 (all in one cell)
- **Thresholds**:
  - HHI < 0.15: Low concentration
  - 0.15 ≤ HHI < 0.25: Moderate concentration
  - HHI ≥ 0.25: High concentration
- **Uses**: H3 hexagonal grid for consistent area cells

### 3. Effective Number of Locations (ENL)
- **Purpose**: Entropy-based diversity measure
- **Calculation**: exp(Shannon entropy)
- **Interpretation**: "How many equally-sized locations would give the same entropy?"
- **Advantage**: Intuitive scale (counts effective locations)

### 4. Average Nearest Neighbor (ANN)
- **Purpose**: Point pattern analysis
- **Range**: 0 (complete clustering) to 2.15 (theoretical max dispersion)
- **Interpretation**:
  - ANN < 1: Clustering
  - ANN ≈ 1: Random
  - ANN > 1: Dispersion
- **Statistical significance**: Z-score test against random pattern

## Installation

Install required dependencies:

```bash
pip install -r requirements.txt
```

## Quick Start

```python
from data_ingestion import load_sample_data
from spatial_metrics import SpatialAnalyzer
from visualization import plot_metric_summary

# Load data
gdf = load_sample_data(network="ethereum")

# Analyze
analyzer = SpatialAnalyzer(gdf)
results = analyzer.compute_all_metrics()

# Visualize
plot_metric_summary(results, network="ethereum", save_path="output.png")
```

## Module Structure

```
src/analysis/
├── __init__.py              # Package initialization
├── models.py                # Pydantic data models
├── data_ingestion.py        # Data loading and parsing
├── spatial_metrics.py       # Core spatial statistics
├── visualization.py         # Plotting and dashboards
├── demo.py                  # End-to-end demo script
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Usage Examples

### Running the Demo

```bash
cd src/analysis
python demo.py
```

This will:
1. Generate sample clustered node data
2. Compute all spatial metrics
3. Create visualizations
4. Export results to `data/analysis_outputs/`

### Using Real Data

```python
from data_ingestion import BitnodesIngestion, snapshot_to_geodataframe
from spatial_metrics import SpatialAnalyzer

# Fetch Bitcoin nodes
ingestion = BitnodesIngestion(api_key="your_key")
snapshot = ingestion.fetch_snapshot()
gdf = snapshot_to_geodataframe(snapshot)

# Analyze
analyzer = SpatialAnalyzer(gdf)
results = analyzer.compute_all_metrics(
    threshold_km=500.0,      # Distance for spatial weights
    h3_resolution=5          # Metro-level hexagons
)

# Access individual metrics
print(f"Moran's I: {results['morans_i'].value:.3f}")
print(f"Spatial HHI: {results['spatial_hhi'].value:.3f}")
print(f"ENL: {results['enl'].value:.1f}")
print(f"ANN Index: {results['ann'].value:.3f}")
```

### Custom Analysis

```python
from spatial_metrics import SpatialAnalyzer

analyzer = SpatialAnalyzer(gdf)

# Individual metrics with custom parameters
morans = analyzer.morans_i(threshold_km=300.0, permutations=9999)
hhi = analyzer.spatial_hhi(resolution=7)  # Neighborhood-level
enl = analyzer.effective_num_locations(resolution=5)
ann = analyzer.average_nearest_neighbor()

# Access detailed metadata
print(f"HHI top 5 cells: {hhi.metadata['top_5_cells']}")
print(f"Moran's I expected: {morans.expected_i:.4f}")
print(f"ANN study area: {ann.metadata['study_area_km2']:.0f} km²")
```

## Data Models

All results use Pydantic models for type safety:

- `NodeLocation`: Individual node geographic data
- `NetworkSnapshot`: Complete network state
- `MoranIResult`: Moran's I with significance testing
- `SpatialHHIResult`: HHI with grid statistics
- `ENLResult`: ENL with entropy components
- `ANNResult`: ANN with observed/expected distances

## Visualization Outputs

### 1. Node Distribution Map
Shows all nodes on world map (requires internet for basemap)

### 2. H3 Heatmap
Hexagonal density heatmap using Uber's H3 spatial index

### 3. Metric Summary Dashboard
4-panel dashboard with:
- Moran's I bar chart
- Spatial HHI bar chart with thresholds
- ENL comparison (actual vs effective)
- ANN distance comparison
- Text interpretation summary

## Mathematical Foundations

### Moran's I Formula
```
I = (n/W) * Σᵢ Σⱼ wᵢⱼ(xᵢ - x̄)(xⱼ - x̄) / Σᵢ(xᵢ - x̄)²
```
Where:
- n = number of nodes
- W = sum of spatial weights
- wᵢⱼ = spatial weight between nodes i and j
- xᵢ = attribute value at node i
- x̄ = mean attribute value

### Spatial HHI Formula
```
HHI = Σₖ (sₖ)²
```
Where sₖ = share of nodes in cell k

### ENL Formula
```
ENL = exp(-Σₖ pₖ log(pₖ))
```
Where pₖ = probability (share) of cell k

### ANN Formula
```
ANN = D̄ₒ / D̄ₑ
D̄ₑ = 0.5 / √λ
```
Where:
- D̄ₒ = observed mean nearest neighbor distance
- D̄ₑ = expected distance under random pattern
- λ = point density

## Configuration

### H3 Resolution Guidelines
- **3**: Continental/national scale (~100km edge)
- **5**: Metropolitan scale (~8km edge) [recommended]
- **7**: Neighborhood scale (~1km edge)
- **9**: Block scale (~150m edge)

### Distance Thresholds
- **Bitcoin/Ethereum**: 500km (captures regional patterns)
- **Smaller networks**: 300-500km
- **Global analysis**: 1000km+

## Performance Notes

- Moran's I with 1000 nodes and 999 permutations: ~2-5 seconds
- Spatial HHI with H3 resolution 5: <1 second
- ENL calculation: <1 second
- ANN with KD-tree: <1 second
- Total pipeline for 1000 nodes: ~5-10 seconds

## Next Steps

Phase 2 implementation (see Issue #3):
- LISA (Local Indicators of Spatial Association)
- Kernel Density Estimation (KDE)
- Ripley's K/L functions
- Multi-temporal analysis
- Real-time data ingestion for all 6 networks

## References

- Anselin, L. (1995). Local Indicators of Spatial Association—LISA
- Nakamoto, Y. et al. (2024). Gini of Eigenvector Centrality for blockchain networks
- Uber H3: https://h3geo.org/
- PySAL documentation: https://pysal.org/

## Contributing

See `CONTRIBUTING.md` in project root for guidelines.

## License

See project LICENSE file.
