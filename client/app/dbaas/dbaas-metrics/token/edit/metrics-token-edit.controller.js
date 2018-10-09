(() => {
  class MetricsTokenEditCtrl {
    constructor($uibModalInstance, ControllerHelper, metricsValue, metricsType, serviceName,
      tokenID, MetricService) {
      this.$uibModalInstance = $uibModalInstance;
      this.ControllerHelper = ControllerHelper;
      this.MetricService = MetricService;
      this.serviceName = serviceName;
      this.tokenID = tokenID;
      this.type = metricsType;
      this.value = metricsValue;
    }

    confirm() {
      if (this.type === 'name') {
        this.deleteToken = this.ControllerHelper.request.getHashLoader({
          loaderFunction: () => this.MetricService.updateToken(
            this.serviceName,
            this.tokenID,
            this.value,
          )
            .then(response => this.$uibModalInstance.close(response))
            .catch(err => this.$uibModalInstance.dismiss(err)),
        });
        this.deleteToken.load();
      }
    }

    cancel() {
      this.$uibModalInstance.dismiss();
    }
  }

  angular.module('managerApp').controller('MetricsTokenEditCtrl', MetricsTokenEditCtrl);
})();
