angular.module("managerApp").controller("DBaasMetricsEndpointCtrl", class {

    constructor (ovhDocUrl, METRICS_ENDPOINTS, metricsService, $translate) {
        this.endpoints = METRICS_ENDPOINTS;
        this.doc = ovhDocUrl;
        this.$translate = $translate;

        metricsService.getService()
            .then((service) => {
                this.service = service;
            })
            .catch((err) => {
                Toast.error(this.$translate.instant("metrics_err_service"), err);
            });
    }

    getDoc (part) {
        return this.doc.getDocUrl(`cloud/metrics/${part || ""}`);
    }
});
