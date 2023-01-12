import * as React from "react";

import { reactStyles } from "app/utils";

import { GenomicChartComponent } from "./genomic-chart.component";

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
  headingLayout: {
    display: "flex",
    marginBottom: "1em",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  selectGenotypeData: {
    display: "flex",
    flexDirection: "row",
    gap: "0.5em",
    marginBottom: "1em",
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
  participantCounts: any[];
  selectedGenotype: string;
}

export class GenomicOverviewComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      raceEthData: [],
      sexAtBirthData: [],
      currentAgeData: [],
      participantCounts: [],
      selectedGenotype: 'wgs_shortread',
    };
    this.onGenotypeSelect = this.onGenotypeSelect.bind(this);
  }

  raceEthArr: any[] = [];
  sexAtBirthArr: any[] = [];
  currentAgeArr: any[] = [];
  participantCountsArr: any[] = [];

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
      participantCounts: this.participantCountsArr,
      loading: false,
    });
  }

  onGenotypeSelect(event) {
    const {
      raceEthData,
      sexAtBirthData,
      currentAgeData,
      participantCounts,
    } = this.state;
    this.setState({selectedGenotype: event.target.value});
  }

  render() {
    const {
      raceEthData,
      sexAtBirthData,
      currentAgeData,
      participantCounts,
      selectedGenotype,
      loading,
    } = this.state;
    const { participantCount } = this.props;
    let countResults = [];
    let wgsSRParticipantCount = 0;
    let wgsLRParticipantCount = 0;
    let wgsSVParticipantCount = 0;
    let arrayParticipantCount = 0;

    if (!loading && participantCounts) {
        countResults = participantCounts[0].results;

        wgsSRParticipantCount = countResults.filter((r) => r.stratum4 === "wgs_shortread")[0].countValue;
        wgsLRParticipantCount = countResults.filter((r) => r.stratum4 === "wgs_longread")[0].countValue;
        wgsSVParticipantCount = countResults.filter((r) => r.stratum4 === "wgs_structural_variants")[0].countValue;
        arrayParticipantCount = countResults.filter((r) => r.stratum4 === "micro-array")[0].countValue;
    }

    return (
      <React.Fragment>
        <div style={styles.innerContainer}>
            {!loading && (
              <div style={styles.selectGenotypeData} onChange={this.onGenotypeSelect}>
                {arrayParticipantCount > 0 && (<React.Fragment>
                <input type="radio" value="micro-array" name="genotype" defaultChecked={selectedGenotype === 'micro-array'}/> Genotyping Array
                </React.Fragment>)}
                {wgsSVParticipantCount > 0 && (<React.Fragment>
                <input type="radio" value="wgs_structural_variants" name="genotype" defaultChecked={selectedGenotype === 'wgs_structural_variants'}/> Structural Variants
                </React.Fragment>)}
                {wgsSRParticipantCount > 0 && (<React.Fragment>
                <input type="radio" value="wgs_shortread" name="genotype" defaultChecked={selectedGenotype === 'wgs_shortread'}/> Short-read whole genome sequencing(srWGS)
                </React.Fragment>)}
                {wgsLRParticipantCount > 0 && (<React.Fragment>
                <input type="radio" value="wgs_longread" name="genotype" defaultChecked={selectedGenotype === 'wgs_longread'}/> Long-read whole genome sequencing(lrWGS)
                </React.Fragment>)}
                </div>)}
          {!loading && (
            <React.Fragment>
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Race/ethnicity"
                data={raceEthData}
                selectedGenotype={selectedGenotype}
              />
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Sex assigned at birth"
                data={sexAtBirthData}
                selectedGenotype={selectedGenotype}
              />
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Current age"
                data={currentAgeData}
                selectedGenotype={selectedGenotype}
              />
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
