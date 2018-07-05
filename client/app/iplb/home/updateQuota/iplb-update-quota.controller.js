class IpLoadBalancerUpdateQuotaCtrl {
    constructor ($stateParams, $uibModalInstance, ControllerHelper, IpLoadBalancerHomeService, quota) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
        this.quota = Object.assign({}, quota);

        // Convert bytes to GiB
        this.alert = this.quota.alert / (1000 ** 3);

        this.saving = false;
    }

    updateQuota () {
        this.update = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.updateQuota(this.$stateParams.serviceName, this.quota.zone, this.alert * (1000 ** 3))
                .then(response => this.$uibModalInstance.close(response))
                .catch(error => this.$uibModalInstance.close(error))
        });
        return this.update.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerUpdateQuotaCtrl", IpLoadBalancerUpdateQuotaCtrl);
