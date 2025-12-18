"""
Geographic Decentralization Index (GDI) v0.1.0
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
    Jurisdictional Diversity Index - Country concentration with consensus-theory thresholds.

    Thresholds (from METHODOLOGY.md):
    - Top 1 country > 33%: Finality risk - penalty ramps from 25%, hard cap at 40
    - Top 1 country > 50%: Majority control - hard cap at 25
    - Top 2 countries > 50%: Regulatory capture risk - hard cap at 45
    """
    country_counts = df["country"].value_counts()
    total_nodes = len(df)
    num_countries = len(country_counts)

    shares = country_counts / total_nodes
    country_hhi = (shares**2).sum()

    # Top country and top-2 shares
    top_country_share = shares.iloc[0] if len(shares) > 0 else 0
    top_2_share = shares.iloc[:2].sum() if len(shares) >= 2 else top_country_share

    # === BASE COMPONENTS ===

    # HHI component (30%)
    hhi_component = 0.30 * (1 - country_hhi)

    # Absolute diversity bonus (35%) - log scale with diminishing returns
    # log10(200) ≈ 2.3, so ~200 countries for max bonus
    diversity_bonus = 0.35 * min(1.0, np.log10(max(1, num_countries)) / 2.0)

    # Start with base score
    base_score = 100 * (hhi_component + diversity_bonus)

    # === GRADUATED CONCENTRATION PENALTIES ===

    # Determine effective cap based on top country concentration
    if top_country_share > 0.50:
        effective_cap = 25
    elif top_country_share > 0.33:
        # Ramp from cap 40 at 33% down to cap 25 at 50%
        effective_cap = 40 - ((top_country_share - 0.33) / 0.17) * 15
    else:
        effective_cap = 100  # No hard cap from top country

    # Warning zone penalty (25% to 33%) - gradual degradation before threshold
    if 0.25 < top_country_share <= 0.33:
        warning_penalty = ((top_country_share - 0.25) / 0.08) * 15
        base_score -= warning_penalty

    # Top-2 countries check (regulatory capture risk)
    if top_2_share > 0.50:
        effective_cap = min(effective_cap, 45)
    elif top_2_share > 0.40:
        # Warning zone for top-2: 40% to 50%
        warning_penalty = ((top_2_share - 0.40) / 0.10) * 10
        base_score -= warning_penalty

    jdi = min(max(0, base_score), effective_cap)

    # Top 3 for reporting
    top_3 = {
        k: {"count": v, "share": round(v / total_nodes * 100, 1)}
        for k, v in country_counts.head(3).items()
    }

    return {
        "jdi": round(jdi, 1),
        "country_hhi": round(country_hhi, 3),
        "num_countries": num_countries,
        "top_country_share": round(top_country_share * 100, 1),
        "top_2_share": round(top_2_share * 100, 1),
        "top_3_countries": top_3,
        "interpretation": _interpret_hhi_based(jdi),
        "flags": {
            "single_jurisdiction_dominant": bool(top_country_share > 0.33),
            "regulatory_capture_risk": bool(top_2_share > 0.50),
        },
        "components": {
            "hhi_contribution": round(hhi_component * 100, 1),
            "diversity_contribution": round(diversity_bonus * 100, 1),
        },
    }


def calculate_ihi(df: pd.DataFrame) -> Dict:
    """
    Infrastructure Heterogeneity Index - Provider concentration.

    Thresholds (from METHODOLOGY.md):
    - Top 1 provider > 25%: Single point of failure - penalty ramps from 15%, hard cap at 45
    - Top 3 providers > 50%: Infrastructure capture - hard cap at 50
    """
    org_counts = df["org"].value_counts()
    total_nodes = len(df)
    num_orgs = len(org_counts)

    shares = org_counts / total_nodes
    org_hhi = (shares**2).sum()

    # Top provider and top-3 shares
    top_org_share = shares.iloc[0] if len(shares) > 0 else 0
    top_3_share = shares.iloc[:3].sum() if len(shares) >= 3 else shares.sum()

    # === BASE COMPONENTS ===

    # HHI component (30%)
    hhi_component = 0.30 * (1 - org_hhi)

    # Absolute diversity bonus (35%) - log scale
    # log10(10000) = 4, so ~10000 orgs for max bonus
    diversity_bonus = 0.35 * min(1.0, np.log10(max(1, num_orgs)) / 3.5)

    # Start with base score
    base_score = 100 * (hhi_component + diversity_bonus)

    # === GRADUATED CONCENTRATION PENALTIES ===

    # Determine effective cap based on top provider concentration
    if top_org_share > 0.25:
        # Hard cap at 45 when top provider > 25%
        # Additional degradation as concentration increases toward 50%
        effective_cap = 45 - ((top_org_share - 0.25) / 0.25) * 15
        effective_cap = max(30, effective_cap)  # Floor the cap at 30
    else:
        effective_cap = 100  # No hard cap from top provider

    # Warning zone penalty (15% to 25%) - gradual degradation before threshold
    if 0.15 < top_org_share <= 0.25:
        warning_penalty = ((top_org_share - 0.15) / 0.10) * 15
        base_score -= warning_penalty

    # Top-3 providers check (infrastructure capture)
    if top_3_share > 0.50:
        effective_cap = min(effective_cap, 50)
    elif top_3_share > 0.35:
        # Warning zone for top-3: 35% to 50%
        warning_penalty = ((top_3_share - 0.35) / 0.15) * 10
        base_score -= warning_penalty

    ihi = min(max(0, base_score), effective_cap)

    # Top 3 for reporting
    top_3 = {
        k: {"count": v, "share": round(v / total_nodes * 100, 1)}
        for k, v in org_counts.head(3).items()
    }

    return {
        "ihi": round(ihi, 1),
        "org_hhi": round(org_hhi, 3),
        "num_orgs": num_orgs,
        "top_org_share": round(top_org_share * 100, 1),
        "top_3_share": round(top_3_share * 100, 1),
        "top_3_orgs": top_3,
        "interpretation": _interpret_hhi_based(ihi),
        "flags": {
            "infrastructure_spof": bool(top_org_share > 0.25),
            "infrastructure_capture": bool(top_3_share > 0.50),
        },
        "components": {
            "hhi_contribution": round(hhi_component * 100, 1),
            "diversity_contribution": round(diversity_bonus * 100, 1),
        },
    }


def calculate_gdi(df: pd.DataFrame) -> Dict:
    """
    Composite GDI = simple average of sub-indices.

    Formula: GDI = (PDI + JDI + IHI) / 3

    No floor cap applied - sub-index penalties already capture concentration risk.
    Critical flags surface specific vulnerabilities.
    Network size is reported but does not affect the score.
    """
    df = df.dropna(subset=["lat", "lon", "country", "org"])

    pdi_result = calculate_pdi(df)
    jdi_result = calculate_jdi(df)
    ihi_result = calculate_ihi(df)

    pdi = pdi_result["pdi"]
    jdi = jdi_result["jdi"]
    ihi = ihi_result["ihi"]

    # Simple average - no floor cap
    gdi = (pdi + jdi + ihi) / 3

    # Aggregate critical flags from sub-indices
    critical_flags = {
        "single_jurisdiction_dominant": jdi_result.get("flags", {}).get(
            "single_jurisdiction_dominant", False
        ),
        "regulatory_capture_risk": jdi_result.get("flags", {}).get(
            "regulatory_capture_risk", False
        ),
        "infrastructure_spof": ihi_result.get("flags", {}).get(
            "infrastructure_spof", False
        ),
        "infrastructure_capture": ihi_result.get("flags", {}).get(
            "infrastructure_capture", False
        ),
    }

    return {
        "gdi": round(gdi, 1),
        "pdi": pdi_result,
        "jdi": jdi_result,
        "ihi": ihi_result,
        "interpretation": _interpret_gdi(gdi),
        "total_nodes": len(df),
        "critical_flags": critical_flags,
        "any_critical_flag": any(critical_flags.values()),
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
    """Interpret GDI score per METHODOLOGY.md Section 7."""
    if gdi >= 70:
        return "Well decentralized"
    elif gdi >= 50:
        return "Moderately concentrated"
    elif gdi >= 35:
        return "Concentrated"
    else:
        return "Highly concentrated"


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
            # Composite GDI score
            "gdi": result["gdi"],
            "interpretation": result["interpretation"],
            "anyCriticalFlag": result.get("any_critical_flag", False),
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
            # Concentration metrics
            "topCountryShare": jdi_data.get("top_country_share", 0),
            "top2CountryShare": jdi_data.get("top_2_share", 0),
            "topOrgShare": ihi_data.get("top_org_share", 0),
            "top3OrgShare": ihi_data.get("top_3_share", 0),
            # Critical flags
            "criticalFlags": result.get("critical_flags", {}),
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
