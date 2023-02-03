import * as React from "react";

import { reactStyles } from "app/utils";

import { GenomicChartComponent } from "./genomic-chart.component";
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
  // outline-color:#FAAF56;
}
input:focus{
  outline:none;
  
}
input[type='radio']:before {
  content: '';
  display: block;
  width: 60%;
  height: 60%;
  margin:50%;
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
  headingLayout: {
    display: "flex",
    marginBottom: "1em",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  selectGenotypeData: {
    display: "flex",
    justifyContent:"space-between",
    flexDirection: "row",
    marginBottom: "1em",
    width:'80%'
  }

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
      participantCounts: [],
      selectedGenotype: 'wgs_shortread',
      color:'#6F98A0'
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
    this.setState({ selectedGenotype: event.target.value });
    switch (event.target.value) {
      case 'micro-array':
        this.setState({color:'#FAAF56'});
        break;
      case 'wgs_structural_variants':
        this.setState({color:'#93003A'});
        break;
      case 'wgs_shortread':
        this.setState({color:'#6F98A0'});
        break;
      case 'wgs_longread':
        this.setState({color:'#01429D'});
        break;


    }
    
  }

  render() {
    const {
      raceEthData,
      sexAtBirthData,
      currentAgeData,
      participantCounts,
      selectedGenotype,
      loading,
      color
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
        <style>{css}</style>
        <div style={styles.innerContainer}>
          {!loading && (
            <form style={styles.selectGenotypeData} onChange={this.onGenotypeSelect}>
              {arrayParticipantCount > 0 && (<React.Fragment>
                <label className="radio-label"> <input id="radio-orange" type="radio" value="micro-array" name="genotype" defaultChecked={selectedGenotype === 'micro-array'} /> Genotyping Arrays</label>
              </React.Fragment>)}
              {wgsSVParticipantCount > 0 && (<React.Fragment>
                <label className="radio-label"> <input id="radio-red" type="radio" value="wgs_structural_variants" name="genotype" defaultChecked={selectedGenotype === 'wgs_structural_variants'} /> Structural Variants</label>
              </React.Fragment>)}
              {wgsSRParticipantCount > 0 && (<React.Fragment>
                <label className="radio-label"> <input id="radio-teal" type="radio" value="wgs_shortread" name="genotype" defaultChecked={selectedGenotype === 'wgs_shortread'} /> Short-Read WGS</label>
              </React.Fragment>)}
              {wgsLRParticipantCount > 0 && (<React.Fragment>
                <label className="radio-label"> <input id="radio-blue" type="radio" value="wgs_longread" name="genotype" defaultChecked={selectedGenotype === 'wgs_longread'} /> Long-Read WGS</label>
              </React.Fragment>)}
            </form>)}
          {!loading && (
            <React.Fragment>
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Race/ethnicity"
                data={raceEthData}
                selectedGenotype={selectedGenotype}
                color={color}
              />
              <GenomicChartComponent
                counts={participantCounts[0]}
                title="Sex assigned at birth"
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
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
