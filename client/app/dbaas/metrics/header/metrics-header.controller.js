(() => {
    class MetricsHeaderCtrl {
        constructor ($state, $stateParams, $translate, METRICS_ENDPOINTS, ovhDocUrl) {
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.METRICS_ENDPOINTS = METRICS_ENDPOINTS;
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
                    url: this.ovhDocUrl.getDocUrl("cloud/metrics/manager")
                }]
            });

            this.guides.sections.push({
                title: this.$translate.instant("metrics_guides_protocoles"),
                list: this.getProtocolDocs()
            });

            this.guides.sections.push({
                title: this.$translate.instant("metrics_guides_platform"),
                list: this.getPlatformDocs()
            });
        }

        getProtocolDoc (proto) {
            const doc = this.ovhDocUrl.getDocUrl("cloud/metrics/using");
            return { name: proto, url: `${doc}/#${proto}` };
        }

        getProtocolDocs () {
            return _.map(this.METRICS_ENDPOINTS.protos, proto => this.getProtocolDoc(proto));
        }

        getPlatformDocs () {
            return _.map(this.METRICS_ENDPOINTS.graphs, graph => this.getPlatformDoc(graph.name));
        }

        getPlatformDoc (graph) {
            const doc = this.ovhDocUrl.getDocUrl("cloud/metrics/visualize");
            const anchor = graph.toLowerCase();
            return { name: graph, url: `${doc}/#${anchor}` };
        }

    }
    angular.module("managerApp").controller("MetricsHeaderCtrl", MetricsHeaderCtrl);
})();
