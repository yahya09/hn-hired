#!/bin/bash
# Fetch latest HN "Who's Hiring" posts and find unclassified ones.
# Runs daily at 8 AM via OpenClaw cron. AI classification happens in the cron task itself.

set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18 > /dev/null 2>&1

cd /home/yahya/.openclaw/workspace/hn-hired
export DATABASE_URL="postgresql://tokosehati:il4BLC8RI6rwbcW@localhost:5432/hnhired"

echo "[$(date -Iseconds)] Starting fetch..."

# Fetch latest posts from HN Firebase API
npm run manual-get-latest 2>&1 | tail -3

# Count new unclassified remote+SWE items
UNCLASSIFIED_COUNT=$(PGPASSWORD=il4BLC8RI6rwbcW psql -h localhost -U tokosehati -d hnhired -t -A -c "
  SELECT COUNT(*) FROM \"Item\"
  WHERE \"remote\" = true
    AND \"forMe\" = false
    AND \"updatedAt\" = \"createdAt\"
    AND \"text\" ~* '(software engineer|fullstack|full[- ]stack|backend|back[- ]end)'
")

echo "Unclassified remote+SWE items: $UNCLASSIFIED_COUNT"

if [ "$UNCLASSIFIED_COUNT" -eq 0 ]; then
  echo "Nothing new to classify."
  exit 0
fi

# Dump unclassified items for AI
PGPASSWORD=il4BLC8RI6rwbcW psql -h localhost -U tokosehati -d hnhired -t -A -c "
  SELECT json_agg(json_build_object('id', id, 'firebaseId', \"firebaseId\", 'company', company, 'text', SUBSTRING(text, 1, 500)))
  FROM \"Item\"
  WHERE \"remote\" = true
    AND \"forMe\" = false
    AND \"updatedAt\" = \"createdAt\"
    AND \"text\" ~* '(software engineer|fullstack|full[- ]stack|backend|back[- ]end)'
" > /tmp/hn-unclassified.json

echo "NEEDS_CLASSIFICATION:$UNCLASSIFIED_COUNT"
