"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var PINChart = /*#__PURE__*/function () {
  function PINChart(chartElement, data) {
    var _this = this;

    _classCallCheck(this, PINChart);

    this.ctx = chartElement.getContext('2d');
    var priceData = {
      labels: this.createLabels(data.length),
      datasets: [{
        fill: true,
        spanGaps: true,
        tension: 0.2,
        data: data,
        backgroundColor: function backgroundColor(context) {
          var chart = context.chart;
          var ctx = chart.ctx,
              chartArea = chart.chartArea;

          if (!chartArea) {
            // This case happens on initial chart load
            return null;
          }

          return _this.getGradient(ctx, chartArea);
        }
      }]
    };
    var config = {
      type: 'line',
      data: priceData,
      options: {
        borderColor: '#0a1992',
        elements: {
          point: {
            radius: 0,
            hitRadius: 4,
            hoverRadius: 4
          }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        onResize: function onResize(chart, size) {
          return _this.changeDisplayedLabels(chart, size);
        },
        scales: {
          y: {
            ticks: {
              maxTicksLimit: 4,
              align: 'end'
            },
            grid: {
              display: false,
              borderWidth: 2
            }
          },
          x: {
            ticks: {
              maxTicksLimit: 7,
              maxRotation: 0,
              minRotation: 0,
              align: 'start'
            },
            grid: {
              display: false,
              borderWidth: 2
            }
          }
        }
      }
    };
    this.chart = new Chart(this.ctx, config);
  }

  _createClass(PINChart, [{
    key: "changeDisplayedLabels",
    value: function changeDisplayedLabels(chart, size) {
      if (size.width < 350) {
        chart.options.scales.y.ticks.display = false;
        chart.options.scales.x.ticks.display = false;
      } else {
        chart.options.scales.y.ticks.display = true;
        chart.options.scales.x.ticks.display = true;
      }
    }
  }, {
    key: "createLabels",
    value: function createLabels(arrLen) {
      var todayDate = moment(new Date()).format('MMM D');
      var dateLabels = [todayDate];

      for (var index = 0; index < arrLen; index++) {
        dateLabels.push(moment().subtract(index, 'hours').format('MMM D'));
      }

      ;
      return dateLabels.reverse();
    }
  }, {
    key: "getChart",
    value: function getChart() {
      return this.chart;
    }
  }, {
    key: "getContext",
    value: function getContext() {
      return this.ctx;
    }
  }, {
    key: "getGradient",
    value: function getGradient(ctx, chartArea) {
      var gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, 'rgb(10, 25, 146, 1)');
      gradient.addColorStop(1, 'rgb(255, 255, 255, 0)');
      return gradient;
    }
  }]);

  return PINChart;
}(); // # sourceMappingURL=pin-chart.js.map