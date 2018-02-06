class IpLoadBalancerVrackCtrl {
    constructor ($state, $stateParams, $translate, ControllerHelper, IpLoadBalancerVrackService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerVrackService = IpLoadBalancerVrackService;

        this.serviceName = $stateParams.serviceName;

        this._initLoaders();
        this._initActions();
    }

    $onInit () {
        this.creationRules.load();
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
                callback: () => this.ControllerHelper.modal.showVrackActivateModal(),
                isAvailable: () => !this.creationRules.loading && !this.creationRules.hasErrors && this.creationRules.data.vrackEligibility &&
                    this.creationRules.data.status === "inactive"
            },
            deActivateVrack: {
                text: this.$translate.instant("common_deactivate"),
                callback: () => this.ControllerHelper.modal.showVrackDeactivateModal(this.creationRules.data)
                    .then(() => this._deAssociateVrack()),
                isAvailable: () => !this.creationRules.loading && !this.creationRules.hasErrors && this.creationRules.data.status === "active"
            },
            addPrivateNetwork: {
                text: this.$translate.instant("iplb_vrack_private_network_add"),
                callback: () => this.$state.go("network.iplb.detail.vrack.add", { serviceName: this.$stateParams.serviceName }),
                isAvailable: () => !this.creationRules.loading && this.creationRules.data.status === "active" && this.creationRules.data.remainingNetworks
            },
            editPrivateNetwork: {
                text: this.$translate.instant("common_modify"),
                callback: network => this.$state.go("network.iplb.detail.vrack.edit", { serviceName: this.serviceName, networkId: network.vrackNetworkId }),
                isAvailable: () => true
            },
            deletePrivateNetwork: {
                text: this.$translate.instant("common_delete"),
                callback: network => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("iplb_vrack_private_network_delete_title"),
                    text: this.$translate.instant("iplb_vrack_private_network_delete_text")
                })
                    .then(() => this._deletePrivateNetwork(network)),
                isAvailable: () => true
            }
        };
    }

    _associateVrack (network = { networkId: "pn-16343", displayName: "someName" }) {
        this.IpLoadBalancerVrackService.associateVrack(this.serviceName, network.networkId)
            .then(task => {
                this.creationRules.data.status = "activating";
                return task.poll();
            })
            .then(() => this.IpLoadBalancerVrackService.getNetworkCreationRules(this.serviceName, { resetCache: true }))
            .then(creationRules => {
                this.creationRules.data = creationRules;
            });
    }

    _deAssociateVrack () {
        this.IpLoadBalancerVrackService.deAssociateVrack(this.serviceName)
            .then(task => {
                this.creationRules.data.status = "deactivating";
                return task.poll();
            })
            .then(() => this.IpLoadBalancerVrackService.getNetworkCreationRules(this.serviceName, { resetCache: true }))
            .then(creationRules => {
                this.creationRules.data = creationRules;
            });
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
