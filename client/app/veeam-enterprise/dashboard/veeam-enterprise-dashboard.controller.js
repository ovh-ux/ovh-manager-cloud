class VeeamEnterpriseDashboardCtrl {
  constructor($stateParams, $translate, ControllerHelper, FeatureAvailabilityService,
    VeeamEnterpriseService) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.ControllerHelper = ControllerHelper;
    this.FeatureAvailabilityService = FeatureAvailabilityService;
    this.VeeamEnterpriseService = VeeamEnterpriseService;

    this.serviceName = this.$stateParams.serviceName;

    this.initLoaders();
    this.initActions();
  }

  initLoaders() {
    const errorHandler = response => this.VeeamEnterpriseService.unitOfWork.messages.push({
      text: response.message,
      type: 'error',
    });

    this.configurationInfos = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VeeamEnterpriseService.getConfigurationInfos(this.serviceName),
      errorHandler,
    });

    this.subscriptionInfos = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VeeamEnterpriseService.getSubscriptionInfos(this.serviceName),
      errorHandler,
    });
  }

  initActions() {
    this.uiActions = {
      manageAutorenew: {
        text: this.$translate.instant('common_manage'),
        href: this.ControllerHelper.navigation.getUrl(
          'renew', {
            serviceName: this.serviceName,
            serviceType: 'VEEAM_ENTERPRISE',
          },
        ),
        isAvailable: () => true,
      },
      manageContact: {
        text: this.$translate.instant('common_manage'),
        href: this.ControllerHelper.navigation.getUrl(
          'contacts', {
            serviceName: this.serviceName,
          },
        ),
        isAvailable: () => this.FeatureAvailabilityService.hasFeature('CONTACTS', 'manage'),
      },
    };
  }

  $onInit() {
    this.configurationInfos.load();
    this.subscriptionInfos.load();
  }

  activateLicense() {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/veeam-enterprise/dashboard/license/veeam-enterprise-license.html',
        controller: 'VeeamEnterpriseLicenseCtrl',
        controllerAs: '$ctrl',
        resolve: {
          action: () => 'register',
          serviceName: () => this.serviceName,
        },
      },
    });
  }

  updateLicense() {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/veeam-enterprise/dashboard/license/veeam-enterprise-license.html',
        controller: 'VeeamEnterpriseLicenseCtrl',
        controllerAs: '$ctrl',
        resolve: {
          action: () => 'update',
          serviceName: () => this.serviceName,
        },
      },
    });
  }
}

angular.module('managerApp').controller('VeeamEnterpriseDashboardCtrl', VeeamEnterpriseDashboardCtrl);
