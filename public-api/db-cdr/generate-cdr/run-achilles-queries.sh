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
tables=$(bq --project=$BQ_PROJECT --dataset=$BQ_DATASET ls --max_results=100)

declare -a domain_names domain_table_names
domain_names=(condition drug procedure observation measurement)
domain_stratum_names=(Condition Drug Procedure Observation Measurement)
domain_table_names=(v_ehr_condition_occurrence v_ehr_drug_exposure v_ehr_procedure_occurrence v_ehr_observation v_ehr_measurement)
actual_table_names=(condition_occurrence drug_exposure procedure_occurrence observation measurement)
datetime_names_3102=(condition_start_datetime drug_exposure_start_datetime procedure_datetime observation_datetime measurement_datetime)
concept_ids_to_exclude=(19 0 0 0 0)
domain_concept_ids=(19 13 10 27 21)
view_names=(v_ehr_condition_occurrence v_ehr_drug_exposure v_ehr_procedure_occurrence v_ehr_observation)
view_table_names=(condition_occurrence drug_exposure procedure_occurrence observation)
view_mapping_table_names=(_mapping_condition_occurrence _mapping_drug_exposure _mapping_procedure_occurrence _mapping_observation)
view_domain_names=(condition drug procedure observation)

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
     m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
     m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
     from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` mm
    on m.measurement_id = mm.measurement_id
    left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc on suc.source_concept = m.unit_concept_id
    where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}._mapping_measurement\` where src_dataset_id like '%ehr%')
    and (m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0)
    and person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                          union distinct
                          select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                          where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"

    echo "CREATE VIEWS - v_full_measurement_with_grouped_units"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc
    on suc.source_concept = m.unit_concept_id
    where (m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) or m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120))
    and person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                              union distinct
                              select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                              where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"

    for index in "${!view_names[@]}"; do
        view_table_name="${view_table_names[$index]}";
        view_name="${view_names[$index]}";
        view_mapping_table_name="${view_mapping_table_names[$index]}";
        view_table_id="${view_table_name}_id";
        concept_id="${view_domain_names[$index]}_concept_id";
        source_concept_id="${view_domain_names[$index]}_source_concept_id";

        echo "CREATE VIEWS - ${view_name}"
        bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
        "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${view_name}\` AS
        select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.${view_table_name}\` m join \`${BQ_PROJECT}.${BQ_DATASET}.${view_mapping_table_name}\` mm
        on m.${view_table_id} = mm.${view_table_id}
        where mm.src_dataset_id=(select distinct src_dataset_id from \`${BQ_PROJECT}.${BQ_DATASET}.${view_mapping_table_name}\` where src_dataset_id like '%ehr%')
        and (m.${concept_id} > 0 or m.${source_concept_id} > 0)
        and person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                                  union distinct
                                  select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                                  where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"
    done

else
    echo "CREATE VIEWS - v_ehr_measurement"
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` AS
    select m.measurement_id, m.person_id, m.measurement_concept_id, m.measurement_date, m.measurement_datetime, m.measurement_type_concept_id,
    m.operator_concept_id, m.value_as_number, m.value_as_concept_id, (case when suc.standard_concept is not null then suc.standard_concept else m.unit_concept_id end) as unit_concept_id,
    m.range_low, m.range_high, m.provider_id, m.visit_occurrence_id, m.measurement_source_value, m.measurement_source_concept_id, m.unit_source_value, m.value_source_value
    from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m
     left outer join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.source_standard_unit_map\` suc on m.unit_concept_id = suc.source_concept
    where m.measurement_concept_id > 0 or m.measurement_source_concept_id > 0
    and person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                              union distinct
                              select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                              where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"

    for index in "${!view_names[@]}"; do
        view_table_name="${view_table_names[$index]}";
        view_name="${view_names[$index]}";
        view_mapping_table_name="${view_mapping_table_names[$index]}";
        view_table_id="${view_table_name}_id";
        concept_id="${view_domain_names[$index]}_concept_id";
        source_concept_id="${view_domain_names[$index]}_source_concept_id";

        echo "CREATE VIEWS - ${view_name}"
        bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
        "CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${view_name}\` AS
        select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.${view_table_name}\` m
        where m.${concept_id} > 0 or m.${source_concept_id} > 0
        and person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                                  union distinct
                                  select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                                  where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"
    done
fi

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` AS
select p.* from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
where p.person_id not in
(select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                         union distinct
                         select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                         where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` AS
select m.* from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` m
where (m.observation_concept_id > 0 or m.observation_source_concept_id > 0)
and m.person_id not in (select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.observation\` where value_source_concept_id=1586141
                        union distinct
                        select distinct person_id from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p
                        where p.race_source_value like '%AIAN%' or race_source_concept_id in (1585600, 1585601, 1585602, 1585603))"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"CREATE OR REPLACE VIEW \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.survey_age_stratum\` AS
with survey_age as
(
select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
group by observation_id,age
),
survey_age_stratum_temp as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from survey_age
group by observation_id,age_stratum
)
select * from survey_age_stratum_temp"

# Next Populate achilles_results
echo "Running achilles queries..."

echo "Getting person count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, count_value,source_count_value) select 0 as id, 1 as analysis_id,  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`"

# Gender count
echo "Getting gender count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 2 as analysis_id,  cast (gender_concept_id as STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by GENDER_CONCEPT_ID"

# Age count
# 3	Number of persons by year of birth
echo "Getting age count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 3 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by YEAR_OF_BIRTH"

#  4	Number of persons by race
echo "Getting race count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 4 as analysis_id,  CAST(RACE_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value,0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by RACE_CONCEPT_ID"

# 5	Number of persons by ethnicity
echo "Getting ethnicity count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` (id, analysis_id, stratum_1, count_value,source_count_value)
select 0, 5 as analysis_id,  CAST(ETHNICITY_CONCEPT_ID AS STRING) as stratum_1, COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by ETHNICITY_CONCEPT_ID"

# 6 Number of person by age decile
echo "Getting age decile count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, count_value,source_count_value)
select 0, 10 as analysis_id,  CAST(year_of_birth AS STRING) as stratum_1,
  CAST(gender_concept_id AS STRING) as stratum_2,
  COUNT(distinct person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\`
group by YEAR_OF_BIRTH, gender_concept_id"

# 12	Number of persons by race and ethnicity
echo "Getting race, ethnicity count"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
    table_id="${actual_table_names[$index]}_id";
    datetime_name="${datetime_names_3102[$index]}";
    domain_concept_id="${domain_concept_ids[$index]}";
    ## Fetching 3000 counts
    concept_id="${domain_names[$index]}_concept_id";
    source_concept_id="${domain_names[$index]}_source_concept_id";
    exclude_concept_id=${concept_ids_to_exclude[$index]};
    domain_stratum="${domain_stratum_names[$index]}";

    # Get 3000 counts
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
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
    join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=co1.${concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${concept_id} > 0
    group by co1.${concept_id}, stratum_2
    union all
    select 0, 3102 as analysis_id,
    CAST(co1.${source_concept_id} AS STRING) as stratum_1,
    age_stratum as stratum_2, \"${domain_stratum}\" as stratum_3,
    COUNT(distinct co1.person_id) as count_value,
    COUNT(distinct co1.person_id) as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co1 join ehr_age_stratum ca
    on co1.${table_id} = ca.${table_id}
    join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c on c.concept_id=co1.${source_concept_id} and c.domain_id=\"${domain_stratum}\"
    where co1.${source_concept_id} not in (select distinct ${concept_id} from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\`)
    group by co1.${source_concept_id}, stratum_2"

    # Get the current age counts
    bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
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
    0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.${domain_table_name}\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
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
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
select 0 as id, 3000 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3,
((select count(distinct person_id) from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\`
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)) +
(select count(distinct person_id) from  \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`
where observation_concept_id in (903120)
or observation_source_concept_id in (903120))) as count_value,
0 as source_count_value"

echo "Getting physical measurement participant counts by gender"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id,3300 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3, cast(p.gender_concept_id as string) as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value from \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
on p.person_id=m.person_id
where measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
or measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
group by p.gender_concept_id"

echo "Getting physical measurement participant counts by gender"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
select 0 as id,3300 as analysis_id,'0' as stratum_1,'Physical Measurements' as stratum_3, cast(p.gender_concept_id as string) as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p
on p.person_id=m.person_id
where observation_concept_id in (903120)
or observation_source_concept_id in (903120)
group by p.gender_concept_id"

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
with m_age as
(select measurement_id,
ceil(TIMESTAMP_DIFF(measurement_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
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

bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_3, stratum_4, count_value, source_count_value)
with m_age as
(select observation_id,
ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_person\` p on p.person_id=co.person_id
where observation_concept_id in (903120)
or observation_source_concept_id in (903120)
group by observation_id,age
),
m_age_stratum as
(
select observation_id,
case when age >= 18 and age <= 29 then '2'
when age > 89 then '9'
when age >= 30 and age <= 89 then cast(floor(age/10) as string)
when age < 18 then '0' end as age_stratum from m_age
group by observation_id,age_stratum
)
select 0 as id, 3301 as analysis_id, '0' as stratum_1,'Physical Measurements' as stratum_3, age_stratum as stratum_4,
count(distinct m.person_id) as count_value, 0 as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join m_age_stratum p
on m.observation_id=p.observation_id
group by age_stratum"
