(() => {
    class MetricsHeaderCtrl {
        constructor ($state, $stateParams, $translate, ovhDocUrl) {
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.ovhDocUrl = ovhDocUrl;

            this.guides = {};
        }

        $onInit () {
            this.initGuides();
        }

        initGuides () {
            this.guides.title = this.$translate.instant("metrics_guides");
            this.guides.footer = this.$translate.instant("metrics_guides_footer");
            this.guides.sections = [];
            this.guides.sections.push({
                title: this.$translate.instant("metrics_guides_first-step"),
                list: [{
                    name: this.$translate.instant("metrics_guides_first-step_begin"),
                    url: this.ovhDocUrl.getDocUrl("cloud/metrics")
                }]
            });
            this.guides.sections.push({
                title: this.$translate.instant("metrics_guides_protocoles"),
                list: [
                    {
                        name: "Warp10",
                        url: this.ovhDocUrl.getDocUrl("cloud/metrics/proto-warp10")
                    },
                    {
                        name: "OpenTSDB",
                        url: this.ovhDocUrl.getDocUrl("cloud/metrics/proto-opentsdb")
                    },
                ]
            });

        }

    }
    angular.module("managerApp").controller("MetricsHeaderCtrl", MetricsHeaderCtrl);
})();
