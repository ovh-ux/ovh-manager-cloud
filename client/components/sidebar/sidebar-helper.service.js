class SidebarHelper {
  constructor($translate, CucFeatureAvailabilityService, SidebarMenu, MANAGER_URLS) {
    this.$translate = $translate;
    this.CucFeatureAvailabilityService = CucFeatureAvailabilityService;
    this.SidebarMenu = SidebarMenu;
    this.MANAGER_URLS = MANAGER_URLS;
  }

  sectionHasAvailableProduct(section, locale) {
    return _.some(section.productTypesInSection, product => this.CucFeatureAvailabilityService.hasFeature(product.type, 'sidebarMenu', locale));
  }

  static countProductsInSection(productsInSection) {
    const count = _.chain(productsInSection)
      .values()
      .compact()
      .flattenDeep()
      .value();
    return count.length;
  }

  static fillSection(menuItem, productTypes, productsInSection) {
    _.forEach(productTypes, (product) => {
      product.loadIntoSection(menuItem, productsInSection[product.type]);
    });
  }
}

angular.module('managerApp').service('SidebarHelper', SidebarHelper);
