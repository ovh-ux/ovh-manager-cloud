class LicenseSidebar {
    constructor ($translate, SidebarMenu, REDIRECT_URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.type = "LICENSE";
    }

    addOrder () {
        return {
            id: "order-license",
            title: this.$translate.instant("cloud_sidebar_actions_menu_licence"),
            icon: "ovh-font ovh-font-certificate",
            href: this.REDIRECT_URLS.license,
            target: "_parent"
        };
    }
}

angular.module("managerApp").service("LicenseSidebar", LicenseSidebar);
