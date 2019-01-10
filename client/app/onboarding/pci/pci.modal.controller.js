class pciSlideshowModalCtrl {
  constructor(ControllerHelper) {
    this.ControllerHelper = ControllerHelper;
    this.openModal();
  }

  openModal() {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/onboarding/pci/pci.html',
        controller: 'pciSlideshowCtrl',
        controllerAs: '$ctrl',
        backdrop: 'static',
      },
    });
  }
}

angular.module('managerApp').controller('pciSlideshowModalCtrl', pciSlideshowModalCtrl);
