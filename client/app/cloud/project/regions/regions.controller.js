class RegionsCtrl {
  constructor(
    $translate,
    $stateParams,
    CloudMessage,
    ServiceHelper,
    ControllerHelper,
    OvhApiCloudProjectRegion,
    CloudProjectVirtualMachineAddService,
    RegionService,
  ) {
    this.$translate = $translate;
    this.serviceName = $stateParams.projectId;
    this.CloudMessage = CloudMessage;
    this.ServiceHelper = ServiceHelper;
    this.ControllerHelper = ControllerHelper;
    this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
    this.VirtualMachineAddService = CloudProjectVirtualMachineAddService;
    this.RegionService = RegionService;
  }

  $onInit() {
    this.loaders = {
      regions: false,
      availableRegions: false,
    };
    this.initRegionsAndDataCenters();
    this.loadAvailableRegions();
  }

  // initLoaders() {
  //   this.regions = this.ControllerHelper.request.getHashLoader({
  //     loaderFunction: () => this.OvhApiCloudProjectRegion.v6()
  //       .query({ serviceName: this.serviceName })
  //       .$promise
  //       .then((regionIds) => {
  //         const regions = _.map(regionIds, region => this.RegionService.getRegion(region));
  //         console.log(regions);
  //         const displayedRegions = this.VirtualMachineAddService.constructor
  //           .groupRegionsByDatacenter(
  //             regions,
  //           );
  //         const groupedRegions = _.groupBy(displayedRegions, 'continent');
  //         console.log(groupedRegions);
  //         return groupedRegions;
  //       }),
  //   });
  //   this.regions.load();
  // }

  initRegionsAndDataCenters() {
    this.loaders.regions = true;
    this.OvhApiCloudProjectRegion.v6()
      .query({ serviceName: this.serviceName })
      .$promise.then((regions) => {
        this.regions = _.map(regions, region => this.RegionService.getRegion(region));
        console.log(this.regions);
        this.displayedRegions = this.VirtualMachineAddService.constructor.groupRegionsByDatacenter(
          this.regions,
        );
        this.groupedRegions = _.groupBy(this.displayedRegions, 'continent');
        console.log(this.groupedRegions);
      })
      .catch(this.ServiceHelper.errorHandler('cpcivm_add_step2_regions_ERROR'))
      .finally(() => {
        this.loaders.regions = false;
      });
  }

  loadAvailableRegions() {
    this.loaders.availableRegions = true;
    this.OvhApiCloudProjectRegion.AvailableRegions().v6()
      .query({ serviceName: this.serviceName })
      .$promise.then((regions) => {
        this.availableRegions = _.map(regions, region => this.RegionService.getRegion(region));
        console.log(this.availableRegions);
        this.displayedAvailableRegions = this.VirtualMachineAddService.constructor
          .groupRegionsByDatacenter(
            this.availableRegions,
          );
        this.groupedAvailableRegions = _.groupBy(this.displayedAvailableRegions, 'continent');
        console.log(this.groupedAvailableRegions);
      })
      .catch(this.ServiceHelper.errorHandler('cpcivm_add_step2_regions_ERROR'))
      .finally(() => {
        this.loaders.availableRegions = false;
      });
  }
}

angular.module('managerApp').controller('RegionsCtrl', RegionsCtrl);
