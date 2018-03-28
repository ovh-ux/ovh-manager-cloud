class LogsHelperService {
    constructor ($translate, $state, OvhApiDbaas, ServiceHelper, CloudPoll, LogStreamsConstants, ControllerModalHelper) {
        this.$translate = $translate;
        this.$state = $state;
        this.ServiceHelper = ServiceHelper;
        this.CloudPoll = CloudPoll;
        this.LogStreamsConstants = LogStreamsConstants;
        this.ControllerModalHelper = ControllerModalHelper;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
    }

    killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    /**
     * Polls operation API untill it returns success or failure
     *
     * @param {any} errorMessage, message to show on UI
     * @param {any} error, the error object
     * @param {any} messageData, the data to be used in the error message
     * @memberof LogsHelperService
     */
    pollOperation (serviceName, operation) {
        this.killPoller();
        return this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogStreamsConstants.FAILURE || opn.state === this.LogStreamsConstants.SUCCESS || opn.state === this.LogStreamsConstants.REVOKED
        });
    }

    /**
     * handles error state for create, delete and update input
     *
     * @param {any} errorMessage, message to show on UI
     * @param {any} error, the error object
     * @param {any} messageData, the data to be used in the error message
     * @memberof LogsHelperService
     */
    handleError (errorMessage, error, messageData) {
        return this.ServiceHelper.errorHandler(errorMessage)({ data: _.assign(messageData, error.data) });
    }

    /**
     * handles (CRUD) operations create, delete and update.
     * Repetedly polls for operation untill it returns SUCCESS, FAILURE or REVOKED message.
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @param {any} successMessage, message to show on UI
     * @param {any} messageData, the data to be used in the success message
     * @returns promise which will be resolved to operation object
     * @memberof LogsHelperService
     */
    handleOperation (serviceName, operation, successMessage, messageData) {
        return this.pollOperation(serviceName, operation)
            .$promise
            .then(pollResult => {
                if (pollResult[0].item.state !== this.LogStreamsConstants.SUCCESS) {
                    return Promise.reject({ data: { message: "Operation failed" } });
                }
                if (successMessage) {
                    this.ServiceHelper.successHandler(successMessage)(messageData);
                }
                return pollResult;
            });
    }

    /**
     * shows offer upgrade required info modal
     * @param {string} serviceName
     */
    showOfferUpgradeModal (serviceName) {
        return this.ControllerModalHelper.showInfoModal({
            titleText: this.$translate.instant("options_upgradequotalink_increase_quota_title"),
            text: this.$translate.instant("options_upgradequotalink_increase_quota_message"),
            okButtonText: this.$translate.instant("options_upgradequotalink_increase_quota_upgrade")
        })
            .then(() => this.$state.go("dbaas.logs.detail.offer", { serviceName }));
    }

    /**
     * return true if account is of type basic, false otherwise
     * @param {accountDetails} account
     */
    isBasicOffer (account) {
        return !account.offer.reference.startsWith("logs-pro");
    }
}

angular.module("managerApp").service("LogsHelperService", LogsHelperService);
