"use strict";

angular.module("managerApp").controller("CloudProjectBillingConsumptionCurrentCtrl",
    function ($q, $translate, $stateParams, CloudMessage, CloudProjectBillingService, OvhApiCloudProjectUsageCurrent) {
        var self = this;
        self.data = {};

        function init () {
            self.loading = true;

            return OvhApiCloudProjectUsageCurrent.Lexi().get({ serviceName: $stateParams.projectId }).$promise
                .then(function (billingInfo) {
                    return CloudProjectBillingService.getConsumptionDetails(billingInfo, billingInfo);
                })
                .then(function (data) {
                    self.data =  data;
                })
                .catch(function (err) {
                    CloudMessage.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                    return $q.reject(err);
                })
                .finally(function () {
                    self.loading = false;
                });
        }

        init();
    }
);
