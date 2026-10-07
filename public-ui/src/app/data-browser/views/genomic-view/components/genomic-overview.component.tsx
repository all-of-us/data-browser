import * as React from "react";

import { environment } from "environments/environment";
import { HeatMapReactComponent } from "app/data-browser/components/heat-map/heat-map.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";

import { GenomicChartComponent } from "./genomic-chart.component";
import { GENOMIC_DATA_TYPES, getGenomicDataType } from "./genomic-data-types";

const css = `
.genotype-select {
  position: relative;
  display: inline-block;
  min-width: 18rem;
  font-size: 14px;
}
.genotype-select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.75rem;
  background: white;
  border: 1px solid rgba(38, 34, 98, 0.4);
  border-radius: 3px;
  color: #262262;
  font-family: GothamBook, Arial, Helvetica, sans-serif;
  font-size: 1em;
  text-align: left;
  cursor: pointer;
}
.genotype-select-button:focus-visible,
.genotype-select-option:focus-visible {
  outline: 2px solid #216fb4;
  outline-offset: 1px;
}
.genotype-select-list {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  z-index: 10;
  width: 100%;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  background: white;
  border: 1px solid rgba(38, 34, 98, 0.4);
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.genotype-select-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  color: #262262;
  cursor: pointer;
}
.genotype-select-option:hover,
.genotype-select-option[aria-selected='true'] {
  background: rgba(33, 111, 180, 0.08);
}
.genotype-bullet {
  flex: none;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}
.genotype-select-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-container {
background: #f3f8fb;
}


`;
const styles = reactStyles({
  innerContainer: {
    background: "white",
  },
  title: {
    margin: "0",
  },
  desc: {
    color: "#302C71",
    margin: "0",
    fontSize: ".8em",
  },
  selectGenotypeData: {
    marginBottom: "1em",
    width: "80%",
    // minWidth: " 5rem"
  },
  chartContainer: {
    background: "rgba(33,111,180,0.05)",
    padding: "1em",
    paddingTop: ".25em",
    marginBottom: "1em",
  },
  chartTitle: {
    fontSize: "1em",
    paddingBottom: ".5em",
  },
});
interface Props {
  participantCount: string;
  chartData: any[];
}
interface State {
  loading: boolean;
  raceEthData: any;
  sexAtBirthData: any;
  currentAgeData: any;
  combinedAgeSexData: any;
  participantCounts: any[];
  selectedGenotype: string;
  locationData: any;
  dropdownOpen: boolean;
}

export class GenomicOverviewComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      raceEthData: [],
      sexAtBirthData: [],
      currentAgeData: [],
      combinedAgeSexData: [],
      participantCounts: [],
      locationData: {},
      selectedGenotype: "wgs_shortread",
      dropdownOpen: false,
    };
    this.dropdownRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  dropdownRef: React.RefObject<HTMLDivElement>;

  raceEthArr: any[] = [];
  sexAtBirthArr: any[] = [];
  currentAgeArr: any[] = [];
  combinedAgeSexArr: any[] = [];
  participantCountsArr: any[] = [];
  locationData: object = {};

  componentDidMount() {
    // { this.props.chartData && this.getGenomicChartData(); }
    this.getGenomicChartData();
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event: MouseEvent) {
    if (
      this.state.dropdownOpen &&
      this.dropdownRef.current &&
      !this.dropdownRef.current.contains(event.target as Node)
    ) {
      this.setState({ dropdownOpen: false });
    }
  }

  getGenomicChartData() {
    this.props.chartData.forEach((item) => {
      switch (item.analysisId) {
        case 3503:
          this.raceEthArr.push(item);
          break;
        case 3501:
          this.sexAtBirthArr.push(item);
          break;
        case 3502:
          this.currentAgeArr.push(item);
          break;
        case 3505:
          this.combinedAgeSexArr.push(item);
          break;
        case 3508:
          this.locationData = item;
          console.log(this.locationData, "locationData");
          break;
        case 3000:
          this.participantCountsArr.push(item);
      }
    });
    if (this.currentAgeArr && this.currentAgeArr[0]) {
      this.currentAgeArr[0].results.map((o) => {
        o.analysisStratumName = o.stratum2;
      });
      this.currentAgeArr[0].results.sort((a, b) =>
        a.analysisStratumName.localeCompare(b.analysisStratumName)
      );
    }
    this.setState({
      raceEthData:
        this.raceEthArr && this.raceEthArr[0] ? this.raceEthArr[0] : null,
      sexAtBirthData:
        this.sexAtBirthArr && this.sexAtBirthArr[0]
          ? this.sexAtBirthArr[0]
          : null,
      currentAgeData:
        this.currentAgeArr && this.currentAgeArr[0]
          ? this.currentAgeArr[0]
          : null,
      combinedAgeSexData:
        this.combinedAgeSexArr && this.combinedAgeSexArr[0]
          ? this.combinedAgeSexArr[0]
          : null,
      locationData: this.locationData ? this.locationData : null,
      participantCounts: this.participantCountsArr,
      loading: false,
    });
  }

  onGenotypeSelect(value: string) {
    this.setState({ selectedGenotype: value, dropdownOpen: false });
  }

  // Data types with participants in this CDR, in display order. Types missing from the
  // counts (e.g. a CDR built before the RNASeq/proteomics prep tables) are left out.
  availableDataTypes() {
    const { participantCounts } = this.state;
    const countResults =
      participantCounts && participantCounts[0]
        ? participantCounts[0].results
        : [];
    return GENOMIC_DATA_TYPES.filter((type) =>
      countResults.some((r) => r.stratum4 === type.value && r.countValue > 0)
    );
  }

  renderDataTypeSelect() {
    const { selectedGenotype, dropdownOpen } = this.state;
    const options = this.availableDataTypes();
    const selected = getGenomicDataType(selectedGenotype);
    return (
      <div className="genotype-select" ref={this.dropdownRef}>
        <button
          type="button"
          className="genotype-select-button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          onClick={() => this.setState({ dropdownOpen: !dropdownOpen })}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              this.setState({ dropdownOpen: false });
            }
          }}
        >
          <span className="genotype-select-label">
            {selected && (
              <span
                className="genotype-bullet"
                style={{ background: selected.color }}
              />
            )}
            {selected ? selected.label : "Select a data type"}
          </span>
          <ClrIcon shape="angle" dir={dropdownOpen ? "up" : "down"} />
        </button>
        {dropdownOpen && (
          <ul className="genotype-select-list" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                className="genotype-select-option"
                role="option"
                tabIndex={0}
                aria-selected={option.value === selectedGenotype}
                onClick={() => this.onGenotypeSelect(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.onGenotypeSelect(option.value);
                  } else if (e.key === "Escape") {
                    this.setState({ dropdownOpen: false });
                  }
                }}
              >
                <span
                  className="genotype-bullet"
                  style={{ background: option.color }}
                />
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  render() {
    const {
      raceEthData,
      sexAtBirthData,
      currentAgeData,
      combinedAgeSexData,
      locationData,
      participantCounts,
      selectedGenotype,
      loading,
    } = this.state;
    const color = getGenomicDataType(selectedGenotype)?.color;

    return (
      <React.Fragment>
        <style>{css}</style>
        <div style={styles.innerContainer}>
          {!loading && (
            <div style={styles.selectGenotypeData}>
              {this.renderDataTypeSelect()}
            </div>
          )}
          {!loading && (
            <React.Fragment>
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Self-reported categories"
                data={raceEthData}
                selectedGenotype={selectedGenotype}
                color={color}
              />
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Age + Sex"
                data={combinedAgeSexData}
                selectedGenotype={selectedGenotype}
                color={color}
              />
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Location</h3>
                <HeatMapReactComponent
                  locationAnalysis={locationData}
                  domain="genomic"
                  selectedResult={selectedGenotype}
                  color={color}
                />
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
