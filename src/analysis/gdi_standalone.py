"""
GDI v0 Final - Standalone implementation
All metrics 0-100, higher = more decentralized
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from typing import Dict
from shapely.geometry import Point
from scipy.spatial import cKDTree
from scipy import stats
import h3


def calculate_pdi(
    df: pd.DataFrame, threshold_km: float = 500.0, h3_resolution: int = 5
) -> Dict:
    """
    Physical Distribution Index - Composite spatial metric

    Formula: PDI = 100 × [0.4×(1-Moran's I) + 0.3×ENL_norm + 0.3×(1-Spatial_HHI)]

    Higher = more dispersed, less clustered
    """
    # Create GeoDataFrame
    geometry = [Point(xy) for xy in zip(df["lon"], df["lat"])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")

    # Reproject to equal-area for distance calculations (World Mollweide)
    gdf_proj = gdf.to_crs("ESRI:54009")

    # 1. Calculate Moran's I
    morans_i, morans_p = _calculate_morans_i(gdf_proj, threshold_km)

    # 2. Calculate Spatial HHI
    spatial_hhi, num_cells = _calculate_spatial_hhi(df, h3_resolution)

    # 3. Calculate ENL
    enl = _calculate_enl(df, h3_resolution, num_cells)

    # Normalize and composite
    morans_norm = max(0, min(1, (1 - morans_i)))  # Invert: high clustering = low score
    enl_norm = min(
        1.0, enl / 2000
    )  # Absolute ENL capped at 2000 locations (extreme threshold)
    hhi_norm = 1 - spatial_hhi

    pdi = 100 * (0.4 * morans_norm + 0.3 * enl_norm + 0.3 * hhi_norm)

    return {
        "pdi": round(pdi, 1),
        "morans_i": round(morans_i, 3),
        "morans_p_value": round(morans_p, 4),
        "spatial_hhi": round(spatial_hhi, 3),
        "enl": round(enl, 1),
        "total_cells": num_cells,
        "interpretation": _interpret_pdi(pdi),
        "components": {
            "morans_contribution": round(0.4 * morans_norm * 100, 1),
            "enl_contribution": round(0.3 * enl_norm * 100, 1),
            "hhi_contribution": round(0.3 * hhi_norm * 100, 1),
        },
    }


def _calculate_morans_i(gdf_proj, threshold_km: float) -> tuple:
    """Calculate Moran's I using simple distance-based approach"""
    coords = np.column_stack([gdf_proj.geometry.x, gdf_proj.geometry.y])
    n = len(coords)

    # Build spatial weights matrix (distance band)
    threshold_m = threshold_km * 1000
    tree = cKDTree(coords)
    pairs = tree.query_pairs(threshold_m)

    # Build weights matrix
    W = np.zeros((n, n))
    for i, j in pairs:
        W[i, j] = 1
        W[j, i] = 1

    # Row-standardize
    row_sums = W.sum(axis=1)
    row_sums[row_sums == 0] = 1  # Avoid division by zero
    W = W / row_sums[:, np.newaxis]

    # Calculate local densities as attribute
    local_density = _get_local_density(gdf_proj)
    x = local_density - local_density.mean()

    # Moran's I = (N/W) * Σ Σ w_ij * (x_i - x̄)(x_j - x̄) / Σ(x_i - x̄)²
    numerator = np.sum(W * np.outer(x, x))
    denominator = np.sum(x**2)

    I = (n / W.sum()) * (numerator / denominator) if denominator > 0 else 0

    # Simple significance (z-score approximation)
    E_I = -1 / (n - 1)
    var_I = 1 / (n - 1)
    z = (I - E_I) / np.sqrt(var_I)
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))

    return I, p_value


def _get_local_density(gdf_proj) -> np.ndarray:
    """Calculate local density using nearest neighbor"""
    coords = np.column_stack([gdf_proj.geometry.x, gdf_proj.geometry.y])
    tree = cKDTree(coords)

    # Distance to 5th nearest neighbor
    distances, _ = tree.query(coords, k=6)  # k=6 to skip self
    k_distance = distances[:, 5]  # 5th neighbor

    # Density = 1 / distance (closer neighbors = higher density)
    density = 1.0 / (k_distance + 1)  # +1 to avoid division by zero
    return density


def _calculate_spatial_hhi(df: pd.DataFrame, resolution: int) -> tuple:
    """Calculate Spatial HHI across H3 grid"""
    # Convert to H3 cells
    cells = df.apply(
        lambda row: h3.latlng_to_cell(row["lat"], row["lon"], resolution), axis=1
    )

    # Count nodes per cell
    cell_counts = cells.value_counts()
    total_nodes = len(df)
    num_cells = len(cell_counts)

    # Calculate shares and HHI
    shares = cell_counts / total_nodes
    hhi = (shares**2).sum()

    return hhi, num_cells


def _calculate_enl(df: pd.DataFrame, resolution: int, num_cells: int) -> float:
    """Calculate Effective Number of Locations via entropy"""
    # Convert to H3 cells
    cells = df.apply(
        lambda row: h3.latlng_to_cell(row["lat"], row["lon"], resolution), axis=1
    )

    # Count nodes per cell
    cell_counts = cells.value_counts()
    total_nodes = len(df)

    # Calculate probabilities
    probabilities = cell_counts / total_nodes

    # Shannon entropy
    entropy = -np.sum(probabilities * np.log(probabilities))

    # Effective number = exp(entropy)
    enl = np.exp(entropy)

    return enl


def calculate_jdi(df: pd.DataFrame) -> Dict:
    """
    Jurisdictional Diversity Index - Country HHI + Absolute Diversity

    Formula: JDI = 100 × [0.7×(1-Country_HHI) + 0.3×min(1, log10(num_countries)/2)]

    Rewards both even distribution AND absolute diversity
    """
    country_counts = df["country"].value_counts()
    total_nodes = len(df)
    num_countries = len(country_counts)

    shares = country_counts / total_nodes
    country_hhi = (shares**2).sum()

    # HHI component (30%)
    hhi_component = 0.3 * (1 - country_hhi)

    # Absolute diversity bonus (35%) - reward networks with more countries
    # log10(200) = 2.30, so this maxes out at 200+ countries (extreme threshold)
    # Changed from /2.5 to /2.0 for better differentiation between networks
    diversity_bonus = 0.35 * min(1.0, np.log10(num_countries) / 2.0)

    # Top concentration penalty (35%)
    # Penalize if top country has > 15% of nodes
    top_country_share = (
        country_counts.iloc[0] / total_nodes if len(country_counts) > 0 else 0
    )
    concentration_penalty = 0.35 * max(
        0, (top_country_share - 0.15) / 0.35
    )  # Linear from 15% to 50%

    jdi = 100 * (hhi_component + diversity_bonus - concentration_penalty)

    top_3 = {
        k: {"count": v, "share": round(v / total_nodes * 100, 1)}
        for k, v in country_counts.head(3).items()
    }

    return {
        "jdi": round(jdi, 1),
        "country_hhi": round(country_hhi, 3),
        "num_countries": num_countries,
        "top_3_countries": top_3,
        "interpretation": _interpret_hhi_based(jdi),
        "components": {
            "hhi_contribution": round(hhi_component * 100, 1),
            "diversity_contribution": round(diversity_bonus * 100, 1),
        },
    }


def calculate_ihi(df: pd.DataFrame) -> Dict:
    """
    Infrastructure Heterogeneity Index - Org HHI + Absolute Diversity

    Formula: IHI = 100 × [0.7×(1-Org_HHI) + 0.3×min(1, log10(num_orgs)/3)]

    Rewards both even distribution AND absolute diversity
    """
    org_counts = df["org"].value_counts()
    total_nodes = len(df)
    num_orgs = len(org_counts)

    shares = org_counts / total_nodes
    org_hhi = (shares**2).sum()

    # HHI component (30%)
    hhi_component = 0.3 * (1 - org_hhi)

    # Absolute diversity bonus (35%) - reward networks with more orgs
    # log10(10000) = 4.0, so this maxes out at 10000+ orgs (extreme threshold)
    # Changed from /4.5 to /3.5 for better differentiation between networks
    diversity_bonus = 0.35 * min(1.0, np.log10(num_orgs) / 3.5)

    # Top concentration penalty (35%)
    # Penalize if top org has > 3% of nodes
    top_org_share = org_counts.iloc[0] / total_nodes if len(org_counts) > 0 else 0
    concentration_penalty = 0.35 * max(
        0, (top_org_share - 0.03) / 0.17
    )  # Linear from 3% to 20%

    ihi = 100 * (hhi_component + diversity_bonus - concentration_penalty)

    top_3 = {
        k: {"count": v, "share": round(v / total_nodes * 100, 1)}
        for k, v in org_counts.head(3).items()
    }

    return {
        "ihi": round(ihi, 1),
        "org_hhi": round(org_hhi, 3),
        "num_orgs": num_orgs,
        "top_3_orgs": top_3,
        "interpretation": _interpret_hhi_based(ihi),
        "components": {
            "hhi_contribution": round(hhi_component * 100, 1),
            "diversity_contribution": round(diversity_bonus * 100, 1),
        },
    }


def calculate_gdi(df: pd.DataFrame, weights: tuple = (0.35, 0.2, 0.1, 0.35)) -> Dict:
    """Composite GDI score with network size bonus (35% weight)"""
    df = df.dropna(subset=["lat", "lon", "country", "org"])

    pdi_result = calculate_pdi(df)
    jdi_result = calculate_jdi(df)
    ihi_result = calculate_ihi(df)

    # Network size score - rewards absolute node count
    # Uses sqrt scaling: sqrt(nodes / 50000) capped at 1.0
    # This gives large networks a boost while preventing runaway scores
    total_nodes = len(df)
    network_size_score = 100 * min(1.0, (total_nodes / 50000) ** 0.5)

    w_pdi, w_jdi, w_ihi, w_size = weights
    gdi = (
        w_pdi * pdi_result["pdi"]
        + w_jdi * jdi_result["jdi"]
        + w_ihi * ihi_result["ihi"]
        + w_size * network_size_score
    )

    return {
        "gdi": round(gdi, 1),
        "pdi": pdi_result,
        "jdi": jdi_result,
        "ihi": ihi_result,
        "network_size_score": round(network_size_score, 1),
        "weights": {"pdi": w_pdi, "jdi": w_jdi, "ihi": w_ihi, "size": w_size},
        "interpretation": _interpret_gdi(gdi),
        "total_nodes": len(df),
    }


def _interpret_pdi(pdi: float) -> str:
    if pdi >= 80:
        return "Highly dispersed"
    elif pdi >= 60:
        return "Moderately dispersed"
    else:
        return "Concentrated"


def _interpret_hhi_based(score: float) -> str:
    if score >= 75:
        return "Low concentration"
    elif score >= 50:
        return "Moderate concentration"
    elif score >= 25:
        return "High concentration"
    else:
        return "Very high concentration"


def _interpret_gdi(gdi: float) -> str:
    if gdi >= 80:
        return "Highly decentralized"
    elif gdi >= 60:
        return "Moderately decentralized"
    elif gdi >= 40:
        return "Weakly decentralized"
    else:
        return "Centralized"


def transform_to_network_format(results: Dict) -> list:
    """
    Transform results dictionary to Network[] array format for frontend

    Args:
        results: Dictionary with network_id as keys and GDI results as values

    Returns:
        List of Network objects in frontend format
    """
    # Network metadata mapping
    network_metadata = {
        "ethereum": {
            "name": "Ethereum",
            "symbol": "ETH",
            "logoUrl": "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
            "type": "L1",
        },
        "polygon": {
            "name": "Polygon",
            "symbol": "MATIC",
            "logoUrl": "https://cryptologos.cc/logos/polygon-matic-logo.svg",
            "type": "L2",
        },
        "filecoin": {
            "name": "Filecoin",
            "symbol": "FIL",
            "logoUrl": "https://cryptologos.cc/logos/filecoin-fil-logo.svg",
            "type": "L1",
        },
        "celo": {
            "name": "Celo",
            "symbol": "CELO",
            "logoUrl": "https://cryptologos.cc/logos/celo-celo-logo.svg",
            "type": "L2",
        },
    }

    networks_array = []

    for network_id, result in results.items():
        # Get metadata or use defaults
        metadata = network_metadata.get(
            network_id,
            {
                "name": network_id.title(),
                "symbol": network_id.upper(),
                "logoUrl": "",
                "type": "L1",
            },
        )

        # Extract nested values
        pdi_data = result["pdi"]
        jdi_data = result["jdi"]
        ihi_data = result["ihi"]

        # Build Network object
        network = {
            "id": network_id,
            "name": metadata["name"],
            "symbol": metadata["symbol"],
            "logoUrl": metadata["logoUrl"],
            "type": metadata["type"],
            # Flatten nested scores
            "pdi": pdi_data["pdi"],
            "jdi": jdi_data["jdi"],
            "ihi": ihi_data["ihi"],
            # Trend fields (defaults)
            "trend": "neutral",
            "trendValue": "N/A",
            # Convert snake_case to camelCase
            "nodeCount": result["total_nodes"],
            "moransI": pdi_data["morans_i"],
            "spatialHHI": pdi_data["spatial_hhi"],
            "enl": pdi_data["enl"],
            "countryHHI": jdi_data["country_hhi"],
            "numCountries": jdi_data["num_countries"],
            "orgHHI": ihi_data["org_hhi"],
            "numOrgs": ihi_data["num_orgs"],
        }

        networks_array.append(network)

    return networks_array


if __name__ == "__main__":
    networks = {
        "ethereum": "../../data/raw/2025-11-22-ethereum-ips.csv",
        "polygon": "../../data/raw/2025-11-22-polygon-ips.csv",
        "filecoin": "../../data/raw/2025-11-22-filecoin-ips.csv",
    }

    results = {}

    for network_name, filepath in networks.items():
        try:
            print(f"\nProcessing {network_name.title()}...")
            df = pd.read_csv(filepath)

            result = calculate_gdi(df)
            results[network_name] = result

            print(f"\n{'=' * 60}")
            print(f"GDI v0 Final - {network_name.title()}")
            print(f"{'=' * 60}")
            print(f"\n🎯 Overall GDI: {result['gdi']}/100 - {result['interpretation']}")
            print(f"   Total Nodes: {result['total_nodes']:,}")

            print(f"\n{'Physical Distribution (PDI)':-^60}")
            pdi = result["pdi"]
            print(f"  Score: {pdi['pdi']}/100 - {pdi['interpretation']}")
            print(f"  Components:")
            print(
                f"    • Moran's I: {pdi['morans_i']} → {pdi['components']['morans_contribution']}/40"
            )
            print(
                f"    • ENL: {pdi['enl']}/{pdi['total_cells']} → {pdi['components']['enl_contribution']}/30"
            )
            print(
                f"    • Spatial HHI: {pdi['spatial_hhi']} → {pdi['components']['hhi_contribution']}/30"
            )

            print(f"\n{'Jurisdictional Diversity (JDI)':-^60}")
            jdi = result["jdi"]
            print(f"  Score: {jdi['jdi']}/100 - {jdi['interpretation']}")
            print(
                f"  Country HHI: {jdi['country_hhi']} ({jdi['num_countries']} countries)"
            )
            print(f"  Top 3:")
            for country, data in list(jdi["top_3_countries"].items())[:3]:
                print(f"    • {country}: {data['share']}%")

            print(f"\n{'Infrastructure Heterogeneity (IHI)':-^60}")
            ihi = result["ihi"]
            print(f"  Score: {ihi['ihi']}/100 - {ihi['interpretation']}")
            print(f"  Org HHI: {ihi['org_hhi']} ({ihi['num_orgs']} orgs)")
            print(f"  Top 3:")
            for org, data in list(ihi["top_3_orgs"].items())[:3]:
                org_short = org[:35] + "..." if len(org) > 35 else org
                print(f"    • {org_short}: {data['share']}%")

            print(f"\n{'=' * 60}\n")

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback

            traceback.print_exc()

    # Transform to Network[] format and save
    if results:
        import json
        import shutil

        networks_array = transform_to_network_format(results)

        # Save to data directory
        data_path = "../../data/gdi_results.json"
        with open(data_path, "w") as f:
            json.dump(networks_array, f, indent=2)
        print(f"\n✅ Saved to {data_path} (Network[] format)")

        # Also copy to frontend location for direct import
        frontend_path = "../../src/frontend/geobeat-ui/lib/data/gdi_results.json"
        import os

        os.makedirs(os.path.dirname(frontend_path), exist_ok=True)
        shutil.copy(data_path, frontend_path)
        print(f"✅ Copied to {frontend_path}\n")
