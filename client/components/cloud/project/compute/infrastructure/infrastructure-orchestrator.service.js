"use strict";
/**
 *  Cloud Infrastructure Orchestrator. Beyond it's the sun!
 *  =======================================================
 *
 *  =README=
 *  This orchestrator is used to init and manage a Cloud infrastructure.
 */
angular.module("managerApp").service("CloudProjectComputeInfrastructureOrchestrator",
    function ($q, $translate, $rootScope, $timeout, CLOUD_INSTANCE_DEFAULTS, Poller, CloudUserPref, CloudProjectComputeVolumesOrchestrator, CloudProjectComputeInfrastructureFactory, OvhApiCloudProjectInstance, OvhApiCloudProjectIp, OvhApiIp, OvhApiCloudProjectRegion, OvhApiCloudProjectFlavor, OvhApiCloudProjectImage, OvhApiCloudProjectSshKey) {

        // Warning: all values must be reset at init (see resetDatas())
        var _self = this,
            editedVm,
            monitoredVm,
            paramEdition = null;   // type enum {NAME, POWER, OS}

        var resetDatas = function () {
            // The full infra to display
            _self.infra = null;

            // Project type (existing, template, template-new)
            _self.serviceType = null;

            // Current edited VM
            editedVm = null;
            monitoredVm = null;

            // Stop polling if launched
            _self.killPollVms();
            _self.killPollIps();
        };

        /*==========================
        =            VMs           =
        ==========================*/

        /**
         *  Get the default vm configuration options
         */
        var getDefaultVmConfiguration = function () {
            return OvhApiCloudProjectRegion.Lexi().query({
                serviceName: _self.infra.serviceName
            }).$promise.then(function (regionList) {
                // check if the default region exists
                var region = CLOUD_INSTANCE_DEFAULTS.region;
                if (_.indexOf(regionList, region) === -1) {
                    region = _.first(regionList);
                }
                return getDefaultVmConfigurationForRegion(region);
            });
        };

        /**
         * Get the default vm configuration for a specified region
         */
        var getDefaultVmConfigurationForRegion = function (defaultRegion) {

            var options = {
                name : $translate.instant('cpci_vm_default_name', { index : _self.infra.vrack.getNextIndex() + 1 }),
                region : defaultRegion
            }, optionsQueue = [];

            // get the flavor id
            optionsQueue.push(
                OvhApiCloudProjectFlavor.Lexi().query({
                    serviceName : _self.infra.serviceName
                }).$promise.then(function (flavors) {
                    options.flavorId = (_.find(flavors, { region : options.region, name : CLOUD_INSTANCE_DEFAULTS.flavor }) || {}).id;
                })
            );

            // get the image id
            optionsQueue.push(
                OvhApiCloudProjectImage.Lexi().query({
                    serviceName : _self.infra.serviceName
                }).$promise.then(function (images) {
                    options.imageId = (_.find(images, { region : options.region, name : CLOUD_INSTANCE_DEFAULTS.image }) || {}).id;
                })
            );

            // get the ssh key id - the first ssh key present in given region
            // remove this if default image becomes windows type
            optionsQueue.push(
                OvhApiCloudProjectSshKey.Lexi().query({
                    serviceName : _self.infra.serviceName
                }).$promise.then(function (sshKeys) {
                    options.sshKeyId = (_.find(sshKeys, function (sshKey) {
                        return sshKey.regions.indexOf(options.region) > -1;
                    }) || {}).id;
                })
            );

            return $q.allSettled(optionsQueue).then(function () {
                if (_self.infra.vrack.publicCloud && _self.infra.vrack.publicCloud.length() > 0) {
                    // use the most recent virtual machine parameters
                    var mostRecentVm = _.last(_.sortBy(_self.infra.vrack.publicCloud.items, 'created'));
                    if (mostRecentVm) {
                        if (mostRecentVm.image) {
                            options.imageId = mostRecentVm.image.id;
                        }
                        if (mostRecentVm.flavor) {
                            options.flavorId = mostRecentVm.flavor.id;
                            options.isFlavorSuggested = true;
                        }
                        if (mostRecentVm.region) {
                            options.region = mostRecentVm.region;
                        }
                        if (mostRecentVm.sshKey) {
                            options.sshKeyId = mostRecentVm.sshKey.id;
                        }
                        options.monthlyBillingBoolean = mostRecentVm.monthlyBillingBoolean;
                    }
                }
                return options;
            }, function () {
                return options;
            });
        };

        /**
         *  Add a virtual machine into project infrastructure
         */
        this.addNewVmToList = function (vmOptions) {
            var vm;

            return $q.when(true).then(function () {
                if (!vmOptions) {
                    return getDefaultVmConfiguration();
                } else {
                    return vmOptions;
                }
            }).then(function (options) {
                // Add Draft VM to list
                vm = _self.infra.vrack.addVmToPublicCloudList(options);
                vm.status = 'DRAFT';
                _self.saveToUserPref();
                return vm;
            });
        };

        /**
         *  Launch the vm creation.
         */
        this.saveNewVm = function (vm) {
            var oldId = vm.id;
            return vm.launchCreation().then(function () {
                // we must do it because old id is a fake one
                _self.infra.vrack.publicCloud.replaceItem(oldId, vm);
                _self.saveToUserPref();
                _self.pollVms(); // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         * Launch vm creation, creating multiple copies.
         */
        this.saveMultipleNewVms = function (vmBase, count) {
            return OvhApiCloudProjectInstance.Lexi().bulk({
                serviceName    : _self.infra.serviceName
            }, {
                flavorId       : vmBase.flavor.id,
                imageId        : vmBase.image.id,
                name           : vmBase.name,
                region         : vmBase.region,
                sshKeyId       : vmBase.sshKey ? vmBase.sshKey.id : undefined,
                monthlyBilling : vmBase.monthlyBillingBoolean,
                userData       : vmBase.userData ? vmBase.userData : undefined,
                number         : count,
                networks: vmBase.networks
            }).$promise.then(function (vms) {
                _self.infra.vrack.publicCloud.removeItem(vmBase.id); // remove draft vm
                _self.pollVms(); // updates vm list
                return vms;
            });
        };

        /**
         *  Set the virtual machine that is currently in edition
         */
        this.turnOnVmEdition = function (vm) {
            editedVm = vm;
            editedVm.startEdition();
        };

        /**
         *  Close/Reset the virtual machine that is currently in edition
         */
        this.turnOffVmEdition = function (reset, vmWithChanges) {
            editedVm.stopEdition(!!reset, vmWithChanges);
            editedVm = null;
        };

        /**
         *  Open monitoring panel
         */
        this.openMonitoringPanel = function (vm) {
            monitoredVm = vm;
            vm.startMonitoring();
        };

        this.getMonitoredVm = function() {
            return monitoredVm;
        };

        /**
         *  Get the virtual machine that is currently in edition
         */
        this.getEditedVm = function () {
            return editedVm;
        };

        /**
         *  Get parameters for current edition
         */
        this.getEditVmParam = function () {
            return paramEdition;
        };

        /**
         *  Get parameters for current edition
         */
        this.setEditVmParam = function (param) {
            paramEdition = param;
        };

        /**
         *  Save the VM modifications
         */
        this.saveEditedVm = function (vm) {
            return vm.edit().then(function () {
                _self.saveToUserPref();
                _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Delete VM
         */
        this.deleteVm = function (vm) {
            if (vm.status === 'DRAFT') {
                return $q.when(true).then(function () {
                    _self.infra.vrack.removeVmFromPublicCloudList(vm);
                    _self.refreshLinks();
                    _self.saveToUserPref();
                });
            } else {
                return vm.remove().then(function () {
                    _self.saveToUserPref();
                    _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
                });
            }
        };

        /**
         *  Rescue VM
         */
        this.rescueVm = function (vm, enable, image) {
            return vm.rescueMode(enable, image).then(function (result) {
                _self.pollVms();
                return result;
            });
        };

        /**
         *  Reboot [soft|hard] VM
         */
        this.rebootVm = function (vm, type) {
            return vm.reboot(type).then(function () {
                _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Resume VM
         */
        this.resumeVm = function (vm) {
            return vm.resume().then(function () {
                _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Reinstall VM
         */
        this.reinstallVm = function (vm) {
            return vm.reinstall().then(function () {
                _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Create a new snapshot of VM
         */
        this.backupVm = function (vm, snapshotName) {
            return vm.backup(snapshotName).then(function () {
                _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
            });
        };

        /**
         *  Collapse all vm
         */
        this.collapseAllVm = function () {
            this.infra.vrack.collapseAll();
            this.saveToUserPref();      // ------ TODO: dangerous, this do an ASYNC call
        };

        /**
         *  Uncollapse all vm
         */
        this.uncollapseAllVm = function () {
            this.infra.vrack.uncollapseAll();
            this.saveToUserPref();      // ------ TODO: dangerous, this do an ASYNC call
        };

        /**
         *  Toggle the collapsed state of given vm and save to userPref
         */
        this.toggleVmCollapsedState = function (vm) {
            vm.collapsed = !vm.collapsed;
            this.saveToUserPref();      // ------ TODO: dangerous, this do an ASYNC call
            return $q.when(vm);
        };

        /**
         *  Toggle the collapsed state of given vm and save to userPref
         */
        this.toggleCollapsedVolumes = function (vm) {
            vm.collapsedVolumes = !vm.collapsedVolumes;
            this.saveToUserPref();      // ------ TODO: dangerous, this do an ASYNC call
            return $q.when(vm);
        };

        this.loadVmMonitoringData = function() {
            _.each(this.infra.vrack.publicCloud.items, function (instance) {
                instance.getMonitoringData();
            });
        };

        /*-----  End of VMs  ------*/

        /*==========================
         =         VLANs           =
         ==========================*/

        this.hasVrack = function () {
            return this.infra.vlan.hasVrack();
        };

        /*==========================
        =            IP            =
        ==========================*/

        /**
         * Attach an IP to a VM
         */
        this.attachIptoVm = function (ip, vm) {
            if (ip.status === 'DRAFT') {
                // @todo
                return $q.when('TODO').then(function () {
                    _self.saveToUserPref();
                });
            } else {
                return ip.attach(vm.id).then(function () {
                    switch (ip.type) {
                    case 'failover':
                        _self.pollIps(ip.type);    // WARNING: Never return promise because pulling had to live on her side
                        break;
                    }
                    // @todo: other types
                });
            }
        };

        /**
         *  Get list of IPs Public (from the list of VMs)
         */
        function getPublicIpAddressesFromInstances (vms) {
            var publicIpAddresses = [];
            angular.forEach(vms, function (vm) {
                rearrangeIpv6(vm);

                angular.forEach(_.filter(vm.ipAddresses, { type: 'public' }), function (publicIpAddress) {
                    publicIpAddress.id = publicIpAddress.ip;
                    publicIpAddress.routedTo = vm.id;
                    publicIpAddresses.push(publicIpAddress);
                });
            });
            return publicIpAddresses;
        }

        /**
         *  Make the links between VMs and IPs
         */
        this.refreshLinks = function () {
            angular.forEach(_self.infra.internet.ipList.items, function (ip) {
                _self.infra.refreshVmsRoutedToFromIp(ip);
            });
            $rootScope.$broadcast('infra.refresh.links');
        };

        /*-----  End of IPs  ------*/


        /*===============================
        =            POLLING            =
        ===============================*/

        /**
         *  --- [VMs] --- POLLING ---
         *
         *  Poll VM query
         */
        this.pollVms = function () {
            var continueStatus = [
                "DELETING",
                "BUILDING",
                "HARD_REBOOT",
                "REBOOT",
                "REBUILD",
                "REVERT_RESIZE",
                "VERIFY_RESIZE",
                "MIGRATING",
                "RESIZE",
                "BUILD",
                "RESCUING",
                "UNRESCUING",
                "RESCUE",
                "SNAPSHOTTING",
                "RESUMING"
            ];

            Poller.poll('/cloud/project/' + _self.infra.serviceName + '/instance',
                null,
                {
                    successRule: function (vm) {
                        return (!vm.monthlyBilling || (vm.monthlyBilling && vm.monthlyBilling.status !== 'activationPending')) &&
                            (_.every(continueStatus, function (continueState) {
                                return vm.status !== continueState;
                            })
                        );
                    },
                    namespace: 'cloud.infra.vms',
                    notifyOnError : false
                }
            ).then(function (vms) {
                updateInstancesFromPolling(vms);
            }, function (err) {
                if (err && err.status) {
                    console.warn('pollVms', err);
                    // @todo add bugkiller here
                }
            }, function (vms) {
                updateInstancesFromPolling(vms);
            });
        };

        /**
         *  --- [VMs] --- POLLING KILL ---
         *
         *  Kill the Poll VM query
         */
        this.killPollVms = function () {
            Poller.kill({namespace: 'cloud.infra.vms'});
        };

        /**
         *  Triggered by polling: Update instances list
         *
         *  /!\ take care to don't update all datas, user can be in edition for example.
         */
        function updateInstancesFromPolling (instances) {

            var haveChanges = false;

            // Update existing VMs
            haveChanges = updateInstancesWithInstancesFromApi(instances, true) || haveChanges;
            // Add new VMs, and delete removed VMs
            haveChanges = addOrDeleteInstancesWithInstancesFromApi(instances) || haveChanges;

            // Public IPs are into the instance infos, so we need to took them
            var publicIpAddresses = getPublicIpAddressesFromInstances(instances);
            updateIpsWithIpsFromApi(publicIpAddresses, 'public');
            addOrDeleteIpsWithIpsFromApi(publicIpAddresses, 'public');

            _self.refreshLinks();

            if (haveChanges)  {
                _self.saveToUserPref();
                CloudProjectComputeVolumesOrchestrator.pollVolumes();    // [async]
            }
            return $q.when(instances);
        }

        // ---

        /**
         *  --- [IPs] --- POLLING ---
         *
         *  Poll IPs list
         *  [ip] : the type of the IPs
         */
        this.pollIps = function (type) {

            return Poller.poll('/cloud/project/' + _self.infra.serviceName + '/ip/' + type,
                null,
                {
                    successRule: function (ip) {
                        return ip.status === 'ok';
                    },
                    namespace: 'cloud.infra.ips'
                }
            ).then(function (ips) {
                updateIpsFromPolling(ips, type);
            }, function (err) {
                if (err && err.status) {
                    console.warn('pollIps', err);
                    // @todo add bugkiller here
                }
            }, function (ips) {
                updateIpsFromPolling(ips, type);
            });
        };

        /**
         *  --- [IPs] --- POLLING KILL ---
         *
         *  Kill the Poll IPs query
         */
        this.killPollIps = function () {
            Poller.kill({namespace: 'cloud.infra.ips'});
        };

        /**
         *  Triggered by polling: Update IPs list
         *
         *  /!\ take care to don't update all datas, user can be in edition for example.
         */
        function updateIpsFromPolling (ips, type) {
            var haveChanges = false;

            // Update existing IPs
            haveChanges = updateIpsWithIpsFromApi(ips, type) || haveChanges;
            // Add new IPs, and delete removed IPs
            haveChanges = addOrDeleteIpsWithIpsFromApi(ips, type) || haveChanges;

            _self.refreshLinks();

            if (haveChanges) {
                _self.saveToUserPref();
            }
            return $q.when(ips);
        }

        /*-----  End of Polling  ------*/


        /*====================================
        =            UserPref            =
        ====================================*/

        this.saveToUserPref = function () {
            return CloudUserPref.set("cloud_project_" + _self.infra.serviceName + "_infra",
                                  _self.infra.prepareToJson());
        };

        this.createFromUserPref = function (serviceName) {
            var key = "cloud_project_" + serviceName + "_infra";
            return CloudUserPref.get(key).then(function (infra) {
                infra.serviceName = serviceName;
                return new CloudProjectComputeInfrastructureFactory(infra);
            }, function () {
                return new CloudProjectComputeInfrastructureFactory({
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
         *  --- [VMs] --- [addOrDelete] ---
         *
         *  Add or remove instances from API with instances from this factory
         *  /!\ This can't update existing datas!!!
         */
        function addOrDeleteInstancesWithInstancesFromApi (instancesFromApi, forceRemoveDrafts) {

            /*==========  Remove deleted instances  ==========*/

            var deletedInstances = _.filter(_self.infra.vrack.publicCloud.items, function (vm) {
                // don't remove drafts!
                if (!forceRemoveDrafts && vm.status === 'DRAFT') {
                    return false;
                }
                var instance = _.find(instancesFromApi, { id : vm.id });
                return !instance || instance.status === 'DELETED';
            });

            angular.forEach(deletedInstances, function (vm) {
                _self.infra.vrack.removeVmFromPublicCloudList(vm);
            });

            /*==========  Add new instances  ==========*/

            var addedInstances = _.filter(instancesFromApi, function (vm) {
                return vm.status !== 'DELETED' && !_self.infra.vrack.getVmById(vm.id);
            });
            angular.forEach(addedInstances, function (vm) {
                _self.infra.vrack.addVmToPublicCloudList(vm);
            });

            // return true if updated
            return !!(deletedInstances.length || addedInstances.length);
        }

        /**
         *  --- [VMs] --- [update] ---
         *
         * Updates instances from API with instances from this factory
         *  /!\ This don't add or remove instances!
         */
        function updateInstancesWithInstancesFromApi (instancesFromApi, updateOnlySpecificDatas) {
            var haveChanges = false;

            angular.forEach(instancesFromApi, function (instanceFromApi) {
                var instanceFromFactory = _self.infra.vrack.getVmById(instanceFromApi.id),
                    currentEditedVm = _self.getEditedVm();

                if (!instanceFromFactory) {
                    return;
                }

                if (updateOnlySpecificDatas) {

                    // Update status
                    if (instanceFromFactory.status !== instanceFromApi.status) {
                        let oldStatus = instanceFromFactory.status;
                        var hardRebootingSuspended = instanceFromFactory.status === "HARD_REBOOT" && instanceFromApi.status === "SUSPENDED";
                        // if hard rebooting a suspended project the API do not update the status correctly
                        // this bug is not easilly fixable for the API so we fix it on UX side
                        if (!hardRebootingSuspended) {
                            haveChanges = true;
                            instanceFromFactory.status = instanceFromApi.status;
                            $rootScope.$broadcast('compute.infrastructure.vm.status-update', instanceFromApi.status, oldStatus, instanceFromFactory);
                        }
                    }

                    // Update this datas ONLY if vm is not in edition
                    if (!currentEditedVm || currentEditedVm && currentEditedVm.id && currentEditedVm.id !== instanceFromApi.id) {
                        // Update image reinstall
                        if (instanceFromApi.imageId && instanceFromFactory.image && instanceFromFactory.image.id && instanceFromApi.imageId !== instanceFromFactory.image.id) {
                            instanceFromFactory.imageId = instanceFromApi.imageId;
                            instanceFromFactory.getFullInformations();
                            haveChanges = true;
                        }

                        // Update flavor upscaling
                        if (instanceFromApi.flavorId && instanceFromFactory.flavor && instanceFromFactory.flavor.id && instanceFromApi.flavorId !== instanceFromFactory.flavor.id) {
                            instanceFromFactory.flavorId = instanceFromApi.flavorId;
                            instanceFromFactory.getFullInformations();
                            haveChanges = true;
                        }
                    }

                    // Update ipAddresses array
                    if (instanceFromApi.ipAddresses && instanceFromApi.ipAddresses.length && (!instanceFromFactory.ipAddresses || (instanceFromFactory.ipAddresses.length !== instanceFromApi.ipAddresses.length))) {
                        instanceFromFactory.ipAddresses = instanceFromApi.ipAddresses;
                        haveChanges = true;
                    }

                    // Update monthlyBilling
                    if (!instanceFromFactory.monthlyBilling && instanceFromApi.monthlyBilling) {
                        haveChanges = true;
                        instanceFromFactory.monthlyBilling = angular.copy(instanceFromApi.monthlyBilling);
                    }

                    // Update monthlyBilling status
                    if (instanceFromFactory.monthlyBilling && instanceFromApi.monthlyBilling && instanceFromFactory.monthlyBilling.status !== instanceFromApi.monthlyBilling.status) {
                        haveChanges = true;
                        let oldStatus = instanceFromFactory.monthlyBilling.status;
                        instanceFromFactory.monthlyBilling.status = instanceFromApi.monthlyBilling.status;
                        $rootScope.$broadcast('compute.infrastructure.vm.monthlyBilling.status-update', instanceFromApi.status, oldStatus, instanceFromFactory);
                    }
                } else {
                    // Updates all infos
                    instanceFromFactory.setInfos(instanceFromApi);
                    haveChanges = true;
                }
            });

            return haveChanges;
        }


        /**
         *  --- [IPs] --- [addOrDelete] ---
         *
         *  Add or remove IPs from API with IPs from this factory
         *  /!\ This can't update existing datas!!!
         */
        function addOrDeleteIpsWithIpsFromApi (ipsFromApi, type, forceRemoveDrafts) {

            /*==========  Remove deleted IPs  ==========*/

            var deletedIps = _.filter(_self.infra.internet.ipList.items, function (ip) {
                // don't remove drafts!
                if (ip.type !== type || (!forceRemoveDrafts && ip.status === 'DRAFT')) {
                    return false;
                }
                return !_.find(ipsFromApi, { id : ip.id });
            });

            angular.forEach(deletedIps, function (ip) {
                _self.infra.internet.removeIpFromList(ip);
            });

            /*==========  Add new IPs  ==========*/

            var addedIps = _.filter(ipsFromApi, function (ip) {
                return !_self.infra.internet.getIpById(ip.id);
            });
            angular.forEach(addedIps, function (ip) {
                ip.type = type;
                ip = _self.infra.internet.addIpToList(ip);
            });

            // return true if updated
            return !!(deletedIps.length || addedIps.length);
        }

        /**
         *  --- [IPs] --- [update] ---
         *
         * Updates instances from API with instances from this factory
         *  /!\ This don't add or remove instances!
         */
        function updateIpsWithIpsFromApi (ipsFromApi) {
            angular.forEach(ipsFromApi, function (ipFromApi) {
                var ipFromFactory = _self.infra.internet.getIpById(ipFromApi.id);
                if (!ipFromFactory) {
                    return;
                }
                ipFromFactory.setInfos(ipFromApi);
            });
        }

        /*-----  End of LOCAL DATAS UPGRADE  ------*/

        /**
         * Initialize an infrastructure
         */
        function initExistingProject (opts) {
            return _self.createFromUserPref(opts.serviceName).then(function (infraFromUserPref) {

                var initQueue = [];

                _self.infra = infraFromUserPref;

                /*==========  VMs  ==========*/

                initQueue.push(
                    OvhApiCloudProjectInstance.Lexi().query({
                        serviceName : _self.infra.serviceName
                    }).$promise.then(function (instances) {
                        _.forEach(instances, function (instance) {
                            rearrangeIpv6(instance);
                        });

                        // Merge with local datas
                        updateInstancesWithInstancesFromApi(instances);
                        addOrDeleteInstancesWithInstancesFromApi(instances, true);

                        // Public IPs are into the instance infos, so we need to took them
                        var publicIpAddresses = getPublicIpAddressesFromInstances(instances);
                        updateIpsWithIpsFromApi(publicIpAddresses, 'public');
                        addOrDeleteIpsWithIpsFromApi(publicIpAddresses, 'public', true);
                    })
                );

                /*==========  IPs  ==========*/

                var ipTypes = ['failover'];
                angular.forEach(ipTypes, function (ipType) {
                    initQueue.push(
                        OvhApiCloudProjectIp[ipType].Lexi().query({
                            serviceName : _self.infra.serviceName
                        }).$promise.then(function (ips) {
                            angular.forEach(ips, function (ip) {
                                ip.type = ipType;
                            });
                            return ips;
                        }).then(function (ips) {
                            // Merge with local datas
                            updateIpsWithIpsFromApi(ips, ipType);
                            addOrDeleteIpsWithIpsFromApi(ips, ipType, true);
                        })
                    );
                });

                return $q.all(initQueue).then(function () {
                    _self.refreshLinks();
                    _self.pollVms();    // WARNING: Never return promise because pulling had to live on her side
                    _self.pollIps('failover');    // WARNING: Never return promise because pulling had to live on her side
                    return _self.infra;
                });
            });
        }

        function rearrangeIpv6 (instance) {
            var publicIpV4Index = _.findIndex(instance.ipAddresses, { version: 4, type: "public" });
            var publicIpV6Index = _.findIndex(instance.ipAddresses, { version: 6, type: "public" });

            if (publicIpV4Index !== -1 && publicIpV6Index !== -1) {
                instance.ipAddresses[publicIpV4Index].ipV6 = { ip: instance.ipAddresses[publicIpV6Index].ip, gateway: instance.ipAddresses[publicIpV6Index].gatewayIp };
                instance.ipAddresses.splice(publicIpV6Index, 1);
            }
        }

        /**
         *  Initialize a new Infrastructure
         */
        this.init = function (opts) {
            resetDatas();
            return initExistingProject(opts);
        };
    }
);
