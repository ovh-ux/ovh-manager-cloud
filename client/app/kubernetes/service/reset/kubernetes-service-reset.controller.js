class kubernetesResetCtrl {
  constructor($stateParams, $translate, $uibModalInstance, CloudMessage, ControllerHelper,
    Kubernetes) {
    this.serviceName = $stateParams.serviceName;
    this.$uibModalInstance = $uibModalInstance;
    this.$translate = $translate;
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.Kubernetes = Kubernetes;
  }

  $onInit() {
    this.loading = false;
  }

  /**
   * Closes the info pop-up
   *
   * @memberof kubernetesResetCtrl
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }

  /**
   * reset
   *
   * @memberof kubernetesResetCtrl
   */
  reset() {
    this.loading = true;
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.Kubernetes
        .resetCluster(this.serviceName)
        .then(() => this.CloudMessage.success(this.$translate.instant('kube_service_reset_success')))
        .catch(err => this.CloudMessage.error(this.$translate.instant('kube_service_reset_error', { message: _.get(err, 'data.message', '') })))
        .finally(() => {
          this.loading = false;
          this.ControllerHelper.scrollPageToTop();
          this.$uibModalInstance.close();
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('kubernetesResetCtrl', kubernetesResetCtrl);
