class IpLoadBalancerVrackService {
    constructor ($q, CloudPoll, IpLoadBalancerServerFarmService, OvhApiIpLoadBalancing, OvhApiIpLoadBalancingTask, OvhApiIpLoadBalancingVrack, OvhApiVrack, ServiceHelper) {
        this.$q = $q;
        this.CloudPoll = CloudPoll;
        this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.OvhApiIpLoadBalancingTask = OvhApiIpLoadBalancingTask;
        this.OvhApiIpLoadBalancingVrack = OvhApiIpLoadBalancingVrack;
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
            .then(task => {
                const response = task.data;
                response.poll = () => this._getVrackTaskPoller(response);
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_associate_vrack_error"));
    }

    deAssociateVrack (serviceName) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().getCreationRules({ serviceName }, {})
            .$promise
            .then(response => this.OvhApiVrack.IpLoadBalancing().Lexi().delete({
                serviceName: response.vrackName,
                ipLoadbalancing: serviceName
            }).$promise)
            .then(task => {
                const response = task.data;
                response.poll = () => this._getVrackTaskPoller(response);
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_deassociate_vrack_error"));
    }

    getNetworkCreationRules (serviceName, config = { resetCache: false }) {
        if (config.resetCache) {
            this.OvhApiIpLoadBalancingVrack.Lexi().resetCache();
        }

        return this.OvhApiIpLoadBalancingVrack.Lexi().getCreationRules({ serviceName }, {})
            .$promise
            .then(response => this.$q.all({
                vrack: this.OvhApiVrack.Lexi().get({ serviceName: response.vrackName }).$promise,
                rules: this.$q.when(response)
            }))
            .then(response => ({
                networkId: response.rules.vrackName,
                remainingNetworks: response.rules.remainingNetworks,
                minNatIps: response.rules.minNatIps,
                status: "active",
                displayName: response.vrack.name || response.rules.vrackName
            }))
            .catch(error => {
                //  404 error is API way to say creationRules aren't available since we have no vrack associated.
                if (error.status === 404) {
                    return this.$q.when({
                        networkId: null,
                        status: "inactive",
                        displayName: null
                    });
                }
                return this.$q.reject(error);
            })
            .then(response => this.OvhApiIpLoadBalancing.Lexi().get({ serviceName }).$promise.then(iplb => { 
                response.vrackEligibility = iplb.vrackEligibility;
                return response;
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_vrack_rules_loading_error"));
    }

    getPrivateNetworks (serviceName) {
        return this.OvhApiIpLoadBalancingVrack.Lexi().query({ serviceName })
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

    _getVrackTaskPoller (task) {
        return this.CloudPoll.poll({
            item: task,
            pollFunction: () => this.OvhApiVrack.Lexi().task({ serviceName: task.serviceName, taskId: task.id })
                .$promise
                .catch(() => ({
                    id: task.id,
                    serviceName: task.serviceName,
                    status: "done"
                })),
            stopCondition: item => item.status === "done"
        }).$promise;
    }
}

angular.module("managerApp").service("IpLoadBalancerVrackService", IpLoadBalancerVrackService);
