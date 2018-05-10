class CloudProjectOpenStackUserAddCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, OpenstackUsersPassword, OvhApiCloud, serviceName) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.OpenstackUsersPassword = OpenstackUsersPassword;
        this.OvhApiCloud = OvhApiCloud;
        this.serviceName = serviceName;

        this.model = {
            value: undefined
        }
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.saving = true;
        return this.OvhApiCloud.Project().User().v6().save({
            serviceName: this.serviceName,
            description: this.model.value
        }, {}).$promise
            .then(newUser => {
                this.OpenstackUsersPassword.put(this.serviceName, newUser.id, newUser.password);
                this.CloudMessage.success(this.$translate.instant("openstackusers_users_userlist_add_submit_success"));
            })
            .catch(err => this.CloudMessage.error([this.$translate.instant("openstackusers_users_userlist_add_submit_error"), err.data && err.data.message || ""].join(" ")))
            .finally(() => {
                self.saving = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("CloudProjectOpenStackUserAddCtrl", CloudProjectOpenStackUserAddCtrl);
