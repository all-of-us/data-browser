#!/bin/bash

set -ex

export BRANCH=$1  # branch
export IMPORT_CDR_DATA=$2 # cdr build flag
export PROJECT=$3
export INSTANCE=$4
export DATABASE=$5
export BUCKET=$6

JSON_FMT='{"import_cdr_data": '$IMPORT_CDR_DATA',"project": "'"$PROJECT"'", "instance": "'"$INSTANCE"'", "database": "'"$DATABASE"'", "bucket": "'"$BUCKET"'"}'
CURL_DATA='{"branch": "'"$BRANCH"'", "parameters": '$JSON_FMT'}'

curl -X \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Circle-Token: $(cat ~/.circle-creds/key.txt)" \
-X POST --data "$(echo $CURL_DATA)" "https://circleci.com/api/v2/project/github/all-of-us/data-browser/pipeline"