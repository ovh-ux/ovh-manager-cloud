angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(
    import(`ovh-angular-sidebar-menu/src/ovh-angular-sidebar-menu/translations/Messages_${$translate.use()}.xml`)
      .catch(() => import(`ovh-angular-sidebar-menu/src/ovh-angular-sidebar-menu/translations/Messages_${$translate.fallbackLanguage()}.xml`))
      .then(x => x.default),
  );
  asyncLoader.addTranslations(import(`./translations/Messages_${$translate.use()}.json`).then(x => x.default));
  $translate.refresh();
});
angular.module('managerApp')
  .run(($q, $translate, Toast, SidebarMenu, SidebarOrderService, SidebarContentService,
    CucProductsService, SessionService) => {
    const promise = $q.all({
      user: SessionService.getUser(),
      products: CucProductsService.getProducts(),
      translate: $translate.refresh(),
    }).catch((err) => {
      Toast.error(`${$translate.instant('cloud_sidebar_error')} ${err.data.message}`);
    });

    SidebarMenu.setInitializationPromise(promise);

    SidebarMenu.loadDeferred.promise
      .then((data) => {
        data.products.results.push({
          name: 'ANALYTICS_DATA_PLATFORM',
          services: [
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f80', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f80' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f81', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f81' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f82', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f82' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f83', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f83' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f84', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f84' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f85', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f85' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f86', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f86' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f87', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f87' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f88', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f88' },
            { serviceName: '5b7a7fd3-4d0a-4eed-879c-167cd4658f89', displayName: 'MockedClusterName::mockedProjectId::5b7a7fd3-4d0a-4eed-879c-167cd4658f89' },
          ],
        });
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
