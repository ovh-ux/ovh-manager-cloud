class pciSlideshowCtrl {
  constructor($scope, $state, $stateParams, $window, ovhUserPref, $uibModalInstance) {
    this.$state = $state;
    this.$scope = $scope;
    this.$window = $window;
    this.serviceName = $stateParams.serviceName;
    this.ovhUserPref = ovhUserPref;
    this.$uibModalInstance = $uibModalInstance;
    this.init();
  }

  init() {
    this.$scope.$on('$locationChangeStart', (event) => {
      event.preventDefault();
    });
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
