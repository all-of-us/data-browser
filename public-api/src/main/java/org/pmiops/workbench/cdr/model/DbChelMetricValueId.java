package org.pmiops.workbench.cdr.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DbChelMetricValueId implements Serializable {

    private String metricKey;
    private String h3Id;

    public DbChelMetricValueId() {}

    public DbChelMetricValueId(String metricKey, String h3Id) {
        this.metricKey = metricKey;
        this.h3Id = h3Id;
    }

    public String getMetricKey() {
        return metricKey;
    }

    public void setMetricKey(String metricKey) {
        this.metricKey = metricKey;
    }

    public DbChelMetricValueId metricKey(String metricKey) {
        this.metricKey = metricKey;
        return this;
    }

    public String getH3Id() {
        return h3Id;
    }

    public void setH3Id(String h3Id) {
        this.h3Id = h3Id;
    }

    public DbChelMetricValueId h3Id(String h3Id) {
        this.h3Id = h3Id;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        DbChelMetricValueId that = (DbChelMetricValueId) o;
        return Objects.equals(metricKey, that.metricKey) && Objects.equals(h3Id, that.h3Id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(metricKey, h3Id);
    }
}