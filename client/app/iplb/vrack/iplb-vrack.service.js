class IpLoadBalancerVrackService {
    constructor ($q, IpLoadBalancerServerFarmService, OvhApiIpLoadBalancing, OvhApiVrack, ServiceHelper) {
        this.$q = $q;
        this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.OvhApiVrack = OvhApiVrack;
        this.ServiceHelper = ServiceHelper;
    }

    associateVrack (serviceName, vrackName) {
        return this.OvhApiVrack.IpLoadBalancing().Lexi().create({
            serviceName: vrackName
        }, {
            ipLoadbalancing: serviceName
        })
            .$promise
            .then(task => task.data)
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_associate_vrack_error"));
    }

    deAssociateVrack (serviceName) {
        return this.OvhApiIpLoadBalancing.Vrack().Lexi().getCreationRules({ serviceName }, {})
            .$promise
            .then(response => this.OvhApiVrack.IpLoadBalancing().Lexi().delete({
                serviceName: response.vrackName,
                ipLoadbalancing: serviceName
            }).$promise)
            .then(task => task.data)
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_deassociate_vrack_error"));
    }

    getNetworkCreationRules (serviceName, config = { resetCache: false }) {
        if (config.resetCache) {
            this.OvhApiIpLoadBalancing.Vrack().Lexi().resetCache();
        }

        return this.OvhApiIpLoadBalancing.Vrack().Lexi().getStatus({ serviceName }, {})
            .$promise
            .then(response => {
                const promises = {
                    vrackStatus: this.$q.when(response),
                    vrack: response.state === "active" ? this.OvhApiVrack.Lexi().get({ serviceName: response.vrackName }).$promise : this.$q.when({}),
                    iplb: this.OvhApiIpLoadBalancing.Lexi().get({ serviceName }).$promise,
                    rules: response.state === "active" ? this.OvhApiIpLoadBalancing.Vrack().Lexi().getCreationRules({ serviceName }, {}).$promise : this.$q.when({})
                };
                return this.$q.all(promises);
            })
            .then(response => ({
                networkId: response.vrackStatus.vrackName,
                remainingNetworks: response.rules.remainingNetworks,
                minNatIps: response.rules.minNatIps,
                status: response.vrackStatus.state,
                displayName: response.vrack.name || response.vrackStatus.vrackName,
                vrackEligibility: response.iplb.vrackEligibility
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_rules_loading_error"));
    }

    getPrivateNetworks (serviceName) {
        return this.OvhApiIpLoadBalancing.Vrack().Lexi().query({ serviceName })
            .$promise
            .then(response => {
                const promises = _.map(response, networkId => this._getPrivateNetwork(serviceName, networkId));
                return this.$q.all(promises);
            })
            .then(response => {
                _.forEach(response, privateNetwork => {
                    this.IpLoadBalancerServerFarmService.getServerFarms(serviceName, privateNetwork.vrackNetworkId)
                        .then(farms => {
                            privateNetwork.farmId = farms;
                        });

                    privateNetwork.farmId = [];
                });

                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_networks_loading_error"));
    }

    getPrivateNetwork (serviceName, networkId) {
        return this._getPrivateNetwork(serviceName, networkId)
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_loading_error"));
    }

    getPrivateNetworkFarms (serviceName, networkId) {
        return this._getPrivateNetwork(serviceName, networkId)
            .then(privateNetwork => this.IpLoadBalancerServerFarmService.getServerFarms(serviceName, privateNetwork.vrackNetworkId));
    }

    addPrivateNetwork (serviceName, network) {
        return this.OvhApiIpLoadBalancing.Vrack().Lexi().post({ serviceName }, _.omit(network, ["vrackNetworkId", "farmId"]))
            .$promise
            .then(response => this.OvhApiIpLoadBalancing.Vrack().Lexi().updateFarmId({ serviceName, vrackNetworkId: response.vrackNetworkId }, { farmId: network.farmId }).$promise)
            .then(response => {
                this.OvhApiIpLoadBalancing.Farm().Lexi().resetQueryCache();
                return response;
            })
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_add_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_add_error"));
    }

    editPrivateNetwork (serviceName, network) {
        return this.$q.all([
            this.OvhApiIpLoadBalancing.Vrack().Lexi().put({ serviceName, vrackNetworkId: network.vrackNetworkId }, _.omit(network, ["vrackNetworkId", "farmId"])).$promise,
            this.OvhApiIpLoadBalancing.Vrack().Lexi().updateFarmId({ serviceName, vrackNetworkId: network.vrackNetworkId }, { farmId: network.farmId }).$promise
        ])
            .then(response => {
                this.OvhApiIpLoadBalancing.Farm().Lexi().resetQueryCache();
                return response;
            })
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_edit_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_edit_error"));
    }

    deletePrivateNetwork (serviceName, networkId) {
        return this.OvhApiIpLoadBalancing.Vrack().Lexi().updateFarmId({ serviceName, vrackNetworkId: networkId }, { farmId: [] }).$promise
            .then(() => this.OvhApiIpLoadBalancing.Vrack().Lexi().delete({ serviceName, vrackNetworkId: networkId }).$promise)
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_delete_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_delete_error"));
    }

    _getPrivateNetwork (serviceName, networkId) {
        return this.OvhApiIpLoadBalancing.Vrack().Lexi().get({ serviceName, vrackNetworkId: networkId })
            .$promise
            .then(response => {
                response.displayName = response.displayName || response.vrackNetworkId;
                return response;
            });
    }
}

angular.module("managerApp").service("IpLoadBalancerVrackService", IpLoadBalancerVrackService);
