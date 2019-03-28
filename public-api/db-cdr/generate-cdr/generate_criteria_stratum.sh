#!/bin/bash

# Runs measurement queries to populate count db of measurement data for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/run-measurement-queries.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
USAGE="$USAGE --cdr-version=YYYYMMDD"

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --bq-project) BQ_PROJECT=$2; shift 2;;
    --bq-dataset) BQ_DATASET=$2; shift 2;;
    --workbench-project) WORKBENCH_PROJECT=$2; shift 2;;
    --workbench-dataset) WORKBENCH_DATASET=$2; shift 2;;
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

if [ -z "${WORKBENCH_PROJECT}" ]
then
  echo "Usage: $USAGE"
  exit 1

fi

if [ -z "${WORKBENCH_DATASET}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

echo "creating criteria_stratum table"

echo "Inserting child counts for biological sex analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'biological_sex' as stratum_2,ar.count_value from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='MEAS' and cr.synonyms like '%rank1%'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc";

echo "Inserting rolled up counts for biological sex analysis"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2,count_value)
select concept_id, gender, 'biological_sex', cnt
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id = p.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "Inserting child counts for age analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'age' as stratum_2,ar.count_value from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='MEAS' and cr.synonyms like '%rank1%'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting rolled up counts for age at occurrence analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2,count_value)
select concept_id, age, 'age', cnt
from
  (select ancestor_concept_id as concept_id, 2 as age , count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 18 and (extract(year from measurement_date) - p.year_of_birth) < 30
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"
echo "Inserting rolled up counts for age at occurrence analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2,count_value)
select concept_id, age, 'age', cnt
from
  (select ancestor_concept_id as concept_id, cast(floor((extract(year from measurement_date) - p.year_of_birth)/10) as int64) as age , count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 30 and (extract(year from measurement_date) - p.year_of_birth) < 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"

echo "Inserting rolled up counts for age at occurrence analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2,count_value)
select concept_id, age, 'age', cnt
from
  (select ancestor_concept_id as concept_id, 9 as age , count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id = p.person_id
    where (extract(year from measurement_date) - p.year_of_birth) >= 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"

echo "Inserting child counts for gender identity analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'gender_identity' as stratum_2,ar.count_value from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3107 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='MEAS' and cr.synonyms like '%rank1%'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting rolled up counts for gender identity analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select concept_id, gi, 'gender_identity', cnt
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gi , count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on b.person_id = ob.person_id
    where ob.observation_source_concept_id=1585838
  group by 1,2) y
  group by concept_id,gi,cnt
  order by concept_id asc"

echo "Inserting child counts for race ethnicity analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'race_ethnicity' as stratum_2,ar.count_value from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='MEAS' and cr.synonyms like '%rank1%'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting rolled up counts for race ethnicity analysis from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, count_value)
select concept_id, re, 'race_ethnicity', cnt
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as re , count(distinct b.person_id) cnt
  from
    (select *
    from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
    where ancestor_concept_id in
      (select distinct concept_id
      from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
      where type = 'SNOMED'
        and subtype = 'MEAS' and is_group=1 and synonyms like '%rank1%')) a
    join \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` b on a.descendant_concept_id = b.measurement_concept_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on b.person_id = ob.person_id
    where ob.observation_source_concept_id=1586140
  group by 1,2) y
  group by concept_id,re,cnt
  order by concept_id asc"
