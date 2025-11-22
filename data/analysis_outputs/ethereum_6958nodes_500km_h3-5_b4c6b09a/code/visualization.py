"""
Visualization functions for spatial analysis results

Creates maps, charts, and dashboards to communicate
geographic decentralization metrics.
"""

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import geopandas as gpd
from typing import Dict, Any, Optional, List
import h3
from shapely.geometry import Polygon
import pandas as pd

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)


def plot_node_distribution_map(
    gdf: gpd.GeoDataFrame,
    title: str = "Node Geographic Distribution",
    save_path: Optional[str] = None
) -> plt.Figure:
    """
    Create basic world map showing node locations

    Args:
        gdf: GeoDataFrame with node locations
        title: Plot title
        save_path: Optional path to save figure

    Returns:
        Matplotlib figure
    """
    fig, ax = plt.subplots(figsize=(16, 10))

    # Load world map
    world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
    world.plot(ax=ax, color='lightgray', edgecolor='white')

    # Plot nodes
    gdf.plot(
        ax=ax,
        color='red',
        alpha=0.6,
        markersize=20,
        label='Nodes'
    )

    ax.set_title(title, fontsize=16, fontweight='bold')
    ax.set_xlabel('Longitude')
    ax.set_ylabel('Latitude')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')

    return fig


def plot_h3_heatmap(
    gdf: gpd.GeoDataFrame,
    resolution: int = 5,
    title: str = "Node Density Heatmap (H3)",
    save_path: Optional[str] = None
) -> plt.Figure:
    """
    Create H3 hexagonal heatmap of node density

    Args:
        gdf: GeoDataFrame with node locations
        resolution: H3 resolution
        title: Plot title
        save_path: Optional path to save figure

    Returns:
        Matplotlib figure
    """
    # Convert to H3 cells
    gdf['h3_cell'] = gdf.apply(
        lambda row: h3.latlng_to_cell(row.geometry.y, row.geometry.x, resolution),
        axis=1
    )

    # Count nodes per cell
    cell_counts = gdf['h3_cell'].value_counts()

    # Create hexagon polygons for visualization
    hexagons = []
    for cell_id, count in cell_counts.items():
        boundary = h3.cell_to_boundary(cell_id)
        # H3 returns (lat, lng) but Shapely expects (lng, lat)
        polygon = Polygon([(lng, lat) for lat, lng in boundary])
        hexagons.append({
            'h3_cell': cell_id,
            'count': count,
            'geometry': polygon
        })

    hex_gdf = gpd.GeoDataFrame(hexagons, crs='EPSG:4326')

    # Plot
    fig, ax = plt.subplots(figsize=(16, 10))

    # World background
    world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
    world.plot(ax=ax, color='lightgray', edgecolor='white', alpha=0.5)

    # Hexagon heatmap
    hex_gdf.plot(
        ax=ax,
        column='count',
        cmap='YlOrRd',
        edgecolor='black',
        alpha=0.7,
        legend=True,
        legend_kwds={'label': 'Node Count', 'shrink': 0.8}
    )

    ax.set_title(title, fontsize=16, fontweight='bold')
    ax.set_xlabel('Longitude')
    ax.set_ylabel('Latitude')
    ax.grid(True, alpha=0.3)

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')

    return fig


def plot_metric_summary(
    results: Dict[str, Any],
    network: str,
    save_path: Optional[str] = None
) -> plt.Figure:
    """
    Create summary dashboard of all spatial metrics

    Args:
        results: Dictionary of metric results from compute_all_metrics()
        network: Network name
        save_path: Optional path to save figure

    Returns:
        Matplotlib figure
    """
    fig = plt.figure(figsize=(16, 12))
    gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)

    # Title
    fig.suptitle(
        f"Geographic Decentralization Metrics: {network.upper()}",
        fontsize=18,
        fontweight='bold',
        y=0.98
    )

    # 1. Moran's I
    ax1 = fig.add_subplot(gs[0, 0])
    moran_result = results['morans_i']
    ax1.bar(['Moran\'s I'], [moran_result.value], color='steelblue')
    ax1.axhline(y=0, color='red', linestyle='--', linewidth=1, label='Random')
    ax1.set_ylabel('Moran\'s I Value')
    ax1.set_title('Spatial Autocorrelation (Moran\'s I)')
    ax1.text(
        0, moran_result.value + 0.05,
        f"I={moran_result.value:.3f}\np={moran_result.p_value:.4f}",
        ha='center',
        fontsize=10
    )
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # 2. Spatial HHI
    ax2 = fig.add_subplot(gs[0, 1])
    hhi_result = results['spatial_hhi']
    ax2.bar(['Spatial HHI'], [hhi_result.value], color='coral')
    ax2.axhline(y=0.15, color='orange', linestyle='--', label='Moderate threshold')
    ax2.axhline(y=0.25, color='red', linestyle='--', label='High threshold')
    ax2.set_ylabel('HHI Value')
    ax2.set_title('Geographic Concentration (Spatial HHI)')
    ax2.text(
        0, hhi_result.value + 0.02,
        f"HHI={hhi_result.value:.3f}\n{hhi_result.num_cells_occupied} cells",
        ha='center',
        fontsize=10
    )
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    # 3. Effective Number of Locations
    ax3 = fig.add_subplot(gs[1, 0])
    enl_result = results['enl']
    actual = enl_result.total_locations
    effective = enl_result.value
    ax3.bar(['Actual\nLocations', 'Effective\nLocations'], [actual, effective],
            color=['lightblue', 'steelblue'])
    ax3.set_ylabel('Number of Locations')
    ax3.set_title('Location Diversity (Effective Number)')
    ax3.text(
        0, actual + 2,
        f"{actual}",
        ha='center',
        fontsize=10
    )
    ax3.text(
        1, effective + 2,
        f"{effective:.1f}",
        ha='center',
        fontsize=10
    )
    ax3.grid(True, alpha=0.3)

    # 4. Average Nearest Neighbor
    ax4 = fig.add_subplot(gs[1, 1])
    ann_result = results['ann']
    ax4.bar(
        ['Observed\nDistance', 'Expected\nDistance'],
        [ann_result.observed_distance_km, ann_result.expected_distance_km],
        color=['salmon', 'lightcoral']
    )
    ax4.set_ylabel('Distance (km)')
    ax4.set_title('Point Pattern Analysis (ANN)')
    ax4.text(
        0, ann_result.observed_distance_km + 10,
        f"{ann_result.observed_distance_km:.1f} km",
        ha='center',
        fontsize=10
    )
    ax4.text(
        1, ann_result.expected_distance_km + 10,
        f"{ann_result.expected_distance_km:.1f} km",
        ha='center',
        fontsize=10
    )
    ax4.text(
        0.5, max(ann_result.observed_distance_km, ann_result.expected_distance_km) * 0.5,
        f"ANN Index = {ann_result.value:.3f}",
        ha='center',
        fontsize=12,
        fontweight='bold',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    )
    ax4.grid(True, alpha=0.3)

    # 5. Interpretations (text summary)
    ax5 = fig.add_subplot(gs[2, :])
    ax5.axis('off')

    interpretations = [
        f"• Moran's I: {moran_result.interpretation}",
        f"• Spatial HHI: {hhi_result.interpretation}",
        f"• ENL: {enl_result.interpretation}",
        f"• ANN: {ann_result.interpretation}"
    ]

    summary_text = "INTERPRETATION SUMMARY:\n\n" + "\n".join(interpretations)
    ax5.text(
        0.05, 0.95,
        summary_text,
        transform=ax5.transAxes,
        fontsize=12,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3),
        family='monospace'
    )

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')

    return fig


def create_comparison_chart(
    results_dict: Dict[str, Dict[str, Any]],
    metric: str = 'spatial_hhi',
    save_path: Optional[str] = None
) -> plt.Figure:
    """
    Compare a specific metric across multiple networks

    Args:
        results_dict: Dict mapping network name to results dict
        metric: Which metric to compare ('spatial_hhi', 'morans_i', etc.)
        save_path: Optional path to save figure

    Returns:
        Matplotlib figure
    """
    networks = list(results_dict.keys())
    values = [results_dict[net][metric].value for net in networks]

    fig, ax = plt.subplots(figsize=(12, 6))

    bars = ax.bar(networks, values, color='steelblue', alpha=0.7)

    # Color bars by value thresholds (example for HHI)
    if metric == 'spatial_hhi':
        for bar, val in zip(bars, values):
            if val < 0.15:
                bar.set_color('green')
            elif val < 0.25:
                bar.set_color('orange')
            else:
                bar.set_color('red')

        ax.axhline(y=0.15, color='orange', linestyle='--',
                   alpha=0.5, label='Moderate concentration')
        ax.axhline(y=0.25, color='red', linestyle='--',
                   alpha=0.5, label='High concentration')

    ax.set_xlabel('Network', fontsize=12)
    ax.set_ylabel(f'{metric.replace("_", " ").title()} Value', fontsize=12)
    ax.set_title(f'Network Comparison: {metric.replace("_", " ").title()}',
                 fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)

    if metric == 'spatial_hhi':
        ax.legend()

    # Add value labels on bars
    for bar, val in zip(bars, values):
        height = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2., height + 0.01,
            f'{val:.3f}',
            ha='center', va='bottom',
            fontsize=10
        )

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')

    return fig
