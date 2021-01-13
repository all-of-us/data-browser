package org.pmiops.workbench.cdr.model;

import org.apache.commons.lang3.builder.ToStringBuilder;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.pmiops.workbench.model.AchillesResultDist;


@Entity
//TODO need to add a way to dynamically switch between database versions
//this dynamic connection will eliminate the need for the catalog attribute
@Table(name = "achilles_analysis")
public class DbAchillesAnalysis {


    private Long analysisId;
    private String analysisName;
    private String stratum1Name;
    private String stratum2Name;
    private String stratum3Name;
    private String stratum4Name;
    private String stratum5Name;
    private String stratum6Name;
    private String stratum7Name;
    private String chartType;
    private String dataType;
    private String unitName;
    private List<DbAchillesResult> results = new ArrayList<>();
    private List<AchillesResultDist> achillesResultDistList = new ArrayList<>();

    public DbAchillesAnalysis() {}

    // Copy constructor for copying everything but results
    public DbAchillesAnalysis(DbAchillesAnalysis a) {
        this.analysisId(a.getAnalysisId())
                .analysisName(a.getAnalysisName())
                .stratum1Name(a.getStratum1Name())
                .stratum2Name(a.getStratum2Name())
                .stratum3Name(a.getStratum3Name())
                .stratum4Name(a.getStratum4Name())
                .stratum5Name(a.getStratum5Name())
                .stratum6Name(a.getStratum6Name())
                .stratum7Name(a.getStratum7Name())
                .chartType(a.getChartType())
                .dataType(a.getDataType())
                .results(new ArrayList<>())
                .achillesResultDistList(new ArrayList<>());
    }

    @Id
    @Column(name="analysis_id")
    public Long getAnalysisId() {
        return analysisId;
    }
    public void setAnalysisId(Long analysisId) {
        this.analysisId = analysisId;
    }
    public DbAchillesAnalysis analysisId(Long val) {
        this.analysisId = val;
        return this;
    }

    @Column(name="analysis_name")
    public String getAnalysisName() {
        return analysisName;
    }
    public void setAnalysisName(String analysisName) {
        this.analysisName = analysisName;
    }
    public DbAchillesAnalysis analysisName(String val) {
        this.analysisName = val;
        return this;
    }

    @Column(name="stratum_1_name")
    public String getStratum1Name() {
        return stratum1Name;
    }
    public void setStratum1Name(String stratum1Name) {
        this.stratum1Name = stratum1Name;
    }
    public DbAchillesAnalysis stratum1Name(String val) {
        this.stratum1Name = val;
        return this;
    }

    @Column(name="stratum_2_name")
    public String getStratum2Name() {
        return stratum2Name;
    }
    public void setStratum2Name(String stratum2Name) {
        this.stratum2Name = stratum2Name;
    }
    public DbAchillesAnalysis stratum2Name(String val) {
        this.stratum2Name = val;
        return this;
    }

    @Column(name="stratum_3_name")
    public String getStratum3Name() {
        return stratum3Name;
    }
    public void setStratum3Name(String stratum3Name) {
        this.stratum3Name = stratum3Name;
    }
    public DbAchillesAnalysis stratum3Name(String val) {
        this.stratum3Name = val;
        return this;
    }

    @Column(name="stratum_4_name")
    public String getStratum4Name() {
        return stratum4Name;
    }
    public void setStratum4Name(String stratum4Name) {
        this.stratum4Name = stratum4Name;
    }
    public DbAchillesAnalysis stratum4Name(String val) {
        this.stratum4Name = val;
        return this;
    }

    @Column(name="stratum_5_name")
    public String getStratum5Name() {
        return stratum5Name;
    }
    public void setStratum5Name(String stratum5Name) {
        this.stratum5Name = stratum5Name;
    }
    public DbAchillesAnalysis stratum5Name(String val) {
        this.stratum5Name = val;
        return this;
    }

    @Column(name="stratum_6_name")
    public String getStratum6Name() {
        return stratum6Name;
    }
    public void setStratum6Name(String stratum6Name) {
        this.stratum6Name = stratum6Name;
    }
    public DbAchillesAnalysis stratum6Name(String val) {
        this.stratum6Name = val;
        return this;
    }

    @Column(name="stratum_7_name")
    public String getStratum7Name() {
        return stratum7Name;
    }
    public void setStratum7Name(String stratum7Name) {
        this.stratum7Name = stratum7Name;
    }
    public DbAchillesAnalysis stratum7Name(String val) {
        this.stratum7Name = val;
        return this;
    }

    @Column(name="chart_type")
    public String getChartType() {
        return chartType;
    }
    public void setChartType(String stratum5) {
        this.chartType = chartType;
    }
    public DbAchillesAnalysis chartType(String val) {
        this.chartType = val;
        return this;
    }

    @Column(name="data_type")
    public String getDataType() {
        return dataType;
    }
    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
    public DbAchillesAnalysis dataType(String val) {
        this.dataType = val;
        return this;
    }

    @Transient
    public String getUnitName() {
        return unitName;
    }
    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }
    public DbAchillesAnalysis unitName(String unitName) {
        this.unitName = unitName;
        return this;
    }

    @OneToMany(fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "analysis")
    public List<DbAchillesResult> getResults() {
        return results;
    }
    public void setResults(List<DbAchillesResult> results) {
        this.results = results;
    }
    public DbAchillesAnalysis results(List<DbAchillesResult> results) {
        this.results = results;
        return this;
    }

    public DbAchillesAnalysis addResult(DbAchillesResult result) {
        this.results.add(result);
        result.setAnalysis(this);
        return this;
    }

    public DbAchillesAnalysis removeResult(DbAchillesResult result) {
        this.results.remove(result);
        result.setAnalysis(null);
        return this;
    }

    @Transient
    public List<AchillesResultDist> getAchillesResultDistList() {
        return achillesResultDistList;
    }

    public void setAchillesResultDistList(List<AchillesResultDist> achillesResultDistList) {
        this.achillesResultDistList = achillesResultDistList;
    }
    public DbAchillesAnalysis achillesResultDistList(List<AchillesResultDist> achillesResultDistList) {
        this.achillesResultDistList = achillesResultDistList;
        return this;
    }
    public void addDistResult(AchillesResultDist achillesResultDist) {
        this.achillesResultDistList.add(achillesResultDist);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DbAchillesAnalysis that = (DbAchillesAnalysis) o;
        return Objects.equals(analysisId, that.analysisId) &&
                Objects.equals(analysisName, that.analysisName) &&
                Objects.equals(stratum1Name, that.stratum1Name) &&
                Objects.equals(stratum2Name, that.stratum2Name) &&
                Objects.equals(stratum3Name, that.stratum3Name) &&
                Objects.equals(stratum4Name, that.stratum4Name) &&
                Objects.equals(stratum5Name, that.stratum5Name) &&
                Objects.equals(chartType, that.chartType) &&
                Objects.equals(dataType, that.dataType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(analysisId, analysisName, stratum1Name, stratum2Name, stratum3Name, stratum4Name, stratum5Name, chartType, dataType);
    }

    @Override
    public String toString() {
        return  ToStringBuilder.reflectionToString(this);
    }
}
