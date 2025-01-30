import React, { Component } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import { getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';

// Sample data structure for age and gender combined analysis
interface Props {
    ageGenderAnalysis: any
}
interface State {
    options: any
}

export const StackedColumnChartReactComponent =
    class extends React.Component<Props, State> {
        constructor(props) {
            super(props);
            this.state = {
                options: {
                    ...getBaseOptions(), // Apply base styling from baseOptions
                    chart: {
                        ...getBaseOptions().chart,
                        type: 'column',  // Use column chart for vertical bars
                        height: '1000',   // Set height as per your requirement
                    },
                    title: {
                        text: 'Age and Gender Distribution',
                        style: {
                            ...getBaseOptions().title.style,
                            color: "#262262",  // Title color
                            fontSize: "22px",  // Font size for the title
                        },
                    },
                    xAxis: {
                        categories: this.formatAgeCategories(this.props.ageGenderAnalysis),
                        title: {
                            text: 'Age Groups',
                            style: {
                                ...getBaseOptions().xAxis.title.style,
                                color: "#262262", // Axis title color
                                fontSize: "14px",  // Axis title font size
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Population',
                            align: 'high',
                            style: {
                                color: "#262262",  // Y-axis label color
                                fontSize: "14px",  // Font size for y-axis labels
                            }
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: 'gray'
                            }
                        },
                        gridLineColor: "#ECF1F4",  // Gridline color
                        labels: {
                            style: {
                                fontSize: "14px",
                                color: "#262262",  // Font color for grid labels
                            }
                        }
                    },
                    tooltip: {
                        shared: true,
                        formatter: function () {
                            let tooltipText = this.x + '<br>';
                            this.points.forEach(function (point) {
                                const value = point.y <= 20 ? '<=20' : point.y;
                                tooltipText += `${point.series.name}: ${value}<br>`;
                            });
                            return tooltipText;
                        },
                        style: {
                            fontSize: "14px",  // Font size for tooltip text
                        }
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',  // Stacking behavior for columns
                            groupPadding: 0.4,  // Grouping for column bars
                            pointWidth: 50,  // Width of the bars
                        }
                    },
                    series: this.formatAgeGenderData(this.props.ageGenderAnalysis),
                }
            };
        }

        formatAgeCategories(data) {
            // Define the mapping for age groups
            const ageGroupMapping: { [key: string]: string } = {
                "2": "18-29",
                "3": "30-39",
                "4": "40-49",
                "5": "50-59",
                "6": "60-69",
                "7": "70-79",
                "8": "80-89",
                "9": "89+"
            };

            // Filter and map the categories
            const ageGroupsToShow = ["2", "3", "4", "5", "6", "7", "8", "9"];
            const filteredCategories = data.results
                .map(item => item.stratum2)
                .filter((value, index, self) => ageGroupsToShow.includes(value) && self.indexOf(value) === index)
                .map(group => ageGroupMapping[group]);  // Replace with age group names

            // Return the categories sorted in ascending order
            return filteredCategories.sort((a, b) => {
                const ageOrder = {
                    "18-29": 2,
                    "30-39": 3,
                    "40-49": 4,
                    "50-59": 5,
                    "60-69": 6,
                    "70-79": 7,
                    "80-89": 8,
                    "89+": 9
                };
                return ageOrder[a] - ageOrder[b];
            });
        }

        formatAgeGenderData(data) {
            // Format the data into a structure suitable for stacked column chart
            const maleSeries = [];
            const femaleSeries = [];
            const otherSeries = [];

            // Filtered age groups
            const ageGroups = this.formatAgeCategories(data);

            // Mapping age group names to stratum2 codes
            const ageGroupCodes = {
                "18-29": "2",
                "30-39": "3",
                "40-49": "4",
                "50-59": "5",
                "60-69": "6",
                "70-79": "7",
                "80-89": "8",
                "89+": "9"
            };

            ageGroups.forEach(ageGroup => {
                const correspondingAgeCode = ageGroupCodes[ageGroup];

                maleSeries.push(data.results.filter(item => item.stratum2 === correspondingAgeCode && item.stratum4 === '8507')
                    .reduce((sum, item) => sum + item.countValue, 0));
                femaleSeries.push(data.results.filter(item => item.stratum2 === correspondingAgeCode && item.stratum4 === '8532')
                    .reduce((sum, item) => sum + item.countValue, 0));
                otherSeries.push(data.results.filter(item => item.stratum2 === correspondingAgeCode && item.stratum4 === '0')
                    .reduce((sum, item) => sum + item.countValue, 0));
            });

            return [
                {
                    name: 'Male',
                    data: maleSeries,
                    color: '#1f77b4'
                },
                {
                    name: 'Female',
                    data: femaleSeries,
                    color: '#ff7f0e'
                },
                {
                    name: 'Other',
                    data: otherSeries,
                    color: '#2ca02c'
                }
            ];
        }

        render() {
            return (
                <div>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={this.state.options}
                    />
                </div>
            );
        }
    }
