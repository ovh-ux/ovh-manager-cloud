

angular.module('managerApp').controller('VrackAddCtrl',
  function (
    $q,
    $translate,
    $state,
    $rootScope,
    CucCloudMessage,
    CucVrackService,
    OvhApiOrder,
    TARGET,
  ) {
    const self = this;

    self.TARGET = TARGET;

    this.loaders = {
      loading: false,
      validationPending: false,
    };

    this.model = {
      agreements: [],
      contractsAccepted: false,
      purchaseOrderUrl: '',
    };

    this.getVrackContract = function () {
      return OvhApiOrder.Vrack().New().v6().get({
        quantity: 1,
      }).$promise.then((data) => {
        self.model.agreements = data.contracts;
      }).catch((error) => {
        CucCloudMessage.error($translate.instant('vrack_error_reason', { message: error.data.message }));
      });
    };

    this.addVrack = function () {
      self.loaders.loading = true;
      return OvhApiOrder.Vrack().New().v6().create({
        quantity: this.model.quantityToOrder,
      }, {}).$promise.then((data) => {
        CucCloudMessage.success($translate.instant('vrack_adding_success', { data: _.pick(data, ['url', 'orderId']) }));
        self.model.purchaseOrderUrl = data.url;
        self.loaders.validationPending = true;
      }).catch((error) => {
        CucCloudMessage.error($translate.instant('vrack_error_reason', { message: error.data.message }));
      }).finally(() => {
        self.loaders.loading = false;
      });
    };

    function init() {
      self.loaders.loading = true;
      self.vrackOrderUrl = null;

      const promise = {
        vrackOrderUrl: CucVrackService.getOrderUrl(),
      };

      if (self.TARGET !== 'US') {
        promise.vrackContract = self.getVrackContract();
      }

      return $q
        .all(promise)
        .then((results) => {
          self.vrackOrderUrl = results.vrackOrderUrl;
        })
        .finally(() => {
          self.loaders.loading = false;
        });
    }

    init();
  });
