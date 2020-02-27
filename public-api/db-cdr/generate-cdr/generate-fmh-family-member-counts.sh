!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate-fmh-family-member-counts.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

# Survey answer count of family member history questions
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3110 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,
cast(ob.observation_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
'3' as stratum_5, cast(fmh.observation_source_concept_id as string) as stratum_6,
count(distinct person_id) as count_value, count(distinct person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6"

# Survey answer count of conditions of each family member
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3110 as analysis_id, '43528698' as stratum_1, cast(ob.observation_source_concept_id as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3,
c.concept_name as stratum_4, '6' as stratum_5, concat(fmh.observation_source_concept_id,'.',cast(ob.observation_source_concept_id as string),'.',cast(ob.observation_source_concept_id as string)) as stratum_6,
count(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
where c.domain_id != 'Condition' and
exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
and ob.observation_source_concept_id != 43529643
group by 4,5,6,7,8"

# Gender breakdown of family member history question
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3111 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,
cast(ob.observation_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
cast(p.gender_concept_id as string) as stratum_5, cast(fmh.observation_source_concept_id as string) as stratum_6,
count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6,7"

# Gender breakdown of conditions of each family member
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3111 as analysis_id, '43528698' as stratum_1, cast(ob.observation_source_concept_id as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3,
c.concept_name as stratum_4, cast(p.gender_concept_id as string) as stratum_5, concat(fmh.observation_source_concept_id,'.',cast(ob.observation_source_concept_id as string),'.',cast(ob.observation_source_concept_id as string)) as stratum_6,
count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
join  \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
where c.domain_id != 'Condition' and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
and ob.observation_source_concept_id != 43529643
group by 4,5,6,7,8"

# Age breakdown of family member history question
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3112 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,
cast(ob.observation_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5, cast(fmh.observation_source_concept_id as string) as stratum_6,
count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6,7"

# Age breakdown of conditions of each family member
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
 select 0 as id, 3112 as analysis_id, '43528698' as stratum_1, cast(ob.observation_source_concept_id as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3,
 c.concept_name as stratum_4, cast(age_stratum as string) as stratum_5, concat(fmh.observation_source_concept_id,'.',cast(ob.observation_source_concept_id as string),'.',cast(ob.observation_source_concept_id as string)) as stratum_6,
 count(distinct ob.person_id) as count_value, 0 as source_count_value
 from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
 \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
 join UNNEST(SPLIT(concepts_to_count,',')) as concepts
 on ob.observation_source_concept_id=cast(concepts as int64)
 where c.domain_id != 'Condition' and exists
 (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
 where questionnaire_response_id=ob.questionnaire_response_id and
 observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
 and ob.observation_source_concept_id != 43529643
 group by 4,5,6,7,8"

# Survey question counts by biological sex for family member history
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3320 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,
cast(p.gender_concept_id as string) as stratum_5, cast(fmh.observation_source_concept_id as string) as stratum_6,
count(distinct p.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6"

# Survey question counts by age decile for family member history
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3321 as analysis_id, '43528698' as stratum_1, cast(fmh.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5, cast(fmh.observation_source_concept_id as string) as stratum_6,
count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6"

# Survey question count of family member history each condition by biological sex
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3320 as analysis_id, '43528698' as stratum_1, cast(ob.observation_source_concept_id as string) as stratum_2, cast(p.gender_concept_id as string) as stratum_5, concat(fmh.observation_source_concept_id,'.',cast(ob.observation_source_concept_id as string),'.',cast(ob.observation_source_concept_id as string)) as stratum_6,
count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts on ob.observation_source_concept_id=cast(concepts as int64)
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6;"

# Survey question count of family member history each condition by age decile
# To do delete if not used anymore
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
select 0 as id, 3321 as analysis_id, '43528698' as stratum_1, cast(ob.observation_source_concept_id as string) as stratum_2,
cast(age_stratum as string) as stratum_5, concat(fmh.observation_source_concept_id,'.',cast(ob.observation_source_concept_id as string),'.',cast(ob.observation_source_concept_id as string)) as stratum_6,
count(distinct ob.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh,
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
where exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 4,5,6"

# Calculate skip, do not know, prefer not to answer count of each family member history
# To find the number of people who skipped mother history question we aggregate skip count of mother cancer + mother respiratory + mother kidney + ...
# This is not straightforward pull from the table so, these queries calculate it.
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with a as
(select fmh.observation_source_concept_id as concept, c.concept_name, ob.person_id, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped,
value_source_concept_id from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
where value_source_concept_id in (903096, 903095, 903087, 903079)
and ob.observation_source_concept_id not in (43529658, 43529656, 43529659, 43529655, 43529660, 43529657)
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2,3,5)
select 0 as id, 3110 as analysis_id, '43528698' as stratum_1,
cast(concept as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3, concept_name as stratum_4, '3' as stratum_5,
cast(concept as string) as stratum_6, count(distinct person_id) as count_value, 0 as source_count_value
from a
where ARRAY_LENGTH(SPLIT(questions_skipped))=11
group by 4,5,6,8"

# Biological sex breakdown
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with a as
(select fmh.observation_source_concept_id as concept, c.concept_name, ob.person_id, p.gender_concept_id as gender, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped,
 value_source_concept_id from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=ob.person_id
where value_source_concept_id in (903096, 903095, 903087, 903079)
and ob.observation_source_concept_id not in (43529658, 43529656, 43529659, 43529655, 43529660, 43529657)
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2,3,4,6)
select 0 as id, 3111 as analysis_id, '43528698' as stratum_1,
cast(concept as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3, concept_name as stratum_4, cast(gender as string) as stratum_5,
cast(concept as string) as stratum_6, count(distinct person_id) as count_value, 0 as source_count_value
from a
where ARRAY_LENGTH(SPLIT(questions_skipped))=11
group by 4,5,6,7,8"

# Age breakdown
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with  a as
(select fmh.observation_source_concept_id as concept, c.concept_name, ob.person_id, age_stratum as age, string_agg(distinct cast(ob.observation_source_concept_id as string), ',') as questions_skipped, value_source_concept_id from
\`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.fmh_fm_metadata\` fmh, \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` ob
join UNNEST(SPLIT(concepts_to_count,',')) as concepts
on ob.observation_source_concept_id=cast(concepts as int64)
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=ob.value_source_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` sa on sa.observation_id=ob.observation_id
where value_source_concept_id in (903096, 903095, 903087, 903079)
and ob.observation_source_concept_id not in (43529658, 43529656, 43529659, 43529655, 43529660, 43529657)
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where questionnaire_response_id=ob.questionnaire_response_id and
observation_source_concept_id=43528652 and value_source_concept_id in (43529842, 43528385))
group by 1,2,3,4,6)
select 0 as id, 3112 as analysis_id, '43528698' as stratum_1,
cast(concept as string) as stratum_2, cast(value_source_concept_id as string) as stratum_3, concept_name as stratum_4, cast(age as string) as stratum_5,
cast(concept as string) as stratum_6, count(distinct person_id) as count_value, 0 as source_count_value
from a
where ARRAY_LENGTH(SPLIT(questions_skipped))=11
group by 4,5,6,7,8"