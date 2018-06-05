angular.module("managerApp")
    .config(SidebarMenuProvider => {
        SidebarMenuProvider.addTranslationPath("../components/sidebar");
    })
    .run(($q, $translate, Toast, SidebarMenu, SidebarService, SidebarOrderService, SidebarDataStructureService,
          ProductsService, SessionService, IaasSectionSidebarService, PaasSectionSidebarService,
          MetricsSectionSidebarService, LogsSectionSidebarService, VrackSectionSidebarService,
          LoadBalancerSectionSidebarService, CloudDesktopSectionSidebarService, IpSectionSidebarService,
          LicenseSectionSidebarService) => {

        // In order of appearance in the menu
        const sections = [
            IaasSectionSidebarService,
            PaasSectionSidebarService,
            MetricsSectionSidebarService,
            LogsSectionSidebarService,
            LoadBalancerSectionSidebarService,
            IpSectionSidebarService,
            LicenseSectionSidebarService,
            VrackSectionSidebarService,
            CloudDesktopSectionSidebarService
        ];

        function initSidebar () {
            const promise = $q.all({
                user: SessionService.getUser(),
                products: ProductsService.getProducts(),
                translate: $translate.refresh()
            }).catch(err => {
                Toast.error([$translate.instant("cloud_sidebar_error"), err.data.message || ""].join(" "));
            });

            SidebarMenu.setInitializationPromise(promise);

            SidebarMenu.loadDeferred.promise
                .then(data => {
                    SidebarOrderService.fillSidebarMenuActions(data.user.ovhSubsidiary);
                    let allProductsOfUser = SidebarDataStructureService.transformProducts(data.products.results, sections);
                    return SidebarService.fillSidebarMenuItems(allProductsOfUser, sections, data.user.ovhSubsidiary);
                })
                .then(() => {
                    // After sidebar elements are all loaded, check if there is an element for the current state
                    SidebarMenu.manageStateChange();
                });
        }

        initSidebar();
    });
