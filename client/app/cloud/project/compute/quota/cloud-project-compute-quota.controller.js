

angular.module('managerApp').controller('CloudProjectComputeQuotaCtrl',
  function CloudProjectComputeQuotaCtrl(
    $q, $stateParams, $translate, REDIRECT_URLS,
    OvhApiCloudProject, OvhApiCloudProjectQuota, OvhApiMe, CucCloudMessage, OtrsPopupService,
    RegionService, TARGET,
  ) {
    // ---------VARIABLE DECLARATION---------

    const self = this;
    const serviceName = $stateParams.projectId;

    this.loader = {
      quota: false,
      unleash: false,
    };

    this.datas = {
      quota: null,
      defaultPaymentMean: null,
    };

    this.state = {
      isRestrictedQuota: false,
    };

    // PaymentMean URL (v6 dedicated) with sessionv6
    this.paymentmeanUrl = REDIRECT_URLS.paymentMeans;
    this.supportUrl = REDIRECT_URLS.support;

    self.regionService = RegionService;

    this.TARGET = TARGET;

    // ---------SUPPORT---------

    this.openSupport = function openSupport() {
      if (!OtrsPopupService.isLoaded()) {
        OtrsPopupService.init();
      } else {
        OtrsPopupService.toggle();
      }
    };

    // ---------UNLEASH---------

    function initPaymentMethods() {
      if (self.TARGET !== 'US') {
        return OvhApiMe.PaymentMean().v6().getDefaultPaymentMean();
      }

      return OvhApiMe.PaymentMethod().v6().query({
        status: 'VALID',
      }).$promise.then(paymentMethodIds => _.map(
        paymentMethodIds,
        paymentMethodId => $q.all(
          OvhApiMe.PaymentMethod().v6().get({
            id: paymentMethodId,
          }).$promise,
        ),
      )).then(paymentMethods => _.find(paymentMethods, {
        default: true,
      }));
    }

    function init() {
      const initQueue = [];

      self.loader.quota = true;
      self.loader.unleash = false;

      // check default payment mean
      initQueue.push(initPaymentMethods().then((defaultPaymentMean) => {
        self.datas.defaultPaymentMean = defaultPaymentMean;
      }));

      // get quota
      initQueue.push(OvhApiCloudProjectQuota.v6().query({
        serviceName,
      }).$promise.then((quotas) => {
        self.datas.quota = quotas;
      }));

      return $q.all(initQueue).then(() => {
        // check if quota is restricted
        if (self.datas.quota.length) {
          self.state.isRestrictedQuota = self.datas.quota[0].maxInstances === 1
            && self.datas.quota[0].maxCores === 1
            && self.datas.quota[0].maxRam === 2048;
        }
      }, (err) => {
        CucCloudMessage.error([
          $translate.instant('cpb_quota_loading_error'),
          (err.data && err.data.message) || '',
        ].join(' '));
        self.datas.quota = null;
      }).finally(() => {
        self.loader.quota = false;
      });
    }

    this.unleashAccount = function unleashAccount() {
      self.loader.unleash = true;

      return OvhApiCloudProject.v6().unleash({
        serviceName,
      }, {}).$promise.then(() => {
        init();
      }, (err) => {
        if (err.status === 403) {
          CucCloudMessage.error($translate.instant('cpb_quota_already_unleashed'));
        } else {
          CucCloudMessage.error($translate.instant('cpb_quota_unleash_error'));
        }
        init();
      }).finally(() => {
        self.loader.unleash = false;
      });
    };

    // ---------INITIALIZATION---------

    init();
  });
