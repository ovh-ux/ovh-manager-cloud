angular.module("managerApp").factory('CloudProjectComputeInfraVrackVmFactory',
    function ($q, OvhApiCloudProjectInstance, OvhApiCloudProjectFlavor, OvhApiCloudProjectImage, OvhCloudPriceHelper, OvhApiCloudProjectSnapshot,
              OvhApiCloudProjectSshKey, CLOUD_VM_STATE, CLOUD_MONITORING, CLOUD_UNIT_CONVERSION) {

        'use strict';

        /**
         *  Defines a cloud project compute infrastructure vm
         *
         *  /!\ Take care when modifying this!!! Check setInfos, and prepareToJson too.
         */
        var VirtualMachineFactory = (function () {

            return function CloudProjectComputeInfraVrackVmFactory (options) {

                if (!options) {
                    options = {};
                }

                // Set custom values
                options = this.getCustomOptions(options);

                // Extend and set default values
                angular.extend(this, angular.extend({
                    id        : Math.floor(Math.random() * 1000 * new Date().getTime()),
                    status    : '',
                    created   : new Date().toISOString(),
                    collapsed : false
                }, options));

                // Updating flavorId, imageId, or sshKeyId, ...
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
        VirtualMachineFactory.prototype.getCustomOptions = function (options) {
            return angular.extend(options, {
                routedTo              : options.routedTo ? _.flatten([options.routedTo]) : [],    // Ensure routedTo is always an array
                monthlyBillingBoolean : !!options.monthlyBilling                                  // Set monthlyBillingBoolean
            });
        };

        /**
         *  Set infos after initialization
         */
        VirtualMachineFactory.prototype.setInfos = function (options) {

            // Set custom values
            options = this.getCustomOptions(options || {});

            // Ok now extend it
            angular.extend(this, options);

            // Updating flavorId, imageId, or sshKeyId, ...
            return this.getFullInformations();
        };

        /**
         *  [API] Get the virtual machine from API using its id
         */
        VirtualMachineFactory.prototype.get = function () {
            var self = this;

            return OvhApiCloudProjectInstance.Lexi().get({
                serviceName : this.serviceName,
                instanceId : this.id
            }).$promise.then(function (vmOptions) {
                return self.setInfos(vmOptions);
            });
        };

        /**
         *  [API] Get additional informations
         */
         VirtualMachineFactory.prototype.updatePrice = function () {
             var self = this;
             return OvhCloudPriceHelper.getPrices(self.serviceName).then(function (prices) {
                 self.price = prices[self.planCode];
                 // Set 3 digits for hourly price
                 if (!self.monthlyBillingBoolean) {
                     self.price.price.text = self.price.price.text.replace(/\d+(?:[.,]\d+)?/, "" + self.price.price.value.toFixed(3));
                 }
             })
         };

        VirtualMachineFactory.prototype.getFullInformations = function () {
            var queue = [],
                self = this;

            // image
            var image = this.imageId  || (this.image && this.image.id);
            if (image) {
                queue.push(
                    OvhApiCloudProjectImage.Lexi().query({
                        serviceName : this.serviceName
                    }).$promise.then(function (images) {
                        self.image = _.find(images, { id: image });

                        // so it's a snapshot
                        if (!self.image) {
                            return OvhApiCloudProjectSnapshot.Lexi().query({
                                serviceName : self.serviceName
                            }).$promise.then(function (snapshots) {
                                self.image = _.find(snapshots, { id: image });

                                // so maybe image is not in list
                                if (!self.image) {
                                    return OvhApiCloudProjectImage.Lexi().get({
                                        serviceName : self.serviceName,
                                        imageId : image
                                    }).$promise.then(function (img) {
                                        self.image = img;
                                    });
                                }
                            });
                        }
                    })
                );
            }

            // flavor + price
            var flavorId = this.flavorId  || (this.flavor && this.flavor.id);
            if (flavorId) {
                queue.push(
                    OvhApiCloudProjectFlavor.Lexi().query({
                        serviceName : this.serviceName
                    }).$promise.then(function (flavorsList) {
                        self.flavor = _.find(flavorsList, { id: flavorId });

                        // if not in the list: it's a deprecated flavor: directly get it!
                        if (!self.flavor) {
                            return OvhApiCloudProjectFlavor.Lexi().get({
                                serviceName : self.serviceName,
                                flavorId    : flavorId
                            }).$promise.then(function (flavorDeprecated) {
                                flavorDeprecated.deprecated = true;
                                self.flavor = flavorDeprecated;
                            });
                        }
                    })
                );
            }
            queue.push(self.updatePrice());

            // if sshKeyId
            if (this.sshKeyId) {
                queue.push(OvhApiCloudProjectSshKey.Lexi().query({
                    serviceName : this.serviceName
                }).$promise.then(function (sshKeys) {
                    self.sshKey = _.find(sshKeys, { id: self.sshKeyId });
                }));
            }

            return $q.all(queue).then(function () {
                delete self.imageId;
                delete self.flavorId;
                delete self.sshKeyId;
            });
        };


        /**
         *   Get type of status.
         */
        VirtualMachineFactory.prototype.getStatusGroup = function () {
            if (~CLOUD_VM_STATE.pending.indexOf(this.status)) {
                return 'PENDING';
            } else if (~CLOUD_VM_STATE.openstack.indexOf(this.status)) {
                return 'OPENSTACK';
            } else if (~CLOUD_VM_STATE.error.indexOf(this.status)) {
                return 'ERROR';
            } else {
                return this.status;
            }
        };


        /**
         *  Get ip flagged with private type
         */
        VirtualMachineFactory.prototype.getPrivateIp = function () {
            return _.find(this.ipAddresses, function (ip) {
                return ip.type === "private";
            });
        };

        VirtualMachineFactory.prototype.getPublicIpv4 = function () {
            return _.get(_.find(this.ipAddresses, function (ip) {
                return ip.type === "public" && ip.version === 4;
            }), "ip", "");
        };

        VirtualMachineFactory.prototype.getPublicIpv6 = function () {
            return _.get(_.find(this.ipAddresses, function (ip) {
                return ip.type === "public" && ip.version === 6;
            }), "ip", _.get(this.ipAddresses[0], "ipV6.ip", ""));
        };

        /**
         *  [API] Launch the virtual machine. POST informations for creating an instance to API
         */
        VirtualMachineFactory.prototype.launchCreation = function () {
            var self = this;

            return OvhApiCloudProjectInstance.Lexi().save({
                serviceName    : this.serviceName
            }, {
                flavorId       : this.flavor.id,
                imageId        : this.image.id,
                name           : this.name,
                region         : this.region,
                sshKeyId       : this.sshKey ? this.sshKey.id : undefined,
                monthlyBilling : this.monthlyBillingBoolean,
                userData       : this.userData,
                networks: this.networks
            }).$promise.then(function (vmOptions) {
                self.id = vmOptions.id;             // WARNING: don't forget tu replaceItem with orderedHash!
                self.status = vmOptions.status;
                self.planCode = vmOptions.planCode;
                self.updatePrice();
                return self;
            });
        };

        /**
         *  [API] Delete a virtual machine.
         */
        VirtualMachineFactory.prototype.remove = function () {
            var self = this;

            return OvhApiCloudProjectInstance.Lexi().remove({
                serviceName : this.serviceName,
                instanceId : this.id
            }).$promise.then(function () {
                self.status = 'DELETING';
                return self;
            });
        };

        /**
         *  [API] Edit the VM (name)
         */
        VirtualMachineFactory.prototype.edit = function () {
            var self = this,
                promises = [];

            if (self.hasChange('name')){
                promises.push(OvhApiCloudProjectInstance.Lexi().put({
                        serviceName  : self.serviceName,
                        instanceId   : self.id
                    }, {
                        instanceName : self.name
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

            if (self.hasChange('monthlyBilling')) {
                promises.push(OvhApiCloudProjectInstance.Lexi().activeMonthlyBilling({
                        serviceName  : self.serviceName,
                        instanceId   : self.id
                    }).$promise.then(function (vmOptions) {
                        self.monthlyBilling = vmOptions.monthlyBilling;
                        return self;
                    }, function (error) {
                        return $q.reject({
                            error       : error.data,
                            requestName : 'activeMonthlyBilling'
                        });
                    })
                );
            }

            // Resize
            if (self.hasChange('flavors')) {
                promises.push(OvhApiCloudProjectInstance.Lexi().resize({
                        serviceName  : self.serviceName,
                        instanceId   : self.id
                    }, {
                        flavorId     : self.flavor.id
                    }).$promise.then(function (vmOptions) {
                        self.status = vmOptions.status;
                        return self.getFullInformations();              // @todo
                    }, function (error) {
                        return $q.reject({
                            error       : error.data,
                            requestName : 'resize'
                        });
                    })
                );
            }

            // Reinstall
            if (self.hasChange('images')) {
                promises.push(self.reinstall());
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
         * Init saveForEdition attribute.
         */
        VirtualMachineFactory.prototype.initEdition = function () {
            var self = this;
            self.saveForEdition = {
                name                  : angular.copy(self.name),
                monthlyBillingBoolean : angular.copy(self.monthlyBillingBoolean),
                image                 : angular.copy(self.image),
                flavor                : angular.copy(self.flavor)
            };
        };

        /**
         *  Enable the edition mode.
         */
        VirtualMachineFactory.prototype.startEdition = function () {
            var self = this;
            //Edit
            if (self.status === 'ACTIVE') {
                self.openMonitoring = false;
                self.initEdition();
            }
            self.openMonitoring = false;
            self.openDetail = true;
        };

        /**
         *  Disable the edition mode.
         */
        VirtualMachineFactory.prototype.stopEdition = function (cancel, vmWithChanges) {
            var self = this;

            if (!cancel && vmWithChanges) {
                self.name = vmWithChanges.name;
                self.monthlyBillingBoolean = vmWithChanges.monthlyBillingBoolean;
                self.image = vmWithChanges.image;
                self.flavor = vmWithChanges.flavor;
            }
            self.saveForEdition = false;
            self.openDetail = false;
        };

        /**
         *  Enable the monitoring mode.
         */
        VirtualMachineFactory.prototype.startMonitoring = function () {
            this.openMonitoring = true;
            this.openDetail = false;
        };

        /**
         *  Disable the monitoring mode.
         */
        VirtualMachineFactory.prototype.stopMonitoring = function () {
            this.openMonitoring = false;
        };

        /**
         * [EDIT] Item has changes ?
         */
        VirtualMachineFactory.prototype.hasChange = function (targetSection) {
            var self = this;

            if (!self.saveForEdition) {
                return;
            }

            if (targetSection) {
                switch (targetSection) {
                case 'name':
                    return self.name !== self.saveForEdition.name;
                case 'flavors':
                    return self.flavor ? (!self.saveForEdition.flavor || self.flavor.id !== self.saveForEdition.flavor.id) : false;
                case 'images':
                    return self.image ? (!self.saveForEdition.image || self.image.id !== self.saveForEdition.image.id) : false;
                case 'monthlyBilling':
                    return !!self.monthlyBilling !== self.monthlyBillingBoolean;
                }
            } else {
                return self.hasChange('name') ||
                    self.hasChange('flavors') ||
                    self.hasChange('images') ||
                    self.hasChange('monthlyBilling');
            }
        };


        /*==========  Additionals actions  ==========*/

        /**
         *  [API] Reinstall a vm.
         */
        VirtualMachineFactory.prototype.reinstall = function (imageId) {
            var self = this;
            return OvhApiCloudProjectInstance.Lexi().reinstall({
                serviceName : self.serviceName,
                instanceId  : self.id
            }, {
                imageId     : imageId || self.image.id
            }).$promise.then(function (vmOptions) {
                self.status = vmOptions.status;
                return self.getFullInformations();              // @todo
            }, function (error) {
                return $q.reject({
                    error       : error.data,
                    requestName : 'reinstall'
                });
            });
        };

        /**
         *  [API] Rescue a virtual machine.
         */
        VirtualMachineFactory.prototype.rescueMode = function (enable, image) {
            var self = this;
            this.status = enable ? "RESCUING" : "UNRESCUING";
            return OvhApiCloudProjectInstance.Lexi().rescueMode({
                serviceName: self.serviceName,
                instanceId : self.id,
                imageId    : image ? image.id : undefined,
                rescue     : enable
            }).$promise;
        };

        /**
         *  [API] Reboot [soft|hard] a virtual machine.
         */
        VirtualMachineFactory.prototype.reboot = function (type) {
            var self = this;
            return OvhApiCloudProjectInstance.Lexi().reboot({
                serviceName : this.serviceName,
                instanceId : this.id
            }, {
                type : type || 'soft'
            }).$promise.then(function () {
                self.status = type === 'hard' ? 'HARD_REBOOT' : 'REBOOT';
                return self;
            });
        };

        /**
         *  [API] Resume a virtual machine.
         */
        VirtualMachineFactory.prototype.resume = function () {
            return OvhApiCloudProjectInstance.Lexi().resume({
                serviceName : this.serviceName,
                instanceId : this.id
            }).$promise;
        };

        /**
         *  [API] Create snapshot.
         */
        VirtualMachineFactory.prototype.backup = function (snapshotName) {
            var self = this;
            return OvhApiCloudProjectInstance.Lexi().backup({
                serviceName : this.serviceName,
                instanceId : this.id
            }, {
                snapshotName : snapshotName
            }).$promise.then(function (result) {
                self.status = "SNAPSHOTTING";
                return result;
            });
        };

        /*==========  ---  ==========*/

        /**
         *  Prepare a vm to be JSON stringified by returning only attributes.
         */
        VirtualMachineFactory.prototype.prepareToJson = function () {
            if (this.status === 'DRAFT') {
                return {
                    id          : this.id,
                    status      : this.status,
                    name        : this.name,
                    collapsed   : this.collapsed,
                    collapsedVolumes : this.collapsedVolumes,
                    flavorId    : this.flavorId || (this.flavor ? this.flavor.id : null),
                    imageId     : this.imageId || (this.image ? this.image.id : null),
                    region      : this.region || null,
                    routedTo    : this.routedTo || [],
                    userData    : this.userData
                };
            } else {
                return {
                    id        : this.id,
                    status    : this.status,
                    collapsed : this.collapsed,
                    collapsedVolumes : this.collapsedVolumes
                };
            }
        };

        VirtualMachineFactory.prototype.generateMonitoringInference = function() {
            var self = this;
            if (self.monitoringData && self.monitoringData.raw) {
                var rawData = this.monitoringData.raw;

                // ----- CPU -----
                if (rawData["cpu:used"] && !_.isEmpty(rawData["cpu:used"].values)) {
                    var maxPeriod = _.max(rawData["cpu:used"].values, function (v) {
                        return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
                    });
                    this.monitoringData.cpu = {
                        now : _.last(rawData["cpu:used"].values),                                     // current CPU usage
                        needUpgrade : maxPeriod.value >= CLOUD_MONITORING.vm.upgradeAlertThreshold,   // does CPU reach alerting threshold over period?
                        maxPeriod : maxPeriod                                                         // max CPU usage over given period
                    };
                }

                // ----- RAM -----
                if (rawData["mem:used"] && rawData["mem:max"] && !_.isEmpty(rawData["mem:used"].values) && !_.isEmpty(rawData["mem:max"].values)) {
                    var memTotal = _.first(rawData["mem:max"].values);
                    var maxPeriod = null;
                    if (memTotal && memTotal.value > 0) {
                        maxPeriod = _.max(rawData["mem:used"].values, function (v) {
                            return angular.isNumber(v.value) ? v.value : Number.NEGATIVE_INFINITY;
                        });
                    }
                    this.monitoringData.mem = {
                        now : _.last(rawData["mem:used"].values),                  // current RAM usage
                        total : memTotal,                                          // total RAM available
                        needUpgrade : maxPeriod.value / memTotal.value * 100.0 >= CLOUD_MONITORING.vm.upgradeAlertThreshold,  // does RAM reach alerting threshold over period ?
                        maxPeriod : maxPeriod,                                     // max RAM usage over given period
                        unit : rawData["mem:used"].unit                            // RAM units (MB GB ...)
                    };
                    if (this.monitoringData.mem.now && memTotal) {
                        // current RAM usage in percent
                        this.monitoringData.mem.nowPercent = this.monitoringData.mem.now.value / memTotal.value;
                    }
                }
            }
        };

        /**
         *  Get vm monitoring informations
         */
        VirtualMachineFactory.prototype.getMonitoringData = function () {
            var self = this;
            var promiseToExecute = [];

            if (!self.monitoringData) {
                self.monitoringData = {
                    raw : {},
                    cpu : {
                        needUpgrade : false
                    },
                    mem : {
                        needUpgrade : false
                    },
                    loading : true
                };
            }

            CLOUD_MONITORING.vm.type.forEach(function (type) {
                promiseToExecute.push(
                    OvhApiCloudProjectInstance.Lexi().monitoring({
                        serviceName : self.serviceName,
                        instanceId  : self.id,
                        period      : CLOUD_MONITORING.vm.period,
                        type        : type
                    }).$promise.then(function (data) {
                        self.monitoringData.raw[type] = data;
                        return data;
                    })
                );
            });

            return $q.allSettled(promiseToExecute)["finally"](function () {
                self.generateMonitoringInference();
                self.monitoringData.loading = false;
            });
        };

        return VirtualMachineFactory;
    }
);
