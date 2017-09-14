class IpLoadBalancerServerFarmService {
    constructor ($q, $translate, OvhApiIpLoadBalancing, ServiceHelper, RegionService) {
        this.$q = $q;
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;

        this.Farm = {
            all: OvhApiIpLoadBalancing.Farm().Lexi(),
            tcp: OvhApiIpLoadBalancing.Farm().Tcp().Lexi(),
            udp: OvhApiIpLoadBalancing.Farm().Udp().Lexi(),
            http: OvhApiIpLoadBalancing.Farm().Http().Lexi()
        };

        this.Server = {
            tcp: OvhApiIpLoadBalancing.Farm().Tcp().Server().Lexi(),
            udp: OvhApiIpLoadBalancing.Farm().Udp().Server().Lexi(),
            http: OvhApiIpLoadBalancing.Farm().Http().Server().Lexi()
        };
    }

    getAvailableFarmProbes (serviceName) {
        return this.IpLoadBalancing.Lexi().availableFarmProbes({ serviceName })
            .$promise
            .catch(this.ServiceHelper.errorHandler("iplb_farm_edit_probe_info_error"));
    }

    getServerFarms (serviceName) {
        return this.IpLoadBalancing.Farm().Lexi().query({ serviceName })
            .$promise
            .then(farms => {
                const promises = _.map(farms, farm => this.getServerFarm(serviceName, farm.id, farm.type));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("iplb_farm_list_loading_error"));
    }

    getServerFarm (serviceName, farmId, type) {
        return this.Farm[type].get({ serviceName }, { farmId })
            .$promise
            .then(farm => {
                farm.type = type;
                farm.zoneText = this.RegionService.getRegion(farm.zone);
                return farm;
            });
    }

    getAllFarmsTypes (serviceName) {
        return this.Farm.all.query({ serviceName })
            .$promise;
    }

    getServerFarmServers (serviceName, farmId, type) {
        return this.Server[type].query({ serviceName, farmId })
            .$promise
            .then(serverIds => {
                const promises = _.map(serverIds, serverId => this.Server[type]
                    .get({ serviceName, farmId, serverId })
                    .$promise
                    .then(server => {
                        if (!server.serverState) {
                            server.serverState = [];
                        }
                        return server;
                    }));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("iplb_farm_server_list_loading_error"));
    }

    create (type, serviceName, farm) {
        return this.Farm[type].post({ serviceName }, farm)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_farm_add_success"))
            .then(() => this.Farm.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_farm_add_error"));
    }

    update (type, serviceName, farmId, farm) {
        return this.Farm[type].put({
            serviceName,
            farmId
        }, farm)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_farm_update_success"))
            .then(() => this.Farm.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_farm_update_error"));
    }

    delete (type, serviceName, farmId) {
        return this.Farm[type].delete({
            serviceName,
            farmId
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_farm_delete_success"))
            .then(() => this.Farm.all.resetQueryCache())
            .catch(this.ServiceHelper.errorHandler("iplb_farm_delete_error"));
    }

    humanizeBalance (balance) {
        if (!balance) {
            return "-";
        }

        return this.$translate.instant(`iplb_farm_balance_${balance}`);
    }

    humanizeStickiness (stickiness) {
        if (!stickiness) {
            return this.$translate.instant("iplb_farm_stickiness_none");
        }

        return this.$translate.instant(`iplb_farm_stickiness_${stickiness}`);
    }
}

angular.module("managerApp").service("IpLoadBalancerServerFarmService", IpLoadBalancerServerFarmService);
