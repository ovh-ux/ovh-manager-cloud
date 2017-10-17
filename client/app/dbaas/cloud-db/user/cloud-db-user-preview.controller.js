class CloudDbUserPreviewCtrl {
    constructor ($uibModalInstance, user) {
        this.$uibModalInstance = $uibModalInstance;
        this.user = user;
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("CloudDbUserPreviewCtrl", CloudDbUserPreviewCtrl);
