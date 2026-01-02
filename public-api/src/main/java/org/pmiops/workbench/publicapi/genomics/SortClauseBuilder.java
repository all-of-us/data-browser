package org.pmiops.workbench.publicapi.genomics;

import org.pmiops.workbench.model.SortMetadata;
import org.pmiops.workbench.model.SortSVMetadata;
import org.pmiops.workbench.model.SortColumnDetails;

/**
 * Builds ORDER BY clauses for variant queries based on sort metadata.
 */
public final class SortClauseBuilder {

    private static final String DEFAULT_ORDER = " ORDER BY variant_id ASC";

    private SortClauseBuilder() {
    }

    /**
     * Builds ORDER BY clause for SNV variant queries.
     *
     * @param sortMetadata Sort configuration from request (can be null)
     * @return SQL ORDER BY clause
     */
    public static String buildSNVOrderBy(SortMetadata sortMetadata) {
        if (sortMetadata == null) {
            return DEFAULT_ORDER;
        }

        SortColumnDetails col;

        col = sortMetadata.getVariantId();
        if (isActive(col)) {
            return " ORDER BY variant_id " + getDirection(col, true);
        }

        col = sortMetadata.getGene();
        if (isActive(col)) {
            return " ORDER BY genes " + getDirection(col, false);
        }

        col = sortMetadata.getConsequence();
        if (isActive(col)) {
            return ConsequenceSeverityRanker.buildSNVConsequenceOrderBy("asc".equals(col.getSortDirection()));
        }

        col = sortMetadata.getVariantType();
        if (isActive(col)) {
            return " ORDER BY lower(variant_type) " + getDirection(col, false);
        }

        col = sortMetadata.getClinicalSignificance();
        if (isActive(col)) {
            return " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) "
                    + getDirection(col, false);
        }

        col = sortMetadata.getAlleleCount();
        if (isActive(col)) {
            return " ORDER BY allele_count " + getDirection(col, false);
        }

        col = sortMetadata.getAlleleNumber();
        if (isActive(col)) {
            return " ORDER BY allele_number " + getDirection(col, false);
        }

        col = sortMetadata.getAlleleFrequency();
        if (isActive(col)) {
            return " ORDER BY allele_frequency " + getDirection(col, false);
        }

        col = sortMetadata.getHomozygoteCount();
        if (isActive(col)) {
            return " ORDER BY homozygote_count " + getDirection(col, false);
        }

        return DEFAULT_ORDER;
    }

    /**
     * Builds ORDER BY clause for SV variant queries.
     *
     * @param sortMetadata Sort configuration from request (can be null)
     * @return SQL ORDER BY clause
     */
    public static String buildSVOrderBy(SortSVMetadata sortMetadata) {
        if (sortMetadata == null) {
            return DEFAULT_ORDER;
        }

        SortColumnDetails col;

        col = sortMetadata.getVariantId();
        if (isActive(col)) {
            return " ORDER BY variant_id " + getDirection(col, true);
        }

        col = sortMetadata.getVariantType();
        if (isActive(col)) {
            return " ORDER BY variant_type " + getDirection(col, true);
        }

        col = sortMetadata.getConsequence();
        if (isActive(col)) {
            return ConsequenceSeverityRanker.buildSVConsequenceOrderBy("asc".equals(col.getSortDirection()));
        }

        col = sortMetadata.getPosition();
        if (isActive(col)) {
            return " ORDER BY position " + getDirection(col, true);
        }

        col = sortMetadata.getSize();
        if (isActive(col)) {
            return " ORDER BY size " + getDirection(col, true);
        }

        col = sortMetadata.getAlleleCount();
        if (isActive(col)) {
            return " ORDER BY allele_count " + getDirection(col, false);
        }

        col = sortMetadata.getAlleleNumber();
        if (isActive(col)) {
            return " ORDER BY allele_number " + getDirection(col, false);
        }

        col = sortMetadata.getAlleleFrequency();
        if (isActive(col)) {
            return " ORDER BY allele_frequency " + getDirection(col, false);
        }

        col = sortMetadata.getHomozygoteCount();
        if (isActive(col)) {
            return " ORDER BY homozygote_count " + getDirection(col, false);
        }

        col = sortMetadata.getFilter();
        if (isActive(col)) {
            return " ORDER BY filter " + getDirection(col, true);
        }

        return DEFAULT_ORDER;
    }

    // ===========================================
    // Helper Methods
    // ===========================================

    private static boolean isActive(SortColumnDetails col) {
        return col != null && col.isSortActive();
    }

    /**
     * Gets sort direction string.
     *
     * @param col        Column details
     * @param defaultAsc If true, default to ASC when direction is not "desc";
     *                   if false, default to DESC when direction is not "asc"
     * @return "ASC" or "DESC"
     */
    private static String getDirection(SortColumnDetails col, boolean defaultAsc) {
        String direction = col.getSortDirection();
        if (defaultAsc) {
            return "desc".equals(direction) ? "DESC" : "ASC";
        } else {
            return "asc".equals(direction) ? "ASC" : "DESC";
        }
    }
}