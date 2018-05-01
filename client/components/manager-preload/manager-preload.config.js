angular.module("managerApp").run(($rootScope, $transitions, OvhApiMe) => {

    $transitions.onSuccess({}, () => {
        OvhApiMe.v6().get().$promise
            .then(() => {
                $rootScope.managerPreloadHide += " manager-preload-hide";
            });
    }, {
        priority: -1 // Last to load so we hide as much as possible
    });

});
