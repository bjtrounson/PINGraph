import { Chart } from 'chart.js';
import moment from 'moment';

var Timeline;
(function (Timeline) {
    Timeline["Day"] = "24h";
    Timeline["Week"] = "7d";
})(Timeline || (Timeline = {}));
var PINChart = /** @class */ (function () {
    function PINChart(chartContainer, data) {
        var canvas = document.createElement("canvas");
        canvas.setAttribute("id", "pin-chart");
        chartContainer.append(canvas);
        this.data = data;
        this.chartContainer = chartContainer;
        this.ctx = canvas.getContext('2d');
        this.timeline = Timeline.Week;
        var priceData = {
            labels: PINChart.createLabels(this.data, "7d"),
            datasets: [{
                    fill: true,
                    spanGaps: true,
                    tension: 0.2,
                    data: data.priceData,
                    backgroundColor: function (context) {
                        var chart = context.chart;
                        var ctx = chart.ctx, chartArea = chart.chartArea;
                        if (!chartArea) {
                            // This case happens on initial chart load
                            return null;
                        }
                        return PINChart.getGradient(ctx, chartArea);
                    }
                }]
        };
        var config = {
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
                onResize: function (chart, size) {
                    PINChart.changeDisplayedLabels(chart, size);
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
    PINChart.prototype.getChart = function () {
        return this.chart;
    };
    PINChart.prototype.getContext = function () {
        return this.ctx;
    };
    PINChart.prototype.updateChart = function (data, period) {
        if (this.chart !== null) {
            this.chart.data.labels = PINChart.createLabels(data, period);
            this.chart.data.datasets[0].data = data.priceData;
            this.chart.update();
        }
    };
    PINChart.changeTimeline = function (period, chart) {
        var data = Object.assign({}, chart.data);
        switch (period) {
            case Timeline.Day:
                data.priceData = data.priceData.slice(data.priceData.length - 25, data.priceData.length);
                data.priceData.reverse();
                chart.chart.options.scales.x.ticks.maxTicksLimit = null;
                chart.updateChart(data, period);
                break;
            case Timeline.Week:
                chart.chart.options.scales.x.ticks.maxTicksLimit = 7;
                chart.updateChart(data, period);
                break;
        }
    };
    PINChart.buttonChangeActive = function (period, data) {
        Object.keys(data.priceChangePercentage).forEach(function (keyName) {
            var btn = document.getElementById(keyName);
            if (btn.classList.contains("active"))
                btn.classList.remove("active");
        });
        var btn = document.getElementById(period);
        btn.classList.add("active");
    };
    PINChart.prototype.createTimelineButtons = function (data, chart) {
        var detailsContainer = document.getElementById("priceContainer");
        var btnContainer = document.createElement("div");
        btnContainer.setAttribute("class", "ml-auto btn-group m-0");
        Object.keys(data.priceChangePercentage).forEach(function (keyName) {
            var btn = document.createElement("btn");
            btn.setAttribute("id", keyName);
            btn.setAttribute("class", "btn btn-primary py-1");
            btn.addEventListener("click", function () {
                PINChart.changeTimeline(keyName, chart);
                PINChart.buttonChangeActive(keyName, data);
            });
            btn.innerHTML = keyName;
            btnContainer.appendChild(btn);
        });
        detailsContainer.appendChild(btnContainer);
    };
    PINChart.prototype.createTitleBar = function (data) {
        var detailsContainer = document.createElement("div");
        var priceContainer = document.createElement("div");
        var timeDetailsContainer = document.createElement("div");
        var priceTitle = document.createElement("h3");
        var priceCurrency = document.createElement("h5");
        var priceChange = document.createElement("p");
        var lastUpdated = document.createElement("p");
        priceContainer.setAttribute("id", "priceContainer");
        detailsContainer.setAttribute("class", "container-auto");
        priceContainer.setAttribute("class", "d-flex align-items-end");
        timeDetailsContainer.setAttribute("id", "timeDetailsContainer");
        timeDetailsContainer.setAttribute("class", "d-flex");
        priceCurrency.innerHTML = "PIN/USD";
        priceCurrency.setAttribute("class", "mr-1 mb-1");
        priceTitle.setAttribute("id", "priceTitle");
        priceTitle.innerHTML = "".concat(data.currentPrice);
        priceTitle.setAttribute("class", "mb-0 mr-1");
        priceChange.setAttribute("class", "mb-1");
        priceChange.innerHTML = "(".concat(parseFloat("".concat(data.priceChangePercentage["7d"])).toFixed(2), "%)");
        lastUpdated.innerHTML = "".concat(moment(data.lastUpdated).utc(true).format("LLLL z"));
        priceContainer.append(priceTitle, priceCurrency, priceChange);
        timeDetailsContainer.append(lastUpdated);
        detailsContainer.append(priceContainer, timeDetailsContainer);
        this.chartContainer.prepend(detailsContainer);
    };
    PINChart.getGradient = function (ctx, chartArea) {
        var gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgb(10, 25, 146, 1)');
        gradient.addColorStop(1, 'rgb(255, 255, 255, 0)');
        return gradient;
    };
    PINChart.createLabels = function (data, period) {
        var dateLabels = [];
        var arrLen = data.priceData.length;
        switch (period) {
            case Timeline.Day:
                var hourDate = moment(new Date(data.lastUpdated)).format("Do h:mm:ss a");
                dateLabels = [hourDate];
                for (var index = 0; index < arrLen; index++) {
                    dateLabels.push(moment().subtract(index, 'hours').format("Do h:mm:ss a"));
                }
                break;
            case Timeline.Week:
                var todayDate = moment(new Date(data.lastUpdated)).format("MMM D");
                dateLabels = [todayDate];
                for (var index = 0; index < arrLen; index++) {
                    dateLabels.push(moment().subtract(index, 'hours').format("MMM D"));
                }
                break;
        }
        return dateLabels.reverse();
    };
    PINChart.changeDisplayedLabels = function (chart, size) {
        if (size.width < 545) {
            if (size.width < 350) {
                chart.options.scales.y.ticks.display = false;
            }
            else {
                chart.options.scales.y.ticks.display = false;
            }
            chart.options.scales.x.ticks.display = false;
        }
        else {
            chart.options.scales.y.ticks.display = true;
            chart.options.scales.x.ticks.display = true;
        }
    };
    return PINChart;
}());

export { PINChart as default };
//# sourceMappingURL=pin-chart.js.map
