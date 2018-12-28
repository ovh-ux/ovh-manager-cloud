class kubernetesRenameCtrl {
  constructor($stateParams, $translate, $uibModalInstance, CloudMessage, ControllerHelper,
    Kubernetes, KUBERNETES) {
    this.serviceName = $stateParams.serviceName;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.Kubernetes = Kubernetes;
    this.KUBERNETES = KUBERNETES;
    this.initLoaders();
  }

  $onInit() {
    this.kubernetesDetails.load();
  }

  initLoaders() {
    this.kubernetesDetails = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.Kubernetes.getKubernetesCluster(this.serviceName),
    });
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  updateName() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }

    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.Kubernetes
        .updateKubernetes(this.serviceName, this.kubernetesDetails.data)
        .then(() => {
          this.CloudMessage.success(this.$translate.instant('kube_service_rename_success'));
        })
        .catch((error) => {
          this.CloudMessage.error(this.$translate.instant('kube_service_rename_error', { message: (error.data && error.data.message) || '' }));
        })
        .finally(() => {
          this.ControllerHelper.scrollPageToTop();
          this.$uibModalInstance.close();
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('kubernetesRenameCtrl', kubernetesRenameCtrl);
