class LogsRoleAddModalCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, LogsRolesService, options) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        this.options = options;
        this.LogsRolesService = LogsRolesService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
    }

    clearIndex () {
        this.role.description = "";
        this.role.name = "";
        this.role.optionId = null;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    saveRole () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsRolesService.addRole(this.serviceName, this.role)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsRoleAddModalCtrl", LogsRoleAddModalCtrl);
