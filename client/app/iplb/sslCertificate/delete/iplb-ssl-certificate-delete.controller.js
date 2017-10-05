class IpLoadBalancerSslCertificateDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, IpLoadBalancerSslCertificateService, ssl) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerSslCertificateService = IpLoadBalancerSslCertificateService;

        this.ssl = ssl;
        this.name = ssl.displayName || ssl.frontendId;
        this.sslId = ssl.id;
    }

    confirm () {
        this.saving = true;
        return this.IpLoadBalancerSslCertificateService.delete(this.$stateParams.serviceName, this.sslId)
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => {
                this.saving = false;
            });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateDeleteCtrl", IpLoadBalancerSslCertificateDeleteCtrl);
