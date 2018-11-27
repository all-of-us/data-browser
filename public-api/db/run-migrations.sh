#!/bin/bash
set -xeuo pipefail
IFS=$'\n\t'

activity="-PrunList=$1"
if [ -z ${2+x} ]
then
    context=""
else
    context="-Pcontexts=$2"
fi

# Ruby is not installed in our dev container and this script is short, so bash is fine.

CREATE_DB_FILE=/tmp/create_db.sql
GRANT_PERMISSIONS_FILE=/tmp/grant_permissions.sql

function finish {
  rm -f ${CREATE_DB_FILE}
  rm -f ${GRANT_PERMISSIONS_FILE}
}
trap finish EXIT

envsubst < create_db.sql > $CREATE_DB_FILE
envsubst < grant_permissions.sql > $GRANT_PERMISSIONS_FILE

echo "Creating database if it does not exist..."
mysql -h ${DB_HOST} --port ${DB_PORT} -u root -p${MYSQL_ROOT_PASSWORD} < ${CREATE_DB_FILE}

echo "Upgrading database..."
../gradlew update $activity $context

mysql -h ${DB_HOST} --port ${DB_PORT} -u root -p${MYSQL_ROOT_PASSWORD} < ${GRANT_PERMISSIONS_FILE}