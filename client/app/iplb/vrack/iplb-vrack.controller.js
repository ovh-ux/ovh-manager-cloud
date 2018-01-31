class IpLoadBalancerVrackCtrl {
    constructor ($state, $stateParams, $translate, CloudPoll, ControllerHelper, IpLoadBalancerVrackService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudPoll = CloudPoll;
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
                isAvailable: () => !this.creationRules.loading && !this.creationRules.hasErrors && this.creationRules.data.status === "inactive"
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
                isAvailable: () => !this.creationRules.loading && this.creationRules.data.status === "active"
            }
        };
    }

    _associateVrack (network = { networkId: "pn-16343", displayName: "someName" }) {
        this.IpLoadBalancerVrackService.associateVrack(this.serviceName, network.networkId)
            .then(() => this._pollVrackStatusChange("inactive", "activating"));
    }

    _deAssociateVrack () {
        this.IpLoadBalancerVrackService.deAssociateVrack(this.serviceName)
            .then(() => this._pollVrackStatusChange("active", "deactivating"));
    }

    _pollVrackStatusChange (fromStatus, toStatus) {
        this.creationRules.data.status = toStatus;
        return this.CloudPoll.poll({
            item: this.creationRules.data,
            pollFunction: () => this.IpLoadBalancerVrackService.getNetworkCreationRules(this.serviceName, { resetCache: true })
                .then(response => {
                    response.status = response.status === fromStatus ? toStatus : response.status;
                    return response;
                }),
            stopCondition: item => item.status !== toStatus
        });
    }
}

angular.module("managerApp").controller("IpLoadBalancerVrackCtrl", IpLoadBalancerVrackCtrl);
