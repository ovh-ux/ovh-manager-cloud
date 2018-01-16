class AddVRackCtrl {
    constructor($window, $uibModalInstance, $stateParams, params, OvhApiVrack) {
        this.projectId = $stateParams.projectId;
        this.orderUrl = params.orderUrl;
        this.modal = $uibModalInstance;
        this.$window = $window;
        this.OvhApiVrack = OvhApiVrack;
        //get vRacks for current user, shown in left side bar
        this.vRacks = params.vRacks;
        this.loaders = {
            activate: false
        };
        //activate options ENUM
        this.activateOptions = _.indexBy(["EXISTING", "NEW"]);
        //selected activate option
        this.selectedActivateOption = this.activateOptions.EXISTING;
        //selected vRack
        this.selectedVrack = null;
        if(this.vRacks && _.isArray(this.vRacks) ) {
            //make first vRack seected on UI drop downlist
            this.selectedVrack  = this.vRacks[0];
        }
    }
    /**
     *  add selected existing vRack to private network
     *
     * @memberof AddVRackCtrl
     */
    addExistingVrack () {
        var self = this;
        var selectedVrack = this.selectedVrack;
        this.loaders.activate = true;
        //make call to API to add public cloud project to vRack
        return this.OvhApiVrack.CloudProject().Lexi().create({
            serviceName: this.selectedVrack.serviceName
        },{
            project: this.projectId
        }).$promise.then((vrack) => {
            self.modal.close({name: selectedVrack.displayName, serviceName: selectedVrack.serviceName});
        }, function (error) {
            self.modal.dismiss(error);
        }).finally(function () {
            this.loaders.activate = false;
        });
    }

    /**
     * open order new vRack url in new window
     *
     * @memberof AddVRackCtrl
     */
    orderNewVrack () {
        this.modal.close();
        this.$window.open(this.orderUrl, '_blank');
    }

    /**
     * action handler method called on click of active button on UI
     *
     * @memberof AddVRackCtrl
     */
    activate () {
        //this.modal.close();
        if(this.selectedActivateOption === this.activateOptions.EXISTING) {
            this.addExistingVrack();
        } else {
            this.orderNewVrack();
        }
    }
    /**
     * action handler method called on click of cancel button on UI
     *
     * @memberof AddVRackCtrl
     */
    cancel () {
        //close modal
        this.modal.close();
    }
}

angular.module("managerApp").controller("AddVRackCtrl",
                                        AddVRackCtrl);
