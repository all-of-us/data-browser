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
interface Props {
    locationAnalysis: any
}
interface State {
    options: any
}

export const HeatMapReactComponent =
    class extends React.Component<Props, State> {
        constructor(props) {
            super(props);
            this.state = {
                options: {
                    chart: {
                        map: mapData,
                        height: "1000",
                        panning: false
                    },
                    tooltip: {
                        formatter: function () {
                            const tooltipText = `${this.point.name} <br> ${this.point.value} ` 
                            return tooltipText;
                        }
                    },
                    title: {
                        text: 'Highcharts Map of the US'
                    },
                    mapNavigation: {
                        enabled: false,
                        buttonOptions: {
                            verticalAlign: 'bottom'
                        }
                    },
                    colorAxis: {
                        min: 0
                    },
                    series: [{
                        data: this.formatLocationData(this.props.locationAnalysis.results),
                        borderColor: null,
                        states: {
                            hover: {
                                color: '#BADA55'
                            }
                        },
                        dataLabels: {
                            enabled: false,
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
                // console.log(this.chartRef.current,'wfjwofjwo');

            }
        }
        formatLocationData(data) {
            const territories: any[] = [
                'gu-3605',
                'mp-ti',
                'mp-sa',
                'mp-ro',
                'as-6514',
                'pr-3614',
                'vi-6398',
                'vi-6399'
            ]
            const output: any[] = [];
            for (const item of data) {
                if (item.stratum2 === 'us-vi') {
                    for (const territory of territories)
                        output.push([territory, item.countValue]);

                } else {
                    output.push([item.stratum2, item.countValue]);
                }
            }
            return output;
        }

        render() {
            return (
                <div>
                    <HighchartsReact
                        style={{ height: "50rem" }}
                        highcharts={Highcharts}
                        options={this.state.options}
                        constructorType={'mapChart'}
                    // ref={this.chartRef}
                    />
                </div>
            );
        }
    }


