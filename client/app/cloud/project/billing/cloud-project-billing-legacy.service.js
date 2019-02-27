angular.module('managerApp')
  .service('CloudProjectBillingLegacyService', function CloudProjectBillingLegacyService($q, OvhApiMe) {
    const self = this;

    function roundNumber(number, decimals) {
      return Number((`${Math.round(`${number}e${decimals}`)}e-${decimals}`));
    }

    function getEmptyConsumption(key) {
      return ({
        [key]: [],
        total: 0,
      });
    }

    function initHourlyInstanceList(consumptionDetails) {
      if (!_.get(consumptionDetails, 'hourlyBilling') || !_.get(consumptionDetails, 'hourlyBilling.hourlyUsage')) {
        return getEmptyConsumption('hourlyInstances');
      }
      const hourlyInstances = _.flatten(_.map(
        _.get(consumptionDetails, 'hourlyBilling.hourlyUsage.instance'),
        instance => _.map(instance.details, (detail) => {
          const newDetail = _.clone(detail);
          newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
          return _.extend(newDetail, { reference: instance.reference, region: instance.region });
        }),
      ));
      const hourlyInstancesTotal = _.reduce(
        _.get(consumptionDetails, 'hourlyBilling.hourlyUsage.instance'),
        (sum, instance) => sum + roundNumber(instance.totalPrice, 2), 0,
      );

      return ({ hourlyInstances, total: roundNumber(hourlyInstancesTotal, 2) });
    }

    function initMonthlyInstanceList(consumptionDetails) {
      if (!_.get(consumptionDetails, 'monthlyBilling') || !_.get(consumptionDetails, 'monthlyBilling.monthlyUsage')) {
        return getEmptyConsumption('monthlyInstances');
      }

      const monthlyInstances = _.flatten(_.map(
        _.get(consumptionDetails, 'monthlyBilling.monthlyUsage.instance'),
        instance => _.map(instance.details, (detail) => {
          const newDetail = _.clone(detail);
          newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
          return _.extend(newDetail, { reference: instance.reference, region: instance.region });
        }),
      ));

      const monthlyTotal = _.reduce(
        _.get(consumptionDetails, 'monthlyBilling.monthlyUsage.instance'),
        (sum, instance) => sum + roundNumber(instance.totalPrice, 2),
        0,
      );

      return ({
        monthlyInstances,
        total: roundNumber(monthlyTotal, 2),
      });
    }

    function initObjectStorageList(consumptionDetails) {
      if (!consumptionDetails.hourlyBilling || !consumptionDetails.hourlyBilling.hourlyUsage) {
        return getEmptyConsumption('objectStorages');
      }

      const objectStorages = _.reject(
        _.map(
          consumptionDetails.hourlyBilling.hourlyUsage.storage,
          objectStorage => _.set(objectStorage, 'totalPrice', roundNumber(objectStorage.totalPrice, 2)),
        ), { type: 'pca' },
      );

      const objectStorageTotal = _.reduce(
        objectStorages,
        (sum, storage) => sum + roundNumber(storage.totalPrice, 2),
        0,
      );

      return ({
        objectStorages,
        total: roundNumber(objectStorageTotal, 2),
      });
    }

    function initArchiveStorageList(consumptionDetails) {
      if (!consumptionDetails.hourlyBilling || !consumptionDetails.hourlyBilling.hourlyUsage) {
        return getEmptyConsumption('archiveStorages');
      }

      const archiveStorages = _.filter(
        _.map(
          consumptionDetails.hourlyBilling.hourlyUsage.storage,
          objectStorage => _.set(objectStorage, 'totalPrice', roundNumber(objectStorage.totalPrice, 2)),
        ), { type: 'pca' },
      );
      const archiveStorageTotal = _.reduce(
        archiveStorages,
        (sum, archiveStorage) => sum + roundNumber(archiveStorage.totalPrice, 2),
        0,
      );

      return ({
        archiveStorages,
        total: roundNumber(archiveStorageTotal, 2),
      });
    }

    function initSnapshotList(consumptionDetails) {
      if (!consumptionDetails.hourlyBilling || !consumptionDetails.hourlyBilling.hourlyUsage) {
        return getEmptyConsumption('snapshots');
      }

      const snapshots = _.map(
        consumptionDetails.hourlyBilling.hourlyUsage.snapshot,
        snapshot => _.set(snapshot, 'totalPrice', roundNumber(snapshot.totalPrice, 2)),
      );

      const snapshotTotal = _.reduce(
        consumptionDetails.hourlyBilling.hourlyUsage.snapshot,
        (sum, snapshot) => sum + roundNumber(snapshot.totalPrice, 2),
        0,
      );

      return ({
        snapshots,
        total: roundNumber(snapshotTotal, 2),
      });
    }

    function initVolumeList(consumptionDetails) {
      if (!consumptionDetails.hourlyBilling || !consumptionDetails.hourlyBilling.hourlyUsage) {
        return getEmptyConsumption('volumes');
      }
      const volumes = _.flatten(_.map(
        consumptionDetails.hourlyBilling.hourlyUsage.volume,
        volume => _.map(volume.details, (detail) => {
          const newDetail = _.clone(detail);
          newDetail.totalPrice = roundNumber(newDetail.totalPrice, 2);
          return _.extend(newDetail, { type: volume.type, region: volume.region });
        }),
      ));

      const volumeTotal = _.reduce(
        consumptionDetails.hourlyBilling.hourlyUsage.volume,
        (sum, volume) => sum + roundNumber(volume.totalPrice, 2),
        0,
      );

      return ({
        volumes,
        total: roundNumber(volumeTotal, 2),
      });
    }

    function initInstanceBandwidth(consumptionDetails) {
      if (!consumptionDetails.hourlyBilling || !consumptionDetails.hourlyBilling.hourlyUsage) {
        return getEmptyConsumption('bandwidthByRegions');
      }
      const bandwidthByRegions = _.map(
        consumptionDetails.hourlyBilling.hourlyUsage.instanceBandwidth,
        (bandwidthByRegion) => {
          const newBandwidthByRegion = _.clone(bandwidthByRegion);
          newBandwidthByRegion.outgoingBandwidth.totalPrice = roundNumber(
            newBandwidthByRegion.outgoingBandwidth.totalPrice,
            2,
          );
          if (newBandwidthByRegion.outgoingBandwidth.quantity.value > 0) {
            newBandwidthByRegion.outgoingBandwidth.quantity.value = roundNumber(
              newBandwidthByRegion.outgoingBandwidth.quantity.value,
              2,
            );
          }
          return newBandwidthByRegion;
        },
      );

      const instanceBandwidthTotal = _.reduce(
        consumptionDetails.hourlyBilling.hourlyUsage.instanceBandwidth,
        (sum, bandwidth) => sum + bandwidth.outgoingBandwidth.totalPrice,
        0,
      );

      return ({
        bandwidthByRegions,
        total: roundNumber(instanceBandwidthTotal, 2),
      });
    }

    self.getConsumptionDetails = function getConsumptionDetails(
      hourlyBillingInfo,
      monthlyBillingInfo,
    ) {
      return self.getDataInitialized()
        .then((consumptionDetails) => {
          _.set(consumptionDetails, 'hourlyBilling', hourlyBillingInfo);
          _.set(consumptionDetails, 'monthlyBilling', monthlyBillingInfo);

          return $q
            .all({
              hourlyInstanceList: initHourlyInstanceList(consumptionDetails),
              monthlyInstanceList: initMonthlyInstanceList(consumptionDetails),
              objectStorageList: initObjectStorageList(consumptionDetails),
              archiveStorageList: initArchiveStorageList(consumptionDetails),
              snapshotList: initSnapshotList(consumptionDetails),
              volumeList: initVolumeList(consumptionDetails),
              instanceBandwidthList: initInstanceBandwidth(consumptionDetails),
            })
            .then(({
              hourlyInstanceList,
              monthlyInstanceList,
              objectStorageList,
              archiveStorageList,
              snapshotList,
              volumeList,
              instanceBandwidthList,
            }) => {
              const consumption = {
                hourlyInstances: hourlyInstanceList.hourlyInstances,
                monthlyInstances: monthlyInstanceList.monthlyInstances,
                objectStorages: objectStorageList.objectStorages,
                archiveStorages: archiveStorageList.archiveStorages,
                snapshots: snapshotList.snapshots,
                volumes: volumeList.volumes,
                bandwidthByRegions: instanceBandwidthList.bandwidthByRegions,
                totals: {
                  currencySymbol: consumptionDetails.totals.currencySymbol,
                  hourly: {
                    total: roundNumber(
                      hourlyInstanceList.total
                      + snapshotList.total
                      + objectStorageList.total
                      + archiveStorageList.total
                      + volumeList.total
                      + instanceBandwidthList.total,
                      2,
                    ),
                    instance: hourlyInstanceList.total,
                    objectStorage: objectStorageList.total,
                    archiveStorage: archiveStorageList.total,
                    snapshot: snapshotList.total,
                    volume: volumeList.total,
                    bandwidth: instanceBandwidthList.total,
                  },
                  monthly: {
                    total: roundNumber(monthlyInstanceList.total, 2),
                    instance: monthlyInstanceList.total,
                  },
                },
              };

              Object.assign(consumption.totals, {
                total: roundNumber(
                  consumption.totals.monthly.total + consumption.totals.hourly.total,
                  2,
                ),
              });

              return consumption;
            });
        });
    };

    self.getDataInitialized = function getDataInitialized() {
      const consumptionDetails = {
        hourlyInstances: [],
        monthlyInstances: [],
        objectStorages: [],
        archiveStorages: [],
        snapshots: [],
        volumes: [],
        bandwidthByRegions: [],
        billing: {},
        totals: {
          total: 0,
          currencySymbol: '',
          hourly: {
            total: 0,
            instance: 0,
            objectStorage: 0,
            archiveStorage: 0,
            snapshot: 0,
            volume: 0,
            bandwidth: 0,
          },
          monthly: {
            total: 0,
            instance: 0,
          },
        },
      };
      return OvhApiMe.v6().get().$promise.then((me) => {
        consumptionDetails.totals.currencySymbol = me.currency.symbol;
        return consumptionDetails;
      });
    };
  });
