class IpLoadBalancerVrackHelper {
    constructor (IpLoadBalancerVrackService) {
        this.IpLoadBalancerVrackService = IpLoadBalancerVrackService;
    }

    associateVrack (serviceName, network = { networkId: "pn-16343", displayName: "someName" }, vrackCreationRules) {
        this.IpLoadBalancerVrackService.associateVrack(serviceName, network.networkId)
            .then(task => {
                vrackCreationRules.status = "activating";
                return task.poll();
            })
            .then(() => this.IpLoadBalancerVrackService.getNetworkCreationRules(serviceName, { resetCache: true }))
            .then(creationRules => {
                _.extend(vrackCreationRules, creationRules);
            });
    }

    deAssociateVrack (serviceName, vrackCreationRules) {
        this.IpLoadBalancerVrackService.deAssociateVrack(serviceName)
            .then(task => {
                vrackCreationRules.status = "deactivating";
                return task.poll();
            })
            .then(() => this.IpLoadBalancerVrackService.getNetworkCreationRules(serviceName, { resetCache: true }))
            .then(creationRules => {
                _.extend(vrackCreationRules, creationRules);
            });
    }
}

angular.module("managerApp").service("IpLoadBalancerVrackHelper", IpLoadBalancerVrackHelper);
