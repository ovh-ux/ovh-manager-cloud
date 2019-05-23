angular.module('managerApp')
  .run(/* @ngTranslationsInject:json ./translations */)
  .run(($q, $translate, atInternet, Toast, SidebarMenu, SidebarOrderService, SidebarContentService,
    CucProductsService, SessionService) => {
    const promise = $q.all({
      user: SessionService.getUser(),
      products: CucProductsService.getProducts(),
      translate: $translate.refresh(),
    })
      .catch((err) => {
        Toast.error(`${$translate.instant('cloud_sidebar_error')} ${err.data.message}`);
      });

    SidebarMenu.setInitializationPromise(promise);

    SidebarMenu.loadDeferred.promise
      .then((data) => {
        SidebarOrderService.buildSidebarMenuActions(data.user.ovhSubsidiary);
        return SidebarContentService.buildSidebarContent(
          data.products.results,
          data.user.ovhSubsidiary,
        );
      })
      .then(() => {
        // After sidebar elements are all loaded, check if there is an element for the current state
        SidebarMenu.manageStateChange();
      });
  });
