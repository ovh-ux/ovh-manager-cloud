class CloudProjectOpenStackUserAddCtrl {
    constructor ($q, $translate, $uibModalInstance, ControllerHelper, CloudMessage, OpenstackUsersPassword, OvhApiCloud, serviceName) {
        this.$q = $q;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.OpenstackUsersPassword = OpenstackUsersPassword;
        this.OvhApiCloud = OvhApiCloud;
        this.serviceName = serviceName;

        this.model = {
            value: undefined
        };
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.OvhApiCloud.Project().User().v6().save({
                    serviceName: this.serviceName
                }, {
                    description: this.model.value
                }).$promise
                    .then(newUser => {
                        this.OpenstackUsersPassword.put(this.serviceName, newUser.id, newUser.password);
                        this.CloudMessage.success(this.$translate.instant("openstackusers_users_userlist_add_submit_success"));
                    })
                    .catch(err => this.CloudMessage.error([this.$translate.instant("openstackusers_users_userlist_add_submit_error"), err.data && err.data.message || ""].join(" ")))
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("CloudProjectOpenStackUserAddCtrl", CloudProjectOpenStackUserAddCtrl);
