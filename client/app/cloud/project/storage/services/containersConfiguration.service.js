angular.module("managerApp")
    .service("CloudStorageContainersConfiguration", [
        "$cacheFactory", "$parse", function ($cacheFactory, $parse) {
            "use strict";

            var self = this;

            self.containerMetaCache = new Cache($cacheFactory("storageContainerMetaCache"));
            self.accessCache = $cacheFactory("storageAccessCache");

            function Cache (ngCache) {
                this.cache = ngCache;
            }

            _.extend(Cache.prototype, {
                /**
                 * Set container meta data cache value.
                 * @param {string} projectId   project id
                 * @param {string} containerId container id
                 * @param {Object} data        data to save
                 * @return {Object} cache object
                 */
                set: function (projectId, containerId, data) {
                    this.cache.put(getKey(projectId, containerId), data);
                    return this;
                },

                /**
                 * Update container meta data cache value.
                 * @param {string}        projectId      project id
                 * @param {string}        containerId    container id
                 * @param {string|Object} property|data  property name|data to save
                 * @param {Object}        data           data to save (optional)
                 * @return {Object} cache object
                 */
                update: function (projectId, containerId, property, data) {
                    var key = getKey(projectId, containerId);
                    var dataToSave = this.cache.get(key) || {};

                    if (!arguments[3]) {
                        data = property;
                        property = null;
                    }

                    if (property) {
                        var setter = $parse(property).assign;
                        setter(dataToSave, data);
                    } else {
                        angular.merge(dataToSave, data);
                    }

                    this.set(projectId, containerId, dataToSave);
                    return this;
                },

                /**
                 * Get container meta data cache value.
                 * @param {string} projectId    project id
                 * @param {string} containerId  container id
                 * @param {string} property     property name (optional)
                 * @return {Object}             data to get
                 */
                get: function (projectId, containerId, property) {
                    var key = getKey(projectId, containerId);
                    var data = this.cache.get(key);
                    if (property) {
                        var getter = $parse(property);
                        return getter(data);
                    } else {
                        return data;
                    }
                },

                /**
                 * Remove container meta data cache value.
                 * @param {string} projectId    project id
                 * @param {string} containerId  container id
                 * @return {Object} cache object
                 */
                remove: function (projectId, containerId) {
                    var key = getKey(projectId, containerId);
                    this.cache.remove(key);
                    return this;
                }
            });

            function getKey (projectId, containerId) {
                return projectId + "_" + containerId;
            }
        }]);
