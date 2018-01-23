class IpLoadBalancerZoneDeleteService {
    constructor ($q, $translate, CloudMessage, RegionService, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getDeletableZones (serviceName) {
        return this.$q.when([this.RegionService.getRegion("RBX"), this.RegionService.getRegion("GRA"), this.RegionService.getRegion("BHS")])
            .catch(this.ServiceHelper.errorHandler("iplb_zone_delete_loading_error"));
    }

    deleteZones (serviceName, zones) {
        return this.getDeletableZones(serviceName)
            .then(deletableZones => {
                if (zones.length === 0) {
                    return this.ServiceHelper.errorHandler("iplb_zone_delete_selection_error")({});
                }

                const deletableZoneCount = deletableZones.length - 1;
                if (zones.length > deletableZoneCount) {
                    return this.ServiceHelper.errorHandler(deletableZoneCount > 1 ? "iplb_zone_delete_selection_too_many_plural_error" : "iplb_zone_delete_selection_too_many_single_error")({
                        data: {
                            zoneQuantity: deletableZoneCount
                        }
                    });
                }

                const deletedZones = _.sortBy(_.map(zones, zone => zone.microRegion.text), zone => zone).join(", ");
                return this.$q.when()
                    .then(() => this.ServiceHelper.successHandler(zones.length > 1 ? "iplb_zone_delete_plural_success" : "iplb_zone_delete_single_success")({ zones: deletedZones }))
                    .catch(this.ServiceHelper.errorHandler(zones.length > 1 ? "iplb_zone_delete_plural_error" : "iplb_zone_delete_single_error"));
            });
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneDeleteService", IpLoadBalancerZoneDeleteService);
