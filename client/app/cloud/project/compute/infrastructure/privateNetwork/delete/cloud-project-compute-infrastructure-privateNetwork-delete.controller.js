class CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl {
    constructor($uibModalInstance, $stateParams, params, CloudProjectNetworkPrivate,
                CloudProjectComputeInfrastructurePrivateNetworkService) {
        this.service = CloudProjectComputeInfrastructurePrivateNetworkService;
        this.serviceName = $stateParams.projectId;
        this.networkId = params;
        this.modal = $uibModalInstance;

        this.loaders = {
            deleting : false
        };
    }

    deletePrivateNetwork () {
        this.service.deleteProjectNetworkPrivate(this.serviceName, this.networkId);
    }

    confirm () {
        this.modal.close();
        this.deletePrivateNetwork();
    };

    cancel () {
        this.modal.dismiss();
    }
}

angular.module("managerApp").controller("CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl",
                                        CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl);
