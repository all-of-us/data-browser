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
def custom_sort(row, mane_transcripts):
    if any(row['transcript'].startswith(prefix) for prefix in mane_transcripts):
        return 1
    else:
        return 2

# Define a custom sorting function based on calculated consequence
def custom_sort_consequence(row):
    consequence_order = [
        'transcript_ablation', 'splice_acceptor_variant', 'splice_donor_variant', 'stop_gained',
        'frameshift_variant', 'stop_lost', 'start_lost', 'transcript_amplification',
        'feature_elongation', 'feature_truncation', 'inframe_insertion', 'inframe_deletion',
        'missense_variant', 'protein_altering_variant', 'splice_donor_5th_base_variant',
        'splice_region_variant', 'splice_donor_region_variant', 'splice_polypyrimidine_tract_variant',
        'incomplete_terminal_codon_variant', 'start_retained_variant', 'stop_retained_variant',
        'synonymous_variant', 'coding_sequence_variant', 'mature_miRNA_variant', '5_prime_UTR_variant',
        '3_prime_UTR_variant', 'non_coding_transcript_exon_variant', 'NMD_transcript_variant',
        'non_coding_transcript_variant', 'coding_transcript_variant', 'upstream_gene_variant',
        'downstream_gene_variant', 'TFBS_ablation', 'TFBS_amplification', 'TF_binding_site_variant',
        'regulatory_region_ablation', 'regulatory_region_amplification', 'regulatory_region_variant',
        'intergenic_variant', 'sequence_variant'
    ]

    # Extract consequences from the list
    consequences = row['consequence'] if row['consequence'] else []

    # Check if any consequence is in the order list
    for consequence in consequences:
        if consequence and consequence.lower() in consequence_order:
            return consequence_order.index(consequence.lower()) + 1

    return len(consequence_order) + 1  # If not found, place it at the end

def main():
    # Set your project and dataset information
    output_project = "aou-db-prod"
    genomics_dataset = "2022q4r6_genomics"
    output_table = "wgs_python_test"
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
    rows =  list(query_job.result())

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


    # Sort the rows based on custom sorting
    sorted_rows = sorted(rows, key=lambda x: (x['variant_id'], custom_sort(x, mane_transcripts), custom_sort_consequence(x), x['transcript']))

    # Create a list to store the final result with 'row_number'
    result_with_row_number = []

    # Iterate through the sorted rows and add 'row_number' to each row
    current_variant_id = None
    current_row_number = 1

    for row in sorted_rows:
        if row['variant_id'] != current_variant_id:
            current_variant_id = row['variant_id']
            current_row_number = 1
        else:
            current_row_number += 1

        # Create a new dictionary with the additional 'row_number' field
        row_with_number = dict(row)
        row_with_number['row_number'] = current_row_number
        result_with_row_number.append(row_with_number)

    # Now 'result_with_row_number' contains the result with the added 'row_number' field

    # Filter rows with row_number equal to 1 or transcript being null
    filtered_rows = [row for row in result_with_row_number if row['row_number'] == 1 or row['transcript'] is None]

    # Combine gene information
    for row in filtered_rows:
        vid = row['variant_id']
        row['homozygote_count'] = row['gvs_all_ac'] - row['gvs_all_sc']
        row['gvs_afr_hc'] = row['gvs_afr_ac'] - row['gvs_afr_sc']
        row['gvs_amr_hc'] = row['gvs_amr_ac'] - row['gvs_amr_sc']
        row['gvs_eas_hc'] = row['gvs_eas_ac'] - row['gvs_eas_sc']
        row['gvs_mid_hc'] = row['gvs_mid_ac'] - row['gvs_mid_sc']
        row['gvs_eur_hc'] = row['gvs_eur_ac'] - row['gvs_eur_sc']
        row['gvs_sas_hc'] = row['gvs_sas_ac'] - row['gvs_sas_sc']
        row['gvs_oth_hc'] = row['gvs_oth_ac'] - row['gvs_oth_sc']

        if vid in genes_dict:
            row['genes'] = ', '.join(sorted(genes_dict[vid]))

    print(filtered_rows)

    schema = [
        bigquery.SchemaField("variant_id", "STRING"),
        bigquery.SchemaField("gene_symbol", "STRING"),
        bigquery.SchemaField("consequence", "STRING"),
        bigquery.SchemaField("variant_type", "STRING"),
        bigquery.SchemaField("protein_change", "STRING"),
        bigquery.SchemaField("dna_change", "STRING"),
        bigquery.SchemaField("allele_count", "INTEGER"),
        bigquery.SchemaField("allele_number", "INTEGER"),
        bigquery.SchemaField("allele_frequency", "FLOAT"),
        bigquery.SchemaField("clinical_significance", "STRING", mode="REPEATED" ),
        bigquery.SchemaField("rs_number", "STRING", mode="REPEATED"),
        bigquery.SchemaField("transcript", "STRING"),
        bigquery.SchemaField("gvs_afr_ac", "INTEGER"),
        bigquery.SchemaField("gvs_afr_an", "INTEGER"),
        bigquery.SchemaField("gvs_afr_af", "FLOAT"),
        bigquery.SchemaField("gvs_amr_ac", "INTEGER"),
        bigquery.SchemaField("gvs_amr_an", "INTEGER"),
        bigquery.SchemaField("gvs_amr_af", "FLOAT"),
        bigquery.SchemaField("gvs_eas_ac", "INTEGER"),
        bigquery.SchemaField("gvs_eas_an", "INTEGER"),
        bigquery.SchemaField("gvs_eas_af", "FLOAT"),
        bigquery.SchemaField("gvs_mid_ac", "INTEGER"),
        bigquery.SchemaField("gvs_mid_an", "INTEGER"),
        bigquery.SchemaField("gvs_mid_af", "FLOAT"),
        bigquery.SchemaField("gvs_eur_ac", "INTEGER"),
        bigquery.SchemaField("gvs_eur_an", "INTEGER"),
        bigquery.SchemaField("gvs_eur_af", "FLOAT"),
        bigquery.SchemaField("gvs_sas_ac", "INTEGER"),
        bigquery.SchemaField("gvs_sas_an", "INTEGER"),
        bigquery.SchemaField("gvs_sas_af", "FLOAT"),
        bigquery.SchemaField("gvs_oth_ac", "INTEGER"),
        bigquery.SchemaField("gvs_oth_an", "INTEGER"),
        bigquery.SchemaField("gvs_oth_af", "FLOAT"),
        bigquery.SchemaField("gvs_all_ac", "INTEGER"),
        bigquery.SchemaField("gvs_all_an", "INTEGER"),
        bigquery.SchemaField("gvs_all_af", "FLOAT"),
        bigquery.SchemaField("homozygote_count", "INTEGER"),
        bigquery.SchemaField("gvs_afr_hc", "INTEGER"),
        bigquery.SchemaField("gvs_amr_hc", "INTEGER"),
        bigquery.SchemaField("gvs_eas_hc", "INTEGER"),
        bigquery.SchemaField("gvs_mid_hc", "INTEGER"),
        bigquery.SchemaField("gvs_eur_hc", "INTEGER"),
        bigquery.SchemaField("gvs_sas_hc", "INTEGER"),
        bigquery.SchemaField("gvs_oth_hc", "INTEGER"),
        bigquery.SchemaField("contig", "STRING"),
        bigquery.SchemaField("position", "INTEGER"),
        bigquery.SchemaField("ref_allele", "STRING"),
        bigquery.SchemaField("alt_allele", "STRING"),
        bigquery.SchemaField("cons_str", "STRING"),
        bigquery.SchemaField("genes", "STRING")
      ]

    # Create a new list for rows to be inserted into the BigQuery table
    rows_to_insert = []

    # Prepare rows for insertion
    for row in filtered_rows:
        new_row = [row.get(field.name, None) for field in schema]
        rows_to_insert.append(new_row)

    # Create the table if it does not exist
    table_ref = bigquery_client.dataset(genomics_dataset).table(output_table)
    table = bigquery.Table(table_ref, schema=schema)
    table = bigquery_client.create_table(table, exists_ok=True)

    # Insert rows into the table
    errors = bigquery_client.insert_rows(table, rows_to_insert)

    if errors:
        print(f"Errors occurred during insertion: {errors}")
    else:
        print("Table created and rows inserted successfully.")




if __name__ == '__main__':
    main()
    print("done")