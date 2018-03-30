"use strict";

angular.module("managerApp")
.controller("CloudProjectComputeInfrastructureVirtualMachineMonitoringCtrl",
    function ($rootScope, $scope, $q, $timeout, CloudProjectComputeInfrastructureOrchestrator, OvhApiCloudProjectInstance,
              CLOUD_MONITORING, CLOUD_UNIT_CONVERSION) {

        var self = this;

        self.vm = null;

        this.loaders = {
            monitoring: {
                "cpu:used": false,
                "mem:used": false,
                "net:rx"  : false,
                "net:tx"  : false
            }
        };

        this.dataPeriod = {
            cpu : {
                max : undefined,
                needUpgrade : undefined
            },
            mem : {
                max : undefined,
                needUpgrade : undefined
            },
            net : {
                up   : {
                    max : undefined,
                    needUpgrade : undefined
                },
                down : {
                    max : undefined,
                    needUpgrade : undefined
                }
            }
        };

        self.accordions  = {
            cpu       : false,
            mem       : false,
            net : false
        };

        self.chartData = {
            "cpu:used": null,
            "mem:used": null,
            "net:rx"  : null,
            "net:tx"  : null
        };

        // list of available periods to select for monitoring chart
        self.chartPeriodEnum = [
            "lastday",
            "lastweek",
            "lastmonth",
            "lastyear"
        ];

        // currently selected period for each monitoring chart
        self.selectedChartPeriod = {
            'cpu:used': "lastweek",
            'mem:used': "lastweek",
            "net:rx"  : "lastweek",
            "net:tx"  : "lastweek"
        };

        self.close = function() {
            self.vm.stopMonitoring();
            $rootScope.$broadcast("highlighed-element.hide", "compute," + self.vm.id);
        };

        self.openVmFlavorEditionState = function() {
            CloudProjectComputeInfrastructureOrchestrator.setEditVmParam("FLAVOR");
            CloudProjectComputeInfrastructureOrchestrator.turnOnVmEdition(self.vm);
        };

        // on period change, reload monitoring data and update chart
        self.onChartPeriodChanged = function (type) {
            var period = self.selectedChartPeriod[type];
            self.loaders.monitoring[type] = true;
            OvhApiCloudProjectInstance.v6().resetAllCache();
            OvhApiCloudProjectInstance.v6().monitoring({
                serviceName : self.vm.serviceName,
                instanceId  : self.vm.id,
                period      : period,
                type        : type
            }).$promise.then(function (data) {
                updateChart(type, period, data);
                updateMaxTypePercentageForPeriod(type, data);
            }, function () {
                self.chartData[type] = null;
            })["finally"](function () {
                self.loaders.monitoring[type] = false;
            });
        };

        function init() {
            self.vm = CloudProjectComputeInfrastructureOrchestrator.getMonitoredVm();
            $rootScope.$broadcast("highlighed-element.show", "compute," + self.vm.id);

            $(document).on("keyup", closeOnEscapeKey);
            $scope.$on("$destroy", function() {
                $(document).off("keyup", closeOnEscapeKey);
            });

            if (self.vm.monitoringData) {
                updateChartsWithMonitoringData(self.vm.monitoringData.raw);
                updateMaxPercentageForPeriod(self.vm.monitoringData.raw);
            } else {
                self.vm.getMonitoringData()["finally"](function () {
                    if (self.vm.monitoringData) {
                        updateChartsWithMonitoringData(self.vm.monitoringData.raw);
                        updateMaxPercentageForPeriod(self.vm.monitoringData.raw);
                    }
                });
            }

            $scope.$watch("VmMonitoringCtrl.accordions.cpu", function(oldValue) {
                if (oldValue) {
                    self.accordions.mem = false;
                    self.accordions.net = false;
                }
            }, true);

            $scope.$watch("VmMonitoringCtrl.accordions.mem", function(oldValue) {
                if (oldValue) {
                    self.accordions.cpu = false;
                    self.accordions.net = false;
                }
            }, true);

            $scope.$watch("VmMonitoringCtrl.accordions.net", function(oldValue) {
                if (oldValue) {
                    self.accordions.mem = false;
                    self.accordions.cpu = false;
                }
            }, true);
        }

        function closeOnEscapeKey (evt) {
            if (evt.which === 27) {
                self.close();
            }
            $scope.$apply();
        }

        // get a good timescale to display values over a given period
        function getPeriodTimeScale (period) {
            switch (period) {
                case "lastday":
                    return { unit: "hours", amount: 2, format: "%Hh" };
                case "lastweek":
                    return { unit: "days", amount: 1, format: "%d/%m" };
                case "lastmonth":
                    return { unit: "weeks", amount: 1, format: "%d/%m" };
                case "lastyear":
                    return { unit: "months", amount: 1, format: "%m" };
                default:
                    return { unit: "days", amount: 1, format: "%Hh" };
            }
        }

        function getPeriodStart (period) {
            var oneDay = 1000 * 60 * 60 * 24; // in ms
            switch (period) {
                case "lastday":
                    return new Date().getTime() - oneDay;
                case "lastweek":
                    return new Date().getTime() - 7 * oneDay;
                case "lastmonth":
                    return new Date().getTime() - 31 * oneDay;
                case "lastyear":
                    return new Date().getTime() - 365 * oneDay;
            }
        }

        // updates monitoring chart with given data from api
        function updateChart (type, period, rawData) {
            var scaledData = getDefaultScale(rawData);
            

            if (type === "net:rx" || type === "net:tx"){
                var scaledData = scaleData(rawData);
            }

            var divisionScale = scaledData.divisionScale;
            var unit = scaledData.unit;

            var data = _.map(rawData.values, function (e) {
                return {
                    timestamp: e.timestamp * 1000, // unix to js timestamp
                    value: e.value / divisionScale
                };
            });
            if (data.length) {
                var chartData = {
                    data: data,
                    ymin: 0,
                    xmin: getPeriodStart(period),
                    xmax: new Date().getTime(),
                    unit: unit,
                    margin: { top: 10, left: 55, bottom: 30, right: 10 },
                    timeScale: getPeriodTimeScale(period)
                };
                if (type === "mem:used" && self.vm.monitoringData && self.vm.monitoringData.mem &&
                    self.vm.monitoringData.mem.total) {
                    chartData.ymax = self.vm.monitoringData.mem.total.value;
                }
                self.chartData[type] = chartData;
            }
        }

        function getDefaultScale(rawData){
            return {
                divisionScale: 1,
                unit: rawData.unit
            }
        }

        function scaleData(rawData) {
            var maxValue = _.chain(rawData.values)
                .map(function(timeSerie) {
                    return timeSerie.value;
                })
                .max()
                .value();
            var divisionScale;
            var unit;

            if (maxValue / CLOUD_UNIT_CONVERSION.GIGABYTE_TO_BYTE >= 1) {
                divisionScale = CLOUD_UNIT_CONVERSION.GIGABYTE_TO_BYTE;
                unit = "gb/s"
            } else if (maxValue / CLOUD_UNIT_CONVERSION.MEGABYTE_TO_BYTE >= 1) {
                divisionScale = CLOUD_UNIT_CONVERSION.MEGABYTE_TO_BYTE;
                unit = "mb/s"
            } else if (maxValue / CLOUD_UNIT_CONVERSION.KILOBYTE_TO_BYTE >= 1) {
                divisionScale = CLOUD_UNIT_CONVERSION.KILOBYTE_TO_BYTE;
                unit = "kb/s"
            } else {
                divisionScale = 1,
                unit = "b/s"
            }

            return {
                divisionScale: divisionScale,
                unit: unit
            }
        }

        function updateMaxPercentageForPeriod(data) {
            updateMaxCPUPercentageForPeriod(data["cpu:used"]);
            updateMaxRAMPercentageForPeriod(data["mem:used"]);
            updateMaxNETDownPercentageForPeriod(data["net:tx"]);
            updateMaxNETUpPercentageForPeriod(data["net:rx"]);
        }

        function updateMaxTypePercentageForPeriod(type, data) {
            if (type === "cpu:used") {
                updateMaxCPUPercentageForPeriod(data);
            }
            if (type === "mem:used") {
                updateMaxRAMPercentageForPeriod(data);
            }
            if (type === "net:tx") {
                updateMaxNETDownPercentageForPeriod(data);
            }
            if (type === "net:rx") {
                updateMaxNETUpPercentageForPeriod(data);
            }
        }

        function updateMaxCPUPercentageForPeriod(data) {
            self.dataPeriod.cpu.max = _.max(data.values, function (v) {
                return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
            }).value;
            self.dataPeriod.cpu.needUpgrade = self.dataPeriod.cpu.max >= CLOUD_MONITORING.vm.upgradeAlertThreshold;
            self.accordions.cpu = self.accordions.cpu || self.dataPeriod.cpu.needUpgrade;
        }

        function updateMaxRAMPercentageForPeriod(data) {
            var total = _.last(self.vm.monitoringData.raw["mem:max"].values).value;
            var maxUsed = _.max(data.values, function (v) {
                return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
            }).value;
            self.dataPeriod.mem.max = maxUsed / total * 100;
            self.dataPeriod.mem.needUpgrade = self.dataPeriod.mem.max >= CLOUD_MONITORING.vm.upgradeAlertThreshold;
            self.accordions.mem = self.accordions.mem || self.dataPeriod.mem.needUpgrade;
        }

        function updateMaxNETUpPercentageForPeriod(data) {
            var total = self.vm.flavor.inboundBandwidth * CLOUD_UNIT_CONVERSION.MEGABYTE_TO_BYTE;
            var maxUsed = _.max(data.values, function (v) {
                return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
            }).value;
            self.dataPeriod.net.up.max =  maxUsed / total * 100;
            self.dataPeriod.net.up.needUpgrade = self.dataPeriod.net.up.max >= CLOUD_MONITORING.vm.upgradeAlertThreshold;
            self.accordions.net = self.accordions.net || self.dataPeriod.net.up.needUpgrade;
        }

        function updateMaxNETDownPercentageForPeriod(data) {
            var total = self.vm.flavor.outboundBandwidth * CLOUD_UNIT_CONVERSION.MEGABYTE_TO_BYTE;
            var maxUsed = _.max(data.values, function (v) {
                return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
            }).value;
            self.dataPeriod.net.down.max =  maxUsed / total * 100;
            self.dataPeriod.net.down.needUpgrade = self.dataPeriod.net.down.max >= CLOUD_MONITORING.vm.upgradeAlertThreshold;
            self.accordions.net = self.accordions.net || self.dataPeriod.net.down.needUpgrade;
        }

        function updateChartsWithMonitoringData (data) {
            if (data["cpu:used"]) {
                updateChart("cpu:used", self.selectedChartPeriod["cpu:used"], data["cpu:used"]);
            }
            if (data["mem:used"]) {
                updateChart("mem:used", self.selectedChartPeriod["mem:used"], data["mem:used"]);
            }
            if (data["net:tx"]) {
                updateChart("net:tx", self.selectedChartPeriod["net:tx"], data["net:tx"]);
            }
            if (data["net:rx"]) {
                updateChart("net:rx", self.selectedChartPeriod["net:rx"], data["net:rx"]);
            }
        }

        $timeout(function () {
            init();
        });
    });
