angular.module('managerApp')
  .controller('BillingVolumeListComponentCtrl',
    class {
      /* @ngInject */
      constructor(
        $filter,
        $q,
        $translate,
        $stateParams,
        DetailsPopoverService,
        OvhApiCloudProjectVolume,
        Toast,
        OvhApiMe,
      ) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.$stateParams = $stateParams;
        this.DetailsPopoverService = DetailsPopoverService;
        this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
        this.Toast = Toast;
        this.OvhApiMe = OvhApiMe;
      }

      $onInit() {
        this.currencySymbol = '';
        this.volumeConsumptionDetails = [];
        this.data = {};
        this.loading = true;

        this.initUserCurrency()
          .then(() => this.initVolumes())
          .catch((err) => {
            this.Toast.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
            this.$q.reject(err);
          })
          .finally(() => {
            this.loading = false;
          });
      }


      getVolumesDetails() {
        return this.OvhApiCloudProjectVolume.v6().query({
          serviceName: $stateParams.projectId,
        }).$promise.then(volumes => volumes);
      }

      updateVolumeConsumptionDetails(allProjectVolumes, volumeConsumptions) {
        _.forEach(volumeConsumptions, (volumeConsumption) => {
          const volumeConsumptionDetail = {};
          volumeConsumptionDetail.totalPrice = `${volumeConsumption.totalPrice.toFixed(2)} ${this.currencySymbol}`;
          volumeConsumptionDetail.volumeId = volumeConsumption.volumeId;
          volumeConsumptionDetail.quantity = volumeConsumption.quantity.value;
          volumeConsumptionDetail.region = volumeConsumption.region;
          volumeConsumptionDetail.type = volumeConsumption.type;

          volumeConsumptionDetail.amount = volumeConsumption.quantity.value;

          const volumeDetail = _.find(allProjectVolumes, x => x.id === volumeConsumption.volumeId);
          if (volumeDetail) {
            volumeConsumptionDetail.name = volumeDetail.name;
            volumeConsumptionDetail.size = volumeDetail.size;
            volumeConsumptionDetail.status = volumeDetail.status;
          } else {
            volumeConsumptionDetail.name = volumeConsumption.volumeId;
            volumeConsumptionDetail.status = 'deleted';
          }

          this.volumeConsumptionDetails.push(volumeConsumptionDetail);
        });
      }

      initVolumes() {
        return this.getVolumesDetails()
          .then(
            allProjectVolumes => this.updateVolumeConsumptionDetails(
              allProjectVolumes,
              this.volumes,
            ),
          );
      }

      initUserCurrency() {
        return this.OvhApiMe.v6().get().$promise.then((me) => {
          this.currencySymbol = me.currency.symbol;
        });
      }
    });
