import React, { Component } from 'react';
import { withRouteData } from "app/components/app-router";
import * as highCharts from "highcharts";
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from 'highcharts/modules/map';
import mapData from '@highcharts/map-collection/countries/us/custom/us-all-territories.topo.json';

// north-america.svg   c
// Initialize the map module
HighchartsMap(Highcharts);
interface State {
    options: any
}

export const heatMapReactComponent = withRouteData(
    class extends React.Component<{}, State> {
        constructor(props) {
            super(props);

            this.state = {
                options: {
                    chart: {
                        map: mapData
                    },
                    title: {
                        text: 'Highcharts Map of the US'
                    },
                    mapNavigation: {
                        enabled: true,
                        buttonOptions: {
                            verticalAlign: 'bottom'
                        }
                    },
                    colorAxis: {
                        min: 0
                    },
                    series: [{
                        data: [
                            ['us-tx', 0],
                            ['us-ca', 1],
                            ['us-ny', 2],
                            ['us-fl', 3]
                        ],
                        name: 'Random data',
                        states: {
                            hover: {
                                color: '#BADA55'
                            }
                        },
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}'
                        }
                    }]
                }
            };
        }
        chartRef = React.createRef();

        componentDidMount() {
            if (this.chartRef.current) {
                // this.chartRef.current.chart.reflow();
                console.log(this.chartRef.current,'wfjwofjwo');
                
            }
        }

        render() {
            return (
                <div>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={this.state.options}
                        constructorType={'mapChart'}
                        // ref={this.chartRef}
                    />
                </div>
            );
        }
    }

)
