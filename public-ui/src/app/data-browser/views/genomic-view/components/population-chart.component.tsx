import { getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

const styles = reactStyles({
    chartContainer: {
        width: '100%',
    }
});

interface State {
    options: any;
}

interface Props {
    variantPopulationDetails: any;
}

export class PopulationChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
    this.getChartOptions();
  }

  getChartOptions() {
    const {variantPopulationDetails} = this.props;
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = 'pie';
    newBaseOptions.title.text = 'PERCENTAGE <br/> OF ALLELES';
    newBaseOptions.title.verticalAlign = 'middle';
    newBaseOptions.title.style = {
             'color': 'black',
             'fontSize': '15px',
             'wordBreak': 'break-word',
             'zIndex': 0,
             'fontFamily': 'GothamBook',
             'fontWeight': 'normal'
    };
    console.log(newBaseOptions.plotOptions);
    newBaseOptions.tooltip = { formatter: function() {
        return '<div><strong>' + this.point.name + '</strong> <br /> ' + this.point.percentage.toFixed(2) +
        ' % | Allele Count: ' + this.y + '</div>';
    }};
    newBaseOptions.tooltip.outside = true;
    newBaseOptions.tooltip.style = {
        color: 'black',
        whiteSpace: 'normal',
        zIndex: 9998
    };
    const chartData = [];
    const totalAlleleCount = variantPopulationDetails.filter(v => v.Ancestry === 'Total')[0].AlleleCount;
    for (const variantDet of variantPopulationDetails) {
        if (variantDet.Ancestry !== 'Total') {
            const roundedPercentage = ((variantDet.AlleleCount / totalAlleleCount) * 100).toFixed(2);
            chartData.push({'name': variantDet.Ancestry, 'y': variantDet.AlleleCount, 'color': variantDet.color,
            'totalCount': totalAlleleCount, 'percentage': roundedPercentage});
        }
    }
    newBaseOptions.series =  [{
                    name: 'Alleles',
                    data: chartData,
                    size: '80%',
                    shadow: false,
                    innerSize: '60%',
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }}];
    this.setState({options: newBaseOptions});
  }

  render() {
    const {options} = this.state;
    return <div style={styles.chartContainer}>
          {options && <HighchartsReact highcharts={highCharts} options={options}
          updateArgs={[true]}/>}
    </div>;
  }
}
