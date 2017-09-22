class CloudProjectComputeLoadbalancerService {
    constructor ($q, OvhApiCloudProjectIplb, OvhApiIpLoadBalancing) {
        this.$q = $q;
        this.OvhApiCloudProjectIplb = OvhApiCloudProjectIplb;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
    }

    getLoadbalancer (id) {
        // Get loadbalancer
        return this.OvhApiIpLoadBalancing.Lexi().get({
            serviceName: id
        }).$promise.then(loadbalancer => {
            if (loadbalancer.state !== "ok") {
                return loadbalancer;
            }
            // Find the frontend http 80 if exists
            return this.OvhApiIpLoadBalancing.Frontend().Http().Lexi().query({
                serviceName: id,
                port: 80
            }).$promise.then(frontendIds =>
            // Get frontend details
                frontendIds.length && this.OvhApiIpLoadBalancing.Frontend().Http().Lexi().get({
                    serviceName: id,
                    frontendId: frontendIds[0]
                }).$promise || loadbalancer
            ).then(frontend => {
                if (frontend.frontendId) {
                    loadbalancer.frontend = frontend;
                }
                // Get default farm details
                return frontend.frontendId && frontend.defaultFarmId && this.OvhApiIpLoadBalancing.Farm().Http().Lexi().get({
                    serviceName: id,
                    farmId: frontend.defaultFarmId
                }).$promise || loadbalancer;
            }).then(farm => {
                if (farm.farmId) {
                    loadbalancer.farm = farm;
                }
                return loadbalancer;
            });
        }
        ).then(loadbalancer => {
            if (loadbalancer.state !== "ok") {
                loadbalancer.status = "unavailable";
            } else if (loadbalancer.frontend && loadbalancer.farm) {
                loadbalancer.status = "deployed";
            } else if (!loadbalancer.frontend && !loadbalancer.farm) {
                loadbalancer.status = "available";
            } else if (loadbalancer.state !== "ok") {
                loadbalancer.status = "unavailable";
            } else {
                loadbalancer.status = "custom";
            }
            return loadbalancer;
        });
    }

    getLoadbalancersImported (serviceName) {
        return this.OvhApiCloudProjectIplb.Lexi().query({
            serviceName
        }).$promise.then(ids => this.$q.all(
            _.map(ids, id =>
                this.OvhApiCloudProjectIplb.Lexi().get({
                    serviceName,
                    id
                }).$promise
            )
        )
        ).then(loadbalancers => {
            const result = {};
            _.forEach(loadbalancers, lb => {
                result[lb.iplb] = lb;
            });
            return result;
        });
    }

    // Get servers of the default default farm of the frontend
    // loadbalancer must be generated from function this.getLoadbalancer(id)
    getAttachedServers (loadbalancer) {
        if (!loadbalancer.farm) {
            return Promise.resolve([]);
        }
        return this.OvhApiIpLoadBalancing.Farm().Http().Server().Lexi()
            .query({
                serviceName: loadbalancer.serviceName,
                farmId: loadbalancer.farm.farmId
            }).$promise
            .then(serverIds =>
                this.$q.all(
                    _.map(serverIds, serverId => this.OvhApiIpLoadBalancing.Farm().Http().Server().Lexi()
                        .get({
                            serviceName: loadbalancer.serviceName,
                            farmId: loadbalancer.farm.farmId,
                            serverId
                        }).$promise
                    )
                )
            );
    }
}

angular.module("managerApp").service("CloudProjectComputeLoadbalancerService", CloudProjectComputeLoadbalancerService);
