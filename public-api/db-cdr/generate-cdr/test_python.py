import argparse
import csv
import os
import shutil
from google.cloud import bigquery
from io import StringIO

def init_bigquery_client():
    bigquery_client = bigquery.Client.from_service_account_json('../circle-sa-key.json')
    return bigquery_client

# Define a custom sorting function based on mane transcript list
def custom_sort(row):
    if row['transcript'] in [tr['transcript'] for tr in distinct_transcripts]:
        return 1
    else:
        return 2

def main():
    # Set your project and dataset information
    output_project = "aou-db-prod"
    genomics_dataset = "2022q4r6_genomics"
    bq_project = "aou-res-curation-prod"
    bq_dataset = "2022q4r9_combined_release"
    bq_table = "delta_vat_v2"

    bigquery_client = init_bigquery_client()

    query = (
    "    SELECT "
             "vid as variant_id, gene_symbol, consequence,"
             "variant_type, aa_change as protein_change,"
             "contig, position, ref_allele, alt_allele, transcript,"
             "ARRAY_TO_STRING(consequence, ',') as cons_str, dna_change_in_transcript,"
             "clinvar_classification as clinical_significance,"
             "gvs_all_ac, gvs_all_an, gvs_all_af, dbsnp_rsid as rs_number,"
             "gvs_afr_ac, gvs_afr_an, gvs_afr_af,"
             "gvs_amr_ac, gvs_amr_an, gvs_amr_af,"
             "gvs_eas_ac, gvs_eas_an, gvs_eas_af,"
             "gvs_mid_ac, gvs_mid_an, gvs_mid_af,"
             "gvs_eur_ac, gvs_eur_an, gvs_eur_af,"
             "gvs_sas_ac, gvs_sas_an, gvs_sas_af,"
             "gvs_oth_ac, gvs_oth_an, gvs_oth_af,"
             "gvs_afr_sc, gvs_amr_sc, gvs_eas_sc, gvs_mid_sc,"
             "gvs_eur_sc, gvs_sas_sc, gvs_oth_sc, gvs_all_sc "
        "FROM `aou-res-curation-prod.{bq_dataset}.delta_vat_v2`"
        "WHERE (is_canonical_transcript OR transcript is NULL) and vid = '5-141516727-G-C'"
        .format(bq_dataset=bq_dataset)
    )

    query_job = bigquery_client.query(query)
    rows =  query_job.result()

    # Fetch distinct transcripts separately
    mane_transcripts_query = bigquery_client.query("SELECT DISTINCT transcript FROM aou-db-prod.2022q4r6_genomics.mane_transcripts")
    mane_transcripts = [row['transcript'] for row in mane_transcripts_query.result()]

    # Group genes by variant_id
    genes_dict = {}
    for row in rows:
        vid = row['variant_id']
        gene_symbol = row['gene_symbol']

        if vid not in genes_dict:
            genes_dict[vid] = set()
        if gene_symbol:
            genes_dict[vid].add(gene_symbol)

    print(genes_dict)
    print(mane_transcripts)


if __name__ == '__main__':
    main()
    print("done")