"use strict";

angular.module("managerApp").controller("CloudProjectComputeInfrastructureDiagramCtrl",
    function ($rootScope, $scope, $q, $translate, $timeout, CloudMessage, $uibModal, $stateParams, $state, Poller, CloudUserPref, OvhApiCloudProject,
              CloudProjectOrchestrator, CloudProjectComputeInfrastructureOrchestrator, jsPlumbService, OvhApiIp, OvhApiCloud, OvhApiCloudProjectRegion, OvhApiCloudProjectImage,
              OvhApiCloudProjectSnapshot, OvhApiCloudProjectFlavor, OvhApiCloudProjectSshKey, OvhApiCloudPrice, CloudProjectComputeVolumesOrchestrator, OvhApiMe,
              OvhApiCloudProjectServiceInfos, REDIRECT_URLS, URLS, CLOUD_GEOLOCALISATION, $window, CLOUD_UNIT_CONVERSION,
              OvhApiCloudProjectVolumeSnapshot, CLOUD_MONITORING, OvhApiCloudProjectNetworkPrivate, RegionService, $document) {

        var self = this;
        var serviceName = null;

        var sortInterval = null;

        this.regionService = RegionService;
        this.Cloud = OvhApiCloud;

        this.jsplumbInstance = null;
        this.infra = null;
        this.volumes = null;
        this.vlans = {
            vrackStatus : null
        };
        this.regions = null;
        this.user = null;
        this.vmMonitoringUpgradeThreshold = CLOUD_MONITORING.vm.upgradeAlertThreshold;
        this.conversion = CLOUD_UNIT_CONVERSION;

        this.collections = {
            privateNetworks: []
        };

        this.model = {
            currentLinkEdit : null
        };

        this.loaders = {
            init: true,
            vrack : false,
            vlans : false,
            ips: false,
            volumes: false,
            jsplumb : false,
            linkActionConfirm : false,
            volumeActionConfirm : false,
            privateNetworks: {
                query: false
            }
        };

        this.sort = {
            ipAutoSort: true,
            ipNaturalsort: true
        };

        this.errors = {
            init : false
        };

        this.states = {
            sorting : false
        };

        this.helpDisplay = {
            openUnlinkVolume : false
        };

        this.importedIpFailoverPending = [];   // List of pending import IPFO

        // ------- INIT -------

        this.init = function () {
            if ($scope.redirectToOverview) {
                return $state.go("iaas.pci-project.compute.infrastructure-overview");
            } else {
                this.loaders.init = true;

                initDragDropHelper();

                // Get type of project
                getProjectContext();

                getUser();
                // @todo: reset cache

                // Pre-load required datas (all this datas will be cached)
                return $q.all(
                    [
                        OvhApiCloudProjectRegion.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudProjectImage.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudProjectSnapshot.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudProjectFlavor.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudProjectSshKey.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudProjectVolumeSnapshot.Lexi().query({
                            serviceName: serviceName
                        }).$promise,
                        OvhApiCloudPrice.Lexi().query().$promise,
                        self.initRegions()
                    ]).then(function () {
                    return self.initInfra();
                }, function () {
                    self.errors.init = true;
                })["finally"](function () {
                        self.loaders.init = false;
                    }
                );
            }

        };

        this.showDeleteProjectModal = function () {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: "app/cloud/project/delete/cloud-project-delete.html",
                controller: "CloudProjectDeleteCtrl",
                controllerAs: "CloudProjectDeleteCtrl"
            });
        };

        function shouldDisplayInstancesRetracted() {
            return $q.all({
                hasTooManyInstances: CloudProjectOrchestrator.hasTooManyInstances($stateParams.projectId),
                hasTooManyIps: CloudProjectOrchestrator.hasTooManyIps($stateParams.projectId)
            }).then(function(result) {
                return result.hasTooManyInstances || result.hasTooManyIps;
            });
        }

        function getUser () {
            return OvhApiMe.Lexi().get().$promise
                .then(function(user) {
                    self.user = user;
                });
        }

        this.initInfra = function () {
            var initInfraQueue = [];

            this.loaders.vrack = true;
            this.loaders.ips = true;
            this.loaders.jsplumb = true;
            self.loaders.vlans = true;
            self.loaders.volumes = true;
            this.errors.init = false;

            this.importedIpFailoverPending = [];

            // Init jsPlumb
            initInfraQueue.push(jsPlumbService.jsplumbInit()['finally'](function () {
                self.loaders.jsplumb = false;
                jsPlumbService.importDefaults({
                    MaxConnections : -1
                });
            }));

            // Init Infra
            initInfraQueue.push(CloudProjectOrchestrator.initInfrastructure({
                serviceName : serviceName,
            }).then(function (infra) {
                self.infra = infra;

                // check if there are IPFO import to poll
                checkPendingImportIpFailover();
                // check if IPs auto sort is enabled
                checkIpAutoSort();
            }).then(function () {
                return updateReverseDns(self.infra.internet.ipList.getItems());
            }).then(function() {
                return shouldDisplayInstancesRetracted()
                    .then(function(retracted) {
                        if (retracted) {
                            CloudProjectComputeInfrastructureOrchestrator.collapseAllVm();
                        }
                    });
            }).then(function () {
                return self.initVlan();
            }));

            // Init Volumes
            initInfraQueue.push(CloudProjectOrchestrator.initVolumes({
                serviceName : serviceName
            }).then(function (volumes) {
                self.volumes = volumes.volumes;
            }));

            return $q.all(initInfraQueue)['catch'](function () {
                self.errors.init = true;
            })['finally'](function () {
                self.loaders.vrack = false;
                self.loaders.ips = false;
                self.loaders.volumes = false;
                if ($stateParams.openVncWithId) {
                    self.openVncWithId($stateParams.openVncWithId);
                }
                // check if we need to display the volume creation popup
                if ($stateParams.createNewVolume) {
                    self.addVolume();
                } else if ($stateParams.createNewVolumeFromSnapshot.snapshot) {
                    self.addVolumeFromSnapshot($stateParams.createNewVolumeFromSnapshot.snapshot);
                }

                if ($stateParams.createNewVm) {
                    self.addVirtualMachine();
                }

                if (CLOUD_MONITORING.alertingEnabled) {
                    // Monitoring loading must begin at the end
                    CloudProjectComputeInfrastructureOrchestrator.loadVmMonitoringData();
                }
            });
        };

        this.initVlan = function () {

            return CloudProjectComputeInfrastructureOrchestrator.hasVrack()
                .then(function (hasVrack) {
                    self.vlans.vrackStatus = hasVrack ? "activated" : "none";
                }).finally(function () {
                    self.loaders.vlans = false;
                });
        };

        // Fetch all the regions
        this.initRegions = function () {
            return OvhApiCloudProjectRegion.Lexi().query({
                serviceName : serviceName
            }).$promise.then(function (regionIds) {
                return initRegionFromIds(regionIds);
            });
        };

        function initRegionFromIds (regionIds) {
            // build the list of GET region calls from region ids list
            var getRegions = _.map(regionIds, function (regionId) {
                return OvhApiCloudProjectRegion.Lexi().get({
                    serviceName : serviceName,
                    id : regionId
                }).$promise;
            });
            return $q.all(getRegions).then(function (result) {
                self.regions = result;
            });
        }

        function getProjectContext () {
            serviceName = $stateParams.projectId;
            self.instanceId = $stateParams.projectId;
        }

        // Hide highligted-element on change state
        $scope.$on('$stateChangeStart', function () {
            $rootScope.$broadcast('highlighed-element.hide');
        });

        // Kill polling
        $scope.$on('$destroy', function () {
            CloudProjectComputeInfrastructureOrchestrator.killPollVms();
            CloudProjectComputeInfrastructureOrchestrator.killPollIps();
            CloudProjectComputeVolumesOrchestrator.killPollVolumes();
        });

        // ------- END INIT -------

        // ------- REGION ACTIONS -------

        self.getVmContinent = function (vm) {
            var region = _.find(self.regions, { name : vm.region });
            return region ? region.continentCode : undefined;
        };

        // ------- END REGION ACTIONS -------

        // ------- VM ACTIONS -------

        self.addVirtualMachine = function () {
            CloudProjectComputeInfrastructureOrchestrator.addNewVmToList().then(function (vm) {
                CloudProjectComputeInfrastructureOrchestrator.turnOnVmEdition(vm);
            });
        };

        self.deleteConfirmPending = function (vm) {
            /**
             * We display a popover warning in two cases :
             *  - the vm is in monthly billing
             *  - the vm is routed to failover IPs
             */
            if (vm.monthlyBilling && vm.monthlyBilling.status === 'ok') {
                $uibModal.open({
                    windowTopClass: 'cui-modal',
                    templateUrl: 'app/cloud/project/compute/infrastructure/virtualMachine/delete/cloud-project-compute-infrastructure-virtual-machine-delete.html',
                    controller: 'CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl',
                    controllerAs: '$ctrl',
                    resolve: {
                        params: function () {
                            return vm;
                        }
                    }
                }).result.then(function () {
                    self.deleteVirtualMachine(vm);
                });
            } else {
                vm.confirm = 'deleteConfirmPending';
            }
        };

        self.deleteVirtualMachine = function (vm) {
            vm.confirmLoading = true;
            CloudProjectComputeInfrastructureOrchestrator.deleteVm(vm).then(function () {
                vm.confirm = null;
            }, function (err) {
                CloudMessage.error( [$translate.instant('cpci_vm_delete_submit_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                vm.confirmLoading = false;
            });
        };

        self.reinstallVirtualMachine = function (vm) {
            vm.confirmLoading = true;
            CloudProjectComputeInfrastructureOrchestrator.reinstallVm(vm).then(function () {
                vm.confirm = null;
            }, function (err) {
                CloudMessage.error( [$translate.instant('cpci_vm_reinstall_submit_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                vm.confirmLoading = false;
            });
        };

        self.rebootVirtualMachine = function (vm, type) {
            vm.confirmLoading = true;
            CloudProjectComputeInfrastructureOrchestrator.rebootVm(vm, type).then(function () {
                vm.confirm = null;
            }, function (err) {
                CloudMessage.error( [$translate.instant('cpci_vm_reboot_submit_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                vm.confirmLoading = false;
            });
        };

        self.resumeVirtualMachine = function (vm) {
            var oldStatus = vm.status;
            vm.status = "RESUMING";
            CloudProjectComputeInfrastructureOrchestrator.resumeVm(vm).catch(function (err) {
                CloudMessage.error([$translate.instant("cpci_vm_resume_submit_error"), err.data && err.data.message || ""].join(" "));
                vm.status = oldStatus;
            });
        };

        self.openSnapshotWizard = function (vm) {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: 'app/cloud/project/compute/snapshot/add/cloud-project-compute-snapshot-add.html',
                controller: 'CloudProjectComputeSnapshotAddCtrl',
                controllerAs: 'CloudProjectComputeSnapshotAddCtrl',
                resolve: {
                    params: function () {
                        return vm;
                    }
                }
            });
        };

        self.openVolumeSnapshotWizard = function (volume) {
            $uibModal.open({
                templateUrl: 'app/cloud/project/compute/volume/snapshot/cloud-project-compute-volume-snapshot-add.html',
                controller: 'CloudProjectComputeVolumeSnapshotAddCtrl',
                controllerAs: 'CloudProjectComputeVolumeSnapshotAddCtrl',
                resolve: {
                    params: function () {
                        return volume;
                    }
                }
            });
        };

        self.openMonthlyConfirmation = function (vm) {
            var modalInstance = $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/monthlyConfirm/cloud-project-compute-infrastructure-virtual-machine-monthlyConfirm.html",
                controller: "CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm",
                controllerAs: "CPCIVirtualmachineMonthlyConfirm",
                resolve: {
                    params: function () {
                        return vm;
                    }
                }
            });
            modalInstance.opened.then(function () {
                refreshLinks();
            });
        };

        self.stopRescueMode = function (vm, enable) {
            vm.confirmLoading = true;
            CloudProjectComputeInfrastructureOrchestrator.rescueVm(vm, enable).then(function () {
                vm.confirm = null;
            }, function (err) {
                CloudMessage.error( [$translate.instant('cpci_vm_rescue_end_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                vm.confirmLoading = false;
            });
        };

        // ------- END VM -------

        // ------- VM DISPLAY TOOLS -------

        $scope.$on('compute.infrastructure.vm.status-update', function (evt, newStatus, oldStatus, vm) {
            if (oldStatus === 'BUILD' && newStatus === 'ACTIVE') {
                self.displayVmAuthInfo(vm);
            }
        });

        self.toggleVmEditionState = function (vm, param) {
            if (vm.openDetail) {
                CloudProjectComputeInfrastructureOrchestrator.turnOffVmEdition(true);
                $rootScope.$broadcast('highlighed-element.hide');
            } else {
                if (param) {
                    CloudProjectComputeInfrastructureOrchestrator.setEditVmParam(param);
                }
                CloudProjectComputeInfrastructureOrchestrator.turnOnVmEdition(vm);
            }
        };

        self.openVmMonitoringPanel = function (vm) {
            CloudProjectComputeInfrastructureOrchestrator.openMonitoringPanel(vm);
        };

        self.displayVmAuthInfo = function (vm) {
            var completeVm = self.infra.vrack.publicCloud.get(vm.id);

            $state.go("iaas.pci-project.compute.infrastructure.modal.login-information", {
                instanceId: vm.id,
                serviceName: $stateParams.projectId,
                ipAddresses: vm.ipAddresses,
                image: completeVm.image
            });
        };

        self.openVncWithId = function (vmId) {
            var completeVm = self.infra.vrack.publicCloud.get(vmId);
            if (completeVm) {
                self.openVnc(completeVm);
            }
        };

        self.openVnc = function (vm) {
            $uibModal.open({
                windowTopClass: 'cui-modal',
                templateUrl  : 'app/cloud/project/compute/infrastructure/virtualMachine/vnc/cloud-project-compute-infrastructure-virtual-machine-vnc.html',
                controller   : 'CloudProjectComputeInfrastructureVirtualmachineVncCtrl',
                controllerAs : 'VmVncCtrl',
                size         : 'lg',
                resolve      : {
                    params: function () {
                        return vm;
                    }
                }
            });
        };

        self.rescueMode = function (vm, enable) {
            if (enable) {
                $uibModal.open({
                    windowTopClass: 'cui-modal',
                    templateUrl  : 'app/cloud/project/compute/infrastructure/virtualMachine/rescue/cloud-project-compute-infrastructure-virtual-machine-rescue.html',
                    controller   : 'CloudProjectComputeInfrastructureVirtualmachineRescueCtrl',
                    controllerAs : 'VmRescueCtrl',
                    size         : 'md',
                    resolve      : {
                        params: function () {
                            return vm;
                        }
                    }
                });
            }
        };

        self.collapseAll = function () {
            CloudProjectComputeInfrastructureOrchestrator.collapseAllVm();
            refreshLinks();
        };

        self.uncollapseAll = function () {
            CloudProjectComputeInfrastructureOrchestrator.uncollapseAllVm();
            refreshLinks();
        };

        self.toggleCollapsedState = function (vm) {
            CloudProjectComputeInfrastructureOrchestrator.toggleVmCollapsedState(vm);
            refreshLinks();
        };

        self.toggleCollapsedVolumes = function (vm) {
            if (vm) {
                CloudProjectComputeInfrastructureOrchestrator.toggleCollapsedVolumes(vm);
            } else {
                self.helpDisplay.openUnlinkVolume = !self.helpDisplay.openUnlinkVolume;
            }
            refreshLinks();
            if (!vm && (!self.volumes.unlinked || !self.volumes.unlinked.length)) {
                self.addVolume();
            }
        };

        // ------- END VM DISPLAY TOOLS -------


        function refreshLinks () {
            $timeout(function () {
                if (self.jsplumbInstance) {
                    self.jsplumbInstance.revalidateEverything();
                }
            }, 99);
        }

        $scope.$on('infra.refresh.links', function () {
            // delay the execution, on VM deletion, VMS need to be moved before we refresh or links
            // aren't place properly
            $timeout(function () {
                refreshLinks();

            }, 1000);
        });

        self.forceRefreshLinks = function() {
            refreshLinks();
        };

        // ------- IPS ACTIONS -------

        /*==========  IPFO BUY  ==========*/

        this.buyIpFailover = function () {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: 'app/cloud/project/compute/infrastructure/ip/failover/buy/cloud-project-compute-infrastructure-ip-failover-buy.html',
                controller: 'CloudProjectComputeInfrastructureIpFailoverBuyCtrl',
                controllerAs: 'CPCIIpFailoverBuyCtrl'
            });
        };

        /*==========  IPFO IMPORT  ==========*/

        /**
         * At init, check if there are IPFO importation to poll
         */
        function checkPendingImportIpFailover () {
            // On page refresh, get pending IPFO import
            CloudUserPref.get('cloud_project_' + serviceName + '_infra_ipfo_import').then(function (ipfoToImport) {
                ipfoToImport = ipfoToImport ? ipfoToImport.ips : [];
                if (ipfoToImport && _.isArray(ipfoToImport) && ipfoToImport.length) {
                    angular.forEach(ipfoToImport, function (ipfo) {
                        pollImportIpFailover(ipfo);
                    });
                }
            });
        }

        this.importIpFailover = function () {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: 'app/cloud/project/compute/infrastructure/ip/failover/import/cloud-project-compute-infrastructure-ip-failover-import.html',
                controller: 'CloudProjectComputeInfrastructureIpFailoverImportCtrl',
                controllerAs: 'CPCIIpFailoverImportCtrl',
                resolve: {
                    pendingImportIps: function () {
                        return angular.copy(self.importedIpFailoverPending);
                    }
                }
            }).result.then(function (listTaskslistIpsWithTasks) {
                // Launch polling
                angular.forEach(listTaskslistIpsWithTasks, function (ipWithTask) {
                    pollImportIpFailover(ipWithTask.ip, ipWithTask.task);
                });
                refreshLinks();
            });
        };

        /**
         * Updates reverse dns of given ips.
         */
        function updateReverseDns (ips) {
            var reverseQueue = [];
            angular.forEach(ips, function (ip) {
                reverseQueue.push(OvhApiIp.Reverse().Lexi().getReverseDns(ip.ip, ip.block).then(function (dns) {
                    ip.reverse = dns;
                }, function (err) {
                    // ok we choose to ignore errors here, so the application can still be used,
                    // instead of displaying an ugly error message just because one reverse dns call failed
                    // let's assume the reverse dns is just null
                    return $q.when(null);
                }));
            });
            return $q.all(reverseQueue);
        }

        /**
         *  [/ip] Poll a given IPFO address.
         *
         *  ip      : the ip object
         *  taskObj : (optional) task to poll
         */
        function pollImportIpFailover (ip, taskObj) {
            // Already polling
            if (~self.importedIpFailoverPending.indexOf(ip)) {
                return;
            }

            var taskToPoll = taskObj ? taskObj.taskId : OvhApiIp.Lexi().getPendingTask(ip, 'genericMoveFloatingIp');

            return $q.when(taskToPoll).then(function (taskId) {

                if (taskId) {
                    self.importedIpFailoverPending.push(ip);

                    CloudUserPref.set("cloud_project_" + serviceName + "_infra_ipfo_import", {
                        ips: self.importedIpFailoverPending
                    });

                    return Poller.poll('/ip/' + encodeURIComponent(ip) + '/task/' + taskId,
                        null,
                        {
                            namespace: 'cloud.infra.ips.genericMoveFloatingIp'
                        }
                    ).then(function () {
                        // On success: the IP should be in the /cloud/.../ip/failover list.
                        CloudProjectComputeInfrastructureOrchestrator.pollIps('failover');
                        CloudMessage.success($translate.instant('cpci_ipfo_import_success', {ip: ip}));
                    }, function (err) {
                        if (err && err.status) {
                            // On error: remove the IP from list
                            CloudMessage.error($translate.instant('cpci_ipfo_import_error', {ip: ip}));
                        }
                    });
                }
            }).then(function () {
                _.pull(self.importedIpFailoverPending, ip);
                CloudUserPref.set("cloud_project_" + serviceName + "_infra_ipfo_import", {
                    ips: self.importedIpFailoverPending
                });
            })["finally"](function () {
                refreshLinks();
            });
        }
        $scope.$on('$destroy', function () {
            Poller.kill({ namespace: 'cloud.infra.ips.genericMoveFloatingIp' });
        });

        /**
         * Toggle automatic sorting of ips
         */
        self.toggleIpSort = function () {
            var autoSortEnable = !self.sort.ipAutoSort;
            self.sort.ipAutoSort = autoSortEnable;
            self.sort.ipNaturalSort = autoSortEnable; // activate naturalSort if autoSort is enabled
            refreshLinks();
            CloudUserPref.set("cloud_project_" + serviceName + "_infra_ip_autosort", {
                "enabled" : autoSortEnable
            });
        };

        /**
         * Check in local storage if IPs auto sort is enabled
         */
        function checkIpAutoSort() {
            CloudUserPref.get('cloud_project_' + serviceName + '_infra_ip_autosort').then(function (ipAutoSort) {
                if (ipAutoSort) {
                    self.sort.ipAutoSort = ipAutoSort.enabled;
                    self.sort.ipNaturalSort = ipAutoSort.enabled; // activate naturalSort if autoSort is enabled
                    refreshLinks();
                }
            });
        }

        /**
         * Sort the ip in order to have the least crossing between links
         */
        self.ipAutoSort = function (ip) {
            // only if autosort is enabled ...
            if (!self.sort.ipAutoSort) {
                return _.indexOf(self.infra.internet.ipList.sortedKeys, ip.id);
            }
            var order = 0;
            var routeCount = 0;
            angular.forEach(ip.routedTo, function (route) {
                var vmPosition = _.indexOf(self.infra.vrack.publicCloud.sortedKeys, route);
                if (vmPosition !== -1) {
                    order += vmPosition * 5; // arbitrary weight of 5 for a link with a vm
                    routeCount += 1;
                }
            });
            if (routeCount > 0) {
                order /= routeCount; // compute our position with average order
                if (ip.type === 'failover') {
                    order += 1;
                }
                return order;
            }
            return Number.MAX_VALUE; // goes to the bottom
        };

        /**
         * Sort IPs in their natural order
         */
        self.ipSortNatural = function (ip) {
            // only if natural sort is activated ...
            if (!self.sort.ipNaturalSort) {
                return _.indexOf(self.infra.internet.ipList.sortedKeys, ip.id);
            }
            var ipRegex = new RegExp(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
            if (ip && ipRegex.test(ip.ip)) { // IPv4 ...
                var values = ipRegex.exec(ip.ip);
                var score = 0;
                score += parseInt(values[1], 10) * 1000000000;
                score += parseInt(values[2], 10) * 1000000;
                score += parseInt(values[3], 10) * 1000;
                score += parseInt(values[4], 10);
                return score;
            }
            return ip.ip;
        };

        self.ipReverse = {
            text : function (ip) {
                return $translate.instant('cloud_public_ip_failover_reverse', {"ip": ip.reverse});
            }
        };

        // ------- END IPS  -------

        // ******* JSPLUMB *******

        // ------- JSPLUMB TOOLS -------

        function redrawLinks (revalidateEmptyEndpoints) {
            if (self.jsplumbInstance) {
                self.jsplumbInstance.repaintEverything(revalidateEmptyEndpoints);
            }
        }

        function sourceIsVm (source, target) {
            return $(source).hasClass('vm-port') && $(target).hasClass('ip-port');
        }

        function getLinkColor (type) {
            var defaultColor = "#a8e0d5";
            switch (type) {
                case "disabled":
                    return "#bbdcd5";
                case "public":
                    return "#444444";
                case "failover":
                    return defaultColor;
                default:
                    // return ;
                    return defaultColor;
            }
        }

        // ------- JSPLUMB CONF -------

        // Default options
        var srcDrawOptionsBase = {
            connector: ["Bezier", { curviness: 100 }],
            connectorStyle: {
                strokeStyle: getLinkColor(),
                lineWidth: 4
            }
        };

        // ------- JSPLUMB VM FUNCTION CONF -------

        this.vmSourceDrawOptions = {
            connector : srcDrawOptionsBase.connector,
            connectorStyle : srcDrawOptionsBase.connectorStyle,
            anchor : [0.5, 0.5, 1, 0],
            endpoint : ['Blank', { cssClass : 'vm-source' }],
            filter : '.port-inner',
            dragOptions : {
                start : function () {
                    var id = $(this).attr("elid");
                    var vm = self.infra.vrack.getVmById(id);
                    if (vm) {
                        $rootScope.$broadcast('highlighed-element.show', "compute," + vm.id + ",ip-failover-ok-" + self.getVmContinent(vm));
                    }
                },
                stop : function () {
                    var id = $(this).attr("elid");
                    var vm = self.infra.vrack.getVmById(id);
                    if (vm) {
                        $rootScope.$broadcast("highlighed-element.hide", "compute," + vm.id + ",ip-failover-ok-" + self.getVmContinent(vm));
                    }
                }
            }
        };

        this.vmTargetDrawOptions = {
            anchor : [0.5, 0.5, 1, 0],
            endpoint : ['Blank', { cssClass : 'vm-target' }],
            dropOptions : {
                accept : '.ip-source',
                hoverClass : 'hover-port'
            }
        };

        // ------- JSPLUMB IP FUNCTION CONF -------

        this.ipTargetDrawOptions = {
            anchor : [0.5, 0.5, -1, 0],
            endpoint : ['Blank', { cssClass : 'ip-target' }],
            dropOptions : {
                accept : '.vm-source',
                hoverClass : 'hover-port'
            }
        };

        this.ipSourceDrawOptions = {
            connector : srcDrawOptionsBase.connector,
            connectorStyle : srcDrawOptionsBase.connectorStyle,
            connectorHoverStyle : srcDrawOptionsBase.connectorHoverStyle,
            // anchor : 'LeftMiddle',
            anchor : [0.5, 0.5, -1, 0],
            endpoint : ['Blank', { cssClass : 'ip-source' }],
            filter : '.port-inner',
            dragOptions : {
                start : function () {
                    var id = $(this).attr("elid");
                    var ip = self.infra.internet.getIpById(id);
                    if (ip) {
                        $rootScope.$broadcast("highlighed-element.show", "compute," + ip.id + ",vm-ACTIVE-" + ip.continentCode);
                    }
                },
                stop : function () {
                    var id = $(this).attr("elid");
                    var ip = self.infra.internet.getIpById(id);
                    if (ip) {
                        $rootScope.$broadcast("highlighed-element.hide", "compute," + ip.id + ",vm-ACTIVE-" + ip.continentCode);
                    }
                }
            }
        };

        // ******* END JSPLUMB *******

        // ------- JSPLUMB EVENTS -------

        // what to do when instance is created
        $scope.$on('jsplumb.instance.created', function (evt, instance) {
            self.jsplumbInstance = instance;
            window.JSPLUMBINSTANCE = self.jsplumbInstance;
        });

        // what to do when a connection is made
        $scope.$on('jsplumb.instance.connection', function (evt, connection, source, target, instance, originalEvent) {

            var isVmSource = sourceIsVm(connection.source, connection.target),
                connectedIpId = isVmSource ? connection.targetId : connection.sourceId,
                connectedVmId = isVmSource ? connection.sourceId : connection.targetId,
                connectedIp = self.infra.internet.getIpById(connectedIpId),
                connectedVm = self.infra.vrack.getVmById(connectedVmId);

            if (!connectedIp || !connectedVm) {
                return;
            }

            // Set connection style
            connection.setPaintStyle({ strokeStyle : getLinkColor(connectedIp.type), lineWidth : 4 });

            connection.addClass("_jsPlumb_connector_ip_" + connectedIp.type);
            connection.addClass("fade-transition");
            // Don't up the size when hover ip public
            if (connectedIp.type === 'public') {
                connection.setHoverPaintStyle({ lineWidth : 4 });
            }

            // It's a connection drawed by the user (with its mouse)
            if (originalEvent) {

                var vmContinent = self.getVmContinent(connectedVm);
                var isValidLink = vmContinent && vmContinent === connectedIp.continentCode;

                if (isValidLink && (!self.model.currentLinkEdit || self.model.currentLinkEdit.action === 'attach')) {

                    // set dotted line
                    connection.setPaintStyle({ strokeStyle : getLinkColor(connectedIp.type), lineWidth : 8, dashstyle : "2 1" });

                    switch (connectedIp.type) {
                        case 'failover':
                            if (connectedIp.routedTo.length > 0) {
                                // It's a "move" : show a confirmation

                                var connectedVmCurrent = self.infra.vrack.getVmById(connectedIp.routedTo[0]);

                                self.model.currentLinkEdit = {
                                    connection         : connection,
                                    connectedIp        : connectedIp,
                                    connectedVm        : connectedVm,
                                    connectedVmCurrent : connectedVmCurrent,
                                    action             : 'attach'
                                };

                                $rootScope.$broadcast('highlighed-element.show', 'compute,' + connectedIp.id + ',' + connectedVmId);
                                self.model.currentLinkEdit.connection.addClass('highlighed-element highlighed-element-active');
                            } else {
                                self.ipEdit.attach.confirm(connectedVm, connectedIp)['catch'](function(){
                                    self.jsplumbInstance.disconnectEndpoints(connection);
                                });
                            }
                    }

                } else {
                    self.jsplumbInstance.disconnectEndpoints(connection);
                }
            }
        });

        // ------- END JSPLUMB EVENTS -------


        /**
         *  IP EDITION
         *  ----------
         *
         *  IPFO: attach/detach, with drag&drop or manual
         *  ...
         */
        this.ipEdit = {
            'attach': {
                'confirm': function (vm, ip) {
                    if (!self.loaders.linkActionConfirm) {
                        var connectedVm = vm || self.model.currentLinkEdit.connectedVm,
                            connectedIp = ip || self.model.currentLinkEdit.connectedIp;

                        self.loaders.linkActionConfirm = true;
                        return CloudProjectComputeInfrastructureOrchestrator.attachIptoVm(connectedIp, connectedVm).then(function () {
                            $rootScope.$broadcast('highlighed-element.hide');
                            self.model.currentLinkEdit = null;
                            var successMessage = { text: $translate.instant('cpci_ip_attach_success', {ip : connectedIp.ip, instance : connectedVm.name}) };
                            if (connectedIp.type === "failover" && connectedVm.image){
                                var distribution = connectedVm.image.distribution || URLS.guides.ip_failover.defaultDistribution;
                                successMessage = {
                                    textHtml: successMessage.text + ' ' + $translate.instant('cpci_ip_attach_failover_help',
                                        {link : URLS.guides.ip_failover[self.user.ovhSubsidiary][distribution]})
                                };
                            }
                            CloudMessage.success(successMessage);
                        }, function (err) {
                            CloudMessage.error( [$translate.instant('cpci_ip_attach_error', {ip : connectedIp.ip, instance : connectedVm.name}), err.data && err.data.message || ''].join(' '));
                            return $q.reject(err);
                        })['finally'](function(){
                            self.loaders.linkActionConfirm = false;
                        });
                    }
                },
                'cancel': function () {
                    if (!self.loaders.linkActionConfirm && self.model.currentLinkEdit) {

                        // if user drawed a line: delete it
                        if (self.model.currentLinkEdit.connection) {
                            self.jsplumbInstance.disconnectEndpoints(self.model.currentLinkEdit.connection);
                        }

                        // for manual attach
                        if (self.model.currentLinkEdit.connectionCurrent) {
                            // self.model.currentLinkEdit.connectionCurrent.setHoverPaintStyle({ lineWidth : 8 });
                            self.model.currentLinkEdit.connectionCurrent.removeClass('highlighed-element highlighed-element-active');
                        }

                        $rootScope.$broadcast('highlighed-element.hide');
                        self.model.currentLinkEdit = null;
                    }
                },
                'button': function (ip) {
                    //input radio
                    if (ip.type === "failover"){

                        // list of compatible(s) vm(s) to attach the ip
                        var compatibleVms = _.filter(self.infra.vrack.publicCloud.items, function (vm) {
                            return self.ipEdit.attach.canAttachIpToVm(ip, vm);
                        });

                        // do we have at least one compatible vm?
                        if (compatibleVms.length > 0) {
                            self.model.currentLinkEdit = {
                                connectionCurrentVmId : ip.routedTo.length > 0 ? ip.routedTo[0] : null,
                                connectionVmId        : ip.routedTo.length > 0 ? ip.routedTo[0] : null,

                                connectionCurrent     : ip.routedTo.length > 0 ? self.jsplumbInstance.getConnectionBySourceIdAndTargetId(ip.id, ip.routedTo[0]) : null,
                                connection            : null,

                                connectedIp           : ip,
                                connectedVmCurrent    : ip.routedTo.length > 0 ? self.infra.vrack.getVmById(ip.routedTo[0]) : null,
                                action                : 'attach',
                                isManual              : true
                            };

                            // If there are a connection already, highlight it
                            if (self.model.currentLinkEdit.connectionCurrent) {
                                self.model.currentLinkEdit.connectionCurrent.setHoverPaintStyle({ lineWidth : 4 });
                                self.model.currentLinkEdit.connectionCurrent.addClass('highlighed-element highlighed-element-active');
                            }

                            $rootScope.$broadcast('highlighed-element.show', "compute,vm-ACTIVE-" + self.model.currentLinkEdit.connectedIp.continentCode);
                        } else {
                            CloudMessage.error($translate.instant("cpci_ipfo_attach_error"));
                        }
                    }
                },
                'changeRadioConnection' : function () {

                    // If there are already a link: detach it
                    if (self.model.currentLinkEdit.connection) {
                        self.jsplumbInstance.disconnectEndpoints(self.model.currentLinkEdit.connection);
                        self.model.currentLinkEdit.connection = null;
                        self.model.currentLinkEdit.connectedVm = null;
                    }

                    if (self.model.currentLinkEdit.connectionCurrentVmId !== self.model.currentLinkEdit.connectionVmId) {
                        // create connection
                        self.model.currentLinkEdit.connection = self.jsplumbInstance.connectEndpoints(self.model.currentLinkEdit.connectedIp.id, self.model.currentLinkEdit.connectionVmId);
                        self.model.currentLinkEdit.connectedVm = self.infra.vrack.getVmById(self.model.currentLinkEdit.connectionVmId);

                        // set connection style
                        self.model.currentLinkEdit.connection.setPaintStyle({ strokeStyle : getLinkColor(self.model.currentLinkEdit.connectedIp.type), lineWidth : 8, dashstyle: "2 1" });
                        self.model.currentLinkEdit.connection.addClass('highlighed-element highlighed-element-active');
                    } else {
                        if (self.model.currentLinkEdit.connectionCurrent) {
                            self.model.currentLinkEdit.connectionCurrent.setPaintStyle({ strokeStyle : getLinkColor(self.model.currentLinkEdit.connectedIp.type), lineWidth : 4 });
                        }
                    }
                },
                'canAttachIpToVm' : function (ipSource, vmDest) {
                    var attachable = true;
                    attachable = attachable && ipSource && vmDest;
                    attachable = attachable && vmDest.status === 'ACTIVE';
                    attachable = attachable && ipSource.continentCode && ipSource.continentCode === self.getVmContinent(vmDest);
                    return attachable;
                }
            }
        };

        // ------- END CONTINENT INFORMATIONS -------

        // ------- JQUERY UI SORTABLE -------

        function initInterval () {
            //redraw jsplumb after sort
            sortInterval = setInterval(redrawLinks, 33);
        }

        var sortableOptions = {
            cancel : '.sortable-disabled',
            axis : 'y',
            start : function () {
                self.states.sorting = true;
                initInterval();
            },
            stop : function () {
                self.states.sorting = false;
                if (sortInterval) {
                    clearInterval(sortInterval);
                    // redraw links for the last time and revalidate offset of non connected items
                    redrawLinks(true);
                }
            },
            update : function () {
                $timeout(function () {
                    // deffer save to let jqUI update the array
                    CloudProjectComputeInfrastructureOrchestrator.saveToUserPref();
                });
            }
        };

        // create vm sortable options by extending sortable options
        this.vmSortableOptions = angular.extend({ handle : '.vm-grip' }, sortableOptions);
        // create ip sortable options by extending sortable options
        this.ipSortableOptions = angular.extend({ handle : '.ip-grip' }, sortableOptions);

        // what to do when sort start
        $scope.$on('ui.sortable.start', function () {
            self.states.sorting = true;
            initInterval();
        });

        // what to do when sort stop
        $scope.$on('ui.sortable.stop', function () {
            self.states.sorting = false;
            if (sortInterval) {
                clearInterval(sortInterval);
                // redraw links for the last time and revalidate offset of non connected items
                redrawLinks(true);
            }
        });

        // what to do when position has changed
        $scope.$on('ui.sortable.update', function (ngEvent, jqEvent, ui) {
            var $sortedElem = $(ui.item);
            if ($sortedElem.hasClass('public-cloud-vm')) {
                // ------ TODO: warning: ASYNC call!!!!!!
                CloudProjectComputeInfrastructureOrchestrator.saveToUserPref();
            } else if ($sortedElem.hasClass('ip')) {
                // ------ TODO: warning: ASYNC call!!!!!!
                CloudProjectComputeInfrastructureOrchestrator.saveToUserPref();
            }
        });

        // ------- END JQUERY UI SORTABLE -------

        // ------- VOLUME DISPLAY TOOLS -------

        function initDragDropHelper () {
            self.dragDropHelper = {
                draggingIsDoing      : false,
                currentDraggedVolume : null,
                currentDroppableVmId : null
            };
        }

        self.toggleVolumeEditionState = function (volume, param) {
            if (!volume.openDetail) {
                if (param) {
                    CloudProjectComputeVolumesOrchestrator.setEditVolumeParam(param);
                }
                CloudProjectComputeVolumesOrchestrator.turnOnVolumeEdition(volume);
            } else {
                CloudProjectComputeVolumesOrchestrator.turnOffVolumeEdition(true);
                $rootScope.$broadcast('highlighed-element.hide');
            }
        };

        // return the list of regions in which there is at least one unlinked volume
        self.getUnlinkedVolumesRegions = function () {
            var _regions = [];
            angular.forEach(self.volumes.unlinked, function (volume) {
                _regions.push(volume.region);
            });
            // if we are doing a drag & drop, we add the dragged volume region to the list
            // so it will be displayed as a droppable target in the region list
            if (self.dragDropHelper.currentDraggedVolume) {
                _regions.push(self.dragDropHelper.currentDraggedVolume.draggableInfo.volume.region);
            }
            return _.uniq(_regions);
        };

        self.getTranslatedRegion = function (region) {
            return region ? self.regionService.getTranslatedMicroRegion(region) : "";
        };

        self.addVolume = function () {
            refreshLinks();
            self.helpDisplay.openUnlinkVolume = true;
            CloudProjectComputeVolumesOrchestrator.addNewVolumeToList("unlinked").then(function (volumeDraft) {
                CloudProjectComputeVolumesOrchestrator.turnOnVolumeEdition(volumeDraft);
            });
        };

        self.addVolumeFromSnapshot = function (snapshot) {
            refreshLinks();
            self.helpDisplay.openUnlinkVolume = true;
            CloudProjectComputeVolumesOrchestrator.addNewVolumeFromSnapshotToList("unlinked", snapshot).then(function (volumeDraft) {
                CloudProjectComputeVolumesOrchestrator.turnOnVolumeEdition(volumeDraft);
            }, function (err) {
                CloudMessage.error([$translate.instant("cpci_volume_add_from_snapshot_error"), err.data && err.data.message || ''].join(' '));
            });
        };

        self.volumeEdit = {
            action   : null,
            volume   : null, // Can be factory or not !
            srcVm    : null,
            targetVm : null,
            targetVmId : null, // use for checkbox vm
            'remove' : {
                launchConfirm : function (volume) {
                    OvhApiCloudProjectVolumeSnapshot.Lexi().query({
                        serviceName: serviceName
                    }).$promise.then(function (snapshots) {
                        if (_.find(snapshots, { volumeId: volume.id })) {
                            CloudMessage.error($translate.instant("cpci_volume_snapshotted_delete_info", { url: $state.href("iaas.pci-project.compute.snapshot")}));
                        } else {
                            self.volumeEdit.action = "remove";
                            self.volumeEdit.volume = volume;
                            $rootScope.$broadcast('highlighed-element.show', 'compute,' + volume.id);
                        }
                    }, function (err) {
                        CloudMessage.error([$translate.instant("cpci_volume_snapshot_error"), err.data && err.data.message || ""].join(" "));
                    });
                },
                cancel : function () {
                    self.volumeEdit.reinit();
                    $rootScope.$broadcast('highlighed-element.hide');
                },
                confirm : function () {
                    self.loaders.volumeActionConfirm = true;
                    CloudProjectComputeVolumesOrchestrator.deleteVolume(self.volumeEdit.volume.id).then(function(){
                        self.volumeEdit.reinit();
                        $rootScope.$broadcast('highlighed-element.hide');
                    }, function (err) {
                        CloudMessage.error( [$translate.instant('cpci_volume_delete_error'), err.data && err.data.message || ''].join(' '));
                    })['finally'](function () {
                        self.loaders.volumeActionConfirm = false;
                    });
                }
            },
            'move' : {
                launchConfirm : function (volume, srcVm, targetVm) {
                    self.volumeEdit.action   = "move";
                    self.volumeEdit.volume   = volume;
                    self.volumeEdit.srcVm    = srcVm; // use in interface
                    self.volumeEdit.targetVm = targetVm;

                    // set overlay
                    $timeout(function(){ //otherwise LAG
                        $rootScope.$broadcast('highlighed-element.show', 'compute,' + (targetVm ?  targetVm.id : 'unlinked_volumes'));
                    }, 100);
                },
                cancel : function () {
                    initDragDropHelper(); // :-/
                    self.volumeEdit.reinit();
                    $rootScope.$broadcast('highlighed-element.hide');
                },
                confirm : function () {
                    //Open volumes of VM target
                    if (self.volumeEdit.targetVm && !self.volumeEdit.targetVm.collapsedVolumes) {
                        CloudProjectComputeInfrastructureOrchestrator.toggleCollapsedVolumes(self.volumeEdit.targetVm);
                        refreshLinks();
                    }

                    initDragDropHelper(); // :-/
                    self.loaders.volumeActionConfirm = true;
                    CloudProjectComputeVolumesOrchestrator.moveVolume(self.volumeEdit.volume.id, self.volumeEdit.targetVm ? self.volumeEdit.targetVm.id : 'unlinked').then(function () {
                        if (self.volumeEdit.targetVm && self.volumeEdit.targetVm.image && self.volumeEdit.targetVm.image.type === 'windows') {
                            CloudMessage.info($translate.instant('cpci_volume_confirm_attach_windows_info'));
                        }
                    })['catch'](function (err) {
                        CloudMessage.error( [$translate.instant('cpci_volume_confirm_detach_error'), err.data && err.data.message || ''].join(' '));
                    })['finally'](function () {
                        self.loaders.volumeActionConfirm = false;
                        self.volumeEdit.reinit();
                        $rootScope.$broadcast('highlighed-element.hide');
                    });
                }
            },
            'moveCheckbox' : {
                launchConfirm : function (volume, srcVm) {

                    // list of compatible(s) vm(s) to attach the volume
                    var compatibleVms = _.filter(self.infra.vrack.publicCloud.items, function (vm) {
                        return self.volumeEdit.canAttachVolumeToVm(volume, vm);
                    });

                    // do we have at least one compatible vm?
                    if (compatibleVms.length > 0) {
                        self.volumeEdit.action = "moveCheckbox";
                        self.volumeEdit.volume = volume;
                        self.volumeEdit.srcVm  = srcVm; // use in interface


                        // set overlay
                        $timeout(function(){ //otherwise LAG
                            $rootScope.$broadcast('highlighed-element.show', 'compute,vm-ACTIVE-' + volume.region);
                        }, 100);
                    } else {
                        CloudMessage.error($translate.instant("cpci_volume_attach_error"));
                    }
                },
                cancel : function () {
                    self.volumeEdit.move.cancel();
                },
                confirm : function () {
                    self.volumeEdit.move.confirm();
                },
                isInvalid : function () {
                    return !self.volumeEdit.targetVm;
                },
                checkboxChange : function (targetVm) {
                    self.volumeEdit.targetVm = targetVm;
                }
            },
            reinit : function () {
                self.volumeEdit.action = null;
                self.volumeEdit.volume = null;
                self.volumeEdit.srcVm = null;
                self.volumeEdit.targetVm   = null;
            },
            'canAttachVolumeToVm' : function (volumeSource, vmDest) {
                var attachable = true;
                attachable = attachable && volumeSource && vmDest;
                attachable = attachable && vmDest.status === 'ACTIVE';
                attachable = attachable && volumeSource.region === vmDest.region;
                attachable = attachable && _.first(volumeSource.attachedTo) !== vmDest.id;
                return attachable;
            }
        };

        // ------- JQUERY UI DRAGGABLE -------

        this.draggableOptions = {
            unlinked : {
                revert            : "invalid", // when not dropped, the item will revert back to its initial position
                containment       : "#cloud-project-compute-infrastructure",
                scroll            : true,
                scrollSensitivity : 100,
                appendTo          : "#cloud-project-compute-infrastructure",
                helper            : "clone" //!important
            },
            linked : {
                revert            : "invalid", // when not dropped, the item will revert back to its initial position
                containment       : "#cloud-project-compute-infrastructure",
                scroll            : true,
                scrollSensitivity : 100,
                appendTo          : "#cloud-project-compute-infrastructure",
                helper            : "clone" //!important
            }
        };

        $scope.$on("draggable.start", function (event, obj) {
            // console.log(obj); // DEBUG
            self.dragDropHelper.currentDraggedVolume = obj.draggable;
            self.dragDropHelper.draggingIsDoing = true;
            $(".tooltip").hide(); // force hide tooltip to avoid display bug when dragging
        });

        $scope.$on("draggable.stop", function () {
            if (!self.dragDropHelper.currentDroppableVmId) {
                self.dragDropHelper.currentDraggedVolume = null;
                refreshLinks();
            }
            self.dragDropHelper.draggingIsDoing = false;
        });


        // ------- JQUERY UI DROPPABLE -------

        this.droppableOptions = {
            unlinked : {
                accept : ".volume-content-linked-items > li"
            },
            vmUnlinked : function(vm) {
                return ".volume-content-unlinked-items > li.volume-detail-item-" + vm.region +
                    ", .volume-content-linked-items:not('.volume-content-linked-items-" + vm.id + "') > li.volume-detail-item-" + vm.region
            }
            // linked : { } //Specifique of region
        };

        $scope.$on("droppable.over", function (event, obj) {
            // console.log("over", obj.droppable.droppableInfo.group, obj.droppable.droppableId); // DEBUG
            self.dragDropHelper.currentDroppableVmId = obj.droppable.droppableId;
            refreshLinks();
        });

        $scope.$on("droppable.out", function (/*event, obj*/) {
            // console.log("out", obj.droppable.droppableInfo.group, obj.droppable.droppableId); // DEBUG
            self.dragDropHelper.currentDroppableVmId = null;
            refreshLinks();
        });

        $scope.$on("droppable.drop", function (event, obj) {
            var srcVmId = self.dragDropHelper.currentDraggedVolume.draggableInfo.srcVmId,
                targetVmId = obj.droppable.droppableId;

            if (srcVmId === 'unlinked') { //No Confirmation
                self.volumeEdit.volume = self.dragDropHelper.currentDraggedVolume.draggableInfo.volume; //Is not Volume factory !
                self.volumeEdit.targetVm = self.infra.vrack.getVmById(targetVmId);
                self.volumeEdit.move.confirm();
            } else {
                self.volumeEdit.move.launchConfirm( // Confirmation
                    self.dragDropHelper.currentDraggedVolume.draggableInfo.volume, //Is not Volume factory !
                    self.infra.vrack.getVmById(srcVmId),
                    targetVmId !== 'unlinked' ? self.infra.vrack.getVmById(targetVmId) : null
                );
            }
        });
        // ------- END VOLUME DISPLAY TOOLS -------

        // ------- PRIVATE NETWORKS -------
        self.fetchPrivateNetworks = function () {
            if (self.loaders.privateNetworks.query) {
                return;
            }

            self.loaders.privateNetworks.query = true;

            return OvhApiCloudProjectNetworkPrivate.Lexi().query({
                serviceName: serviceName
            }).$promise.then(function (networks) {
                self.collections.privateNetworks = networks;
            }, function (error) {
                self.collections.privateNetwork = [];
                CloudMessage.error($translate.instant("cpci_private_network_query_error", {
                    message: error.data.message || ""
                }));
            }).finally(function () {
                self.loaders.privateNetworks.query = false;
            });
        };
        // ------- END PRIVATE NETWORKS -------

        self.hasPrivateIp = function (vm) {
            if (!self.vlans.vrackStatus) {
                return false;
            }

            return !!self.getVirtualMachinePrivateAddresses(vm).length;
        };

        self.getVirtualMachinePrivateAddresses = function (vm) {
            if (!vm || !vm.ipAddresses) {
                return false;
            }

            return _.chain(vm.ipAddresses)
                .filter(function (ip) { return ip.type === 'private'; })
                .map(function (ip) { return ip.ip; })
                .value();
        };

        function anyVmEditMenuOpen () {
            return _.any($document.find(".vm-actions-dropdown.open"));
        }

        self.removeAllFades = function () {
            if (anyVmEditMenuOpen()) {
                // disable the action when editing a VM.
                return;
            }
            var selectors = [".faded-out", ".faded-path"];
            _.each(selectors, function (selector) {
                var nodes = $document.find(selector);
                _.each(nodes, function (node) {
                    $(node).toggleClass(_.rest(selector).join(""));
                });
            });
            self.jsplumbInstance.select().removeClass("faded-path");
        };

        self.highlightInstanceAndPublicIP = function (e) {
            if (anyVmEditMenuOpen()) {
                // disable the action when editing a VM.
                return;
            }
            // instanceId can be a string of an id or an array of id.
            var currentInstanceId = $(e.currentTarget).data().instanceId;
            // always work with an array for uniformity
            if(_.isString(currentInstanceId)) {
                currentInstanceId = [currentInstanceId];
            }


            var instancesBox = $document.find(".public-cloud-vm");

            var publicIPs = $document.find(".ip");

            var plumbLink = self.jsplumbInstance.select({target: currentInstanceId});

            // instanceBox is the currently highlighed instance
            var instanceBox = _.find(instancesBox, function (box) {
                return _.includes(currentInstanceId, $(box).data().instanceId);
            });

            // ips linked to the currently highlighed instance
            var currentIps = _.filter(publicIPs, function (ip) {
                var instanceId = $(ip).data().instanceId;
                return _.any(_.intersection(instanceId, currentInstanceId));
            });

            // fade everything
            // put fade on vm-infos, does not work directly on .public-cloud-vm, because of css conflicts I guess...
            instancesBox.find(".vm-infos").addClass("faded-out");
            publicIPs.addClass("faded-out");
            self.jsplumbInstance.select().addClass("faded-path");

            // remove faded for current instance/ip/instance->ip link
            plumbLink.removeClass("faded-path");
            $(instanceBox).find(".vm-infos").removeClass("faded-out");
            $(currentIps).removeClass("faded-out");
        };

        this.init();
    }
);
