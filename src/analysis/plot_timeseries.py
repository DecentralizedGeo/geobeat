"""
Plot time-series trends for GDI metrics

Creates publication-ready line charts showing decentralization trends
"""

import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_theme(style="whitegrid")


def plot_timeseries_dashboard(json_path, save_path=None):
    """
    Create 4-panel dashboard showing metric trends

    Args:
        json_path: Path to time-series JSON file
        save_path: Optional path to save figure
    """
    # Load data
    with open(json_path) as f:
        data = json.load(f)

    df = pd.DataFrame(data['data'])
    df['date'] = pd.to_datetime(df['date_str'])

    # Create figure
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle(
        f"{data['network'].upper()} - Decentralization Trends (30 Days)",
        fontsize=18,
        fontweight='bold',
        y=0.995
    )

    # 1. Moran's I (top-left)
    ax1 = axes[0, 0]
    ax1.plot(df['date'], df['morans_i'], linewidth=2, color='steelblue', marker='o', markersize=4)
    ax1.axhline(y=0, color='red', linestyle='--', alpha=0.5, label='Random (I=0)')
    ax1.fill_between(df['date'], df['morans_i'], 0, alpha=0.2, color='steelblue')
    ax1.set_ylabel("Moran's I", fontsize=12, fontweight='bold')
    ax1.set_title("Spatial Autocorrelation (Clustering)", fontsize=13)
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.tick_params(axis='x', rotation=45)

    # Add trend annotation
    start_val = df['morans_i'].iloc[0]
    end_val = df['morans_i'].iloc[-1]
    change = ((end_val - start_val) / start_val) * 100
    ax1.text(
        0.05, 0.95,
        f"Change: {change:+.1f}%\n{'↓ Less clustered' if change < 0 else '↑ More clustered'}",
        transform=ax1.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    )

    # 2. Spatial HHI (top-right)
    ax2 = axes[0, 1]
    ax2.plot(df['date'], df['spatial_hhi'], linewidth=2, color='coral', marker='o', markersize=4)
    ax2.axhline(y=0.15, color='orange', linestyle='--', alpha=0.5, label='Moderate threshold')
    ax2.axhline(y=0.25, color='red', linestyle='--', alpha=0.5, label='High threshold')
    ax2.fill_between(df['date'], df['spatial_hhi'], 0, alpha=0.2, color='coral')
    ax2.set_ylabel("Spatial HHI", fontsize=12, fontweight='bold')
    ax2.set_title("Geographic Concentration", fontsize=13)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.tick_params(axis='x', rotation=45)

    # Add trend annotation
    start_val = df['spatial_hhi'].iloc[0]
    end_val = df['spatial_hhi'].iloc[-1]
    change = ((end_val - start_val) / start_val) * 100
    ax2.text(
        0.05, 0.95,
        f"Change: {change:+.1f}%\n{'↓ Less concentrated' if change < 0 else '↑ More concentrated'}",
        transform=ax2.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    )

    # 3. ENL (bottom-left)
    ax3 = axes[1, 0]
    ax3.plot(df['date'], df['enl'], linewidth=2, color='green', marker='o', markersize=4)
    ax3.fill_between(df['date'], df['enl'], 0, alpha=0.2, color='green')
    ax3.set_ylabel("Effective Number of Locations", fontsize=12, fontweight='bold')
    ax3.set_title("Location Diversity", fontsize=13)
    ax3.grid(True, alpha=0.3)
    ax3.tick_params(axis='x', rotation=45)

    # Add trend annotation
    start_val = df['enl'].iloc[0]
    end_val = df['enl'].iloc[-1]
    change = ((end_val - start_val) / start_val) * 100
    ax3.text(
        0.05, 0.95,
        f"Change: {change:+.1f}%\n{'↑ More diverse' if change > 0 else '↓ Less diverse'}",
        transform=ax3.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    )

    # 4. ANN (bottom-right)
    ax4 = axes[1, 1]
    ax4.plot(df['date'], df['ann'], linewidth=2, color='purple', marker='o', markersize=4)
    ax4.axhline(y=1.0, color='red', linestyle='--', alpha=0.5, label='Random (ANN=1)')
    ax4.fill_between(df['date'], df['ann'], 0, alpha=0.2, color='purple')
    ax4.set_ylabel("ANN Index", fontsize=12, fontweight='bold')
    ax4.set_title("Point Pattern Analysis", fontsize=13)
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    ax4.tick_params(axis='x', rotation=45)

    # Add trend annotation
    start_val = df['ann'].iloc[0]
    end_val = df['ann'].iloc[-1]
    change = ((end_val - start_val) / start_val) * 100
    ax4.text(
        0.05, 0.95,
        f"Change: {change:+.1f}%\n{'↑ More dispersed' if change > 0 else '↓ More clustered'}",
        transform=ax4.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    )

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Saved: {save_path}")

    return fig


def main():
    """Generate time-series visualization"""

    # Load time-series data
    data_dir = Path(__file__).parent.parent.parent / "data" / "timeseries"
    json_path = data_dir / "ethereum_timeseries.json"

    if not json_path.exists():
        print(f"Error: {json_path} not found")
        print("Run generate_timeseries.py first")
        return

    # Create visualization
    output_dir = data_dir
    save_path = output_dir / "ethereum_trends.png"

    plot_timeseries_dashboard(json_path, save_path=save_path)

    print(f"\n✅ Time-series visualization created!")
    print(f"📊 {save_path}")


if __name__ == "__main__":
    main()
