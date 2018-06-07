class IpSidebar {
    constructor ($translate, REDIRECT_URLS) {
        this.$translate = $translate;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.type = "IP";
    }

    addOrder () {
        return {
            id: "order-ip",
            title: this.$translate.instant("cloud_sidebar_actions_menu_ip"),
            icon: "ovh-font ovh-font-ip",
            href: this.REDIRECT_URLS.ip,
            target: "_parent"
        };
    }
}

angular.module("managerApp").service("IpSidebar", IpSidebar);
