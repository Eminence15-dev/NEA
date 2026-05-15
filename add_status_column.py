"""
RunPredict — Add Status Column to Excel
========================================
Adds or updates a Status column in your sprint dataset
based on a known list of retired and active athletes.

Run:
    python add_status_column.py
"""

import pandas as pd

# ── Config ────────────────────────────────────────────────────────
EXCEL_FILE = r"C:\Users\maxim\NEA\sprint_runners_100m_200m__4_.xlsx"

# ── Known Retired Athletes ────────────────────────────────────────
RETIRED_ATHLETES = {
    "Usain Bolt", "Tyson Gay", "Asafa Powell", "Justin Gatlin",
    "Yohan Blake", "Nesta Carter", "Michael Frater", "Walter Dix",
    "Michael Rodgers", "Ryan Bailey", "Dwain Chambers", "Adam Gemili",
    "Churandy Martina", "Richard Thompson", "Daniel Bailey",
    "Derrick Atkins", "Charles Silmon", "Christophe Lemaitre",
    "Wallace Spearmon", "Warren Weir", "Nickel Ashmeade",
    "Jason Livermore", "Kemar Bailey-Cole", "Jimmy Vicaut",
    "Reece Prescod", "Christian Coleman", "Divine Oduduru",
    "Gavin Smellie", "Jaysuma Saidy Ndure", "Justyn Warner",
    "Femi Seun Ogunode", "Bernardo Baloyes", "Jorge McFarlane",
    "Hugo Hollander", "Raymond Stewart", "Cristian Napoles",
    "Tosin Ogunode", "David Verburg", "Isiah Young",
    "Marcus Rowland", "Tobias Unger", "Alex Nelson",
    "Alex Quiñónez", "Alex Wilson", "Aaron Brown",
    "Alonso Edward", "Anaso Jobodwana", "Rasheed Dwyer",
    "Isaac Makwala", "Ramil Guliyev", "Wayde van Niekerk",
    "Nethaneel Mitchell-Blake", "Merlene Ottey", "Carmelita Jeter",
    "Veronica Campbell-Brown", "Elaine Thompson", "Blessing Okagbare",
    "Murielle Ahoure", "Dafne Schippers", "Allyson Felix",
    "Dina Asher-Smith", "Marie Josée Ta Lou-Smith",
    "Shelly-Ann Fraser-Pryce", "Mike Rodgers", "Robers Pérez",
    "Keston Bledman", "Ben Youssef Meité", "Kyle Ashworth",
    "Hansle Parchment",
}

# ── Known Active Athletes ─────────────────────────────────────────
ACTIVE_ATHLETES = {
    "Fred Kerley", "Noah Lyles", "Kishane Thompson", "Letsile Tebogo",
    "Marcell Jacobs", "Oblique Seville", "Ferdinand Omanyala",
    "Zharnel Hughes", "Akani Simbine", "Chijindu Ujah",
    "Su Bingtian", "Bingtian Su", "Henrico Bruintjies",
    "Henricho Bruintjies", "Alexander Ogando", "Kyree King",
    "Meshach Henry", "Erriyon Knighton", "Kenny Bednarek",
    "De'Vion Wilson", "Andre De Grasse", "Filippo Tortu",
    "Enoch Adegoke", "Ryota Yamagata", "Jak Ali Harvey",
    "Kaodi Assougba", "Yuki Koike", "Brandon Zipfel",
    "Kemar Hyman", "Trayvon Bromell", "Marvin Bracy",
    "Ronnie Baker", "Gabriel Constantino", "Bryce Deadmon",
    "Andrew Hudson", "Ackeem Blake", "Mouhamadou Fall",
    "Dominik Kopejtko", "Jereem Richards", "Abdul Hakim Sani Brown",
    "Elaine Thompson-Herah", "Julien Alfred", "Sha'Carri Richardson",
    "Melissa Jefferson", "Gabrielle Thomas", "Shericka Jackson",
    "Christine Mboma", "Brittany Brown", "Sifan Hassan",
    "Ferdinand Omanyala", "Chituru Ali", "Letsile Tebogo",
}

# ── Main ──────────────────────────────────────────────────────────
print("Loading Excel file...")
df = pd.read_excel(EXCEL_FILE)

def get_status(name):
    name = str(name).strip()
    if name in ACTIVE_ATHLETES:
        return "Active"
    elif name in RETIRED_ATHLETES:
        return "Retired"
    else:
        return "Unknown"

df["Status"] = df["Runner Name"].apply(get_status)

# Show any unknowns
unknowns = df[df["Status"] == "Unknown"]["Runner Name"].unique()
if len(unknowns) > 0:
    print(f"\n⚠️  {len(unknowns)} athletes with unknown status:")
    for name in unknowns:
        print(f"   - {name}")
    print("\nAdd these to RETIRED_ATHLETES or ACTIVE_ATHLETES in the script")

# Save back to Excel
df.to_excel(EXCEL_FILE, index=False)
print(f"\n✅ Status column added/updated — {len(df)} rows saved to {EXCEL_FILE}")
print("Now run upload_to_firestore.py to update Firestore.")
