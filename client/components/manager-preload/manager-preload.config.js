angular.module("managerApp").run(($rootScope, $transitions, OvhApiMe) => {

    $transitions.onSuccess({}, () => {
        OvhApiMe.Lexi().get().$promise
            .then(() => {
                $rootScope.managerPreloadHide += " manager-preload-hide";
            });
    }, {
        priority: -1 // Last to load so we hide as much as possible
    });

});
