angular.module("managerApp").config($stateProvider => {
    $stateProvider
        .state("dbaas.cloud-db.instance.detail.backup", {
            url: "/backup",
            redirectTo: "dbaas.cloud-db.instance.detail.backup.home",
            views: {
                cloudDbContent: {
                    template: '<div ui-view="cloudDbBackup"><div>'
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/backup"]
        })
        .state("dbaas.cloud-db.instance.detail.backup.home", {
            url: "/",
            views: {
                cloudDbBackup: {
                    templateUrl: "app/dbaas/cloud-db/backup/cloud-db-backup.html",
                    controller: "CloudDbBackupCtrl",
                    controllerAs: "$ctrl"
                }
            },
            translations: ["common", "dbaas/cloud-db", "dbaas/cloud-db/backup"]
        });
});
