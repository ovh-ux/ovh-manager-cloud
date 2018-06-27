angular
    .module("managerApp")
    .controller("cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl", class CloudProjectComputeInfrastructureVirtualMachineDeleteCtrl {
        constructor ($uibModalInstance, params) {
            this.$uibModalInstance = $uibModalInstance;

            this.vm = params.vm;
        }

        $onInit () {
            this.isMonthlyBilling = _(this.vm).get("monthlyBilling.status") === "ok";
        }

        backup () {
            this.$uibModalInstance.close();
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }
    });
