class LogsOrderService {
    constructor ($q, OvhApiDbaas, ServiceHelper, LogsOfferService) {
        this.$q = $q;
        this.OvhApiDbaasLogsOrder = OvhApiDbaas.Order().Lexi();
        this.ServiceHelper = ServiceHelper;
        this.LogsOfferService = LogsOfferService;
    }

    getOrder (serviceName) {
        return this.OvhApiDbaasLogsOrder.query({
            serviceName
        }).$promise
            .then(plans => {
                const promises = plans.map(plan => this.LogsOfferService.getOfferDetail(plan.planCode));
                return this.$q.all(promises).then(planDetails => _.map(plans, item => _.extend(item, _.findWhere(planDetails, { reference: item.planCode }))));
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
