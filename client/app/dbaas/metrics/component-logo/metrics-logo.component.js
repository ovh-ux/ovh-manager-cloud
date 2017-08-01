angular.module("managerApp")
    .component("metricsLogo", {
        template: '<ng-include src="$ctrl.getLogo($ctrl.type)"><ng-include>',
        bindings: {
            type: "<"
        },
        controller: "MetricsLogoController"
    });
