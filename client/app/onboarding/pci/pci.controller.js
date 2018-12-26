class pciSlideshowCtrl {
  constructor($state) {
    this.$state = $state;
  }

  dismiss() {
    return this.$state.go('home');
  }
}

angular.module('managerApp').controller('pciSlideshowCtrl', pciSlideshowCtrl);
