angular.module('managerApp')
  .controller('BillingSnapshotListComponentCtrl',
    class {
      /* @ngInject */
      constructor($filter, $q, $translate, OvhApiMe, RegionService, Toast) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.OvhApiMe = OvhApiMe;
        this.RegionService = RegionService;
        this.Toast = Toast;
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
