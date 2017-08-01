angular.module("managerApp").factory('CloudProjectComputeVolumesFactory',
    function (CloudProjectComputeVolumesVolumeFactory) {

        'use strict';

        /**
         *  Defines a cloud project compute infrastructure
         *
         *  @param    {Object}  options             - Options for creating a new CloudProjectInfrastructure
         *  @param    {Object}  options.volumes     - List of Volumes with its options
         */
        var VolumesFactory = (function () {

            return function CloudProjectComputeVolumesFactory (options) {

                var self = this;

                if (!options) {
                    options = {};
                }

                this.serviceName = options.serviceName || null;

                this.volumes = {};

                if (options.volumes && options.volumes.length) {
                    angular.forEach(options.volumes, function (volume, targetId) {
                        self.addVolumeToList(volume, targetId);
                    });
                }

            };

        })();

        ///////////////////////////////
        ///         METHODS          //
        ///////////////////////////////

        /**
         *  Check if item is already an instance or an options object
         */
        function __checkVolume (volume) {
            return volume instanceof CloudProjectComputeVolumesVolumeFactory ? volume : new CloudProjectComputeVolumesVolumeFactory(volume);
        }

        /**
         *  Get volume by volume ID.
         */
        VolumesFactory.prototype.getVolumeById = function (volumeId) {
            var vol;
            angular.forEach(this.volumes, function (volume) {
                if (!vol) {
                    vol = _.find(volume, { id: volumeId });
                }
            });
            return vol;
        };

        /**
         *  Add a volume into list
         */
        VolumesFactory.prototype.addVolumeToList = function (volume, targetId) {
            targetId = targetId || 'unlinked';

            volume.serviceName = this.serviceName;    // Add projectId to item

            volume = __checkVolume(volume);
            volume.setInfos({
                attachedTo: [targetId]
            });

            if (!this.volumes[targetId]) {
                this.volumes[targetId] = [];
            }

            this.volumes[targetId].push(volume);
            return volume;
        };

        /**
         *  Remove given volume from list
         */
        VolumesFactory.prototype.removeVolumeFromList = function (volume, targetId) {
            targetId = targetId || 'unlinked';
            _.remove(this.volumes[targetId], { id : volume.id });
            return volume;
        };

        // ---

        /**
         *  Prepare object to json encode function to avoid function being encoded
         */
        VolumesFactory.prototype.prepareToJson = function () {
            var preparedToJson = {};
            angular.forEach(this.volumes, function (volumes, targetId) {
                preparedToJson[targetId] = _.map(volumes, function (volume) {
                    return volume.prepareToJson();
                });
            });
            return {
                volumes: preparedToJson
            };
        };

        return VolumesFactory;

    }
);
