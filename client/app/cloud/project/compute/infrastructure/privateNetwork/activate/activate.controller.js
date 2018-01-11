class ActivateCtrl {
    constructor($window, $uibModalInstance, $stateParams, params, OvhApiCloudProjectNetworkPrivate,
                CloudProjectComputeInfrastructurePrivateNetworkService) {
        this.service = CloudProjectComputeInfrastructurePrivateNetworkService;
        this.serviceName = $stateParams.projectId;
        this.orderUrl = params.orderUrl;
        this.modal = $uibModalInstance;
        this.$window = $window;

        //activate options ENUM
        this.activateOptions = _.indexBy(["EXISTING", "NEW"]);
        //selected activate option
        this.selectedActivateOption = this.activateOptions.EXISTING;
        //selected vRack
        this.selectedVrack = null;

        //get vRacks for current user, shown in left side bar
        this.vRacks = params.vRacks;
        if(this.vRacks && this.vRacks instanceof Array) {
            //make first vRack seected on UI drop downlist
            this.selectedVrack  = this.vRacks[0];
        }
    }
    /**
     *  add selected existing vRack to private network
     *
     * @memberof ActivateCtrl
     */
    addExistingVrack () {
        var selectedVrack = this.selectedVrack;
        this.modal.close();
        console.log('vracks', this.selectedVrack);
        console.log('this.selectedActivateOption', this.selectedActivateOption);
    }

    /**
     * open order new vRack url in new window
     *
     * @memberof ActivateCtrl
     */
    orderNewVrack () {
        this.modal.close();
        this.$window.open(this.orderUrl, '_blank');
    }

    /**
     * action handler method called on click of active button on UI
     *
     * @memberof ActivateCtrl
     */
    activate () {
        if(this.selectedActivateOption === this.activateOptions.EXISTING) {
            this.addExistingVrack();
        } else {
            this.orderNewVrack();
        }
    }
    /**
     * action handler method called on click of cancel button on UI
     *
     * @memberof ActivateCtrl
     */
    cancel () {
        //close modal
        this.modal.dismiss();
    }
}

angular.module("managerApp").controller("ActivateCtrl",
                                        ActivateCtrl);
