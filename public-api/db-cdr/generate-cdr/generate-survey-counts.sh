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

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` AS
select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\` where survey_concept_id != 43529712"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` as
select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where observation_source_concept_id in (
SELECT DISTINCT concept_id FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata\`);"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\`
select a.observation_id, a.person_id, a.observation_concept_id, a.observation_date, a.observation_datetime,
a.observation_type_concept_id, a.value_as_number, a.value_as_string, a.value_as_concept_id, a.qualifier_concept_id, a.unit_concept_id,
a.provider_id, a.visit_occurrence_id, a.visit_detail_id, a.observation_source_value, a.observation_source_concept_id,
a.unit_source_value, a.qualifier_source_value, 903626 as value_source_concept_id,
a.value_source_value, a.questionnaire_response_id
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` a
where observation_source_concept_id =  1585729 and value_source_concept_id = 1585730
"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"delete from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\`
where observation_source_concept_id =  1585729 and value_source_concept_id = 1585730"

####################
# fmh counts #
####################
# Aggregate fmh counts
if ./generate-cdr/fmh-aggregate-counts.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $WORKBENCH_PROJECT --workbench-dataset $WORKBENCH_DATASET
then
    echo "Added few extra rows in observation table to aggregate counts of old version of fmh with the new one"
else
    echo "FAILED To aggregate fmh"
    exit 1
fi


# Cope survey response counts by version
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id, parent_answer_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` where survey_concept_id = 1333342),
main_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
and ob_ext.survey_version_concept_id in (2100000002, 2100000003, 2100000004, 2100000005, 2100000006, 2100000007)
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=2100000002 then '1' when ob_ext.survey_version_concept_id=2100000003 then '2' when ob_ext.survey_version_concept_id=2100000004 then '3' when ob_ext.survey_version_concept_id=2100000005 then '4'
when ob_ext.survey_version_concept_id=2100000006 then '5' when ob_ext.survey_version_concept_id=2100000007 then '6' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1
and ob_ext.survey_version_concept_id in (2100000002, 2100000003, 2100000004, 2100000005, 2100000006, 2100000007)
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id and value_source_concept_id=parent_answer_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from sub_questions_count"

# Cope minute survey response counts by version
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id, parent_answer_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` where survey_concept_id = 765936),
main_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=765936 then '3'
when ob_ext.survey_version_concept_id=1741006 then '4'
when ob_ext.survey_version_concept_id=905047 then '1' when ob_ext.survey_version_concept_id=905055 then '2'
end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
and ob_ext.survey_version_concept_id in (765936, 905047, 905055, 1741006)
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(SELECT 0 as id, 3113 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
case when ob_ext.survey_version_concept_id=765936 then '3'
when ob_ext.survey_version_concept_id=1741006 then '4'
when ob_ext.survey_version_concept_id=905047 then '1' when ob_ext.survey_version_concept_id=905055 then '2' end as stratum_7,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1
and ob_ext.survey_version_concept_id in (765936, 905047, 905055, 1741006)
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id and value_source_concept_id=parent_answer_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path,9
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3113 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,stratum_7,count_value,source_count_value from sub_questions_count"

# Set the survey answer count for all the survey questions
# (except q2 in the basics survey and questions of family health history since we deal with them in a different way)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id, parent_answer_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.order_number as string) stratum_5,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140 and c.domain_id != 'Meas Value')
and sq.sub=1
and (exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id and value_source_concept_id=parent_answer_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_questions_count"

# Set the survey answer count for basics q2 for all the categories other than american indian, middle eastern, none of these, pacific islander
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc),
multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc),
basics_category_rows as
(select o.*, sq.survey_concept_id, sq.order_number, sq.path,
case WHEN o.person_id IN (SELECT person_id FROM single_answered_people) THEN
(case when o.value_source_concept_id not in (1586144,1586148,1586145,903070) then CAST(o.value_source_concept_id as string) else '903070' end) else '' end as stratum_3,
case WHEN o.person_id IN (SELECT person_id FROM single_answered_people) THEN
(case when o.value_source_concept_id not in (1586144,1586148,1586145,903070) then c.concept_name else 'Other' end) else 'More than one race/ethnicity' end as stratum_4
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
left join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140)),
state_information AS (
         SELECT
             ob.person_id,
             LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
         FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
         JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
         ON ob.value_source_concept_id = c.concept_id
         WHERE ob.observation_source_concept_id = 1585249
)
SELECT 0 as id, 3110 as analysis_id,CAST(survey_concept_id as string) as stratum_1,CAST(observation_source_concept_id as string) as stratum_2,
stratum_3, stratum_4,
cast(order_number as string) stratum_5,
CAST(observation_source_concept_id as string) as stratum_6,
Count(distinct person_id) as count_value, 0 as source_count_value
from basics_category_rows
group by observation_source_concept_id, survey_concept_id, order_number, stratum_3, stratum_4
union all
select 0,3111 as analysis_id,CAST(survey_concept_id as string) as stratum_1,CAST(observation_source_concept_id as string) as stratum_2, stratum_3, stratum_4,
CAST(p.gender_concept_id as string) as stratum_5, path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM basics_category_rows bcr join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = bcr.person_id
group by survey_concept_id, observation_source_concept_id, stratum_3, stratum_4, p.gender_concept_id, order_number, path
union all
select 0, 3112 as analysis_id,CAST(survey_concept_id as string) as stratum_1,
CAST(bcr.observation_source_concept_id as string) as stratum_2, stratum_3, stratum_4,
age_stratum as stratum_5, path as stratum_6,
COUNT(distinct bcr.PERSON_ID) as count_value,0 as source_count_value
from basics_category_rows bcr join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=bcr.observation_id
group by survey_concept_id, observation_source_concept_id, stratum_3, stratum_4, stratum_5, order_number, path
union all
-- Location-based analysis (new analysis 3118)
select 0, 3118 as analysis_id, CAST(survey_concept_id as string) as stratum_1,
CAST(observation_source_concept_id as string) as stratum_2, stratum_3, stratum_4,
si.location as stratum_5, path as stratum_6,
count(distinct si.person_id) as count_value, 0 as source_count_value
FROM basics_category_rows bcr
join state_information si
on si.person_id = bcr.person_id
group by survey_concept_id, observation_source_concept_id, stratum_3, stratum_4, stratum_5, order_number, path"


# Set the survey answer count for all the survey questions that has value as number and not value as concept id
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
SELECT 0 as id, 3110 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,cast(sq.order_number as string) stratum_5,
sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and (o.value_source_concept_id=0 or o.value_source_concept_id is null))
group by o.observation_source_concept_id,o.value_as_number,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Survey question answers count by gender for all questions except basics q2 and fmh questions
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id, parent_answer_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id and value_source_concept_id=parent_answer_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_questions_count"


bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path as (
  select
    survey_concept_id,
    concept_id,
    order_number,
    path,
    sub,
    ARRAY_LENGTH(SPLIT(path, '.')) as level,
    parent_question_concept_id,
    parent_answer_concept_id
  from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`
),
state_information AS (
         SELECT
             ob.person_id,
             LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
         FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
         JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
         ON ob.value_source_concept_id = c.concept_id
         WHERE ob.observation_source_concept_id = 1585249
),
main_questions_count as (
  select
    0 as id,
    3118 as analysis_id,
    CAST(sq.survey_concept_id as string) as stratum_1,
    CAST(o.observation_source_concept_id as string) as stratum_2,
    CAST(o.value_source_concept_id as string) as stratum_3,
    c.concept_name as stratum_4,
    si.location as stratum_5,
    sq.path as stratum_6,
    count(distinct p.person_id) as count_value,
    0 as source_count_value
  from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o
    on p.person_id = o.person_id
  join ppi_path sq
    on o.observation_source_concept_id = sq.concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
    on c.concept_id = o.value_source_concept_id
  join state_information si
    on si.person_id = p.person_id
  where (o.observation_source_concept_id > 0
    and o.value_source_concept_id > 0
    and o.observation_source_concept_id != 1586140)
    and sq.sub = 0
  group by
    sq.survey_concept_id,
    o.observation_source_concept_id,
    o.value_source_concept_id,
    c.concept_name,
    si.location,
    sq.order_number,
    sq.path
  order by CAST(sq.order_number as int64) asc
),
sub_questions_count as (
  select
    0 as id,
    3118 as analysis_id,
    CAST(sq.survey_concept_id as string) as stratum_1,
    CAST(o.observation_source_concept_id as string) as stratum_2,
    CAST(o.value_source_concept_id as string) as stratum_3,
    c.concept_name as stratum_4,
    si.location as stratum_5,
    sq.path as stratum_6,
    count(distinct p.person_id) as count_value,
    0 as source_count_value
  from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o
    on p.person_id = o.person_id
  join ppi_path sq
    on o.observation_source_concept_id = sq.concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
    on c.concept_id = o.value_source_concept_id
  join state_information si
    on si.person_id = p.person_id
  where (o.observation_source_concept_id > 0
    and o.value_source_concept_id > 0
    and o.observation_source_concept_id != 1586140)
    and sq.sub = 1
    and (
      exists (
        select *
        from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\`
        where questionnaire_response_id = o.questionnaire_response_id
        and observation_source_concept_id = parent_question_concept_id
        and value_source_concept_id = parent_answer_concept_id
      )
      or sq.concept_id in (
        1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324,
        1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135,
        1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769,
        1332793, 1332796, 1332830, 1332831, 1333014, 1333020, 1333021,
        1333022, 1333235, 1333326
      )
      or sq.path in (
        '1585838.1585841.1585348', '1585838.1585842.1585348'
      )
    )
  group by
    sq.survey_concept_id,
    o.observation_source_concept_id,
    o.value_source_concept_id,
    c.concept_name,
    si.location,
    sq.order_number,
    sq.path
  order by CAST(sq.order_number as int64) asc
)
select * from main_questions_count
union all
select * from sub_questions_count"


# Survey question answers count by gender(value_as_number not null)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0,3111 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and (o.value_source_concept_id=0 or o.value_source_concept_id is null))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_as_number,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
WITH state_information AS (
              SELECT
                  ob.person_id,
                  LOWER(CONCAT('us-', REGEXP_EXTRACT(c.concept_name, r'PII State: (.*)'))) AS location
              FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
              JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
              ON ob.value_source_concept_id = c.concept_id
              WHERE ob.observation_source_concept_id = 1585249
)
SELECT
    0 AS id,
    3118 AS analysis_id,
    CAST(sq.survey_concept_id AS STRING) AS stratum_1,
    CAST(o.observation_source_concept_id AS STRING) AS stratum_2,
    CAST(o.value_as_number AS STRING) AS stratum_4,
    state_information.location AS stratum_5,
    sq.path AS stratum_6,
    COUNT(DISTINCT p.person_id) AS count_value,
    0 AS source_count_value
FROM
    \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
INNER JOIN
    \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o
    ON p.person_id = o.person_id
JOIN
    \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
    ON o.observation_source_concept_id = sq.concept_id
JOIN
    state_information
    ON state_information.person_id = p.person_id
WHERE
    o.observation_source_concept_id > 0
    AND o.value_as_number >= 0
    AND (o.value_source_concept_id = 0 OR o.value_source_concept_id IS NULL)
GROUP BY
    sq.survey_concept_id,
    o.observation_source_concept_id,
    o.value_as_number,
    state_information.location,
    sq.order_number,
    sq.path
ORDER BY
    CAST(sq.order_number AS INT64) ASC"


# Survey Question Answer Count by age deciles for all questions except q2
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id, parent_answer_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id and value_source_concept_id=parent_answer_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_questions_count"

# Survey Question Answer Count by age deciles for all questions that have value_as_number
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0, 3112 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and (o.value_source_concept_id=0 or o.value_source_concept_id is null) and o.value_as_number >= 0)
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_as_number,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc"

# Gender breakdown of people who took each survey (Row for combinations of each survey and gender)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3101 as analysis_id,
CAST(sq.survey_concept_id AS STRING) as stratum_1,
CAST(p1.gender_concept_id AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, p1.gender_concept_id"


# Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3102 as analysis_id,
CAST(sq.survey_concept_id AS STRING) as stratum_1,
age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on
sa.observation_id = ob1.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, stratum_2"

# Current Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
with current_person_age as
(select person_id,
ceil(TIMESTAMP_DIFF(current_timestamp(), birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
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
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob1 join current_person_age_stratum ca on ca.person_id=ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On ob1.observation_source_concept_id=sq.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
group by sq.survey_concept_id, stratum_2"

# Survey Module counts by gender
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3200 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1,
cast(p.gender_concept_id as string) as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=ob.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` cr
on ob.observation_source_concept_id=cr.concept_id
group by cr.survey_concept_id, p.gender_concept_id"

# Survey Module counts by age decile
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3201 as analysis_id, cast(cr.survey_concept_id as string) as stratum_1, sa.age_stratum as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` cr
on ob.observation_source_concept_id=cr.concept_id
group by stratum_1, stratum_2"

# To do delete if not used anymore
# Survey question counts by biological sex
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`),
main_questions_count as
(select 0,3320 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(
select 0,3320 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
group by sq.survey_concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3320 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3320 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_questions_count"

# Survey question counts by age decile
# To do delete if not used anymore
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select survey_concept_id,concept_id,order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level,
parent_question_concept_id
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\`),
main_questions_count as
(select 0, 3321 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=0
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc),
sub_questions_count as
(select 0, 3321 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=parent_question_concept_id )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
group by sq.survey_concept_id,o.observation_source_concept_id,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_questions_count"

# Count of people who took each survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id not in (40766240,43528428,1585389)
and survey_concept_id not in (1333342, 765936)
Group by sq.survey_concept_id"

# Count of people who took each survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id not in (40766240,43528428,1585389)
and survey_concept_id in (1333342)
and ob_ext.survey_version_concept_id is not null and ob_ext.survey_version_concept_id in (2100000002, 2100000003, 2100000004, 2100000005, 2100000006, 2100000007)
Group by sq.survey_concept_id"

# Count of people who took each survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sq.survey_concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_metadata_wo_pfhh\` sq
On o.observation_source_concept_id=sq.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on o.observation_id=ob_ext.observation_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id not in (40766240,43528428,1585389)
and survey_concept_id in (765936)
and ob_ext.survey_version_concept_id is not null and ob_ext.survey_version_concept_id in (765936, 905047, 905055, 1741006)
Group by sq.survey_concept_id"

# Versioned question count of cope survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
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
count(distinct observation_source_concept_id) as source_count_value  from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` a
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` b on a.observation_id=b.observation_id
where b.survey_version_concept_id is not null and b.survey_version_concept_id in (2100000002,2100000003,2100000004,2100000005,2100000006,2100000007)
group by b.survey_version_concept_id
order by b.survey_version_concept_id asc; "

# Versioned question count of cope minute survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6, count_value,source_count_value)
select 0 as id, 3401 as analysis_id, '765936' as stratum_1,
case when b.survey_version_concept_id=765936 then '3'
when b.survey_version_concept_id=1741006 then '4'
when b.survey_version_concept_id=905047 then '1' when b.survey_version_concept_id=905055 then '2' end as stratum_2,
case when b.survey_version_concept_id=765936 then 'Winter'
when b.survey_version_concept_id=1741006 then 'New Year'
when b.survey_version_concept_id=905047 then 'Summer' when b.survey_version_concept_id=905055 then 'Fall' end as stratum_3,
case when b.survey_version_concept_id=765936 then '2021'
when b.survey_version_concept_id=1741006 then '2022'
when b.survey_version_concept_id=905047 then '2021' when b.survey_version_concept_id=905055 then '2021' end as stratum_4,
case when b.survey_version_concept_id=765936 then '3'
when b.survey_version_concept_id=1741006 then '4'
when b.survey_version_concept_id=905047 then '1' when b.survey_version_concept_id=905055 then '2' end as stratum_5,
cast(b.survey_version_concept_id as string) as stratum_6, count(distinct observation_source_concept_id) as count_value,
count(distinct observation_source_concept_id) as source_count_value  from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` a
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` b on a.observation_id=b.observation_id
where b.survey_version_concept_id is not null and b.survey_version_concept_id in (765936, 905047, 905055, 1741006)
group by b.survey_version_concept_id
order by b.survey_version_concept_id asc; "

# Versioned question count of cope survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
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
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on ob.observation_id=ob_ext.observation_id
where ob_ext.survey_version_concept_id is not null and ob_ext.survey_version_concept_id in (2100000002,2100000003,2100000004,2100000005,2100000006,2100000007)
group by ob_ext.survey_version_concept_id
order by ob_ext.survey_version_concept_id asc;"

# Versioned question count of cope minute survey
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select  0 as id, 3400 as analysis_id,'765936' as stratum_1,
case when ob_ext.survey_version_concept_id=765936 then '3'
when ob_ext.survey_version_concept_id=1741006 then '4'
when ob_ext.survey_version_concept_id=905047 then '1' when ob_ext.survey_version_concept_id=905055 then '2' end as stratum_2,
case when ob_ext.survey_version_concept_id=765936 then 'Winter'
when ob_ext.survey_version_concept_id=1741006 then 'New Year'
when ob_ext.survey_version_concept_id=905047 then 'Summer' when ob_ext.survey_version_concept_id=905055 then 'Fall' end as stratum_3,
case when ob_ext.survey_version_concept_id=765936 then '2021'
when ob_ext.survey_version_concept_id=1741006 then '2022'
when ob_ext.survey_version_concept_id=905047 then '2021' when ob_ext.survey_version_concept_id=905055 then '2021' end as stratum_4,
case when ob_ext.survey_version_concept_id=765936 then '3'
when ob_ext.survey_version_concept_id=1741006 then '4'
when ob_ext.survey_version_concept_id=905047 then '1' when ob_ext.survey_version_concept_id=905055 then '2' end as stratum_5,
cast(ob_ext.survey_version_concept_id as string) as stratum_6,
count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_observation\` ob
join \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` ob_ext on ob.observation_id=ob_ext.observation_id
where ob_ext.survey_version_concept_id is not null and ob_ext.survey_version_concept_id in (765936, 905047, 905055, 1741006)
group by ob_ext.survey_version_concept_id
order by ob_ext.survey_version_concept_id asc;"


####################
# PFHH counts #
####################
# PFHH counts
if ./generate-cdr/generate-survey-counts-pfhh.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $WORKBENCH_PROJECT --workbench-dataset $WORKBENCH_DATASET
then
    echo "Preparing a mock up of pfhh counts without branching logic"
else
    echo "FAILED To aggregate fmh"
    exit 1
fi