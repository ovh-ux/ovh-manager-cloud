angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.log", {
            url: "/log",
            views: {
                cloudDbContent: {
                    templateUrl: "app/dbaas/cloud-db/log/cloud-db-log.html",
                    controller: "CloudDbLogCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/log"]
        });
});
