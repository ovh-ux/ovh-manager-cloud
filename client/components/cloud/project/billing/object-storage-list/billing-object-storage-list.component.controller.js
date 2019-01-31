angular.module('managerApp')
  .controller('BillingObjectStorageListComponentCtrl',
    class {
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
        return this.$q.all([this.initUserCurrency()])
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
        return this.$translate.instant('cpbc_object_storage_consumption_info_part1')
          .concat(this.$translate.instant('cpbc_object_storage_consumption_info_part2', {
            amount: (storage.stored ? storage.stored.quantity.value : 0),
          }));
      }

      getStorageBandwidthInfoTooltip(storage) {
        return this.$translate.instant('cpbc_object_storage_output_traffic_info_part1')
          .concat(this.$translate.instant('cpbc_object_storage_output_traffic_info_part2', {
            amount: storage.outgoingBandwidth.quantity.value,
          }));
      }
    });
