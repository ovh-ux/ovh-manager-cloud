(() => {
    class MetricsPlatformCtrl {
        constructor ($stateParams, $translate, METRICS_ENDPOINTS, MetricService, ovhDocUrl) {
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.METRICS_ENDPOINTS = METRICS_ENDPOINTS;
            this.MetricService = MetricService;
            this.ovhDocUrl = ovhDocUrl;

            this.platforms = [];
            this.regionName;

            this.loading;
        }

        $onInit () {
            this.loading = true;
            this.initPlatforms();
        }

        initPlatforms () {
            this.MetricService.getService(this.serviceName)
                .then(service => {
                    this.regionName = service.data.region.name;
                    _.forEach(this.METRICS_ENDPOINTS.protos, proto => this.platforms.push(
                        {
                            proto: proto, 
                            address: "https://"+proto+"."+this.regionName+"."+this.METRICS_ENDPOINTS.suffix, 
                            doc: this.getDoc("proto-"+proto)
                        }
                    ));
                    this.loading = false;
                });
        }

        getDoc (part) {
            return this.ovhDocUrl.getDocUrl(`cloud/metrics/${part || ""}`);
        }
    }

    angular.module("managerApp").controller("MetricsPlatformCtrl", MetricsPlatformCtrl);
})();
