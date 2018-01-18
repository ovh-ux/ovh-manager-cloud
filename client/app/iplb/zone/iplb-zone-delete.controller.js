class IpLoadBalancerZoneDeleteCtrl {
    constructor ($q, $stateParams, CloudNavigation, ControllerHelper, IpLoadBalancerZoneDeleteService) {
        this.$q = $q;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerZoneDeleteService = IpLoadBalancerZoneDeleteService;

        this.serviceName = $stateParams.serviceName;

        this._initLoaders();
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();

        this.zones.load();
    }

    submit () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.IpLoadBalancerZoneDeleteService.deleteZones(this.serviceName, []);
        this.saving = true;

        return true;
    }

    _initLoaders () {
        this.zones = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerZoneDeleteService.getDeletableZones(this.serviceName)
        });
    }
}

angular.module("managerApp").controller("IpLoadBalancerZoneDeleteCtrl", IpLoadBalancerZoneDeleteCtrl);
