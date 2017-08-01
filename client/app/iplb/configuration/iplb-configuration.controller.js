class IpLoadBalancerConfigurationCtrl {
    constructor (IpLoadBalancerConfigurationService) {
        this.IpLoadBalancerFrontendService = IpLoadBalancerConfigurationService;
    }

    onSelectionChange (selection) {
        console.log("Configuration selection", selection);
    }
}

angular.module("managerApp").controller("IpLoadBalancerConfigurationCtrl", IpLoadBalancerConfigurationCtrl);
