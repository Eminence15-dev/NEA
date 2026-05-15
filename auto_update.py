"""
RunPredict — Enhanced Automatic Athlete Data Updater
=====================================================
Scrapes World Athletics for 100m and 200m results.
Enriches each athlete with venue details (altitude,
temperature, humidity, weather) using a known venue
lookup dictionary — no individual profile page needed.

Requirements:
    pip install requests beautifulsoup4 firebase-admin --break-system-packages

Run:
    python auto_update.py
"""

import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
import time
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────
SERVICE_ACCOUNT = r"C:\Users\maxim\Downloads\runnertime-ef63a-firebase-adminsdk-fbsvc-fab08e0276.json"
COLLECTION_NAME = "athletes"

URLS = {
    "100m": "https://worldathletics.org/records/toplists/sprints/100-metres/outdoor/men/senior",
    "200m": "https://worldathletics.org/records/toplists/sprints/200-metres/outdoor/men/senior",
    "100f": "https://worldathletics.org/records/toplists/sprints/100-metres/outdoor/women/senior",
    "200f": "https://worldathletics.org/records/toplists/sprints/200-metres/outdoor/women/senior",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.5",
}

# ── Known Venue Data ──────────────────────────────────────────────
# altitude (m), temperature (°C), humidity (%)
VENUE_DATA = {
    "berlin":        {"altitude": 34,   "temperature": 22, "humidity": 65, "weather": "Partly Cloudy"},
    "london":        {"altitude": 15,   "temperature": 18, "humidity": 72, "weather": "Light Rain"},
    "tokyo":         {"altitude": 7,    "temperature": 30, "humidity": 82, "weather": "Hot and Humid"},
    "paris":         {"altitude": 35,   "temperature": 22, "humidity": 65, "weather": "Clear"},
    "beijing":       {"altitude": 44,   "temperature": 26, "humidity": 78, "weather": "Hazy and Humid"},
    "moscow":        {"altitude": 130,  "temperature": 20, "humidity": 70, "weather": "Partly Cloudy"},
    "doha":          {"altitude": 10,   "temperature": 35, "humidity": 55, "weather": "Hot and Dry"},
    "zurich":        {"altitude": 432,  "temperature": 22, "humidity": 65, "weather": "Sunny"},
    "lausanne":      {"altitude": 459,  "temperature": 22, "humidity": 62, "weather": "Sunny"},
    "eugene":        {"altitude": 133,  "temperature": 22, "humidity": 55, "weather": "Sunny"},
    "budapest":      {"altitude": 103,  "temperature": 26, "humidity": 65, "weather": "Sunny"},
    "birmingham":    {"altitude": 140,  "temperature": 18, "humidity": 70, "weather": "Overcast"},
    "glasgow":       {"altitude": 20,   "temperature": 16, "humidity": 75, "weather": "Heavy Rain"},
    "stockholm":     {"altitude": 12,   "temperature": 18, "humidity": 68, "weather": "Light Rain"},
    "monaco":        {"altitude": 7,    "temperature": 26, "humidity": 65, "weather": "Clear"},
    "oslo":          {"altitude": 23,   "temperature": 17, "humidity": 70, "weather": "Light Rain"},
    "kingston":      {"altitude": 3,    "temperature": 30, "humidity": 78, "weather": "Showers"},
    "rio de janeiro":{"altitude": 12,   "temperature": 26, "humidity": 80, "weather": "Warm and Humid"},
    "austin":        {"altitude": 150,  "temperature": 32, "humidity": 60, "weather": "Sunny and Hot"},
    "bogota":        {"altitude": 2600, "temperature": 14, "humidity": 72, "weather": "Rainy"},
    "munich":        {"altitude": 519,  "temperature": 20, "humidity": 68, "weather": "Partly Cloudy"},
    "brussels":      {"altitude": 13,   "temperature": 17, "humidity": 77, "weather": "Light Rain"},
    "daegu":         {"altitude": 50,   "temperature": 28, "humidity": 68, "weather": "Sunny"},
    "ostrava":       {"altitude": 227,  "temperature": 16, "humidity": 76, "weather": "Overcast"},
    "shanghai":      {"altitude": 5,    "temperature": 22, "humidity": 70, "weather": "Hazy"},
    "rabat":         {"altitude": 276,  "temperature": 24, "humidity": 66, "weather": "Sunny"},
    "xiamen":        {"altitude": 50,   "temperature": 26, "humidity": 75, "weather": "Warm and Humid"},
    "lagos":         {"altitude": 41,   "temperature": 30, "humidity": 85, "weather": "Heavy Rain"},
    "hengelo":       {"altitude": 5,    "temperature": 20, "humidity": 68, "weather": "Partly Cloudy"},
}

# ── Venue Lookup ──────────────────────────────────────────────────
def get_venue_details(city):
    city_lower = city.lower().strip()
    for known_city, data in VENUE_DATA.items():
        if known_city in city_lower or city_lower in known_city:
            return data
    # Default if city not in dictionary
    return {"altitude": 50, "temperature": 20, "humidity": 60, "weather": "Partly Cloudy"}

# ── Initialise Firebase ───────────────────────────────────────────
def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred)
    return firestore.client()

# ── Scrape Top List ───────────────────────────────────────────────
def scrape_results(url, event, gender):
    print(f"\n  Scraping {event}m {gender}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  ✗ Failed: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    athletes = []

    table = soup.find("table")
    if not table:
        print(f"  ✗ No table found")
        return []

    rows = table.find_all("tr")[1:]
    for row in rows[:50]:
        cols = row.find_all("td")
        if len(cols) < 6:
            continue
        try:
            race_time  = float(cols[1].get_text(strip=True).replace(",", "."))
            wind_text  = cols[2].get_text(strip=True)
            wind       = float(wind_text) if wind_text and wind_text not in ["-", ""] else 0.0
            name       = cols[3].get_text(strip=True)
            country    = cols[5].get_text(strip=True) if len(cols) > 5 else "Unknown"
            venue_text = cols[7].get_text(strip=True) if len(cols) > 7 else "Unknown"
            date_text  = cols[8].get_text(strip=True) if len(cols) > 8 else "Unknown"
            year       = int(date_text.split(".")[-1]) if "." in date_text else datetime.now().year

            venue_parts = venue_text.split(",")
            venue = venue_parts[0].strip()
            city  = venue_parts[1].strip() if len(venue_parts) > 1 else "Unknown"

            # Get full venue details from lookup dictionary
            details = get_venue_details(city)

            athletes.append({
                "name":             name,
                "gender":           gender,
                "country":          country,
                "event":            event,
                "raceTime":         round(race_time, 2),
                "wind":             round(wind, 1),
                "altitude":         details["altitude"],
                "temperature":      details["temperature"],
                "humidity":         details["humidity"],
                "venue":            venue,
                "city":             city,
                "countryOfVenue":   "Unknown",
                "weatherCondition": details["weather"],
                "year":             year,
                "status":           "Active",
                "custom":           False,
                "achievements":     [f"{race_time}s — {venue}, {city} ({year})"],
                "lastUpdated":      datetime.now().strftime("%Y-%m-%d"),
            })
        except (ValueError, IndexError):
            continue

    print(f"  ✓ Found {len(athletes)} results")
    return athletes

# ── Update Firestore ──────────────────────────────────────────────
def update_firestore(db, scraped_athletes):
    print("\nUpdating Firestore...")

    existing_docs = {}
    snapshot = db.collection(COLLECTION_NAME).stream()
    for doc in snapshot:
        existing_docs[doc.id] = doc

    updated = 0
    added   = 0
    skipped = 0

    for athlete in scraped_athletes:
        doc_id = f"{athlete['name'].replace(' ', '_')}-{athlete['event']}"

        if doc_id in existing_docs:
            existing_data = existing_docs[doc_id].to_dict()
            existing_time = existing_data.get("raceTime", 999)

            if athlete["raceTime"] < existing_time:
                # Faster time — full update
                existing_docs[doc_id].reference.update({
                    "raceTime":         athlete["raceTime"],
                    "wind":             athlete["wind"],
                    "altitude":         athlete["altitude"],
                    "temperature":      athlete["temperature"],
                    "humidity":         athlete["humidity"],
                    "venue":            athlete["venue"],
                    "city":             athlete["city"],
                    "weatherCondition": athlete["weatherCondition"],
                    "year":             athlete["year"],
                    "lastUpdated":      athlete["lastUpdated"],
                    "achievements":     firestore.ArrayUnion(
                        [f"{athlete['raceTime']}s — {athlete['venue']}, {athlete['city']} ({athlete['year']})"]
                    ),
                })
                print(f"  ↑ Updated {athlete['name']} ({existing_time}s → {athlete['raceTime']}s)")
                updated += 1
            else:
                # No faster time — but fix missing venue details if needed
                if existing_data.get("altitude", 0) == 0 or existing_data.get("weatherCondition") == "Unknown":
                    existing_docs[doc_id].reference.update({
                        "altitude":         athlete["altitude"],
                        "temperature":      athlete["temperature"],
                        "humidity":         athlete["humidity"],
                        "weatherCondition": athlete["weatherCondition"],
                        "lastUpdated":      athlete["lastUpdated"],
                    })
                    print(f"  ~ Fixed venue details for {athlete['name']}")
                    updated += 1
                else:
                    skipped += 1
        else:
            # Brand new athlete
            db.collection(COLLECTION_NAME).document(doc_id).set(athlete)
            print(f"  + Added {athlete['name']} ({athlete['raceTime']}s)")
            added += 1

        time.sleep(0.05)

    print(f"\n✅ Update complete:")
    print(f"   Updated:  {updated} athletes")
    print(f"   Added:    {added} new athletes")
    print(f"   Skipped:  {skipped} (no change needed)")
    return updated, added, skipped

# ── Log Update ────────────────────────────────────────────────────
def log_update(db, updated, added, skipped):
    db.collection("update-log").add({
        "date":    datetime.now().strftime("%Y-%m-%d %H:%M"),
        "updated": updated,
        "added":   added,
        "skipped": skipped,
    })

# ── Main ──────────────────────────────────────────────────────────
def run_update():
    print("=" * 50)
    print("RunPredict — Enhanced Athlete Data Updater")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    db = init_firebase()

    all_athletes = []
    all_athletes += scrape_results(URLS["100m"], "100", "male")
    time.sleep(2)
    all_athletes += scrape_results(URLS["200m"], "200", "male")
    time.sleep(2)
    all_athletes += scrape_results(URLS["100f"], "100", "female")
    time.sleep(2)
    all_athletes += scrape_results(URLS["200f"], "200", "female")

    if not all_athletes:
        print("\n✗ No athletes scraped — aborting.")
        return

    print(f"\nTotal scraped: {len(all_athletes)} results")
    updated, added, skipped = update_firestore(db, all_athletes)
    log_update(db, updated, added, skipped)
    print("\nDone! Your app will now show updated athlete data.")

if __name__ == "__main__":
    run_update()