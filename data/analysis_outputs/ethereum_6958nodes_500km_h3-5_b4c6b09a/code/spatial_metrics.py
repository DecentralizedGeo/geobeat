"""
Spatial metrics for Physical Distribution Index (PDI)

Implements core spatial statistics for measuring geographic decentralization:
- Moran's I (global spatial autocorrelation)
- Spatial HHI (concentration in grid cells)
- Effective Number of Locations (entropy-based diversity)
- Average Nearest Neighbor (point pattern clustering)
- LISA (local clustering)
- Kernel Density Estimation (hotspot detection)
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from typing import Optional, Tuple, Dict, Any
from pysal.lib import weights
from pysal.explore import esda
from scipy import stats
from scipy.spatial import cKDTree
from sklearn.neighbors import KernelDensity
import h3
import logging

try:
    from .models import (
        MoranIResult, SpatialHHIResult, ENLResult, ANNResult
    )
except ImportError:
    from models import (
        MoranIResult, SpatialHHIResult, ENLResult, ANNResult
    )

logger = logging.getLogger(__name__)


class SpatialAnalyzer:
    """
    Comprehensive spatial analysis for blockchain node distribution

    Provides methods to calculate all PDI spatial metrics with
    proper statistical significance testing and uncertainty quantification.
    """

    def __init__(self, gdf: gpd.GeoDataFrame):
        """
        Initialize spatial analyzer

        Args:
            gdf: GeoDataFrame with node locations (EPSG:4326)
        """
        self.gdf = gdf.copy()
        self.network = gdf['network'].iloc[0] if 'network' in gdf.columns else "unknown"

        # Reproject to equal-area projection for distance calculations
        # Using World Mollweide (ESRI:54009)
        self.gdf_projected = self.gdf.to_crs('ESRI:54009')

    def morans_i(
        self,
        attribute: Optional[str] = None,
        threshold_km: float = 500.0,
        permutations: int = 999
    ) -> MoranIResult:
        """
        Calculate Moran's I global spatial autocorrelation

        Measures whether node distribution is clustered, dispersed, or random.

        Args:
            attribute: Column name for attribute to analyze (if None, uses node density)
            threshold_km: Distance threshold for spatial weights (km)
            permutations: Number of permutations for significance testing

        Returns:
            MoranIResult with I statistic, p-value, and interpretation
        """
        # If no attribute specified, calculate local density
        if attribute is None:
            self.gdf_projected['density'] = self._calculate_local_density()
            attribute = 'density'

        # Convert threshold to meters (projected CRS units)
        threshold_m = threshold_km * 1000

        # Create distance-band spatial weights
        w = weights.DistanceBand.from_dataframe(
            self.gdf_projected,
            threshold=threshold_m,
            binary=True
        )

        # Calculate Moran's I
        moran = esda.Moran(
            self.gdf_projected[attribute].values,
            w,
            permutations=permutations
        )

        # Interpret result
        if moran.p_sim < 0.01:
            if moran.I > 0:
                interpretation = f"Significant clustering (I={moran.I:.3f}, p<0.01)"
            else:
                interpretation = f"Significant dispersion (I={moran.I:.3f}, p<0.01)"
        elif moran.p_sim < 0.05:
            if moran.I > 0:
                interpretation = f"Moderate clustering (I={moran.I:.3f}, p<0.05)"
            else:
                interpretation = f"Moderate dispersion (I={moran.I:.3f}, p<0.05)"
        else:
            interpretation = f"Random distribution (I={moran.I:.3f}, p={moran.p_sim:.3f})"

        return MoranIResult(
            network=self.network,
            value=moran.I,
            p_value=moran.p_sim,
            expected_i=moran.EI,
            variance_i=moran.VI_norm,
            z_score=moran.z_norm,
            interpretation=interpretation,
            spatial_weights_type="distance_band",
            threshold_km=threshold_km,
            metadata={
                "n_neighbors_mean": np.mean(list(w.cardinalities.values())),
                "n_neighbors_std": np.std(list(w.cardinalities.values())),
                "attribute_analyzed": attribute
            }
        )

    def spatial_hhi(
        self,
        resolution: int = 5
    ) -> SpatialHHIResult:
        """
        Calculate Spatial Herfindahl-Hirschman Index

        Measures concentration of nodes across H3 hexagonal grid cells.
        Higher values indicate more geographic concentration.

        Args:
            resolution: H3 resolution (3=very coarse, 5=metro-level, 7=neighborhood)

        Returns:
            SpatialHHIResult with HHI value and cell statistics
        """
        # Convert to H3 cells
        self.gdf['h3_cell'] = self.gdf.apply(
            lambda row: h3.latlng_to_cell(row.geometry.y, row.geometry.x, resolution),
            axis=1
        )

        # Count nodes per cell
        cell_counts = self.gdf['h3_cell'].value_counts()
        total_nodes = len(self.gdf)

        # Calculate market shares
        shares = cell_counts / total_nodes

        # HHI = sum of squared shares
        hhi = (shares ** 2).sum()

        # Find max cell concentration
        max_cell_share = shares.max()
        num_cells = len(cell_counts)

        # Interpret (HHI ranges from 1/n to 1)
        # < 0.15: unconcentrated
        # 0.15-0.25: moderate concentration
        # > 0.25: high concentration
        if hhi < 0.15:
            interpretation = f"Low concentration across {num_cells} cells (HHI={hhi:.3f})"
        elif hhi < 0.25:
            interpretation = f"Moderate concentration across {num_cells} cells (HHI={hhi:.3f})"
        else:
            interpretation = f"High concentration across {num_cells} cells (HHI={hhi:.3f})"

        return SpatialHHIResult(
            network=self.network,
            value=hhi,
            grid_resolution=resolution,
            num_cells_occupied=num_cells,
            max_cell_share=max_cell_share,
            interpretation=interpretation,
            metadata={
                "top_5_cells": cell_counts.head(5).to_dict(),
                "min_hhi_theoretical": 1 / total_nodes,
                "concentration_ratio": hhi / (1 / total_nodes)
            }
        )

    def effective_num_locations(
        self,
        resolution: int = 5
    ) -> ENLResult:
        """
        Calculate Effective Number of Locations (ENL)

        Based on Shannon entropy, adjusted to interpretable "effective" count.
        Higher values indicate more even geographic distribution.

        Args:
            resolution: H3 resolution for spatial binning

        Returns:
            ENLResult with ENL value and entropy statistics
        """
        # Convert to H3 cells
        self.gdf['h3_cell'] = self.gdf.apply(
            lambda row: h3.latlng_to_cell(row.geometry.y, row.geometry.x, resolution),
            axis=1
        )

        # Count nodes per cell
        cell_counts = self.gdf['h3_cell'].value_counts()
        total_nodes = len(self.gdf)
        num_cells = len(cell_counts)

        # Calculate probabilities
        probabilities = cell_counts / total_nodes

        # Shannon entropy
        entropy = -np.sum(probabilities * np.log(probabilities))

        # Effective number = exp(entropy)
        enl = np.exp(entropy)

        # Normalize by actual number of cells for interpretation
        evenness = enl / num_cells

        if evenness > 0.8:
            interpretation = f"Very even distribution (ENL={enl:.1f} of {num_cells} cells)"
        elif evenness > 0.5:
            interpretation = f"Moderately even distribution (ENL={enl:.1f} of {num_cells} cells)"
        else:
            interpretation = f"Uneven distribution (ENL={enl:.1f} of {num_cells} cells)"

        return ENLResult(
            network=self.network,
            value=enl,
            total_locations=num_cells,
            entropy=entropy,
            interpretation=interpretation,
            metadata={
                "evenness": evenness,
                "max_entropy_possible": np.log(num_cells),
                "normalized_entropy": entropy / np.log(num_cells) if num_cells > 1 else 0
            }
        )

    def average_nearest_neighbor(
        self,
        permutations: int = 999
    ) -> ANNResult:
        """
        Calculate Average Nearest Neighbor (ANN) distance analysis

        Compares observed nearest neighbor distances to expected random pattern.
        ANN Index < 1: clustering, > 1: dispersion, ≈ 1: random

        Args:
            permutations: Number of permutations for significance test

        Returns:
            ANNResult with observed/expected distances and significance
        """
        # Get coordinates in projected CRS (meters)
        coords = np.column_stack([
            self.gdf_projected.geometry.x,
            self.gdf_projected.geometry.y
        ])

        # Build KD-tree for efficient nearest neighbor search
        tree = cKDTree(coords)

        # Find nearest neighbor for each point (k=2 to skip self)
        distances, _ = tree.query(coords, k=2)
        nearest_distances = distances[:, 1]  # Skip self (index 0)

        # Observed mean nearest neighbor distance (convert to km)
        observed_mean_m = nearest_distances.mean()
        observed_mean_km = observed_mean_m / 1000

        # Calculate expected distance for random pattern
        # E[D] = 0.5 / sqrt(density)
        # Get bounding box area
        bounds = self.gdf_projected.total_bounds
        area_m2 = (bounds[2] - bounds[0]) * (bounds[3] - bounds[1])
        density = len(self.gdf_projected) / area_m2

        expected_mean_m = 0.5 / np.sqrt(density)
        expected_mean_km = expected_mean_m / 1000

        # Nearest Neighbor Index
        nn_index = observed_mean_m / expected_mean_m

        # Z-score for significance
        se = 0.26136 / np.sqrt(len(self.gdf_projected) * density)
        z_score = (observed_mean_m - expected_mean_m) / se
        p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))

        # Interpret
        if p_value < 0.01:
            if nn_index < 1:
                interpretation = f"Significant clustering (ANN={nn_index:.3f}, p<0.01)"
            else:
                interpretation = f"Significant dispersion (ANN={nn_index:.3f}, p<0.01)"
        elif p_value < 0.05:
            if nn_index < 1:
                interpretation = f"Moderate clustering (ANN={nn_index:.3f}, p<0.05)"
            else:
                interpretation = f"Moderate dispersion (ANN={nn_index:.3f}, p<0.05)"
        else:
            interpretation = f"Random pattern (ANN={nn_index:.3f}, p={p_value:.3f})"

        return ANNResult(
            network=self.network,
            value=nn_index,
            p_value=p_value,
            z_score=z_score,
            observed_distance_km=observed_mean_km,
            expected_distance_km=expected_mean_km,
            nearest_neighbor_index=nn_index,
            interpretation=interpretation,
            metadata={
                "n_nodes": len(self.gdf_projected),
                "study_area_km2": area_m2 / 1e6,
                "density_per_km2": density * 1e6
            }
        )

    def _calculate_local_density(self, bandwidth_km: float = 100.0) -> np.ndarray:
        """
        Calculate local node density using KDE

        Args:
            bandwidth_km: Kernel bandwidth in kilometers

        Returns:
            Array of density values for each node
        """
        coords = np.column_stack([
            self.gdf_projected.geometry.x,
            self.gdf_projected.geometry.y
        ])

        # Bandwidth in meters
        bandwidth_m = bandwidth_km * 1000

        # Fit KDE
        kde = KernelDensity(bandwidth=bandwidth_m, kernel='gaussian')
        kde.fit(coords)

        # Calculate density at each point
        log_density = kde.score_samples(coords)
        density = np.exp(log_density)

        return density

    def compute_all_metrics(
        self,
        threshold_km: float = 500.0,
        h3_resolution: int = 5
    ) -> Dict[str, Any]:
        """
        Compute all PDI spatial metrics

        Args:
            threshold_km: Distance threshold for Moran's I
            h3_resolution: H3 resolution for HHI and ENL

        Returns:
            Dictionary with all metric results
        """
        logger.info(f"Computing spatial metrics for {self.network}")

        results = {
            'morans_i': self.morans_i(threshold_km=threshold_km),
            'spatial_hhi': self.spatial_hhi(resolution=h3_resolution),
            'enl': self.effective_num_locations(resolution=h3_resolution),
            'ann': self.average_nearest_neighbor()
        }

        logger.info(f"Completed spatial analysis for {self.network}")
        return results
