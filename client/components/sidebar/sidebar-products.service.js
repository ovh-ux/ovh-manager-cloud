class SidebarContentService {
    constructor ($translate, FeatureAvailabilityService, SidebarMenu, SidebarHelper, MANAGER_URLS,
                 IaasSectionSidebarService, PaasSectionSidebarService, MetricsSectionSidebarService,
                 LogsSectionSidebarService, VrackSectionSidebarService, LoadBalancerSectionSidebarService,
                 CloudDesktopSectionSidebarService, IpSectionSidebarService, LicenseSectionSidebarService) {
        this.$translate = $translate;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.SidebarMenu = SidebarMenu;
        this.SidebarHelper = SidebarHelper;
        this.MANAGER_URLS = MANAGER_URLS;

        // In order of appearance in the menu
        this.sections = [
            IaasSectionSidebarService,
            PaasSectionSidebarService,
            MetricsSectionSidebarService,
            LogsSectionSidebarService,
            LoadBalancerSectionSidebarService,
            IpSectionSidebarService,
            LicenseSectionSidebarService,
            VrackSectionSidebarService,
            CloudDesktopSectionSidebarService
        ];
    }

    buildSidebarContent (products, locale) {
        let allProductsOfUser = this.transformProducts(products, this.sections);
        return this.fillSidebarMenuItems(allProductsOfUser, this.sections, locale);
    }

    fillSidebarMenuItems (allProducts, sectionsProviders, locale) {
        _.forEach(sectionsProviders, section => {
            if (!this.SidebarHelper.sectionHasAvailableProduct(section, locale)) {
                return;
            }
            if (this.SidebarHelper.countProductsInSection(allProducts[section.sectionName]) <= 0) {
                return;
            }
            section.createSection(allProducts[section.sectionName]);
        });
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

angular.module("managerApp").service("SidebarContentService", SidebarContentService);
