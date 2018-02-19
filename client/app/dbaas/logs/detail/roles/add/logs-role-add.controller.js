class LogsRoleAddModalCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, LogsRolesService, options) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        // this.indexInfo = indexInfo;
        this.options = options;
        console.log(this.options);
        this.LogsRolesService = LogsRolesService;
        // this.LogsIndexService = LogsIndexService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
        // this.index = this.LogsIndexService.getNewIndex();
    }

    $onInit () {
        // this.isEdit = this.checkIsEdit(this.indexInfo);
        // if (this.isEdit) {
        //     this.populateIndex();
        // } else {
        //     this.clearIndex();
        // }
    }

    clearIndex () {
        this.role.description = "";
        this.role.name = "";
        this.role.optionId = null;
    }

    // populateIndex () {
    //     this.index.description = this.indexInfo.description;
    //     this.index.alertNotifyEnabled = this.indexInfo.alertNotifyEnabled;
    // }

    // checkIsEdit (indexInfo) {
    //     return indexInfo !== undefined;
    // }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    saveRole () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsRolesService.addRole(this.serviceName, this.role)
                    .then(response => this.$uibModalInstance.dismiss(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }

    // editIndex () {
    //     if (this.form.$invalid) {
    //         return this.$q.reject();
    //     }
    //     this.saving = this.ControllerHelper.request.getHashLoader({
    //         loaderFunction: () =>
    //             this.LogsIndexService.updateIndex(this.serviceName, this.indexInfo.indexId, this.index)
    //                 .then(response => this.$uibModalInstance.close(response))
    //                 .catch(response => this.$uibModalInstance.dismiss(response))
    //     });
    //     return this.saving.load();
    // }
}

angular.module("managerApp").controller("LogsRoleAddModalCtrl", LogsRoleAddModalCtrl);
