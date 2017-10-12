class IpLoadBalancerOfferChangeCtrl {
    constructor ($uibModalInstance, serviceName, ControllerHelper, IpLoadBalancerHomeService) {
        this.$uibModalInstance = $uibModalInstance;

        this.serviceName = serviceName;
        this.ControllerHelper = ControllerHelper;

        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName)
        });
    }

    $onInit () {
        this.configuration.load();
    }

    confirm () {
        //  TODO : Do something here.
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.configuration.loading;
    }
}

angular.module("managerApp").controller("IpLoadBalancerOfferChangeCtrl", IpLoadBalancerOfferChangeCtrl);
