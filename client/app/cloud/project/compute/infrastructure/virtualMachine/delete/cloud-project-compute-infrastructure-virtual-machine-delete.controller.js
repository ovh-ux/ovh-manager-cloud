"use strict";

angular.module("managerApp")
    .controller("CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl", function ($uibModalInstance, params) {
        const self = this;
        self.vm = params.vm;

        self.loaders = {
            ips: false
        };

        self.routedIpsFo = [];

        self.isMonthlyBilling = false;

        self.backup = function () {
            $uibModalInstance.close();
        };

        self.cancel = function () {
            $uibModalInstance.dismiss();
        };

        function init () {
            self.isMonthlyBilling = _(self.vm).get("monthlyBilling.status") === "ok";
        }


        init();
    });
