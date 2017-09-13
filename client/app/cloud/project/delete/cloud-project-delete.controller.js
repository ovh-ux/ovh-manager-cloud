

angular.module("managerApp").controller("CloudProjectDeleteCtrl",
    function ($scope, $uibModalInstance, $translate, Toast, $stateParams, $q, OvhApiCloudProjectInstance, OvhApiCloudProjectVolume,
              OvhApiCloudProjectSnapshot, $state, OvhApiCloudProjectStorage, OvhApiCloudProjectIpFailover, OvhApiCloudProjectIpLexi, OvhApiCloudProject,
              OvhApiCloudProjectUsageCurrent, OvhApiCloudProjectCredit, CloudProjectBillingService) {
        "use strict";

        var self = this;
        var projectId = $stateParams.projectId;
        var now = moment();

        self.resources = {
            instance: 0,
            volume: 0,
            snapshot: 0,
            storage: 0,
            ipFailoverOvh: 0,
            ipFailoverCloud: 0
        };

        self.bill = undefined;
        self.hasCredits = false;

        self.error = false;

        self.loaders = {
            init: false,
            deleting: false
        };

        this.init = function () {
            self.loaders.init = true;

            $q.all([
                getConsumption(),
                getCredits(),
                initRemainingResources()
            ]).then(function () {
                self.error = false;
            }, function () {
                self.error = true;
            })["finally"](function () {
                self.loaders.init = false;
            });
        };

        //---------MODAL---------

        self.confirm = function () {
            return deleteProject().then(function () {
                Toast.success($translate.instant("cloud_project_delete_email_sent"));
                $uibModalInstance.close();
            }, function () {
                Toast.error($translate.instant("cloud_project_delete_error"));
            });
        };

        self.cancel = $uibModalInstance.dismiss;

        self.goToSupport = function () {
            self.cancel();
            $state.go("otrs-list");
        };

        self.resetCache = function () {
            OvhApiCloudProjectInstance.Lexi().resetQueryCache();
            OvhApiCloudProjectVolume.Lexi().resetQueryCache();
            OvhApiCloudProjectSnapshot.Lexi().resetQueryCache();
            OvhApiCloudProjectIpFailover.Lexi().resetQueryCache();
            OvhApiCloudProjectIpLexi.resetQueryCache();
            self.init();
        };

        //---------API CALLS---------

        function initRemainingResources () {
            return $q.all({
                instance: OvhApiCloudProjectInstance.Lexi().query({ serviceName: projectId }).$promise,
                volume: OvhApiCloudProjectVolume.Lexi().query({ serviceName: projectId }).$promise,
                snapshot: OvhApiCloudProjectSnapshot.Lexi().query({ serviceName: projectId }).$promise,
                storage: OvhApiCloudProjectStorage.Lexi().query({ projectId: projectId }).$promise,
                ipFailoverOvh: OvhApiCloudProjectIpFailover.Lexi().query({ serviceName: projectId }).$promise,
                ipFailoverCloud: OvhApiCloudProjectIpLexi.query({ serviceName: projectId }).$promise
            }).then(function (result) {
                self.resources = _.mapValues(result, function (arr) {
                    return arr.length;
                });
            });
        }

        function getConsumption () {
            return OvhApiCloudProjectUsageCurrent.Lexi().get({
                serviceName: projectId,
            }).$promise.then(function (response) {
                return CloudProjectBillingService.getConsumptionDetails(response, response);
            }).then(function (data) {
                self.bill = data.totals.hourly.total.toFixed(2) + " " + data.totals.currencySymbol;
            }).catch(function (err) {
                return $q.reject(err);
            }
            );
        }

        function getCredits () {

            function isNotExpired (credit) {
                var validity = credit.validity;
                return (!validity.from || now.isAfter(validity.from)) &&
                    (!validity.to || now.isBefore(validity.to));
            }

            return OvhApiCloudProjectCredit.Aapi().query({
                serviceName: projectId
            }).$promise.then(function (credits) {
                self.hasCredits = credits.some(function (credit) {
                    return isNotExpired(credit) && credit.available_credit.value > 0; // jshint ignore:line
                });
            });
        }

        function deleteProject () {
            self.loaders.deleting = true;
            return OvhApiCloudProject.Lexi().delete({
                serviceName: projectId
            }).$promise.then(function () {
                self.errors = false;
            }, function (err) {
                self.errors = true;
                return $q.reject(err);
            })["finally"](function () {
                self.loaders.deleting = false;
            });
        }

        self.init();
    });
