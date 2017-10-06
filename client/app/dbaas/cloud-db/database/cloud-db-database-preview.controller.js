class CloudDbDatabasePreviewCtrl {
    constructor ($uibModalInstance, database) {
        this.$uibModalInstance = $uibModalInstance;
        this.database = database;
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("CloudDbDatabasePreviewCtrl", CloudDbDatabasePreviewCtrl);
