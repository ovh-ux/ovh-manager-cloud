class PrivateNetworkListCtrl {
  constructor($window, $rootScope, $translate, $stateParams, $state, $q, $uibModal,
    CloudProjectComputeInfrastructurePrivateNetworkService, OvhApiCloudProjectNetworkPrivate,
    OvhApiCloudProject, REDIRECT_URLS, CloudMessage, OvhApiMe, URLS, OvhApiVrack,
    VrackSectionSidebarService, VrackService, CloudPoll, ControllerHelper) {
    this.resources = {
      privateNetwork: OvhApiCloudProjectNetworkPrivate.v6(),
      project: OvhApiCloudProject.v6(),
      aapi: OvhApiVrack.Aapi(),
      modal: $uibModal,
    };
    this.CloudMessage = CloudMessage;
    this.$translate = $translate;
    this.serviceName = null;
    this.service = CloudProjectComputeInfrastructurePrivateNetworkService;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.User = OvhApiMe;
    this.URLS = URLS;
    this.CloudPoll = CloudPoll;
    this.VrackService = VrackService;
    this.ControllerHelper = ControllerHelper;

    this.loaders = {
      privateNetworks: {
        query: false,
        delete: false,
        activate: false,
      },
      vrack: {
        get: false,
        link: false,
        unlink: false,
      },
      vracks: {
        get: false,
      },
    };
    this.urls = {
      vrack: REDIRECT_URLS.vRack,
    };
    this.models = {
      vrack: null,
    };
    this.collections = {
      privateNetworks: [],
    };
    this.states = {
      dialog: {
        visible: false,
      },
    };
    this.$window = $window;
    // get vRacks for current user, shown in left side bar
    this.vRacks = [];
    VrackSectionSidebarService.getVracks()
      .then((vRacks) => {
        this.vRacks = vRacks;
      }).finally(() => {
        this.loaders.vracks.get = false;
      });
  }

  $onInit() {
    this.resources.privateNetwork.resetAllCache();
    if (angular.isUndefined(this.$stateParams.projectId)) {
      this.CloudMessage.error(this.$translate.instant('cpci_private_network_list_context_error'));
    } else {
      this.serviceName = this.$stateParams.projectId;
    }

    this.$rootScope.$on('private-network-dialog:hide', this.hideDialog.bind(this));
    this.$rootScope.$on('private-networks:create', this.createPrivateNetworks.bind(this));

    // Loading privateNetwork first because vrack can fallback to privateNetworkList
    // to find it's ID.
    this.fetchPrivateNetworks().then(() => this.fetchVrack());

    this.User.v6().get().$promise.then((user) => {
      this.orderUrl = _.get(this.URLS.website_order, `vrack.${user.ovhSubsidiary}`);
    });
  }

  fetchVrack() {
    if (this.loaders.vrack.get) {
      return this.$q.when();
    }
    this.loaders.vrack.get = true;

    return this.resources.project
      .vrack({ serviceName: this.serviceName }).$promise
      .then((vrack) => { this.models.vrack = vrack; })
      .then(() => this.getVrackId())
      .then((id) => { this.models.vrack.id = id; })
      .catch(() => { this.models.vrack = null; })
      .finally(() => { this.loaders.vrack.get = false; });
  }


  /**
     * open UI activate private network modal
     *
     * @memberof PrivateNetworkListCtrl
     */
  addVRack() {
    this.VrackService.selectVrack()
      .then((selectedVrack) => {
        this.loaders.vrack.link = true;
        this.models.vrack = {
          id: selectedVrack.serviceName,
          name: selectedVrack.name,
        };
        return this.VrackService.linkCloudProjectToVrack(
          selectedVrack.serviceName,
          this.serviceName,
        );
      })
      .then(vrackTaskId => this.startVrackTaskPolling(this.models.vrack.id, vrackTaskId).$promise)
      .then(() => {
        this.CloudMessage.success(this.$translate.instant('cpci_private_network_add_vrack_success'));
      })
      .catch((err) => {
        if (err === 'cancel') {
          return;
        }
        this.CloudMessage.error(this.$translate.instant('cpci_private_network_add_vrack_error'));
      })
      .finally(() => {
        this.loaders.vrack.link = false;
      });
  }

  unlinkVrack() {
    let hasVlansText = this.$translate.instant('private_network_deactivate_confirmation');
    if (this.collections.privateNetworks.length > 0) {
      hasVlansText += ` ${this.$translate.instant('private_network_deactivate_confirmation_vlans')}`;
    }
    this.VrackService.unlinkVrackModal(hasVlansText)
      .then(() => {
        this.loaders.vrack.unlink = true;
        return this.VrackService.unlinkCloudProjectFromVrack(
          this.models.vrack.id,
          this.serviceName,
        );
      })
      .then(vrackTaskId => this.startVrackTaskPolling(this.models.vrack.id, vrackTaskId).$promise)
      .then(() => {
        this.models.vrack = null;
        this.collections.privateNetworks = [];
        this.CloudMessage.success(this.$translate.instant('cpci_private_network_remove_vrack_success'));
      })
      .catch((err) => {
        if (err === 'cancel') {
          return;
        }
        this.CloudMessage.error(this.$translate.instant('cpci_private_network_remove_vrack_error'));
      })
      .finally(() => {
        this.loaders.vrack.unlink = false;
      });
  }

  startVrackTaskPolling(vrack, taskId) {
    this.stopTaskPolling();

    const taskToPoll = {
      id: taskId,
    };

    this.poller = this.CloudPoll.poll({
      item: taskToPoll,
      pollFunction: task => this.VrackService.getTask(vrack, task.id),
      stopCondition: task => !task || _.includes(['done', 'error'], task.status),
    });

    return this.poller;
  }

  stopTaskPolling() {
    if (this.poller) {
      this.poller.kill();
    }
  }

  deletePrivateNetwork(privateNetwork) {
    const modal = this.resources.modal.open({
      windowTopClass: 'cui-modal',
      templateUrl: 'app/cloud/project/compute/infrastructure/privateNetwork/delete/cloud-project-compute-infrastructure-privateNetwork-delete.html',
      controller: 'CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl',
      controllerAs: 'CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl',
      resolve: {
        params: () => privateNetwork,
      },
    });
    modal.result
      .then(() => { this.loaders.privateNetworks.delete = true; })
      .finally(() => {
        this.loaders.privateNetworks.delete = false;
        this.deletePrivateNetworkFromList(privateNetwork);
      });
  }

  deletePrivateNetworkFromList(privateNetwork) {
    const newPrivateNetworks = this.collections.privateNetworks
      .filter(el => el.id !== privateNetwork);
    this.collections.privateNetworks = newPrivateNetworks;
    return this.collections;
  }

  createPrivateNetworks(event, args) {
    this.hideDialog();
    const subnets = _.chain(args.subnets)
      .values()
      .filter(subnet => _.contains(args.privateNetwork.regions, subnet.region))
      .map(subnet => _.assign(subnet, { dhcp: args.isDHCPEnabled, network: args.globalNetwork }))
      .value();

    const onNetworkCreated = function (network) {
      const promises = _.map(subnets, subnet => this.service
        .saveSubnet(args.projectId, network.id, subnet).$promise, this);
      return this.$q.all(promises).then(() => this.fetchPrivateNetworks());
    }.bind(this);

    this.service.savePrivateNetwork(args.projectId, args.privateNetwork, onNetworkCreated);
  }

  fetchPrivateNetworks() {
    if (this.loaders.privateNetworks.query) {
      return this.$q.when(null);
    }
    this.loaders.privateNetworks.query = true;

    return this.resources.privateNetwork.query({
      serviceName: this.serviceName,
    }).$promise
      .then((networks) => {
        this.collections.privateNetworks = networks;
        _.forEach(this.collections.privateNetworks, (network) => {
          if (network.id) {
            _.set(network, 'shortVlanId', _.last(network.id.split('_')));
          }
        });
      }).catch(() => {
        this.collections.privateNetworks = [];
        this.CloudMessage.error(this.$translate.instant('cpci_private_network_list_private_network_query_error'));
      }).finally(() => { this.loaders.privateNetworks.query = false; });
  }

  getPrivateNetworks() {
    return _.sortBy(this.collections.privateNetworks, 'vlanId');
  }

  getVrackName() {
    if (_.has(this.models.vrack, 'name') && !_.isEmpty(this.models.vrack.name)) {
      return this.models.vrack.name;
    } if (_.has(this.models.vrack, 'id') && !_.isEmpty(this.models.vrack.id)) {
      return this.models.vrack.id;
    }
    return this.$translate.instant('cpci_private_network_list_vrack_unnamed');
  }

  getVrackId() {
    if (_.has(this.models.vrack, 'id') && !_.isEmpty(this.models.vrack.id)) {
      return this.$q.when(this.models.vrack.id);
    }

    if (_.isEmpty(this.models.vrack.name)) {
      return this.fetchPrivateNetworks()
        .then(() => {
          if (_.any(this.collections.privateNetworks)) {
            return _.first(_.first(this.collections.privateNetworks).id.split('_'));
          }
          return this.$q.when(null);
        });
    }

    return this.resources.aapi.query().$promise
      .then((vracks) => {
        const vrack = _.find(vracks, { name: this.models.vrack.name });
        return _.get(vrack, 'id', null);
      })
      .catch(() => null);
  }

  gotoVrack() {
    this.getVrackId().then(id => this.$state.go('vrack', { vrackId: id }));
  }

  canGotoVrack() {
    return this.hasVrack() && !_.isNull(this.models.vrack.id);
  }

  hasVrack() {
    return this.loaders.vrack.get === false && !_.isNull(this.models.vrack);
  }

  showDialog() {
    this.states.dialog.visible = true;
  }

  hideDialog() {
    this.states.dialog.visible = false;
    this.$rootScope.$broadcast('highlighed-element.hide', 'compute');
  }

  toggleDialog() {
    this.states.dialog.visible = !this.states.dialog.visible;
  }

  hasVisibleDialog() {
    return this.states.dialog.visible;
  }

  hasPendingLoaders() {
    return _.some(this.loaders, 'query', true)
      || _.some(this.loaders, 'get', true)
      || _.some(this.loaders, 'link', true)
      || _.some(this.loaders, 'unlink', true)
      || this.isVrackCreating();
  }

  isVrackCreating() {
    return this.service.isSavePending();
  }

  onKeyDown($event) {
    switch ($event.which) {
      case 27:
        // Important not to put $event.preventDefault(); before the switch statement
        // since it will catch and prevent default
        // behavior on keyDown everywhere in the directive, inputs included.
        $event.preventDefault();
        this.hideDialog();
        break;
      default:
        break;
    }
  }
}

angular.module('managerApp')
  .directive('privateNetworkList', () => ({
    restrict: 'E',
    templateUrl: 'app/cloud/project/compute/infrastructure/privateNetwork/cloud-project-compute-infrastructure-privateNetwork-list.html',
    controller: PrivateNetworkListCtrl,
    controllerAs: '$ctrl',
    bindToController: true,
    replace: false,
  }));
