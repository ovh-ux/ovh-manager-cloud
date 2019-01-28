angular.module('managerApp').controller('CloudProjectBillingVouchersAddcreditAgoraCtrl', class CloudProjectBillingVouchersAddcreditAgoraCtrl {
  /* @ngInject */
  constructor($q, $translate, $uibModalInstance, $window,
    CloudMessage, CloudVouchersAgoraService, OvhApiMe,
    CLOUD_PROJECT_CREDIT_ORDER, URLS) {
    this.$q = $q;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.$window = $window;
    this.CloudMessage = CloudMessage;
    this.CloudVouchersAgoraService = CloudVouchersAgoraService;
    this.OvhApiMe = OvhApiMe;
    this.CLOUD_PROJECT_CREDIT_ORDER = CLOUD_PROJECT_CREDIT_ORDER;
    this.URLS = URLS;
  }

  $onInit() {
    this.orderLimits = this.CLOUD_PROJECT_CREDIT_ORDER.orderLimits;
    this.amount = this.CLOUD_PROJECT_CREDIT_ORDER.defaultAmount;
    this.loading = true;
    return this.OvhApiMe.v6().get().$promise
      .then(({ ovhSubsidiary }) => {
        this.subsidiary = ovhSubsidiary;
        return this.CloudVouchersAgoraService.getCloudCatalog(ovhSubsidiary);
      })
      .then(({ plans }) => {
        const defaultCreditPrices = _.get(
          plans.find(plan => plan.planCode === 'credit' && plan.pricingType === 'purchase'),
          'details.pricings.default',
        );
        this.creditPrice = _.get(defaultCreditPrices.find(({ capacities }) => capacities.includes('installation')), 'price');
        return this.creditPrice;
      }).catch((err) => {
        this.CloudMessage.error([this.$translate.instant('cpb_vouchers_add_credit_load_err'), _.get(err, 'data.message', '')].join(' '));
        this.$uibModalInstance.dismiss();
        return this.$q.reject(err);
      }).finally(() => {
        this.loading = false;
      });
  }

  order() {
    const order = {
      planCode: 'credit',
      productId: 'cloud',
      pricingMode: 'default',
      quantity: Math.floor(this.amount / this.creditPrice.value),
      configuration: [{
        label: 'type',
        value: 'public_cloud',
      }],
    };
    const orderUrl = _.get(this.URLS, `order.${this.subsidiary}`, this.URLS.order.FR);
    const orderWindow = this.$window.open(`${orderUrl}review?products=${JSURL.stringify([order])}`, '_blank');
    orderWindow.opener = null;
    this.$uibModalInstance.dismiss();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
});
