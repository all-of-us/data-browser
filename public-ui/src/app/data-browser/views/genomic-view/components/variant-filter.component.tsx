import * as React from "react";

import { VariantFilterItemComponent } from "app/data-browser/views/genomic-view/components/variant-filter-item.component";
import { reactStyles } from "app/utils";
import { GenomicFilters } from "publicGenerated";

const styles = reactStyles({
    filterBox: {
        top: ".5rem",
        position: "absolute",
        padding: ".5rem",
        zIndex: 10,
        borderRadius: "0 6px 6px 0",
        backgroundColor: "#FFFFFF",
        boxShadow:
            "0 1px 3px 0 rgba(0,0,0,0.15), 0 0 2px 0 rgba(0,0,0,0.25), 0 2px 2px 0 rgba(0,0,0,0.15)",
        width: "264px",
        height: "421px",
    },
    filterItemHandleClosed: {
        transform: "rotate(90deg)",
    },
    actionBtnContainer: {
        position: "absolute",
        bottom: ".5rem",
        width: "100%",
        display: "flex",
        fontSize: "1.1em",
    },
    clearBtn: {
        textTransform: "uppercase",
        borderRadius: "2px",
        padding: "1rem",
        border: "none",
        background: "transparent",
        width: "45%",
    },
    applyBtn: {
        textTransform: "uppercase",
        borderRadius: "2px",
        padding: "1rem",
        border: "none",
        background: "#262262",
        color: "white",
        width: "45%",
    },
    filterItems: {
        maxHeight: "340px",
        overflowY: "auto",
    },
});

export interface Cat {
    display: String;
    field: String;
}

interface Props {
    filterMetadata: GenomicFilters;
    onFilterSubmit: Function;

}
interface State {
    filterCats: Cat[];
    filteredMetadata: any;
    cleared: Boolean;
    ogFilterMetaData: any;
    
}

export class VariantFilterComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filterCats: [
                { display: 'Gene', field: 'gene' },
                { display: 'Consequence', field: 'consequence' },
                { display: 'ClinVar Significance', field: 'clinicalSignificance' },
                { display: 'Allele Count', field: 'alleleCount' },
                { display: 'Allele Number', field: 'alleleNumber' },
                { display: 'Allele Frequency', field: 'alleleFrequency' },
            ],
            filteredMetadata: this.props.filterMetadata,
            cleared:true,
            ogFilterMetaData: JSON.parse(localStorage.getItem("originalFilterMetadata") || '{}')
        };
    }

    handleFilterChange(filteredItem: GenomicFilters, cat: Cat) {
        const filterMetadataChange = this.props.filterMetadata;
        filterMetadataChange[cat.field.toString()] = filteredItem;
        this.setState({ filteredMetadata: filterMetadataChange });
    }

    submitFilter(filteredMetadata: GenomicFilters) {
        // tslint:disable-next-line: forin
        for (const key in filteredMetadata) {
            const filterItem = filteredMetadata[key];
            const touched = Array.isArray(filterItem) && filterItem.some((t => t.checked));
            if (Array.isArray(filterItem)) {
                if (!touched) {
                    filteredMetadata[key] = filterItem.forEach((item) => {
                        item.checked = true;
                    });
                    filteredMetadata[key] = filterItem;
                }
            }
        }
        filteredMetadata = this.state.filteredMetadata;
        this.props.onFilterSubmit(filteredMetadata);
    }

    handleClear() {
        const ogFilterMetaData = JSON.parse(localStorage.getItem("originalFilterMetadata") || '{}');
         // tslint:disable-next-line: forin
         for (const key in this.state.filteredMetadata) {
            this.state.filteredMetadata[key] = ogFilterMetaData[key];
         }
         this.setState({cleared:false,filteredMetadata: this.state.filteredMetadata},()=>this.setState({cleared:true}));
    }

    render() {
        const { filterMetadata } = this.props;
        const { filterCats, filteredMetadata, cleared } = this.state;
        return <div style={styles.filterBox}>
            <div style={styles.filterItems}>
                {filterCats.map((cat, index) => {
                    const key = 'cat' + index;
                    {
                        return cleared && filterMetadata && filteredMetadata &&
                            <VariantFilterItemComponent
                                onFilterChange={(e) => this.handleFilterChange(e, cat)}
                                key={key}
                                category={cat}
                                cleared = {cleared}
                                filterItem={filteredMetadata[cat.field.toString()]} />;
                    }
                })
                }
                <div style={styles.actionBtnContainer}>
                    <button onClick={() => this.handleClear()} style={styles.clearBtn}>Clear</button>
                    <button onClick={() => this.submitFilter(filteredMetadata)} style={styles.applyBtn}>Apply</button>
                </div>
            </div>
        </div>;
    }
}
