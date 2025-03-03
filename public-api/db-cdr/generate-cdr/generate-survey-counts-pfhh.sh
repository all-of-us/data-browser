#!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate-survey-counts-pfhh.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` AS
select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` where survey_concept_id = 43529712"


bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3110 as analysis_id, '43529712' as stratum_1, CAST(ob.concept_id as string) as stratum_2,
CAST(ob.value_source_concept_id as string) as stratum_3, sm.answer as stratum_4,
cast(sm2.order_number as string) stratum_5,
sm2.path as stratum_6,
Count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.pfhh_qa_metadata\` sm on ob.concept_id = sm.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sm2 on sm2.concept_id = sm.question_concept_id
and ob.value_source_concept_id = sm.answer_concept_id
group by 4, 5, 6, 7, 8;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3111 as analysis_id, '43529712' as stratum_1, CAST(ob.concept_id as string) as stratum_2,
CAST(ob.value_source_concept_id as string) as stratum_3, sm.answer as stratum_4,
cast(p.gender_concept_id as string) stratum_5,
sm2.path as stratum_6,
Count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.pfhh_qa_metadata\` sm on ob.concept_id = sm.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sm2 on sm2.concept_id = sm.question_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on ob.person_id = p.person_id
and ob.value_source_concept_id = sm.answer_concept_id
group by 4, 5, 6, 7, 8;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value)
select 0 as id, 3115 as analysis_id, '43529712' as stratum_1, CAST(ob.concept_id as string) as stratum_2,
CAST(ob.value_source_concept_id as string) as stratum_3, sm.answer as stratum_4,
p.age_stratum as stratum_5,
sm2.path as stratum_6,
cast(p.gender as string) as stratum_7,
Count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.pfhh_qa_metadata\` sm on ob.concept_id = sm.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sm2 on sm2.concept_id = sm.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_gender_stratum\` p on ob.person_id = p.person_id
and ob.value_source_concept_id = sm.answer_concept_id
group by 4, 5, 6, 7, 8, 9;"


# New 3118 query by location (similar to 3111 but using location)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
WITH state_information AS (
         SELECT
             ob.person_id,
             LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
         FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
         JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
         ON ob.value_source_concept_id = c.concept_id
         WHERE ob.observation_source_concept_id = 1585249
)
select 0 as id, 3118 as analysis_id, '43529712' as stratum_1, CAST(ob.concept_id as string) as stratum_2,
CAST(ob.value_source_concept_id as string) as stratum_3, sm.answer as stratum_4,
cast(si.location as string) stratum_5,
sm2.path as stratum_6,
Count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.pfhh_qa_metadata\` sm on ob.concept_id = sm.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sm2 on sm2.concept_id = sm.question_concept_id
join state_information si on ob.person_id = si.person_id
and ob.value_source_concept_id = sm.answer_concept_id
group by 4, 5, 6, 7, 8;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with survey_age_gender_stratum as
(
select *,
case when age_at_event >= 18 and age_at_event <= 29 then '2'
when age_at_event > 89 then '9'
when age_at_event >= 30 and age_at_event <= 89 then cast(floor(age_at_event/10) as string)
when age_at_event < 18 then '0' end as age_stratum from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\`
)
select 0 as id, 3112 as analysis_id, '43529712' as stratum_1, CAST(ob.concept_id as string) as stratum_2,
CAST(ob.value_source_concept_id as string) as stratum_3, sm.answer as stratum_4,
cast(ob.age_stratum as string) stratum_5,
sm2.path as stratum_6,
Count(distinct ob.person_id) as count_value, 0 as source_count_value
from survey_age_gender_stratum ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.pfhh_qa_metadata\` sm on ob.concept_id = sm.question_concept_id
join\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sm2 on sm2.concept_id = sm.question_concept_id
and ob.value_source_concept_id = sm.answer_concept_id
group by 4, 5, 6, 7, 8;"

# Gender breakdown of people who took each survey (Row for combinations of each survey and gender)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3101 as analysis_id,
'43529712' as stratum_1,
CAST(p1.gender_concept_id AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
\`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sq
On ob1.concept_id=sq.concept_id
where (ob1.concept_id > 0 and ob1.value_source_concept_id > 0)
group by p1.gender_concept_id"

# Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
with survey_age_gender_stratum as
(
select *,
case when age_at_event >= 18 and age_at_event <= 29 then '2'
when age_at_event > 89 then '9'
when age_at_event >= 30 and age_at_event <= 89 then cast(floor(age_at_event/10) as string)
when age_at_event < 18 then '0' end as age_stratum from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\`
)
select 0, 3102 as analysis_id,
'43529712' as stratum_1,
age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from survey_age_gender_stratum ob1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sq
On ob1.concept_id=sq.concept_id
where (ob1.concept_id > 0 and ob1.value_source_concept_id > 0)
group by stratum_2"

# New 3118 query by location (similar to 3101 but using location)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
WITH state_information AS (
              SELECT
                  ob.person_id,
                  LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
              FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
              JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
              ON ob.value_source_concept_id = c.concept_id
              WHERE ob.observation_source_concept_id = 1585249
     )
select 0, 3108 as analysis_id,
'43529712' as stratum_1,
CAST(si.location AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
inner join \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob1 on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sq
On ob1.concept_id=sq.concept_id
join state_information si on p1.person_id = si.person_id
where (ob1.concept_id > 0 and ob1.value_source_concept_id > 0)
group by si.location"

# Count of people who took each survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id, '43529712' as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` sq
On o.concept_id=sq.concept_id
Where (o.concept_id > 0 and o.value_source_concept_id > 0)
and o.concept_id not in (40766240,43528428,1585389)"

# Survey Module counts by gender
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3200 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1,
cast(p.gender_concept_id as string) as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=ob.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` cr
on ob.concept_id=cr.concept_id
group by cr.survey_concept_id, p.gender_concept_id"

# Survey Module counts by age decile
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
with survey_age_gender_stratum as
 (
 select *,
 case when age_at_event >= 18 and age_at_event <= 29 then '2'
 when age_at_event > 89 then '9'
 when age_at_event >= 30 and age_at_event <= 89 then cast(floor(age_at_event/10) as string)
 when age_at_event < 18 then '0' end as age_stratum from \`${BQ_PROJECT}.${BQ_DATASET}.cb_search_all_events\`
 )
 select 0 as id, 3201 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1, sa.age_stratum as stratum_2, count(distinct sa.person_id) as count_value, count(distinct sa.person_id) as source_count_value
  from survey_age_gender_stratum sa
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_w_pfhh\` cr
 on sa.concept_id=cr.concept_id
 group by stratum_1, stratum_2;"