class LogsIndexAddModalCtrl {
    constructor ($stateParams, $uibModalInstance, ControllerHelper, indexInfo, LogsIndexService, options) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.indexInfo = indexInfo;
        this.LogsIndexService = LogsIndexService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
        this.options = options;
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
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.createIndex(this.serviceName, this.index)
                    .then(response => this.$uibModalInstance.dismiss(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        this.saving.load();
    }

    editIndex () {
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.updateIndex(this.serviceName, this.indexInfo.indexId, this.index)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        this.saving.load();
    }
}

angular.module("managerApp").controller("LogsIndexAddModalCtrl", LogsIndexAddModalCtrl);
