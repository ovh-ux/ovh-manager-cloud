class IpLoadBalancerZoneService {
    constructor ($q, $translate, OvhApiIpLoadBalancing, RegionService) {
        this.$q = $q;
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.RegionService = RegionService;
    }

    getIPLBZones (serviceName) {
        return this.IpLoadBalancing.Zone().v6().query({
            serviceName
        }).$promise
            .then(zones => zones.map(zone => ({
                id: zone,
                name: this.RegionService.getRegion(zone).microRegion.text
            })));
    }

    getZones () {
        return this.IpLoadBalancing.v6().availableZones().$promise
            .then(zones => zones.filter(zone => !/private$/.test(zone))
                .filter(zone => !/^all/.test(zone))
                .map(zone => ({
                    id: zone,
                    name: this.RegionService.getRegion(zone).microRegion.text
                })));
    }

    getZonesSelectData (serviceName) {
        return this.$q.all({
            allZones: this.getZones(),
            iplbZones: this.getIPLBZones(serviceName)
        }).then(({ allZones, iplbZones }) => {
            if (iplbZones.length >= allZones.length || true) {
                iplbZones.push({
                    id: "all",
                    name: this.$translate.instant("iplb_zone_all")
                });
            }
            return iplbZones;
        });
    }

    humanizeZone (zone) {
        return this.RegionService.getRegion(zone).microRegion.text;
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneService", IpLoadBalancerZoneService);
