angular.module("managerApp")
/**
 * A simple monitoring chart directive using d3 js library for rendering.
 *
 * Example usage :
 *
 * var monitoringData = {
 *     data : [
 *         { timestamp: ..., value: ... },
 *         { timestamp: ..., value: ... },
 *         ...
 *     ],
 *     ymin : 0 (y axis minimum value OPTIONAL, default is minimum value of data series)
 *     ymax : 1 (y axis maximum value OPTIONAL, default is maximum value of data series)
 *     xmin : 0 (x axis minimum value OPTIONAL)
 *     xmax : 1 (x axis maximum value OPTIONAL)
 *     unit : "Mb" (y axis unit to be displayed OPTIONAL, default is none)
 *     timeScale : { unit: "hours", amount: 1, format: "%H" }
 *     yTicks : ticks count on y axis (OPTIONAL, default is 4)
 *     margin: {top: 10, right: 10, bottom: 10, left: 10} (chart margins, OPTIONAL)
 * };
 *
 * <div style="width: 400px; height: 300px">
 *     <monitoring-chart model="myMonitoringData"></monitoring-chart>
 * </div>
 *
 */
.directive("monitoringChart", function ($window) {
    "use strict";

    function Chart () {

        this.width = 0;
        this.height = 0;
        // default values, can be customized in model parameter
        this.margin = { top: 20, right: 120, bottom: 20, left: 120 };

        // d3js elements
        this.x = null;
        this.y = null;
        this.xAxis = null;
        this.yAxis = null;
        this.line = null;
        this.area = null;
        this.data = [];

        // d3js graphics
        this.g = {
            svg: null,
            x: null,
            y: null,
            line: null,
            area: null,
            bg: null
        };
    }

    Chart.prototype.init = function (d3, el) {
        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.y).orient("left");
        this.line = d3.svg.line();
        this.area = d3.svg.area();
        this.g.svg = d3.select(el).append("svg").attr("class", "cloud-monitoring-chart");
        this.g.bg = this.g.svg.append("rect").attr("class", "bg");
        this.g.area = this.g.svg.append("path").attr("class", "area");
        this.g.line = this.g.svg.append("path").attr("class", "line");
        this.g.x = this.g.svg.append("g").attr("class", "axis");
        this.g.y = this.g.svg.append("g").attr("class", "axis");
    };

    Chart.prototype.resize = function () {
        if (this.width > this.margin.left + this.margin.right &&
            this.height > this.margin.top + this.margin.bottom) {
            this.g.svg.attr({ width: this.width, height: this.height });
            this.x.range([this.margin.left, this.width - this.margin.right]);
            this.y.range([this.height - this.margin.bottom, this.margin.top]);
            this.yAxis.tickSize(-(this.width - this.margin.left - this.margin.right));
            this.g.bg.attr({
                width: this.width - this.margin.left - this.margin.right,
                height: this.height - this.margin.top - this.margin.bottom,
                transform: "translate(" + [this.margin.left, this.margin.top] + ")"
            });
            this.g.x.attr("transform", "translate(" + [0, this.y.range()[0]] + ")");
            this.g.y.attr("transform", "translate(" + [this.x.range()[0], 0] + ")");
            this.update();
        }
    };

    Chart.prototype.update = function () {
        // refresh scale
        this.g.x.call(this.xAxis);
        this.g.y.call(this.yAxis);
        // updates line chart
        this.g.line.attr({ d: this.line(this.data) });
        // updates area chart
        this.g.area.attr({ d: this.area(this.data) });
    };

    function timestampOf (x) {
        return x ? x.timestamp : null;
    }

    function valueOf (x) {
        return x ? x.value : null;
    }

    Chart.prototype.setModel = function (model) {
        var self = this;
        var fx = function (p) { return self.x(timestampOf(p)); };
        var fy = function (p) { return self.y(valueOf(p)); };
        var ymin = isNaN(+model.ymin) ? d3.min(model.data, valueOf) : +model.ymin;
        var ymax = isNaN(+model.ymax) ? d3.max(model.data, valueOf) : +model.ymax;
        this.data = angular.isArray(model.data) ? model.data : [];
        this.line.x(fx);
        this.area.x(fx);
        this.line.y(fy);
        this.area.y0(function () { return self.y.range()[0]; });
        this.area.y1(fy);
        this.x.domain([
            isNaN(+model.xmin) ? d3.min(this.data, timestampOf) : +model.xmin,
            isNaN(+model.xmax) ? d3.max(this.data, timestampOf) : +model.xmax
        ]);
        this.y.domain([ymin, ymax]);
        this.yAxis.tickFormat(function tickFormat (p) {
            return p + (model.unit ? " " + model.unit : "");
        });
        if (model.timeScale) {
            if (model.timeScale.unit && model.timeScale.amount) {
                this.xAxis.ticks(d3.time[model.timeScale.unit], model.timeScale.amount);
            }
            if (model.timeScale.format) {
                this.xAxis.tickFormat(d3.time.format(model.timeScale.format));
            }
        } else {
            this.xAxis.ticks("days");
        }
        this.yAxis.ticks(angular.isDefined(model.yTicks) ? model.yTicks : 4);
        this.margin = model.margin || this.margin;
        this.resize();
        this.update();
    };

    return {
        restrict: "E",
        scope: {
            model: "=model",
        },
        link: function ($scope, $element) {
            var d3 = $window.d3;
            if (d3) {

                var chart = new Chart();

                // initialize new chart
                chart.init(d3, $element[0]);

                // fill parent container on resize
                $scope.$watch(function () {
                    if ($element.parent().width() > 0 && $element.parent().height() > 0) {
                        chart.width = $element.parent().width();
                        chart.height = $element.parent().height();
                    }
                    return chart.width + chart.height;
                }, function () {
                    chart.resize();
                });

                // update on model change
                $scope.$watch("model", function (model) {
                    chart.setModel(model);
                });

            } else {
                throw "Missing D3.js dependency";
            }
        }
    };
});
