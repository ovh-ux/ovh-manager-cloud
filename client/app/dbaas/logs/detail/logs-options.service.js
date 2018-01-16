class LogsOptionsService {
    constructor (OvhApiOrderCartServiceOption, ServiceHelper) {
        this.OvhApiOrderCartServiceOption = OvhApiOrderCartServiceOption;
        this.ServiceHelper = ServiceHelper;
    }

    getOptions (serviceName) {
        return this.OvhApiOrderCartServiceOption.Lexi().get({
            productName: "logs",
            serviceName
        }).$promise
            .catch(this.ServiceHelper.errorHandler("logs_order_options_loading_error"));
    }
}

angular.module("managerApp").service("LogsOptionsService", LogsOptionsService);
