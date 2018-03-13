class LogsHomeService {
    constructor ($q, $translate, CloudMessage, CloudPoll, LogsOfferConstant, LogsHomeConstant, LogsInputsConstant, LogsOptionsService, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.ContactsApiLexiService = OvhApiDbaas.Logs().Contacts().Lexi();
        this.DetailsAapiService = OvhApiDbaas.Logs().Details().Aapi();
        this.CloudMessage = CloudMessage;
        this.CloudPoll = CloudPoll;
        this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
        this.InputsApiLexiService = OvhApiDbaas.Logs().Input().Lexi();
        this.LogsLexiService = OvhApiDbaas.Logs().Lexi();
        this.LogsHomeConstant = LogsHomeConstant;
        this.LogsInputsConstant = LogsInputsConstant;
        this.LogsOptionsService = LogsOptionsService;
        this.LogsOfferConstant = LogsOfferConstant;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    getAccount (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(account => this._transformAccount(account))
            .catch(this.ServiceHelper.errorHandler("logs_home_account_get_error"));
    }

    getAccountDetails (serviceName) {
        return this.DetailsAapiService.me({ serviceName }).$promise
            .then(accountDetails => this._transformAccountDetails(accountDetails))
            .catch(this.ServiceHelper.errorHandler("logs_home_account_details_get_error"));
    }

    getContactIds () {
        return this.ContactsApiLexiService.query({})
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_home_contacts_get_error"));
    }

    getContactDetails (contactId) {
        return this.ContactsApiLexiService.get({ contactId })
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_home_contact_get_error"));
    }

    getContacts () {
        return this.getContactIds()
            .then(contactIds => {
                const promises = contactIds.map(contactId => this.getContactDetails(contactId));
                return this.$q.all(promises);
            });
    }

    getCurrentOffer (serviceName) {
        return this.LogsOfferService.getOffer(serviceName)
            .then(offer => this._transformOffer(offer));
    }

    getOptions (serviceName) {
        return this.LogsOptionsService.getSubscribedOptionsMap(serviceName)
            .then(options => {
                options.forEach(option => this._transformOption(option));
                return options;
            });
    }

    updateContact (serviceName, contactId) {
        return this.LogsLexiService.update(serviceName, { contactId })
            .then(options => {
                options.forEach(option => this._transformOption(option));
                return options;
            });
    }

    _getGreyLogUrl (object) {
        object.graylogWebuiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.GRAYLOG_WEBUI);
        return object;
    }

    _getGreyLogApiUrl (object) {
        object.graylogApiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.GRAYLOG_API);
        return object;
    }

    _getElasticSearchApiUrl (object) {
        const elasticSearchApiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.ELASTICSEARCH_API);
        object.elasticSearchApiUrl = `${elasticSearchApiUrl}/_cluster/health?pretty=true`;
        return object;
    }

    _findUrl (urls, type) {
        return urls.reduce((foundUrl, url) => url.type === type ? url.address : foundUrl, "");
    }

    _getPortsAndMessages (accountDetails) {
        const portsAndMessages = {};
        accountDetails.urls.forEach(url => {
            const urlInfo = this.LogsHomeConstant.URL_TYPES[url.type];
            if (urlInfo) {
                portsAndMessages[urlInfo.PORT] = portsAndMessages[urlInfo.PORT] ||
                    { name: this.LogsHomeConstant.PORT_TYPES[urlInfo.PORT] };
                portsAndMessages[urlInfo.PORT][urlInfo.MESSAGE] = url.address.split(":")[1];
            }
        });
        return Object.keys(portsAndMessages).map(portType => portsAndMessages[portType]);
    }

    _transformAccountDetails (accountDetails) {
        accountDetails.fullname = accountDetails.service.contact ? `${accountDetails.service.contact.firstName} ${accountDetails.service.contact.lastName}` : `${accountDetails.me.firstname} ${accountDetails.me.name}`;
        accountDetails.acccountName = `${accountDetails.fullname} - ${accountDetails.service.username}`;
        accountDetails.email = accountDetails.service.contact ? accountDetails.service.contact.email : accountDetails.me.email;
        this._getGreyLogUrl(accountDetails);
        this._getGreyLogApiUrl(accountDetails);
        accountDetails.graylogApiUrl = `${accountDetails.graylogApiUrl}/api-browser`;
        accountDetails.graylogEntryPoint = accountDetails.graylogWebuiUrl.replace("https://", "").replace("/api", "");
        this._getElasticSearchApiUrl(accountDetails);
        this._getGreyLogUrl(accountDetails.last_stream);
        this._getGreyLogUrl(accountDetails.last_dashboard);
        accountDetails.portsAndMessages = this._getPortsAndMessages(accountDetails);
        return accountDetails;
    }

    _transformAccount (account) {
        if (account.offer.reference === this.LogsOfferConstant.basicOffer) {
            account.offer.description = this.LogsOfferConstant.offertypes.BASIC;
        } else {
            const dataVolume = this.$translate.instant("logs_home_data_volume");
            const dataVolumeValue = this.$translate.instant(account.offer.reference);
            const month = this.$translate.instant("month");
            account.offer.description = `${this.LogsOfferConstant.offertypes.PRO} - ${dataVolume}: ${dataVolumeValue}/${month}`;
        }
        return account;
    }

    _transformOption (option) {
        option.description = `${option.quantity} ${option.type}: ${option.detail}`;
        return option;
    }
}

angular.module("managerApp").service("LogsHomeService", LogsHomeService);
