---
name: excel-skill
description: Automate Excel/spreadsheet transformations for data cleanup and restructuring. Use this skill when the user needs to clean Excel files by deleting columns, reordering fields, consolidating scattered data, deduplicating files, or preparing datasets for API integration. Applies especially to real estate databases (Sierra Blue), CRM data, or structured lead lists. Triggers on phrases like "clean up spreadsheet", "delete columns", "reorder data", "consolidate spreadsheet", "prepare Excel for [system]", or direct file upload with transformation requests.
compatibility: Python 3.8+, pandas, openpyxl
---

# Excel Data Transformation Skill

**Purpose:** Automate repetitive spreadsheet cleanup tasks without manual intervention.

**When to use:**
- Delete/drop specific columns
- Reorder column sequence
- Consolidate/merge scattered data
- Deduplicate files
- Prepare datasets for API/CRM integration
- Clean messy tabular data

---

## Quick Start

**Input:** Upload .xlsx file  
**Output:** Transformed .xlsx file (V2)  
**Process:** Automatic (no questions asked)

---

## Supported Transformations

### 1. Delete Columns
```
Delete: B, C, R (or any columns specified)
```

### 2. Reorder Columns
```
Priority order: Name, Mobile, Price, Rooms, Location, [other fields...]
```

### 3. Consolidate Data
Merge values from distant/scattered columns into unified fields.

### 4. Deduplicate
Remove duplicate files (e.g., "Alpha" versions).

### 5. Standardize Format
- Clean headers
- Trim whitespace
- Ensure consistent data types

---

## How It Works

1. **Load** the Excel file
2. **Parse** transformation rules from your request
3. **Execute** transformations (delete → reorder → consolidate)
4. **Validate** output (check for data loss, empty rows)
5. **Save** as V2 file

---

## Python Script

See `scripts/transform_excel.py` for the automated transformation logic.

**Usage:**
```bash
python scripts/transform_excel.py \
  --input input.xlsx \
  --delete-cols B,C,R \
  --reorder Name,Mobile,Price,Rooms,Location \
  --output output_v2.xlsx
```

---

## Example: Sierra Blue Real Estate Data

**Original:** 50 columns, scattered property data, duplicate "Alpha" file  
**Request:** Delete B, C, R | Reorder: Name, Mobile, Price, Rooms, Location | Consolidate scattered fields

**Output:** Clean, API-ready dataset with core fields first, 25-30 optimized columns

---

## Edge Cases Handled

- ✅ Missing columns (skipped gracefully)
- ✅ Empty rows (removed)
- ✅ Data in wrong columns (consolidated to correct field)
- ✅ Multiple sheets (processed first sheet only, warn on others)
- ✅ Special characters in headers (standardized)

---

## Notes

- Original file NOT modified (safe to reuse)
- Transformations are atomic (all-or-nothing)
- Output includes before/after row count summary
