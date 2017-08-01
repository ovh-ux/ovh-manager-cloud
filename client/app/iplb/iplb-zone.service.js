class IpLoadBalancerZoneService {
    constructor ($translate, IpLoadBalancing, RegionService) {
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.RegionService = RegionService;
    }

    getZones () {
        return this.IpLoadBalancing.Lexi().availableZones().$promise
            .then(zones => zones.filter(zone => !/private$/.test(zone))
                .reduce((zonesMap, zoneName) => {
                    zonesMap[zoneName] = this.RegionService.getRegion(zoneName).microRegion.text;
                    return zonesMap;
                }, {}))
            .then(zones => {
                zones.all = this.$translate.instant("iplb_zone_all");
                zones[0] = this.$translate.instant("iplb_zone_select_placeholder");
                return Object.keys(zones).map(zoneKey => ({
                    id: zoneKey,
                    name: zones[zoneKey]
                }));
            });
    }

    humanizeZone (zone) {
        return this.RegionService.getRegion(zone).microRegion.text;
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneService", IpLoadBalancerZoneService);
