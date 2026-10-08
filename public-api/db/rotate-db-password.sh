#!/bin/bash
# Rotates a Cloud SQL MySQL user's password and the matching entry in the project's
# gs://<project>-credentials/vars.env, without downtime.
#
# Uses MySQL dual passwords: the new password is set with --retain-password, so the old
# one keeps working until every consumer has been redeployed. Then run again with
# --discard-old to invalidate the old password.
#
# Usage (Cloud Shell works; needs gcloud, gsutil, cloud-sql-proxy and mysql):
#   ./rotate-db-password.sh --project aou-db-test --user databrowser
#   ...redeploy the API(s) the script lists...
#   ./rotate-db-password.sh --project aou-db-test --user databrowser --discard-old
#
# Never prints a password. Do not run with `bash -x`.
set -euo pipefail

INSTANCE="databrowsermaindb"
PROXY_PORT=9475
PROJECT=""
DB_USER=""
DISCARD_OLD=false

usage() {
  echo "Usage: $0 --project <aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod>" \
    "--user <databrowser|liquibase|public|root> [--discard-old]" >&2
  exit 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT=$2; shift 2 ;;
    --user) DB_USER=$2; shift 2 ;;
    --discard-old) DISCARD_OLD=true; shift ;;
    *) usage ;;
  esac
done

case "$PROJECT" in
  aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod) ;;
  *) usage ;;
esac

case "$DB_USER" in
  databrowser) VAR=DATABROWSER_DB_PASSWORD ;;
  liquibase) VAR=LIQUIBASE_DB_PASSWORD ;;
  public) VAR=PUBLIC_DB_PASSWORD ;;
  root) VAR=MYSQL_ROOT_PASSWORD ;;
  *) usage ;;
esac

BUCKET_VARS="gs://${PROJECT}-credentials/vars.env"

# Who must be redeployed after rotating this user. The public user on the test instance
# is shared: staging and stable read PUBLIC_DB_PASSWORD from aou-db-test's bucket.
case "$DB_USER" in
  root|liquibase) REDEPLOY="none (scripts read ${VAR} from ${BUCKET_VARS} at run time)" ;;
  public)
    if [ "$PROJECT" = "aou-db-test" ]; then
      REDEPLOY="aou-db-test, aou-db-staging and aou-db-stable APIs"
    else
      REDEPLOY="${PROJECT} API"
    fi ;;
  databrowser) REDEPLOY="${PROJECT} API" ;;
esac

if $DISCARD_OLD; then
  echo "Discarding the old password for '${DB_USER}'@'%' on ${PROJECT}:${INSTANCE}."
  echo "Every consumer must already be redeployed: ${REDEPLOY}."
  read -r -p "Continue? [y/N] " ok
  [ "$ok" = "y" ] || { echo "Aborted."; exit 1; }
  gcloud sql users set-password "$DB_USER" --host=% --instance="$INSTANCE" \
    --project="$PROJECT" --discard-dual-password
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

echo "Rotating '${DB_USER}'@'%' on ${PROJECT}:${INSTANCE} (vars.env key ${VAR})."
echo "Consumers to redeploy afterwards: ${REDEPLOY}."
read -r -p "Continue? [y/N] " ok
[ "$ok" = "y" ] || { echo "Aborted."; exit 1; }

gsutil -q cp "$BUCKET_VARS" "$WORKDIR/vars.env"
OLD_PW=$(sed -n "s/^${VAR}=//p" "$WORKDIR/vars.env")
if [ -z "$OLD_PW" ]; then
  echo "No ${VAR} line in ${BUCKET_VARS}; nothing changed." >&2
  exit 1
fi

cloud-sql-proxy "${PROJECT}:us-central1:${INSTANCE}" --port "$PROXY_PORT" \
  > "$WORKDIR/proxy.log" 2>&1 &
PROXY_PID=$!
sleep 4

# The bucket must match the database before we touch anything, or retaining the "current"
# password would keep the wrong one alive.
if ! check_login "$DB_USER" "$OLD_PW" > /dev/null; then
  echo "The ${VAR} in ${BUCKET_VARS} does not log in as ${DB_USER}; nothing changed." >&2
  echo "Fix that mismatch first (see proxy log: $(tail -1 "$WORKDIR/proxy.log"))." >&2
  exit 1
fi

# Keep a dated backup of vars.env in the same bucket before changing it.
BACKUP="gs://${PROJECT}-credentials/backups/vars.env.$(date -u +%Y%m%dT%H%M%SZ)"
gsutil -q cp "$BUCKET_VARS" "$BACKUP"
echo "Backed up vars.env to ${BACKUP}"

NEW_PW=$(generate_password)
gcloud sql users set-password "$DB_USER" --host=% --instance="$INSTANCE" \
  --project="$PROJECT" --password="$NEW_PW" --retain-password

if ! check_login "$DB_USER" "$NEW_PW" > /dev/null; then
  echo "The new password does not log in; vars.env NOT updated. The old password still works." >&2
  exit 1
fi

sed "s|^${VAR}=.*|${VAR}=${NEW_PW}|" "$WORKDIR/vars.env" > "$WORKDIR/vars.env.new"
if [ "$(diff "$WORKDIR/vars.env" "$WORKDIR/vars.env.new" | grep -c '^[<>]')" -ne 2 ]; then
  echo "Unexpected vars.env edit; bucket NOT updated. New password is set (old one retained)." >&2
  echo "Restore it manually from ${BACKUP} if needed." >&2
  exit 1
fi
gsutil -q cp "$WORKDIR/vars.env.new" "$BUCKET_VARS"

# Confirm the uploaded file holds a password that works.
UPLOADED_PW=$(gsutil cat "$BUCKET_VARS" | sed -n "s/^${VAR}=//p")
check_login "$DB_USER" "$UPLOADED_PW" > /dev/null \
  && echo "Verified: ${BUCKET_VARS} now logs in as ${DB_USER}." \
  || { echo "Uploaded vars.env does not log in; restore from ${BACKUP}." >&2; exit 1; }

check_login "$DB_USER" "$OLD_PW" > /dev/null \
  && echo "Old password still works (retained) until you run --discard-old."

unset OLD_PW NEW_PW UPLOADED_PW
echo
echo "Next:"
echo "  1. Redeploy: ${REDEPLOY}."
echo "  2. Check the API logs show 'HikariPool-1 - Start completed' with no 'Access denied'."
echo "  3. $0 --project ${PROJECT} --user ${DB_USER} --discard-old"
