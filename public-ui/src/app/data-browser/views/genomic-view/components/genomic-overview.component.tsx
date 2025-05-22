import * as React from "react";

import { reactStyles } from "app/utils";

import { GenomicChartComponent } from "./genomic-chart.component";
import { HeatMapReactComponent } from "app/data-browser/components/heat-map/heat-map.component";
import { environment } from "environments/environment";

const css = `
label {
  display: flex;
  align-items: center;
}
input[type='radio']{
  appearance: none;
  height: 1rem;
  width: 1rem;
  border: 1px solid #FAAF56;
  border-radius:50%;
  margin-right:0.5rem;
  margin-left: 1em;
  // outline-color:#FAAF56;
}
input:focus{
  outline:none;
  
}
input[type='radio']:before {
  content: '';
  display: block;
  width: 50%;
  height: 50%;
  margin: 50%;
  transform: translate(-50%,-50%);
  border-radius: 50%;
}
#radio-orange[type='radio']:checked:before {
  background:#FAAF56;
}

#radio-red{
  border-color:#93003A
}
#radio-red:checked:before{
  background:#93003A
}
#radio-teal{
  border-color:#6F98A0
}
#radio-teal:checked:before{
  background:#6F98A0
}
#radio-blue{
  border-color:#01429D
}
#radio-blue:checked:before{
  background:#01429D
}

.radio-label {
    cursor: pointer;
    display: grid;
    grid-template-columns: 2rem 1fr;
    align-items: center;
}

.radio-label input {
  cursor: pointer;
}

.heading-layout {
  font-size: 14px;
  display: grid;
  grid-template-columns: 10rem 10rem 17rem 10rem;
  // justify-content: space-between;
}

.chart-container {
background: #f3f8fb;
}



@media only screen and (max-width: 900px) {
    .heading-layout {
      grid-template-columns:50% 50%;
      row-gap: 1rem;
    }
}
@media only screen and (max-width: 700px) {
    .heading-layout {
      grid-template-columns:100%;
      row-gap: 1rem;
    }
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
  color: string;
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
      color: "#6F98A0",
    };
    this.onGenotypeSelect = this.onGenotypeSelect.bind(this);
  }

  raceEthArr: any[] = [];
  sexAtBirthArr: any[] = [];
  currentAgeArr: any[] = [];
  combinedAgeSexArr: any[] = [];
  participantCountsArr: any[] = [];
  locationData: object = {};

  componentDidMount() {
    // { this.props.chartData && this.getGenomicChartData(); }
    this.getGenomicChartData();
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

  onGenotypeSelect(event) {
    this.setState({ selectedGenotype: event.target.value });
    switch (event.target.value) {
      case "micro-array":
        this.setState({ color: "#FAAF56" });
        break;
      case "wgs_structural_variants":
        this.setState({ color: "#93003A" });
        break;
      case "wgs_shortread":
        this.setState({ color: "#6F98A0" });
        break;
      case "wgs_longread":
        this.setState({ color: "#01429D" });
        break;
    }
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
      color,
    } = this.state;
    const { participantCount } = this.props;
    let countResults = [];
    let wgsSRParticipantCount = 0;
    let wgsLRParticipantCount = 0;
    let wgsSVParticipantCount = 0;
    let arrayParticipantCount = 0;

    if (!loading && participantCounts) {
      countResults = participantCounts[0].results;

      wgsSRParticipantCount = countResults.filter(
        (r) => r.stratum4 === "wgs_shortread"
      )[0].countValue;
      wgsLRParticipantCount = countResults.filter(
        (r) => r.stratum4 === "wgs_longread"
      )[0].countValue;
      wgsSVParticipantCount = countResults.filter(
        (r) => r.stratum4 === "wgs_structural_variants"
      )[0].countValue;
      arrayParticipantCount = countResults.filter(
        (r) => r.stratum4 === "micro-array"
      )[0].countValue;
    }

    return (
      <React.Fragment>
        <style>{css}</style>
        <div style={styles.innerContainer}>
          {!loading && (
            <form
              style={styles.selectGenotypeData}
              onChange={this.onGenotypeSelect}
              id="selectGenotypeDataForm"
            >
              <div className="heading-layout">
                {wgsSRParticipantCount > 0 && (
                  <React.Fragment>
                    <label className="radio-label">
                      <input
                        id="radio-teal"
                        type="radio"
                        value="wgs_shortread"
                        name="genotype"
                        defaultChecked={selectedGenotype === "wgs_shortread"}
                      />{" "}
                      Short-Read WGS
                    </label>
                  </React.Fragment>
                )}
                {wgsLRParticipantCount > 0 && (
                  <React.Fragment>
                    <label className="radio-label">
                      <input
                        id="radio-blue"
                        type="radio"
                        value="wgs_longread"
                        name="genotype"
                        defaultChecked={selectedGenotype === "wgs_longread"}
                      />{" "}
                      Long-Read WGS
                    </label>
                  </React.Fragment>
                )}
                {wgsSVParticipantCount > 0 && (
                  <React.Fragment>
                    <label className="radio-label">
                      <input
                        id="radio-red"
                        type="radio"
                        value="wgs_structural_variants"
                        name="genotype"
                        defaultChecked={
                          selectedGenotype === "wgs_structural_variants"
                        }
                      />{" "}
                      Short-Read WGS Structural Variants
                    </label>
                  </React.Fragment>
                )}
                {arrayParticipantCount > 0 && (
                  <React.Fragment>
                    <label className="radio-label">
                      <input
                        id="radio-orange"
                        type="radio"
                        value="micro-array"
                        name="genotype"
                        defaultChecked={selectedGenotype === "micro-array"}
                      />{" "}
                      Genotyping Arrays
                    </label>
                  </React.Fragment>
                )}
              </div>
            </form>
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
                title="Sex"
                data={sexAtBirthData}
                selectedGenotype={selectedGenotype}
                color={color}
              />
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Current age"
                data={currentAgeData}
                selectedGenotype={selectedGenotype}
                color={color}
              />
              {environment.combinedAgeGenderChart && (
                  <GenomicChartComponent
                    counts={participantCounts[0]}
                    title="Combined age + sex"
                    data={combinedAgeSexData}
                    selectedGenotype={selectedGenotype}
                    color={color}
                  />
              )}
              {environment.heatmap && (
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Genomic Variant Locations</h3>
                <HeatMapReactComponent
                  locationAnalysis={locationData}
                  domain="genomic"
                  selectedResult = ""
                />
              </div>
              )}
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
