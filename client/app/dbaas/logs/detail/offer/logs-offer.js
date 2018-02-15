angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.offer", {
            url: "/offer",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/offer/logs-offer.html",
                    controller: "LogsOfferCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/detail/offer"]
        });
});
