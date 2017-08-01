class IpLoadBalancerFailoverIpService {
    constructor ($translate, IpLoadBalancing, ServiceHelper) {
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getFailoverIps (serviceName) {
        return this.IpLoadBalancing.Lexi().failoverIp({ serviceName }).$promise
            .then(response => response)
            .catch(this.ServiceHelper.errorHandler("iplb_failover_ip_detail_loading_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerFailoverIpService", IpLoadBalancerFailoverIpService);
