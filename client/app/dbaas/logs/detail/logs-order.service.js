class LogsOrderService {
    constructor (OvhApiDbaas, ServiceHelper) {
        this.OvhApiDbaasLogsOrder = OvhApiDbaas.Order().Lexi();
        this.ServiceHelper = ServiceHelper;
        this.staticOffer = {
            "logs-pro-0001": { name: "1", unit: "GB", streams: 1, tables: 1, duration: "month" },
            "logs-pro-0015": { name: "15", unit: "GB", streams: 5, tables: 5, limit: "0.5", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0030": { name: "30", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "1", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0090": { name: "90", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "3", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0150": { name: "150", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "5", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0300": { name: "300", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "10", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0600": { name: "600", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "20", limitDuration: "GB_day", duration: "month" },
            "logs-pro-0900": { name: "900", unit: "GB", streams: 5, tables: 5, collectionTool: 1, limit: "30", limitDuration: "GB_day", duration: "month" },
            "logs-pro-1500": { name: "1.5", unit: "TB", streams: 5, tables: 5, collectionTool: 1, limit: "50", limitDuration: "GB_day", duration: "month" },
            "logs-pro-3000": { name: "3", unit: "TB", streams: 5, tables: 5, collectionTool: 1, limit: "100", limitDuration: "GB_day", duration: "month" }
        };
    }

    getOrder (serviceName) {
        return this.OvhApiDbaasLogsOrder.query({
            serviceName
        }).$promise
            .then(result => {
                _.each(result, offer => {
                    offer.details = this.staticOffer[offer.planCode];
                });
                return _.filter(result, offer => offer.details !== undefined);
            }).catch(this.ServiceHelper.errorHandler("logs_order_get_error"));
    }

    saveOrder (serviceName, offerDetail) {
        return this.OvhApiDbaasLogsOrder.saveOrder({
            serviceName,
            planCode: offerDetail.selectedOffer
        }, {
            quantity: offerDetail.quantity
        }).$promise.catch(this.ServiceHelper.errorHandler("logs_order_save_order"));
    }
}

angular.module("managerApp").service("LogsOrderService", LogsOrderService);
