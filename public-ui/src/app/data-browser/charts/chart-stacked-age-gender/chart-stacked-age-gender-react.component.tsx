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
                    shared: false,
                    useHTML: true, // Allow HTML formatting for alignment
                    style: {
                        fontSize: "14px",
                    },
                    formatter: function () {
                        const ageGroup = this.series.chart.xAxis[0].categories[this.point.index];
                        const count = this.y;
                        const totalInGroup = this.series.chart.series
                            .map(s => s.data[this.point.index]?.y || 0)
                            .reduce((a, b) => a + b, 0);
                        const percent = totalInGroup > 0 ? ((count / totalInGroup) * 100).toFixed(1) : '0';

                        return `
                            <div style="text-align: left;">
                                <div><strong>${this.series.name} ${ageGroup}</strong></div>
                                <div>${count.toLocaleString().padStart(6, ' ')} Participants</div>
                                <div>${percent.toString().padStart(5, ' ')}% of age group</div>
                            </div>
                        `;
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        groupPadding: 0.4,
                        pointWidth: 50,
                        dataLabels: {
                            enabled: false,
                        },
                        states: {
                            hover: {
                                brightness: 0.1 // Subtle highlight
                            }
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
