class IpLoadBalancerFailoverIpDetailCtrl {
    constructor ($uibModalInstance, serviceName, ControllerHelper, IpLoadBalancerFailoverIpService) {
        this.$uibModalInstance = $uibModalInstance;

        this.serviceName = serviceName;
        this.ControllerHelper = ControllerHelper;

        this.IpLoadBalancerFailoverIpService = IpLoadBalancerFailoverIpService;

        this.ips = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerFailoverIpService.getFailoverIps(this.serviceName)
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

angular.module("managerApp").controller("IpLoadBalancerFailoverIpDetailCtrl", IpLoadBalancerFailoverIpDetailCtrl);
