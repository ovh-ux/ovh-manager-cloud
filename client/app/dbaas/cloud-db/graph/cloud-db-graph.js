angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.graph", {
            url: "/graph",
            views: {
                cloudDbContent: {
                    templateUrl: "app/dbaas/cloud-db/graph/cloud-db-graph.html",
                    controller: "CloudDbGraphCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/graph"]
        });
});
