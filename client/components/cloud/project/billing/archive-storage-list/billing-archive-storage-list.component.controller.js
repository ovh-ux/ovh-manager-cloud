angular.module('managerApp')
  .controller('BillingArchiveStorageListComponentCtrl', class BillingArchiveStorageListComponentCtrl {
    /* @ngInject */
    constructor($q, $filter, $translate, OvhApiMe, Toast, RegionService) {
      this.$q = $q;
      this.$filter = $filter;
      this.$translate = $translate;
      this.OvhApiMe = OvhApiMe;
      this.Toast = Toast;
      this.RegionService = RegionService;
    }

    $onInit() {
      this.loading = true;
      this.currencySymbol = '';

      this.$q.all([this.initUserCurrency()])
        .catch((err) => {
          this.Toast.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }

    initUserCurrency() {
      return this.OvhApiMe.v6().get().$promise.then((me) => {
        this.currencySymbol = me.currency.symbol;
      });
    }

    getStorageVolumeInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_consumption_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_consumption_info_part2', {
          amount: (storage.stored ? storage.stored.quantity.value : 0),
        }));
    }

    getStorageOutgoingBandwidthInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_output_traffic_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_output_traffic_info_part2', {
          amount: (storage.outgoingBandwidth ? storage.outgoingBandwidth.quantity.value : 0),
        }));
    }

    getStorageIncomingBandwidthInfoTooltip(storage) {
      return this.$translate.instant('cpbc_archive_storage_input_traffic_info_part1')
        .concat(this.$translate.instant('cpbc_archive_storage_input_traffic_info_part2', {
          amount: (storage.incomingBandwidth ? storage.incomingBandwidth.quantity.value : 0),
        }));
    }
  });
