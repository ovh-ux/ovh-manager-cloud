class LogsTokenAddCtrl {
  constructor($q, $stateParams, $uibModalInstance, LogsTokensService, ControllerHelper,
    CloudMessage) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = this.$stateParams.serviceName;
    this.LogsTokensService = LogsTokensService;
    this.ControllerHelper = ControllerHelper;
    this.CloudMessage = CloudMessage;
    this.initLoaders();
  }

  /**
   * initializes token
   *
   * @memberof LogsTokenAddCtrl
   */
  initLoaders() {
    this.token = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsTokensService.getNewToken(this.serviceName),
    });
    this.token.load();
    this.clusters = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsTokensService.getClusters(this.serviceName),
    });
    this.clusters.load();
  }

  /**
   * create new token
   *
   * @memberof LogsTokenAddCtrl
   */
  createToken() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsTokensService.createToken(this.serviceName, this.token.data)
        .finally(() => {
          this.$uibModalInstance.close();
          this.ControllerHelper.scrollPageToTop();
        }),
    });
    return this.saving.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('LogsTokenAddCtrl', LogsTokenAddCtrl);
