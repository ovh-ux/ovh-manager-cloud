class LogsIndexAddModalCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, indexInfo, LogsIndexService) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        this.indexInfo = indexInfo;
        this.LogsIndexService = LogsIndexService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
        this.index = {
            description: "",
            alertNotifyEnabled: false
        };
    }

    $onInit () {
        this.isEdit = this.checkIsEdit(this.indexInfo);
    }

    checkIsEdit (indexInfo) {
        if (indexInfo) {
            this.index.description = indexInfo.description;
            this.index.alertNotifyEnabled = indexInfo.alertNotifyEnabled;
        }
        return indexInfo !== undefined;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    saveIndex () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.createIndex(this.serviceName, this.index)
                    .then(response => this.$uibModalInstance.dismiss(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }

    editIndex () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.updateIndex(this.serviceName, this.indexInfo.indexId, this.index)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsIndexAddModalCtrl", LogsIndexAddModalCtrl);
