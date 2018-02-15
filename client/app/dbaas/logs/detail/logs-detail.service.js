class LogsDetailService {
    constructor ($q, $translate, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
    }

    getConfiguration (serviceName) {
        return this.$q.when(serviceName);
        //
        // return this.OvhApiLogs.Lexi().get({ serviceName })
        //     .$promise
        //     .then(response => {
        //         response.displayName = response.displayName || response.serviceName;
        //         return response;
        //     })
        //     .catch(this.ServiceHelper.errorHandler("logs_loading_error_configuration"));
    }
}

angular.module("managerApp").service("LogsDetailService", LogsDetailService);
