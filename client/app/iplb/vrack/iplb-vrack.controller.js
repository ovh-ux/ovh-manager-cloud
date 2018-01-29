class IpLoadBalancerVrackCtrl {
    constructor ($translate, ControllerHelper) {
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;

        this._initActions();
    }

    _initActions () {
        this.actions = {
            activateVrack: {
                text: this.$translate.instant("common_activate"),
                callback: () => this.ControllerHelper.modal.showVrackAssociateModal(),
                isAvailable: () => true
            },
            addPrivateNetwork: {
                text: this.$translate.instant("iplb_vrack_private_network_add"),
                callback: () => console.log("something needs to be done here"),
                isAvailable: () => true
            }
        };
    }
}

angular.module("managerApp").controller("IpLoadBalancerVrackCtrl", IpLoadBalancerVrackCtrl);
