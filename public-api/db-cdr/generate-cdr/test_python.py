import os
import shutil
from google.cloud import bigquery
from google.cloud import storage
from io import StringIO

def main():
    # Set your project and dataset information
    output_project = "aou-db-prod"
    genomics_dataset = "2022q4r6_genomics"
    bq_project = "aou-res-curation-prod"
    bq_dataset = "2022q4r9_combined_release"

    client = bigquery.Client(project="aou-db-prod")

    sql_query = f"""select count(*) from `aou-res-curation-prod.2022q4r9_combined_release.concept` """
    query_job = client.query(sql_query)

    results = query_job.result()

    for row in results:
        print(row)


if __name__ == '__main__':
    main()
    print("done")