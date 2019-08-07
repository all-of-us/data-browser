#!/bin/bash

# This generates new mysql database for a research workspace directory

set -xeuo pipefail
IFS=$'\n\t'

USAGE="./init-new-rwd-db.sh [--drop-if-exists] --rwd-db-name public-rwd>"
DROP_IF_EXISTS="N"
RUN_LIST="schema"
CONTEXT=

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --rwd-db-name) RWD_DB_NAME=$2; shift 2;;
    --drop-if-exists) DROP_IF_EXISTS="Y"; shift 1;;
    --run-list) RUN_LIST=$2; shift 2;;
    --context) CONTEXT="-Pcontexts=$2"; shift 2;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

if [ -z "${RWD_DB_NAME}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi


# export for liquibase to use this
#export RWD_DB_NAME

# If RWD_DB_NAME matches ^public, we want to the public_db_user env var substituted in the create_db.sql
if [[ RWD_DB_NAME =~ ^public-rwd ]]
then
  echo "Working the public db init rwd"
  export META_DB_USER=$PUBLIC_DB_USER
  export META_DB_PASSWORD=$PUBLIC_DB_PASSWORD
fi

CREATE_DB_FILE=/tmp/create_db.sql

function finish {
  rm -f ${CREATE_DB_FILE}
}
trap finish EXIT

envsubst < create_db.sql > $CREATE_DB_FILE

# Drop and create new cdr database
if [ "${DROP_IF_EXISTS}" == "Y" ]
then
    echo "Dropping database $RWD_DB_NAME"
  mysql -h ${DB_HOST} --port ${DB_PORT} -u root -p${MYSQL_ROOT_PASSWORD} -e "drop database if exists $RWD_DB_NAME"
fi
echo "Creating database ..."
mysql -h ${DB_HOST} --port ${DB_PORT} -u root -p${MYSQL_ROOT_PASSWORD} < ${CREATE_DB_FILE}

# Use liquibase to generate the schema and data
echo "Running liquibase "
../gradlew update -PrunList=${RUN_LIST} ${CONTEXT}

# Success
exit 0
