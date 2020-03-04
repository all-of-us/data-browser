#!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate-survey-counts.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

# Set the survey answer count for all the survey questions
# (except q2 in the basics survey and questions of family medical history since we deal with them in a different way)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id != 43528698
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# Set the survey answer count of only first question in fmh
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id = 43528698
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count;"


# Set the survey answer count for basics q2 for all the categories other than american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join single_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the count of more than one race / ethnicity
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140)
group by o.observation_source_concept_id,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the rolled survey answer count for basics q2 for the categories american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by o.observation_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the survey answer count for all the survey questions that has value as number and not value as concept id
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,count_value,source_count_value)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id=0)
group by o.observation_source_concept_id,o.value_as_number,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender for all questions except basics q2 and fmh questions
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id != 43528698
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
),
sub_2_questions_count as
(
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
)
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# survey question answer count by gender for fmh main question
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id = 43528698
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count;"

# Survey question answers count by gender for q2 unrolled
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey gender counts for more than one race / ethnicity bucket
# Survey question answers count by gender for q2 unrolled
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140)
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender for q2 (rolling up categories)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people spa on spa.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by sm.concept_id,o.observation_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender(value_as_number not null)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id = 0)
group by sm.concept_id,o.observation_source_concept_id,o.value_as_number,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions except q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0 and sq.survey_concept_id != 43528698
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# Survey Question Answer Count by age deciles for fmh main question
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0 and sq.survey_concept_id = 43528698
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count"

# Survey Question Answer Count by age deciles for unrolled categories in q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answer count by age deciles for more than one race / ethnicity bucket
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join multiple_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140)
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"


# Survey Question Answer Count by age deciles for rolled categories in q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'903070' as stratum_3,'Other' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by sm.concept_id,o.observation_source_concept_id,stratum_4,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions that have value_as_number
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id = 0 and o.value_as_number >= 0)
group by sm.concept_id,o.observation_source_concept_id,o.value_as_number,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Gender breakdown of people who took each survey (Row for combinations of each survey and gender)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3101 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
CAST(p1.gender_concept_id AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p1 inner join
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sm.concept_id, p1.gender_concept_id"

# Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3102 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on
sa.observation_id = ob1.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sm.concept_id, stratum_2"

# Current Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
with current_person_age as
(select person_id,
ceil(TIMESTAMP_DIFF(current_timestamp(), birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
group by person_id,age
),
current_person_age_stratum as
(
select person_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from current_person_age
group by person_id,age_stratum
)
select 0, 3106 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
ca.age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1 join current_person_age_stratum ca on ca.person_id=ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sm.concept_id, stratum_2"

# Survey Module counts by gender
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3200 as analysis_id, cast(cr.concept_id_2 as string) as stratum_1,
cast(p.gender_concept_id as string) as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_concept_relationship\` cr
on ob.observation_source_concept_id=cr.concept_id_1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm
on cr.concept_id_2=sm.concept_id
group by cr.concept_id_2, p.gender_concept_id"

# Survey Module counts by age decile
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3201 as analysis_id, cast(cr.concept_id_2 as string) as stratum_1, sa.age_stratum as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_concept_relationship\` cr
on ob.observation_source_concept_id=cr.concept_id_1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm
on cr.concept_id_2=sm.concept_id
group by stratum_1, stratum_2"

# To do delete if not used anymore
# Survey question counts by biological sex
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0,3320 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=0
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(
select 0,3320 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=3
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
),
sub_2_questions_count as
(
select 0,3320 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=5
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
)
select 0 as id, 3320 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3320 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3320 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# Survey question counts by age decile
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\`),
main_questions_count as
(select 0, 3321 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=0
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(select 0, 3321 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=3
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(select 0, 3321 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=5
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64))
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# Count of people who took each survey
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sm.concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id not in (40766240,43528428,1585389)
Group by sm.concept_id"

