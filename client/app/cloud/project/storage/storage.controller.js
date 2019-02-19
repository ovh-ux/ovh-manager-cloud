angular.module('managerApp').controller('RA.storageCtrl', [
  '$filter',
  '$rootScope',
  '$scope',
  '$stateParams',
  '$translate',
  '$uibModal',
  'CloudStorageContainer',
  'CloudStorageContainers',
  'CloudStorageContainerTasksRunner',
  'CucCloudMessage',
  'ovhDocUrl',
  'RegionService',
  function ($filter, $rootScope, $scope, $stateParams, $translate, $uibModal, CloudStorageContainer,
    CloudStorageContainers, CloudStorageContainerTasksRunner, CucCloudMessage, ovhDocUrl,
    RegionService) {
    $scope.projectId = $stateParams.projectId;
    $scope.loaders = {
      storages: true,
      details: true,
    };

    $scope.storages = null;
    $scope.storagesFiltered = null; // for searching
    $scope.open = {};
    $scope.regionService = RegionService;

    // guides
    $scope.guides = {
      title: $translate.instant('storage_details_guide_title'),
      list: [{
        name: $translate.instant('storage_details_guide_pca'),
        url: ovhDocUrl.getDocUrl('cloud/storage/pca'),
      }, {
        name: $translate.instant('storage_details_guide_pcs'),
        url: ovhDocUrl.getDocUrl('cloud/storage/pcs'),
      }],
      footer: $translate.instant('storage_details_guide_footer'),

    };

    // table sorting
    $scope.order = {
      by: 'name',
      reverse: true,
      filter: $filter('orderBy'),
    };

    // table searching
    $scope.filter = {
      name: '',
    };

    // handle messages
    $scope.messages = [];

    function refreshMessage() {
      $scope.messages = $scope.messageHandler.getMessages();
    }

    function loadMessage() {
      CucCloudMessage.unSubscribe('iaas.pci-project.compute.storage');
      $scope.messageHandler = CucCloudMessage.subscribe('iaas.pci-project.compute.storage', { onMessage: () => refreshMessage() });
    }

    // Do things on page change...
    $scope.$watch('storagesPaginated', _.debounce((storages) => {
      if (!storages || !storages.length) {
        return;
      }

      function getStorage(name, region) {
        return _.find($scope.storagesFiltered, { name, region });
      }

      // ... like load metadata for each container
      storages.forEach((container) => {
        if (container.shortcut) {
          return;
        }
        CloudStorageContainer.getMetaData($scope.projectId, container.id)
          .then((containerMeta) => {
            angular.merge(container, containerMeta);
            // Update source
            angular.merge(getStorage(container.name, container.region), containerMeta);
          });
      });
    }, 1000));

    // Selection management
    function resetSelectionModel() {
      $scope.selectionModel = {
        selected: [],
        allSelected: false,
      };
    }

    $scope.$watch('currentPage', () => {
      resetSelectionModel();
    });

    // Search callbacks
    $scope.search = function (value) {
      const regexp = new RegExp(value, 'i');
      $scope.storagesFiltered = _.filter($scope.storages, storage => regexp.test(storage.name));
    };

    $scope.showAll = function () {
      $scope.storagesFiltered = $scope.storages;
    };

    // Filtering and ordering
    $scope.orderStorages = function (by) {
      if (by) {
        if ($scope.order.by === by) {
          $scope.order.reverse = !$scope.order.reverse;
        } else {
          $scope.order.by = by;
        }
      }
      $scope.storagesFiltered = $scope.order.filter(
        $scope.storagesFiltered,
        $scope.order.by, $scope.order.reverse,
      );
    };

    $scope.filterStorages = function () {
      if ($scope.filter.enabled) {
        $scope.storagesFiltered = _.filter(
          $scope.storages,
          storage => storage.name
            && storage.name.toLowerCase().indexOf($scope.filter.name.toLowerCase()) !== -1,
        );
      } else {
        $scope.storagesFiltered = $scope.storages;
        $scope.filter.name = '';
      }
      $scope.orderStorages();
    };

    /* Delete (a) container(s) */
    function deleteContainer(container) {
      function createDeleteObjectTask(object) {
        return function () {
          return CloudStorageContainer.delete($scope.projectId, container.id, object.name);
        };
      }

      function refreshView() {
        $rootScope.$broadcast('delete_container', [container.name]);
        $scope.storages = _.filter($scope.storages, storage => storage.id !== container.id);
        $scope.filterStorages();
      }

      function createDeleteContainerTask() {
        return function () {
          _.set(container, 'status', 'deleting');
          return CloudStorageContainers.delete($scope.projectId, container.id)
            .then((result) => {
              refreshView();
              return result;
            })
            .finally(() => {
              delete container.status; // eslint-disable-line
            });
        };
      }

      function checkResult() {
        if (CloudStorageContainerTasksRunner.countErrorTasks()) {
          CucCloudMessage.error($translate.instant('storage_delete_error'));
        } else {
          CucCloudMessage.success($translate.instant('storage_delete_success'));
        }
      }

      // First, delete all objects from the container
      return CloudStorageContainer.list($scope.projectId, container.id)
        .then(containerData => containerData.objects)
        .then((objects) => {
          const deleteObjectTasks = _.map(objects, createDeleteObjectTask);
          return CloudStorageContainerTasksRunner
            .enqueue(`delete_objects_${$scope.projectId}_${container.id}`, deleteObjectTasks);
        })
        .then(() => CloudStorageContainerTasksRunner
          .addTask(`delete_container_${$scope.projectId}_${container.id}`,
            createDeleteContainerTask()))
        .finally(() => {
          checkResult();
        });
    }

    $scope.delete = function (container) {
      $uibModal.open({
        windowTopClass: 'cui-modal',
        templateUrl: 'app/cloud/project/storage/storage-delete-container/modal.html',
        controller: 'RA.storage.deleteContainer',
        controllerAs: 'RA.storage.deleteContainer',
        windowClass: 'cloud_storage_container_delete',
        resolve: {
          storage() {
            return container;
          },
        },
      }).result.then(() => {
        deleteContainer(container);
      });
    };

    function getStorages() {
      // Get Access Token before getting all metadata
      // to prevent triggering simultaneous calls.
      return CloudStorageContainer.getAccessAndToken($scope.projectId)
        .then(() => CloudStorageContainers.list($scope.projectId))
        .then((storages) => {
          $scope.storages = storages;
          $scope.storagesFiltered = storages;
          $scope.orderStorages($scope.order.by);
        })
        .catch(() => {
          CucCloudMessage.error($translate.instant('storage_load_error'));
        })
        .finally(() => {
          $scope.loaders.storages = false;
        });
    }

    function init() {
      loadMessage();
      resetSelectionModel();
      getStorages();
    }

    init();
  }]);
