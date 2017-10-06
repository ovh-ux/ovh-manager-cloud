angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.user", {
            url: "/user",
            redirectTo: "dbaas.cloud-db.instance.detail.user.home",
            views: {
                cloudDbContent: {
                    template: '<div ui-view="cloudDbUser"><div>'
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/user"]
        })
        .state("dbaas.cloud-db.instance.detail.user.home", {
            url: "/",
            views: {
                cloudDbUser: {
                    templateUrl: "app/dbaas/cloud-db/user/cloud-db-user.html",
                    controller: "CloudDbUserCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/user"]
        })
        .state("dbaas.cloud-db.instance.detail.user.add", {
            url: "/add",
            views: {
                cloudDbUser: {
                    templateUrl: "app/dbaas/cloud-db/user/cloud-db-user-edit.html",
                    controller: "CloudDbUserEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/user"]
        })
        .state("dbaas.cloud-db.instance.detail.user.update", {
            url: "/{userId}",
            views: {
                cloudDbUser: {
                    templateUrl: "app/dbaas/cloud-db/user/cloud-db-user-edit.html",
                    controller: "CloudDbUserEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/user"]
        });
});
