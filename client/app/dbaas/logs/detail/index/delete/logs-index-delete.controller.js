class LogsIndexDeleteCtrl {
    //inject service to delete
    constructor ($stateParams, $uibModalInstance, index) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        // this.IpLoadBalancerFrontendsService = IpLoadBalancerFrontendsService;

        this.index = index;
        this.name = index.name || index.indexId;
        this.indexId = index.indexId;
        // this.type = frontend.protocol;
    }

    confirm () {
        console.log("confirm delete");
        console.log(this.index);
        // this.saving = true;
        // return this.IpLoadBalancerFrontendsService.deleteFrontend(this.type, this.$stateParams.serviceName, this.frontendId)
        //     .then(response => this.$uibModalInstance.close(response))
        //     .catch(response => this.$uibModalInstance.dismiss(response))
        //     .finally(() => {
        //         this.saving = false;
        //     });
    }

    cancel () {
        console.log('trying to cancel');
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsIndexDeleteCtrl", LogsIndexDeleteCtrl);
