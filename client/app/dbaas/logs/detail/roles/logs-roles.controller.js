class LogsRolesCtrl {
    constructor ($stateParams, CloudMessage, ControllerHelper, LogsRolesService) {
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

    editPermissions () {
        //TODO: edit permissions
    }

    manageMembers () {
        //TODO: manage members
    }

    add (info) {
        console.log(info);
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/roles/add/logs-role-add.html",
                controller: "LogsRoleAddModalCtrl",
                controllerAs: "ctrl",
                resolve: {
                    options: () => this.roleOptions
                }
            }
        }).then(() => {
            console.log("have to poll for data again  | stupid clear cache not working");
            this.initLoaders();
        });
    }
}

angular.module("managerApp").controller("LogsRolesCtrl", LogsRolesCtrl);
