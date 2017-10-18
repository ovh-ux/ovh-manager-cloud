angular.module("managerApp").controller("RA.storageCtrl", [
    "$filter",
    "$rootScope",
    "$scope",
    "$stateParams",
    "$translate",
    "$uibModal",
    "CloudStorageContainer",
    "CloudStorageContainers",
    "CloudStorageContainerTasksRunner",
    "CloudMessage",
    "ovhDocUrl",
    function ($filter, $rootScope, $scope, $stateParams, $translate, $uibModal,
        CloudStorageContainer, CloudStorageContainers, CloudStorageContainerTasksRunner,
        CloudMessage, ovhDocUrl) {
        "use strict";

        $scope.projectId = $stateParams.projectId;
        $scope.loaders = {
            storages: true,
            details: true
        };

        $scope.storages = null;
        $scope.storagesFiltered = null; // for searching
        $scope.open = {};

        // guides
        $scope.guides = {
            title: $translate.instant("storage_details_guide_title"),
            list: [{
                name: $translate.instant("storage_details_guide"),
                url: ovhDocUrl.getDocUrl("storage")
            }],
            footer: $translate.instant("storage_details_guide_footer")

        };

        // table sorting
        $scope.order = {
            by: "name",
            reverse: true,
            filter: $filter("orderBy")
        };

        // table searching
        $scope.filter = {
            name: ""
        };

        // handle messages
        $scope.messages = [];

        function refreshMessage () {
            $scope.messages = $scope.messageHandler.getMessages();
        }

        function loadMessage () {
            CloudMessage.unSubscribe("iaas.pci-project.storage");
            $scope.messageHandler = CloudMessage.subscribe("iaas.pci-project.storage", { onMessage: () => refreshMessage() });
        }

        init();

        // Do things on page change...
        $scope.$watch("storagesPaginated", _.debounce(function (storages) {
            if (!storages || !storages.length) {
                return;
            }

            // ... like load metadata for each container
            storages.forEach(function (container) {
                if (container.shortcut) {
                    return;
                }
                CloudStorageContainer.getMetaData($scope.projectId, container.id)
                    .then(function (containerMeta) {
                        angular.merge(container, containerMeta);
                        // Update source
                        angular.merge(getStorage(container.name, container.region), containerMeta);
                    });
            });

            function getStorage (name, region) {
                return _.find($scope.storagesFiltered, { name: name, region: region });
            }
        }, 1000));

        $scope.$watch("currentPage", function () {
            resetSelectionModel();
        });

        // Search callbacks
        $scope.search = function (value) {
            var regexp = new RegExp(value, "i");
            $scope.storagesFiltered = _.filter($scope.storages, function (storage) {
                return regexp.test(storage.name);
            });
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
            $scope.storagesFiltered = $scope.order.filter($scope.storagesFiltered, $scope.order.by, $scope.order.reverse);
        };

        // Selection management
        function resetSelectionModel () {
            $scope.selectionModel = {
                selected: [],
                allSelected: false
            };
        }

        /* Delete (a) container(s) */
        $scope["delete"] = function (container) {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: "app/cloud/project/storage/storage-delete-container/modal.html",
                controller: "RA.storage.deleteContainer",
                controllerAs: "RA.storage.deleteContainer",
                windowClass: "cloud_storage_container_delete",
                resolve: {
                    storage: function () {
                        return container;
                    }
                }
            }).result.then(function () {
                deleteContainer(container);
            });
        };

        function deleteContainer (container) {
            // First, delete all objects from the container
            return CloudStorageContainer.list($scope.projectId, container.id)
                .then(function (containerData) {
                    return containerData.objects;
                })
                .then(function (objects) {
                    var deleteObjectTasks = _.map(objects, createDeleteObjectTask);
                    return CloudStorageContainerTasksRunner
                        .enqueue("delete_objects_" + $scope.projectId + "_" + container.id, deleteObjectTasks);
                })
                .then(function () {
                    // And then, delete container
                    return CloudStorageContainerTasksRunner
                        .addTask("delete_container_" + $scope.projectId + "_" + container.id,
                            createDeleteContainerTask());
                })
                .finally(function () {
                    checkResult();
                });

            function createDeleteObjectTask (object) {
                return function () {
                    return CloudStorageContainer.delete($scope.projectId, container.id, object.name);
                };
            }

            function createDeleteContainerTask () {
                return function () {
                    container.status = "deleting";
                    return CloudStorageContainers.delete($scope.projectId, container.id)
                        .then(function (result) {
                            refreshView();
                            return result;
                        })
                        .finally(function () {
                            delete container.status;
                        });
                };
            }

            function refreshView () {
                $rootScope.$broadcast("delete_container", [container.name]);
                $scope.storages = _.filter($scope.storages, function (storage) {
                    return storage.id !== container.id;
                });
                $scope.filterStorages();
            }

            function checkResult () {
                if (CloudStorageContainerTasksRunner.countErrorTasks()) {
                    CloudMessage.error($translate.instant("storage_delete_error"));
                } else {
                    CloudMessage.success($translate.instant("storage_delete_success"));
                }
            }
        }

        function getStorages () {
            // Get Access Token before getting all metadata
            // to prevent triggering simultaneous calls.
            return CloudStorageContainer.getAccessAndToken($scope.projectId)
                .then(function () {
                    return CloudStorageContainers.list($scope.projectId);
                })
                .then(function (storages) {
                    $scope.storages = storages;
                    $scope.storagesFiltered = storages;
                    $scope.orderStorages($scope.order.by);
                })
                .catch(function () {
                    CloudMessage.error($translate.instant("storage_load_error"));
                })
                .finally(function () {
                    $scope.loaders.storages = false;
                });
        }

        function init () {
            loadMessage();
            resetSelectionModel();
            getStorages();
        }
    }]);
