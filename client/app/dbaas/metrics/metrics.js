angular
    .module("managerApp")
    .config(($stateProvider) => {

        const tplPrefix = (n) => `app/dbaas/metrics/${n}.html`;

    // /metrics/service/{serviceName}
        const metricsMainState = $stateProvider.state("dbaas.metrics", {
            url: "/metrics/service/{serviceName}",
            templateUrl: tplPrefix("metrics"),
            controller: "DBaasMetricsCtrl",
            controllerAs: "$ctrl",
            translations: ["common", "dbaas/metrics"]
        });

    // /metrics/service/{serviceName}/token
        metricsMainState.state("dbaas.metrics.token", { // This state inherit from /metrics/service/{serviceName}
            url: "/token",
            templateUrl: tplPrefix("token/token"),
            controller: "DBaasMetricsTokenCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/doc
        metricsMainState.state("dbaas.metrics.endpoint", {
            url: "/endpoint",
            templateUrl: tplPrefix("endpoint/endpoint"),
            controller: "DBaasMetricsEndpointCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/setting
        metricsMainState.state("dbaas.metrics.setting", {
            url: "/setting",
            templateUrl: tplPrefix("setting/setting"),
            controller: "DBaasMetricsSettingCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/event
        metricsMainState.state("dbaas.metrics.event", {
            url: "/event",
            templateUrl: tplPrefix("event/event"),
            controller: "DBaasMetricsEventCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/stat
        metricsMainState.state("dbaas.metrics.stat", {
            url: "/stat",
            templateUrl: tplPrefix("stat/stat"),
            controller: "DBaasMetricsStatCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/quantum
        metricsMainState.state("dbaas.metrics.quantum", {
            url: "/quantum",
            templateUrl: tplPrefix("quantum/quantum"),
            controller: "DBaasMetricsQuantumCtrl",
            controllerAs: "$ctrl"
        });

    // /metrics/service/{serviceName}/quantum
        metricsMainState.state("dbaas.metrics.upgrade", {
            url: "/upgrade",
            templateUrl: tplPrefix("upgrade/upgrade"),
            controller: "DBaasMetricsUpgradeCtrl",
            controllerAs: "$ctrl"
        });
    });
