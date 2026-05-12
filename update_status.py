import re

# Read the file
with open('src/data/athletedata.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all athlete objects and update their status based on year
# Pattern to match: ...year: YYYY,...status: "Active"
def replace_status(match):
    year_str = match.group(1)
    year = int(year_str)
    # Mark as Retired if year <= 2020 (6+ years ago from 2026)
    status = 'Retired' if year <= 2020 else 'Active'
    return f'year: {year_str},\n    status: "{status}"'

# Match the pattern: year: YYYY,\n    status: "Active"
pattern = r'year: (\d{4}),\n    status: "Active"'
updated_content = re.sub(pattern, replace_status, content)

# Write back
with open('src/data/athletedata.js', 'w', encoding='utf-8') as f:
    f.write(updated_content)

# Count the results
retired_count = updated_content.count('status: "Retired"')
active_count = updated_content.count('status: "Active"')
print(f'✓ Updated athletedata.js')
print(f'  Active: {active_count}')
print(f'  Retired: {retired_count}')
