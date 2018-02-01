class IpLoadBalancerVrackEditCtrl {
    constructor ($q, $stateParams, $translate, CloudMessage, CloudNavigation, ControllerHelper, IpLoadBalancerVrackService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerVrackService = IpLoadBalancerVrackService;

        this.serviceName = $stateParams.serviceName;
        this.networkId = $stateParams.networkId;

        this._initLoaders();
        this._initModel();
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
        this.privateNetwork.load()
            .then(() => {
                _.forEach(_.keys(this.model), key => {
                    this.model[key].value = this.privateNetwork.data[key];
                });
            });
    }

    submit () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        return (!this.editing() ? this._addNetwork() : this._editNetwork())
            .then(() => this.previousState.go());
    }

    isLoading () {
        return false;
    }

    editing () {
        return this.networkId;
    }

    _addNetwork () {
        return this.IpLoadBalancerVrackService.addPrivateNetwork(this.serviceName, this._getCleanModel());
    }

    _editNetwork () {
        return this.IpLoadBalancerVrackService.editPrivateNetwork(this.serviceName, this._getCleanModel());
    }

    _getCleanModel () {
        const cleanModel = {};
        _.forEach(_.keys(this.model), key => {
            if (!this.model[key].disabled) {
                cleanModel[key] = this.model[key].value;
            }
        });
        cleanModel.vrackNetworkId = this.networkId;
        return cleanModel;
    }

    _initLoaders () {
        this.privateNetwork = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.editing() ? this.IpLoadBalancerVrackService.getPrivateNetwork(this.serviceName, this.networkId) : this.$q.when({})
        });
    }

    _initModel () {
        this.model = {
            displayName: {
                id: "displayName",
                label: this.$translate.instant("iplb_vrack_private_network_add_edit_field_display_name_label"),
                type: "text",
                value: undefined,
                required: false,
                minLength: 0,
                maxLength: 100,
                disabled: false,
                inputSize: 4
            },
            vlan: {
                id: "vlan",
                label: this.$translate.instant("iplb_vrack_private_network_add_edit_field_vlan_label"),
                type: "number",
                value: undefined,
                required: false,
                minLength: 0,
                maxLength: Infinity,
                disabled: false,
                helperText: this.$translate.instant("iplb_vrack_private_network_add_edit_field_vlan_helper"),
                inputSize: 1
            },
            subnet: {
                id: "subnet",
                label: this.$translate.instant("iplb_vrack_private_network_add_edit_field_subnet_label"),
                type: "text",
                value: undefined,
                required: true,
                minLength: 0,
                maxLength: Infinity,
                disabled: this.editing(),
                helperText: this.$translate.instant("iplb_vrack_private_network_add_edit_field_subnet_helper"),
                inputSize: 2
            },
            natIp: {
                id: "natIp",
                label: this.$translate.instant("iplb_vrack_private_network_add_edit_field_nat_ip_label"),
                type: "text",
                value: undefined,
                required: true,
                minLength: 0,
                maxLength: Infinity,
                disabled: false,
                helperText: this.$translate.instant("iplb_vrack_private_network_add_edit_field_nat_ip_helper"),
                inputSize: 2
            },
            farmId: {
                label: "Ferme de serveurs",
                value: [],
                disabled: false
            }
        };
    }
}

angular.module("managerApp").controller("IpLoadBalancerVrackEditCtrl", IpLoadBalancerVrackEditCtrl);
