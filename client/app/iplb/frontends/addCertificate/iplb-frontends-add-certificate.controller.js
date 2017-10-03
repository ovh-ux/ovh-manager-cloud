class IpLoadBalancerFrontendAddCertificateCtrl {
    constructor ($uibModalInstance) {
        this.$uibModalInstance = $uibModalInstance;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerFrontendAddCertificateCtrl", IpLoadBalancerFrontendAddCertificateCtrl);
