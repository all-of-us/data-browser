package org.pmiops.workbench.publicapi.genomics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.service.CdrVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.model.Variant;
import org.pmiops.workbench.model.SVVariant;
import org.pmiops.workbench.model.VariantInfo;
import org.pmiops.workbench.model.SVVariantInfo;
import org.pmiops.workbench.model.GenomicFilters;
import org.pmiops.workbench.model.SVGenomicFilters;
import org.pmiops.workbench.model.GenomicSearchTermType;
import org.pmiops.workbench.model.SVGenomicSearchTermType;
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.model.SVVariantListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.service.BigQueryService;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;
import com.google.cloud.bigquery.TableResult;
import com.google.common.base.Strings;
import org.pmiops.workbench.model.AnalysisListResponse;
import com.google.common.collect.ImmutableList;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.SearchVariantsRequest;
import org.pmiops.workbench.model.SearchSVVariantsRequest;
import org.pmiops.workbench.model.VariantResultSizeRequest;
import org.pmiops.workbench.model.SVVariantResultSizeRequest;
import org.pmiops.workbench.model.SortMetadata;
import org.pmiops.workbench.model.SortSVMetadata;
import org.pmiops.workbench.model.SortColumnDetails;

import org.pmiops.workbench.publicapi.GenomicsApiDelegate;

@RestController
public class GenomicsController implements GenomicsApiDelegate {

    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private CdrVersionService cdrVersionService;
    @Autowired
    private BigQueryService bigQueryService;

    // SQL Templates - WHERE clauses
    private static final String WHERE_CONTIG = " where REGEXP_CONTAINS(contig, @contig)";
    private static final String WHERE_CHROM = " where REGEXP_CONTAINS(chrom, @contig)";
    private static final String AND_POSITION = " and position <= @high and position >= @low \n";
    private static final String AND_POS = " and pos <= @high and pos >= @low";
    private static final String WHERE_VARIANT_ID = " where variant_id = @variant_id";
    private static final String WHERE_VARIANT_ID_OR_VCF = " where variant_id = @variant_id OR variant_id_vcf = @variant_id";
    private static final String WHERE_RS_NUMBER_CONTAINS = ", unnest(rs_number) AS rsid\n where REGEXP_CONTAINS(rsid, @rs_id)";
    private static final String WHERE_RS_NUMBER_EXACT = " where @rs_id in unnest(rs_number)";
    private static final String WHERE_GENE_REGEX = " where REGEXP_CONTAINS(genes, @genes)";

    // SQL Templates - Core queries
    private static final String COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String SV_COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.aou_sv_vcf_9_processed";

    private static final String CONSEQ_ORDER_BY_FOR_FILTERS =
            " ORDER BY " + ConsequenceSeverityRanker.buildCaseStatement("conseq", ConsequenceSeverityRanker.SNV_RANKS) + " DESC";

    private static final String VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, genes, " +
            "(SELECT STRING_AGG(d, \", \") FROM (" +
            "SELECT DISTINCT d FROM UNNEST(consequence) d " +
            "ORDER BY " + ConsequenceSeverityRanker.buildCaseStatement("d", ConsequenceSeverityRanker.SNV_RANKS) +
            ") AS sorted_consequences) as cons_agg_str, " +
            "variant_type, protein_change, " +
            "(SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) as clin_sig_agg_str, " +
            "allele_count, allele_number, allele_frequency, homozygote_count " +
            "FROM ${projectId}.${dataSetId}.wgs_variant";

    private static final String SV_VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, variant_type, consequence, position, a.size, \n" +
            "a.allele_count, a.allele_number, a.allele_frequency, a.homozygote_count, a.filter FROM ${projectId}.${dataSetId}.aou_sv_vcf_9_processed a";

    private static final String VARIANT_DETAIL_SQL_TEMPLATE = "SELECT dna_change, transcript, ARRAY_TO_STRING(rs_number, ', ') as rs_number, gvs_afr_ac as afr_allele_count, gvs_afr_an as afr_allele_number, gvs_afr_af as afr_allele_frequency, gvs_afr_hc as afr_homozygote_count, gvs_eas_ac as eas_allele_count, gvs_eas_an as eas_allele_number, gvs_eas_af as eas_allele_frequency, gvs_eas_hc as eas_homozygote_count, " +
            "gvs_eur_ac as eur_allele_count, gvs_eur_an as eur_allele_number, gvs_eur_af as eur_allele_frequency, gvs_eur_hc as eur_homozygote_count, " +
            "gvs_amr_ac as amr_allele_count, gvs_amr_an as amr_allele_number, gvs_amr_af as amr_allele_frequency, gvs_amr_hc as amr_homozygote_count, " +
            "gvs_mid_ac as mid_allele_count, gvs_mid_an as mid_allele_number, gvs_mid_af as mid_allele_frequency, gvs_mid_hc as mid_homozygote_count, " +
            "gvs_sas_ac as sas_allele_count, gvs_sas_an as sas_allele_number, gvs_sas_af as sas_allele_frequency, gvs_sas_hc as sas_homozygote_count, " +
            "gvs_oth_ac as oth_allele_count, gvs_oth_an as oth_allele_number, gvs_oth_af as oth_allele_frequency, gvs_oth_hc as oth_homozygote_count, " +
            "gvs_all_ac as total_allele_count, gvs_all_an as total_allele_number, gvs_all_af as total_allele_frequency, homozygote_count as total_homozygote_count from ${projectId}.${dataSetId}.wgs_variant";

    private static final String SV_VARIANT_DETAIL_SQL_TEMPLATE = "SELECT variant_type, consequence_genes, position, size, variant_id_vcf, \n" +
            "cpx_intervals as cpx_intervals, cpx_type as cpx_type, a.filter as filter, a.no_call_rate as no_call_rate, a.quality_score as quality_score, \n" +
            "afr_ac as afr_allele_count, afr_an as afr_allele_number, afr_af as afr_allele_frequency, afr_n_homalt as afr_homozygote_count, \n" +
            "eas_ac as eas_allele_count, eas_an as eas_allele_number, eas_af as eas_allele_frequency, eas_n_homalt as eas_homozygote_count, \n" +
            "eur_ac as eur_allele_count, eur_an as eur_allele_number, eur_af as eur_allele_frequency, eur_n_homalt as eur_homozygote_count, \n" +
            "amr_ac as amr_allele_count, amr_an as amr_allele_number, amr_af as amr_allele_frequency, amr_n_homalt as amr_homozygote_count, \n" +
            "mid_ac as mid_allele_count, mid_an as mid_allele_number, mid_af as mid_allele_frequency, mid_n_homalt as mid_homozygote_count, \n" +
            "sas_ac as sas_allele_count, sas_an as sas_allele_number, sas_af as sas_allele_frequency, sas_n_homalt as sas_homozygote_count, \n" +
            "oth_ac as oth_allele_count, oth_an as oth_allele_number, oth_af as oth_allele_frequency, oth_n_homalt as oth_homozygote_count, \n" +
            "allele_count as total_allele_count, allele_number as total_allele_number, allele_frequency as total_allele_frequency, homozygote_count as total_homozygote_count from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed a \n";

    // Filter option SQL templates
    private static final String FILTER_OPTION_SQL_TEMPLATE_GENE = "with a as\n" +
            "(select 'Gene' as option, genes as genes, '' as conseq, '' as variant_type, '' as clin_significance, count(*) as gene_count, " +
            "0 as con_count, 0 as variant_type_count, " +
            "0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant tj, \n" +
            " unnest(split(genes, ', ')) gene\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CON = " group by genes),\n" +
            "b as\n" +
            "(select 'Consequence' as option, '' as genes, conseq, '' as variant_type, '' as clin_significance, 0 as gene_count, count(*) as con_count, 0 as variant_type_count, 0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(consequence) AS conseq\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE =
            " group by conseq" + CONSEQ_ORDER_BY_FOR_FILTERS + "),\n" +
                    "c as\n" +
                    "(select 'Variant Type' as option, '' as genes, '' as conseq, variant_type as variant_type, '' as clin_significance, 0 as gene_count, 0 as con_count, count(*) as variant_type_count, 0 as clin_count, 0 as min_count, 0 as max_count\n" +
                    "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CLIN = " group by variant_type),\n" +
            "d as\n" +
            "(select 'Clinical Significance' as option, '' as genes, '' as consequence, '' as variant_type, clin as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, count(*) as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(clinical_significance) AS clin\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT = " group by clin),\n" +
            "e as \n" +
            "(select 'Allele Count' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(allele_count) as min_count, max(allele_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER = "),\n" +
            "f as \n" +
            "(select 'Allele Number' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(allele_number) as min_count, max(allele_number) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT = "),\n" +
            "g as \n" +
            "(select 'Homozygote Count' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(homozygote_count) as min_count, max(homozygote_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_UNION = ")" +
            "select * from a \n" +
            "union all \n" +
            "select * from b \n" +
            "union all \n" +
            "select * from c \n" +
            "union all \n" +
            "select * from d \n" +
            "union all \n" +
            "select * from e \n" +
            "union all \n" +
            "select * from f \n" +
            "union all \n" +
            "select * from g;";

    // SV Filter option SQL templates
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_GENE = "with a as\n" +
            "(select distinct 'Gene' as option, genes as genes, '' as variant_type, '' as consequence, '' as filter_value,\n" +
            "0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed tj, \n" +
            " unnest(split(genes, ', ')) gene\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE = " group by genes),\n" +
            "b as \n" +
            "(select distinct 'Variant Type' as option, '' as genes, variant_type as variant_type, '' as consequence, '' as filter_value, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_CON = " group by variant_type), \n" +
            "c as\n" +
            "(select distinct 'Consequence' as option, '' as genes, '' as variant_type, con as consequence, '' as filter_value,\n" +
            "0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed tj, \n" +
            " unnest(split(consequence, ', ')) con\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_SIZE = " group by con),\n" +
            "e as \n" +
            "(select distinct 'Size' as option, '' as genes, '' as variant_type, '' as consequence, '' as filter_value,\n" +
            "min(size) as min_count, max(size) as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT = "),\n" +
            "f as \n" +
            "(select distinct 'Allele Count' as option, '' as genes, '' as variant_type, '' as consequence, '' as filter_value,\n" +
            "min(allele_count) as min_count, max(allele_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER = "),\n" +
            "g as \n" +
            "(select distinct 'Allele Number' as option, '' as genes, '' as variant_type, '' as consequence, '' as filter_value,\n" +
            "min(allele_number) as min_count, max(allele_number) as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT = "),\n" +
            "h as \n" +
            "(select distinct 'Homozygote Count' as option, '' as genes, '' as variant_type, '' as consequence, '' as filter_value,\n" +
            "min(homozygote_count) as min_count, max(homozygote_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_FILTER =
            "),\ni as \n(select distinct 'Filter' as option, '' as genes, '' as variant_type, '' as consequence, filter as filter_value,\n0 as min_count, 0 as max_count\nfrom ${projectId}.${dataSetId}.aou_sv_vcf_9_processed\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_UNION = " group by filter)\n" +
            "select * from a \n" +
            "union all \n" +
            "select * from b \n" +
            "union all \n" +
            "select * from c \n" +
            "union all \n" +
            "select * from e \n" +
            "union all \n" +
            "select * from f \n" +
            "union all \n" +
            "select * from g \n" +
            "union all \n" +
            "select * from h \n" +
            "union all \n" +
            "select * from i;";

    // SV Gene consequence constants
    private static final String SV_GENE_CONSEQUENCE_FILTER =
            " AND EXISTS (" +
                    "SELECT 1 FROM UNNEST(SPLIT(consequence_genes, '; ')) AS cg, " +
                    "UNNEST(SPLIT(SPLIT(cg, ' - ')[SAFE_OFFSET(1)], ',')) AS gene " +
                    "WHERE UPPER(TRIM(gene)) = @rawGene " +
                    "AND SPLIT(cg, ' - ')[SAFE_OFFSET(0)] NOT IN ('INTERGENIC', 'NEAREST_TSS'))";

    private static final String SV_GENE_CONSEQUENCE_SELECT =
            "(SELECT STRING_AGG(DISTINCT SPLIT(cg, ' - ')[SAFE_OFFSET(0)], ', ') " +
                    "FROM UNNEST(SPLIT(consequence_genes, '; ')) AS cg, " +
                    "     UNNEST(SPLIT(SPLIT(cg, ' - ')[SAFE_OFFSET(1)], ',')) AS gene " +
                    "WHERE UPPER(TRIM(gene)) = @rawGene) AS consequence";

    public GenomicsController() {}

    public GenomicsController(AchillesAnalysisService achillesAnalysisService, CdrVersionService cdrVersionService,
                              BigQueryService bigQueryService) {
        this.achillesAnalysisService = achillesAnalysisService;
        this.cdrVersionService = cdrVersionService;
        this.bigQueryService = bigQueryService;
    }

    private void initCdrVersion() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch (NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
    }

    private String getSortDirection(String direction, boolean defaultAsc) {
        if (defaultAsc) {
            return "desc".equals(direction) ? "DESC" : "ASC";
        } else {
            return "asc".equals(direction) ? "ASC" : "DESC";
        }
    }

    @Override
    public ResponseEntity<Analysis> getParticipantCounts() {
        initCdrVersion();
        return ResponseEntity.ok(achillesAnalysisService.findAnalysisByIdAndDomain(3000L, "Genomics"));
    }

    @Override
    public ResponseEntity<Long> getVariantSearchResultSize(VariantResultSizeRequest variantResultSizeRequest) {
        initCdrVersion();

        String finalSql = COUNT_SQL_TEMPLATE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String variantSearchTerm = variantResultSizeRequest.getQuery().trim();
        GenomicFilters filters = variantResultSizeRequest.getFilterMetadata();
        String searchTerm = variantSearchTerm;
        boolean whereGeneFlag = false;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = "(?i)(" + searchTerm + ")$";

        if (!Strings.isNullOrEmpty(searchTerm)) {
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
        }

        GenomicFilterBuilder filterBuilder = new GenomicFilterBuilder(false);

        if (filters != null) {
            filterBuilder.populateFromGenomicFilters(filters);
        }

        StringBuilder baseSql = new StringBuilder(finalSql);
        String filterSql = filterBuilder.buildFilterSql(whereGeneFlag, baseSql);
        finalSql = baseSql.toString() + filterSql;

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();

        return ResponseEntity.ok(bigQueryService.getLong(row, rm.get("count")));
    }

    @Override
    public ResponseEntity<Long> getSVVariantSearchResultSize(SVVariantResultSizeRequest variantResultSizeRequest) {
        initCdrVersion();

        String finalSql = SV_COUNT_SQL_TEMPLATE;

        String variant_id = "";
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        boolean whereGeneFlag = false;
        String rawGeneSearchTerm = "";

        String variantSearchTerm = variantResultSizeRequest.getQuery().trim();
        SVGenomicFilters filters = variantResultSizeRequest.getFilterMetadata();
        String searchTerm = variantSearchTerm;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = "(?i)(" + searchTerm + ")$";

        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();

            if (whereGeneFlag) {
                rawGeneSearchTerm = searchTerm.toUpperCase().trim();
                finalSql += SV_GENE_CONSEQUENCE_FILTER;
            }
        }

        GenomicFilterBuilder filterBuilder = new GenomicFilterBuilder(true);

        if (filters != null) {
            filterBuilder.populateFromSVGenomicFilters(filters);
        } else if (!Strings.isNullOrEmpty(searchTerm)) {
            filterBuilder.setDefaultSVFilters();
        }

        StringBuilder baseSql = new StringBuilder(finalSql);
        String filterSql = filterBuilder.buildFilterSql(whereGeneFlag, baseSql);
        finalSql = baseSql.toString() + filterSql;

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rawGene", QueryParameterValue.string(rawGeneSearchTerm))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();

        return ResponseEntity.ok(bigQueryService.getLong(row, rm.get("count")));
    }

    @Override
    public ResponseEntity<SVVariantListResponse> searchSVVariants(SearchSVVariantsRequest searchVariantsRequest) {
        initCdrVersion();

        String variantSearchTerm = searchVariantsRequest.getQuery().trim();
        Integer page = searchVariantsRequest.getPageNumber();
        Integer rowCount = searchVariantsRequest.getRowCount();
        SortSVMetadata sortMetadata = searchVariantsRequest.getSortMetadata();
        SVGenomicFilters filters = searchVariantsRequest.getFilterMetadata();

        // Build ORDER BY clause
        String ORDER_BY_CLAUSE = " ORDER BY variant_id ASC";
        if (sortMetadata != null) {
            SortColumnDetails variantIdColumnSortMetadata = sortMetadata.getVariantId();
            if (variantIdColumnSortMetadata != null && variantIdColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY variant_id " + getSortDirection(variantIdColumnSortMetadata.getSortDirection(), true);
            }

            SortColumnDetails variantTypeColumnSortMetadata = sortMetadata.getVariantType();
            if (variantTypeColumnSortMetadata != null && variantTypeColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY variant_type " + getSortDirection(variantTypeColumnSortMetadata.getSortDirection(), true);
            }

            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = ConsequenceSeverityRanker.buildSVConsequenceOrderBy(consequenceColumnSortMetadata.getSortDirection().equals("asc"));
            }

            SortColumnDetails positionColumnSortMetadata = sortMetadata.getPosition();
            if (positionColumnSortMetadata != null && positionColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY position " + getSortDirection(positionColumnSortMetadata.getSortDirection(), true);
            }

            SortColumnDetails sizeColumnSortMetadata = sortMetadata.getSize();
            if (sizeColumnSortMetadata != null && sizeColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY size " + getSortDirection(sizeColumnSortMetadata.getSortDirection(), true);
            }

            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_count " + getSortDirection(alleleCountColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_number " + getSortDirection(alleleNumberColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_frequency " + getSortDirection(alleleFrequencyColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails homozygoteCountColumnSortMetadata = sortMetadata.getHomozygoteCount();
            if (homozygoteCountColumnSortMetadata != null && homozygoteCountColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY homozygote_count " + getSortDirection(homozygoteCountColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails filterColumnSortMetadata = sortMetadata.getFilter();
            if (filterColumnSortMetadata != null && filterColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY filter " + getSortDirection(filterColumnSortMetadata.getSortDirection(), true);
            }
        }

        // Parse search term
        String searchTerm = variantSearchTerm;
        String variant_id = "";
        String genes = "";
        String rawGeneSearchTerm = "";
        boolean whereGeneFlag = false;
        Long low = 0L;
        Long high = 0L;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = searchTerm;
        String searchSqlQuery = "";

        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            searchSqlQuery = searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            variant_id = searchTermType.getVariantId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";

            if (whereGeneFlag) {
                rawGeneSearchTerm = searchTerm.toUpperCase().trim();
            }
        }

        // Add gene consequence filter for gene searches
        if (whereGeneFlag && !rawGeneSearchTerm.isEmpty()) {
            searchSqlQuery += SV_GENE_CONSEQUENCE_FILTER;
        }

        // Build dynamic consequence SELECT based on whether it's a gene search
        String consequenceSelect = (whereGeneFlag && !rawGeneSearchTerm.isEmpty())
                ? SV_GENE_CONSEQUENCE_SELECT
                : "consequence";

        // Build the SQL with dynamic consequence select
        String finalSql = "SELECT variant_id, variant_type, " + consequenceSelect + ", position, a.size, " +
                "a.allele_count, a.allele_number, a.allele_frequency, a.homozygote_count, a.filter " +
                "FROM ${projectId}.${dataSetId}.aou_sv_vcf_9_processed a" + searchSqlQuery;

        GenomicFilterBuilder filterBuilder = new GenomicFilterBuilder(true);

        if (filters != null) {
            filterBuilder.populateFromSVGenomicFilters(filters);
        } else if (!Strings.isNullOrEmpty(searchTerm)) {
            filterBuilder.setDefaultSVFilters();
        }

        StringBuilder baseSql = new StringBuilder(finalSql);
        String filterSql = filterBuilder.buildFilterSql(whereGeneFlag, baseSql);
        finalSql = baseSql.toString() + filterSql;

        // Add ORDER BY and pagination
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT " + rowCount + " OFFSET " + ((Optional.ofNullable(page).orElse(1) - 1) * rowCount);

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("rawGene", QueryParameterValue.string(rawGeneSearchTerm))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<SVVariant> variantList = new ArrayList<>();

        for (List<FieldValue> row : result.iterateAll()) {
            variantList.add(new SVVariant()
                    .variantId(bigQueryService.getString(row, rm.get("variant_id")))
                    .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                    .consequence(bigQueryService.getString(row, rm.get("consequence")))
                    .position(bigQueryService.getString(row, rm.get("position")))
                    .size(bigQueryService.getLong(row, rm.get("size")))
                    .alleleCount(bigQueryService.getLong(row, rm.get("allele_count")))
                    .alleleNumber(bigQueryService.getLong(row, rm.get("allele_number")))
                    .alleleFrequency(bigQueryService.getDouble(row, rm.get("allele_frequency")))
                    .homozygoteCount(bigQueryService.getLong(row, rm.get("homozygote_count")))
                    .filter(bigQueryService.getString(row, rm.get("filter")))
            );
        }

        SVVariantListResponse variantListResponse = new SVVariantListResponse();
        variantListResponse.setItems(variantList);
        return ResponseEntity.ok(variantListResponse);
    }

    @Override
    public ResponseEntity<VariantListResponse> searchVariants(SearchVariantsRequest searchVariantsRequest) {
        initCdrVersion();

        String variantSearchTerm = searchVariantsRequest.getQuery().trim();
        Integer page = searchVariantsRequest.getPageNumber();
        Integer rowCount = searchVariantsRequest.getRowCount();
        SortMetadata sortMetadata = searchVariantsRequest.getSortMetadata();
        GenomicFilters filters = searchVariantsRequest.getFilterMetadata();

        // Build ORDER BY clause
        String ORDER_BY_CLAUSE = " ORDER BY variant_id ASC";
        if (sortMetadata != null) {
            SortColumnDetails variantIdColumnSortMetadata = sortMetadata.getVariantId();
            if (variantIdColumnSortMetadata != null && variantIdColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY variant_id " + getSortDirection(variantIdColumnSortMetadata.getSortDirection(), true);
            }

            SortColumnDetails geneColumnSortMetadata = sortMetadata.getGene();
            if (geneColumnSortMetadata != null && geneColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY genes " + getSortDirection(geneColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = ConsequenceSeverityRanker.buildSNVConsequenceOrderBy(consequenceColumnSortMetadata.getSortDirection().equals("asc"));
            }

            SortColumnDetails variantTypeColumnSortMetadata = sortMetadata.getVariantType();
            if (variantTypeColumnSortMetadata != null && variantTypeColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY lower(variant_type) " + getSortDirection(variantTypeColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails clinSigColumnSortMetadata = sortMetadata.getClinicalSignificance();
            if (clinSigColumnSortMetadata != null && clinSigColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) "
                        + getSortDirection(clinSigColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_count " + getSortDirection(alleleCountColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_number " + getSortDirection(alleleNumberColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY allele_frequency " + getSortDirection(alleleFrequencyColumnSortMetadata.getSortDirection(), false);
            }

            SortColumnDetails homozygoteCountColumnSortMetadata = sortMetadata.getHomozygoteCount();
            if (homozygoteCountColumnSortMetadata != null && homozygoteCountColumnSortMetadata.isSortActive()) {
                ORDER_BY_CLAUSE = " ORDER BY homozygote_count " + getSortDirection(homozygoteCountColumnSortMetadata.getSortDirection(), false);
            }
        }

        // Parse search term
        String finalSql = VARIANT_LIST_SQL_TEMPLATE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String searchTerm = variantSearchTerm;
        boolean whereGeneFlag = false;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = searchTerm;

        if (!Strings.isNullOrEmpty(searchTerm)) {
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
        }

        GenomicFilterBuilder filterBuilder = new GenomicFilterBuilder(false);

        if (filters != null) {
            filterBuilder.populateFromGenomicFilters(filters);
        }

        StringBuilder baseSql = new StringBuilder(finalSql);
        String filterSql = filterBuilder.buildFilterSql(whereGeneFlag, baseSql);
        finalSql = baseSql.toString() + filterSql;

        // Add ORDER BY and pagination
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT " + rowCount + " OFFSET " + ((Optional.ofNullable(page).orElse(1) - 1) * rowCount);

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<Variant> variantList = new ArrayList<>();

        for (List<FieldValue> row : result.iterateAll()) {
            variantList.add(new Variant()
                    .variantId(bigQueryService.getString(row, rm.get("variant_id")))
                    .genes(bigQueryService.getString(row, rm.get("genes")))
                    .consequence(bigQueryService.getString(row, rm.get("cons_agg_str")))
                    .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                    .proteinChange(bigQueryService.getString(row, rm.get("protein_change")))
                    .clinicalSignificance(bigQueryService.getString(row, rm.get("clin_sig_agg_str")))
                    .alleleCount(bigQueryService.getLong(row, rm.get("allele_count")))
                    .alleleNumber(bigQueryService.getLong(row, rm.get("allele_number")))
                    .alleleFrequency(bigQueryService.getDouble(row, rm.get("allele_frequency")))
                    .homozygoteCount(bigQueryService.getLong(row, rm.get("homozygote_count")))
            );
        }

        VariantListResponse variantListResponse = new VariantListResponse();
        variantListResponse.setItems(variantList);
        return ResponseEntity.ok(variantListResponse);
    }

    @Override
    public ResponseEntity<GenomicFilters> getGenomicFilterOptions(String variantSearchTerm) {
        initCdrVersion();

        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String searchTerm = variantSearchTerm.trim();

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = searchTerm;
        String searchSqlQuery = "";

        if (!Strings.isNullOrEmpty(searchTerm)) {
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            searchSqlQuery = searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
        }

        String finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_CON + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_CLIN + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_UNION;

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);

        GenomicFilterOptionsBuilder builder = new GenomicFilterOptionsBuilder(false);

        for (List<FieldValue> row : result.iterateAll()) {
            builder.processSNVRow(
                    bigQueryService.getString(row, rm.get("option")),
                    bigQueryService.getString(row, rm.get("genes")),
                    bigQueryService.getString(row, rm.get("conseq")),
                    bigQueryService.getString(row, rm.get("variant_type")),
                    bigQueryService.getString(row, rm.get("clin_significance")),
                    bigQueryService.getLong(row, rm.get("gene_count")),
                    bigQueryService.getLong(row, rm.get("con_count")),
                    bigQueryService.getLong(row, rm.get("variant_type_count")),
                    bigQueryService.getLong(row, rm.get("clin_count")),
                    bigQueryService.getLong(row, rm.get("min_count")),
                    bigQueryService.getLong(row, rm.get("max_count"))
            );
        }

        return ResponseEntity.ok(builder.buildGenomicFilters(ConsequenceSeverityRanker.SNV_RANKS));
    }

    @Override
    public ResponseEntity<SVGenomicFilters> getSVGenomicFilterOptions(String variantSearchTerm) {
        initCdrVersion();

        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rawGeneSearchTerm = "";
        String searchTerm = variantSearchTerm.trim();

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = searchTerm;
        String searchSqlQuery = "";

        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            searchSqlQuery = searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();

            if (searchTermType.isWhereGeneFlag()) {
                rawGeneSearchTerm = searchTerm.toUpperCase().trim();
                searchSqlQuery += SV_GENE_CONSEQUENCE_FILTER;
            }
        }

        String finalSql = SV_FILTER_OPTION_SQL_TEMPLATE_GENE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_CON + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_SIZE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_FILTER + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_UNION;

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rawGene", QueryParameterValue.string(rawGeneSearchTerm))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);

        GenomicFilterOptionsBuilder builder = new GenomicFilterOptionsBuilder(true);

        for (List<FieldValue> row : result.iterateAll()) {
            builder.processSVRow(
                    bigQueryService.getString(row, rm.get("option")),
                    bigQueryService.getString(row, rm.get("genes")),
                    bigQueryService.getString(row, rm.get("variant_type")),
                    bigQueryService.getString(row, rm.get("consequence")),
                    bigQueryService.getString(row, rm.get("filter_value")),
                    bigQueryService.getLong(row, rm.get("min_count")),
                    bigQueryService.getLong(row, rm.get("max_count"))
            );
        }

        return ResponseEntity.ok(builder.buildSVGenomicFilters(ConsequenceSeverityRanker.SV_RANKS));
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getChartData() {
        initCdrVersion();
        ImmutableList<Long> analysisIds = ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_GENDER_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_AGE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_COMBINED_AGE_GENDER_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_RACE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_LOCATION_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID));
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(achillesAnalysisService.findAnalysisByIdsAndDomain(analysisIds, "Genomics"));
        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<VariantInfo> getVariantDetails(String variant_id) {
        initCdrVersion();
        String finalSql = VARIANT_DETAIL_SQL_TEMPLATE + WHERE_VARIANT_ID;
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();
        VariantInfo variantInfo = new VariantInfo()
                .variantId(variant_id)
                .dnaChange(bigQueryService.getString(row, rm.get("dna_change")))
                .transcript(bigQueryService.getString(row, rm.get("transcript")))
                .rsNumber(bigQueryService.getString(row, rm.get("rs_number")))
                .afrAlleleCount(bigQueryService.getLong(row, rm.get("afr_allele_count")))
                .afrAlleleNumber(bigQueryService.getLong(row, rm.get("afr_allele_number")))
                .afrAlleleFrequency(bigQueryService.getDouble(row, rm.get("afr_allele_frequency")))
                .afrHomozygoteCount(bigQueryService.getLong(row, rm.get("afr_homozygote_count")))
                .easAlleleCount(bigQueryService.getLong(row, rm.get("eas_allele_count")))
                .easAlleleNumber(bigQueryService.getLong(row, rm.get("eas_allele_number")))
                .easAlleleFrequency(bigQueryService.getDouble(row, rm.get("eas_allele_frequency")))
                .easHomozygoteCount(bigQueryService.getLong(row, rm.get("eas_homozygote_count")))
                .eurAlleleCount(bigQueryService.getLong(row, rm.get("eur_allele_count")))
                .eurAlleleNumber(bigQueryService.getLong(row, rm.get("eur_allele_number")))
                .eurAlleleFrequency(bigQueryService.getDouble(row, rm.get("eur_allele_frequency")))
                .eurHomozygoteCount(bigQueryService.getLong(row, rm.get("eur_homozygote_count")))
                .amrAlleleCount(bigQueryService.getLong(row, rm.get("amr_allele_count")))
                .amrAlleleNumber(bigQueryService.getLong(row, rm.get("amr_allele_number")))
                .amrAlleleFrequency(bigQueryService.getDouble(row, rm.get("amr_allele_frequency")))
                .amrHomozygoteCount(bigQueryService.getLong(row, rm.get("amr_homozygote_count")))
                .midAlleleCount(bigQueryService.getLong(row, rm.get("mid_allele_count")))
                .midAlleleNumber(bigQueryService.getLong(row, rm.get("mid_allele_number")))
                .midAlleleFrequency(bigQueryService.getDouble(row, rm.get("mid_allele_frequency")))
                .midHomozygoteCount(bigQueryService.getLong(row, rm.get("mid_homozygote_count")))
                .sasAlleleCount(bigQueryService.getLong(row, rm.get("sas_allele_count")))
                .sasAlleleNumber(bigQueryService.getLong(row, rm.get("sas_allele_number")))
                .sasAlleleFrequency(bigQueryService.getDouble(row, rm.get("sas_allele_frequency")))
                .sasHomozygoteCount(bigQueryService.getLong(row, rm.get("sas_homozygote_count")))
                .othAlleleCount(bigQueryService.getLong(row, rm.get("oth_allele_count")))
                .othAlleleNumber(bigQueryService.getLong(row, rm.get("oth_allele_number")))
                .othAlleleFrequency(bigQueryService.getDouble(row, rm.get("oth_allele_frequency")))
                .othHomozygoteCount(bigQueryService.getLong(row, rm.get("oth_homozygote_count")))
                .totalAlleleCount(bigQueryService.getLong(row, rm.get("total_allele_count")))
                .totalAlleleNumber(bigQueryService.getLong(row, rm.get("total_allele_number")))
                .totalAlleleFrequency(bigQueryService.getDouble(row, rm.get("total_allele_frequency")))
                .totalHomozygoteCount(bigQueryService.getLong(row, rm.get("total_homozygote_count")));
        return ResponseEntity.ok(variantInfo);
    }

    @Override
    public ResponseEntity<SVVariantInfo> getSVVariantDetails(String variant_id) {
        initCdrVersion();

        String finalSql = SV_VARIANT_DETAIL_SQL_TEMPLATE + WHERE_VARIANT_ID_OR_VCF;
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();
        SVVariantInfo variantInfo = new SVVariantInfo()
                .variantId(variant_id)
                .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                .variantIDVCF(bigQueryService.getString(row, rm.get("variant_id_vcf")))
                .consequenceGenes(bigQueryService.getString(row, rm.get("consequence_genes")))
                .position(bigQueryService.getString(row, rm.get("position")))
                .size(bigQueryService.getLong(row, rm.get("size")))
                .cpxIntervals(bigQueryService.getString(row, rm.get("cpx_intervals")))
                .cpxType(bigQueryService.getString(row, rm.get("cpx_type")))
                .noCallRate(bigQueryService.getDouble(row, rm.get("no_call_rate")))
                .qualityScore(bigQueryService.getDouble(row, rm.get("quality_score")))
                .filter(bigQueryService.getString(row, rm.get("filter")))
                .afrAlleleCount(bigQueryService.getLong(row, rm.get("afr_allele_count")))
                .afrAlleleNumber(bigQueryService.getLong(row, rm.get("afr_allele_number")))
                .afrAlleleFrequency(bigQueryService.getDouble(row, rm.get("afr_allele_frequency")))
                .afrHomozygoteCount(bigQueryService.getLong(row, rm.get("afr_homozygote_count")))
                .easAlleleCount(bigQueryService.getLong(row, rm.get("eas_allele_count")))
                .easAlleleNumber(bigQueryService.getLong(row, rm.get("eas_allele_number")))
                .easAlleleFrequency(bigQueryService.getDouble(row, rm.get("eas_allele_frequency")))
                .easHomozygoteCount(bigQueryService.getLong(row, rm.get("eas_homozygote_count")))
                .eurAlleleCount(bigQueryService.getLong(row, rm.get("eur_allele_count")))
                .eurAlleleNumber(bigQueryService.getLong(row, rm.get("eur_allele_number")))
                .eurAlleleFrequency(bigQueryService.getDouble(row, rm.get("eur_allele_frequency")))
                .eurHomozygoteCount(bigQueryService.getLong(row, rm.get("eur_homozygote_count")))
                .amrAlleleCount(bigQueryService.getLong(row, rm.get("amr_allele_count")))
                .amrAlleleNumber(bigQueryService.getLong(row, rm.get("amr_allele_number")))
                .amrAlleleFrequency(bigQueryService.getDouble(row, rm.get("amr_allele_frequency")))
                .amrHomozygoteCount(bigQueryService.getLong(row, rm.get("amr_homozygote_count")))
                .midAlleleCount(bigQueryService.getLong(row, rm.get("mid_allele_count")))
                .midAlleleNumber(bigQueryService.getLong(row, rm.get("mid_allele_number")))
                .midAlleleFrequency(bigQueryService.getDouble(row, rm.get("mid_allele_frequency")))
                .midHomozygoteCount(bigQueryService.getLong(row, rm.get("mid_homozygote_count")))
                .sasAlleleCount(bigQueryService.getLong(row, rm.get("sas_allele_count")))
                .sasAlleleNumber(bigQueryService.getLong(row, rm.get("sas_allele_number")))
                .sasAlleleFrequency(bigQueryService.getDouble(row, rm.get("sas_allele_frequency")))
                .sasHomozygoteCount(bigQueryService.getLong(row, rm.get("sas_homozygote_count")))
                .othAlleleCount(bigQueryService.getLong(row, rm.get("oth_allele_count")))
                .othAlleleNumber(bigQueryService.getLong(row, rm.get("oth_allele_number")))
                .othAlleleFrequency(bigQueryService.getDouble(row, rm.get("oth_allele_frequency")))
                .othHomozygoteCount(bigQueryService.getLong(row, rm.get("oth_homozygote_count")))
                .totalAlleleCount(bigQueryService.getLong(row, rm.get("total_allele_count")))
                .totalAlleleNumber(bigQueryService.getLong(row, rm.get("total_allele_number")))
                .totalAlleleFrequency(bigQueryService.getDouble(row, rm.get("total_allele_frequency")))
                .totalHomozygoteCount(bigQueryService.getLong(row, rm.get("total_homozygote_count")));
        return ResponseEntity.ok(variantInfo);
    }

    @Override
    public ResponseEntity<String> getSearchTermType(String query) {
        String searchTerm = query.trim();
        if (searchTerm.isEmpty()) {
            return ResponseEntity.badRequest().body("Search term cannot be empty.");
        }
        return ResponseEntity.ok(SearchTermPatterns.getTypeLabel(searchTerm));
    }

    public static GenomicSearchTermType getSearchType(String variantSearchTerm, String searchTerm) {
        GenomicSearchTermType searchTermType = new GenomicSearchTermType();
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        boolean whereGeneFlag = false;
        boolean whereVariantIdFlag = false;
        boolean whereContigFlag = false;
        boolean wherePositionFlag = false;
        boolean whereRsIdFlag = false;
        String contig = "(?i)(" + searchTerm + ")$";
        String searchSql = "";

        if (SearchTermPatterns.isGenomicRegion(searchTerm)) {
            String[] regionTermSplit = new String[0];
            if (searchTerm.contains(":")) {
                regionTermSplit = searchTerm.split(":");
                contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
            }
            whereContigFlag = true;
            searchSql = WHERE_CONTIG;
            if (regionTermSplit.length > 1) {
                String[] rangeSplit = regionTermSplit[1].split("-");
                try {
                    if (rangeSplit.length == 2) {
                        low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        wherePositionFlag = true;
                        searchSql += AND_POSITION;
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Trying to convert bad number.");
                }
            }
        } else if (SearchTermPatterns.isSNVVariantId(searchTerm)) {
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID;
        } else if (SearchTermPatterns.isRsNumber(searchTerm)) {
            whereRsIdFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                rs_id = "(?i)" + searchTerm;
                searchSql += WHERE_RS_NUMBER_CONTAINS;
            } else {
                rs_id = searchTerm;
                searchSql += WHERE_RS_NUMBER_EXACT;
            }
        } else {
            whereGeneFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                genes = searchTerm.toUpperCase();
            } else {
                genes = "\\b" + searchTerm.toUpperCase() + "\\b";
            }
            searchSql += WHERE_GENE_REGEX;
        }

        searchTermType.setVariantId(variant_id);
        searchTermType.setWhereVariantIdFlag(whereVariantIdFlag);
        searchTermType.setContig(contig);
        searchTermType.setLow(low);
        searchTermType.setHigh(high);
        searchTermType.setWhereContigFlag(whereContigFlag);
        searchTermType.setWherePositionFlag(wherePositionFlag);
        searchTermType.setRsId(rs_id);
        searchTermType.setWhereRsIdFlag(whereRsIdFlag);
        searchTermType.setGenes(genes);
        searchTermType.setWhereGeneFlag(whereGeneFlag);
        searchTermType.setSearchSqlQuery(searchSql);
        return searchTermType;
    }

    public static SVGenomicSearchTermType getSVSearchType(String variantSearchTerm, String searchTerm) {
        SVGenomicSearchTermType searchTermType = new SVGenomicSearchTermType();
        String variant_id = "";
        boolean whereVariantIdFlag = false;
        boolean whereGeneFlag = false;
        boolean wherePositionFlag = false;
        String contig = "(?i)(" + searchTerm + ")$";
        String searchSql = "";
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        boolean whereContigFlag = false;

        if (SearchTermPatterns.isSVVariantId(searchTerm)) {
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID_OR_VCF;
        } else if (SearchTermPatterns.isGenomicRegion(searchTerm)) {
            String[] regionTermSplit = new String[0];
            if (searchTerm.contains(":")) {
                regionTermSplit = searchTerm.split(":");
                contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
            }
            whereContigFlag = true;
            searchSql = WHERE_CHROM;
            if (regionTermSplit.length > 1) {
                String[] rangeSplit = regionTermSplit[1].split("-");
                try {
                    if (rangeSplit.length == 2) {
                        low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        wherePositionFlag = true;
                        searchSql += AND_POS;
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Trying to convert bad number.");
                }
            }
        } else {
            whereGeneFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                genes = searchTerm.toUpperCase();
            } else {
                genes = "(?i)(^|,)\\s*" + searchTerm.toUpperCase() + "\\s*(,|$)";
            }
            searchSql += WHERE_GENE_REGEX;
        }

        searchTermType.setVariantId(variant_id);
        searchTermType.setWhereVariantIdFlag(whereVariantIdFlag);
        searchTermType.setGenes(genes);
        searchTermType.setWhereGeneFlag(whereGeneFlag);
        searchTermType.setContig(contig);
        searchTermType.setLow(low);
        searchTermType.setHigh(high);
        searchTermType.setWhereContigFlag(whereContigFlag);
        searchTermType.setWherePositionFlag(wherePositionFlag);
        searchTermType.setSearchSqlQuery(searchSql);

        return searchTermType;
    }
}