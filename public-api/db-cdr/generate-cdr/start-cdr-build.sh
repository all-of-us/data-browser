#!/bin/bash

set -ex

export BRANCH=$1  # branch
export BUILD_CDR_INDICES=$2 # cdr build flag
export CDR_SOURCE_PROJECT=$3
export CDR_SOURCE_DATASET=$4
export CDR_SQL_BUCKET=$5
export CDR_DESTINATION_PROJECT=$6
export CDR_VERSION_DB_NAME=$7

current_date_time="`date +%Y%m%d%H%M%S`";

JSON_FMT='{"build_cdr_indices": '$BUILD_CDR_INDICES',"cdr_source_project": "'"$CDR_SOURCE_PROJECT"'", "cdr_source_dataset": "'"$CDR_SOURCE_DATASET"'", "cdr_sql_bucket": "'"$CDR_SQL_BUCKET"'", "cdr_dest_project": "'"$CDR_DESTINATION_PROJECT"'", "cdr_version_db_name": "'"$CDR_VERSION_DB_NAME"'"}'
CURL_DATA='{"branch": "'"$BRANCH"'", "parameters": '$JSON_FMT'}'

curl -X \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Circle-Token: $(cat ~/.circle-creds/key.txt)" \
-X POST --data "$(echo $CURL_DATA)" "https://circleci.com/api/v2/project/github/all-of-us/data-browser/pipeline"