#!/bin/bash
# Session start hook - runs when Claude Code session starts
# This hook provides context recovery and bd hygiene checks

set -e

# Color output helpers
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}# Beads Workflow Context${NC}"
echo ""

# Check if beads is available
if ! command -v bd &> /dev/null; then
    echo -e "${RED}⚠️  bd command not found - beads not installed?${NC}"
    exit 0
fi

# Check if .beads directory exists
if [ ! -d ".beads" ]; then
    echo -e "${YELLOW}⚠️  No .beads directory detected${NC}"
    exit 0
fi

echo -e "${GREEN}> Context Recovery:${NC} Run \`bd prime\` after compaction, clear, or new session"
echo "> Hooks auto-call this in Claude Code when .beads/ detected"
echo ""

# Run bd doctor for health checks
echo -e "${GREEN}> Running bd doctor...${NC}"
BD_DOCTOR_OUTPUT=$(bd doctor 2>&1 || true)

# Check for warnings/errors
if echo "$BD_DOCTOR_OUTPUT" | grep -q "⚠"; then
    echo -e "${YELLOW}⚠️  bd doctor found issues:${NC}"
    echo "$BD_DOCTOR_OUTPUT" | grep "⚠" || true
    echo ""
fi

# Run bd stats to show project health
echo -e "${GREEN}> Project Statistics:${NC}"
bd stats 2>&1 || true
echo ""

# Check if we need cleanup (>200 issues)
TOTAL_ISSUES=$(bd list --status=open --status=closed --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$TOTAL_ISSUES" -gt 200 ]; then
    echo -e "${YELLOW}⚠️  Large issue database detected ($TOTAL_ISSUES issues)${NC}"
    echo "   Consider running: bd cleanup --days 2 && bd sync"
    echo ""
fi

# Show ready work
echo -e "${GREEN}> Ready Work (no blockers):${NC}"
READY_COUNT=$(bd ready --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$READY_COUNT" -eq 0 ]; then
    echo "   No unblocked issues ready"
else
    echo "   $READY_COUNT issue(s) ready to work on"
    echo "   Run: bd ready"
fi
echo ""

# Check for in-progress work
IN_PROGRESS=$(bd list --status=in_progress --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$IN_PROGRESS" -gt 0 ]; then
    echo -e "${GREEN}> In Progress:${NC}"
    echo "   $IN_PROGRESS issue(s) currently in progress"
    echo "   Run: bd list --status=in_progress"
    echo ""
fi

# Session close protocol reminder
echo -e "${RED}# 🚨 SESSION CLOSE PROTOCOL 🚨${NC}"
echo ""
echo -e "${YELLOW}**CRITICAL**: Before saying \"done\" or \"complete\", you MUST run this checklist:${NC}"
echo ""
echo "\`\`\`"
echo "[ ] 1. git status              (check what changed)"
echo "[ ] 2. git add <files>         (stage code changes)"
echo "[ ] 3. bd sync                 (commit beads changes)"
echo "[ ] 4. git commit -m \"...\"     (commit code)"
echo "[ ] 5. bd sync                 (commit any new beads changes)"
echo "[ ] 6. git push                (push to remote)"
echo "\`\`\`"
echo ""
echo "**NEVER skip this.** Work is not done until pushed."
echo ""

# Core rules reminder
echo "## Core Rules"
echo "- Track ALL work in beads (no TodoWrite tool, no markdown TODOs)"
echo "- Use \`bd create\` to create issues, not TodoWrite tool"
echo "- Git workflow: hooks auto-sync, run \`bd sync\` at session end"
echo "- Session management: check \`bd ready\` for available work"
echo ""

# Essential commands quick reference
echo "## Essential Commands"
echo ""
echo "### Finding Work"
echo "- \`bd ready\` - Show issues ready to work (no blockers)"
echo "- \`bd list --status=open\` - All open issues"
echo "- \`bd list --status=in_progress\` - Your active work"
echo "- \`bd show <id>\` - Detailed issue view with dependencies"
echo ""
echo "### Creating & Updating"
echo "- \`bd create --title=\"...\" --type=task|bug|feature\` - New issue"
echo "- \`bd update <id> --status=in_progress\` - Claim work"
echo "- \`bd update <id> --assignee=username\` - Assign to someone"
echo "- \`bd close <id>\` - Mark complete"
echo "- \`bd close <id1> <id2> ...\` - Close multiple issues at once (more efficient)"
echo "- \`bd close <id> --reason=\"explanation\"\` - Close with reason"
echo "- **Tip**: When creating multiple issues/tasks/epics, use parallel subagents for efficiency"
echo ""
echo "### Dependencies & Blocking"
echo "- \`bd dep add <issue> <depends-on>\` - Add dependency (issue depends on depends-on)"
echo "- \`bd blocked\` - Show all blocked issues"
echo "- \`bd show <id>\` - See what's blocking/blocked by this issue"
echo ""
echo "### Sync & Collaboration"
echo "- \`bd sync\` - Sync with git remote (run at session end)"
echo "- \`bd sync --status\` - Check sync status without syncing"
echo ""
echo "### Project Health"
echo "- \`bd stats\` - Project statistics (open/closed/blocked counts)"
echo "- \`bd doctor\` - Check for issues (sync problems, missing hooks)"
echo ""

# Common workflows
echo "## Common Workflows"
echo ""
echo "**Starting work:**"
echo "\`\`\`bash"
echo "bd ready           # Find available work"
echo "bd show <id>       # Review issue details"
echo "bd update <id> --status=in_progress  # Claim it"
echo "\`\`\`"
echo ""
echo "**Completing work:**"
echo "\`\`\`bash"
echo "bd close <id1> <id2> ...    # Close all completed issues at once"
echo "bd sync                     # Push to remote"
echo "\`\`\`"
echo ""
echo "**Creating dependent work:**"
echo "\`\`\`bash"
echo "# Run bd create commands in parallel (use subagents for many items)"
echo "bd create --title=\"Implement feature X\" --type=feature"
echo "bd create --title=\"Write tests for X\" --type=task"
echo "bd dep add beads-yyy beads-xxx  # Tests depend on Feature (Feature blocks tests)"
echo "\`\`\`"
