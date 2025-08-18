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

const getHoverColor = (color: any) => {
    if (typeof color === 'string' && color) {
        return color;
    }
    return color?.hover || '#a27bd7'; // Fallback to #a27bd7 if color is empty or not provided
}

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

        options = {
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
                                    // If it's not, change the color to the color from props
                                    this.update({ borderWidth: undefined, borderColor: undefined, color: getHoverColor(this.series.chart.userOptions.hoverColor) }, false);
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
                        color: getHoverColor(this.props.color)
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
            ],
            hoverColor: this.props.color
        }


        componentDidMount() {
            // Save a reference to the Highcharts chart object
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj) return;

            // Wait for chart to be fully rendered
            setTimeout(() => {
                this.applyTerritoryColors();
                this.setupEventListeners();
            }, 100);
        }

        applyTerritoryColors() {
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj || !chartObj.series || !chartObj.series[0]) return;

            const series = chartObj.series[0];
            const colorAxis = (chartObj as any).colorAxis?.[0];

            if (!colorAxis) return;

            // Apply colors to territories based on their data values
            Object.keys(HeatMapReactComponent.keyGroups).forEach(groupName => {
                const hcKeys = HeatMapReactComponent.keyGroups[groupName];

                hcKeys.forEach(hcKey => {
                    // Find the data point for this territory
                    const dataPoint = series.data.find(point => point['hc-key'] === hcKey);
                    if (dataPoint && dataPoint.value !== undefined) {
                        // Get the color from the color axis
                        const color = colorAxis.toColor(dataPoint.value, dataPoint);

                        // Apply color to the DOM element
                        const selector = `path.highcharts-key-${hcKey}`;
                        const pathElement = chartObj.container.querySelector(selector);
                        if (pathElement) {
                            (pathElement as HTMLElement).style.fill = color;
                            // Store original color for hover restoration
                            (pathElement as any).dataset.originalColor = color;
                        }
                    }
                });
            });
        }

        setupEventListeners() {
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj) return;

            const chartContainer = chartObj.container;

            // For each group in keyGroups...
            Object.keys(HeatMapReactComponent.keyGroups).forEach(groupName => {
                const hcKeys = HeatMapReactComponent.keyGroups[groupName]; // e.g. ['vi-6398','vi-6399','vi-3617']

                hcKeys.forEach(hcKey => {
                    // Build a CSS selector. The "Highcharts map" paths typically have "highcharts-key-<hc-key>" as a class.
                    // e.g. "path.highcharts-key-vi-6398"
                    // We'll use this to find the paths in the DOM
                    const selector = `path.highcharts-key-${hcKey}`;
                    const foundPaths = chartContainer.querySelectorAll(selector);

                    foundPaths.forEach(pathEl => {
                        // Add to our store
                        this.domPathsByGroup[groupName].push(pathEl);

                        // Attach listeners. We'll use the same handler for all in this group:
                        pathEl.addEventListener('mouseenter', () => this.handleMouseEnterGroup(groupName));
                        pathEl.addEventListener('mouseleave', () => this.handleMouseLeaveGroup(groupName));
                    });
                });
            });
        }
        componentWillUnmount() {
            // Loop over all groups
            Object.keys(this.domPathsByGroup).forEach(groupName => {
                const paths = this.domPathsByGroup[groupName];
                paths.forEach(pathEl => {
                    // Easiest is to replace them with clones that have no listeners:
                    pathEl.replaceWith(pathEl.cloneNode(true));
                });
            });
        }

        handleMouseEnterGroup(groupName) {
            // Loop over all paths in the group and change their color
            const pathsInGroup = this.domPathsByGroup[groupName];
            pathsInGroup.forEach(pathEl => {
                // Store current color if not already stored
                if (!(pathEl as any).dataset.originalColor) {
                    (pathEl as any).dataset.originalColor = (pathEl as HTMLElement).style.fill || getComputedStyle(pathEl as HTMLElement).fill;
                }
                (pathEl as HTMLElement).style.fill = getHoverColor(this.props.color);
            });
        }
        handleMouseLeaveGroup(groupName) {
            const pathsInGroup = this.domPathsByGroup[groupName];
            pathsInGroup.forEach(pathEl => {
                // Restore original color
                if ((pathEl as any).dataset.originalColor) {
                    (pathEl as HTMLElement).style.fill = (pathEl as any).dataset.originalColor;
                } else {
                    (pathEl as HTMLElement).style.fill = '';
                }
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
                    // Normal flow for all other stratum2 codes
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

            // Now redraw once after updating all points
            series.chart.redraw();
        }



        render() {
            return (<>
                <style>{style}</style>
                <div>
                    <HighchartsReact
                        style={{ height: "50rem" }}
                        highcharts={Highcharts}
                        options={this.options}
                        constructorType={'mapChart'}
                        ref={this.chartRef}
                    />
                </div>
            </>
            );
        }
    }