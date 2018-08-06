{
    class CloudProjectComputeInfrastructurePrivateNetworkDeleteCtrl {
        constructor ($stateParams, $uibModalInstance,
                     CloudProjectComputeInfrastructurePrivateNetworkService, params) {
            this.$stateParams = $stateParams;
            this.$uibModalInstance = $uibModalInstance;

            this.CloudProjectComputeInfrastructurePrivateNetworkService = CloudProjectComputeInfrastructurePrivateNetworkService;
            this.params = params;
        }

        $onInit () {
            this.serviceName = this.$stateParams.projectId;
        }

        deletePrivateNetwork () {
            this.CloudProjectComputeInfrastructurePrivateNetworkService.deleteProjectNetworkPrivate(this.serviceName, this.params);
        }

        confirm () {
            this.$uibModalInstance.close();

            return this.deletePrivateNetwork();
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }
    }

    angular
        .module("managerApp")
        .controller("cloudProjectComputeInfrastructurePrivateNetworkDeleteCtrl", CloudProjectComputeInfrastructurePrivateNetworkDeleteCtrl);
}

