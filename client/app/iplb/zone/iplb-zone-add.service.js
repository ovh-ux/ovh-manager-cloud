class IpLoadBalancerZoneAddService {
    constructor ($q, $translate, $window, CloudMessage, OrderHelperService, OvhApiIpLoadBalancing, RegionService, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.OrderHelperService = OrderHelperService;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getOrderableZones (serviceName) {
        return this.$q.all({
            orderableZones: this._getOrderableZones(serviceName),
            suspendedZones: this._getSuspendedZones(serviceName)
        })
            .then(response => {
                const availableZones = response.orderableZones.concat(response.suspendedZones);
                return _.map(availableZones, zone => _.extend(zone, this.RegionService.getRegion(zone.name)));
            })
            .then(availableZones => _.map(availableZones, zone => _.extend(zone, {
                selectable: {
                    value: true,
                    reason: zone.state === "released" ? this.$translate.instant("iplb_zone_add_available_released") : ""
                }
            })))
            .catch(this.ServiceHelper.errorHandler("iplb_zone_add_loading_error"));
    }

    addZones (serviceName, zones) {
        if (zones.length === 0) {
            return this.ServiceHelper.errorHandler("iplb_zone_add_selection_error")({});
        }

        return this.$q.all({
            created: this._createZones(serviceName, _.filter(zones, zone => zone.state !== "released")),
            activated: this._activateZones(serviceName, _.filter(zones, zone => zone.state === "released"))
        })
            .then(response => {
                if (response.created.quantity > 0) {
                    this.$window.open(response.created.url, "_blank");
                    return this.ServiceHelper.successHandler({
                        text: this.$translate.instant(zones.length > 1 ? "iplb_zone_add_plural_success" : "iplb_zone_add_single_success"),
                        link: {
                            text: this.$translate.instant("common_complete_order"),
                            value: response.created.url
                        }
                    })(response);
                }

                if (response.activated.quantity > 0) {
                    return this.ServiceHelper.successHandler({
                        text: this.$translate.instant(zones.length > 1 ? "iplb_zone_activate_plural_success" : "iplb_zone_activate_single_success")
                    })(response);
                }

                return this.$q.reject();
            });
    }

    _createZones (serviceName, zones) {
        const emptyResponse = this.$q.when({ quantity: 0 });
        if (!zones.length) {
            return emptyResponse;
        }

        return this.OrderHelperService.getExpressOrderUrl(_.map(zones, zone => ({
            productId: "ipLoadbalancing",
            serviceName,
            planCode: zone.planCode
        })))
            .then(response => ({
                quantity: zones.length,
                url: response
            }))
            .catch(response => {
                this.ServiceHelper.errorHandler(zones.length > 1 ? "iplb_zone_add_plural_error" : "iplb_zone_add_single_error")(response);
                return emptyResponse;
            });
    }

    _activateZones (serviceName, zones) {
        const emptyResponse = this.$q.when({ quantity: 0 });
        if (!zones.length) {
            return emptyResponse;
        }

        const promises = _.map(zones, zone => this.OvhApiIpLoadBalancing.Zone().Lexi().cancelDelete({ serviceName, name: zone.name }, {}).$promise);
        return this.$q.all(promises)
            .then(() => ({
                quantity: zones.length
            }))
            .catch(response => {
                this.ServiceHelper.errorHandler(zones.length > 1 ? "iplb_zone_add_plural_error" : "iplb_zone_add_single_error")(response);
                return emptyResponse;
            });
    }

    _getOrderableZones (serviceName) {
        return this.OvhApiIpLoadBalancing.Lexi().get({ serviceName })
            .$promise
            .then(response => response.orderableZone);
    }

    _getSuspendedZones (serviceName) {
        return this.OvhApiIpLoadBalancing.Zone().Lexi().query({ serviceName })
            .$promise
            .then(zoneIds => {
                const promises = _.map(zoneIds, zoneId => this.OvhApiIpLoadBalancing.Zone().Lexi().get({ serviceName, name: zoneId }).$promise);
                return this.$q.all(promises);
            })
            .then(zones => _.filter(zones, zone => zone.state === "released"));
    }
}

angular.module("managerApp").service("IpLoadBalancerZoneAddService", IpLoadBalancerZoneAddService);
