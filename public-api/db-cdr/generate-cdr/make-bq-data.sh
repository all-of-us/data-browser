#!/bin/bash

# This generates big query count databases cdr that get put in cloudsql for workbench

set -xeuo pipefail
IFS=$'\n\t'

# get options
# --project=all-of-us-workbench-test *required

# --cdr=cdr_version ... *optional
USAGE="./generate-clousql-cdr/make-bq-data.sh --bq-project <PROJECT> --bq-dataset <DATASET> --output-project <PROJECT> --output-dataset <DATASET>"
USAGE="$USAGE --cdr-version=YYYYMMDD --search-vat <SEARCH_VAT>"

while [ $# -gt 0 ]; do
  echo "1 is $1"

  case "$1" in
    --bq-project) BQ_PROJECT=$2; shift 2;;
    --bq-dataset) BQ_DATASET=$2; shift 2;;
    --output-project) OUTPUT_PROJECT=$2; shift 2;;
    --output-dataset) OUTPUT_DATASET=$2; shift 2;;
    --cdr-version) CDR_VERSION=$2; shift 2;;
    --search-vat) SEARCH_VAT=$2; shift 2;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done


if [ -z "${BQ_PROJECT}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

if [ -z "${BQ_DATASET}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

if [ -z "${OUTPUT_PROJECT}" ] || [ -z "${OUTPUT_DATASET}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

gcloud config set project aou-db-test

# Check that bq_dataset exists and exit if not
datasets=$(bq --project=$BQ_PROJECT ls --max_results=500)
if [ -z "$datasets" ]
then
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi
re=\\b$BQ_DATASET\\b
if [[ $datasets == *"$BQ_DATASET"* ]]; then
  echo "$BQ_PROJECT.$BQ_DATASET exists. Good. Carrying on."
else
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi

# Make dataset for cdr cloudsql tables
datasets=$(bq --project_id=$OUTPUT_PROJECT ls --max_results=100)
re=\\b$OUTPUT_DATASET\\b
if [[ $datasets == *"$OUTPUT_DATASET"* ]]; then
  echo "$OUTPUT_DATASET exists"
else
  echo "Creating $OUTPUT_DATASET"
  bq --project_id=$OUTPUT_PROJECT mk $OUTPUT_DATASET
fi

GENOMICS_DATASET="2022q4r6_genomics"

#Check if tables to be copied over exists in bq project dataset
tables=$(bq --project_id=$BQ_PROJECT --dataset=$BQ_DATASET ls --max_results=100)
cb_cri_table_check=\\bcb_criteria\\b
cb_cri_attr_table_check=\\bcb_criteria_attribute\\b
cb_cri_rel_table_check=\\bcb_criteria_relationship\\b
cb_cri_anc_table_check=\\bcb_criteria_ancestor\\b

# Create bq tables we have json schema for
schema_path=generate-cdr/bq-schemas
create_tables=(achilles_analysis achilles_results achilles_results_concept achilles_results_dist concept concept_relationship cb_criteria cb_criteria_attribute cb_criteria_relationship cb_criteria_ancestor
domain_info survey_module domain vocabulary concept_synonym domain_vocabulary_info unit_map filter_conditions criteria_stratum source_standard_unit_map measurement_concept_info survey_metadata pfhh_qa_metadata)

for t in "${create_tables[@]}"
do
    bq --project_id=$OUTPUT_PROJECT rm -f $OUTPUT_DATASET.$t
    bq --quiet --project_id=$OUTPUT_PROJECT mk --schema=$schema_path/$t.json $OUTPUT_DATASET.$t
done

# Populate some tables from cdr data

# Load tables from csvs we have. This is not cdr data but meta data needed for databrowser app
load_tables=(domain_info survey_module achilles_analysis achilles_results unit_map filter_conditions source_standard_unit_map survey_metadata pfhh_qa_metadata)
csv_path=generate-cdr/csv
for t in "${load_tables[@]}"
do
    bq --project_id=$OUTPUT_PROJECT load --quote='"' --source_format=CSV --skip_leading_rows=1 --max_bad_records=10 $OUTPUT_DATASET.$t $csv_path/$t.csv
done

if [ "$SEARCH_VAT" = true ]; then
  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "DROP MATERIALIZED VIEW IF EXISTS \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant_mv_1\`"

  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "DROP MATERIALIZED VIEW IF EXISTS \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant_mv_2\`"

  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "DROP TABLE IF EXISTS \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant\`"

  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "CREATE TABLE \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant\`
  cluster by variant_id
  as
  WITH sorted_transcripts as (SELECT vid as variant_id, gene_symbol as gene_symbol, consequence,
  variant_type as variant_type, aa_change as protein_change,
  contig, position, ref_allele, alt_allele, transcript, ARRAY_TO_STRING(consequence, ',') as cons_str, dna_change_in_transcript, clinvar_classification as clinical_significance,
  gvs_all_ac, gvs_all_an, gvs_all_af, dbsnp_rsid as rs_number,
  gvs_afr_ac, gvs_afr_an, gvs_afr_af,
  gvs_amr_ac, gvs_amr_an, gvs_amr_af,
  gvs_eas_ac, gvs_eas_an, gvs_eas_af,
  gvs_mid_ac, gvs_mid_an, gvs_mid_af,
  gvs_eur_ac, gvs_eur_an, gvs_eur_af,
  gvs_sas_ac, gvs_sas_an, gvs_sas_af,
  gvs_oth_ac, gvs_oth_an, gvs_oth_af,
  gvs_afr_sc,
  gvs_amr_sc,
  gvs_eas_sc,
  gvs_mid_sc,
  gvs_eur_sc,
  gvs_sas_sc,
  gvs_oth_sc,
  gvs_all_sc,
  ROW_NUMBER() OVER(PARTITION BY vid ORDER BY
     CASE ARRAY_TO_STRING(consequence, ',')
         WHEN 'upstream_gene_variant'
         THEN 4
         WHEN 'downstream_gene_variant'
         THEN 5
         ELSE 1
         END
         ASC
  )  AS row_number
  FROM \`$BQ_PROJECT.$BQ_DATASET.delta_vat_v2\`
  WHERE is_canonical_transcript OR transcript is NULL
  ORDER BY vid, row_number),
  genes as (
     SELECT vid, ARRAY_TO_STRING(array_agg(distinct gene_symbol ignore nulls ORDER BY gene_symbol), ', ') as genes
     FROM \`$BQ_PROJECT.$BQ_DATASET.delta_vat_v2\`
     GROUP BY vid
  )
  SELECT
     sorted_transcripts.variant_id,
     sorted_transcripts.gene_symbol,
     sorted_transcripts.consequence,
     sorted_transcripts.variant_type,
     sorted_transcripts.protein_change,
     sorted_transcripts.dna_change_in_transcript as dna_change,
     sorted_transcripts.gvs_all_ac as allele_count,
     sorted_transcripts.gvs_all_an as allele_number,
     sorted_transcripts.gvs_all_af as allele_frequency,
     sorted_transcripts.clinical_significance,
     sorted_transcripts.rs_number,
     sorted_transcripts.transcript as transcript,
     sorted_transcripts.gvs_afr_ac,
     sorted_transcripts.gvs_afr_an,
     sorted_transcripts.gvs_afr_af,
     sorted_transcripts.gvs_amr_ac,
     sorted_transcripts.gvs_amr_an,
     sorted_transcripts.gvs_amr_af,
     sorted_transcripts.gvs_eas_ac,
     sorted_transcripts.gvs_eas_an,
     sorted_transcripts.gvs_eas_af,
     sorted_transcripts.gvs_mid_ac,
     sorted_transcripts.gvs_mid_an,
     sorted_transcripts.gvs_mid_af,
     sorted_transcripts.gvs_eur_ac,
     sorted_transcripts.gvs_eur_an,
     sorted_transcripts.gvs_eur_af,
     sorted_transcripts.gvs_sas_ac,
     sorted_transcripts.gvs_sas_an,
     sorted_transcripts.gvs_sas_af,
     sorted_transcripts.gvs_oth_ac,
     sorted_transcripts.gvs_oth_an,
     sorted_transcripts.gvs_oth_af,
     sorted_transcripts.gvs_all_ac,
     sorted_transcripts.gvs_all_an,
     sorted_transcripts.gvs_all_af,
     (sorted_transcripts.gvs_all_ac - sorted_transcripts.gvs_all_sc) as homozygote_count,
     (sorted_transcripts.gvs_afr_ac - sorted_transcripts.gvs_afr_sc) as gvs_afr_hc,
     (sorted_transcripts.gvs_amr_ac - sorted_transcripts.gvs_amr_sc) as gvs_amr_hc,
     (sorted_transcripts.gvs_eas_ac - sorted_transcripts.gvs_eas_sc) as gvs_eas_hc,
     (sorted_transcripts.gvs_mid_ac - sorted_transcripts.gvs_mid_sc) as gvs_mid_hc,
     (sorted_transcripts.gvs_eur_ac - sorted_transcripts.gvs_eur_sc) as gvs_eur_hc,
     (sorted_transcripts.gvs_sas_ac - sorted_transcripts.gvs_sas_sc) as gvs_sas_hc,
     (sorted_transcripts.gvs_oth_ac - sorted_transcripts.gvs_oth_sc) as gvs_oth_hc,
     sorted_transcripts.contig,
     sorted_transcripts.position,
     sorted_transcripts.ref_allele,
     sorted_transcripts.alt_allele,
     sorted_transcripts.cons_str,
     genes.genes
  FROM sorted_transcripts, genes
  WHERE genes.vid = sorted_transcripts.variant_id
  AND (sorted_transcripts.row_number =1 or sorted_transcripts.transcript is NULL);"

  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "CREATE MATERIALIZED VIEW \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant_mv_1\`
  CLUSTER BY contig, position
  AS
  SELECT *
  FROM \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant\`;"

  bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
  "CREATE MATERIALIZED VIEW \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant_mv_2\`
  CLUSTER BY variant_type
  AS
  SELECT *
  FROM \`$OUTPUT_PROJECT.$GENOMICS_DATASET.wgs_variant\`;"
fi

# Populate some tables from cdr data
############
# cb_criteria #
############
if [[ $tables =~ $cb_cri_table_check ]]; then
    echo "Inserting criteria"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
     (id, parent_id, domain_id, type, subtype, is_standard, code, name, value, is_group, is_selectable, est_count, concept_id, has_attribute, has_hierarchy, has_ancestor_data, path, synonyms, full_text)
     SELECT id, parent_id, domain_id, type, subtype, is_standard, code, name, value, is_group, is_selectable, est_count, concept_id, has_attribute, has_hierarchy, has_ancestor_data, path, synonyms, full_text
     FROM \`$BQ_PROJECT.$BQ_DATASET.cb_criteria\`"
fi

######################
# cb_criteria_attribute #
######################
if [[ $tables =~ $cb_cri_attr_table_check ]]; then
    echo "Inserting cb_criteria_attribute"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria_attribute\`
    (id, concept_id, value_as_concept_id, concept_name, type, est_count)
    SELECT id, concept_id, value_as_concept_id, concept_name, type, est_count
    FROM \`$BQ_PROJECT.$BQ_DATASET.cb_criteria_attribute\`"
fi

#########################
# cb_criteria_relationship #
#########################
if [[ $tables =~ $cb_cri_rel_table_check ]]; then
    echo "Inserting criteria_relationship"
    echo "Inserting cb_criteria_relationship"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria_relationship\`
    (concept_id_1, concept_id_2)
    SELECT concept_id_1, concept_id_2
    FROM \`$BQ_PROJECT.$BQ_DATASET.cb_criteria_relationship\`"
fi

#########################
#   cb_criteria_ancestor   #
#########################
if [[ $tables =~ $cb_cri_anc_table_check ]]; then
    echo "Inserting cb_criteria_ancestor"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria_ancestor\`
    (ancestor_id, descendant_id)
    SELECT ancestor_id, descendant_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.cb_criteria_ancestor\`"
fi

##########
# domain #
##########
echo "Inserting domain"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.domain\`
 (domain_id, domain_name, domain_concept_id)
SELECT domain_id, domain_name, domain_concept_id
FROM \`$BQ_PROJECT.$BQ_DATASET.domain\` d"

##############
# vocabulary #
##############
echo "Inserting vocabulary"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.vocabulary\`
 (vocabulary_id, vocabulary_name, vocabulary_reference, vocabulary_version, vocabulary_concept_id)
SELECT vocabulary_id, vocabulary_name, vocabulary_reference, vocabulary_version, vocabulary_concept_id
FROM \`$BQ_PROJECT.$BQ_DATASET.vocabulary\`"

####################
# achilles queries #
####################
# Run achilles count queries to fill achilles_results
if ./generate-cdr/run-achilles-queries.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $OUTPUT_PROJECT --workbench-dataset $OUTPUT_DATASET
then
    echo "Achilles queries ran"
else
    echo "FAILED To run achilles queries for CDR $CDR_VERSION"
    exit 1
fi

####################
# measurement queries #
####################
# Run measurement achilles count queries to fill achilles_results
if ./generate-cdr/run-measurement-queries.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $OUTPUT_PROJECT --workbench-dataset $OUTPUT_DATASET
then
    echo "Measurement achilles queries ran"
else
    echo "FAILED To run measurement achilles queries for CDR $CDR_VERSION"
    exit 1
fi


####################
# updating concept DB-1143 #
####################
# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Indian Health Service' where stratum_3='43529111'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Insurance purchased directly from an insurance company (by you or another family member)'
where stratum_3='43529119'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Insurance through a current or former employer or union (by you or another family member)'
where stratum_3='43529120'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Medicare, for people 65 and older or people with certain disabilities'
where stratum_3='43529210'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Medicaid, Medical Assistance, or any kind of government-assistance plan for those with low incomes or disability'
where stratum_3='43529209'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='TRICARE or other military health care'
where stratum_3='43529920'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Veterans Affairs (VA) (including those who have ever used or enrolled for VA health care)'
where stratum_3='43529926'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='Any other type of health insurance or health coverage plan'
where stratum_3='43528423'; "

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` c1
set stratum_4='I don’ t have health insurance, self-pay'
where stratum_3='43529095'; "

##################################################################
# Add survey participant count by question addition date
##################################################################
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` set showup_date = sdate from
(select observation_source_concept_id, min(observation_datetime) sdate from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.v_full_observation\` join \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\`
on observation_source_concept_id = concept_id
group by 1)
where concept_id = observation_source_concept_id;"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_6, count_value)
with survey_dates as
(select distinct survey_concept_id, showup_date from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` where showup_date is not null group by 1,2),
survey_rows as
(select ob.*, a.survey_concept_id from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.v_full_observation\` ob join \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` a
on observation_source_concept_id = a.concept_id),
survey_row_counts as
(select b.survey_concept_id, b.showup_date, count(distinct person_id) pc from survey_rows a join survey_dates b on a.survey_concept_id = b.survey_concept_id
and a.observation_datetime >= b.showup_date
group by 1,2
order by 1)
select 0 as id, 3203 as analysis_id, cast(a.survey_concept_id as STRING) as stratum_1, cast(a.concept_id as STRING) as stratum_2, cast(a.path as STRING) as stratum_6, b.pc as count_value
from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` a
join survey_row_counts b on a.survey_concept_id = b.survey_concept_id and a.showup_date = b.showup_date;"

##################################################################
#Add sub questions flag in stratum_7 in survey response count rows
##################################################################
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` a
set a.stratum_7='1'
from (select distinct SPLIT(path, '.')[OFFSET(0)] as qid, SPLIT(path, '.')[OFFSET(1)] as aid from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\`
where ARRAY_LENGTH(SPLIT(path, '.')) = 3 and generate_counts=1) b
where a.stratum_2=b.qid
and a.stratum_3=b.aid and a.analysis_id=3110 and a.stratum_3 not in ('43529842', '43528385', '43529574')"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` a
set a.stratum_7='1'
from (select distinct SPLIT(path, '.')[OFFSET(0)] as qid1, SPLIT(path, '.')[OFFSET(1)] aid1, SPLIT(path, '.')[OFFSET(2)] as qid2, SPLIT(path, '.')[OFFSET(3)] as aid2
from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` where ARRAY_LENGTH(SPLIT(path, '.')) = 5 and generate_counts=1) b
where a.stratum_2=b.qid2 and a.stratum_3=b.aid2
and a.stratum_6=CONCAT(qid1, '.', aid1, '.', qid2)
and a.analysis_id=3110 and a.stratum_3 not in ('43529842', '43528385', '43529574')"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` a
set a.stratum_7='1'
from (select distinct parent_question_concept_id, parent_answer_concept_id from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\`
where survey_concept_id=765936 and sub=1) b
where a.analysis_id=3110 and
a.stratum_2=CAST(b.parent_question_concept_id as string) and a.stratum_3=CAST(b.parent_answer_concept_id as string);"

###########################
# concept with count cols #
###########################
# We can't just copy concept because the schema has a couple extra columns
# and dates need to be formatted for mysql
# Insert the base data into it formatting dates.
echo "Inserting concept table data ... "
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\`
(concept_id, concept_name, domain_id, vocabulary_id, concept_class_id, standard_concept,
concept_code, count_value, prevalence, source_count_value, synonyms, can_select, has_counts)
select c.concept_id, c.concept_name, c.domain_id, c.vocabulary_id, c.concept_class_id, c.standard_concept, c.concept_code,
0 as count_value , 0.0 as prevalence, 0 as source_count_value,
(case when cs.concept_id is not null then concat(cast(c.concept_id as string),'|',string_agg(replace(cs.concept_synonym_name,'|','||'),'|'))
else concat(cast(c.concept_id as string), '|', c.concept_name) end) as synonyms,
(case when (c.concept_id in (select distinct concept_id from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.filter_conditions\`)
and (select flag from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.filter_conditions\` where concept_id = c.concept_id)=0) then 0 else 1 end) as can_select,
0 as has_select
from \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c left outer join \`${BQ_PROJECT}.${BQ_DATASET}.concept_synonym\` cs on c.concept_id=cs.concept_id and cs.language_concept_id=4180186
group by c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_class_id, c.standard_concept, c.concept_code, cs.concept_id"

# Update counts and prevalence in concept
q="select count_value from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` a where a.analysis_id = 1"
person_count=$(bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql "$q" |  tr -dc '0-9')

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
set c.source_count_value = r.source_count_value,c.count_value=r.count_value
from  (select cast(r.stratum_1 as int64) as concept_id , sum(r.count_value) as count_value , sum(r.source_count_value) as source_count_value
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` r
where r.analysis_id in (3000,2,4,5) and CAST(r.stratum_1 as int64) > "0" group by r.stratum_1) as r
where r.concept_id = c.concept_id"

##########################################
# Remove units from achilles_results if no values #
##########################################
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` ar1
where ar1.analysis_id=1910 and NOT EXISTS
(select * from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` ar2 where ar2.stratum_1=ar1.stratum_1
and  ar2.stratum_2=ar1.stratum_2 and  ar2.stratum_3=ar1.stratum_3 and analysis_id=1900)"


##########################################
# domain info updates                    #
##########################################

# Set all_concept_count and standard_concept_count on domain_info
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d
set d.all_concept_count = c.all_concept_count, d.standard_concept_count = c.standard_concept_count from
(select c.domain_id as domain_id, COUNT(DISTINCT c.concept_id) as all_concept_count,
SUM(CASE WHEN c.standard_concept IN ('S', 'C') and c.can_select > 0 THEN 1 ELSE 0 END) as standard_concept_count from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` c
join \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d2
on d2.domain_id = c.domain_id
and (c.count_value > 0 or c.source_count_value > 0)
group by c.domain_id) c
where d.domain_id = c.domain_id
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d
set d.all_concept_count = c.all_concept_count, d.standard_concept_count = c.standard_concept_count from
(select c.domain_id as domain_id, COUNT(DISTINCT c.concept_id) as all_concept_count,
SUM(CASE WHEN c.standard_concept IN ('S', 'C') THEN 1 ELSE 0 END) as standard_concept_count from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` c
join \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d2
on d2.domain_id = c.domain_id
and (c.count_value > 0 or c.source_count_value > 0)
where c.domain_id='Measurement' and c.concept_id not in (3036277, 3025315, 3027018, 3031203, 40759207, 903107, 903126, 40765148,
903135, 903136, 3022318, 3012888, 3004249, 903115, 903118, 3038553)
group by c.domain_id) c
where d.domain_id = c.domain_id
"

# Set participant counts for each domain
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d
set d.participant_count = r.count_value from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` r
where r.analysis_id = 3000 and r.stratum_1 = CAST(d.concept_id AS STRING)
and r.stratum_3 = d.domain_id
and r.stratum_2 is null"

# Set participant counts for physical measurements
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.domain_info\` d
set d.participant_count = r.count_value from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` r
where r.analysis_id = 3000 and r.stratum_3 = 'Physical Measurements'
and d.domain_id='Physical Measurements' "


##########################################
# survey count updates                   #
##########################################

# Set the survey participant count on the concept
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` c1
set c1.count_value=count_val from
(select ob.observation_source_concept_id as concept, count(distinct ob.person_id) as count_val from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.v_full_observation\` ob
where ob.observation_source_concept_id in (1384403, 43529654, 43528428, 1310137, 1310132, 905052, 905045, 905046, 905056, 905048, 905057, 905061, 905040)
group by observation_source_concept_id)
where c1.concept_id=concept
and c1.concept_id in (1384403, 43529654, 43528428, 1310137, 1310132, 905052, 905045, 905046, 905056, 905048, 905057, 905061, 905040)"

# Set the participant count on the survey_module row
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_module\` sm
set sm.participant_count=c.count_value from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` c
where c.concept_id=sm.concept_id"

# Set the question participant counts
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` c1
SET c1.count_value = subquery.max_count_val
FROM (
    SELECT
        MAX(count_val) AS max_count_val,
        question_id
    FROM (
        SELECT
            COUNT(DISTINCT ob.person_id) AS count_val,
            cr.survey_concept_id AS survey_concept_id,
            cr.concept_id AS question_id
        FROM
            \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.v_full_observation\` ob
        JOIN
            \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` cr
        ON
            ob.observation_source_concept_id = cr.concept_id
        WHERE
            cr.concept_id NOT IN (1384403, 43529654, 43528428, 1310137, 1310132, 905052, 905045, 905046, 905056, 905048, 905057, 905061, 905040)
        GROUP BY
            survey_concept_id,
            cr.concept_id
    ) AS inner_subquery
    GROUP BY
        question_id
) AS subquery
WHERE
    c1.concept_id = subquery.question_id;"

# Set the question count on the survey_module row
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_module\` sm
set sm.question_count=num_questions from
(select count(distinct qc.concept_id) num_questions, sq.survey_concept_id as survey_concept_id from
\`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` sq
join \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` qc
on sq.concept_id = qc.concept_id
where sq.type='QUESTION'
group by survey_concept_id)
where sm.concept_id = survey_concept_id"

# Set the question count on the survey_module row
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_module\` sm
set sm.question_count=num_questions from
(select count(distinct observation_source_concept_id) as num_questions
from \`$BQ_PROJECT.$BQ_DATASET.observation\` a
join \`$BQ_PROJECT.$BQ_DATASET.observation_ext\` b on a.observation_id=b.observation_id
where b.survey_version_concept_id is not null and b.survey_version_concept_id in (765936))
where sm.concept_id=765936;"

########################
# concept_relationship #
########################
echo "Inserting concept_relationship"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept_relationship\`
 (concept_id_1, concept_id_2, relationship_id)
SELECT c.concept_id_1, c.concept_id_2, c.relationship_id
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` c"

########################
# concept_synonym #
########################
echo "Inserting concept_synonym"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept_synonym\`
 (id, concept_id, concept_synonym_name)
SELECT 0, c.concept_id, c.concept_synonym_name
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_synonym\` c
where language_concept_id=4180186;"

###########################
# Domain_Vocabulary_Info #
###########################
echo "Updating all concept count in domain_vocabulary_info"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.domain_vocabulary_info\`
(domain_id,vocabulary_id,all_concept_count,standard_concept_count)
select d2.domain_id as domain_id,c.vocabulary_id as vocabulary_id, COUNT(DISTINCT c.concept_id) as all_concept_count,
COUNT(DISTINCT CASE WHEN c.standard_concept IN ('S', 'C') THEN c.concept_id ELSE NULL END) as standard_concept_count from
\`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.domain\` d2
on d2.domain_id = c.domain_id
and (c.count_value > 0 or c.source_count_value > 0)
group by d2.domain_id,c.vocabulary_id"

####################
# criteria stratum #
####################
# Fill criteria stratum to get rolled up counts
if ./generate-cdr/generate_criteria_stratum.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $OUTPUT_PROJECT --workbench-dataset $OUTPUT_DATASET
then
    echo "Criteria stratum generated"
else
    echo "FAILED To generate criteria stratum"
    exit 1
fi

echo "Inserting rows in achilles results for the concepts that are not in there and that have rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
SELECT 0,t1.analysis_id,cast(t1.concept_id as string),cast(t1.stratum_1 as string),t1.domain,t1.count_value,0
FROM \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` t1
LEFT JOIN \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` t2 ON t2.stratum_1 = cast(t1.concept_id as string) and t1.analysis_id=t2.analysis_id and cast(t1.stratum_1 as string)=t2.stratum_2
and t2.stratum_3=t1.domain
WHERE t2.stratum_1 IS NULL
group by t1.analysis_id, t1.concept_id, t1.stratum_1,t1.domain,t1.count_value;
"

echo "Updating counts in achilles results with the ones generated in criteria stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` c
set c.count_value=sub_cr.cnt
from (select analysis_id, concept_id, stratum_1 as stratum, domain, max(count_value) as cnt from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` cr
group by analysis_id, concept_id, stratum, domain) as sub_cr
where cast(sub_cr.concept_id as string)=c.stratum_1 and c.analysis_id=sub_cr.analysis_id and c.stratum_2=cast(sub_cr.stratum as string) and c.stratum_3=sub_cr.domain"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
set has_counts = IF(count_value > 0 or source_count_value > 0, 1, 0)
where concept_id != 0"

echo "Update question names to match the text in the survey pdfs (there are some questions that are present in the table just for building schema so ignoring them)"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
set c.concept_name=sqm.concept_name
from  (select distinct concept_id , concept_name
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.survey_metadata\` where generate_counts = 1
and concept_id not in (1384403, 43529654, 43528428, 1310137, 1310132, 905052, 905045, 905046, 905056, 905048, 905057, 905061, 905040) group by 1,2) as sqm
where c.concept_id = sqm.concept_id"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
set concept_name=REGEXP_REPLACE(concept_name, 'PMI:', '')
where concept_name like '%PMI:%' "

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
set concept_name=REGEXP_REPLACE(concept_name, 'Sex At Birth: Sex At Birth', 'Sex At Birth:')
where concept_name like '%Sex At Birth: Sex At Birth%' "

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` c
set stratum_4=REGEXP_REPLACE(stratum_4, 'PMI:', '')
where stratum_4 like '%PMI:%' "

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` c
set stratum_4=REGEXP_REPLACE(stratum_4, 'Sex At Birth: Sex At Birth', 'Sex At Birth:')
where stratum_4 like '%Sex At Birth: Sex At Birth%' "

#Create temp table to store drug brand names
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
CREATE TABLE IF NOT EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.drug_brand_names_by_ingredients\`
(
  ing_concept INT64,
  drug_brand_names STRING
);
"

#Fill drug brand names in temp table
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
INSERT INTO \`$OUTPUT_PROJECT.$OUTPUT_DATASET.drug_brand_names_by_ingredients\`
(ing_concept, drug_brand_names)
select concept_id_2, string_agg(distinct replace(c.name,'|','||'),'|' order by replace(c.name,'|','||') asc) as drug_brand_names from
\`$BQ_PROJECT.$BQ_DATASET.cb_criteria_relationship\` cr join
\`$BQ_PROJECT.$BQ_DATASET.cb_criteria\` c on cr.concept_id_1=c.concept_id
and c.domain_id='DRUG' and c.type='BRAND' and c.full_text like '%drug_rank1%'
group by concept_id_2
"

#Update concept with drug brand names
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` d
set d.drug_brand_names = r.drug_brand_names from
\`$OUTPUT_PROJECT.$OUTPUT_DATASET.drug_brand_names_by_ingredients\` r
where d.concept_id=r.ing_concept"

# This fixes basics survey answer typo
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` ar
set ar.stratum_4='Highest Grade: College One to Three' where ar.stratum_3='1585946' "

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.concept\` set concept_name = case concept_id when 1384639 then 'Diagnosed Health Condition: Heart and Blood Condition'
 when 43528761 then 'Diagnosed Health Condition: Hormone/Endocrine Condition' when 43529638 then 'Diagnosed Health Condition: Other Conditions'
 when 43529170 then 'Other Conditions: Liver Condition' else concept_name end where concept_id in (1384639, 43528761, 43529170, 43529638);"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` q
SET q.question_string = t2.qs
FROM \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.survey_metadata\` AS q2 INNER JOIN (
SELECT stratum_1, stratum_2, stratum_6, array_to_string(array_agg(distinct stratum_4), \"|\", \"\") AS qs
FROM \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\` where analysis_id=3110
GROUP BY stratum_1, stratum_2, stratum_6) AS t2 ON cast(q2.survey_concept_id as string) = t2.stratum_1 and cast(q2.concept_id as string) = t2.stratum_2 and q2.path = t2.stratum_6
where q.concept_id=q2.concept_id and q.path=q2.path and q.survey_concept_id = q2.survey_concept_id
and q.concept_id not in (1384403, 43529654, 43528428, 1310137, 1310132, 905052, 905045, 905046, 905056, 905048, 905057, 905061, 905040);"


# TODO This is temporary please remove if this bug is no longer in the next dataset DB-1166 for reference
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete from \`${OUTPUT_PROJECT}.${OUTPUT_DATASET}.achilles_results\`
where stratum_1='43529712' and stratum_2='1384522' and stratum_3 in ('1385613', '1384867');
"

#######################
# Drop views created #
#######################
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.v_ehr_measurement\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.v_rdr_measurement\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.v_ehr_condition_occurrence\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.v_ehr_procedure_occurrence\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.v_ehr_drug_exposure\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.drug_brand_names_by_ingredients\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.survey_age_stratum\`"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$OUTPUT_PROJECT.$OUTPUT_DATASET.survey_observation\`"