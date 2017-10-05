class IpLoadBalancerUpdateQuotaCtrl {
    constructor ($stateParams, $uibModalInstance, IpLoadBalancerHomeService, quota) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
        this.quota = Object.assign({}, quota);

        // Convert bytes to GiB
        this.alert = this.quota.alert / Math.pow(1024, 3);

        this.saving = false;
    }

    updateQuota () {
        this.saving = true;
        this.IpLoadBalancerHomeService.updateQuota(
            this.$stateParams.serviceName,
            this.quota.zone,
            // Convert GiB to bytes
            this.alert * Math.pow(1024, 3)
        ).then(result => {
            this.$uibModalInstance.close(result);
        }).catch(err => {
            this.$uibModalInstance.close(err);
        }).finally(() => {
            this.saving = false;
        });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerUpdateQuotaCtrl", IpLoadBalancerUpdateQuotaCtrl);
