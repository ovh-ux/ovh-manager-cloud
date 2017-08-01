angular.module("managerApp")
    .controller("MetricsLogoController", class {
        constructor ($scope) {
            this.scope = $scope;
            this.path = "app/dbaas/metrics/component-logo/";
        }

        getLogo (type) {
            return type ? `${this.path}${type}.html` : null;
        }
    });
