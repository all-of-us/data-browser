package org.pmiops.workbench.publicapi;

import org.pmiops.workbench.model.GenomicFilterOption;
import org.pmiops.workbench.model.GenomicFilterOptionList;
import org.pmiops.workbench.model.GenomicFilters;
import org.pmiops.workbench.model.SVGenomicFilterOption;
import org.pmiops.workbench.model.SVGenomicFilterOptionList;
import org.pmiops.workbench.model.SVGenomicFilters;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Builder class for constructing GenomicFilters and SVGenomicFilters response objects
 * from BigQuery result rows.
 */
public class GenomicFilterOptionsBuilder {

    // SNV filter lists
    private final List<GenomicFilterOption> geneFilters = new ArrayList<>();
    private final List<GenomicFilterOption> conseqFilters = new ArrayList<>();
    private final List<GenomicFilterOption> varTypeFilters = new ArrayList<>();
    private final List<GenomicFilterOption> clinSigFilters = new ArrayList<>();
    private GenomicFilterOption alleleCountFilter = new GenomicFilterOption();
    private GenomicFilterOption alleleNumberFilter = new GenomicFilterOption();
    private GenomicFilterOption homozygoteCountFilter = new GenomicFilterOption();

    // SV filter lists
    private final List<SVGenomicFilterOption> svGeneFilters = new ArrayList<>();
    private final List<SVGenomicFilterOption> svConseqFilters = new ArrayList<>();
    private final List<SVGenomicFilterOption> svVarTypeFilters = new ArrayList<>();
    private final List<SVGenomicFilterOption> svFilterFilters = new ArrayList<>();
    private SVGenomicFilterOption svSizeFilter = new SVGenomicFilterOption();
    private SVGenomicFilterOption svAlleleCountFilter = new SVGenomicFilterOption();
    private SVGenomicFilterOption svAlleleNumberFilter = new SVGenomicFilterOption();
    private SVGenomicFilterOption svHomozygoteCountFilter = new SVGenomicFilterOption();

    private final boolean isSVQuery;

    public GenomicFilterOptionsBuilder(boolean isSVQuery) {
        this.isSVQuery = isSVQuery;
    }

    // ==================== SNV Row Processing ====================

    public void processSNVRow(String option, String gene, String conseq, String varType,
                              String clinSignificance, Long geneCount, Long conCount,
                              Long variantTypeCount, Long clinCount, Long minCount, Long maxCount) {
        switch (option) {
            case "Gene":
                GenomicFilterOption geneOption = createGenomicFilterOption(gene, geneCount);
                geneFilters.add(geneOption);
                break;
            case "Consequence":
                GenomicFilterOption conseqOption = createGenomicFilterOption(conseq, conCount);
                conseqFilters.add(conseqOption);
                break;
            case "Variant Type":
                GenomicFilterOption varTypeOption = createGenomicFilterOption(varType, variantTypeCount);
                varTypeFilters.add(varTypeOption);
                break;
            case "Clinical Significance":
                GenomicFilterOption clinOption = createGenomicFilterOption(clinSignificance, clinCount);
                clinSigFilters.add(clinOption);
                break;
            case "Allele Count":
                alleleCountFilter = createRangeFilterOption(minCount, maxCount);
                break;
            case "Allele Number":
                alleleNumberFilter = createRangeFilterOption(minCount, maxCount);
                break;
            case "Homozygote Count":
                homozygoteCountFilter = createRangeFilterOption(minCount, maxCount);
                break;
        }
    }

    // ==================== SV Row Processing ====================

    public void processSVRow(String option, String gene, String varType, String conseq,
                             String filterValue, Long minCount, Long maxCount) {
        switch (option) {
            case "Gene":
                SVGenomicFilterOption geneOption = createSVFilterOption(gene, false);
                svGeneFilters.add(geneOption);
                break;
            case "Variant Type":
                SVGenomicFilterOption varTypeOption = createSVFilterOption(varType, false);
                svVarTypeFilters.add(varTypeOption);
                break;
            case "Consequence":
                SVGenomicFilterOption conseqOption = createSVFilterOption(conseq, false);
                svConseqFilters.add(conseqOption);
                break;
            case "Filter":
                // Default checked for PASS and MULTIALLELIC
                boolean defaultChecked = filterValue != null &&
                        (filterValue.equalsIgnoreCase("PASS") || filterValue.equalsIgnoreCase("MULTIALLELIC"));
                SVGenomicFilterOption filterOption = createSVFilterOption(filterValue, defaultChecked);
                svFilterFilters.add(filterOption);
                break;
            case "Size":
                svSizeFilter = createSVRangeFilterOption(minCount, maxCount);
                break;
            case "Allele Count":
                svAlleleCountFilter = createSVRangeFilterOption(minCount, maxCount);
                break;
            case "Allele Number":
                svAlleleNumberFilter = createSVRangeFilterOption(minCount, maxCount);
                break;
            case "Homozygote Count":
                svHomozygoteCountFilter = createSVRangeFilterOption(minCount, maxCount);
                break;
        }
    }

    // ==================== Build Methods ====================

    public GenomicFilters buildGenomicFilters(Map<String, Integer> consequenceSeverityRanks) {
        // Sort consequences by severity (ascending - lowest rank first)
        conseqFilters.sort(Comparator.comparingInt(a ->
                consequenceSeverityRanks.getOrDefault(a.getOption(), 0)));

        GenomicFilterOptionList geneFilterList = createFilterOptionList(geneFilters);
        GenomicFilterOptionList conseqFilterList = createFilterOptionList(conseqFilters);
        GenomicFilterOptionList varTypeFilterList = createFilterOptionList(varTypeFilters);
        GenomicFilterOptionList clinSigFilterList = createFilterOptionList(clinSigFilters);

        // Allele frequency is always 0-1
        GenomicFilterOption alleleFrequencyFilter = new GenomicFilterOption();
        alleleFrequencyFilter.setOption("");
        alleleFrequencyFilter.setCount(0L);
        alleleFrequencyFilter.setChecked(false);
        alleleFrequencyFilter.setMin(0L);
        alleleFrequencyFilter.setMax(1L);

        GenomicFilters genomicFilters = new GenomicFilters();
        genomicFilters.gene(geneFilterList);
        genomicFilters.consequence(conseqFilterList);
        genomicFilters.variantType(varTypeFilterList);
        genomicFilters.clinicalSignificance(clinSigFilterList);
        genomicFilters.alleleCount(alleleCountFilter);
        genomicFilters.alleleNumber(alleleNumberFilter);
        genomicFilters.alleleFrequency(alleleFrequencyFilter);
        genomicFilters.homozygoteCount(homozygoteCountFilter);

        return genomicFilters;
    }

    public SVGenomicFilters buildSVGenomicFilters(Map<String, Integer> svConsequenceSeverityRanks) {
        // Sort consequences by severity (ascending - lowest rank first)
        svConseqFilters.sort(Comparator.comparingInt(a ->
                svConsequenceSeverityRanks.getOrDefault(a.getOption(), 0)));

        SVGenomicFilterOptionList geneFilterList = createSVFilterOptionList(svGeneFilters, false);
        SVGenomicFilterOptionList varTypeFilterList = createSVFilterOptionList(svVarTypeFilters, false);
        SVGenomicFilterOptionList conFilterList = createSVFilterOptionList(svConseqFilters, false);
        // Filter list is active by default since PASS/MULTIALLELIC are pre-selected
        SVGenomicFilterOptionList filterFilterList = createSVFilterOptionList(svFilterFilters, true);

        // Allele frequency is always 0-1
        SVGenomicFilterOption alleleFrequencyFilter = new SVGenomicFilterOption();
        alleleFrequencyFilter.setOption("");
        alleleFrequencyFilter.setCount(0L);
        alleleFrequencyFilter.setChecked(false);
        alleleFrequencyFilter.setMin(0L);
        alleleFrequencyFilter.setMax(1L);

        SVGenomicFilters genomicFilters = new SVGenomicFilters();
        genomicFilters.gene(geneFilterList);
        genomicFilters.variantType(varTypeFilterList);
        genomicFilters.consequence(conFilterList);
        genomicFilters.filter(filterFilterList);
        genomicFilters.size(svSizeFilter);
        genomicFilters.alleleCount(svAlleleCountFilter);
        genomicFilters.alleleNumber(svAlleleNumberFilter);
        genomicFilters.alleleFrequency(alleleFrequencyFilter);
        genomicFilters.homozygoteCount(svHomozygoteCountFilter);

        return genomicFilters;
    }

    private GenomicFilterOption createGenomicFilterOption(String option, Long count) {
        GenomicFilterOption filterOption = new GenomicFilterOption();
        filterOption.setOption(option);
        filterOption.setCount(count);
        filterOption.setChecked(false);
        filterOption.setMin(0L);
        filterOption.setMax(0L);
        return filterOption;
    }

    private GenomicFilterOption createRangeFilterOption(Long min, Long max) {
        GenomicFilterOption filterOption = new GenomicFilterOption();
        filterOption.setOption("");
        filterOption.setCount(0L);
        filterOption.setChecked(false);
        filterOption.setMin(min);
        filterOption.setMax(max);
        return filterOption;
    }

    private SVGenomicFilterOption createSVFilterOption(String option, boolean checked) {
        SVGenomicFilterOption filterOption = new SVGenomicFilterOption();
        filterOption.setOption(option);
        filterOption.setChecked(checked);
        filterOption.setMin(0L);
        filterOption.setMax(0L);
        return filterOption;
    }

    private SVGenomicFilterOption createSVRangeFilterOption(Long min, Long max) {
        SVGenomicFilterOption filterOption = new SVGenomicFilterOption();
        filterOption.setOption("");
        filterOption.setCount(0L);
        filterOption.setChecked(false);
        filterOption.setMin(min);
        filterOption.setMax(max);
        return filterOption;
    }

    private GenomicFilterOptionList createFilterOptionList(List<GenomicFilterOption> items) {
        GenomicFilterOptionList list = new GenomicFilterOptionList();
        list.setItems(items);
        list.setFilterActive(false);
        return list;
    }

    private SVGenomicFilterOptionList createSVFilterOptionList(List<SVGenomicFilterOption> items, boolean filterActive) {
        SVGenomicFilterOptionList list = new SVGenomicFilterOptionList();
        list.setItems(items);
        list.setFilterActive(filterActive);
        return list;
    }
}