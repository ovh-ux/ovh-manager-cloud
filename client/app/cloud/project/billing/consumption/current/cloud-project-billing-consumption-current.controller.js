"use strict";

angular.module("managerApp").controller("CloudProjectBillingConsumptionCurrentCtrl",
    function ($q, $translate, $stateParams, Toast, CloudProjectBillingService, CloudProjectUsageCurrent) {
        var self = this;
        self.data = {};

        function init () {
            self.loading = true;

            return CloudProjectUsageCurrent.Lexi().get({ serviceName: $stateParams.projectId }).$promise
                .then(function (billingInfo) {
                    return CloudProjectBillingService.getConsumptionDetails(billingInfo, billingInfo);
                })
                .then(function (data) {
                    self.data =  data;
                })
                .catch(function (err) {
                    Toast.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                    return $q.reject(err);
                })
                .finally(function () {
                    self.loading = false;
                });
        }

        init();
    }
);
