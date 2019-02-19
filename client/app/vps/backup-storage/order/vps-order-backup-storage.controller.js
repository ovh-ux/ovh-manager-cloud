class VpsOrderBackupStorageCtrl {
  constructor($stateParams, $translate, $window, CucCloudMessage, CucCloudNavigation, ServiceHelper,
    VpsService) {
    this.$translate = $translate;
    this.$window = $window;
    this.CucCloudMessage = CucCloudMessage;
    this.CucCloudNavigation = CucCloudNavigation;
    this.serviceName = $stateParams.serviceName;
    this.ServiceHelper = ServiceHelper;
    this.VpsService = VpsService;


    this.model = {
      optionDetails: undefined,
      url: undefined,
    };
  }

  $onInit() {
    this.VpsService.getOptionDetails(this.serviceName, 'ftpbackup')
      .then((option) => {
        this.model.optionDetails = _.first(option.results);
      })
      .catch((error) => {
        this.CucCloudMessage.error(`${this.$translate.instant('vps_dashboard_loading_error')} ${error.data}`);
      });

    this.previousState = this.CucCloudNavigation.getPreviousState();
    this.VpsService.canOrderOption(this.serviceName, 'ftpbackup').catch(() => {
      this.CucCloudMessage.error(this.$translate.instant('vps_tab_BACKUP_STORAGE_dashboard_ftpbackup_unavailable'));
    });
  }

  orderOption() {
    this.ServiceHelper.loadOnNewPage(this.VpsService.orderOption(this.serviceName, 'ftpbackup', this.model.optionDetails.duration.duration))
      .then(({ url }) => {
        this.model.url = url;
      });
  }

  cancel() {
    this.previousState.go();
  }
}

angular.module('managerApp').controller('VpsOrderBackupStorageCtrl', VpsOrderBackupStorageCtrl);
