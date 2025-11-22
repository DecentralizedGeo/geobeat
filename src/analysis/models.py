"""
Data models for spatial analysis

Defines Pydantic models for node data, geographic coordinates,
and spatial analysis results.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import numpy as np


class NodeLocation(BaseModel):
    """Geographic location of a blockchain node"""

    node_id: str
    network: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    country: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    asn: Optional[int] = None
    isp: Optional[str] = None
    cloud_provider: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)

    @field_validator('latitude', 'longitude')
    @classmethod
    def validate_coordinates(cls, v):
        if np.isnan(v) or np.isinf(v):
            raise ValueError("Coordinate must be a finite number")
        return v


class SpatialMetricResult(BaseModel):
    """Result from a spatial metric calculation"""

    metric_name: str
    network: str
    value: float
    p_value: Optional[float] = None
    confidence_interval: Optional[tuple[float, float]] = None
    interpretation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MoranIResult(SpatialMetricResult):
    """Moran's I spatial autocorrelation result"""

    metric_name: str = "morans_i"
    expected_i: Optional[float] = None
    variance_i: Optional[float] = None
    z_score: Optional[float] = None
    spatial_weights_type: str = "distance_band"
    threshold_km: Optional[float] = None


class SpatialHHIResult(SpatialMetricResult):
    """Spatial Herfindahl-Hirschman Index result"""

    metric_name: str = "spatial_hhi"
    grid_resolution: int
    num_cells_occupied: int
    max_cell_share: float


class ENLResult(SpatialMetricResult):
    """Effective Number of Locations result"""

    metric_name: str = "effective_num_locations"
    total_locations: int
    entropy: float


class ANNResult(SpatialMetricResult):
    """Average Nearest Neighbor result"""

    metric_name: str = "average_nearest_neighbor"
    observed_distance_km: float
    expected_distance_km: float
    nearest_neighbor_index: float
    z_score: Optional[float] = None


class NetworkSnapshot(BaseModel):
    """Complete snapshot of network node locations"""

    network: str
    timestamp: datetime
    nodes: List[NodeLocation]
    total_nodes: int = Field(default=0)
    nodes_with_location: int = Field(default=0)
    location_coverage: float = Field(default=0.0)

    def __init__(self, **data):
        super().__init__(**data)
        self.total_nodes = len(self.nodes)
        self.nodes_with_location = sum(
            1 for n in self.nodes
            if n.latitude is not None and n.longitude is not None
        )
        if self.total_nodes > 0:
            self.location_coverage = self.nodes_with_location / self.total_nodes
