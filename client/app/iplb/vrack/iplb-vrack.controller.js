class IpLoadBalancerVrackCtrl {
    constructor ($state, $stateParams, $translate, ControllerHelper, IpLoadBalancerVrackService,
                 IpLoadBalancerVrackHelper, VrackService, OvhApiIpLoadBalancing) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerVrackService = IpLoadBalancerVrackService;
        this.IpLoadBalancerVrackHelper = IpLoadBalancerVrackHelper;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.VrackService = VrackService;

        this.serviceName = $stateParams.serviceName;

        this._initLoaders();
        this._initActions();
    }

    $onInit () {
        this.creationRules.load()
            .then(creationRules => {
                if (creationRules.tasks.length) {
                    this.IpLoadBalancerVrackService.pollNetworkTask(this.serviceName, creationRules.tasks).$promise
                        .then(() => {
                            this.OvhApiIpLoadBalancing.Vrack().v6().resetCache();
                            this.creationRules.load();
                        });
                }
            });
        this.privateNetworks.load();
    }

    _initLoaders () {
        this.creationRules = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerVrackService.getNetworkCreationRules(this.serviceName)
        });

        this.privateNetworks = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerVrackService.getPrivateNetworks(this.serviceName)
        });
    }

    _initActions () {
        this.actions = {
            activateVrack: {
                text: this.$translate.instant("common_activate"),
                callback: () => this.VrackService.selectVrack()
                    .then(result => this.IpLoadBalancerVrackHelper.associateVrack(this.serviceName, result.serviceName, this.creationRules.data)),
                isAvailable: () => !this.creationRules.loading && !this.creationRules.hasErrors && this.creationRules.data.vrackEligibility &&
                    this.creationRules.data.status === "inactive" && _.isEmpty(this.creationRules.data.tasks)
            },
            deActivateVrack: {
                text: this.$translate.instant("common_deactivate"),
                callback: () => this.VrackService.unlinkVrackModal()
                    .then(() => this.IpLoadBalancerVrackHelper.deAssociateVrack(this.serviceName, this.creationRules.data)),
                isAvailable: () => !this.creationRules.loading && !this.creationRules.hasErrors && this.creationRules.data.status === "active" &&
                    _.isEmpty(this.creationRules.data.tasks)
            },
            addPrivateNetwork: {
                text: this.$translate.instant("iplb_vrack_private_network_add"),
                callback: () => this.$state.go("network.iplb.detail.vrack.add", { serviceName: this.$stateParams.serviceName }),
                isAvailable: () => !this.creationRules.loading && this.creationRules.data.status === "active" && this.creationRules.data.remainingNetworks
            },
            editPrivateNetwork: {
                text: this.$translate.instant("common_modify"),
                callback: network => this.$state.go("network.iplb.detail.vrack.edit", { serviceName: this.serviceName, networkId: network.vrackNetworkId }),
                isAvailable: () => !this.creationRules.loading && _.includes(["active", "inactive"], this.creationRules.data.status)
            },
            deletePrivateNetwork: {
                text: this.$translate.instant("common_delete"),
                callback: network => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("iplb_vrack_private_network_delete_title"),
                    text: this.$translate.instant("iplb_vrack_private_network_delete_text", { network: network.displayName })
                })
                    .then(() => this._deletePrivateNetwork(network)),
                isAvailable: () => !this.creationRules.loading && _.includes(["active", "inactive"], this.creationRules.data.status)
            }
        };
    }

    _deletePrivateNetwork (network) {
        return this.IpLoadBalancerVrackService.deletePrivateNetwork(this.serviceName, network.vrackNetworkId)
            .then(() => {
                this.creationRules.load();
                this.privateNetworks.load();
            });
    }
}

angular.module("managerApp").controller("IpLoadBalancerVrackCtrl", IpLoadBalancerVrackCtrl);
