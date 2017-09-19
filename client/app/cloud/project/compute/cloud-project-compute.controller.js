"use strict";

angular.module("managerApp").controller("CloudProjectComputeCtrl",
    function ($q, $state, $stateParams, OvhApiCloudProject, $scope, CloudProjectOrchestrator, CloudUserPref) {

        var self = this;
        this.serviceName = $stateParams.projectId;

        this.loading = true;

        function init() {
            self.loading = true;
            return shouldRedirectToProjectOverview()
                .then(function(redirectToOverview) {
                    $scope.redirectToOverview = redirectToOverview;
                })
                ["finally"](function() {
                    self.loading = false;
                });
        }

        function shouldRedirectToProjectOverview() {
            if ($stateParams.forceLargeProjectDisplay) {
                return $q.when(false);
            }

            var hasTooMany = $q.all({
                hasTooManyInstances: CloudProjectOrchestrator.hasTooManyInstances($stateParams.projectId),
                hasTooManyIps: CloudProjectOrchestrator.hasTooManyIps($stateParams.projectId)
            }).then(function(result) {
                return result.hasTooManyInstances || result.hasTooManyIps;
            });

            return CloudUserPref.get("cloud_project_" + self.serviceName + "_overview").then(function (params) {
                if (params && params.hide) {
                    return false;
                }
                return hasTooMany;
            });
        }

        init();
    }
);


