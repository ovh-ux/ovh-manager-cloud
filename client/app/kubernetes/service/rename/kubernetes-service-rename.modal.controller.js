class kubernetesRenameModalCtrl {
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
        templateUrl: 'app/kubernetes/service/rename/kubernetes-service-rename.html',
        controller: 'kubernetesRenameCtrl',
        controllerAs: 'ctrl',
        backdrop: 'static',
      },
    })
      .then(() => {
        this.$scope.$parent.$parent.$parent.$ctrl.getCluster();
        this.$scope.$parent.$ctrl.getClusterInfos();
      })
      .finally(() => this.onCloseModal());
  }

  onCloseModal() {
    this.$state.go('paas.kube.service', {
      serviceName: this.serviceName,
    });
  }
}

angular.module('managerApp').controller('kubernetesRenameModalCtrl', kubernetesRenameModalCtrl);
