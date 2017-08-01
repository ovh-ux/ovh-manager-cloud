"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeVolumeCtrl", function ($scope, $filter, $q, $timeout, $stateParams, $translate, $state,
                                                         CloudProjectOrchestrator , CloudProjectVolume, CloudProjectVolumeSnapshot,
                                                         CloudProjectInstance, Toast, RegionService, CLOUD_UNIT_CONVERSION) {

    var self = this,
        serviceName = $stateParams.projectId,
        orderBy = $filter('orderBy');
    self.regionService = RegionService;
    //Datas
    self.table = {
        volume       : [],
        volumeFilter : [],
        groupVolume  : {},
        selected     : {},
        autoSelected : [],
        instance     : [],
        volumeFilterCheckbox : [],
        volumeFilterCheckboxPage : []
    };

    self.toggle = {
        volumeDeleteId     : null,   //Curent volume to delete
        openDeleteMultiConfirm : false
    };

    //Loader during Datas requests
    self.loaders = {
        table : {
            volume : false
        },
        remove : {
            volume : false,
            volumeMulti : false
        }
    };

    self.order = {
        by      : 'creationDate',
        reverse : true
    };

    self.totalResume = {
        capacity : 0,
        price : {
            value : 0,
            text : null,
            currencyCode : null
        }
    };

    self.GIBIBYTE_TO_BYTE = CLOUD_UNIT_CONVERSION.GIBIBYTE_TO_BYTE;

    function init () {
        self.getVolume();
        initSearchBar();
    }

    function initSearchBar () {
        self.search = {
            open          : false,
            name          : null,
            minDisk       : null,
            creationStart : null,
            creationEnd   : null
        };
    }

    //---------TOOLS---------

    self.getSelectedCount = function () {
        return Object.keys(self.table.selected).length;
    };

    $scope.$watch('CloudProjectComputeVolumeCtrl.table.selected', function () {
        //if some line were not removed => recheck
        self.toggle.openDeleteMultiConfirm = false;
        if (self.table.autoSelected.length) {
            angular.forEach(Object.keys(self.table.selected), function (volumeId) {
                if (self.table.selected[volumeId] === false) {
                    delete self.table.selected[volumeId];
                } else {
                    var isInVolumeTable = _.find(self.table.volume, function (volume) {
                        return volume.id === volumeId && volume.status === 'active';
                    });
                    if (isInVolumeTable && self.table.selected[volumeId]){
                        self.table.selected[volumeId] = true;
                    }
                }
            });
            self.table.autoSelected = [];
        }else {
            self.toggle.openDeleteMultiConfirm = false;
        }
    }, true);

    self.toggleDeleteMultiConfirm = function(){
        if (self.toggle.openDeleteMultiConfirm) {
            self.table.selected = {};
        }
        self.toggle.volumeDeleteId = null;
        self.toggle.openDeleteMultiConfirm = !self.toggle.openDeleteMultiConfirm;
    };

    $scope.$watch('CloudProjectComputeVolumeCtrl.table.volumeFilterPage', function (pageVolumes) {
        self.table.volumeFilterCheckboxPage = _.filter(pageVolumes, function (volume) {
            return volume.getStatusGroup() === 'ACTIVE' && !volume.snapshotted;
        });
    });

    //---------SEARCH BAR---------

    self.toggleSearchBar = function () {
        if (self.search.open) {
            self.search.open = false;
        } else {
            initSearchBar(); //because if init is launch in if instead else, leave animation not work.
            self.search.open = true;
        }
    };

    $scope.$watch('CloudProjectComputeVolumeCtrl.search', function () {
        //otherwise filterVolume launched before form validation
        $timeout(function(){
            filterVolume();
        }, 0);
    }, true);

    function filterVolume () {
        if ($scope.searchVolumeForm && $scope.searchVolumeForm.$valid) {
            var tab = self.table.volume;

            if (self.search.open) {
                tab = _.filter(self.table.volume, function (volume) {
                    var result = true;

                    if (self.search.name && volume.name) {
                        result = result && volume.name.toLowerCase().indexOf(self.search.name.toLowerCase()) !== -1;
                    }
                    if (self.search.minDisk) {
                        result = result && self.search.minDisk <= volume.size;
                    }
                    if (self.search.creationStart) {
                        result = result && moment(self.search.creationStart) <= moment(volume.creationDate);
                    }
                    if (self.search.creationEnd) {
                        result = result && moment(self.search.creationEnd) > moment(volume.creationDate);
                    }

                    return result;
                });
            }

            self.table.volumeFilter = tab;
            self.table.volumeFilterCheckbox = _.filter(tab, function (volume) {
                return volume.getStatusGroup() === 'ACTIVE' && !volume.snapshotted;
            });

            if (self.table.volumeFilter.length){
                self.orderBy();
            }
        }
    }

    //---------ORDER---------

    self.orderBy = function (by) {
        if (by) {
            if (self.order.by === by) {
                self.order.reverse = !self.order.reverse;
            } else {
                self.order.by = by;
            }
        }
        var orderByExpression = self.order.by !== 'price' ? self.order.by : function (volume) {
            return volume.calculatePrice().monthlyPrice.value;
        };

        self.table.volumeFilter = orderBy(self.table.volumeFilter, orderByExpression, self.order.reverse);
        self.table.volumeFilterCheckbox = _.filter(self.table.volumeFilter, function (volume) {
            return volume.getStatusGroup() === 'ACTIVE' && !volume.snapshotted;
        });
    };

    //---------VOLUME---------

    self.getVolume = function (clearCache) {
        if (!self.loaders.table.volume) {
            self.table.volume = [];
            self.table.instance = [];
            self.toggle.volumeDeleteId = null;
            self.loaders.table.volume = true;
            if (clearCache){
                CloudProjectVolume.Lexi().resetQueryCache();
            }

            $q.all([
                // GET INSTANCES DETAILS
                CloudProjectInstance.Lexi().query({
                    serviceName : serviceName
                }).$promise.then(function (instanceList) {
                    self.table.instance = instanceList;
                }),
                // GET VOLUMES DETAILS
                CloudProjectOrchestrator.initVolumes({
                        serviceName : serviceName
                }).then(function (volumeList) {
                    self.table.volume = getVolumeListDetailed(volumeList);
                    self.table.groupVolume = volumeList;
                }),
                CloudProjectVolumeSnapshot.Lexi().query({
                    serviceName : serviceName
                }).$promise.then(function (snapshotList) {
                    self.table.snapshots = snapshotList;
                })
            ]).then(function () {
                return setDetails().then(function () {
                    filterVolume(); //orderBy is call by filterVolume();
                });
            }, function (err) {
                self.table.volume = null;
                self.table.instance = null;
                self.table.snapshots = null;
                Toast.error( [$translate.instant('cpc_volume_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.table.volume = false;
            });
        }
    };

    // need to watch grouped volume by instance change because volume tabs use an array of volume and not object...
    $scope.$watch('CloudProjectComputeVolumeCtrl.table.groupVolume', function (newVal, oldVal) {
        if (oldVal && newVal) {
            self.table.volume = getVolumeListDetailed(newVal);
            // to update total price and volume
            setDetails().then(function () {
                filterVolume(); //orderBy is call by filterVolume();
            });
        }
    }, true);

    self.createNewVolume = function () {
        Toast.info($translate.instant('cpc_volume_create_volume_button_info'));
        $timeout(function() {
            $state.go("iaas.pci-project.compute.infrastructure", {
                createNewVolume: true
            });
        }, 99);
    };

    self.deleteVolume = function (volume) {
        if (!self.loaders.remove.volume) {
            self.loaders.remove.volume = true;
            deleteVolume(volume.id).then(function () {
                self.getVolume(true);
                Toast.success($translate.instant('cpc_volume_delete_success'));
            }, function (err) {
                Toast.error( [$translate.instant('cpc_volume_delete_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.remove.volume = false;
            });
        }
    };

    self.deleteMultiVolume = function () {
        var tabDelete = [],
            nbSelected  = self.getSelectedCount();

        self.loaders.remove.volumeMulti = true;

        angular.forEach(self.table.selected, function (value, volumeId){
            tabDelete.push(deleteVolume(volumeId).then(function(){
                return null;
            }, function (error){
                return $q.reject({id : volumeId, error : error.data});
            }));
        });

        $q.allSettled(tabDelete).then(function (){
            if (nbSelected > 1) {
                Toast.success($translate.instant('cpc_volume_delete_success_plural', {nbVolumes: nbSelected}));
            }else {
                Toast.success($translate.instant('cpc_volume_delete_success'));
            }
        }, function (error){
            var tabError = error.filter(function (val) {
                return val !== null;
            });

            self.table.autoSelected = _.pluck(tabError, 'id');
            if (tabError.length > 1) {
                Toast.error($translate.instant('cpc_volume_delete_error_plural', {nbVolumes: tabError.length}));
            } else {
                Toast.error($translate.instant('cpc_volume_delete_error_one'));
            }
        })['finally'](function(){
            self.getVolume(true);
            self.loaders.remove.volumeMulti = false;
        });
    };

    function getVolumeListDetailed (volumeList) {
        var tab = [];
        angular.forEach(volumeList.volumes, function (vols) {
            angular.forEach(vols, function (vol) {
                tab.push(vol);
            });
        });
        return tab;
    }

    function setDetails () {
        var fullInfosQueue = [], tmpInstanceDetail, firstVolumePrice;
        angular.forEach(self.table.volume, function (volume) {
            fullInfosQueue.push(volume.getFullInformations());
        });

        return $q.all(fullInfosQueue).then(function () {
            // reset total resume
            self.totalResume.capacity = 0;
            self.totalResume.price.value = 0;
            self.totalResume.price.text = 0;
            self.totalResume.price.currencyCode = 0;

            angular.forEach(self.table.volume, function (volume) {
                volume.attachedToDetails = [];
                // calculate total capacity
                self.totalResume.capacity += volume.size;
                // calculate total price value
                self.totalResume.price.value += volume.calculatePrice().monthlyPrice.value;

                angular.forEach(volume.attachedTo, function (instanceId) {
                    tmpInstanceDetail = _.find(self.table.instance, { id : instanceId });
                    if (tmpInstanceDetail) {
                        volume.attachedToDetails.push(tmpInstanceDetail.name);
                    }
                });

                // check if the volume is linked to one or more snapshots
                volume.snapshotted = _.find(self.table.snapshots, { volumeId: volume.id }) ? true : false;
            });

            if (self.table.volume.length) {
                firstVolumePrice = self.table.volume[0].calculatePrice();
                // set good total price
                self.totalResume.price.text = firstVolumePrice.monthlyPrice.text.replace(/\d+(?:[.,]\d+)?/, "" + self.totalResume.price.value.toFixed(2));
                self.totalResume.price.currencyCode = firstVolumePrice.monthlyPrice.currencyCode;
            }
        });
    }

    function deleteVolume (volumeId) {
        return CloudProjectVolume.Lexi().remove({serviceName : serviceName, volumeId: volumeId}).$promise;
    }

    init();
  });
