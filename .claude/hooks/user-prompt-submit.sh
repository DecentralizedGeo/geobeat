#!/bin/bash
# User prompt submit hook - runs before each user prompt is processed
# Performs periodic bd hygiene checks

set -e

# Only run checks every 10th invocation to avoid spam
COUNTER_FILE="/tmp/geobeat-bd-check-counter"

# Initialize counter if it doesn't exist
if [ ! -f "$COUNTER_FILE" ]; then
    echo "0" > "$COUNTER_FILE"
fi

# Read and increment counter
COUNTER=$(cat "$COUNTER_FILE")
COUNTER=$((COUNTER + 1))
echo "$COUNTER" > "$COUNTER_FILE"

# Only run checks every 10 prompts
if [ $((COUNTER % 10)) -ne 0 ]; then
    exit 0
fi

# Check if beads is available
if ! command -v bd &> /dev/null; then
    exit 0
fi

# Check if .beads directory exists
if [ ! -d ".beads" ]; then
    exit 0
fi

# Run quick health check
echo ""
echo "🔍 Periodic bd health check (every 10 prompts)..."

# Check for large database
TOTAL_ISSUES=$(bd list --status=open --status=closed --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$TOTAL_ISSUES" -gt 200 ]; then
    echo "⚠️  Large issue database: $TOTAL_ISSUES issues"
    echo "   Recommend: bd cleanup --days 2 && bd sync"
fi

# Check for stale in-progress issues
IN_PROGRESS=$(bd list --status=in_progress --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$IN_PROGRESS" -gt 5 ]; then
    echo "⚠️  Many in-progress issues: $IN_PROGRESS"
    echo "   Consider closing completed ones: bd list --status=in_progress"
fi

# Quick doctor check (suppress output unless there are warnings)
BD_DOCTOR_OUTPUT=$(bd doctor 2>&1 || true)
if echo "$BD_DOCTOR_OUTPUT" | grep -q "⚠"; then
    echo "⚠️  bd doctor found issues - run: bd doctor --fix"
fi

echo ""
