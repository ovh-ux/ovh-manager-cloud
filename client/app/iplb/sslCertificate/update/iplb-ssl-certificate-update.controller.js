class IpLoadBalancerSslCertificateUpdateCtrl {
    constructor ($uibModalInstance, IpLoadBalancerSslCertificateService, serviceName, ssl) {
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerSslCertificateService = IpLoadBalancerSslCertificateService;
        this.serviceName = serviceName;
        this.ssl = ssl;
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }

    update () {
        return this.IpLoadBalancerSslCertificateService.update(
            this.serviceName,
            this.ssl.id,
            { displayName: this.displayName }
        )
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response));
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateUpdateCtrl", IpLoadBalancerSslCertificateUpdateCtrl);
