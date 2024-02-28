import argparse
import csv
import os
import shutil
from google.cloud import bigquery
from io import StringIO

def init_bigquery_client():
    bigquery_client = bigquery.Client.from_service_account_json('../circle-sa-key.json')
    return bigquery_client

def main():
    # Set your project and dataset information
    output_project = "aou-db-prod"
    genomics_dataset = "2022q4r6_genomics"
    bq_project = "aou-res-curation-prod"
    bq_dataset = "2022q4r9_combined_release"
    bq_table = "delta_vat_v2"

    bigquery_client = init_bigquery_client()
    """

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
    results =  query_job.result()

    for row in results:
        print(row)

    """

    df = pd.read_gbq(f'''
        SELECT
            vid as variant_id, gene_symbol, consequence,
            variant_type, aa_change as protein_change,
            contig, position, ref_allele, alt_allele, transcript,
            ARRAY_TO_STRING(consequence, ',') as cons_str, dna_change_in_transcript,
            clinvar_classification as clinical_significance,
            gvs_all_ac, gvs_all_an, gvs_all_af, dbsnp_rsid as rs_number,
            gvs_afr_ac, gvs_afr_an, gvs_afr_af,
            gvs_amr_ac, gvs_amr_an, gvs_amr_af,
            gvs_eas_ac, gvs_eas_an, gvs_eas_af,
            gvs_mid_ac, gvs_mid_an, gvs_mid_af,
            gvs_eur_ac, gvs_eur_an, gvs_eur_af,
            gvs_sas_ac, gvs_sas_an, gvs_sas_af,
            gvs_oth_ac, gvs_oth_an, gvs_oth_af,
            gvs_afr_sc, gvs_amr_sc, gvs_eas_sc, gvs_mid_sc,
            gvs_eur_sc, gvs_sas_sc, gvs_oth_sc, gvs_all_sc
        FROM `{bq_project}.{bq_dataset}.{bq_table}`
        WHERE is_canonical_transcript OR transcript is NULL
    ''', project_id=bq_project, dialect='standard')

    # Group by variant_id and aggregate genes column
    genes_df = df.groupby('variant_id')['gene_symbol'].agg(lambda x: ', '.join(sorted(set(x))))

    print(genes_df)



if __name__ == '__main__':
    main()
    print("done")