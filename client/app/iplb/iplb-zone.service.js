class IpLoadBalancerZoneService {
    constructor ($translate, IpLoadBalancing, RegionService) {
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.RegionService = RegionService;
    }

    getZones () {
        return this.IpLoadBalancing.Lexi().availableZones().$promise
            .then(zones => zones.filter(zone => !/private$/.test(zone))
                .filter(zone => !/^all/.test(zone))
                .map(zone => ({
                    id: zone,
                    name: this.RegionService.getRegion(zone).microRegion.text
                })));
    }

    getZonesSelectData () {
        return this.getZones().then(zones => {
            zones.push({
                id: "all",
                name: this.$translate.instant("iplb_zone_all")
            });
            zones.unshift({
                id: 0,
                name: this.$translate.instant("iplb_zone_select_placeholder")
            });
            return zones;
        });
    }

    humanizeZone (zone) {
        return this.RegionService.getRegion(zone).microRegion.text;
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneService", IpLoadBalancerZoneService);
