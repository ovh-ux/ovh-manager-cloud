"use strict";

angular.module("managerApp")
  .controller("CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl", function ($uibModalInstance, $stateParams, params, OvhApiCloudProjectIpFailover) {
        var self = this,
            serviceName = $stateParams.projectId;

        var vmToDelete = params;

        self.loaders = {
            ips : false
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
            self.isMonthlyBilling = vmToDelete.monthlyBilling && vmToDelete.monthlyBilling.status === "ok";

        }


        init();
  });
