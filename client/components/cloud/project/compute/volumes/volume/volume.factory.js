/* jshint ignore:start*/
angular.module("managerApp").factory('CloudProjectComputeVolumesVolumeFactory',
    function ($q, OvhApiCloudProjectVolume, OvhCloudPriceHelper, CLOUD_VOLUME_TYPES, OvhApiCloudProjectQuota) {

        'use strict';

        /**
         *  Defines a cloud project compute volume
         *
         *  /!\ Take care when modifying this!!! Check setInfos, and prepareToJson too.
         */
        var VolumeFactory = (function () {

            return function CloudProjectComputeVolumesVolumeFactory (options) {

                if (!options) {
                    options = {};
                }

                // Set custom values
                options = this.getCustomOptions(options);

                // Extend and set default values
                angular.extend(this, angular.extend({
                    id        : Math.floor(Math.random() * 1000 * new Date().getTime()),
                    status    : '',
                    createdAt : new Date().toISOString()
                }, options));

                // Updating price
                this.getFullInformations();
            };

        })();

        ///////////////////////
        //      METHODS      //
        ///////////////////////

        /**
         *  Set customs options (for init, and updates)
         *  -> @devs: put your customs values here
         */
        VolumeFactory.prototype.getCustomOptions = function (options) {
            return angular.extend(options, {
                attachedTo : options.attachedTo ? _.flatten([options.attachedTo]) : []    // Ensure attachedTo is always an array
            });
        };

        /**
         *  Set infos after initialization
         */
        VolumeFactory.prototype.setInfos = function (options) {

            // Set custom values
            options = this.getCustomOptions(options || {});

            // Ok now extend it
            angular.extend(this, options);

            // Updating price
            return this.getFullInformations();
        };

        /**
         *  [API] Get the item from API using its id
         */
        VolumeFactory.prototype.get = function () {
            var self = this;

            return OvhApiCloudProjectVolume.Lexi().get({
                serviceName : this.serviceName,
                volumeId : this.id
            }).$promise.then(function (volOptions) {
                return self.setInfos(volOptions);
            });
        };

        /* jshint ignore:end*/
        /**
         *  [API] Get additional informations about volume (price)
         *  Create a volumePricesMap attribute like { 'planCode' : { 'price' : {} } }
         */
        VolumeFactory.prototype.getFullInformations = function () {
            var self = this;
            OvhCloudPriceHelper.getPrices(this.serviceName).then(response => {
                self.volumePricesMap = response;
            }).catch(err => console.warn(err));
        };
        /* jshint ignore:start*/

        /**
         *  Calculate price with GB price and volume size
         */
        VolumeFactory.prototype.calculatePrice = function () {
            return this.getPrice(this.region, this.type, this.size);
        };

        VolumeFactory.prototype.getPrice = function (region, type, size = 1) {
            // in case if getFullInformations is not resolved yet
            if (this.volumePricesMap) {
                let volumeByRegionAndTypePrice = this.volumePricesMap[this.planCode] || this.volumePricesMap[`volume.${type}.consumption.${region}`] || this.volumePricesMap[`volume.${type}.consumption`];
                if (volumeByRegionAndTypePrice) {
                    var calculatedPriceValue = size * volumeByRegionAndTypePrice.priceInUcents / 100000000,
                        calculatedMonthlyPriceValue = calculatedPriceValue * moment.duration(1,"months").asHours();
                    return {
                        price : {
                            currencyCode : volumeByRegionAndTypePrice.price.currencyCode,
                            text         : volumeByRegionAndTypePrice.price.text.replace(/\d+(?:[.,]\d+)?/, "" + calculatedPriceValue.toFixed(2)),
                            value        : calculatedPriceValue
                        },
                        monthlyPrice : {
                            currencyCode : volumeByRegionAndTypePrice.price.currencyCode,
                            text         : volumeByRegionAndTypePrice.price.text.replace(/\d+(?:[.,]\d+)?/, "" + calculatedMonthlyPriceValue.toFixed(2)),
                            value        : calculatedMonthlyPriceValue
                        }
                    };
                } else {
                    console.warn('No price found for region and for volume type.', region, type);
                }
            }

            console.warn('Missing prices', region, type);
            return {
                price : {},
                monthlyPrice : {}
            }

        };

        /**
         *   Get type of status.
         */
        VolumeFactory.prototype.getStatusGroup = function () {
            if (~['available', 'in-use'].indexOf(this.status)) {
                return 'ACTIVE';
            } else if (~['creating', 'attaching', 'detaching', 'deleting', 'backing-up', 'restoring-backup', 'snapshotting'].indexOf(this.status)) {
                return 'PENDING';
            } else if (~['error', 'error_deleting', 'error_restoring', 'error_extending'].indexOf(this.status)) {
                return 'ERROR';
            } else {
                return this.status;
            }
        };

        /**
         *  [API] Create new volume. POST informations for creating a volume to API
         */
        VolumeFactory.prototype.create = function () {
            var self = this;

            return OvhApiCloudProjectVolume.Lexi().save({
                serviceName    : this.serviceName
            }, {
                description : this.description || undefined,
                name        : this.name || undefined,
                region      : this.region,
                size        : parseInt(this.size, 10),
                type        : this.type,
                bootable    : this.bootable,
                snapshotId  : this.snapshot ? this.snapshot.id : undefined
            }).$promise.then(function (volOptions) {
                self.id = volOptions.id;    // we must do it because old id is a fake one
                self.status = volOptions.status;
                return self;
            });
        };

        /**
         *  [API] Delete a volume.
         */
        VolumeFactory.prototype.remove = function () {
            var self = this;

            return OvhApiCloudProjectVolume.Lexi().remove({
                serviceName : this.serviceName,
                volumeId    : this.id
            }).$promise.then(function () {
                self.status = 'deleting';
                return self;
            });
        };

        /**
         *  [API] Edit the volume
         */
        VolumeFactory.prototype.edit = function () {
            var self = this,
                promises = [];

            if (self.hasChange('name') || self.hasChange('description') || self.hasChange('bootable')){
                promises.push(OvhApiCloudProjectVolume.Lexi().put({
                        serviceName : self.serviceName,
                        volumeId    : self.id
                    }, {
                        description : self.description || undefined,
                        name        : self.name || undefined,
                        bootable    : self.bootable
                    }).$promise.then(function () {
                        return self;
                    }, function (error) {
                        return $q.reject({
                            error : error.data,
                            requestName : 'put'
                        });
                    })
                );
            }

            // upscale
            if (self.hasChange('size')){
                promises.push(OvhApiCloudProjectVolume.Lexi().upsize({
                        serviceName : self.serviceName,
                        volumeId    : self.id
                    }, {
                        size : parseInt(self.size, 10),
                    }).$promise.then(function (){
                        return self;
                    }, function (error) {
                        return $q.reject({
                            error : error.data,
                            requestName : 'upsize'
                        });
                    })
                );
            }

            return $q.allSettled(promises)['catch'](function (responses) {
                var tabError = responses.filter(function (val) {
                    return !!val.error;
                });
                return $q.reject({
                    errors : tabError,
                    vm : self
                });
            });
        };

        /**
         *  Enable the edition mode.
         */
        VolumeFactory.prototype.startEdition = function () {
            var self = this;
            //Edit
            if (self.getStatusGroup() === 'ACTIVE') {
                self.saveForEdition = {
                    name        : angular.copy(self.name),
                    description : angular.copy(self.description),
                    size        : angular.copy(self.size),
                    bootable    : angular.copy(self.bootable)
                };
            }
            self.openDetail = true;

        };

        /**
         *  Disable the edition mode.
         */
        VolumeFactory.prototype.stopEdition = function (cancel) {
            var self = this;
            //Edit
            if (self.saveForEdition && cancel) {
                self.name = angular.copy(self.saveForEdition.name);
                self.description = angular.copy(self.saveForEdition.description);
                self.size = angular.copy(self.saveForEdition.size);
                self.bootable = angular.copy(self.saveForEdition.bootable);
            }
            self.saveForEdition = false;
            self.openDetail = false;
        };

        /**
         * [EDIT] Item has changes ?
         */
        VolumeFactory.prototype.hasChange = function (targetSection) {
            var self = this;

            if (!self.saveForEdition) {
                return;
            }

            if (targetSection) {
                switch (targetSection) {
                case 'name':
                    return self.name !== self.saveForEdition.name;
                case 'description':
                    return self.description !== self.saveForEdition.description;
                case 'size':
                    return self.size !== self.saveForEdition.size;
                case 'bootable':
                    return self.bootable !== self.saveForEdition.bootable;
                }
            } else {
                return self.hasChange('name') ||
                       self.hasChange('description') ||
                       self.hasChange('size')||
                       self.hasChange('bootable');
            }
        };

        /**
         * Attach a volume to a vm
         */
        VolumeFactory.prototype.attach = function (vmId) {
            var self = this;
            return OvhApiCloudProjectVolume.Lexi().attach({
                serviceName : this.serviceName,
                volumeId    : this.id
            }, {
                instanceId  : vmId
            }).$promise.then(function (volOptions) {
                self.status = volOptions.status;
            });
        };

        /**
         * Detach a volume from a vm
         */
        VolumeFactory.prototype.detach = function (vmId) {
            var self = this;
            return OvhApiCloudProjectVolume.Lexi().detach({
                serviceName : this.serviceName,
                volumeId    : this.id
            }, {
                instanceId  : vmId
            }).$promise.then(function (volOptions) {
                self.status = volOptions.status;
            });
        };


        /*==========  ---  ==========*/

        /**
         *  Prepare a vm to be JSON stringified by returning only attributes.
         */
        VolumeFactory.prototype.prepareToJson = function () {
            if (this.status === 'DRAFT') {
                return {
                    id: this.id,
                    status: this.status,
                    name: this.name,
                    description: this.description || null,
                    size: this.size || null,
                    type: this.type || null,
                    region: this.region || null,
                    bootable: this.bootable || false,
                    attachedTo: this.attachedTo || []
                };
            } else {
                return {
                    id: this.id,
                    status: this.status
                };
            }
        };

        return VolumeFactory;

    }
);
