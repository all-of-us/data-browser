package org.pmiops.workbench.publicapi;

import com.google.common.base.Strings;
import org.pmiops.workbench.model.GenomicFilterOption;
import org.pmiops.workbench.model.GenomicFilterOptionList;
import org.pmiops.workbench.model.SVGenomicFilterOption;
import org.pmiops.workbench.model.SVGenomicFilterOptionList;

import java.util.ArrayList;
import java.util.List;

/**
 * Builder class for constructing SQL WHERE clause filters for genomic variant queries.
 * Supports both SNV and SV variant filter construction.
 */
public class GenomicFilterBuilder {

    private final boolean isSVQuery;

    // Filter values
    private List<String> geneValues = new ArrayList<>();
    private List<String> consequenceValues = new ArrayList<>();
    private List<String> variantTypeValues = new ArrayList<>();
    private List<String> clinicalSignificanceValues = new ArrayList<>();
    private List<String> filterValues = new ArrayList<>();

    // Range filters
    private Long alleleCountMin;
    private Long alleleCountMax;
    private Long alleleNumberMin;
    private Long alleleNumberMax;
    private Float alleleFrequencyMin;
    private Float alleleFrequencyMax;
    private Long homozygoteCountMin;
    private Long homozygoteCountMax;
    private Long sizeMin;
    private Long sizeMax;

    private boolean includeNullConsequence = false;
    private boolean includeNullClinicalSignificance = false;

    private static final String WHERE_GENE_REGEX = " where REGEXP_CONTAINS(genes, @genes)";

    public GenomicFilterBuilder(boolean isSVQuery) {
        this.isSVQuery = isSVQuery;
    }

    public GenomicFilterBuilder addGeneValue(String gene) {
        if (!Strings.isNullOrEmpty(gene)) {
            geneValues.add(gene.toUpperCase());
        }
        return this;
    }

    public GenomicFilterBuilder addConsequenceValue(String consequence) {
        if (!Strings.isNullOrEmpty(consequence)) {
            consequenceValues.add(consequence);
        }
        return this;
    }

    public GenomicFilterBuilder addVariantTypeValue(String variantType) {
        if (!Strings.isNullOrEmpty(variantType)) {
            variantTypeValues.add(variantType);
        }
        return this;
    }

    public GenomicFilterBuilder addClinicalSignificanceValue(String clinSig) {
        if (!Strings.isNullOrEmpty(clinSig)) {
            clinicalSignificanceValues.add(clinSig);
        }
        return this;
    }

    public GenomicFilterBuilder addFilterValue(String filter) {
        if (!Strings.isNullOrEmpty(filter)) {
            filterValues.add(filter);
        }
        return this;
    }

    public GenomicFilterBuilder setAlleleCountRange(Long min, Long max) {
        this.alleleCountMin = min;
        this.alleleCountMax = max;
        return this;
    }

    public GenomicFilterBuilder setAlleleNumberRange(Long min, Long max) {
        this.alleleNumberMin = min;
        this.alleleNumberMax = max;
        return this;
    }

    public GenomicFilterBuilder setAlleleFrequencyRange(Float min, Float max) {
        this.alleleFrequencyMin = min;
        this.alleleFrequencyMax = max;
        return this;
    }

    public GenomicFilterBuilder setHomozygoteCountRange(Long min, Long max) {
        this.homozygoteCountMin = min;
        this.homozygoteCountMax = max;
        return this;
    }

    public GenomicFilterBuilder setSizeRange(Long min, Long max) {
        this.sizeMin = min;
        this.sizeMax = max;
        return this;
    }

    public GenomicFilterBuilder setIncludeNullConsequence(boolean include) {
        this.includeNullConsequence = include;
        return this;
    }

    public GenomicFilterBuilder setIncludeNullClinicalSignificance(boolean include) {
        this.includeNullClinicalSignificance = include;
        return this;
    }

    public GenomicFilterBuilder setDefaultSVFilters() {
        filterValues.add("PASS");
        filterValues.add("MULTIALLELIC");
        return this;
    }

    public GenomicFilterBuilder populateFromGenomicFilters(org.pmiops.workbench.model.GenomicFilters filters) {
        if (filters == null) {
            return this;
        }

        // Gene filter
        GenomicFilterOptionList geneFilterList = filters.getGene();
        if (geneFilterList != null && geneFilterList.isFilterActive()) {
            List<GenomicFilterOption> items = geneFilterList.getItems();
            if (items != null) {
                for (GenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        addGeneValue(filter.getOption());
                    }
                }
            }
        }

        // Consequence filter
        GenomicFilterOptionList conFilterList = filters.getConsequence();
        if (conFilterList != null && conFilterList.isFilterActive()) {
            List<GenomicFilterOption> items = conFilterList.getItems();
            if (items != null) {
                for (GenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        if (Strings.isNullOrEmpty(filter.getOption())) {
                            includeNullConsequence = true;
                        } else {
                            addConsequenceValue(filter.getOption());
                        }
                    }
                }
            }
        }

        // Variant type filter
        GenomicFilterOptionList varTypeFilterList = filters.getVariantType();
        if (varTypeFilterList != null && varTypeFilterList.isFilterActive()) {
            List<GenomicFilterOption> items = varTypeFilterList.getItems();
            if (items != null) {
                for (GenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        addVariantTypeValue(filter.getOption());
                    }
                }
            }
        }

        // Clinical significance filter
        GenomicFilterOptionList clinFilterList = filters.getClinicalSignificance();
        if (clinFilterList != null && clinFilterList.isFilterActive()) {
            List<GenomicFilterOption> items = clinFilterList.getItems();
            if (items != null) {
                for (GenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        if (Strings.isNullOrEmpty(filter.getOption())) {
                            includeNullClinicalSignificance = true;
                        } else {
                            addClinicalSignificanceValue(filter.getOption());
                        }
                    }
                }
            }
        }

        // Range filters
        GenomicFilterOption acFilter = filters.getAlleleCount();
        if (acFilter != null && acFilter.isChecked()) {
            setAlleleCountRange(acFilter.getMin(), acFilter.getMax());
        }

        GenomicFilterOption anFilter = filters.getAlleleNumber();
        if (anFilter != null && anFilter.isChecked()) {
            setAlleleNumberRange(anFilter.getMin(), anFilter.getMax());
        }

        GenomicFilterOption afFilter = filters.getAlleleFrequency();
        if (afFilter != null && afFilter.isChecked()) {
            setAlleleFrequencyRange(afFilter.getMinFreq(), afFilter.getMaxFreq());
        }

        GenomicFilterOption hcFilter = filters.getHomozygoteCount();
        if (hcFilter != null && hcFilter.isChecked()) {
            setHomozygoteCountRange(hcFilter.getMin(), hcFilter.getMax());
        }

        return this;
    }

    public GenomicFilterBuilder populateFromSVGenomicFilters(org.pmiops.workbench.model.SVGenomicFilters filters) {
        if (filters == null) {
            return this;
        }

        // Gene filter
        SVGenomicFilterOptionList geneFilterList = filters.getGene();
        if (geneFilterList != null && geneFilterList.isFilterActive()) {
            List<SVGenomicFilterOption> items = geneFilterList.getItems();
            if (items != null) {
                for (SVGenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        addGeneValue(filter.getOption());
                    }
                }
            }
        }

        // Consequence filter
        SVGenomicFilterOptionList conFilterList = filters.getConsequence();
        if (conFilterList != null && conFilterList.isFilterActive()) {
            List<SVGenomicFilterOption> items = conFilterList.getItems();
            if (items != null) {
                for (SVGenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        if (Strings.isNullOrEmpty(filter.getOption())) {
                            includeNullConsequence = true;
                        } else {
                            addConsequenceValue(filter.getOption());
                        }
                    }
                }
            }
        }

        // Variant type filter
        SVGenomicFilterOptionList varTypeFilterList = filters.getVariantType();
        if (varTypeFilterList != null && varTypeFilterList.isFilterActive()) {
            List<SVGenomicFilterOption> items = varTypeFilterList.getItems();
            if (items != null) {
                for (SVGenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        addVariantTypeValue(filter.getOption());
                    }
                }
            }
        }

        // Filter filter (PASS/MULTIALLELIC)
        SVGenomicFilterOptionList filterFilterList = filters.getFilter();
        if (filterFilterList != null && filterFilterList.isFilterActive()) {
            List<SVGenomicFilterOption> items = filterFilterList.getItems();
            if (items != null) {
                for (SVGenomicFilterOption filter : items) {
                    if (filter.isChecked()) {
                        addFilterValue(filter.getOption());
                    }
                }
            }
        }

        // Range filters
        SVGenomicFilterOption sizeFilter = filters.getSize();
        if (sizeFilter != null && sizeFilter.isChecked()) {
            setSizeRange(sizeFilter.getMin(), sizeFilter.getMax());
        }

        SVGenomicFilterOption acFilter = filters.getAlleleCount();
        if (acFilter != null && acFilter.isChecked()) {
            setAlleleCountRange(acFilter.getMin(), acFilter.getMax());
        }

        SVGenomicFilterOption anFilter = filters.getAlleleNumber();
        if (anFilter != null && anFilter.isChecked()) {
            setAlleleNumberRange(anFilter.getMin(), anFilter.getMax());
        }

        SVGenomicFilterOption afFilter = filters.getAlleleFrequency();
        if (afFilter != null && afFilter.isChecked()) {
            setAlleleFrequencyRange(afFilter.getMinFreq(), afFilter.getMaxFreq());
        }

        SVGenomicFilterOption hcFilter = filters.getHomozygoteCount();
        if (hcFilter != null && hcFilter.isChecked()) {
            setHomozygoteCountRange(hcFilter.getMin(), hcFilter.getMax());
        }

        return this;
    }

    /**
     * Builds the filter SQL and modifies the base SQL if needed (for gene filter replacement).
     *
     * @param whereGeneFlag Whether the search is a gene search
     * @param baseSql The base SQL StringBuilder (may be modified if gene filter replaces regex)
     * @return The filter SQL string to append
     */
    public String buildFilterSql(boolean whereGeneFlag, StringBuilder baseSql) {
        StringBuilder filterSql = new StringBuilder();

        // Gene filter
        if (!geneValues.isEmpty()) {
            String geneInClause = " AND genes in (" + buildQuotedList(geneValues) + ") ";
            if (whereGeneFlag) {
                // Replace the REGEXP_CONTAINS with exact match
                String baseSqlStr = baseSql.toString();
                baseSqlStr = baseSqlStr.replace(WHERE_GENE_REGEX, "");
                baseSql.setLength(0);
                baseSql.append(baseSqlStr);
                geneInClause = " WHERE genes in (" + buildQuotedList(geneValues) + ") ";
            }
            filterSql.append(geneInClause);
        }

        // Consequence filter
        if (!consequenceValues.isEmpty() || includeNullConsequence) {
            if (!consequenceValues.isEmpty()) {
                if (isSVQuery) {
                    filterSql.append(" AND (EXISTS (SELECT con FROM UNNEST(split(consequence, ', ')) as con where con in (")
                            .append(buildQuotedList(consequenceValues))
                            .append("))");
                } else {
                    filterSql.append(" AND (EXISTS (SELECT con FROM UNNEST(consequence) as con where con in (")
                            .append(buildQuotedList(consequenceValues))
                            .append("))");
                }
                if (includeNullConsequence) {
                    filterSql.append(" OR ARRAY_LENGTH(consequence) = 0");
                }
                filterSql.append(") ");
            } else if (includeNullConsequence) {
                filterSql.append(" AND ARRAY_LENGTH(consequence) = 0");
            }
        }

        // Variant type filter
        if (!variantTypeValues.isEmpty()) {
            filterSql.append(" AND variant_type in (")
                    .append(buildQuotedList(variantTypeValues))
                    .append(") ");
        }

        // Clinical significance filter (SNV only)
        if (!isSVQuery && (!clinicalSignificanceValues.isEmpty() || includeNullClinicalSignificance)) {
            if (!clinicalSignificanceValues.isEmpty()) {
                filterSql.append(" AND (EXISTS (SELECT clin FROM UNNEST(clinical_significance) as clin where clin in (")
                        .append(buildQuotedList(clinicalSignificanceValues))
                        .append("))");
                if (includeNullClinicalSignificance) {
                    filterSql.append(" OR ARRAY_LENGTH(clinical_significance) = 0");
                }
                filterSql.append(") ");
            } else if (includeNullClinicalSignificance) {
                filterSql.append(" AND ARRAY_LENGTH(clinical_significance) = 0");
            }
        }

        // Size filter (SV only)
        if (isSVQuery && sizeMin != null && sizeMax != null) {
            filterSql.append(" AND size BETWEEN ").append(sizeMin).append(" AND ").append(sizeMax);
        }

        // Allele count filter - Updated to use CNV-specific metrics for SV queries
        if (alleleCountMin != null && alleleCountMax != null) {
            if (isSVQuery) {
                filterSql.append(" AND CASE WHEN variant_type = '<CNV>' THEN cn_nonref_count ELSE allele_count END BETWEEN ")
                        .append(alleleCountMin).append(" AND ").append(alleleCountMax);
            } else {
                filterSql.append(" AND allele_count BETWEEN ").append(alleleCountMin).append(" AND ").append(alleleCountMax);
            }
        }

        // Allele number filter - Updated to use CNV-specific metrics for SV queries
        if (alleleNumberMin != null && alleleNumberMax != null) {
            if (isSVQuery) {
                filterSql.append(" AND CASE WHEN variant_type = '<CNV>' THEN cn_number ELSE allele_number END BETWEEN ")
                        .append(alleleNumberMin).append(" AND ").append(alleleNumberMax);
            } else {
                filterSql.append(" AND allele_number BETWEEN ").append(alleleNumberMin).append(" AND ").append(alleleNumberMax);
            }
        }

        // Allele frequency filter - Updated to use CNV-specific metrics for SV queries
        if (alleleFrequencyMin != null && alleleFrequencyMax != null) {
            if (isSVQuery) {
                filterSql.append(" AND CASE WHEN variant_type = '<CNV>' THEN cn_nonref_freq ELSE allele_frequency END BETWEEN ")
                        .append(alleleFrequencyMin).append(" AND ").append(alleleFrequencyMax);
            } else {
                filterSql.append(" AND allele_frequency BETWEEN ").append(alleleFrequencyMin).append(" AND ").append(alleleFrequencyMax);
            }
        }

        // Homozygote count filter
        if (homozygoteCountMin != null && homozygoteCountMax != null) {
            filterSql.append(" AND homozygote_count BETWEEN ").append(homozygoteCountMin).append(" AND ").append(homozygoteCountMax);
        }

        // Filter filter (SV only - PASS/MULTIALLELIC)
        if (isSVQuery && !filterValues.isEmpty()) {
            filterSql.append(" AND filter in (").append(buildQuotedList(filterValues)).append(") ");
        }

        return filterSql.toString();
    }

    // ==================== Helper Methods ====================

    private String buildQuotedList(List<String> values) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append("\"").append(values.get(i)).append("\"");
        }
        return sb.toString();
    }

    public boolean hasGeneFilter() {
        return !geneValues.isEmpty();
    }

    public boolean hasFilterFilter() {
        return !filterValues.isEmpty();
    }
}