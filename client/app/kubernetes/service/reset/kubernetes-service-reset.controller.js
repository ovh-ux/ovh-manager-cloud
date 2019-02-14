class kubernetesResetCtrl {
  constructor($rootScope, $stateParams, $translate, $uibModalInstance, CucCloudMessage,
    ControllerHelper, Kubernetes, KUBERNETES) {
    this.$rootScope = $rootScope;
    this.serviceName = $stateParams.serviceName;
    this.$uibModalInstance = $uibModalInstance;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.Kubernetes = Kubernetes;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loading = false;
    this.workerNodesPolicy = this.KUBERNETES.workerNodesPolicyDelete;
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
    this.CucCloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.Kubernetes
        .resetCluster(this.serviceName, this.workerNodesPolicy)
        .then(() => this.CucCloudMessage.success(this.$translate.instant('kube_service_reset_success')))
        .catch(err => this.CucCloudMessage.error(this.$translate.instant('kube_service_reset_error', { message: _.get(err, 'data.message', '') })))
        .finally(() => {
          this.loading = false;
          this.ControllerHelper.scrollPageToTop();
          this.$uibModalInstance.close();
          this.Kubernetes.resetClusterCache();
          this.$rootScope.$broadcast('kube.service.refresh');
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('kubernetesResetCtrl', kubernetesResetCtrl);
