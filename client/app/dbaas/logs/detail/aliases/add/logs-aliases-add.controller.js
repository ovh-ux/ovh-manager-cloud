class LogsAliasesAddCtrl {
  constructor($q, $stateParams, $uibModalInstance, LogsAliasesService, CucControllerHelper,
    CucCloudMessage) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = this.$stateParams.serviceName;
    this.LogsAliasesService = LogsAliasesService;
    this.CucControllerHelper = CucControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.isEdit = false;

    this.initLoaders();
  }

  /**
   * initializes options list
   *
   * @memberof LogsAliasesAddCtrl
   */
  initLoaders() {
    this.options = this.CucControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.LogsAliasesService.getSubscribedOptions(this.serviceName),
    });
    this.options.load();

    this.mainOffer = this.CucControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.LogsAliasesService.getMainOffer(this.serviceName),
    });
    this.mainOffer.load();

    if (this.$stateParams.aliasId) {
      this.isEdit = true;
      this.alias = this.CucControllerHelper.request.getHashLoader({
        loaderFunction: () => this.LogsAliasesService.getAlias(
          this.serviceName,
          this.$stateParams.aliasId,
        ),
      });
      this.alias.load();
    } else {
      this.isEdit = false;
      this.alias = this.LogsAliasesService.constructor.getNewAlias();
    }

    this.title = this.isEdit ? 'logs_aliases_update_title' : 'logs_aliases_add';
  }

  save() {
    if (this.isEdit) {
      return this.updateAlias();
    }
    return this.createAlias();
  }

  /**
   * update alias
   *
   * @memberof LogsAliasesAddCtrl
   */
  updateAlias() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }
    this.CucCloudMessage.flushChildMessage();
    this.saving = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsAliasesService
        .updateAlias(this.$stateParams.serviceName, this.alias.data)
        .finally(() => {
          this.$uibModalInstance.close();
          this.CucControllerHelper.scrollPageToTop();
        }),
    });
    return this.saving.load();
  }

  /**
   * create new alias
   *
   * @memberof LogsAliasesAddCtrl
   */
  createAlias() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }
    this.CucCloudMessage.flushChildMessage();
    this.saving = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsAliasesService
        .createAlias(this.$stateParams.serviceName, this.alias.data)
        .finally(() => {
          this.$uibModalInstance.close();
          this.CucControllerHelper.scrollPageToTop();
        }),
    });
    return this.saving.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('LogsAliasesAddCtrl', LogsAliasesAddCtrl);
