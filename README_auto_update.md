# RunPredict — Auto-Update System

## What this does
Scrapes World Athletics for the latest 100m and 200m results twice a year
(April and October), updates existing athletes in Firestore if they've run
a faster time, and adds new athletes automatically.

---

## Setup

### Step 1 — Install dependencies
```bash
pip install requests beautifulsoup4 firebase-admin schedule --break-system-packages
```

### Step 2 — Check your service account key path
Open `auto_update.py` and make sure `SERVICE_ACCOUNT` points to your
Firebase key file:
```python
SERVICE_ACCOUNT = r"C:\Users\maxim\Downloads\runnertime-ef63a-firebase-adminsdk-fbsvc-fab08e0276.json"
```

---

## Running manually (one-off update)
```bash
python auto_update.py
```
Run this any time you want to pull the latest results — for example
after the Olympics or World Championships.

---

## Running on a schedule (twice a year)
```bash
python scheduler.py
```
Keep this running in the background. It checks the date every hour
and triggers an update automatically on the 1st of April and October.

---

## What gets updated
- **Existing athletes** — raceTime updated only if the new result is faster
- **New athletes** — added automatically if not already in Firestore
- **Achievements** — new result appended to the athlete's achievements list
- **Update log** — every run is logged to Firestore under `update-log`

## What does NOT change
- Custom athletes added by users
- Recent simulations
- Any manually entered data

---

## Important notes

1. **World Athletics may block scrapers** — if the scraper stops working,
   the website may have changed its HTML structure. You'll need to inspect
   the page and update the column indices in `auto_update.py`.

2. **Altitude, temperature, humidity** — these are not available from the
   World Athletics top list. New athletes will be added with default values
   (altitude: 0, temperature: 20°C, humidity: 60%). Update these manually
   in your Excel file and re-run `upload_to_firestore.py` if needed.

3. **Rate limiting** — the scraper waits 2 seconds between requests to
   avoid being blocked by World Athletics.

---

## For your NEA write-up

> "An automatic data update system was developed using Python. A web scraper
> built with BeautifulSoup fetches the latest sprint results from the World
> Athletics top list twice yearly — in April at the start of the outdoor
> season and in October at the end. The system updates existing athletes
> if a faster time has been recorded and adds new athletes automatically.
> Each update run is logged to Firestore for audit purposes. This eliminates
> the need for manual dataset maintenance while keeping the platform current
> with real-world performance data."
