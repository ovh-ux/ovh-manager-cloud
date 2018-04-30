class CloudProjectComputeInfrastructurePromoCtrl {
    constructor ($uibModalInstance) {
        this.$uibModalInstance = $uibModalInstance;
    }

    /**
     * Closes the modal
     */
    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructurePromoCtrl", CloudProjectComputeInfrastructurePromoCtrl);
