angular.module("managerApp")
    .component("metricsChartPie", {
        templateUrl: "app/dbaas/metrics/component-chart-pie/metrics-chart-pie.component.html",
        bindings: {
            value: "<",
            color: "<",
            text: "<",
            textSmall: "<"
        },
        controller: "MetricsChartPieController"
    });
