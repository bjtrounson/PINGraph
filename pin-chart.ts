import { ChartItem, ChartConfiguration, Chart, ChartArea } from "chart.js";
import * as moment from "moment";

class PINChart {
    ctx: ChartItem
    config: ChartConfiguration
    chart: Chart

    constructor(chartElement: HTMLCanvasElement, data: number[]) {
        this.ctx = chartElement.getContext('2d') as ChartItem;
        const priceData = {
            labels: this.createLabels(data.length),
            datasets: [{
                fill: true,
                spanGaps: true,
                tension: 0.2,
                data: data,
                backgroundColor: (context) => {
                    const chart: Chart = context.chart
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        // This case happens on initial chart load
                        return null;
                    }
                    return this.getGradient(ctx, chartArea);
                }
            }]
        };
        const config: ChartConfiguration = {
            type: 'line',
            data: priceData,
            options: {
                borderColor: '#0a1992',
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 4,
                        hoverRadius: 4,
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                onResize: (chart, size) => this.changeDisplayedLabels(chart, size),
                scales: {
                    y: {
                        ticks: {
                            maxTicksLimit: 4,
                            align: "end"
                        },
                        grid: {
                            display: false,
                            borderWidth: 2,
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 7,
                            maxRotation: 0,
                            minRotation: 0,
                            align: "start"
                        },
                        grid: {
                            display: false,
                            borderWidth: 2,
                        }
                    }
                }
            },
            
        };
        this.chart = new Chart(this.ctx, config);
    }

    changeDisplayedLabels(chart: Chart, size: {width: number; height: number;}) {
        if (size.width < 350) {
            chart.options.scales.y.ticks.display = false;
            chart.options.scales.x.ticks.display = false;
        } else {
            chart.options.scales.y.ticks.display = true;
            chart.options.scales.x.ticks.display = true;
        }
    }

    createLabels(arrLen: number) {
        const todayDate = moment(new Date()).format("MMM D");
        const dateLabels = [todayDate]
        for (let index = 0; index < arrLen; index++) {
            dateLabels.push(moment().subtract(index, 'hours').format("MMM D"));
        };
        return dateLabels.reverse();
    }

    getChart() {
        return this.chart;
    }

    getContext() {
        return this.ctx;
    }

    getGradient(ctx: CanvasRenderingContext2D, chartArea: ChartArea) {
        let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgb(10, 25, 146, 1)');
        gradient.addColorStop(1, 'rgb(255, 255, 255, 0)');
      
        return gradient;
      }
}