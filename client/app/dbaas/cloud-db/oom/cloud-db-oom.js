angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.oom", {
            url: "/oom",
            redirectTo: "dbaas.cloud-db.instance.detail.oom.home",
            views: {
                cloudDbContent: {
                    template: '<div ui-view="cloudDbOom"><div>'
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/oom"]
        })
        .state("dbaas.cloud-db.instance.detail.oom.home", {
            url: "/",
            views: {
                cloudDbOom: {
                    templateUrl: "app/dbaas/cloud-db/oom/cloud-db-oom.html",
                    controller: "CloudDbOomCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/oom"]
        });
});
