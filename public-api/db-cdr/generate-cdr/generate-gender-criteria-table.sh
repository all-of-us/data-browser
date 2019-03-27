#!/bin/bash

# This generates the criteria tables for the CDR

# PREP: upload all prep tables

# Example usage:
# ./project.rb generate-gender-criteria-table --bq-project aou-res-curation-prod --bq-dataset deid_output_20181116
# ./project.rb generate-gender-criteria-table --bq-project all-of-us-ehr-dev --bq-dataset synthetic_cdr20180606


set -xeuo pipefail
IFS=$'\n\t'

# --cdr=cdr_version ... *optional
USAGE="./generate-cdr/generate-gender-criteria-table.sh --bq-project <PROJECT> --bq-dataset <DATASET>"

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

################################################
# CREATE TABLES
################################################
echo "CREATE TABLES - achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
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

################################################
# ICD9
################################################
echo "ICD9 - inserting data (do not insert zero count children) into achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
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

echo "ICD9 - generating parent counts in achilles criteria with gender stratum for chart rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD9' and is_group = 1 and is_selectable = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD9' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(gender as string)"

echo "ICD9 - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
where type = 'ICD9'
and is_selectable = 1
and (est_count is null or est_count = 0)"

################################################
# ICD10
################################################
echo "ICD10 - CM - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
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

echo "ICD10 - PCS - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
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

echo "ICD10 - CM - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'CM' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'CM' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - PCS - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'PCS' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.CONDITION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'ICD10' and subtype = 'PCS' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id = p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "ICD10 - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
where type = 'ICD10'
and is_selectable = 1
and (est_count is null or est_count = 0)"

################################################
# CPT
################################################
echo "CPT - insert data (do not insert zero count children) in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
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

echo "CPT - generate parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from (select c.id, gender, count(distinct person) cnt
from (select * from (select id from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'CPT' and parent_id != 0 and is_group = 1) a
left join \`$BQ_PROJECT.$BQ_DATASET.criteria_ancestor_count\` b on a.id = b.ancestor_id) c
left join
  (select a.id, b.*
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a,
    (
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.drug_exposure\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.drug_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.observation\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.OBSERVATION_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.measurement\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.MEASUREMENT_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
      UNION DISTINCT
      SELECT a.person_id as person, p.gender_concept_id as gender, concept_id
      FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a, \`$BQ_PROJECT.$BQ_DATASET.person\` p,
      (select concept_id, path, code from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` where type = 'CPT' and is_group = 0 and is_selectable = 1) b
      WHERE a.PROCEDURE_SOURCE_CONCEPT_ID = b.concept_id and a.person_id=p.person_id
    ) b
  where a.concept_id = b.concept_id) d on c.descendant_id = d.id
group by 1,2) y
where x.id = y.id and x.stratum_1 = cast(y.gender as string)"

echo "CPT - delete zero count parents in achilles criteria"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"delete
from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
where type = 'CPT'
and ( (parent_id != 0 and (est_count is null or est_count = 0))
or (is_group = 1 and id not in (select parent_id from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
where type = 'CPT' and est_count is not null)) )"

################################################
# SNOMED
################################################
echo "SNOMED - CM - add root in achilles criteria with gender stratum (male) for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, '8507'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '404684003'"

echo "SNOMED - CM - add root in achilles criteria with gender stratum (female) for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, stratum_1)
select (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)+1 AS ID, 0, 'SNOMED', 'CM', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Condition', concept_id, 0, '8532'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '404684003'"

echo "SNOMED - CM - add level 0 in achilles criteria with stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`), t.ID, 'SNOMED', 'CM',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Condition', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path, t.stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\`)"

for i in {1..18};
do
    echo "SNOMED - CM - add level $i in achilles criteria with stratum for rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`),
      t.ID, 'SNOMED', 'CM', b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Condition',b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING)),t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
       join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on t.code = b.p_concept_code
       left join (select distinct a.CONCEPT_CODE
              from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` a
                   left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_cm_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
             where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)
    and t.stratum_1 in ('8507','8532')"
done

echo "SNOMED - CM - add parents as children in achilles criteria with gender stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID, a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Condition', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)),stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a
  where a.IS_GROUP = 1
    and CONCEPT_ID in
      (select distinct CONDITION_CONCEPT_ID
      from \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.CONDITION_CONCEPT_ID = b.concept_id
      where CONDITION_CONCEPT_ID != 0
        and b.vocabulary_id = 'SNOMED'
        and b.STANDARD_CONCEPT = 'S'
        and b.domain_id = 'Condition') and stratum_1 in ('8507','8532')) a"

echo "SNOMED - PCS - add root in achilles criteria with gender stratum male for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0,'8507'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '71388002'"

echo "SNOMED - PCS - add root in achilles criteria with gender stratum female for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute,stratum_1)
select (select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)+1, 0, 'SNOMED', 'PCS', CONCEPT_CODE, CONCEPT_NAME, 1, 0, 'Procedure', concept_id, 0,'8532'
from \`$BQ_PROJECT.$BQ_DATASET.concept\`
where concept_code = '71388002'"

echo "SNOMED - PCS - add level 0 in achilles criteria with stratum"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path,stratum_1)
select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`), t.ID, 'SNOMED', 'PCS',
b.CONCEPT_CODE, b.CONCEPT_NAME, 1,0, 'Procedure', b.CONCEPT_ID, 0, CAST(t.id as STRING) as path, t.stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
	   join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
 where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)
   and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\`)
   and t.type = 'SNOMED' and t.subtype = 'PCS'"


for i in {1..12};
do
    echo "SNOMED - PCS - add level $i in achilles criteria with stratum"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
    select row_number() over (order by t.ID, b.CONCEPT_NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`), t.ID, 'SNOMED', 'PCS',
      b.CONCEPT_CODE, b.CONCEPT_NAME,
      case when l.CONCEPT_CODE is null then 1 else 0 end,
      case when l.CONCEPT_CODE is null then 0 else 1 end,
      'Procedure', b.CONCEPT_ID, 0, CONCAT(t.path, '.', CAST(t.ID as STRING)), t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_pcs_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)"
done

echo "SNOMED - PCS - add parents as children in achilles criteria with gender stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` (ID, PARENT_ID, TYPE, SUBTYPE, CODE, NAME, IS_GROUP, IS_SELECTABLE, domain_id, CONCEPT_ID, has_attribute, path, stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)) as ID, *
from
  (select distinct a.ID as PARENT_ID,a.TYPE, a.SUBTYPE, a.CODE, a.NAME, 0, 1, 'Procedure', a.CONCEPT_ID, 0, CONCAT(a.path, '.', CAST(a.ID as STRING)), stratum_1
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a
  where a.IS_GROUP = 1
  and CONCEPT_ID in
    (select distinct procedure_concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a
      left join \`$BQ_PROJECT.$BQ_DATASET.concept\` b on a.procedure_concept_id = b.concept_id
    where procedure_CONCEPT_ID != 0
      and b.vocabulary_id = 'SNOMED'
      and b.STANDARD_CONCEPT = 'S'
      and b.domain_id = 'Procedure') and stratum_1 in ('8507','8532')) a"

echo "SNOMED - CM - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
set x.est_count = y.cnt
from
  (SELECT condition_concept_id as concept_id, p.gender_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.condition_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id=a.person_id
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'CM'
and x.is_selectable = 1"

echo "SNOMED - CM - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
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

echo "SNOMED - PCS - child counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"update \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
set x.est_count = y.cnt
from
  (SELECT procedure_concept_id as concept_id, p.gender_concept_id as gender, count(distinct a.person_id) cnt
  FROM \`$BQ_PROJECT.$BQ_DATASET.procedure_occurrence\` a join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = a.person_id
  GROUP BY 1,2) y
where x.concept_id = y.concept_id and x.stratum_1 = cast(y.gender as string)
and x.type = 'SNOMED'
and x.subtype = 'PCS'
and x.is_selectable = 1"

echo "SNOMED - PCS - parent counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
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

echo "MEASUREMENTS - SNOMED - add roots male in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as ID,
  0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
  CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as STRING) as path, '8507'
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
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as ID,
  0,'SNOMED','MEAS',concept_code,concept_name,1,0,'Measurement',concept_id,1,
  CAST(ROW_NUMBER() OVER(order by concept_name) + (SELECT MAX(ID) FROM \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as STRING) as path, '8532'
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

echo "MEASUREMENTS - SNOMED - add level 0 in achilles criteria with stratum for rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`),
  t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,1,0,'Measurement',b.concept_id,1,
  CONCAT(t.path, '.',
    CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) AS STRING)),t.stratum_1
from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
  join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)
  and b.concept_id in (select p_concept_id from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\`)
  and t.type = 'SNOMED'
  and t.subtype = 'MEAS'"

# for each loop, add all items (children/parents) directly under the items that were previously added
# currently, there are only 6 levels, but we run it 7 times to be safe
for i in {1..7};
do
    echo "MEASUREMENTS - SNOMED - add level $i in achilles criteria with stratum for rolled up counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
      (id,parent_id,type,subtype,code,name,is_group,is_selectable,domain_id,concept_id,has_attribute,path,stratum_1)
    select row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`),
      t.id,'SNOMED','MEAS',b.concept_code,b.concept_name,
      case when l.concept_code is null then 1 else 0 end,
      case when l.concept_code is null then 0 else 1 end,
      'Measurement',b.concept_id,1,
      CONCAT(t.path, '.',
        CAST(row_number() over (order by t.id, b.concept_name)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as STRING)),t.stratum_1
    from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` t
      join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on t.code = b.p_concept_code
      left join (select distinct a.CONCEPT_CODE
          from \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` a
          left join \`$BQ_PROJECT.$BQ_DATASET.snomed_rel_meas_in_data\` b on a.CONCEPT_ID = b.P_CONCEPT_ID
          where b.CONCEPT_ID is null) l on b.CONCEPT_CODE = l.CONCEPT_CODE
    where (id) not in (select PARENT_ID from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)"
done

echo "MEASUREMENTS - SNOMED - generate counts in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` x
SET x.est_count = y.cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
    (select *
    from \`$BQ_PROJECT.$BQ_DATASET.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS')) a
    join \`$BQ_PROJECT.$BQ_DATASET.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`$BQ_PROJECT.$BQ_DATASET.person\` p on b.person_id = p.person_id
  group by 1,2) y
where x.type = 'SNOMED'
  and x.subtype = 'MEAS'
  and x.concept_id = y.concept_id and x.stratum_1 = cast(gender as string)"

echo "MEASUREMENTS - SNOMED - add parents as children in achilles criteria with gender stratum for biological sex rolled up counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`
  (id,parent_id,type,subtype,code,name,is_group,is_selectable,est_count,domain_id,concept_id,has_attribute,path,stratum_1)
select (row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`)) as ID,
id as parent_id,type,subtype,code,name,cnt,0,1,domain_id,concept_id,1,CONCAT(path, '.',
  CAST(row_number() over (order by PARENT_ID, NAME)+(select max(id) from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\`) as STRING)),cast(gender as string)
from
  (select *
  from \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` a
    join (select measurement_concept_id, p.gender_concept_id as gender,count(distinct m.person_id) cnt
        from \`$BQ_PROJECT.$BQ_DATASET.measurement\` m join \`$BQ_PROJECT.$BQ_DATASET.person\` p on p.person_id = m.person_id
        group by 1,2) b on a.concept_id = b.measurement_concept_id
  where type = 'SNOMED'
    and subtype = 'MEAS'
    and is_group = 1) x"

################################################
# CLEAN UP
################################################
echo "CLEAN UP - set est_count = -1 where the count is currently NULL"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`$BQ_PROJECT.$BQ_DATASET.gender_criteria\` set est_count = -1 where est_count is null"
