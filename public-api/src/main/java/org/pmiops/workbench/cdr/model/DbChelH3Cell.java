package org.pmiops.workbench.cdr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chel_h3_cell")
public class DbChelH3Cell {

    private String h3Id;
    private int cellIndex;
    private int resolution;
    private double centroidLat;
    private double centroidLon;

    @Id
    @Column(name = "h3_id")
    public String getH3Id() {
        return h3Id;
    }

    public void setH3Id(String h3Id) {
        this.h3Id = h3Id;
    }

    public DbChelH3Cell h3Id(String h3Id) {
        this.h3Id = h3Id;
        return this;
    }

    @Column(name = "cell_index")
    public int getCellIndex() {
        return cellIndex;
    }

    public void setCellIndex(int cellIndex) {
        this.cellIndex = cellIndex;
    }

    public DbChelH3Cell cellIndex(int cellIndex) {
        this.cellIndex = cellIndex;
        return this;
    }

    @Column(name = "resolution")
    public int getResolution() {
        return resolution;
    }

    public void setResolution(int resolution) {
        this.resolution = resolution;
    }

    public DbChelH3Cell resolution(int resolution) {
        this.resolution = resolution;
        return this;
    }

    @Column(name = "centroid_lat")
    public double getCentroidLat() {
        return centroidLat;
    }

    public void setCentroidLat(double centroidLat) {
        this.centroidLat = centroidLat;
    }

    public DbChelH3Cell centroidLat(double centroidLat) {
        this.centroidLat = centroidLat;
        return this;
    }

    @Column(name = "centroid_lon")
    public double getCentroidLon() {
        return centroidLon;
    }

    public void setCentroidLon(double centroidLon) {
        this.centroidLon = centroidLon;
    }

    public DbChelH3Cell centroidLon(double centroidLon) {
        this.centroidLon = centroidLon;
        return this;
    }
}