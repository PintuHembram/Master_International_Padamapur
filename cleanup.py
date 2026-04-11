#!/usr/bin/env python3
with open(r'src\pages\AdminDashboard.tsx', 'r') as f:
    lines = f.readlines()

# Keep only first 229 lines
cleaned = lines[:229]

# Write back
with open(r'src\pages\AdminDashboard.tsx', 'w') as f:
    f.writelines(cleaned)

print('File cleaned - kept 229 lines')
