"use strict";

angular.module("managerApp").controller("CloudProjectBillingConsumptionEstimateCtrl",
    function ($q, $uibModal, $stateParams, $translate, OvhApiCloudProjectAlerting, CloudMessage, OvhApiCloudProjectUsageForecast, OvhApiCloudProjectUsageCurrent, CloudProjectBillingService) {
        var self = this;
        self.loading = false;
        self.data = {
            currencySymbol: null,
            alert: null,
            estimateTotals: null,
            currentTotals: null
        };

        self.loaders = {
            alert: false,
            forecast: false,
            current: false,
            deleteAlert: false,
        };

        self.getCurrentMonth = function () {
            return moment();
        };

        self.getNextMonth = function () {
            return moment().add(1, "month");
        };

        function init () {
            initForecast().then(function () {
                return initCurrent();
            }).then(function () {
                return initAlert();
            }).catch(function (err) {
                CloudMessage.error([$translate.instant("cpbe_estimate_price_error_message"), err.data && err.data.message || ""].join(" "));
            });
        }

        function initForecast () {
            self.loaders.forecast = true;
            return OvhApiCloudProjectUsageForecast.Lexi().get({
                serviceName: $stateParams.projectId
            }).$promise.then(function (billingInfo) {
                return CloudProjectBillingService.getConsumptionDetails(billingInfo, billingInfo).then(function (data) {
                    self.data.estimateTotals =  data.totals;
                    self.data.currencySymbol = self.data.estimateTotals.currencySymbol;
                }).finally(function () {
                    self.loaders.forecast = false;
                });
            });
        }

        function initCurrent () {
            self.loaders.current = true;
            return OvhApiCloudProjectUsageCurrent.Lexi().get({
                serviceName: $stateParams.projectId
            }).$promise.then(function (billingInfo) {
                return CloudProjectBillingService.getConsumptionDetails(billingInfo, billingInfo);
            }).then(function (data) {
                self.data.currentTotals =  data.totals;
            }).finally(function () {
                self.loaders.current = false;
            });
        }

        function getAlertIds () {
            OvhApiCloudProjectAlerting.Lexi().resetCache();
            return OvhApiCloudProjectAlerting.Lexi().getIds({
                serviceName: $stateParams.projectId
            }).$promise;
        }

        function getAlert (id) {
            return OvhApiCloudProjectAlerting.Lexi().get({
                serviceName: $stateParams.projectId,
                alertId: id }).$promise
                .catch(function () {
                    // We dont rethrow or show a message to hide an API glitch.
                    self.data.alert = null;
                    return null;
                });
        }

        function initAlert () {
            self.loaders.alert = true;
            // list alerts ids
            return getAlertIds()
                .then(function (alertIds) {
                    if (_.isEmpty(alertIds)) {
                        return null;
                    } else {
                        return getAlert(_.first(alertIds));
                    }
                })
                .then(function (alertObject) {
                    self.data.alert = alertObject;
                    if (!_.isNull(alertObject)) {
                        initConsumptionChart();
                    }
                }).finally(function () {
                    self.loaders.alert = false;
                });
        }

        function initConsumptionChart () {
            var labelNow = $translate.instant("cpbe_estimate_alert_chart_label_now");
            var labelFuture = $translate.instant("cpbe_estimate_alert_chart_label_future");
            var labelLimit = $translate.instant("cpbe_estimate_alert_chart_label_limit");

            self.consumptionChartData = {
                estimate: {
                    now: { value: self.data.currentTotals.hourly.total, currencyCode: self.data.estimateTotals.currencySymbol, label: labelNow },
                    endOfMonth: { value: self.data.estimateTotals.hourly.total, currencyCode: self.data.estimateTotals.currencySymbol, label: labelFuture }
                },
                threshold: {
                    now: { value: self.data.alert.monthlyThreshold, currencyCode: self.data.estimateTotals.currencySymbol, label: labelLimit },
                    endOfMonth: { value: self.data.alert.monthlyThreshold, currencyCode: self.data.estimateTotals.currencySymbol, label: labelLimit }
                }
            };
        }

        self.openAlertAddModal = function () {
            var modal = $uibModal.open({
                templateUrl: "app/cloud/project/billing/consumption/estimate/alert/add/cloud-project-billing-consumption-estimate-alert-add.html",
                controller: "CloudProjectBillingConsumptionEstimateAlertAddCtrl",
                controllerAs: "CloudProjectBillingConsumptionEstimateAlertAddCtrl",
                resolve: {
                    dataContext: function () {
                        return self.data;
                    }
                }
            });

            modal.result.then(function () {
                initAlert();
            });
        };

        self.deleteAlert = function () {
            self.loaders.deleteAlert = true;
            // we query alerts to check if an alert already exists, in this case we delete it
            OvhApiCloudProjectAlerting.Lexi().getIds({
                serviceName: $stateParams.projectId
            }).$promise.then(function (alertIds) {
                if (!_.isEmpty(alertIds)) {
                    return OvhApiCloudProjectAlerting.Lexi()["delete"]({
                        serviceName: $stateParams.projectId,
                        alertId: _.first(alertIds)
                    }).$promise.then(function () {
                        CloudMessage.success($translate.instant("cpbe_estimate_alert_delete_success"));
                    });
                } else {
                    return $q.reject({ data: { message: "Alert not found" } });
                }
            }).catch(function (err) {
                CloudMessage.error([$translate.instant("cpbe_estimate_alert_delete_error"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.deleteAlert  = false;
            });

            initAlert();
        };

        init();
    }
);
