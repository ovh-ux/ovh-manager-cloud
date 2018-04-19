"use strict";

angular.module("managerApp").factory("CloudProjectComputeInfraVrackVlanFactory",
    function ($q, $timeout, ovhUserPref, Poller, OvhApiOrderVrack, OvhApiMeOrder, OvhApiVrack, OvhApiCloudProject) {

        var VlanFactory = (function () {

            return function CloudProjectComputeInfraVrackVlanFactory (options) {
                this.serviceName = options.serviceName || null;
            };

        })();

        ///////////////////////
        //      METHODS      //
        ///////////////////////

        VlanFactory.prototype.hasVrack = function () {

            return OvhApiCloudProject.v6().vrack({ serviceName: this.serviceName }).$promise
                .then(function () {
                    return true;
                }, function (err) {
                    if (err && err.status === 404) {
                        return false;
                    } else {
                        return $q.reject(err);
                    }
                });
        };

        return VlanFactory;
    }
);
