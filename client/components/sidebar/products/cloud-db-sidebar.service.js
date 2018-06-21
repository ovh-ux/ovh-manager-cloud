class CloudDBSidebar {
    constructor ($translate, REDIRECT_URLS) {
        this.$translate = $translate;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.type = "CLOUD_DB"; // not used
    }

    addOrder () {
        if (!this.REDIRECT_URLS.orderSql) {
            return;
        }
        return {
            id: "order-clouddb",
            title: this.$translate.instant("cloud_sidebar_actions_menu_clouddb"),
            icon: "ovh-font ovh-font-database",
            href: this.REDIRECT_URLS.orderSql,
            target: "_blank",
            external: true
        };
    }
}

angular.module("managerApp").service("CloudDBSidebar", CloudDBSidebar);
