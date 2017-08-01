(() => {
    class VeeamStorageUpdateQuotaCtrl {
        constructor ($uibModalInstance, inventoryName, serviceName, ControllerHelper, VeeamService) {
            this.$uibModalInstance = $uibModalInstance;
            this.inventoryName = inventoryName;
            this.serviceName = serviceName;
            this.ControllerHelper = ControllerHelper;
            this.VeeamService = VeeamService;

            this.capabilities = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.VeeamService.getCapabilities(this.serviceName)
            });
        }

        $onInit () {
            this.capabilities.load();
        }

        confirm () {
            this.saving = true;
            return this.VeeamService.updateRepositoryQuota(this.serviceName, this.inventoryName, this.newQuota)
                .then(response => this.$uibModalInstance.close(response))
                .catch(response => this.$uibModalInstance.dismiss(response))
                .finally(() => {
                    this.saving = false;
                });
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

        isModalLoading () {
            return this.capabilities.loading || this.saving;
        }
    }

    angular.module("managerApp").controller("VeeamStorageUpdateQuotaCtrl", VeeamStorageUpdateQuotaCtrl);
})();
