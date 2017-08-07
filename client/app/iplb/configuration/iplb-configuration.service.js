class IpLoadBalancerConfigurationService {
    constructor ($q, IpLoadBalancing, ServiceHelper) {
        this.$q = $q;
        this.IpLoadBalancing = IpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    refresh (serviceName, zone) {
        return this.IpLoadBalancing.Lexi().refresh({
            serviceName
        }, {
            zone
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_configuration_apply_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_apply_error"));
    }

    batchRefresh (serviceName, zones) {
        const promises = zones.map(zone => this.IpLoadBalancing.Lexi().refresh({
            serviceName
        }, {
            zone
        }).$promise);
        return this.$q.all(promises)
            .then(this.ServiceHelper.successHandler("iplb_configuration_apply_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_apply_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerConfigurationService", IpLoadBalancerConfigurationService);
