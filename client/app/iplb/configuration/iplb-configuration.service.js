class IpLoadBalancerConfigurationService {
    constructor ($q, IpLoadBalancing, IpLoadBalancerZoneService, ServiceHelper) {
        this.$q = $q;
        this.IpLoadBalancing = IpLoadBalancing;
        this.IpLoadBalancerZoneService = IpLoadBalancerZoneService;
        this.ServiceHelper = ServiceHelper;
    }

    getPendingChanges (serviceName) {
        return this.IpLoadBalancing.Lexi().pendingChanges({ serviceName })
            .$promise;
    }

    getAllZonesChanges (serviceName) {
        return this.$q.all({
            allZones: this.IpLoadBalancerZoneService.getZones(),
            pendingChanges: this.getPendingChanges(serviceName)
        })
            .then(({ allZones, pendingChanges }) => allZones.map(zone => {
                const pending = _.find(pendingChanges, { zone: zone.id });
                zone.changes = pending ? pending.number : 0;
                return zone;
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_info_error"));
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
