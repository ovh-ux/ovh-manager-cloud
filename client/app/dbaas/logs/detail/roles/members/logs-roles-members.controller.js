class LogsRolesMembersCtrl {
    constructor ($stateParams, ControllerHelper, CloudMessage, LogsRolesService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.roleId = this.$stateParams.roleId;
        this.ControllerHelper = ControllerHelper;
        this.LogsRolesService = LogsRolesService;
        this.CloudMessage = CloudMessage;

        this.initLoaders();
    }

    initLoaders () {
        this.roleDetails = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getRoleDetails(this.serviceName, this.roleId)
        });

        this.logs = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getLogs()
        });

        this.roleDetails.load();
        this.logs.load();
    }

    add () {
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/roles/members/add/add-members.html",
                controller: "LogsRolesAddMembersCtrl",
                controllerAs: "ctrl",
                resolve: {
                    serviceName: () => this.serviceName,
                    logs: () => this.logs
                }
            }
        }).then(() => this.initLoaders());
    }

    revoke (info) {
        this.CloudMessage.flushChildMessage();
        this.LogsRolesService.deleteMemberModal(info.username).then(() => {
            this.delete = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsRolesService.removeMember(this.serviceName, this.roleId, info.username)
                    .then(() => this.initLoaders())
            });
            this.delete.load();
        });
    }

}

angular.module("managerApp").controller("LogsRolesMembersCtrl", LogsRolesMembersCtrl);
