class pciSlideshowCtrl {
  constructor($state, $stateParams, ovhUserPref, $uibModalInstance) {
    this.$state = $state;
    this.serviceName = $stateParams.serviceName;
    this.ovhUserPref = ovhUserPref;
    this.$uibModalInstance = $uibModalInstance;
  }

  dismiss() {
    this.$uibModalInstance.close();
    this.$state.go('iaas.pci-project.compute.infrastructure.diagram', {
      projectId: this.serviceName,
    });
    this.ovhUserPref.assign('SHOW_PCI_ONBOARDING', { value: false });
  }
}

angular.module('managerApp').controller('pciSlideshowCtrl', pciSlideshowCtrl);
