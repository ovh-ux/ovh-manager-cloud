angular.module('managerApp')
  .controller('BillingArchiveStorageListComponentCtrl', class BillingArchiveStorageListComponentCtrl {
    /* @ngInject */
    constructor($q, $translate, OvhApiMe, RegionService, Toast) {
      this.$q = $q;
      this.$translate = $translate;
      this.OvhApiMe = OvhApiMe;
      this.RegionService = RegionService;
      this.Toast = Toast;
    }

    $onInit() {
      this.loading = true;
      this.currencySymbol = '';
      this.isConsumptionEmpty = _.isEmpty(this.storages);

      return this.initUserCurrencySymbol()
        .catch((err) => {
          this.Toast.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }

    initUserCurrencySymbol() {
      return this.OvhApiMe.v6().get().$promise.then((me) => {
        this.currencySymbol = me.currency.symbol;
      });
    }

    getPrice(consumptionType) {
      return `${_.get(consumptionType, 'price.value', 0).toFixed(2)} ${this.currencySymbol}`;
    }

    getStorageVolumeInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_consumption_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_consumption_info_part2', {
          amount: _.get(storage, 'stored.quantity.value', 0),
        }));
    }

    getStorageOutgoingBandwidthInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_output_traffic_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_output_traffic_info_part2', {
          amount: _.get(storage, 'outgoingBandwidth.quantity.value', 0),
        }));
    }

    getStorageIncomingBandwidthInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_input_traffic_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_input_traffic_info_part2', {
          amount: _.get(storage, 'incomingBandwidth.quantity.value', 0),
        }));
    }
  });
