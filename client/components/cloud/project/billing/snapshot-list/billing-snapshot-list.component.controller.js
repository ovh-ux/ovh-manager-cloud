angular.module('managerApp')
  .controller('BillingSnapshotListComponentCtrl',
    class {
      /* @ngInject */
      constructor($q, $translate, $filter, OvhApiMe, Toast, RegionService) {
        this.$q = $q;
        this.$translate = $translate;
        this.$filter = $filter;
        this.OvhApiMe = OvhApiMe;
        this.Toast = Toast;
        this.RegionService = RegionService;
      }

      $onInit() {
        this.currencySymbol = '';
        this.loading = true;

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

      getSnapshotPriceInfoTooltip(snapshot) {
        return this.$translate.instant('cpbc_snapshot_col_usage_info_part1')
          .concat(this.$translate.instant('cpbc_snapshot_col_usage_info_part2', {
            amount: snapshot.instance.quantity.value,
          }));
      }
    });
