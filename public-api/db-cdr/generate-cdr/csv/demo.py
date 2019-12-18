select
d.domain, d.domain_id, d.name, d.description, d.concept_id,
0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count
from domain_info d
join (
  select c1.domain_id, count(*) as count
  from (
(select domain_id, concept_id from concept
where has_counts > 0 and
  match(concept_name, concept_code, vocabulary_id, synonyms) against ("body pain" in boolean mode) > 0 and
  standard_concept IN ('S', 'C') and can_select=1)
UNION DISTINCT
(select domain_id, concept_id from concept
where (concept_id in (0) or concept_code = "body pain") and can_select=1 and has_counts=1)) c1
  group by c1.domain_id) c
ON d.domain_id = c.domain_id and d.domain != 4
UNION DISTINCT
select domain,domain_id,name,description,concept_id,8 as all_concept_count,
(select count(*) from achilles_results where analysis_id=100 and stratum_2 like CONCAT('%', 'body pain', '%')) as standard_concept_count,participant_count
from domain_info where domain=8
UNION DISTINCT
select d.domain, d.domain_id, d.name, d.description, d.concept_id,
0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count
from domain_info d
join (select c1.domain_id, count(*) as count
from ((select domain_id, c.concept_id from concept c
where has_counts > 0 and
match(concept_name, concept_code, vocabulary_id, synonyms) against ("body pain" in boolean mode) > 0 and
standard_concept IN ('S', 'C') and can_select=1)
UNION DISTINCT
(select domain_id, concept_id from concept
where (concept_id in (0) or concept_code = "body pain") and can_select=1 and has_counts=1)) c1
group by c1.domain_id) c ON d.domain_id = c.domain_id where d.domain = 4
order by domain_id