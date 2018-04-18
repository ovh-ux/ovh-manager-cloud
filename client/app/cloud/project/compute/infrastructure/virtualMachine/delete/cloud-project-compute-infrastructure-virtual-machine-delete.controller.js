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

            /*
             * IP Failover are not automatically deleted so we comment the check below.
             */
            // check if the instance is routed to failover IPs
            /*self.loaders.ips = true;
            OvhApiCloudProjectIpFailover.v6().query({
                serviceName : serviceName
            }).$promise.then(function (ips) {
                if (vmToDelete && vmToDelete.routedTo) {
                    angular.forEach(vmToDelete.routedTo, function (route) {
                        var ipfo = _.find(ips, { id : route });
                        if (ipfo) {
                            self.routedIpsFo.push(ipfo);
                        }
                    });
                }
            })["finally"](function () {
                self.loaders.ips = false;
            });*/
        }


        init();
  });
