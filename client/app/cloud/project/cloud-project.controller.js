"use strict";

angular.module("managerApp")
  .controller("CloudProjectCtrl", function ($scope, $state, $stateParams, $rootScope, OvhApiCloud, CloudProjectRightService) {
    var self = this;
    var serviceName = $stateParams.projectId;

    self.loaders = {
        project: false
    };

    self.model = {
        project: null,
        hasWriteRight: true
    };

    self.includes = function (stateName) {
        return $state.includes(stateName);
    };

    // reference to our rootScope state change listener
    var _stateChangeListener = null;

    function init () {

        self.loaders.project = true;

        // get current project
        if (serviceName) {
            OvhApiCloud.Project().Lexi().get({
                serviceName: serviceName
            }).$promise
                .then(function (project) {
                    self.model.project = project;
                    // if project is suspended, redirect to error page
                    if (self.model.project.status === "suspended" || self.model.project.status === "creating") {
                        $state.go("iaas.pci-project.details");
                    } else {
                        CloudProjectRightService.userHaveReadWriteRights(serviceName)
                            .then(function (hasWriteRight) {
                                self.model.hasWriteRight = hasWriteRight;
                            });
                    }
                })
                ["finally"](function () {
                    self.loaders.project = false;
                });
        } else {
            $state.go("iaas.pci-project-new");
            return;
        }

        // before a state change, check if the destination project is suspended,
        // if it's the case just redirect to the error page
        _stateChangeListener = $rootScope.$on("$stateChangeStart", function (ev, toState, toParams) {
            // avoid infinite state redirection loop
            if (toState && toState.name === "iaas.pci-project.details") {
                return;
            }
            // check if project is loaded
            if (!self.model.project) {
                return;
            }
            // redirection is only for suspended projects
            if (self.model.project.status !== "suspended" && self.model.project.status !== "creating") {
                return;
            }
            if (self.model.project.project_id === toParams.projectId) {
                ev.preventDefault();
                $state.go("iaas.pci-project.details");
            }
        });
    }

    // when controller is destroyed we must remove global state change listener
    $scope.$on("$destroy", function () {
        if (_stateChangeListener) {
            _stateChangeListener();
        }
    });

    init();
});
