#!/bin/bash

# Runs achilles queries to populate count db for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/run-achilles-queries.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

#Get the list of tables in the dataset
tables=$(bq --project=$BQ_PROJECT --dataset=$BQ_DATASET ls)

declare -a domain_names domain_table_names
domain_names=(condition drug procedure observation measurement)
domain_table_names=(v_ehr_condition_occurrence v_ehr_drug_exposure v_ehr_procedure_occurrence observation v_ehr_measurement)
actual_table_names=(condition_occurrence drug_exposure procedure_occurrence observation measurement)
concept_ids_to_exclude=(19 0 0 0 0)
domain_concept_ids=(19 13 10 27 21)

################################################
# CREATE VIEWS
################################################

# We want to fetch the breakdown counts of each analysis for all of the ehr domain concepts by considering only the records that are ehr related (no ppi results are such)
# So, instead of joining each of the query with the mapping tables we create the view which are used for ehr only count queries.
# Mapping tables have the dataset id specified which can be used to differentiate ehr specific rows
if [[ "$tables" == *"_mapping_"* ]]; then
    echo "CREATE VIEWS - v_ehr_measurement"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
     m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.destination_unit_concept is not null then suc.destination_unit_concept else m.unit_concept_id end) as unit_concept_id,
     m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
     from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` mm
    on m.measurement_id = mm.measurement_id
    left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.similar_unit_concepts\` suc on suc.source_unit_concept = m.unit_concept_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` where src_dataset_id like '%ehr%')
    and (m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0)"

    echo "CREATE VIEWS - v_full_measurement_with_grouped_units"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.destination_unit_concept is not null then suc.destination_unit_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.similar_unit_concepts\` suc
    on suc.source_unit_concept = m.unit_concept_id
    where (m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) or m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120))"

    echo "CREATE VIEWS - v_ehr_condition_occurrence"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_condition_occurrence\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_condition_occurrence\` mm
    on m.condition_occurrence_id = mm.condition_occurrence_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_condition_occurrence\` where src_dataset_id like '%ehr%')
    and (m.condition_concept_id > 0 or m.condition_source_concept_id > 0)"

    echo "CREATE VIEWS - v_ehr_procedure_occurrence"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_procedure_occurrence\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_procedure_occurrence\` mm
    on m.procedure_occurrence_id = mm.procedure_occurrence_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_procedure_occurrence\` where src_dataset_id like '%ehr%')
    and (m.procedure_concept_id > 0 or m.procedure_source_concept_id > 0)"

    echo "CREATE VIEWS - v_ehr_drug_exposure"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_drug_exposure\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.drug_exposure\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_drug_exposure\` mm
    on m.drug_exposure_id = mm.drug_exposure_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_drug_exposure\` where src_dataset_id like '%ehr%')
    and (m.drug_concept_id > 0 or m.drug_source_concept_id > 0)"

else
    echo "CREATE VIEWS - v_ehr_measurement"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.destination_unit_concept is not null then suc.destination_unit_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m
     left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.similar_unit_concepts\` suc on m.unit_concept_id = suc.source_unit_concept
    where m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0"

    echo "CREATE VIEWS - v_ehr_condition_occurrence"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_condition_occurrence\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` m
    where m.condition_concept_id > 0 or m.condition_source_concept_id > 0"

    echo "CREATE VIEWS - v_ehr_procedure_occurrence"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_procedure_occurrence\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` m
    where m.procedure_concept_id > 0 or m.procedure_source_concept_id > 0"

    echo "CREATE VIEWS - v_ehr_drug_exposure"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_drug_exposure\` AS
    select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.drug_exposure\` m
    where m.drug_concept_id > 0 or m.drug_source_concept_id > 0"
fi

# Next Populate achilles_results
echo "Running achilles queries..."

echo "Getting person count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, count_value,source_count_value) select 0 as id, 1 as analysis_id,  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`"


# Gender count
echo "Getting gender count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 2 as analysis_id,  cast (gender_concept_id as STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by GENDER_CONCEPT_ID"

# Age count
# 3	Number of persons by year of birth
echo "Getting age count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 3 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by YEAR_OF_BIRTH"


#  4	Number of persons by race
echo "Getting race count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 4 as analysis_id,  CAST(RACE_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by RACE_CONCEPT_ID"

# 5	Number of persons by ethnicity
echo "Getting ethnicity count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 5 as analysis_id,  CAST(ETHNICITY_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by ETHNICITY_CONCEPT_ID"

# 6 Number of person by age decile
echo "Getting age decile count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
with person_age as
(select person_id,
ceil(TIMESTAMP_DIFF(current_timestamp(), birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by person_id,age
)
select 0, 6 as analysis_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as stratum_2,
COUNT(distinct person_id) as count_value, 0 as source_count_value
from person_age
group by stratum_2"

# 10	Number of all persons by year of birth and by gender
echo "Getting year of birth , gender count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, count_value,source_count_value)
select 0, 10 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1,
  CAST(gender_concept_id AS STRING) as stratum_2,
  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by YEAR_OF_BIRTH, gender_concept_id"

# 12	Number of persons by race and ethnicity
echo "Getting race, ethnicity count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, count_value,source_count_value)
select 0, 12 as analysis_id, CAST(RACE_CONCEPT_ID AS STRING) as stratum_1, CAST(ETHNICITY_CONCEPT_ID AS STRING) as stratum_2, COUNT(distinct person_id) as count_value,
0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
group by RACE_CONCEPT_ID,ETHNICITY_CONCEPT_ID"

for index in "${!domain_names[@]}"; do
    domain_name="${domain_names[$index]}";
    domain_table_name="${domain_table_names[$index]}";
    table_id="${actual_table_names[$index]}_id";
    datetime_name="${domain_names[$index]}_start_datetime";
    domain_concept_id="${domain_concept_ids[$index]}";
    ## Fetching 3000 counts
    concept_id="${domain_names[$index]}_concept_id";
    source_concept_id="${domain_names[$index]}_source_concept_id";
    exclude_concept_id=${concept_ids_to_exclude[$index]};
    domain_stratum="$(tr '[:lower:]' '[:upper:]' <<< ${domain_name:0:1})${domain_name:1}"
    echo "Querying ${domain_table_name} ..."
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0, 3000 as analysis_id,
    CAST(co1.${concept_id} AS STRING) as stratum_1, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.PERSON_ID) as count_value, (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
    where co2.${source_concept_id}=co1.${concept_id}) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    where co1.${concept_id} > 0 and co1.${concept_id} != ${exclude_concept_id}
    group by co1.${concept_id}
    union all
    select 0 as id,3000 as analysis_id,CAST(co1.${source_concept_id} AS STRING) as stratum_1, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.PERSON_ID) as count_value,COUNT(distinct co1.PERSON_ID) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    and co1.${source_concept_id} != ${exclude_concept_id}
    group by co1.${source_concept_id}"

    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
    select 0, 3101 as analysis_id,
    CAST(co1.${concept_id} AS STRING) as stratum_1,
    CAST(p1.gender_concept_id AS STRING) as stratum_2, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct p1.PERSON_ID) as count_value,
    (select COUNT(distinct p2.PERSON_ID) from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p2 inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
    on p2.person_id=co2.person_id where co2.${source_concept_id}=co1.${concept_id} and p2.gender_concept_id = p1.gender_concept_id) as source_count_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
    \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    on p1.person_id = co1.person_id
    where co1.${concept_id} > 0
    group by co1.${concept_id}, p1.gender_concept_id
    union all
    select 0, 3101 as analysis_id,CAST(co1.${source_concept_id} AS STRING) as stratum_1,CAST(p1.gender_concept_id AS STRING) as stratum_2,
    \"${domain_stratum}\" as stratum_3,
    COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value from
    \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    on p1.person_id = co1.person_id
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    group by co1.${source_concept_id}, p1.gender_concept_id"

    # 3102 Number of persons with at least one ehr record by age decile
    # Age Deciles : They will be  18-29 , 30-39, 40-49, 50-59, 60-69, 70-79, 80-89, 89+
    #  children are 0-17 and we don't have children for now .
    #Ex yob = 2000  , start date : 2017 -- , sd - yob = 17  / 10 = 1.7 floor(1.7) = 1
    # 30 - 39 , 2017 - 1980 = 37 / 10 = 3
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
    with ehr_age as
    (select ${table_id},
    ceil(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY)/365.25) as age
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
    group by ${table_id},age
    ),
    ehr_age_stratum as
    (
    select ${table_id},
    case when age >= 18 and age <= 29 then '2'
    when age > 89 then '9'
    when age >= 30 and age <= 89 then cast(floor(age/10) as string)
    when age < 18 then '0' end as age_stratum from ehr_age
    group by ${table_id},age_stratum
    )
    select 0, 3102 as analysis_id,
    CAST(co1.${concept_id} AS STRING) as stratum_1,
    age_stratum as stratum_2,
    \"${domain_stratum}\" as stratum_3,
    count(distinct co1.person_id) as count_value,
    (select COUNT(distinct co2.PERSON_ID) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2 join ehr_age_stratum ca2
    on co2.${table_id} = ca2.${table_id}
    where co2.${source_concept_id}=co1.${concept_id}
    and ca2.age_stratum=ca.age_stratum) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1 join ehr_age_stratum ca on co1.${table_id} = ca.${table_id}
    where co1.${concept_id} > 0
    group by co1.${concept_id}, stratum_2
    union all
    select 0, 3102 as analysis_id,
    CAST(co1.${source_concept_id} AS STRING) as stratum_1,
    age_stratum as stratum_2, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.person_id) as count_value,
    COUNT(distinct co1.person_id) as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1 join ehr_age_stratum ca
    on co1.${table_id} = ca.${table_id}
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    group by co1.${source_concept_id}, stratum_2"

    # Get the current age counts
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
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
    CAST(co1.${concept_id} AS STRING) as stratum_1,
    age_stratum as stratum_2, \"${domain_stratum}\" as stratum_3,
    count(distinct p1.person_id) as count_value,
    (select COUNT(distinct p2.PERSON_ID) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2 join current_person_age_stratum p2
    on p2.person_id=co2.person_id
    where co2.${source_concept_id}=co1.${concept_id}
    and p2.age_stratum = p1.age_stratum) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    join current_person_age_stratum p1
    on p1.person_id = co1.person_id
    where co1.${concept_id} > 0
    group by co1.${concept_id}, stratum_2
    union all
    select 0, 3106 as analysis_id,
    CAST(co1.${source_concept_id} AS STRING) as stratum_1,
    age_stratum as stratum_2, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct p1.person_id) as count_value,
    COUNT(distinct p1.person_id) as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    join current_person_age_stratum p1
    on p1.person_id = co1.person_id
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    group by co1.${source_concept_id}, stratum_2"

    # Domain Participant Counts
    echo "Getting domain participant counts"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0 as id,3000 as analysis_id,\"${domain_concept_id}\" as stratum_1, \"${domain_stratum}\" as stratum_3,count(distinct person_id) as count_value,
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`"

    # Domain participant counts by gender
    echo "Getting domain participant counts by gender"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
    select 0 as id,3300 as analysis_id, \"${domain_concept_id}\" as stratum_1, \"${domain_stratum}\" as stratum_3,cast(p.gender_concept_id as string) as stratum_4,
    count(distinct co.person_id) as count_value,
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
    on p.person_id=co.person_id
    group by p.gender_concept_id"

    # Domain participant counts by age
    echo "Getting domain participant counts by age"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
    with ehr_age as
    (select ${table_id},
    ceil(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY)/365.25) as age
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
    group by ${table_id},age
    ),
    ehr_age_stratum as
    (
    select ${table_id},
    case when age >= 18 and age <= 29 then '2'
    when age > 89 then '9'
    when age >= 30 and age <= 89 then cast(floor(age/10) as string)
    when age < 18 then '0' end as age_stratum from ehr_age
    group by ${table_id},age_stratum
    )
    select 0 as id, 3301 as analysis_id, \"${domain_concept_id}\" as stratum_1, \"${domain_stratum}\" as stratum_3,age_stratum as stratum_4,
    count(distinct co.person_id) as count_value,
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join ehr_age_stratum coa on co.${table_id}=coa.${table_id}
    group by age_stratum"
done

# Set the survey answer count for all the survey questions (except q2) that belong to each module
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` where survey_concept_id in (1586134, 1585855, 1585710)),
main_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=3
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=5
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3110 as analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"

# Set the survey answer count for basics q2 for all the categories other than american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
join single_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the count of more than one race / ethnicity
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
where (o.observation_source_concept_id = 1586140)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by o.observation_source_concept_id,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the rolled survey answer count for basics q2 for the categories american indian, middle eastern, none of these, pacific islander
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by o.observation_source_concept_id,c.concept_name,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Set the survey answer count for all the survey questions (except q2) that belong to each module
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_4,stratum_5,count_value,source_count_value)
SELECT 0 as id, 3110 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,cast(sq.question_order_number as string) stratum_5,
Count(distinct o.person_id) as count_value, 0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id=0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by o.observation_source_concept_id,o.value_as_number,sm.concept_id,sq.question_order_number
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender for all questions except basics q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` where survey_concept_id in (1586134, 1585855, 1585710)),
main_questions_count as
(select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=0
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=3
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
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
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0 and o.observation_source_concept_id != 1586140)
and sq.sub=1 and sq.level=5
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
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
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey gender counts for more than one race / ethnicity bucket
# Survey question answers count by gender for q2 unrolled
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join multiple_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender for q2 (rolling up categories)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(903070 as string) as stratum_3,'Other' as stratum_4,
CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join single_answered_people spa on spa.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = 903070
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,c.concept_name,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answers count by gender(value_as_number not null)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
select 0,3111 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,CAST(p.gender_concept_id as string) as stratum_5,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_as_number >= 0 and o.value_source_concept_id = 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,o.value_as_number,p.gender_concept_id,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions except q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` where survey_concept_id in (1586134, 1585855, 1585710)),
survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
),
main_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=0
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_1_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=3
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and o.observation_source_concept_id != 1586140
and sq.sub=1 and sq.level=5
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(1)] as int64) )
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64) and value_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(3)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
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
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count = 1
order by answers_count desc),
survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_source_concept_id as string) as stratum_3,c.concept_name as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id = o.value_source_concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id not in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,o.value_source_concept_id,c.concept_name,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey question answer count by age deciles for more than one race / ethnicity bucket
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with multiple_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc),
survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'More than one race/ethnicity' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join multiple_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"


# Survey Question Answer Count by age deciles for rolled categories in q2
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_3,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with single_answered_people as
(select person_id, count(distinct value_source_concept_id) as answers_count from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by person_id having answers_count > 1
order by answers_count desc),
survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
'903070' as stratum_3,'Other' as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join single_answered_people sap on sap.person_id=o.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id = 1586140 and o.value_source_concept_id in (1586141,1586144,1586148,1586145,903070))
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,stratum_4,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

# Survey Question Answer Count by age deciles for all questions that have value_as_number
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2,stratum_4,stratum_5,stratum_6,count_value,source_count_value)
with survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0, 3112 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(o.value_as_number as string) as stratum_4,
age_stratum as stratum_5,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and o.value_source_concept_id = 0 and o.value_as_number >= 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id,o.observation_source_concept_id,o.value_as_number,stratum_5,sq.question_order_number,sq.path
order by CAST(sq.question_order_number as int64) asc"

### Test data does not have the mapping tables, so this else block lets the script to fetch domain counts for test data

echo "Getting physical measurement participant counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
select 0 as id,3000 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3,
count(distinct person_id) as count_value, 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\`
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)"

echo "Getting physical measurement participant counts by gender"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id,3300 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3, cast(p.gender_concept_id as string) as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
on p.person_id=m.person_id
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
group by p.gender_concept_id"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
with m_age as
(select measurement_id,
ceil(TIMESTAMP_DIFF(measurement_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
group by measurement_id,age
),
m_age_stratum as
(
select measurement_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from m_age
group by measurement_id,age_stratum
)
select 0 as id, 3301 as analysis_id, '0' as stratum_1,'Physical Measurements' as stratum_3, age_stratum as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join m_age_stratum p
on m.measurement_id=p.measurement_id
group by age_stratum"

# Count of people who took each survey
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_3,count_value,source_count_value)
SELECT 0 as id, 3000 as analysis_id,CAST(sm.concept_id as string) as stratum_1,
'Survey' as stratum_3,
count(distinct o.person_id) as count_value, count(distinct o.person_id) as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
Where (o.observation_source_concept_id > 0 and o.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
Group by sm.concept_id"

# Gender breakdown of people who took each survey (Row for combinations of each survey and gender)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3101 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
CAST(p1.gender_concept_id AS STRING) as stratum_2,'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
\`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id, p1.gender_concept_id"

# Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
with survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0, 3102 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob1 join survey_age_stratum sa on
sa.observation_id = ob1.observation_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id, stratum_2"

# Current Age breakdown of people who took each survey (Row for combinations of each survey and age decile)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
CAST(sm.concept_id AS STRING) as stratum_1,
ca.age_stratum as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct ob1.PERSON_ID) as count_value,COUNT(distinct ob1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob1 join current_person_age_stratum ca on ca.person_id=ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id, stratum_2"

# Race breakdown of people who took each survey (Row for combinations of each survey and race)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3103 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
CAST(p1.race_concept_id as string) as stratum_2,
'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
\`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
and p1.race_concept_id > 0
group by sm.concept_id, stratum_2"

# Ethnicity breakdown of people who took each survey (Row for combinations of each survey and ethnicity)
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,source_count_value)
select 0, 3104 as analysis_id,
CAST(sm.concept_id AS STRING) as stratum_1,
CAST(p1.ethnicity_concept_id as string) as stratum_2,
  'Survey' as stratum_3,
COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
\`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob1
on p1.person_id = ob1.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` sq
On ob1.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (ob1.observation_source_concept_id > 0 and ob1.value_source_concept_id > 0)
and sq.survey_concept_id in (1586134, 1585855, 1585710)
group by sm.concept_id, stratum_2"

# Survey Module counts by gender
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
select 0 as id, 3200 as analysis_id, cast(cr.concept_id_2 as string) as stratum_1,
cast(p.gender_concept_id as string) as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=ob.person_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept_relationship\` cr
on ob.observation_source_concept_id=cr.concept_id_1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm
on cr.concept_id_2=sm.concept_id
group by cr.concept_id_2, p.gender_concept_id"

# Survey Module counts by age decile
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,count_value,source_count_value)
with survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select 0 as id, 3201 as analysis_id, cast(cr.concept_id_2 as string) as stratum_1, sa.age_stratum as stratum_2, count(distinct ob.person_id) as count_value, count(distinct ob.person_id) as source_count_value
 from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob
join survey_age_stratum sa on sa.observation_id=ob.observation_id
join \`${BQ_PROJECT}.${BQ_DATASET}.concept_relationship\` cr
on ob.observation_source_concept_id=cr.concept_id_1 join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm
on cr.concept_id_2=sm.concept_id
group by stratum_1, stratum_2"


# Survey question counts by biological sex
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` where survey_concept_id in (1586134, 1585855, 1585710)),
main_questions_count as
(select 0,3320 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
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
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=3
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,p.gender_concept_id,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc
),
sub_2_questions_count as
(
select 0,3320 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
CAST(p.gender_concept_id as string) as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
count(distinct p.person_id) as count_value,0 as source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.person\` p inner join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o on p.person_id = o.person_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where (o.observation_source_concept_id > 0 and value_source_concept_id != 903096)
and sq.sub=1 and sq.level=5
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
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
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value)
with ppi_path
as
(select id,survey_concept_id,question_concept_id,survey_order_number,question_order_number,path,sub,ARRAY_LENGTH(SPLIT(path, '.')) as level
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_question_map\` where survey_concept_id in (1586134, 1585855, 1585710)),
survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
),
main_questions_count as
(select 0, 3321 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
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
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=3
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc),
sub_2_questions_count as
(select 0, 3321 as analysis_id,CAST(sm.concept_id as string) as stratum_1,CAST(o.observation_source_concept_id as string) as stratum_2,
age_stratum as stratum_5,sq.id as que_ref_id,sq.path as stratum_6,
COUNT(distinct o.PERSON_ID) as count_value,0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` o join survey_age_stratum sa on sa.observation_id=o.observation_id
join ppi_path sq
On o.observation_source_concept_id=sq.question_concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_module\` sm on sq.survey_concept_id = sm.concept_id
where o.observation_source_concept_id > 0 and value_source_concept_id != 903096
and sq.sub=1 and sq.level=5
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(0)] as int64) )
and exists
(select * from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where questionnaire_response_id=o.questionnaire_response_id
and observation_source_concept_id=cast(SPLIT(sq.path, '.')[OFFSET(2)] as int64))
group by sm.concept_id,o.observation_source_concept_id,stratum_5,sq.question_order_number,sq.id,sq.path
order by CAST(sq.question_order_number as int64) asc)
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from main_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_1_questions_count
union all
select 0 as id, 3321 as analysis_id,stratum_1,stratum_2,stratum_5,stratum_6,count_value,source_count_value from sub_2_questions_count"