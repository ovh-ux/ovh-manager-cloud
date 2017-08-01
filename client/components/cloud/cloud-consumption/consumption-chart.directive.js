angular.module("managerApp")
/**
 * A simple consumption chart directive using d3 js library for rendering.
 *
 * Example usage :
 *
 * var consumptionData = {
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
 *     <consumption-chart model="myConsumptionData"></consumption-chart>
 * </div>
 *
 */
.directive("consumptionChart", function ($window) {
    "use strict";
    function Chart () {

        this.width = 250;
        this.height = 150;
        this.textSpacing = 4;
        // default values, can be customized in model parameter
        this.margin = { top: 20, right: 0, bottom: 20, left: 80 };

        // d3js elements
        this.x = null;
        this.y = null;
        this.xAxis = null;
        this.barNow = null;
        this.barFuture = null;
        this.data = null;

        // d3js graphics
        this.g = {
            svg: null,
            x: null,
            y: null,
            line: null,
            barNow: null,
            barFuture: null,
        };
    }

    Chart.prototype.init = function (d3, el) {
        this.x = d3.scale.ordinal();
        this.y = d3.scale.linear();
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        this.g.svg = d3.select(el).append("svg").attr("class", "cloud-consumption-chart");

        this.g.barNow = this.g.svg.append("rect").attr("class", "barNow");
        this.g.barFuture = this.g.svg.append("rect").attr("class", "barFuture");
        this.g.line = this.g.svg.append("line").attr("class", "line");
        this.g.thresholdText = this.g.svg.append("text").attr("class", "threshold-text");
        this.g.thresholdAmount = this.g.svg.append("text").attr("class", "threshold-amount-text");
        this.g.barText1 = this.g.svg.append("text").attr("class", "bar-text");
        this.g.barText2 = this.g.svg.append("text").attr("class", "bar-text");
        this.g.x = this.g.svg.append("g").attr("class", "axis");
        this.g.y = this.g.svg.append("g").attr("class", "axis");
    };

    Chart.prototype.resize = function () {
        if (this.width > this.margin.left + this.margin.right &&
            this.height > this.margin.top + this.margin.bottom) {
            this.g.svg.attr({ width: this.width, height: this.height });

            this.x.rangeRoundBands([0, this.width], 0.50, 0.70);
            this.y.range([this.height - this.margin.bottom, this.margin.top, 0]);
            this.g.x.attr("transform", "translate(" + [0, this.y.range()[0]] + ")");
            this.g.y.attr("transform", "translate(" + [this.x.range()[0], 0] + ")");
            this.g.barText1.attr("transform", "translate(" + [this.x.rangeBand() / 2, 0] + ")");
            this.g.barText2.attr("transform", "translate(" + [this.x.rangeBand() / 2, 0] + ")");
            this.update();
        }
    };

    Chart.prototype.update = function () {
        // refresh scale
        this.g.x.call(this.xAxis);

        this.g.barNow
                .attr("x", this.x(this.data.estimate.now.label))
                .attr("y", this.y(this.data.estimate.now.value))
                .attr("height", this.height - this.y(this.data.estimate.now.value) - this.margin.bottom)
                .attr("width", this.x.rangeBand());

        this.g.barText1
            .attr("x", this.x(this.data.estimate.now.label))
            .attr("y", this.y(this.data.estimate.now.value) - this.textSpacing)
            .text(this.data.estimate.now.value + " " + this.data.estimate.now.currencyCode)
            .attr("width", this.x.rangeBand());

        this.g.barFuture
                .attr("x", this.x(this.data.estimate.endOfMonth.label))
                .attr("y", this.y(this.data.estimate.endOfMonth.value))
                .attr("height", this.height - this.y(this.data.estimate.endOfMonth.value) - this.margin.bottom)
                .attr("width", this.x.rangeBand());

        this.g.barText2
            .attr("x", this.x(this.data.estimate.endOfMonth.label))
            .attr("y", this.y(this.data.estimate.endOfMonth.value) - this.textSpacing)
            .text(this.data.estimate.endOfMonth.value + " " + this.data.estimate.endOfMonth.currencyCode)
            .attr("width", this.x.rangeBand());

        this.g.thresholdText
            .attr("x", 20)
            .attr("y", this.y(this.data.threshold.now.value))
            .text(this.data.threshold.now.label)
            .attr("width", this.x.rangeBand());

        this.g.thresholdAmount
            .attr("x", this.width)
            .attr("y", this.y(this.data.threshold.now.value) - this.textSpacing)
            .text(this.data.threshold.now.value + " " + this.data.threshold.now.currencyCode)
            .attr("width", this.x.rangeBand());

        this.g.line
           .attr("x1", this.x(this.data.estimate.now.label) - 16)
           .attr("x2", this.width)
           .attr("y1", this.y(this.data.threshold.now.value))
           .attr("y2", this.y(this.data.threshold.endOfMonth.value));
    };

    Chart.prototype.setModel = function (model) {
        this.data = model;
        var dataValues = _.values(model.estimate);
        this.x.domain(dataValues.map(function (d) { return d.label; }));
        var maxYDomainEstimate = d3.max(dataValues, function (d) { return d.value; });
        var maxYDomainThreshold = d3.max(_.values(model.threshold), function (d) { return d.value; });
        var maxYDomain = _.max([maxYDomainEstimate, maxYDomainThreshold]);
        this.y.domain([0, maxYDomain * 1.20]);
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
            var self = this;

            self.d3 = $window.d3;
            if (self.d3) {
                var chart = new Chart();
                chart.init(d3, $element[0]);
                // initialize new chart

                // fill parent container on resize
                $scope.$watch(function () {
                    if ($element.parent().width() > 0 && $element.parent().height() > 0) {
                        chart.width = $element.parent().width();
                        chart.height = $element.parent().height();
                    }
                    return chart.width + chart.height;
                }, function () {
                    if (chart.data) {
                        chart.resize();
                    }   
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
