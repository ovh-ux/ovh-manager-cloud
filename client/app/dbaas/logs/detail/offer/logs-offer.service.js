class LogsOfferService {
    constructor (OvhApiDbaas, ServiceHelper) {
        this.OvhApiDbaasLogsOffer = OvhApiDbaas.Logs().Offer().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    getOffer (serviceName) {
        return this.OvhApiDbaasLogsOffer.get({
            serviceName
        }).$promise
            .catch(this.ServiceHelper.errorHandler("logs_offer_load_error"));
    }
}

angular.module("managerApp").service("LogsOfferService", LogsOfferService);
