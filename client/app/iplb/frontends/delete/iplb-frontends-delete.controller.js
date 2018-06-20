class IpLoadBalancerFrontendDeleteCtrl {
    constructor ($stateParams, $uibModalInstance, frontend, IpLoadBalancerFrontendsService) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerFrontendsService = IpLoadBalancerFrontendsService;

        this.frontend = frontend;
        this.name = frontend.displayName || frontend.frontendId;
        this.frontendId = frontend.frontendId;
        this.type = frontend.protocol;
    }

    confirm () {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerFrontendsService.deleteFrontend(this.type, this.$stateParams.serviceName, this.frontendId)
                .then(response => this.$uibModalInstance.close(response))
                .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.delete.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("IpLoadBalancerFrontendDeleteCtrl", IpLoadBalancerFrontendDeleteCtrl);
