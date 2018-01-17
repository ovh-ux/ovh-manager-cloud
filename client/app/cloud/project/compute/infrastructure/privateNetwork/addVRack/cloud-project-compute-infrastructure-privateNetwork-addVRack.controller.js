class AddVRackCtrl {
    constructor ($q, $window, $uibModalInstance, $stateParams, params, OvhApiVrack) {
        this.$q = $q;
        this.projectId = $stateParams.projectId;
        this.orderUrl = params.orderUrl;
        this.modal = $uibModalInstance;
        this.$window = $window;
        this.OvhApiVrack = OvhApiVrack;
        // get vRacks for current user, shown in left side bar
        this.vRacks = params.vRacks;
        this.loaders = {
            activate: false
        };
        // activate options ENUM
        this.activateOptions = _.indexBy(["EXISTING", "NEW"]);
        // selected activate option
        this.selectedActivateOption = this.activateOptions.EXISTING;
        // selected vRack
        this.selectedVrack = null;
    }

    /**
     * validates vRack selection field. Returns false if no value is selected.
     *
     * @param {any} value, selected index
     * @returns
     * @memberof AddVRackCtrl
     */
    validateSelection (value) {
        return value && value !== "0";
    }

    /**
     *  add selected existing vRack to private network
     *
     * @memberof AddVRackCtrl
     */
    addExistingVrack () {
        const self = this;
        const selectedVrack = this.selectedVrack;
        this.loaders.activate = true;
        // make call to API to add public cloud project to vRack
        return this.OvhApiVrack.CloudProject().Lexi().create({
            serviceName: this.selectedVrack.serviceName
        }, {
            project: this.projectId
        }).$promise.then(() => {
            self.modal.close({ name: selectedVrack.displayName, serviceName: selectedVrack.serviceName });
        }, () => {
            self.modal.dismiss();
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
        this.$window.open(this.orderUrl, "_blank");
    }

    /**
     * action handler method called on click of active button on UI
     *
     * @memberof AddVRackCtrl
     */
    activate () {
        if (this.selectedActivateOption === this.activateOptions.EXISTING) {
            if (this.form.$invalid) {
                return this.$q.reject();
            }
            return this.addExistingVrack();
        }
        return this.orderNewVrack();
    }
    /**
     * action handler method called on click of cancel button on UI
     *
     * @memberof AddVRackCtrl
     */
    cancel () {
        // close modal
        this.modal.close();
    }
}

angular.module("managerApp").controller("AddVRackCtrl",
                                        AddVRackCtrl);
