class IpLoadBalancerServerDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, ControllerHelper, farm, server, IpLoadBalancerServerService) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerServerService = IpLoadBalancerServerService;

        this.farm = farm;
        this.server = server;
        this.name = server.displayName || server.farmId;
        this.farmId = farm.farmId;
        this.serverId = server.serverId;
    }

    confirm () {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerServerService.delete(this.$stateParams.serviceName, this.farmId, this.serverId)
                .then(response => this.$uibModalInstance.close(response))
                .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.delete.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerServerDeleteCtrl", IpLoadBalancerServerDeleteCtrl);
