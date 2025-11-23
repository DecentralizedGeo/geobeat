"""
Simple GDI v0 metrics for hackathon
Calculates PDI, JDI, IHI using simplest defensible approaches
"""

import numpy as np
import pandas as pd
from typing import Dict, Tuple


def calculate_pdi(df: pd.DataFrame, h3_resolution: int = 5) -> Dict:
    """
    Physical Distribution Index - Geographic spread via Spatial HHI

    Higher = more dispersed (better)

    Args:
        df: DataFrame with 'lat', 'lon' columns
        h3_resolution: H3 grid resolution (5 = metro-level)

    Returns:
        Dict with pdi score and metadata
    """
    import h3

    # Convert to H3 cells
    df = df.copy()
    df['h3_cell'] = df.apply(
        lambda row: h3.latlng_to_cell(row['lat'], row['lon'], h3_resolution),
        axis=1
    )

    # Count nodes per cell
    cell_counts = df['h3_cell'].value_counts()
    total_nodes = len(df)

    # Calculate shares
    shares = cell_counts / total_nodes

    # Spatial HHI = sum of squared shares
    spatial_hhi = (shares ** 2).sum()

    # PDI = inverted (higher = more dispersed)
    pdi = 100 * (1 - spatial_hhi)

    return {
        'pdi': round(pdi, 1),
        'spatial_hhi': round(spatial_hhi, 3),
        'num_cells': len(cell_counts),
        'max_cell_share': round(shares.max() * 100, 1),
        'interpretation': _interpret_pdi(pdi)
    }


def calculate_jdi(df: pd.DataFrame) -> Dict:
    """
    Jurisdictional Diversity Index - Country distribution via entropy

    Higher = more jurisdictional diversity (better)

    Args:
        df: DataFrame with 'country' column

    Returns:
        Dict with jdi score and metadata
    """
    # Country counts
    country_counts = df['country'].value_counts()
    total_nodes = len(df)
    num_countries = len(country_counts)

    # Calculate probabilities
    probabilities = country_counts / total_nodes

    # Shannon entropy
    entropy = -np.sum(probabilities * np.log(probabilities))

    # Effective number of countries
    effective_countries = np.exp(entropy)

    # JDI = effective / total (normalized)
    jdi = 100 * (effective_countries / num_countries)

    return {
        'jdi': round(jdi, 1),
        'num_countries': num_countries,
        'effective_countries': round(effective_countries, 1),
        'entropy': round(entropy, 3),
        'top_3_countries': country_counts.head(3).to_dict(),
        'interpretation': _interpret_jdi(jdi)
    }


def calculate_ihi(df: pd.DataFrame) -> Dict:
    """
    Infrastructure Heterogeneity Index - Cloud provider concentration via HHI

    Higher = less concentrated (better)

    Args:
        df: DataFrame with 'org', 'asname', or 'isp' columns

    Returns:
        Dict with ihi score and metadata
    """
    # Categorize providers
    df = df.copy()
    df['provider'] = df.apply(_categorize_provider, axis=1)

    # Provider counts
    provider_counts = df['provider'].value_counts()
    total_nodes = len(df)

    # Calculate shares
    shares = provider_counts / total_nodes

    # Provider HHI
    provider_hhi = (shares ** 2).sum()

    # IHI = inverted (higher = more diverse)
    ihi = 100 * (1 - provider_hhi)

    return {
        'ihi': round(ihi, 1),
        'provider_hhi': round(provider_hhi, 3),
        'num_providers': len(provider_counts),
        'top_3_providers': {k: round(v/total_nodes*100, 1)
                           for k, v in provider_counts.head(3).items()},
        'interpretation': _interpret_ihi(ihi)
    }


def calculate_gdi(df: pd.DataFrame, weights: Tuple[float, float, float] = (0.4, 0.35, 0.25)) -> Dict:
    """
    Composite GDI score from PDI, JDI, IHI

    Args:
        df: DataFrame with all required columns
        weights: (pdi_weight, jdi_weight, ihi_weight) - must sum to 1.0

    Returns:
        Dict with gdi score and all component metrics
    """
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


def _categorize_provider(row) -> str:
    """Simple provider categorization from org/asname/isp"""
    text = ' '.join([
        str(row.get('org', '')),
        str(row.get('asname', '')),
        str(row.get('isp', ''))
    ]).upper()

    if 'AWS' in text or 'AMAZON' in text:
        return 'AWS'
    elif 'GOOGLE' in text or 'GCP' in text:
        return 'Google Cloud'
    elif 'AZURE' in text or 'MICROSOFT' in text:
        return 'Azure'
    elif 'HETZNER' in text:
        return 'Hetzner'
    elif 'OVH' in text:
        return 'OVH'
    elif 'DIGITALOCEAN' in text:
        return 'DigitalOcean'
    elif 'STARLINK' in text or 'SPACEX' in text:
        return 'Starlink'
    elif row.get('hosting', False):
        return 'Other Cloud'
    else:
        return 'Home/ISP'


def _interpret_pdi(pdi: float) -> str:
    """Interpret PDI score"""
    if pdi >= 80:
        return "Highly dispersed"
    elif pdi >= 60:
        return "Moderately dispersed"
    else:
        return "Concentrated"


def _interpret_jdi(jdi: float) -> str:
    """Interpret JDI score"""
    if jdi >= 70:
        return "High diversity"
    elif jdi >= 40:
        return "Moderate diversity"
    else:
        return "Low diversity"


def _interpret_ihi(ihi: float) -> str:
    """Interpret IHI score"""
    if ihi >= 75:
        return "Competitive (no monopoly)"
    elif ihi >= 50:
        return "Moderate concentration"
    else:
        return "High concentration"


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
    # Quick test with Ethereum data
    df = pd.read_csv('../../data/raw/2025-11-22-ethereum-ips.csv')
    df = df.dropna(subset=['lat', 'lon'])

    result = calculate_gdi(df)

    print(f"\n{'='*60}")
    print(f"GDI v0 Results - Ethereum")
    print(f"{'='*60}")
    print(f"\nOverall GDI: {result['gdi']} - {result['interpretation']}")
    print(f"Total Nodes: {result['total_nodes']:,}")

    print(f"\n{'Physical Distribution (PDI)':-^60}")
    print(f"  Score: {result['pdi']['pdi']} - {result['pdi']['interpretation']}")
    print(f"  Spatial HHI: {result['pdi']['spatial_hhi']}")
    print(f"  Grid cells occupied: {result['pdi']['num_cells']}")
    print(f"  Largest cell share: {result['pdi']['max_cell_share']}%")

    print(f"\n{'Jurisdictional Diversity (JDI)':-^60}")
    print(f"  Score: {result['jdi']['jdi']} - {result['jdi']['interpretation']}")
    print(f"  Total countries: {result['jdi']['num_countries']}")
    print(f"  Effective countries: {result['jdi']['effective_countries']}")
    print(f"  Top 3 countries: {result['jdi']['top_3_countries']}")

    print(f"\n{'Infrastructure Heterogeneity (IHI)':-^60}")
    print(f"  Score: {result['ihi']['ihi']} - {result['ihi']['interpretation']}")
    print(f"  Provider HHI: {result['ihi']['provider_hhi']}")
    print(f"  Top 3 providers: {result['ihi']['top_3_providers']}")

    print(f"\n{'='*60}\n")
