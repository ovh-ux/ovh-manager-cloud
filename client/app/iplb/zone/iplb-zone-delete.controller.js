class IpLoadBalancerZoneDeleteCtrl {
    constructor ($q, $stateParams, CloudMessage, CloudNavigation, ControllerHelper, IpLoadBalancerZoneDeleteService) {
        this.$q = $q;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerZoneDeleteService = IpLoadBalancerZoneDeleteService;

        this.serviceName = $stateParams.serviceName;

        this._initLoaders();
        this._initModel();
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
        this.zones.load();
    }

    submit () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.saving = true;
        this.CloudMessage.flushChildMessage();
        return this.IpLoadBalancerZoneDeleteService.deleteZones(this.serviceName, this.model.zones.value)
            .then(() => {
                this.previousState.go();
            })
            .finally(() => {
                this.saving = false;
            });
    }

    _initLoaders () {
        this.zones = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerZoneDeleteService.getDeletableZones(this.serviceName)
        });
    }

    _initModel () {
        this.model = {
            zones: {
                value: []
            }
        };
    }
}

angular.module("managerApp").controller("IpLoadBalancerZoneDeleteCtrl", IpLoadBalancerZoneDeleteCtrl);
