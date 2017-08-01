class IpLoadBalancerNameChangeCtrl {
    constructor ($uibModalInstance, serviceName, ControllerHelper, IpLoadBalancerHomeService) {
        this.$uibModalInstance = $uibModalInstance;

        this.serviceName = serviceName;
        this.ControllerHelper = ControllerHelper;

        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName),
            successHandler: () => { this.model.displayName.value = this.configuration.data.displayName; }
        });

        this.model = {
            displayName: {
                value: null,
                maxlength: 50
            }
        };
    }

    $onInit () {
        this.configuration.load();
    }

    confirm () {
        this.saving = true;
        return this.IpLoadBalancerHomeService.updateName(this.serviceName, this.model.displayName.value)
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => {
                this.saving = false;
            });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.configuration.loading || this.saving;
    }
}

angular.module("managerApp").controller("IpLoadBalancerNameChangeCtrl", IpLoadBalancerNameChangeCtrl);