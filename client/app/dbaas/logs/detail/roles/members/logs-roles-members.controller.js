class LogsRolesMembersCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        console.log(this.serviceName);
    }

    add () {
        this.CloudMessage.flushChildMessage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/roles/members/add/add-members.html",
                controller: "LogsRolesAddMembersCtrl",
                controllerAs: "ctrl"
                // resolve: {
                //     serviceName: () => this.serviceName,
                //     indexInfo: () => info,
                //     options: () => this.indexOptions
                // }
            }
        }).then(() => {
            this.initLoaders();
        });
    }

}

angular.module("managerApp").controller("LogsRolesMembersCtrl", LogsRolesMembersCtrl);
