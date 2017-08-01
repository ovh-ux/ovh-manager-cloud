class IpLoadBalancerConfigurationService {
    constructor ($q, IpLoadBalancing, RegionService) {
        this.$q = $q;
        this.IpLoadBalancing = IpLoadBalancing;
        this.RegionService = RegionService;
    }
}

angular.module("managerApp").service("IpLoadBalancerConfigurationService", IpLoadBalancerConfigurationService);
