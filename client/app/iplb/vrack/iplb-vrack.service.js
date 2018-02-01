class IpLoadBalancerVrackService {
    constructor ($q, OvhApiIpLoadBalancingVrack, OvhApiVrack, ServiceHelper) {
        this.$q = $q;
        this.OvhApiIpLoadBalancingVrack = OvhApiIpLoadBalancingVrack;
        this.OvhApiVrack = OvhApiVrack;
        this.ServiceHelper = ServiceHelper;
    }

    associateVrack (serviceName, vrackName) {
        return this.OvhApiVrack.IpLoadBalancing().Lexi().create({
            serviceName: vrackName
        }, {
            ipLoadbalancing: serviceName
        }).$promise
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_associate_vrack_error"));
    }

    deAssociateVrack (serviceName) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().getCreationRules({ serviceName }, {})
            .$promise
            .then(response => this.OvhApiVrack.IpLoadBalancing().Lexi().delete({
                serviceName: response.vrackName,
                ipLoadbalancing: serviceName
            }).$promise)
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_deassociate_vrack_error"));
    }

    getNetworkCreationRules (serviceName, config = { resetCache: false }) {
        if (config.resetCache) {
            this.OvhApiIpLoadBalancingVrack.Lexi().resetCache();
        }

        return this.OvhApiIpLoadBalancingVrack.Lexi().getCreationRules({ serviceName }, {})
            .$promise
            .then(response => ({
                networkId: response.vrackName,
                remainingNetworks: response.remainingNetworks,
                minNatIps: response.minNatIps,
                status: "active",
                displayName: "Nothing to see here"
            }))
            .catch(error => {
                //  I have no ther choice.  404 error is API way to say creationRules aren't available since we have no vrack associated.
                if (error.status === 404) {
                    return {
                        networkId: null,
                        status: "inactive",
                        displayName: null
                    };
                }
                return this.ServiceHelper.errorHandler("iplb_vrack_rules_loading_error")(error);
            });
    }

    getPrivateNetworks (serviceName) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().query({ serviceName })
            .$promise
            .then(response => {
                const promises = _.map(response, networkId => this._getPrivateNetwork(serviceName, networkId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_networks_loading_error"));
    }

    getPrivateNetwork (serviceName, networkId) {
        return this._getPrivateNetwork(serviceName, networkId)
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_loading_error"));
    }

    addPrivateNetwork (serviceName, network) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().post({ serviceName }, _.omit(network, ["vrackNetworkId", "farmId"]))
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_add_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_add_error"));
    }

    editPrivateNetwork (serviceName, network) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().put({ serviceName, vrackNetworkId: network.vrackNetworkId }, _.omit(network, ["vrackNetworkId", "farmId"]))
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_edit_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_edit_error"));
    }

    deletePrivateNetwork (serviceName, networkId) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().delete({ serviceName, vrackNetworkId: networkId })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_vrack_private_network_delete_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_private_network_delete_error"));
    }

    _getPrivateNetwork (serviceName, networkId) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().get({ serviceName, vrackNetworkId: networkId })
            .$promise
            .then(response => {
                response.displayName = response.displayName || response.vrackNetworkId;
                return response;
            });
    }
}

angular.module("managerApp").service("IpLoadBalancerVrackService", IpLoadBalancerVrackService);
