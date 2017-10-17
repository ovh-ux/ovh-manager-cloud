angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance", {
            url: "/{projectId}/instance",
            "abstract": true,
            views: {
                cloudDbHeaderContainer: {
                    template: `
                        <div ui-view="cloudDbHeaderContainer"></div>
                    `,
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
        .state("dbaas.cloud-db.instance.detail", {
            url: "/{projectId}/instance/detail/{instanceId}",
            redirectTo: "dbaas.cloud-db.instance.detail.home",
            views: {
                cloudDbHeaderContainer: {
                    templateUrl: "app/dbaas/cloud-db/header/cloud-db-instance-header.html",
                    controller: "CloudDbInstanceHeaderCtrl",
                    controllerAs: "$ctrl"
                },
                cloudDbContent: {
                    template: `
                        <div ui-view="cloudDbContent"></div>
                    `,
                    controller: "CloudDbInstanceCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "cloud", "dbaas/cloud-db"]
        });
});
