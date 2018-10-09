class IpLoadBalancerZoneAddCtrl {
  constructor($q, $translate, $stateParams, CloudMessage, CloudNavigation, ControllerHelper,
    IpLoadBalancerZoneAddService) {
    this.$q = $q;
    this.$translate = $translate;
    this.CloudMessage = CloudMessage;
    this.CloudNavigation = CloudNavigation;
    this.ControllerHelper = ControllerHelper;
    this.IpLoadBalancerZoneAddService = IpLoadBalancerZoneAddService;

    this.serviceName = $stateParams.serviceName;

    this.initLoaders();
    this.initModel();
  }

  $onInit() {
    this.previousState = this.CloudNavigation.getPreviousState();
    this.zones.load();
  }

  submit() {
    if (this.form.$invalid) {
      return this.$q.reject();
    }

    this.saving = true;
    this.CloudMessage.flushChildMessage();
    return this.IpLoadBalancerZoneAddService.addZones(this.serviceName, this.model.zones.value)
      .then(() => {
        this.previousState.go();
      })
      .finally(() => {
        this.saving = false;
      });
  }

  isLoading() {
    return this.saving || this.zones.loading;
  }

  initLoaders() {
    this.zones = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerZoneAddService.getOrderableZones(this.serviceName),
    });
  }

  initModel() {
    this.model = {
      zones: {
        value: [],
      },
    };
  }
}

angular.module('managerApp').controller('IpLoadBalancerZoneAddCtrl', IpLoadBalancerZoneAddCtrl);
