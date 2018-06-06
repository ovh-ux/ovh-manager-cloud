class SidebarHelper {
    constructor ($translate, FeatureAvailabilityService, SidebarMenu, MANAGER_URLS) {
        this.$translate = $translate;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.SidebarMenu = SidebarMenu;
        this.MANAGER_URLS = MANAGER_URLS;
    }

    sectionHasAvailableProduct (section, locale) {
        return _.some(section.productTypesInSection, product => this.FeatureAvailabilityService.hasFeature(product.type, "sidebarMenu", locale));
    }

    countProductsInSection (productsInSection) {
        const count = _.chain(productsInSection)
            .values()
            .compact()
            .flattenDeep()
            .value();
        return count.length;
    }

    fillSection (menuItem, productTypes, productsInSection) {
        _.forEach(productTypes, product => {
            product.loadIntoSection(menuItem, productsInSection[product.type]);
        });
    }
}

angular.module("managerApp").service("SidebarHelper", SidebarHelper);
