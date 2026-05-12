"""
World Athletics Scraper
=======================
Scrapes the top 100m and 200m athletes (male and female) from the
World Athletics all-time top lists and outputs a ready-to-paste
athleteData.js file for RunPredict.

Requirements:
    pip install playwright beautifulsoup4 requests
    playwright install chromium

Run:
    python scrape_world_athletics.py

Output:
    athleteData_scraped.js  — drop this into your project to replace athleteData.js
    athletes_raw.json       — raw scraped data for inspection
"""

import json
import time
import re
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────
# How many athletes to scrape per category (keep reasonable, e.g. 10–20)
TOP_N = 15

# World Athletics all-time top list URLs
# Pattern: /records/all-time-toplists/sprints/{event}/outdoor/{gender}/senior
TARGETS = [
    { "event": "100", "gender": "male",   "url": "https://worldathletics.org/records/all-time-toplists/sprints/100-metres/outdoor/men/senior?regionType=world&page=1&bestResultsOnly=true" },
    { "event": "100", "gender": "female", "url": "https://worldathletics.org/records/all-time-toplists/sprints/100-metres/outdoor/women/senior?regionType=world&page=1&bestResultsOnly=true" },
    { "event": "200", "gender": "male",   "url": "https://worldathletics.org/records/all-time-toplists/sprints/200-metres/outdoor/men/senior?regionType=world&page=1&bestResultsOnly=true" },
    { "event": "200", "gender": "female", "url": "https://worldathletics.org/records/all-time-toplists/sprints/200-metres/outdoor/women/senior?regionType=world&page=1&bestResultsOnly=true" },
]

# ── Helpers ───────────────────────────────────────────────────────

def clean_time(raw):
    """Strips wind readings and whitespace from a time string e.g. '9.58 +0.9' → '9.58'"""
    return raw.strip().split()[0]

def clean_name(raw):
    """Normalises athlete name from all-caps 'BOLT Usain' → 'Usain Bolt'"""
    parts = raw.strip().split()
    return " ".join(p.capitalize() for p in parts)

def parse_wind(raw):
    """Extracts wind reading from result string, returns 'N/A' if not present."""
    match = re.search(r'[+-]?\d+\.\d+', raw)
    return f"{match.group()}m/s" if match else "N/A"

def status_from_dob(dob_year):
    """Rough active/retired estimate based on birth year."""
    if not dob_year:
        return "Active"
    age = 2026 - int(dob_year)
    return "Active" if age < 38 else "Retired"

# ── Scraper ───────────────────────────────────────────────────────

def scrape_category(page, target):
    """
    Scrapes one category (event + gender) from the World Athletics top list.
    Returns a list of athlete dicts.
    """
    print(f"\n→ Scraping {target['event']}m {target['gender']}...")
    athletes = []

    try:
        page.goto(target["url"], timeout=30000)
        # Wait for the results table to load
        page.wait_for_selector("table", timeout=15000)
        time.sleep(2)  # Extra buffer for dynamic content

        html  = page.content()
        soup  = BeautifulSoup(html, "html.parser")
        table = soup.find("table")

        if not table:
            print(f"  ✗ No table found for {target['event']}m {target['gender']}")
            return []

        rows = table.find_all("tr")[1:]  # Skip header row
        seen_names = set()

        for row in rows:
            if len(athletes) >= TOP_N:
                break

            cells = row.find_all("td")
            if len(cells) < 5:
                continue

            try:
                # Column order on World Athletics top list:
                # Rank | Mark | Wind | Competitor | DOB | Nat | Venue | Date | ResultScore
                mark_raw  = cells[1].get_text(strip=True)
                wind_raw  = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                name_raw  = cells[3].get_text(strip=True)
                dob_raw   = cells[4].get_text(strip=True) if len(cells) > 4 else ""
                nat_raw   = cells[5].get_text(strip=True) if len(cells) > 5 else ""
                venue_raw = cells[6].get_text(strip=True) if len(cells) > 6 else ""
                date_raw  = cells[7].get_text(strip=True) if len(cells) > 7 else ""

                pb_time = clean_time(mark_raw)
                name    = clean_name(name_raw)

                # Skip duplicates (same athlete can appear multiple times)
                if name in seen_names:
                    continue
                seen_names.add(name)

                # Extract year from date (e.g. "16 AUG 2009" → "2009")
                year_match = re.search(r'\d{4}', date_raw)
                pb_year    = year_match.group() if year_match else "N/A"

                # Extract birth year for status estimate
                dob_year_match = re.search(r'\d{4}', dob_raw)
                dob_year = dob_year_match.group() if dob_year_match else None

                athletes.append({
                    "name":     name,
                    "gender":   target["gender"],
                    "event":    target["event"],
                    "pb":       f"{pb_time}s",
                    "sb":       "N/A",
                    "pbYear":   pb_year,
                    "nationality": nat_raw,
                    "venue":    venue_raw,
                    "wind":     parse_wind(wind_raw),
                    "status":   status_from_dob(dob_year),
                    "olympicRecord":  "N/A",
                    "nationalRecord": "N/A",
                    "achievements": [
                        f"World All-Time Top {len(athletes)+1} — {target['event']}m",
                        f"PB: {pb_time}s ({pb_year})",
                        f"Nationality: {nat_raw}",
                    ],
                    "custom": False,
                })
                print(f"  ✓ {name} — {pb_time}s ({nat_raw})")

            except Exception as e:
                print(f"  ! Row parse error: {e}")
                continue

    except Exception as e:
        print(f"  ✗ Failed to load page: {e}")

    return athletes

# ── JS Output Generator ───────────────────────────────────────────

def build_js_output(all_athletes):
    """
    Builds the athleteData.js file content from scraped athletes.
    Splits into the four arrays expected by the app.
    """
    male100   = [a for a in all_athletes if a["event"] == "100" and a["gender"] == "male"]
    female100 = [a for a in all_athletes if a["event"] == "100" and a["gender"] == "female"]
    male200   = [a for a in all_athletes if a["event"] == "200" and a["gender"] == "male"]
    female200 = [a for a in all_athletes if a["event"] == "200" and a["gender"] == "female"]

    def athlete_to_js(a):
        achievements_js = json.dumps(a["achievements"], ensure_ascii=False)
        return f"""  {{
    name: {json.dumps(a["name"])},
    status: {json.dumps(a["status"])},
    pb: {json.dumps(a["pb"])},
    sb: "N/A",
    olympicRecord: "N/A",
    nationalRecord: "N/A",
    nationality: {json.dumps(a.get("nationality", "N/A"))},
    achievements: {achievements_js},
  }}"""

    def array_block(name, athletes):
        entries = ",\n".join(athlete_to_js(a) for a in athletes)
        return f"export const {name} = [\n{entries}\n];\n"

    js = '''// ================================================================
// athleteData.js — Auto-generated by scrape_world_athletics.py
// Source: World Athletics All-Time Top Lists
// Scraped: ''' + time.strftime("%Y-%m-%d") + '''
// Do not edit manually — re-run the scraper to update.
// ================================================================

export const STORAGE_KEYS = {
  CUSTOM_ATHLETES:    "custom-athletes",
  RECENT_SIMULATIONS: "recent-simulations",
};

export const PB_RANGES = {
  "100": { min: 9.5,  max: 20, label: "9.50s – 20.00s" },
  "200": { min: 19.0, max: 40, label: "19.00s – 40.00s" },
  "400": { min: 43.0, max: 90, label: "43.00s – 90.00s" },
};

'''
    js += array_block("male100Runners",   male100)
    js += "\n"
    js += array_block("female100Runners", female100)
    js += "\n"
    js += array_block("male200Runners",   male200)
    js += "\n"
    js += array_block("female200Runners", female200)
    js += """
// ── Helpers ──────────────────────────────────────────────────────

export const getStaticAthletes = () => [
  ...male100Runners.map(r   => ({ ...r, gender: "male",   event: "100", custom: false })),
  ...female100Runners.map(r => ({ ...r, gender: "female", event: "100", custom: false })),
  ...male200Runners.map(r   => ({ ...r, gender: "male",   event: "200", custom: false })),
  ...female200Runners.map(r => ({ ...r, gender: "female", event: "200", custom: false })),
];

export const getStaticByGenderAndEvent = (gender, event) => {
  if (event === "100") return gender === "male" ? male100Runners : female100Runners;
  if (event === "200") return gender === "male" ? male200Runners : female200Runners;
  return [];
};
"""
    return js

# ── Main ──────────────────────────────────────────────────────────

def main():
    all_athletes = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for target in TARGETS:
            athletes = scrape_category(page, target)
            all_athletes.extend(athletes)
            time.sleep(2)  # Polite delay between requests

        browser.close()

    if not all_athletes:
        print("\n✗ No athletes scraped. Check your internet connection or try again.")
        return

    # Save raw JSON for inspection
    with open("athletes_raw.json", "w", encoding="utf-8") as f:
        json.dump(all_athletes, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Raw data saved to athletes_raw.json ({len(all_athletes)} athletes)")

    # Save ready-to-use JS file
    js_output = build_js_output(all_athletes)
    with open("athleteData_scraped.js", "w", encoding="utf-8") as f:
        f.write(js_output)
    print("✓ athleteData_scraped.js saved — copy this into your project's data/ folder")

    # Summary
    print("\n── Summary ──────────────────────────────────────")
    for event in ["100", "200"]:
        for gender in ["male", "female"]:
            count = sum(1 for a in all_athletes if a["event"] == event and a["gender"] == gender)
            print(f"  {event}m {gender}: {count} athletes")
    print("─────────────────────────────────────────────────")

if __name__ == "__main__":
    main()
    