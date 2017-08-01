"use strict";

angular.module("managerApp").controller("CloudProjectBillingConsumptionCtrl",
    function ($state) {
        var self = this;

        function init () {
            self.currentDate = moment();

            $state.go("iaas.pci-project.billing.consumption.current");
        }

        self.getBillingDateInfo = function () {
            return {
                date: self.currentDate.format("LL")
            };
        };

        init();
    }
);
