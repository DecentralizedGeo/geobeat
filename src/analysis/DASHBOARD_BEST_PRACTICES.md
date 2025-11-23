# Best Practices for Interactive Time-Series Dashboards for Spatial/Geographic Metrics

**Research Date:** 2025-11-22
**Location:** /Users/x25bd/Code/astral/geobeat/src/analysis/DASHBOARD_BEST_PRACTICES.md

This document synthesizes best practices for building interactive time-series dashboards for spatial/geographic metrics, with a focus on Python-based solutions integrating GeoPandas and PySAL.

---

## 1. Modern Dashboard Frameworks

### Framework Comparison: Plotly Dash vs Streamlit

#### **Quick Recommendation**
- **Rapid prototyping & stakeholder demos:** Streamlit
- **Production-grade, enterprise applications:** Plotly Dash
- **Geospatial-focused applications:** Both are viable; Panel/HoloViz is also strong

#### **Streamlit**

**Strengths:**
- Lightweight framework turning scripts into shareable apps quickly
- Minimal front-end work required
- Excellent for rapid prototyping and smaller-scale apps
- Simple syntax focusing on developer experience
- Fast development cycles

**Limitations:**
- When a user changes anything, the entire app runs again from top to bottom
- Requires optimization implementation or app will run slowly as it grows
- Free tier limits to 1 GB of RAM

**Geospatial Integration:**
- Native support via `st.pydeck_chart` for PyDeck visualizations
- `streamlit-folium` component for Folium maps
- `st.map()` for basic mapping needs

**Best For:** Data science prototypes, internal tools, proof-of-concepts

**Resources:**
- [Streamlit vs Dash 2025 Comparison - Kanaries](https://docs.kanaries.net/topics/Streamlit/streamlit-vs-dash)
- [Streamlit vs Dash - UI Bakery](https://uibakery.io/blog/streamlit-vs-dash)
- [Streamlit Official Docs](https://docs.streamlit.io/)

#### **Plotly Dash**

**Strengths:**
- Highly customizable leveraging Plotly's charting library and HTML components
- Designed for scalability - handles complex applications, large datasets, high user loads
- Callbacks only update what's necessary for better performance
- Can scale to hundreds of components and callbacks
- Proven WSGI design for easy infrastructure scaling
- Production-ready architecture

**Limitations:**
- Steeper learning curve
- More verbose code compared to Streamlit
- Requires more setup for basic applications

**Geospatial Integration:**
- Robust choropleth map support via `px.choropleth` and `go.Choropleth`
- Built-in geometries for US states and world countries
- Support for custom GeoJSON files
- Advanced map customization options

**Best For:** Production dashboards, enterprise applications, complex multi-user systems

**Resources:**
- [Plotly Dash Official Documentation](https://dash.plotly.com/)
- [Streamlit vs Dash Framework Comparison](https://dash-resources.com/dash-plotly-vs-streamlit-what-are-the-differences/)
- [Comparing Dash, Shiny, and Streamlit](https://plotly.com/comparing-dash-shiny-streamlit/)

#### **Panel (HoloViz)**

**Alternative Framework Worth Considering:**

**Strengths:**
- Part of the HoloViz ecosystem designed for general-purpose use
- Native support for geographic data from GeoPandas, Cartopy, and Iris
- Powerful for complex scientific dashboards
- Tight integration with other HoloViz tools (HoloViews, GeoViews, Datashader)

**Resources:**
- [Panel Official Documentation](https://panel.holoviz.org/)
- [HoloViz Tutorial](https://holoviz.org/tutorial/)
- [Building Dashboards with HoloViz](https://holoviz.org/tutorial/Dashboards.html)

---

## 2. Time-Series Visualization Best Practices

### Core Design Principles

#### **The Five-Second Rule**
Your dashboard should provide relevant information in about 5 seconds. This is the amount of time users should need to find the information they're looking for.

#### **Visual Hierarchy**
- **Top:** Display most significant insights
- **Middle:** Show trends and patterns
- **Bottom:** Provide granular details

#### **Limit Clutter**
The human brain can only comprehend around 7±2 visual elements at one time. More than that creates visual noise that distracts from the dashboard's purpose.

#### **Data-Ink Ratio**
Remove unnecessary grid lines, icons, color, labels, or anything else that doesn't communicate data. Maximize the proportion of ink devoted to actual data representation.

#### **Provide Context**
Include past data for comparison - previous day, week, or longer periods via line/column charts showing how metrics track over time.

### Chart Selection for Time-Series

#### **Line Charts (Preferred for Time-Series)**
- Excel at displaying trends over time and continuous data
- Emphasize continuity making trends easier to spot
- Choose line charts over bar charts for time-series data

#### **Area Charts**
- Better for showing size instead of trend
- Stacked area charts show how shares of a metric's components change over time

#### **Bar Charts**
- Use when emphasizing discrete comparisons rather than continuous trends
- Effective for period-over-period comparisons

### Key Time-Series Visualization Guidelines

1. **One Insight Per Chart:** Each visualization should communicate one key insight; use separate visualizations for multiple insights
2. **Consistent Time Scales:** Maintain consistent time axes across related charts
3. **Highlight Anomalies:** Use color or annotations to draw attention to significant events or outliers
4. **Show Uncertainty:** When appropriate, display confidence intervals or error bands
5. **Enable Interactivity:** Allow users to zoom, pan, and select time ranges

**Resources:**
- [Time-Series Visualization Best Practices - Metabase](https://www.metabase.com/blog/how-to-visualize-time-series-data)
- [Dashboard Design Best Practices 2025 - Improvado](https://improvado.io/blog/dashboard-design-guide)
- [5 Dashboard Design Best Practices - InfluxData](https://www.influxdata.com/blog/5-dashboard-design-best-practices/)
- [Dashboard Design Principles - Sisense](https://www.sisense.com/blog/4-design-principles-creating-better-dashboards/)

---

## 3. Data Format Recommendations for Web Dashboards

### Format Comparison Matrix

| Format | Use Case | Strengths | Limitations |
|--------|----------|-----------|-------------|
| **GeoParquet** | Analytical dashboards, large datasets | 10-100x faster reads, 2-5x smaller storage, columnar efficiency | Slower writes, not ideal for real-time updates |
| **GeoJSON** | Web integration, small datasets, real-time | Easy web integration, flexible, human-readable | Large file sizes, no compression, slower processing |
| **Parquet** | Time-series analytics, BI tools | Excellent compression, fast queries, columnar | Write bottleneck for streaming |
| **JSON** | Real-time streaming, small incremental writes | Fast writes, flexible schema | Inefficient for analytics |

### GeoParquet Best Practices

#### **When to Use GeoParquet**
- Massive dashboards or BI reports
- Large-scale spatial analytics
- Cloud-based data platforms (Athena, BigQuery)
- Applications where query performance is critical

#### **Performance Benefits**
- Databricks benchmarks: 10x to 100x faster reads than row-based formats
- Storage: 2x to 5x smaller than JSON or CSV
- BI tools (Tableau, Apache Superset, Power BI) query efficiently through engines like Trino
- Substantially smaller files due to default compression

#### **Reading and Writing (GeoPandas)**

```python
import geopandas as gpd

# FAST: Use read_parquet/to_parquet
gdf = gpd.read_parquet("data.parquet")
gdf.to_parquet("output.parquet", compression='snappy')

# SLOW: Don't use read_file/to_file for Parquet
# gdf = gpd.read_file("data.parquet")  # AVOID
```

**Compression Options:**
- Default: `'snappy'` (balanced speed/compression)
- Other options: `'gzip'`, `'brotli'`, `'lz4'`, `'zstd'`, or `None`

#### **Optimization Techniques**

**Column Selection:**
```python
# Only read needed columns (takes advantage of columnar format)
gdf = gpd.read_parquet("data.parquet", columns=['geometry', 'population', 'year'])
```

**Partitioning:**
- Partition data files based on frequently queried attributes
- Example: partition by date for time-series queries
- Cluster data within partitions around frequently accessed columns

**Alternative Reading Methods:**
```python
# GDAL Arrow API (equally fast)
gdf = gpd.read_file("file.parquet", engine="pyogrio", use_arrow=True)
```

#### **Best Practices for Data Storage**
- Store only geometries with the same type (allows readers to know geometry type without scanning entire file)
- When writing multiple files, store a top-level `_metadata` file so Parquet readers can read just metadata and then relevant chunks
- Use min/max statistics per column chunk for predicate pushdown
- Enable automatic schema inference

#### **When NOT to Use GeoParquet**
- Real-time ingestion or streaming logs
- Small incremental writes
- Write-heavy interactions (use row-based formats instead)
- Applications requiring constant data updates

### GeoJSON Best Practices

#### **When to Use GeoJSON**
- Small to medium datasets
- Web applications requiring simple integration
- Real-time or frequently updated data
- When human readability is important

#### **Optimization for Web:**
- Simplify geometries to reduce file size
- Use TopoJSON for reduced redundancy in shared boundaries
- Implement server-side filtering to reduce client-side data
- Consider streaming or chunking large GeoJSON files

### Dashboard Format Strategy

**Recommended Approach:**
1. **Backend Storage:** GeoParquet for large datasets, historical data
2. **API Layer:** Convert to GeoJSON for web delivery (only requested portions)
3. **Client Cache:** Small GeoJSON chunks with aggressive caching
4. **Real-time Updates:** JSON/GeoJSON for live data streams

**Resources:**
- [GeoParquet Official Site](https://geoparquet.org/)
- [GeoParquet Specification - GitHub](https://github.com/opengeospatial/geoparquet)
- [Performance Explorations of GeoParquet - Medium](https://medium.com/radiant-earth-insights/performance-explorations-of-geoparquet-and-duckdb-84c0185ed399)
- [GeoJSON vs GeoParquet in AgTech](https://lhzsantana.medium.com/geojson-or-geoparquet-the-right-format-for-geospatial-data-in-agtech-71f524027711)
- [Cloud-Optimized Geospatial Formats Guide](https://guide.cloudnativegeo.org/geoparquet/)
- [GeoPandas Parquet Documentation](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.to_parquet.html)
- [Parquet vs JSON Comparison](https://weber-stephen.medium.com/csv-vs-parquet-vs-json-for-data-science-cf3733175176)

---

## 4. Python-Based Solutions for GeoPandas/PySAL Integration

### Geospatial Python Library Ecosystem

#### **Core Data Processing Libraries**

**GeoPandas** - Foundation for geospatial data
- Implements GeoSeries and GeoDataFrame structures
- Enables spatial operations: merging, grouping, spatial joining
- Seamlessly integrates with NumPy and Pandas
- Essential for reading/writing GeoParquet

**PySAL** - Spatial Analysis Library
- Comprehensive spatial statistics toolkit
- Global autocorrelation (Moran's I)
- Local autocorrelation (LISA)
- Spatial weights matrices
- Advanced spatial econometrics

**Supporting Libraries:**
- **Shapely:** Geometric operations and manipulations
- **Fiona:** Reading/writing vector data
- **PyOGRIO:** Fast vector data I/O
- **Rasterio:** Raster data processing
- **xarray + rioxarray:** N-dimensional spatial arrays

#### **Visualization Libraries for Dashboards**

**Folium**
- Leverages Leaflet.js for interactive geo plots
- Interactive maps with pop-ups, choropleths, markers
- Generates HTML files with excellent interactivity
- Ideal for dashboard embedding

**Leafmap**
- Centralizes visualization, geocoding, analysis packages
- Add data from multiple sources (local, cloud, PostGIS, OSM)
- Fully featured tools for raster visualization
- Modern alternative to Folium

**Plotly (px.choropleth, go.Choropleth)**
- Rich interactive choropleth maps
- Tight integration with Dash framework
- Supports custom GeoJSON and built-in geometries
- Highly customizable styling

**PyDeck (for Streamlit)**
- 3D geospatial visualizations
- WebGL-powered rendering
- Multiple layer types (HexagonLayer, ScatterplotLayer, etc.)
- Customizable map styles and tooltips

**CARTOframes**
- Advanced dashboard capabilities
- Interactive, static, and series maps
- Filters, widgets, animations, pop-ups, legends
- Designed for data science workflows

**Geoplot**
- Statistical geospatial plotting
- Works well with GeoPandas
- Cartographic projections

**splot (PySAL visualization)**
- Statistical visualizations for spatial analysis
- Moran scatterplots and cluster maps
- LISA cluster visualization
- Integration with matplotlib

### Integration Patterns

#### **Streamlit + GeoPandas + Folium**

```python
import streamlit as st
import geopandas as gpd
import folium
from streamlit_folium import st_folium

@st.cache_data
def load_geodata():
    return gpd.read_parquet("spatial_data.parquet")

gdf = load_geodata()

# Create Folium map
m = folium.Map(location=[lat, lon], zoom_start=10)
folium.Choropleth(
    geo_data=gdf,
    data=gdf,
    columns=['id', 'value'],
    key_on='feature.id',
    fill_color='YlOrRd'
).add_to(m)

# Display in Streamlit
st_folium(m, width=700, height=500)
```

**Resources:**
- [streamlit-folium GitHub](https://github.com/randyzwitch/streamlit-folium)
- [streamlit-folium Documentation](https://folium.streamlit.app/)

#### **Streamlit + GeoPandas + PyDeck**

```python
import streamlit as st
import geopandas as gpd
import pydeck as pdk

@st.cache_data
def load_data():
    gdf = gpd.read_parquet("data.parquet")
    # Reproject to WGS84 for web display
    return gdf.to_crs(epsg=4326)

gdf = load_data()

# Create PyDeck layer
layer = pdk.Layer(
    'HexagonLayer',
    data=gdf,
    get_position=['longitude', 'latitude'],
    get_elevation='value',
    elevation_scale=50,
    radius=100,
    pickable=True
)

view_state = pdk.ViewState(
    latitude=gdf.geometry.y.mean(),
    longitude=gdf.geometry.x.mean(),
    zoom=10,
    pitch=45
)

st.pydeck_chart(pdk.Deck(layers=[layer], initial_view_state=view_state))
```

**Important:** Define `id` in `pydeck.Layer` to ensure statefulness with selections.

**Resources:**
- [Streamlit PyDeck Documentation](https://docs.streamlit.io/develop/api-reference/charts/st.pydeck_chart)
- [3D Geospatial Dashboard Tutorial](https://medium.com/@agiraldoal/how-to-create-a-3d-geospatial-dashboard-with-python-streamlit-and-pydeck-c1f2cc3c2cf4)

#### **Plotly Dash + GeoPandas + Plotly**

```python
import dash
from dash import dcc, html
import plotly.express as px
import geopandas as gpd

app = dash.Dash(__name__)

# Load data
gdf = gpd.read_parquet("data.parquet")

# Create choropleth
fig = px.choropleth(
    gdf,
    geojson=gdf.geometry,
    locations=gdf.index,
    color='value',
    color_continuous_scale='Viridis'
)

app.layout = html.Div([
    dcc.Graph(figure=fig)
])

if __name__ == '__main__':
    app.run_server(debug=True)
```

**Resources:**
- [Plotly Choropleth Maps Documentation](https://plotly.com/python/choropleth-maps/)
- [Plotly Express Choropleth API](https://plotly.github.io/plotly.py-docs/generated/plotly.express.choropleth.html)
- [Geospatial Dash Examples](https://plotly.com/examples/geospatial/)

#### **PySAL Spatial Autocorrelation Visualization**

```python
import geopandas as gpd
from libpysal import weights
from esda.moran import Moran, Moran_Local
import matplotlib.pyplot as plt
from splot.esda import moran_scatterplot, lisa_cluster

# Load data
gdf = gpd.read_parquet("spatial_data.parquet")

# Create spatial weights
w = weights.Queen.from_dataframe(gdf)
w.transform = 'r'

# Global Moran's I
moran = Moran(gdf['value'], w)

# Moran scatterplot
fig, ax = plt.subplots(figsize=(10, 6))
moran_scatterplot(moran, ax=ax)
plt.title(f"Moran's I = {moran.I:.3f}, p-value = {moran.p_sim:.3f}")

# Local Moran (LISA)
lisa = Moran_Local(gdf['value'], w)

# LISA cluster map
fig, ax = plt.subplots(figsize=(12, 8))
lisa_cluster(lisa, gdf, ax=ax)
plt.title("LISA Cluster Map")
```

**Integration with Dash/Streamlit:**
- Save matplotlib figures and display via `st.pyplot()` (Streamlit) or `dcc.Graph()` with `fig` (Dash)
- Convert to Plotly figures for better interactivity

**Resources:**
- [PySAL GitHub](https://github.com/pysal/pysal)
- [splot GitHub](https://github.com/pysal/splot)
- [PySAL Moran's Visualization Tutorial](https://pysal.org/notebooks/viz/splot/esda_morans_viz.html)
- [Geographic Data Science - Local Autocorrelation](https://geographicdata.science/book/notebooks/07_local_autocorrelation.html)
- [Spatial Data Science Tutorial - LISA](https://github.com/jlpalomino/spatial-data-science-with-open-source-python-tutorial)

### Coordinate Reference System (CRS) Considerations

**Critical for Web Mapping:**
Always reproject GeoDataFrames to WGS84 (EPSG:4326) for web visualization:

```python
# Reproject to WGS84
gdf = gdf.to_crs(epsg=4326)

# Or using pyproj
import pyproj
gdf.to_crs(pyproj.CRS.from_epsg(4326), inplace=True)
```

### Memory and Performance Optimization

**Streamlit Caching:**

```python
import streamlit as st

# Cache data loading
@st.cache_data
def load_geodata(filepath):
    return gpd.read_parquet(filepath)

# Cache global resources (e.g., ML models, connections)
@st.cache_resource
def load_model():
    return trained_model

# For VERY large datasets (>100M rows)
@st.cache_resource  # Avoid serialization overhead
def load_huge_geodata(filepath):
    return gpd.read_parquet(filepath)
```

**Key Differences:**
- **`st.cache_data`:** Creates copy via serialization; safe against mutations
- **`st.cache_resource`:** Stores object directly; faster for huge data but requires careful mutation handling
- **TTL:** Add `ttl=60` (seconds) for time-series data that updates periodically

**Resources:**
- [Streamlit Caching Overview](https://docs.streamlit.io/develop/concepts/architecture/caching)
- [st.cache_data Documentation](https://docs.streamlit.io/develop/api-reference/caching-and-state/st.cache_data)
- [st.cache_resource Documentation](https://docs.streamlit.io/develop/api-reference/caching-and-state/st.cache_resource)

**Dash Caching:**
Use Flask-Caching for Dash applications to cache expensive computations.

**General Performance Tips:**
1. Use GeoParquet for large datasets
2. Implement column selection (read only needed columns)
3. Partition data by frequently queried attributes
4. Aggregate data before visualization when appropriate
5. Use data sampling for exploratory dashboards
6. Implement lazy loading for large datasets
7. Consider Datashader for massive point datasets

---

## 5. Additional Resources and Tools

### Python Geospatial Resources

**Comprehensive Guides:**
- [75+ Geospatial Python Resources - Matt Forrest](https://forrest.nyc/75-geospatial-python-and-spatial-data-science-resources-and-guides/)
- [12 Python Libraries for Geospatial Data Analysis - Geoapify](https://www.geoapify.com/python-geospatial-data-analysis/)
- [Python Foundation for Spatial Analysis - Spatial Thoughts](https://courses.spatialthoughts.com/python-foundation.html)

### Dashboard Design Resources

**Best Practices Guides:**
- [Dashboard Design Best Practices - Toptal](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [Effective Dashboard Design - Geckoboard](https://www.geckoboard.com/best-practice/dashboard-design/)
- [10 Key Dashboard Design Principles - Yellowfin](https://www.yellowfinbi.com/blog/key-dashboard-design-principles-analytics-best-practice)

### Interactive Dashboard Examples

**Example Repositories:**
- [GeostatsGuy/DataScienceInteractivePython - GitHub](https://github.com/GeostatsGuy/DataScienceInteractivePython)
- [Interactive Dashboards with Python Tutorial](https://jkropko.github.io/surfing-the-data-pipeline/ch12.html)

### Time-Series Database Optimization

**Caching Strategies:**
- [Time Series Caching with Python and Redis](https://roman.pt/posts/time-series-caching/)
- [TSDB Performance Techniques - VictoriaMetrics](https://victoriametrics.com/blog/tsdb-performance-techniques-functions-caching/index.html)
- [Dataset Optimization and Caching - Databricks](https://docs.databricks.com/aws/en/dashboards/caching)

---

## 6. Recommended Technology Stack

### For Rapid Prototyping (Academic/Research)
```
Data Layer:     GeoParquet (storage) → GeoPandas (processing)
Analysis:       PySAL (spatial stats) + NumPy/Pandas
Visualization:  Plotly + Folium
Framework:      Streamlit
Caching:        @st.cache_data with TTL
Deployment:     Streamlit Community Cloud
```

### For Production Dashboards (Enterprise)
```
Data Layer:     GeoParquet/PostGIS → GeoPandas/SQLAlchemy
Analysis:       PySAL + Dask (for large datasets)
Visualization:  Plotly (choropleth, time-series)
Framework:      Plotly Dash
Caching:        Flask-Caching + Redis
Deployment:     Docker + Kubernetes / Dash Enterprise
```

### For Complex Scientific Dashboards
```
Data Layer:     GeoParquet + Zarr (raster) → GeoPandas + xarray
Analysis:       PySAL + SciPy + scikit-learn
Visualization:  HoloViz (Panel + GeoViews + Datashader)
Framework:      Panel
Caching:        Custom caching strategies
Deployment:     JupyterHub / Custom server
```

---

## 7. Implementation Checklist

### Data Preparation
- [ ] Convert large spatial datasets to GeoParquet
- [ ] Ensure data is in WGS84 (EPSG:4326) for web display
- [ ] Partition data by time or region for faster queries
- [ ] Implement column selection to read only needed fields
- [ ] Create spatial weights matrices for PySAL analysis

### Dashboard Design
- [ ] Follow the five-second rule for information access
- [ ] Establish clear visual hierarchy (top: insights, middle: trends, bottom: details)
- [ ] Limit visualizations to 5-9 key elements
- [ ] Maximize data-ink ratio (remove non-essential elements)
- [ ] Provide temporal context (previous periods, trends)

### Performance Optimization
- [ ] Implement appropriate caching strategy (`st.cache_data` or Flask-Caching)
- [ ] Use TTL for time-series data that updates periodically
- [ ] Optimize data loading (read only needed columns/rows)
- [ ] Consider data aggregation for large datasets
- [ ] Test performance with realistic data volumes

### Visualization Best Practices
- [ ] Use line charts for time-series trends
- [ ] Implement interactive filtering (time range selectors)
- [ ] Add tooltips and hover information
- [ ] Enable zoom/pan for spatial exploration
- [ ] Provide download options for data/visualizations

### Spatial Analysis Integration
- [ ] Calculate spatial weights matrices appropriate for data
- [ ] Implement global spatial autocorrelation (Moran's I)
- [ ] Visualize local spatial autocorrelation (LISA clusters)
- [ ] Add Moran scatterplots for statistical interpretation
- [ ] Provide statistical summaries and p-values

### Testing and Deployment
- [ ] Test with multiple users/sessions
- [ ] Verify performance under load
- [ ] Implement error handling and logging
- [ ] Document data sources and methodologies
- [ ] Set up monitoring and analytics

---

## 8. Common Pitfalls to Avoid

1. **Using wrong file format:** Don't use GeoJSON for large datasets; use GeoParquet
2. **Forgetting CRS transformation:** Always reproject to EPSG:4326 for web maps
3. **Not implementing caching:** Streamlit/Dash without caching will be slow
4. **Over-engineering prototypes:** Start simple with Streamlit before investing in Dash
5. **Ignoring the five-second rule:** Too many metrics = cognitive overload
6. **Using bar charts for time-series:** Line charts better show temporal trends
7. **Not partitioning data:** Large datasets need partitioning for performance
8. **Mutation in cached resources:** Be careful with `st.cache_resource` mutations
9. **Serialization bottlenecks:** For >100M rows, use `st.cache_resource` instead of `st.cache_data`
10. **Not testing with real data volumes:** Performance characteristics change drastically with scale

---

## Sources

### Framework Comparisons
- [Streamlit vs Dash 2025 - Kanaries](https://docs.kanaries.net/topics/Streamlit/streamlit-vs-dash)
- [Streamlit vs Plotly Dash - vizGPT](https://vizgpt.ai/docs/blog/streamlit-vs-plotly-dash---which-is-better-for-building-data-apps)
- [Streamlit vs Dash - UI Bakery](https://uibakery.io/blog/streamlit-vs-dash)
- [Dash vs Streamlit Differences](https://dash-resources.com/dash-plotly-vs-streamlit-what-are-the-differences/)
- [Streamlit vs Dash 2025 - Squadbase](https://www.squadbase.dev/en/blog/streamlit-vs-dash-in-2025-comparing-data-app-frameworks)
- [Comparing Dash, Shiny, Streamlit - Plotly](https://plotly.com/comparing-dash-shiny-streamlit/)

### Visualization Best Practices
- [How to Visualize Time-Series Data - Metabase](https://www.metabase.com/blog/how-to-visualize-time-series-data)
- [Dashboard Design Guide 2025 - Improvado](https://improvado.io/blog/dashboard-design-guide)
- [5 Dashboard Design Best Practices - InfluxData](https://www.influxdata.com/blog/5-dashboard-design-best-practices/)
- [Effective Dashboard Design - Geckoboard](https://www.geckoboard.com/best-practice/dashboard-design/)
- [4 Design Principles - Sisense](https://www.sisense.com/blog/4-design-principles-creating-better-dashboards/)
- [Dashboard Design Best Practices - Toptal](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)

### Data Formats
- [Parquet Data Format 2025 - EdgeDelta](https://edgedelta.com/company/blog/parquet-data-format)
- [GeoParquet Official Site](https://geoparquet.org/)
- [GeoJSON vs GeoParquet - Medium](https://lhzsantana.medium.com/geojson-or-geoparquet-the-right-format-for-geospatial-data-in-agtech-71f524027711)
- [Introducing GeoParquet - GetInData](https://getindata.com/blog/introducing-geoparquet-data-format/)
- [Performance Explorations of GeoParquet - Medium](https://medium.com/radiant-earth-insights/performance-explorations-of-geoparquet-and-duckdb-84c0185ed399)
- [GeoParquet Format Specs - GitHub](https://github.com/opengeospatial/geoparquet/blob/main/format-specs/geoparquet.md)
- [CSV vs Parquet vs JSON - Medium](https://weber-stephen.medium.com/csv-vs-parquet-vs-json-for-data-science-cf3733175176)

### GeoPandas/PySAL Integration
- [Streamlit, Pandas, Plotly Integration - KDnuggets](https://www.kdnuggets.com/how-to-combine-streamlit-pandas-and-plotly-for-interactive-data-apps)
- [12 Python Geospatial Libraries - Geoapify](https://www.geoapify.com/python-geospatial-data-analysis/)
- [3D Geospatial Dashboard Tutorial - Medium](https://medium.com/@agiraldoal/how-to-create-a-3d-geospatial-dashboard-with-python-streamlit-and-pydeck-c1f2cc3c2cf4)
- [GeoPandas and Plotly - Medium](https://medium.com/@sukantkhurana/analyzing-geospatial-data-with-geopandas-and-plotly-b13dedcbe466)
- [Plotting GeoPandas with Plotly - Stack Overflow](https://stackoverflow.com/questions/65507374/plotting-a-geopandas-dataframe-using-plotly)

### Streamlit Specific
- [streamlit-folium GitHub](https://github.com/randyzwitch/streamlit-folium)
- [streamlit-folium Documentation](https://folium.streamlit.app/)
- [st.pydeck_chart - Streamlit Docs](https://docs.streamlit.io/develop/api-reference/charts/st.pydeck_chart)
- [Streamlit Maps - Kanaries](https://docs.kanaries.net/topics/Streamlit/streamlit-map)
- [Displaying Maps with Streamlit](https://www.pybeginners.com/python-streamlit/displaying-maps-with-streamlit/)
- [Caching Overview - Streamlit](https://docs.streamlit.io/develop/concepts/architecture/caching)
- [st.cache_data - Streamlit](https://docs.streamlit.io/develop/api-reference/caching-and-state/st.cache_data)
- [st.cache_resource - Streamlit](https://docs.streamlit.io/develop/api-reference/caching-and-state/st.cache_resource)

### Plotly Dash Specific
- [Choropleth Maps in Python - Plotly](https://plotly.com/python/choropleth-maps/)
- [plotly.express.choropleth API](https://plotly.github.io/plotly.py-docs/generated/plotly.express.choropleth.html)
- [Geospatial Dash Examples - Plotly](https://plotly.com/examples/geospatial/)
- [Tile Choropleth Maps - Plotly](https://plotly.com/python/tile-county-choropleth/)

### HoloViz/Panel
- [Panel GitHub](https://github.com/holoviz/panel)
- [HoloViz Dashboards Tutorial](https://holoviz.org/tutorial/Dashboards.html)
- [Panel Overview](https://panel.holoviz.org/)
- [HoloViz Tutorial](https://holoviz.org/tutorial/)

### PySAL Resources
- [PySAL GitHub](https://github.com/pysal/pysal)
- [splot GitHub](https://github.com/pysal/splot)
- [PySAL Moran's Visualization](https://pysal.org/notebooks/viz/splot/esda_morans_viz.html)
- [Local Autocorrelation - Geographic Data Science](https://geographicdata.science/book/notebooks/07_local_autocorrelation.html)
- [Spatial Data Science Tutorial - LISA](https://github.com/jlpalomino/spatial-data-science-with-open-source-python-tutorial)

### Performance and Caching
- [Dataset Caching - Databricks](https://docs.databricks.com/aws/en/dashboards/caching)
- [Time Series Caching with Redis](https://roman.pt/posts/time-series-caching/)
- [TSDB Performance Techniques](https://victoriametrics.com/blog/tsdb-performance-techniques-functions-caching/index.html)
- [Query Caching in Grafana](https://grafana.com/blog/2021/09/02/reduce-costs-and-increase-performance-with-query-caching-in-grafana-cloud/)

### GeoParquet Resources
- [GeoPandas to_parquet Documentation](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.to_parquet.html)
- [GeoPandas read_parquet Documentation](https://geopandas.org/en/stable/docs/reference/api/geopandas.read_parquet.html)
- [Cloud-Optimized Geospatial Formats Guide](https://guide.cloudnativegeo.org/geoparquet/)
- [GeoParquet Example Tutorial](https://guide.cloudnativegeo.org/geoparquet/geoparquet-example.html)

### General Resources
- [75+ Geospatial Python Resources](https://forrest.nyc/75-geospatial-python-and-spatial-data-science-resources-and-guides/)
- [Python Mapping Libraries - Hex](https://hex.tech/templates/data-visualization/python-mapping-libraries/)
- [Interactive Dashboards Tutorial](https://jkropko.github.io/surfing-the-data-pipeline/ch12.html)
- [GeostatsGuy Interactive Python - GitHub](https://github.com/GeostatsGuy/DataScienceInteractivePython)
