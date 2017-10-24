/**
 * Special rules for redirections
 */
angular.module("managerApp").run(function ($rootScope, $state, $stateParams) {
    $rootScope.$on("$stateChangeStart", (evt, to, params) => {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params);
        }
    });

    $rootScope.$on("$stateChangeSuccess", function (e, state) {
        if (state && state.url === "/compute") {
            if ($state.includes("iaas.pci-project")) {
                if ($stateParams.createNewVm) {
                    $state.go("iaas.pci-project.compute.infrastructure", {
                        createNewVm: true
                    });
                } else {
                    $state.go("iaas.pci-project.compute.infrastructure");
                }
            }
        } else if (state && state.url === "/billing") {
            $state.go("iaas.pci-project.billing.consumption");
        }
    });
});
