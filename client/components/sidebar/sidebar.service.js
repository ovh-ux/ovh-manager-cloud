class SidebarService {
    constructor ($translate, FeatureAvailabilityService, SidebarMenu, MANAGER_URLS) {
        this.$translate = $translate;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.SidebarMenu = SidebarMenu;
        this.MANAGER_URLS = MANAGER_URLS;
    }

    fillSidebarMenuItems (allProducts, sectionsProviders, locale) {
        _.forEach(sectionsProviders, section => {
            if (!this.sectionHasAvailableProduct(section, locale)) {
                return;
            }
            if (this.countProductsInSection(allProducts[section.sectionName]) <= 0) {
                return;
            }
            section.createSection(allProducts[section.sectionName]);
        });
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

angular.module("managerApp").service("SidebarService", SidebarService);
