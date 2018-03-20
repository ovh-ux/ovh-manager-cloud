class LogsRoleAddModalCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, LogsRolesService, options, quota, roleInfo) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        this.options = options;
        this.quota = quota;
        this.roleInfo = roleInfo;
        this.LogsRolesService = LogsRolesService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
        this.role = this.LogsRolesService.getNewRole();
    }

    $onInit () {
        this.isEdit = this.checkIsEdit(this.roleInfo);
        if (this.isEdit) {
            this.populateRole();
        } else {
            this.clearRole();
        }
    }

    clearRole () {
        this.role.description = "";
        this.role.name = "";
        this.role.optionId = null;
    }

    populateRole () {
        this.role.description = this.roleInfo.description;
        this.role.name = this.roleInfo.name;
        this.role.optionId = this.roleInfo.optionId;
    }

    checkIsEdit (roleInfo) {
        return roleInfo !== undefined;
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
                    .finally(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }

    updateRole () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsRolesService.updateRole(this.serviceName, this.roleInfo.roleId, this.role)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
                    .finally(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsRoleAddModalCtrl", LogsRoleAddModalCtrl);