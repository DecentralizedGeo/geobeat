# Visualization Frameworks Research

Research documentation for visualization frameworks suitable for geospatial time-series data analysis.

---

## 1. Plotly Dash - Python Web Dashboards

### Overview
Plotly Dash is a Python framework for building analytical web applications with no JavaScript required. Built on top of Plotly.js, React, and Flask, it ties modern UI elements directly to analytical Python code.

### Version & Installation
```bash
pip install dash
# Requires Dash 2.17.0 or later for latest features
```

### Getting Started Resources

**Official Documentation:**
- Main Hub: https://dash.plotly.com/
- Minimal App Tutorial: https://dash.plotly.com/minimal-app
- Dash in 20 Minutes: https://dash.plotly.com/tutorial
- Layout Guide: https://dash.plotly.com/layout
- Plotly Python: https://plotly.com/python/getting-started/

**GitHub:**
- Main Repository: https://github.com/plotly/dash
- Awesome Dash (curated examples): https://github.com/ucg8j/awesome-dash

### Time Series Examples

**Official Examples:**
- Time Series Documentation: https://plotly.com/python/time-series/
- Interactive Graphing: https://dash.plotly.com/interactive-graphing
- Dashboard Examples: https://plotly.com/examples/dashboards/

**Key Features:**
- World indicators example with interactive time series updates
- Climate data visualization with heatmaps and maps
- Live Wind Streaming dashboard (queries SQL database continuously)
- Oil and Gas Explorer (production over time)

**Example Code Structure:**
```python
import dash
from dash import dcc, html
import plotly.graph_objs as go
import pandas as pd

app = dash.Dash(__name__)

# Time series can be created from various sources
# df = pd.read_json('data.json')
# df = pd.read_csv('https://plotly.github.io/datasets/country_indicators.csv')

app.layout = html.Div([
    dcc.Graph(
        id='time-series-graph',
        figure={
            'data': [
                go.Scatter(
                    x=df['date'],
                    y=df['value'],
                    mode='lines+markers'
                )
            ],
            'layout': go.Layout(
                title='Time Series Data',
                xaxis={'title': 'Date'},
                yaxis={'title': 'Value'}
            )
        }
    )
])

if __name__ == '__main__':
    app.run(debug=True)
```

**Date Formatting:**
- Supports custom tick labels and date formatting
- `ticklabelmode="period"` moves labels to middle of period
- Automatic handling of datetime objects from pandas

### JSON Data Integration

**Loading JSON Data:**
```python
import json
import pandas as pd
from dash import dcc

# Method 1: Using pandas
df = pd.read_json('data.json')

# Method 2: Direct JSON loading
with open('data.json') as f:
    data = json.load(f)
    df = pd.DataFrame(data)

# Method 3: From URL
df = pd.read_json('https://api.example.com/data.json')
```

**Interactive Data Display:**
- `dcc.Graph` component has interactive attributes: `hoverData`, `clickData`, `selectedData`, `relayoutData`
- Data can be displayed as JSON using `json.dumps()`
- Layout parameter accepts JSON array for graph customization

**Large Time Series:**
- plotly-resampler library for visualizing large time series datasets
- Documentation: https://community.plotly.com/t/plotly-resampler-visualize-large-time-series-using-plotly-dash/59097

### Deployment Considerations

**Deployment Documentation:**
- Official Guide: https://dash.plotly.com/deployment
- AWS Integration: https://plotly.com/dash/aws/

**Deployment Options:**

1. **Heroku:**
   - Simple deployment for beginners
   - Supports Docker containers
   - Note: Free tier no longer available
   - Guide: https://towardsdatascience.com/deploy-containerized-plotly-dash-app-to-heroku-with-ci-cd-f82ca833375c

2. **AWS EC2:**
   - Simpler than other cloud providers for Dash
   - Works with EKS, RDS, Aurora, Redshift, S3
   - Tutorial: https://medium.com/@GeoffreyGordonAshbrook/plotly-dash-in-ec2-production-server-502717843efb

3. **Docker Containerization:**
   - Create Dockerfile in project folder
   - Works with any cloud provider (AWS, GCP, Azure)
   - CI/CD with GitHub Actions
   - Framework-agnostic deployment

4. **Dash Enterprise (Paid):**
   - Can be installed on AWS, Azure, or Google Cloud
   - Documentation: https://dash.plotly.com/dash-enterprise/getting-started

**Production Checklist:**
- Set `debug=False` for production
- Use production-grade WSGI server (Gunicorn, uWSGI)
- Configure environment variables for secrets
- Implement proper error handling
- Add authentication if needed
- Enable HTTPS/SSL

**Docker Example:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:8050", "app:server"]
```

---

## 2. Streamlit - Rapid Prototyping

### Overview
Streamlit is an open-source Python framework for building data apps with a magically simple API. Apps automatically update as you save source files, making it ideal for rapid prototyping.

### Version & Installation
```bash
pip install streamlit
# Supports Python 3.9, 3.10, 3.11, 3.12, 3.13
```

### Getting Started Resources

**Official Documentation:**
- Main Hub: https://docs.streamlit.io/
- Get Started: https://docs.streamlit.io/get-started
- Tutorials: https://docs.streamlit.io/get-started/tutorials
- Create an App: https://docs.streamlit.io/get-started/tutorials/create-an-app
- Basic Concepts: https://docs.streamlit.io/get-started/fundamentals/main-concepts

**Key Features:**
- Hot-reload during development
- Simple API with `st.write()` as "Swiss Army knife"
- Supports text, data, Matplotlib, Altair, Plotly charts, and more
- Multi-page application support

**Quick Start Example:**
```python
import streamlit as st
import pandas as pd
import numpy as np

st.title('My First Streamlit App')

# Display data
df = pd.DataFrame({
    'first column': [1, 2, 3, 4],
    'second column': [10, 20, 30, 40]
})

st.write(df)

# Simple chart
chart_data = pd.DataFrame(
    np.random.randn(20, 3),
    columns=['a', 'b', 'c'])

st.line_chart(chart_data)
```

### Time Series Examples

**Chart Documentation:**
- Chart Elements: https://docs.streamlit.io/develop/api-reference/charts
- Data Elements: https://docs.streamlit.io/develop/api-reference/data

**Official Time Series Example:**
- Time Series Annotation App: https://example-time-series-annotation.streamlit.app/
- GitHub: https://github.com/streamlit/example-app-time-series-annotation
- Uses Altair charts with pandas DataFrames
- Demonstrates stock price evolution visualization

**Chart Options:**
```python
import streamlit as st
import pandas as pd

# Line charts for time series
df = pd.DataFrame({
    'time': pd.date_range('2023-01-01', periods=100),
    'value': np.random.randn(100).cumsum()
})

st.line_chart(df.set_index('time'))

# Using Plotly for more control
import plotly.express as px

fig = px.line(df, x='time', y='value', title='Time Series')
st.plotly_chart(fig)

# Using plost library (simple API)
import plost
plost.line_chart(
    df,
    x='time',
    y='value',
    height=400
)
```

**ECharts Integration:**
- streamlit-echarts: https://github.com/andfanilo/streamlit-echarts
- Supports JSON-based chart definitions
- GeoJSON data loading with `json.loads`

### JSON Data Integration

**Loading and Displaying JSON:**
```python
import streamlit as st
import json
import pandas as pd

# Method 1: Load and display as JSON
with open('data.json') as f:
    data = json.load(f)
    st.json(data)  # Pretty-printed JSON display

# Method 2: Convert to DataFrame
df = pd.DataFrame(data)
st.dataframe(df)

# Method 3: ECharts with JSON options
from streamlit_echarts import st_echarts

options = {
    "xAxis": {
        "type": "category",
        "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    "yAxis": {"type": "value"},
    "series": [{
        "data": [820, 932, 901, 934, 1290, 1330, 1320],
        "type": "line"
    }]
}

st_echarts(options=options)
```

**Sample Projects:**
- PIE Chart from external JSON: https://github.com/app-generator/sample-streamlit

### Geospatial Integration

**Geospatial Documentation:**
- st.map: https://docs.streamlit.io/develop/api-reference/charts/st.map
- Kanaries Map Guide: https://docs.kanaries.net/topics/Streamlit/streamlit-map

**GitHub Examples:**
- streamlit-geospatial: https://github.com/opengeos/streamlit-geospatial
  - Multi-page app with satellite timelapse animations
  - Demonstrates urban growth, coastal erosion, volcanic eruptions
  - Deployable to Streamlit Cloud, Heroku, MyBinder

- geodata-visualization: https://github.com/persiyanov/streamlit-geodata-visualization
  - Mapbox integration for geocoding

- Earthquake visualization: https://medium.com/data-science-collective/dead-simple-stunning-earthquake-maps-using-streamlit-and-geopandas-8ddd73215b16

**Map Visualization:**
```python
import streamlit as st
import pandas as pd

# Simple map
df = pd.DataFrame({
    'lat': [37.76, 37.77, 37.78],
    'lon': [-122.4, -122.41, -122.42]
})

st.map(df)

# Using Folium
import folium
from streamlit_folium import folium_static

m = folium.Map(location=[45.5236, -122.6750])
folium_static(m)

# Using PyDeck (built on deck.gl)
import pydeck as pdk

layer = pdk.Layer(
    'ScatterplotLayer',
    data=df,
    get_position='[lon, lat]',
    get_radius=100,
)

st.pydeck_chart(pdk.Deck(layers=[layer]))
```

### Deployment Considerations

**Deployment Documentation:**
- Deployment Tutorials: https://docs.streamlit.io/deploy/tutorials
- Docker Deployment: https://docs.streamlit.io/deploy/tutorials/docker
- Kubernetes: https://docs.streamlit.io/deploy/tutorials/kubernetes

**Deployment Options:**

1. **Streamlit Community Cloud:**
   - Fastest deployment path
   - Free tier available
   - Direct GitHub integration
   - Best for quick prototypes

2. **Docker:**
   - Official guide: https://docs.streamlit.io/deploy/tutorials/docker
   - Example Dockerfile:
   ```dockerfile
   FROM python:3.9-slim

   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt

   COPY . .

   EXPOSE 8501

   CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
   ```

3. **Google Cloud Platform:**
   - Cloud Run deployment: https://medium.com/@gabya06/a-step-by-step-deployment-guide-streamlit-docker-and-google-cloud-fc4e62c92e3e
   - Kubernetes with GKE: https://www.analyticsvidhya.com/blog/2023/02/build-and-deploy-an-ml-model-app-using-streamlit-docker-and-gke/
   - Google Container Registry (GCR)

4. **Azure:**
   - Azure App Service with Container Registry
   - Tutorial: https://robkerr.ai/publish-streamlit-app-docker-azure-container/

5. **AWS:**
   - AWS EC2 with free tier
   - Elastic Container Service (ECS)

**Port Configuration:**
- Default Streamlit port: 8501
- Cloud Run expects: 8080
- Solution: `CMD streamlit run app.py --server.port=${PORT:-8501} --server.address=0.0.0.0`

**Base Image Recommendations:**
- `python:3.9-slim` - Lightweight, recommended
- `python:3.9` - Full image with more tools

**Deployment Comparison:**
- **Streamlit Cloud**: Quick prototypes, free tier
- **Heroku**: Production apps with custom domains (no longer free)
- **Docker**: Scalable enterprise solutions, maximum flexibility

---

## 3. Folium - Geographic Visualizations

### Overview
Folium builds on Python's data wrangling strengths and Leaflet.js mapping library. It allows you to manipulate data in Python and visualize it in interactive Leaflet maps that can be shared as websites.

### Version & Installation
```bash
pip install folium
# Latest version: 0.20.0 (released June 16, 2025)
# Requires Python >=3.9
# Supports Python 3.9, 3.10, 3.11, 3.12, 3.13
```

### Getting Started Resources

**Official Documentation:**
- Main Documentation: https://python-visualization.github.io/folium/latest/
- Getting Started: https://python-visualization.github.io/folium/latest/getting_started.html
- GitHub Repository: https://github.com/python-visualization/folium
- PyPI Package: https://pypi.org/project/folium/

**Additional Resources:**
- Real Python Tutorial: https://realpython.com/python-folium-web-maps-from-data/
- GeoPandas Integration: https://geopandas.org/en/stable/gallery/plotting_with_folium.html

**Key Features:**
- GeoJSON data visualization
- Choropleth maps (binding data between Pandas/GeoJSON)
- Various marker types with popups, tooltips, colors, icons
- Plugin system for extended functionality

**Basic Usage:**
```python
import folium

# Create a base map
m = folium.Map(location=[45.5236, -122.6750], zoom_start=13)

# Add markers
folium.Marker(
    [45.5236, -122.6750],
    popup='Portland, OR',
    tooltip='Click for more info'
).add_to(m)

# Save to HTML
m.save('map.html')

# Display in Jupyter
m
```

### Time Series Animation Examples

**TimestampedGeoJson Plugin:**
- Official Documentation: https://python-visualization.github.io/folium/latest/user_guide/plugins/timestamped_geojson.html
- Source Code: https://github.com/python-visualization/folium/blob/main/folium/plugins/timestamped_geo_json.py
- Tutorial: https://medium.com/@mcmanus_data_works/create-animated-maps-with-folium-e122b5e99afb

**Data Format Requirements:**

A GeoJSON is timestamped if:
- Contains features of types: LineString, MultiPoint, MultiLineString, Polygon, MultiPolygon
- Each feature has a 'times' property with same length as coordinates array
- Each 'times' element is a timestamp in ms since epoch or ISO string format

**Example Code:**
```python
import folium
from folium import plugins
import json

# Create base map
m = folium.Map(location=[45.5, -122.5], zoom_start=10)

# Timestamped GeoJSON data structure
features = [
    {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [-122.6750, 45.5236]
        },
        'properties': {
            'times': [1609459200000, 1609545600000],  # Unix timestamps in ms
            'icon': 'circle',
            'iconstyle': {
                'fillColor': 'blue',
                'fillOpacity': 0.6,
                'stroke': 'true',
                'radius': 5
            }
        }
    }
]

data = {
    'type': 'FeatureCollection',
    'features': features
}

# Add to map
plugins.TimestampedGeoJson(
    data,
    period='PT1H',  # ISO8601 Duration: P1M (1/month), P1D (1/day), PT1H (1/hour)
    add_last_point=True,
    auto_play=False,
    loop=False,
    max_speed=1,
    loop_button=True,
    date_options='YYYY-MM-DD HH:mm:ss',
    time_slider_drag_update=True
).add_to(m)

m.save('animated_map.html')
```

**Earthquake Visualization Examples:**
- USGS Earthquake Visualization: https://python.plainenglish.io/unveiling-earths-seismic-activity-an-interactive-earthquake-visualization-3aca65f2967d
- Plotting USGS Data: https://levelup.gitconnected.com/plotting-usgs-earthquake-data-with-folium-8f11ddc21950
- Real-time Earthquake Data: https://soumenatta.medium.com/visualizing-real-time-earthquake-data-with-folium-in-python-c7e89cd6b9f

**Period Format (ISO8601 Duration):**
- `P1M` - One month
- `P1D` - One day
- `PT1H` - One hour
- `PT30M` - 30 minutes
- `PT1S` - One second

### JSON/GeoJSON Integration

**GeoJSON Documentation:**
- Using GeoJSON: https://python-visualization.github.io/folium/latest/user_guide/geojson/geojson.html

**Loading GeoJSON:**
```python
import folium
import json

# Method 1: From file
with open('data.geojson') as f:
    geojson_data = json.load(f)

folium.GeoJson(
    geojson_data,
    name='geojson'
).add_to(m)

# Method 2: From URL
import requests
geojson_url = 'https://example.com/data.geojson'
folium.GeoJson(geojson_url).add_to(m)

# Method 3: With styling
folium.GeoJson(
    geojson_data,
    style_function=lambda feature: {
        'fillColor': 'blue',
        'color': 'black',
        'weight': 2,
        'fillOpacity': 0.5
    }
).add_to(m)

# Method 4: Choropleth with data binding
folium.Choropleth(
    geo_data=geojson_data,
    data=df,
    columns=['State', 'Unemployment'],
    key_on='feature.id',
    fill_color='YlGn',
    fill_opacity=0.7,
    line_opacity=0.2,
    legend_name='Unemployment Rate (%)'
).add_to(m)
```

**Creating GeoJSON from DataFrame:**
```python
import pandas as pd
import folium

df = pd.DataFrame({
    'latitude': [45.5, 45.6, 45.7],
    'longitude': [-122.5, -122.6, -122.7],
    'timestamp': pd.date_range('2023-01-01', periods=3),
    'value': [10, 20, 30]
})

# Convert timestamps to Unix epoch milliseconds
df['times'] = (df['timestamp'].astype(int) / 10**6).astype(int)

# Create GeoJSON
geojson = {
    'type': 'FeatureCollection',
    'features': []
}

for idx, row in df.iterrows():
    feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [row['longitude'], row['latitude']]
        },
        'properties': {
            'times': [row['times']],
            'value': row['value']
        }
    }
    geojson['features'].append(feature)
```

### Deployment Considerations

**Export to HTML:**
```python
# Method 1: Save to file
m.save('index.html')

# Method 2: Get HTML string
html_string = m._repr_html_()

# Method 3: To bytes
html_bytes = m.to_png()
```

**Deployment Options:**

1. **Static Web Hosting:**
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static file server

2. **Embedded in Web Applications:**
   ```html
   <iframe src="map.html" width="100%" height="600px"></iframe>
   ```

3. **Flask/Django Integration:**
   ```python
   from flask import Flask, render_template
   import folium

   app = Flask(__name__)

   @app.route('/')
   def index():
       m = folium.Map(location=[45.5, -122.5])
       # ... add layers ...
       return m._repr_html_()
   ```

4. **Heroku Deployment:**
   - Tutorial: https://towardsdatascience.com/your-cool-folium-maps-on-the-web-313f9d1a6bcd
   - Requires: Procfile, requirements.txt, Flask/Django app
   - Store HTML in templates folder

5. **Self-Hosted/Non-Internet Environments:**
   - folium-resource-server: https://github.com/dsaidgovsg/folium-resource-server
   - Hosts Folium JS/CSS resources locally

**Advantages:**
- Standalone HTML files (no server required)
- Lightweight (just HTML/CSS/JS)
- Works offline with local resources
- Easy to share and embed

**Considerations:**
- Large datasets increase HTML file size
- No backend processing in standalone HTML
- Use tile servers accessible to viewers
- Consider CDN for Leaflet.js resources

---

## 4. Kepler.gl - Advanced Geographic Visualizations

### Overview
Kepler.gl is a powerful open-source geospatial analysis tool for large-scale datasets. Built on MapLibre GL and deck.gl, it's a high-performance, WebGL-powered application designed for visual exploration of geolocation data.

### Version & Installation
```bash
# Python/Jupyter integration
pip install keplergl

# Node.js/React integration
npm install kepler.gl
```

### Getting Started Resources

**Official Documentation:**
- Main Website: https://kepler.gl/
- Documentation: https://docs.kepler.gl/
- User Guides: https://docs.kepler.gl/docs/user-guides
- What's New: https://docs.kepler.gl/release-notes
- GitHub Repository: https://github.com/keplergl/kepler.gl

**Jupyter Notebook Integration:**
- Jupyter Documentation: https://docs.kepler.gl/docs/keplergl-jupyter
- README: https://github.com/keplergl/kepler.gl/blob/master/bindings/kepler.gl-jupyter/README.md

### Recent Features (2025 Updates)

**January 2025:**
- Vector Tile layer for dynamic data retrieval based on viewport/zoom
- Supports Mapbox Vector Tiles and PMTiles

**August 2025:**
- Raster Tile layer for satellite/aerial imagery
- Supports PMTiles and Cloud-Optimized GeoTIFFs (STAC)
- WMS layer for OGC Web Map Service endpoints

**AI Assistant:**
- Text, voice, and screenshot-based map editing
- Natural language to SQL conversion (works with DuckDB)
- Automated filter, basemap, and layer configuration

### Time Series & Trip Visualization

**Time Playback Documentation:**
- Time Playback Guide: https://docs.kepler.gl/docs/user-guides/h-playback
- Add Data Guide: https://docs.kepler.gl/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map

**Key Features:**
- Renders millions of points representing thousands of trips
- Real-time spatial aggregations
- Timestamp-based filtering
- Animated trip visualization

**Time Format:**
- Uses Unix timestamp (milliseconds since epoch)
- For GeoJSON: property field should contain timestamp entry
- For CSV: timestamp fields like 'YYYY-M-D H:m:s'

**Trip Visualization Example:**
```python
from keplergl import KeplerGl
import pandas as pd
import json

# Prepare data
df = pd.read_csv('trip_data.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Method 1: Using DataFrame
map_1 = KeplerGl(height=600)
map_1.add_data(data=df, name='trips')
map_1

# Method 2: Using GeoJSON with timestamps
df["altitude"] = 0

geo_json = {
    "type": "FeatureCollection",
    "features": []
}

for trip_id in df.trip_id.unique():
    trip_df = df.loc[df.trip_id == trip_id]

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": trip_df[["lon", "lat", "altitude", "timestamp"]].values.tolist()
        },
        "properties": {
            "trip_id": str(trip_id)
        }
    }
    geo_json["features"].append(feature)

map_2 = KeplerGl(height=600)
map_2.add_data(data=geo_json, name='trip_geojson')
map_2
```

**Coordinate Format for Trips:**
- `[longitude, latitude, altitude, timestamp]`
- Longitude/latitude in decimal degrees
- Altitude in meters (optional, use 0 if not available)
- Timestamp in Unix epoch milliseconds

**Tutorial Resources:**
- GPS Trajectory Visualization: https://sasan.jafarnejad.io/post/kepler-gl-trip-visualization-python/
- Animated Geo-temporal Data: https://www.allthatgeo.com/tutorials-animated-geo-temporal-data-visualisation-kepler-gl/
- Python Geo Data Visualization: https://betterprogramming.pub/geo-data-visualization-with-kepler-gl-fbc15debbca4

### JSON Data Integration

**Supported Data Formats:**
- CSV
- GeoJSON
- Pandas DataFrame
- GeoPandas GeoDataFrame

**Adding Data in Python:**
```python
from keplergl import KeplerGl
import json

# Method 1: From GeoJSON file
with open('data.geojson') as f:
    geojson_data = json.load(f)

map = KeplerGl(height=600)
map.add_data(data=geojson_data, name='geojson_layer')

# Method 2: From GeoJSON string
geojson_string = json.dumps(geojson_data)
map.add_data(data=geojson_string, name='geojson_layer')

# Method 3: From CSV string
csv_string = df.to_csv(index=False)
map.add_data(data=csv_string, name='csv_layer')

# Method 4: Direct DataFrame
map.add_data(data=df, name='dataframe_layer')

# Display in Jupyter
map
```

**Sample Data:**
- Official samples: https://github.com/uber-web/kepler.gl-data/blob/master/samples.json

**Configuration:**
```python
# Save configuration
config = map.config

# Apply saved configuration
map_2 = KeplerGl(height=600, config=config)
map_2.add_data(data=df, name='trips')
```

### Deployment Considerations

**Save and Export Documentation:**
- Save/Export Guide: https://docs.kepler.gl/docs/user-guides/k-save-and-export
- GitHub Documentation: https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/k-save-and-export.md

**Export Options:**

1. **HTML Export:**
   ```python
   # In Jupyter, click "Export Map" > "Export" in the UI
   # Or programmatically:
   map.save_to_html(file_name='kepler_map.html')
   ```

   **Important:** Provide your own Mapbox token! Default token can expire without notice.

2. **UMD Build (Production):**
   - Precompiled UMD builds in `umd` folder of npm package
   - Include via script tag from unpkg CDN
   - No Node.js required on server

3. **Netlify Hosting:**
   - Official kepler.gl website uses Netlify
   - Automatic deployment when PR merged to master
   - Tutorial: https://docs.kepler.gl/contributing/developers

4. **Static File Hosting:**
   - Build with webpack for production
   - Serve with nginx, Apache, or any static host
   - GitHub Pages, Vercel, Netlify compatible

5. **iFrame Embedding:**
   - Point to Kepler.gl demo with data URL parameter
   - Example: `https://kepler.gl/demo?data=YOUR_DATA_URL`

**Production Build Example:**
```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js --mode production"
  }
}
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/kepler;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Considerations:**
- Standalone HTML includes all necessary libraries
- Large datasets may require data server instead of embedded data
- Mapbox token required for basemaps
- WebGL support required in browser
- Consider data loading performance for large files

**GitHub Examples:**
- Kepler.gl Jupyter Examples: https://github.com/keplergl/kepler.gl/tree/master/bindings/kepler.gl-jupyter
- Geospatial Notebook: https://github.com/tjansson60/geospatial/blob/master/6-kepler.ipynb

---

## Framework Comparison Summary

| Feature | Plotly Dash | Streamlit | Folium | Kepler.gl |
|---------|-------------|-----------|---------|-----------|
| **Primary Use** | Interactive dashboards | Rapid prototyping | Web maps | Large-scale geospatial |
| **Learning Curve** | Moderate | Easy | Easy | Moderate |
| **Time Series** | Excellent | Excellent | Plugin-based | Excellent |
| **JSON Support** | Native | Native | GeoJSON | GeoJSON + others |
| **Deployment** | Any platform | Cloud/Docker | Static HTML | Static HTML/Web app |
| **Interactivity** | High | High | Medium | Very High |
| **Best For** | Complex dashboards | Quick prototypes | Simple maps | Massive datasets |
| **Server Required** | Yes | Yes | No (static) | No (static export) |
| **Geospatial** | Via Plotly/Mapbox | Via plugins | Core feature | Core feature |

---

## Recommended Workflow by Use Case

### 1. Quick Exploration & Prototyping
**Use Streamlit:**
- Fastest time to first visualization
- Built-in geospatial support with st.map
- Easy JSON data loading
- Deploy to Streamlit Cloud in minutes

### 2. Production Dashboard with Custom Interactivity
**Use Plotly Dash:**
- Full control over layout and callbacks
- Enterprise-grade deployment options
- Excellent time-series handling
- Best for complex analytical applications

### 3. Embeddable Web Maps (No Server)
**Use Folium:**
- Standalone HTML files
- No backend required
- Easy to share and embed
- Perfect for reports and documentation

### 4. Large-Scale Geospatial Analysis
**Use Kepler.gl:**
- Handles millions of data points
- Advanced trip visualization
- Powerful filtering and aggregation
- Beautiful out-of-the-box styling

### 5. Hybrid Approach
**Combine Multiple Tools:**
- Streamlit + Folium: Quick prototype with embedded maps
- Dash + Kepler.gl: Dashboard with embedded Kepler.gl visualizations
- Folium + TimestampedGeoJson: Time-series animations as standalone HTML

---

## Additional Resources

### Cross-Framework Integration
- Streamlit + Folium: streamlit-folium package
- Streamlit + Plotly: Native integration via st.plotly_chart
- Dash + Kepler.gl: Embed via iFrame component

### Data Processing
- pandas: CSV, JSON, Excel data loading
- geopandas: GeoJSON, Shapefile, geodatabase support
- DuckDB: Fast analytical queries for large datasets

### Basemap Providers
- Mapbox (requires token, best quality)
- OpenStreetMap (free, open)
- Stamen (artistic styles)
- CartoDB (clean, minimal)

### Performance Optimization
- Data aggregation before visualization
- Use server-side processing for large datasets
- Implement caching (Streamlit: @st.cache_data, Dash: memoization)
- Consider progressive data loading
- Use vector tiles for large geographic datasets

---

**Research completed:** 2025-11-22
**Frameworks analyzed:** Plotly Dash, Streamlit, Folium, Kepler.gl
**Focus areas:** Time-series visualization, JSON integration, deployment strategies
