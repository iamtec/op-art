import pandas as pd
import numpy as np
import json
from datetime import datetime
from math import floor
from scipy.stats import linregress

# ---------------------------
# 1. Read and Clean the Data
# ---------------------------
csv_file = "Property_Sales_Detroit_-4801866508954663892.csv"
df = pd.read_csv(csv_file, low_memory=False)

# Convert "Sale Date" to datetime using a specific format (adjust the format if needed)
df['Sale Date'] = pd.to_datetime(df['Sale Date'], format="%m/%d/%Y %I:%M:%S %p", errors='coerce')
df = df.dropna(subset=['Sale Date', 'Sale Price', 'Street Number', 'Street Name'])

# Optionally filter out transactions with a sale price of 0 (if desired)
df = df[df['Sale Price'] > 0]

# ------------------------------------------
# 2. Define “Block” for Grouping Transactions
# ------------------------------------------
# Define a block by combining the street name with a truncated street number (by hundreds)
df['Block Number'] = (df['Street Number'] // 100) * 100
df['Block ID'] = df['Street Name'] + " " + df['Block Number'].astype(int).astype(str)

# ------------------------------------
# 3. Compute Trend for Each Block
# ------------------------------------
blocks = []
grouped = df.groupby('Block ID')

for block_id, group in grouped:
    if len(group) < 2:
        continue

    # Sort by sale date and convert dates to ordinal numbers (for regression)
    group = group.sort_values('Sale Date')
    x = group['Sale Date'].map(datetime.toordinal).values
    y = group['Sale Price'].values

    # Skip if all sale dates are identical (no variation in x values)
    if np.all(x == x[0]):
        continue

    slope, intercept, r_value, p_value, std_err = linregress(x, y)

    # Compute average coordinates for the block (assuming 'x' is longitude and 'y' is latitude)
    avg_lon = group['x'].mean() if 'x' in group.columns else None
    avg_lat = group['y'].mean() if 'y' in group.columns else None

    blocks.append({
        'block_id': block_id,
        'slope': slope,
        'avg_lon': avg_lon,
        'avg_lat': avg_lat,
        'sale_count': len(group)
    })

# -------------------------------------------
# 4. Normalize Trend Values to the Range [-1, 1]
# -------------------------------------------
if blocks:
    slopes = np.array([b['slope'] for b in blocks])
    min_slope = slopes.min()
    max_slope = slopes.max()
    
    if max_slope == min_slope:
        for b in blocks:
            b['trend'] = 0
    else:
        for b in blocks:
            # Normalize: min_slope maps to -1, max_slope maps to 1
            b['trend'] = 2 * ((b['slope'] - min_slope) / (max_slope - min_slope)) - 1

# --------------------------------------------------------
# 5. Create GeoJSON Features for Each Block
# --------------------------------------------------------
features = []
size = 0.005  # approximate degree size for the polygon (adjust based on your coordinate system)
half_size = size / 2

for b in blocks:
    # Skip if average coordinates are None or NaN
    if (b['avg_lon'] is None or b['avg_lat'] is None or 
        np.isnan(b['avg_lon']) or np.isnan(b['avg_lat'])):
        continue
    lon = b['avg_lon']
    lat = b['avg_lat']
    # Define a simple square polygon centered on the average coordinate
    polygon = [
        [lon - half_size, lat - half_size],
        [lon + half_size, lat - half_size],
        [lon + half_size, lat + half_size],
        [lon - half_size, lat + half_size],
        [lon - half_size, lat - half_size]
    ]
    feature = {
        "type": "Feature",
        "properties": {
            "block_id": b['block_id'],
            "trend": b['trend'],
            "sale_count": b['sale_count']
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [polygon]
        }
    }
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

# -------------------------------------------
# 6. Output the GeoJSON File
# -------------------------------------------
output_file = "detroit_housing_trends.geojson"
with open(output_file, "w") as f:
    json.dump(geojson, f, indent=2)

print("GeoJSON file created:", output_file)
