class IpLoadBalancerDashboardHeaderCtrl {
  constructor($stateParams, $translate, ControllerHelper, IpLoadBalancerHomeService, ovhDocUrl,
    SidebarMenu, URLS) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.ControllerHelper = ControllerHelper;
    this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
    this.ovhDocUrl = ovhDocUrl;
    this.SidebarMenu = SidebarMenu;
    this.URLS = URLS;
    this.serviceName = $stateParams.serviceName;

    //  No error handling since we don't want to break anything for a title.
    this.configuration = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName),
      successHandler: () => { this.menuItem.title = this.configuration.data.displayName; },
    });
  }

  $onInit() {
    this.menuItem = this.SidebarMenu.getItemById(this.serviceName);

    //  If the menu is not yet loaded, we fetch IPLB's displayName.  Dirty patch.
    if (!this.menuItem) {
      this.menuItem = { title: this.serviceName };
      this.configuration.load();
    }

    this.initGuides();
  }

  initGuides() {
    this.guides = {};
    this.guides.title = this.$translate.instant('iplb_guides');
    this.guides.list = [{
      name: this.$translate.instant('iplb_guides_title'),
      url: this.ovhDocUrl.getDocUrl('iplb'),
      external: true,
    }];
    this.guides.footer = {
      name: this.$translate.instant('iplb_guide_footer'),
      url: this.URLS.guides.home.FR,
      external: true,
    };
  }
}

angular.module('managerApp').controller('IpLoadBalancerDashboardHeaderCtrl', IpLoadBalancerDashboardHeaderCtrl);
