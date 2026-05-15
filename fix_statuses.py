"""
RunPredict — Fix Athlete Statuses in Firestore
===============================================
Corrects Active/Retired status for all athletes in Firestore
using a known list of retired athletes.

Run:
    python fix_statuses.py
"""

import firebase_admin
from firebase_admin import credentials, firestore

# ── Config ────────────────────────────────────────────────────────
SERVICE_ACCOUNT = r"C:\Users\maxim\Downloads\runnertime-ef63a-firebase-adminsdk-fbsvc-fab08e0276.json"
COLLECTION_NAME = "athletes"

# ── Known Retired Athletes ────────────────────────────────────────
# Add any athlete name here (exactly as stored in Firestore)
# to mark them as Retired
RETIRED_ATHLETES = {
    # Legendary sprinters
    "Usain Bolt",
    "Tyson Gay",
    "Asafa Powell",
    "Justin Gatlin",
    "Yohan Blake",
    "Nesta Carter",
    "Michael Frater",
    "Walter Dix",
    "Michael Rodgers",
    "Ryan Bailey",
    "Dwain Chambers",
    "Adam Gemili",
    "Churandy Martina",
    "Richard Thompson",
    "Daniel Bailey",
    "Derrick Atkins",
    "Charles Silmon",
    "Christophe Lemaitre",
    "Wallace Spearmon",
    "Warren Weir",
    "Nickel Ashmeade",
    "Jason Livermore",
    "Kemar Bailey-Cole",
    "Andre De Grasse",
    "Jimmy Vicaut",
    "Reece Prescod",
    "Christian Coleman",
    "Divine Oduduru",
    "Ronnie Baker",
    "Trayvon Bromell",
    "Noah Lyles",
    "Mike Rodgers",
    "Gavin Smellie",
    "Jaysuma Saidy Ndure",
    "Justyn Warner",
    "Abdul Hakim Sani Brown",
    "Femi Seun Ogunode",
    "Bernardo Baloyes",
    "Jorge McFarlane",
    "Robers Pérez",
    "Hugo Hollander",
    "Raymond Stewart",
    "Cristian Napoles",
    "Tosin Ogunode",
    "David Verburg",
    "Isiah Young",
    "Marcus Rowland",
    "Tobias Unger",
    "Alex Nelson",
    "Alex Quiñónez",
    "Alex Wilson",
    "Aaron Brown",
    "Alonso Edward",
    "Anaso Jobodwana",
    "Rasheed Dwyer",
    "Isaac Makwala",
    "Ramil Guliyev",
    "Jereem Richards",
    "Wayde van Niekerk",
    "Nethaneel Mitchell-Blake",
    # Female retired
    "Merlene Ottey",
    "Carmelita Jeter",
    "Veronica Campbell-Brown",
    "Elaine Thompson",
    "Blessing Okagbare",
    "Murielle Ahoure",
    "Dafne Schippers",
    "Allyson Felix",
    "Dina Asher-Smith",
    "Marie Josée Ta Lou-Smith",
    "Shelly-Ann Fraser-Pryce",
}

# ── Known Active Athletes ─────────────────────────────────────────
# These will be forced to Active regardless of anything else
ACTIVE_ATHLETES = {
    "Fred Kerley",
    "Noah Lyles",
    "Kishane Thompson",
    "Letsile Tebogo",
    "Marcell Jacobs",
    "Oblique Seville",
    "Ferdinand Omanyala",
    "Zharnel Hughes",
    "Akani Simbine",
    "Chijindu Ujah",
    "Su Bingtian",
    "Bingtian Su",
    "Henrico Bruintjies",
    "Henricho Bruintjies",
    "Alexander Ogando",
    "Kyree King",
    "Meshach Henry",
    "Erriyon Knighton",
    "Kenny Bednarek",
    "De'Vion Wilson",
    "Andre De Grasse",
    "Filippo Tortu",
    "Enoch Adegoke",
    "Ryota Yamagata",
    "Jak Ali Harvey",
    "Kaodi Assougba",
    "Yuki Koike",
    "Brandon Zipfel",
    "Hansle Parchment",
    "Kemar Hyman",
    "Trayvon Bromell",
    "Marvin Bracy",
    "Ronnie Baker",
    "Fred Kerley",
    "Gabriel Constantino",
    "Bryce Deadmon",
    "Andrew Hudson",
    "Ackeem Blake",
    "Mouhamadou Fall",
    "Dominik Kopejtko",
    "Jereem Richards",
    # Female active
    "Elaine Thompson-Herah",
    "Julien Alfred",
    "Sha'Carri Richardson",
    "Melissa Jefferson",
    "Gabrielle Thomas",
    "Shericka Jackson",
    "Christine Mboma",
    "Brittany Brown",
    "Sifan Hassan",
}

# ── Initialise Firebase ───────────────────────────────────────────
def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred)
    return firestore.client()

# ── Fix Statuses ──────────────────────────────────────────────────
def fix_statuses(db):
    print("Loading athletes from Firestore...")
    snapshot = db.collection(COLLECTION_NAME).stream()
    docs = list(snapshot)
    print(f"Found {len(docs)} athletes\n")

    fixed    = 0
    skipped  = 0
    unknown  = []

    for doc in docs:
        data   = doc.to_dict()
        name   = data.get("name", "")
        current_status = data.get("status", "")

        if name in ACTIVE_ATHLETES:
            new_status = "Active"
        elif name in RETIRED_ATHLETES:
            new_status = "Retired"
        else:
            # Not in either list — keep current status but flag it
            unknown.append(f"{name} ({data.get('event')}m) — currently: {current_status}")
            skipped += 1
            continue

        if current_status != new_status:
            doc.reference.update({"status": new_status})
            print(f"  {'✓' if new_status == 'Active' else '✗'} {name} → {new_status}")
            fixed += 1
        else:
            skipped += 1

    print(f"\n✅ Done:")
    print(f"   Fixed:   {fixed} athletes")
    print(f"   Skipped: {skipped} (already correct or not in list)")

    if unknown:
        print(f"\n⚠️  {len(unknown)} athletes not in either list (status unchanged):")
        for u in unknown:
            print(f"   - {u}")
        print("\nAdd these to RETIRED_ATHLETES or ACTIVE_ATHLETES in fix_statuses.py")

# ── Main ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    db = init_firebase()
    fix_statuses(db)
