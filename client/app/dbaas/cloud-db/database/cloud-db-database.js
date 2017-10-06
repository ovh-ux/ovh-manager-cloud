angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.database", {
            url: "/database",
            redirectTo: "dbaas.cloud-db.instance.detail.database.home",
            views: {
                cloudDbContent: {
                    template: '<div ui-view="cloudDbDatabase"><div>'
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/database"]
        })
        .state("dbaas.cloud-db.instance.detail.database.home", {
            url: "/",
            views: {
                cloudDbDatabase: {
                    templateUrl: "app/dbaas/cloud-db/database/cloud-db-database.html",
                    controller: "CloudDbDatabaseCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/database"]
        })
        .state("dbaas.cloud-db.instance.detail.database.add", {
            url: "/add",
            views: {
                cloudDbDatabase: {
                    templateUrl: "app/dbaas/cloud-db/database/cloud-db-database-edit.html",
                    controller: "CloudDbDatabaseEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/database"]
        })
        .state("dbaas.cloud-db.instance.detail.database.update", {
            url: "/{databaseId}",
            views: {
                cloudDbDatabase: {
                    templateUrl: "app/dbaas/cloud-db/database/cloud-db-database-edit.html",
                    controller: "CloudDbDatabaseEditCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/database"]
        });
});
