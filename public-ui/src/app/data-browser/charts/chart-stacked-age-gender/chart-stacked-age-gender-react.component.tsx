import React, { Component } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import { getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';

interface Props {
    ageGenderAnalysis: any;
}

interface State {
    options: any;
}

export const StackedColumnChartReactComponent = class extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                ...getBaseOptions(), // Apply base chart styling
                chart: {
                    ...getBaseOptions().chart,
                    type: 'column',
                    height: getBaseOptions().chart.height, // Ensure consistency with other charts
                },
                title: {
                    text: 'Age and Gender Distribution',
                    style: {
                        ...getBaseOptions().title.style,
                        color: "#262262",
                        fontSize: "22px",
                    },
                },
                xAxis: {
                    categories: this.formatAgeCategories(this.props.ageGenderAnalysis),
                    title: {
                        text: 'Age Groups',
                        style: {
                            ...getBaseOptions().xAxis.title.style,
                            color: "#262262",
                            fontSize: "14px",
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Participant Count',
                        align: 'high',
                        style: {
                            color: "#262262",
                            fontSize: "14px",
                        }
                    },
                    gridLineColor: "#ECF1F4",
                    labels: {
                        style: {
                            fontSize: "14px",
                            color: "#262262",
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        let tooltipText = `<strong>${this.x}</strong><br>`;
                        this.points.forEach(point => {
                            const value = point.y <= 20 ? '≤20' : point.y;
                            tooltipText += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: ${value}<br>`;
                        });
                        return tooltipText;
                    },
                    style: {
                        fontSize: "14px",
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        groupPadding: 0.4,
                        pointWidth: 50,
                        dataLabels: {
                            enabled: false,
                        }
                    }
                },
                series: this.formatAgeGenderData(this.props.ageGenderAnalysis),
            }
        };
    }

    formatAgeCategories(data) {
        const ageGroupMapping = {
            "2": "18-29", "3": "30-39", "4": "40-49", "5": "50-59",
            "6": "60-69", "7": "70-79", "8": "80-89", "9": "89+"
        };

        return data.results
            .map(item => item.stratum2)
            .filter((value, index, self) => Object.keys(ageGroupMapping).includes(value) && self.indexOf(value) === index)
            .map(group => ageGroupMapping[group])
            .sort((a, b) => Object.values(ageGroupMapping).indexOf(a) - Object.values(ageGroupMapping).indexOf(b));
    }

    formatAgeGenderData(data) {
        const ageGroups = this.formatAgeCategories(data);
        const ageGroupCodes = {
            "18-29": "2", "30-39": "3", "40-49": "4", "50-59": "5",
            "60-69": "6", "70-79": "7", "80-89": "8", "89+": "9"
        };

        const maleSeries = [];
        const femaleSeries = [];
        const otherSeries = [];

        ageGroups.forEach(ageGroup => {
            const ageCode = ageGroupCodes[ageGroup];

            maleSeries.push(data.results.filter(item => item.stratum2 === ageCode && item.stratum4 === '8507')
                .reduce((sum, item) => sum + item.countValue, 0));
            femaleSeries.push(data.results.filter(item => item.stratum2 === ageCode && item.stratum4 === '8532')
                .reduce((sum, item) => sum + item.countValue, 0));
            otherSeries.push(data.results.filter(item => item.stratum2 === ageCode && item.stratum4 === '0')
                .reduce((sum, item) => sum + item.countValue, 0));
        });

        return [
            { name: 'Male', data: maleSeries, color: '#1F78B4' },
            { name: 'Female', data: femaleSeries, color: '#A27BD7' },
            { name: 'Other', data: otherSeries, color: '#B2AEAD' }
        ];
    }

    render() {
        return (
            <div>
                <HighchartsReact highcharts={Highcharts} options={this.state.options} />
            </div>
        );
    }
};
