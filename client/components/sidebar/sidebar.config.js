angular.module("managerApp").config(function (SidebarMenuProvider) {
    "use strict";
    // add translation path
    SidebarMenuProvider.addTranslationPath("../components/sidebar");
}).run(function ($q, $translate, Toast, SidebarMenu, SidebarService, IaasSectionSidebarService, PaasSectionSidebarService,
                 MetricsSectionSidebarService, VrackSectionSidebarService, LoadBalancerSidebarService, User, Products,
                 FeatureAvailabilityService, REDIRECT_URLS, URLS) {
    "use strict";

    /*==========================================
     =            SIDEBAR MENU ITEMS            =
     ==========================================*/

    function getServices (products) {
        return {
            iaas: SidebarService.getServices(IaasSectionSidebarService.section, products),
            paas: SidebarService.getServices(PaasSectionSidebarService.section, products),
            metrics: SidebarService.getServices(MetricsSectionSidebarService.section, products),
            vracks: SidebarService.getServices(VrackSectionSidebarService.section, products),
            load_balancer: SidebarService.getServices(LoadBalancerSidebarService.section, products)
        };
    }
    /*----------  SERVICES MENU ITEMS  ----------*/
    function initSidebarMenuItems (services, locale) {
        IaasSectionSidebarService.fillSection(services.iaas);
        PaasSectionSidebarService.fillSection(services.paas);
        MetricsSectionSidebarService.fillSection(services.metrics);

        SidebarMenu.addMenuItem({
            title: $translate.instant("cloud_sidebar_section_license"),
            icon: "certificate",
            url: REDIRECT_URLS.license,
            target: "_parent"
        });

        SidebarMenu.addMenuItem({
            title: $translate.instant("cloud_sidebar_section_ip"),
            icon: "ip",
            url: REDIRECT_URLS.ip,
            target: "_parent"
        });

        LoadBalancerSidebarService.fillSection(services.load_balancer);
        VrackSectionSidebarService.fillSection(services.vracks);

        if (FeatureAvailabilityService.hasFeature("DESKAAS", "sidebarMenu", locale)) {
            SidebarMenu.addMenuItem({
                title: $translate.instant("cloud_sidebar_section_cloud_desktop"),
                icon: "cloud-desktop",
                url: REDIRECT_URLS.cloudDesktop,
                target: "_parent"
            });
        }
    }

    /*-----  End of SIDEBAR MENU ITEMS  ------*/

    /*============================================
     =            ACTIONS MENU OPTIONS            =
     ============================================*/

    function initSidebarMenuActionsOptions (locale) {

        _.forEach([
            IaasSectionSidebarService.section,
            PaasSectionSidebarService.section,
            MetricsSectionSidebarService.section,
            VrackSectionSidebarService.section
        ], section => {
            _.forEach(section, product => {
                if (FeatureAvailabilityService.hasFeature(product.type, "sidebarOrder", locale)) {
                    let order = SidebarService.addOrder(product);
                    if (order) {
                        SidebarMenu.addActionsMenuOption(order);
                    }
                }
            })
        });

        SidebarMenu.addActionsMenuOptions([{
                title: $translate.instant("cloud_sidebar_actions_menu_ip"),
                icon: "ip",
                href: REDIRECT_URLS.ip,
                target: "_parent"
            }, {
                title: $translate.instant("cloud_sidebar_actions_menu_iplb"),
                icon: "ip",
                href: URLS.website_order.load_balancer[locale],
                target: "_blank",
                external: true
            }, {
                title: $translate.instant("cloud_sidebar_actions_menu_licence"),
                icon: "certificate",
                href: REDIRECT_URLS.license,
                target: "_parent"
            },{
                title: $translate.instant("cloud_sidebar_actions_menu_clouddb"),
                icon: "database",
                href: REDIRECT_URLS.orderSql,
                target: "_blank"
            }
        ]);
    }

    /*-----  End of ACTIONS MENU OPTIONS  ------*/

    /*======================================
     =            INITIALIZATION            =
     ======================================*/

    function init () {
        // set initialization promise
        var promise = $q.all({
            user: User.Lexi().get().$promise,
            products: Products.Aapi().get({
                universe: "cloud"
            }).$promise,
            translate: $translate.refresh()
        }).catch(function (err) {
            Toast.error([$translate.instant("cloud_sidebar_error"), err.data.message || ""].join(" "));
        });

        SidebarMenu.setInitializationPromise(promise);

        // wait that sidebar is loaded (wait that translations are loaded and init promise is resolved)
        SidebarMenu.loadDeferred.promise
            .then(function (data) {
                initSidebarMenuActionsOptions(data.user.ovhSubsidiary);
                var services = getServices(data.products.results);
                return initSidebarMenuItems(services, data.user.ovhSubsidiary);
            })
            .then(function () {
                //After sidebar elements are all loaded, check if there is an element for the current state and select it.
                SidebarMenu.manageStateChange();
            });
    }

    /*-----  End of INITIALIZATION  ------*/

    init();

});
