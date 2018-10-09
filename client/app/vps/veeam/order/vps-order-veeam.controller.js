class VpsOrderVeeamCtrl {
  constructor($scope, $stateParams, $translate, $window, CloudMessage, CloudNavigation, VpsService,
    ServiceHelper) {
    this.$scope = $scope;
    this.$translate = $translate;
    this.$window = $window;
    this.CloudMessage = CloudMessage;
    this.CloudNavigation = CloudNavigation;
    this.serviceName = $stateParams.serviceName;
    this.VpsService = VpsService;
    this.ServiceHelper = ServiceHelper;


    $scope.model = {
      vps: undefined,
      optionDetails: undefined,
      url: undefined,
      contractsValidated: undefined,
    };

    VpsService.getSelectedVps(this.serviceName)
      .then((data) => {
        $scope.model.vps = data;
        VpsService.getVeeamOption(this.serviceName)
          .then((veeamOption) => {
            $scope.model.optionDetails = veeamOption;
            VpsService.getPriceOptions($scope.model.vps).then((price) => {
              $scope.model.optionDetails.unitaryPrice = price.data.text;
            });
          });
      })
      .catch((error) => {
        this.CloudMessage.error(`${this.$translate.instant('vps_configuration_veeam_order_step1_loading_error')} ${error.data}`);
      });
  }

  $onInit() {
    this.previousState = this.CloudNavigation.getPreviousState();
    this.VpsService.canOrderOption(this.serviceName, 'automatedBackup').catch(() => {
      this.CloudMessage.error(this.$translate.instant('vps_tab_VEEAM_dashboard_veeam_unavailable'));
    });
  }

  orderOption() {
    if (this.$scope.model.optionDetails && this.$scope.model.contractsValidated) {
      this.ServiceHelper
        .loadOnNewPage(this.VpsService
          .orderVeeamOption(this.serviceName, this.$scope.model.optionDetails.duration.duration))
        .then(({ url }) => {
          this.$scope.model.url = url;
        });
    } else if (this.$scope.model.contractsValidated) {
      this.CloudMessage.error(this.$translate.instant('vps_configuration_veeam_order_fail'));
    }
  }

  cancel() {
    this.previousState.go();
  }
}

angular.module('managerApp').controller('VpsOrderVeeamCtrl', VpsOrderVeeamCtrl);
