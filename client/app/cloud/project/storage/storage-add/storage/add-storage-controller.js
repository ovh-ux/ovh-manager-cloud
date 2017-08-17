angular.module("managerApp").controller("RA.add.storageCtrl", [
    "$q",
    "$scope",
    "$state",
    "$stateParams",
    "$timeout",
    "$translate",
    "CloudProjectRegion",
    "CloudStorageContainers",
    "Toast",
    function ($q, $scope, $state, $stateParams, $timeout, $translate,
        CloudProjectRegion, CloudStorageContainers, Toast) {
        "use strict";

        $scope.projectId = $stateParams.projectId;

        $scope.model = {};
        $scope.steps = {
            region: {
                enable: false
            },
            containerType: {
                enable: false
            },
            name: {
                enable: false
            }
        };

        $scope.stepPath = null;

        $scope.loaders = {
            regions: true
        };

        $scope.historyStep = [];

        $scope.loadStep = function (step) {
            $scope.steps[step].enable = true;
            $scope.historyStep.push(step);
        };

        $scope.isValid = function () {
            var isDefined = function (expr) { return !_.isUndefined(expr); };
            return isDefined($scope.model.region) &&
                   isDefined($scope.model.containerType) &&
                   isDefined($scope.model.name);
        };

        $scope.addStorage = function () {
            $scope.loaders.post = true;

            return CloudStorageContainers.create(
                    $scope.projectId,
                    $scope.model.name,
                    $scope.model.region,
                    $scope.model.containerType.type
                )
            .then(function (resp) {
                if (!resp || !resp.id) {
                    Toast.error($translate.instant("add_storage_storage_added_error"));
                    return $q.reject(resp);
                }

                return $timeout(function () {
                    Toast.success($translate.instant("add_storage_storage_added"));
                    $state.go("iaas.pci-project.storage.detail-container", { projectId: $scope.projectId, storageId: resp.id });
                }, 3000)
                .then(function () {
                    return resp;
                });
            })
            .finally(function () {
                $scope.loaders.post = false;
            });
        };

        init();

        function loadRegions () {
            $scope.loaders.regions = true;
            $scope.regions = null;

            return CloudProjectRegion.Lexi().query({
                    serviceName: $scope.projectId
                }).$promise
                .then(function (regions) {
                    $scope.regions = regions;
                })
                .finally(function () {
                    $scope.loaders.regions = false;
                });
        }

        function init () {
            return loadRegions()
                .then(function () {
                    $scope.loadStep("region");
                });
        }

    }]);
