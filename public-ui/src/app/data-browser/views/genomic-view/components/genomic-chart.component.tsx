import { reactStyles } from 'app/utils';
import { AGE_STRATUM_MAP, GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';
import { Analysis } from 'publicGenerated';



const chartSimple = {
    chart: {
        type: 'column',
        backgroundColor: 'transparent'
    },
    color: '',
    title: {
        text: '',
        useHTML: true,
        style: {
            color: '#666',
            fontSize: '14px',
            fontFamily: 'GothamBook',
            fontWeight: 'normal'
        }
    },
    tooltip: {
        followPointer: true,
        useHTML: true,
        // shared: true,
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
        shadow: false,
        headerFormat: '<div class="geno-chart-tooltip">',
        pointFormat: '{point.toolTipHelpText}',
        footerFormat: '</div>'

    },
    xAxis: {
        labels: {
            reserveSpace: true,
            style: {
                whiteSpace: 'wrap',
                textOverflow: 'ellipsis',
                width: '80px',
                fontSize: '14px',
                color: '#262262',
            },
            formatter: function () {
                const label = this.axis.defaultLabelFormatter.call(this);
                // Change <= 20 count to display '<= 20'
                if (label && label.indexOf('>=') > -1) {
                    return '&#8805; ' + label.replace('>=', '');
                }
                return label;
            },
            useHTML: true,
        },
        title: {
            text: '',
            style: {
                color: '#262262',
                whiteSpace: 'wrap',
                textOverflow: 'ellipsis',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                fontSize: '14px'
            }
        },
        tickLength: 0,
        lineWidth: 1,
        lineColor: '#979797',
        gridLineWidth: 1,
        gridLineColor: 'transparent'
    },
    yAxis: {
        title: {
            text: '',
            style: {
                color: '#262262',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                whiteSpace: 'wrap',
                textOverflow: 'ellipsis',
                padding: ''
            }
        },
        min: 20,
        gridLineWidth: 1,
        tickLength: 0,
        lineWidth: 1,
        lineColor: '#979797',
        gridLineColor: '#DDE0E4',
        labels: {
            style: {
                fontSize: '12px',
                whiteSpace: 'wrap',
                textOverflow: 'ellipsis',
                color: '#262262'
            },
            formatter: function () {
                const label = this.axis.defaultLabelFormatter.call(this);
                // Change <= 20 count to display '<= 20'
                if (label && label.indexOf('>=') > -1) {
                    return '&#8805; ' + label.replace('>=', '');
                }
                return label;
            },
            useHTML: true,
        }
    },
    legend: {
        enabled: false
    },
    credits: { enabled: false },
    plotOptions: {
        series: {
            animation: {
                duration: 100,
            },
            maxPointWidth: 100,
            minPointWidth: 50,
            pointPadding: 0,
            borderWidth: 0,
            fontSize: '',
            events: {
            },
        },
    }
}



const styles = reactStyles({
    chartContainer: {
        background: 'rgba(33,111,180,0.05)',
        margin: '1em',
        padding: '1em',
        paddingTop: '.25em'
    },
    chartTitle: {
        fontSize: '1em',
    },
    legendLayout: {
        paddingBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    legend: {
        display: 'flex',
        alignItems: 'center'
    },
    legendItem: {
        fontSize: '.6em',
        paddingRight: '.5rem',
        paddingLeft: '.25rem'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {
    data: Analysis;
    counts: any;
    title: string;
}
// tslint:disable-next-line:no-empty-interface
interface State {
    options: any;
}



export class GenomicChartComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            options: null,
        }
    }

    dataToOptions() {
        const chartOptions = JSON.parse(JSON.stringify(chartSimple));
        const { data, counts } = this.props;
        let toolTipHelpText;
        const sortingDemoArr = [
            'White',
            'Asian',
            'Black',
            'Hispanic',
            'More than one race/ethnicity',
            'Other',
            ' Prefer Not To Answer'
        ];
        const sortingSexArr = [
            'Female',
            'Male',
            'Other'
        ];
        let participantTypeCount = {
            wsg: '',
            microArray:''
        };
        counts.results.forEach(item => {
            if (item.stratum4 === 'wgs') {
                participantTypeCount['wsg'] = item.countValue;
            } else if (item.stratum4 === 'micro-array') {
                participantTypeCount['microArray'] = item.countValue
            }
        });


        let wgsData: Array<any> = [], microArrayData: Array<any> = [];
        chartOptions.chart.type = data.chartType;
        chartOptions.xAxis.categories = [];
        chartOptions.column = {}
        data.results.forEach(result => {
            if (GENDER_STRATUM_MAP[result.stratum2]) {
                result.stratum2 = GENDER_STRATUM_MAP[result.stratum2]
            } else if (AGE_STRATUM_MAP[result.stratum2]) {
                result.stratum2 = AGE_STRATUM_MAP[result.stratum2];
            }
            if (result.stratum4 === 'wgs') {
                let percent:any = result.countValue / parseInt(participantTypeCount.wsg) * 100;
                toolTipHelpText = `<strong>` + result.stratum2 + `</strong> <br> ` + result.countValue.toLocaleString() + `
                participants, `+ parseFloat(percent).toFixed(2)+ `%`;
                wgsData.push({
                    cat: result.stratum2,
                    y: result.countValue,
                    toolTipHelpText: toolTipHelpText,
                });
            } else if (result.stratum4 === 'micro-array') {
                let percent:any = result.countValue / parseInt(participantTypeCount.microArray) * 100;
                toolTipHelpText = `<strong>` + result.stratum2 + `</strong> <br> ` + result.countValue.toLocaleString() + `
                participants, `+ parseFloat(percent).toFixed(2)+ `%`;
                chartOptions.xAxis.categories.push(result.stratum2);
                microArrayData.push({
                    cat: result.stratum2,
                    y: result.countValue,
                    toolTipHelpText: toolTipHelpText
                });
            }
        });
        // ordering the catigories to match mockup
        chartOptions.xAxis.categories = chartOptions.xAxis.categories.sort((a, b) => {
            const sortArr = (data.analysisId === 3503) ? sortingDemoArr : sortingSexArr;
            return sortArr.indexOf(a) - sortArr.indexOf(b);
        })
        wgsData = wgsData.sort((a, b) => {
            return chartOptions.xAxis.categories.indexOf(a.cat) - chartOptions.xAxis.categories.indexOf(b.cat);
        });
        microArrayData = microArrayData.sort((a, b) => {
            return chartOptions.xAxis.categories.indexOf(a.cat) - chartOptions.xAxis.categories.indexOf(b.cat);
        });
        chartOptions.series = [{
            name: 'wsg',
            data: wgsData,
            color: '#216FB4'
        }, {
            name: 'micro-array',
            data: microArrayData,
            color: '#8BC990'

        }];
        this.setState({
            options: chartOptions
        });
    }

    componentDidMount() {
        this.dataToOptions();
    }

    render() {
        const { options } = this.state;
        const { title } = this.props;
        return <div style={styles.chartContainer}>
            <div style={styles.legendLayout}>
                <h3 style={styles.chartTitle}><strong>{title}</strong></h3>
                <div style={styles.legend}>
                    <i className="fas fa-circle" style={{ color: '#216FB4' }}></i> <span style={styles.legendItem}>WGS</span>
                    <i className="fas fa-circle" style={{ color: '#8BC990' }}></i> <span style={styles.legendItem}>Genotyping Arrays</span>
                </div>
            </div>
            <HighchartsReact allowChartUpdate="false" highcharts={highCharts} options={options} />
        </div>;
    }
}
