class RegionsCtrl {
  constructor(
    $stateParams,
    CloudMessage,
    ServiceHelper,
    ControllerHelper,
    OvhApiCloudProjectRegion,
    CloudProjectVirtualMachineAddService,
    RegionService,
  ) {
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
    this.RegionService = RegionService;
    this.ServiceHelper = ServiceHelper;
    this.VirtualMachineAddService = CloudProjectVirtualMachineAddService;
    this.serviceName = $stateParams.projectId;
  }

  $onInit() {
    this.availableRegionToAdd = null;
    this.initLoaders();
  }

  initLoaders() {
    this.regions = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.OvhApiCloudProjectRegion.v6()
        .query({ serviceName: this.serviceName })
        .$promise
        .then(regionIds => _.map(regionIds, region => this.RegionService.getRegion(region)))
        .catch(error => this.ServiceHelper.errorHandler('cpci_add_regions_get_regions_error')(error)),
    });
    this.regions.load();
    this.regionsByDatacenter = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.regions
        .promise
        .then(regions => this.VirtualMachineAddService.constructor.groupRegionsByDatacenter(
          regions,
        )),
    });
    this.regionsByDatacenter.load();
    this.regionsByContinent = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.regionsByDatacenter
        .promise
        .then(regions => _.groupBy(regions, 'continent')),
    });
    this.regionsByContinent.load();

    // load available regions
    this.availableRegions = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.OvhApiCloudProjectRegion.AvailableRegions().v6()
        .query({ serviceName: this.serviceName })
        .$promise
        .then(regionIds => _.map(regionIds, region => this.RegionService.getRegion(region.name)))
        .catch(error => this.ServiceHelper.errorHandler('cpci_add_regions_get_available_regions_error')(error)),
    });
    this.availableRegions.load();
    this.availableRegionsByDatacenter = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.availableRegions
        .promise
        .then(regions => this.VirtualMachineAddService.constructor.groupRegionsByDatacenter(
          regions,
        )),
    });
    this.availableRegionsByDatacenter.load();
    this.availableRegionsByContinent = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.availableRegionsByDatacenter
        .promise
        .then(regions => _.groupBy(regions, 'continent')),
    });
    this.availableRegionsByContinent.load();
  }

  addRegions() {
    this.CloudMessage.flushChildMessage();
    this.addRegion = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.OvhApiCloudProjectRegion.v6()
        .addRegion({ serviceName: this.serviceName },
          { region: this.availableRegionToAdd.microRegion.code })
        .$promise
        .then(() => this.OvhApiCloudProjectRegion.AvailableRegions().v6().resetQueryCache())
        .then(() => this.initLoaders())
        .then(() => this.ServiceHelper.successHandler('cpci_add_regions_add_region_success')({ code: this.availableRegionToAdd.microRegion.code }))
        .catch(error => this.ServiceHelper.errorHandler('cpci_add_regions_add_region_error')(error))
        .finally(() => this.ControllerHelper.scrollPageToTop()),
    });
    this.addRegion.load();
  }
}

angular.module('managerApp').controller('RegionsCtrl', RegionsCtrl);
