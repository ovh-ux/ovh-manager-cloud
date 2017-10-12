class IpLoadBalancerFailoverIpService {
    constructor ($translate, OvhApiIpLoadBalancing, ServiceHelper) {
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getFailoverIps (serviceName) {
        return this.IpLoadBalancing.Lexi().failoverIp({ serviceName }).$promise
            .then(response => response)
            .catch(this.ServiceHelper.errorHandler("iplb_failover_ip_detail_loading_error"));
    }

    getFailoverIpsSelectData (serviceName) {
        return this.getFailoverIps(serviceName)
            .then(ipfos => ipfos.map(ipfo => ({
                id: ipfo,
                name: ipfo
            })))
            .then(ipfos => {
                ipfos.unshift({
                    id: 0,
                    name: this.$translate.instant("iplb_ipfo_select_placeholder")
                });

                return ipfos;
            });
    }
}

angular.module("managerApp").service("IpLoadBalancerFailoverIpService", IpLoadBalancerFailoverIpService);
