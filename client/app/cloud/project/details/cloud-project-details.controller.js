"use strict";

angular.module("managerApp").controller("CloudProjectDetailsCtrl",
    function ($stateParams, $q, $state, $rootScope, $scope, $timeout, OvhApiCloudProject, Poller, OvhApiMeOrder, CloudMessage, $translate) {

        var _self = this;

        this.projectId = $stateParams.projectId;
        this.project = null;
        this.order = null;

        _self.loaders = {
            cancelCreation: false,
            init: true
        };

        _self.projectDeleteErrorsStatus = {
            expired: 460,
            ok: 401
        };

        /**
         * Poll project creating/deleting
         */
        function pollProject () {
            Poller.poll("/cloud/project/" + _self.projectId,
                null,
                {
                    successRule: function (project) {
                        return project.status !== "creating" && project.status !== "deleting";
                    },
                    namespace: "iaas.pci-project.details"
                }
            ).then(function (project) {
                return handleProjectDetails(project);
            }, function (err) {
                if (err && err.status) {
                    // Error: goTo project creation
                    return $state.go("iaas.pci-project-new");
                }
            });
        }
        // And kill this polling on exit
        $scope.$on("$destroy", function () {
            Poller.kill({ namespace: "iaas.pci-project.details" });
        });

        /**
         * What to do with the API"s return
         */
        function handleProjectDetails (project) {
            _self.project = project;
            switch (project.status) {
            case "ok":
                // If it"s at initialization: go direct to the project,
                // else, it"s during the polling!
                if (!$stateParams.fromProjectAdd) {
                    return $state.go("iaas.pci-project.compute", {
                        projectId: _self.projectId
                    });
                } else {
                    _self.loaders.init = false;
                    return $timeout(function () {
                        return $state.go("iaas.pci-project.compute", {
                            projectId: _self.projectId,
                            createNewVm: $stateParams.createNewVm
                        });
                    }, 3000);
                }
                break;
            case "suspended":
                return;
            case "creating":
                if (project.orderId) {
                    OvhApiMeOrder.Lexi().get({
                        orderId: project.orderId
                    }).$promise.then(function (result) {
                        _self.order = result;
                    });
                }
                return;
            case "deleting":
                pollProject();
            }
        }

        this.cancelProjectCreation = function () {
            _self.loaders.cancelCreation = true;

            return OvhApiCloudProject.Lexi().cancelCreation({
                serviceName: _self.projectId
            }, null).$promise.then(function (result) {
                CloudMessage.success($translate.instant("cpd_project_cancel_success"));
                $rootScope.$broadcast("sidebar_refresh_cloud");
                $state.go("home");
                init();
                return result;
            }, function (err) {
                switch (err) {
                    case _self.projectDeleteErrorsStatus.expired:
                        CloudMessage.error($translate.instant("cpd_project_cancel_error_expired_status"));
                        $rootScope.$broadcast("sidebar_refresh_cloud");
                        init();
                        break;
                    case _self.projectDeleteErrorsStatus.ok:
                        CloudMessage.error($translate.instant("cpd_project_cancel_error_ok_status"));
                        $rootScope.$broadcast("sidebar_refresh_cloud");
                        init();
                        break;
                    default:
                        CloudMessage.error($translate.instant("cpd_project_cancel_error"));
                }
                $q.reject(err);
            })["finally"](function () {
                _self.loaders.cancelCreation = false;
            });
        };

        /**
         * INIT: Get project details
         */
        function init () {
            _self.loaders.init = true;
            return OvhApiCloudProject.Lexi().get({
                serviceName: _self.projectId
            }).$promise.then(function (project) {
                return handleProjectDetails(project);
            }, function () {
                // Error: goTo project creation
                return $state.go("iaas.pci-project-new");
            })["finally"](function () {
                _self.loaders.init = false;
            });
        }

        init();
    }
);
