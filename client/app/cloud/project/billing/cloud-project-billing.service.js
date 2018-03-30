"use strict";

angular.module("managerApp")
    .service("CloudProjectBillingService", function ($q, OvhApiMe) {
            var self = this;

            self.getConsumptionDetails = function (hourlyBillingInfo, monthlyBillingInfo) {
                return self.getDataInitialized()
                    .then(function () {
                        self.data.hourlyBilling = hourlyBillingInfo;
                        self.data.monthlyBilling = monthlyBillingInfo;
                        return $q.allSettled([initHourlyInstanceList(), initMonthlyInstanceList(), initObjectStorageList(), initArchiveStorageList(), initSnapshotList(), initVolumeList()])
                            .then(function () {
                                self.data.totals.monthly.total = roundNumber(self.data.totals.monthly.instance, 2);
                                self.data.totals.hourly.total = roundNumber(self.data.totals.hourly.instance + self.data.totals.hourly.snapshot + self.data.totals.hourly.objectStorage + self.data.totals.hourly.archiveStorage + self.data.totals.hourly.volume, 2);
                                self.data.totals.total = roundNumber(self.data.totals.monthly.total + self.data.totals.hourly.total, 2);
                                return self.data;
                            });
                    });
            };

            self.getDataInitialized = function () {
                self.data =  {
                    hourlyInstances: [],
                    monthlyInstances: [],
                    objectStorages: [],
                    archiveStorages: [],
                    snapshots: [],
                    volumes: [],
                    billing: {},
                    totals: {
                        total: 0,
                        currencySymbol: "",
                        hourly: {
                            total: 0,
                            instance: 0,
                            objectStorage: 0,
                            archiveStorage: 0,
                            snapshot: 0,
                            volume: 0
                        },
                        monthly: {
                            total: 0,
                            instance: 0
                        }
                    }
                };
                return OvhApiMe.v6().get().$promise.then(function (me) {
                    self.data.totals.currencySymbol = me.currency.symbol;
                    return self.data;
                });
            };

            function initHourlyInstanceList () {
                if (!self.data.hourlyBilling || !self.data.hourlyBilling.hourlyUsage) {
                    return;
                }
                var hourlyInstances = _.flatten(_.map(self.data.hourlyBilling.hourlyUsage.instance, function (instance) {
                    return _.map(instance.details, function (detail) {
                        var newDetail = _.clone(detail);
                        newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
                        return _.extend(newDetail, { reference: instance.reference, region: instance.region });
                    });
                }));
                self.data.hourlyInstances = hourlyInstances;
                self.data.totals.hourly.instance = _.reduce(self.data.hourlyBilling.hourlyUsage.instance, function (sum, instance) {
                    return sum + roundNumber(instance.totalPrice, 2);
                }, 0);
                self.data.totals.hourly.instance = roundNumber(self.data.totals.hourly.instance, 2);
            }

            function initMonthlyInstanceList () {
                if (!self.data.monthlyBilling || !self.data.hourlyBilling.monthlyUsage) {
                    return;
                }
                var monthlyInstances = _.flatten(_.map(self.data.monthlyBilling.monthlyUsage.instance, function (instance) {
                    return _.map(instance.details, function (detail) {
                        var newDetail = _.clone(detail);
                        newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
                        return _.extend(newDetail, { reference: instance.reference, region: instance.region });
                    });
                }));

                self.data.monthlyInstances = monthlyInstances;
                self.data.totals.monthly.instance = _.reduce(self.data.monthlyBilling.monthlyUsage.instance, function (sum, instance) {
                    return sum + roundNumber(instance.totalPrice, 2);
                }, 0);
                self.data.totals.monthly.instance = roundNumber(self.data.totals.monthly.instance, 2);
            }

            function initObjectStorageList () {
                if (!self.data.hourlyBilling || !self.data.hourlyBilling.hourlyUsage) {
                    return;
                }
                _.each(self.data.hourlyBilling.hourlyUsage.objectStorage, function (objectStorage) {
                    objectStorage.totalPrice = roundNumber(objectStorage.totalPrice, 2);
                });

                self.data.objectStorages = _.reject(self.data.hourlyBilling.hourlyUsage.storage, { "type": "pca" });
                self.data.totals.hourly.objectStorage = _.reduce(self.data.objectStorages, function (sum, storage) {
                    return sum + roundNumber(storage.totalPrice, 2);
                }, 0);
                self.data.totals.hourly.objectStorage = roundNumber(self.data.totals.hourly.objectStorage, 2);
            }

            function initArchiveStorageList () {
                if (!self.data.hourlyBilling || !self.data.hourlyBilling.hourlyUsage) {
                    return;
                }
                _.each(self.data.hourlyBilling.hourlyUsage.archiveStorage, function (archiveStorage) {
                    archiveStorage.totalPrice = roundNumber(archiveStorage.totalPrice, 2);
                });

                self.data.archiveStorages = _.filter(self.data.hourlyBilling.hourlyUsage.storage, { "type": "pca" });
                self.data.totals.hourly.archiveStorage = _.reduce(self.data.archiveStorages, function (sum, archiveStorage) {
                    return sum + roundNumber(archiveStorage.totalPrice, 2);
                }, 0);
                self.data.totals.hourly.archiveStorage = roundNumber(self.data.totals.hourly.archiveStorage, 2);
            }

            function initSnapshotList () {
                if (!self.data.hourlyBilling || !self.data.hourlyBilling.hourlyUsage) {
                    return;
                }
                _.each(self.data.hourlyBilling.hourlyUsage.snapshot, function (snapshot) {
                    snapshot.totalPrice = roundNumber(snapshot.totalPrice, 2);
                });

                self.data.snapshots = self.data.hourlyBilling.hourlyUsage.snapshot;
                self.data.totals.hourly.snapshot = _.reduce(self.data.hourlyBilling.hourlyUsage.snapshot, function (sum, snapshot) {
                    return sum + roundNumber(snapshot.totalPrice, 2);
                }, 0);
                self.data.totals.hourly.snapshot = roundNumber(self.data.totals.hourly.snapshot, 2);
            }

            function initVolumeList () {
                if (!self.data.hourlyBilling || !self.data.hourlyBilling.hourlyUsage) {
                    return;
                }
                var volumes = _.flatten(_.map(self.data.hourlyBilling.hourlyUsage.volume, function (volume) {
                    return _.map(volume.details, function (detail) {
                        var newDetail = _.clone(detail);
                        newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
                        return _.extend(newDetail, { type: volume.type, region: volume.region });
                    });
                }));

                self.data.volumes = volumes;
                self.data.totals.hourly.volume = _.reduce(self.data.hourlyBilling.hourlyUsage.volume, function (sum, volume) {
                    return sum + roundNumber(volume.totalPrice, 2);
                }, 0);
                self.data.totals.hourly.volume = roundNumber(self.data.totals.hourly.volume, 2);
            }

            function roundNumber (number, decimals) {
                return Number((Math.round(number + "e" + decimals)  + "e-" + decimals));
            }
        }
    );
