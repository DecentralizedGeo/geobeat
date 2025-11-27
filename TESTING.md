# GEOBEAT Testing Checklist

Quick verification that everything works after cleanup.

## 1. Frontend Dashboard

### Start development server
```bash
cd src/frontend/geobeat-ui
npm run dev
```

**Expected**: Server starts at http://localhost:3000
**Check**:
- Homepage loads with hero animation
- Dashboard shows network cards
- Maps render (may show mock data)
- No console errors in browser

### TypeScript verification
```bash
cd src/frontend/geobeat-ui
npx tsc --noEmit
```

**Expected**: No errors (we just fixed these)

### Build for production
```bash
cd src/frontend/geobeat-ui
npm run build
```

**Expected**: Build succeeds, creates `.next` directory

### Linting
```bash
cd src/frontend/geobeat-ui
npm run lint
```

**Expected**: 19 warnings (mostly unused vars and console.log), 0 errors

## 2. Python Analysis Pipeline

### Verify imports
```bash
cd src/analysis
python -c "import gdi_standalone; import spatial_metrics; import models; import data_ingestion"
```

**Expected**: No import errors

### Run GDI calculation (if you have data)
```bash
cd src/analysis
python gdi_standalone.py
```

**Expected**:
- Processes networks
- Outputs scores to terminal
- Creates `../../data/gdi_results.json`
- Copies to `../../src/frontend/geobeat-ui/lib/data/gdi_results.json`

### Check Python syntax
```bash
cd src/analysis
python -m py_compile *.py
```

**Expected**: No syntax errors

## 3. Git & CI/CD

### Verify commits
```bash
git log --oneline -10
```

**Expected**: See recent cleanup commits:
- docs reorganization
- ESLint/Prettier
- ARCHITECTURE.md
- CI/CD workflow
- TypeScript fixes

### Check CI workflow exists
```bash
cat .github/workflows/ci.yml
```

**Expected**: File exists with frontend and Python jobs

### Test commit hooks (if Husky installed)
```bash
git commit --allow-empty -m "test: verify commit hooks"
```

**Expected**: Commitlint validates message format

## 4. Documentation

### Check docs structure
```bash
ls docs/
```

**Expected**:
```
DASHBOARD_UI_BEST_PRACTICES.md
DEMO_IMPLEMENTATION.md
PROPOSED_METHODOLOGY.md
README.md
```

### Verify no old files
```bash
ls docs/ | grep -E "FINAL|SIMPLE|REVIEW|SIMILARITY"
```

**Expected**: No matches (old files removed)

### Check architecture doc
```bash
cat ARCHITECTURE.md | head -20
```

**Expected**: Mermaid diagrams, system overview

## 5. Data Files

### Check if GDI results exist
```bash
cat data/gdi_results.json | head -30
```

**Expected**: JSON array with network objects (Ethereum, Polygon, Filecoin, etc.)

### Check frontend data copy
```bash
cat src/frontend/geobeat-ui/lib/data/gdi_results.json | head -30
```

**Expected**: Same JSON data as above

### If missing, check mock data
```bash
grep -l "mock" src/frontend/geobeat-ui/lib/*.ts
```

**Expected**: `mock-node-data.ts` exists as fallback

## 6. Dependencies

### Frontend dependencies
```bash
cd src/frontend/geobeat-ui
npm list --depth=0 | grep -E "next|react|typescript|eslint|prettier"
```

**Expected**:
- next@16.0.3
- react@19.2.0
- typescript@5.x
- eslint@9.39.1
- prettier@3.7.1

### Python dependencies (if using virtualenv)
```bash
pip list | grep -E "pandas|geopandas|h3|numpy|scipy"
```

**Expected**:
- pandas
- geopandas
- h3-py
- numpy
- scipy

## 7. Quick Full Stack Test

### Terminal 1: Start frontend
```bash
cd src/frontend/geobeat-ui
npm run dev
```

### Terminal 2: Generate fresh data (if you have CSV files)
```bash
cd src/analysis
python gdi_standalone.py
```

### Browser: Verify dashboard
1. Open http://localhost:3000
2. Check hero animation works
3. Navigate to /dashboard
4. Verify network cards show GDI scores
5. Check map renders

**Expected**: Dashboard shows data from `gdi_results.json`

## 8. README Badges

### Check CI badge (after first push)
```bash
# Push to GitHub
git push origin main

# Wait for CI to run, then check:
# https://github.com/DecentralizedGeo/geobeat/actions
```

**Expected**: CI workflow runs and badge in README.md updates

## Common Issues

### Issue: "Module not found" in frontend
**Fix**:
```bash
cd src/frontend/geobeat-ui
rm -rf node_modules package-lock.json
npm install
```

### Issue: Python import errors
**Fix**:
```bash
pip install -r requirements.txt
```

### Issue: TypeScript errors
**Fix**: We just fixed these! If new errors appear:
```bash
cd src/frontend/geobeat-ui
npx tsc --noEmit
# Read the errors and fix them
```

### Issue: ESLint errors
**Fix**: Run auto-fix:
```bash
cd src/frontend/geobeat-ui
npm run lint:fix
```

### Issue: No GDI data
**Fix**: Dashboard should use mock data automatically. Check:
```bash
grep -n "generateMockNodeData" src/frontend/geobeat-ui/lib/mock-node-data.ts
```

## Minimal Smoke Test (30 seconds)

If you just want to verify basics work:

```bash
# 1. Frontend compiles
cd src/frontend/geobeat-ui && npx tsc --noEmit && cd ../../..

# 2. Python imports work
cd src/analysis && python -c "import gdi_standalone" && cd ../..

# 3. Docs exist
ls docs/PROPOSED_METHODOLOGY.md docs/DEMO_IMPLEMENTATION.md

# 4. Architecture doc exists
ls ARCHITECTURE.md

# 5. CI workflow exists
ls .github/workflows/ci.yml
```

**Expected**: All commands succeed with no errors

## What Success Looks Like

✅ **Frontend**: Loads at localhost:3000, no TypeScript errors, builds successfully
✅ **Python**: Imports work, can run gdi_standalone.py (if you have data)
✅ **Docs**: Clean structure, no _FINAL or _SIMPLE files
✅ **Git**: Clean commits, CI workflow exists
✅ **Data**: Either real gdi_results.json or mock data fallback works

---

**If everything passes**: You're ready to demo/present! 🚀
**If something fails**: Check the "Common Issues" section above.
