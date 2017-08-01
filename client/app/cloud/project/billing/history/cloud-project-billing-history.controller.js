"use strict";

angular.module("managerApp").controller("CloudProjectBillingHistoryCtrl",
    function ($state, $stateParams) {
        var self = this;
        self.data = {};
        self.firstDayCurrentMonth = null;

        self.previousMonth = function () {
            self.data.monthBilling = self.data.monthBilling.subtract(1, "month");
            $state.go("iaas.pci-project.billing.history.details", {
                year: self.data.monthBilling.year(),
                month: self.data.monthBilling.month() + 1 // because moment indexes month from 0 to 11
            });
        };

        self.nextMonth = function () {
            self.data.monthBilling = self.data.monthBilling.add(1, "month");
            $state.go("iaas.pci-project.billing.history.details", {
                year: self.data.monthBilling.year(),
                month: self.data.monthBilling.month() + 1 // because moment indexes month from 0 to 11
            });
        };

        self.isLimitReached = function () {
            return !self.data.monthBilling.isBefore(self.firstDayCurrentMonth, "day");
        };

        self.getBillingDateInfo = function () {
            if (self.data.monthBilling.isValid()) {
                return {
                    month: self.data.monthBilling.format("MMMM"),
                    year: self.data.monthBilling.year()
                };
            } else {
                return null;
            }
        };

        function init () {
            self.firstDayCurrentMonth = moment().startOf("month");

            self.data.monthBilling = moment({
                y: $stateParams.year,
                M: $stateParams.month - 1,
                d: 1
            });
        }

        init();
    }
);
