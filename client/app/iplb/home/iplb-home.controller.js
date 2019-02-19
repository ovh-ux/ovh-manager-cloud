class IpLoadBalancerHomeCtrl {
  constructor($state, $stateParams, $translate, ControllerHelper, CucCloudMessage,
    FeatureAvailabilityService, IpLoadBalancerActionService, IpLoadBalancerConstant,
    IpLoadBalancerHomeService, IpLoadBalancerHomeStatusService, IpLoadBalancerMetricsService,
    IpLoadBalancerZoneAddService, IpLoadBalancerZoneDeleteService,
    IpLoadBalancerVrackHelper, IpLoadBalancerVrackService, REDIRECT_URLS, RegionService,
    VrackService) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.ControllerHelper = ControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.FeatureAvailabilityService = FeatureAvailabilityService;
    this.IpLoadBalancerActionService = IpLoadBalancerActionService;
    this.IpLoadBalancerConstant = IpLoadBalancerConstant;
    this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
    this.IpLoadBalancerHomeStatusService = IpLoadBalancerHomeStatusService;
    this.IpLoadBalancerMetricsService = IpLoadBalancerMetricsService;
    this.IpLoadBalancerZoneAddService = IpLoadBalancerZoneAddService;
    this.IpLoadBalancerZoneDeleteService = IpLoadBalancerZoneDeleteService;
    this.IpLoadBalancerVrackHelper = IpLoadBalancerVrackHelper;
    this.IpLoadBalancerVrackService = IpLoadBalancerVrackService;
    this.REDIRECT_URLS = REDIRECT_URLS;
    this.RegionService = RegionService;
    this.VrackService = VrackService;

    this.serviceName = this.$stateParams.serviceName;

    this.initLoaders();
  }

  $onInit() {
    this.configuration.load();
    this.vrackCreationRules.load();

    this.information.load();
    this.subscription.load();

    this.iplbStatus.load();
    this.usage.load();

    this.orderableZones.load();
    this.deletableZones.load();

    this.initActions();
    this.initGraph();

    this.serviceActions = {
      text: this.$translate.instant('iplb_status_apply'),
      callback: () => this.$state.go('network.iplb.detail.configuration'),
      isAvailable: () => true,
    };

    this.frontendsActions = {
      text: this.$translate.instant('iplb_status_details'),
      callback: () => this.$state.go('network.iplb.detail.frontends'),
      isAvailable: () => true,
    };

    this.farmsActions = {
      text: this.$translate.instant('iplb_status_details'),
      callback: () => this.$state.go('network.iplb.detail.server-farm'),
      isAvailable: () => true,
    };
  }

  initLoaders() {
    this.information = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerHomeService.getInformations(this.serviceName),
    });

    this.configuration = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName),
      successHandler: () => this.getRegionsGroup(this.configuration.data.zone),
    });

    this.vrackCreationRules = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerVrackService
        .getNetworkCreationRules(this.serviceName),
    });

    this.subscription = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerHomeService.getSubscription(this.serviceName),
    });

    this.iplbStatus = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerHomeStatusService
        .getIPLBStatus(this.serviceName, { toArray: true }),
    });

    this.usage = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerHomeService.getUsage(this.serviceName),
    });

    this.orderableZones = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerZoneAddService.getOrderableZones(this.serviceName),
    });

    this.deletableZones = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerZoneDeleteService
        .getDeletableZones(this.serviceName),
    });
  }

  initActions() {
    this.actions = {
      showFailoverIp: {
        callback: () => this.IpLoadBalancerActionService.showFailoverIpDetail(this.serviceName),
      },
      showNatIp: {
        callback: () => this.IpLoadBalancerActionService.showNatIpDetail(this.serviceName),
      },
      changeName: {
        text: this.$translate.instant('common_edit'),
        callback: () => this.ControllerHelper.modal.showNameChangeModal({
          serviceName: this.serviceName,
          displayName: this.configuration.data.displayName,
          onSave: newDisplayName => this.IpLoadBalancerHomeService
            .updateName(this.serviceName, newDisplayName)
            .then(() => this.configuration.load()),
        }),
        isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors,
      },
      changeCipher: {
        text: this.$translate.instant('common_edit'),
        callback: () => this.IpLoadBalancerActionService
          .cipherChange(this.serviceName, () => this.configuration.load()),
        isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors,
      },
      activateVrack: {
        text: this.$translate.instant('common_activate'),
        callback: () => this.VrackService.selectVrack()
          .then(result => this.IpLoadBalancerVrackHelper.associateVrack(
            this.serviceName,
            result.serviceName,
            this.vrackCreationRules.data,
          )),
        isAvailable: () => !this.vrackCreationRules.loading
          && !this.vrackCreationRules.hasErrors
          && this.vrackCreationRules.data.vrackEligibility
          && this.vrackCreationRules.data.status === 'inactive',
      },
      deActivateVrack: {
        text: this.$translate.instant('common_deactivate'),
        callback: () => this.VrackService.unlinkVrackModal()
          .then(() => this.IpLoadBalancerVrackHelper.deAssociateVrack(
            this.serviceName,
            this.vrackCreationRules.data,
          )),
        isAvailable: () => !this.vrackCreationRules.loading && !this.vrackCreationRules.hasErrors && this.vrackCreationRules.data.status === 'active',
      },
      changeOffer: {
        // TODO: Implementation of modal for changing offer
        text: this.$translate.instant('common_edit'),
        isAvailable: () => false,
      },
      manageAutorenew: {
        text: this.$translate.instant('common_manage'),
        href: this.ControllerHelper.navigation.getUrl('renew', { serviceName: this.serviceName, serviceType: 'IP_LOADBALANCER' }),
        isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors,
      },
      manageContact: {
        text: this.$translate.instant('common_manage'),
        href: this.ControllerHelper.navigation.getUrl('contacts', { serviceName: this.serviceName }),
        isAvailable: () => this.FeatureAvailabilityService.hasFeature('CONTACTS', 'manage') && !this.subscription.loading && !this.subscription.hasErrors,
      },
      addZone: {
        text: this.$translate.instant('common_add'),
        callback: () => this.$state.go('network.iplb.detail.zone.add', { serviceName: this.serviceName }),
        isAvailable: () => !this.orderableZones.loading && this.orderableZones.data.length > 0,
      },
      deleteZone: {
        text: this.$translate.instant('common_delete'),
        callback: () => this.$state.go('network.iplb.detail.zone.delete', { serviceName: this.serviceName }),
        isAvailable: () => !this.deletableZones.loading
          && _.filter(
            this.deletableZones.data,
            zone => zone.selectable.value !== false,
          ).length - 1 >= 1,
      },
    };
  }

  updateQuotaAlert(quota) {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/iplb/home/updateQuota/iplb-update-quota.html',
        controller: 'IpLoadBalancerUpdateQuotaCtrl',
        controllerAs: 'IpLoadBalancerUpdateQuotaCtrl',
        resolve: {
          quota: () => quota,
        },
      },
    }).then(() => {
      this.usage.load();
    });
  }

  initGraph() {
    this.metricsList = this.IpLoadBalancerConstant.graphs;
    this.metric = _.first(this.metricsList);
    this.options = {
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
          },
        }],
        yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          ticks: {
            min: 0,
            minStep: 1,
            beginAtZero: true,
          },
        }],
      },
      elements: {
        line: {
          fill: false,
          borderColor: '#3DD1F0',
          borderWidth: 4,
        },
        point: {
          radius: 0,
        },
      },
    };
    this.loadGraph();
  }

  loadGraph() {
    const downsampleAggregation = this.metric === 'conn' ? 'sum' : 'max';
    this.loadingGraph = true;
    this.IpLoadBalancerMetricsService.getData(this.metric, '40m-ago', null, {
      // http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html
      downsample: `5m-${downsampleAggregation}`,
    })
      .then((data) => {
        if (data.length && data[0].dps) {
          this.data = _.values(data[0].dps);
          this.labels = [];
          this.data.forEach((value, index) => {
            this.labels.unshift(`${index * 5}m`);
          });
        }
      })
      .finally(() => {
        this.loadingGraph = false;
      });
  }

  getGraphTitle(metric) {
    return this.$translate.instant(`iplb_graph_name_${metric}`);
  }

  getRegionsGroup(regions) {
    this.regionsGroup = [];
    if (regions) {
      this.detailedRegions = !_.isArray(regions)
        ? [this.RegionService.getRegion(regions)]
        : _.map(regions, region => this.RegionService.getRegion(region));
    }

    this.regionsGroup = _.groupBy(this.detailedRegions, 'country');
  }

  hasMultipleRegions() {
    return _(this.detailedRegions).isArray() && this.detailedRegions.length > 1;
  }
}

angular.module('managerApp').controller('IpLoadBalancerHomeCtrl', IpLoadBalancerHomeCtrl);
