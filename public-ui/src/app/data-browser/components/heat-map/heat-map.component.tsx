import React, { Component } from 'react';
import { withRouteData } from "app/components/app-router";
import * as highCharts from "highcharts";
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from 'highcharts/modules/map';
import mapData from '../../../../assets/maps/us_and_terr.json';
import viMapData from '@highcharts/map-collection/countries/vi/vi-all.geo.json'

HighchartsMap(Highcharts);
interface Props {
    locationAnalysis: any
}
interface State {
    options: any;

}

const style = `
.highcharts-mapview-inset-border {
  display: none;
}
  .highcharts-name-district-of-columbia {
  transform: scale(1051.3%);
  transform-origin: 16px 47.9px;
  }
`


export const HeatMapReactComponent =
    class extends React.Component<Props, State> {
        territories: string[];
        constructor(props) {
            super(props);
            this.territories = [
                'gu-3605',
                'mp-ti',
                'mp-sa',
                'mp-ro',
                'as-6514',
                'as-6515',
                'pr-3614',

            ]

            const VI_KEYS = ['vi-6398', 'vi-3617', 'vi-6399'];
            const NMI_KEYS= [  'mp-ti','mp-sa','mp-ro',]
            this.state = {
                options: {
                    chart: {
                        map: mapData,
                        panning: true,

                    },
                    xAxis: {
                        visible: false, // Completely hide the X-axis (ticks, line, labels, etc.)
                    },
                    yAxis: {
                        visible: false, // Completely hide the X-axis (ticks, line, labels, etc.)
                    },
                    tooltip: {
                        formatter: function () {
                            const tooltipText = `${this.point.name} <br> ${this.point.value} `
                            return tooltipText;
                        }
                    },
                    title: {
                        text: undefined
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
                    plotOptions: {
                        series: {
                            states: {
                                hover: {
                                    enabled: false  // We'll do it manually
                                }
                            },
                            point: {
                                events: {
                                    mouseOver: function () {
                                        // If we just hovered over a VI polygon...
                                        if (VI_KEYS.includes(this['hc-key'])) {
                                            // ...then force all VI polygons into the hover state
                                            VI_KEYS.forEach(key => {
                                                const point = this.series.data.find(pt => pt['hc-key'] === key);
                                                if (point) {
                                                    // point.setState('hover');
                                                    point.update(
                                                        { borderWidth: 2, borderColor: 'black' },
                                                        false // <- Don't redraw immediately
                                                    );
                                                }
                                                this.series.chart.redraw();
                                            });
                                        }
                                    },
                                    mouseOut: function () {
                                        // If we just left a VI polygon...
                                        if (VI_KEYS.includes(this['hc-key'])) {
                                            // ...then clear the hover state for all VI polygons
                                            VI_KEYS.forEach(key => {
                                                const point = this.series.data.find(pt => pt['hc-key'] === key);
                                                if (point) {
                                                    // point.setState('');
                                                    point.update(
                                                        { borderWidth: 0.5, borderColor: undefined },
                                                        false
                                                    );
                                                }
                                            });
                                            this.series.chart.redraw();
                                        }
                                    }
                                }
                            }
                        },


                        states: {
                            inactive: {
                                enabled: false, // Disable the inactive state globally
                            },
                        },
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    scatter: {
                        dataLabels: {
                            enabled: false, // Disable globally for scatter plots
                        },
                    },
                    series: [{
                        data: this.formatLocationData(this.props.locationAnalysis.results),
                        borderColor: null,
                        states: {
                            hover: {
                                color: '#BADA55'
                            },
                            inactive: {
                                enabled: false, // Disable the inactive state
                            },
                        },
                        dataLabels: {
                            enabled: false,
                            format: '{point.name}'
                        },
                        borderWidth: .5
                    },
                    ]
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
            const output: any[] = [];

            for (const item of data) {
                if (item.stratum2 === 'us-vi') {
                    // List only the three Virgin Islands keys you want to group
                    const viKeys = ['vi-6398', 'vi-3617', 'vi-6399'];

                    viKeys.forEach(territory => {
                        output.push([territory, item.countValue]);
                        // Or, if you want a custom label:

                        output.push({
                            'hc-key': territory,
                            value: item.countValue,
                            name: 'U.S. Virgin Islands'
                        });

                    });

                } else {
                    // Normal flow for all other stratum2 codes
                    output.push([item.stratum2, item.countValue]);
                }
            }

            return output;
        }


        render() {
            return (<>
                <style>{style}</style>
                <div>
                    <HighchartsReact
                        style={{ height: "50rem" }}
                        highcharts={Highcharts}
                        options={this.state.options}
                        constructorType={'mapChart'}
                    // ref={this.chartRef}
                    />
                </div>
            </>
            );
        }
    }


