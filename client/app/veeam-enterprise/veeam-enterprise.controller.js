(() => {
  class VeeamEnterpriseCtrl {
    constructor($scope, $stateParams, VeeamEnterpriseService) {
      this.$scope = $scope;
      this.serviceName = $stateParams.serviceName;
      this.VeeamEnterpriseService = VeeamEnterpriseService;
    }

    $onInit() {
      this.VeeamEnterpriseService.unitOfWork.init();
    }
  }

  angular.module('managerApp').controller('VeeamEnterpriseCtrl', VeeamEnterpriseCtrl);
})();
