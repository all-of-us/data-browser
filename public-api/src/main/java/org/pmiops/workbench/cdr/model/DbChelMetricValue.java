package org.pmiops.workbench.cdr.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "chel_h3_metric_value")
public class DbChelMetricValue {

    private DbChelMetricValueId dbChelMetricValueId;
    private Double metricValue;

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "metricKey", column = @Column(name = "metric_key")),
            @AttributeOverride(name = "h3Id", column = @Column(name = "h3_id"))
    })
    public DbChelMetricValueId getDbChelMetricValueId() {
        return dbChelMetricValueId;
    }

    public void setDbChelMetricValueId(DbChelMetricValueId dbChelMetricValueId) {
        this.dbChelMetricValueId = dbChelMetricValueId;
    }

    public DbChelMetricValue dbChelMetricValueId(DbChelMetricValueId dbChelMetricValueId) {
        this.dbChelMetricValueId = dbChelMetricValueId;
        return this;
    }

    /**
     * Nullable. The delivered fact table encodes missing values as -999.0 with is_null='false';
     * the loader is responsible for converting those to NULL before they reach this column.
     */
    @Column(name = "metric_value")
    public Double getMetricValue() {
        return metricValue;
    }

    public void setMetricValue(Double metricValue) {
        this.metricValue = metricValue;
    }

    public DbChelMetricValue metricValue(Double metricValue) {
        this.metricValue = metricValue;
        return this;
    }
}