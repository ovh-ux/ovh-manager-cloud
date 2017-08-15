angular.module("managerApp").config($stateProvider => {
    const metricsHeader =
        {
            templateUrl: "app/dbaas/metrics/header/metrics-header.html",
            controller: "MetricsHeaderCtrl",
            controllerAs: "MetricsHeaderCtrl"
        };

    $stateProvider
        .state("dbaas.metrics", {
            url: "/metrics",
            templateUrl: "app/dbaas/metrics/metrics.html",
            "abstract": true,
            translations: ["common", "dbaas/metrics"]
        })
        .state("dbaas.metrics.detail", {
            url: "/{serviceName}",
            views: {
                metricsContainer: {
                    templateUrl: "app/dbaas/metrics/metrics-detail.html",
                    controller: "MetricsDetailCtrl",
                    controllerAs: "MetricsDetailCtrl"
                }
            },
            translations: ["common", "dbaas/metrics"]
        })
        .state("dbaas.metrics.detail.dashboard", {
            url: "/dashboard",
            views: {
                metricsHeader,
                metricsContent: {
                    templateUrl: "app/dbaas/metrics/dashboard/metrics-dashboard.html",
                    controller: "MetricsDashboardCtrl",
                    controllerAs: "MetricsDashboardCtrl"
                }
            },
            translations: ["common", "dbaas/metrics", "dbaas/metrics/dashboard", "dbaas/metrics/token"]
        })
        .state("dbaas.metrics.detail.token", {
            url: "/token",
            views: {
                metricsHeader,
                metricsContent: {
                    templateUrl: "app/dbaas/metrics/token/metrics-token.html",
                    controller: "MetricsTokenCtrl",
                    controllerAs: "MetricsTokenCtrl"
                }
            },
            translations: ["common", "dbaas/metrics", "dbaas/metrics/token"]
        })
        .state("dbaas.metrics.detail.token.add", {
            url: "/add",
            views: {
                metricsHeader,
                metricsSubContent: {
                    templateUrl: "app/dbaas/metrics/token/add/metrics-token-add.html",
                    controller: "MetricsTokenAddCtrl",
                    controllerAs: "MetricsTokenAddCtrl"
                }
            },
            translations: ["common", "dbaas/metrics", "dbaas/metrics/token", "dbaas/metrics/token/add"]
        })
        .state("dbaas.metrics.detail.platform", {
            url: "/platform",
            views: {
                metricsHeader,
                metricsContent: {
                    templateUrl: "app/dbaas/metrics/platform/metrics-platform.html",
                    controller: "MetricsPlatformCtrl",
                    controllerAs: "MetricsPlatformCtrl"
                }
            },
            translations: ["common", "dbaas/metrics", "dbaas/metrics/platform"]
        });
});
