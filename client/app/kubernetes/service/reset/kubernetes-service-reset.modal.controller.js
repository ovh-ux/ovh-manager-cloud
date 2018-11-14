class kubernetesResetModalCtrl {
  constructor($scope, $state, $stateParams, ControllerHelper) {
    this.$scope = $scope;
    this.$state = $state;
    this.serviceName = $stateParams.serviceName;
    this.ControllerHelper = ControllerHelper;
    this.openModal();
  }

  openModal() {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/kubernetes/service/reset/kubernetes-service-reset.html',
        controller: 'kubernetesResetCtrl',
        controllerAs: 'ctrl',
        backdrop: 'static',
      },
    }).finally(() => this.onCloseModal());
  }

  onCloseModal() {
    this.$state.go('paas.kube.service', {
      serviceName: this.serviceName,
    });
  }
}

angular.module('managerApp').controller('kubernetesResetModalCtrl', kubernetesResetModalCtrl);
