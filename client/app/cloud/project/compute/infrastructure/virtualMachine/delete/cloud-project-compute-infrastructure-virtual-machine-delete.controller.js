{
    class CloudProjectComputeInfrastructureVirtualMachineDeleteCtrl {
        constructor ($uibModalInstance, params) {
            this.$uibModalInstance = $uibModalInstance;

            this.params = params;
        }

        $onInit () {
            this.vm = this.params.vm;
            this.isMonthlyBilling = _(this.vm).get("monthlyBilling.status") === "ok";
        }

        backup () {
            this.$uibModalInstance.close();
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }
    }

    angular
        .module("managerApp")
        .controller("cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl", CloudProjectComputeInfrastructureVirtualMachineDeleteCtrl);
}

