class IpLoadBalancerNatIpService {
    constructor ($translate, OvhApiIpLoadBalancing, ServiceHelper) {
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getNatIps (serviceName) {
        return this.IpLoadBalancing.Lexi().natIp({ serviceName }).$promise
            .catch(this.ServiceHelper.errorHandler("iplb_nat_ip_detail_loading_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerNatIpService", IpLoadBalancerNatIpService);
