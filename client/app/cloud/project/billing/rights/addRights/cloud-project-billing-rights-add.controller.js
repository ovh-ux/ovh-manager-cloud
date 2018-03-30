class CloudProjectBillingRightsAddCtrl {
    constructor ($stateParams, $uibModalInstance, CloudMessage, model, OvhApiCloud) {
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.model = model;
        this.OvhApiCloud = OvhApiCloud;

        this.right = {
            type: "readOnly"
        };
    }

    validateAddRight () {
        this.loader = true;

        this.$uibModalInstance.close(
            this.OvhApiCloud.Project().Acl().v6().add({
                serviceName: this.$stateParams.projectId
            }, {
                accountId: CloudProjectBillingRightsAddCtrl.normalizedNic(this.right.contact),
                type: this.right.type
            }).$promise
        );
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    /**
     * Returns the NIC with "-ovh" appended if it was not the case.
     */
    static normalizedNic (name) {
        // check if the NIC is not an email (it could be the case for US users)
        if (/[@\.]+/.test(name)) {
            return name;
        }
        return _.endsWith(name, "-ovh") ? name : `${name}-ovh`;
    }
}

angular.module("managerApp").controller("CloudProjectBillingRightsAddCtrl", CloudProjectBillingRightsAddCtrl);
