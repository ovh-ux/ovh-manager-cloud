angular.module('managerApp')
  .controller('BillingObjectStorageListComponentCtrl', function ($q, $filter, $translate, OvhApiMe, Toast, CucRegionService) {
    const self = this;
    self.CucRegionService = CucRegionService;

    self.currencySymbol = '';

    self.loading = false;

    function initUserCurrency() {
      return OvhApiMe.v6().get().$promise.then((me) => {
        self.currencySymbol = me.currency.symbol;
      });
    }

    self.$onInit = () => {
      self.loading = true;

      $q.all([initUserCurrency()])
        .catch((err) => {
          Toast.error([$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return $q.reject(err);
        })
        .finally(() => {
          self.loading = false;
        });
    };

    self.getStorageVolumeInfoTooltip = function (storage) {
      return $translate.instant('cpbc_object_storage_consumption_info_part1')
        .concat($translate.instant('cpbc_object_storage_consumption_info_part2', {
          amount: (storage.stored ? storage.stored.quantity.value : 0),
        }));
    };

    self.getStorageBandwidthInfoTooltip = function (storage) {
      return $translate.instant('cpbc_object_storage_output_traffic_info_part1')
        .concat($translate.instant('cpbc_object_storage_output_traffic_info_part2', {
          amount: storage.outgoingBandwidth.quantity.value,
        }));
    };
  });
