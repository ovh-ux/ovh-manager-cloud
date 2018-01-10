angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.logs.detail.streams", {
            url: "/streams",
            views: {
                logsContent: {
                    templateUrl: "app/dbaas/logs/detail/streams/logs-streams.html",
                    controller: "LogsStreamsCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.detail", {
            url: "/:streamId",
            "abstract": true,
            views: {
                logsStreams: {
                    template: '<div ui-view="logsStreamsDetail"></div>',
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams"]
        })
        .state("dbaas.logs.detail.streams.detail.follow", {
            url: "/follow",
            views: {
                logsStreamsDetail: {
                    templateUrl: "app/dbaas/logs/detail/streams/follow/streams-follow.html",
                    controller: "LogsStreamsFollowCtrl",
                    controllerAs: "ctrl"
                }
            },
            translations: ["common", "dbaas/logs", "dbaas/logs/streams/home"]
        });
});
