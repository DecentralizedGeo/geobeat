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

    # Create output directory
    output_dir = Path(__file__).parent.parent.parent / "data" / "analysis_outputs"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load sample data
    logger.info("Loading sample data...")
    gdf = load_sample_data(network="ethereum")
    logger.info(f"Loaded {len(gdf)} nodes")

    # Initialize analyzer
    logger.info("Initializing spatial analyzer...")
    analyzer = SpatialAnalyzer(gdf)

    # Compute all metrics
    logger.info("Computing spatial metrics...")
    results = analyzer.compute_all_metrics(
        threshold_km=500.0,
        h3_resolution=5
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

    # Node distribution map
    fig1 = plot_node_distribution_map(
        gdf,
        title="Ethereum Node Distribution (Sample Data)",
        save_path=str(output_dir / "node_distribution.png")
    )
    logger.info(f"Saved: {output_dir / 'node_distribution.png'}")

    # H3 heatmap
    fig2 = plot_h3_heatmap(
        gdf,
        resolution=5,
        title="Node Density Heatmap (H3 Resolution 5)",
        save_path=str(output_dir / "h3_heatmap.png")
    )
    logger.info(f"Saved: {output_dir / 'h3_heatmap.png'}")

    # Metric summary dashboard
    fig3 = plot_metric_summary(
        results,
        network="ethereum",
        save_path=str(output_dir / "metric_summary.png")
    )
    logger.info(f"Saved: {output_dir / 'metric_summary.png'}")

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

    json_path = output_dir / "results.json"
    with open(json_path, 'w') as f:
        json.dump(results_json, f, indent=2)
    logger.info(f"Saved: {json_path}")

    logger.info("\n" + "="*60)
    logger.info("Demo complete!")
    logger.info(f"All outputs saved to: {output_dir}")
    logger.info("="*60)


if __name__ == "__main__":
    main()
