import { PUBLIC_CLOUD_URL } from './sidebar.constants';

angular.module('managerApp')
  .run(/* @ngTranslationsInject:json ./translations */)
  .run(($q, $translate, atInternet, Toast, SidebarMenu, SidebarOrderService, SidebarContentService,
    CucProductsService, SessionService, TARGET) => {
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
        SidebarContentService.buildSidebarContent(
          data.products.results,
          data.user.ovhSubsidiary,
        );
        return SidebarMenu.addMenuItem({
          category: 'cloud-sidebar-orphan-link',
          title: $translate.instant('cloud_sidebar_public_cloud'),
          url: PUBLIC_CLOUD_URL[TARGET],
          target: '_self',
          onClick: () => atInternet.trackClick({
            id: 'cloud_sidebar_go-to-public-cloud',
            type: 'action',
          }),
        });
      })
      .then(() => {
        // After sidebar elements are all loaded, check if there is an element for the current state
        SidebarMenu.manageStateChange();
      });
  });
