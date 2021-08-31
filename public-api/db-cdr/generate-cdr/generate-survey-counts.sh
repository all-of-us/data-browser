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

# Cope survey response counts by version
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` where survey_concept_id = 1333342),
main_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=3
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc),
sub_2_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=5
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from sub_2_questions_count;"

# Set the survey answer count for all the survey questions
# (except q2 in the basics survey and questions of family health history since we deal with them in a different way)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id != 43528698
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and (exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_2_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and (exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
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
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id = 43528698
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count;"


# Set the survey answer count for basics q2 for all the categories other than american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,
CAST(o.observation_source_concept_id as string) as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join single_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number
order by CAST(sq.order_number as int64) asc"

# Set the count of more than one race / ethnicity
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,cast(sq.order_number as string) stratum_5,
CAST(o.observation_source_concept_id as string) as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140)
group by o.observation_source_concept_id,sq.survey_concept_id,sq.order_number
order by CAST(sq.order_number as int64) asc"

# Set the rolled survey answer count for basics q2 for the categories american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,cast(sq.order_number as string) stratum_5,
CAST(o.observation_source_concept_id as string) as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by o.observation_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number
order by CAST(sq.order_number as int64) asc"

# Set the survey answer count for all the survey questions that has value as number and not value as concept id
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,count_value,source_count_value)
SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,cast(sq.order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id=0)
group by o.observation_source_concept_id,o.value_as_number,sq.survey_concept_id,sq.order_number
order by CAST(sq.order_number as int64) asc"

# Survey question answers count by gender for all questions except basics q2 and fmh questions
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id != 43528698
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc
),
sub_2_questions_count as
(
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc
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
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0 and sq.survey_concept_id = 43528698
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count;"

# Survey question answers count by gender for q2 unrolled
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey gender counts for more than one race / ethnicity bucket
# Survey question answers count by gender for q2 unrolled
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140)
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey question answers count by gender for q2 (rolling up categories)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join single_answered_people spa on spa.person_id=o.person_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by sq.survey_concept_id,o.observation_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey question answers count by gender(value_as_number not null)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id = 0)
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_as_number,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions except q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0 and sq.survey_concept_id != 43528698
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=3 and sq.survey_concept_id != 43528698
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_2_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=5 and sq.survey_concept_id != 43528698
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
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
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0 and sq.survey_concept_id = 43528698
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count"

# Survey Question Answer Count by age deciles for unrolled categories in q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey question answer count by age deciles for more than one race / ethnicity bucket
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join multiple_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id = 1586140)
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"


# Survey Question Answer Count by age deciles for rolled categories in q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'903070' as stratum_3,'Other' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586144,1586148,1586145,903070))
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_4,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions that have value_as_number
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id = 0 and o.value_as_number >= 0)
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_as_number,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Gender breakdown of people who took each survey (Row for combinations of each survey and gender)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3101 as analysis_id,
CAST(sq.survey_concept_id AS STRING) as stratum_1,
CAST(p1.gender_concept_id AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p1 inner join
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, p1.gender_concept_id"

# Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3102 as analysis_id,
CAST(sq.survey_concept_id AS STRING) as stratum_1,
age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on
sa.observation_id = ob1.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, stratum_2"

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
CAST(sq.survey_concept_id AS STRING) as stratum_1,
ca.age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob1 join current_person_age_stratum ca on ca.person_id=ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, stratum_2"

# Survey Module counts by gender
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3200 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1,
cast(p.gender_concept_id as string) as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` cr
on ob.observation_source_concept_id=cr.concept_id
group by cr.survey_concept_id, p.gender_concept_id"

# Survey Module counts by age decile
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3201 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1, sa.age_stratum as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` cr
on ob.observation_source_concept_id=cr.concept_id
group by stratum_1, stratum_2"

# To do delete if not used anymore
# Survey question counts by biological sex
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0,3320 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(
select 0,3320 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=3
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc
),
sub_2_questions_count as
(
select 0,3320 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=5
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) )
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc
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
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`),
main_questions_count as
(select 0, 3321 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_1_questions_count as
(select 0, 3321 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=3
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324))
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_2_questions_count as
(select 0, 3321 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=5
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012))
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"
# Count of people who took each survey
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` sq
On o.observation_source_concept_id=sq.concept_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id not in (40766240,43528428,1585389)
Group by sq.survey_concept_id"

# Versioned question count of cope survey
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6, count_value,source_count_value)
select 0 as id, 3401 as analysis_id, '1333342' as stratum_1,
case when b.survey_version_concept_id=2100000002 then '5' when b.survey_version_concept_id=2100000003 then '6' when b.survey_version_concept_id=2100000004 then '7'
when b.survey_version_concept_id=2100000005 then '11'
when b.survey_version_concept_id=2100000006 then '12' when b.survey_version_concept_id=2100000007 then '2' end as stratum_2,
case when b.survey_version_concept_id=2100000002 then 'May' when b.survey_version_concept_id=2100000003 then 'June' when b.survey_version_concept_id=2100000004 then 'July'
when b.survey_version_concept_id=2100000005 then 'Nov'
when b.survey_version_concept_id=2100000006 then 'Dec' when b.survey_version_concept_id=2100000007 then 'Feb' end as stratum_3,
case when b.survey_version_concept_id=2100000002 then '2020' when b.survey_version_concept_id=2100000003 then '2020' when b.survey_version_concept_id=2100000004 then '2020'
when b.survey_version_concept_id=2100000005 then '2020'
when b.survey_version_concept_id=2100000006 then '2020' when b.survey_version_concept_id=2100000007 then '2021' end as stratum_4,
case when b.survey_version_concept_id=2100000002 then '1' when b.survey_version_concept_id=2100000003 then '2' when b.survey_version_concept_id=2100000004 then '3' when b.survey_version_concept_id=2100000005 then '4'
when b.survey_version_concept_id=2100000006 then '5' when b.survey_version_concept_id=2100000007 then '6' end as stratum_5,
cast(b.survey_version_concept_id as string) as stratum_6, count(distinct observation_source_concept_id) as count_value,
count(distinct observation_source_concept_id) as source_count_value  from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` a join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` b on a.observation_id=b.observation_id
where b.survey_version_concept_id is not null
group by b.survey_version_concept_id
order by b.survey_version_concept_id asc; "

# Versioned question count of cope survey
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select  0 as id, 3400 as analysis_id,'1333342' as stratum_1,
case when ob_ext.survey_version_concept_id=2100000002 then '5' when ob_ext.survey_version_concept_id=2100000003 then '6' when ob_ext.survey_version_concept_id=2100000004 then '7'
when ob_ext.survey_version_concept_id=2100000005 then '11'
when ob_ext.survey_version_concept_id=2100000006 then '12' when ob_ext.survey_version_concept_id=2100000007 then '2' end as stratum_2,
case when ob_ext.survey_version_concept_id=2100000002 then 'May' when ob_ext.survey_version_concept_id=2100000003 then 'June' when ob_ext.survey_version_concept_id=2100000004 then 'July'
when ob_ext.survey_version_concept_id=2100000005 then 'Nov'
when ob_ext.survey_version_concept_id=2100000006 then 'Dec' when ob_ext.survey_version_concept_id=2100000007 then 'Feb' end as stratum_3,
case when ob_ext.survey_version_concept_id=2100000002 then '2020' when ob_ext.survey_version_concept_id=2100000003 then '2020' when ob_ext.survey_version_concept_id=2100000004 then '2020'
when ob_ext.survey_version_concept_id=2100000005 then '2020'
when ob_ext.survey_version_concept_id=2100000006 then '2020' when ob_ext.survey_version_concept_id=2100000007 then '2021' end as stratum_4,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_5,
cast(ob_ext.survey_version_concept_id as string) as stratum_6,
count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on ob.observation_id=ob_ext.observation_id
where ob_ext.survey_version_concept_id is not null
group by ob_ext.survey_version_concept_id
order by ob_ext.survey_version_concept_id asc;"