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

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836741, 'CancerCondition_BladderCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528469, 43528467, 43528470, 43528471, 43528468, 43530276);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836768, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'cancercondition_bladdercancer_yes', 836768, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528469, 43528467, 43528470, 43528471, 43528468, 43530276);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836743, 'CancerCondition_BoneCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528481, 43528482, 43528483, 43528484, 43528485, 43530279);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836770, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'cancercondition_bonecancer_yes', 836770, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528481, 43528482, 43528483, 43528484, 43528485, 43530279);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836742, 'CancerCondition_BloodCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530273, 43528478, 43528476, 43530277, 43530278, 43528477);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836769, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'cancercondition_bloodcancer_yes', 836769, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530273, 43528478, 43528476, 43530277, 43530278, 43528477);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43528491, 'CancerCondition_BrainCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528497, 43528496, 43528493, 43528498, 43528495, 43528494);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836771, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_BrainCancer_yes', 836771, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528497, 43528496, 43528493, 43528498, 43528495, 43528494);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43528499, 'CancerCondition_BreastCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528506, 43528502, 43528503, 43528505, 43528504, 43528501);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836772, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_BreastCancer_yes', 836772, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528506, 43528502, 43528503, 43528505, 43528504, 43528501);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43528538, 'CancerCondition_CervicalCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528543, 43528542, 43528540, 43528544);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836773, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_CervicalCancer_yes', 836773, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528543, 43528542, 43528540, 43528544);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43528564, 'CancerCondition_ColonRectalCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528570, 43528567, 43528569, 43528568, 43528571, 43528566);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836831, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_ColonRectalCancer_yes', 836831, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528570, 43528567, 43528569, 43528568, 43528571, 43528566);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836744, 'CancerCondition_EndocrineCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528670, 43530420, 43528671, 43528669, 43528672, 43530419);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836832, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_EndocrineCancer_yes', 836832, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528670, 43530420, 43528671, 43528669, 43528672, 43530419);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836745, 'CancerCondition_EndometrialCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530421, 43530423, 43528648, 43530424);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836833, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_EndometrialCancer_yes', 836833, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530421, 43530423, 43528648, 43530424);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836746, 'CancerCondition_EsophagealCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530429, 43530427, 43530428, 43528694, 43530426, 43530430);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836774, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_EsophagealCancer_yes', 836774, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530429, 43530427, 43530428, 43528694, 43530426, 43530430);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836747, 'CancerCondition_EyeCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530434, 43528697, 43530432, 43530433, 43528696, 43530431);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836775, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_EyeCancer_yes', 836775, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43530434, 43528697, 43530432, 43530433, 43528696, 43530431);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43528887, 'CancerCondition_HeadNeckCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528889, 43528890, 43528888, 43528892, 43528891, 43528893);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836834, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_HeadNeckCancer_yes', 836834, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43528889, 43528890, 43528888, 43528892, 43528891, 43528893);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529135, 'CancerCondition_KidneyCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529139, 43529138, 43529141, 43529140, 43529137, 43529142);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836776, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_KidneyCancer_yes', 836776, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529139, 43529138, 43529141, 43529140, 43529137, 43529142);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529183, 'CancerCondition_LungCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529189, 43529186, 43529190, 43529185, 43529188, 43529187);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836777, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_LungCancer_yes', 836777, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529189, 43529186, 43529190, 43529185, 43529188, 43529187);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836748, 'CancerCondition_OvarianCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529679, 43529678, 43529677, 43529680);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836778, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_OvarianCancer_yes', 836778, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529679, 43529678, 43529677, 43529680);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
836749, 'CancerCondition_PancreaticCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529683, 43530574, 43530573, 43530571, 43530572, 43530570);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836779, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_PancreaticCancer_yes', 836779, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529683, 43530574, 43530573, 43530571, 43530572, 43530570);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529732, 'CancerCondition_ProstateCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529738, 43529739, 43529735, 43529736);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836780, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_ProstateCancer_yes', 836780, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529738, 43529739, 43529735, 43529736);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529816, 'CancerCondition_SkinCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529821, 43529819, 43529820, 43529822, 43529818, 43529823);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836781, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_SkinCancer_yes', 836781, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529821, 43529819, 43529820, 43529822, 43529818, 43529823);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529867, 'CancerCondition_StomachCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529869, 43529870, 43529873, 43529868, 43529871, 43529872);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836782, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_StomachCancer_yes', 836782, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529869, 43529870, 43529873, 43529868, 43529871, 43529872);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529910, 'CancerCondition_ThyroidCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529912, 43529915, 43529913, 43529914, 43529911, 43529916);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836783, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_ThyroidCancer_yes', 836783, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529912, 43529915, 43529913, 43529914, 43529911, 43529916);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528515, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CancerCondition', 43528515, unit_source_value, qualifier_source_value,
43529625, 'CancerCondition_OtherCancer', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529627, 43529629, 43529630, 43529626, 43529628, 43529631);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836835, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CancerCondition_OtherCancer_yes', 836835, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528512, 43528510, 43528513, 43528509, 43528514, 43528511)
and value_source_concept_id in (43529627, 43529629, 43529630, 43529626, 43529628, 43529631);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528410, 'DiagnosedHealthCondition_Anemia', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528402, 43528403, 43528404, 43528405, 43528407, 43528408);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836792, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_Anemia_yes', 836792, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528402, 43528403, 43528404, 43528405, 43528407, 43528408);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
836750, 'CirculatoryCondition_AorticAneurysm', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (1384397, 1384504, 1384834, 43528424, 43528425, 43528426);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836784, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_AorticAneurysm_yes', 836784, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (1384397, 1384504, 1384834, 43528424, 43528425, 43528426);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528443, 'CirculatoryCondition_AtrialFibrilation', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528444, 43528445, 43528446, 43528447, 43528448, 43528449);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836828, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'circulatorycondition_atrialfibrilation_yes', 836828, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528444, 43528445, 43528446, 43528447, 43528448, 43528449);
"


bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528579, 'CirculatoryCondition_CongestiveHeartFailure', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (702790, 43528581, 43528582, 43528583, 43528584, 43528586);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836785, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_CongestiveHeartFailure_yes', 836785, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (702790, 43528581, 43528582, 43528583, 43528584, 43528586);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528590, 'CirculatoryCondition_CoronaryArteryHeartDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (702789, 43528591, 43528592, 43528593, 43528594, 43528595);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836876, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_CoronaryArteryHeartDisease_y', 836876, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (702789, 43528591, 43528592, 43528593, 43528594, 43528595);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528909, 'CirculatoryCondition_HeartAttack', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528911, 43528912, 43528913, 43528914, 43528915, 43528916);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_HeartAttack_yes', 836786, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528911, 43528912, 43528913, 43528914, 43528915, 43528916);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
836751, 'CirculatoryCondition_HeartValveDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528919, 43528920, 43528921, 43528922, 43528923, 43528924);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836829, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'circulatorycondition_heartvalvedisease_yes', 836829, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528919, 43528920, 43528921, 43528922, 43528923, 43528924);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528928, 'CirculatoryCondition_HighBloodPressure', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528929, 43528930, 43528931, 43528932, 43528933, 43528934);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836787, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_HighBloodPressure_yes', 836787, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528929, 43528930, 43528931, 43528932, 43528933, 43528934);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43528935, 'CirculatoryCondition_HighCholesterol', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528937, 43528938, 43528939, 43528940, 43528941, 43528942);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836836, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_HighCholesterol_yes', 836836, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43528937, 43528938, 43528939, 43528940, 43528941, 43528942);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
836752, 'CirculatoryCondition_PeripheralVascularDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529704, 43529705, 43529706, 43529707, 43529708, 43530575);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836837, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_PeripheralVascularDisease_yes', 836837, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529704, 43529705, 43529706, 43529707, 43529708, 43530575);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43529749, 'CirculatoryCondition_PulmonaryEmbolismThrombosis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529750, 43529751, 43529752, 43529753, 43529754, 43529755);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836849, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_PulmonaryEmbolismThrombosis_y', 836849, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529750, 43529751, 43529752, 43529753, 43529754, 43529755);
"


bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43529804, 'DiagnosedHealthCondition_SickleCell', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529797, 43529798, 43529799, 43529800, 43529801, 43529802);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836788, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_SickleCellDisease_yes', 836788, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529797, 43529798, 43529799, 43529800, 43529801, 43529802);
"


bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
43529875, 'CirculatoryCondition_Stroke', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529876, 43529877, 43529878, 43529879, 43529880, 43529881);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836789, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_Stroke_yes', 836789, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (43529876, 43529877, 43529878, 43529879, 43529880, 43529881);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528563, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_CirculatoryCondition', 43528563, unit_source_value, qualifier_source_value,
836753, 'CirculatoryCondition_SuddenDeath', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (1384455, 43529882, 43529883, 43529884, 43529885, 43530582);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836790, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'CirculatoryCondition_SuddenDeath_yes', 836790, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528917, 43528559, 43528561, 43528562, 43528558, 43528560)
and value_source_concept_id in (1384455, 43529882, 43529883, 43529884, 43529885, 43530582);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43528348, 'DigestiveCondition_AcidReflux', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528347, 43528350, 43528351, 43528352, 43528353, 43528354);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836843, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_AcidReflux_yes', 836843, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528347, 43528350, 43528351, 43528352, 43528353, 43528354);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
836754, 'DigestiveCondition_CeliacDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528532, 43528533, 43528534, 43528535, 43528536, 43528537);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836793, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_CeliacDisease_yes', 836793, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528532, 43528533, 43528534, 43528535, 43528536, 43528537);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
836755, 'DigestiveCondition_ColonPolyps', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (1384575, 43528573, 43528574, 43528575, 43528576, 43530281);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836844, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_ColonPolyps_yes', 836844, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (1384575, 43528573, 43528574, 43528575, 43528576, 43530281);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43528598, 'DigestiveCondition_CrohnsDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528597, 43528600, 43528601, 43528602, 43528603, 43528604);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836794, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_CrohnsDisease_yes', 836794, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528597, 43528600, 43528601, 43528602, 43528603, 43528604);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43528638, 'DigestiveCondition_Diverticulitis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528637, 43528639, 43528640, 43528641, 43528642, 43528643);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836845, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_Diverticulitis_yes', 836845, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528637, 43528639, 43528640, 43528641, 43528642, 43528643);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
836756, 'DigestiveCondition_GallStones', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528720, 43528721, 43528722, 43528723, 43528724, 43528725);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836846, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_GallStones_yes', 836846, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43528720, 43528721, 43528722, 43528723, 43528724, 43528725);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43529124, 'DigestiveCondition_IrritableBowelSyndrome', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529123, 43529126, 43529127, 43529128, 43529129, 43529130);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836847, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'digestivecondition_irritablebowelsyndrome_yes', 836847, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529123, 43529126, 43529127, 43529128, 43529129, 43529130);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43529170, 'DiagnosedHealthCondition_LiverCondition', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529168, 43529171, 43529173, 43529175, 43529177, 43529179);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836839, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_LiverCondition_yes', 836839, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529168, 43529171, 43529173, 43529175, 43529177, 43529179);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
836757, 'DigestiveCondition_PepticUlcers', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529697, 43529698, 43529699, 43529700, 43529701, 43529702);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836795, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_PepticUlcers_yes', 836795, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529697, 43529698, 43529699, 43529700, 43529701, 43529702);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528634, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_DigestiveCondition', 43528634, unit_source_value, qualifier_source_value,
43529942, 'DigestiveCondition_UlcerativeColitis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529940, 43529943, 43529944, 43529945, 43529946, 43529947);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836796, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DigestiveCondition_UlcerativeColitis_yes', 836796, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43528631, 43528629, 702788, 43528628, 43528633, 43528630)
and value_source_concept_id in (43529940, 43529943, 43529944, 43529945, 43529946, 43529947);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528678, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_EndocrineCondition', 43528678, unit_source_value, qualifier_source_value,
43529065, 'EndocrineCondition_Hyperthyroidism', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529067, 43529071, 43529064, 43529068, 43529072, 43529070);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836797, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'EndocrineCondition_Hyperthyroidism_yes', 836797, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529067, 43529071, 43529064, 43529068, 43529072, 43529070);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528678, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_EndocrineCondition', 43528678, unit_source_value, qualifier_source_value,
43529074, 'EndocrineCondition_Hypothyroidism', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529073, 43529081, 43529079, 43529080, 43529076, 43529077);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836798, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'EndocrineCondition_Hypothyroidism_yes', 836798, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529073, 43529081, 43529079, 43529080, 43529076, 43529077);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528678, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_EndocrineCondition', 43528678, unit_source_value, qualifier_source_value,
43529925, 'EndocrineCondition_Type1Diabetes', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529927, 43529931, 43529924, 43529930, 43529928, 43529929);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836799, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'EndocrineCondition_Type1Diabetes_yes', 836799, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529927, 43529931, 43529924, 43529930, 43529928, 43529929);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528678, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_EndocrineCondition', 43528678, unit_source_value, qualifier_source_value,
43529934, 'EndocrineCondition_Type2Diabetes', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529936, 43529935, 43529937, 43529939, 43529938, 43529933);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836800, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'EndocrineCondition_Type2Diabetes_yes', 836800, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529936, 43529935, 43529937, 43529939, 43529938, 43529933);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43528678, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_EndocrineCondition', 43528678, unit_source_value, qualifier_source_value,
43529670, 'EndocrineCondition_OtherDiabetes', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529672, 43529675, 43529669, 43529671, 43529674, 43529673);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836848, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'EndocrineCondition_OtherDiabetes_yes', 836848, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (702783, 43528675, 43528676, 43528677, 43528944, 43528674)
and value_source_concept_id in (43529672, 43529675, 43529669, 43529671, 43529674, 43529673);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529158, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_KidneyCondition', 43529158, unit_source_value, qualifier_source_value,
43529062, 'KidneyCondition_KidneyDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529152, 43529153, 43529154, 43529155, 43529156, 43529157)
and value_source_concept_id in (43529146, 43529148, 43529144, 43529145, 43529147, 43529143);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836838, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_kidneycondition_yes', 836838, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529152, 43529153, 43529154, 43529155, 43529156, 43529157)
and value_source_concept_id in (43529146, 43529148, 43529144, 43529145, 43529147, 43529143);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529158, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_KidneyCondition', 43529158, unit_source_value, qualifier_source_value,
43529162, 'KidneyCondition_KidneyStones', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529152, 43529153, 43529154, 43529155, 43529156, 43529157)
and value_source_concept_id in (43529160, 43529165, 43529166, 43529164, 43529159, 43529161);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836801, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'KidneyCondition_KidneyStones_yes', 836801, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529152, 43529153, 43529154, 43529155, 43529156, 43529157)
and value_source_concept_id in (43529160, 43529165, 43529166, 43529164, 43529159, 43529161);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529767, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_RespiratoryCondition', 43529767, unit_source_value, qualifier_source_value,
43528438, 'RespiratoryCondition_Asthma', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43528435, 43528440, 43528441, 43528437, 43528436, 43528434);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836815, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'RespiratoryCondition_Asthma_yes', 836815, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43528435, 43528440, 43528441, 43528437, 43528436, 43528434);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529767, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_RespiratoryCondition', 43529767, unit_source_value, qualifier_source_value,
43528553, 'RespiratoryCondition_ChronicLungDisease', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43528555, 43528549, 43528554, 43528550, 702791, 43528552);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836858, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'RespiratoryCondition_ChronicLungDisease_yes', 836858, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43528555, 43528549, 43528554, 43528550, 702791, 43528552);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529767, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_RespiratoryCondition', 43529767, unit_source_value, qualifier_source_value,
43529836, 'RespiratoryCondition_SleepApnea', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43529838, 43529833, 43529839, 43529834, 43529832, 43529835);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836816, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'RespiratoryCondition_SleepApnea_yes', 836816, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529764, 43529766, 43529765, 43529191, 43529763, 43529762)
and value_source_concept_id in (43529838, 43529833, 43529839, 43529834, 43529832, 43529835);
"



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
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
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
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
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
and sq.sub=0
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
and sq.sub=1 and sq.level=3
and (exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
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
and sq.sub=1 and sq.level=5
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sq.survey_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

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
and sq.sub=0
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
and sq.sub=1 and sq.level=3
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
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
and sq.sub=1 and sq.level=5
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc
)
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3111 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

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
and sq.sub=0
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
and sq.sub=1 and sq.level=3
and
(exists (select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326) or sq.path in ('1585838.1585841.1585348', '1585838.1585842.1585348'))
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
and sq.sub=1 and sq.level=5
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
group by sq.survey_concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.order_number,sq.path
order by CAST(sq.order_number as int64) asc)
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3112 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

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
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
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
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
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
or sq.concept_id in (1333105, 1332735, 1332734, 1310134, 1332738, 1332762, 1333324, 1333235, 1310148, 1332769, 713888, 596885, 596888, 1310135, 1310136, 1310138, 1310141, 1310144, 1310148, 1332737, 1332769, 1332793, 1332796, 1332830, 1332831,
1333014, 1333020, 1333021, 1333022, 1333235, 1333326))
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
and ((exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) ))
or sq.concept_id in (1310052, 1310051, 1310060, 1310067, 1310062, 1310056, 1310053, 1333012, 1332737, 1310148, 1310138, 1310139, 1310141, 1332853))
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