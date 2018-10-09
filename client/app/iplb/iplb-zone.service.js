class IpLoadBalancerZoneService {
  constructor($translate, OvhApiIpLoadBalancing, RegionService) {
    this.$translate = $translate;
    this.IpLoadBalancing = OvhApiIpLoadBalancing;
    this.RegionService = RegionService;
  }

  getIPLBZones(serviceName) {
    return this.IpLoadBalancing.Zone().v6().query({
      serviceName,
    }).$promise
      .then(zones => zones.map(zone => ({
        id: zone,
        name: this.RegionService.getRegion(zone).microRegion.text,
      })));
  }

  getZonesSelectData(serviceName) {
    return this
      .getIPLBZones(serviceName)
      .then((iplbZones) => {
        iplbZones.push({
          id: 'all',
          name: this.$translate.instant('iplb_zone_all'),
        });

        return iplbZones;
      });
  }

  humanizeZone(zone) {
    return this.RegionService.getRegion(zone).microRegion.text;
  }
}

angular.module('managerApp').service('IpLoadBalancerZoneService', IpLoadBalancerZoneService);
