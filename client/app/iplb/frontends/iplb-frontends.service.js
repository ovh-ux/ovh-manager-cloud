class IpLoadBalancerFrontendsService {
    constructor ($q, $translate, OvhApiIpLoadBalancing, RegionService, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;

        this.Frontend = {
            all: this.IpLoadBalancing.Frontend().Lexi(),
            tcp: this.IpLoadBalancing.Frontend().Tcp().Lexi(),
            udp: this.IpLoadBalancing.Frontend().Udp().Lexi(),
            http: this.IpLoadBalancing.Frontend().Http().Lexi()
        };

        this.Farm = {
            tcp: this.IpLoadBalancing.Farm().Tcp().Lexi(),
            udp: this.IpLoadBalancing.Farm().Udp().Lexi(),
            http: this.IpLoadBalancing.Farm().Http().Lexi()
        };
    }

    getFrontends (serviceName) {
        return this.getFrontendIndex(serviceName)
            .then(frontends => frontends.map(frontend => this.transformFrontend(frontend)))
            .catch(this.ServiceHelper.errorHandler("iplb_frontend_list_error"));
    }

    getFrontendIndex (serviceName) {
        return this.getAllFrontendsTypes(serviceName)
            .then(frontends => {
                const promises = frontends.map(frontend =>
                    this.getFrontend(frontend.type, serviceName, frontend.id));
                return this.$q.all(promises);
            });
    }

    getFrontend (type, serviceName, frontendId) {
        return this.Frontend[type].get({
            serviceName,
            frontendId
        })
            .$promise
            .then(frontend => {
                frontend.protocol = type;
                return frontend;
            });
    }

    getAllFrontendsTypes (serviceName) {
        return this.Frontend.all.query({ serviceName })
            .$promise;
    }

    transformFrontend (frontend) {
        frontend.region = this.RegionService.getRegion(frontend.zone);
        return frontend;
    }

    getFarm (type, serviceName, farmId) {
        return this.Farm[type].get({
            serviceName,
            farmId
        }).$promise;
    }

    getFarms (type, serviceName) {
        return this.Farm[type].query({ serviceName })
            .$promise
            .then(ids => this.$q.all(ids.map(id => this.getFarm(type, serviceName, id))))
            .then(farms => farms.map(farm => this.transformFarm(farm, type)));
    }

    transformFarm (farm, type) {
        farm.type = type;
        return farm;
    }

    getFarmsChoices (type, serviceName) {
        return this.getFarms(type, serviceName)
            .then(farms => {
                farms.unshift({
                    displayName: this.$translate.instant("iplb_frontend_add_farm_no_farm"),
                    farmId: null
                });
                farms.unshift({
                    displayName: this.$translate.instant("iplb_frontend_add_select_placeholder"),
                    farmId: 0
                });
                farms.push({
                    displayName: this.$translate.instant("iplb_frontend_add_farm_add_another_choice"),
                    farmId: -1
                });
                return farms;
            });
    }

    getZones () {
        return this.IpLoadBalancing.Lexi().availableZones().$promise
            .then(zones => zones.filter(zone => !/private$/.test(zone))
                .reduce((zonesMap, zoneName) => {
                    zonesMap[zoneName] = this.RegionService.getRegion(zoneName).microRegion.text;
                    return zonesMap;
                }, {}))
            .then(zones => {
                zones.all = this.$translate.instant("iplb_frontend_add_datacenter_all");
                zones[0] = this.$translate.instant("iplb_frontend_add_select_placeholder");
                return Object.keys(zones).map(zoneKey => ({
                    id: zoneKey,
                    name: zones[zoneKey]
                }));
            });
    }

    getCertificatesChoices (serviceName) {
        return this.getCertificates(serviceName)
            .then(certificates => {
                certificates.unshift({
                    displayName: this.$translate.instant("iplb_frontend_add_default_certificate_no_certificate"),
                    id: 0
                });
                certificates.push({
                    displayName: this.$translate.instant("iplb_frontend_add_default_certificate_add_another_choice"),
                    id: -1
                });
                return certificates;
            });
    }

    getCertificates (serviceName) {
        return this.IpLoadBalancing.Ssl().Lexi().query({ serviceName }).$promise
            .then(ids => this.$q.all(ids.map(id => this.getCertificate(serviceName, id))));
    }

    getCertificate (serviceName, sslId) {
        return this.IpLoadBalancing.Ssl().Lexi().get({
            serviceName,
            sslId
        }).$promise;
    }

    createFrontend (type, serviceName, frontend) {
        return this.Frontend[type].post({ serviceName }, frontend)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_frontend_add_success"))
            .then(() => this.Frontend.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_frontend_add_error"));
    }

    updateFrontend (type, serviceName, frontendId, frontend) {
        return this.Frontend[type].put({
            serviceName,
            frontendId
        }, frontend)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_frontend_update_success"))
            .then(() => this.Frontend.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_frontend_update_error"));
    }

    deleteFrontend (type, serviceName, frontendId) {
        return this.Frontend[type].delete({
            serviceName,
            frontendId
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_frontend_delete_success"))
            .then(() => this.Frontend.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_frontend_delete_error"));
    }

    toggleFrontend (type, serviceName, frontend) {
        return this.Frontend[type].put({
            serviceName,
            frontendId: frontend.frontendId
        }, {
            disabled: frontend.disabled
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_frontend_toggle_success"))
            .then(() => this.Frontend.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_frontend_toggle_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerFrontendsService", IpLoadBalancerFrontendsService);
