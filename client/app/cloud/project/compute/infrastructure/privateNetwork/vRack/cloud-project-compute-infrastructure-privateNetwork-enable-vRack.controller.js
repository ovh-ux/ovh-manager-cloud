class CloudProjectComputeInfrastructurePrivateNetworkEnablevRackCtrl {
    constructor($uibModalInstance, $stateParams, params, OvhApiCloudProjectNetworkPrivate,
                CloudProjectComputeInfrastructurePrivateNetworkService) {
        this.service = CloudProjectComputeInfrastructurePrivateNetworkService;
        this.serviceName = $stateParams.projectId;
        this.networkId = params;
        this.modal = $uibModalInstance;


        this.activateOptions = _.indexBy(["EXISTING", "NEW"]);
        this.selectedActivateOption = this.activateOptions.EXISTING;
        this.vRacks = ["vRack1", "vRack2", "vRack3"];
        this.selectedVrack = this.vRacks[0];
    }

    addExistingVrack () {

    }

    orderNewVrack () {

    }

    activate () {
        this.modal.close();
        //return this.deletePrivateNetwork();
    };

    cancel () {
        this.modal.dismiss();
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructurePrivateNetworkEnablevRackCtrl",
                                        CloudProjectComputeInfrastructurePrivateNetworkEnablevRackCtrl);
