angular.module("managerApp").run(($rootScope, $state) => {

    $rootScope.$on("$stateChangeSuccess", () => {
	    $rootScope.managerPreloadHide += " manager-preload-hide";
    });

});
