class HousingSidebar {
    constructor ($translate, SidebarMenu, REDIRECT_URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.REDIRECT_URLS = REDIRECT_URLS;
    }

    loadIntoSection (section, services) {
        _.forEach(services, housing => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: housing.serviceName,
                title: housing.displayName || housing.serviceName,
                icon: "ovh-font ovh-font-housing",
                target: "_parent",
                url: this.REDIRECT_URLS.housing.replace("{housing}", housing.serviceName)
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("HOUSING");
    }
}

angular.module("managerApp").service("HousingSidebar", HousingSidebar);
