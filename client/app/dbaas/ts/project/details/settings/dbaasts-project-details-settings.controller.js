"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsSettingsCtrl",
function ($q, $scope, $state, $stateParams, $rootScope, $translate, $uibModal, Toast, OvhApiDBaasTsProject, OvhApiDBaasTsRegion, Poller, SidebarMenu) {

    //---------VARIABLE DECLARATION---------

    var self = this;
    var serviceName = $stateParams.serviceName;

    self.loaders = {
        init: false
    };

    //---------Edit project---------

    self.editProject = function () {
        var project = self.model;

        var config = {
            //serviceName: project.serviceName, // this is the id
            displayName: project.displayName
        };

        if (self.initialConfig) {
            // Initial configuration
            if (self.importRunabove) {
                config.importRa = true;
                config.raTokenId = project.raTokenId;
                config.raTokenKey = project.raTokenKey;
            } else {
                config.regionId = self.region.id;
            }
        }

        OvhApiDBaasTsProject.v6().setup({
            serviceName: serviceName
        }, config).$promise.then(function () {
            // Refresh sidebar
            var menuItem = SidebarMenu.getItemById(self.model.serviceName);
            if (menuItem) {
                menuItem.title = self.model.displayName;
            }
            Toast.info($translate.instant("dtpds_project_edit_successful"));

            // Reload project
            OvhApiDBaasTsProject.v6().resetCache();
            return loadProject();
        })["catch"](function (err) {
            Toast.error([$translate.instant("dtpds_project_edit_error"), err.data && err.data.message || ""].join(" "));
        })["finally"](function () {
            self.loader.init = false;
        });
    };

    //---------INITIALIZATION---------

    function loadProject () {
        return OvhApiDBaasTsProject.v6().get({
            serviceName: serviceName
        }).$promise.then(function (project) {
            self.model = project;

            self.initialConfig = (!project.regionId || project.regionId.length === 0);
            self.importRunabove = false;
            self.payAsYouGo = (project.offerId === "payg_account");

            self.titleKey = "dtpds_title";

            switch (project.status) {
                case "UNCONFIGURED":
                    self.titleKey = "dtpds_title_unconfigured";
                    break;
                case "DELETED":
                    // Should not happen, deleted projects aren't displayed
                    break;
                case "ACTIVE":
                    // No specific help for active projects
                    break;
                case "CREATION":
                    self.titleKey = "dtpds_title_creation";
                    // Transient state that shouldn't last more than 1 minute. Do automatic reloading
                    OvhApiDBaasTsProject.v6().resetCache();
                    pollUntilActive(serviceName);
                    break;
            }

            return project;
        });
    }

    function pollUntilActive (serviceName) {
        Poller.poll("/dbaas/timeseries/" + serviceName,
            null,
            {
                successRule: function (project) {
                    OvhApiDBaasTsProject.v6().resetCache();
                    return project.status === "ACTIVE";
                },
                namespace: "dbaas.ts.project.creation"
            }).then(function () {
                // Project ready, go to the main state
                Toast.info($translate.instant("dtpds_project_created"));
                $state.go("dbaas.dbaasts-project.dbaasts-project-details.dbaasts-project-details-key");
            }
        );

        $scope.$on("$destroy", function () {
            Poller.kill({ namespace: "dbaas.ts.project.creation" });
        });
    }

    function init () {
        self.loaders.init = true;

        // Listen to project events raised by the sidebar when a project is renamed
        $scope.$on("dbaasts-reloadproject", function (_, serviceName) {
            if (serviceName === $stateParams.serviceName) {
                loadProject();
            }
        });

        var futureRegions = OvhApiDBaasTsRegion.v6().query().$promise;
        var futureProject = loadProject();

        return $q.all([futureRegions, futureProject]).then(function (values) {
            self.regions = values[0];

            self.loaders.init = false;

            // Init selected region
            if (self.model.regionId) {
                self.regions.forEach(function (r) {
                    if (r.id === self.model.regionId) {
                        self.region = r;
                    }
                });
            }
        }, function (err) {
            Toast.error([$translate.instant("dtpds_init_loading_error"), err.data && err.data.message || ""].join(" "));
        })["finally"](function () {
            self.loaders.init = false;
        });
    }

    init();
});
