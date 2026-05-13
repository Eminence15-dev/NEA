"""
RunPredict — XGBoost Training & Lookup Table Export
=====================================================
Trains an XGBoost model on real sprint data and exports
a JSON lookup table for use in the React app.

Requirements:
    pip install xgboost scikit-learn pandas openpyxl --break-system-packages

Run:
    python train_xgboost.py
"""

import pandas as pd
import numpy as np
import json
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from itertools import product

# ── Config ────────────────────────────────────────────────────────
EXCEL_FILE   = r"C:\Users\maxim\OneDrive\Pictures\Documents\sprint_runners_100m_200m__4_.xlsx"
OUTPUT_FILE  = "xgboost_lookup.json"

TRACK_MAP = { "optimal": 0, "good": 1, "fair": 2, "poor": 3 }

# ── Load & Clean Data ─────────────────────────────────────────────
print("Loading data...")
df = pd.read_excel(EXCEL_FILE)
df = df[df["Event"].isin(["100m", "200m"])].copy()
df["event"] = df["Event"].str.replace("m", "").astype(int)
df["Race Time (s)"] = pd.to_numeric(df["Race Time (s)"], errors="coerce")
df["Wind Speed (m/s)"] = pd.to_numeric(df["Wind Speed (m/s)"], errors="coerce")
df["Stadium Altitude (m)"] = pd.to_numeric(df["Stadium Altitude (m)"], errors="coerce")
df["Humidity (%)"] = pd.to_numeric(df["Humidity (%)"], errors="coerce")

# Handle temperature column encoding issues
temp_col = "Temperature (Â°C)" if "Temperature (Â°C)" in df.columns else "Temperature (°C)"
df["temperature"] = pd.to_numeric(df[temp_col], errors="coerce")

# Map track condition to numeric
df["track_numeric"] = df["Weather Condition"].str.lower().map({
    "clear": 0, "sunny": 0, "partly cloudy": 1, "cloudy": 1,
    "overcast": 2, "light rain": 2, "rain": 3, "heavy rain": 3,
}).fillna(1)

# Drop rows with missing values
df = df.dropna(subset=["Race Time (s)", "Wind Speed (m/s)", "Stadium Altitude (m)", "Humidity (%)", "temperature"])

print(f"Training on {len(df)} records...")

# ── Features & Target ─────────────────────────────────────────────
FEATURES = ["event", "Wind Speed (m/s)", "temperature", "Humidity (%)", "Stadium Altitude (m)", "track_numeric"]
TARGET   = "Race Time (s)"

X = df[FEATURES].values
y = df[TARGET].values

# ── Train XGBoost ─────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0,
)
model.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
print(f"Model MAE on test set: ±{mae:.4f}s")

# ── Generate Lookup Table ─────────────────────────────────────────
print("\nGenerating lookup table...")

events       = [100, 200]
winds        = [-3, -2, -1, 0, 1, 2, 3, 4, 5]           # m/s
temperatures = [5, 10, 15, 20, 24, 26, 28, 30, 35, 40]  # °C
humidities   = [20, 40, 60, 80, 100]                     # %
altitudes    = [0, 500, 1000, 1500, 2000, 2500]          # m
tracks       = [0, 1, 2, 3]                               # optimal→poor

combos = list(product(events, winds, temperatures, humidities, altitudes, tracks))
print(f"  Generating {len(combos)} condition combinations...")

combo_array = np.array(combos, dtype=float)
predictions = model.predict(combo_array)

# Build lookup as nested dict: event → wind → temp → humidity → altitude → track → adjustment
lookup = {}
track_names = ["optimal", "good", "fair", "poor"]

for i, (event, wind, temp, humidity, altitude, track) in enumerate(combos):
    pred = float(predictions[i])

    # We store a multiplier relative to average baseline for that event
    # so the app can apply it to any athlete's race time
    event_key    = str(int(event))
    wind_key     = str(wind)
    temp_key     = str(int(temp))
    humidity_key = str(int(humidity))
    alt_key      = str(int(altitude))
    track_key    = track_names[int(track)]

    lookup.setdefault(event_key, {}) \
          .setdefault(wind_key, {}) \
          .setdefault(temp_key, {}) \
          .setdefault(humidity_key, {}) \
          .setdefault(alt_key, {})[track_key] = round(pred, 4)

# Also store baseline averages per event so app can compute multiplier
baselines = {}
for event in [100, 200]:
    event_df = df[df["event"] == event]
    baselines[str(event)] = round(float(event_df["Race Time (s)"].mean()), 4)

output = {
    "model_mae":  round(mae, 4),
    "baselines":  baselines,
    "lookup":     lookup,
    "ranges": {
        "wind":        [-3, 5],
        "temperature": [5, 40],
        "humidity":    [20, 100],
        "altitude":    [0, 2500],
        "track":       track_names,
    }
}

with open(OUTPUT_FILE, "w") as f:
    json.dump(output, f, separators=(",", ":"))

print(f"\n✅ Lookup table saved to {OUTPUT_FILE}")
print(f"   Combinations: {len(combos)}")
print(f"   Model MAE:    ±{mae:.4f}s")
print(f"   Baselines:    100m={baselines['100']}s  200m={baselines['200']}s")
print("""
Next steps:
  1. Copy xgboost_lookup.json into your React app's /public folder
  2. Update SimulationEngine.js to fetch and use the lookup table
  3. The app will find the nearest conditions and apply the XGBoost multiplier
""")
