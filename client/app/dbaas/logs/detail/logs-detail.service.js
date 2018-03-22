class LogsDetailService {
    constructor ($q, $translate, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.LogsLexiService = OvhApiDbaas.Logs().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    getConfiguration (serviceName) {
        return this.LogsLexiService.logDetail({ serviceName })
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_details_error"));
    }
}

angular.module("managerApp").service("LogsDetailService", LogsDetailService);
