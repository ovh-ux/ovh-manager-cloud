"use strict";

angular.module("managerApp").controller("CloudProjectComputeCtrl",
    function ($q, $state, $stateParams, OvhApiCloudProject, $scope, CloudMessage, CloudProjectOrchestrator, CloudUserPref) {

        var self = this;
        this.serviceName = $stateParams.projectId;

        this.loading = true;
        this.messages = [];

        self.getRouteContext = function () {
            if ($state.includes("iaas.pci-project")) {
                return "iaas.pci-project.compute";
            }
            return '';
        };

        self.refreshMessage = function () {
            self.messages = self.messageHandler.getMessages();
        }

        self.loadMessage = function () {
            CloudMessage.unSubscribe("iaas.pci-project.compute");
            this.messageHandler = CloudMessage.subscribe("iaas.pci-project.compute", { onMessage: () => self.refreshMessage() });
        }
        
        function init() {
            self.loading = true;
            self.loadMessage();
            return shouldRedirectToProjectOverview()
                .then(function(redirectToOverview) {
                    $scope.redirectToOverview = redirectToOverview;
                })
                .finally(function() {
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


