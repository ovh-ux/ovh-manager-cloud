class LogsHomeAccountCtrl {
    constructor ($location, $stateParams, $uibModalInstance, CloudMessage, ControllerHelper, LogsHomeConstant, LogsHomeService) {
        this.$location = $location;
        this.serviceName = $stateParams.serviceName;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsHomeConstant = LogsHomeConstant;
        this.LogsHomeService = LogsHomeService;
        this._initLoaders();
    }

    $onInit () {
        this.accountDetails.load();
        this.contacts.load();
        this.addContactUrl = this.LogsHomeConstant.ADD_CONTACT_URL + this.$location.absUrl();
    }

    /**
     * initializes the account details and contacts
     *
     * @memberof LogsHomeAccountCtrl
     */
    _initLoaders () {
        this.accountDetails = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getAccountDetails(this.serviceName)
        });
        this.contacts = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsHomeService.getContacts(this.serviceName)
        });
    }

    /**
     * Closes the info pop-up
     *
     * @memberof LogsHomeAccountCtrl
     */
    cancel () {
        this.$uibModalInstance.dismiss();
    }

    /**
     * Updates the contact
     *
     * @memberof LogsHomeAccountCtrl
     */
    updateContact () {
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsHomeService.updateContact(this.serviceName, this.accountDetails.data.service.contactId)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsHomeAccountCtrl", LogsHomeAccountCtrl);
