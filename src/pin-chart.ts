import { ChartItem, ChartConfiguration, Chart, ChartArea } from "chart.js";
import * as moment from "moment";

interface GraphData {
    currentPrice: number
    priceChangePercentage: {
        "24h": number,
        "7d": number
    },
    priceData: number[],
    lastUpdated: string
}

enum Timeline {
    Day = "24h",
    Week = "7d"
}

export default class PINChart {
    ctx: ChartItem | undefined | null
    config: ChartConfiguration
    chart: Chart
    chartContainer: HTMLDivElement
    data: GraphData
    timeline: Timeline

    constructor(chartContainer: HTMLDivElement, data: GraphData) {
        const canvas = document.createElement("canvas")
        canvas.setAttribute("id", "pin-chart")
        chartContainer.append(canvas)
        this.data = data
        this.chartContainer = chartContainer
        this.ctx = canvas.getContext('2d');
        this.timeline = Timeline.Week
        const priceData = {
            labels: PINChart.createLabels(this.data, "7d"),
            datasets: [{
                fill: true,             
                spanGaps: true,
                tension: 0.2,
                data: data.priceData,
                backgroundColor: (context) => {
                    const chart: Chart = context.chart
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        // This case happens on initial chart load
                        return null;
                    }
                    return PINChart.getGradient(ctx, chartArea);
                }
            }]
        };
        const config: ChartConfiguration = {
            type: 'line',
            data: priceData,
            options: {
                maintainAspectRatio: false,
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
                onResize(chart, size) {
                    PINChart.changeDisplayedLabels(chart, size)
                },
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
                        offset: true,
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 7,
                            maxRotation: 0,
                            minRotation: 0,
                            align: "start"
                        },
                        grid: {
                            display: false,
                            borderWidth: 0,
                        }
                    }
                }
            },
            
        };
        this.chart = new Chart(this.ctx, config);
    }

    getChart() {
        return this.chart;
    }

    getContext() {
        return this.ctx;
    }

    updateChart(data: GraphData, period: string) {
        if (this.chart !== null) {
            this.chart.data.labels = PINChart.createLabels(data, period);
            this.chart.data.datasets[0].data  = data.priceData;
            this.chart.update()
        }
    }

    static changeTimeline(period: string, chart: PINChart) {
        let data: GraphData = Object.assign({}, chart.data)
        switch (period) {
            case Timeline.Day:
                data.priceData = data.priceData.slice(data.priceData.length - 25, data.priceData.length)
                data.priceData.reverse()
                chart.chart.options.scales.x.ticks.maxTicksLimit = null
                chart.updateChart(data, period)
                break;
            case Timeline.Week:
                chart.chart.options.scales.x.ticks.maxTicksLimit = 7
                chart.updateChart(data, period)
                break;
            default:
                break;
        }
    }

    static buttonChangeActive(period: string, data: GraphData) {
        Object.keys(data.priceChangePercentage).forEach(keyName => {
            let btn = document.getElementById(keyName)
            if (btn.classList.contains("active")) btn.classList.remove("active")
        })
        let btn = document.getElementById(period)
        btn.classList.add("active")
    }

    createTimelineButtons(data: GraphData, chart: PINChart) {
        var detailsContainer = document.getElementById("priceContainer")
        var btnContainer = document.createElement("div")
        btnContainer.setAttribute("class", "ml-auto btn-group m-0")
        Object.keys(data.priceChangePercentage).forEach(keyName => {
            let btn = document.createElement("btn")
            btn.setAttribute("id", keyName)
            btn.setAttribute("class", "btn btn-primary py-1")
            btn.addEventListener("click", function () {
                PINChart.changeTimeline(keyName, chart)
                PINChart.buttonChangeActive(keyName, data)
            });
            btn.innerHTML = keyName
            btnContainer.appendChild(btn)
        });
        detailsContainer.appendChild(btnContainer)
    }

    createTitleBar(data: GraphData) {
        var detailsContainer = document.createElement("div")
        var priceContainer = document.createElement("div")
        var timeDetailsContainer = document.createElement("div")
        var priceTitle = document.createElement("h3")
        var priceCurrency = document.createElement("h5")
        var priceChange = document.createElement("p")
        var lastUpdated = document.createElement("p")

        priceContainer.setAttribute("id", "priceContainer")
        detailsContainer.setAttribute("class", "container-auto")  
        priceContainer.setAttribute("class", "d-flex align-items-end")
        timeDetailsContainer.setAttribute("id", "timeDetailsContainer")
        timeDetailsContainer.setAttribute("class", "d-flex")

        priceCurrency.innerHTML = "PIN/USD"
        priceCurrency.setAttribute("class", "mr-1 mb-1")

        priceTitle.setAttribute("id", "priceTitle")
        priceTitle.innerHTML = `${data.currentPrice}`
        priceTitle.setAttribute("class", "mb-0 mr-1")
        
        priceChange.setAttribute("class", "mb-1")
        priceChange.innerHTML = `(${parseFloat(`${data.priceChangePercentage["7d"]}`).toFixed(2)}%)`
        lastUpdated.innerHTML = `${moment(data.lastUpdated).utc(true).format("LLLL z")}`

        priceContainer.append(priceTitle, priceCurrency, priceChange)
        timeDetailsContainer.append(lastUpdated)
        detailsContainer.append(priceContainer, timeDetailsContainer)
        this.chartContainer.prepend(detailsContainer)
    }

    static getGradient(ctx: CanvasRenderingContext2D, chartArea: ChartArea) {
        let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgb(10, 25, 146, 1)');
        gradient.addColorStop(1, 'rgb(255, 255, 255, 0)');
        return gradient;
    }

    static createLabels(data: GraphData, period: string) {
        let dateLabels = []
        let arrLen = data.priceData.length
        switch (period) {
            case Timeline.Day:
                const hourDate = moment(new Date(data.lastUpdated)).format("Do h:mm:ss a");
                dateLabels = [hourDate]
                for (let index = 0; index < arrLen; index++) {
                    dateLabels.push(moment().subtract(index, 'hours').format("Do h:mm:ss a"));
                };
                break;
            case Timeline.Week:
                const todayDate = moment(new Date(data.lastUpdated)).format("MMM D");
                dateLabels = [todayDate]
                for (let index = 0; index < arrLen; index++) {
                    dateLabels.push(moment().subtract(index, 'hours').format("MMM D"));
                };
                break;
            default:
                break;
        }
        return dateLabels.reverse();
    }

    static changeDisplayedLabels(chart: Chart, size: {width: number; height: number;}) {
        if (size.width < 545) {
            if (size.width < 350) { chart.options.scales.y.ticks.display = false }
            else { chart.options.scales.y.ticks.display = false }
            chart.options.scales.x.ticks.display = false;
        } else {
            chart.options.scales.y.ticks.display = true;
            chart.options.scales.x.ticks.display = true;
        }
    }
}