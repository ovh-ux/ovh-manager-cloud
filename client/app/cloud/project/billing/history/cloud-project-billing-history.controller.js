"use strict";

angular.module("managerApp").controller("CloudProjectBillingHistoryCtrl",
    function ($state, validParams) {
        var self = this;
        self.data = {};
        self.firstDayCurrentMonth = null;

        self.previousMonth = function () {
            let lastMonth = self.data.monthBilling.subtract(1, "month");
            $state.go("iaas.pci-project.billing.history", {
                year: lastMonth.year(),
                month: lastMonth.month() + 1 // because moment indexes month from 0 to 11
            });
        };

        self.nextMonth = function () {
            let nextMonth = self.data.monthBilling.add(1, "month");
            $state.go("iaas.pci-project.billing.history", {
                year: nextMonth.year(),
                month: nextMonth.month() + 1 // because moment indexes month from 0 to 11
            });
        };

        self.isLimitReached = function () {
            return self.data.monthBilling.isSameOrAfter(self.firstDayCurrentMonth, "day");
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
                y: validParams.year,
                M: validParams.month - 1, // because moment indexes month from 0 to 11
                d: 1
            });
        }

        init();
    }
);
