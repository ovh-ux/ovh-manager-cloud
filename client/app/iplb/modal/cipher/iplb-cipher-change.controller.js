class IpLoadBalancerCipherChangeCtrl {
    constructor ($uibModalInstance, serviceName, ControllerHelper, IpLoadBalancerCipherService) {
        this.$uibModalInstance = $uibModalInstance;

        this.serviceName = serviceName;
        this.ControllerHelper = ControllerHelper;

        this.IpLoadBalancerCipherService = IpLoadBalancerCipherService;

        this.cipher = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerCipherService.getCipher(this.serviceName),
            successHandler: () => { this.model.cipherType.value = this.cipher.data.type; }
        });

        this.cipherTypes = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerCipherService.getCipherTypes(this.serviceName)
        });

        this.model = {
            cipherType: {
                value: ""
            }
        };
    }

    $onInit () {
        this.cipher.load();
        this.cipherTypes.load();
    }

    confirm () {
        this.saving = true;
        return this.IpLoadBalancerCipherService.updateCipher(this.serviceName, this.model.cipherType.value)
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
        return this.cipher.loading || this.cipherTypes.loading || this.saving;
    }
}

angular.module("managerApp").controller("IpLoadBalancerCipherChangeCtrl", IpLoadBalancerCipherChangeCtrl);
