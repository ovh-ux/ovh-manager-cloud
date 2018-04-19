"use strict";
/**
 *  Cloud Volumes list Orchestrator. Heal the world we live in, save it for our children
 *  ====================================================================================
 *
 *  =README=
 *  This orchestrator is used to init and manage a Cloud Volumes list.
 */
angular.module("managerApp").service("CloudProjectComputeVolumesOrchestrator",
    function ($q, $translate, $rootScope, $timeout, CLOUD_INSTANCE_DEFAULTS, Poller, CloudUserPref, OvhApiCloudProjectVolume, OvhApiCloudProjectVolumeSnapshot, CloudProjectComputeVolumesFactory, OvhApiCloudProjectRegion, Toast) {

        // Warning: all values must be reset at init (see resetDatas())
        var _self = this,
            editedVolume,
            paramEdition = null,    // enum NAME, SIZE
            currentVolumesMovePending;

        var resetDatas = function () {
            // The full volumes list to display
            _self.volumes = null;

            // Project type (existing, template, template-new)
            _self.serviceType = null;

            // Current edited volume
            editedVolume = null;

            // Current moving volumes IDs
            // @todo: to reset when switching project
            currentVolumesMovePending = [];

            // Stop polling if launched
            _self.killPollVolumes();
        };

        /**
         *  Get the default volume configuration options
         */
        var getDefaultVolumeConfiguration = function () {
            return OvhApiCloudProjectRegion.v6().query({
                serviceName: _self.volumes.serviceName
            }).$promise.then(function (regionList) {
                // check if the default region exists
                var region = CLOUD_INSTANCE_DEFAULTS.region;
                if (_.indexOf(regionList, region) === -1) {
                    region = _.first(regionList);
                }
                return getDefaultVolumeConfigurationForRegion(region);
            });
        };

        /**
         *  Get the default volume configuration options for a specified region
         */
        var getDefaultVolumeConfigurationForRegion = function (defaultRegion) {

            var options = {
                name   : $translate.instant('cpci_volume_default_name'),
                region : defaultRegion,
                size   : 100,
                type   : 'classic',
                bootable: false
            }, optionsQueue = [];

            // @todo: enums toussa

            return $q.allSettled(optionsQueue).then(function () {
                if (_.keys(_self.volumes.volumes).length > 0) {
                    // use the most recent volume parameters
                    var mostRecentVolume = _.last(_.sortBy(_.flatten(_.values(_self.volumes.volumes)), 'creationDate'));
                    if (mostRecentVolume) {
                        options.region = mostRecentVolume.region;
                        options.size = mostRecentVolume.size;
                        options.type = mostRecentVolume.type;
                    }
                }
                return options;
            }, function () {
                return options;
            });
        };

        /**
         *  Add a volume into project Volumes list
         */
        this.addNewVolumeToList = function (targetId) {
            var volume;
            return $q.when(true).then(function () {
                return getDefaultVolumeConfiguration();
            }).then(function (options) {
                volume = _self.volumes.addVolumeToList(options, targetId);
                volume.status = 'DRAFT';
                _self.saveToUserPref();
                return volume;
            });
        };

        /**
         * Add a volume from a given snapshot into project Volumes list
         */
        this.addNewVolumeFromSnapshotToList = function (targetId, snapshot) {

            var getVolumeFromSnapshot = function (snapshot) {
                if (!snapshot || !snapshot.id) {
                    return $q.reject({ data: { message: "Snapshot id cannot be found" } });
                }
                return OvhApiCloudProjectVolume.v6().get({
                    serviceName : _self.volumes.serviceName,
                    volumeId : snapshot.volumeId
                }).$promise;
            };

            /**
             * Since snapshot doesnt contains the volume type we need to fetch the volume.
             * If the volume has been deleted the api still has a backup of it so it's not a problem.
             */
            return getVolumeFromSnapshot(snapshot).then(function (toRestore) {
                if (!toRestore || !toRestore.type) {
                    return $q.reject({ data: { message: "Volume to restore cannot be found" } });
                }
                var options = {
                   name: snapshot.name || toRestore.name,
                   region: snapshot.region || toRestore.region,
                   size: snapshot.minDisk || toRestore.size,
                   type: toRestore.type,
                   bootable: toRestore.bootable,
                   snapshot: snapshot
                };
                var volume = _self.volumes.addVolumeToList(options, targetId);
                volume.status = 'DRAFT';
                _self.saveToUserPref();
                return $q.when(volume);
            });
        };

        /**
         *  Launch the volume creation.
         */
        this.saveNewVolume = function (volume) {
            return volume.create().then(function () {
                _self.saveToUserPref();
                _self.pollVolumes();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Set the volume that is currently in edition
         */
        this.turnOnVolumeEdition = function (volume) {
            editedVolume = volume;
            editedVolume.startEdition();
        };

        /**
         *  Close/Reset the volume that is currently in edition
         */
        this.turnOffVolumeEdition = function (reset) {
            editedVolume.stopEdition(!!reset);
            delete editedVolume.snapshot; // in case of snapshot restore, we delete snapshot reference
            editedVolume = null;
       };

        /**
         *  Get the volume that is currently in edition
         */
        this.getEditedVolume = function () {
            return editedVolume;
        };

        /**
         *  Get parameters for current edition
         */
        this.getEditVolumeParam = function () {
            return paramEdition;
        };

        /**
         *  Get parameters for current edition
         */
        this.setEditVolumeParam = function (param) {
            paramEdition = param;
        };

        /**
         *  Save the volume modifications
         */
        this.saveEditedVolume = function (volume) {
            return volume.edit().then(function () {
                _self.saveToUserPref();
                _self.pollVolumes();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Delete volume
         */
        this.deleteVolume = function (volumeOrVolumeId) {
            var volume = typeof volumeOrVolumeId === 'string' || typeof volumeOrVolumeId === 'number' ? _self.volumes.getVolumeById(volumeOrVolumeId) : null;

            if (!volume) {
                return $q.reject({data : { message : "Volume id cannot be find"}});
            }

            if (volume.status === 'DRAFT') {
                return $q.when(true).then(function () {
                    _self.volumes.removeVolumeFromList(volume);
                    _self.saveToUserPref();
                });
            } else {
                return volume.remove().then(function () {
                    _self.saveToUserPref();
                    _self.pollVolumes();    // WARNING: Never return promise because pulling had to live on her side
                });
            }
        };

        /**
         *  Move a volume.
         *  If targetId: move it to a vm, if not: move it to "parking"
         */
        this.moveVolume = function (volumeOrVolumeId, targetId) {
            var volume = typeof volumeOrVolumeId === 'string' || typeof volumeOrVolumeId === 'number' ? _self.volumes.getVolumeById(volumeOrVolumeId) : null;
            targetId = targetId || 'unlinked';

            if (!volume) {
                return $q.reject({data : { message : "Volume id cannot be find"}});
            }

            var sourceId = volume.attachedTo && volume.attachedTo.length ? volume.attachedTo[0] : 'unlinked';
            var action = (!targetId || targetId === 'unlinked') ? 'detach' : 'attach';

            if (volume.status === 'DRAFT') {
                // @todo
                return $q.when('TODO').then(function () {
                    _self.saveToUserPref();
                });
            } else {
                // We need to hide it from previous location,
                // and show it into its new location BEFORE the end of the task...
                // To do that, we move it, and we put a special status.
                _self.volumes.removeVolumeFromList(volume, sourceId);
                _self.volumes.addVolumeToList(volume, targetId);
                currentVolumesMovePending.push(volume.id);

                    volume.status = action + 'ing';
                return volume[action](action === 'detach' ? sourceId : targetId).then(function () {
                    _self.pollVolumes();    // WARNING: Never return promise because pulling had to live on her side
                }, function (err) {
                    // revert
                    _self.volumes.addVolumeToList(volume, sourceId);
                    _self.volumes.removeVolumeFromList(volume, targetId);
                    _.pull(currentVolumesMovePending, volume.id);
                    return $q.reject(err);
                });
            }
        };

        /**
         * Create a snapshot of given volume.
         */
        this.snapshotVolume = function (volume, snapshotName) {
            return OvhApiCloudProjectVolumeSnapshot.v6().create({
                serviceName : _self.volumes.serviceName,
                volumeId : volume.id
            }, {
                name : snapshotName
            }).$promise.then(function () {
                volume.status = "snapshotting";
                _self.pollVolumes();
            }, function (err) {
                return $q.reject(err);
            });
        };

        /*-----  End of VOLUMES  ------*/


        /*===============================
        =            POLLING            =
        ===============================*/

        /**
         *  --- [Volumes] --- POLLING ---
         *
         *  Poll Volumes query
         */
        this.pollVolumes = function () {
            var continueStatus = [
                'creating',
                'attaching',
                'deleting',
                'extending',
                'detaching',
                'snapshotting'
            ];

            Poller.poll('/cloud/project/' + _self.volumes.serviceName + '/volume',
                null,
                {
                    successRule: function (volume) {
                        return !~continueStatus.indexOf(volume.status);
                    },
                    namespace: 'cloud.volumes',
                    notifyOnError : false
                }
            ).then(function (volumes) {
                updateVolumesFromPolling(volumes);
            }, function (err) {
                if (err && err.status) {
                    console.warn('pollVolumes', err);
                    // @todo add bugkiller here
                }
            }, function (volumes) {
                updateVolumesFromPolling(volumes);
            });
        };

        /**
         *  --- [Volumes] --- POLLING KILL ---
         *
         *  Kill the Poll Volumes query
         */
        this.killPollVolumes = function () {
            Poller.kill({namespace: 'cloud.volumes'});
        };

        /**
         *  Triggered by polling: Update volumes list
         *
         *  /!\ take care to don't update all datas, user can be in edition for example.
         */
        function updateVolumesFromPolling (volumes) {
            var haveChanges = false;

            // Group by attachedTo
            volumes = _.groupBy(volumes, function (vol) { return vol.attachedTo && vol.attachedTo.length ? vol.attachedTo[0] : 'unlinked'; });

            // Update existing Volumes
            haveChanges = updateVolumesWithVolumesFromApi(volumes, true) || haveChanges;
            // Add new Volumes, and delete removed Volumes
            haveChanges = addOrDeleteVolumesWithVolumesFromApi(volumes) || haveChanges;

            if (haveChanges) {
                _self.saveToUserPref();
            }

            return $q.when(volumes);
        }

        /*-----  End of Polling  ------*/


        /*====================================
        =            userPref                =
        ====================================*/

        this.saveToUserPref = function () {
            return CloudUserPref.set("cloud_project_" + _self.volumes.serviceName + "_volumes",
                                  _self.volumes.prepareToJson());
        };

        this.createFromUserPref = function (serviceName) {
            var key = "cloud_project_" + serviceName + "_volumes";
            return CloudUserPref.get(key).then(function (volumes) {
                volumes.serviceName = serviceName;
                return new CloudProjectComputeVolumesFactory(volumes);
            }, function () {
                return new CloudProjectComputeVolumesFactory({
                    serviceName: serviceName
                });
            });
        };


        /*====================================================
        =            LOCAL DATAS UPGRADE (by API)            =
        ======================================================
        * =README=
        * Add, upgrade, and delete VMs or IPs lists with datas from APIs.
        * Used at initialization, and with polling.
        *****************************************************/

        /**
         *  --- [Volumes] --- [addOrDelete] ---
         *
         *  Add or remove volumes from API with volumes from this factory
         *  /!\ This can't update existing datas!!!
         */
        function addOrDeleteVolumesWithVolumesFromApi (volumesFromApi, forceRemoveDrafts) {
            var haveChanges = false;

            /*==========  Remove deleted volumes  ==========*/

            angular.forEach(_self.volumes.volumes, function (volumesFromFactory, targetId) {

                var deletedVolumes = _.filter(volumesFromFactory, function (vol) {
                    // don't remove drafts!
                    if (!forceRemoveDrafts && vol.status === 'DRAFT') {
                        return false;
                    }
                    return !volumesFromApi[targetId] || !_.find(volumesFromApi[targetId], { id : vol.id });
                });

                angular.forEach(deletedVolumes, function (vol) {
                    // Don't remove pending move
                    if (~currentVolumesMovePending.indexOf(vol.id)) {
                        return;
                    }
                    _self.volumes.removeVolumeFromList(vol, targetId);
                });

                haveChanges = haveChanges || !!deletedVolumes.length;
            });

            /*==========  Add new volumes  ==========*/

            angular.forEach(volumesFromApi, function (volumesFromApi, targetId) {

                var addedVolumes;

                if (!_self.volumes.volumes[targetId] || !_self.volumes.volumes[targetId].length) {
                    addedVolumes = volumesFromApi;
                } else {
                    addedVolumes = _.filter(volumesFromApi, function (vol) {
                        return !_.find(_self.volumes.volumes[targetId], { id : vol.id });
                    });
                }

                angular.forEach(addedVolumes, function (vol) {
                    // Don't add pending move
                    if (~currentVolumesMovePending.indexOf(vol.id)) {
                        return;
                    }
                    _self.volumes.addVolumeToList(vol, targetId);
                });

                haveChanges = haveChanges || !!addedVolumes.length;
            });

            if (haveChanges) {
                $rootScope.$broadcast('infra.refresh.links');
            }

            return haveChanges;
        }

        /**
         *  --- [Volumes] --- [update] ---
         *
         * Updates volumes from API with volumes from this factory
         *  /!\ This don't add or remove volumes!
         */
        function updateVolumesWithVolumesFromApi (volumesFromApi, updateOnlySpecificDatas) {
            var haveChanges = false;

            angular.forEach(_self.volumes.volumes, function (volumesFromFactory, targetId) {

                if (!volumesFromApi[targetId] || !volumesFromFactory || !volumesFromFactory.length) {
                    return;
                }

                angular.forEach(volumesFromFactory, function (volumeFromFactory) {

                    var volumeFromApi = _.find(volumesFromApi[targetId], { id : volumeFromFactory.id });

                    if (!volumeFromApi) {
                        return;
                    }

                    // If the volume was in pending move, and now active, remove it from pendingArray.
                    if (~currentVolumesMovePending.indexOf(volumeFromFactory.id) && ~['available', 'in-use'].indexOf(volumeFromApi.status)) {
                        _.pull(currentVolumesMovePending, volumeFromFactory.id);
                    }

                    // If the volume was in snapshotting, and now active display success message
                    if (volumeFromFactory.status === 'snapshotting' && ~['available', 'in-use'].indexOf(volumeFromApi.status)) {
                        Toast.success($translate.instant("cpci_volume_snapshotting_end", { volume: volumeFromFactory.name }));
                    }

                    if (updateOnlySpecificDatas) {
                        // Update status
                        if (volumeFromFactory.status !== volumeFromApi.status) {
                            haveChanges = true;
                            volumeFromFactory.status = volumeFromApi.status;
                        }
                    } else {
                        // Updates all infos
                        volumeFromFactory.setInfos(volumeFromApi);
                        haveChanges = true;
                    }
                });

            });

            return haveChanges;
        }

        /*-----  End of LOCAL DATAS UPGRADE  ------*/


        /*======================================
        =            INITIALISATION            =
        ======================================*/

        /**
         * Initialize a volumes list, from existing project.
         */
        function initExistingProject (opts) {
            return _self.createFromUserPref(opts.serviceName).then(function (volumesFromCache) {

                var initQueue = [];

                _self.volumes = volumesFromCache;

                /*==========  Volumes  ==========*/

                initQueue.push(
                    OvhApiCloudProjectVolume.v6().query({
                        serviceName : _self.volumes.serviceName
                    }).$promise.then(function (volumes) {
                        // Group by attachedTo
                        volumes = _.groupBy(volumes, function (vol) { return vol.attachedTo && vol.attachedTo.length ? vol.attachedTo[0] : 'unlinked'; });

                        // Merge with local datas
                        updateVolumesWithVolumesFromApi(volumes);
                        addOrDeleteVolumesWithVolumesFromApi(volumes, true);
                    })
                );

                return $q.all(initQueue).then(function () {
                    _self.pollVolumes();    // WARNING: Never return promise because pulling had to live on her side
                    return _self.volumes;
                });
            });
        }

        /**
         *  Initialize a new Volumes list, depending of the project's type.
         */
        this.init = function (opts) {
            resetDatas();
            return initExistingProject(opts);
        };
    }
);
