#!/bin/bash

# Run queries to populate criteria stratum counts
set -xeuo pipefail
IFS=$'\n\t'

USAGE="./generate-clousql-cdr/generate_criteria_stratum.sh --bq-project <PROJECT> --bq-dataset <DATASET> --workbench-project <PROJECT>"
USAGE="$USAGE --cdr-version=YYYYMMDD"

while [ $# -gt 0 ]; do
  echo "1 is $1"
  case "$1" in
    --bq-project) BQ_PROJECT=$2; shift 2;;
    --bq-dataset) BQ_DATASET=$2; shift 2;;
    --workbench-project) OUTPUT_PROJECT=$2; shift 2;;
    --workbench-dataset) OUTPUT_DATASET=$2; shift 2;;
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

if [ -z "${OUTPUT_PROJECT}" ]
then
  echo "Usage: $USAGE"
  exit 1

fi

if [ -z "${OUTPUT_DATASET}" ]
then
  echo "Usage: $USAGE"
  exit 1
fi

echo "copying counts of child concepts from achilles results"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select distinct c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'biological_sex' as stratum_2, 'Procedure', ar.count_value, 3101 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='PCS' and cr.synonyms like '%rank1%' and ar.stratum_3='Procedure'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting biological sex rolled up counts for parent concepts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
select concept_id, gender, 'biological_sex', 'Procedure', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "Copying age counts into criteria_stratum for child concepts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select distinct c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'age' as stratum_2, 'Procedure', ar.count_value, 3102 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='PCS' and cr.synonyms like '%rank1%' and ar.stratum_3='Procedure'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting age stratum counts for parent snomed pcs concepts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Procedure', cnt, 3102
from
  (select ancestor_concept_id as concept_id, 2 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 18 and (extract(year from procedure_date) - p.year_of_birth) < 30
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"

echo "Inserting age stratum counts for parent snomed pcs concepts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Procedure', cnt, 3102
from
  (select ancestor_concept_id as concept_id, cast(floor((extract(year from procedure_date) - p.year_of_birth)/10) as int64) as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 30 and (extract(year from procedure_date) - p.year_of_birth) < 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"

echo "Inserting age stratum counts for parent snomed pcs concepts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id,stratum_1,stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Procedure', cnt, 3102
from
  (select ancestor_concept_id as concept_id, 9 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on b.person_id=p.person_id
  where (extract(year from procedure_date) - p.year_of_birth) >= 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc"

echo "Copying gender identity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'gender_identity' as stratum_2, 'Procedure', ar.count_value, 3107 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3107 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='PCS' and cr.synonyms like '%rank1%' and ar.stratum_3='Procedure'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting gender identity parent counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"
insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, gi, 'gender_identity', 'Procedure', cnt, 3107
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gi, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'PCS'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on b.person_id=ob.person_id
  where ob.observation_source_concept_id=1585838
  group by 1,2) y
  group by concept_id,gi,cnt
  order by concept_id asc"

echo "Inserting race ethnicity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'race_ethnicity' as stratum_2, 'Procedure', ar.count_value, 3108 from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='PCS' and cr.synonyms like '%rank1%' and ar.stratum_3='Procedure'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "Inserting race ethnicity parent concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
 select concept_id, race, 'race_ethnicity', 'Procedure', cnt, 3108
 from
   (select ancestor_concept_id as concept_id, ob.value_source_concept_id as race, count(distinct b.person_id) cnt
   from
   (select *
   from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
   where ancestor_concept_id in
     (select distinct concept_id
     from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
     where type = 'SNOMED'
     and subtype = 'PCS'
     and is_group = 1 and synonyms like '%rank1%')) a
   join \`${BQ_PROJECT}.${BQ_DATASET}.procedure_occurrence\` b on a.descendant_concept_id = b.procedure_concept_id
   join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on b.person_id=ob.person_id
   where ob.observation_source_concept_id=1586140
   group by 1,2) y
   group by concept_id,race,cnt
   order by concept_id asc"

echo "Inserting snomed counts"

echo "biological sex child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'biological_sex' as stratum_2, 'Condition', ar.count_value, 3101
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3101 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='CM' and cr.synonyms like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "biological sex parent concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, gender, 'biological_sex', 'Condition', cnt, 3101
from
  (select ancestor_concept_id as concept_id, p.gender_concept_id as gender, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  group by 1,2) y
  group by concept_id,gender,cnt
  order by concept_id asc"

echo "age child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'age' as stratum_2, 'Condition', ar.count_value, 3102
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3102 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='CM' and cr.synonyms like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "age parent concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Condition', cnt, 3102
from
  (select ancestor_concept_id as concept_id, 2 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 18 and (extract(year from condition_start_date) - p.year_of_birth) < 30
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc
"

echo "age parent concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Condition', cnt, 3102
from
  (select ancestor_concept_id as concept_id, cast(floor((extract(year from condition_start_date) - p.year_of_birth)/10) as int64) as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 30 and (extract(year from condition_start_date) - p.year_of_birth) < 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc
"

echo "age parent concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, age, 'age', 'Condition', cnt, 3102
from
  (select ancestor_concept_id as concept_id, 9 as age, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.person\` p on p.person_id = b.person_id
  where (extract(year from condition_start_date) - p.year_of_birth) >= 90
  group by 1,2) y
  group by concept_id,age,cnt
  order by concept_id asc
"

echo "gender identity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'gender_identity' as stratum_2, 'Condition', ar.count_value, 3107
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3107 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='CM' and cr.synonyms like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "gender identity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, gi, 'gender_identity', 'Condition', cnt, 3107
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as gi, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on ob.person_id = b.person_id
  where ob.observation_source_concept_id=1585838
  group by 1,2) y
  group by concept_id,gi,cnt
  order by concept_id asc
"

echo "race ethnicity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select c.concept_id,cast(ar.stratum_2 as int64) as stratum_1,'race_ethnicity' as stratum_2, 'Condition', ar.count_value, 3108
from \`$OUTPUT_PROJECT.$OUTPUT_DATASET.achilles_results\` ar join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.concept\` c
on cast(c.concept_id as string)=ar.stratum_1 and analysis_id=3108 join \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\` cr on c.concept_id = cr.concept_id
and cr.is_group=0 and cr.is_selectable=1 and cr.type='SNOMED' and cr.subtype='CM' and cr.synonyms like '%rank1%' and ar.stratum_3='Condition'
group by c.concept_id,ar.stratum_2,ar.count_value order by concept_id asc"

echo "race ethnicity child concept counts"
bq --quiet --project=$BQ_PROJECT query --nouse_legacy_sql \
"insert into \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria_stratum\` (concept_id, stratum_1, stratum_2, domain, count_value, analysis_id)
select concept_id, race, 'race_ethnicity', 'Condition', cnt, 3108
from
  (select ancestor_concept_id as concept_id, ob.value_source_concept_id as race, count(distinct b.person_id) cnt
  from
  (select *
  from \`${BQ_PROJECT}.${BQ_DATASET}.concept_ancestor\`
  where ancestor_concept_id in
    (select distinct concept_id
    from  \`$OUTPUT_PROJECT.$OUTPUT_DATASET.criteria\`
    where type = 'SNOMED'
    and subtype = 'CM'
    and is_group = 1 and synonyms like '%rank1%')) a
  join \`${BQ_PROJECT}.${BQ_DATASET}.condition_occurrence\` b on a.descendant_concept_id = b.condition_concept_id
  join \`${BQ_PROJECT}.${BQ_DATASET}.observation\` ob on ob.person_id = b.person_id
  where ob.observation_source_concept_id=1586140
  group by 1,2) y
  group by concept_id,race,cnt
  order by concept_id asc
"
