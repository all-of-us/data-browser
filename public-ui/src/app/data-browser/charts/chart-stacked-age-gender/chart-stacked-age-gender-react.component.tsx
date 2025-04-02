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
        const isSurvey = this.props.ageGenderAnalysis.results?.[0]?.stratum5;
        this.state = {
            options: {
                ...getBaseOptions(), // Apply base chart styling
                chart: {
                    ...getBaseOptions().chart,
                    type: 'column',
                    height: getBaseOptions().chart.height, // Ensure consistency with other charts
                },
                title: {
                    text: null,
                },
                xAxis: {
                    categories: this.formatAgeCategories(this.props.ageGenderAnalysis),
                    title: {
                        text: isSurvey
                          ? 'Age when survey was taken'
                          : 'Age at First Occurrence in Participant Record',
                        style: {
                            ...getBaseOptions().xAxis.title.style,
                            color: "#262262",
                            fontSize: "14px",
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    lineWidth: 1,
                    lineColor: '#262262', // or keep '#ECF1F4' if lighter is preferred
                    gridLineWidth: 1,       // <- ensures horizontal grid lines are visible
                    gridLineColor: '#ECF1F4', // <- soft gray like in your image
                    title: {
                        text: 'Participant Count',
                        align: 'middle',
                        style: {
                            color: "#262262",
                            fontSize: "14px",
                        }
                    },
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

      const usesStratum5 = data.results.length > 0 && !!data.results[0].stratum5;

      const ageCodes = data.results
        .map(item => usesStratum5 ? item.stratum5 : item.stratum2)
        .filter((value, index, self) => Object.keys(ageGroupMapping).includes(value) && self.indexOf(value) === index);

      return ageCodes
        .map(code => ageGroupMapping[code])
        .sort((a, b) => Object.values(ageGroupMapping).indexOf(a) - Object.values(ageGroupMapping).indexOf(b));
    }


    formatAgeGenderData(data) {
      const ageGroups = this.formatAgeCategories(data);
      const ageGroupCodes = {
        "18-29": "2", "30-39": "3", "40-49": "4", "50-59": "5",
        "60-69": "6", "70-79": "7", "80-89": "8", "89+": "9"
      };

      const usesStratum5 = data.results.length > 0 && !!data.results[0].stratum5;
      const ageKey = usesStratum5 ? 'stratum5' : 'stratum2';
      const genderKey = usesStratum5 ? 'stratum7' : 'stratum4';

      const maleSeries = [];
      const femaleSeries = [];
      const otherSeries = [];

      ageGroups.forEach(ageGroup => {
        const ageCode = ageGroupCodes[ageGroup];

        const groupResults = data.results.filter(item => item[ageKey] === ageCode);

        maleSeries.push(groupResults.filter(item => item[genderKey] === '8507')
          .reduce((sum, item) => sum + item.countValue, 0));
        femaleSeries.push(groupResults.filter(item => item[genderKey] === '8532')
          .reduce((sum, item) => sum + item.countValue, 0));
        otherSeries.push(groupResults.filter(item => item[genderKey] === '0')
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
