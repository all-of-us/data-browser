#!/bin/bash
# Rotates Cloud SQL passwords and gs://<project>-credentials/vars.env together.
#
#   app  = databrowser, liquibase, public (always one shared password)
#   root = root
#
# The old password keeps working (--retain-password) until you run --discard-old,
# so nothing breaks before the API is redeployed. See ROTATE_DB_PASSWORD.md.
#
#   ./rotate-db-password.sh --project aou-db-test --group app
#   ./rotate-db-password.sh --project aou-db-test --group app --discard-old
set -euo pipefail

PROJECT=""; GROUP=""; DISCARD=false
while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT=$2; shift 2 ;;
    --group) GROUP=$2; shift 2 ;;
    --discard-old) DISCARD=true; shift ;;
    *) echo "Usage: $0 --project <project> --group <app|root> [--discard-old]"; exit 1 ;;
  esac
done

case "$GROUP" in
  app)  USERS="databrowser liquibase public"
        KEYS="DATABROWSER_DB_PASSWORD LIQUIBASE_DB_PASSWORD PUBLIC_DB_PASSWORD" ;;
  root) USERS="root"; KEYS="MYSQL_ROOT_PASSWORD" ;;
  *) echo "--group must be app or root"; exit 1 ;;
esac
[ -n "$PROJECT" ] || { echo "--project is required"; exit 1; }

BUCKET="gs://${PROJECT}-credentials"
read -r -p "$($DISCARD && echo Discard old || echo Rotate) password for ${USERS} on ${PROJECT}? [y/N] " ok
[ "$ok" = "y" ] || exit 1

if $DISCARD; then
  for u in $USERS; do
    gcloud sql users set-password "$u" --host=% --instance=databrowsermaindb \
      --project="$PROJECT" --discard-dual-password
  done
  echo "Done. Only the new password works now."
  exit 0
fi

# New password: 24 chars with lower, upper, digit and '-'/'_' (Cloud SQL password policy).
while true; do
  NEW=$(openssl rand -base64 48 | tr '+/' '-_' | tr -dc 'A-Za-z0-9_-' | head -c 24)
  [[ $NEW =~ [a-z] && $NEW =~ [A-Z] && $NEW =~ [0-9] && $NEW =~ [_-] ]] && break
done

# Back up vars.env, then set the password on every user (old one stays valid).
gsutil -q cp "$BUCKET/vars.env" "$BUCKET/backups/vars.env.$(date -u +%Y%m%dT%H%M%SZ)"
for u in $USERS; do
  gcloud sql users set-password "$u" --host=% --instance=databrowsermaindb \
    --project="$PROJECT" --password="$NEW" --retain-password
done

# Write the same password to every key this bucket has, and upload.
gsutil cat "$BUCKET/vars.env" > /tmp/vars.env
for k in $KEYS; do
  sed -i "s|^${k}=.*|${k}=${NEW}|" /tmp/vars.env
done
gsutil -q cp /tmp/vars.env "$BUCKET/vars.env"
rm -f /tmp/vars.env

echo "Done."
if [ "$GROUP" = "app" ]; then
  [ "$PROJECT" = "aou-db-test" ] && TARGETS="aou-db-test aou-db-staging aou-db-stable" || TARGETS="$PROJECT"
  echo "Next, on your machine from data-browser/public-api, redeploy:"
  for p in $TARGETS; do
    echo "  ./project.rb deploy-public-api --project $p --version pw-rotation-$(date +%Y%m%d) --promote"
  done
  echo "Check the logs (see ROTATE_DB_PASSWORD.md), then run here:"
else
  echo "No redeploy needed. Next, run:"
fi
echo "  $0 --project ${PROJECT} --group ${GROUP} --discard-old"
