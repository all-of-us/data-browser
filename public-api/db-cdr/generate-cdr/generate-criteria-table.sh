#!/bin/bash

# This generates the criteria tables for the CDR

# PREP: upload all prep tables

# Example usage:
# ./project.rb generate-criteria-table --bq-project aou-res-curation-prod --bq-dataset deid_output_20181116
# ./project.rb generate-criteria-table --bq-project all-of-us-ehr-dev --bq-dataset synthetic_cdr20180606


set -xeuo pipefail
IFS=$'\n\t'

# --cdr=cdr_version ... *optional
USAGE="./generate-cdr/generate-criteria-table.sh --bq-project <PROJECT> --bq-dataset <DATASET>"

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --bq-project) BQ_PROJECT=$2; shift 2;;
    --bq-dataset) BQ_DATASET=$2; shift 2;;
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

# Check that bq_project exists and exit if not
datasets=$(bq --project=$BQ_PROJECT ls)
if [ -z "$datasets" ]
then
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi
if [[ $datasets =~ .*$BQ_DATASET.* ]]; then
  echo "$BQ_PROJECT.$BQ_DATASET exists. Good. Carrying on."
else
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi

# Check that bq_dataset exists and exit if not
datasets=$(bq --project=$BQ_PROJECT ls)
if [ -z "$datasets" ]
then
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi
re=\\b$BQ_DATASET\\b
if [[ $datasets =~ $re ]]; then
  echo "$BQ_PROJECT.$BQ_DATASET exists. Good. Carrying on."
else
  echo "$BQ_PROJECT.$BQ_DATASET does not exist. Please specify a valid project and dataset."
  exit 1
fi

distinct_gender_identity_values=(1585839 903070 1585840 1585842 1585841 1585843 903079 903096)


################################################
# CREATE TABLES
################################################
echo "CREATE TABLES - criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.criteria\`
(
  id            INT64,
  parent_id     INT64,
  type          STRING,
  subtype       STRING,
  code          STRING,
  name          STRING,
  is_group      INT64,
  is_selectable INT64,
  est_count     INT64,
  domain_id     STRING,
  concept_id    INT64,
  has_attribute INT64,
  path          STRING
)"

echo "CREATE TABLES - achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
(
  id            INT64,
  parent_id     INT64,
  type          STRING,
  subtype       STRING,
  code          STRING,
  name          STRING,
  is_group      INT64,
  is_selectable INT64,
  est_count     INT64,
  domain_id     STRING,
  concept_id    INT64,
  has_attribute INT64,
  path          STRING,
  stratum_1     STRING
)"

# table that holds the ingredient --> coded drugs mapping
echo "CREATE TABLES - criteria_ancestor"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor\`
(
  ancestor_id INT64,
  descendant_id INT64
)"

# table that holds categorical results and min/max information about individual labs
echo "CREATE TABLES - criteria_attribute"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.criteria_attribute\`
(
  id                    INT64,
  concept_id            INT64,
  value_as_concept_id	INT64,
  concept_name          STRING,
  type                  STRING,
  est_count             STRING
)"

# table that holds the drug brands -> ingredients relationship mapping
echo "CREATE TABLES - criteria_relationship"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.criteria_relationship\`
(
  concept_id_1 INT64,
  concept_id_2 INT64
)"

echo "CREATE TABLES - atc_rel_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.atc_rel_in_data\`
(
  p_concept_id INT64,
  p_concept_code STRING,
  p_concept_name STRING,
  p_domain_id STRING,
  concept_id INT64,
  concept_code STRING,
  concept_name STRING,
  domain_id STRING
)"

echo "CREATE TABLES - loinc_rel_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.loinc_rel_in_data\`
(
  p_concept_id INT64,
  p_concept_code STRING,
  p_concept_name STRING,
  p_domain_id STRING,
  concept_id INT64,
  concept_code STRING,
  concept_name STRING,
  domain_id STRING
)"

echo "CREATE TABLES - snomed_rel_cm_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`
(
  p_concept_id INT64,
  p_concept_code STRING,
  p_concept_name STRING,
  p_domain_id STRING,
  concept_id INT64,
  concept_code STRING,
  concept_name STRING,
  domain_id STRING
)"

echo "CREATE TABLES - snomed_rel_pcs_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`
(
  p_concept_id INT64,
  p_concept_code STRING,
  p_concept_name STRING,
  p_domain_id STRING,
  concept_id INT64,
  concept_code STRING,
  concept_name STRING,
  domain_id STRING
)"

echo "CREATE TABLES - snomed_rel_meas_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`
(
  p_concept_id INT64,
  p_concept_code STRING,
  p_concept_name STRING,
  p_domain_id STRING,
  concept_id INT64,
  concept_code STRING,
  concept_name STRING,
  domain_id STRING
)"

################################################
# CREATE VIEWS
################################################
echo "CREATE VIEWS - v_loinc_rel"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`$BQ_PROJECT.$BQ_DATASET.v_loinc_rel\` AS
SELECT DISTINCT C1.CONCEPT_ID AS P_CONCEPT_ID, C1.CONCEPT_CODE AS P_CONCEPT_CODE, C1.CONCEPT_NAME AS P_CONCEPT_NAME, C2.CONCEPT_ID, C2.CONCEPT_CODE, C2.CONCEPT_NAME
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` CR,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C1,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C2,
    \`$BQ_PROJECT.$BQ_DATASET.relationship\` R
WHERE (((((((((((CR.CONCEPT_ID_1 = C1.CONCEPT_ID)
    AND (CR.CONCEPT_ID_2 = C2.CONCEPT_ID))
    AND (CR.RELATIONSHIP_ID = R.RELATIONSHIP_ID))
    AND (C1.VOCABULARY_ID = 'LOINC'))
    AND (C2.VOCABULARY_ID = 'LOINC'))
    AND (R.IS_HIERARCHICAL = '1'))
    AND (R.DEFINES_ANCESTRY = '1'))
    AND (C1.CONCEPT_CLASS_ID
    IN (('LOINC Hierarchy'), ('Lab Test'))))
    AND (C2.CONCEPT_CLASS_ID
    IN (('LOINC Hierarchy'), ('Lab Test'))))
    AND (CR.RELATIONSHIP_ID = 'Subsumes'))
    AND (C2.CONCEPT_CODE NOT IN (
      SELECT DISTINCT C1.CONCEPT_CODE
      FROM (((
      \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` CR
      LEFT JOIN \`$BQ_PROJECT.$BQ_DATASET.concept\` C1 ON ((CR.CONCEPT_ID_1 = C1.CONCEPT_ID)))
      LEFT JOIN \`$BQ_PROJECT.$BQ_DATASET.concept\` C2 ON ((CR.CONCEPT_ID_2 = C2.CONCEPT_ID)))
      LEFT JOIN \`$BQ_PROJECT.$BQ_DATASET.relationship\` R ON ((CR.RELATIONSHIP_ID = R.RELATIONSHIP_ID)))
      WHERE ((((((C1.VOCABULARY_ID = 'LOINC')
      AND (C2.VOCABULARY_ID = 'LOINC'))
      AND (R.IS_HIERARCHICAL = '1'))
      AND (R.DEFINES_ANCESTRY = '1'))
      AND REGEXP_CONTAINS(C2.CONCEPT_CODE, r'^\d?\d?\d?\d?\d\-\d$'))
      AND (R.RELATIONSHIP_NAME = 'Panel contains (LOINC)')))))"

echo "CREATE VIEWS - v_snomed_rel_cm"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_cm\` AS
SELECT DISTINCT C1.CONCEPT_ID AS P_CONCEPT_ID, C1.CONCEPT_CODE AS P_CONCEPT_CODE, C1.CONCEPT_NAME AS P_CONCEPT_NAME,
    C1.DOMAIN_ID AS P_DOMAIN_ID, C2.CONCEPT_ID, C2.CONCEPT_CODE, C2.CONCEPT_NAME, C2.DOMAIN_ID
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` CR,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C1,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C2,
    \`$BQ_PROJECT.$BQ_DATASET.relationship\` R
WHERE CR.CONCEPT_ID_1 = C1.CONCEPT_ID
    AND CR.CONCEPT_ID_2 = C2.CONCEPT_ID
    AND CR.RELATIONSHIP_ID = R.RELATIONSHIP_ID
    AND C1.VOCABULARY_ID = 'SNOMED'
    AND C2.VOCABULARY_ID = 'SNOMED'
    AND C1.STANDARD_CONCEPT = 'S'
    AND C2.STANDARD_CONCEPT = 'S'
    AND R.IS_HIERARCHICAL = '1'
    AND R.DEFINES_ANCESTRY = '1'
    AND C1.DOMAIN_ID = 'Condition'
    AND C2.DOMAIN_ID = 'Condition'
    AND CR.RELATIONSHIP_ID = 'Subsumes'"

echo "CREATE VIEWS - v_snomed_rel_pcs"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_pcs\` AS
SELECT DISTINCT C1.CONCEPT_ID AS P_CONCEPT_ID, C1.CONCEPT_CODE AS P_CONCEPT_CODE, C1.CONCEPT_NAME AS P_CONCEPT_NAME,
    C1.DOMAIN_ID AS P_DOMAIN_ID, C2.CONCEPT_ID, C2.CONCEPT_CODE, C2.CONCEPT_NAME, C2.DOMAIN_ID
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` CR,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C1,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C2,
    \`$BQ_PROJECT.$BQ_DATASET.relationship\` R
WHERE CR.CONCEPT_ID_1 = C1.CONCEPT_ID
    AND CR.CONCEPT_ID_2 = C2.CONCEPT_ID
    AND CR.RELATIONSHIP_ID = R.RELATIONSHIP_ID
    AND C1.VOCABULARY_ID = 'SNOMED'
    AND C2.VOCABULARY_ID = 'SNOMED'
    AND C1.STANDARD_CONCEPT = 'S'
    AND C2.STANDARD_CONCEPT = 'S'
    AND R.IS_HIERARCHICAL = '1'
    AND R.DEFINES_ANCESTRY = '1'
    AND C1.DOMAIN_ID = 'Procedure'
    AND C2.DOMAIN_ID = 'Procedure'
    AND CR.RELATIONSHIP_ID = 'Subsumes'"

echo "CREATE VIEWS - v_snomed_rel_meas"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_meas\` AS
SELECT DISTINCT C1.CONCEPT_ID AS P_CONCEPT_ID, C1.CONCEPT_CODE AS P_CONCEPT_CODE, C1.CONCEPT_NAME AS P_CONCEPT_NAME,
    C1.DOMAIN_ID AS P_DOMAIN_ID, C2.CONCEPT_ID, C2.CONCEPT_CODE, C2.CONCEPT_NAME, C2.DOMAIN_ID
FROM \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` CR,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C1,
    \`$BQ_PROJECT.$BQ_DATASET.concept\` C2,
    \`$BQ_PROJECT.$BQ_DATASET.relationship\` R
WHERE CR.CONCEPT_ID_1 = C1.CONCEPT_ID
    AND CR.CONCEPT_ID_2 = C2.CONCEPT_ID
    AND CR.RELATIONSHIP_ID = R.RELATIONSHIP_ID
    AND C1.VOCABULARY_ID = 'SNOMED'
    AND C2.VOCABULARY_ID = 'SNOMED'
    AND C1.STANDARD_CONCEPT = 'S'
    AND C2.STANDARD_CONCEPT = 'S'
    AND R.IS_HIERARCHICAL = '1'
    AND R.DEFINES_ANCESTRY = '1'
    AND C1.DOMAIN_ID = 'Measurement'
    AND C2.DOMAIN_ID = 'Measurement'
    AND CR.RELATIONSHIP_ID = 'Subsumes'"

################################################
# ICD9
################################################
echo "ICD9 - inserting data (do not insert zero count children)"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, count(distinct person_id) cnt from
    (SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id) x
  GROUP BY 1) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(c.gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with gender identity stratum for gender identity rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(c.gender_identity as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender_identity, count(distinct person) cnt from
    (SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with age stratum for age at occurrence (18-29) rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(c.age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with age stratum for age at occurrence (30-89) rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(c.age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with age stratum for age at occurrence (>90) rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(c.age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join
  (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\`
  where (vocabulary_id in ('ICD9CM', 'ICD9Proc') and concept_code != '92')
  or (vocabulary_id = 'ICD9Proc' and concept_code = '92')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD9'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD9 - generating parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from (select c.id, count(distinct person_id) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1) y
where x.id = y.id"

echo "ICD9 - generating parent counts in achilles criteria with gender stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(gender as string)"

echo "ICD9 - generating parent counts in achilles criteria with gender identity stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender_identity, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(gender_identity as string)"

echo "ICD9 - generating parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(age as string)"

echo "ICD9 - generating parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(age as string)"

echo "ICD9 - generating parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(age as string)"

echo "ICD9 - delete zero count parents"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
where type = 'ICD9'
and is_selectable = 1
and (est_count is null or est_count = 0)"

echo "ICD9 - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
where type = 'ICD9'
and is_selectable = 1
and (est_count is null or est_count = 0)"

################################################
# ICD10
################################################
echo "ICD10 - CM - insert data (do not insert zero count children)"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, count(distinct person_id) cnt from
    (SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id) x
  GROUP BY 1) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with gender identity stratum for gender identity rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender_identity as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender_identity, count(distinct person) cnt from
    (SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender_identity, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and ob.person_id = a.person_id
    and ob.observation_source_concept_id=1585838) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10CM')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and p.person_id = a.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'CM'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"


echo "ICD10 - PCS - insert data (do not insert zero count children)"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, count(distinct person_id) cnt from
    (SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
    UNION DISTINCT
    SELECT person_id, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id) x
  GROUP BY 1) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    UNION DISTINCT
    SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with gender identity stratum for gender identity rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
    and ob.observation_source_concept_id=1585838
    UNION DISTINCT
    SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
    and ob.observation_source_concept_id=1585838) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
    UNION DISTINCT
    SELECT a.person_id as person, '2' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from condition_starobservation_datet_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
    UNION DISTINCT
    SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('ICD10PCS')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from condition_start_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from observation_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from measurement_date) - p.year_of_birth) >= 90
    UNION DISTINCT
    SELECT a.person_id as person, '9' as age, concept_id
    FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
    (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
    WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    and (extract(year from procedure_date) - p.year_of_birth) >= 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'ICD10'
and subtype = 'PCS'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "ICD10 - CM - generate parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from (select c.id, count(distinct person_id) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1) y
where x.id = y.id"

echo "ICD10 - CM - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - CM - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - CM - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - CM - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - CM - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, '9' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - PCS - generate parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from (select c.id, count(distinct person_id) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1) y
where x.id = y.id"

echo "ICD10 - PCS - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - PCS - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,  \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,  \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
      and ob.observation_source_concept_id=1585838
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - PCS - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - PCS - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - PCS - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a,
    (
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from condition_start_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "ICD10 - delete zero count parents"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
where type = 'ICD10'
and is_selectable = 1
and (est_count is null or est_count = 0)"

echo "ICD10 - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
where type = 'ICD10'
and is_selectable = 1
and (est_count is null or est_count = 0)"

################################################
# CPT
################################################
echo "CPT - insert data (do not insert zero count children)"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, count(distinct person_id) cnt from
    (SELECT person_id, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id
	  UNION DISTINCT
	  SELECT person_id, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
	  UNION DISTINCT
	  SELECT person_id, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
	  UNION DISTINCT
	  SELECT person_id, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id) x
  GROUP BY 1) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id and a.person_id = p.person_id
	  UNION DISTINCT
	  SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  UNION DISTINCT
	  SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  UNION DISTINCT
	  SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(gender as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, gender, count(distinct person) cnt from
    (SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id and a.person_id = ob.person_id
	  and ob.observation_source_concept_id=1585838
	  UNION DISTINCT
	  SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
	  and ob.observation_source_concept_id=1585838
	  UNION DISTINCT
	  SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
	  and ob.observation_source_concept_id=1585838
	  UNION DISTINCT
	  SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = ob.person_id
	  and ob.observation_source_concept_id=1585838) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - insert data (do not insert zero count children) in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, '2' as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id and a.person_id = p.person_id
	  and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 18 and (extract(year from drug_exposure_start_date) - p.year_of_birth) < 30
	  UNION DISTINCT
	  SELECT a.person_id as person, '2' as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
	  UNION DISTINCT
	  SELECT a.person_id as person, '2' as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
	  UNION DISTINCT
	  SELECT a.person_id as person, '2' as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - insert data (do not insert zero count children) in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, floor((extract(year from drug_exposure_start_date) - p.year_of_birth)/10) as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id and a.person_id = p.person_id
	  and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 30 and (extract(year from drug_exposure_start_date) - p.year_of_birth) < 90
	  UNION DISTINCT
	  SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
	  UNION DISTINCT
	  SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
	  UNION DISTINCT
	  SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - insert data (do not insert zero count children) in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select ID, PARENT_ID, "TYPE", SUBTYPE, CODE, NAME, is_group, is_selectable,
case when is_group = 0 and is_selectable = 1 then c.cnt else null end as est_count,
case when is_group = 0 and IS_SELECTABLE = 1 then b.DOMAIN_ID else null end as DOMAIN_ID,
case when is_group = 0 and IS_SELECTABLE = 1 then b.CONCEPT_ID else null end as CONCEPT_ID, 0, PATH, cast(age as string)
from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` a
left join (select * from \`$BQ_PROJECT.$BQ_DATASET.concept\` where vocabulary_id in ('CPT4')) b on a.CODE = b.CONCEPT_CODE
left join
  (select concept_id, age, count(distinct person) cnt from
    (SELECT a.person_id as person, 9 as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_Id and a.person_id = p.person_id
	  and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 90
	  UNION DISTINCT
	  SELECT a.person_id as person, 9 as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from observation_date) - p.year_of_birth) >= 90
	  UNION DISTINCT
	  SELECT a.person_id as person, 9 as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from measurement_date) - p.year_of_birth) >= 90
	  UNION DISTINCT
	  SELECT a.person_id as person, 9 as age, concept_id
	  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
	  (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
	  WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
	  and (extract(year from procedure_date) - p.year_of_birth) >= 90) x
  GROUP BY 1,2) c on b.concept_id = c.concept_id
where type = 'CPT'
and (is_group = 1 or (is_group = 0 and is_selectable = 1 and (c.cnt != 0 or c.cnt is not null)))
order by 1"

echo "CPT - generate parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from (select c.id, count(distinct person_id) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id
      UNION DISTINCT
      SELECT person_id, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1) y
where x.id = y.id"

echo "CPT - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "CPT - generate parent counts in achilles criteria with gender stratum for gender identity rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=ob.person_id
      and ob.observation_source_concept_id=1585838
      UNION DISTINCT
      SELECT a.person_id as person, ob.value_source_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.observation\` ob,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=ob.person_id
      and ob.observation_source_concept_id=1585838
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "CPT - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 18 and (extract(year from drug_exposure_start_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 18 and (extract(year from observation_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
      UNION DISTINCT
      SELECT a.person_id as person, '2' as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "CPT - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT a.person_id as person, floor((extract(year from drug_exposure_start_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 30 and (extract(year from drug_exposure_start_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from observation_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 30 and (extract(year from observation_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
      UNION DISTINCT
      SELECT a.person_id as person, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"

echo "CPT - generate parent counts in achilles criteria with age stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from (select c.id, age, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a,
    (
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from drug_exposure_start_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from observation_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from measurement_date) - p.year_of_birth) >= 90
      UNION DISTINCT
      SELECT a.person_id as person, 9 as age, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      and (extract(year from procedure_date) - p.year_of_birth) >= 90
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.age as string)"



echo "CPT - delete zero count parents"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
where type = 'CPT'
and ( (parent_id != 0 and (est_count is null or est_count = 0))
or (is_group = 1 and id not in (select parent_id from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
where type = 'CPT' and est_count is not null)) )"

echo "CPT - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
where type = 'CPT'
and ( (parent_id != 0 and (est_count is null or est_count = 0))
or (is_group = 1 and id not in (select parent_id from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
where type = 'CPT' and est_count is not null)) )"

################################################
# SNOMED
################################################
echo "SNOMED - CM - temp table level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
select *
from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_cm\` a
where concept_id in
  (select distinct CONDITION_CONCEPT_ID
  from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
  left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
  where CONDITION_CONCEPT_ID != 0
    and b.vocabulary_id = 'SNOMED'
    and b.STANDARD_CONCEPT = 'S'
    and b.domain_id = 'Condition')"

for i in {1..6};
do
    echo "SNOMED - CM - temp table level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
    select *
    from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_cm\` a
    where concept_id in (select P_CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`)
      and concept_id not in (select CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`)"
done

echo "SNOMED - CM - add root"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute)
select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '404684003'"

echo "SNOMED - CM - add root in achilles criteria with gender stratum (male) for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, '8507'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '404684003'"

echo "SNOMED - CM - add root in achilles criteria with gender stratum (female) for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, '8532'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '404684003'"

for t in "${distinct_gender_identity_values[@]}"
do
   echo "SNOMED - CM - add root in achilles criteria with gender stratum (female) for biological sex rolled up counts"
   bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
   "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
   select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, cast($t as string)
   from \`$BQ_PROJECT.$BQ_DATASET.concept\`
   where concept_code = '404684003'"
done

for i in {2..9}
do
    echo "SNOMED - CM - add root in achilles criteria with age stratum (2) for chart rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
    select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, $i
    from \`$BQ_PROJECT.$BQ_DATASET.concept\`
    where concept_code = '404684003'"
done


echo "SNOMED - CM - add level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`), t.ID, 'SNOMED', 'CM',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Condition', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`)"

echo "SNOMED - CM - add level 0 in achilles criteria with stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`), t.ID, 'SNOMED', 'CM',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Condition', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path, t.stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`)"

for i in {1..18};
do
    echo "SNOMED - CM - add level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`),
      t.ID, 'SNOMED', 'CM', b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Condition',b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING))
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
       join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
       left join (select distinct a.CONCEPT_CODE
              from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` a
                   left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
             where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)"
done

for i in {1..18};
do
    echo "SNOMED - CM - add level $i in achilles criteria with stratum for rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`),
      t.ID, 'SNOMED', 'CM', b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Condition',b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING)),t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
       join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
       left join (select distinct a.CONCEPT_CODE
              from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` a
                   left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
             where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)"
done

echo "SNOMED - CM - add parents as children"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID, a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Condition', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING))
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a
  where a.IS_GROUP = 1
    and CONCEPT_ID in
      (select distinct CONDITION_CONCEPT_ID
      from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
      where CONDITION_CONCEPT_ID != 0
        and b.vocabulary_id = 'SNOMED'
        and b.STANDARD_CONCEPT = 'S'
        and b.domain_id = 'Condition') ) a"

echo "SNOMED - CM - add parents as children in achilles criteria with gender stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID, a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Condition', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)),stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
    and CONCEPT_ID in
      (select distinct CONDITION_CONCEPT_ID
      from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
      where CONDITION_CONCEPT_ID != 0
        and b.vocabulary_id = 'SNOMED'
        and b.STANDARD_CONCEPT = 'S'
        and b.domain_id = 'Condition') and stratum_1 in ('8507','8532')) a"

echo "SNOMED - CM - add parents as children in achilles criteria with gender identity stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID, a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Condition', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)),stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
    and CONCEPT_ID in
      (select distinct CONDITION_CONCEPT_ID
      from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
      where CONDITION_CONCEPT_ID != 0
        and b.vocabulary_id = 'SNOMED'
        and b.STANDARD_CONCEPT = 'S'
        and b.domain_id = 'Condition') and stratum_1 in ('1585839','903070','1585840','1585842','1585841','1585843','903079','903096')) a"

echo "SNOMED - CM - add parents as children in achilles criteria with age at occurrence stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID, a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Condition', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)),stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
    and CONCEPT_ID in
      (select distinct CONDITION_CONCEPT_ID
      from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
      where CONDITION_CONCEPT_ID != 0
        and b.vocabulary_id = 'SNOMED'
        and b.STANDARD_CONCEPT = 'S'
        and b.domain_id = 'Condition') and stratum_1 in ('2','3','4','5','6','7','8','9')) a"


echo "SNOMED - PCS - temp table level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
select *
from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_pcs\` a
where concept_id in
  (select distinct procedure_CONCEPT_ID
  from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
  left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_CONCEPT_ID = b.concept_id
  where procedure_CONCEPT_ID != 0
    and b.vocabulary_id = 'SNOMED'
    and b.STANDARD_CONCEPT = 'S'
    and b.domain_id = 'Procedure')"

for i in {1..9};
do
    echo "SNOMED - PCS - temp table level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
    select *
    from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_pcs\` a
    where concept_id in (select P_CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`)
      and concept_id not in (select CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`)"
done

echo "SNOMED - PCS - add root"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute)
select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '71388002'"

echo "SNOMED - PCS - add root in achilles criteria with gender stratum male for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0,'8507'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '71388002'"

echo "SNOMED - PCS - add root in achilles criteria with gender stratum female for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0,'8532'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '71388002'"

for t in "${distinct_gender_identity_values[@]}"
do
    echo "SNOMED - PCS - add root in achilles criteria with gender stratum female for biological sex rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
    select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0, cast($t as string)
    from \`$BQ_PROJECT.$BQ_DATASET.concept\`
    where concept_code = '71388002'"
done

for i in {2..9}
do
    echo "SNOMED - PCS - add root in achilles criteria with age stratum"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
    select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0,$i
    from \`$BQ_PROJECT.$BQ_DATASET.concept\`
    where concept_code = '71388002'"
done

echo "SNOMED - PCS - add level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`), t.ID, 'SNOMED', 'PCS',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Procedure', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`)
   and t.type = 'SNOMED' and t.subtype = 'PCS'"

echo "SNOMED - PCS - add level 0 in achilles criteria with stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path,stratum_1)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`), t.ID, 'SNOMED', 'PCS',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Procedure', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path, t.stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`)
   and t.type = 'SNOMED' and t.subtype = 'PCS'"

for i in {1..12};
do
    echo "SNOMED - PCS - add level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`), t.ID, 'SNOMED', 'PCS',
      b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Procedure', b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING))
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)"
done

for i in {1..12};
do
    echo "SNOMED - PCS - add level $i in achilles criteria with stratum"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`), t.ID, 'SNOMED', 'PCS',
      b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Procedure', b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING)), t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)"
done

echo "SNOMED - PCS - add parents as children"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID,a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Procedure', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING))
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a
  where a.IS_GROUP = 1
  and CONCEPT_ID in
    (select distinct procedure_concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_concept_id = b.concept_id
    where procedure_CONCEPT_ID != 0
      and b.vocabulary_id = 'SNOMED'
      and b.STANDARD_CONCEPT = 'S'
      and b.domain_id = 'Procedure') ) a"

echo "SNOMED - PCS - add parents as children in achilles criteria with gender stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID,a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Procedure', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)), stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
  and CONCEPT_ID in
    (select distinct procedure_concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_concept_id = b.concept_id
    where procedure_CONCEPT_ID != 0
      and b.vocabulary_id = 'SNOMED'
      and b.STANDARD_CONCEPT = 'S'
      and b.domain_id = 'Procedure') and stratum_1 in ('8507','8532')) a"

echo "SNOMED - PCS - add parents as children in achilles criteria with gender identity stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID,a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Procedure', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)), stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
  and CONCEPT_ID in
    (select distinct procedure_concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_concept_id = b.concept_id
    where procedure_CONCEPT_ID != 0
      and b.vocabulary_id = 'SNOMED'
      and b.STANDARD_CONCEPT = 'S'
      and b.domain_id = 'Procedure') and stratum_1 in ('1585839','903070','1585840','1585842','1585841','1585843','903079','903096')) a"

echo "SNOMED - PCS - add parents as children in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID,a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Procedure', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)), stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
  where a.IS_GROUP = 1
  and CONCEPT_ID in
    (select distinct procedure_concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_concept_id = b.concept_id
    where procedure_CONCEPT_ID != 0
      and b.vocabulary_id = 'SNOMED'
      and b.STANDARD_CONCEPT = 'S'
      and b.domain_id = 'Procedure') and stratum_1 in ('2','3','4','5','6','7','8','9')) a"


echo "SNOMED - CM - child counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, count(distinct person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\`
  GROUP BY 1) y
where x.concept_id = y.concept_id
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, p.gender_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id=a.person_id
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, ob.value_source_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on ob.person_id=a.person_id
  where ob.observation_source_concept_id=1585838
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - child counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, '2' as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id=a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - child counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id=a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - child counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id=a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 90
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, count(distinct person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  group by 1) y
where x.type = 'SNOMED'
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - CM - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = b.person_id
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.gender as string)
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - CM - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on ob.person_id = b.person_id
  where ob.observation_source_concept_id=1585838
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.gender as string)
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - CM - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, '2' as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - CM - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - CM - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, 9 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 90
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'CM'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - child counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, count(distinct person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\`
  GROUP BY 1) y
where x.concept_id = y.concept_id
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, p.gender_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = a.person_id
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, ob.value_source_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on ob.person_id = a.person_id
  where ob.observation_source_concept_id=1585838
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - child counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, '2' as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - child counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, floor((extract(year from condition_start_date) - p.year_of_birth)/10) as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - child counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, 9 as age, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = a.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 90
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.age as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, count(distinct person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  group by 1) y
where x.type = 'SNOMED'
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.gender as string)
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on b.person_id = ob.person_id
  where ob.observation_source_concept_id=1585838
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.gender as string)
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, '2' as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, floor((extract(year from procedure_date) - p.year_of_birth)/10) as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"

echo "SNOMED - PCS - parent counts in achilles criteria with age stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, 9 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1)) a
  join \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 90
  group by 1,2) y
where x.type = 'SNOMED' and x.stratum_1 = cast(y.age as string)
and x.subtype = 'PCS'
and is_group = 1
and x.concept_id = y.concept_id"


echo "MEASUREMENTS - SNOMED - temp table level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`
  (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
select *
from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_meas\` a
where concept_id in
  (select distinct measurement_concept_id
  from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
  left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
  where measurement_concept_id != 0
    and b.vocabulary_id = 'SNOMED'
    and b.STANDARD_CONCEPT = 'S'
    and b.domain_id = 'Measurement')"

# for each loop, add all items (children/parents) directly under the items that were previously added
# currently, there are only 3 levels, but we run it 4 times to be safe
for i in {1..4};
do
    echo "MEASUREMENTS - SNOMED - temp table level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`
      (p_concept_id, p_concept_code, p_concept_name, p_domain_id, concept_id, concept_code, concept_name, domain_id)
    select *
    from \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_meas\` a
    where concept_id in (select P_CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`)
      and concept_id not in (select CONCEPT_ID from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`)"
done

echo "MEASUREMENTS - SNOMED - add roots"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path)
select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.criteria\`) as ID,
  0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
  CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.criteria\`) as STRING) as path
from
  (select distinct concept_id, concept_name, concept_code
  from
    (select *, rank() over (partition by descendant_concept_id order by MAX_LEVELS_OF_SEPARATION desc) rnk
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\` a
    left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.ANCESTOR_CONCEPT_ID = b.concept_id
    where descendant_concept_id in
      	(select distinct concept_id
      	from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
      	left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
      	where standard_concept = 'S'
      	and domain_id = 'Measurement'
      	and vocabulary_id = 'SNOMED')
    and domain_id = 'Measurement') a
  where rnk = 1) x"

echo "MEASUREMENTS - SNOMED - add roots male in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as ID,
  0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
  CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING) as path, '8507'
from
  (select distinct concept_id, concept_name, concept_code
  from
    (select *, rank() over (partition by descendant_concept_id order by MAX_LEVELS_OF_SEPARATION desc) rnk
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\` a
    left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.ANCESTOR_CONCEPT_ID = b.concept_id
    where descendant_concept_id in
      	(select distinct concept_id
      	from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
      	left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
      	where standard_concept = 'S'
      	and domain_id = 'Measurement'
      	and vocabulary_id = 'SNOMED')
    and domain_id = 'Measurement') a
  where rnk = 1) x"

echo "MEASUREMENTS - SNOMED - add roots female in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as ID,
  0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
  CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING) as path, '8532'
from
  (select distinct concept_id, concept_name, concept_code
  from
    (select *, rank() over (partition by descendant_concept_id order by MAX_LEVELS_OF_SEPARATION desc) rnk
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\` a
    left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.ANCESTOR_CONCEPT_ID = b.concept_id
    where descendant_concept_id in
      	(select distinct concept_id
      	from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
      	left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
      	where standard_concept = 'S'
      	and domain_id = 'Measurement'
      	and vocabulary_id = 'SNOMED')
    and domain_id = 'Measurement') a
  where rnk = 1) x"

for t in "${distinct_gender_identity_values[@]}"
do
   echo "MEASUREMENTS - SNOMED - add roots female in achilles criteria with gender stratum for biological sex rolled up counts"
   bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
   "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
     (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
   select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as ID,
     0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
     CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING) as path, cast($t as string)
   from
     (select distinct concept_id, concept_name, concept_code
     from
       (select *, rank() over (partition by descendant_concept_id order by MAX_LEVELS_OF_SEPARATION desc) rnk
       from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\` a
       left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.ANCESTOR_CONCEPT_ID = b.concept_id
       where descendant_concept_id in
         	(select distinct concept_id
         	from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
         	left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
         	where standard_concept = 'S'
         	and domain_id = 'Measurement'
         	and vocabulary_id = 'SNOMED')
       and domain_id = 'Measurement') a
     where rnk = 1) x"
done

for i in {2..9}
do
    echo "MEASUREMENTS - SNOMED - add roots male in achilles criteria with age stratum"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
    select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as ID,
      0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
      CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING) as path, $i
    from
      (select distinct concept_id, concept_name, concept_code
      from
        (select *, rank() over (partition by descendant_concept_id order by MAX_LEVELS_OF_SEPARATION desc) rnk
        from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\` a
        left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.ANCESTOR_CONCEPT_ID = b.concept_id
        where descendant_concept_id in
          	(select distinct concept_id
          	from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
          	left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.measurement_concept_id = b.concept_id
          	where standard_concept = 'S'
          	and domain_id = 'Measurement'
          	and vocabulary_id = 'SNOMED')
        and domain_id = 'Measurement') a
      where rnk = 1) x"
done

echo "MEASUREMENTS - SNOMED - add level 0"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path)
select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`),
  t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,1,0,'Measurement',b.concept_id,1,
  CONCAT(t.path, '.',
    CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`) AS STRING))
from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
  join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)
  and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`)
  and t.type = 'SNOMED'
  and t.subtype = 'MEAS'"

echo "MEASUREMENTS - SNOMED - add level 0 in achilles criteria with stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`),
  t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,1,0,'Measurement',b.concept_id,1,
  CONCAT(t.path, '.',
    CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) AS STRING)),t.stratum_1
from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
  join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)
  and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`)
  and t.type = 'SNOMED'
  and t.subtype = 'MEAS'"

# for each loop, add all items (children/parents) directly under the items that were previously added
# currently, there are only 6 levels, but we run it 7 times to be safe
for i in {1..7};
do
    echo "MEASUREMENTS - SNOMED - add level $i"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\`
      (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path)
    select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`),
      t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,
      case when l.concept_code is null then 1 else 0 end,
      case when l.concept_code is null then 0 else 1 end,
      'Measurement',b.concept_id,1,
      CONCAT(t.path, '.',
        CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`) as STRING))
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)"
done

# for each loop, add all items (children/parents) directly under the items that were previously added
# currently, there are only 6 levels, but we run it 7 times to be safe
for i in {1..7};
do
    echo "MEASUREMENTS - SNOMED - add level $i in achilles criteria with stratum for rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
    select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`),
      t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,
      case when l.concept_code is null then 1 else 0 end,
      case when l.concept_code is null then 0 else 1 end,
      'Measurement',b.concept_id,1,
      CONCAT(t.path, '.',
        CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)"
done

echo "MEASUREMENTS - SNOMED - generate counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, count(distinct person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
  group by 1) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id"

echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  group by 1,2) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(gender as string)"


echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gender, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on b.person_id = ob.person_id
    where ob.observation_source_concept_id=1585838
  group by 1,2) y
  where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(gender as string)"

echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, '2' as age, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
  group by 1,2) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(age as string)"

echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
  group by 1,2) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(age as string)"

echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with age stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, '9' as age, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 90
  group by 1,2) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(age as string)"

echo "MEASUREMENTS - SNOMED - add parents as children"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria\`) as STRING))
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.criteria\` a
    join (select measurement_concept_id, count(distinct person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\`
        group by 1) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),cast(gender as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
    join (select measurement_concept_id, p.gender_concept_id as gender,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = m.person_id
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),cast(gender as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
    join (select measurement_concept_id, ob.value_source_concept_id as gender,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.observation\` ob on ob.person_id = m.person_id
        where ob.observation_source_concept_id=1585838
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),cast(age as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
    join (select measurement_concept_id, '2' as age,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = m.person_id
        where (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),cast(age as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
    join (select measurement_concept_id, floor((extract(year from measurement_date) - p.year_of_birth)/10) as age,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = m.person_id
        where (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with age stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\`) as STRING)),cast(age as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.achilles_criteria\` a
    join (select measurement_concept_id, '9' as age,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = m.person_id
        where (extract(year from measurement_date) - p.year_of_birth) >= 90
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"


exit 0


################################################
# CLEAN UP
################################################
# TODO: remove this as it is no longer needed
#echo "CLEAN UP - remove items that no longer exist from criteria_ancestor_count table"
#bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
#"delete
#from \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\`
#where DESCENDANT_ID in
#(select distinct DESCENDANT_ID
#from \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` a
#left join \`$BQ_PROJECT.$BQ_DATASET.criteria\` b on a.ANCESTOR_ID = b.ID
#left join \`$BQ_PROJECT.$BQ_DATASET.criteria\` c on a.DESCENDANT_ID = c.ID
#where b.ID is null or c.id is null)"

echo "CLEAN UP - set est_count = -1 where the count is currently NULL"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.criteria\` set est_count = -1 where est_count is null"


################################################
# CRITERIA ANCESTOR
################################################
echo "CRITERIA_ANCESTOR - Drugs - add ingredients to drugs mapping"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor\` (ancestor_id, descendant_id)
select ancestor_concept_id, descendant_concept_id
from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.criteria\`
    where type = 'DRUG'
        and subtype = 'ATC'
        and is_group = 0
        and is_selectable = 1)
and descendant_concept_id in (select distinct drug_concept_id from \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\`)"


################################################
# CRITERIA ATTRIBUTES
################################################
echo "CRITERIA_ATTRIBUTES - Measurements - add numeric results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria_attribute\` (id, concept_id, value_as_concept_Id, concept_name, type, est_count)
select ROW_NUMBER() OVER(order by measurement_concept_id), *
from
  (select measurement_concept_id, 0, 'MIN', 'NUM', CAST(min(VALUE_AS_NUMBER) as STRING)
    from \`$BQ_PROJECT.$BQ_DATASET.measurement\`
    where measurement_concept_id in (select concept_id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'MEAS' and is_selectable = 1)
    and VALUE_AS_NUMBER is not null
    group by 1
  UNION ALL
    select measurement_concept_id, 0, 'MAX', 'NUM', CAST(max(VALUE_AS_NUMBER) as STRING)
    from \`$BQ_PROJECT.$BQ_DATASET.measurement\`
    where measurement_concept_id in (select concept_id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'MEAS' and is_selectable = 1)
    and VALUE_AS_NUMBER is not null
    group by 1
  ) a"

echo "CRITERIA_ATTRIBUTES - Measurements - add categorical results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria_attribute\` (id, concept_id, value_as_concept_Id, concept_name, type, est_count)
select ROW_NUMBER() OVER(order by measurement_concept_id) + (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.criteria_attribute\`), *
from
    (select measurement_concept_id, value_as_concept_id, b.concept_name, 'CAT' as type, CAST(count(*) as STRING) as est_count
    from \`$BQ_PROJECT.$BQ_DATASET.measurement\` a
        left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.value_as_concept_Id = b.concept_id
    where value_as_concept_id != 0
        and value_as_concept_id is not null
        and measurement_concept_id in (select concept_id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'MEAS' and is_selectable = 1)
    group by 1,2,3
    ) a"


################################################
# CRITERIA RELATIONSHIP
################################################
echo "CRITERIA_RELATIONSHIP - Drugs - add drug/ingredient relationships"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.criteria_relationship\` ( concept_id_1, concept_id_2 )
select cr.concept_id_1, cr.concept_id_2
from \`$BQ_PROJECT.$BQ_DATASET.concept_relationship\` cr
join \`$BQ_PROJECT.$BQ_DATASET.concept\` c1 on cr.concept_id_2 = c1.concept_id
where cr.concept_id_1 in (select concept_id from \`$BQ_PROJECT.$BQ_DATASET.criteria\` where type = 'DRUG' and subtype = 'BRAND')
and c1.concept_class_id = 'Ingredient'"


################################################
# DROPPED PREP TABLES AND VIEWS
################################################
#echo "DROP - criteria_seed"
#bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
#"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.criteria_seed\`"

#echo "DROP - criteria_ancestor_count"
#bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
#"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\`"

#echo "DROP - criteria_terms_nc"
#bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
#"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.criteria_terms_nc\`"

echo "DROP - atc_rel_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.atc_rel_in_data\`"

echo "DROP - loinc_rel_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.loinc_rel_in_data\`"

echo "DROP - snomed_rel_cm_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`"

echo "DROP - snomed_rel_pcs_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`"

echo "DROP - snomed_rel_meas_in_data"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP TABLE IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`"

echo "DROP - v_loinc_rel"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.v_loinc_rel\`"

echo "DROP - v_snomed_rel_cm"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_cm\`"

echo "DROP - v_snomed_rel_pcs"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_pcs\`"

echo "DROP - v_snomed_rel_meas"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"DROP VIEW IF EXISTS \`$BQ_PROJECT.$BQ_DATASET.v_snomed_rel_meas\`"
