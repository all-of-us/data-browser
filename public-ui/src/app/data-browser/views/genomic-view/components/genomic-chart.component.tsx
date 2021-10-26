import { baseOptions, getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import { genomicsApi } from 'app/services/swagger-fetch-clients';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';
import { fakeAsync } from '@angular/core/testing';


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
        outside: false,
        formatter: function (tooltip) {
            // console.log(this.point.toolTipHelpText, 'this somehow works');
            alert();
            return '<div>sdfsdfdsfdsfds</div>';
        },
        useHTML: false,
        enabled: true,
        borderColor: '#262262',
        borderRadius: '1px',
        backgroundColor: '#FFFFFF',
        style: {
            color: '#302C71',
            whiteSpace: 'normal',
        }
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
        gridLineColor: 'transparent',
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
    legend: { enabled: true },
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
        fontSize: '1em'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {
    data: any;
    title: string;
}
// tslint:disable-next-line:no-empty-interface
interface State {
    options: any;
    setData: any;
}



export class GenomicChartComponent extends React.Component<Props, State> {



    constructor(props: Props) {
        super(props);
        this.state = {
            options: null,
            setData: props.data
        }
        console.log(this.props.data, 'from', this.props.title);
    }


    dataToOptions() {
        const chartOptions = JSON.parse(JSON.stringify(chartSimple));
        const { setData } = this.state;
        const wgsData: Array<any> = [], microArrayData: Array<any> = [];
        chartOptions.chart.type = setData.chartType;
        chartOptions.xAxis.categories = [];
        chartOptions.column = {}
        setData.results.forEach(result => {
            if (result.stratum4 === 'wgs') {
                chartOptions.xAxis.categories.push(result.stratum2);
                wgsData.push({
                    y: result.countValue,
                    toolTipHelpText: '<div>whahahahahaha</div>'
                });
            } else if (result.stratum4 === 'micro-array') {
                microArrayData.push(result.countValue);
            }
        });
        chartOptions.series = [{
            toolTipHelpText: 'sssssss',
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
        const { options, setData } = this.state;
        const { title } = this.props;
        return <div style={styles.chartContainer}>
            <h1>{setData.stratum2Name}</h1>
            <h3 style={styles.chartTitle}>{title}</h3>
            <HighchartsReact allowChartUpdate="false" highcharts={highCharts} options={options} />
        </div>;
    }
}
