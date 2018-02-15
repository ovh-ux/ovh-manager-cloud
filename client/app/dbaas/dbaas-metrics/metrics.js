angular.module("managerApp").config($stateProvider => {
    const metricsHeader =
        {
            templateUrl: "app/dbaas/dbaas-metrics/header/metrics-header.html",
            controller: "MetricsHeaderCtrl",
            controllerAs: "MetricsHeaderCtrl"
        };

    $stateProvider
        .state("dbaas.metrics", {
            url: "/metrics",
            views: {
                dbaasContainer: {
                    templateUrl: "app/dbaas/dbaas-metrics/metrics.html",
                }
            },
            "abstract": true,
            translations: ["common", "dbaas/dbaas-metrics"]
        })
        .state("dbaas.metrics.detail", {
            url: "/{serviceName}",
            views: {
                metricsContainer: {
                    templateUrl: "app/dbaas/dbaas-metrics/metrics-detail.html",
                    controller: "MetricsDetailCtrl",
                    controllerAs: "MetricsDetailCtrl"
                }
            },
            translations: ["common", "dbaas/dbaas-metrics"]
        })
        .state("dbaas.metrics.detail.dashboard", {
            url: "/dashboard",
            views: {
                metricsHeader,
                metricsContent: {
                    templateUrl: "app/dbaas/dbaas-metrics/dashboard/metrics-dashboard.html",
                    controller: "MetricsDashboardCtrl",
                    controllerAs: "MetricsDashboardCtrl"
                }
            },
            translations: ["common", "dbaas/dbaas-metrics", "dbaas/dbaas-metrics/dashboard", "dbaas/dbaas-metrics/token"]
        })
        .state("dbaas.metrics.detail.token", {
            url: "/token",
            redirectTo: "dbaas.metrics.detail.token.home",
            views: {
                metricsHeader,
                metricsContent: {
                    template: `
                        <div ui-view="metricsContent"></div>
                    `
                }
            },
            translations: ["common", "dbaas/dbaas-metrics", "dbaas/dbaas-metrics/token"]
        })
        .state("dbaas.metrics.detail.token.home", {
            url: "/",
            views: {
                metricsContent: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/metrics-token.html",
                    controller: "MetricsTokenCtrl",
                    controllerAs: "MetricsTokenCtrl"
                }
            },
            translations: ["common", "dbaas/dbaas-metrics", "dbaas/dbaas-metrics/token"]
        })
        .state("dbaas.metrics.detail.token.add", {
            url: "/add",
            views: {
                metricsContent: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/add/metrics-token-add.html",
                    controller: "MetricsTokenAddCtrl",
                    controllerAs: "MetricsTokenAddCtrl"
                }
            },
            translations: ["common", "dbaas/dbaas-metrics", "dbaas/dbaas-metrics/token", "dbaas/dbaas-metrics/token/add"]
        })
        .state("dbaas.metrics.detail.platform", {
            url: "/platform",
            views: {
                metricsHeader,
                metricsContent: {
                    templateUrl: "app/dbaas/dbaas-metrics/platform/metrics-platform.html",
                    controller: "MetricsPlatformCtrl",
                    controllerAs: "MetricsPlatformCtrl"
                }
            },
            translations: ["common", "dbaas/dbaas-metrics", "dbaas/dbaas-metrics/platform"]
        });
});
