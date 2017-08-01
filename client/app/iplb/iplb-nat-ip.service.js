class IpLoadBalancerNatIpService {
    constructor ($translate, IpLoadBalancing, ServiceHelper) {
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getNatIps (serviceName) {
        return this.IpLoadBalancing.Lexi().natIp({ serviceName }).$promise
            .then(response => response)
            .catch(this.ServiceHelper.errorHandler("iplb_nat_ip_detail_loading_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerNatIpService", IpLoadBalancerNatIpService);
