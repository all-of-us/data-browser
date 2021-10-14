#!/bin/bash

# This generates new BigQuery dataset for use in cloudsql by the data browser
# and dumps csvs of that dataset to import to cloudsql

# End product is:
# 0) Big query dataset for cdr version publicYYYYMMDD
# 1) .csv of all the tables in a bucket

# Example usage, you need to provide a bunch of args
# ./project.rb generate-public-cdr-counts --bq-project all-of-us-ehr-dev --bq-dataset test_merge_dec26 \
# --public-project all-of-us-workbench-test --cdr-version 20180130 \
# --bucket all-of-us-workbench-cloudsql-create
# --gen-search-vat false

set -ex

export BQ_PROJECT=$1  # project
export BQ_DATASET=$2  # dataset
export PUBLIC_PROJECT=$3 # databrowser project
export CDR_VERSION=$4 # cdr version
export BUCKET=$5 # GCS bucket
export SEARCH_VAT=$6


if [ -z "${BIN_SIZE}" ]
then
  BIN_SIZE=20
fi

PUBLIC_DATASET=$CDR_VERSION

startDate=$(date)
echo $(date) "Starting generate-public-cdr-counts $startDate"

## Make public cdr count data
echo "Intermediary pre-binned count generation"
if ./generate-cdr/make-bq-data.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --output-project $PUBLIC_PROJECT \
 --output-dataset $PUBLIC_DATASET --cdr-version "$CDR_VERSION" --search-vat $SEARCH_VAT
then
    echo "BigQuery public data generated"
else
    echo "FAILED To generate BigQuery data for public $CDR_VERSION"
    exit 1
fi

## Make public cdr count data
echo "Making BigQuery public dataset"
if ./generate-cdr/make-bq-public-data.sh \
  --public-project $PUBLIC_PROJECT --public-dataset $PUBLIC_DATASET --bin-size $BIN_SIZE
then
    echo "BigQuery public data generated"
else
    echo "FAILED To generate public BigQuery data for public $CDR_VERSION"
    exit 1
fi

## Dump public cdr count data
echo "Dumping public dataset to .csv"
if ./generate-cdr/make-bq-data-dump.sh --dataset $PUBLIC_DATASET --project $PUBLIC_PROJECT --bucket $BUCKET
then
    echo "Public cdr count data dumped"
else
    echo "FAILED to dump Public cdr count data"
    exit 1
fi

echo "Moving aggregated counts data"
if ./generate-cdr/move-aggregated-counts.sh --prod-bucket $BUCKET --test-bucket aou-db-public-cloudsql --cdr-version $CDR_VERSION
then
    echo "Moved aggregated count data to test bucket"
else
    echo "FAILED to move aggregated count data"
    exit 1
fi

stopDate=$(date)
echo "Start $startDate Stop: $stopDate"
echo $(date) " Finished generate-public-cdr-counts "

