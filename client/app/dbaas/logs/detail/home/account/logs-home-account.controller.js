class LogsHomeAccountCtrl {
  constructor($location, $stateParams, $uibModalInstance, CucCloudMessage, ControllerHelper,
    LogsHomeService, LogsConstants) {
    this.$location = $location;
    this.serviceName = $stateParams.serviceName;
    this.$uibModalInstance = $uibModalInstance;
    this.CucCloudMessage = CucCloudMessage;
    this.LogsConstants = LogsConstants;
    this.ControllerHelper = ControllerHelper;
    this.LogsHomeService = LogsHomeService;
    this.initLoaders();
  }

  $onInit() {
    this.accountDetails.load()
      .then(() => {
        this.displayName = this.accountDetails.data.service.displayName;
      });
  }

  /**
   * initializes the account details and contacts
   *
   * @memberof LogsHomeAccountCtrl
   */
  initLoaders() {
    this.accountDetails = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsHomeService.getAccountDetails(this.serviceName),
    });
  }

  /**
   * Closes the info pop-up
   *
   * @memberof LogsHomeAccountCtrl
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }

  /**
   * Updates the contact
   *
   * @memberof LogsHomeAccountCtrl
   */
  updateDisplayName() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }

    this.CucCloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsHomeService
        .updateDisplayName(this.serviceName, this.accountDetails.data.service.displayName)
        .finally(() => {
          this.ControllerHelper.scrollPageToTop();
          this.$uibModalInstance.close();
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('LogsHomeAccountCtrl', LogsHomeAccountCtrl);
