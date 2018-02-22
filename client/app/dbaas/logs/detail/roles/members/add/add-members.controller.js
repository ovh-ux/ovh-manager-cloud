class LogsRolesAddMembersCtrl {
    constructor ($stateParams, $uibModalInstance, ControllerHelper, logs, LogsRolesService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.roleId = this.$stateParams.roleId;
        this.$uibModalInstance = $uibModalInstance;
        this.logs = logs;
        this.LogsRolesService = LogsRolesService;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    addMember () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsRolesService.createMember(this.serviceName, this.roleId, {
                    username: this.member.username.username,
                    note: this.member.note
                })
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsRolesAddMembersCtrl", LogsRolesAddMembersCtrl);
