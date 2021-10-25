import { baseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import { genomicsApi } from 'app/services/swagger-fetch-clients';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';
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
    chartOptions: any = [];


    constructor(props: Props) {
        super(props);
        this.state = {
            options: null,
            setData: props.data
        }
        console.log(this.props.data, 'from', this.props.title);
    }
    

    dataToOptions() {
        this.chartOptions = baseOptions;
        const { setData } = this.state;
        const wgsData: Array<number> = [], microArrayData: Array<number> = [];
        this.chartOptions.chart.type = setData.chartType;
        this.chartOptions.xAxis.categories = [];
        setData.results.forEach(result => {
            if (result.stratum4 === 'wgs') {
                this.chartOptions.xAxis.categories.push(result.stratum2);
                wgsData.push(result.countValue);
            } else if (result.stratum4 === 'micro-array') {
                microArrayData.push(result.countValue);
            }
        });
        this.chartOptions.series = [{
            name: 'wsg',
            data: wgsData
        }, {
            name: 'micro-array',
            data: microArrayData

        }];
        this.setState({
            options: this.chartOptions
        });

    }

    componentDidMount() {
       
            this.dataToOptions();
        
    }


    render() {
        
        const { options,setData } = this.state;
        console.log(this.chartOptions,'chartOptions');
        
        const { title } = this.props;
        return <div style={styles.chartContainer}>
            <h1>{setData.stratum2Name}</h1>
            <h3 style={styles.chartTitle}>{title}</h3>
             <HighchartsReact  allowChartUpdate="false" highcharts={highCharts} options={options} />
        </div>;
    }
}
