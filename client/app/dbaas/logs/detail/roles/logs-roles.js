angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.roles", {
            url: "/roles",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/roles/logs-roles.html",
                    controller: "LogsRolesCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/roles", "dbaas/logs/detail/optoins", "dbaas/logs/detail/options/upgradequotalink", "dbaas/logs/detail/options/addtool"]
        })
        .state("dbaas.logs.detail.members", {
            url: "/members/:roleId",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/roles/members/logs-roles-members.html",
                    controller: "LogsRolesMembersCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/roles/members", "dbaas/logs/detail/options"]
        })
        .state("dbaas.logs.detail.permissions", {
            url: "/permissions/:roleId",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/roles/edit-permissions/edit-permissions.html",
                    controller: "LogsRolesPermissionsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/roles/members", "dbaas/logs/detail/options", "dbaas/logs/detail/index", "dbaas/logs/detail/aliases", "dbaas/logs/detail/streams", "dbaas/logs/detail/dashboards"]
        });
});
