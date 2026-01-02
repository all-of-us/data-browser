package org.pmiops.workbench.publicapi.genomics;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles consequence severity ranking for both SNV and SV variants.
 * These rankings determine sort order when ordering by "most severe" consequence.
 */
public final class ConsequenceSeverityRanker {

    private ConsequenceSeverityRanker() {
    }

    // ===========================================
    // SNV Consequence Severity Rankings
    // Higher number = more severe
    // ===========================================

    public static final Map<String, Integer> SNV_RANKS;
    static {
        Map<String, Integer> map = new HashMap<>();
        map.put("transcript_ablation", 42);
        map.put("splice_acceptor_variant", 41);
        map.put("splice_donor_variant", 40);
        map.put("stop_gained", 39);
        map.put("frameshift_variant", 38);
        map.put("stop_lost", 37);
        map.put("start_lost", 36);
        map.put("transcript_amplification", 35);
        map.put("feature_elongation", 34);
        map.put("feature_truncation", 33);
        map.put("inframe_insertion", 32);
        map.put("inframe_deletion", 31);
        map.put("missense_variant", 30);
        map.put("protein_altering_variant", 29);
        map.put("splice_donor_5th_base_variant", 28);
        map.put("splice_region_variant", 27);
        map.put("splice_donor_region_variant", 26);
        map.put("splice_polypyrimidine_tract_variant", 25);
        map.put("incomplete_terminal_codon_variant", 24);
        map.put("start_retained_variant", 23);
        map.put("stop_retained_variant", 22);
        map.put("synonymous_variant", 21);
        map.put("coding_sequence_variant", 20);
        map.put("mature_miRNA_variant", 19);
        map.put("5_prime_UTR_variant", 18);
        map.put("3_prime_UTR_variant", 17);
        map.put("non_coding_transcript_exon_variant", 16);
        map.put("intron_variant", 15);
        map.put("NMD_transcript_variant", 14);
        map.put("non_coding_transcript_variant", 13);
        map.put("coding_transcript_variant", 12);
        map.put("upstream_gene_variant", 11);
        map.put("downstream_gene_variant", 10);
        map.put("transcript_variant", 9);
        map.put("TFBS_ablation", 8);
        map.put("TFBS_amplification", 7);
        map.put("TF_binding_site_variant", 6);
        map.put("regulatory_region_ablation", 5);
        map.put("regulatory_region_amplification", 4);
        map.put("regulatory_region_variant", 3);
        map.put("intergenic_variant", 2);
        map.put("sequence_variant", 1);
        SNV_RANKS = Collections.unmodifiableMap(map);
    }

    // ===========================================
    // SV Consequence Severity Rankings
    // ===========================================

    public static final Map<String, Integer> SV_RANKS;
    static {
        Map<String, Integer> map = new HashMap<>();
        map.put("LOF", 16);
        map.put("COPY_GAIN", 15);
        map.put("INTRAGENIC_EXON_DUP", 14);
        map.put("PARTIAL_EXON_DUP", 13);
        map.put("TSS_DUP", 12);
        map.put("DUP_PARTIAL", 11);
        map.put("INV_SPAN", 10);
        map.put("MSV_EXON_OVERLAP", 9);
        map.put("UTR", 8);
        map.put("INTRONIC", 7);
        map.put("BREAKEND_EXONIC", 6);
        map.put("PROMOTER", 5);
        map.put("INTERGENIC", 4);
        map.put("NEAREST_TSS", 3);
        map.put("NONCODING_SPAN", 2);
        map.put("NONCODING_BREAKPOINT", 1);
        SV_RANKS = Collections.unmodifiableMap(map);
    }

    // ===========================================
    // SQL CASE Statement Builders
    // ===========================================

    /**
     * Builds a CASE statement for consequence severity ordering.
     * Used in SELECT clauses and ORDER BY clauses.
     *
     * @param columnAlias The column alias to use (e.g., "d", "conseq")
     * @param ranks The severity rankings map to use
     * @return SQL CASE statement string
     */
    public static String buildCaseStatement(String columnAlias, Map<String, Integer> ranks) {
        StringBuilder caseStatement = new StringBuilder("CASE ");
        for (Map.Entry<String, Integer> entry : ranks.entrySet()) {
            caseStatement
                    .append("WHEN ").append(columnAlias).append(" = '")
                    .append(entry.getKey()).append("' THEN ")
                    .append(entry.getValue()).append(" ");
        }
        caseStatement.append("ELSE 0 END");
        return caseStatement.toString();
    }

    /**
     * Builds complete ORDER BY clause for SNV consequence severity.
     *
     * @param ascending true for least-to-most severe (ASC), false for most-to-least (DESC)
     * @return Complete ORDER BY clause
     */
    public static String buildSNVConsequenceOrderBy(boolean ascending) {
        StringBuilder caseStatement = new StringBuilder();
        for (Map.Entry<String, Integer> entry : SNV_RANKS.entrySet()) {
            caseStatement.append("WHEN TRIM(d) = '")
                    .append(entry.getKey()).append("' THEN ")
                    .append(entry.getValue()).append(" ");
        }

        String direction = ascending ? "ASC" : "DESC";
        return " ORDER BY (SELECT MAX(CASE " + caseStatement + "ELSE 0 END) FROM UNNEST(consequence) d) " + direction;
    }

    /**
     * Builds complete ORDER BY clause for SV consequence severity.
     *
     * @param ascending true for least-to-most severe (ASC), false for most-to-least (DESC)
     * @return Complete ORDER BY clause
     */
    public static String buildSVConsequenceOrderBy(boolean ascending) {
        StringBuilder caseStatement = new StringBuilder();
        for (Map.Entry<String, Integer> entry : SV_RANKS.entrySet()) {
            caseStatement.append("WHEN TRIM(con) = '")
                    .append(entry.getKey()).append("' THEN ")
                    .append(entry.getValue()).append(" ");
        }

        String direction = ascending ? "ASC" : "DESC";
        return " ORDER BY (SELECT MAX(CASE " + caseStatement + "ELSE 0 END) FROM UNNEST(SPLIT(consequence, ', ')) con) " + direction;
    }
}