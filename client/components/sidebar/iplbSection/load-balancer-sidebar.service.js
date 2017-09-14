class LoadBalancerSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [{
            provider: this,
            type: "LOAD_BALANCER"
        }];
    }

    fillSection (services) {
        const iplbMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainLoadBalancerItem",
            title: this.$translate.instant("cloud_sidebar_section_load_balancer"),
            icon: "ovh-font ovh-font-vRack",
            loadOnState: "network.iplb",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(iplbMenuSection, this.section, false, services);
    }

    loadIntoSection (section, services) {
        _.forEach(services, service => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.displayName,
                icon: "ovh-font ovh-font-veeam",
                allowSubItems: false,
                state: "network.iplb.detail.home",
                stateParams: {
                    serviceName: service.serviceName
                },
                loadOnState: "network.iplb.detail",
                loadOnStateParams: {
                    serviceName: service.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("IP Load Balancer");
        menuItem.addSearchKey("IPLB");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_iplb"));
    }
}

angular.module("managerApp").service("LoadBalancerSidebarService", LoadBalancerSidebarService);
