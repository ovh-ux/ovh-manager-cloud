/**
 *  Two main sections (IaaS and PaaS)
 */
angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("paas", {
                url: "/paas",
                abstract: true,
                template: "<ui-view/>",
                translations: ["common", "cloud"]
            });
    });
