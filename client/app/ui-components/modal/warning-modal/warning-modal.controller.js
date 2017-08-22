class WarningModalController {
    constructor ($uibModalInstance, params) {
        this.$uibModalInstance = $uibModalInstance;
        this.params = params;
    }

    dismissModal () {
        this.$uibModalInstance.dismiss();
    }

    closeModal () {
        this.$uibModalInstance.close();
    }
}

angular.module("managerApp").controller("WarningModalController", WarningModalController);
