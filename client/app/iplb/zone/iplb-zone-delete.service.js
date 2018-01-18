class IpLoadBalancerZoneDeleteService {
    constructor ($q, ServiceHelper) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
    }

    getDeletableZones (serviceName) {
        return this.$q.when([])
            .catch(this.ServiceHelper.errorHandler("iplb_zone_delete_loading_error"));
    }

    deleteZones (serviceName, zones) {
        console.log("deleting some shit: ", serviceName, zones);

        if (zones.length > 1) {
            return this.ServiceHelper.errorHandler("iplb_zone_delete_plural_error")({ data: { message: "Some API message" } });
        } else {
            return this.ServiceHelper.errorHandler("iplb_zone_delete_single_error")({ data: { message: "Some API message" } });
        }
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneDeleteService", IpLoadBalancerZoneDeleteService);
