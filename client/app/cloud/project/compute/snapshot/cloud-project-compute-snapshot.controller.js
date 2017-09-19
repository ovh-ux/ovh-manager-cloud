"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeSnapshotCtrl",
    function (OvhApiCloudPrice, OvhApiCloudProjectSnapshot, OvhApiCloudProjectInstance, OvhApiCloudProjectVolume, OvhApiCloudProjectVolumeSnapshot,
              OvhApiCloudProjectImage, $translate, CloudMessage, $scope, $filter, $q, $timeout, CloudProjectOrchestrator, $state,
              $stateParams, Poller, RegionService, CLOUD_UNIT_CONVERSION) {

    var self = this,
        serviceName = $stateParams.projectId,
        instances = [],
        images = [],
        orderBy = $filter('orderBy');

    self.regionService = RegionService;
    //Datas
    self.table = {
        snapshot       : [],
        snapshotFilter : [],
        snapshotFilterCheckbox : [],
        snapshotFilterCheckboxPage : [],
        selected       : {},
        autoSelected   : []
    };

    self.toggle = {
        snapshotDeleteId     : null,   //Curent snapshot to delete
        openDeleteMultiConfirm : false
    };

    //Loader during Datas requests
    self.loaders = {
        table : {
            snapshot : false
        },
        remove : {
            snapshot : false,
            snapshotMulti : false
        }
    };

    self.order = {
        by      : 'creationDate',
        reverse : true
    };

    self.GIBIBYTE_TO_BYTE = CLOUD_UNIT_CONVERSION.GIBIBYTE_TO_BYTE;

    function init () {
        self.getSnapshot(true); // set clear cache to true because we need fresh data
        initSearchBar();
    }

    function initSearchBar () {
        self.search = {
            open: false,
            name: null,
            size: null,
            creationStart: null,
            creationEnd: null
        };
    }
    self.snapshotPriceStruct = {
        prices:[],
        size:0,
        total:{}
    };


    function setPrice(){
        var totalSize = 0,
        total = {};
        angular.forEach(self.table.snapshot, function(value){
            totalSize += value.size;
            value.price = getPrice(value.size);
        });
        total.price = getPrice(totalSize);
        self.snapshotPriceStruct.size = totalSize;
        self.snapshotPriceStruct.total = total;
    }

    function getPrice(size){
        // get the price for first location comming
        var priceStruct = angular.copy(self.snapshotPriceStruct.prices[0].monthlyPrice);
        // price for all size
        priceStruct.value = priceStruct.value*size;

        priceStruct.text = priceStruct.text.replace(/\d+(?:[.,]\d+)?/, "" + priceStruct.value.toFixed(2));

        return priceStruct;
    }

    //---------TOOLS---------

    self.getSelectedCount = function () {
        return Object.keys(self.table.selected).length;
    };

    $scope.$watch('CloudProjectComputeSnapshotCtrl.table.snapshotFilterPage', function (pageSnapshots) {
        self.table.snapshotFilterCheckboxPage = _.filter(pageSnapshots, function (snapshot) {
            return (snapshot.status === 'active' || snapshot.status === 'available') && !snapshot.isInstalledOnVm;
        });
    });

    $scope.$watch('CloudProjectComputeSnapshotCtrl.table.selected', function () {
        //if some line were not removed => recheck
        self.toggle.openDeleteMultiConfirm = false;
        if (self.table.autoSelected.length) {
            angular.forEach(self.table.autoSelected, function (snapshotId) {
                var isInSnapshotTable = _.findIndex(self.table.snapshot, function (snapshot) {
                    return snapshot.id === snapshotId;
                });
                if (isInSnapshotTable >= 0){
                    self.table.selected[snapshotId] = true;
                }
            });
            self.table.autoSelected = [];
        } else {
            self.toggle.openDeleteMultiConfirm = false;
        }
    }, true);

    self.toggleDeleteMultiConfirm = function(){
        if (self.toggle.openDeleteMultiConfirm) {
            self.table.selected = {};
        }
        self.toggle.snapshotDeleteId = null;
        self.toggle.openDeleteMultiConfirm = !self.toggle.openDeleteMultiConfirm;
    };

    //---------SEARCH BAR---------

    self.toggleSearchBar = function () {
        if (self.search.open) {
            self.search.open = false;
        } else {
            initSearchBar(); //because if init is launch in if instead else, leave animation not work.
            self.search.open = true;
        }
    };

    $scope.$watch('CloudProjectComputeSnapshotCtrl.search', function () {
        //otherwise filterSnapshot launched before form validation
        $timeout(function(){
            filterSnapshot();
        }, 0);
    }, true);

    function filterSnapshot () {
        if ($scope.searchSnapshotForm && $scope.searchSnapshotForm.$valid) {
            var tab = self.table.snapshot;
            if (self.search.open) {
                tab = _.filter(self.table.snapshot, function (snapshot) {
                    var result = true;

                    if (self.search.name && snapshot.name) {
                        result = result && snapshot.name.toLowerCase().indexOf(self.search.name.toLowerCase()) !== -1;
                    }
                    if (self.search.size) {
                        result = result && self.search.size >= Math.round(snapshot.size * 100) / 100;
                    }
                    if (self.search.creationStart) {
                        result = result && moment(self.search.creationStart) <= moment(snapshot.creationDate);
                    }
                    if (self.search.creationEnd) {
                        result = result && moment(self.search.creationEnd) > moment(snapshot.creationDate);
                    }

                    return result;
                });
            }

            self.table.snapshotFilter = tab;
            self.table.snapshotFilterCheckbox = _.filter(tab, function (snapshot) {
                return (snapshot.status === 'active' || snapshot.status === 'available') && !snapshot.isInstalledOnVm;
            });


            if (self.table.snapshotFilter.length){
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
        self.table.snapshotFilter = orderBy(self.table.snapshotFilter, self.order.by, self.order.reverse);
        self.table.snapshotFilterCheckbox = orderBy(self.table.snapshotFilterCheckbox, self.order.by, self.order.reverse);
    };

    function pollSnapshots () {
        Poller.poll('/cloud/project/' + serviceName + '/snapshot',
            null,
            {
                successRule: function (snapshots) {
                    return _.every(snapshots, function (snapshots) {return snapshots.status === 'active';});
                },
                namespace: 'cloud.snapshots',
                notifyOnError : false
            }
        ).then(function (snapshotList) {
            OvhApiCloudProjectSnapshot.Lexi().resetQueryCache();
            // get volume snapshots and concat new state instance snapshots
            var volumeSnapshots = _.filter(self.table.snapshot, { type : "volume" } );
            self.table.snapshot = snapshotList.concat(volumeSnapshots);
            checkImageInstalled();
            filterSnapshot(); //orderBy is call by filterSnapshot();
            setPrice();
        }, function (err) {
            if (err && err.status) {
                self.table.snapshot = _.filter(self.table.snapshot, { type : "volume" } );
                CloudMessage.error( [$translate.instant('cpc_snapshot_error'), err.data && err.data.message || ''].join(' '));
            }
        }, function(snapshotList){
            var currentImageSnapshots = _.filter(self.table.snapshot, function (snapshot) { return snapshot.type !== "volume";} );
            if (currentImageSnapshots.length!==snapshotList.length || snapshotStateChange(self.table.snapshot, snapshotList)) {
                OvhApiCloudProjectSnapshot.Lexi().resetQueryCache();
                var volumeSnapshots = _.filter(self.table.snapshot, { type : "volume" } );
                self.table.snapshot = snapshotList.concat(volumeSnapshots);
                checkImageInstalled();
                filterSnapshot(); //orderBy is call by filterSnapshot();
                setPrice();
            }
        });
    }

    function pollVolumeSnapshots () {
        Poller.poll('/cloud/project/' + serviceName + '/volume/snapshot',
            null,
            {
                successRule: function (snapshots) {
                    return _.every(snapshots, function (snapshots) {return snapshots.status === 'available';});
                },
                namespace: 'cloud.snapshots',
                notifyOnError : false
            }
        ).then(function (snapshotList) {
            OvhApiCloudProjectVolumeSnapshot.Lexi().resetAllCache();
            // get instance snapshots and concat new state volume snapshots
            var imageSnapshots = _.filter(self.table.snapshot, function (snapshot) { return snapshot.type !== "volume";} );
            var snapshots = checkImagesCustom (snapshotList);
            self.table.snapshot = imageSnapshots.concat(mapVolumeSnapshots(snapshots));
            filterSnapshot(); //orderBy is call by filterSnapshot();
            setPrice();
        }, function (err) {
            if (err && err.status) {
                self.table.snapshot = _.filter(self.table.snapshot, function (snapshot) { return snapshot.type !== "volume";} );
                CloudMessage.error( [$translate.instant('cpc_snapshot_error'), err.data && err.data.message || ''].join(' '));
            }
        }, function(snapshotList){
            var currentVolumeSnapshots = _.filter(self.table.snapshot, { type : "volume" } );
            if (currentVolumeSnapshots.length!==snapshotList.length || snapshotStateChange(self.table.snapshot, snapshotList)) {
                OvhApiCloudProjectVolumeSnapshot.Lexi().resetAllCache();
                var imageSnapshots = _.filter(self.table.snapshot, function (snapshot) { return snapshot.type !== "volume";} );
                var snapshots = checkImagesCustom (snapshotList);
                self.table.snapshot = imageSnapshots.concat(mapVolumeSnapshots(snapshots));
                filterSnapshot(); //orderBy is call by filterSnapshot();
                setPrice();
            }
        });
    }

    $scope.$on('$destroy', function () {
        Poller.kill({ namespace: 'cloud.snapshots' });
    });

    function snapshotStateChange(oldSnapshots, newSnapshots){
        var stateChanged = false;
        _.forEach(newSnapshots, function (snapshot) {
            var old = _.find(oldSnapshots, {'id':snapshot.id});
            stateChanged = stateChanged || !old || old.status !== snapshot.status;
        });
        return stateChanged;
    }

    // transform snapshot type > snapshot is an image custom if this present in image as private
    function checkImagesCustom (snapshots) {
        return _.map(snapshots, function(snapshot) {
            return _.assign(snapshot, {
                type: (_.find(images, {id : snapshot.id, visibility : 'private'}) ? "image" : "" ) + snapshot.type
            });
        });
    }

    //---------SNAPSHOT---------

    self.getSnapshot = function (clearCache) {
        if (!self.loaders.table.snapshot) {
            self.table.snapshot = [];
            self.toggle.snapshotDeleteId = null;
            self.loaders.table.snapshot = true;
            if (clearCache){
                OvhApiCloudProjectSnapshot.Lexi().resetQueryCache();
                OvhApiCloudProjectInstance.Lexi().resetQueryCache(); // because with check if snapshot is installed on instances
                OvhApiCloudProjectVolume.Lexi().resetAllCache();
            }

            $q.all([getInstancePromise(), getSnapshotPromise(), getPricesPromise(), getVolumeSnapshotPromise(), getImagePromise()]).then(function (result) {
                instances = result[0];
                images = result[4];
                var snapshots = checkImagesCustom (result[1]);
                self.table.snapshot = snapshots.concat(result[3]);
                checkImageInstalled();
                filterSnapshot(); //orderBy is call by filterSnapshot();
                var instanceSnapshotsToPoll = _.filter(self.table.snapshot, function (snapshots) {return  snapshots.type !== 'volume' && snapshots.status !== 'active';}),
                    volumeSnapshotsToPoll = _.filter(self.table.snapshot, function (snapshots) {return snapshots.type === 'volume' && snapshots.status !== 'available';});
                if (instanceSnapshotsToPoll) {
                    pollSnapshots();
                }
                if (volumeSnapshotsToPoll) {
                    pollVolumeSnapshots();
                }
                self.snapshotPriceStruct.prices = result[2].snapshots;
                setPrice();
            }, function (err) {
                self.table.snapshot = null;
                CloudMessage.error( [$translate.instant('cpc_snapshot_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.table.snapshot = false;
            });
        }
    };

    function getInstancePromise(){
        return OvhApiCloudProjectInstance.Lexi().query({
                serviceName : serviceName
            }).$promise;
    }

    function getSnapshotPromise(){
        return OvhApiCloudProjectSnapshot.Lexi().query({
                serviceName : serviceName
            }).$promise;
    }

    function getImagePromise(){
        return OvhApiCloudProjectImage.Lexi().query({
                serviceName : serviceName
            }).$promise;
    }

    function getPricesPromise(){
        return OvhApiCloudPrice.Lexi().query().$promise;
    }

    function getVolumeSnapshotPromise(){
        return OvhApiCloudProjectVolumeSnapshot.Lexi().query({
            serviceName : serviceName
        }).$promise.then(function (result) {
            return mapVolumeSnapshots(result);  //transform
        });
    }

    function mapVolumeSnapshots (snapshots) {
        return _.map(snapshots, function(volumeSnapshot) {
            return _.assign(volumeSnapshot, {
                visibility: "private",
                size: volumeSnapshot.size,
                type: "volume"
            });
        });
    }

    function checkImageInstalled(){
        angular.forEach(self.table.snapshot, function(snapshot){
            snapshot.isInstalledOnVm = !!_.find(instances, {imageId:snapshot.id});
            snapshot.installedVm = _.filter(instances, { imageId : snapshot.id });
            snapshot.installedVmNames = _.pluck(snapshot.installedVm, 'name');
        });
    }

    self.createVmBySnapshot = function(snapshot){
        CloudMessage.info($translate.instant('cpc_snapshot_create_vm_button_info'));
        CloudProjectOrchestrator.askToCreateInstanceFromSnapshot(snapshot);
        $state.go('iaas.pci-project.compute.infrastructure');
    };

    self.createVolumeBySnapshot = function (snapshot) {
        CloudMessage.info($translate.instant("cpc_snapshot_create_volume_button_info"));
        $timeout(function() {
            $state.go("iaas.pci-project.compute.infrastructure", {
                createNewVolumeFromSnapshot: {
                    snapshot: snapshot
                }
            });
        }, 99);
    };

    self.deleteSnapshot = function (snapshot) {
        if (!self.loaders.remove.snapshot) {
            self.loaders.remove.snapshot = true;
            var promiseDelete = snapshot.type==="volume" ?
                deleteVolumeSnapshot(snapshot.id) : deleteSnapshot(snapshot.id);
            promiseDelete.then(function () {
                self.getSnapshot(true);
                CloudMessage.success($translate.instant('cpc_snapshot_delete_success'));
                pollSnapshots();
                pollVolumeSnapshots();
            }, function (err) {
                CloudMessage.error( [$translate.instant('cpc_snapshot_delete_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.remove.snapshot = false;
            });
        }
    };

    self.deleteMultiSnapshot = function () {
        var tabDelete = [],
            nbSelected  = self.getSelectedCount();

        self.loaders.remove.snapshotMulti = true;

        angular.forEach(self.table.selected, function (value, snapshotId){
            var snapshot = _.find(self.table.snapshot, {id : snapshotId});
            if (snapshot) {
                var promiseDelete = snapshot.type==="volume" ?
                    deleteVolumeSnapshot(snapshot.id) : deleteSnapshot(snapshot.id);
                tabDelete.push(promiseDelete.then(function(){
                    return null;
                }, function (error){
                    return $q.reject({id : snapshotId, error : error.data});
                }));
            }
        });

        $q.allSettled(tabDelete).then(function (){
            if (nbSelected > 1) {
                CloudMessage.success($translate.instant('cpc_snapshot_delete_success_plural', {nbSnapshots: nbSelected}));
            }else {
                CloudMessage.success($translate.instant('cpc_snapshot_delete_success'));
            }
        }, function (error){
            var tabError = error.filter(function (val) {
                return val !== null;
            });
            self.table.autoSelected = _.pluck(tabError, 'id');
            if (tabError.length > 1) {
                CloudMessage.error($translate.instant('cpc_snapshot_delete_error_plural', {nbSnapshots: tabError.length}));
            } else {
                CloudMessage.error($translate.instant('cpc_snapshot_delete_error_one'));
            }
        })['finally'](function(){
            //self.table.selected = {};
            self.getSnapshot(true);
            self.loaders.remove.snapshotMulti = false;
        });
    };

    function deleteSnapshot (snapshotId) {
        return OvhApiCloudProjectSnapshot.Lexi().remove({
            serviceName : serviceName,
            snapshotId: snapshotId
        }).$promise;
    }

    function deleteVolumeSnapshot (snapshotId) {
        return OvhApiCloudProjectVolumeSnapshot.Lexi().delete({
            serviceName : serviceName,
            snapshotId: snapshotId
        }).$promise;
    }

    init();

  });
