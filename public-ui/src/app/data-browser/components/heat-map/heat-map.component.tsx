import React, { Component } from 'react';
import { withRouteData } from "app/components/app-router";
import * as highCharts from "highcharts";
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from 'highcharts/modules/map';
import mapData from 'assets/maps/us_and_terr.json';

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
    return color?.hover || '#a27bd7';
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

        // Calculate total value across all states/territories
        calculateTotal = (data) => {
            return data.reduce((sum, point) => {
                return sum + (point.value || 0);
            }, 0);
        }

        options = {
            chart: {
                map: mapData,
                panning: false,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                animation: { duration: 10 }

            },
            colorAxis: {
                stops: [
                    [0, '#d0eafc'],
                    [0.5, '#006699'],
                    [1, '#262262']
                ]
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    const value = this.point.value <= 20 ? '≤ 20' : this.point.value.toLocaleString();
                    const total = this.series.chart.userOptions.totalValue || 1;
                    const percentage = ((this.point.value / total) * 100).toFixed(1);

                    const tooltipText = `
                        <div style="text-align: center;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${this.point.name}</div>
                            <div>${value} participants | ${percentage}%</div>
                        </div>
                    `;
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
                            enabled: false
                        },
                        inactive: {
                            enabled: false,
                        },
                    },
                    point: {
                        events: {
                            mouseOver: function () {
                                const matchedKey = Object.keys(HeatMapReactComponent.keyGroups).find(group => HeatMapReactComponent.keyGroups[group].includes(this['hc-key']));
                                if (matchedKey) {
                                    this.originalColor = this.color;
                                } else {
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
                        enabled: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                    format: '{point.name}'
                },

            },
            ],
            hoverColor: this.props.color,
            totalValue: 0
        }


        componentDidMount() {
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj) return;

            // Calculate and store total value
            const seriesData = chartObj.series[0].data;
            const total = this.calculateTotal(seriesData);
            (chartObj.userOptions as any).totalValue = total;

            setTimeout(() => {
                this.applyTerritoryColors();
                this.setupEventListeners();
            }, 100);
        }

        componentDidUpdate(prevProps) {
            const chartObj = this.chartRef.current?.chart;

            if (prevProps.color !== this.props.color) {
                if (chartObj) {
                    (chartObj.userOptions as any).hoverColor = this.props.color;
                }

                this.options.hoverColor = this.props.color;
                this.options.series[0].states.hover.color = getHoverColor(this.props.color);
            }

            // Rebuild chart if selectedResult changed (for genomic domain)
            if (prevProps.selectedResult !== this.props.selectedResult && this.props.domain === 'genomic') {
                // Update the data
                const newData = this.formatLocationData(this.props.locationAnalysis.results, this.props.domain);
                if (chartObj && chartObj.series[0]) {
                    chartObj.series[0].setData(newData, true);

                    // Recalculate total with new filtered data
                    const total = this.calculateTotal(chartObj.series[0].data);
                    (chartObj.userOptions as any).totalValue = total;

                    // Reapply territory colors
                    setTimeout(() => {
                        this.applyTerritoryColors();
                    }, 100);
                }
            }

            // Recalculate total if data changed
            if (chartObj && chartObj.series[0]) {
                const total = this.calculateTotal(chartObj.series[0].data);
                (chartObj.userOptions as any).totalValue = total;
            }
        }

        applyTerritoryColors() {
            const chartObj = this.chartRef.current?.chart;
            if (!chartObj || !chartObj.series || !chartObj.series[0]) return;

            const series = chartObj.series[0];
            const colorAxis = (chartObj as any).colorAxis?.[0];

            if (!colorAxis) return;

            Object.keys(HeatMapReactComponent.keyGroups).forEach(groupName => {
                const hcKeys = HeatMapReactComponent.keyGroups[groupName];

                hcKeys.forEach(hcKey => {
                    const dataPoint = series.data.find(point => point['hc-key'] === hcKey);
                    if (dataPoint && dataPoint.value !== undefined) {
                        const color = colorAxis.toColor(dataPoint.value, dataPoint);

                        const selector = `path.highcharts-key-${hcKey}`;
                        const pathElement = chartObj.container.querySelector(selector);
                        if (pathElement) {
                            (pathElement as HTMLElement).style.fill = color;
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

            Object.keys(HeatMapReactComponent.keyGroups).forEach(groupName => {
                const hcKeys = HeatMapReactComponent.keyGroups[groupName];

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
            Object.keys(this.domPathsByGroup).forEach(groupName => {
                const paths = this.domPathsByGroup[groupName];
                paths.forEach(pathEl => {
                    pathEl.replaceWith(pathEl.cloneNode(true));
                });
            });
        }

        handleMouseEnterGroup(groupName) {
            const pathsInGroup = this.domPathsByGroup[groupName];
            pathsInGroup.forEach(pathEl => {
                if (!(pathEl as any).dataset.originalColor) {
                    (pathEl as any).dataset.originalColor = (pathEl as HTMLElement).style.fill || getComputedStyle(pathEl as HTMLElement).fill;
                }
                (pathEl as HTMLElement).style.fill = getHoverColor(this.props.color);
            });
        }

        handleMouseLeaveGroup(groupName) {
            const pathsInGroup = this.domPathsByGroup[groupName];
            pathsInGroup.forEach(pathEl => {
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

            if (domain === 'genomic' && this.props.selectedResult) {
                data = data.filter(
                      (r) => r.stratum4 === this.props.selectedResult
                );
            }

            // Track which states have data
            const statesWithData = new Set();

            for (const item of data) {
                const state = domain === 'survey' ? item.stratum5 : item.stratum2;
                statesWithData.add(state);

                if (keyGroups[state]) {
                    keyGroups[state].keys.forEach(territory => {
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

            // Add missing states with value of 20 (only for genomic domain)
            if (domain === 'genomic') {
                const allStates = [
                    'us-al', 'us-ak', 'us-az', 'us-ar', 'us-ca', 'us-co', 'us-ct', 'us-de', 'us-fl', 'us-ga',
                    'us-hi', 'us-id', 'us-il', 'us-in', 'us-ia', 'us-ks', 'us-ky', 'us-la', 'us-me', 'us-md',
                    'us-ma', 'us-mi', 'us-mn', 'us-ms', 'us-mo', 'us-mt', 'us-ne', 'us-nv', 'us-nh', 'us-nj',
                    'us-nm', 'us-ny', 'us-nc', 'us-nd', 'us-oh', 'us-ok', 'us-or', 'us-pa', 'us-ri', 'us-sc',
                    'us-sd', 'us-tn', 'us-tx', 'us-ut', 'us-vt', 'us-va', 'us-wa', 'us-wv', 'us-wi', 'us-wy',
                    'us-dc', 'us-pr', 'us-vi', 'us-gu', 'us-as', 'us-mp'
                ];

                allStates.forEach(state => {
                    if (!statesWithData.has(state)) {
                        if (keyGroups[state]) {
                            keyGroups[state].keys.forEach(territory => {
                                output.push({
                                    'hc-key': territory,
                                    value: 20,
                                    name: keyGroups[state].name
                                });
                            });
                        } else {
                            output.push([state, 20]);
                        }
                    }
                });
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