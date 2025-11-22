"""
Data ingestion pipeline for blockchain node geographic data

Handles fetching, parsing, and standardizing node location data
from various sources (Bitnodes, Ethernodes, etc.)
"""

import requests
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import geopandas as gpd
from shapely.geometry import Point
import pandas as pd

try:
    from .models import NodeLocation, NetworkSnapshot
except ImportError:
    from models import NodeLocation, NetworkSnapshot

logger = logging.getLogger(__name__)


class DataIngestionError(Exception):
    """Raised when data ingestion fails"""
    pass


class BitnodesIngestion:
    """Ingest Bitcoin node data from Bitnodes.io API"""

    BASE_URL = "https://bitnodes.io/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def fetch_snapshot(self) -> NetworkSnapshot:
        """
        Fetch current Bitcoin node snapshot

        Returns:
            NetworkSnapshot with node locations
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}/snapshots/latest/",
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            nodes = []
            for node_id, node_data in data.get("nodes", {}).items():
                # Bitnodes format: [protocol_version, user_agent, timestamp,
                # services, height, hostname, city, country, lat, lon, timezone,
                # asn, org]
                if len(node_data) >= 10:
                    lat = node_data[8]
                    lon = node_data[9]

                    # Skip nodes without geolocation
                    if lat is None or lon is None:
                        continue

                    nodes.append(NodeLocation(
                        node_id=node_id,
                        network="bitcoin",
                        latitude=float(lat),
                        longitude=float(lon),
                        city=node_data[6] if len(node_data) > 6 else None,
                        country=node_data[7] if len(node_data) > 7 else None,
                        asn=node_data[11] if len(node_data) > 11 else None,
                        isp=node_data[12] if len(node_data) > 12 else None,
                        timestamp=datetime.utcnow()
                    ))

            return NetworkSnapshot(
                network="bitcoin",
                timestamp=datetime.utcnow(),
                nodes=nodes
            )

        except requests.RequestException as e:
            raise DataIngestionError(f"Failed to fetch Bitnodes data: {e}")
        except (KeyError, ValueError, IndexError) as e:
            raise DataIngestionError(f"Failed to parse Bitnodes data: {e}")


class MockDataGenerator:
    """Generate mock node data for testing"""

    @staticmethod
    def generate_clustered_nodes(
        network: str,
        num_nodes: int = 100,
        num_clusters: int = 5
    ) -> NetworkSnapshot:
        """
        Generate mock nodes with realistic clustering

        Args:
            network: Network name (e.g., 'ethereum')
            num_nodes: Total number of nodes to generate
            num_clusters: Number of geographic clusters

        Returns:
            NetworkSnapshot with generated nodes
        """
        import numpy as np

        # Major city centers as cluster locations
        cluster_centers = [
            (40.7128, -74.0060),   # New York
            (51.5074, -0.1278),    # London
            (35.6762, 139.6503),   # Tokyo
            (37.7749, -122.4194),  # San Francisco
            (52.5200, 13.4050),    # Berlin
        ][:num_clusters]

        nodes = []
        nodes_per_cluster = num_nodes // num_clusters

        for i, (lat_center, lon_center) in enumerate(cluster_centers):
            for j in range(nodes_per_cluster):
                # Add random offset (approx ±100km)
                lat = lat_center + np.random.normal(0, 1.0)
                lon = lon_center + np.random.normal(0, 1.0)

                nodes.append(NodeLocation(
                    node_id=f"{network}_node_{i}_{j}",
                    network=network,
                    latitude=lat,
                    longitude=lon,
                    country=f"Country_{i}",
                    city=f"City_{i}",
                    timestamp=datetime.utcnow()
                ))

        return NetworkSnapshot(
            network=network,
            timestamp=datetime.utcnow(),
            nodes=nodes
        )


def snapshot_to_geodataframe(snapshot: NetworkSnapshot) -> gpd.GeoDataFrame:
    """
    Convert NetworkSnapshot to GeoDataFrame for spatial analysis

    Args:
        snapshot: Network snapshot with node locations

    Returns:
        GeoDataFrame with Point geometries
    """
    data = []
    for node in snapshot.nodes:
        data.append({
            'node_id': node.node_id,
            'network': node.network,
            'latitude': node.latitude,
            'longitude': node.longitude,
            'country': node.country,
            'city': node.city,
            'asn': node.asn,
            'isp': node.isp,
            'cloud_provider': node.cloud_provider,
            'geometry': Point(node.longitude, node.latitude)
        })

    gdf = gpd.GeoDataFrame(data, crs='EPSG:4326')
    return gdf


def load_from_csv(csv_path: str, network: str = "ethereum") -> gpd.GeoDataFrame:
    """
    Load node data from CSV file

    Args:
        csv_path: Path to CSV file with columns: ip, lat, lon, country, city, isp, etc.
        network: Network name

    Returns:
        GeoDataFrame with node locations
    """
    from pathlib import Path

    df = pd.read_csv(csv_path)

    # Filter out rows without coordinates
    df = df.dropna(subset=['lat', 'lon'])

    # Convert to NodeLocation objects
    nodes = []
    for idx, row in df.iterrows():
        nodes.append(NodeLocation(
            node_id=f"{network}_node_{idx}",
            network=network,
            latitude=float(row['lat']),
            longitude=float(row['lon']),
            country=row.get('country') if pd.notna(row.get('country')) else None,
            city=row.get('city') if pd.notna(row.get('city')) else None,
            isp=row.get('isp') if pd.notna(row.get('isp')) else None,
            cloud_provider=row.get('org') if pd.notna(row.get('org')) else None,
            timestamp=datetime.utcnow()
        ))

    snapshot = NetworkSnapshot(
        network=network,
        timestamp=datetime.utcnow(),
        nodes=nodes
    )

    return snapshot_to_geodataframe(snapshot)


def load_sample_data(network: str = "ethereum", use_real_data: bool = True) -> gpd.GeoDataFrame:
    """
    Load sample data for development/testing

    Args:
        network: Network to generate sample data for
        use_real_data: If True, try to load from data/raw/, else generate mock data

    Returns:
        GeoDataFrame with sample node data
    """
    from pathlib import Path

    if use_real_data:
        # Try to find real data files
        project_root = Path(__file__).parent.parent.parent
        data_dir = project_root / "data" / "raw"

        # Look for network-specific CSV files
        pattern = f"*{network}*.csv"
        csv_files = list(data_dir.glob(pattern))

        if csv_files:
            logger.info(f"Loading real data from {csv_files[0]}")
            return load_from_csv(str(csv_files[0]), network=network)
        else:
            logger.warning(f"No real data found for {network}, generating mock data")

    # Fallback to mock data
    generator = MockDataGenerator()
    snapshot = generator.generate_clustered_nodes(
        network=network,
        num_nodes=200,
        num_clusters=5
    )
    return snapshot_to_geodataframe(snapshot)
