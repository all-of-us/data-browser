#!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/fmh-aggregate-counts.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43528614, 'NervousCondition_Dementia', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43528610, 43528616, 43528613, 43528615, 43528612, 43528611);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836807, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_Dementia_yes', 836807, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43528610, 43528616, 43528613, 43528615, 43528612, 43528611);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43528690, 'NervousCondition_EpilepsySeizure', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43528688, 43528689, 43528692, 43528691, 43528686, 43528687);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836852, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_EpilepsySeizure_yes', 836852, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43528688, 43528689, 43528692, 43528691, 43528686, 43528687);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43528397, 'NervousCondition_AmyotrophicLateralSclerosis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (702793, 43528399, 43528393, 702794, 43528398, 43528395);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836806, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_AmyotrophicLateralSclerosis_yes', 836806, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (702793, 43528399, 43528393, 702794, 43528398, 43528395);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43529225, 'NervousCondition_MigraineHeadaches', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529227, 43529221, 43529223, 43529228, 43529222, 43529224);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836808, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_MigraineHeadaches_yes', 836808, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529227, 43529221, 43529223, 43529228, 43529222, 43529224);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43529248, 'NervousCondition_MultipleSclerosis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529245, 43529247, 43529251, 43529250, 43529244, 43529246);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836809, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_MultipleSclerosis_yes', 836809, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529245, 43529247, 43529251, 43529250, 43529244, 43529246);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43529256, 'NervousCondition_MuscularDystrophy', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529254, 43529253, 43529252, 43529255, 43529257, 43529258);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836810, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_MuscularDystrophy_yes', 836810, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529254, 43529253, 43529252, 43529255, 43529257, 43529258);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
596893, 'NervousCondition_Narcolepsy', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529264, 1384477, 43529260, 1385434, 43529261, 43529262);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836853, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_Narcolepsy_yes', 836853, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529264, 1384477, 43529260, 1385434, 43529261, 43529262);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
836761, 'NervousCondition_Neuropathy', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529273, 43529274, 43529279, 43529278, 43529275, 43529276);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836811, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_Neuropathy_yes', 836811, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529273, 43529274, 43529279, 43529278, 43529275, 43529276);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
43529691, 'NervousCondition_Parkinsons', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529688, 43529690, 43529694, 43529689, 43529687, 43529693);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836812, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_Parkinsons_yes', 836812, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529688, 43529690, 43529694, 43529689, 43529687, 43529693);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529272, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_NervousCondition', 43529272, unit_source_value, qualifier_source_value,
836762, 'NervousCondition_RestlessLegsSyndrome', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529770, 1384400, 43529771, 1385319, 1384457, 43529769);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836813, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'NervousCondition_RestlessLegsSyndrome_yes', 836813, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529268, 43529270, 43529271, 43528489, 43528490, 43529269)
and value_source_concept_id in (43529770, 1384400, 43529771, 1385319, 1384457, 43529769);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
836758, 'MentalCondition_AlcoholUse', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528376, 43528372, 43528371, 43528374, 43528375, 43528373);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836827, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_AlcoholUse_yes', 836827, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528376, 43528372, 43528371, 43528374, 43528375, 43528373);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
43528418, 'MentalCondition_AnxietyPanic', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528422, 43528417, 43528416, 43528415, 43528421, 43528420);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836850, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_AnxietyPanic_yes', 836850, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528422, 43528417, 43528416, 43528415, 43528421, 43528420);
"


bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
836759, 'MentalCondition_Autism', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528454, 43528457, 43528456, 43528453, 43528452, 43528451);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836802, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_Autism_yes', 836802, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528454, 43528457, 43528456, 43528453, 43528452, 43528451);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
43528462, 'MentalCondition_Bipolar', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528461, 43528459, 43528460, 43528465, 43528466, 43528464);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836803, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_Bipolar_yes', 836803, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528461, 43528459, 43528460, 43528465, 43528466, 43528464);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
43528620, 'MentalCondition_Depression', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528619, 43528624, 43528623, 43528618, 43528622, 43528617);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836804, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_Depression_yes', 836804, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528619, 43528624, 43528623, 43528618, 43528622, 43528617);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
836760, 'MentalCondition_DrugUse', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528657, 43528654, 43528658, 43528656, 43528653, 43528655);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836851, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_DrugUse_yes', 836851, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43528657, 43528654, 43528658, 43528656, 43528653, 43528655);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529217, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_MentalCondition', 43529217, unit_source_value, qualifier_source_value,
43529785, 'MentalCondition_Schizophrenia', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43529787, 43529784, 43529783, 43529788, 43529782, 43529789);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836805, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'MentalCondition_Schizophrenia_yes', 836805, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529213, 43530563, 43529216, 43529215, 43529214, 43529218)
and value_source_concept_id in (43529787, 43529784, 43529783, 43529788, 43529782, 43529789);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43528712, 'SkeletalMuscularCondition_Fibromyalgia', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43528708, 43528707, 43528711, 43528710, 43528709, 43528714);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836859, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_Fibromyalgia_yes', 836859, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43528708, 43528707, 43528711, 43528710, 43528709, 43528714);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43528741, 'SkeletalMuscularCondition_Gout', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43528738, 43528737, 43528743, 43528740, 43528739, 43528736);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836817, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_Gout_yes', 836817, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43528738, 43528737, 43528743, 43528740, 43528739, 43528736);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43529609, 'SkeletalMuscularCondition_Osteoarthritis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529606, 43529604, 43529608, 43529603, 43529607, 43529605);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836818, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_Osteoarthritis_yes', 836818, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529606, 43529604, 43529608, 43529603, 43529607, 43529605);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43529615, 'SkeletalMuscularCondition_Osteoporosis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529611, 43529613, 43529612, 43529614, 43529617, 43529610);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836819, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_Osteoporosis_yes', 836819, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529611, 43529613, 43529612, 43529614, 43529617, 43529610);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
836766, 'SkeletalMuscularCondition_Pseudogout', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (443529745, 43529744, 43529740, 43529743, 43529742, 43529741);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836860, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_Pseudogout_yes', 836860, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (443529745, 43529744, 43529740, 43529743, 43529742, 43529741);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43529778, 'SkeletalMuscularCondition_RheumatoidArthritis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529777, 43529774, 43529775, 43529773, 43529776, 43529779);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836820, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_RheumatoidArthritis_yes', 836820, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (443529777, 43529774, 43529775, 43529773, 43529776, 43529779);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43529893, 'SkeletalMuscularCondition_SystemicLupus', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529888, 43529889, 43529892, 43529894, 43529891, 702784);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836822, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_SystemicLupus_yes', 836822, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529888, 43529889, 43529892, 43529894, 43529891, 702784);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 702786, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkeletalMuscularCondition', 702786, unit_source_value, qualifier_source_value,
43529863, 'SkeletalMuscularCondition_SpineMuscleBone', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529858, 43529859, 43529862, 43529861, 43529860, 43529864);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836821, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'SkeletalMuscularCondition_SpineMuscleBone_yes', 836821, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529813, 43528486, 43529814, 43529812, 43529811, 43528487)
and value_source_concept_id in (43529858, 43529859, 43529862, 43529861, 43529860, 43529864);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529966, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_VisionCondition', 43529966, unit_source_value, qualifier_source_value,
836767, 'VisionCondition_Cataracts', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528531, 43528527, 43528526, 43528529, 43528530, 43528525);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836823, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'VisionCondition_Cataracts_yes', 836823, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528531, 43528527, 43528526, 43528529, 43528530, 43528525);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529966, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_VisionCondition', 43529966, unit_source_value, qualifier_source_value,
43528735, 'VisionCondition_Glaucoma', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528729, 43528733, 43528728, 43528732, 43528730, 43528734);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836824, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'VisionCondition_Glaucoma_yes', 836824, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528729, 43528733, 43528728, 43528732, 43528730, 43528734);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529966, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_VisionCondition', 43529966, unit_source_value, qualifier_source_value,
43529200, 'VisionCondition_MacularDegeneration', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43529194, 43529198, 43529197, 43529193, 43529195, 43529199);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836826, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'visioncondition_maculardegeneration_yes', 836826, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43529194, 43529198, 43529197, 43529193, 43529195, 43529199);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 43529966, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_VisionCondition', 43529966, unit_source_value, qualifier_source_value,
596890, 'VisionCondition_HearingLoss', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528899, 43528902, 43528907, 43529790, 43529792, 43529793);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836825, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'VisionCondition_HearingLoss_yes', 836825, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529960, 43529961, 43529964, 43529962, 43529963, 43529965)
and value_source_concept_id in (43528899, 43528902, 43528907, 43529790, 43529792, 43529793);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
43528379, 'DiagnosedHealthCondition_Allergies', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528378, 43528380, 43528381, 43528382, 43528383, 43528384);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836791, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_Allergies_yes', 836791, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528378, 43528380, 43528381, 43528382, 43528383, 43528384);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
836875, 'OtherHealthCondition_Endometriosis', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528680, 43528681, 43528682, 43528683);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836854, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'OtherHealthCondition_Endometriosis_yes', 836854, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528680, 43528681, 43528682, 43528683);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
836763, 'OtherHealthCondition_Fibroids', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528703, 43528704, 43528705, 43528706);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836855, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'OtherHealthCondition_Fibroids_yes', 836855, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43528703, 43528704, 43528705, 43528706);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
43529590, 'DiagnosedHealthCondition_Obesity', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529589, 43529591, 43529592, 43529593, 43529595, 43529596);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836840, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_Obesity_yes', 836840, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529589, 43529591, 43529592, 43529593, 43529595, 43529596);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
836764, 'OtherHealthCondition_PolycysticOvarianSyndrome', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529722, 43529723, 43529724, 43529725);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836814, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'OtherHealthCondition_PolycysticOvarianSyndrome_yes', 836814, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529722, 43529723, 43529724, 43529725);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
836765, 'OtherHealthCondition_ReactionsToAnesthesia', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529756, 43529757, 43530576, 43530577, 43530578, 43529758);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836857, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'OtherHealthCondition_ReactionsToAnesthesia_yes', 836857, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529756, 43529757, 43530576, 43530577, 43530578, 43529758);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
43529825, 'DiagnosedHealthCondition_SkinCondition', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529824, 43529826, 43529827, 43529828, 43529829, 43529830);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836842, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'DiagnosedHealthCondition_SkinCondition_yes', 836857, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529824, 43529826, 43529827, 43529828, 43529829, 43529830);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836841, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'diagnosedhealthcondition_othercondition', 836841, unit_source_value, qualifier_source_value,
596891, 'Otherhealthcondition_othercondition', questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529618, 43529619, 43529620, 43529621, 43529622, 43529623);
"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
(observation_id, person_id, observation_concept_id, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, observation_source_value, observation_source_concept_id, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id)
select observation_id, person_id, 836856, observation_date, observation_datetime, observation_type_concept_id, value_as_number, value_as_string, value_as_concept_id,
qualifier_concept_id, unit_concept_id, provider_id, visit_occurrence_id, 'OtherHealthCondition_OtherHealthCondition_yes', 836856, unit_source_value, qualifier_source_value,
value_source_concept_id, value_source_value, questionnaire_response_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_source_concept_id in (43529636, 43529632, 43529637, 43529634, 43529633, 43529635)
and value_source_concept_id in (43529618, 43529619, 43529620, 43529621, 43529622, 43529623);
"
