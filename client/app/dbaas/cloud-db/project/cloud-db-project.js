angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.project", {
            url: "/{projectId}",
            redirectTo: "dbaas.cloud-db.project.info",
            views: {
                cloudDbHeaderContainer: {
                    templateUrl: "app/dbaas/cloud-db/header/cloud-db-project-header.html",
                    controller: "CloudDbProjectHeaderCtrl",
                    controllerAs: "$ctrl"
                },
                cloudDbContainer: {
                    templateUrl: "app/dbaas/cloud-db/cloud-db-detail.html",
                    controller: "CloudDbDetailCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "cloud", "dbaas/cloud-db"]
        })
        .state("dbaas.cloud-db.project.info", {
            url: "/",
            views: {
                cloudDbContent: {
                    templateUrl: "app/dbaas/cloud-db/project/cloud-db-project.html",
                    controller: "CloudDbProjectCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "cloud", "dbaas/cloud-db"]
        })
        .state("dbaas.cloud-db.project.instance-add", {
            url: "/instance/add",
            views: {
                cloudDbContent: {
                    templateUrl: "app/dbaas/cloud-db/instance/cloud-db-instance-add.html",
                    controller: "CloudDbInstanceAddCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "cloud", "dbaas/cloud-db"]
        });
});
