class IpLoadBalancerServerService {
    constructor ($q, $translate, IpLoadBalancing, ServiceHelper, RegionService) {
        this.$q = $q;
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;

        this.Server = {
            tcp: IpLoadBalancing.Farm().Tcp().Server().Lexi(),
            udp: IpLoadBalancing.Farm().Udp().Server().Lexi(),
            http: IpLoadBalancing.Farm().Http().Server().Lexi()
        };
    }

    getServer (serviceName, farmId, serverId) {
        return this.getFarmType(serviceName, farmId)
            .then(type => this.Server[type].get({
                serviceName,
                farmId,
                serverId
            }).$promise);
    }

    create (type, serviceName, farmId, server) {
        return this.Server[type].post({
            serviceName,
            farmId
        }, server)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_server_add_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_server_add_error"));
    }

    update (type, serviceName, farmId, serverId, server) {
        return this.Server[type].put({
            serviceName,
            farmId,
            serverId
        }, server)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_server_update_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_server_update_error"));
    }

    delete (serviceName, farmId, serverId) {
        return this.getFarmType(serviceName, farmId)
            .then(type => this.Server[type].delete({
                serviceName,
                farmId,
                serverId
            }).$promise)
            .then(this.ServiceHelper.successHandler("iplb_server_delete_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_server_delete_error"));
    }

    getFarmType (serviceName, farmId) {
        return this.IpLoadBalancing.Farm().Lexi().query({ serviceName })
            .$promise
            .then(farms => {
                const farm = _.find(farms, { id: parseInt(farmId, 10) });
                return farm;
            })
            .then(farm => {
                if (!farm) {
                    return this.$q.reject("NOTFOUND");
                }
                return farm.type;
            });
    }
}

angular.module("managerApp")
    .service("IpLoadBalancerServerService", IpLoadBalancerServerService);
