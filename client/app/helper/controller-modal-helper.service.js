class ControllerModalHelper {
    constructor ($q, $translate, $uibModal) {
        this.$q = $q;
        this.$translate = $translate;
        this.$uibModal = $uibModal;
        this.unhandledError = ["backdrop click", "escape key press"];
    }

    showModal (config = {}) {
        const modalConfig = _.assign({
            windowTopClass: "cui-modal"
        }, config.modalConfig);
        const modalInstance = this.$uibModal.open(modalConfig);

        const deferred = this.$q.defer();
        modalInstance.result.then(result => {
            if (config.successHandler) {
                config.successHandler(result);
            }
            deferred.resolve(result);
        }).catch(err => {
            // We check for backdrop click as error.  It happens when we click a button behind the modal.  We don't want an error message for that.
            if (!_.includes(this.unhandledError, err)) {
                if (config.errorHandler) {
                    config.errorHandler(err);
                }
                deferred.reject(err);
            }
        });

        return deferred.promise;
    }

    showWarningModal (config = {}) {
        return this.showModal({
            modalConfig: {
                templateUrl: "app/ui-components/modal/warning-modal/warning-modal.html",
                controller: "WarningModalController",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => config
                }
            }
        });
    }

    showInfoModal (config = {}) {
        return this.showModal({
            modalConfig: {
                templateUrl: "app/ui-components/modal/info-modal/info-modal.html",
                controller: "InfoModalController",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => config
                }
            }
        });
    }

    showConfirmationModal (config = {}) {
        return this.showModal({
            modalConfig: {
                templateUrl: "app/ui-components/modal/confirmation-modal/confirmation-modal.html",
                controller: "ConfirmationModalController",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => config
                }
            }
        });
    }

    showNameChangeModal (config = {}) {
        return this.showModal({
            modalConfig: {
                templateUrl: "app/ui-components/modal/name-change-modal/name-change-modal.html",
                controller: "NameChangeModalCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => config
                }
            }
        });
    }

    showDeleteModal (config = {}) {
        config.submitButtonText = config.submitButtonText || this.$translate.instant("common_delete");
        return this.showConfirmationModal(config);
    }

    showVrackAssociateModal (config = {
        title: "Activer les réseaux privés (via vRack)",
        message: "Should be done by Ravindra team.  Awaiting https://github.com/ovh-ux/ovh-manager-cloud/pull/402"
    }) {
        return this.showWarningModal(config);
    }
}

angular.module("managerApp").service("ControllerModalHelper", ControllerModalHelper);
