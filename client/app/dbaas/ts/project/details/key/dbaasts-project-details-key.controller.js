"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsKeyCtrl",
function ($q, $state, $stateParams, $translate, $uibModal, $scope, Toast, User, OvhApiDBaasTsProject, DBaasTsProjectKey, OvhApiDBaasTsRegion, DBaasTsConstants) {

    // -- Vairables declaration --
    var self = this;

    var serviceName = $stateParams.serviceName;

    self.loaders = {};
    self.errors = {};

    self.data = {};

    // -- Edit key --

    self.edit = function (key) {
        return $state.go("^.dbaasts-project-details-key-edit", { keyId: key.id });
    };

    // -- Delete key --

    self.delete = function (key) {
        $uibModal.open({
            templateUrl: "app/dbaas/ts/project/details/key/delete/modal.html",
            controllerAs: "ctrl",
            controller: function ($uibModalInstance) {
                var modalSelf = this;
                modalSelf.loaders = { deleting: false };

                modalSelf.confirm = function () {
                    modalSelf.loaders.deleting = true;

                    DBaasTsProjectKey.Lexi().remove({
                        serviceName: serviceName,
                        keyId: key.id
                    }).$promise.then(function () {
                        // Remove deleted key
                        self.data.keys = _.reject(self.data.keys, { id: key.id });

                        // and clode modal
                        $uibModalInstance.close();
                        Toast.info($translate.instant("dtpdt_key_deletion_successful"));

                    })["catch"](function (err) {
                        Toast.error([$translate.instant("dtpdt_key_deletion_error"), err.data && err.data.message || ""].join(" "));
                    })["finally"](function () {
                        modalSelf.loaders.deleting = false;
                    });
                };
            }
        });
    };

    // -- Example of using a key --

    self.showExample = function (key) {
        $uibModal.open({
            templateUrl: "app/dbaas/ts/project/details/key/example/modal.html",
            controller: "DBaasTsProjectDetailsKeyCtrl.exampleUseToken",
            controllerAs: "ctrl",
            resolve: {
                params: function () {
                    return {
                        key: key,
                        apiURL: self.region.url
                    };
                }
            }
        });
    };

    self.showRegionInfo = function () {
        $uibModal.open({
            templateUrl: "app/dbaas/ts/project/details/key/region-help/modal.html",
            controllerAs: "ctrl",
            controller: function Ctrl () {
                this.region = self.region;
                this.guideURL = self.data.guideDBaasTsConceptsURL;
            }
        });
    };

    self.refresh = function () {
        DBaasTsProjectKey.Lexi().resetQueryCache();
        self.init();
    };

    this.resetCache = function () {
        self.loaders.init = true;
        window.location.reload();
    };

    //---------INITIALIZATION---------

    self.init = function () {
        self.loaders.init = true;

        var futureProject = OvhApiDBaasTsProject.Lexi().get({
            serviceName: serviceName
        }).$promise;

        // Load regions to display the project's region name and URL
        var futureRegions = OvhApiDBaasTsRegion.Lexi().query().$promise;

        // Load keys
        var futureKeys = DBaasTsProjectKey.Lexi().queryDetails(serviceName);

        futureProject.then(function (project) {

            futureKeys.then(function (keys) {
                self.data.keys = keys;
            });

            futureRegions.then(function (regions) {
                // Find the region for the project
                self.region = _.find(regions, { id: project.regionId });
            });

            return $q.all(futureRegions, futureKeys);

        })["catch"](function (err) {
            Toast.error([$translate.instant("dtpdt_key_loading_error"), err.data && err.data.message || ""].join(" "));
            self.data.keys = null;
            self.errors.init = true;
        })["finally"](function () {
            self.loaders.init = false;
        });
    };

    function initGuideURL () {
        self.loaders.guide = true;
        User.Lexi().get().$promise.then(function (me) {
            var lang = me.ovhSubsidiary;
            self.data.guideDBaasTsConceptsURL = DBaasTsConstants.guides.concepts[lang] || DBaasTsConstants.guides.concepts.FR;
        })["finally"](function () {
            self.loaders.guide = false;
        });
    }

    self.init();
    initGuideURL();

});