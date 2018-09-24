angular.module('managerApp').run(($q, $rootScope, $transitions, $translate, SessionService, ProductsService) => {
  $transitions.onSuccess({}, () => {
    $q.all({
      user: SessionService.getUser(),
      products: ProductsService.getProducts(),
      translate: $translate.refresh(),
    }).then(() => {
      $rootScope.managerPreloadHide += ' manager-preload-hide'; // eslint-disable-line
    });
  }, {
    priority: -1, // Last to load so we hide as much as possible
  });
});
