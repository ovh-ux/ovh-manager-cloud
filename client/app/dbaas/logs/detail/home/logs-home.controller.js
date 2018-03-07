class LogsHomeCtrl {
    constructor ($state, $stateParams, $translate, CloudMessage, ControllerHelper, LogsInputsConstant, LogsHomeService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsConstant = LogsInputsConstant;
        this.LogsHomeService = LogsHomeService;
        this._initLoaders();
    }

    $onInit () {
        this._initActions();
        this.accountDetails.load();
    }

    /**
     * initializes the inputs and the quota
     *
     * @memberof LogsHomeCtrl
     */
    _initLoaders () {
        this.accountDetails = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getAccountDetails(this.serviceName)
        });
    }

    _initActions () {
        this.actions = {
            changeName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.editName(),
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            },
            editTokens: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.editTokens(),
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            },
            changePassword: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.editPassword(),
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            }
        };
    }

    editName () {
        console.log("Edit Name");
    }

    editTokens () {
        console.log("Edit Tokens");
    }

    editPassword () {
        console.log("Edit Password");
    }
}

angular.module("managerApp").controller("LogsHomeCtrl", LogsHomeCtrl);
