"""
Demo script for spatial analysis pipeline

Demonstrates the complete workflow:
1. Load sample data
2. Run spatial metrics
3. Generate visualizations
4. Export results
"""

import logging
from pathlib import Path
import json
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from data_ingestion import load_sample_data
from spatial_metrics import SpatialAnalyzer
from visualization import (
    plot_node_distribution_map,
    plot_h3_heatmap,
    plot_metric_summary
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Run complete spatial analysis demo"""

    logger.info("Starting spatial analysis demo")

    # Load sample data first to get input characteristics
    logger.info("Loading sample data...")
    gdf = load_sample_data(network="ethereum")
    logger.info(f"Loaded {len(gdf)} nodes")

    # Define analysis parameters
    params = {
        "threshold_km": 500.0,
        "h3_resolution": 5,
        "permutations": 999
    }

    # Create deterministic run name based on inputs and parameters
    import hashlib
    from datetime import datetime

    # Hash input characteristics + parameters
    input_hash_data = f"ethereum_{len(gdf)}nodes_{params['threshold_km']}km_h3res{params['h3_resolution']}"
    run_hash = hashlib.md5(input_hash_data.encode()).hexdigest()[:8]

    # Use descriptive name with hash to prevent duplicates
    run_name = f"ethereum_{len(gdf)}nodes_500km_h3-5_{run_hash}"

    output_base = Path(__file__).parent.parent.parent / "data" / "analysis_outputs"
    output_dir = output_base / run_name

    # Check if this exact analysis already exists
    if output_dir.exists():
        logger.warning(f"Analysis already exists at {output_dir}")
        logger.warning("Skipping duplicate analysis. Delete directory to re-run.")
        return

    output_dir.mkdir(parents=True, exist_ok=True)

    # Create subdirectories
    (output_dir / "input").mkdir(exist_ok=True)
    (output_dir / "code").mkdir(exist_ok=True)
    (output_dir / "output").mkdir(exist_ok=True)

    timestamp = datetime.utcnow().isoformat()

    # Save input metadata
    input_metadata = {
        "network": "ethereum",
        "num_nodes": len(gdf),
        "num_nodes_with_coords": len(gdf),
        "timestamp": timestamp,
        "source_file": "data/raw/2025-11-22-ethereum-ips.csv",
        "bounding_box": {
            "min_lat": float(gdf.geometry.y.min()),
            "max_lat": float(gdf.geometry.y.max()),
            "min_lon": float(gdf.geometry.x.min()),
            "max_lon": float(gdf.geometry.x.max())
        },
        "columns": list(gdf.columns)
    }

    with open(output_dir / "input" / "metadata.json", 'w') as f:
        json.dump(input_metadata, f, indent=2)
    logger.info(f"Saved input metadata to {output_dir / 'input' / 'metadata.json'}")

    # Save input data sample (first 100 rows)
    gdf.head(100).to_file(
        output_dir / "input" / "sample_nodes.geojson",
        driver='GeoJSON'
    )
    logger.info(f"Saved input sample to {output_dir / 'input' / 'sample_nodes.geojson'}")

    # Initialize analyzer
    logger.info("Initializing spatial analyzer...")
    analyzer = SpatialAnalyzer(gdf)

    # Save code used for this analysis
    import shutil
    code_files = [
        "data_ingestion.py",
        "spatial_metrics.py",
        "visualization.py",
        "models.py",
        "demo.py",
        "requirements.txt"
    ]

    analysis_dir = Path(__file__).parent
    for code_file in code_files:
        src = analysis_dir / code_file
        if src.exists():
            shutil.copy(src, output_dir / "code" / code_file)

    logger.info(f"Saved code snapshot to {output_dir / 'code'}")

    # Save run configuration
    run_config = {
        "run_name": run_name,
        "run_hash": run_hash,
        "timestamp": timestamp,
        "network": "ethereum",
        "parameters": params,
        "code_files": code_files
    }

    with open(output_dir / "code" / "run_config.json", 'w') as f:
        json.dump(run_config, f, indent=2)

    # Compute all metrics
    logger.info("Computing spatial metrics...")
    results = analyzer.compute_all_metrics(
        threshold_km=params["threshold_km"],
        h3_resolution=params["h3_resolution"]
    )

    # Print results
    logger.info("\n" + "="*60)
    logger.info("SPATIAL ANALYSIS RESULTS")
    logger.info("="*60)

    for metric_name, result in results.items():
        logger.info(f"\n{metric_name.upper()}:")
        logger.info(f"  Value: {result.value:.4f}")
        if result.p_value:
            logger.info(f"  P-value: {result.p_value:.4f}")
        logger.info(f"  Interpretation: {result.interpretation}")

    # Generate visualizations
    logger.info("\nGenerating visualizations...")

    # Metric summary dashboard (doesn't need world map)
    fig3 = plot_metric_summary(
        results,
        network="ethereum",
        save_path=str(output_dir / "output" / "metric_summary.png")
    )
    logger.info(f"Saved: {output_dir / 'output' / 'metric_summary.png'}")

    # Skip world map visualizations for now (naturalearth_lowres deprecated)
    logger.info("Skipping map visualizations (world basemap unavailable)")

    # Export results as JSON
    results_json = {
        metric_name: {
            'value': result.value,
            'p_value': result.p_value,
            'interpretation': result.interpretation,
            'metadata': result.metadata
        }
        for metric_name, result in results.items()
    }

    json_path = output_dir / "output" / "results.json"
    with open(json_path, 'w') as f:
        json.dump(results_json, f, indent=2)
    logger.info(f"Saved: {json_path}")

    # Create detailed output metadata
    output_metadata = {
        "timestamp": timestamp,
        "network": "ethereum",
        "num_nodes_analyzed": len(gdf),
        "metrics_computed": list(results.keys()),
        "summary": {
            metric_name: {
                "value": result.value,
                "interpretation": result.interpretation
            }
            for metric_name, result in results.items()
        },
        "files_generated": [
            "results.json",
            "metric_summary.png"
        ]
    }

    with open(output_dir / "output" / "metadata.json", 'w') as f:
        json.dump(output_metadata, f, indent=2)
    logger.info(f"Saved: {output_dir / 'output' / 'metadata.json'}")

    # Create README for this run
    readme_content = f"""# Spatial Analysis: {run_name}

## Run Identification
- **Run Hash**: `{run_hash}`
- **Created**: {timestamp}
- **Reproducible**: Yes (deterministic hash prevents duplicates)

## Input Data
- **Network**: Ethereum
- **Nodes Analyzed**: {len(gdf):,}
- **Source**: data/raw/2025-11-22-ethereum-ips.csv
- **Bounding Box**: {input_metadata['bounding_box']}

## Parameters
- **Spatial Weights Threshold**: {params['threshold_km']} km
- **H3 Resolution**: {params['h3_resolution']} (metro-level)
- **Permutations**: {params['permutations']}

## Results Summary

### Moran's I: {results['morans_i'].value:.4f} (p={results['morans_i'].p_value:.4f})
{results['morans_i'].interpretation}

### Spatial HHI: {results['spatial_hhi'].value:.4f}
{results['spatial_hhi'].interpretation}

### Effective Number of Locations: {results['enl'].value:.1f}
{results['enl'].interpretation}

### Average Nearest Neighbor: {results['ann'].value:.4f} (p={results['ann'].p_value:.4f})
{results['ann'].interpretation}

## Directory Structure
```
{run_name}/
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
"""

    with open(output_dir / "README.md", 'w') as f:
        f.write(readme_content)
    logger.info(f"Saved: {output_dir / 'README.md'}")

    logger.info("\n" + "="*60)
    logger.info("Demo complete!")
    logger.info(f"All outputs saved to: {output_dir}")
    logger.info("="*60)


if __name__ == "__main__":
    main()
