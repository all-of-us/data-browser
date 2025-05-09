
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
tables=$(bq --project_id=$BQ_PROJECT --dataset_id=$BQ_DATASET ls --max_results=100)

declare -a domain_names domain_table_names measurement_table_name
domain_names=(condition drug procedure observation measurement)
domain_stratum_names=(Condition Drug Procedure Observation Measurement)
domain_table_names=(v_ehr_condition_occurrence v_ehr_drug_exposure v_ehr_procedure_occurrence v_ehr_observation v_ehr_measurement)
actual_table_names=(condition_occurrence drug_exposure procedure_occurrence observation measurement)
id_column_names=(condition_occurrence_id drug_exposure_id procedure_occurrence_id observation_id measurement_id)
datetime_names_3102=(condition_start_datetime drug_exposure_start_datetime procedure_datetime observation_datetime measurement_datetime)
concept_ids_to_exclude=(19 0 0 0 0)
domain_concept_ids=(19 13 10 27 21)
view_names=(v_ehr_condition_occurrence v_ehr_drug_exposure v_ehr_procedure_occurrence v_ehr_observation)
view_table_names=(condition_occurrence drug_exposure procedure_occurrence observation)
view_mapping_table_names=(_mapping_condition_occurrence _mapping_drug_exposure _mapping_procedure_occurrence _mapping_observation)
view_domain_names=(condition drug procedure observation)

if [[ "$tables" == *"_mapping_"* ]]; then
  measurement_table_name="v_full_measurement"
else
  measurement_table_name="v_ehr_measurement"
fi

deid_pipeline_table="pipeline_tables"


################################################
# CREATE VIEWS
################################################

# We want to fetch the breakdown counts of each analysis for all of the ehr domain concepts by considering only the records that are ehr related (no ppi results are such)
# So, instead of joining each of the query with the mapping tables we create the view which are used for ehr only count queries.
# Mapping tables have the dataset id specified which can be used to differentiate ehr specific rows
if [[ "$tables" == *"_mapping_"* ]]; then
    echo "CREATE VIEWS - v_ehr_measurement"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
     m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
     m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
     from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` mm
    on m.measurement_id = mm.measurement_id
    left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc on suc.source_concept = m.unit_concept_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` where src_dataset_id like '%ehr%')
    and (m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0)
    and ((m.measurement_concept_id is null or m.measurement_concept_id not in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120))
    and (m.measurement_source_concept_id is null or m.measurement_source_concept_id not in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)))"

    echo "CREATE VIEWS - v_full_measurement_with_grouped_units"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc
    on suc.source_concept = m.unit_concept_id
    where (m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) or m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120))"

    for index in "${!view_names[@]}"; do
        view_table_name="${view_table_names[$index]}";
        view_name="${view_names[$index]}";
        view_mapping_table_name="${view_mapping_table_names[$index]}";
        view_table_id="${view_table_name}_id";
        concept_id="${view_domain_names[$index]}_concept_id";
        source_concept_id="${view_domain_names[$index]}_source_concept_id";

        echo "CREATE VIEWS - ${view_name}"
        bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
        "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${view_name}\` AS
        select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.${view_table_name}\` m join \`${BQ_PROJECT}.${BQ_DATASET}.${view_mapping_table_name}\` mm
        on m.${view_table_id} = mm.${view_table_id}
        where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}.${view_mapping_table_name}\` where src_dataset_id like '%ehr%')
        and (m.${concept_id} > 0 or m.${source_concept_id} > 0)"
    done

else
    echo "CREATE VIEWS - v_ehr_measurement"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m
     left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc on m.unit_concept_id = suc.source_concept
    where m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0"

    for index in "${!view_names[@]}"; do
        view_table_name="${view_table_names[$index]}";
        view_name="${view_names[$index]}";
        view_mapping_table_name="${view_mapping_table_names[$index]}";
        view_table_id="${view_table_name}_id";
        concept_id="${view_domain_names[$index]}_concept_id";
        source_concept_id="${view_domain_names[$index]}_source_concept_id";

        echo "CREATE VIEWS - ${view_name}"
        bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
        "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${view_name}\` AS
        select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.${view_table_name}\` m
        where m.${concept_id} > 0 or m.${source_concept_id} > 0"
    done
fi

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` AS
select p.* from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE TABLE \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` AS
select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` m
where (m.observation_concept_id > 0 or m.observation_source_concept_id > 0)"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"UPDATE \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` a
set a.observation_source_concept_id=705047, a.observation_concept_id=705047, a.observation_source_value='dmfs_27'
from
(select b1.* from \`${BQ_PROJECT}.${BQ_DATASET}.observation_ext\` b1 join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` b2 on
b1.observation_id=b2.observation_id and b2.observation_source_value='cdc_covid_19_9b' and b1.survey_version_concept_id in (2100000005, 2100000006, 2100000007)) b
where a.observation_id=b.observation_id;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_gender_stratum\` AS
with survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age,
p.gender_concept_id AS gender
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
group by observation_id,age,gender
),
survey_age_stratum_temp as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum, gender
from survey_age
group by observation_id,age_stratum, gender
)
select * from survey_age_stratum_temp"

# Next Populate achilles_results
echo "Running achilles queries..."

echo "Getting person count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, count_value,source_count_value) select 0 as id, 1 as analysis_id,  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`"

# Gender count
echo "Getting gender count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 2 as analysis_id,  cast (gender_concept_id as STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by GENDER_CONCEPT_ID"

# Age count
# 3	Number of persons by year of birth
echo "Getting age count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 3 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by YEAR_OF_BIRTH"

#  4	Number of persons by race
echo "Getting race count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 4 as analysis_id,  CAST(RACE_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by RACE_CONCEPT_ID"

# 5	Number of persons by ethnicity
echo "Getting ethnicity count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 5 as analysis_id,  CAST(ETHNICITY_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by ETHNICITY_CONCEPT_ID"

# 6 Number of person by age decile
echo "Getting age decile count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
with person_age as
(select person_id,
ceil(TIMESTAMP_DIFF(current_timestamp(), birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
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
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, count_value,source_count_value)
select 0, 10 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1,
  CAST(gender_concept_id AS STRING) as stratum_2,
  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by YEAR_OF_BIRTH, gender_concept_id"

# 12	Number of persons by race and ethnicity
echo "Getting race, ethnicity count"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, count_value,source_count_value)
select 0, 12 as analysis_id, CAST(RACE_CONCEPT_ID AS STRING) as stratum_1, CAST(ETHNICITY_CONCEPT_ID AS STRING) as stratum_2, COUNT(distinct person_id) as count_value,
0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by RACE_CONCEPT_ID,ETHNICITY_CONCEPT_ID"

# Fetches data needed for concept counts (3000), biological sex (3101), age (3102) charts
for index in "${!domain_names[@]}"; do
    domain_name="${domain_names[$index]}";
    domain_table_name="${domain_table_names[$index]}";
    id_column_name="${id_column_names[$index]}";
    table_id="${actual_table_names[$index]}_id";
    datetime_name="${datetime_names_3102[$index]}";
    domain_concept_id="${domain_concept_ids[$index]}";
    ## Fetching 3000 counts
    concept_id="${domain_names[$index]}_concept_id";
    source_concept_id="${domain_names[$index]}_source_concept_id";
    exclude_concept_id=${concept_ids_to_exclude[$index]};
    domain_stratum="${domain_stratum_names[$index]}";

    # Get 3000 counts
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0, 3000 as analysis_id,
    CAST(co1.${concept_id} AS STRING) as stratum_1, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.PERSON_ID) as count_value, (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
    where co2.${source_concept_id}=co1.${concept_id}) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on
    c.concept_id=co1.${concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${concept_id} > 0 and co1.${concept_id} != ${exclude_concept_id}
    group by co1.${concept_id}
    union all
    select 0 as id,3000 as analysis_id,CAST(co1.${source_concept_id} AS STRING) as stratum_1, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.PERSON_ID) as count_value,COUNT(distinct co1.PERSON_ID) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on
    c.concept_id=co1.${source_concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    and co1.${source_concept_id} != ${exclude_concept_id}
    group by co1.${source_concept_id}"

    # Fetching 3101 counts
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
    select 0, 3101 as analysis_id,
    CAST(co1.${concept_id} AS STRING) as stratum_1,
    CAST(p1.gender_concept_id AS STRING) as stratum_2, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct p1.PERSON_ID) as count_value,
    (select COUNT(distinct p2.PERSON_ID) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p2 inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
    on p2.person_id=co2.person_id where co2.${source_concept_id}=co1.${concept_id} and p2.gender_concept_id = p1.gender_concept_id) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p1 inner join
    \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    on p1.person_id = co1.person_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=co1.${concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${concept_id} > 0
    group by co1.${concept_id}, p1.gender_concept_id
    union all
    select 0, 3101 as analysis_id,CAST(co1.${source_concept_id} AS STRING) as stratum_1,CAST(p1.gender_concept_id AS STRING) as stratum_2,
    \"${domain_stratum}\" as stratum_3,
    COUNT(distinct p1.PERSON_ID) as count_value,COUNT(distinct p1.PERSON_ID) as source_count_value from
    \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p1 inner join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
    on p1.person_id = co1.person_id
    join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=co1.${source_concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    group by co1.${source_concept_id}, p1.gender_concept_id"

    # 3102 Number of persons with at least one ehr record by age decile
    # Age Deciles : They will be  18-29 , 30-39, 40-49, 50-59, 60-69, 70-79, 80-89, 89+
    #  children are 0-17 and we don't have children for now .
    #Ex yob = 2000  , start date : 2017 -- , sd - yob = 17  / 10 = 1.7 floor(1.7) = 1
    # 30 - 39 , 2017 - 1980 = 37 / 10 = 3
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
     with co_age_stratum as
     (SELECT distinct co.*, ceil(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY)/365.25) AS age,
             CASE
                 WHEN CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) >= 18 AND CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) <= 29 THEN '2'
                 WHEN CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) > 89 THEN '9'
                 WHEN CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) >= 30 AND CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) <= 89 THEN CAST(FLOOR(CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) / 10) AS STRING)
                 WHEN CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY) / 365.25) < 18 THEN '0'
             END AS age_stratum
     FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co JOIN \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p ON p.person_id = co.person_id),
     all_age_stratum AS (
     SELECT person_id, ${concept_id} as concept_id, age_stratum AS age_stratum FROM co_age_stratum
     union all
     SELECT person_id, ${source_concept_id} as concept_id, age_stratum AS age_stratum FROM co_age_stratum
     where ${source_concept_id} NOT IN (SELECT DISTINCT ${concept_id} FROM co_age_stratum)),
     min_age_stratum as
     (select person_id, concept_id, min(age_stratum) as min_age_stratum from all_age_stratum group by 1, 2)
     SELECT 0 AS id, 3102 AS analysis_id, CAST(co1.${concept_id} AS STRING) AS stratum_1, ca.min_age_stratum AS stratum_2, \"${domain_stratum}\" as stratum_3, COUNT(DISTINCT co1.person_id) AS count_value,
     (SELECT COUNT(DISTINCT co2.person_id) FROM co_age_stratum co2 where co2.${source_concept_id} = co1.${concept_id} AND ca.min_age_stratum = co2.age_stratum) AS source_count_value
     FROM co_age_stratum co1 JOIN min_age_stratum ca ON co1.person_id = ca.person_id AND co1.${concept_id} = ca.concept_id
     and co1.age_stratum = ca.min_age_stratum
     GROUP BY co1.${concept_id}, stratum_2
     UNION ALL
     SELECT 0 AS id, 3102 AS analysis_id, CAST(co1.${source_concept_id} AS STRING) AS stratum_1, ca.min_age_stratum AS stratum_2, \"${domain_stratum}\" as stratum_3, COUNT(DISTINCT co1.person_id) AS count_value, COUNT(DISTINCT co1.person_id) AS source_count_value
     FROM co_age_stratum co1 JOIN min_age_stratum ca ON co1.person_id = ca.person_id AND co1.${source_concept_id} = ca.concept_id AND co1.age_stratum = ca.min_age_stratum
     WHERE
     co1.${source_concept_id} NOT IN (SELECT DISTINCT ${concept_id} FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
     GROUP BY co1.${source_concept_id}, stratum_2"

    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
     WITH ehr_age AS (
         SELECT
             ${id_column_name},
             CEIL(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY)/365.25) AS age,
             p.gender_concept_id AS gender
         FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co
         JOIN \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
             ON p.person_id = co.person_id
     ),
     ehr_age_stratum AS (
         SELECT
             ${id_column_name},
             CASE
                 WHEN age >= 18 AND age <= 29 THEN '2'
                 WHEN age > 89 THEN '9'
                 WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age/10) AS STRING)
                 WHEN age < 18 THEN '0'
             END AS age_stratum,
             gender
         FROM ehr_age
     )
     SELECT
         0,
         3105 AS analysis_id,
         CAST(co1.${concept_id} AS STRING) AS stratum_1,
         age_stratum AS stratum_2,
         \"${domain_stratum}\" AS stratum_3,
         CAST(gender AS STRING) AS stratum_4,
         COUNT(DISTINCT co1.person_id) AS count_value,
         (
             SELECT COUNT(DISTINCT co2.PERSON_ID)
             FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
             JOIN ehr_age_stratum ca2
                 ON co2.${id_column_name} = ca2.${id_column_name}
             WHERE co2.${source_concept_id} = co1.${concept_id}
             AND ca2.age_stratum = ca.age_stratum
         ) AS source_count_value
     FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
     JOIN ehr_age_stratum ca
         ON co1.${id_column_name} = ca.${id_column_name}
     JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
         ON c.concept_id = co1.${concept_id}
         AND c.domain_id = \"${domain_stratum}\"
     WHERE co1.${concept_id} > 0
     GROUP BY co1.${concept_id}, stratum_2, stratum_4

     UNION ALL

     SELECT
         0,
         3105 AS analysis_id,
         CAST(co1.${source_concept_id} AS STRING) AS stratum_1,
         age_stratum AS stratum_2,
         \"${domain_stratum}\" AS stratum_3,
         CAST(gender AS STRING) AS stratum_4,
         COUNT(DISTINCT co1.person_id) AS count_value,
         COUNT(DISTINCT co1.person_id) AS source_count_value
     FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
     JOIN ehr_age_stratum ca
         ON co1.${id_column_name} = ca.${id_column_name}
     JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
         ON c.concept_id = co1.${source_concept_id}
         AND c.domain_id = \"${domain_stratum}\"
     WHERE co1.${source_concept_id} NOT IN (
             SELECT DISTINCT ${concept_id}
             FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`
         )
     GROUP BY co1.${source_concept_id}, stratum_2, stratum_4;"

    # Get the current age counts
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
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
    group by co1.${source_concept_id}, stratum_2;"

    # Get the location counts
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
         (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
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
         0, 3108 AS analysis_id,
         CAST(co1.${concept_id} AS STRING) AS stratum_1,
         s1.location AS stratum_2,
         \"${domain_stratum}\" AS stratum_3,
         COUNT(DISTINCT co1.person_id) AS count_value,
         (
             SELECT COUNT(DISTINCT co2.person_id)
             FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co2
             JOIN state_information s2 ON s2.person_id = co2.person_id
             WHERE co2.${source_concept_id} = co1.${concept_id} AND s2.location = s1.location
         ) AS source_count_value
     FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
     JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
     ON c.concept_id = co1.${concept_id}
     AND c.domain_id = \"${domain_stratum}\"
     JOIN state_information s1 ON s1.person_id = co1.person_id  -- Join to get location
     WHERE co1.${concept_id} > 0
     GROUP BY co1.${concept_id}, s1.location

     UNION ALL

     SELECT
         0, 3108 AS analysis_id,
         CAST(co1.${source_concept_id} AS STRING) AS stratum_1,
         s1.location AS stratum_2,
         \"${domain_stratum}\" AS stratum_3,
         COUNT(DISTINCT co1.person_id) AS count_value,
         COUNT(DISTINCT co1.person_id) AS source_count_value
     FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1
     JOIN \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c
     ON c.concept_id = co1.${source_concept_id}
     AND c.domain_id = \"${domain_stratum}\"
     JOIN state_information s1 ON s1.person_id = co1.person_id  -- Join to get location
     WHERE co1.${source_concept_id} NOT IN (
         SELECT DISTINCT ${concept_id}
         FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`
     )
     GROUP BY co1.${source_concept_id}, s1.location;"

    # Domain Participant Counts
    echo "Getting domain participant counts"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0 as id,3000 as analysis_id,\"${domain_concept_id}\" as stratum_1, \"${domain_stratum}\" as stratum_3,count(distinct person_id) as count_value,
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`"

    # Domain participant counts by gender
    echo "Getting domain participant counts by gender"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
    select 0 as id,3300 as analysis_id, \"${domain_concept_id}\" as stratum_1, \"${domain_stratum}\" as stratum_3,cast(p.gender_concept_id as string) as stratum_4,
    count(distinct co.person_id) as count_value,
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
    on p.person_id=co.person_id
    group by p.gender_concept_id"

    # Domain participant counts by age
    echo "Getting domain participant counts by age"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
    with ehr_age as
    (select ${table_id},
    ceil(TIMESTAMP_DIFF(${datetime_name}, birth_datetime, DAY)/365.25) as age
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
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

echo "Getting physical measurement participant counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
select 0 as id, 3000 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3,
(select count(distinct person_id) from
(select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
union distinct
select distinct person_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` where observation_concept_id in (903120)
or observation_source_concept_id in (903120)
)) as count_value,
0 as source_count_value"

echo "Getting Fitbit participant counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
select 0 as id, 3000 as analysis_id, '0' as stratum_1, 'Fitbit' as stratum_3,
(select count(distinct a.person_id) from
(SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_intraday\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_summary\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.activity_summary\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.steps_intraday\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary\`
) a join \`${BQ_PROJECT}.${BQ_DATASET}.person\` b on a.person_id=b.person_id) as count_value, 0 as source_count_value;"

echo "Getting genomic tile counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_3, count_value, source_count_value)
select 0 as id, 3000 as analysis_id, 'Genomics' as stratum_3, count(distinct person) as count_value, 0 as source_count_value from
(select distinct p.person_id as person from \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
where a.sample_name not in ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
union distinct
select distinct p.person_id as person from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
union distinct
select distinct p.person_id as person from \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
union distinct
select distinct p.person_id as person from \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id)
;"

echo "Getting genomic tile counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id, 3000 as analysis_id, '0' as stratum_1, 'Genomics' as stratum_3, 'micro-array' as stratum_4,
count(distinct p.person_id) as count_value, 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
union all
select 0 as id, 3000 as analysis_id, '0' as stratum_1, 'Genomics' as stratum_3, 'wgs_shortread' as stratum_4, count(distinct p.person_id), 0 as source_count_value from
\`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
where a.sample_name not in ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
union all
select 0 as id, 3000 as analysis_id, '0' as stratum_1, 'Genomics' as stratum_3, 'wgs_longread' as stratum_4, count(distinct p.person_id), 0 as source_count_value from
\`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
union all
select 0 as id, 3000 as analysis_id, '0' as stratum_1, 'Genomics' as stratum_3, 'wgs_structural_variants' as stratum_4, count(distinct p.person_id), 0 as source_count_value from
\`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id;"

echo "Getting genomic biological sex counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id, 3501 as analysis_id, '0' as stratum_1, cast(p.gender_concept_id as string) stratum_2,
'Genomics' as stratum_3, 'micro-array' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
group by 4
union all
select 0 as id, 3501 as analysis_id, '0' as stratum_1, cast(p.gender_concept_id as string) stratum_2, 'Genomics' as stratum_3, 'wgs_shortread' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
where a.sample_name not in ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
group by 4
union all
select 0 as id, 3501 as analysis_id, '0' as stratum_1, cast(p.gender_concept_id as string) stratum_2, 'Genomics' as stratum_3, 'wgs_longread' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
group by 4
union all
select 0 as id, 3501 as analysis_id, '0' as stratum_1, cast(p.gender_concept_id as string) stratum_2, 'Genomics' as stratum_3, 'wgs_structural_variants' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
group by 4;"

echo "Getting genomic race/ ethnicity counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
with person_race_eth_ans as
(select person_id, string_agg(distinct cast(value_source_concept_id as string), ', ') as distinct_ans from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob where observation_source_concept_id=1586140
group by 1),
race_eth_desc as
(select person_id, case when distinct_ans like '%, %' then 'More than one category'
when distinct_ans = '1586143' then 'Black, African American, or African'
when (distinct_ans like '%1586144%' or distinct_ans like '%1586148%' or distinct_ans like '%1586145%' or distinct_ans like '%903070%') then 'Other'
when distinct_ans like '%1586146%' then 'White' when distinct_ans like '%1586147%' then 'Hispanic, Latino, or Spanish' when (distinct_ans like '%903079%' or distinct_ans like '%903096%') then 'Prefer Not To Answer'
when distinct_ans like '%1586142%' then 'Asian'
when distinct_ans like '%1586141%' then 'American Indian / Alaska Native'
else distinct_ans end as race_eth from person_race_eth_ans)
select 0 as id, 3503 as analysis_id, '0' as stratum_1, race_eth as stratum_2,
'Genomics' as stratum_3, 'micro-array' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join race_eth_desc pa on pa.person_id=p.person_id
group by 4
union all
select 0 as id, 3503 as analysis_id, '0' as stratum_1,race_eth as stratum_2, 'Genomics' as stratum_3, 'wgs_shortread' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join race_eth_desc pa on p.person_id=pa.person_id
where a.sample_name not in ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
group by 4
union all
select 0 as id, 3503 as analysis_id, '0' as stratum_1, race_eth as stratum_2, 'Genomics' as stratum_3, 'wgs_longread' as stratum_4, count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join race_eth_desc pa on p.person_id=pa.person_id
group by 4
union all
select 0 as id, 3503 as analysis_id, '0' as stratum_1, race_eth as stratum_2, 'Genomics' as stratum_3, 'wgs_structural_variants' as stratum_4, count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join race_eth_desc pa on p.person_id=pa.person_id
group by 4;"

echo "Getting genomic location counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
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
    3508 AS analysis_id,
    '0' AS stratum_1,
    state_information.location AS stratum_2,
    'Genomics' AS stratum_3,
    'micro-array' AS stratum_4,
    COUNT(DISTINCT p.person_id) AS count_value,
    0 AS source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a
JOIN \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
    ON CAST(a.sample_name AS int64) = b.research_id
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
    ON b.person_id = p.person_id
JOIN state_information
    ON p.person_id = state_information.person_id
GROUP BY stratum_2
UNION ALL
SELECT
    0 AS id,
    3508 AS analysis_id,
    '0' AS stratum_1,
    state_information.location AS stratum_2,
    'Genomics' AS stratum_3,
    'wgs_shortread' AS stratum_4,
    COUNT(DISTINCT p.person_id) AS count_value,
    0 AS source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a
JOIN \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
    ON CAST(a.sample_name AS int64) = b.research_id
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
    ON b.person_id = p.person_id
JOIN state_information
    ON p.person_id = state_information.person_id
WHERE a.sample_name NOT IN ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
GROUP BY stratum_2
UNION ALL
SELECT
    0 AS id,
    3508 AS analysis_id,
    '0' AS stratum_1,
    state_information.location AS stratum_2,
    'Genomics' AS stratum_3,
    'wgs_longread' AS stratum_4,
    COUNT(DISTINCT p.person_id) AS count_value,
    0 AS source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a
JOIN \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
    ON CAST(a.sample_name AS int64) = b.research_id
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
    ON b.person_id = p.person_id
JOIN state_information
    ON p.person_id = state_information.person_id
GROUP BY stratum_2
UNION ALL
SELECT
    0 AS id,
    3508 AS analysis_id,
    '0' AS stratum_1,
    state_information.location AS stratum_2,
    'Genomics' AS stratum_3,
    'wgs_structural_variants' AS stratum_4,
    COUNT(DISTINCT p.person_id) AS count_value,
    0 AS source_count_value
FROM \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a
JOIN \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
    ON CAST(a.sample_name AS int64) = b.research_id
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
    ON b.person_id = p.person_id
JOIN state_information
    ON p.person_id = state_information.person_id
GROUP BY stratum_2;"


echo "Getting genomic current age counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
with person_age as
(select person_id, ceil(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), birth_datetime, DAY)/365.25) as age from \`${BQ_PROJECT}.${BQ_DATASET}.person\`)
select 0 as id, 3502 as analysis_id, '0' as stratum_1, case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as stratum_2,
'Genomics' as stratum_3, 'micro-array' as stratum_4, count(distinct p.person_id), 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join person_age pa on pa.person_id=p.person_id
group by 4
union all
select 0 as id, 3502 as analysis_id, '0' as stratum_1,case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as stratum_2, 'Genomics' as stratum_3, 'wgs_shortread' as stratum_4, count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join person_age pa on p.person_id=pa.person_id
where a.sample_name not in ('BI_HG-003', 'BI_HG-002', 'UW_HG-002', 'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen')
group by 4
union all
select 0 as id, 3502 as analysis_id, '0' as stratum_1,case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as stratum_2, 'Genomics' as stratum_3, 'wgs_longread' as stratum_4, count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join person_age pa on p.person_id=pa.person_id
group by 4
union all
select 0 as id, 3502 as analysis_id, '0' as stratum_1,case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as stratum_2, 'Genomics' as stratum_3, 'wgs_structural_variants' as stratum_4, count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
on cast(a.sample_name as int64)=b.research_id join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id join person_age pa on p.person_id=pa.person_id
group by 4;"

echo "Getting genomic age + gender counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
with person_age_gender as (
  select
    person_id,
    ceil(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), birth_datetime, DAY)/365.25) as age,
    gender_concept_id as gender
  from \`${BQ_PROJECT}.${BQ_DATASET}.person\`
)
select 0 as id, 3505 as analysis_id,
       case
         when age >= 18 and age <= 29 then '2'
         when age > 89 then '9'
         when age >= 30 and age <= 89 then cast(floor(age/10) as string)
         when age < 18 then '0'
       end as stratum_1,
       cast(gender as string) as stratum_2,
       'Genomics' as stratum_3, 'micro-array' as stratum_4,
       count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_microarray_metadata\` a
join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
  on cast(a.sample_name as int64)=b.research_id
join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  on b.person_id=p.person_id
join person_age_gender pag
  on pag.person_id=p.person_id
group by 3, 4

union all

select 0 as id, 3505 as analysis_id,
       case
         when age >= 18 and age <= 29 then '2'
         when age > 89 then '9'
         when age >= 30 and age <= 89 then cast(floor(age/10) as string)
         when age < 18 then '0'
       end as stratum_1,
       cast(gender as string) as stratum_2,
       'Genomics' as stratum_3, 'wgs_shortread' as stratum_4,
       count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_wgs_metadata\` a
join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
  on cast(a.sample_name as int64)=b.research_id
join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  on b.person_id=p.person_id
join person_age_gender pag
  on pag.person_id=p.person_id
where a.sample_name not in (
  'BI_HG-003', 'BI_HG-002', 'UW_HG-002',
  'HG-004_dragen', 'HG-003_dragen', 'HG-005_dragen', 'HG-001_dragen'
)
group by 3, 4

union all

select 0 as id, 3505 as analysis_id,
       case
         when age >= 18 and age <= 29 then '2'
         when age > 89 then '9'
         when age >= 30 and age <= 89 then cast(floor(age/10) as string)
         when age < 18 then '0'
       end as stratum_1,
       cast(gender as string) as stratum_2,
       'Genomics' as stratum_3, 'wgs_longread' as stratum_4,
       count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_longreads_metadata\` a
join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
  on cast(a.sample_name as int64)=b.research_id
join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  on b.person_id=p.person_id
join person_age_gender pag
  on pag.person_id=p.person_id
group by 3, 4

union all

select 0 as id, 3505 as analysis_id,
       case
         when age >= 18 and age <= 29 then '2'
         when age > 89 then '9'
         when age >= 30 and age <= 89 then cast(floor(age/10) as string)
         when age < 18 then '0'
       end as stratum_1,
       cast(gender as string) as stratum_2,
       'Genomics' as stratum_3, 'wgs_structural_variants' as stratum_4,
       count(distinct p.person_id), 0 as source_count_value
from \`${BQ_PROJECT}.${BQ_DATASET}.prep_structural_variants_metadata\` a
join \`${BQ_PROJECT}.${deid_pipeline_table}.primary_pid_rid_mapping\` b
  on cast(a.sample_name as int64)=b.research_id
join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
  on b.person_id=p.person_id
join person_age_gender pag
  on pag.person_id=p.person_id
group by 3, 4"

echo "Getting physical measurement participant counts by gender"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id,3300 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3, cast(p.gender_concept_id as string) as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
on p.person_id=m.person_id
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
group by p.gender_concept_id"

echo "Getting fitbit participant counts by gender"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id, 3300 as analysis_id, '0' as stratum_1, 'Fitbit' as stratum_3, cast(b.gender_concept_id as string) as stratum_4, count(distinct a.person_id) as count_value, 0 as source_count_value from
(SELECT distinct person_id FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_intraday\`
union distinct
SELECT distinct person_id FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_summary\`
union distinct
SELECT distinct person_id FROM \`${BQ_PROJECT}.${BQ_DATASET}.activity_summary\`
union distinct
SELECT distinct person_id FROM \`${BQ_PROJECT}.${BQ_DATASET}.steps_intraday\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level\`
union distinct
SELECT distinct person_id FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary\`) a join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` b on a.person_id=b.person_id
group by 5;"

echo "Getting physical measurement participant counts by gender"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id,3300 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3, cast(p.gender_concept_id as string) as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
on p.person_id=m.person_id
where observation_concept_id in (903120)
or observation_source_concept_id in (903120)
group by p.gender_concept_id"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
with m_age as
(select measurement_id,
ceil(TIMESTAMP_DIFF(measurement_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${measurement_table_name}\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
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
),
ob_age as
(select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
where observation_concept_id in (903120)
or observation_source_concept_id in (903120)
group by observation_id,age
),
ob_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from ob_age
group by observation_id,age_stratum
)
select 0 as id, analysis_id, '0', 'Physical Measurements', stratum_4, sum(count_value) as count_value, sum(source_count_value) as source_count_value from
(select 0 as id, 3301 as analysis_id, '0' as stratum_1,'Physical Measurements' as stratum_3, age_stratum as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${measurement_table_name}\` m join m_age_stratum p
on m.measurement_id=p.measurement_id
group by age_stratum
union all
select 0 as id, 3301 as analysis_id, '0' as stratum_1,'Physical Measurements' as stratum_3, age_stratum as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join ob_age_stratum p
on m.observation_id=p.observation_id
group by age_stratum)
group by 2,5;"

bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
with all_fibit_data as
(select person_id, date as data_date from \`${BQ_PROJECT}.${BQ_DATASET}.activity_summary\`
union all
select person_id, date as data_date from \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_summary\`
union all
select person_id, datetime as data_date from \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_intraday\`
union all
select person_id, datetime as data_date from \`${BQ_PROJECT}.${BQ_DATASET}.steps_intraday\`
union all
SELECT person_id, sleep_date as data_date FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level\`
union all
SELECT person_id, sleep_date as data_date FROM  \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary\`
),
min_dates as
(select distinct a.person_id, min(data_date) as join_date from all_fibit_data a join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on a.person_id = p.person_id group by 1),
m_age as
(select co.person_id,
IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
  DATE_DIFF(join_date, cast(birth_datetime as DATE), YEAR) - 1,
  DATE_DIFF(join_date, cast(birth_datetime as DATE), YEAR)) as age
from min_dates  co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id),
m_age_stratum as
(
     select *,
     case when age >= 18 and age <= 29 then '2'
     when age > 89 then '9'
     when age >= 30 and age <= 89 then cast(floor(age/10) as string)
     when age < 18 then '0' end as age_stratum from m_age
)
select 0 as id, 3301 as analysis_id, '0' as stratum_1,'Fitbit' as stratum_3, age_stratum as stratum_4,
count(distinct person_id) as count_value, 0 as source_count_value
from m_age_stratum p
group by age_stratum;"

####################
# survey counts #
####################
# Generate survey counts
if ./generate-cdr/generate-survey-counts.sh --bq-project $BQ_PROJECT --bq-dataset $BQ_DATASET --workbench-project $WORKBENCH_PROJECT --workbench-dataset $WORKBENCH_DATASET
then
    echo "Survey counts generated"
else
    echo "FAILED To generate survey counts"
    exit 1
fi