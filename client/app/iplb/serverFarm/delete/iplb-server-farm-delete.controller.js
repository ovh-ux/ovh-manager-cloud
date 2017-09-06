class IpLoadBalancerServerFarmDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, farm, IpLoadBalancerServerFarmService) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;

        this.farm = farm;
        this.name = farm.displayName || farm.farmId;
        this.farmId = farm.farmId;
        this.type = farm.type;
    }

    confirm () {
        this.saving = true;
        return this.IpLoadBalancerServerFarmService.delete(this.type, this.$stateParams.serviceName, this.farmId)
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

angular.module("managerApp").controller("IpLoadBalancerServerFarmDeleteCtrl", IpLoadBalancerServerFarmDeleteCtrl);
