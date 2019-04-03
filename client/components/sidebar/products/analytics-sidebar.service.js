class AnalyticsSidebar {
  constructor($translate, SidebarMenu, URLS, OvhApiMe) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.URLS = URLS;
    this.User = OvhApiMe;

    this.locale = null;
    this.type = 'ANALYTICS_DATA_PLATFORM';

    this.User.v6().get().$promise
      .then((user) => {
        this.locale = user.ovhSubsidiary;
      });
  }

  loadIntoSection(section, services) {
    // add navigation link for each account
    const orderedServices = _.sortBy(services, ['displayName']);
    _.forEach(orderedServices, (analyticsService) => {
      this.SidebarMenu.addMenuItem({
        id: analyticsService.serviceName,
        title: analyticsService.displayName,
        allowSubItems: false,
        state: 'adp.service.details',
        stateParams: {
          serviceName: analyticsService.serviceName,
        },
        loadOnState: 'adp.service.details',
        loadOnStateParams: {
          serviceName: analyticsService.serviceName,
        },
      }, section);
    });
  }

  addOrder() {
    return {
      id: 'order-analytics',
      title: this.$translate.instant('cloud_sidebar_section_analytics'),
      icon: 'ovh-font ovh-font-adp',
      state: 'adp.deploy',
    };
  }
}

angular.module('managerApp').service('AnalyticsSidebar', AnalyticsSidebar);
