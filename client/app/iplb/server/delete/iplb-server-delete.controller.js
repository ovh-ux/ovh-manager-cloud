class IpLoadBalancerServerDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, farm, server, IpLoadBalancerServerService) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerServerService = IpLoadBalancerServerService;

        this.farm = farm;
        this.server = server;
        this.name = server.displayName || server.farmId;
        this.farmId = farm.farmId;
        this.serverId = server.serverId;
    }

    confirm () {
        this.saving = true;
        return this.IpLoadBalancerServerService.delete(
                this.$stateParams.serviceName,
                this.farmId,
                this.serverId
            )
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => {
                this.saving = false;
            });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerServerDeleteCtrl", IpLoadBalancerServerDeleteCtrl);
