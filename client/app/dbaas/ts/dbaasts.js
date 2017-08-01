"use strict";
/**
 * Special redirections.
 */
angular.module("managerApp").run(function ($rootScope, $state) {
    $rootScope.$on("$stateChangeSuccess", function (e, state) {
        // Default tab is the 'tokens' view of a project
        if (state.name === "dbaas.dbaasts-project.dbaasts-project-details") {
            $state.go(".dbaasts-project-details-key");
        }
    });
});

angular.module("managerApp").config(function ($urlRouterProvider) {
    // Redirect /paas/dbaas to /dbaas
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path();
        if (/^\/paas\/dbaas/.test(path)) {
            return path.replace("/paas/dbaas", "/dbaas");
        }
    });
});
