angular.module("managerApp").service("CloudStorageContainers", [
    "$q",
    "OvhApiCloudProjectStorage",
    "CloudStorageContainersConfiguration",
    "CloudStorageContainer",
    function ($q, OvhApiCloudProjectStorage, storageContainerConfig, storageContainer) {
        "use strict";

        var self = this;

        /**
         * Get the list of the containers.
         * @param  {string} projectId    project id
         * @return {Promise}
         */
        self.list = function (projectId) {
            return OvhApiCloudProjectStorage.Lexi().query({
                projectId: projectId
            }).$promise
                .then(function (containers) {
                    // Cache name and region of each container
                    containers.forEach(function (container) {
                        saveNameAndRegion(container);
                    });
                    return containers;
                });

            function saveNameAndRegion (container) {
                var data = storageContainerConfig.containerMetaCache.get(projectId, container.id);
                if (!data) {
                    storageContainerConfig.containerMetaCache.set(projectId, container.id, _.pick(container, ["name", "region"]));
                }
            }
        };

        /**
         * Create a container.
         * @param  {string} projectId     project id
         * @param  {string} containerName container name
         * @param  {string} region        region
         * @param  {string} type          storage type (swift_cname|swift_public|swift_private|pca)
         * @return {Promise}
         */
        self.create = function (projectId, containerName, region, type) {
            var data = {
                containerName: containerName,
                region: region
            };
            var containerData = {};
            var currentContainerId;

            if (type === "archive") {
                data.archive = true;
            }

            return OvhApiCloudProjectStorage.Lexi().save({
                projectId: projectId
            }, data).$promise
                .then(function (result) {
                    currentContainerId = result.id;
                    containerData = result;

                    // Make container a static hosting
                    if (type === "static") {
                        return OvhApiCloudProjectStorage.Lexi().static({
                            projectId: projectId,
                            containerId: currentContainerId
                        }).$promise;
                    }

                    // Make container public
                    if (type === "public") {
                        return storageContainer.setAsPublic(projectId, currentContainerId);
                    }
                })
                .then(function () {
                    return storageContainer.getMetaData(projectId, currentContainerId);
                })
                .then(function (metaData) {
                    return angular.extend(containerData, metaData);
                });
        };

        /**
         * Delete a container.
         * @param  {string} projectId   project id
         * @param  {string} containerId container id
         * @return {Promise}
         */
        self.delete = function (projectId, containerId) {
            return OvhApiCloudProjectStorage.Lexi().get({
                projectId: projectId,
                containerId: containerId
            }).$promise
                .then(function (containerData) {
                    if (containerData.objects.length) {
                        return $q.reject("NON_EMPTY_CONTAINER");
                    }
                    return OvhApiCloudProjectStorage.Lexi().delete({
                        projectId: projectId,
                        containerId: containerId
                    }).$promise;
                });
        };
    }]);
