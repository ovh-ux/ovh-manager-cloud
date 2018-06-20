class IpLoadBalancerServerFarmDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, ControllerHelper, farm, IpLoadBalancerServerFarmService) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;

        this.farm = farm;
        this.name = farm.displayName || farm.farmId;
        this.farmId = farm.farmId;
        this.type = farm.type;
    }

    confirm () {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerServerFarmService.delete(this.type, this.$stateParams.serviceName, this.farmId)
                .then(response => this.$uibModalInstance.close(response))
                .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.delete.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerServerFarmDeleteCtrl", IpLoadBalancerServerFarmDeleteCtrl);
