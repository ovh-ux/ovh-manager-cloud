class NasSidebar {
    constructor ($translate, SidebarMenu, REDIRECT_URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.REDIRECT_URLS = REDIRECT_URLS;
    }

    loadIntoSection (section, services) {
        _.forEach(services, oldNas => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: oldNas.serviceName,
                title: oldNas.displayName || oldNas.serviceName,
                icon: "oldNAS",
                target: "_parent",
                url: this.REDIRECT_URLS.nasPage.replace("{nas}", oldNas.serviceName)
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("NAS");
    }
}

angular.module("managerApp").service("NasSidebar", NasSidebar);
