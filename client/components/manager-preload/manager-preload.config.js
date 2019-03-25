angular.module('managerApp').run(($q, $rootScope, $transitions, $translate, SessionService, CucProductsService) => {
  $transitions.onSuccess({}, () => {
    $q.all({
      user: SessionService.getUser(),
      products: CucProductsService.getProducts(),
      translate: $translate.refresh(),
    }).then(() => {
      $rootScope.managerPreloadHide += ' manager-preload-hide'; // eslint-disable-line
    });
  }, {
    priority: -1, // Last to load so we hide as much as possible
  });
});
