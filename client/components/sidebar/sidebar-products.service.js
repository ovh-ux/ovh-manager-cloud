class SidebarDataStructureService {
    constructor ($translate, FeatureAvailabilityService, SidebarMenu, MANAGER_URLS) {
        this.$translate = $translate;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.SidebarMenu = SidebarMenu;
        this.MANAGER_URLS = MANAGER_URLS;
    }

    transformProducts (allProducts, sectionsProviders) {
        const productsRestructured = {};
        _.forEach(sectionsProviders, section => {
            const productsInSection = {};
            _.forEach(section.productTypesInSection, product => {
                const products = this.getProductsFromAPIStructure(product.type, allProducts);
                _.extend(productsInSection, this.transformDataStructure(product.type, products));
            });
            _.extend(productsRestructured, this.transformDataStructure(section.sectionName, productsInSection));
        });
        return productsRestructured;
    }

    getProductsFromAPIStructure (productType, allProducts) {
        return _.get(_.find(allProducts, { name: productType }), "services");
    }

    transformDataStructure (sectionName, services) {
        const object = {};
        object[sectionName] = services;
        return object;
    }
}

angular.module("managerApp").service("SidebarDataStructureService", SidebarDataStructureService);
