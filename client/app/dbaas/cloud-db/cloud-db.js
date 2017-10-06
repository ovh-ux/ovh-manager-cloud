angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db", {
            url: "/cloud-db",
            redirectTo: "dbaas.cloud-db.project",
            templateUrl: "app/dbaas/cloud-db/cloud-db.html",
            translations: ["common", "dbaas/cloud-db"]
        });
});
