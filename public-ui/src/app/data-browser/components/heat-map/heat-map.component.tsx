import React, { Component } from 'react';
import { withRouteData } from "app/components/app-router";
import * as highCharts from "highcharts";
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from 'highcharts/modules/map';
import mapData from 'assets/maps/us_and_terr.json';
// import mapData from '@highcharts/map-collection/countries/us/custom/us-all-territories.topo.json';

HighchartsMap(Highcharts);
interface Props {
    locationAnalysis: any,
    selectedResult: any,
    domain: string,
    color: any,
}
interface State {


}

const style = `
.highcharts-mapview-inset-border {
  display:none;
}
`


export const HeatMapReactComponent =
    class extends React.Component<Props, State> {
        territories: string[];
        domPathsByGroup = {
            VI_KEYS: [],
            NMI_KEYS: [],
            AS_KEYS: [],
            PR_KEYS: [],
            GU_KEYS: []
        };
        chartRef = React.createRef<HighchartsReact.RefObject>();
        path6399 = null;
        path3617 = null;
        path6398 = null;


        static originalColor: string;

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
        }

        static keyGroups = {
            VI_KEYS: ['vi-6398', 'vi-3617', 'vi-6399'],
            NMI_KEYS: ['mp-ti', 'mp-sa', 'mp-ro'],
            AS_KEYS: ['as-6514', 'as-6515'],
            PR_KEYS: ['pr-3614'],
            GU_KEYS: ['gu-3605']
        };

        getHoverColor = () => {
            if (typeof this.props.color === 'string') {
                return this.props.color;
            }
            return this.props.color?.hover || '#a27bd7'; // Fallback to original color if not provided
        }

        getOptions = () => ({
            chart: {
                map: mapData,
                panning: false,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                animation: { duration: 10 }

            },
            colorAxis: {
                stops: [
                    [0, '#d0eafc'],  // Low value color
                    [0.5, '#006699'],  // mid value color
                    [1, '#262262']  // High value color
                ]
            },
            tooltip: {
                formatter: function () {
                    const value = this.point.value <= 20 ? '≤ 20' : this.point.value.toLocaleString();
                    const tooltipText = `${this.point.name} <br> ${value} `
                    return tooltipText;
                }
            },
            title: {
                text: undefined
            },
            mapNavigation: {
                enabled: false,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            plotOptions: {
                series: {
                    states: {
                        hover: {
                            enabled: false  // We'll do it manually
                        },
                        inactive: {
                            enabled: false, // Disable the inactive state globally
                        },
                    },
                    point: {
                        events: {
                            mouseOver: function () {
                                // Check if the key is in any of the key groups
                                const matchedKey = Object.keys(HeatMapReactComponent.keyGroups).find(group => HeatMapReactComponent.keyGroups[group].includes(this['hc-key']));
                                if (matchedKey) {
                                    // If it is, save the original color
                                    this.originalColor = this.color;
                                } else {
                                    // If it's not, change the color to the hover color from props
                                    const hoverColor = (this.series.chart as any).hoverColor || '#a27bd7';
                                    this.update({ borderWidth: undefined, borderColor: undefined, color: hoverColor }, false);
                                    this.series.chart.redraw();
                                }
                            },
                            mouseOut: function () {
                                const matchedKey = Object.keys(HeatMapReactComponent.keyGroups).find(group => HeatMapReactComponent.keyGroups[group].includes(this['hc-key']));
                                if (matchedKey) {
                                    HeatMapReactComponent.getOriginalColor(this.series, HeatMapReactComponent.keyGroups[matchedKey]);
                                } else {
                                    this.update({ borderWidth: undefined, borderColor: undefined, color: undefined }, true);
                                    this.series.chart.redraw();
                                }
                            }
                        }
                    }
                },

            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                data: this.formatLocationData(this.props.locationAnalysis.results, this.props.domain),
                borderColor: '#ffffff',
                borderWidth: .1,
                states: {
                    hover: {
                        color: this.getHoverColor()
                    },
                    inactive: {
                        enabled: false, // Disable the inactive state
                    },
                },
                dataLabels: {
                    enabled: false,
                    format: '{point.name}'
                },

            },
            ]
        })


        componentDidMount() {
            this.setupEventListeners();
        }

        componentDidUpdate(prevProps) {
            if (prevProps.color !== this.props.color) {
                const chartObj = this.chartRef.current?.chart;
                if (chartObj) {
                    (chartObj as any).hoverColor = this.getHoverColor();

                    if (chartObj.series && chartObj.series[0]) {
                        (chartObj.series[0] as any).update({
                            states: {
                                hover: {
                                    color: this.getHoverColor()
                                },
                                inactive: {
                                    enabled: false
                                }
                            }
                        } as any);
                    }
                }
            }
        }

        setupEventListeners() {
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj) return;

            (chartObj as any).hoverColor = this.getHoverColor();

            const chartContainer = chartObj.container;

            Object.keys(HeatMapReactComponent.keyGroups).forEach(groupName => {
                const hcKeys = HeatMapReactComponent.keyGroups[groupName]; // e.g. ['vi-6398','vi-6399','vi-3617']

                hcKeys.forEach(hcKey => {
                    const selector = `path.highcharts-key-${hcKey}`;
                    const foundPaths = chartContainer.querySelectorAll(selector);

                    foundPaths.forEach(pathEl => {
                        this.domPathsByGroup[groupName].push(pathEl);

                        pathEl.addEventListener('mouseenter', () => this.handleMouseEnterGroup(groupName));
                        pathEl.addEventListener('mouseleave', () => this.handleMouseLeaveGroup(groupName));
                    });
                });
            });
        }
        componentWillUnmount() {
            this.cleanupEventListeners();
        }

        cleanupEventListeners() {
            Object.keys(this.domPathsByGroup).forEach(groupName => {
                const paths = this.domPathsByGroup[groupName];
                paths.forEach(pathEl => {
                    if (pathEl.parentNode) {
                        pathEl.replaceWith(pathEl.cloneNode(true));
                    }
                });
                this.domPathsByGroup[groupName] = [];
            });
        }

        handleMouseEnterGroup(groupName) {
            const pathsInGroup = this.domPathsByGroup[groupName];
            const hoverColor = this.getHoverColor();
            pathsInGroup.forEach(pathEl => {
                pathEl.style.fill = hoverColor;
            });
        }
        handleMouseLeaveGroup(groupName) {
            const pathsInGroup = this.domPathsByGroup[groupName];
            pathsInGroup.forEach(pathEl => {
                pathEl.style.fill = HeatMapReactComponent.originalColor;
            });
        }


        formatLocationData(data, domain) {
            const output: any[] = [];

            const keyGroups = {
                'us-vi': { keys: HeatMapReactComponent.keyGroups.VI_KEYS, name: 'U.S. Virgin Islands' },
                'us-mp': { keys: HeatMapReactComponent.keyGroups.NMI_KEYS, name: 'Northern Mariana Islands' },
                'us-as': { keys: HeatMapReactComponent.keyGroups.AS_KEYS, name: 'American Samoa' },
                'us-pr': { keys: HeatMapReactComponent.keyGroups.PR_KEYS, name: 'Puerto Rico' },
                'us-gu': { keys: HeatMapReactComponent.keyGroups.GU_KEYS, name: 'Guam' },
            };

            if (domain === 'survey' && this.props.selectedResult) {
                data = data.filter(
                      (r) => r.stratum4 === this.props.selectedResult.stratum4
                );
            }

            for (const item of data) {
                const state = domain === 'survey' ? item.stratum5 : item.stratum2;
                if (keyGroups[state]) {
                    keyGroups[state].keys.forEach(territory => {
                        output.push([territory, item.countValue]);
                        output.push({
                            'hc-key': territory,
                            value: item.countValue,
                            name: keyGroups[state].name
                        });
                    });
                } else {
                    output.push([state, item.countValue]);
                }
            }
            return output;
        }
        static getOriginalColor(series, keys: string[]) {
            keys.forEach(key => {
                const point = series.data.find(pt => pt['hc-key'] === key);
                if (point) {
                    this.originalColor = point.color;
                }
            });

            series.chart.redraw();
        }



        render() {
            return (<>
                <style>{style}</style>
                <div>
                    <HighchartsReact
                        key={this.getHoverColor()} // Force re-render when color changes
                        style={{ height: "50rem" }}
                        highcharts={Highcharts}
                        options={this.getOptions()}
                        constructorType={'mapChart'}
                        ref={this.chartRef}
                    />
                </div>
            </>
            );
        }
    }