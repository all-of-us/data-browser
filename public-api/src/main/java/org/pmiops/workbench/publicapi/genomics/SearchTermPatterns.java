package org.pmiops.workbench.publicapi.genomics;

/**
 * Regex patterns for identifying variant search term types.
 */
public final class SearchTermPatterns {

    private SearchTermPatterns() {
    }

    /** Matches genomic region format: chr1:12345-67890 */
    public static final String GENOMIC_REGION =
            "(?i)([\"]*)(chr([0-9]{1,})*[XYxy]*:{0,}).*";

    /** Matches RS number format: rs12345 */
    public static final String RS_NUMBER = "(?i)(rs)(\\d{1,})";

    // ===========================================
    // SNV Variant ID Pattern
    // ===========================================

    /** Matches SNV variant ID format: 1-12345-A-G */
    public static final String SNV_VARIANT_ID =
            "(?i)([\"]*)((\\d{1,}|X|Y)-\\d{5,}-[A,C,T,G]{1,}-[A,C,T,G]{1,}).*";

    // ===========================================
    // SV Variant ID Patterns (multiple formats)
    // ===========================================

    /** V7 format: AoUSVPhaseXX.chrN.final_cleanup_TYPE_chrN_position */
    public static final String SV_VARIANT_ID_V7 =
            "(?i)AoUSVPhase[a-zA-Z0-9]{1,2}\\.chr[1-9XY][0-9]?(?:\\.final_cleanup_)?(BND|DUP|DEL|INS|CPX|INV|CTX|CNV)_chr[1-9XY][0-9]?_\\d+";

    /** V8 format: AoUSVPhaseXX.TYPE_chrN_shardN_position */
    public static final String SV_VARIANT_ID_V8 =
            "(?i)AoUSVPhase[a-zA-Z0-9]{1,2}\\.(BND|DUP|DEL|INS|CPX|INV|CTX|CNV)_chr[1-9XY][0-9]?_shard[0-9][0-9]?_\\d+";

    /** Random format: N-position-hexcode */
    public static final String SV_VARIANT_ID_RANDOM =
            "(?i)(\\d{1,2}|X|Y)-\\d{1,10}-[0-9a-fA-F]{2}";

    /** Refined format: N-position or N-position-letter */
    public static final String SV_VARIANT_ID_REFINED =
            "(?i)(\\d{1,2}|X|Y)-(\\d{1,10})([a-z])?";

    /**
     * Determines if the search term is a genomic region (e.g., chr1:12345-67890)
     */
    public static boolean isGenomicRegion(String term) {
        return term != null && term.matches(GENOMIC_REGION);
    }

    /**
     * Determines if the search term is an RS number (e.g., rs12345)
     */
    public static boolean isRsNumber(String term) {
        return term != null && term.matches(RS_NUMBER);
    }

    /**
     * Determines if the search term is an SNV variant ID (e.g., 1-12345-A-G)
     */
    public static boolean isSNVVariantId(String term) {
        return term != null && term.matches(SNV_VARIANT_ID);
    }

    /**
     * Determines if the search term is any SV variant ID format
     */
    public static boolean isSVVariantId(String term) {
        if (term == null) return false;
        return term.matches(SV_VARIANT_ID_V7) ||
                term.matches(SV_VARIANT_ID_V8) ||
                term.matches(SV_VARIANT_ID_RANDOM) ||
                term.matches(SV_VARIANT_ID_REFINED);
    }

    /**
     * Gets a human-readable label for the search term type.
     * Used by getSearchTermType API endpoint.
     */
    public static String getTypeLabel(String term) {
        if (term == null || term.trim().isEmpty()) {
            return "empty";
        }

        String trimmed = term.trim();

        if (isGenomicRegion(trimmed)) {
            return "genomic_region";
        } else if (isSNVVariantId(trimmed)) {
            return "variant_id";
        } else if (isRsNumber(trimmed)) {
            return "rs_id";
        } else {
            return "gene";
        }
    }
}