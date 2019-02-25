class kubernetesUpgradePolicyCtrl {
  constructor($stateParams, $translate, $uibModalInstance, CucCloudMessage,
    ControllerHelper, Kubernetes, upgradePolicy) {
    this.serviceName = $stateParams.serviceName;
    this.$uibModalInstance = $uibModalInstance;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.Kubernetes = Kubernetes;
    this.selectedUpgradePolicy = upgradePolicy;
    this.upgradePolicies = this.Kubernetes.getUpgradePolicies();
  }

  /**
   * Closes the info pop-up
   *
   * @memberof kubernetesUpgradePolicyCtrl
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }

  /**
   * update policy
   *
   * @memberof kubernetesUpgradePolicyCtrl
   */
  updateUpgradePolicy() {
    this.CucCloudMessage.flushChildMessage();
    this.save = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.Kubernetes
        .updateKubernetesUpgradePolicy(this.serviceName, this.selectedUpgradePolicy)
        .then(() => this.CucCloudMessage.success(
          this.$translate.instant('kube_service_upgrade_policy_success'),
        ))
        .catch(err => this.CucCloudMessage.error(this.$translate.instant('kube_service_upgrade_policy_error', { message: _.get(err, 'data.message', '') })))
        .finally(() => {
          this.ControllerHelper.scrollPageToTop();
          this.$uibModalInstance.close(this.selectedUpgradePolicy);
        }),
    });
    return this.save.load();
  }
}

angular.module('managerApp').controller('kubernetesUpgradePolicyCtrl', kubernetesUpgradePolicyCtrl);
