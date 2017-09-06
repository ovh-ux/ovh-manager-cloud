class IpLoadBalancerNatIpDetailCtrl {
    constructor ($uibModalInstance, serviceName, ControllerHelper, IpLoadBalancerNatIpService) {
        this.$uibModalInstance = $uibModalInstance;

        this.serviceName = serviceName;
        this.ControllerHelper = ControllerHelper;

        this.IpLoadBalancerNatIpService = IpLoadBalancerNatIpService;

        this.ips = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerNatIpService.getNatIps(this.serviceName)
        });
    }

    $onInit () {
        this.ips.load();
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.ips.loading;
    }
}

angular.module("managerApp").controller("IpLoadBalancerNatIpDetailCtrl", IpLoadBalancerNatIpDetailCtrl);
