#!/bin/bash

# Generates Fitbit tile counts.
#
# Per dataset it writes 5 analyses to achilles_results (stratum_3 = 'Fitbit'):
#   3107  participants by join year, running total
#   3101  participants by biological sex
#   3102  participants by age decile at first record
#   3105  participants by age decile + sex
#   3108  participants by location (PII state)
#
# "Any Fitbit Data" unions every source table; each per-dataset tile counts
# only its own table.

set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-cloudsql-cdr/generate-fitbit-counts.sh --bq-project <PROJECT> --bq-dataset <DATASET>"
USAGE="$USAGE --workbench-project <PROJECT> --workbench-dataset <DATASET>"

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

if [ -z "${BQ_PROJECT:-}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

if [ -z "${BQ_DATASET:-}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

if [ -z "${WORKBENCH_PROJECT:-}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

if [ -z "${WORKBENCH_DATASET:-}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi


################################################################################
# Any Fitbit Data - union of every Fitbit source table
################################################################################

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
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary_counts\`
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary_ext\`
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_daily_summary_30dayavg\`
    UNION ALL
    SELECT person_id, sleep_date AS data_date
    FROM \`${BQ_PROJECT}.${BQ_DATASET}.sleep_level_short\`
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

declare -a fitbit_tables fitbit_date_cols fitbit_labels

fitbit_tables=(
  heart_rate_summary
  heart_rate_intraday
  steps_intraday
  activity_summary
  sleep_daily_summary
  sleep_level
  sleep_daily_summary_counts
  sleep_daily_summary_ext
  sleep_daily_summary_30dayavg
  sleep_level_short
)

fitbit_date_cols=(
  date
  datetime
  datetime
  date
  sleep_date
  sleep_date
  sleep_date
  sleep_date
  sleep_date
  sleep_date
)

fitbit_labels=(
  "Heart Rate (Summary)"
  "Heart rate (minute-level)"
  "Activity intraday steps (minute-level)"
  "Activity daily summary"
  "Sleep Daily Summary"
  "Sleep Level (Sequence by level)"
  "Sleep Daily Summary (Counts)"
  "Sleep Daily Summary (Extended)"
  "Sleep Daily Summary (30-day average)"
  "Sleep Level (Short)"
)

for index in "${!fitbit_tables[@]}"; do
    fitbit_table="${fitbit_tables[$index]}";
    fitbit_date_col="${fitbit_date_cols[$index]}";
    fitbit_label="${fitbit_labels[$index]}";

    echo "Generating ${fitbit_label} data counts with location"
    bq --quiet --project_id=$BQ_PROJECT query --nouse_legacy_sql \
    "INSERT INTO \`${WORKBENCH_PROJECT}.${WORKBENCH_DATASET}.achilles_results\`
    (id, analysis_id, stratum_1, stratum_2, stratum_3, stratum_4, count_value, source_count_value)
    WITH all_fitbit_data AS (
        SELECT person_id, ${fitbit_date_col} AS data_date
        FROM \`${BQ_PROJECT}.${BQ_DATASET}.${fitbit_table}\`
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
        '${fitbit_label}' AS stratum_1,
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
        '${fitbit_label}' AS stratum_1,
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
        '${fitbit_label}' AS stratum_1,
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
        '${fitbit_label}' AS stratum_1,
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
        '${fitbit_label}' AS stratum_1,
        location AS stratum_2,
        'Fitbit' AS stratum_3,
        '' as stratum_4,
        COUNT(DISTINCT a.person_id) AS count_value,
        COUNT(DISTINCT a.person_id) AS source_count_value
    FROM min_dates a
    JOIN state_information si ON a.person_id = si.person_id
    GROUP BY 4;"
done