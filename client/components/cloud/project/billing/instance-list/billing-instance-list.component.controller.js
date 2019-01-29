angular.module('managerApp')
  .controller('BillingInstanceListComponentCtrl',
    class {
      /* @ngInject */
      constructor(
        $stateParams,
        $q, $translate,
        OvhApiCloudProjectImage,
        DetailsPopoverService,
        OvhApiCloudProjectInstance,
        Toast,
        OvhApiMe,
        OvhCloudPriceHelper,
      ) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.$translate = $translate;
        this.OvhApiCloudProjectImage = OvhApiCloudProjectImage;
        this.DetailsPopoverService = DetailsPopoverService;
        this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
        this.Toast = Toast;
        this.OvhApiMe = OvhApiMe;
        this.OvhCloudPriceHelper = OvhCloudPriceHelper;
      }

      $onInit() {
        this.windowsStringPattern = /^win-/;
        this.instanceConsumptionDetails = [];

        this.data = {
          instances: [],
          images: [],
          instanceToMonthlyPrice: null,
        };

        this.loaders = {
          monthlyBilling: false,
          instanceList: true,
        };

        this.DetailsPopoverService = this.DetailsPopoverService;
        this.currencySymbol = '';

        this.instanceToMonthly = null;

        return this.$q
          .all([
            this.initInstances(),
            this.initImages(),
            this.initUserCurrency(),
          ])
          .then(() => {
            this.loadConsumptionDetails();
          })
          .catch((err) => {
            this.Toast.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
            return this.$q.reject(err);
          })
          .finally(() => {
            this.loaders.instanceList = false;
          });
      }


      initInstances() {
        return this.OvhApiCloudProjectInstance.v6().query({
          serviceName: this.$stateParams.projectId,
        }).$promise.then((instances) => {
          this.data.instances = instances;
        });
      }

      initImages() {
        return this.OvhApiCloudProjectImage.v6().query({
          serviceName: this.$stateParams.projectId,
        }).$promise.then((result) => {
          this.data.images = result;
        });
      }

      initUserCurrency() {
        return this.OvhApiMe.v6().get().$promise.then((me) => {
          this.currencySymbol = me.currency.symbol;
        });
      }

      getImageTypeFromReference(reference) {
        if (reference) {
          return this.windowsStringPattern.test(reference) ? 'windows' : 'linux';
        }
        return '';
      }

      getInstanceConsumptionDetails(billingDetail) {
        const instanceConsumptionDetail = {};
        instanceConsumptionDetail.instanceId = billingDetail.instanceId;
        instanceConsumptionDetail.instanceName = billingDetail.instanceId;
        instanceConsumptionDetail.total = `${billingDetail.totalPrice.toFixed(2)} ${this.currencySymbol}`;
        instanceConsumptionDetail.region = billingDetail.region;
        instanceConsumptionDetail.reference = billingDetail.reference;
        instanceConsumptionDetail
          .imageType = this.getImageTypeFromReference(billingDetail.reference);
        instanceConsumptionDetail.vmType = billingDetail.reference ? billingDetail.reference.replace(this.windowsStringPattern, '').toUpperCase() : '';

        const instance = _.find(this.data.instances, { id: billingDetail.instanceId });
        if (instance) {
          instanceConsumptionDetail.isDeleted = false;
          instanceConsumptionDetail.instanceName = instance.name;
          instanceConsumptionDetail.monthlyBilling = instance.monthlyBilling;
          instanceConsumptionDetail.planCode = instance.planCode;
          const imageData = _.find(this.data.images, { id: instance.imageId });
          if (imageData) {
            instanceConsumptionDetail.imageType = imageData.type;
          }
        } else {
          instanceConsumptionDetail.isDeleted = true;
        }

        return instanceConsumptionDetail;
      }

      loadConsumptionDetails() {
        this.instanceConsumptionDetailsInit = _.map(
          this.instances,
          billingDetail => this.getInstanceConsumptionDetails(billingDetail),
        );

        this.$q.allSettled(this.instanceConsumptionDetailsInit).then((instances) => {
          this.instanceConsumptionDetails = instances;
        });
      }

      prepareMonthlyPaymentActivation(instance) {
        this.instanceToMonthly = instance.instanceId;
        this.data.instanceToMonthlyPrice = null;
        this.loaders.monthlyBilling = true;

        this.OvhCloudPriceHelper.getPrices(this.$stateParams.projectId).then((prices) => {
          const monthlyPrice = prices[instance.planCode && instance.planCode.replace('consumption', 'monthly')];
          if (!monthlyPrice) {
            this.endInstanceToMonthlyConversion();
            return this.$q.reject({ data: { message: 'No monthly price for this instance' } });
          }
          this.data.instanceToMonthlyPrice = monthlyPrice;
          return $.when();
        }).catch((err) => {
          this.instanceToMonthly = null;
          this.Toast.error([this.$translate.instant('cpbc_hourly_instance_pass_to_monthly_price_error'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        }).finally(() => {
          this.loaders.monthlyBilling = false;
        });
      }

      confirmMonthlyPaymentActivation() {
        this.loaders.monthlyBilling = true;

        this.OvhApiCloudProjectInstance.v6().activeMonthlyBilling({
          serviceName: this.$stateParams.projectId,
          instanceId: this.instanceToMonthly,
        }, {}).$promise.then(() => {
          // reset loaders and instance to activate
          this.endInstanceToMonthlyConversion();
        }).catch((err) => {
          this.Toast.error([this.$translate.instant('cpbc_hourly_instance_pass_to_monthly_error'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        }).finally(() => {
          this.loaders.monthlyBilling = false;
        });
      }

      endInstanceToMonthlyConversion() {
        this.instanceToMonthly = null;
      }
    });
