(() => {
    class VeeamEnterpriseLicenseCtrl {
        constructor ($uibModalInstance, action, serviceName, ControllerHelper, VeeamEnterpriseService) {
            this.$uibModalInstance = $uibModalInstance;
            this.action = action;
            this.serviceName = serviceName;
            this.ControllerHelper = ControllerHelper;
            this.VeeamEnterpriseService = VeeamEnterpriseService;

            this.form = {};
        }

        dismissModal () {
            this.$uibModalInstance.dismiss("cancel");
        }

        submitForm (form) {
            if (form.$valid) {
                this.loading = true;
                this.VeeamEnterpriseService
                    .postConfiguration(
                        this.action,
                        this.serviceName,
                        this.form.ip,
                        this.form.port,
                        this.form.username,
                        this.form.password
                    )
                    .finally(() => {
                        this.$uibModalInstance.close();
                    });
            }
        }
    }

    angular.module("managerApp").controller("VeeamEnterpriseLicenseCtrl", VeeamEnterpriseLicenseCtrl);
})();
