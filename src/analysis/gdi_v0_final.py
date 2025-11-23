"""
GDI v0 Final - Three-pillar geographic decentralization metrics
All metrics 0-100, higher = more decentralized
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from typing import Dict
from shapely.geometry import Point

# Import existing spatial analyzer for PDI
from spatial_metrics import SpatialAnalyzer


def calculate_pdi(df: pd.DataFrame, threshold_km: float = 500.0, h3_resolution: int = 5) -> Dict:
    """
    Physical Distribution Index - Composite spatial metric

    Formula: PDI = 100 × [0.4×(1-Moran's I) + 0.3×ENL_norm + 0.3×(1-Spatial_HHI)]

    Higher = more dispersed, less clustered

    Args:
        df: DataFrame with 'lat', 'lon' columns
        threshold_km: Distance threshold for Moran's I spatial weights
        h3_resolution: H3 grid resolution for HHI/ENL

    Returns:
        Dict with pdi score and component metrics
    """
    # Create GeoDataFrame
    geometry = [Point(xy) for xy in zip(df['lon'], df['lat'])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
    gdf['network'] = 'network'  # Required by SpatialAnalyzer

    # Use existing spatial analyzer
    analyzer = SpatialAnalyzer(gdf)

    # Calculate components
    morans_result = analyzer.morans_i(threshold_km=threshold_km)
    hhi_result = analyzer.spatial_hhi(resolution=h3_resolution)
    enl_result = analyzer.effective_num_locations(resolution=h3_resolution)

    # Normalize components to 0-1
    # Moran's I: ranges -1 to +1, but typically 0 to +1 for real data
    # Invert: high clustering (high I) = low score
    morans_normalized = max(0, min(1, (1 - morans_result.value)))

    # ENL: normalize by total cells
    enl_normalized = enl_result.value / enl_result.total_locations

    # Spatial HHI: already 0-1, invert
    spatial_hhi_normalized = 1 - hhi_result.value

    # Weighted composite (all components now 0-1)
    pdi = 100 * (
        0.4 * morans_normalized +
        0.3 * enl_normalized +
        0.3 * spatial_hhi_normalized
    )

    return {
        'pdi': round(pdi, 1),
        'morans_i': round(morans_result.value, 3),
        'morans_p_value': round(morans_result.p_value, 4),
        'spatial_hhi': round(hhi_result.value, 3),
        'enl': round(enl_result.value, 1),
        'total_cells': enl_result.total_locations,
        'interpretation': _interpret_pdi(pdi),
        'components': {
            'morans_contribution': round(0.4 * morans_normalized * 100, 1),
            'enl_contribution': round(0.3 * enl_normalized * 100, 1),
            'hhi_contribution': round(0.3 * spatial_hhi_normalized * 100, 1)
        }
    }


def calculate_jdi(df: pd.DataFrame) -> Dict:
    """
    Jurisdictional Diversity Index - Country concentration via HHI

    Formula: JDI = 100 × (1 - Country_HHI)

    Higher = less concentrated across countries

    Args:
        df: DataFrame with 'country' column

    Returns:
        Dict with jdi score and metadata
    """
    # Country counts
    country_counts = df['country'].value_counts()
    total_nodes = len(df)
    num_countries = len(country_counts)

    # Calculate shares
    shares = country_counts / total_nodes

    # Country HHI = sum of squared shares
    country_hhi = (shares ** 2).sum()

    # JDI = inverted (higher = less concentrated)
    jdi = 100 * (1 - country_hhi)

    # Get top countries
    top_3 = {k: {'count': v, 'share': round(v/total_nodes*100, 1)}
             for k, v in country_counts.head(3).items()}

    return {
        'jdi': round(jdi, 1),
        'country_hhi': round(country_hhi, 3),
        'num_countries': num_countries,
        'top_3_countries': top_3,
        'interpretation': _interpret_hhi_based(jdi)
    }


def calculate_ihi(df: pd.DataFrame) -> Dict:
    """
    Infrastructure Heterogeneity Index - Organization concentration via HHI

    Formula: IHI = 100 × (1 - Org_HHI)

    Higher = less concentrated across organizations

    Args:
        df: DataFrame with 'org' column

    Returns:
        Dict with ihi score and metadata
    """
    # Org counts
    org_counts = df['org'].value_counts()
    total_nodes = len(df)
    num_orgs = len(org_counts)

    # Calculate shares
    shares = org_counts / total_nodes

    # Org HHI = sum of squared shares
    org_hhi = (shares ** 2).sum()

    # IHI = inverted (higher = less concentrated)
    ihi = 100 * (1 - org_hhi)

    # Get top orgs
    top_3 = {k: {'count': v, 'share': round(v/total_nodes*100, 1)}
             for k, v in org_counts.head(3).items()}

    return {
        'ihi': round(ihi, 1),
        'org_hhi': round(org_hhi, 3),
        'num_orgs': num_orgs,
        'top_3_orgs': top_3,
        'interpretation': _interpret_hhi_based(ihi)
    }


def calculate_gdi(df: pd.DataFrame, weights: tuple = (0.4, 0.35, 0.25)) -> Dict:
    """
    Composite GDI score from PDI, JDI, IHI

    Args:
        df: DataFrame with all required columns (lat, lon, country, org)
        weights: (pdi_weight, jdi_weight, ihi_weight)

    Returns:
        Dict with gdi score and all component metrics
    """
    # Clean data
    df = df.dropna(subset=['lat', 'lon', 'country', 'org'])

    # Calculate components
    pdi_result = calculate_pdi(df)
    jdi_result = calculate_jdi(df)
    ihi_result = calculate_ihi(df)

    # Composite score
    w_pdi, w_jdi, w_ihi = weights
    gdi = (w_pdi * pdi_result['pdi'] +
           w_jdi * jdi_result['jdi'] +
           w_ihi * ihi_result['ihi'])

    return {
        'gdi': round(gdi, 1),
        'pdi': pdi_result,
        'jdi': jdi_result,
        'ihi': ihi_result,
        'weights': {'pdi': w_pdi, 'jdi': w_jdi, 'ihi': w_ihi},
        'interpretation': _interpret_gdi(gdi),
        'total_nodes': len(df)
    }


def _interpret_pdi(pdi: float) -> str:
    """Interpret PDI score"""
    if pdi >= 80:
        return "Highly dispersed"
    elif pdi >= 60:
        return "Moderately dispersed"
    else:
        return "Concentrated"


def _interpret_hhi_based(score: float) -> str:
    """Interpret HHI-based scores (JDI, IHI)"""
    if score >= 75:
        return "Low concentration"
    elif score >= 50:
        return "Moderate concentration"
    elif score >= 25:
        return "High concentration"
    else:
        return "Very high concentration"


def _interpret_gdi(gdi: float) -> str:
    """Interpret overall GDI score"""
    if gdi >= 80:
        return "Highly decentralized"
    elif gdi >= 60:
        return "Moderately decentralized"
    elif gdi >= 40:
        return "Weakly decentralized"
    else:
        return "Centralized"


if __name__ == '__main__':
    import sys

    # Test with Ethereum and Polygon
    networks = {
        'ethereum': '../../data/raw/2025-11-22-ethereum-ips.csv',
        'polygon': '../../data/raw/2025-11-22-polygon-ips.csv',
    }

    results = {}

    for network_name, filepath in networks.items():
        try:
            print(f"\nProcessing {network_name.title()}...")
            df = pd.read_csv(filepath)

            result = calculate_gdi(df)
            results[network_name] = result

            print(f"\n{'='*60}")
            print(f"GDI v0 Final Results - {network_name.title()}")
            print(f"{'='*60}")
            print(f"\n🎯 Overall GDI: {result['gdi']}/100 - {result['interpretation']}")
            print(f"   Total Nodes: {result['total_nodes']:,}")

            print(f"\n{'Physical Distribution (PDI)':-^60}")
            pdi = result['pdi']
            print(f"  Score: {pdi['pdi']}/100 - {pdi['interpretation']}")
            print(f"  Components:")
            print(f"    • Moran's I: {pdi['morans_i']} (contributes {pdi['components']['morans_contribution']}/100)")
            print(f"    • ENL: {pdi['enl']}/{pdi['total_cells']} cells (contributes {pdi['components']['enl_contribution']}/100)")
            print(f"    • Spatial HHI: {pdi['spatial_hhi']} (contributes {pdi['components']['hhi_contribution']}/100)")

            print(f"\n{'Jurisdictional Diversity (JDI)':-^60}")
            jdi = result['jdi']
            print(f"  Score: {jdi['jdi']}/100 - {jdi['interpretation']}")
            print(f"  Country HHI: {jdi['country_hhi']}")
            print(f"  Total countries: {jdi['num_countries']}")
            print(f"  Top 3:")
            for country, data in list(jdi['top_3_countries'].items())[:3]:
                print(f"    • {country}: {data['count']:,} nodes ({data['share']}%)")

            print(f"\n{'Infrastructure Heterogeneity (IHI)':-^60}")
            ihi = result['ihi']
            print(f"  Score: {ihi['ihi']}/100 - {ihi['interpretation']}")
            print(f"  Org HHI: {ihi['org_hhi']}")
            print(f"  Total orgs: {ihi['num_orgs']}")
            print(f"  Top 3:")
            for org, data in list(ihi['top_3_orgs'].items())[:3]:
                org_display = org[:40] + '...' if len(org) > 40 else org
                print(f"    • {org_display}: {data['count']:,} nodes ({data['share']}%)")

            print(f"\n{'='*60}\n")

        except FileNotFoundError:
            print(f"\n❌ Skipping {network_name} - file not found")
            continue
        except Exception as e:
            print(f"\n❌ Error processing {network_name}: {e}")
            import traceback
            traceback.print_exc()
            continue

    # Save results
    if results:
        import json
        with open('../../data/gdi_v0_final.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✅ Results saved to data/gdi_v0_final.json\n")
