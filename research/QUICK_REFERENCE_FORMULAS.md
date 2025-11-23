# Quick Reference: Spatial Statistics Formulas and Code

**Quick lookup guide for implementing spatial statistics for blockchain node analysis**

---

## Table of Contents

1. [Data Preparation](#data-preparation)
2. [Global Spatial Autocorrelation](#global-spatial-autocorrelation)
3. [Local Spatial Autocorrelation](#local-spatial-autocorrelation)
4. [Point Pattern Analysis](#point-pattern-analysis)
5. [Inequality Metrics](#inequality-metrics)
6. [Distance Calculations](#distance-calculations)

---

## Data Preparation

### Convert to GeoDataFrame (Python)

```python
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

# From DataFrame with lat/lon columns
df = pd.read_csv('nodes.csv')
geometry = [Point(xy) for xy in zip(df.longitude, df.latitude)]
gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')

# From GeoJSON
gdf = gpd.read_file('nodes.geojson')

# Transform to projected CRS for accurate distance calculations
gdf_proj = gdf.to_crs('EPSG:3857')  # Web Mercator
```

### Create Spatial Weights Matrix

```python
from libpysal.weights import KNN, DistanceBand, Queen

# K-nearest neighbors (good for irregular point distributions)
w = KNN.from_dataframe(gdf, k=5)
w.transform = 'r'  # Row-standardize

# Distance band (all neighbors within threshold)
w = DistanceBand.from_dataframe(gdf_proj, threshold=100000)  # 100km in meters
w.transform = 'r'

# Queen contiguity (for polygon data)
w = Queen.from_dataframe(gdf)
w.transform = 'r'
```

---

## Global Spatial Autocorrelation

### Moran's I

**Formula:**
```
I = (N / W) × (Σᵢ Σⱼ wᵢⱼ(xᵢ - x̄)(xⱼ - x̄)) / (Σᵢ(xᵢ - x̄)²)

Where:
- N = number of observations
- W = sum of all weights
- wᵢⱼ = spatial weight between i and j
- xᵢ, xⱼ = values at locations i and j
- x̄ = mean value
```

**Python Implementation:**
```python
from esda import Moran

y = gdf['stake_percentage'].values
moran = Moran(y, w, permutations=999)

print(f"Moran's I: {moran.I:.4f}")
print(f"Expected I: {moran.EI:.4f}")
print(f"p-value: {moran.p_sim:.4f}")
print(f"z-score: {moran.z_sim:.4f}")

# Interpretation
if moran.p_sim < 0.05:
    if moran.I > 0:
        print("Significant clustering of similar values")
    else:
        print("Significant dispersion of similar values")
```

**R Implementation:**
```r
library(spdep)

moran_result <- moran.test(gdf$stake, w, randomisation=TRUE)
print(moran_result)
```

### Geary's C

**Formula:**
```
C = ((N-1) / (2W)) × (Σᵢ Σⱼ wᵢⱼ(xᵢ - xⱼ)²) / (Σᵢ(xᵢ - x̄)²)

Interpretation:
- C < 1: Positive autocorrelation (clustering)
- C = 1: No autocorrelation
- C > 1: Negative autocorrelation (dispersion)
```

**Python Implementation:**
```python
from esda import Geary

geary = Geary(y, w, permutations=999)

print(f"Geary's C: {geary.C:.4f}")
print(f"Expected C: {geary.EC:.4f}")
print(f"p-value: {geary.p_sim:.4f}")
```

---

## Local Spatial Autocorrelation

### Local Moran's I (LISA)

**Formula:**
```
Iᵢ = ((xᵢ - x̄) / s²) × Σⱼ wᵢⱼ(xⱼ - x̄)

Where:
- s² = variance of x
- Sum over neighbors j of location i
```

**Python Implementation:**
```python
from esda import Moran_Local
import matplotlib.pyplot as plt

lisa = Moran_Local(y, w, permutations=999)

# Cluster classification
gdf['lisa_cluster'] = lisa.q
gdf['lisa_pval'] = lisa.p_sim
gdf['lisa_significant'] = lisa.p_sim < 0.05

# Quadrant meanings:
# 1 = HH (High-High): Hot spot
# 2 = LH (Low-High): Low outlier
# 3 = LL (Low-Low): Cold spot
# 4 = HL (High-Low): High outlier

# Plot significant clusters only
gdf_sig = gdf[gdf['lisa_significant']]
cluster_labels = {1: 'HH', 2: 'LH', 3: 'LL', 4: 'HL'}

fig, ax = plt.subplots(figsize=(12, 10))
gdf.plot(ax=ax, color='lightgray', edgecolor='black')
gdf_sig.plot(ax=ax, column='lisa_cluster',
             categorical=True, legend=True,
             cmap='RdYlBu_r', edgecolor='black', linewidth=0.5)
plt.title("LISA Cluster Map (p < 0.05)")
plt.show()
```

### Getis-Ord Gᵢ*

**Formula:**
```
Gᵢ* = (Σⱼ wᵢⱼxⱼ - x̄ Σⱼ wᵢⱼ) / (s × sqrt((n Σⱼ wᵢⱼ² - (Σⱼ wᵢⱼ)²) / (n-1)))

Where:
- Includes focal location i in the sum
- Positive: Hot spot (high values)
- Negative: Cold spot (low values)
```

**Python Implementation:**
```python
from esda.getisord import G_Local

g_local = G_Local(y, w, transform='r', permutations=999)

gdf['g_star'] = g_local.Zs  # Z-scores
gdf['g_pval'] = g_local.p_sim

# Classify hotspots/coldspots
gdf['hotspot'] = 'Not Significant'
gdf.loc[(gdf['g_star'] > 1.96) & (gdf['g_pval'] < 0.05), 'hotspot'] = 'Hot Spot'
gdf.loc[(gdf['g_star'] < -1.96) & (gdf['g_pval'] < 0.05), 'hotspot'] = 'Cold Spot'

# Plot
fig, ax = plt.subplots(figsize=(12, 10))
gdf.plot(ax=ax, column='hotspot', categorical=True, legend=True,
         cmap='RdBu_r', edgecolor='black', linewidth=0.5)
plt.title("Getis-Ord Gi* Hotspot Analysis")
plt.show()
```

---

## Point Pattern Analysis

### Ripley's K-Function

**Formula:**
```
K̂(r) = (A / (n(n-1))) × Σᵢ Σⱼ≠ᵢ I(dᵢⱼ ≤ r) × wᵢⱼ

Where:
- A = study area
- n = number of points
- dᵢⱼ = distance between i and j
- wᵢⱼ = edge correction weight
- I() = indicator function
```

**L-Function (Normalized):**
```
L̂(r) = sqrt(K̂(r) / π) - r

Interpretation:
- L(r) > 0: Clustering at distance r
- L(r) ≈ 0: Random pattern (CSR)
- L(r) < 0: Dispersion at distance r
```

**Python Implementation:**
```python
from pointpats import PointPattern, k_test

# Extract coordinates
coords = gdf[['longitude', 'latitude']].values

# Create point pattern
pp = PointPattern(coords)

# Ripley's K test with simulation envelope
k_result = k_test(pp, support=50, keep_simulations=True)

# Plot
fig, ax = plt.subplots(figsize=(10, 6))
k_result.plot()
plt.title("Ripley's K-function with 95% Confidence Envelope")
plt.xlabel("Distance")
plt.ylabel("K(r)")
plt.show()
```

**R Implementation:**
```r
library(spatstat)

# Create point pattern
pp <- ppp(x = nodes$x, y = nodes$y,
          window = owin(xrange = c(xmin, xmax),
                        yrange = c(ymin, ymax)))

# K function with envelope
env <- envelope(pp, Kest, nsim=99, correction="isotropic")
plot(env, main="Ripley's K-function")

# L function
l_env <- envelope(pp, Lest, nsim=99)
plot(l_env, . - r ~ r, main="L-function")
```

### Kernel Density Estimation

**Python Implementation:**
```python
from scipy.stats import gaussian_kde
import numpy as np

# Create KDE
coords = gdf[['longitude', 'latitude']].values.T
kde = gaussian_kde(coords)

# Create grid
x_min, x_max = coords[0].min(), coords[0].max()
y_min, y_max = coords[1].min(), coords[1].max()
xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                     np.linspace(y_min, y_max, 100))

# Evaluate KDE on grid
positions = np.vstack([xx.ravel(), yy.ravel()])
zz = np.reshape(kde(positions), xx.shape)

# Plot
fig, ax = plt.subplots(figsize=(12, 10))
cf = ax.contourf(xx, yy, zz, levels=20, cmap='YlOrRd')
plt.colorbar(cf, ax=ax, label='Density')
gdf.plot(ax=ax, markersize=10, color='blue', alpha=0.5)
plt.title("Kernel Density Estimation")
plt.show()
```

**Using GeoPandas (with folium for interactive):**
```python
import folium
from folium.plugins import HeatMap

# Create base map
m = folium.Map(location=[gdf.geometry.y.mean(), gdf.geometry.x.mean()],
               zoom_start=4)

# Add heatmap
heat_data = [[row['latitude'], row['longitude'], row['stake']]
             for idx, row in gdf.iterrows()]
HeatMap(heat_data, radius=15, blur=20).add_to(m)

# Save
m.save('stake_heatmap.html')
```

### Average Nearest Neighbor

**Formula:**
```
D̄ₙₙ = (Σᵢ dᵢ) / n

Expected (random):
E[D̄ₙₙ] = 1 / (2√(n/A))

Ratio:
R = D̄ₙₙ / E[D̄ₙₙ]

Z-score:
z = (D̄ₙₙ - E[D̄ₙₙ]) / (0.26136 / √(n²/A))
```

**Python Implementation:**
```python
from scipy.spatial import cKDTree
import numpy as np

# Build KD-tree
coords = gdf[['x', 'y']].values  # Use projected coordinates
tree = cKDTree(coords)

# Find nearest neighbor distances (k=2 includes self)
distances, indices = tree.query(coords, k=2)
nn_distances = distances[:, 1]  # Exclude self (distance 0)

# Observed mean
D_obs = np.mean(nn_distances)

# Expected mean (random distribution)
n = len(coords)
area = (coords[:, 0].max() - coords[:, 0].min()) * \
       (coords[:, 1].max() - coords[:, 1].min())
D_exp = 1 / (2 * np.sqrt(n / area))

# Nearest neighbor ratio
R = D_obs / D_exp

# Z-score
se = 0.26136 / np.sqrt(n**2 / area)
z = (D_obs - D_exp) / se
p_value = 2 * (1 - scipy.stats.norm.cdf(abs(z)))

print(f"Observed NN Distance: {D_obs:.2f}")
print(f"Expected NN Distance: {D_exp:.2f}")
print(f"NN Ratio: {R:.4f}")
print(f"Z-score: {z:.4f}")
print(f"P-value: {p_value:.4f}")

if R < 1:
    print("Pattern is CLUSTERED")
elif R > 1:
    print("Pattern is DISPERSED")
else:
    print("Pattern is RANDOM")
```

---

## Inequality Metrics

### Gini Coefficient

**Formula:**
```
G = (Σᵢ Σⱼ |xᵢ - xⱼ|) / (2n² × x̄)

Alternative (sorted values):
G = (2 × Σᵢ i × xᵢ) / (n × Σᵢ xᵢ) - (n+1) / n
```

**Python Implementation:**
```python
def gini_coefficient(x):
    """Calculate Gini coefficient."""
    x = np.array(x, dtype=float)
    x = x[x >= 0]  # Remove negative values
    x = np.sort(x)
    n = len(x)

    if n == 0 or x.sum() == 0:
        return 0

    cumsum = np.cumsum(x)
    return (n + 1 - 2 * cumsum.sum() / cumsum[-1]) / n

# Calculate
gini = gini_coefficient(gdf['stake'].values)
print(f"Gini Coefficient: {gini:.4f}")

# Using PySAL
from inequality import gini

gini_pysal = gini.Gini(gdf['stake'].values)
print(f"Gini (PySAL): {gini_pysal.g:.4f}")
```

### Spatial Gini

**Python Implementation:**
```python
from inequality.gini import Gini_Spatial

# Spatial Gini decomposition
spatial_gini = Gini_Spatial(gdf['stake'].values, w)

print(f"Total Gini: {spatial_gini.g:.4f}")
print(f"Neighbor component: {spatial_gini.wcg:.4f}")
print(f"Non-neighbor component: {spatial_gini.wcg_share:.4f}")
```

### Herfindahl-Hirschman Index (HHI)

**Formula:**
```
HHI = Σᵢ sᵢ²

Where:
- sᵢ = share of entity i (as proportion 0-1)
- Or multiply by 10,000 for scale 0-10,000
```

**Python Implementation:**
```python
def hhi(shares):
    """
    Calculate Herfindahl-Hirschman Index.

    Parameters:
    -----------
    shares : array-like
        Market shares as proportions (0-1) or percentages (0-100)

    Returns:
    --------
    float : HHI value
    """
    shares = np.array(shares, dtype=float)

    # Normalize if sum > 1 (assuming percentages)
    if shares.sum() > 1:
        shares = shares / 100

    return (shares ** 2).sum()

# Geographic HHI by country
country_shares = gdf.groupby('country')['stake'].sum()
country_shares = country_shares / country_shares.sum()

hhi_country = hhi(country_shares.values)
hhi_normalized = (hhi_country - 1/len(country_shares)) / (1 - 1/len(country_shares))

print(f"HHI (Country): {hhi_country:.4f}")
print(f"HHI Normalized: {hhi_normalized:.4f}")
print(f"HHI (0-10000 scale): {hhi_country * 10000:.0f}")

# Interpretation
if hhi_country * 10000 < 1500:
    print("Low concentration (competitive)")
elif hhi_country * 10000 < 2500:
    print("Moderate concentration")
else:
    print("High concentration")
```

### Shannon Entropy and Effective Number

**Formula:**
```
H = -Σᵢ pᵢ × log(pᵢ)

Effective Number:
D = exp(H)
```

**Python Implementation:**
```python
from scipy.stats import entropy

def effective_number_locations(shares):
    """
    Calculate Shannon entropy and effective number of locations.

    Parameters:
    -----------
    shares : array-like
        Proportions summing to 1

    Returns:
    --------
    dict : {'entropy': H, 'effective_n': exp(H)}
    """
    shares = np.array(shares, dtype=float)
    shares = shares[shares > 0]  # Remove zeros
    shares = shares / shares.sum()  # Normalize

    H = entropy(shares, base=np.e)
    D = np.exp(H)

    return {'entropy': H, 'effective_n': D, 'max_entropy': np.log(len(shares))}

# By country
country_shares = gdf.groupby('country')['stake'].sum()
country_shares = country_shares / country_shares.sum()

result = effective_number_locations(country_shares.values)

print(f"Shannon Entropy: {result['entropy']:.4f}")
print(f"Effective Number of Countries: {result['effective_n']:.2f}")
print(f"Actual Number of Countries: {len(country_shares)}")
print(f"Maximum Possible Entropy: {result['max_entropy']:.4f}")
print(f"Normalized Entropy: {result['entropy'] / result['max_entropy']:.4f}")
```

---

## Distance Calculations

### Great Circle Distance (Haversine)

**Formula:**
```
a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
d = R × c

Where:
- φ = latitude (radians)
- λ = longitude (radians)
- R = Earth's radius (6371 km)
```

**Python Implementation:**
```python
from scipy.spatial.distance import pdist, squareform
import numpy as np

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate great circle distance between points.

    Parameters:
    -----------
    lat1, lon1, lat2, lon2 : float or array
        Coordinates in decimal degrees

    Returns:
    --------
    float or array : Distance in kilometers
    """
    R = 6371  # Earth's radius in km

    # Convert to radians
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))

    return R * c

# Distance matrix
coords_rad = np.radians(gdf[['latitude', 'longitude']].values)
dist_matrix = pdist(coords_rad, metric='haversine') * 6371
dist_matrix = squareform(dist_matrix)

# Distance from each node to mean center
mean_lat = gdf['latitude'].mean()
mean_lon = gdf['longitude'].mean()
gdf['dist_to_center'] = haversine_distance(
    gdf['latitude'], gdf['longitude'], mean_lat, mean_lon
)

# Standard distance (spatial standard deviation)
std_distance = np.sqrt((gdf['dist_to_center']**2).mean())
print(f"Standard Distance: {std_distance:.2f} km")
```

### Weighted Mean Center

**Python Implementation:**
```python
def weighted_mean_center(lats, lons, weights):
    """
    Calculate weighted mean center.

    Parameters:
    -----------
    lats, lons : array-like
        Coordinates
    weights : array-like
        Weights (e.g., stake amounts)

    Returns:
    --------
    tuple : (mean_lat, mean_lon)
    """
    lats = np.array(lats)
    lons = np.array(lons)
    weights = np.array(weights)

    total_weight = weights.sum()

    mean_lat = (lats * weights).sum() / total_weight
    mean_lon = (lons * weights).sum() / total_weight

    return mean_lat, mean_lon

# Calculate
center_lat, center_lon = weighted_mean_center(
    gdf['latitude'], gdf['longitude'], gdf['stake']
)

print(f"Weighted Mean Center: ({center_lat:.4f}, {center_lon:.4f})")

# Add to map
import folium
m = folium.Map(location=[center_lat, center_lon], zoom_start=4)
folium.Marker([center_lat, center_lon],
              popup='Weighted Mean Center',
              icon=folium.Icon(color='red', icon='star')).add_to(m)
```

---

## Complete Analysis Pipeline

**Full workflow example:**

```python
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point
from libpysal.weights import KNN
from esda import Moran, Moran_Local, Geary
from inequality import gini
import matplotlib.pyplot as plt

# 1. Load and prepare data
df = pd.read_csv('blockchain_nodes.csv')
geometry = [Point(xy) for xy in zip(df.longitude, df.latitude)]
gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')

# 2. Create spatial weights
w = KNN.from_dataframe(gdf, k=5)
w.transform = 'r'

# 3. Global autocorrelation
y = gdf['stake_percentage'].values
moran = Moran(y, w, permutations=999)
geary = Geary(y, w, permutations=999)

print("=== Global Spatial Autocorrelation ===")
print(f"Moran's I: {moran.I:.4f} (p={moran.p_sim:.4f})")
print(f"Geary's C: {geary.C:.4f} (p={geary.p_sim:.4f})")

# 4. Local autocorrelation
lisa = Moran_Local(y, w, permutations=999)
gdf['lisa_cluster'] = lisa.q
gdf['lisa_significant'] = lisa.p_sim < 0.05

# 5. Inequality metrics
g = gini.Gini(gdf['stake'].values)

country_shares = gdf.groupby('country')['stake'].sum()
country_shares = country_shares / country_shares.sum()
hhi_val = (country_shares ** 2).sum()

print("\n=== Inequality Metrics ===")
print(f"Gini Coefficient: {g.g:.4f}")
print(f"HHI (Country): {hhi_val:.4f}")

# 6. Visualize
fig, axes = plt.subplots(1, 2, figsize=(20, 8))

# LISA map
gdf.plot(ax=axes[0], color='lightgray', edgecolor='black')
gdf[gdf['lisa_significant']].plot(ax=axes[0], column='lisa_cluster',
                                    categorical=True, legend=True,
                                    cmap='RdYlBu_r')
axes[0].set_title("LISA Cluster Map")

# Point map with stake size
gdf.plot(ax=axes[1], column='stake',
         markersize=gdf['stake']/gdf['stake'].max()*100,
         cmap='YlOrRd', legend=True)
axes[1].set_title("Node Distribution by Stake")

plt.tight_layout()
plt.savefig('spatial_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

print("\n=== Analysis Complete ===")
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-22
**Companion to:** SPATIAL_STATISTICS_BEST_PRACTICES.md
