class IpSidebar {
    constructor ($translate, REDIRECT_URLS, URLS) {
        this.$translate = $translate;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.URLS = URLS;

        this.type = "IP";
    }

    addOrder (locale) {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_ip"),
            icon: "ovh-font ovh-font-ip",
            href: _.get(this.URLS, `website_order.ip[${locale}]`, this.REDIRECT_URLS.ip),
            target: "_parent"
        };
    }
}

angular.module("managerApp").service("IpSidebar", IpSidebar);
