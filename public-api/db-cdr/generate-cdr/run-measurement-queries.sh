#!/bin/bash

# Runs measurement queries to populate count db of measurement data for cloudsql in BigQuery
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/run-measurement-queries.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
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

# Next Populate achilles_results
echo "Running measurement queries..."

# Run these queries in prod to generate counts for ppi concepts from the full measurement table (and not just the ehr one used to generate ehr counts for rest of the concepts)
# In case of test data, the views has all the data, so we do not need to run these.
# If mapping tables are present, the views contain ehr specific data, so we need to run these extra queries.
if [[ "$tables" == *"_mapping_"* ]]; then
    # 3000 Measurements that have numeric values - Number of persons with at least one measurement occurrence by measurement_concept_id, bin size of the measurement value for 10 bins, maximum and minimum from measurement value. Added value for measurement rows
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0, 3000 as analysis_id,
    	CAST(co1.measurement_concept_id AS STRING) as stratum_1,
      'Measurement' as stratum_3,
    	COUNT(distinct co1.PERSON_ID) as count_value, (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2
    	where co2.measurement_source_concept_id=co1.measurement_concept_id) as source_count_value
    from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
    where co1.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
    group by co1.measurement_concept_id
    union all
     select 0 as id,3000 as analysis_id,CAST(co1.measurement_source_concept_id AS STRING) as stratum_1,
      'Measurement' as stratum_3,
     COUNT(distinct co1.PERSON_ID) as count_value,COUNT(distinct co1.PERSON_ID) as source_count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
     where co1.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     and co1.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     group by co1.measurement_source_concept_id"

    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_3, count_value, source_count_value)
    select 0, 3000 as analysis_id,
    CAST(co1.observation_concept_id AS STRING) as stratum_1,
   'Measurement' as stratum_3,
    COUNT(distinct co1.PERSON_ID) as count_value, (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2
    where co2.observation_source_concept_id=co1.observation_concept_id) as source_count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1
     where co1.observation_concept_id in (903120)
     group by co1.observation_concept_id
     union all
      select 0 as id,3000 as analysis_id,CAST(co1.observation_source_concept_id AS STRING) as stratum_1,
       'Measurement' as stratum_3,
      COUNT(distinct co1.PERSON_ID) as count_value,COUNT(distinct co1.PERSON_ID) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1
      where co1.observation_source_concept_id in (903120)
      and co1.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
      group by co1.observation_source_concept_id"

     # Measurement concept by gender
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
     select 0, 3101 as analysis_id,
     CAST(co1.measurement_concept_id AS STRING) as stratum_1,
     CAST(p1.gender_concept_id AS STRING) as stratum_2,'Measurement' as stratum_3,
     COUNT(distinct p1.PERSON_ID) as count_value,
     (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p2 on p2.person_id=co2.person_id
     where co2.measurement_source_concept_id=co1.measurement_concept_id and p2.gender_concept_id=p1.gender_concept_id) as source_count_value
     from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
     \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
     on p1.person_id = co1.person_id
     where co1.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     group by co1.measurement_concept_id, p1.gender_concept_id
     union all
     select 0, 3101 as analysis_id,
     CAST(co1.measurement_source_concept_id AS STRING) as stratum_1,
     CAST(p1.gender_concept_id AS STRING) as stratum_2,'Measurement' as stratum_3,
     COUNT(distinct p1.PERSON_ID) as count_value,
     COUNT(distinct p1.PERSON_ID) as source_count_value
     from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
     \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
     on p1.person_id = co1.person_id
     where co1.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     and co1.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     group by co1.measurement_source_concept_id, p1.gender_concept_id"

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
          CAST(co1.measurement_concept_id AS STRING) AS stratum_1,
          s1.location AS stratum_2,
          'Measurement' AS stratum_3,
          COUNT(DISTINCT co1.person_id) AS count_value,
          (
              SELECT COUNT(DISTINCT co2.person_id)
              FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2
              JOIN state_information s2 ON s2.person_id = co2.person_id  -- Location join
              WHERE co2.measurement_source_concept_id = co1.measurement_concept_id
                AND s2.location = s1.location
          ) AS source_count_value
      FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
      JOIN state_information s1 ON s1.person_id = co1.person_id  -- Join to get location
      WHERE co1.measurement_concept_id IN (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
      GROUP BY co1.measurement_concept_id, s1.location

      UNION ALL

      SELECT
          0, 3108 AS analysis_id,
          CAST(co1.measurement_source_concept_id AS STRING) AS stratum_1,
          s1.location AS stratum_2,
          'Measurement' AS stratum_3,
          COUNT(DISTINCT co1.person_id) AS count_value,
          COUNT(DISTINCT co1.person_id) AS source_count_value
      FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1
      JOIN state_information s1 ON s1.person_id = co1.person_id
      WHERE co1.measurement_source_concept_id IN (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
        AND co1.measurement_source_concept_id NOT IN (
          SELECT DISTINCT measurement_concept_id
          FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`
      )
      GROUP BY co1.measurement_source_concept_id, s1.location;"

      # Pregnancy concept by gender
      bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
      "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
      (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
      select 0, 3101 as analysis_id,
      CAST(co1.observation_concept_id AS STRING) as stratum_1,
      CAST(p1.gender_concept_id AS STRING) as stratum_2,'Measurement' as stratum_3,
      COUNT(distinct p1.PERSON_ID) as count_value,
      (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p2 on p2.person_id=co2.person_id
      where co2.observation_source_concept_id=co1.observation_concept_id and p2.gender_concept_id=p1.gender_concept_id) as source_count_value
      from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
      \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1
      on p1.person_id = co1.person_id
      where co1.observation_concept_id in (903120)
      group by co1.observation_concept_id, p1.gender_concept_id
      union all
      select 0, 3101 as analysis_id,
      CAST(co1.observation_source_concept_id AS STRING) as stratum_1,
      CAST(p1.gender_concept_id AS STRING) as stratum_2,'Measurement' as stratum_3,
      COUNT(distinct p1.PERSON_ID) as count_value,
      COUNT(distinct p1.PERSON_ID) as source_count_value
      from \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 inner join
      \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1
      on p1.person_id = co1.person_id
      where co1.observation_source_concept_id in (903120)
      and co1.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
      group by co1.observation_source_concept_id, p1.gender_concept_id"

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
     ),
      location_counts AS (
          SELECT
              co1.observation_concept_id AS concept_id,
              si.location AS location,
              COUNT(DISTINCT si.person_id) AS count_value
          FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1
          JOIN state_information si
          ON si.person_id = co1.person_id
          WHERE co1.observation_concept_id IN (903120)
          GROUP BY co1.observation_concept_id, si.location
      ),
      source_location_counts AS (
          SELECT
              co2.observation_source_concept_id AS concept_id,
              si2.location AS location,
              COUNT(DISTINCT co2.person_id) AS source_count_value
          FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2
          JOIN state_information si2
          ON si2.person_id = co2.person_id
          WHERE co2.observation_source_concept_id IN (903120)
          GROUP BY co2.observation_source_concept_id, si2.location
      )

      SELECT
          0 AS id,
          3108 AS analysis_id,
          CAST(lc.concept_id AS STRING) AS stratum_1,
          lc.location AS stratum_2,
          'Measurement' AS stratum_3,
          lc.count_value AS count_value,
          COALESCE(src.source_count_value, 0) AS source_count_value
      FROM location_counts lc
      LEFT JOIN source_location_counts src
      ON lc.concept_id = src.concept_id AND lc.location = src.location

      UNION ALL

      SELECT
          0 AS id,
          3108 AS analysis_id,
          CAST(src.concept_id AS STRING) AS stratum_1,
          src.location AS stratum_2,
          'Measurement' AS stratum_3,
          src.source_count_value AS count_value,
          src.source_count_value AS source_count_value
      FROM source_location_counts src
      LEFT JOIN location_counts lc
      ON src.concept_id = lc.concept_id AND src.location = lc.location
      WHERE lc.concept_id IS NULL;"

     # Measurement by age deciles
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
     with m_age as
     (select measurement_id,
     ceil(TIMESTAMP_DIFF(measurement_datetime, birth_datetime, DAY)/365.25) as age
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
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
     select 0, 3102 as analysis_id,
     CAST(co1.measurement_concept_id AS STRING) as stratum_1,
     age_stratum as stratum_2,
     'Measurement' as stratum_3,
     count(distinct co1.person_id) as count_value,
     (select COUNT(distinct co2.PERSON_ID) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2 join m_age_stratum ca2
     on co2.measurement_id = ca2.measurement_id
     where co2.measurement_source_concept_id=co1.measurement_concept_id
     and ca2.age_stratum=ca.age_stratum) as source_count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1 join m_age_stratum ca on co1.measurement_id = ca.measurement_id
     where co1.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     group by co1.measurement_concept_id, stratum_2
     union all
     select 0, 3102 as analysis_id,
     CAST(co1.measurement_source_concept_id AS STRING) as stratum_1,
     age_stratum as stratum_2,'Measurement' as stratum_3,
     COUNT(distinct co1.person_id) as count_value,
     COUNT(distinct co1.person_id) as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co1 join m_age_stratum ca
     on co1.measurement_id = ca.measurement_id
     where co1.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     and co1.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     group by co1.measurement_source_concept_id, stratum_2"

     # Pregnancy physical Measurement by age deciles
      bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
      "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
      (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
      with m_age as
      (select observation_id,
      ceil(TIMESTAMP_DIFF(observation_datetime, birth_datetime, DAY)/365.25) as age
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=co.person_id
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
      select 0, 3102 as analysis_id,
      CAST(co1.observation_concept_id AS STRING) as stratum_1,
      age_stratum as stratum_2,
      'Measurement' as stratum_3,
      count(distinct co1.person_id) as count_value,
      (select COUNT(distinct co2.PERSON_ID) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2 join m_age_stratum ca2
      on co2.observation_id = ca2.observation_id
      where co2.observation_source_concept_id=co1.observation_concept_id
      and ca2.age_stratum=ca.age_stratum) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1 join m_age_stratum ca on co1.observation_id = ca.observation_id
      where co1.observation_concept_id in (903120)
      group by co1.observation_concept_id, stratum_2
      union all
      select 0, 3102 as analysis_id,
      CAST(co1.observation_source_concept_id AS STRING) as stratum_1,
      age_stratum as stratum_2,'Measurement' as stratum_3,
      COUNT(distinct co1.person_id) as count_value,
      COUNT(distinct co1.person_id) as source_count_value from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co1 join m_age_stratum ca
      on co1.observation_id = ca.observation_id
      where co1.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
      and co1.observation_source_concept_id in (903120)
      group by co1.observation_source_concept_id, stratum_2"

     # 1815 Measurement response by gender distribution
     echo "Getting measurement response by gender distribution"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     (id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,min_value,max_value,avg_value,stdev_value,median_value,p10_value,p25_value,p75_value,p90_value)
     with rawdata_1815 as
    (select measurement_concept_id as subject_id, cast(unit_concept_id as string) as unit, p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     where m.value_as_number is not null and m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and unit_concept_id != 0 and unit_concept_id is not null
     union all
     select measurement_source_concept_id as subject_id, cast(unit_concept_id as string) as unit,p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     where m.value_as_number is not null and m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and
     m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     and unit_concept_id != 0 and unit_concept_id is not null
     union all
     select measurement_concept_id as subject_id, cast(um.unit_concept_id as string) as unit, p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
     where m.value_as_number is not null and m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and (m.unit_concept_id = 0 or m.unit_concept_id is null)and m.unit_source_value is not null
     union all
     select measurement_source_concept_id as subject_id, cast(um.unit_concept_id as string) as unit,p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
     where m.value_as_number is not null and m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and
     m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     and (m.unit_concept_id = 0 or m.unit_concept_id is null) and m.unit_source_value is not null
     union all
     select measurement_concept_id as subject_id, cast('0' as string), p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     where m.value_as_number is not null and m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and (m.unit_concept_id = 0 and (m.unit_source_value is null or m.unit_source_value = ' ' or length(m.unit_source_value)=0))
     union all
     select measurement_source_concept_id as subject_id, cast('0' as string),p.gender_concept_id as gender,
     cast(value_as_number as float64) as count_value
     from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
     where m.value_as_number is not null and m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
     and m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
     and ((m.unit_concept_id = 0 or m.unit_concept_id is null) and (m.unit_source_value is null or m.unit_source_value = ' ' or length(m.unit_source_value)=0))),
     overallstats as
     (select subject_id as stratum1_id, unit as stratum2_id, gender as stratum3_id, cast(avg(1.0 * count_value) as float64) as avg_value,
     cast(stddev(count_value) as float64) as stdev_value, min(count_value) as min_value, max(count_value) as max_value,
     count(*) as total from rawdata_1815 group by 1,2,3
     ),
     statsview as
     (select subject_id as stratum1_id, unit as stratum2_id, gender as stratum3_id,
     count_value as count_value, count(*) as total, row_number() over
     (partition by subject_id,unit,gender order by count_value) as rn from rawdata_1815 group by 1,2,3,4
     ),
     priorstats as
     (select  s.stratum1_id as stratum1_id, s.stratum2_id as stratum2_id, s.stratum3_id as stratum3_id, s.count_value as count_value, s.total as total, sum(p.total) as accumulated from  statsview s
     join statsview p on s.stratum1_id = p.stratum1_id and s.stratum2_id = p.stratum2_id and s.stratum3_id = p.stratum3_id
     and p.rn <= s.rn
     group by s.stratum1_id, s.stratum2_id, s.stratum3_id, s.count_value, s.total, s.rn
     )
     select 0 as id, 1815 as analysis_id, CAST(o.stratum1_id  AS STRING) as stratum1_id, CAST(o.stratum2_id  AS STRING) as stratum2_id,CAST(o.stratum3_id  AS STRING) as stratum3_id,
     cast(o.total as int64) as count_value, round(o.min_value,2) as min_value, round(o.max_value,2) as max_value, round(o.avg_value,2) as avg_value,
     round(o.stdev_value,2) as stdev_value,
     min(case when p.accumulated >= .50 * o.total then count_value else round(o.max_value,2) end) as median_value,
     min(case when p.accumulated >= .10 * o.total then count_value else round(o.max_value,2) end) as p10_value,
     min(case when p.accumulated >= .25 * o.total then count_value else round(o.max_value,2) end) as p25_value,
     min(case when p.accumulated >= .75 * o.total then count_value else round(o.max_value,2) end) as p75_value,
     min(case when p.accumulated >= .90 * o.total then count_value else round(o.max_value,2) end) as p90_value
     FROM  priorstats p
     join overallstats o on p.stratum1_id = o.stratum1_id and p.stratum2_id = o.stratum2_id and p.stratum3_id = o.stratum3_id
     group by o.stratum1_id, o.stratum2_id, o.stratum3_id, o.total, o.min_value, o.max_value, o.avg_value, o.stdev_value"

     # Update iqr_min and iqr_max in distributions for debugging purposes
     echo "updating iqr_min and iqr_max"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = cast(ROUND((case when (p25_value - 1.5*(p75_value-p25_value)) > min_value then (p25_value - 1.5*(p75_value-p25_value)) else min_value end),2) as string),
     stratum_5 = cast(ROUND((case when (p75_value + 1.5*(p75_value-p25_value)) < max_value then (p75_value + 1.5*(p75_value-p25_value)) else max_value end),2) as string)
     where analysis_id in (1815)"

     # Update iqr_min and iqr_max in distributions for debugging purposes
     echo "updating iqr_min and iqr_max"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = cast(ROUND(p10_value,2) as string),
     stratum_5 = cast(ROUND(p90_value,2) as string)
     where analysis_id in (1815)
     and stratum_4=stratum_5"

     # Update iqr_min and iqr_max in case both of them are 0
     echo "updating iqr_min and iqr_max"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = cast(ROUND(min_value,2) as string),
     stratum_5 = cast(ROUND(max_value,2) as string) where analysis_id in (1815) and stratum_4='0' and stratum_5='0'
     and (min_value != 0 or max_value != 0)"

     echo "Rounding the bin values to multiples of 10"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = cast(cast(FLOOR(cast(stratum_4 as float64) / 10) * 10 as int64) as string)
     where cast(stratum_4 as float64) >= 10 and analysis_id = 1815"

     echo "Rounding the bin values to multiples of 10"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_5 = cast(cast(CEIL(cast(stratum_5 as float64) / 10) * 10 as int64) as string)
     where cast(stratum_5 as float64) >= 10 and analysis_id = 1815"

     echo "Rounding bin values to one decimal"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = CAST(ROUND(safe_cast(stratum_4 as float64),1) as string)
     where safe_cast(stratum_4 as int64) is null"

     echo "Rounding bin values to one decimal"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_5 = CAST(ROUND(safe_cast(stratum_5 as float64),1) as string)
     where safe_cast(stratum_5 as int64) is null"

     echo "Rounding bin values to one decimal"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_4 = CAST(ROUND(cast(stratum_4 as float64)) as string)
     where safe_cast(stratum_4 as int64) is null
     and cast(stratum_4 as float64) > 1"

     echo "Rounding bin values to one decimal"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
     set stratum_5 = CAST(ROUND(cast(stratum_5 as float64)) as string)
     where safe_cast(stratum_5 as int64) is null
     and cast(stratum_5 as float64) > 1"


     echo "Make the min range of all the biological sexes same"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
     set a.stratum_4= cast(res.min_iqr_min as string)
     from  (select stratum_1, stratum_2, min(cast(r.stratum_4 as float64)) as min_iqr_min from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` r
     where r.analysis_id=1815 group by stratum_1, stratum_2) as res
     where a.stratum_1 = res.stratum_1 and a.stratum_2=res.stratum_2"

     echo "Make the max range of all the biological sexes same"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
     set a.stratum_5= cast(res.min_iqr_max as string)
     from  (select stratum_1, stratum_2, max(cast(r.stratum_5 as float64)) as min_iqr_max from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` r
     where r.analysis_id=1815 group by stratum_1, stratum_2) as res
     where a.stratum_1 = res.stratum_1 and a.stratum_2=res.stratum_2"

     echo "Update the bin_width in achilles_results_dist"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
     set a.stratum_6 =
     cast(case
     when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 5
     then ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as int64)/5)*5
     when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 0.1 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 1
     then ROUND(CEIL(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/0.1)*0.1,1)
     when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 1 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 2
     then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/2)*2,1)
     when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 2 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 3
     then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/3)*3,1)
     when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 3 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 5
     then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/5)*5,1)
     else ROUND(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11),1) end as string)
     where analysis_id=1815"

     echo "Update the bin_width in achilles_results_dist"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
     set a.stratum_6 = cast(ROUND(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11),2) as string)
     where analysis_id=1815 and stratum_6='0' "


     # 1900 Measurement numeric value counts (This query generates counts, source counts of the binned value and gender combination. It gets bin size from joining the achilles_results)
     # We do net yet generate the binned source counts of standard concepts
     # This query only generates counts of measurements that have unit_concept_id 0 and unit_source_value (being considered) by joining on the manual made unit_map table
     echo "Getting measurements binned gender value counts"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
     (id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_6,count_value,source_count_value)
     with measurement_data as
         (
         select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`
          ),
     measurement_quartile_data as
          (
          select cast(stratum_1 as int64) as concept,stratum_2 as unit,cast(stratum_3 as int64)as gender,cast(stratum_4 as float64) as iqr_min,cast(stratum_5 as float64) as iqr_max,
          cast(stratum_6 as float64) as bin_width,
          min_value,max_value,p10_value,p25_value,p75_value,p90_value
          from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` where analysis_id=1815
          ),
          measurement_bucket_data as
               (
               select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,
               CASE when bin_width != 0 then CAST(CEIL((iqr_max-iqr_min)/bin_width) as int64)+1 else 1 end as num_buckets
               from measurement_quartile_data
               ),
               measurement_quartile_data_2 as
               (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,iqr_min +
               (num_buckets - 1)*bin_width as updated_iqr_max,
               LENGTH(REGEXP_EXTRACT(CAST(bin_width as string), r'.(.*)')) AS decimal_places
               from measurement_bucket_data),
               measurement_quartile_bucket_decimal_data as
               (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,
               updated_iqr_max, case when decimal_places > 1 then decimal_places-1 else 0 end as num_decimals
               from measurement_quartile_data_2),
               measurement_quartile_bucket_decimal_data_calc as
               (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,
               ROUND(updated_iqr_max, num_decimals) as calc_iqr_max
               from measurement_quartile_bucket_decimal_data)
               select 0 as id,1900 as analysis_id,
          CAST(m1.measurement_concept_id AS STRING) as stratum_1,
          unit as stratum_2,
          CAST(p1.gender_concept_id AS STRING) as stratum_3,
                case when bin_width != 0 then
               (case when iqr_min != iqr_max then
               (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
                  (case when m1.value_as_number < iqr_min then CONCAT('< ' , cast(round(iqr_min,2) as string))
                    when m1.value_as_number >= calc_iqr_max then CONCAT('>= ' , cast(round(calc_iqr_max,2) as string))
                    when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                    then CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_min+bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+2*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+bin_width,2) as string), ' - ', cast(round(iqr_min+2*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+3*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+2*bin_width,2) as string), ' - ', cast(round(iqr_min+3*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+4*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+3*bin_width,2) as string), ' - ', cast(round(iqr_min+4*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+5*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+4*bin_width,2) as string), ' - ', cast(round(iqr_min+5*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+6*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+5*bin_width,2) as string), ' - ', cast(round(iqr_min+6*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+7*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+6*bin_width,2) as string), ' - ', cast(round(iqr_min+7*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+8*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+7*bin_width,2) as string), ' - ', cast(round(iqr_min+8*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+9*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+8*bin_width,2) as string), ' - ', cast(round(iqr_min+9*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+10*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+9*bin_width,2) as string), ' - ', cast(round(iqr_min+10*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+11*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+10*bin_width,2) as string), ' - ', cast(round(iqr_min+11*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+12*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+11*bin_width,2) as string), ' - ', cast(round(iqr_min+12*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+13*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+12*bin_width,2) as string), ' - ', cast(round(iqr_min+13*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+14*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+13*bin_width,2) as string), ' - ', cast(round(iqr_min+14*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+15*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+14*bin_width,2) as string), ' - ', cast(round(iqr_min+15*bin_width,2) as string))
                    when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                    and iqr_min+16*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+15*bin_width,2) as string), ' - ', cast(round(iqr_min+16*bin_width,2) as string))
                    else cast(value_as_number as string)
                       end)
                    else
                    (case when m1.value_as_number < iqr_min then cast(round(iqr_min,2) as string)
                        when m1.value_as_number >= calc_iqr_max then cast(round(calc_iqr_max,2) as string)
                        when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                        then cast(round(iqr_min+bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+2*bin_width <= calc_iqr_max then cast(round(iqr_min+2*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+3*bin_width <= calc_iqr_max then cast(round(iqr_min+3*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+4*bin_width <= calc_iqr_max then cast(round(iqr_min+4*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+5*bin_width <= calc_iqr_max then cast(round(iqr_min+5*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+6*bin_width <= calc_iqr_max then cast(round(iqr_min+6*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+7*bin_width <= calc_iqr_max then cast(round(iqr_min+7*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+8*bin_width <= calc_iqr_max then cast(round(iqr_min+8*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+9*bin_width <= calc_iqr_max then cast(round(iqr_min+9*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+10*bin_width <= calc_iqr_max then cast(round(iqr_min+10*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+11*bin_width <= calc_iqr_max then cast(round(iqr_min+11*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+12*bin_width <= calc_iqr_max then cast(round(iqr_min+12*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+13*bin_width <= calc_iqr_max then cast(round(iqr_min+13*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+14*bin_width <= calc_iqr_max then cast(round(iqr_min+14*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+15*bin_width <= calc_iqr_max then cast(round(iqr_min+15*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+16*bin_width <= calc_iqr_max then cast(round(iqr_min+16*bin_width,2) as string)
                        else cast(value_as_number as string)
                       end) end)
                     when p10_value != p90_value then
        (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
                       (case when m1.value_as_number < p10_value then CONCAT('< ' , cast(round(p10_value,2) as string))
                     when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value,2) as string), ' - ', cast(round(p10_value+((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then CONCAT(cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string))
                     when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string))
                     else CONCAT('< ' , cast(round(p90_value,2) as string))
                     end)
            else
            (case when m1.value_as_number < p10_value then cast(round(p10_value,2) as string)
                     when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string)
                     when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                     then cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string)
                     else cast(round(p90_value,2) as string)
                     end) end)
               else cast(m1.value_as_number as string)
                    end)
               else CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_max,2) as string)) end as stratum_4,
                    cast((case when iqr_min != iqr_max then bin_width when p10_value != p90_value then  ((p90_value-p10_value)/11) else bin_width end) as string) as stratum_6,
          count(distinct p1.person_id) as count_value,
          count(distinct p1.person_id) as source_count_value
          from measurement_data m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
          join measurement_quartile_bucket_decimal_data_calc on m1.measurement_concept_id=concept
          join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_concept_id=c1.concept_id
          join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um
          on case when (m1.unit_concept_id > 0 and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then m1.unit_concept_id = um.unit_concept_id
             when ((m1.unit_concept_id = 0 or m1.unit_concept_id is null) and (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then lower(m1.unit_source_value) = lower(um.unit_source_value)
             when (m1.unit_concept_id is null and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then um.unit_concept_id=0
             else m1.unit_concept_id = um.unit_concept_id end
          where m1.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
          and m1.value_as_number is not null and p1.gender_concept_id=gender and cast(um.unit_concept_id as string)=unit
          group by stratum_1, stratum_2, stratum_3, stratum_4, stratum_6
          union all
          select 0 as id, 1900 as analysis_id,
          CAST(m1.measurement_source_concept_id AS STRING) as stratum_1,
          unit as stratum_2,
          CAST(p1.gender_concept_id AS STRING) as stratum_3,
                case when bin_width != 0 then
               (case when iqr_min != iqr_max then
       (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
                      (case when m1.value_as_number < iqr_min then CONCAT('< ' , cast(round(iqr_min,2) as string))
                        when m1.value_as_number >= calc_iqr_max then CONCAT('>= ' , cast(round(calc_iqr_max,2) as string))
                        when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                        then CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_min+bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+2*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+bin_width,2) as string), ' - ', cast(round(iqr_min+2*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+3*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+2*bin_width,2) as string), ' - ', cast(round(iqr_min+3*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+4*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+3*bin_width,2) as string), ' - ', cast(round(iqr_min+4*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+5*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+4*bin_width,2) as string), ' - ', cast(round(iqr_min+5*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+6*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+5*bin_width,2) as string), ' - ', cast(round(iqr_min+6*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+7*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+6*bin_width,2) as string), ' - ', cast(round(iqr_min+7*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+8*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+7*bin_width,2) as string), ' - ', cast(round(iqr_min+8*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+9*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+8*bin_width,2) as string), ' - ', cast(round(iqr_min+9*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+10*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+9*bin_width,2) as string), ' - ', cast(round(iqr_min+10*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+11*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+10*bin_width,2) as string), ' - ', cast(round(iqr_min+11*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+12*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+11*bin_width,2) as string), ' - ', cast(round(iqr_min+12*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+13*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+12*bin_width,2) as string), ' - ', cast(round(iqr_min+13*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+14*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+13*bin_width,2) as string), ' - ', cast(round(iqr_min+14*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+15*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+14*bin_width,2) as string), ' - ', cast(round(iqr_min+15*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+16*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+15*bin_width,2) as string), ' - ', cast(round(iqr_min+16*bin_width,2) as string))
                        else cast(value_as_number as string)
                       end)
                        else
                        (case when m1.value_as_number < iqr_min then cast(round(iqr_min,2) as string)
                            when m1.value_as_number >= calc_iqr_max then cast(round(calc_iqr_max,2) as string)
                            when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                            then cast(round(iqr_min+bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+2*bin_width <= calc_iqr_max then cast(round(iqr_min+2*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+3*bin_width <= calc_iqr_max then cast(round(iqr_min+3*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+4*bin_width <= calc_iqr_max then cast(round(iqr_min+4*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+5*bin_width <= calc_iqr_max then cast(round(iqr_min+5*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+6*bin_width <= calc_iqr_max then cast(round(iqr_min+6*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+7*bin_width <= calc_iqr_max then cast(round(iqr_min+7*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+8*bin_width <= calc_iqr_max then cast(round(iqr_min+8*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+9*bin_width <= calc_iqr_max then cast(round(iqr_min+9*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+10*bin_width <= calc_iqr_max then cast(round(iqr_min+10*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+11*bin_width <= calc_iqr_max then cast(round(iqr_min+11*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+12*bin_width <= calc_iqr_max then cast(round(iqr_min+12*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+13*bin_width <= calc_iqr_max then cast(round(iqr_min+13*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+14*bin_width <= calc_iqr_max then cast(round(iqr_min+14*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+15*bin_width <= calc_iqr_max then cast(round(iqr_min+15*bin_width,2) as string)
                            when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                            and iqr_min+16*bin_width <= calc_iqr_max then cast(round(iqr_min+16*bin_width,2) as string)
                            else cast(value_as_number as string)
                           end) end)
               when p10_value != p90_value then
               (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
               (case when m1.value_as_number < p10_value then CONCAT('< ' , cast(round(p10_value,2) as string))
                            when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value,2) as string), ' - ', cast(round(p10_value+((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then CONCAT(cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string))
                            when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string))
                            else CONCAT('< ' , cast(round(p90_value,2) as string))
                            end)
                   else
                   (case when m1.value_as_number < p10_value then cast(round(p10_value,2) as string)
                            when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string)
                            when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
                            then cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string)
                            else cast(round(p90_value,2) as string)
                            end) end)
               else cast(m1.value_as_number as string)
                    end)
               else  CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_max,2) as string)) end as stratum_4,
                    cast((case when iqr_min != iqr_max then bin_width when p10_value != p90_value then  ((p90_value-p10_value)/11) else bin_width end) as string) as stratum_6,
          COUNT(distinct p1.PERSON_ID) as count_value, COUNT(distinct p1.PERSON_ID) as source_count_value
          from measurement_data m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
          join measurement_quartile_bucket_decimal_data_calc on m1.measurement_source_concept_id=concept
          join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on
          case when (m1.unit_concept_id > 0 and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then m1.unit_concept_id = um.unit_concept_id
                       when ((m1.unit_concept_id = 0 or m1.unit_concept_id is null) and (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then lower(m1.unit_source_value) = lower(um.unit_source_value)
                       when (m1.unit_concept_id is null and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then um.unit_concept_id=0
                       else m1.unit_concept_id = um.unit_concept_id end
          join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_source_concept_id=c1.concept_id
          where m1.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
          and m1.measurement_source_concept_id not in (select distinct measurement_concept_id from measurement_data)
          and m1.value_as_number is not null and p1.gender_concept_id=gender and cast(um.unit_concept_id as string)=unit
          group by stratum_1, stratum_2, stratum_3, stratum_4,stratum_6"

     # 1900 Measurement string value counts (This query generates counts, source counts of the value and gender combination. It gets bin size from joining the achilles_results)
     # We do not yet generate the source counts of standard concepts
     # This query generates counts of measurements that do not have unit at all
     echo "Getting measurements unbinned gender value counts"
     bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
     "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
      (id, analysis_id, stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
      SELECT 0,1900 as analysis_id,
      cast(m1.measurement_concept_id as string) as stratum_1,'0' as stratum_2,
      CAST(p1.gender_concept_id AS STRING) as stratum_3,
      c2.concept_name as stratum_4,
      cast(m1.value_as_concept_id as string) as stratum_5,
      count(distinct p1.person_id) as count_value,
      count(distinct p1.person_id) as source_count_value
      FROM \`${BQ_PROJECT}.${BQ_DATASET}.measurement\` m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
      join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
      join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_concept_id=c1.concept_id
      where m1.value_as_concept_id != 0
      and m1.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
      group by stratum_1,stratum_3,stratum_4,stratum_5
      union all
      SELECT 0,1900 as analysis_id,
      cast(m1.measurement_source_concept_id as string) as stratum_1,'0' as stratum_2,
      CAST(p1.gender_concept_id AS STRING) as stratum_3,
      c2.concept_name as stratum_4,
      cast(m1.value_as_concept_id as string) as stratum_5,
      count(distinct p1.person_id) as count_value,
      count(distinct p1.person_id) as source_count_value
      FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m1
      join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
      join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
      join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_source_concept_id=c1.concept_id
      where m1.value_as_concept_id != 0
      and m1.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
       and m1.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
      group by stratum_1,stratum_3,stratum_4,stratum_5"

      echo "Getting pregnancy unbinned gender value counts"
           bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
           "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
            (id, analysis_id, stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
            SELECT 0,1900 as analysis_id,
            cast(m1.observation_concept_id as string) as stratum_1,'0' as stratum_2,
            CAST(p1.gender_concept_id AS STRING) as stratum_3,
            c2.concept_name as stratum_4,
            cast(m1.value_as_concept_id as string) as stratum_5,
            count(distinct p1.person_id) as count_value,
            count(distinct p1.person_id) as source_count_value
            FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
            join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
            join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.observation_concept_id=c1.concept_id
            where m1.value_as_concept_id != 0
            and m1.observation_concept_id in (903120)
            group by stratum_1,stratum_3,stratum_4,stratum_5
            union all
            SELECT 0,1900 as analysis_id,
            cast(m1.observation_source_concept_id as string) as stratum_1,'0' as stratum_2,
            CAST(p1.gender_concept_id AS STRING) as stratum_3,
            c2.concept_name as stratum_4,
            cast(m1.value_as_concept_id as string) as stratum_5,
            count(distinct p1.person_id) as count_value,
            count(distinct p1.person_id) as source_count_value
            FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m1
            join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
            join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
            join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.observation_source_concept_id=c1.concept_id
            where m1.value_as_concept_id != 0
            and m1.observation_source_concept_id in (903120)
             and m1.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
            group by stratum_1,stratum_3,stratum_4,stratum_5"

      # Generating biological sex counts for measurement concepts for each unit
      echo "Inserting unit specific biological sex counts for each measurement concept"
      bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
      "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
      (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
      with unit_counts as
      (select 0 as id, 1910 as analysis_id,cast(measurement_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
      on co2.person_id=p1.person_id
      where co2.measurement_source_concept_id=m.measurement_concept_id
      and (co2.unit_concept_id=um.unit_concept_id or lower(co2.unit_source_value)=lower(unit_source_value)) and p1.gender_concept_id=p.gender_concept_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
      and (m.value_as_number is not null)
      group by m.measurement_concept_id,um.unit_concept_id,p.gender_concept_id
      union all
      select 0 as id, 1910 as analysis_id,cast(measurement_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
      on co2.person_id=p1.person_id
      where co2.measurement_source_concept_id=m.measurement_concept_id
      and m.value_as_concept_id=co2.value_as_concept_id and p1.gender_concept_id=p.gender_concept_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on um.unit_concept_id=0
      where m.measurement_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120)
       and m.value_as_concept_id != 0
      group by m.measurement_concept_id,m.value_as_concept_id,um.unit_concept_id,p.gender_concept_id
      union all
      select 0 as id, 1910 as analysis_id,cast(measurement_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
      cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      count(distinct p.person_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and
      m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
      and (m.value_as_number is not null)
      group by concept_id, unit, gender
      union all
      select 0 as id, 1910 as analysis_id,cast(measurement_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
      cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      count(distinct p.person_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.measurement_source_concept_id in (903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120) and
      m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_measurement\`)
      and m.value_as_concept_id != 0
      group by concept_id, unit, gender)
      select id, analysis_id, concept_id as stratum_1, unit as stratum_2, gender as stratum_3, sum(count_value) as count_value,
      sum(source_count_value) as source_count_value from unit_counts
      group by id, analysis_id, concept_id, unit, gender"

      # Generating biological sex counts for measurement concepts for each unit
      echo "Inserting unit specific biological sex counts for each measurement concept"
      bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
      "insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
      (id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
      with unit_counts as
      (select 0 as id, 1910 as analysis_id,cast(observation_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
      on co2.person_id=p1.person_id
      where co2.observation_source_concept_id=m.observation_concept_id
      and (co2.unit_concept_id=um.unit_concept_id or lower(co2.unit_source_value)=lower(unit_source_value)) and p1.gender_concept_id=p.gender_concept_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.observation_concept_id in (903120)
      and (m.value_as_number is not null)
      group by m.observation_concept_id,um.unit_concept_id,p.gender_concept_id
      union all
      select 0 as id, 1910 as analysis_id,cast(observation_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      (select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
      on co2.person_id=p1.person_id
      where co2.observation_source_concept_id=m.observation_concept_id
      and m.value_as_concept_id=co2.value_as_concept_id and p1.gender_concept_id=p.gender_concept_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on um.unit_concept_id=0
      where m.observation_concept_id in (903120)
      and m.value_as_concept_id != 0
      group by m.observation_concept_id,m.value_as_concept_id,um.unit_concept_id,p.gender_concept_id
      union all
      select 0 as id, 1910 as analysis_id,cast(observation_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
      cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      count(distinct p.person_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.observation_source_concept_id in (903120) and
      m.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
      and (m.value_as_number is not null)
      group by concept_id, unit, gender
      union all
      select 0 as id, 1910 as analysis_id,cast(observation_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
      cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
      count(distinct p.person_id) as source_count_value
      from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
      join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
      where m.observation_source_concept_id in (903120) and
      m.observation_source_concept_id not in (select distinct observation_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_full_observation\`)
      and m.value_as_concept_id != 0
      group by concept_id, unit, gender)
      select id, analysis_id, concept_id as stratum_1, unit as stratum_2, gender as stratum_3, sum(count_value) as count_value,
      sum(source_count_value) as source_count_value from unit_counts
      group by id, analysis_id, concept_id, unit, gender"
fi

# 1815 Measurement response by gender distribution
echo "Getting measurement response by gender distribution"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,count_value,min_value,max_value,avg_value,stdev_value,median_value,p10_value,p25_value,p75_value,p90_value)
with rawdata_1815 as
(select measurement_concept_id as subject_id, cast(unit_concept_id as string) as unit, p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_concept_id > 0 and unit_concept_id > 0
union all
select measurement_source_concept_id as subject_id, cast(unit_concept_id as string) as unit,p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_source_concept_id > 0 and
m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and unit_concept_id > 0
union all
select measurement_concept_id as subject_id, cast(um.unit_concept_id as string) as unit, p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
where m.value_as_number is not null and m.measurement_concept_id > 0 and (m.unit_concept_id <= 0 or m.unit_concept_id is null) and m.unit_source_value is not null
union all
select measurement_source_concept_id as subject_id, cast(um.unit_concept_id as string) as unit,p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
where m.value_as_number is not null and m.measurement_source_concept_id > 0 and
m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and (m.unit_concept_id <= 0 or m.unit_concept_id is null) and m.unit_source_value is not null
union all
select measurement_concept_id as subject_id, cast('0' as string), p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_concept_id > 0 and ((m.unit_concept_id <= 0 or m.unit_concept_id is null) and (m.unit_source_value is null or m.unit_source_value = ' ' or length(m.unit_source_value)=0))
union all
select measurement_source_concept_id as subject_id, cast('0' as string),p.gender_concept_id as gender,
cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_source_concept_id > 0
and m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and ((m.unit_concept_id <= 0 or m.unit_concept_id is null) and (m.unit_source_value is null or m.unit_source_value = ' ' or length(m.unit_source_value)=0))),
overallstats as
(select subject_id as stratum1_id, unit as stratum2_id, gender as stratum3_id, cast(avg(1.0 * count_value) as float64) as avg_value,
cast(stddev(count_value) as float64) as stdev_value, min(count_value) as min_value, max(count_value) as max_value,
count(*) as total from rawdata_1815 group by 1,2,3
),
statsview as
(select subject_id as stratum1_id, unit as stratum2_id, gender as stratum3_id,
count_value as count_value, count(*) as total, row_number() over
(partition by subject_id,unit,gender order by count_value) as rn from rawdata_1815 group by 1,2,3,4
),
priorstats as
(select  s.stratum1_id as stratum1_id, s.stratum2_id as stratum2_id, s.stratum3_id as stratum3_id, s.count_value as count_value, s.total as total, sum(p.total) as accumulated from  statsview s
join statsview p on s.stratum1_id = p.stratum1_id and s.stratum2_id = p.stratum2_id and s.stratum3_id = p.stratum3_id
and p.rn <= s.rn
group by s.stratum1_id, s.stratum2_id, s.stratum3_id, s.count_value, s.total, s.rn
)
select 0 as id, 1815 as analysis_id, CAST(o.stratum1_id  AS STRING) as stratum1_id, CAST(o.stratum2_id  AS STRING) as stratum2_id,CAST(o.stratum3_id  AS STRING) as stratum3_id,
cast(o.total as int64) as count_value, round(o.min_value,2) as min_value, round(o.max_value,2) as max_value, round(o.avg_value,2) as avg_value,
round(o.stdev_value,2) as stdev_value,
min(case when p.accumulated >= .50 * o.total then count_value else round(o.max_value,2) end) as median_value,
min(case when p.accumulated >= .10 * o.total then count_value else round(o.max_value,2) end) as p10_value,
min(case when p.accumulated >= .25 * o.total then count_value else round(o.max_value,2) end) as p25_value,
min(case when p.accumulated >= .75 * o.total then count_value else round(o.max_value,2) end) as p75_value,
min(case when p.accumulated >= .90 * o.total then count_value else round(o.max_value,2) end) as p90_value
FROM  priorstats p
join overallstats o on p.stratum1_id = o.stratum1_id and p.stratum2_id = o.stratum2_id and p.stratum3_id = o.stratum3_id
group by o.stratum1_id, o.stratum2_id, o.stratum3_id, o.total, o.min_value, o.max_value, o.avg_value, o.stdev_value"

# 1814 Measurement response distribution
echo "Getting measurement response distribution"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
(id,analysis_id,stratum_1,stratum_2,count_value,min_value,max_value,avg_value,stdev_value,median_value,p10_value,p25_value,p75_value,p90_value)
with rawdata_1814 as
(select measurement_concept_id as subject_id, cast(unit_concept_id as string) as unit,cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_concept_id > 0 and unit_concept_id != 0
union all
select measurement_source_concept_id as subject_id, cast(unit_concept_id as string) as unit,cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_source_concept_id > 0
and m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and unit_concept_id != 0
union all
select measurement_concept_id as subject_id, cast(um.unit_concept_id as string) as unit,cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
where m.value_as_number is not null and m.measurement_concept_id > 0 and (m.unit_concept_id = 0 or m.unit_concept_id is null) and m.unit_source_value is not null
union all
select measurement_source_concept_id as subject_id, cast(um.unit_concept_id as string) as unit,cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on lower(m.unit_source_value)=lower(um.unit_source_value)
where m.value_as_number is not null and m.measurement_source_concept_id > 0
and m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and (m.unit_concept_id = 0 or m.unit_concept_id is null) and m.unit_source_value is not null
union all
select measurement_concept_id as subject_id, cast('0' as string),cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_concept_id > 0 and (m.unit_concept_id = 0 or m.unit_concept_id is null) and (m.unit_source_value is null or length(m.unit_source_value)=0)
union all
select measurement_source_concept_id as subject_id, cast('0' as string),cast(value_as_number as float64) as count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
where m.value_as_number is not null and m.measurement_source_concept_id > 0
and m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and (m.unit_concept_id = 0 or m.unit_concept_id is null) and (m.unit_source_value is null or length(m.unit_source_value)=0)
),
overallstats as
(select subject_id as stratum1_id, unit as stratum2_id, cast(avg(1.0 * count_value) as float64) as avg_value,
cast(stddev(count_value) as float64) as stdev_value, min(count_value) as min_value, max(count_value) as max_value,
count(*) as total from rawdata_1814 group by 1,2
),
statsview as
(select subject_id as stratum1_id,unit as stratum2_id,
count_value as count_value, count(*) as total, row_number() over
(partition by subject_id,unit order by count_value) as rn from rawdata_1814 group by 1,2,3
),
priorstats as
(select  s.stratum1_id as stratum1_id, s.stratum2_id as stratum2_id, s.count_value as count_value, s.total as total, sum(p.total) as accumulated from  statsview s
join statsview p on s.stratum1_id = p.stratum1_id and s.stratum2_id = p.stratum2_id
and p.rn <= s.rn
group by  s.stratum1_id, s.stratum2_id, s.count_value, s.total, s.rn
)
select 0 as id, 1814 as analysis_id, CAST(o.stratum1_id  AS STRING) as stratum1_id,CAST(o.stratum2_id  AS STRING) as stratum2_id,
cast(o.total as int64) as count_value, round(o.min_value,2) as min_value, round(o.max_value,2) as max_value, round(o.avg_value,2) as avg_value,
round(o.stdev_value,2) as stdev_value,
min(case when p.accumulated >= .50 * o.total then count_value else round(o.max_value,2) end) as median_value,
min(case when p.accumulated >= .10 * o.total then count_value else round(o.max_value,2) end) as p10_value,
min(case when p.accumulated >= .25 * o.total then count_value else round(o.max_value,2) end) as p25_value,
min(case when p.accumulated >= .75 * o.total then count_value else round(o.max_value,2) end) as p75_value,
min(case when p.accumulated >= .90 * o.total then count_value else round(o.max_value,2) end) as p90_value
FROM  priorstats p
join overallstats o on p.stratum1_id = o.stratum1_id and p.stratum2_id = o.stratum2_id
group by o.stratum1_id, o.stratum2_id, o.total, o.min_value, o.max_value, o.avg_value, o.stdev_value"

# Update iqr_min and iqr_max in distributions for debugging purposes
echo "updating iqr_min and iqr_max"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = cast(ROUND((case when (p25_value - 1.5*(p75_value-p25_value)) > min_value then (p25_value - 1.5*(p75_value-p25_value)) else min_value end),2) as string),
stratum_5 = cast(ROUND((case when (p75_value + 1.5*(p75_value-p25_value)) < max_value then (p75_value + 1.5*(p75_value-p25_value)) else max_value end),2) as string)
where analysis_id in (1815)"

# Update iqr_min and iqr_max in distributions for debugging purposes
echo "updating iqr_min and iqr_max"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = cast(ROUND(p10_value,2) as string),
stratum_5 = cast(ROUND(p90_value,2) as string)
where analysis_id in (1815)
and stratum_4=stratum_5"

# Update iqr_min and iqr_max in case both of them are 0
echo "updating iqr_min and iqr_max"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = cast(ROUND(min_value,2) as string),
stratum_5 = cast(ROUND(max_value,2) as string) where analysis_id in (1815) and stratum_4='0' and stratum_5='0'
and (min_value != 0 or max_value != 0)"

echo "Rounding the bin values to multiples of 10"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = cast(cast(FLOOR(cast(stratum_4 as float64) / 10) * 10 as int64) as string)
where cast(stratum_4 as float64) >= 10 and analysis_id = 1815"

echo "Rounding the bin values to multiples of 10"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_5 = cast(cast(CEIL(cast(stratum_5 as float64) / 10) * 10 as int64) as string)
where cast(stratum_5 as float64) >= 10 and analysis_id = 1815"

echo "Rounding bin values to one decimal"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = CAST(ROUND(safe_cast(stratum_4 as float64),1) as string)
where safe_cast(stratum_4 as int64) is null"

echo "Rounding bin values to one decimal"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_5 = CAST(ROUND(safe_cast(stratum_5 as float64),1) as string)
where safe_cast(stratum_5 as int64) is null"

echo "Rounding bin values to one decimal"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_4 = CAST(ROUND(cast(stratum_4 as float64)) as string)
where safe_cast(stratum_4 as int64) is null
and cast(stratum_4 as float64) > 1"

echo "Rounding bin values to one decimal"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_5 = CAST(ROUND(cast(stratum_5 as float64)) as string)
where safe_cast(stratum_5 as int64) is null
and cast(stratum_5 as float64) > 1"


echo "Make the min range of all the biological sexes same"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
set a.stratum_4= cast(res.min_iqr_min as string)
from  (select stratum_1, stratum_2, min(cast(r.stratum_4 as float64)) as min_iqr_min from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` r
where r.analysis_id=1815 group by stratum_1, stratum_2) as res
where a.stratum_1 = res.stratum_1 and a.stratum_2=res.stratum_2"

echo "Make the max range of all the biological sexes same"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
set a.stratum_5= cast(res.min_iqr_max as string)
from  (select stratum_1, stratum_2, max(cast(r.stratum_5 as float64)) as min_iqr_max from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` r
where r.analysis_id=1815 group by stratum_1, stratum_2) as res
where a.stratum_1 = res.stratum_1 and a.stratum_2=res.stratum_2"

echo "Update the bin_width in achilles_results_dist"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
set a.stratum_6 =
cast(case
when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 5
then ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as int64)/5)*5
when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 0.1 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 1
then ROUND(CEIL(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/0.1)*0.1,1)
when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 1 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 2
then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/2)*2,1)
when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 2 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 3
then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/3)*3,1)
when ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) >= 3 AND ((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) <= 5
then ROUND(ROUND(cast(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11) as float64)/5)*5,1)
else ROUND(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11),1) end as string)
where analysis_id=1815"

echo "Update the bin_width in achilles_results_dist"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"Update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` a
set a.stratum_6 = cast(ROUND(((cast(stratum_5 as float64)-cast(stratum_4 as float64))/11),2) as string)
where analysis_id=1815 and stratum_6='0' "

# 1900 Measurement numeric value counts (This query generates counts, source counts of the binned value and gender combination. It gets bin size from joining the achilles_results)
# We do net yet generate the binned source counts of standard concepts
# This query only generates counts of measurements that have unit_concept_id 0 and unit_source_value (being considered) by joining on the manual made unit_map table
echo "Getting measurements binned gender value counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id,analysis_id,stratum_1,stratum_2,stratum_3,stratum_4,stratum_6,count_value,source_count_value)
with measurement_data as
(
select * from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`
),
measurement_quartile_data as
(
select cast(stratum_1 as int64) as concept,stratum_2 as unit,cast(stratum_3 as int64)as gender,cast(stratum_4 as float64) as iqr_min,cast(stratum_5 as float64) as iqr_max,
cast(stratum_6 as float64) as bin_width,
min_value,max_value,p10_value,p25_value,p75_value,p90_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` where analysis_id=1815
),
measurement_bucket_data as
   (
   select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,
   CASE when bin_width != 0 then CAST(CEIL((iqr_max-iqr_min)/bin_width) as int64)+1 else 1 end as num_buckets
   from measurement_quartile_data
   ),
   measurement_quartile_data_2 as
   (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,iqr_min +
   (num_buckets - 1)*bin_width as updated_iqr_max,
   LENGTH(REGEXP_EXTRACT(CAST(bin_width as string), r'.(.*)')) AS decimal_places
   from measurement_bucket_data),
   measurement_quartile_bucket_decimal_data as
   (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,
   updated_iqr_max, case when decimal_places > 1 then decimal_places-1 else 0 end as num_decimals
   from measurement_quartile_data_2),
   measurement_quartile_bucket_decimal_data_calc as
   (select concept, unit, gender, iqr_min, iqr_max, min_value, max_value, p10_value, p25_value, p75_value, p90_value, bin_width,num_buckets,
   ROUND(updated_iqr_max, num_decimals) as calc_iqr_max
   from measurement_quartile_bucket_decimal_data)
   select 0 as id,1900 as analysis_id,
CAST(m1.measurement_concept_id AS STRING) as stratum_1,
unit as stratum_2,
CAST(p1.gender_concept_id AS STRING) as stratum_3,
    case when bin_width != 0 then
   (case when iqr_min != iqr_max then
   (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
      (case when m1.value_as_number < iqr_min then CONCAT('< ' , cast(round(iqr_min,2) as string))
            when m1.value_as_number >= calc_iqr_max then CONCAT('>= ' , cast(round(calc_iqr_max,2) as string))
            when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
            then CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_min+bin_width,2) as string))
            when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+2*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+bin_width,2) as string), ' - ', cast(round(iqr_min+2*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+3*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+2*bin_width,2) as string), ' - ', cast(round(iqr_min+3*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+4*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+3*bin_width,2) as string), ' - ', cast(round(iqr_min+4*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+5*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+4*bin_width,2) as string), ' - ', cast(round(iqr_min+5*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+6*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+5*bin_width,2) as string), ' - ', cast(round(iqr_min+6*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+7*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+6*bin_width,2) as string), ' - ', cast(round(iqr_min+7*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+8*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+7*bin_width,2) as string), ' - ', cast(round(iqr_min+8*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+9*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+8*bin_width,2) as string), ' - ', cast(round(iqr_min+9*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+10*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+9*bin_width,2) as string), ' - ', cast(round(iqr_min+10*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+11*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+10*bin_width,2) as string), ' - ', cast(round(iqr_min+11*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+12*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+11*bin_width,2) as string), ' - ', cast(round(iqr_min+12*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+13*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+12*bin_width,2) as string), ' - ', cast(round(iqr_min+13*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+14*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+13*bin_width,2) as string), ' - ', cast(round(iqr_min+14*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+15*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+14*bin_width,2) as string), ' - ', cast(round(iqr_min+15*bin_width,2) as string))
            when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+16*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+15*bin_width,2) as string), ' - ', cast(round(iqr_min+16*bin_width,2) as string))
            else cast(value_as_number as string)
           end)
        else
        (case when m1.value_as_number < iqr_min then cast(round(iqr_min,2) as string)
            when m1.value_as_number >= calc_iqr_max then cast(round(calc_iqr_max,2) as string)
            when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
            then cast(round(iqr_min+bin_width,2) as string)
            when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+2*bin_width <= calc_iqr_max then cast(round(iqr_min+2*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+3*bin_width <= calc_iqr_max then cast(round(iqr_min+3*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+4*bin_width <= calc_iqr_max then cast(round(iqr_min+4*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+5*bin_width <= calc_iqr_max then cast(round(iqr_min+5*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+6*bin_width <= calc_iqr_max then cast(round(iqr_min+6*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+7*bin_width <= calc_iqr_max then cast(round(iqr_min+7*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+8*bin_width <= calc_iqr_max then cast(round(iqr_min+8*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+9*bin_width <= calc_iqr_max then cast(round(iqr_min+9*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+10*bin_width <= calc_iqr_max then cast(round(iqr_min+10*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+11*bin_width <= calc_iqr_max then cast(round(iqr_min+11*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+12*bin_width <= calc_iqr_max then cast(round(iqr_min+12*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+13*bin_width <= calc_iqr_max then cast(round(iqr_min+13*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+14*bin_width <= calc_iqr_max then cast(round(iqr_min+14*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+15*bin_width <= calc_iqr_max then cast(round(iqr_min+15*bin_width,2) as string)
            when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
            and iqr_min+16*bin_width <= calc_iqr_max then cast(round(iqr_min+16*bin_width,2) as string)
            else cast(value_as_number as string)
           end) end)
         when p10_value != p90_value then
(case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
    (case when m1.value_as_number < p10_value then CONCAT('< ' , cast(round(p10_value,2) as string))
         when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value,2) as string), ' - ', cast(round(p10_value+((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then CONCAT(cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string))
         when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string))
         else CONCAT('< ' , cast(round(p90_value,2) as string))
         end)
else
(case when m1.value_as_number < p10_value then cast(round(p10_value,2) as string)
         when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string)
         when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
         then cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string)
         else cast(round(p90_value,2) as string)
         end) end)
   else cast(m1.value_as_number as string)
        end)
   else  CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_max,2) as string)) end as stratum_4,
        cast((case when iqr_min != iqr_max then bin_width when p10_value != p90_value then  ((p90_value-p10_value)/11) else bin_width end) as string) as stratum_6,
count(distinct p1.person_id) as count_value,
count(distinct p1.person_id) as source_count_value
from measurement_data m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
join measurement_quartile_bucket_decimal_data_calc on m1.measurement_concept_id=concept
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_concept_id=c1.concept_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on
case when (m1.unit_concept_id > 0 and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then m1.unit_concept_id = um.unit_concept_id
             when ((m1.unit_concept_id = 0 or m1.unit_concept_id is null) and (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then lower(m1.unit_source_value) = lower(um.unit_source_value)
             when (m1.unit_concept_id is null and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then um.unit_concept_id=0
             else m1.unit_concept_id = um.unit_concept_id end
where m1.measurement_concept_id > 0
and m1.value_as_number is not null and p1.gender_concept_id=gender and cast(um.unit_concept_id as string)=unit
group by stratum_1, stratum_2, stratum_3, stratum_4, stratum_6
union all
select 0 as id, 1900 as analysis_id,
CAST(m1.measurement_source_concept_id AS STRING) as stratum_1,
unit as stratum_2,
CAST(p1.gender_concept_id AS STRING) as stratum_3,
    case when bin_width != 0 then
   (case when iqr_min != iqr_max then
   (case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
                  (case when m1.value_as_number < iqr_min then CONCAT('< ' , cast(round(iqr_min,2) as string))
                        when m1.value_as_number >= calc_iqr_max then CONCAT('>= ' , cast(round(calc_iqr_max,2) as string))
                        when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                        then CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_min+bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+2*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+bin_width,2) as string), ' - ', cast(round(iqr_min+2*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+3*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+2*bin_width,2) as string), ' - ', cast(round(iqr_min+3*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+4*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+3*bin_width,2) as string), ' - ', cast(round(iqr_min+4*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+5*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+4*bin_width,2) as string), ' - ', cast(round(iqr_min+5*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+6*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+5*bin_width,2) as string), ' - ', cast(round(iqr_min+6*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+7*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+6*bin_width,2) as string), ' - ', cast(round(iqr_min+7*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+8*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+7*bin_width,2) as string), ' - ', cast(round(iqr_min+8*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+9*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+8*bin_width,2) as string), ' - ', cast(round(iqr_min+9*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+10*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+9*bin_width,2) as string), ' - ', cast(round(iqr_min+10*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+11*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+10*bin_width,2) as string), ' - ', cast(round(iqr_min+11*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+12*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+11*bin_width,2) as string), ' - ', cast(round(iqr_min+12*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+13*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+12*bin_width,2) as string), ' - ', cast(round(iqr_min+13*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+14*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+13*bin_width,2) as string), ' - ', cast(round(iqr_min+14*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+15*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+14*bin_width,2) as string), ' - ', cast(round(iqr_min+15*bin_width,2) as string))
                        when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+16*bin_width <= calc_iqr_max then CONCAT(cast(round(iqr_min+15*bin_width,2) as string), ' - ', cast(round(iqr_min+16*bin_width,2) as string))
                        else cast(value_as_number as string)
                       end)
                    else
                    (case when m1.value_as_number < iqr_min then cast(round(iqr_min,2) as string)
                        when m1.value_as_number >= calc_iqr_max then cast(round(calc_iqr_max,2) as string)
                        when (m1.value_as_number between iqr_min and iqr_min+bin_width) and m1.value_as_number < iqr_max
                        then cast(round(iqr_min+bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+bin_width and iqr_min+2*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+2*bin_width <= calc_iqr_max then cast(round(iqr_min+2*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+2*bin_width and iqr_min+3*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+3*bin_width <= calc_iqr_max then cast(round(iqr_min+3*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+3*bin_width and iqr_min+4*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+4*bin_width <= calc_iqr_max then cast(round(iqr_min+4*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+4*bin_width and iqr_min+5*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+5*bin_width <= calc_iqr_max then cast(round(iqr_min+5*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+5*bin_width and iqr_min+6*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+6*bin_width <= calc_iqr_max then cast(round(iqr_min+6*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+6*bin_width and iqr_min+7*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+7*bin_width <= calc_iqr_max then cast(round(iqr_min+7*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+7*bin_width and iqr_min+8*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+8*bin_width <= calc_iqr_max then cast(round(iqr_min+8*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+8*bin_width and iqr_min+9*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+9*bin_width <= calc_iqr_max then cast(round(iqr_min+9*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+9*bin_width and iqr_min+10*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+10*bin_width <= calc_iqr_max then cast(round(iqr_min+10*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+10*bin_width and iqr_min+11*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+11*bin_width <= calc_iqr_max then cast(round(iqr_min+11*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+11*bin_width and iqr_min+12*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+12*bin_width <= calc_iqr_max then cast(round(iqr_min+12*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+12*bin_width and iqr_min+13*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+13*bin_width <= calc_iqr_max then cast(round(iqr_min+13*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+13*bin_width and iqr_min+14*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+14*bin_width <= calc_iqr_max then cast(round(iqr_min+14*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+14*bin_width and iqr_min+15*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+15*bin_width <= calc_iqr_max then cast(round(iqr_min+15*bin_width,2) as string)
                        when (m1.value_as_number between iqr_min+15*bin_width and iqr_min+16*bin_width) and m1.value_as_number < calc_iqr_max
                        and iqr_min+16*bin_width <= calc_iqr_max then cast(round(iqr_min+16*bin_width,2) as string)
                        else cast(value_as_number as string)
                       end) end)
when p10_value != p90_value then
(case when (m1.unit_concept_id > 0 or (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then
(case when m1.value_as_number < p10_value then CONCAT('< ' , cast(round(p10_value,2) as string))
when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value,2) as string), ' - ', cast(round(p10_value+((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then CONCAT(cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string))
when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value then CONCAT(cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string), ' - ', cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string))
else CONCAT('< ' , cast(round(p90_value,2) as string))
end)
else
(case when m1.value_as_number < p10_value then cast(round(p10_value,2) as string)
when (m1.value_as_number between p10_value and p10_value+((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+((p90_value-p10_value)/11) and p10_value+2*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+2*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+2*((p90_value-p10_value)/11) and p10_value+3*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+3*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+3*((p90_value-p10_value)/11) and p10_value+4*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+4*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+4*((p90_value-p10_value)/11) and p10_value+5*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+5*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+5*((p90_value-p10_value)/11) and p10_value+6*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+6*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+6*((p90_value-p10_value)/11) and p10_value+7*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+7*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+7*((p90_value-p10_value)/11) and p10_value+8*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+8*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+8*((p90_value-p10_value)/11) and p10_value+9*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+9*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+9*((p90_value-p10_value)/11) and p10_value+10*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+10*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+10*((p90_value-p10_value)/11) and p10_value+11*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+11*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+11*((p90_value-p10_value)/11) and p10_value+12*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+12*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+12*((p90_value-p10_value)/11) and p10_value+13*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+13*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+13*((p90_value-p10_value)/11) and p10_value+14*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+14*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+14*((p90_value-p10_value)/11) and p10_value+15*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+15*((p90_value-p10_value)/11),2) as string)
when (m1.value_as_number between p10_value+15*((p90_value-p10_value)/11) and p10_value+16*((p90_value-p10_value)/11)) and m1.value_as_number <  p90_value
then cast(round(p10_value+16*((p90_value-p10_value)/11),2) as string)
else cast(round(p90_value,2) as string)
end) end)
else cast(m1.value_as_number as string)
end)
else  CONCAT(cast(round(iqr_min,2) as string), ' - ', cast(round(iqr_max,2) as string)) end as stratum_4,
cast((case when iqr_min != iqr_max then bin_width when p10_value != p90_value then  ((p90_value-p10_value)/11) else bin_width end) as string) as stratum_6,
COUNT(distinct p1.PERSON_ID) as count_value, COUNT(distinct p1.PERSON_ID) as source_count_value
from measurement_data m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
join measurement_quartile_bucket_decimal_data_calc on m1.measurement_source_concept_id=concept
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on
case when (m1.unit_concept_id > 0 and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then m1.unit_concept_id = um.unit_concept_id
             when ((m1.unit_concept_id = 0 or m1.unit_concept_id is null) and (m1.unit_source_value is not null and length(m1.unit_source_value) > 0)) then lower(m1.unit_source_value) = lower(um.unit_source_value)
             when (m1.unit_concept_id is null and (m1.unit_source_value is null or length(m1.unit_source_value)=0)) then um.unit_concept_id=0
             else m1.unit_concept_id = um.unit_concept_id end
join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_source_concept_id=c1.concept_id
where m1.measurement_source_concept_id > 0
and m1.measurement_source_concept_id not in (select distinct measurement_concept_id from measurement_data)
and m1.value_as_number is not null and p1.gender_concept_id=gender and cast(um.unit_concept_id as string)=unit
group by stratum_1, stratum_2, stratum_3, stratum_4,stratum_6"

# 1900 Measurement string value counts (This query generates counts, source counts of the value and gender combination. It gets bin size from joining the achilles_results)
# We do not yet generate the source counts of standard concepts
# This query generates counts of measurements that do not have unit at all
echo "Getting measurements unbinned gender value counts"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
 (id, analysis_id, stratum_1,stratum_2,stratum_3,stratum_4,stratum_5,count_value,source_count_value)
 SELECT 0,1900 as analysis_id,
 cast(m1.measurement_concept_id as string) as stratum_1,'0' as stratum_2,
 CAST(p1.gender_concept_id AS STRING) as stratum_3,
 c2.concept_name as stratum_4,
 cast(m1.value_as_concept_id as string) as stratum_5,
 count(distinct p1.person_id) as count_value,
 count(distinct p1.person_id) as source_count_value
 FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m1 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_concept_id=c1.concept_id
 where m1.value_as_concept_id != 0
 and m1.measurement_concept_id > 0
 group by stratum_1,stratum_3,stratum_4,stratum_5
 union all
 SELECT 0,1900 as analysis_id,
 cast(m1.measurement_source_concept_id as string) as stratum_1,'0' as stratum_2,
 CAST(p1.gender_concept_id AS STRING) as stratum_3,
 c2.concept_name as stratum_4,
 cast(m1.value_as_concept_id as string) as stratum_5,
 count(distinct p1.person_id) as count_value,
 count(distinct p1.person_id) as source_count_value
 FROM \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m1
 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1 on p1.person_id = m1.person_id
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c2 on c2.concept_id=m1.value_as_concept_id
 join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` c1 on m1.measurement_source_concept_id=c1.concept_id
 where m1.value_as_concept_id != 0
 and m1.measurement_source_concept_id > 0 and m1.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
 group by stratum_1,stratum_3,stratum_4,stratum_5"

# Generating biological sex counts for measurement concepts for each unit
echo "Inserting unit specific biological sex counts for each measurement concept"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, count_value, source_count_value)
with unit_counts as
(select 0 as id, 1910 as analysis_id,cast(measurement_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
(select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
on co2.person_id=p1.person_id
where co2.measurement_source_concept_id=m.measurement_concept_id
and (co2.unit_concept_id=um.unit_concept_id or lower(co2.unit_source_value)=lower(unit_source_value)) and p1.gender_concept_id=p.gender_concept_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
where m.measurement_concept_id > 0 and (m.value_as_number is not null)
group by m.measurement_concept_id,um.unit_concept_id,p.gender_concept_id
union all
select 0 as id, 1910 as analysis_id,cast(measurement_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit, cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
(select COUNT(distinct co2.person_id) from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` co2 join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p1
on co2.person_id=p1.person_id
where co2.measurement_source_concept_id=m.measurement_concept_id
and m.value_as_concept_id=co2.value_as_concept_id and p1.gender_concept_id=p.gender_concept_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on um.unit_concept_id=0
where m.measurement_concept_id > 0 and m.value_as_concept_id != 0
group by m.measurement_concept_id,m.value_as_concept_id,um.unit_concept_id,p.gender_concept_id
union all
select 0 as id, 1910 as analysis_id,cast(measurement_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
count(distinct p.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
where m.measurement_source_concept_id > 0 and
m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and (m.value_as_number is not null)
group by concept_id, unit, gender
union all
select 0 as id, 1910 as analysis_id,cast(measurement_source_concept_id as string) as concept_id, cast(um.unit_concept_id as string) as unit,
cast(p.gender_concept_id as string) as gender,count(distinct p.person_id) as count_value,
count(distinct p.person_id) as source_count_value
from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id=m.person_id
join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.unit_map\` um on (m.unit_concept_id = um.unit_concept_id or lower(m.unit_source_value)=lower(um.unit_source_value))
where m.measurement_source_concept_id > 0 and
m.measurement_source_concept_id not in (select distinct measurement_concept_id from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\`)
and m.value_as_concept_id != 0
group by concept_id, unit, gender)
select id, analysis_id, concept_id as stratum_1, unit as stratum_2, gender as stratum_3, sum(count_value) as count_value,
sum(source_count_value) as source_count_value from unit_counts
group by id, analysis_id, concept_id, unit, gender"


# Set the counts > 0 and < 20 to 20
echo "Binning counts < 20"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
set count_value = 20, source_count_value = 20 where analysis_id in (1900) and ((count_value>0 and count_value<20) or (source_count_value>0 and source_count_value<20))"

# Set concept name in place of concept id for units
echo "Replacing unit concept id with unit concept name"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\`
set stratum_2 = (select distinct concept_name from \`${BQ_PROJECT}.${BQ_DATASET}.concept\` where cast(concept_id as string)=stratum_2)
where analysis_id in (1815,1814) and stratum_2 is not null and stratum_2 != '' "

# Set concept name in place of concept id for units
echo "Replacing unit concept id with unit concept name"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
set stratum_2 = (select distinct concept_name from \`${BQ_PROJECT}.${BQ_DATASET}.concept\` where cast(concept_id as string)=stratum_2)
where analysis_id in (1900,1910) and stratum_2 is not null and stratum_2 != '' "

# Update no unit concept name in achilles_results_dist(For nice display)
echo "Replacing no matching concept unit name to no unit"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results_dist\` set stratum_2 = 'No unit'
where stratum_2 = 'No matching concept'"

# Update no unit concept name in achilles_results(For nice display)
echo "Replacing no matching concept unit name to no unit"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` set stratum_2 = 'No unit'
where stratum_2 = 'No matching concept'"

# Update no unit concept name in achilles_results(For nice display)
echo "Replacing no matching concept unit name to no unit"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"update \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` set stratum_2 = 'No unit'
where (stratum_2 = '' or stratum_2 is null) and analysis_id=1910"

echo "Filling measurement concept info table"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.measurement_concept_info\`
(concept_id, has_values, measurement_type)
with
distinct_3000_measurement_concepts as
(select distinct cast(stratum_1 as int64) as concept from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` where stratum_3='Measurement' and analysis_id=3000),
distinct_1900_measurement_concepts as
(select distinct cast(stratum_1 as int64) as concept from \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\` where analysis_id=1900),
no_1900_measurement_concepts as
(select a.* from distinct_3000_measurement_concepts a join \`${BQ_PROJECT}.${BQ_DATASET}.concept\` b on a.concept=b.concept_id
where concept not in (select distinct concept from distinct_1900_measurement_concepts)),
measurement_value_number_counts as
(select a.concept as concept, count(distinct m.value_as_number) as value_number_count from no_1900_measurement_concepts a join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m on
a.concept=m.measurement_concept_id or a.concept=m.measurement_source_concept_id
where m.value_as_number is not null
group by a.concept),
measurement_value_concept_counts as
(select a.concept as concept, count(distinct m.value_as_concept_id) as value_concept_count from no_1900_measurement_concepts a join \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.v_ehr_measurement\` m on
a.concept=m.measurement_concept_id or a.concept=m.measurement_source_concept_id
where m.value_as_concept_id > 0
group by a.concept),
no_values as
(select concept, 0 as has_values, 'ORDER' as measurement_type from no_1900_measurement_concepts where concept not in
(select distinct concept from measurement_value_number_counts)
and concept not in (select distinct concept from measurement_value_concept_counts)),
yes_values_1 as
(select concept, 1 as has_values, 'TEST' as measurement_type from no_1900_measurement_concepts where concept in
(select distinct concept from measurement_value_number_counts)
or concept in (select distinct concept from measurement_value_concept_counts)),
yes_values_2 as
(select concept, 1 as has_values, 'TEST' as measurement_type from distinct_1900_measurement_concepts)
select * from no_values
union distinct
select * from yes_values_1
union distinct
select * from yes_values_2"

echo "Generating any fitbit data counts with location information"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.activity_summary\`
    UNION ALL
    SELECT person_id, date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_summary\`
    UNION ALL
    SELECT person_id, datetime AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_intraday\`
    UNION ALL
    SELECT person_id, datetime AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.steps_intraday\`
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level\`
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Any Fitbit Data' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' AS stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Any Fitbit Data' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' AS stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Any Fitbit Data' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' AS stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4
-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Any Fitbit Data' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6
-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Any Fitbit Data' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' AS stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating any fitbit data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_summary\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Heart Rate (Summary)' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Heart Rate (Summary)' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Heart Rate (Summary)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4
-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Heart Rate (Summary)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6
-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Heart Rate (Summary)' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating any fitbit data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, datetime AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.heart_rate_intraday\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Heart rate (minute-level)' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Heart rate (minute-level)' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Heart rate (minute-level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4
-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Heart rate (minute-level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6
-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Heart rate (minute-level)' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating any fitbit data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, datetime AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.steps_intraday\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Activity intraday steps (minute-level)' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Activity intraday steps (minute-level)' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Activity intraday steps (minute-level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4

-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Activity intraday steps (minute-level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6

-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Activity intraday steps (minute-level)' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating any fitbit data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.activity_summary\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Activity daily summary' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Activity daily summary' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Activity daily summary' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4

-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Activity daily summary' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6

-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Activity daily summary' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating sleep daily summary data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Sleep Daily Summary' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Sleep Daily Summary' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Sleep Daily Summary' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4

-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Sleep Daily Summary' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6

-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Sleep Daily Summary' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"

echo "Generating sleep level (sequence by level) data counts with location"
bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
"INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
(id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
WITH all_fitbit_data AS (
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level\`
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
min_dates AS (
    SELECT DISTINCT a.person_id, MIN(data_date) AS join_date
    FROM all_fitbit_data a
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON a.person_id = p.person_id
    GROUP BY 1
),
m_age AS (
    SELECT co.person_id,
    IF(EXTRACT(DAYOFYEAR FROM join_date) < EXTRACT(DAYOFYEAR FROM birth_datetime),
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR) - 1,
      DATE_DIFF(join_date, CAST(birth_datetime AS DATE), YEAR)) AS age
    FROM min_dates co
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON p.person_id = co.person_id
),
m_age_stratum AS (
    SELECT *,
    CASE
        WHEN age >= 18 AND age <= 29 THEN '2'
        WHEN age > 89 THEN '9'
        WHEN age >= 30 AND age <= 89 THEN CAST(FLOOR(age / 10) AS STRING)
        WHEN age < 18 THEN '0'
    END AS age_stratum
    FROM m_age
),
m_age_gender_stratum AS (
    SELECT m.person_id, m.age, m.age_stratum, p.gender_concept_id as gender,
    CONCAT(
            m.age_stratum,
            '-',
            CASE
                WHEN p.gender_concept_id = 8507 THEN 'M'
                WHEN p.gender_concept_id = 8532 THEN 'F'
                ELSE 'O'
            END
        ) AS age_gender_stratum
    FROM m_age_stratum m
    JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` p ON m.person_id = p.person_id
),
year_counts AS (
    SELECT EXTRACT(YEAR FROM join_date) AS join_year, COUNT(DISTINCT person_id) AS people_count
    FROM min_dates
    GROUP BY 1
    ORDER BY 1 ASC
),
year_rolling_counts AS (
    SELECT join_year, people_count,
    SUM(people_count) OVER (ORDER BY join_year) AS RunningTotal
    FROM year_counts
)

-- Fitbit data count by year with running total
SELECT
    0 AS id,
    3107 AS analysis_id,
    'Sleep Level (Sequence by level)' AS stratum_1,
    CAST(join_year AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    RunningTotal AS count_value,
    RunningTotal AS source_count_value
FROM year_rolling_counts

-- Fitbit data count by gender
UNION ALL
SELECT
    0 AS id,
    3101 AS analysis_id,
    'Sleep Level (Sequence by level)' AS stratum_1,
    CAST(gender_concept_id AS STRING) AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN \`${BQ_PROJECT}.${BQ_DATASET}.person\` b ON a.person_id = b.person_id
GROUP BY 4

-- Fitbit data count by age
UNION ALL
SELECT
    0 AS id,
    3102 AS analysis_id,
    'Sleep Level (Sequence by level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_stratum a
GROUP BY 4

-- Fitbit combined age gender chart data
UNION ALL
SELECT
    0 AS id,
    3105 AS analysis_id,
    'Sleep Level (Sequence by level)' AS stratum_1,
    age_stratum AS stratum_2,
    'Fitbit' AS stratum_3,
    cast(gender as string) as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM m_age_gender_stratum a
GROUP BY 4,6

-- Fitbit data count by location
UNION ALL
SELECT
    0 AS id,
    3108 AS analysis_id,
    'Sleep Level (Sequence by level)' AS stratum_1,
    location AS stratum_2,
    'Fitbit' AS stratum_3,
    '' as stratum_4,
    COUNT(DISTINCT a.person_id) AS count_value,
    COUNT(DISTINCT a.person_id) AS source_count_value
FROM min_dates a
JOIN state_information si ON a.person_id = si.person_id
GROUP BY 4;"
