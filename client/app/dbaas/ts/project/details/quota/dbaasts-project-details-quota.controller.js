"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsQuotaCtrl",
function ($q, $uibModal, $state, $scope, $stateParams, $translate, Toast, DBaasTsProjectQuota, DBaasTsProject) {

    // -- Variables declaration --

    var self = this;
    var serviceName = $stateParams.serviceName;

    self.loaders = {
        init: false
    };

    self.data = {
        quotas: {}
    };

    // -- Initialization --

    function init () {
        self.loaders.init = true;

        DBaasTsProject.Lexi().get({
            serviceName: serviceName
        }).$promise.then(function (project) {

            self.project = project;

            return DBaasTsProjectQuota.Lexi().query({
                serviceName: serviceName
            }).$promise.then(function (quotas) {
                self.data.quotas = quotas;
            });
        })["catch"](function (err) {
            Toast.error([$translate.instant("dtpdq_quota_loading_error"), err.data && err.data.message || ""].join(" "));
            self.data.quota = null;
        })["finally"](function () {
            self.loaders.init = false;
        });
    }

    init();

    // --

    self.refresh = function () {
        DBaasTsProjectQuota.Lexi().resetQueryCache();
        init();
    };

    self.openIncreaseQuotaPopup = function () {
        $uibModal.open({
            templateUrl: "app/dbaas/ts/project/details/quota/dbaasts-project-details-quota-enlarge.html",
            controller: function ($scope) {
                // Passed as a variable, since it will later depend from an API call result
                var message = "dtpdq_increase_support";
                $scope.message = $translate.instant(message);
            }
        });
    };

});
