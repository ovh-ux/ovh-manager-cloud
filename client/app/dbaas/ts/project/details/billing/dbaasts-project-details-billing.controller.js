"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsBillingCtrl",
function ($q, $scope, $state, $stateParams, $translate, Toast, OvhApiDBaasTsProjectBilling) {

    // -- Variables declaration --

    var self = this;
    var serviceName = $stateParams.serviceName;
    var firstDayOfMonth = moment({ y: moment().year(), M: moment().month(), d: 1 });

    self.loaders = {
        init: false
    };

    self.data = {
        billing: {},
        monthBilling: angular.copy(firstDayOfMonth)
    };

    // -- Initialization --

    function init () {
        self.loaders.init = true;

        OvhApiDBaasTsProjectBilling.Lexi().get({
            serviceName: serviceName,
            from: getMonthYear()
        }).$promise.then(function (billing) {
            self.data.billing = billing;
        })["catch"](function (err) {
            Toast.error([$translate.instant("dtpdb_loading_error"), err.data && err.data.message || ""].join(" "));
            self.data.billing = null;
        })["finally"](function () {
            self.loaders.init = false;
        });
    }

    function getMonthYear () {
        return self.data.monthBilling.year() + "-" + self.data.monthBilling.format("MM");
    }

    // --

    self.refresh = function () {
        OvhApiDBaasTsProjectBilling.Lexi().resetCache();
        init();
    };

    self.getDateInfo = function () {
        return {
            month: self.data.monthBilling.format("MMM"),
            year: self.data.monthBilling.year()
        };
    };

    self.previousMonth = function () {
        self.data.monthBilling = self.data.monthBilling.subtract(1, "month");
        init();
    };

    self.nextMonth = function () {
        self.data.monthBilling = self.data.monthBilling.add(1, "month");
    };

    self.getLimit = function () {
        return self.data.monthBilling.diff(angular.copy(firstDayOfMonth).set("date", 1));
    };

    // --

    init();

});
