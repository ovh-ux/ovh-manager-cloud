(() => {
    "use strict";

    class MetricsChartPieController {
        constructor () {
            this.rayon = 25;
            this.offset = -25; // to start at the top
            this.ringSize = 2 * Math.PI * this.rayon;
        }

        percentToSize (percent) {
            return percent * this.ringSize / 100 || 0;
        }
    }

    angular.module("managerApp")
        .component("metricsChartPie", {
            templateUrl: "app/dbaas/metrics/dashboard/chart-pie/metrics-chart-pie.component.html",
            bindings: {
                value: "<",
                color: "<",
                text: "<",
                textSmall: "<",
                legend: "<"
            },
            controller: MetricsChartPieController
        });
})();
