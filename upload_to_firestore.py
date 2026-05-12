"""
RunPredict — Upload Athletes to Firebase Firestore
====================================================
Reads the sprint dataset Excel file and uploads all athletes
directly to Firestore. Run this whenever you want to update
the athlete data — no Vercel redeployment needed.

Requirements:
    pip install firebase-admin pandas openpyxl

Setup:
    1. Go to Firebase Console → Project Settings → Service Accounts
    2. Click "Generate new private key"
    3. Save the downloaded JSON file as "serviceAccountKey.json"
       in the same folder as this script
    4. Update EXCEL_FILE path below to point to your Excel file

Run:
    python upload_to_firestore.py
"""

import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import json
import time

# ── Config ────────────────────────────────────────────────────────
EXCEL_FILE        = "sprint_runners_100m_200m (4).xlsx"
SERVICE_ACCOUNT   = "runnertime-ef63a-firebase-adminsdk-fbsvc-9fc1fded7a.json"
COLLECTION_NAME   = "athletes"  # Firestore collection name

# ── Initialise Firebase ───────────────────────────────────────────
cred = credentials.Certificate(SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred)
db = firestore.client()

# ── Process Excel ─────────────────────────────────────────────────
print("Reading Excel file...")
df = pd.read_excel(EXCEL_FILE)
df = df[df["Event"].isin(["100m", "200m"])].copy()
df["event"] = df["Event"].str.replace("m", "")
df["Runner Name"] = df["Runner Name"].str.strip()
df["Race Time (s)"] = pd.to_numeric(df["Race Time (s)"], errors="coerce")
df = df.dropna(subset=["Race Time (s)"])

# Get best race per athlete per event
best = df.sort_values("Race Time (s)").groupby(["Runner Name", "event"]).first().reset_index()

athletes = []
for _, row in best.iterrows():
    athlete_races = df[
        (df["Runner Name"] == row["Runner Name"]) &
        (df["event"] == row["event"])
    ]
    achievements = []
    for _, race in athlete_races.sort_values("Race Time (s)").head(5).iterrows():
        year = race["Date of Race"].year if hasattr(race["Date of Race"], "year") else "N/A"
        achievements.append(f"{race['Race Time (s)']}s — {race['Venue']}, {race['City']} ({year})")

    temp_col = "Temperature (Â°C)" if "Temperature (Â°C)" in row.index else "Temperature (°C)"

    athletes.append({
        "name":             row["Runner Name"],
        "gender":           str(row["Gender"]).strip().lower(),
        "country":          row["Country"],
        "event":            row["event"],
        "raceTime":         round(float(row["Race Time (s)"]), 2),
        "wind":             round(float(row["Wind Speed (m/s)"]), 1),
        "altitude":         int(row["Stadium Altitude (m)"]),
        "temperature":      int(row[temp_col]),
        "humidity":         int(row["Humidity (%)"]),
        "venue":            str(row["Venue"]),
        "city":             str(row["City"]),
        "countryOfVenue":   str(row["Country of Venue"]),
        "weatherCondition": str(row["Weather Condition"]),
        "year":             int(row["Date of Race"].year) if hasattr(row["Date of Race"], "year") else 0,
        "status":           "Active",
        "custom":           False,
        "achievements":     achievements,
    })

print(f"Processed {len(athletes)} athletes")

# ── Upload to Firestore ───────────────────────────────────────────
print("\nUploading to Firestore...")

# Clear existing athletes first
existing = db.collection(COLLECTION_NAME).stream()
deleted  = 0
for doc in existing:
    doc.reference.delete()
    deleted += 1
if deleted > 0:
    print(f"  Cleared {deleted} existing athletes")

# Upload new athletes in batches of 500 (Firestore limit)
batch     = db.batch()
count     = 0
total     = 0

for athlete in athletes:
    # Use name-event as document ID e.g. "Usain Bolt-100"
    doc_id  = f"{athlete['name'].replace(' ', '_')}-{athlete['event']}"
    doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
    batch.set(doc_ref, athlete)
    count += 1
    total += 1

    # Firestore batches max 500 operations
    if count == 499:
        batch.commit()
        print(f"  Uploaded {total} athletes...")
        batch = db.batch()
        count = 0
        time.sleep(0.5)

# Commit remaining
if count > 0:
    batch.commit()

print(f"\n✅ Successfully uploaded {total} athletes to Firestore")
print(f"   Collection: '{COLLECTION_NAME}'")
print(f"   Documents:  {total}")
print("""
Next steps:
  - Your app will now fetch athletes from Firestore on load
  - To update data: edit your Excel file and re-run this script
  - No Vercel redeployment needed!
""")
