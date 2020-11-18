#!/bin/bash

# Creates cloudsql count db from data in bucket

# Example usage, you need to provide a bunch of args
# ./project.rb generate-cloudsql-dbs --cdr-version 20180130 --bucket all-of-us-workbench-private

set -ex

export PROJECT=$1  # project
export INSTANCE=$2  # database instance
export DATABASE=$3 # cdr version
export BUCKET=$4 # bucket in which csvs are present

startDate=$(date)
echo " Starting generate-cloudsql-db $DATABASE from bucket $BUCKET $startDate"

SERVICE_ACCOUNT=$(gcloud config get-value account)

echo "********* Service account active $SERVICE_ACCOUNT **********"

startDate=$(date)
echo " Starting generate-cloudsql-db $DATABASE from bucket $BUCKET $startDate"


# Init the local database
echo "Initializing new  $DATABASE"
if ./generate-cdr/init-new-cdr-db.sh --drop-if-exists --cdr-db-name ${DATABASE}
then
  echo "Success"
else
  echo "Failed"
  exit 1
fi

# Make empty sql dump
if ./generate-cdr/make-mysqldump.sh --db-name $DATABASE --bucket $BUCKET
then
  echo "Success"
else
  echo "Failed"
  exit 1
fi

# Import Sql dump and data in bucket to cloudsql
if ./generate-cdr/cloudsql-import.sh --project $PROJECT --instance $INSTANCE --bucket $BUCKET \
    --database $DATABASE --create-db-sql-file $DATABASE.sql
then
  echo "Success"
else
  echo "Failed"
  exit 1
fi
stopDate=$(date)
echo "Start $startDate Stop: $stopDate"
echo $(date) " Finished generate-clousdsql-db "
