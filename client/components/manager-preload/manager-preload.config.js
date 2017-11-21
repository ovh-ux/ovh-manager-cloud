angular.module("managerApp").run(($rootScope, $state, OvhApiMe) => {

    $rootScope.$on("$stateChangeSuccess", () => {
        OvhApiMe.Lexi().get().$promise
            .then(() => {
                $rootScope.managerPreloadHide += " manager-preload-hide";
            });
    });

});
