class LogsInputsHomeInfoModalCtrl {
    constructor ($uibModalInstance, currentInput) {
        this.currentInput = currentInput;
        this.$uibModalInstance = $uibModalInstance;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsInputsHomeInfoModalCtrl", LogsInputsHomeInfoModalCtrl);
