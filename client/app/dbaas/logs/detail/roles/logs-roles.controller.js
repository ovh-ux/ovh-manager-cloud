class LogsRolesCtrl {
    constructor ($state, $stateParams, CloudMessage, ControllerHelper, LogsRolesService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.LogsRolesService = LogsRolesService;
        this.CloudMessage = CloudMessage;
        this.initLoaders();
    }

    initLoaders () {
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsRolesService.getQuota(this.serviceName)
        });

        this.roles = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getRoles(this.serviceName)
        });

        this.roleOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getSubscribedOptions(this.serviceName)
        });

        this.quota.load();
        this.roles.load();
        this.roleOptions.load();
    }

    add (info) {
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/roles/add/logs-role-add.html",
                controller: "LogsRoleAddModalCtrl",
                controllerAs: "ctrl",
                resolve: {
                    roleInfo: () => info,
                    options: () => this.roleOptions,
                    quota: () => this.quota
                }
            }
        }).then(() => this.initLoaders());
    }

    summary (info) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/roles/overview/logs-role-overview.html",
                controller: "LogsRoleOverviewCtrl",
                controllerAs: "ctrl",
                resolve: {
                    role: () => info
                }
            }
        });
    }

    showDeleteConfirm (info) {
        this.CloudMessage.flushChildMessage();
        this.LogsRolesService.deleteModal(
            info
        ).then(() => {
            this.delete = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsRolesService.deleteRole(this.serviceName, info)
                    .then(() => this.initLoaders())
            });
            this.delete.load();
        });
    }

    manageMembers (info) {
        this.$state.go("dbaas.logs.detail.members", {
            serviceName: this.serviceName,
            roleId: info.roleId
        });
    }

    editPermissions (info) {
        this.$state.go("dbaas.logs.detail.permissions", {
            serviceName: this.serviceName,
            roleId: info.roleId
        });
    }
}

angular.module("managerApp").controller("LogsRolesCtrl", LogsRolesCtrl);
