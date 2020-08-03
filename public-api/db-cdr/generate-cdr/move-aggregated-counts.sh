#!/bin/bash

# This moves aggregated count data csvs from prod bucket to test bucket to be imported to cloudsql

# End product is:
# 0) .csv of prod tables in a bucket

# Example usage, you need to provide a bunch of args
# ./project.rb move-aggregated-counts --prod-project aou-db-prod --test-project aou-db-test \
# --prod-bucket aou-db-prod-public-cloudsql --test-bucket aou-db-public-cloudsql --cdr-version p_2020q2_1

set -xeuo pipefail
IFS=$'\n\t'


USAGE="./generate-cdr/move-aggregated-counts --prod-project <PROD_PROJECT> --test-project <TEST_PROJECT> --prod-bucket <PROD_BUCKET> --test-bucket <TEST_BUCKET>"
USAGE="$USAGE --cdr-version=<CDR_VERSION>"
USAGE="$USAGE \n Aggregated Count generated csv data is moved to test bucket to be imported to cloudsql."

PROD_PROJECT="";
TEST_PROJECT="";
PROD_BUCKET="";
TEST_BUCKET="";
CDR_VERSION="";

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --prod-bucket) PROD_BUCKET=$2; shift 2;;
    --test-bucket) TEST_BUCKET=$2; shift 2;;
    --cdr-version) CDR_VERSION=$2; shift 2;;
    -- ) shift; echo -e "Usage: $USAGE"; break ;;
    * ) break ;;
  esac
done

if [ -z "${PROD_BUCKET}" ]
then
  echo -e "Usage: $USAGE"
  echo -e "Missing prod-bucket name"
  exit 1
fi

if [ -z "${TEST_BUCKET}" ]
then
  echo -e "Usage: $USAGE"
  echo -e "Missing test-bucket name"
  exit 1
fi

if [ -z "${CDR_VERSION}" ]
then
  echo -e "Usage: $USAGE"
  echo -e "Missing cdr-version name"
  exit 1
fi

startDate=$(date)
echo $(date) "Moving aggregated count data $startDate"

gsutil mv gs://${PROD_BUCKET}/${CDR_VERSION}/* gs://${TEST_BUCKET}/${CDR_VERSION}