#!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate-fmh-condition-counts.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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


# There are no questions for cancer conditions, heart and blood conditions and so on.
# There are questions for mother cancer, father cancer, son cancer, ...
# So, we are grouping the data the way we want to display by grouping mother, father, son, ... cancer question into just cancer.

#Set the survey answer count for fmh question by condition
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
select 0 as id, 3110 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2, cast(fmh.value_source_concept_id as string) as stratum_3,
c.concept_name as stratum_4,'2' as stratum_5,count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
from  \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on fmh.value_source_concept_id=c.concept_id
,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6
order by c.concept_name asc"

# Set the survey answer count of fmh question by condition and family member
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3110 as analysis_id, '43528698' as stratum_1, cast(fmh.value_source_concept_id as string) as stratum_2, cast(concepts as string) as stratum_3,
c.concept_name as stratum_4,'2' as stratum_5, concat(fmh.observation_source_concept_id,'.',fmh.value_source_concept_id,'.',fmh.value_source_concept_id) as stratum_6,
count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6,8"

#Set the survey answer count for fmh questions by condition for each biological sex
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3111 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2, cast(fmh.value_source_concept_id as string) as stratum_3,
c.concept_name as stratum_4,cast(p.gender_concept_id as string) as stratum_5,cast(fmh.observation_source_concept_id  as string) as stratum_6,
count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on fmh.value_source_concept_id=c.concept_id
,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on ob.person_id=p.person_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6,7,8
order by c.concept_name asc"

# Set the survey answer count of fmh by condition and family member for each biological sex
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3111 as analysis_id, '43528698' as stratum_1, cast(fmh.value_source_concept_id as string) as stratum_2, cast(concepts as string) as stratum_3,
 c.concept_name as stratum_4,cast(p.gender_concept_id as string) as stratum_5,concat(fmh.observation_source_concept_id,'.',fmh.value_source_concept_id,'.',fmh.value_source_concept_id) as stratum_6,
 count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
 ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on ob.person_id=p.person_id
 where exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 group by 4,5,6,7,8
 order by c.concept_name desc;"

#Set the survey answer count for fmh questions by condition for each age decile
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3112 as analysis_id,'43528698' as stratum_1,CAST(fmh.observation_source_concept_id as string) as stratum_2,
 CAST(fmh.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
 age_stratum as stratum_5,cast(fmh.observation_source_concept_id  as string) as stratum_6,
 COUNT(distinct ob.PERSON_ID) as count_value,0 as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on fmh.value_source_concept_id=c.concept_id
 ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on ob.person_id=p.person_id
 where exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 group by 4,5,6,7,8
 order by c.concept_name asc"

# Set the survey answer count for fmh question by condition, family member for each age decile
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3112 as analysis_id, '43528698' as stratum_1, cast(fmh.value_source_concept_id as string) as stratum_2, cast(concepts as string) as stratum_3,
 c.concept_name as stratum_4,age_stratum as stratum_5,concat(fmh.observation_source_concept_id,'.',fmh.value_source_concept_id,'.',fmh.value_source_concept_id) as stratum_6,
 COUNT(distinct ob.PERSON_ID) as count_value,0 as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
 ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
 where exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 group by 4,5,6,7,8
 order by stratum_3 asc"
 # Survey question counts for family medical history condition question
 # To do delete if not used anymore
 bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
 "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
 (id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3320 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,CAST(p.gender_concept_id as string) as stratum_5,
  CAST(fmh.observation_source_concept_id as string) as stratum_6,count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
  from  \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on fmh.value_source_concept_id=c.concept_id
  ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
  join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id = ob.person_id
  where exists
  (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
  where questionnaire_response_id=ob.questionnaire_response_id and
  observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
  group by 4,5"

 # Survey question counts by age decile for fmh condition
 # To do delete if not used anymore
 bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
 "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
 (id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3321 as analysis_id,'43528698' as stratum_1,CAST(fmh.observation_source_concept_id as string) as stratum_2,
 age_stratum as stratum_5,cast(fmh.observation_source_concept_id  as string) as stratum_6,
 COUNT(distinct ob.PERSON_ID) as count_value,0 as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
 ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on ob.person_id=p.person_id
 where exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 group by 4,5,6"

 # Survey question counts by biological sex for fmh condition, family member
 # To do delete if not used anymore
 bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
 "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
 (id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3320 as analysis_id, '43528698' as stratum_1, cast(fmh.value_source_concept_id as string) as stratum_2, cast(p.gender_concept_id as string) as stratum_5, concat(fmh.observation_source_concept_id,'.',fmh.value_source_concept_id,'.',fmh.value_source_concept_id) as stratum_6,
 count(distinct ob.person_id) as count_value,count(distinct ob.person_id) as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
 ,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
 where exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 group by 4,5,6"

# Survey question counts by age decile for fmh condition, family member
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3321 as analysis_id, '43528698' as stratum_1, cast(fmh.value_source_concept_id as string) as stratum_2, age_stratum as stratum_5,concat(fmh.observation_source_concept_id,'.',fmh.value_source_concept_id,'.',fmh.value_source_concept_id) as stratum_6,
COUNT(distinct ob.PERSON_ID) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_metadata\` fmh
,\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob JOIN UNNEST(SPLIT(fmh_concepts_to_count,',')) as concepts on cast(ob.value_source_concept_id as string)=concepts
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6"

# Calculate skip count of each condition
# To find the number of people who skipped cancer condition question we have to sum mother cancer skip + father cancer skip + sibling cancer skip + ...
# This is not straightforward pull from the table so, these queries calculate it.
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
with a as
(select person_id,fmh.observation_source_concept_id as question_concept, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_conditions_member_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_conditions_member_metadata\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts on ob.observation_source_concept_id=cast(concepts as int64)
where value_source_concept_id=903096
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2)
select 0 as id, 3110 as analysis_id,'43528698' as stratum_1,
cast(question_concept as string) as stratum_2, '903096' as stratum_3,'Skip' as stratum_4, '2' as stratum_5, count(person_id) as count_value, 0 as source_count_value
from a where ARRAY_LENGTH(SPLIT(questions_skipped))=6
group by 4"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
"with a as
(select ob.person_id,p.gender_concept_id as gender, fmh.observation_source_concept_id as question_concept, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_conditions_member_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts on ob.observation_source_concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on ob.person_id=p.person_id
where value_source_concept_id=903096
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2,3)
select 0 as id, 3111 as analysis_id,'43528698' as stratum_1,
cast(question_concept as string) as stratum_2, '903096' as stratum_3,'Skip' as stratum_4, cast(gender as string) as stratum_5, '2' as stratum_6, count(person_id) as count_value, 0 as source_count_value
from a where ARRAY_LENGTH(SPLIT(questions_skipped))=6
group by 4,7"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with a as
(select ob.person_id,p.age_stratum as age, fmh.observation_source_concept_id as question_concept, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_conditions_member_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts on ob.observation_source_concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` p on ob.observation_id=p.observation_id
where value_source_concept_id=903096
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2,3)
select 0 as id, 3112 as analysis_id,'43528698' as stratum_1,
cast(question_concept as string) as stratum_2, '903096' as stratum_3,'Skip' as stratum_4, cast(age as string) as stratum_5, '2' as stratum_6, count(person_id) as count_value, 0 as source_count_value
from a where ARRAY_LENGTH(SPLIT(questions_skipped))=6
group by 4,7;