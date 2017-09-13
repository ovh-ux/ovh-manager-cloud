angular.module("managerApp").service("CloudStorageContainer", [
    "$cacheFactory",
    "$http",
    "$q",
    "OvhApiCloudProjectStorage",
    "CloudStorageContainersConfiguration",
    "CLOUD_PCA_FILE_STATE",
    function ($cacheFactory, $http, $q,
            OvhApiCloudProjectStorage, storageContainerConfig, CLOUD_PCA_FILE_STATE) {
        "use strict";

        var self = this;

        // Openstack headers
        var xStoragePolicy = "x-storage-policy";
        var xContainerRead = "x-container-read";
        var xContainerMetaWebListings = "x-container-meta-web-listings";
        var xContainerReadPublicValue = ".r:*,.rlistings";

        // Cache management
        var accessCache = storageContainerConfig.accessCache;

        /**
         * Get meta data of this container.
         * @param  {string} projectId     project id
         * @param  {string} containerId   container id
         * @return {Promise<Object>}      container metadata
         */
        self.getMetaData = function (projectId, containerId) {
            return ensureAccess(projectId)
                .then(function () {
                    return getContainerMeta(projectId, containerId);
                })
                .then(function (containerMeta) {
                    return requestContainer(self.endpoints[containerMeta.region.toLowerCase()], containerMeta.name, {
                        method: "HEAD"
                    });
                })
                .then(function (data) {
                    return _.pick(data.headers(), function (value, key) {
                        return /^(X\-Container|X\-Storage)/i.test(key);
                    });
                })
                .then(function (data) {
                    // Guess storage type
                    if (data[xStoragePolicy] === "PCS") {
                        if (data[xContainerMetaWebListings]) {
                            data.shortcut = "swift_cname";
                        } else if (data[xContainerRead] === xContainerReadPublicValue) {
                            data.shortcut = "swift_public";
                        } else {
                            data.shortcut = "swift_private";
                        }
                    } else {
                        data.shortcut = "pca";
                    }
                    return data;
                });
        };

        /**
         * List container objects.
         * @param  {string} projectId     project id
         * @param  {string} containerId   container id
         * @return {Promise<Object>}      object containing the list of objects
         */
        self.list = function (projectId, containerId) {
            return OvhApiCloudProjectStorage.Lexi().get({
                projectId: projectId,
                containerId: containerId
            }).$promise
                .then(function (containerData) {
                    storageContainerConfig.containerMetaCache.set(projectId, containerId, _.pick(containerData, ["name", "region"]));
                    return containerData;
                });
        };

        /**
         * Download file.
         * @param  {string} projectId   project id
         * @param  {string} containerId container id
         * @param  {Object} object      object to download
         * @return {Promise}
         */
        self.download = function (projectId, containerId, file) {
            var weekDurationInMilliseconds = 6.048e+8;
            var expiration = new Date(Date.now() + weekDurationInMilliseconds);

            return OvhApiCloudProjectStorage.Lexi().getURL({
                    projectId: projectId,
                    containerId: containerId
                }, {
                    expirationDate: expiration.toISOString(),
                    objectName: file.name
                }).$promise
                .then(function (resp) {
                    if (file.retrievalState === CLOUD_PCA_FILE_STATE.SEALED) {
                        return unseal(resp.getURL);
                    } else {
                        return resp.getURL;
                    }
                });

            function unseal (url) {
                return $http.get(url)
                    .catch(function (err) {
                        // This call make a CORS error, but still initiate the process, swallow status -1 which is what we get when cors fail.
                        if (err.status !== -1) {
                            throw err;
                        }
                    });
            }
        };

        /**
         * Add object to container.
         * @param  {string} projectId     project id
         * @param  {string} containerId   container id
         * @param  {Object} opts          upload opts
         * @return {Promise}
         */
        self.upload = function (projectId, containerId, opts) {
            if (!opts.file) {
                return $q.reject({
                    errorCode: "BAD_PARAMETERS",
                    config: opts
                });
            }
            return ensureAccess(projectId)
                .then(function () {
                    return getContainerMeta(projectId, containerId);
                })
                .then(function (containerMeta) {
                    var config = {
                        headers: {
                            "Content-Type": opts.file.type
                        },
                        data: opts.file
                    };
                    var filename = opts.file.name;
                    if (opts.prefix) {
                        filename = opts.prefix + filename;
                    }
                    var url = getContainerUrl(self.endpoints[containerMeta.region.toLowerCase()], containerMeta.name, filename);
                    return upload(url, config);
                });
        };

        /**
         * Delete an object.
         * @param  {string} projectId   project id
         * @param  {string} containerId container id
         * @param  {string} file        file name
         * @return {Promise}
         */
        self.delete = function (projectId, containerId, file) {
            return ensureAccess(projectId)
                .then(function () {
                    return getContainerMeta(projectId, containerId);
                })
                .then(function (containerMeta) {
                    return requestContainer(self.endpoints[containerMeta.region.toLowerCase()], containerMeta.name, {
                        method: "DELETE",
                        file: file
                    });
                });
        };

        /**
         * Set container as public.
         * @param {string} projectId   project id
         * @param {string} containerId container id
         * @return {Promise}
         */
        self.setAsPublic = function (projectId, containerId) {
            return ensureAccess(projectId)
                .then(function () {
                    return getContainerMeta(projectId, containerId);
                })
                .then(function (containerMeta) {
                    if (containerMeta[xContainerRead] !== xContainerReadPublicValue) {
                        return requestContainer(self.endpoints[containerMeta.region.toLowerCase()], containerMeta.name, {
                            method: "PUT",
                            headers: {
                                "X-Container-Read": xContainerReadPublicValue
                            }
                        });
                    }
                    return $.resolve();
                });
        };

        self.getAccessAndToken = getAccessAndToken;

        function upload (url, config) {
            var deferred = $q.defer();
            var xhr = new XMLHttpRequest();
            var uploadProgress;
            var uploadComplete;
            var uploadFailed;
            var uploadCanceled;

            uploadProgress = function (e) {
                var res;
                if (e.lengthComputable) {
                    res = Math.round(e.loaded * 100 / e.total);
                } else {
                    res = undefined;
                }

                if (typeof deferred.notify === "function") {
                    deferred.notify(res);
                }
            };

            uploadComplete = function (e) {
                var xhr = e.srcElement || e.target;
                if (xhr.status >= 200 && xhr.status < 300) { // successful upload
                    deferred.resolve(xhr);
                } else {
                    deferred.reject(xhr);
                }
            };

            uploadFailed = function (e) {
                var xhr = e.srcElement || e.target;
                deferred.reject(xhr);
            };

            uploadCanceled = function (e) {
                var xhr = e.srcElement || e.target;
                deferred.reject(xhr);
            };

            xhr.upload.addEventListener("progress", uploadProgress, false);
            xhr.addEventListener("load", uploadComplete, false);
            xhr.addEventListener("error", uploadFailed, false);
            xhr.addEventListener("abort", uploadCanceled, false);

            // Send the file
            xhr.open("PUT", url, true);

            var headers = config.headers || {};
            headers = angular.extend({
                "X-Auth-Token": self.token
            }, headers);

            angular.forEach(headers, function (header, id) {
                xhr.setRequestHeader(id, header);
            });
            xhr.send(config.data);
            return deferred.promise;
        }

        // Improvement:
        // Avoid listing all containers to get metadata.
        function getContainerMeta (projectId, containerId) {
            var containerMeta = storageContainerConfig.containerMetaCache.get(projectId, containerId);
            return containerMeta ?
                $q.resolve(containerMeta) :
                self.list(projectId, containerId)
                    .then(function () {
                        return storageContainerConfig.containerMetaCache.get(projectId, containerId);
                    });
        }

        function requestContainer (baseUrl, containerName, opts) {
            opts = opts || {};

            var url = getContainerUrl(baseUrl, containerName, opts.file);
            delete opts.file;

            return $http(angular.merge({
                method: "GET",
                url: url,
                headers: {
                    "X-Auth-Token": self.token
                }
            }, opts));
        }

        function getContainerUrl (baseUrl, containerName, file) {
            var urlTpl = baseUrl + "/{container}";
            var url;
            if (file) {
                urlTpl += "/{file}";
                url = URI.expand(urlTpl, { // jshint ignore:line
                    container: containerName,
                    file: file
                }).toString();
            } else {
                url = URI.expand(urlTpl, { // jshint ignore:line
                    container: containerName
                }).toString();
            }
            return url;
        }

        function ensureAccess (projectId) {
            return getAccessAndToken(projectId);
        }

        function getAccessAndToken (projectId) {
            var cacheValue = accessCache.get(projectId);

            var getAccessAndTokenPromise = cacheValue ?
                $q.resolve(cacheValue) :
                OvhApiCloudProjectStorage.Lexi().access({
                    projectId: projectId
                }).$promise;

            return getAccessAndTokenPromise
                .then(function (accessResult) {
                    if (!cacheValue) {
                        accessCache.put(projectId, accessResult);
                    }
                    self.token = accessResult.token;
                    self.endpoints = accessResult.endpoints.reduce(function (result, endpoint) {
                        result[endpoint.region.toLowerCase()] = endpoint.url;
                        return result;
                    }, {});
                    return accessResult;
                });
        }
    }]);
