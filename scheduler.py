"""
RunPredict — Twice-Yearly Scheduler
=====================================
Runs the athlete data updater automatically in April and October.
Keep this script running in the background on your computer.

Run:
    python scheduler.py

To stop: press Ctrl+C
"""

import schedule
import time
from datetime import datetime
from auto_update import run_update

def job():
    month = datetime.now().month
    # Only run in April (4) and October (10)
    if month in [4, 10]:
        print(f"\n📅 Scheduled update triggered ({datetime.now().strftime('%B %Y')})")
        run_update()
    else:
        print(f"  Skipping — not April or October (current month: {datetime.now().strftime('%B')})")

# Check on the 1st of every month at 08:00
schedule.every().day.at("08:00").do(job)

print("RunPredict Scheduler running...")
print("Will update athletes in April and October at 08:00.")
print("Press Ctrl+C to stop.\n")

while True:
    schedule.run_pending()
    time.sleep(3600)  # Check every hour
