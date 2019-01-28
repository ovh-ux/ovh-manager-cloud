angular.module('managerApp').controller('CloudProjectBillingVouchersAddcreditAgoraCtrl', class CloudProjectBillingVouchersAddcreditAgoraCtrl {
  /* @ngInject */
  constructor($http, $q, $translate, $uibModalInstance, $window,
    CloudMessage, OvhApiMe,
    CLOUD_PROJECT_CREDIT_ORDER, URLS) {
    this.$http = $http;
    this.$q = $q;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.$window = $window;
    this.CloudMessage = CloudMessage;
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
        return this.$http.get('/order/catalog/formatted/cloud', {
          serviceType: 'apiv6',
          params: {
            ovhSubsidiary,
          },
        });
      })
      .then((result) => {
        this.price = _.chain(result)
          .get('data.plans')
          .filter(p => p.planCode === 'credit' && p.pricingType === 'purchase')
          .head()
          .get('details.pricings.default')
          .filter(p => p.capacities.indexOf('installation') >= 0)
          .head()
          .get('price')
          .value();
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
      quantity: Math.floor(this.amount / this.price.value),
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
