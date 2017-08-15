class ControllerModalHelper {
    constructor ($uibModal) {
        this.$uibModal = $uibModal;
        this.unhandledError = ["backdrop click", "escape key press"];
    }

    showModal (config = {}) {
        const modalConfig = _.assign({
            windowTopClass: "cui-modal"
        }, config.modalConfig);
        const modalInstance = this.$uibModal.open(modalConfig);

        modalInstance.result.then(result => {
            if (config.successHandler) {
                config.successHandler(result);
            }
        }).catch(err => {
            // We check for backdrop click as error.  It happens when we click a button behind the modal.  We don't want an error message for that.
            if (!_.includes(this.unhandledError, err) && config.errorHandler) {
                config.errorHandler(err);
            }
        });

        return modalInstance;
    }

    showWarningModal (config = {}) {
        return this.showModal({
            modalConfig: {
                templateUrl: "app/ui-components/modal/warning-modal/warning-modal.html",
                controller: "WarningModalController",
                controllerAs: "ctrl",
                resolve: {
                    params: () => config
                }
            }
        });
    }
}

angular.module("managerApp").service("ControllerModalHelper", ControllerModalHelper);
