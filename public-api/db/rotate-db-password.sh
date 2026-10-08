#!/bin/bash
# Rotates Cloud SQL MySQL passwords and the matching entries in the project's
# gs://<project>-credentials/vars.env, without downtime.
#
# Two groups:
#   app  - databrowser, liquibase and public. They always share one password
#          (DATABROWSER_DB_PASSWORD, LIQUIBASE_DB_PASSWORD, PUBLIC_DB_PASSWORD).
#   root - MYSQL_ROOT_PASSWORD, rotated on its own.
#
# Uses MySQL dual passwords: the new password is set with --retain-password, so the old
# one keeps working until every consumer has been redeployed. Then run again with
# --discard-old to invalidate the old password.
#
# Usage (Cloud Shell works; needs gcloud, gsutil, cloud-sql-proxy and mysql):
#   ./rotate-db-password.sh --project aou-db-test --group app
#   ...redeploy the API(s) the script lists...
#   ./rotate-db-password.sh --project aou-db-test --group app --discard-old
#
# Never prints a password. Do not run with `bash -x`.
set -euo pipefail

INSTANCE="databrowsermaindb"
PROXY_PORT=9475
PROJECT=""
GROUP=""
DISCARD_OLD=false

usage() {
  echo "Usage: $0 --project <aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod>" \
    "--group <app|root> [--discard-old]" >&2
  exit 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT=$2; shift 2 ;;
    --group) GROUP=$2; shift 2 ;;
    --discard-old) DISCARD_OLD=true; shift ;;
    *) usage ;;
  esac
done

case "$PROJECT" in
  aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod) ;;
  *) usage ;;
esac

# USERS[i] is stored in vars.env as VARS[i].
case "$GROUP" in
  app)
    USERS=(databrowser liquibase public)
    VARS=(DATABROWSER_DB_PASSWORD LIQUIBASE_DB_PASSWORD PUBLIC_DB_PASSWORD)
    # Staging and stable APIs connect to the public DB on the test instance with the
    # PUBLIC_DB_PASSWORD from aou-db-test's bucket, so a test rotation reaches them too.
    if [ "$PROJECT" = "aou-db-test" ]; then
      REDEPLOY="aou-db-test, aou-db-staging and aou-db-stable APIs"
    else
      REDEPLOY="${PROJECT} API"
    fi ;;
  root)
    USERS=(root)
    VARS=(MYSQL_ROOT_PASSWORD)
    REDEPLOY="none (scripts read MYSQL_ROOT_PASSWORD from the bucket at run time)" ;;
  *) usage ;;
esac

BUCKET_VARS="gs://${PROJECT}-credentials/vars.env"

if $DISCARD_OLD; then
  echo "Discarding the old password for ${USERS[*]} on ${PROJECT}:${INSTANCE}."
  echo "Every consumer must already be redeployed: ${REDEPLOY}."
  read -r -p "Continue? [y/N] " ok
  [ "$ok" = "y" ] || { echo "Aborted."; exit 1; }
  for u in "${USERS[@]}"; do
    gcloud sql users set-password "$u" --host=% --instance="$INSTANCE" \
      --project="$PROJECT" --discard-dual-password
  done
  echo "Done. Only the new password works now."
  exit 0
fi

# 24 characters from [A-Za-z0-9_-], regenerated until it has lowercase, uppercase, a digit
# and a symbol (the Cloud SQL password policy). '-' and '_' are safe in shell, sed and CI.
generate_password() {
  local pw
  while true; do
    # base64 output has no '-' or '_', so map its '+' and '/' onto them.
    pw=$(openssl rand -base64 48 | tr '+/' '-_' | tr -dc 'A-Za-z0-9_-' | head -c 24)
    if [[ ${#pw} -eq 24 && $pw =~ [a-z] && $pw =~ [A-Z] && $pw =~ [0-9] && $pw =~ [_-] ]]; then
      echo "$pw"
      return
    fi
  done
}

WORKDIR=$(mktemp -d)
PROXY_PID=""
cleanup() {
  [ -n "$PROXY_PID" ] && kill "$PROXY_PID" 2>/dev/null || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

# Logs in as $1 with password $2 through the proxy; prints only the matched account.
check_login() {
  MYSQL_PWD="$2" mysql --get-server-public-key -h127.0.0.1 -P"$PROXY_PORT" -u"$1" \
    -N -e "SELECT CURRENT_USER();" 2>/dev/null
}

echo "Rotating ${USERS[*]} on ${PROJECT}:${INSTANCE} (one shared password)."
echo "Consumers to redeploy afterwards: ${REDEPLOY}."
read -r -p "Continue? [y/N] " ok
[ "$ok" = "y" ] || { echo "Aborted."; exit 1; }

gsutil -q cp "$BUCKET_VARS" "$WORKDIR/vars.env"

# The current password is whichever of the group's vars this bucket holds; they must all
# agree. (Not every bucket has PUBLIC_DB_PASSWORD; staging and stable read test's.)
OLD_PW=""
PRESENT_VARS=()
for v in "${VARS[@]}"; do
  val=$(sed -n "s/^${v}=//p" "$WORKDIR/vars.env")
  [ -z "$val" ] && continue
  PRESENT_VARS+=("$v")
  if [ -z "$OLD_PW" ]; then
    OLD_PW=$val
  elif [ "$val" != "$OLD_PW" ]; then
    echo "${v} differs from ${PRESENT_VARS[0]} in ${BUCKET_VARS}; they must match. Nothing changed." >&2
    exit 1
  fi
done
if [ -z "$OLD_PW" ]; then
  echo "None of ${VARS[*]} found in ${BUCKET_VARS}; nothing changed." >&2
  exit 1
fi

cloud-sql-proxy "${PROJECT}:us-central1:${INSTANCE}" --port "$PROXY_PORT" \
  > "$WORKDIR/proxy.log" 2>&1 &
PROXY_PID=$!
sleep 4

# The bucket must match the database for every user before we touch anything, or
# retaining the "current" password would keep the wrong one alive.
for u in "${USERS[@]}"; do
  if ! check_login "$u" "$OLD_PW" > /dev/null; then
    echo "The bucket password does not log in as ${u}; nothing changed." >&2
    echo "Fix that mismatch first (proxy log: $(tail -1 "$WORKDIR/proxy.log"))." >&2
    exit 1
  fi
done

# Keep a dated backup of vars.env in the same bucket before changing it.
BACKUP="gs://${PROJECT}-credentials/backups/vars.env.$(date -u +%Y%m%dT%H%M%SZ)"
gsutil -q cp "$BUCKET_VARS" "$BACKUP"
echo "Backed up vars.env to ${BACKUP}"

NEW_PW=$(generate_password)
for u in "${USERS[@]}"; do
  gcloud sql users set-password "$u" --host=% --instance="$INSTANCE" \
    --project="$PROJECT" --password="$NEW_PW" --retain-password
  if ! check_login "$u" "$NEW_PW" > /dev/null; then
    echo "The new password does not log in as ${u}; vars.env NOT updated." >&2
    echo "Users already changed keep their old password too, so nothing is broken." >&2
    exit 1
  fi
done

cp "$WORKDIR/vars.env" "$WORKDIR/vars.env.new"
for v in "${PRESENT_VARS[@]}"; do
  sed -i.tmp "s|^${v}=.*|${v}=${NEW_PW}|" "$WORKDIR/vars.env.new"
done
CHANGED=$(diff "$WORKDIR/vars.env" "$WORKDIR/vars.env.new" | grep -c '^[<>]' || true)
if [ "$CHANGED" -ne $((2 * ${#PRESENT_VARS[@]})) ]; then
  echo "Unexpected vars.env edit; bucket NOT updated. New password is set (old one retained)." >&2
  echo "Restore it manually from ${BACKUP} if needed." >&2
  exit 1
fi
gsutil -q cp "$WORKDIR/vars.env.new" "$BUCKET_VARS"

# Confirm the uploaded file holds a password that works for every user.
UPLOADED_PW=$(gsutil cat "$BUCKET_VARS" | sed -n "s/^${PRESENT_VARS[0]}=//p")
for u in "${USERS[@]}"; do
  check_login "$u" "$UPLOADED_PW" > /dev/null \
    || { echo "Uploaded vars.env does not log in as ${u}; restore from ${BACKUP}." >&2; exit 1; }
done
echo "Verified: ${BUCKET_VARS} (${PRESENT_VARS[*]}) logs in as ${USERS[*]}."

check_login "${USERS[0]}" "$OLD_PW" > /dev/null \
  && echo "Old password still works (retained) until you run --discard-old."

unset OLD_PW NEW_PW UPLOADED_PW
echo
echo "Next:"
echo "  1. Redeploy: ${REDEPLOY}."
echo "  2. Check the API logs show 'HikariPool-1 - Start completed' with no 'Access denied'."
echo "  3. $0 --project ${PROJECT} --group ${GROUP} --discard-old"
