"use strict";

angular.module("managerApp").controller("CloudProjectBillingHistoryDetailsCtrl",
    function ($state, $q, $translate, $stateParams, Toast, CloudProjectBillingService, OvhApiCloudProjectUsageHistory, OvhApiCloudProjectUsageCurrent, OvhApiCloudProject, User, REDIRECT_URLS) {
        var self = this;
        self.year = null;
        self.month = null;
        self.data = {};
        self.monthBilling = null;
        self.billingUrl = REDIRECT_URLS.billing;

        self.getHourlyBillingDateInfo = function () {
            var prev = moment(self.monthBilling).subtract(1, "month");
            return {
                month: prev.format("MMMM"),
                year: prev.year()
            };
        };

        self.getBillingDateInfo = function () {
            return {
                month: self.monthBilling.format("MMMM"),
                year: self.monthBilling.year()
            };
        };

        function init () {
            self.loading = true;

            self.year = $stateParams.year;
            self.month = $stateParams.month;

            self.monthBilling = moment.utc({ y: $stateParams.year, M: $stateParams.month - 1, d: 1 });
            self.previousMonth = moment.utc(self.monthBilling).subtract(1, "month");

            if (!self.monthBilling.isValid() || self.monthBilling.isAfter(moment.utc().startOf("month")) || self.monthBilling.year() < 1990) {
                return $state.go("iaas.pci-project.billing.history.details", {
                    year: moment.utc().year(),
                    month: moment.utc().month() + 1, // because moment indexes month from 0 to 11
                });
            }

            initConsumptionHistory()
                .catch(function (err) {
                    Toast.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                    return $q.reject(err);
                })
                .finally(function () {
                    self.loading = false;
                });
        }

        function initConsumptionHistory () {
            return OvhApiCloudProjectUsageHistory.Lexi().query({
                serviceName: $stateParams.projectId,
                from: self.previousMonth.format(),
                to: self.monthBilling.format()
            }).$promise
                .then(function (historyPeriods) {
                    return getConsumptionDetails(historyPeriods);
                })
                .then(function (details) {
                    self.data = details;
                });
        }

        function getConsumptionDetails (periods) {
            var detailPromises = _.map(periods, function (period) {
                return OvhApiCloudProjectUsageHistory.Lexi().get({
                    serviceName: $stateParams.projectId,
                    usageId: period.id
                }).$promise;
            });

            return $q.all(detailPromises)
                .then(function (periodDetails) {
                    var monthlyDetails;
                    var hourlyDetails;

                    if (moment.utc().isSame(self.monthBilling, "month")) {
                        monthlyDetails = OvhApiCloudProjectUsageCurrent.Lexi().get({ serviceName: $stateParams.projectId }).$promise;
                    } else {
                        monthlyDetails = _.find(periodDetails, function (detail) {
                            return moment.utc(detail.period.from).isSame(self.monthBilling, "month");
                        });
                    }

                    hourlyDetails = _.find(periodDetails, function (detail) {
                        return moment.utc(detail.period.from).isSame(self.previousMonth, "month");
                    });

                    return {
                        hourly: hourlyDetails,
                        monthly: monthlyDetails
                    };
                })
                .then(function (details) {
                    return $q.all(details)
                        .then(function (details) {
                            return CloudProjectBillingService.getConsumptionDetails(details.hourly, details.monthly);
                        });
                });
        }
        init();
    }
);
