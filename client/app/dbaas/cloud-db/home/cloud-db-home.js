angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.home", {
            url: "/home",
            views: {
                cloudDbContent: {
                    templateUrl: "app/dbaas/cloud-db/home/cloud-db-home.html",
                    controller: "CloudDbHomeCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "cloud-db", "dbaas/cloud-db/home", "dbaas/cloud-db/network", "dbaas/cloud-db/backup"]
        });
});
