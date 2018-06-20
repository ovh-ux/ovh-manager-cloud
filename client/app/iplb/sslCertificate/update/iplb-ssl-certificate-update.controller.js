class IpLoadBalancerSslCertificateUpdateCtrl {
    constructor ($uibModalInstance, ControllerHelper, IpLoadBalancerSslCertificateService, serviceName, ssl) {
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerSslCertificateService = IpLoadBalancerSslCertificateService;
        this.serviceName = serviceName;
        this.ssl = ssl;
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }

    update () {
        this.updateSsl = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerSslCertificateService.update(this.serviceName, this.ssl.id, { displayName: this.displayName })
                .then(response => this.$uibModalInstance.close(response))
                .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.updateSsl.load();
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateUpdateCtrl", IpLoadBalancerSslCertificateUpdateCtrl);
