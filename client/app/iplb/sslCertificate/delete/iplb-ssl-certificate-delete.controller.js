class IpLoadBalancerSslCertificateDeleteCtrl {
  constructor($stateParams, $uibModalInstance, ControllerHelper,
    IpLoadBalancerSslCertificateService, ssl) {
    this.$stateParams = $stateParams;
    this.$uibModalInstance = $uibModalInstance;
    this.ControllerHelper = ControllerHelper;
    this.IpLoadBalancerSslCertificateService = IpLoadBalancerSslCertificateService;

    this.ssl = ssl;
    this.name = ssl.displayName || ssl.frontendId;
    this.sslId = ssl.id;
  }

  confirm() {
    this.delete = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerSslCertificateService
        .delete(this.$stateParams.serviceName, this.sslId)
        .then(response => this.$uibModalInstance.close(response))
        .catch(error => this.$uibModalInstance.dismiss(error)),
    });
    return this.delete.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('IpLoadBalancerSslCertificateDeleteCtrl', IpLoadBalancerSslCertificateDeleteCtrl);
