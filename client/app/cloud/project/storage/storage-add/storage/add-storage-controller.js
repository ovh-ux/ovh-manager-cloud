angular.module('managerApp').controller('RA.add.storageCtrl', [
  '$q',
  '$scope',
  '$state',
  '$stateParams',
  '$timeout',
  '$translate',
  'OvhApiCloudProjectRegion',
  'CloudStorageContainers',
  'CucCloudMessage',
  function storageCtrl($q, $scope, $state, $stateParams, $timeout, $translate,
    OvhApiCloudProjectRegion, CloudStorageContainers, CucCloudMessage) {
    $scope.projectId = $stateParams.projectId;

    $scope.model = {};
    $scope.steps = {
      region: {
        enable: false,
      },
      containerType: {
        enable: false,
      },
      name: {
        enable: false,
      },
    };

    $scope.stepPath = null;

    $scope.loaders = {
      regions: true,
    };

    $scope.historyStep = [];

    // handle messages
    $scope.messages = [];

    function refreshMessage() {
      $scope.messages = $scope.messageHandler.getMessages();
    }

    function loadMessage() {
      CucCloudMessage.unSubscribe('iaas.pci-project.compute.storage');
      $scope.messageHandler = CucCloudMessage.subscribe('iaas.pci-project.compute.storage', { onMessage: () => refreshMessage() });
    }

    $scope.loadStep = function (step) {
      $scope.steps[step].enable = true;
      $scope.historyStep.push(step);
    };

    $scope.isValid = function () {
      const isDefined = function (expr) { return !_.isUndefined(expr); };
      return isDefined($scope.model.region)
                   && isDefined($scope.model.containerType)
                   && isDefined($scope.model.name);
    };

    $scope.addStorage = function () {
      $scope.loaders.post = true;

      return CloudStorageContainers.create(
        $scope.projectId,
        $scope.model.name,
        $scope.model.region,
        $scope.model.containerType.type,
      )
        .then((resp) => {
          if (!resp || !resp.id) {
            CucCloudMessage.error($translate.instant('add_storage_storage_added_error'));
            return $q.reject(resp);
          }

          return $timeout(() => {
            CucCloudMessage.success($translate.instant('add_storage_storage_added'));
            $state.go('iaas.pci-project.compute.storage.detail-container', { projectId: $scope.projectId, storageId: resp.id });
          }, 3000)
            .then(() => resp);
        })
        .finally(() => {
          $scope.loaders.post = false;
        });
    };

    function loadRegions() {
      $scope.loaders.regions = true;
      $scope.regions = null;

      return OvhApiCloudProjectRegion.v6().query({
        serviceName: $scope.projectId,
      }).$promise
        .then((regions) => {
          $scope.regions = regions;
        })
        .finally(() => {
          $scope.loaders.regions = false;
        });
    }

    function init() {
      loadMessage();
      return loadRegions()
        .then(() => {
          $scope.loadStep('region');
        });
    }

    init();
  }]);
