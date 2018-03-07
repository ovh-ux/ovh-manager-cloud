class LogsHomeService {
    constructor ($q, CloudMessage, CloudPoll, LogsInputsConstant, LogsOptionsService, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.DetailsAapiService = OvhApiDbaas.Logs().Details().Aapi();
        this.CloudMessage = CloudMessage;
        this.CloudPoll = CloudPoll;
        this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
        this.InputsApiLexiService = OvhApiDbaas.Logs().Input().Lexi();
        this.LogsInputsConstant = LogsInputsConstant;
        this.LogsOptionsService = LogsOptionsService;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    getAccountDetails (serviceName) {
        return this.DetailsAapiService.me({ serviceName }).$promise
            .then(accountDetails => this._transformAccountDetails(accountDetails))
            .catch(this.ServiceHelper.errorHandler("logs_home_account_details_get_error"));
    }

    _transformAccountDetails (accountDetails) {
        accountDetails.fullname = accountDetails.service.contact ? `${accountDetails.service.contact.firstName} ${accountDetails.service.contact.lastName}` : `${accountDetails.me.firstname} ${accountDetails.me.name}`;
        accountDetails.email = accountDetails.service.contact ? accountDetails.service.contact.email : accountDetails.me.email;

        return accountDetails;
    }
}

angular.module("managerApp").service("LogsHomeService", LogsHomeService);
