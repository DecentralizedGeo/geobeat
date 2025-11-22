# Spatial Analysis Frameworks and Tools

**Research Date:** 2025-11-22
**Purpose:** Document capabilities of spatial analysis frameworks for analyzing blockchain node geographic distributions (10K-100K global point datasets)

---

## Table of Contents

1. [Python Spatial Libraries](#python-spatial-libraries)
2. [R Spatial Packages](#r-spatial-packages)
3. [Visualization Tools](#visualization-tools)
4. [Geospatial Databases](#geospatial-databases)
5. [Performance Comparison Matrix](#performance-comparison-matrix)
6. [Recommended Stack](#recommended-stack)

---

## Python Spatial Libraries

### GeoPandas

**Version:** Latest stable 1.1.1+ (as of 2025)

#### Key Capabilities
- Extends pandas DataFrame to support spatial operations on geometric types
- Built on top of Shapely (geometry operations) and Fiona (file I/O)
- Supports reading/writing multiple geospatial formats (Shapefile, GeoJSON, GeoPackage, PostGIS)
- Spatial joins, overlays, buffering, simplification, and distance calculations
- Integration with matplotlib for basic static mapping

#### Performance for Large Datasets (10K-100K points)
- **Native performance**: Moderate; can struggle with >100K features in memory
- **Optimization strategies**:
  - **Spatial indexing**: Uses R-tree indexes internally for spatial joins
  - **dask-geopandas**: Parallel processing for distributed out-of-core computation
  - **PyGEOS/Shapely 2.0**: Vectorized operations provide 4x-100x speedup
  - **Geometry simplification**: Reduce vertices before spatial operations
  - **Tabular filtering**: Filter by attributes before geometry operations (25% performance gain)

#### Integration with Data Science Workflows
- Native pandas integration (filtering, groupby, merging)
- Works seamlessly with Jupyter notebooks
- Compatible with scikit-learn for machine learning workflows
- Can convert to/from pandas DataFrame with WKT/WKB geometry columns

#### Visualization Output
- matplotlib for static plots
- Export to Folium, Plotly, Kepler.gl for interactive visualization
- Export to GeoJSON for web mapping libraries

#### Official Documentation
- **Main site**: https://geopandas.org/
- **Stable docs**: https://geopandas.org/en/stable/getting_started/introduction.html
- **GitHub**: https://github.com/geopandas/geopandas
- **Performance guide**: https://www.geocorner.net/post/unlocking-geopandas-efficiency-6-tips-to-boost-geopandas-analysis-performance
- **dask-geopandas**: https://dask-geopandas.readthedocs.io/

---

### Shapely

**Version:** 2.0+ (major refactor with vectorized operations)

#### Key Capabilities
- Set-theoretic analysis and manipulation of planar features using GEOS library
- Fundamental geometric types: Points, LineStrings, Polygons, MultiPoints, MultiLineStrings, MultiPolygons
- Operations: buffer, intersection, union, difference, symmetric difference, contains, within, crosses, touches, overlaps
- Distance calculations, area/length measurements
- Geometry validation, simplification, and transformation

#### Performance Characteristics
- **Shapely 2.0+**: Complete refactor with vectorized (element-wise) array operations
- **Performance improvements**: 4x to 100x speedup depending on operation
- **NumPy ufunc implementation**: Operations work on arrays of geometries
- **Best speedup**: Lightweight GEOS operations (contains, intersects) that were previously dominated by Python loop overhead
- **Prepared geometries**: Improve performance for repeated operations (contains, intersects, etc.)

#### Data Science Integration
- NumPy-compatible array operations
- Immutable geometry objects (functional programming style)
- Works as the geometry engine for GeoPandas
- Compatible with coordinate arrays from pandas/NumPy

#### Visualization
- No built-in visualization (geometry objects only)
- Integrates with matplotlib via GeoPandas
- Can export to WKT/WKB for external tools

#### Official Documentation
- **User manual**: https://shapely.readthedocs.io/en/stable/manual.html
- **API reference**: https://shapely.readthedocs.io/en/2.1.1/geometry.html
- **Version 2.x changes**: https://shapely.readthedocs.io/en/stable/release/2.x.html

---

### PySAL / libpysal

**Focus:** Spatial autocorrelation, clustering, and exploratory spatial data analysis (ESDA)

#### Key Capabilities
- **libpysal (core)**: Spatial weights matrices, graph construction, I/O operations
  - Weights from contiguity (polygons), distance (points), kernels
  - Graph construction from polygonal lattices, lines, and points
  - Interactive editing of spatial weights matrices

- **esda**: Exploratory Spatial Data Analysis
  - Global spatial autocorrelation: Moran's I, Geary's C, Getis-Ord G, Join Count
  - Local spatial autocorrelation: Local Moran's I, Local Geary's C, Getis-Ord Gi*
  - Moran scatterplots and cluster maps
  - A-DBSCAN for clustering with boundary blurriness analysis

- **spaghetti**: Network-constrained spatial autocorrelation

#### Performance Characteristics
- **Efficient for 10K-100K points**: Well-optimized for typical point pattern datasets
- **Spatial weights computation**: Can be memory-intensive for very large N (N×N matrix)
- **Best practices**: Use sparse matrix representations for large datasets

#### Data Science Integration
- Built on NumPy and SciPy
- Accepts pandas DataFrames and GeoPandas GeoDataFrames
- Jupyter-friendly with visualization outputs
- Compatible with scikit-learn for combined spatial-ML analysis

#### Visualization
- Matplotlib-based statistical plots
- Moran scatterplots with quadrant highlighting
- Cluster maps (LISA, hot spots, cold spots)
- Integration with GeoPandas for choropleth mapping

#### Official Documentation
- **PySAL ecosystem**: https://pysal.org/pysal/
- **libpysal**: https://pysal.org/libpysal/
- **esda**: https://pysal.org/esda/notebooks/Spatial%20Autocorrelation%20for%20Areal%20Unit%20Data.html
- **GitHub**: https://github.com/pysal/pysal

---

### scikit-learn (DBSCAN, KMeans)

**Focus:** Clustering algorithms applicable to geographic coordinates

#### DBSCAN for Geographic Data

**Key Advantages:**
- No need to specify number of clusters in advance
- Identifies clusters of varying shapes and sizes
- Handles outliers/noise effectively
- Ideal for non-uniform distributions (typical of node locations)

**Geographic Implementation:**
```python
from sklearn.cluster import DBSCAN
import numpy as np

# Convert lat/lon to radians
coords_rad = np.radians(coords)

# Use haversine metric with ball_tree algorithm
clustering = DBSCAN(
    eps=2/6371.,  # epsilon in radians (2km / Earth radius)
    min_samples=5,
    algorithm='ball_tree',
    metric='haversine'
).fit(coords_rad)
```

**Parameter Tuning:**
- `eps`: Maximum distance between points to be considered in same cluster (in radians for haversine)
- `min_samples`: Higher values → denser clusters; lower values → sparser clusters
- `metric='haversine'`: Accounts for Earth's curvature (great circle distances)
- `algorithm='ball_tree'`: Uses triangular inequality to reduce candidate checks

**Performance:**
- Deterministic: Same data in same order produces same clusters
- Time complexity: O(n log n) with ball_tree for spatial data
- Memory efficient: No need to store full distance matrix

#### KMeans Limitations for Geographic Data
- Assumes globular clusters (not ideal for irregular geographic patterns)
- Requires pre-specifying k (number of clusters)
- Uses Euclidean distance by default (not suitable for lat/lon without projection)
- Better for regular grid-like distributions

#### Alternative: OPTICS
- Similar to DBSCAN but lower memory usage
- Extracts clusters at multiple density thresholds
- Better for datasets with varying density

#### Performance for Large Datasets
- DBSCAN scales well to 100K points with ball_tree
- Pre-compute sparse neighborhoods using `NearestNeighbors.radius_neighbors_graph` for memory efficiency
- Can use `sample_weight` to handle near-duplicate points

#### Data Science Integration
- Native NumPy array interface
- Compatible with pandas DataFrames
- Scikit-learn pipeline support
- Works with feature matrices combining spatial and non-spatial attributes

#### Official Documentation
- **Clustering overview**: https://scikit-learn.org/stable/modules/clustering.html
- **DBSCAN API**: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html
- **DBSCAN demo**: https://scikit-learn.org/stable/auto_examples/cluster/plot_dbscan.html
- **Geographic clustering discussion**: https://stackoverflow.com/questions/34579213/dbscan-for-clustering-of-geographic-location-data

---

### scipy.spatial

**Focus:** Spatial data structures, distance calculations, geometric algorithms

#### Key Capabilities
- **Distance computations**:
  - `scipy.spatial.distance`: Various distance metrics (Euclidean, Manhattan, Haversine, etc.)
  - Pairwise distances, distance matrices
  - Nearest neighbor queries

- **KDTree**: Fast nearest neighbor search for low-dimensional data
  - Construction: O(n log n)
  - Query: O(log n) per point
  - Ideal for 2D/3D spatial indexing

- **Delaunay triangulation**: Compute Delaunay triangulation of point sets

- **Voronoi diagrams**: Partition space into regions based on distance to points
  - Vertices, ridge points, ridge vertices, regions
  - Useful for coverage analysis and territory assignment

- **Convex hulls**: Compute convex hull of point clouds
  - Identifies boundary points
  - Useful for analyzing geographic extent

- **QHull integration**: Leverages QHull library for computational geometry

#### Performance Characteristics
- **Highly optimized**: C/Cython implementations
- **Excellent for 10K-100K points**: Fast construction and query times
- **KDTree limitations**: Performance degrades in high dimensions (>20D)
- **Memory efficient**: Compact spatial data structures

#### Data Science Integration
- Pure NumPy array interface
- No dependencies on pandas (lightweight)
- Compatible with any array-like data
- Used as backend by scikit-learn spatial algorithms

#### Visualization
- No built-in visualization
- Output can be plotted with matplotlib or exported to GeoPandas

#### Official Documentation
- **Main reference**: https://docs.scipy.org/doc/scipy/reference/spatial.html
- **Tutorial**: https://docs.scipy.org/doc/scipy/tutorial/spatial.html
- **Voronoi API**: https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.Voronoi.html

---

## R Spatial Packages

### sf (Simple Features for R)

**Version:** 1.0-22 (November 2025)

#### Key Capabilities
- Standardized support for spatial vector data (points, lines, polygons)
- Binds to GDAL (I/O), GEOS (geometry operations), PROJ (projections)
- Uses s2 package for spherical geometry on geodetic coordinates
- Tidyverse integration (works with dplyr, ggplot2, etc.)
- All functions prefixed with `st_*` (spatial type) for discoverability

#### Performance Characteristics
- **Efficient for large datasets**: C++ backend via GEOS/GDAL
- **s2 spherical geometry**: Accurate global-scale computations
- **Spatial indexing**: Automatic R-tree indexing for spatial operations
- **Memory efficiency**: Lazy evaluation where possible

#### Integration with R Ecosystem
- Native data.frame/tibble structure
- Works with dplyr (filter, mutate, summarize with spatial predicates)
- ggplot2 integration via `geom_sf()`
- Compatible with R Markdown and R Notebooks

#### Visualization
- Base R plotting
- ggplot2 with `geom_sf()`
- leaflet, mapview for interactive maps
- Export to GeoJSON, Shapefile for external tools

#### Official Documentation
- **Package site**: https://r-spatial.github.io/sf/
- **CRAN manual (PDF)**: https://cran.r-project.org/web/packages/sf/sf.pdf
- **Getting started**: https://r-spatial.github.io/sf/articles/sf1.html
- **GitHub**: https://github.com/r-spatial/sf
- **UVA tutorial**: https://library.virginia.edu/data/articles/spatial-r-using-sf-package

**Reference Book:**
- Pebesma, E.; Bivand, R. (2023). *Spatial Data Science: With Applications in R*. Chapman and Hall/CRC.

---

### spdep (Spatial Dependence)

**Focus:** Spatial weights, autocorrelation tests, spatial regression

#### Key Capabilities
- **Spatial weights creation**:
  - Regional contiguities (queen, rook)
  - Distance-based weights
  - k-nearest neighbors
  - Tessellation-based weights
  - Regional aggregation by minimum spanning tree

- **Global autocorrelation tests**:
  - Moran's I, Geary's C (Cliff and Ord 1973, 1981)
  - Hubert/Mantel general cross product statistic
  - Getis-Ord G statistics
  - Multi-colored join count statistics
  - APLE (Li et al.)

- **Local autocorrelation indicators**:
  - Local Moran's I (Anselin 1995)
  - Local Geary's C
  - Getis-Ord Gi* (Ord and Getis 1995)
  - LOSH (Local Indicators of Spatial Heteroscedasticity)
  - Local Indicators for Categorical Data (Carrer et al. 2021)

- **Spatial regression tests**:
  - Lagrange multiplier tests for spatial dependence
  - Rao's score tests for spatial Durbin models

**Note:** Model fitting functions moved to `spatialreg` package (v1.2-1+)

#### Recent Additions (2024)
- Weighted Multivariate Spatial Autocorrelation Measures (Bavaud 2024)
- Enhanced categorical data indicators

#### Performance Characteristics
- Optimized for typical spatial datasets (1K-100K observations)
- Spatial weights can be sparse or dense depending on connectivity
- Efficient permutation-based inference

#### Integration with R Ecosystem
- Works with sf objects
- Compatible with sp (legacy spatial package)
- Integrates with base R statistical functions
- Output suitable for ggplot2 visualization

#### Official Documentation
- **Package site**: https://r-spatial.github.io/spdep/
- **CRAN page**: https://cran.r-project.org/package=spdep
- **CRAN manual (PDF)**: https://cran.r-project.org/web/packages/spdep/spdep.pdf
- **GitHub**: https://github.com/r-spatial/spdep
- **Function index**: https://r-spatial.github.io/spdep/reference/index.html

**Implementation Reference:**
- Bivand and Wong (2018) describe most measure implementations

---

### spatstat (Point Pattern Analysis)

**Focus:** Spatial point pattern analysis, modeling, simulation, testing

#### Key Capabilities
- **Comprehensive toolbox**: Over 3000 functions for spatial point patterns
- **Data types supported**:
  - 2D point patterns (primary focus)
  - 3D point patterns
  - Multitype/marked points
  - Space-time point patterns
  - Point patterns on linear networks

- **Exploratory analysis**:
  - Ripley's K-function, L-function
  - Pair correlation function (g-function)
  - F, G, J functions for distance distributions
  - Intensity estimation (kernel smoothing)

- **Parametric models**:
  - Poisson point processes
  - Gibbs point processes (ppm)
  - Cox point processes (kppm)
  - Neyman-Scott cluster processes
  - Determinantal point processes (dppm)
  - Log-Gaussian Cox processes (slrm)

- **Simulation and testing**:
  - Monte Carlo simulation
  - Hypothesis testing
  - Model diagnostics
  - Residual analysis

#### Performance Characteristics
- Highly optimized C code for core algorithms
- Efficient for typical point pattern datasets (1K-100K points)
- Spatial indexing for fast neighbor queries
- Parallel processing support for simulations

#### Integration with R Ecosystem
- Works with sf for point geometries
- Compatible with raster for covariate data
- Supports standard R statistical workflows
- Visualization via base R and ggplot2

#### Visualization
- Extensive built-in plotting functions
- Diagnostic plots (residuals, Q-Q plots)
- Spatial intensity maps
- Point pattern visualizations with marks

#### Official Documentation
- **CRAN page**: https://cran.r-project.org/web/packages/spatstat/index.html
- **Reference manual (PDF)**: https://cran.r-project.org/web/packages/spatstat/spatstat.pdf
- **Getting started guide**: https://cran.r-project.org/web/packages/spatstat/vignettes/getstart.pdf
- **Tutorial**: https://mgimond.github.io/Spatial/point-pattern-analysis-in-r.html

**Reference Book:**
- Baddeley, Rubak and Turner (2015). *Spatial Point Pattern Analysis, Model-Fitting, Simulation, Tests*

---

## Visualization Tools

### Plotly (Python)

**Version:** 6.5.0+ (2025)

#### Key Capabilities
- **Geographic scatter plots**: `px.scatter_map()` and `go.Scattermap()` (current)
- **Deprecated**: `px.scatter_mapbox()` and `go.Scattermapbox()` (still functional)
- **Base map providers**: Maplibre, OpenStreetMap, custom tile servers
- **Customization**: Marker colors, sizes, hover text, legends
- **Interactivity**: Pan, zoom, hover tooltips, click events
- **Map styles**: Various built-in styles and custom configurations

**Important Migration Note:**
Plotly 5.24+ uses Maplibre for rendering instead of Mapbox GL. Functions changed from `scatter_mapbox` to `scatter_map`.

#### Performance for Large Datasets
- **Client-side rendering**: Can handle 10K-100K points in browser
- **WebGL support**: Hardware acceleration for better performance
- **Aggregation**: Use density heatmaps for >100K points
- **Marker clustering**: Not built-in; consider server-side aggregation

#### Data Science Integration
- Native pandas DataFrame integration
- Works seamlessly with GeoPandas (via GeoDataFrame to DataFrame conversion)
- Jupyter notebook support with inline rendering
- Export to HTML for standalone interactive maps

#### Visualization Outputs
- Interactive HTML files
- Embedded in Jupyter notebooks
- Static image export (PNG, SVG via kaleido)
- Dash apps for web dashboards

#### Official Documentation
- **Scatter maps**: https://plotly.com/python/tile-scatter-maps/
- **Map configuration**: https://plotly.com/python/map-configuration/
- **Tile layers**: https://plotly.com/python/tile-map-layers/
- **API reference**: https://plotly.com/python-api-reference/generated/plotly.graph_objects.Scattermapbox.html

---

### Folium (Python + Leaflet.js)

**Focus:** Interactive Leaflet maps from Python

#### Key Capabilities
- Python wrapper for Leaflet.js mapping library
- Data wrangling in Python, visualization in Leaflet
- Choropleth maps, heatmaps, markers, popups
- Built-in tile providers (OpenStreetMap, Mapbox, Stamen, etc.)
- Plugin ecosystem (marker clusters, heat maps, fullscreen, etc.)
- GeoJSON overlay support

#### Performance for Large Datasets
- **Adequate for medium datasets**: Good up to ~10K-20K points
- **Performance degradation**: Slows with >50K points
- **Solutions for large datasets**:
  - **folium-glify-layer plugin**: Fast WebGL rendering for large GeoJSON FeatureCollections
  - **Marker clustering**: Groups nearby points into clusters
  - **Server-side aggregation**: Pre-process data before visualization

**Alternative for very large datasets:**
- Consider OpenLayers (advanced rendering) or Geemap (Earth Engine backend for big data)

#### Data Science Integration
- Accepts pandas DataFrames
- GeoPandas GeoDataFrame integration
- Jupyter notebook inline display
- Simple API: `folium.Map()` → add layers → save HTML

#### Visualization Outputs
- Interactive HTML files (standalone, shareable)
- Embedded in Jupyter notebooks
- Can be embedded in web pages

#### Official Documentation
- **Main site**: https://python-visualization.github.io/folium/latest/
- **GitHub**: https://github.com/python-visualization/folium
- **Earth Lab tutorial**: https://earthdatascience.org/courses/scientists-guide-to-plotting-data-in-python/plot-spatial-data/customize-vector-plots/interactive-leaflet-maps-in-python-folium/
- **Real Python guide**: https://realpython.com/python-folium-web-maps-from-data/
- **folium-glify-layer** (for large datasets): https://github.com/onaci/folium-glify-layer

---

### Kepler.gl

**Focus:** Large-scale geospatial data visualization with WebGL

#### Key Capabilities
- **Data-agnostic, high-performance** web-based geospatial analysis tool
- Built on **deck.gl** (WebGL rendering) and **MapLibre GL**
- Render **millions of points** with spatial aggregations on-the-fly
- **GPU-accelerated** calculations for performance
- **Layer types**: Point, arc, line, polygon, hexagon, heatmap, cluster, trip animation
- **Filters and aggregations**: Interactive filtering by attributes
- **3D visualization**: Height encoding, 3D buildings, arc layers
- **Time-series animation**: Visualize temporal patterns

#### Architecture
- **React component** with Redux state management
- Can be embedded in React-Redux applications
- Highly customizable and extensible
- Python API: `keplergl` package for Jupyter integration

#### Performance for Large Datasets
- **Designed for large-scale data**: Handles millions of points efficiently
- **WebGL rendering**: Leverages GPU for fast rendering
- **Vector tiles**: Visualize complex datasets without compromising performance
- **On-the-fly aggregation**: Hexagonal binning, clustering computed in real-time
- **Scalability**: Suitable for 100K+ node locations

#### Data Science Integration
- **Python package**: `pip install keplergl`
- Load data from pandas DataFrames or GeoPandas GeoDataFrames
- Jupyter notebook support with inline rendering
- Export configurations as JSON
- Export visualizations as HTML or images

#### Visualization Outputs
- Interactive web applications
- Embedded in Jupyter notebooks
- Standalone HTML exports
- Screenshots and videos (for presentations)

#### Official Documentation
- **Main site**: https://kepler.gl/demo
- **User guides**: https://docs.kepler.gl/docs/user-guides
- **GitHub**: https://github.com/keplergl/kepler.gl
- **Python tutorial**: https://betterprogramming.pub/geo-data-visualization-with-kepler-gl-fbc15debbca4
- **Use cases**: https://carto.com/blog/h3-spatial-indexes-10-use-cases (H3 + Kepler.gl examples)

**License:** MIT (open source)
**Developer:** Uber → Urban Computing Foundation (2019)

---

### Deck.gl + Mapbox GL JS

**Focus:** WebGL-based 3D visualization library for large datasets

#### Deck.gl Overview

**Key Capabilities:**
- **WebGL/WebGPU rendering**: High-performance 3D visualizations
- **Large dataset support**: Designed for millions of data points
- **Rich layer catalog**: 50+ layer types (Scatterplot, Arc, Hexagon, Heatmap, GeoJSON, etc.)
- **3D and 2D**: Seamless transitions between perspectives
- **GPU-accelerated**: Computations offloaded to GPU
- **Framework-agnostic**: Pure JavaScript, React bindings available

#### Integration with Mapbox GL JS

**Three integration modes:**

1. **Interleaved mode**: Renders deck.gl layers into Mapbox's WebGL2 context
   - Seamless z-buffer blending
   - deck.gl 3D layers interleave with Mapbox layers

2. **Overlaid mode**: Renders deck.gl in separate canvas inside Mapbox controls
   - Independent rendering contexts

3. **Reverse-controlled mode**: deck.gl above Mapbox, blocks base map interaction
   - Full deck.gl control

**Performance Consideration:**
- CPU usage of Mapbox custom layer is higher than pure deck.gl
- deck.gl implementation redraws only its own context (better for animations)

#### Performance for Large Datasets
- **Excellent for 100K+ points**: WebGL rendering scales well
- **GPU acceleration**: Offloads computation from CPU
- **Aggregation layers**: Hexagon, heatmap layers for dense data
- **Efficient updates**: Only redraws changed layers

#### Data Science Integration
- **JavaScript library**: Use with Node.js, React, or vanilla JS
- **Python integration**: Via pydeck package
  - `pip install pydeck`
  - Create deck.gl visualizations from pandas/GeoPandas
  - Jupyter notebook support
- **Data format**: Accepts JSON, GeoJSON, arrays

#### Visualization Outputs
- Interactive web applications
- Embedded in Jupyter (via pydeck)
- Standalone HTML files
- Screenshots and recordings

#### Official Documentation
- **Main site**: https://deck.gl/docs
- **Using with Mapbox**: https://deck.gl/docs/developer-guide/base-maps/using-with-mapbox
- **API reference**: https://deck.gl/docs/api-reference/mapbox/overview
- **Integration guide**: https://medium.com/vis-gl/deckgl-and-mapbox-better-together-47b29d6d4fb1
- **Interleaving example**: https://deck.gl/gallery/mapbox-overlay

---

### QGIS (Desktop GIS)

**Focus:** Open-source desktop GIS application for exploratory spatial analysis

#### Key Capabilities
- **Comprehensive GIS platform**: Vector and raster data processing
- **Spatial operations**: Buffer, clip, intersect, union, dissolve, spatial joins
- **Geoprocessing tools**: 1000+ algorithms via Processing Toolbox
- **Database connectivity**: PostGIS, SpatiaLite, Oracle Spatial, SQL Server
- **Coordinate systems**: Full PROJ support for projections and transformations
- **Symbology**: Advanced cartographic styling and labeling
- **Python integration**: PyQGIS API for automation and custom scripts

#### PyQGIS for Automation

**Key Features:**
- Access all QGIS functionality via Python API
- Run processing algorithms programmatically
- Batch processing interface
- Custom plugins and scripts
- Python console within QGIS

**Example workflow:**
```python
import processing
# Run spatial join algorithm
result = processing.run("native:joinattributesbylocation", {
    'INPUT': point_layer,
    'JOIN': polygon_layer,
    'PREDICATE': [0],  # intersects
    'OUTPUT': 'memory:'
})
```

#### Performance for Large Point Datasets
- **Moderate performance**: CPU-based rendering can slow with very large files
- **Optimization strategies**:
  - **Spatial indexes**: QGIS warns when indexes would speed up operations
  - Use built-in algorithms (faster than custom code)
  - Filter data before visualization
  - Load subsets rather than entire datasets
  - Use database views for large PostGIS datasets

**Limitation:** Not suitable for real-time analysis of 100K+ points (better for exploratory work)

#### Data Science Integration
- **Python integration**: Full PyQGIS API access
- **R integration**: Via Processing R Provider plugin
- **Export to formats**: CSV, GeoJSON, GeoPackage for use in Python/R
- **Not Jupyter-native**: Primarily desktop application (but can script with PyQGIS)

#### Visualization Outputs
- Static maps (print composer → PDF, PNG, SVG)
- Interactive web maps (via qgis2web plugin → Leaflet/OpenLayers)
- Time-series animations (Temporal Controller)
- 3D scenes (3D Map View)

#### Use Cases for Blockchain Node Analysis
- **Exploratory data analysis**: Visually inspect node distributions
- **Data preparation**: Clean, validate, and enrich geographic datasets
- **Spatial queries**: Identify nodes in specific regions
- **Cartographic output**: Create publication-quality maps
- **Prototyping**: Test spatial analysis workflows before coding

#### Official Documentation
- **Main site**: https://qgis.org/
- **PyQGIS tutorials**: https://www.qgistutorials.com/en/docs/3/processing_algorithms_pyqgis.html
- **PyQGIS Masterclass**: https://courses.spatialthoughts.com/pyqgis-masterclass.html
- **Spatial queries**: https://www.qgistutorials.com/en/docs/3/performing_spatial_queries.html
- **Python scripts tutorial**: https://medium.com/data-science/how-to-use-qgis-spatial-algorithms-with-python-scripts-4bf980e39898

---

## Geospatial Databases

### PostGIS (PostgreSQL Extension)

**Focus:** Add spatial capabilities to PostgreSQL relational database

#### Key Capabilities
- **Spatial data types**: GEOMETRY (Cartesian), GEOGRAPHY (spherical)
- **Geometric objects**: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection
- **Spatial operations**:
  - Distance, area, length calculations
  - Spatial relationships: contains, within, intersects, overlaps, touches, crosses
  - Spatial joins, buffering, intersection, union, difference
  - Nearest neighbor queries
  - Coordinate transformations (SRID support via PROJ)

- **Spatial indexing**: GiST, BRIN, SP-GiST indexes for fast queries
- **Raster support**: Store and analyze raster data
- **3D/4D support**: Z and M coordinates for elevation and measures

#### GEOMETRY vs GEOGRAPHY

**GEOMETRY:**
- Cartesian plane (flat Earth)
- Requires projected coordinate system (SRS/SRID)
- **Better performance** for most operations
- Units depend on projection (meters, feet, degrees, etc.)
- Use when working in local areas or when speed matters

**GEOGRAPHY:**
- Spherical Earth model (geodetic coordinates)
- Coordinates in degrees (longitude, latitude)
- **More accurate** for large-scale/global analysis
- Accounts for Earth's curvature
- Slightly slower than GEOMETRY
- Use for global-scale blockchain node analysis

#### Spatial Indexing

**GiST (Generalized Search Tree):**
- Most common index type for spatial data
- R-tree implementation
- Syntax: `CREATE INDEX idx_table_geom ON table USING GIST (geom);`
- **Auto-tuning**: No parameter tuning needed
- **Performance**: Excellent as long as index fits in RAM
- **Best for**: General-purpose spatial queries

**Performance benefits:**
- Unindexed join of 10K × 10K = 100M comparisons
- Indexed join = ~20K comparisons (500x speedup)

**BRIN (Block Range Index):**
- Stores bounding boxes for table blocks
- **Much smaller** than GiST (minimal disk space)
- **Fast to build**
- **Requirement**: Data must be spatially clustered/sorted
- **Best for**: Very large tables (100M+ rows) with spatial clustering

**SP-GiST (Space-Partitioned GiST):**
- Alternative index structure
- Can be better for certain data distributions
- Less commonly used than GiST

#### Performance Tuning for Large Point Datasets (100K+)

**PostgreSQL Configuration:**
```sql
-- Allocate 25-30% of RAM to shared_buffers (e.g., 8GB for 32GB system)
shared_buffers = 8GB

-- Work memory for sorting/hashing (start with 64MB, increase if needed)
work_mem = 64MB

-- Maintenance memory for index creation (512MB - 1GB)
maintenance_work_mem = 512MB
```

**Best Practices:**
- **ANALYZE after index creation**: Updates statistics for query planner
- **VACUUM regularly**: Reclaim space and update statistics
- **Use EXPLAIN ANALYZE**: Verify index usage in queries
- **Spatial clustering**: Pre-sort data spatially before loading (helps BRIN indexes)

**Index creation challenges:**
- PostGIS doesn't support parallel index creation (no multi-core for GiST)
- For 100M+ records, index creation can take hours to days
- Consider BRIN if data is spatially sorted

#### Performance Benchmarks
- Real-world example: 26M records, 200-500ms query times with GiST index
- Proper indexes + tuning = 100-500x speedup

#### Data Science Integration
- **GeoPandas**: Read/write via `geopandas.read_postgis()` and `GeoDataFrame.to_postgis()`
- **SQLAlchemy + GeoAlchemy2**: ORM support for PostGIS
- **psycopg2**: Direct SQL queries from Python
- **R sf**: Read PostGIS via `st_read("PG:dbname=...")`
- **QGIS**: Native PostGIS connectivity

#### Workflow for Blockchain Nodes
1. Store node locations in PostGIS (lat/lon as GEOGRAPHY)
2. Create spatial index for fast queries
3. Perform spatial queries (distance, clustering, coverage)
4. Export results to GeoPandas/R for analysis
5. Update database with enriched data

#### Official Documentation
- **Main site**: https://postgis.net/
- **Data management**: https://postgis.net/docs/using_postgis_dbmanagement.html
- **GEOMETRY vs GEOGRAPHY**: https://medium.com/coord/postgis-performance-showdown-geometry-vs-geography-ec99967da4f0
- **Indexing guide**: http://postgis.net/workshops/postgis-intro/indexing.html
- **Performance tuning**: https://dohost.us/index.php/2025/11/16/tuning-postgresql-configuration-for-postgis-performance/
- **Best practices**: https://www.alibabacloud.com/blog/postgresql-best-practices-selection-and-optimization-of-postgis-spatial-indexes-gist-brin-and-r-tree_597034
- **Crunchy Data guide**: https://www.crunchydata.com/blog/postgis-performance-indexing-and-explain

---

### H3 (Hexagonal Hierarchical Spatial Index)

**Developer:** Uber → Open source
**Focus:** Discrete global grid system with hexagonal cells

#### Key Capabilities
- **Hierarchical hexagonal grid**: 16 resolution levels (global → sub-meter)
- **Resolution range**:
  - Resolution 0: ~4.36 million km² per hexagon (global coverage)
  - Resolution 15: ~0.9 m² per hexagon (building-scale)

- **Core operations**:
  - Lat/lon → H3 cell ID
  - H3 cell → lat/lon center
  - Get neighboring cells (k-ring)
  - Parent/child cell relationships (aggregation/drill-down)
  - Cell area, edge length calculations
  - Grid distance between cells

- **Multi-resolution analysis**: Seamlessly aggregate data across scales
- **Geospatial indexing**: Fast lookups, spatial joins, and aggregations

#### Python Implementation (h3-py)

**Installation:**
```bash
pip install h3
```

**Basic usage:**
```python
import h3

# Convert lat/lon to H3 cell at resolution 9
h3_cell = h3.latlng_to_cell(37.7749, -122.4194, 9)

# Get neighboring cells
neighbors = h3.grid_disk(h3_cell, 1)  # 1-ring neighbors

# Get parent cell (coarser resolution)
parent = h3.cell_to_parent(h3_cell, 7)

# Get children cells (finer resolution)
children = h3.cell_to_children(h3_cell, 11)
```

#### Performance Characteristics
- **Very fast indexing**: O(1) lat/lon → cell conversion
- **Efficient spatial joins**: Join on H3 cell ID instead of geometry
- **Compact representation**: Cell IDs are 64-bit integers
- **Scalable aggregation**: Group by H3 cell for multi-scale heatmaps
- **Memory efficient**: No need to store geometries for aggregation

#### Use Cases for Blockchain Node Analysis

1. **Multi-scale aggregation**: Visualize node density at different zoom levels
   - Resolution 2-4: Continental/regional patterns
   - Resolution 5-7: Country/state patterns
   - Resolution 8-10: City/metro patterns

2. **Spatial indexing**: Fast lookup of nodes in geographic areas

3. **Coverage analysis**: Identify hexagons with/without nodes

4. **Density heatmaps**: Count nodes per hexagon for visualization

5. **Geohashing**: Group nodes for privacy-preserving analysis

6. **Temporal analysis**: Track node distribution changes over time per cell

#### Resolution Selection for 10K-100K Global Nodes

- **Resolution 4** (~1,770 km²): Global/continental overview
- **Resolution 5** (~252 km²): Regional patterns
- **Resolution 6** (~36 km²): Country-scale analysis
- **Resolution 7** (~5.16 km²): Metro area detail
- **Resolution 8** (~0.74 km²): City-scale precision

**Recommendation:** Use resolutions 5-7 for global node distribution analysis

#### Integration with Visualization Tools
- **Kepler.gl**: Native H3 layer support (hexagon visualization)
- **Deck.gl**: H3HexagonLayer for WebGL rendering
- **QGIS**: H3 plugins available
- **GeoPandas**: Convert H3 cells to Polygon geometries for mapping
- **Plotly**: Convert H3 to lat/lon for scatter maps

#### Data Science Integration
- **Python**: h3-py package (official bindings)
- **Pandas**: Use H3 cell ID as groupby key
- **GeoPandas**: `h3.cells_to_h3shape()` converts cells to GeoDataFrame
- **NumPy**: Vectorized operations on arrays of cell IDs
- **Jupyter**: Interactive exploration with ipyleaflet + H3

#### Official Documentation
- **Main site**: https://h3geo.org/
- **Overview**: https://h3geo.org/docs/core-library/overview/
- **Python docs**: https://uber.github.io/h3-py/intro.html
- **GitHub (core)**: https://github.com/uber/h3
- **GitHub (Python)**: https://github.com/uber/h3-py
- **PyPI**: https://pypi.org/project/h3/
- **Uber blog**: https://www.uber.com/blog/h3/
- **Tutorial**: https://www.analyticsvidhya.com/blog/2025/03/ubers-h3-for-spatial-indexing/
- **Use cases**: https://carto.com/blog/h3-spatial-indexes-10-use-cases

#### Integration Examples

**Use with Kepler.gl:**
```python
import h3
import pandas as pd
from keplergl import KeplerGl

# Add H3 column to node data
df['h3_cell'] = df.apply(lambda row: h3.latlng_to_cell(row['lat'], row['lon'], 6), axis=1)

# Aggregate nodes per cell
h3_counts = df.groupby('h3_cell').size().reset_index(name='node_count')

# Visualize in Kepler.gl
map_1 = KeplerGl(height=600)
map_1.add_data(data=h3_counts, name='Node Density')
map_1
```

**Use with PostGIS:**
H3 can complement PostGIS by pre-aggregating data into hexagonal bins before storing in database, reducing query complexity.

---

## Performance Comparison Matrix

| **Tool/Library** | **Dataset Size** | **Performance** | **Best For** | **Limitations** |
|------------------|------------------|-----------------|--------------|-----------------|
| **GeoPandas** | 10K-50K | Moderate | Data wrangling, spatial joins | Slows with >100K without dask |
| **Shapely 2.0** | Any | Excellent | Geometry operations | No visualization |
| **PySAL** | 10K-100K | Good | Spatial autocorrelation | Memory-intensive for large N×N weights |
| **scikit-learn DBSCAN** | 100K+ | Excellent | Geographic clustering | Requires parameter tuning |
| **scipy.spatial** | 100K+ | Excellent | Distance, Voronoi, convex hull | No GIS features |
| **R sf** | 10K-100K | Good | Spatial data in R | R ecosystem dependency |
| **R spdep** | 10K-100K | Good | Autocorrelation tests | Spatial regression moved to spatialreg |
| **R spatstat** | 10K-100K | Good | Point pattern modeling | Primarily 2D |
| **Plotly** | 10K-100K | Good | Interactive scatter maps | Client-side rendering limits |
| **Folium** | 10K-20K | Moderate | Simple interactive maps | Slows with large datasets |
| **Kepler.gl** | 1M+ | Excellent | Large-scale visualization | Requires WebGL browser |
| **Deck.gl** | 1M+ | Excellent | WebGL 3D visualization | JavaScript/Python pydeck |
| **QGIS** | 10K-50K | Moderate | Exploratory analysis | CPU-based, desktop only |
| **PostGIS** | 100M+ | Excellent | Spatial database | Requires PostgreSQL setup |
| **H3** | Any | Excellent | Multi-scale aggregation | Hexagon approximation |

---

## Recommended Stack

For analyzing **10K-100K blockchain node locations** at **global scale**, here's the recommended technology stack:

### Data Storage & Querying
- **PostGIS**: Store node locations as GEOGRAPHY type with GiST spatial index
  - Fast spatial queries (distance, nearest neighbors)
  - Historical data storage with timestamps
  - Integration with all analysis tools

### Data Processing & Analysis (Python)
- **GeoPandas**: Primary data structure for spatial analysis
  - Load from PostGIS, CSV, GeoJSON
  - Spatial joins, filtering, attribute operations

- **Shapely 2.0**: Geometry operations
  - Calculate centroids, buffers, convex hulls
  - Vectorized operations for performance

- **scikit-learn DBSCAN**: Geographic clustering
  - Identify node clusters with haversine metric
  - Detect dense regions and outliers

- **PySAL (esda)**: Spatial autocorrelation
  - Moran's I for global clustering patterns
  - Local Moran's I for hot spot detection

- **scipy.spatial**: Geometric analysis
  - Voronoi diagrams for coverage analysis
  - Convex hull for geographic extent

- **H3**: Multi-resolution aggregation
  - Generate heatmaps at multiple zoom levels
  - Efficient spatial indexing and grouping

### Visualization
- **Kepler.gl**: Primary interactive visualization
  - Handle 100K+ points with WebGL
  - Hexagon aggregation, 3D arcs, time-series
  - Jupyter integration for exploratory work
  - Export standalone HTML for sharing

- **Plotly**: Secondary interactive plots
  - Scatter maps with custom styling
  - Statistical charts (histograms, scatter plots)
  - Jupyter/Dash integration

- **QGIS**: Exploratory analysis and cartography
  - Visual data inspection and validation
  - Create publication-quality static maps
  - Rapid prototyping of spatial queries

### Alternative: R-based Stack
For those preferring R:
- **sf**: Spatial data handling
- **spdep**: Spatial autocorrelation and dependence
- **spatstat**: Point pattern analysis
- **leaflet/mapview**: Interactive visualization
- **ggplot2 + geom_sf()**: Static cartography

### Hybrid Workflow
1. **Store**: PostGIS database (with GEOGRAPHY type)
2. **Extract**: GeoPandas from PostGIS
3. **Analyze**:
   - Clustering: scikit-learn DBSCAN
   - Autocorrelation: PySAL esda
   - Geometry: scipy.spatial, Shapely
   - Aggregation: H3 hexagons
4. **Visualize**:
   - Interactive: Kepler.gl (primary), Plotly (secondary)
   - Static: QGIS or matplotlib
5. **Share**:
   - Jupyter notebooks (analysis + visualizations)
   - Standalone HTML (Kepler.gl exports)
   - PDF maps (QGIS)

---

## Sources

**Python Spatial Libraries:**
- [GeoPandas Official Documentation](https://geopandas.org/en/stable/getting_started/introduction.html)
- [GeoPandas Performance Guide](https://www.geocorner.net/post/unlocking-geopandas-efficiency-6-tips-to-boost-geopandas-analysis-performance)
- [dask-geopandas Documentation](https://dask-geopandas.readthedocs.io/)
- [Shapely 2.x User Manual](https://shapely.readthedocs.io/en/stable/manual.html)
- [Shapely Geometry Reference](https://shapely.readthedocs.io/en/2.1.1/geometry.html)
- [PySAL Documentation](https://pysal.org/pysal/)
- [PySAL Spatial Autocorrelation Guide](https://pysal.org/esda/notebooks/Spatial%20Autocorrelation%20for%20Areal%20Unit%20Data.html)
- [scikit-learn Clustering Documentation](https://scikit-learn.org/stable/modules/clustering.html)
- [scikit-learn DBSCAN API](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html)
- [DBSCAN Geographic Clustering on Stack Overflow](https://stackoverflow.com/questions/34579213/dbscan-for-clustering-of-geographic-location-data)
- [SciPy Spatial Reference](https://docs.scipy.org/doc/scipy/reference/spatial.html)
- [SciPy Spatial Tutorial](https://docs.scipy.org/doc/scipy/tutorial/spatial.html)

**R Spatial Packages:**
- [R sf Package Documentation](https://r-spatial.github.io/sf/)
- [sf CRAN Manual (PDF)](https://cran.r-project.org/web/packages/sf/sf.pdf)
- [R spdep Package Site](https://r-spatial.github.io/spdep/)
- [spdep CRAN Manual](https://cran.r-project.org/web/packages/spdep/spdep.pdf)
- [spatstat CRAN Page](https://cran.r-project.org/web/packages/spatstat/index.html)
- [spatstat Getting Started Guide](https://cran.r-project.org/web/packages/spatstat/vignettes/getstart.pdf)
- [Point Pattern Analysis in R Tutorial](https://mgimond.github.io/Spatial/point-pattern-analysis-in-r.html)

**Visualization Tools:**
- [Plotly Scatter Maps Documentation](https://plotly.com/python/tile-scatter-maps/)
- [Plotly Map Configuration](https://plotly.com/python/map-configuration/)
- [Folium Official Documentation](https://python-visualization.github.io/folium/latest/)
- [Folium Real Python Guide](https://realpython.com/python-folium-web-maps-from-data/)
- [Kepler.gl Official Site](https://kepler.gl/demo)
- [Kepler.gl User Guides](https://docs.kepler.gl/docs/user-guides)
- [Kepler.gl GitHub Repository](https://github.com/keplergl/kepler.gl)
- [deck.gl Documentation](https://deck.gl/docs)
- [deck.gl + Mapbox Integration Guide](https://deck.gl/docs/developer-guide/base-maps/using-with-mapbox)
- [deck.gl and Mapbox Better Together (Medium)](https://medium.com/vis-gl/deckgl-and-mapbox-better-together-47b29d6d4fb1)
- [QGIS PyQGIS Tutorial](https://www.qgistutorials.com/en/docs/3/processing_algorithms_pyqgis.html)
- [PyQGIS Masterclass](https://courses.spatialthoughts.com/pyqgis-masterclass.html)

**Geospatial Databases:**
- [PostGIS Official Site](https://postgis.net/)
- [PostGIS Data Management](https://postgis.net/docs/using_postgis_dbmanagement.html)
- [PostGIS Performance: GEOMETRY vs GEOGRAPHY](https://medium.com/coord/postgis-performance-showdown-geometry-vs-geography-ec99967da4f0)
- [PostGIS Spatial Indexing Workshop](http://postgis.net/workshops/postgis-intro/indexing.html)
- [PostGIS Performance Tuning Guide](https://dohost.us/index.php/2025/11/16/tuning-postgresql-configuration-for-postgis-performance/)
- [PostGIS Best Practices: Spatial Indexes](https://www.alibabacloud.com/blog/postgresql-best-practices-selection-and-optimization-of-postgis-spatial-indexes-gist-brin-and-r-tree_597034)
- [H3 Official Documentation](https://h3geo.org/)
- [H3 Python Bindings (h3-py)](https://uber.github.io/h3-py/intro.html)
- [H3 GitHub Repository](https://github.com/uber/h3)
- [Uber H3 Blog Post](https://www.uber.com/blog/h3/)
- [H3 Spatial Indexing Guide](https://www.analyticsvidhya.com/blog/2025/03/ubers-h3-for-spatial-indexing/)
- [H3 Use Cases](https://carto.com/blog/h3-spatial-indexes-10-use-cases)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-22
**Next Review:** When selecting specific tools for implementation
