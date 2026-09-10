package org.pmiops.workbench.cdr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * One row per metric-year of CHEL public-tier data. The scale/legend configuration delivered
 * separately as chel_metric_scale_config is folded in here: it is 1:1 with the catalog and
 * splitting it would force a join on every metric list request.
 */
@Entity
@Table(name = "chel_metric")
public class DbChelMetric {

    private String metricKey;
    private int year;
    private String metricId;
    private String title;
    private String description;
    private String metricGroup;
    private String unit;
    private String valueType;
    private Boolean higherIsWorse;
    private String paletteName;
    private boolean reversePalette;
    private int legendDecimals;
    private String displayFormat;
    private int sortOrder;
    private Double minValue;
    private Double maxValue;
    private Double p01;
    private Double p05;
    private Double p25;
    private Double p50;
    private Double p75;
    private Double p95;
    private Double p99;
    private String breaksJson;
    private Integer nonMissingCount;
    private Integer missingCount;

    /** Stable client-facing identifier, "{year}_{metricId}" — metric ids repeat across vintages. */
    @Id
    @Column(name = "metric_key")
    public String getMetricKey() {
        return metricKey;
    }

    public void setMetricKey(String metricKey) {
        this.metricKey = metricKey;
    }

    public DbChelMetric metricKey(String metricKey) {
        this.metricKey = metricKey;
        return this;
    }

    @Column(name = "metric_year")
    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public DbChelMetric year(int year) {
        this.year = year;
        return this;
    }

    @Column(name = "metric_id")
    public String getMetricId() {
        return metricId;
    }

    public void setMetricId(String metricId) {
        this.metricId = metricId;
    }

    public DbChelMetric metricId(String metricId) {
        this.metricId = metricId;
        return this;
    }

    @Column(name = "title")
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public DbChelMetric title(String title) {
        this.title = title;
        return this;
    }

    @Column(name = "description")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DbChelMetric description(String description) {
        this.description = description;
        return this;
    }

    @Column(name = "metric_group")
    public String getMetricGroup() {
        return metricGroup;
    }

    public void setMetricGroup(String metricGroup) {
        this.metricGroup = metricGroup;
    }

    public DbChelMetric metricGroup(String metricGroup) {
        this.metricGroup = metricGroup;
        return this;
    }

    @Column(name = "unit")
    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public DbChelMetric unit(String unit) {
        this.unit = unit;
        return this;
    }

    @Column(name = "value_type")
    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public DbChelMetric valueType(String valueType) {
        this.valueType = valueType;
        return this;
    }

    /** Nullable on purpose — E_WLKIND ships with no direction set. */
    @Column(name = "higher_is_worse")
    public Boolean getHigherIsWorse() {
        return higherIsWorse;
    }

    public void setHigherIsWorse(Boolean higherIsWorse) {
        this.higherIsWorse = higherIsWorse;
    }

    public DbChelMetric higherIsWorse(Boolean higherIsWorse) {
        this.higherIsWorse = higherIsWorse;
        return this;
    }

    @Column(name = "palette_name")
    public String getPaletteName() {
        return paletteName;
    }

    public void setPaletteName(String paletteName) {
        this.paletteName = paletteName;
    }

    public DbChelMetric paletteName(String paletteName) {
        this.paletteName = paletteName;
        return this;
    }

    @Column(name = "reverse_palette")
    public boolean getReversePalette() {
        return reversePalette;
    }

    public void setReversePalette(boolean reversePalette) {
        this.reversePalette = reversePalette;
    }

    public DbChelMetric reversePalette(boolean reversePalette) {
        this.reversePalette = reversePalette;
        return this;
    }

    @Column(name = "legend_decimals")
    public int getLegendDecimals() {
        return legendDecimals;
    }

    public void setLegendDecimals(int legendDecimals) {
        this.legendDecimals = legendDecimals;
    }

    public DbChelMetric legendDecimals(int legendDecimals) {
        this.legendDecimals = legendDecimals;
        return this;
    }

    @Column(name = "display_format")
    public String getDisplayFormat() {
        return displayFormat;
    }

    public void setDisplayFormat(String displayFormat) {
        this.displayFormat = displayFormat;
    }

    public DbChelMetric displayFormat(String displayFormat) {
        this.displayFormat = displayFormat;
        return this;
    }

    @Column(name = "sort_order")
    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public DbChelMetric sortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
        return this;
    }

    @Column(name = "min_value")
    public Double getMinValue() {
        return minValue;
    }

    public void setMinValue(Double minValue) {
        this.minValue = minValue;
    }

    public DbChelMetric minValue(Double minValue) {
        this.minValue = minValue;
        return this;
    }

    @Column(name = "max_value")
    public Double getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Double maxValue) {
        this.maxValue = maxValue;
    }

    public DbChelMetric maxValue(Double maxValue) {
        this.maxValue = maxValue;
        return this;
    }

    @Column(name = "p01")
    public Double getP01() {
        return p01;
    }

    public void setP01(Double p01) {
        this.p01 = p01;
    }

    public DbChelMetric p01(Double p01) {
        this.p01 = p01;
        return this;
    }

    @Column(name = "p05")
    public Double getP05() {
        return p05;
    }

    public void setP05(Double p05) {
        this.p05 = p05;
    }

    public DbChelMetric p05(Double p05) {
        this.p05 = p05;
        return this;
    }

    @Column(name = "p25")
    public Double getP25() {
        return p25;
    }

    public void setP25(Double p25) {
        this.p25 = p25;
    }

    public DbChelMetric p25(Double p25) {
        this.p25 = p25;
        return this;
    }

    @Column(name = "p50")
    public Double getP50() {
        return p50;
    }

    public void setP50(Double p50) {
        this.p50 = p50;
    }

    public DbChelMetric p50(Double p50) {
        this.p50 = p50;
        return this;
    }

    @Column(name = "p75")
    public Double getP75() {
        return p75;
    }

    public void setP75(Double p75) {
        this.p75 = p75;
    }

    public DbChelMetric p75(Double p75) {
        this.p75 = p75;
        return this;
    }

    @Column(name = "p95")
    public Double getP95() {
        return p95;
    }

    public void setP95(Double p95) {
        this.p95 = p95;
    }

    public DbChelMetric p95(Double p95) {
        this.p95 = p95;
        return this;
    }

    @Column(name = "p99")
    public Double getP99() {
        return p99;
    }

    public void setP99(Double p99) {
        this.p99 = p99;
    }

    public DbChelMetric p99(Double p99) {
        this.p99 = p99;
        return this;
    }

    /** JSON array of recommended legend break values, passed through to the client verbatim. */
    @Column(name = "breaks_json")
    public String getBreaksJson() {
        return breaksJson;
    }

    public void setBreaksJson(String breaksJson) {
        this.breaksJson = breaksJson;
    }

    public DbChelMetric breaksJson(String breaksJson) {
        this.breaksJson = breaksJson;
        return this;
    }

    @Column(name = "non_missing_count")
    public Integer getNonMissingCount() {
        return nonMissingCount;
    }

    public void setNonMissingCount(Integer nonMissingCount) {
        this.nonMissingCount = nonMissingCount;
    }

    public DbChelMetric nonMissingCount(Integer nonMissingCount) {
        this.nonMissingCount = nonMissingCount;
        return this;
    }

    @Column(name = "missing_count")
    public Integer getMissingCount() {
        return missingCount;
    }

    public void setMissingCount(Integer missingCount) {
        this.missingCount = missingCount;
    }

    public DbChelMetric missingCount(Integer missingCount) {
        this.missingCount = missingCount;
        return this;
    }
}