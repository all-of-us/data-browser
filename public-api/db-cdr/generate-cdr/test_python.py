import argparse
import csv
import os
import shutil
from google.cloud import bigquery
from io import StringIO

def init_bigquery_client():
    bigquery_client = bigquery.Client.from_service_account_json('/home/circleci/cdr-indices/ci/circle-sa-key.json')
    return bigquery_client

def main():
    # Set your project and dataset information
    output_project = "aou-db-prod"
    genomics_dataset = "2022q4r6_genomics"
    bq_project = "aou-res-curation-prod"
    bq_dataset = "2022q4r9_combined_release"

    bigquery_client = init_bigquery_client()

    query = (
        "SELECT count(*) FROM "
        "`aou-res-curation-prod.2022q4r9_combined_release.concept`"
    )
    query_job = bigquery_client.query(query)
    results =  query_job.result()

    for row in results:
        print(row)


if __name__ == '__main__':
    main()
    print("done")