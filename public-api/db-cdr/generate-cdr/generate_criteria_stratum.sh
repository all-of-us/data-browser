#!/bin/bash

# Run queries to populate criteria stratum counts
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate_criteria_stratum.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
USAGE="$USAGE --cdr-version=YYYYMMDD"

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --bq-project) BQ_PROJECT=$2; shift 2;;
    --bq-dataset) BQ_DATASET=$2; shift 2;;
    --workbench-project) OUTPUT_PROJECT=$2; shift 2;;
    --workbench-dataset) OUTPUT_DATASET=$2; shift 2;;
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

if [ -z "${OUTPUT_PROJECT}" ]
then
  echo "Usage: $USAGE"
  exit 1

fi

if [ -z "${OUTPUT_DATASET}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

echo "copying counts of procedure child concepts from achilles results"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select distinct c.concept_id,ar.stratum_2 as stratum_1,'biological_sex' as stratum_2, 'Procedure', ar.count_value, 3101 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM') and cr.full_text like '%rank1%' and ar.stratum_3='Procedure' and cr.domain_id='PROCEDURE'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting biological sex rolled up counts for procedure parent concepts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
select concept_id, cast(gender as string), 'biological_sex', 'Procedure', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM')
    and domain_id = 'PROCEDURE'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "Copying age counts into criteria_stratum for procedure child concepts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select distinct c.concept_id,ar.stratum_2 as stratum_1,'age' as stratum_2, 'Procedure', ar.count_value, 3102 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM') and cr.domain_id='PROCEDURE' and cr.full_text like '%procedure_rank1%' and ar.stratum_3='Procedure'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting age stratum counts for parent pcs concepts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
with y as
  (select ancestor_concept_id as concept_id, b.person_id,
  CASE WHEN CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) >= 18 AND CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) <= 29 THEN '2'
       WHEN CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) > 89 THEN '9'
       WHEN CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) >= 30 AND CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) <= 89 THEN CAST(FLOOR(CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) / 10) AS STRING)
       WHEN CEIL(TIMESTAMP_DIFF(procedure_datetime, birth_datetime, DAY) / 365.25) < 18 THEN '0' END AS age
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM')
    and domain_id = 'PROCEDURE'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  group by 1,2,3),
  min_y as
  (select concept_id, person_id, min(age) as age from y group by 1, 2)
  select concept_id, age AS stratum_1, 'age', 'Procedure', count(distinct person_id) as cnt, 3102 from min_y
  group by concept_id,age
  order by concept_id asc"

echo "Inserting snomed condition counts"

echo "biological sex child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'biological_sex' as stratum_2, 'Condition', ar.count_value, 3101
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "biological sex parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, cast(gender as string), 'biological_sex', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'SNOMED'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "age child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,ar.stratum_2 as stratum_1,'age' as stratum_2, 'Condition', ar.count_value, 3102
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "age parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
with y as
(select ancestor_concept_id as concept_id, b.person_id,
  CASE WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 18 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 29 THEN '2'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) > 89 THEN '9'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 30 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 89 THEN CAST(FLOOR(CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) / 10) AS STRING)
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) < 18 THEN '0' END AS age
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'SNOMED'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2,3),
  min_y as
  (select concept_id, person_id, min(age) as age from y group by 1, 2)
  select concept_id, age AS stratum_1, 'age', 'Condition', count(distinct person_id) as cnt, 3102 from min_y
  group by concept_id,age
  order by concept_id asc
"

echo "Inserting icd9cm condition counts"

echo "biological sex child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'biological_sex' as stratum_2, 'Condition', ar.count_value, 3101
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD9CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "biological sex parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, cast(gender as string), 'biological_sex', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD9CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "age child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'age' as stratum_2, 'Condition', ar.count_value, 3102
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD9CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "age parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
with y as
(select ancestor_concept_id as concept_id, b.person_id,
  CASE WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 18 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 29 THEN '2'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) > 89 THEN '9'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 30 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 89 THEN CAST(FLOOR(CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) / 10) AS STRING)
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) < 18 THEN '0' END AS age
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD9CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2,3),
  min_y as
  (select concept_id, person_id, min(age) as age from y group by 1, 2)
  select concept_id, age AS stratum_1, 'age', 'Condition', count(distinct person_id) as cnt, 3102 from min_y
  group by concept_id,age
  order by concept_id asc
"

echo "Inserting ICD10CM condition counts"

echo "biological sex child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'biological_sex' as stratum_2, 'Condition', ar.count_value, 3101
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD10CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "biological sex parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, cast(gender as string), 'biological_sex', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD10CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "age child concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'age' as stratum_2, 'Condition', ar.count_value, 3102
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD10CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "age parent concept counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
with y as
(select ancestor_concept_id as concept_id, b.person_id,
  CASE WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 18 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 29 THEN '2'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) > 89 THEN '9'
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) >= 30 AND CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) <= 89 THEN CAST(FLOOR(CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) / 10) AS STRING)
       WHEN CEIL(TIMESTAMP_DIFF(condition_start_datetime, birth_datetime, DAY) / 365.25) < 18 THEN '0' END AS age
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD10CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2,3),
  min_y as
  (select concept_id, person_id, min(age) as age from y group by 1, 2)
  select concept_id, age AS stratum_1, 'age', 'Condition', count(distinct person_id) as cnt, 3102 from min_y
  group by concept_id,age
  order by concept_id asc
"

echo "location counts"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select distinct c.concept_id, ar.stratum_2 as stratum_1,'location' as stratum_2, 'Procedure', ar.count_value, 3108 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM') and cr.full_text like '%rank1%' and ar.stratum_3='Procedure' and cr.domain_id='PROCEDURE'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
WITH state_information AS (
        SELECT ob.person_id,
        LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
        FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
        JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
        ON ob.value_source_concept_id = c.concept_id
        WHERE observation_source_concept_id = 1585249
)
select concept_id, location, 'location', 'Procedure', cnt, 3108
from
  (select ancestor_concept_id as concept_id, si.location as location, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type in ('SNOMED', 'ICD9Proc', 'ICD10PCS', 'CPT4', 'ICD9CM')
    and domain_id = 'PROCEDURE'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  join state_information si on si.person_id = p.person_id
  group by 1,2) y
  group by concept_id,location,cnt
  order by concept_id asc;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'location' as stratum_2, 'Condition', ar.count_value, 3108
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
WITH state_information AS (
        SELECT ob.person_id,
        LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
        FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
        JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
        ON ob.value_source_concept_id = c.concept_id
        WHERE observation_source_concept_id = 1585249
)
select concept_id, location, 'biological_sex', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, si.location as location, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'SNOMED'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  join state_information si on p.person_id = si.person_id
  group by 1,2) y
  group by concept_id,location,cnt
  order by concept_id asc"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'location' as stratum_2, 'Condition', ar.count_value, 3108
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD9CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
WITH state_information AS (
        SELECT ob.person_id,
        LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
        FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
        JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
        ON ob.value_source_concept_id = c.concept_id
        WHERE observation_source_concept_id = 1585249
)
select concept_id, location, 'location', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, si.location as location, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD9CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  join state_information si on si.person_id = p.person_id
  group by 1,2) y
  group by concept_id,location,cnt
  order by concept_id asc;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id, ar.stratum_2 as stratum_1,'location' as stratum_2, 'Condition', ar.count_value, 3108
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='ICD10CM' and cr.domain_id='CONDITION' and cr.full_text like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
WITH state_information AS (
        SELECT ob.person_id,
        LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
        FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
        JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
        ON ob.value_source_concept_id = c.concept_id
        WHERE observation_source_concept_id = 1585249
)
select concept_id, location, 'location', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, si.location as location, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.cb_criteria\`
    where type = 'ICD10CM'
    and domain_id = 'CONDITION'
    and is_group = 1 and full_text like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  join state_information si on p.person_id = si.person_id
  group by 1,2) y
  group by concept_id, location,cnt
  order by concept_id asc"
