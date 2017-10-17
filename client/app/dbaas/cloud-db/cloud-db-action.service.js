class CloudDbActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    showBackupEditModal (projectId, instanceId) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/cloud-db/backup/cloud-db-backup-edit.html",
                controller: "CloudDbBackupEditCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => ({ projectId, instanceId })
                }
            }
        });
    }

    showNetworkEditModal (projectId, instanceId, networkId) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/cloud-db/network/cloud-db-network-edit.html",
                controller: "CloudDbNetworkEditCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => ({ projectId, instanceId, networkId })
                }
            }
        });
    }

    showDatabasePreviewModal (projectId, instanceId, database) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/cloud-db/database/cloud-db-database-preview.html",
                controller: "CloudDbDatabasePreviewCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    database: () => database
                }
            }
        });
    }

    showUserPreviewModal (projectId, instanceId, user) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/cloud-db/user/cloud-db-user-preview.html",
                controller: "CloudDbUserPreviewCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    user: () => user
                }
            }
        });
    }
}

angular.module("managerApp").service("CloudDbActionService", CloudDbActionService);
